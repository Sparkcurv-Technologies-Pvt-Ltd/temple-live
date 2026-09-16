"""
Direct-PDF endpoints for the WhatsApp share flow.

The operator shares a link like:
    https://<host>/api/collection/public/member_statement.pdf/<token>/?receipt_no=...

When the customer taps the link on their phone, the browser opens/downloads
the PDF directly — no admin portal, no login, no HTML render, no JS.

Uses reportlab (already installed in the pod) for zero-dependency PDF
generation. Layout:
    1. Temple / statement header
    2. Payment Receipt block  (from ?receipt_* query params)
    3. Borrower / Member details + statement period
    4. Totals + Pending / Outstanding summary
    5. 1-year Balance Sheet table
"""

from datetime import timedelta
from io import BytesIO

from django.http import FileResponse, HttpResponseNotFound, HttpResponse
from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

# Lazy reportlab import — some deployments (older EC2 images) may not yet
# have reportlab installed. Loading it inside the view functions instead of
# at module import time means the Django backend can still boot cleanly;
# the two PDF endpoints will surface a 501 with an install hint until the
# operator runs `pip install reportlab`.
try:
    from reportlab.lib import colors  # noqa: F401
    from reportlab.lib.pagesizes import A4  # noqa: F401
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # noqa: F401
    from reportlab.lib.units import mm  # noqa: F401
    from reportlab.platypus import (  # noqa: F401
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
    )
    _REPORTLAB_AVAILABLE = True
    _REPORTLAB_IMPORT_ERROR = None
except Exception as _e:  # ImportError, or transitive missing lib
    _REPORTLAB_AVAILABLE = False
    _REPORTLAB_IMPORT_ERROR = str(_e)


def _reportlab_missing_response():
    return HttpResponse(
        (
            "PDF generation requires the `reportlab` python package. Install "
            "it on this server with:\n\n    pip install reportlab\n\n"
            f"(import error: {_REPORTLAB_IMPORT_ERROR})"
        ),
        status=501,
        content_type="text/plain; charset=utf-8",
    )


from family.models import Member_Details
from collection.models import CollectionDetails
from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet
from reports.models import TempleMemberReport
from reports.models import InterestPeopleReport

# Reuse the HMAC helpers + pending-dues logic from public_views so tokens
# stay compatible with the HTML public statement.
from collection.public_views import (
    _unsign_member_id,
    _unsign_interest_id,
    _serialize_pending,
)


TEMPLE_GREEN = colors.HexColor("#0F5132")
BORDER_GREY = colors.HexColor("#e2e8f0")
MUTED_GREY = colors.HexColor("#64748b")


def _rupee(n) -> str:
    return f"Rs. {float(n or 0):,.2f}"


def _receipt_from_query(request):
    """Extract the payment-receipt fields the operator embedded in the URL."""
    q = request.GET
    return {
        "no": (q.get("receipt_no") or "").strip(),
        "amt": (q.get("receipt_amt") or "").strip(),
        "date": (q.get("receipt_date") or "").strip(),
        "purpose": (q.get("receipt_purpose") or "").strip(),
        "mode": (q.get("receipt_mode") or "").strip(),
    }


def _has_receipt(r):
    return bool(r.get("no") or r.get("amt"))


def _styled_doc(title):
    """Create a reportlab doc + a fresh set of paragraph styles."""
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        title=title,
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="TitleG",
        parent=styles["Title"],
        fontSize=18,
        textColor=TEMPLE_GREEN,
        alignment=0,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="H2",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=TEMPLE_GREEN,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="Muted",
        parent=styles["Normal"],
        fontSize=9,
        textColor=MUTED_GREY,
    ))
    return doc, buf, styles


