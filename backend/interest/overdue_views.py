"""
On-demand backfill of missed overdue Interest + Penalty rows.

Business rule
-------------
For a Management/Chit Fund interest record, the app applies:

    * On day 5 of every month after `interest_date` → an *Interest* charge
      (either flat amount or a % of the current principal, depending on
      `interest_type_new`).
    * On day 20 of the same month, if the interest is still unpaid →
      a *Penalty* charge (either flat amount or a % of the outstanding
      interest, depending on `penalty_type`).

Historically these rows were only appended once — at record creation
(see `add_interest_given_details`). When time passes without payment,
neither the interest for the newer months nor the penalty is re-applied
to the balance sheet, leading to under-reporting of dues.

This module walks each month from the last-applied month up to today,
appends the missing Interest / Penalty rows to `PeopleInterestBalanceSheet`
and `InterestPeopleReport`, and updates `interest_apply_date` accordingly.
Idempotent — running it twice does nothing the second time.
"""
from __future__ import annotations

import datetime

from dateutil.relativedelta import relativedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet
from reports.models import InterestPeopleReport
from token_app.views import token_checking


def _month_key(dt: datetime.date) -> tuple[int, int]:
    return dt.year, dt.month


def _first_pending_month(interest_date: datetime.date, apply_date: datetime.date | None):
    """
    Return (year, month) for the first month whose interest has NOT been
    applied yet. Interest for month M is applied on day 5 of month (M+1).
    """
    reference = apply_date or interest_date
    nxt = reference + relativedelta(months=1)
    return nxt.year, nxt.month


def _apply_for_record(record: PeopleInterestDetails) -> dict:
    """Append missing Interest + Penalty rows for a single record."""
    try:
        bal = PeopleInterestBalanceSheet.objects.get(interest_id=record.id)
    except PeopleInterestBalanceSheet.DoesNotExist:
        return {"interest_id": record.id, "applied_months": [], "skipped": "no balance sheet"}

    # Installment loans have their own cadence-aware handler:
    # per owner rule (Feb 2026), the penalty for those loans is
    # 3 % × installment_amt applied every installment period after
    # the due date — weekly if interest_period_type = "week",
    # monthly if "month", etc.
    if (record.interest_category or "").lower() == "installment interest":
        return _apply_for_installment(record, bal)

    today = datetime.date.today()
    applied = []
    y, m = _first_pending_month(record.interest_date, bal.interest_apply_date)

    while True:
        checking_day = datetime.date(y, m, 5)
        penalty_day = datetime.date(y, m, 20)

        # Nothing to do until we've reached the 5th of the target month.
        if checking_day > today:
            break

        # ---- 1) Interest for that month --------------------------------
        already_charged = InterestPeopleReport.objects.filter(
            interest=record,
            reportdate=checking_day,
            type_choice="Interest",
        ).exists()
        if not already_charged:
            if (record.interest_type_new or "").lower() == "amount":
                inc = float(record.fix_interest_rate_percent or 0)
            else:  # percentage (default)
                inc = (float(bal.principal_balance or 0) * float(record.fix_interest_rate_percent or 0)) / 100.0
            if inc > 0:
                bal.intrest_amt = float(bal.intrest_amt or 0) + inc
                bal.intrest_balance_amt = float(bal.intrest_balance_amt or 0) + inc
                bal.credit_amt = float(bal.credit_amt or 0) + inc
                bal.balance_amt = float(bal.balance_amt or 0) + inc
                bal.save()
                InterestPeopleReport.objects.create(
                    management_profile=record.management_profile,
                    interest=record,
                    reportdate=checking_day,
                    credit_amt=inc,
                    balance_amt=bal.balance_amt,
                    type_choice="Interest",
                    created_by=record.created_by,
                )
                applied.append({"month": checking_day.isoformat(), "interest": inc})

        # ---- 2) Penalty on day 20 if still unpaid ----------------------
        # Owner toggle: skip penalty entirely for records where
        # penalty_enabled is False (Feb 2026 rule).
        penalty_on = True if record.penalty_enabled is None else bool(record.penalty_enabled)
        if penalty_on and penalty_day <= today and float(bal.intrest_balance_amt or 0) > 0:
            already_penalised = InterestPeopleReport.objects.filter(
                interest=record,
                reportdate=penalty_day,
                type_choice="Penalty",
            ).exists()
            if not already_penalised:
                if (record.penalty_type or "").lower() == "amount":
                    pen = float(record.penalty_amount or 0)
                else:  # percentage
                    pen = (float(bal.intrest_balance_amt or 0) * float(record.penalty_amount or 0)) / 100.0
                if pen > 0:
                    bal.penalty_amt = float(bal.penalty_amt or 0) + pen
                    bal.penalty_balance_amt = float(bal.penalty_balance_amt or 0) + pen
                    bal.credit_amt = float(bal.credit_amt or 0) + pen
                    bal.balance_amt = float(bal.balance_amt or 0) + pen
                    bal.save()
                    InterestPeopleReport.objects.create(
                        management_profile=record.management_profile,
                        interest=record,
                        reportdate=penalty_day,
                        credit_amt=pen,
                        balance_amt=bal.balance_amt,
                        type_choice="Penalty",
                        created_by=record.created_by,
                    )
                    applied.append({"month": penalty_day.isoformat(), "penalty": pen})

        # Advance to next month.
        bal.interest_apply_date = checking_day
        bal.save()
        nxt = checking_day + relativedelta(months=1)
        y, m = nxt.year, nxt.month
        # Safety: don't loop past today's month.
        if datetime.date(y, m, 5) > today:
            break

    return {"interest_id": record.id, "applied_months": applied}


