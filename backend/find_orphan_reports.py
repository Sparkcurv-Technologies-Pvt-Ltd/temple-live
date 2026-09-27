from django.db import transaction
from django.db.models import Q
from management.models import ManagementDetails
from reports.models import Report

m = ManagementDetails.objects.first()

fk_fields = [f.name for f in Report._meta.get_fields()
             if f.many_to_one and f.concrete and f.name != 'management_profile']

on_delete = Report._meta.get_field('mangebalancesheet').remote_field.on_delete.__name__
print(f"\nReport.mangebalancesheet on_delete = {on_delete}")
print("Link fields checked:", ", ".join(fk_fields))

unlinked = Q()
for name in fk_fields:
    unlinked &= Q(**{f"{name}__isnull": True})

orphans = Report.objects.filter(management_profile=m).filter(unlinked).order_by('id')

print(f"\nProfile opening balance: {m.opening_balance} {m.opening_balance_type}")
print(f"Unlinked reports found: {orphans.count()}\n")
for r in orphans:
    print(f"  id={r.id:<6} {r.type_choice:<10} amount={r.amount:<12} managee={r.managee} "
          f"balance={getattr(r, 'balance', '-')} created={r.created_at}")

if orphans.exists():
    answer = input("\nDelete ALL the reports listed above? Check they are old opening balances first. [y/N]: ")
    if answer.strip().lower() == 'y':
        with transaction.atomic():
            deleted, _ = orphans.delete()
        print(f"Deleted {deleted} row(s). Reload the balance sheet.")
    else:
        print("Nothing deleted.")