def _receipt_flowables(styles, r):
    """Render the Payment Receipt card as reportlab flowables."""
    if not _has_receipt(r):
        return []
    data = [["Payment Receipt", ""]]
    if r["no"]:
        data.append(["Receipt No", r["no"]])
    if r["date"]:
        data.append(["Date", r["date"]])
    if r["purpose"]:
        data.append(["Purpose", r["purpose"]])
    if r["mode"]:
        data.append(["Payment Mode", r["mode"]])
    if r["amt"]:
        data.append(["Amount Paid", _rupee(r["amt"])])
    t = Table(data, colWidths=[55 * mm, None])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEMPLE_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("SPAN", (0, 0), (-1, 0)),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica"),
        ("FONTNAME", (1, 1), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GREY),
        ("INNERGRID", (0, 1), (-1, -1), 0.25, BORDER_GREY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return [t, Spacer(1, 8 * mm)]


def _table_style_header():
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GREY),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, BORDER_GREY),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
    ])


# ---------------------------------------------------------------------------
# MEMBER PDF
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def public_member_statement_pdf(request, token: str):
    if not _REPORTLAB_AVAILABLE:
        return _reportlab_missing_response()
    member_id = _unsign_member_id(token)
    if member_id is None:
        return HttpResponseNotFound("invalid or expired link")
    try:
        member = Member_Details.objects.get(pk=member_id, action=True)
    except Member_Details.DoesNotExist:
        return HttpResponseNotFound("member not found")

    since = timezone.now().date() - timedelta(days=365)

    # QA Bug — the operator asked that every WhatsApp share be scoped to the
    # SPECIFIC category of the payment (Sub Tariff / Festival / Death /
    # Marriage). Category scoping affects the *Payment Receipt* block and
    # the highlighted *Pending Balance ({category})* chip only. The
    # Balance Sheet ledger itself stays UNFILTERED so its closing balance
    # matches the portal's `Total Pending Balance` value shown on the
    # Member List / Member Profile screen. The frontend passes the
    # CollectionRecord.collection_category as `?category=`.
    category = (request.GET.get("category") or "").strip()
    CATEGORY_MAP = {
        "Subscription Tariff": ["subscription Tariff", "subscription Tariff Penalty"],
        "subscription Tariff": ["subscription Tariff", "subscription Tariff Penalty"],
        "Festival": ["Festival", "Festival Penalty"],
        "Death": ["Death Tariff", "Death Tariff Penalty"],
        "Death Tariff": ["Death Tariff", "Death Tariff Penalty"],
        "Marriage": ["Marriage Amount"],
        "Marriage Amount": ["Marriage Amount"],
    }
    type_choices = CATEGORY_MAP.get(category)

    # Full unfiltered ledger — closing balance == portal's Total Pending Balance
    reports = (
        TempleMemberReport.objects
        .filter(members=member, reportdate__gte=since)
        .select_related("sub_tariff", "festivals", "marriage", "death_tariff", "collection")
        .order_by("reportdate", "created_at", "id")
    )

    # Carry-forward opening balance — pick up the running balance from the
    # LAST report row that predates the 1-year window. Previously we
    # seeded `prev_balance = 0` which made the first Pre-Balance column
    # falsely read 0.00 even when the member had years of history behind
    # them. Owner rule (Aug 2026): the STATEMENT MUST NEVER SHOW A
    # NEGATIVE BALANCE — historical overpayments are hidden from the
    # printable report (they only make sense internally). We therefore
    # clamp any negative carry-over to 0.
    prev_report_before_window = (
        TempleMemberReport.objects
        .filter(members=member, reportdate__lt=since)
        .order_by("reportdate", "created_at", "id")
        .last()
    )
    raw_opening_balance = (
        float(prev_report_before_window.balance_amt or 0)
        if prev_report_before_window else 0.0
    )
    opening_balance = max(raw_opening_balance, 0.0)

    bs_rows = []
    total_credit = 0.0
    total_debit = 0.0
    prev_balance = opening_balance
    for idx, r in enumerate(reports, start=1):
        credit = float(r.credit_amt or 0)
        debit = float(r.debit_amt or 0)
        balance = float(r.balance_amt or 0)
        # Compute "particulars" — the report's type_choice enum, e.g.
        # "Sub Tariff" / "Death" / "Festival" / "Marriage" / "Joining"
        particulars = r.type_choice or "-"
        # "Name" — human-readable sub-identifier for the bill (matches
        # frontend `name_type` field, e.g. "Jun-2026" or "Ganesh Chaturthi").
        name = None
        if r.death_tariff_id and r.death_tariff:
            name = r.death_tariff.member_name
        elif r.festivals_id and r.festivals:
            name = r.festivals.festival_name
        elif r.marriage_id and r.marriage:
            name = r.marriage.marriage_no
        elif r.sub_tariff_id and r.sub_tariff:
            if r.sub_tariff.from_date:
                name = r.sub_tariff.from_date.strftime("%b-%Y")
            else:
                name = r.sub_tariff.subscription_no or "-"
        bs_rows.append({
            "sl": idx,
            "date": r.reportdate.isoformat() if r.reportdate else "-",
            "particulars": particulars,
            "name": name or "-",
            # Owner rule (Aug 2026): never expose a negative running
            # balance on the printable statement. Historical overpayments
            # are hidden from the display; internal ledger math is
            # unaffected.
            "pre_balance": max(prev_balance, 0.0),
            "credit": credit,
            "debit": debit,
            "balance": max(balance, 0.0),
        })
        total_credit += credit
        total_debit += debit
        prev_balance = balance

    # ---- Total Pending Balance sourced EXACTLY like the portal ----
    # `family/views.py` computes `temple_mem_pending_amt =
    # TempleMemberReport.objects.filter(members=member).last().balance_amt`.
    # We replicate that here so the PDF's "Total Pending Balance" always
    # equals the value shown on Family Details → Member List → single-member
    # data. This decouples the pending total from the 1-year window used by
    # the ledger.
    last_report = (
        TempleMemberReport.objects
        .filter(members=member)
        .order_by("reportdate", "created_at", "id")
        .last()
    )
    total_pending_portal = float(last_report.balance_amt or 0) if last_report else 0.0
    # Owner rule (Aug 2026): never surface a negative pending balance on
    # the printable statement — overpayments are hidden from members.
    total_pending_portal = max(total_pending_portal, 0.0)

    # Category-scoped pending (for the highlighted chip beneath the receipt)
    full_pending = _serialize_pending(member) or {}
    if type_choices:
        CATEGORY_TO_PENDING_KEYS = {
            "Subscription Tariff": ["Subscription Tariff", "subscription Tariff"],
            "subscription Tariff": ["Subscription Tariff", "subscription Tariff"],
            "Festival": ["Festival"],
            "Death": ["Death", "Death Tariff"],
            "Death Tariff": ["Death", "Death Tariff"],
            "Marriage": ["Marriage", "Marriage Amount"],
            "Marriage Amount": ["Marriage", "Marriage Amount"],
        }
        wanted = set(CATEGORY_TO_PENDING_KEYS.get(category, [category]))
        category_pending_bucket = {k: v for k, v in full_pending.items() if k != "Total" and k in wanted}
        category_pending_total = round(
            sum(v for v in category_pending_bucket.values() if isinstance(v, (int, float))), 2
        )
    else:
        category_pending_bucket = {k: v for k, v in full_pending.items() if k != "Total"}
        category_pending_total = total_pending_portal

    full_name = " ".join(x for x in [member.member_name, getattr(member, "last_name", "")] if x)
    category_label = category if type_choices else ""
    title_prefix = f"{category_label}_" if category_label else ""
    title = f"{title_prefix}Statement_{member.member_no or member.id}_{timezone.now().date().isoformat()}.pdf".replace(" ", "_")
    doc, buf, styles = _styled_doc(title)
    story = []

    header_line = "Temple Statement"
    if category_label:
        header_line = f"{category_label} Statement"
    story.append(Paragraph(header_line, styles["TitleG"]))
    period_line = f"1-Year Balance Sheet · {since.strftime('%d-%b-%Y')} to {timezone.now().date().strftime('%d-%b-%Y')}"
    if category_label:
        period_line = f"{category_label} · {period_line}"
    story.append(Paragraph(period_line, styles["Muted"]))
    story.append(Spacer(1, 6 * mm))

    story.extend(_receipt_flowables(styles, _receipt_from_query(request)))

    # Prominent "Pending Balance for {Category}" chip right under the
    # receipt so the recipient sees the outstanding amount at a glance.
    if category_pending_total > 0:
        label = f"Pending Balance ({category_label})" if category_label else "Pending Balance"
        pb_data = [[label, _rupee(category_pending_total)]]
        pb_tbl = Table(pb_data, colWidths=[100 * mm, None])
        pb_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#fef3c7")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#92400e")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#f59e0b")),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(pb_tbl)
        story.append(Spacer(1, 6 * mm))

    # Member card
    m_data = [
        ["Member details", ""],
        ["Name", full_name or "-"],
        ["Member No", member.member_no or "-"],
        ["Mobile", getattr(member, "member_mobile_number", "") or "-"],
    ]
    m_tbl = Table(m_data, colWidths=[55 * mm, None])
    m_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEMPLE_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("SPAN", (0, 0), (-1, 0)),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica"),
        ("FONTNAME", (1, 1), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GREY),
        ("INNERGRID", (0, 1), (-1, -1), 0.25, BORDER_GREY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(m_tbl)
    story.append(Spacer(1, 6 * mm))

    # Pending Balance card — Total matches the portal's `temple_mem_pending_amt`
    # value (Family Details → Member List → single member data). Category
    # breakdown rows come from _serialize_pending().
    if category_pending_bucket or total_pending_portal > 0:
        p_data = [["Pending Balance", ""]]
        # Show every non-zero category bucket so the recipient sees the
        # full breakdown when they open the PDF.
        breakdown = category_pending_bucket if type_choices else full_pending
        for k, v in breakdown.items():
            if k == "Total":
                continue
            if float(v or 0) != 0:
                p_data.append([k, _rupee(v)])
        p_data.append(["Total Pending Balance", _rupee(total_pending_portal)])
        p_tbl = Table(p_data, colWidths=[80 * mm, None])
        p_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TEMPLE_GREEN),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("SPAN", (0, 0), (-1, 0)),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("FONTNAME", (0, 1), (0, -2), "Helvetica"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#fef3c7")),
            ("FONTSIZE", (0, 1), (-1, -1), 10),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GREY),
            ("INNERGRID", (0, 1), (-1, -1), 0.25, BORDER_GREY),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(p_tbl)
        story.append(Spacer(1, 6 * mm))

    # Balance sheet ledger — mirrors Family Details → Member List → Balance Sheet
    story.append(Paragraph("1-Year Balance Sheet", styles["H2"]))
    if not bs_rows:
        story.append(Paragraph("No entries in the last 12 months.", styles["Muted"]))
    else:
        headers = ["Sl", "Date", "Particulars", "Name", "Pre Balance", "Credit", "Debit", "Balance"]
        data = [headers]
        # If the member carries an opening balance from BEFORE this
        # 1-year window, surface it as row 0 so operators see where the
        # first-visible-row's balance came from (avoids the "why is
        # balance −₹2,425 after a ₹100 credit?" confusion).
        if abs(opening_balance) > 0.005:
            data.append([
                "0",
                since.strftime("%Y-%m-%d"),
                "Opening Balance",
                "brought forward",
                f"{0.0:,.2f}",
                f"{0.0:,.2f}",
                f"{0.0:,.2f}",
                f"{opening_balance:,.2f}",
            ])
        for r in bs_rows:
            data.append([
                str(r["sl"]),
                str(r["date"]),
                str(r["particulars"])[:22],
                str(r["name"])[:20],
                f"{r['pre_balance']:,.2f}",
                f"{r['credit']:,.2f}",
                f"{r['debit']:,.2f}",
                f"{r['balance']:,.2f}",
            ])
        # Totals row: Total Credit · Total Debit · Closing Balance
        # The closing balance MUST equal the portal's Total Pending Balance
        # (Family Details → Member List → single member) — sourced from the
        # latest TempleMemberReport row's balance_amt.
        data.append([
            "", "", "", "Total",
            "",
            f"{total_credit:,.2f}",
            f"{total_debit:,.2f}",
            f"{total_pending_portal:,.2f}",
        ])
        tbl = Table(
            data,
            colWidths=[8 * mm, 22 * mm, 34 * mm, 30 * mm, 22 * mm, 22 * mm, 20 * mm, 22 * mm],
        )
        style = _table_style_header()
        for col in (4, 5, 6, 7):
            style.add("ALIGN", (col, 0), (col, -1), "RIGHT")
        style.add("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#f1f5f9"))
        style.add("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold")
        tbl.setStyle(style)
        story.append(tbl)

    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(f"Generated on {timezone.now().strftime('%d-%b-%Y %H:%M')}", styles["Muted"]))

    doc.build(story)
    buf.seek(0)
    resp = FileResponse(buf, content_type="application/pdf")
    resp["Content-Disposition"] = f'inline; filename="{title}"'
    return resp