def _installment_delta(record: PeopleInterestDetails):
    """Timedelta between two consecutive installment due dates.

    Reads ``interest_period_type`` (week / month / days) from the loan
    and returns a ``relativedelta`` for ONE installment cycle. Defaults
    to monthly when the field is missing.

    Note: ``interest_period`` is the TOTAL count of installments in the
    loan (e.g. ``20`` weekly installments), NOT the delta multiplier.
    The cadence between two consecutive due dates is a single unit of
    the period-type (1 week / 1 month / 1 day).
    """
    ptype = (record.interest_period_type or "month").lower()
    if ptype in ("day", "days"):
        return relativedelta(days=1)
    if ptype in ("week", "weeks"):
        return relativedelta(weeks=1)
    return relativedelta(months=1)


def _apply_for_installment(
    record: PeopleInterestDetails, bal: PeopleInterestBalanceSheet
) -> dict:
    """Penalty accrual for Installment-Interest loans.

    Rule (Feb 2026 — v2, owner-locked):
        * Cadence follows `interest_period_type` (days / week / month).
        * For EVERY due date that has already passed and was NOT paid
          on-time (unpaid OR paid late — treated the same because we
          only have per-installment counters, not per-cycle payment
          timestamps), append ONE penalty row of:

              penalty_per_cycle = balancesheet.intrest_amt × 3 % × 1
                                = (intrest_amt × 3) / 100

          i.e. 3 % of the interest amount already recorded on the
          balance sheet at loan-creation time (populated by
          `add_interest_given_details`). The base is the *interest*,
          not `installment_amt` and not `principal_amt`.
        * Missed cycles accumulate — the *total* penalty on the ledger
          equals `penalty_per_cycle × missed_due_dates`.
        * The `Apply Penalty` checkbox (`penalty_enabled=False`) still
          disables the whole thing — owner override.
        * No gate on `intrest_balance_amt` (owner rule: "no penalty
          should be missed" — even loans whose interest was cleared
          keep their historical missed penalties).
        * Idempotent — an existing `Penalty` row with the same
          `reportdate` is never duplicated.
    """
    today = datetime.date.today()
    applied = []

    # Skip when owner has toggled the "Apply Penalty" checkbox off.
    penalty_on = True if record.penalty_enabled is None else bool(record.penalty_enabled)
    if not penalty_on:
        return {"interest_id": record.id, "applied_months": [], "skipped": "penalty disabled"}

    start = record.interest_date
    if not start:
        return {"interest_id": record.id, "applied_months": [], "skipped": "no interest_date"}

    delta = _installment_delta(record)

    # Owner rule (Feb 2026 — v3, LATEST): base for penalty per missed
    # cycle is `installment_amt × 3 %` (NOT `intrest_amt`).  Reflects
    # the borrower-facing rule "3 % of what you were supposed to pay
    # per cycle".
    installment_amt = float(record.installment_amt or 0)
    if installment_amt <= 0:
        return {"interest_id": record.id, "applied_months": [], "skipped": "no installment_amt"}

    # Fixed 3 % rate per owner spec.
    pen_per_cycle = round(installment_amt * 3.0 / 100.0, 2)
    if pen_per_cycle <= 0:
        return {"interest_id": record.id, "applied_months": [], "skipped": "penalty rate 0"}

    # Walk every due date from `start + delta` to today. Cycles the
    # borrower has already paid do NOT receive a penalty row.
    # Prefer the rolling `installment_date` pointer (owner rule Feb 2026)
    # which tracks the next expected due date and is advanced by
    # collection/views.py on every payment. Fallback to the legacy
    # (start + cycle × delta) walker for rows that haven't been
    # migrated yet.
    paid_counts = int(record.paid_counts or 0)
    # Owner rule (Feb 2026 — v4): stop accruing penalty once every
    # scheduled installment has been walked. Without this bound the
    # walker keeps appending penalties forever past the loan's
    # terminating date. When ``interest_period`` is 0/None the bound
    # is disabled (legacy open-ended records).
    try:
        max_cycle = int(record.interest_period or 0)
    except (TypeError, ValueError):
        max_cycle = 0

    # Owner rule (Feb 2026 — v5, Days-type confirmed by owner):
    # For "Days" installment loans the borrower gets the FULL due date
    # to pay — penalty is NOT charged on the due date itself.  Only when
    # the due date has STRICTLY PASSED (today > due_date) is a penalty
    # row written, and the ledger date is set to the day AFTER the missed
    # due date (i.e. ``due_date + delta``).
    # For Weeks / Months the existing behaviour (penalty on/after due date,
    # reportdate = due_date) is preserved unchanged.
    ptype = (record.interest_period_type or "month").lower()
    is_days = ptype in ("day", "days")

    if record.installment_date:
        # Every full cadence step BEFORE today is a missed due date.
        due_date = record.installment_date
        cycle = paid_counts + 1
        while (due_date < today) if is_days else (due_date <= today):
            if max_cycle and cycle > max_cycle:
                break
            # Days: penalty reportdate = day AFTER missed due date.
            # Weeks/Months: penalty reportdate = due date itself.
            penalty_report_date = (due_date + delta) if is_days else due_date
            already = InterestPeopleReport.objects.filter(
                interest=record,
                reportdate=penalty_report_date,
                type_choice="Penalty",
            ).exists()
            if not already:
                bal.penalty_amt = float(bal.penalty_amt or 0) + pen_per_cycle
                bal.penalty_balance_amt = float(bal.penalty_balance_amt or 0) + pen_per_cycle
                bal.credit_amt = float(bal.credit_amt or 0) + pen_per_cycle
                bal.balance_amt = float(bal.balance_amt or 0) + pen_per_cycle
                bal.save()
                InterestPeopleReport.objects.create(
                    management_profile=record.management_profile,
                    interest=record,
                    reportdate=penalty_report_date,
                    credit_amt=pen_per_cycle,
                    balance_amt=bal.balance_amt,
                    type_choice="Penalty",
                    created_by=record.created_by,
                )
                applied.append({"due_date": penalty_report_date.isoformat(), "penalty": pen_per_cycle})
            cycle += 1
            due_date = due_date + delta
    else:
        # Legacy walker (no installment_date pointer yet).
        cycle = 1
        due_date = start + delta
        while (due_date < today) if is_days else (due_date <= today):
            if max_cycle and cycle > max_cycle:
                break
            if cycle > paid_counts:
                penalty_report_date = (due_date + delta) if is_days else due_date
                already = InterestPeopleReport.objects.filter(
                    interest=record,
                    reportdate=penalty_report_date,
                    type_choice="Penalty",
                ).exists()
                if not already:
                    bal.penalty_amt = float(bal.penalty_amt or 0) + pen_per_cycle
                    bal.penalty_balance_amt = float(bal.penalty_balance_amt or 0) + pen_per_cycle
                    bal.credit_amt = float(bal.credit_amt or 0) + pen_per_cycle
                    bal.balance_amt = float(bal.balance_amt or 0) + pen_per_cycle
                    bal.save()
                    InterestPeopleReport.objects.create(
                        management_profile=record.management_profile,
                        interest=record,
                        reportdate=penalty_report_date,
                        credit_amt=pen_per_cycle,
                        balance_amt=bal.balance_amt,
                        type_choice="Penalty",
                        created_by=record.created_by,
                    )
                    applied.append({"due_date": penalty_report_date.isoformat(), "penalty": pen_per_cycle})
            cycle += 1
            due_date = start + (delta * cycle)

    # NOTE: previously stamped `bal.interest_apply_date` here to short-
    # circuit re-runs. Removed — it was corrupting the "Start" column on
    # the Pending Borrowers page. Idempotency is enforced above via
    # `InterestPeopleReport.exists()` per due date.
    return {"interest_id": record.id, "applied_months": applied}


