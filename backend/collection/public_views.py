"""
Public (unauthenticated) member statement endpoint.

Used by the WhatsApp share flow: after each Collection print, the operator
opens `https://wa.me/<phone>?text=...&link=<url>` where the link points to
this endpoint. The URL contains a HMAC-signed token so only the intended
member's data can be retrieved – tampering with the token invalidates it.
"""

import base64
import hashlib
import hmac
import json
from datetime import timedelta

from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from family.models import Member_Details
from collection.models import CollectionDetails
from amount.models import PeoplesAmountDetails
from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet

# ---------------------------------------------------------------------------
# HMAC token helpers (stateless, no DB migration required)
# ---------------------------------------------------------------------------
_TOKEN_SEPARATOR = "."
_STATEMENT_SALT = "temple.member_statement.v1"


def _sign_member_id(member_id: int) -> str:
    """Return an opaque URL-safe token that encodes and signs member_id."""
    payload = json.dumps({"m": int(member_id)}, separators=(",", ":")).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload).rstrip(b"=").decode("ascii")
    key = (settings.SECRET_KEY + _STATEMENT_SALT).encode("utf-8")
    digest = hmac.new(key, payload_b64.encode("ascii"), hashlib.sha256).digest()
    sig = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return f"{payload_b64}{_TOKEN_SEPARATOR}{sig}"


def _unsign_member_id(token: str):
    """Return member_id if the token is valid, else None."""
    try:
        payload_b64, sig = token.split(_TOKEN_SEPARATOR)
    except ValueError:
        return None
    key = (settings.SECRET_KEY + _STATEMENT_SALT).encode("utf-8")
    expected = base64.urlsafe_b64encode(
        hmac.new(key, payload_b64.encode("ascii"), hashlib.sha256).digest()
    ).rstrip(b"=").decode("ascii")
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        data = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
        return int(data.get("m"))
    except (ValueError, TypeError, json.JSONDecodeError):
        return None


@api_view(["GET"])
@permission_classes([AllowAny])
def get_member_statement_token(request, member_id: int):
    """Return a HMAC token + the member's saved mobile number.

    Frontend uses `mobile` to fall back when the Collection record itself
    doesn't carry a phone number (older records / anonymous collections).
    """
    try:
        member = Member_Details.objects.get(pk=member_id)
    except Member_Details.DoesNotExist:
        return Response({"detail": "member not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        "token": _sign_member_id(member_id),
        "mobile": member.member_mobile_number,
        "name": member.member_name,
    })


# ---------------------------------------------------------------------------
# Public statement endpoint
# ---------------------------------------------------------------------------
def _serialize_pending(member):
    """Aggregate pending dues per category.

    Combines:
    - `PeoplesAmountDetails` (unpaid Festival / Subscription Tariff / Marriage / Death rows)
    - `PeopleInterestBalanceSheet` (unpaid Management Interest & Chit fund Interest rows
      belonging to this member as the borrower — `interest.people_member`)
    """
    per_category = {}

    unpaid = PeoplesAmountDetails.objects.filter(member=member, paid=False)
    for row in unpaid:
        key = row.name or "Other"
        per_category[key] = round(
            per_category.get(key, 0.0) + float(row.total_bal_amt or row.amount_balance or 0), 2
        )

    # Interest dues for loans taken by this member. Both interest types
    # (Management Interest and Chit fund Interest) are surfaced separately
    # so the member sees each ledger they participate in.
    interest_rows = PeopleInterestBalanceSheet.objects.filter(
        interest__people_member=member,
        interest__action=True,
        paid=False,
    ).select_related("interest")
    for row in interest_rows:
        label = "Chit Interest" if (row.interest and row.interest.interest_type == "Chit fund Interest") else "Management Interest"
        balance = float(row.balance_amt or 0) + float(row.penalty_balance_amt or 0)
        if balance <= 0:
            continue
        per_category[label] = round(per_category.get(label, 0.0) + balance, 2)

    per_category["Total"] = round(sum(v for k, v in per_category.items() if k != "Total"), 2)
    return per_category


def _resolve_bill_meta(row):
    """Return (date, source_name) for a PeoplesAmountDetails ledger row.

    Uses the linked source object (festival / sub_tariff / marriage / death)
    to find a display date and a specific "Name" (e.g. "Apr-2024" for a
    subscription tariff month, "Ganesh Chaturthi" for a festival, or the
    deceased person's name for a death tariff).
    """
    src_date = None
    src_name = None
    if row.sub_tariff:
        st = row.sub_tariff
        src_date = st.from_date or st.date
        # e.g. "Apr-2024" from from_date; fall back to subscription_no.
        if st.from_date:
            src_name = st.from_date.strftime("%b-%Y")
        else:
            src_name = st.subscription_no or None
    elif row.festival:
        f = row.festival
        src_date = f.date or f.start_date
        src_name = f.festival_name
    elif row.marriage:
        m = row.marriage
        src_date = getattr(m, "marriage_date", None) or getattr(m, "date", None)
        src_name = (
            getattr(m, "groom_name", None)
            or getattr(m, "bride_name", None)
            or getattr(m, "marriage_no", None)
        )
    elif row.death:
        d = row.death
        src_date = d.death_date or d.date
        src_name = d.member_name or d.death_no
    return src_date, src_name


