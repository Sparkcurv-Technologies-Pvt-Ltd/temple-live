from datetime import date
from django.db.models import Sum, Count
from management.models import ManagementDetails
from reports.models import Report

DAY = date.today().isoformat()
m = ManagementDetails.objects.first()
normal = Report.objects.filter(management_profile=m, created_at__date__lt=DAY,
                               mangebalancesheet=None, managee=False)

for kind in ("Reduction", "Addition"):
    print(f"\n=== {kind} with interest link, by interest type ===")
    rows = (normal.filter(type_choice=kind).exclude(interest=None)
            .values('interest__interest_type').annotate(total=Sum('amount'), n=Count('id')))
    for r in rows:
        print(f"  {str(r['interest__interest_type']):<25} {r['total']:>14}  ({r['n']} rows)")

print("\n=== Reduction with members link, NOT interest (what is this 9.8L?) ===")
rows = (normal.filter(type_choice="Reduction").exclude(members=None).filter(interest=None)
        .values('expenses__expense_name', 'rentsandlease_id', 'chit_fund_id', 'cash_transaction_id')
        .annotate(total=Sum('amount'), n=Count('id')))
for r in rows:
    print(" ", r)

print("\n=== Largest 15 Reduction rows before", DAY, "===")
for r in normal.filter(type_choice="Reduction").order_by('-amount')[:15]:
    print(f"  id={r.id:<6} amt={r.amount:>12} interest={r.interest_id} members={r.members_id} "
          f"expenses={r.expenses_id} chit={r.chit_fund_id} created={r.created_at:%Y-%m-%d}")