@api_view(["POST"])
def apply_overdue_interest_and_penalty(request):
    """
    Backfill Interest + Penalty rows for every active interest record.

    Query / body params:
      * ``id``      – limit run to a single interest record (int).
      * ``dry_run`` – 1/true → compute totals without touching the DB.
    """
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized"}, status=status.HTTP_401_UNAUTHORIZED)

    single_id = request.query_params.get("id") or (
        request.data.get("id") if isinstance(request.data, dict) else None
    )
    dry_raw = request.query_params.get("dry_run") or (
        request.data.get("dry_run") if isinstance(request.data, dict) else None
    )
    dry_run = str(dry_raw).lower() in ("1", "true", "yes")

    qs = PeopleInterestDetails.objects.filter(action=True)
    if single_id:
        qs = qs.filter(id=single_id)

    summary = []
    if dry_run:
        from django.db import transaction
        with transaction.atomic():
            sp = transaction.savepoint()
            try:
                for rec in qs:
                    summary.append(_apply_for_record(rec))
            finally:
                transaction.savepoint_rollback(sp)
    else:
        for rec in qs:
            summary.append(_apply_for_record(rec))

    total_penalty = sum(
        item.get("penalty", 0)
        for r in summary
        for item in r.get("applied_months", [])
    )
    total_interest = sum(
        item.get("interest", 0)
        for r in summary
        for item in r.get("applied_months", [])
    )
    return Response({
        "dry_run": dry_run,
        "records_processed": len(summary),
        "added_interest_total": round(total_interest, 2),
        "added_penalty_total": round(total_penalty, 2),
        "details": summary,
    })


