"""
One-off patch (run directly on the server) for interest/overdue_views.py.

Corrects the Capital Fold amount: previously it folded the FIXED amount
originally charged that month (`charge_row.credit_amt`), ignoring any
partial payment already made against it before the 20th. Owner rule
(Oct 2026, final): fold whatever is STILL actually outstanding in
`intrest_balance_amt` as of the 20th -- e.g. charged 1545, 1500 paid ->
only the remaining 45 folds into principal, not the full 1545.

Folding now also clears intrest_balance_amt to 0 for the folded portion,
since that debt has become principal and must not still show as
interest owed (previously it was never reduced at fold time at all).

Run from the Django project root:
    python3 patch_fold_live_balance.py
"""
import pathlib

TARGET = pathlib.Path("interest/overdue_views.py")
BACKUP = pathlib.Path("interest/overdue_views.py.bak_before_fold_live_balance_patch")

OLD = '''    # ------------------------------------------------------------
    # Owner rule (Oct 2026, corrected): "Interest with capital" loans
    # compound only the months that are STILL UNPAID as of the 20th.
    # The fold amount is exactly that month's own interest charge
    # (`charge_row.credit_amt`) — never the whole running balance.
    # Idempotent via a dedicated "Capital Fold" audit row dated the
    # 20th, so re-running this function never double-folds. Folding
    # HERE (right after this month's charge, before the caller moves
    # on to the next month) is what makes next month's charge see the
    # correctly compounded principal_balance.
    # ------------------------------------------------------------
    inc_this_month = float(charge_row.credit_amt or 0)
    if is_capital and still_unpaid and not already_folded and inc_this_month > 0:
        bal.principal_balance = float(bal.principal_balance or 0) + inc_this_month
        bal.save()
        # `credit_amt` here records exactly how much was folded into
        # principal_balance this month -- it does NOT affect
        # `balance_amt` (the fold moves nothing into/out of the
        # collectible balance, it only grows the compounding base).
        # Kept so the retroactive recompute script can back it out of
        # principal_balance precisely, and so `_recompute_report_
        # balances` can exclude it from the credit/debit ledger sum.
        InterestPeopleReport.objects.create(
            management_profile=record.management_profile,
            interest=record,
            reportdate=penalty_day,
            credit_amt=inc_this_month,
            balance_amt=bal.balance_amt,
            type_choice="Capital Fold",
            created_by=record.created_by,
        )
        applied.append({"month": penalty_day.isoformat(), "fold": inc_this_month})

    return applied'''

NEW = '''    # ------------------------------------------------------------
    # Owner rule (Oct 2026, FINAL correction): "Interest with capital"
    # loans fold whatever is STILL ACTUALLY OUTSTANDING in
    # intrest_balance_amt as of the 20th -- not the fixed amount
    # originally charged that month. A partial payment made before the
    # 20th reduces what gets folded (e.g. charged 1545, 1500 paid ->
    # only the remaining 45 folds into principal). Folding clears
    # intrest_balance_amt to 0, since that debt is now principal and
    # must not also still show as interest owed.
    # Idempotent via a dedicated "Capital Fold" audit row dated the
    # 20th, so re-running this function never double-folds. Folding
    # HERE (right after this month's charge, before the caller moves
    # on to the next month) is what makes next month's charge see the
    # correctly compounded principal_balance.
    # ------------------------------------------------------------
    fold_amt = float(bal.intrest_balance_amt or 0)
    if is_capital and still_unpaid and not already_folded and fold_amt > 0:
        bal.principal_balance = float(bal.principal_balance or 0) + fold_amt
        bal.intrest_balance_amt = 0.0
        bal.save()
        # `credit_amt` here records exactly how much was folded into
        # principal_balance this month -- it does NOT affect
        # `balance_amt` (the fold moves nothing into/out of the
        # collectible balance, it only grows the compounding base).
        # Kept so the retroactive recompute script can back it out of
        # principal_balance precisely, and so `_recompute_report_
        # balances` can exclude it from the credit/debit ledger sum.
        InterestPeopleReport.objects.create(
            management_profile=record.management_profile,
            interest=record,
            reportdate=penalty_day,
            credit_amt=fold_amt,
            balance_amt=bal.balance_amt,
            type_choice="Capital Fold",
            created_by=record.created_by,
        )
        applied.append({"month": penalty_day.isoformat(), "fold": fold_amt})

    return applied'''

text = TARGET.read_text()

if OLD not in text:
    raise SystemExit(
        "ABORTING -- could not find the expected current fold block in "
        "interest/overdue_views.py. It may differ from what this patch "
        "expects. No changes written."
    )

BACKUP.write_text(text)
text = text.replace(OLD, NEW, 1)
TARGET.write_text(text)

print(f"Patched {TARGET} (backup saved to {BACKUP}).")
print("Fold now uses the live intrest_balance_amt and clears it after folding.")