# ---------------------------------------------------------------------------
# INTEREST-LOAN PDF
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def public_interest_statement_pdf(request, token: str):
    if not _REPORTLAB_AVAILABLE:
        return _reportlab_missing_response()
    interest_id = _unsign_interest_id(token)
    if interest_id is None:
        return HttpResponseNotFound("invalid or expired link")
    try:
        interest = PeopleInterestDetails.objects.get(pk=interest_id, action=True)
    except PeopleInterestDetails.DoesNotExist:
        return HttpResponseNotFound("interest not found")

    since = timezone.now().date() - timedelta(days=365)

    bal = PeopleInterestBalanceSheet.objects.filter(interest=interest).first()

    # ------------------------------------------------------------------
    # FIX: "1-Year Balance Sheet" now pulls its exact structure and data
    # straight from InterestPeopleReport — the same authoritative ledger
    # table used everywhere else in the app (e.g. interest_profile).
    # Previously this table was reconstructed from CollectionDetails
    # (individual payments only), which meant interest accruals, penalty
    # charges, and discounts recorded directly on the ledger (not tied to
    # a payment row) never appeared here — and the running total shown
    # didn't match the actual balance_amt column on each ledger entry.
    #
    # Columns now mirror InterestPeopleReport's own fields directly:
    #   reportdate -> Date
    #   type_choice -> Type   (Initial / Interest / Penalty /
    #                           Principal Payment / Interest Payment /
    #                           Principal Interest Payment / Discount / Payment)
    #   credit_amt -> Credit
    #   debit_amt  -> Debit
    #   balance_amt -> Balance  (the ledger's own running balance, not a
    #                            value recomputed in this view)
    # ------------------------------------------------------------------
    ledger_reports = (
        InterestPeopleReport.objects
        .filter(interest=interest, reportdate__gte=since)
        .order_by("reportdate", "created_at", "id")
    )

    # Carry-forward opening balance — same pattern as the member
    # statement: pick up the running balance from the LAST ledger row
    # that predates the 1-year window, so the first visible row's
    # balance doesn't look like it came from nowhere.
    prev_ledger_before_window = (
        InterestPeopleReport.objects
        .filter(interest=interest, reportdate__lt=since)
        .order_by("reportdate", "created_at", "id")
        .last()
    )
    opening_balance = (
        float(prev_ledger_before_window.balance_amt or 0)
        if prev_ledger_before_window else 0.0
    )

    ledger_rows = []
    tot_credit = 0.0
    tot_debit = 0.0
    for r in ledger_reports:
        credit = float(r.credit_amt or 0)
        debit = float(r.debit_amt or 0)
        ledger_rows.append({
            "date": r.reportdate.isoformat() if r.reportdate else "-",
            "type": r.type_choice or "-",
            "credit": credit,
            "debit": debit,
            "balance": float(r.balance_amt or 0),
        })
        tot_credit += credit
        tot_debit += debit

    # Closing balance for the totals row: the LAST ledger row's own
    # balance_amt (not recomputed) — falls back to the balance-sheet's
    # current balance_amt if there are no ledger rows in the window.
    if ledger_rows:
        closing_balance = ledger_rows[-1]["balance"]
    else:
        closing_balance = float(bal.balance_amt or 0) if bal else 0.0

    title = f"Loan_Statement_{interest.id}_{timezone.now().date().isoformat()}.pdf"
    doc, buf, styles = _styled_doc(title)
    story = []
    story.append(Paragraph("Loan Statement", styles["TitleG"]))
    story.append(Paragraph(
        f"{interest.interest_type or 'Interest'} · {since.strftime('%d-%b-%Y')} to {timezone.now().date().strftime('%d-%b-%Y')}",
        styles["Muted"],
    ))
    story.append(Spacer(1, 6 * mm))

    story.extend(_receipt_flowables(styles, _receipt_from_query(request)))

    # Borrower details
    b_data = [
        ["Borrower details", ""],
        ["Name", interest.people_name or "-"],
        ["Mobile", interest.people_mobile or "-"],
        ["Interest type", interest.interest_type or "-"],
    ]
    if interest.chit_name:
        b_data.append(["Chit / Management fund", interest.chit_name])
    b_tbl = Table(b_data, colWidths=[55 * mm, None])
    b_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEMPLE_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("SPAN", (0, 0), (-1, 0)),
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica"),
        ("FONTNAME", (1, 1), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GREY),
        ("INNERGRID", (0, 1), (-1, -1), 0.25, BORDER_GREY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(b_tbl)
    story.append(Spacer(1, 6 * mm))

    # Outstanding card
    # FIX: "Principal issued" previously showed only bal.principal_amt.
    # Relabeled and changed to Principal + Interest (principal_amt +
    # intrest_amt) per owner request — this reflects the borrower's full
    # original obligation (principal borrowed + total interest billed on
    # the loan), not just the principal component.
    if bal:
        total_issued = float(bal.principal_amt or 0) + float(bal.intrest_amt or 0)
        outs = [
            ["Outstanding balance", ""],
            ["Total Issued (Principal + Interest)", _rupee(total_issued)],
            ["Principal paid", _rupee(bal.principal_paid)],
            ["Principal balance", _rupee(bal.principal_balance)],
            ["Penalty balance", _rupee(bal.penalty_balance_amt)],
            ["Total outstanding", _rupee(float(bal.balance_amt or 0) + float(bal.penalty_balance_amt or 0))],
        ]
        o_tbl = Table(outs, colWidths=[80 * mm, None])
        o_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TEMPLE_GREEN),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("SPAN", (0, 0), (-1, 0)),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#fef3c7")),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 1), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f8fafc")]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GREY),
            ("INNERGRID", (0, 1), (-1, -1), 0.25, BORDER_GREY),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(o_tbl)
        story.append(Spacer(1, 6 * mm))

    # 1-year balance sheet — now the exact structure/data from
    # InterestPeopleReport (see FIX comment above).
    story.append(Paragraph("1-Year Balance Sheet", styles["H2"]))
    if not ledger_rows and abs(opening_balance) <= 0.005:
        story.append(Paragraph("No entries in the last 12 months.", styles["Muted"]))
    else:
        headers = ["Date", "Type", "Credit", "Debit", "Balance"]
        data = [headers]
        # Opening-balance row, same pattern as the member statement, so
        # the first visible row's balance doesn't look like it came from
        # nowhere when the loan has history before this 1-year window.
        if abs(opening_balance) > 0.005:
            data.append([
                since.strftime("%Y-%m-%d"),
                "Opening Balance",
                f"{0.0:,.2f}",
                f"{0.0:,.2f}",
                f"{opening_balance:,.2f}",
            ])
        for r in ledger_rows:
            data.append([
                r["date"],
                str(r["type"])[:28],
                f"{r['credit']:,.2f}",
                f"{r['debit']:,.2f}",
                f"{r['balance']:,.2f}",
            ])
        data.append([
            "", "Total",
            f"{tot_credit:,.2f}",
            f"{tot_debit:,.2f}",
            f"{closing_balance:,.2f}",
        ])
        tbl = Table(data, colWidths=[26 * mm, 55 * mm, 30 * mm, 30 * mm, 32 * mm])
        style = _table_style_header()
        for col in (2, 3, 4):
            style.add("ALIGN", (col, 0), (col, -1), "RIGHT")
        style.add("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#f1f5f9"))
        style.add("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold")
        tbl.setStyle(style)
        story.append(tbl)

    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(f"Generated on {timezone.now().strftime('%d-%b-%Y %H:%M')}", styles["Muted"]))

    doc.build(story)
    buf.seek(0)
    resp = FileResponse(buf, content_type="application/pdf")
    resp["Content-Disposition"] = f'inline; filename="{title}"'
    return resp