def _build_ledger(member, since):
    """Build the accounting-style ledger rows for the member for the
    1-year statement window (`since` → today).

    One row per PeoplesAmountDetails entry in that window (bill raised) —
    matches the Sl No / Date / Particulars / Name / Credit / Debit / Balance
    / Penalty layout the operator uses on their existing statement print.
    """
    bills = (
        PeoplesAmountDetails.objects
        .filter(member=member)
        .select_related("sub_tariff", "festival", "marriage", "death")
        .order_by("created_at", "id")
    )
    ledger = []
    total_credit = 0.0
    total_debit = 0.0
    total_balance = 0.0
    sl = 0
    for row in bills:
        src_date, src_name = _resolve_bill_meta(row)
        date_ref = src_date or (row.created_at.date() if row.created_at else None)
        # Strict 1-year window so the ledger period matches the header on
        # the public page ("Statement period: <since> to <today>").
        if date_ref and date_ref < since:
            continue
        credit = float(row.amount or 0)
        debit = float(row.total_paid_amt or 0)
        outstanding = float(row.total_bal_amt or 0)
        penalty_flag = bool(row.penalty) or float(row.penalty_amount or 0) > 0
        sl += 1
        total_credit += credit
        total_debit += debit
        total_balance += outstanding
        ledger.append({
            "sl_no": sl,
            "date": date_ref.isoformat() if date_ref else None,
            "particulars": row.name or "Other",
            "name": src_name or "-",
            "credit": round(credit, 2),
            "debit": round(debit, 2),
            "balance": round(outstanding, 2),
            "penalty": "Yes" if penalty_flag else "No",
        })
    return ledger, {
        "credit": round(total_credit, 2),
        "debit": round(total_debit, 2),
        "balance": round(total_balance, 2),
        "count": len(ledger),
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def public_member_statement(request, token: str):
    """
    Public one-year statement for a single member. Anyone with the token
    can view but nothing else – tampering with the token yields 404.
    """
    member_id = _unsign_member_id(token)
    if member_id is None:
        return Response({"detail": "invalid or expired link"}, status=status.HTTP_404_NOT_FOUND)

    try:
        member = Member_Details.objects.get(pk=member_id, action=True)
    except Member_Details.DoesNotExist:
        return Response({"detail": "member not found"}, status=status.HTTP_404_NOT_FOUND)

    since = timezone.now().date() - timedelta(days=365)
    # Include:
    #  (a) collections where the member is DIRECTLY the payer (`member=member`)
    #  (b) collections for Management Interest / Chit Interest where the
    #      linked interest record's borrower is this member
    #      (`interest.people_member=member`). These rows historically leave
    #      `member` NULL, so we must OR them in explicitly.
    collections = (
        CollectionDetails.objects
        .filter(pay_date__gte=since, action=True)
        .filter(Q(member=member) | Q(interest__people_member=member))
        .distinct()
        .order_by("-pay_date", "-id")
    )

    running = 0.0
    total_penalty = 0.0
    total_interest = 0.0
    rows = []
    for c in reversed(list(collections)):  # oldest → newest for running total
        # For Management Interest / Chit Interest the operator often stores
        # only the principal in `amount`; interest & penalty portions are in
        # separate columns. The customer statement must reflect the TOTAL
        # paid on that day.
        principal = float(c.amount or 0)
        interest_amt = float(c.interst_amount or 0)
        penalty_amt = float(c.penalty_amount or 0)
        is_interest_row = c.collection_category in ("Management Interest", "Chit Interest")
        total_paid = principal + interest_amt + penalty_amt if is_interest_row else principal + penalty_amt
        running += total_paid
        total_penalty += penalty_amt
        total_interest += interest_amt
        rows.append({
            "id": c.id,
            "date": c.pay_date.isoformat() if c.pay_date else None,
            "category": c.collection_category,
            "amount": round(total_paid, 2),
            "principal_amount": principal,
            "interest_amount": interest_amt,
            "penalty_amount": penalty_amt,
            "payment_mode": c.payment_mode,
            "collection_no": c.collaction_no,
            "running_total": round(running, 2),
        })
    # reverse back so most-recent-first for display (running_total kept as-is)
    rows.reverse()

    ledger, ledger_totals = _build_ledger(member, since)

    return Response({
        "member": {
            "id": member.id,
            "name": member.member_name,
            "last_name": member.last_name,
            "mobile": member.member_mobile_number,
            "member_no": member.member_no,
        },
        "period": {"from": since.isoformat(), "to": timezone.now().date().isoformat()},
        "ledger": ledger,
        "ledger_totals": ledger_totals,
        "collections": rows,
        "totals": {
            "count": len(rows),
            "amount": round(running, 2),
            "penalty": round(total_penalty, 2),
            "interest": round(total_interest, 2),
        },
        "pending_dues": _serialize_pending(member),
    })


# ---------------------------------------------------------------------------
# Interest-loan statement (for Chit-Fund-Interest / Management-Interest
# borrowers who are NOT Members, i.e. people_type = "Other").
# ---------------------------------------------------------------------------
_INTEREST_STATEMENT_SALT = "temple.interest_statement.v1"


def _sign_interest_id(interest_id: int) -> str:
    payload = json.dumps({"i": int(interest_id)}, separators=(",", ":")).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload).rstrip(b"=").decode("ascii")
    key = (settings.SECRET_KEY + _INTEREST_STATEMENT_SALT).encode("utf-8")
    digest = hmac.new(key, payload_b64.encode("ascii"), hashlib.sha256).digest()
    sig = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return f"{payload_b64}{_TOKEN_SEPARATOR}{sig}"


