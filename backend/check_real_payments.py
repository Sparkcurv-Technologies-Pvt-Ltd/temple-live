"""
For the 27 production "Interest with capital" loans flagged as
ALREADY FOLDED, check whether any of them have a genuine real payment
(an InterestPeopleReport row with debit_amt > 0 and a non-null
collection_id) -- i.e. whether a simple full reset+rebuild is safe, or
whether some of them need the more careful Option-A (preserve paid
history) treatment instead.
"""
from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet
from reports.models import InterestPeopleReport

qs = PeopleInterestDetails.objects.filter(
    action=True,
    interest_category__iexact="Interest with capital",
)

print(f"{'id':>4} {'name':<22} {'intrest_paid_amt':>16} {'real_payment_rows':>18} {'all_report_rows':<60}")
for record in qs:
    try:
        bal = PeopleInterestBalanceSheet.objects.get(interest_id=record.id)
    except PeopleInterestBalanceSheet.DoesNotExist:
        continue

    real_payments = InterestPeopleReport.objects.filter(
        interest=record, debit_amt__gt=0, collection_id__isnull=False
    ).count()

    rows = list(
        InterestPeopleReport.objects.filter(interest=record)
        .order_by("reportdate")
        .values_list("reportdate", "type_choice", "credit_amt", "debit_amt")
    )
    rows_str = "; ".join(f"{d}/{t}/c{c}/d{dd}" for d, t, c, dd in rows)

    print(f"{record.id:>4} {record.people_name[:22]:<22} {float(bal.intrest_paid_amt or 0):>16.2f} {real_payments:>18} {rows_str}")