# ---------------------------------------------------------------------------
# Recompute the balance sheet totals from the InterestPeopleReport audit
# trail. Used to heal drift from rounding / edited collections / historical
# manual edits reported by operators (e.g. TC_TEMPLE_INTEREST_001).
# ---------------------------------------------------------------------------
def _recompute_report_balances(interest: PeopleInterestDetails) -> dict:
    """
    Rewrite ``balance_amt`` for every row of ``reports_interestpeoplereport``
    belonging to <interest>, using the running-balance formula:

        row.balance_amt = Σ credit_amt − Σ debit_amt
                          over all rows 0..r for this interest_id
                          (ordered by reportdate, then id)

    Also mirrors the healed totals back onto
    ``balancesheet_peopleinterestbalancesheet`` for the same interest so
    the two tables stay in lock-step.

    Owner rule (Feb 2026): overshoots are clamped at 0 — a debit that
    exceeds the current running balance must NOT leave the ledger
    negative (same policy as the customer-facing sheet + PDF).

    Idempotent — running twice is a no-op, safe to call on every read.

    Returns a small summary dict for the caller/logger.
    """
    try:
        bal = PeopleInterestBalanceSheet.objects.get(interest_id=interest.id)
    except PeopleInterestBalanceSheet.DoesNotExist:
        bal = None

    reports = list(
        InterestPeopleReport.objects
        .filter(interest=interest)
        .order_by("reportdate", "id")
    )
    running = 0.0
    credit_sum = 0.0
    debit_sum = 0.0
    row_changes = 0
    for r in reports:
        c = float(r.credit_amt or 0)
        d = float(r.debit_amt or 0)
        credit_sum += c
        debit_sum += d
        running = round(running + c - d, 2)
        if running < 0:
            running = 0.0
        if abs(float(r.balance_amt or 0) - running) >= 0.01:
            row_changes += 1
            r.balance_amt = running
            r.save(update_fields=["balance_amt"])

    new_balance = round(max(0.0, credit_sum - debit_sum), 2)

    # Mirror the healed totals back onto the balance-sheet aggregate
    # row so the "Pending borrowers" summary and PDF also reconcile.
    if bal is not None:
        drift = round(float(bal.balance_amt or 0) - new_balance, 2)
        if abs(drift) >= 0.01 or row_changes > 0:
            bal.credit_amt = round(credit_sum, 2)
            bal.debit_amt = round(debit_sum, 2)
            bal.balance_amt = new_balance
            bal.save()

    return {
        "interest_id": interest.id,
        "row_balance_fixes": row_changes,
        "credit_sum": round(credit_sum, 2),
        "debit_sum": round(debit_sum, 2),
        "new_balance": new_balance,
    }