def _unsign_interest_id(token: str):
    try:
        payload_b64, sig = token.split(_TOKEN_SEPARATOR)
    except ValueError:
        return None
    key = (settings.SECRET_KEY + _INTEREST_STATEMENT_SALT).encode("utf-8")
    expected = base64.urlsafe_b64encode(
        hmac.new(key, payload_b64.encode("ascii"), hashlib.sha256).digest()
    ).rstrip(b"=").decode("ascii")
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        data = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
        return int(data.get("i"))
    except (ValueError, TypeError, json.JSONDecodeError):
        return None


@api_view(["GET"])
@permission_classes([AllowAny])
def get_interest_statement_token(request, interest_id: int):
    """Issue a signed token for a Chit-Fund-Interest / Management-Interest loan.

    The token grants read-only access to the loan's 1-year statement page.
    """
    try:
        interest = PeopleInterestDetails.objects.get(pk=interest_id)
    except PeopleInterestDetails.DoesNotExist:
        return Response({"detail": "interest not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        "token": _sign_interest_id(interest_id),
        "mobile": interest.people_mobile,
        "name": interest.people_name,
        "interest_type": interest.interest_type,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def public_interest_statement(request, token: str):
    """Public 1-year statement for a single interest loan.

    Lists every collection on this interest (Management or Chit Fund) in the
    last 12 months, plus the current outstanding balance.
    """
    interest_id = _unsign_interest_id(token)
    if interest_id is None:
        return Response({"detail": "invalid or expired link"}, status=status.HTTP_404_NOT_FOUND)

    try:
        interest = PeopleInterestDetails.objects.get(pk=interest_id, action=True)
    except PeopleInterestDetails.DoesNotExist:
        return Response({"detail": "interest not found"}, status=status.HTTP_404_NOT_FOUND)

    since = timezone.now().date() - timedelta(days=365)
    collections = (
        CollectionDetails.objects
        .filter(interest=interest, pay_date__gte=since, action=True)
        .order_by("-pay_date", "-id")
    )

    running = 0.0
    total_penalty = 0.0
    total_interest = 0.0
    total_principal = 0.0
    rows = []
    for c in reversed(list(collections)):
        principal = float(c.amount or 0)
        interest_amt = float(c.interst_amount or 0)
        penalty_amt = float(c.penalty_amount or 0)
        total_paid = principal + interest_amt + penalty_amt
        running += total_paid
        total_penalty += penalty_amt
        total_interest += interest_amt
        total_principal += principal
        rows.append({
            "id": c.id,
            "date": c.pay_date.isoformat() if c.pay_date else None,
            "category": c.collection_category,
            "amount": round(total_paid, 2),
            "principal_amount": principal,
            "interest_amount": interest_amt,
            "penalty_amount": penalty_amt,
            "payment_mode": c.payment_mode,
            "collection_no": c.collaction_no,
            "running_total": round(running, 2),
        })
    rows.reverse()

    # Current outstanding on this interest (from the balance sheet row).
    bal = PeopleInterestBalanceSheet.objects.filter(interest=interest).first()
    outstanding = None
    if bal:
        outstanding = {
            "principal_amt": float(bal.principal_amt or 0),
            "principal_paid": float(bal.principal_paid or 0),
            "principal_balance": float(bal.principal_balance or 0),
            "penalty_balance_amt": float(bal.penalty_balance_amt or 0),
            "balance_amt": float(bal.balance_amt or 0),
            "paid": bool(bal.paid),
        }

    return Response({
        "borrower": {
            "id": interest.id,
            "name": interest.people_name,
            "mobile": interest.people_mobile,
            "address": interest.people_address,
            "interest_type": interest.interest_type,
            "interest_category": interest.interest_category,
            "chit_name": interest.chit_name,
            "interest_date": interest.interest_date.isoformat() if interest.interest_date else None,
        },
        "period": {"from": since.isoformat(), "to": timezone.now().date().isoformat()},
        "collections": rows,
        "totals": {
            "count": len(rows),
            "amount": round(running, 2),
            "principal": round(total_principal, 2),
            "interest": round(total_interest, 2),
            "penalty": round(total_penalty, 2),
        },
        "outstanding": outstanding,
    })
