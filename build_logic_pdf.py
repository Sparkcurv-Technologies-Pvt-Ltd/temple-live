"""Generate a Business-Logic Concepts PDF for the Temple Management System.

Explains every calculation, formula and business rule we discussed &
fixed in this session, in plain language plus worked examples.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, PageBreak, Table,
    TableStyle, KeepTogether,
)


PRIMARY = HexColor("#8B0000")
ACCENT = HexColor("#B8860B")
GREEN = HexColor("#0F5132")
CODE_BG = HexColor("#f4f4f4")
BORDER = HexColor("#dddddd")


def make_styles():
    ss = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "T", parent=ss["Title"], fontName="Helvetica-Bold",
            fontSize=22, textColor=PRIMARY, alignment=TA_LEFT,
            spaceAfter=6, leading=26,
        ),
        "subtitle": ParagraphStyle(
            "ST", parent=ss["Heading2"], fontName="Helvetica",
            fontSize=12, textColor=HexColor("#555"), alignment=TA_LEFT,
            spaceAfter=14,
        ),
        "h1": ParagraphStyle(
            "H1", parent=ss["Heading1"], fontName="Helvetica-Bold",
            fontSize=18, textColor=PRIMARY, spaceBefore=8, spaceAfter=10,
            leading=22,
        ),
        "h2": ParagraphStyle(
            "H2", parent=ss["Heading2"], fontName="Helvetica-Bold",
            fontSize=14, textColor=HexColor("#333"), spaceBefore=10,
            spaceAfter=6, leading=18,
        ),
        "h3": ParagraphStyle(
            "H3", parent=ss["Heading3"], fontName="Helvetica-Bold",
            fontSize=12, textColor=ACCENT, spaceBefore=8, spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "B", parent=ss["BodyText"], fontName="Helvetica",
            fontSize=10.5, leading=15, spaceAfter=6,
        ),
        "note": ParagraphStyle(
            "N", parent=ss["BodyText"], fontName="Helvetica-Oblique",
            fontSize=10, leading=14, textColor=HexColor("#555"),
            leftIndent=10, rightIndent=10, spaceAfter=6,
            backColor=HexColor("#fff9e6"), borderColor=ACCENT,
            borderWidth=0.5, borderPadding=6,
        ),
        "formula": ParagraphStyle(
            "F", parent=ss["BodyText"], fontName="Helvetica-Bold",
            fontSize=11, leading=15, textColor=GREEN,
            leftIndent=10, rightIndent=10, spaceAfter=8,
            backColor=HexColor("#f0fdf4"), borderColor=GREEN,
            borderWidth=0.5, borderPadding=6,
        ),
        "code": ParagraphStyle(
            "C", parent=ss["Code"], fontName="Courier",
            fontSize=9, leading=12, backColor=CODE_BG,
            borderColor=BORDER, borderWidth=0.5, borderPadding=6,
            leftIndent=6, rightIndent=6, spaceBefore=4, spaceAfter=8,
        ),
    }


def h1(t, s): return Paragraph(t, s["h1"])
def h2(t, s): return Paragraph(t, s["h2"])
def h3(t, s): return Paragraph(t, s["h3"])
def p(t, s):  return Paragraph(t, s["body"])
def formula(t, s): return Paragraph(t, s["formula"])
def note(t, s): return Paragraph(f"<b>Note:</b> {t}", s["note"])
def code(t, s): return Preformatted(t, s["code"])


def kv_table(rows, s):
    """2-column key/value table for a data example."""
    t = Table(rows, colWidths=[7 * cm, 9 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 0), (0, -1), HexColor("#fff5f5")),
        ("TEXTCOLOR", (0, 0), (0, -1), PRIMARY),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def build(out_path):
    doc = SimpleDocTemplate(
        out_path, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=1.6 * cm, bottomMargin=1.6 * cm,
        title="Temple Management - Business Logic Guide",
        author="Emergent",
    )
    s = make_styles()
    story = []

    # ============  COVER  ============
    story.append(Paragraph("Temple Management System", s["title"]))
    story.append(Paragraph("Business Logic &amp; Calculation Guide", s["subtitle"]))
    story.append(p(
        "A single-source explanation of every calculation, business rule "
        "and workflow used by the application. Read this before doing any "
        "audit, migration, or hand-off to a new developer.",
        s,
    ))
    story.append(Spacer(1, 0.4 * cm))

    tbl = Table(
        [
            ["Section", "Topic"],
            ["1", "Penalty Engine (Subscription / Death / Festival / Marriage)"],
            ["2", "Chit Fund - Core Accounting Identity"],
            ["3", "Chit Fund - Share Amount vs Collected Share Amount"],
            ["4", "Chit Fund - Settlement Application Flow"],
            ["5", "Interest Module - EMI vs Regular Interest"],
            ["6", "Bugs Fixed in This Session"],
            ["7", "Data Model Cheat-Sheet"],
        ],
        colWidths=[2 * cm, 14 * cm],
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#fff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [HexColor("#fff"), HexColor("#fafafa")]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(tbl)
    story.append(PageBreak())

    # ==========================================================
    # SECTION 1 — PENALTY ENGINE
    # ==========================================================
    story.append(h1("1. Penalty Engine", s))
    story.append(p(
        "The penalty engine applies a <b>flat monthly late-fee</b> to every "
        "member whose payment is overdue. It is deterministic, idempotent "
        "(safe to re-run) and works uniformly across the four contribution "
        "modules where members can owe money.",
        s,
    ))

    story.append(h2("1.1 The rule", s))
    story.append(formula(
        "Penalty  =  &#8377; 25  &times;  (number of full calendar months "
        "elapsed since the due date, no grace period)",
        s,
    ))
    story.append(p(
        "&nbsp;&nbsp;&bull; Applies to <b>Subscription Tariff, Death Tariff "
        "and Marriage Tariff.</b><br/>"
        "&nbsp;&nbsp;&bull; <b>Festival</b> uses a different rule &mdash; see 1.1a below.",
        s,
    ))

    story.append(h3("1.1a Festival penalty - 10% compound per month", s))
    story.append(formula(
        "Penalty  =  base_amount  &times;  ( (1 + 0.10)<sup>missed_months</sup> - 1 )",
        s,
    ))
    story.append(p(
        "The 10% compounds on the previously outstanding balance (base + "
        "already accrued penalty). So for a &#8377; 300 festival:",
        s,
    ))
    tbl_data2 = [
        ["Missed months", "Cumulative penalty (&#8377;)"],
        ["1", "30.00"],
        ["2", "63.00"],
        ["3", "99.30"],
        ["6", "231.47"],
        ["12", "641.53"],
    ]
    t2 = Table(tbl_data2, colWidths=[4 * cm, 6 * cm])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#fff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [HexColor("#fff"), HexColor("#fafafa")]),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t2)
    story.append(Spacer(1, 0.2 * cm))

    story.append(h2("1.2 How &quot;missed months&quot; is counted", s))
    story.append(p(
        "We use the calendar-month difference between the due date and "
        "today. A month is only counted once the same day-of-month has "
        "passed. So:",
        s,
    ))
    tbl_data = [
        ["Due date", "Today", "Missed months", "Penalty"],
        ["2024-04-10", "2024-04-30", "0", "&#8377; 0"],
        ["2024-04-10", "2024-05-09", "0  (not yet a full month)", "&#8377; 0"],
        ["2024-04-10", "2024-05-10", "1  (exactly one month)", "&#8377; 25"],
        ["2024-04-10", "2024-05-11", "1", "&#8377; 25"],
        ["2024-04-10", "2024-07-15", "3", "&#8377; 75"],
        ["2024-12-10", "2025-03-10", "3  (spans year boundary)", "&#8377; 75"],
        ["2024-04-08", "2026-06-30", "26", "&#8377; 650"],
    ]
    t = Table(tbl_data, colWidths=[3 * cm, 3 * cm, 6 * cm, 3 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#fff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [HexColor("#fff"), HexColor("#fafafa")]),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.2 * cm))

    story.append(h2("1.3 Where the due date comes from", s))
    story.append(p(
        "Each row in <font face='Courier'>PeoplesAmountDetails</font> is "
        "linked to one of four items. The due date is pulled from the "
        "linked item:", s,
    ))
    story.append(kv_table([
        ["Subscription Tariff", "sub_tariff.to_date"],
        ["Festival contribution", "festival.penalty_start_date or festival.end_date"],
        ["Death tariff", "death.penalty_apply_date or death.date"],
        ["Marriage tariff", "marriage.marriage_date"],
    ], s))

    story.append(h2("1.4 Idempotency &mdash; why re-running is safe", s))
    story.append(p(
        "Every call to the engine <b>overwrites</b> penalty_amount with the "
        "freshly computed value; it never adds on top of the old value. "
        "The already-paid portion of the penalty is preserved separately "
        "in <font face='Courier'>penalty_balance</font>:",
        s,
    ))
    story.append(formula(
        "penalty_amount   =  &#8377; 25  &times;  missed_months<br/>"
        "penalty_balance  =  penalty_amount  &minus;  penalty_already_paid",
        s,
    ))
    story.append(p(
        "Running the engine 100 times a day gives exactly the same result "
        "as running it once. This is what makes the &quot;Recompute&quot; button "
        "on the Pending Penalty List page safe.",
        s,
    ))

    story.append(h2("1.5 API endpoints", s))
    story.append(kv_table([
        ["GET /api/penalty/pending/", "List of members with pending penalty"],
        ["POST /api/penalty/recompute/", "Force full recompute; returns summary"],
        ["GET /api/penalty/summary/", "Totals only (rate, scanned, updated, total)"],
    ], s))

    story.append(PageBreak())

    # ==========================================================
    # SECTION 2 — CHIT FUND CORE ACCOUNTING
    # ==========================================================
    story.append(h1("2. Chit Fund - Core Accounting Identity", s))
    story.append(p(
        "A chit fund is essentially a rotating investment pool. The system "
        "keeps four running totals on the <font face='Courier'>ChitFundsDetails</font> "
        "row, and they must always satisfy one identity:",
        s,
    ))
    story.append(formula(
        "Cash_In_Hand  =  Pool  +  Profit  +  Collected_Principal  &minus;  Principal_Given",
        s,
    ))
    story.append(p(
        "If this identity is ever violated, the books are out of sync and "
        "a fix must be applied before more transactions are booked.",
        s,
    ))

    story.append(h2("2.1 What each total means", s))
    story.append(kv_table([
        ["Pool", "Total money put in by all investors + management. Set once at chit creation. Formula: management_amt + outer_invest_amount."],
        ["Principal Given Amount", "Cumulative principal money loaned out to borrowers over the life of the chit."],
        ["Collected Principal Amount", "Cumulative principal repaid by borrowers so far."],
        ["Profit Amount", "Cumulative interest + penalty income collected from borrowers so far."],
        ["Cash In Hand Amount", "Money physically remaining in the chit's account today."],
    ], s))

    story.append(h2("2.2 Worked example - Chit Fund #1 (AMMAN FINANCE)", s))
    story.append(kv_table([
        ["Management Invested Amount", "&#8377; 10,000  (1 share)"],
        ["Outer Invest Amount", "&#8377; 14,00,000 (140 shares)"],
        ["Fixed Share Amount", "&#8377; 10,000"],
        ["Total Share Count", "141"],
        ["Pool", "&#8377; 14,10,000"],
        ["Principal Given Amount", "&#8377; 1,04,48,500"],
        ["Collected Principal Amount", "&#8377; 87,88,450"],
        ["Profit Amount", "&#8377; 9,76,050"],
        ["Cash In Hand Amount", "&#8377; 7,26,000"],
    ], s))
    story.append(p(
        "Let us verify the identity:", s,
    ))
    story.append(code(
        "Pool + Profit + Collected - Given\n"
        "= 14,10,000 + 9,76,050 + 87,88,450 - 1,04,48,500\n"
        "= 7,26,000   -->   matches Cash In Hand   OK",
        s,
    ))

    story.append(h2("2.3 What changes each total, and when", s))
    story.append(p(
        "&nbsp;&nbsp;&bull; <b>Loan given</b> (create interest with type = Chit Fund Interest):<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>cash_inhand -= principal_amt</font><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>principal_given += principal_amt</font><br/><br/>"
        "&nbsp;&nbsp;&bull; <b>Loan payment</b> (collection accept, non-installment):<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>collected_principal += amount</font><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>cash_inhand += amount + interst_amount + penalty_amount</font><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>profit_amount += interst_amount + penalty_amount</font><br/><br/>"
        "&nbsp;&nbsp;&bull; <b>Loan EMI payment</b> (Installment Interest):<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>new_principal = amount - interest_portion</font><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>collected_principal += new_principal</font><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>cash_inhand += amount + penalty</font>  <font color='#0F5132'><i>(after bugfix)</i></font><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<font face='Courier'>profit_amount += interest_portion + penalty</font><br/><br/>"
        "&nbsp;&nbsp;&bull; <b>Loan edit</b> (interest PUT):<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;Reverse OLD principal, then apply NEW principal "
        "<font color='#0F5132'><i>(after bugfix)</i></font>.",
        s,
    ))

    story.append(PageBreak())

    # ==========================================================
    # SECTION 3 — SHARE AMOUNT vs COLLECTED SHARE AMOUNT
    # ==========================================================
    story.append(h1("3. Chit Fund - Share Amount vs Collected Share Amount", s))
    story.append(p(
        "Every investor has two fields that look similar but mean very "
        "different things. Confusing them was the root cause of the "
        "&quot;Share Amount is always 0&quot; issue you reported.",
        s,
    ))

    story.append(h2("3.1 Field definitions", s))
    story.append(kv_table([
        ["collected_share_amount",
         "The LIVE running total of the investor's share of profit. Updated on EVERY collection payment. Starts at 0 when the investor joins and grows over the life of the chit."],
        ["share_amount",
         "The FINAL settled share (only set at settlement time). Stays 0 while the chit is active."],
        ["final_settlement_amount",
         "The total pay-out to the investor at settlement = investment_amt + share_amount. Set only when a settlement application is submitted."],
    ], s))

    story.append(h2("3.2 How collected_share_amount grows", s))
    story.append(p(
        "On every borrower payment the interest and penalty portion is "
        "distributed among all investors proportional to their share count. "
        "Management takes its cut first, the rest is split.",
        s,
    ))
    story.append(formula(
        "temple_amt   =  profit_amt  &times;  set_profit_percent / 100<br/>"
        "remaining    =  profit_amt  &minus;  temple_amt<br/>"
        "per_share    =  remaining  /  total_share_count<br/>"
        "For every investor:  collected_share_amount  +=  share_count  &times;  per_share",
        s,
    ))

    story.append(h2("3.3 Worked example - Investor N. SUNDAR (Chit #1)", s))
    story.append(kv_table([
        ["investment_amt", "&#8377; 5,00,000"],
        ["share_count", "50"],
        ["collected_share_amount", "&#8377; 3,13,960.00  (accumulated over many months)"],
        ["share_amount", "0.00  (chit not yet settled)"],
        ["final_settlement_amount", "0.00  (no settlement application yet)"],
    ], s))
    story.append(note(
        "The old UI displayed <font face='Courier'>share_amount</font> in the Chit Fund "
        "View which is always 0 for active chits. That is why every member "
        "showed 0. Now the UI displays "
        "<font face='Courier'>collected_share_amount</font>, which is the true LIVE "
        "value each investor has earned so far.",
        s,
    ))

    story.append(PageBreak())

    # ==========================================================
    # SECTION 4 — SETTLEMENT APPLICATION FLOW
    # ==========================================================
    story.append(h1("4. Chit Fund - Settlement Application Flow", s))
    story.append(p(
        "A settlement application is a formal record that an investor is "
        "ready to receive their pay-out. The flow has three stages, each "
        "leaving a different visible mark in the system.",
        s,
    ))

    story.append(h2("4.1 Stage A - Before submission (default)", s))
    story.append(p(
        "The Chit Fund View shows the investor's live numbers but the "
        "Final Settlement Amount row is <b>hidden</b> because the value "
        "is 0. This is by design: nothing to settle yet.",
        s,
    ))

    story.append(h2("4.2 Stage B - Filling the Settlement Application form", s))
    story.append(p(
        "In <font face='Courier'>/chitfund_settlement_application</font> the user picks a "
        "chit fund, then picks the investor. Four read-only fields "
        "auto-populate:",
        s,
    ))
    story.append(kv_table([
        ["Invested Amount", "investment_amt from the investor"],
        ["Share Count", "share_count from the investor"],
        ["Share Amount", "collected_share_amount from the investor"],
        ["Total Amount", "Invested + Share Amount  (what will be paid out)"],
    ], s))

    story.append(h2("4.3 Stage C - On submission", s))
    story.append(p(
        "The <font face='Courier'>add_chit_fund_settlement_application_details</font> "
        "endpoint runs the following on the linked investor row:",
        s,
    ))
    story.append(code(
        "invester.share_amount            = collected_share_amount   # freeze the value\n"
        "invester.application_date        = settlement_date\n"
        "invester.action                  = False                     # locked, cannot be edited\n"
        "invester.final_settlement_amount = investment_amt + share_amount\n\n"
        "# The investor's shares leave the profit-sharing pool:\n"
        "chit_fund.investers_share_count -= invester.share_count\n"
        "chit_fund.total_share_count     -= invester.share_count\n"
        "chit_fund.outer_invest_amount   -= invester.investment_amt",
        s,
    ))
    story.append(note(
        "After settlement, ALL future profit distribution loops filter by "
        "<font face='Courier'>action=True</font> so the settled investor "
        "no longer receives share of new interest/penalty collections.  "
        "The per-share value grows for the remaining shareholders because "
        "the divisor <font face='Courier'>total_share_count</font> is now "
        "smaller.",
        s,
    ))
    story.append(p(
        "After this, the Chit Fund View instantly shows a new row for "
        "that member:",
        s,
    ))
    story.append(formula(
        "Final Settlement Amount  :  &#8377; XXX,XXX.XX  (bold green)",
        s,
    ))

    story.append(h2("4.4 What each stage looks like for N. SUNDAR", s))
    story.append(kv_table([
        ["Before submission",  "Final Settlement Amount row  -  hidden"],
        ["After submission",   "Final Settlement Amount  :  &#8377; 8,13,960.00"],
        ["Formula",            "5,00,000 (invested)  +  3,13,960 (share)  =  8,13,960"],
    ], s))

    story.append(PageBreak())

    # ==========================================================
    # SECTION 5 — INTEREST MODULE EMI vs REGULAR
    # ==========================================================
    story.append(h1("5. Interest Module - EMI vs Regular Interest", s))
    story.append(p(
        "The interest module supports two loan styles. Understanding the "
        "difference is critical because the money-flow formulas differ.",
        s,
    ))

    story.append(h2("5.1 Regular interest (interest-only)", s))
    story.append(p(
        "Borrower pays interest each period; principal is returned in "
        "one lump sum later. Each period payment is split explicitly:",
        s,
    ))
    story.append(formula(
        "temp_family.amount           =  principal part (usually 0 mid-loan)<br/>"
        "temp_family.interst_amount   =  interest for the period<br/>"
        "temp_family.penalty_amount   =  late fee if any",
        s,
    ))

    story.append(h2("5.2 EMI / Installment interest", s))
    story.append(p(
        "Borrower pays a fixed EMI each month; principal and interest "
        "are baked into a single number:",
        s,
    ))
    story.append(formula(
        "temp_family.amount           =  full EMI (principal + interest)<br/>"
        "new_pro_amount               =  interest portion (computed by rate &amp; period)<br/>"
        "new_principal_amt            =  amount &minus; new_pro_amount   (principal portion)",
        s,
    ))
    story.append(note(
        "The old code added <font face='Courier'>interst_amount</font> to cash_inhand "
        "for EMI payments <b>on top of</b> the already-inclusive EMI, "
        "double-counting the interest. This has been fixed.",
        s,
    ))

    story.append(h2("5.3 Chit-fund penalty-in-arrears rule", s))
    story.append(p(
        "The chit-fund interest module also charges a penalty when a "
        "borrower is late. It applies once a full calendar month has "
        "passed since the last interest_date. In the original code this "
        "was gated by:",
        s,
    ))
    story.append(code(
        "# Old, buggy:\n"
        "if interest_date.year == today.year and interest_date.month != today.month:\n"
        "    apply_penalty()",
        s,
    ))
    story.append(p(
        "That silently skipped every loan that had been created in a "
        "previous calendar year. Fixed to a year-agnostic condition:",
        s,
    ))
    story.append(code(
        "# New, correct:\n"
        "if interest_date + relativedelta(months=1) <= today:\n"
        "    apply_penalty()",
        s,
    ))

    story.append(PageBreak())

    # ==========================================================
    # SECTION 6 — BUGS FIXED
    # ==========================================================
    story.append(h1("6. Bugs Fixed in This Session", s))

    fixes = [
        ("Interest year condition",
         "interest/views.py line 178",
         "Penalty skipped whenever the loan was created in a previous year.",
         "Replaced year+month check with a year-agnostic  interest_date + 1 month <= today  check."),
        ("EMI cash-in-hand double-count",
         "collection/views.py line 624-632",
         "For Installment Interest, cash_inhand was incremented by both amount (full EMI) AND interst_amount, double-counting the interest.",
         "Now adds only  amount + penalty_amount .  Profit correctly gets  new_pro_amount + penalty ."),
        ("Chit-fund loan edit not re-applied",
         "interest/views.py line 413-419",
         "When editing an existing chit-fund loan the OLD principal was reversed but the NEW principal was never re-applied, leaving cash_inhand and principal_given out of sync.",
         "Now: reverse old, then apply new principal in one atomic block."),
        ("Share Amount showing 0 for all members",
         "ChitFundListView.jsx display",
         "UI read  share_amount  which is only set at settlement; every active-chit member showed 0.",
         "UI now reads  collected_share_amount ?? share_amount ?? 0 ."),
        ("Final Settlement Amount showing 0 for everyone",
         "ChitFundListView.jsx display",
         "Field always displayed even when no settlement application was submitted, causing confusion.",
         "Row is now hidden when final_settlement_amount == 0; appears only after settlement submission."),
        ("Sidebar overlap on all pages",
         "layout/Partials/Style.js and DashboardLayout.jsx",
         "SideMenuLayout was position: fixed but the right <Layout> had no margin-left offset, so header text and home image rendered under the sidebar.",
         "Added ContentLayout with margin-left: 280px (80 collapsed, 0 on mobile) and z-index on sidebar."),
        ("Member List images broken",
         "temple_proj/settings/settings.py and urls.py",
         "MEDIA_URL was /media/ but K8s ingress only routes /api/* to backend, so image URLs 404-ed. DEBUG=False also disabled Django static() serving.",
         "Changed MEDIA_URL to /api/media/ and added an explicit re_path(r'^api/media/...', serve, ...) route. Added onError fallback on Member List images."),
        ("Penalty engine did not exist",
         "amount/penalty_engine.py (new file)",
         "Each module set a static one-time penalty; no accumulation per missed month; PendingPenaltyList screen was hardcoded mock data.",
         "New idempotent engine + REST endpoints + real UI. Applies &#8377; 25 x missed_months across all four contribution modules."),
        ("Settlement Application form missing figures",
         "ChitFundSettlementAppln.jsx",
         "The form didn't show Invested / Share Count / Share Amount / Total Amount when picking an investor.",
         "Added 4 auto-populating read-only fields; Total Amount = Invested + collected_share_amount."),
        ("Settlement Application list missing figures",
         "chit_fund/serializers.py and list view",
         "List showed only application no + investor name.",
         "Added derived Serializer Method Fields (share_count, share_amount, investment_amt, total_amount) pulled from the linked investor; added three new columns to the list &amp; print tables."),
        ("Duplicate penalty rows on Balance Sheet ledger",
         "my_tasks/views.py penalty scheduled task",
         "For every re-run of the task, a new TempleMemberReport row was inserted for the same (member, tariff/festival/death). Also amount_balance and total_bal_amt on PeoplesAmountDetails were incremented by penalty_amount every run, inflating the running balance.",
         "Added two idempotency guards: (a) only add penalty to running balances if penalty flag is not already True; (b) skip TempleMemberReport insert if a row with the same (member, tariff/festival/death, type_choice) already exists. Also added /app/backend/cleanup_penalty_duplicates.py to remove existing duplicates and recompute balance_amt column."),
        ("Festival penalty was flat &#8377; 25/month instead of 10% compound",
         "amount/penalty_engine.py",
         "All four modules were using the same flat &#8377; 25 / missed month rule. Festival should be 10% compounding per month on the base contribution.",
         "Added FESTIVAL_PENALTY_PCT=0.10 and a helper _penalty_for() that dispatches by module. Festival rows now use base * ((1.10)^months - 1); other modules stay on the &#8377; 25 flat rate."),
        ("Chit Fund total_share_count did not shrink on investor settlement",
         "chit_fund/views.py add_chit_fund_settlement_application_details",
         "When one investor settled out of a chit, their shares stayed counted in total_share_count and investers_share_count. Future profit distribution kept dividing by the OLD total, so settled and remaining investors both got smaller-than-correct share.",
         "On settlement submission the chit fund now reduces total_share_count, investers_share_count and outer_invest_amount by that investor's amounts. Verified: 141 -> 121 after a 20-share investor settled."),
        ("Settled investors kept receiving profit share",
         "collection/views.py profit distribution loops (line 652, 849)",
         "invester_list = ChitFundInvesters.objects.filter(chitt_fund=...) - included settled investors too.",
         "Now filters action=True so settled investors no longer accumulate collected_share_amount on new collections."),
        ("Already-paid members showing in Choose Member dropdown",
         "collection/views.py get_select_member_collection (line 2330) and Collection.jsx line 389",
         "TWO bugs combining: (a) the front-end was sending `type: ''` (empty) for Subscription Tariff, so the backend had no specific tariff id to filter by. (b) The backend query filtered by penalty=False (a completely different flag from paid) AND only matched sub_tariff__action=True instead of the specific tariff selected. Result: members who paid Jul-2026 but had an open Aug-2026 balance appeared in the Choose Member dropdown for Jul-2026, and clicking them fired 'Collection Amount already added for this member'.",
         "(a) Front-end now sends type = subsCategory[0]?.id (the active tariff id). (b) Backend now uses paid=False AND filters by sub_tariff_id=type when a specific tariff id is provided, so the dropdown lists only members who haven't yet paid THAT tariff."),
    ]

    for i, (title, where, was, now) in enumerate(fixes, start=1):
        story.append(KeepTogether([
            h3(f"{i}. {title}", s),
            p(f"<b>Where:</b> <font face='Courier'>{where}</font>", s),
            p(f"<b>Before:</b> {was}", s),
            p(f"<b>After:</b> {now}", s),
            Spacer(1, 0.15 * cm),
        ]))

    story.append(PageBreak())

    # ==========================================================
    # SECTION 7 — DATA MODEL CHEAT SHEET
    # ==========================================================
    story.append(h1("7. Data Model Cheat-Sheet", s))
    story.append(p(
        "The main tables and their key money-fields. Keep this next to "
        "you when reading any calculation code.",
        s,
    ))

    story.append(h3("PeoplesAmountDetails (amount)", s))
    story.append(kv_table([
        ["amount",           "Base amount owed for a contribution period"],
        ["total_paid_amt",   "How much of the base has been paid"],
        ["total_bal_amt",    "Outstanding base amount = amount - total_paid_amt"],
        ["penalty",          "Boolean flag: any pending penalty?"],
        ["penalty_amount",   "Total penalty computed by the engine"],
        ["penalty_balance",  "Unpaid portion of penalty_amount"],
        ["paid",             "True once base + penalty is fully cleared"],
    ], s))

    story.append(h3("ChitFundsDetails (chit_fund)", s))
    story.append(kv_table([
        ["management_amt",              "Cash the temple/management itself puts in"],
        ["outer_invest_amount",         "Cash all investors put in"],
        ["fixed_share_amt",             "Money value of one share"],
        ["management_share_count",      "How many shares management holds"],
        ["investors_share_count",       "Sum of shares held by all outside investors"],
        ["total_share_count",           "management + investors"],
        ["set_profit_percent",          "% of profit that goes to management"],
        ["principal_given_amount",      "Total loans given out to date"],
        ["collected_principal_amount",  "Total principal repaid to date"],
        ["profit_amount",               "Total interest + penalty collected to date"],
        ["cash_inhand_amount",          "Money currently in the chit's bank"],
    ], s))

    story.append(h3("ChitFundInvesters (chit_fund)", s))
    story.append(kv_table([
        ["invester_name",             "Human-readable investor name"],
        ["investment_amt",            "Principal put in by this investor"],
        ["share_count",               "How many shares this investor holds"],
        ["collected_share_amount",    "LIVE profit share earned so far (grows)"],
        ["share_amount",              "FROZEN share on settlement (0 until then)"],
        ["application_date",          "Date the settlement application was submitted"],
        ["final_settlement_amount",   "investment + share_amount (set at settlement)"],
        ["action",                    "Editable? False after settlement application is submitted"],
    ], s))

    story.append(h3("ChitFundsettleAplication (chit_fund)", s))
    story.append(kv_table([
        ["settlement_aplication_no",  "Auto-generated: CHIT-APP<n>"],
        ["chitt_fund",                "FK to ChitFundsDetails"],
        ["investers",                 "FK to ChitFundInvesters"],
        ["settlement_date",           "Date entered by staff on the form"],
        ["comments",                  "Optional free-text notes"],
    ], s))

    story.append(Spacer(1, 0.4 * cm))
    story.append(p(
        "<i>End of guide. This document reflects the code state as of the "
        "current session. Keep the PDF alongside the codebase; regenerate "
        "whenever a core formula changes.</i>",
        s,
    ))

    doc.build(story)
    print(f"OK: wrote {out_path}")


if __name__ == "__main__":
    import sys
    build(sys.argv[1] if len(sys.argv) > 1 else "/app/Temple_Logic_Guide.pdf")