@api_view(["POST"])
def recompute_interest_balance(request):
    """
    For each active interest record, re-derive:
      * balance_amt         = Σ credits − Σ debits
      * credit_amt          = Σ credits
      * debit_amt           = Σ debits
    from every ``InterestPeopleReport`` row belonging to it.

    Pass ``?id=<pk>`` for a single record, ``?dry_run=1`` for a preview.
    """
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized"}, status=status.HTTP_401_UNAUTHORIZED)

    single_id = request.query_params.get("id") or (
        request.data.get("id") if isinstance(request.data, dict) else None
    )
    dry_run = str(
        request.query_params.get("dry_run") or
        (request.data.get("dry_run") if isinstance(request.data, dict) else "")
    ).lower() in ("1", "true", "yes")

    qs = PeopleInterestDetails.objects.filter(action=True)
    if single_id:
        qs = qs.filter(id=single_id)

    fixed = []
    for rec in qs:
        try:
            bal = PeopleInterestBalanceSheet.objects.get(interest_id=rec.id)
        except PeopleInterestBalanceSheet.DoesNotExist:
            continue

        # Walk the audit trail chronologically and rebuild the running
        # balance. Clamp at 0 – a payment that overshoots must NOT leave
        # a negative amount on the ledger (per operator business rule).
        # Also updates each report row's `balance_amt` so the balance-sheet
        # UI stops oscillating on the last few transactions.
        reports = list(
            InterestPeopleReport.objects
            .filter(interest=rec)
            .order_by("reportdate", "id")
        )
        running = 0.0
        credit_sum = 0.0
        debit_sum = 0.0
        row_changes = 0
        for r in reports:
            c = float(r.credit_amt or 0)
            d = float(r.debit_amt or 0)
            credit_sum += c
            debit_sum += d
            running = round(running + c - d, 2)
            # A debit that overshoots the current balance must be clamped
            # so the last transaction lands on exactly 0.00.
            if running < 0:
                running = 0.0
            if abs(float(r.balance_amt or 0) - running) >= 0.01:
                row_changes += 1
                if not dry_run:
                    r.balance_amt = running
                    r.save(update_fields=["balance_amt"])

        new_balance = round(max(0.0, credit_sum - debit_sum), 2)
        drift = round(float(bal.balance_amt or 0) - new_balance, 2)

        if abs(drift) < 0.01 and row_changes == 0:
            continue

        fixed.append({
            "interest_id": rec.id,
            "old_balance": float(bal.balance_amt or 0),
            "new_balance": new_balance,
            "drift": drift,
            "credit_sum": round(credit_sum, 2),
            "debit_sum": round(debit_sum, 2),
            "row_balance_fixes": row_changes,
        })

        if not dry_run:
            bal.credit_amt = round(credit_sum, 2)
            bal.debit_amt = round(debit_sum, 2)
            bal.balance_amt = new_balance
            bal.save()

    return Response({
        "dry_run": dry_run,
        "records_scanned": qs.count(),
        "records_needing_fix": len(fixed),
        "total_drift_healed": round(sum(f["drift"] for f in fixed), 2),
        "details": fixed[:200],  # cap payload size
    })
