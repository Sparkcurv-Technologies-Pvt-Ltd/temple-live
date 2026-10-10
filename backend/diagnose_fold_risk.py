"""
Diagnostic: for every active "Interest with capital" loan, check whether
principal_balance already has compounding folded into it (dangerous to
recompute as-is) or is still "clean" flat principal (safe to recompute).

Logic: principal_balance should, under a NEVER-folded loan, equal
principal_amt minus whatever real principal payments have been made
(principal_paid). If principal_balance is higher than that by roughly the
old_tail_interest_sum (or any unexplained amount), compounding has
already been folded into it live, and running the existing recompute
script as-is on that loan would double-fold the tail interest into
principal_balance.
"""
from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet
from reports.models import InterestPeopleReport

qs = PeopleInterestDetails.objects.filter(
    action=True,
    interest_category__iexact="Interest with capital",
)

print(f"{'id':>4} {'name':<22} {'principal_amt':>14} {'principal_paid':>14} {'expected_clean':>14} {'actual_principal_balance':>24} {'diff':>12} {'status'}")
for record in qs:
    try:
        bal = PeopleInterestBalanceSheet.objects.get(interest_id=record.id)
    except PeopleInterestBalanceSheet.DoesNotExist:
        continue

    principal_amt = float(record.principal_amt or 0)
    principal_paid = float(bal.principal_paid or 0)
    expected_clean = principal_amt - principal_paid
    actual = float(bal.principal_balance or 0)
    diff = round(actual - expected_clean, 2)

    status = "CLEAN (safe)" if abs(diff) < 1.0 else "ALREADY FOLDED (risk!)"
    print(f"{record.id:>4} {record.people_name[:22]:<22} {principal_amt:>14.2f} {principal_paid:>14.2f} {expected_clean:>14.2f} {actual:>24.2f} {diff:>12.2f} {status}")
