"""
Pending-borrowers breakdown for the Chit Fund view.

The chit fund's "Pending Amount to Collect" is the aggregate of all
Chit-Fund-Interest loans that were given out from the pool and are not yet
repaid. It is NOT the investors' contribution.

This endpoint returns the per-borrower breakdown backing that total so
the UI can expand it into an actionable list.
"""

from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from token_app.views import token_checking
from management.models import ManagementDetails
from chit_fund.models import ChitFundsDetails
from balancesheet.models import PeopleInterestBalanceSheet


def _days_between(a, b):
    if not a or not b:
        return None
    try:
        return (b - a).days
    except Exception:
        return None


def _weeks_between(a, b):
    """Full weeks between two dates (integer, floor). Returns None if
    either date is missing. Post-due-date week counter — used on the
    Pending sheet per TC_CHITFUND_005 so operators see how many *weeks*
    a borrower is behind rather than raw days."""
    d = _days_between(a, b)
    if d is None or d < 0:
        return None
    return d // 7


@api_view(["GET"])
def chit_fund_pending_borrowers(request, chit_id: int):
    """Return active Chit-Fund-Interest borrowers with outstanding principal.

    Response shape (used by ChitFundListView.jsx):
    {
      "chit_id": <int>,
      "total_pending_principal": <float>,
      "total_pending_balance": <float>,     # principal + penalty
      "count": <int>,
      "borrowers": [
        {
          "id": <int>,                       # PeopleInterestBalanceSheet id
          "interest_id": <int>,
          "name": <str>, "mobile": <str>,
          "interest_type": <str>,
          "start_date": <YYYY-MM-DD | null>, # interest_apply_date
          "end_date": <YYYY-MM-DD | null>,   # apply_date + period (if set)
          "days_from_start": <int | null>,
          "days_from_last_payment": <int | null>,
          "principal_amt": <float>,
          "principal_paid": <float>,
          "principal_balance": <float>,
          "penalty_balance_amt": <float>,
          "balance_amt": <float>,
        }, ...
      ]
    }
    """
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    management = ManagementDetails.objects.first()
    if not management:
        return Response({"message": "First Add Management Profile details"}, status=status.HTTP_406_NOT_ACCEPTABLE)

    try:
        chit = ChitFundsDetails.objects.get(pk=chit_id, management_profile=management)
    except ChitFundsDetails.DoesNotExist:
        return Response({"detail": "chit fund not found"}, status=status.HTTP_404_NOT_FOUND)

    # ---------------------------------------------------------------
    # Owner rule (Feb 2026): "the penalty should apply and update in
    # the expected column correctly after the due date — no penalty
    # should be missed."
    #
    # We backfill missing penalty rows *live* every time this endpoint
    # is hit, so the operator never has to remember to run the
    # `apply_overdue_interest_and_penalty` cron. Runs are idempotent
    # (see `InterestPeopleReport.exists()` guard in the accrual job).
    # Scoped to this chit fund only — cheap enough (< a few hundred
    # rows) and keeps the accrual close to the view that consumes it.
    # ---------------------------------------------------------------
    try:
        from interest.overdue_views import _apply_for_record
        from interest.models import PeopleInterestDetails as _PID
        _active_records = _PID.objects.filter(
            chitt_fund=chit,
            interest_type="Chit fund Interest",
            action=True,
        )
        for _rec in _active_records:
            try:
                _apply_for_record(_rec)
            except Exception:
                # One bad row should never take down the page — swallow
                # per-record errors and keep going.
                pass
    except Exception:
        pass

    rows = (
        PeopleInterestBalanceSheet.objects
        .filter(
            interest__chitt_fund=chit,
            interest__interest_type="Chit fund Interest",
            interest__action=True,
            paid=False,
        )
        .exclude(principal_balance=0, balance_amt=0, penalty_balance_amt=0)
        .select_related("interest")
        .order_by("-updated_at", "-id")
    )

    today = date.today()
    borrowers = []
    # Grand-total accumulators for Cols 7-15 (owner rule, Feb 2026).
    tot_principal = 0.0
    tot_principal_paid = 0.0
    tot_principal_balance = 0.0
    tot_interest = 0.0
    tot_interest_paid = 0.0
    tot_interest_balance = 0.0
    tot_penalty = 0.0
    tot_penalty_balance = 0.0
    tot_total_balance = 0.0

    for b in rows:
        interest = b.interest
        # ------------------------------------------------------------------
        # Owner-locked column map (Feb 2026 — v3):
        # Every column is now sourced STRICTLY from
        #   balancesheet_peopleinterestbalancesheet  (join .interest_id = interest.id)
        # except Col 1 (Borrower name) which stays on interest master.
        #
        #  Col 1  Borrower           <- interest.people_name
        #  Col 2  (Interest type)    <- REMOVED
        #  Col 3  Start              <- balancesheet.interest_apply_date
        #  Col 7  Principal          <- balancesheet.principal_amt
        #  Col 8  Paid principal     <- balancesheet.principal_paid
        #  Col 9  Principal Balance  <- balancesheet.principal_balance
        #  Col 10 Interest           <- balancesheet.intrest_amt
        #  Col 11 Interest paid      <- balancesheet.intrest_paid_amt
        #  Col 12 Interest Balance   <- balancesheet.intrest_balance_amt
        #  Col 13 Penalty            <- balancesheet.penalty_amt
        #  Col 14 Penalty bal        <- balancesheet.penalty_balance_amt
        #  Col 15 Total Balance      <- principal_balance + intrest_balance_amt
        #                              + penalty_balance_amt  (per row)
        #
        # Row filter: hide borrowers with total_balance = 0 (owner rule).
        # ------------------------------------------------------------------

        start = b.interest_apply_date
        last_payment = b.updated_at.date() if b.updated_at else None

        # Pull every column straight from the balance sheet row.
        row_principal          = float(b.principal_amt or 0)
        row_principal_paid     = float(b.principal_paid or 0)
        row_principal_balance  = float(b.principal_balance or 0)
        row_interest           = float(b.intrest_amt or 0)
        row_interest_paid      = float(b.intrest_paid_amt or 0)
        row_interest_balance   = float(b.intrest_balance_amt or 0)
        row_penalty            = float(b.penalty_amt or 0)
        row_penalty_balance    = float(b.penalty_balance_amt or 0)
        # Col-15 Total Balance = principal_balance + intrest_balance + penalty_balance
        row_total_balance = (
            row_principal_balance + row_interest_balance + row_penalty_balance
        )

        # Owner rule: hide fully-settled borrowers.
        if round(row_total_balance, 2) == 0.0:
            continue

        # Accumulate grand totals for the footer.
        tot_principal          += row_principal
        tot_principal_paid     += row_principal_paid
        tot_principal_balance  += row_principal_balance
        tot_interest           += row_interest
        tot_interest_paid      += row_interest_paid
        tot_interest_balance   += row_interest_balance
        tot_penalty            += row_penalty
        tot_penalty_balance    += row_penalty_balance
        tot_total_balance      += row_total_balance

        borrowers.append({
            "id": b.id,
            "interest_id": interest.id if interest else None,
            "name": interest.people_name if interest else None,
            "mobile": interest.people_mobile if interest else None,
            # Kept for backward compat (frontend may hide the column).
            "interest_type": interest.interest_type if interest else None,
            "start_date": start.isoformat() if start else None,
            "days_from_start": _days_between(start, today),
            "days_from_last_payment": _days_between(last_payment, today),
            "weeks_from_start": _weeks_between(start, today),
            "weeks_from_last_payment": _weeks_between(last_payment, today),
            # Col-7 Principal
            "principal_amt": round(row_principal, 2),
            # Col-8 Paid principal
            "principal_paid": round(row_principal_paid, 2),
            # Col-9 Principal Balance
            "principal_balance": round(row_principal_balance, 2),
            # Col-10 Interest
            "interest_amt": round(row_interest, 2),
            # Col-11 Interest paid
            "interest_paid": round(row_interest_paid, 2),
            # Col-12 Interest Balance
            "interest_balance": round(row_interest_balance, 2),
            # Col-13 Penalty
            "penalty_amt": round(row_penalty, 2),
            # Col-14 Penalty bal
            "penalty_balance_amt": round(row_penalty_balance, 2),
            # Col-15 Total Balance (per row)
            "total_balance": round(row_total_balance, 2),
            # Legacy alias so ChitFundListView.jsx's Pending header still works.
            "balance_amt": round(row_total_balance, 2),
        })

    return Response({
        "chit_id": chit.id,
        "chit_name": chit.chit_name,
        "principal_given_amount": float(chit.principal_given_amount or 0),
        "collected_principal_amount": float(chit.collected_principal_amount or 0),
        "count": len(borrowers),
        # Grand totals for the footer of the table (Cols 7-15).
        "totals": {
            "principal_amt":     round(tot_principal, 2),
            "principal_paid":    round(tot_principal_paid, 2),
            "principal_balance": round(tot_principal_balance, 2),
            "interest_amt":      round(tot_interest, 2),
            "interest_paid":     round(tot_interest_paid, 2),
            "interest_balance":  round(tot_interest_balance, 2),
            "penalty_amt":       round(tot_penalty, 2),
            "penalty_balance_amt": round(tot_penalty_balance, 2),
            "total_balance":     round(tot_total_balance, 2),
        },
        # Legacy top-summary keys — kept so the header cards on the
        # "View details" page keep rendering. total_pending_balance now
        # equals the Grand Total of Col-15 (owner rule).
        "total_pending_principal": round(tot_principal, 2),
        "total_pending_interest":  round(tot_interest, 2),
        "total_pending_balance":   round(tot_total_balance, 2),
        "borrowers": borrowers,
    })
