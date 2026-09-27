from datetime import date
from management.models import ManagementDetails
from treasure.models import ManagementBalanceSheet
from reports.models import Report
import balancesheet.views as bv

DAY = date.today().isoformat()   # change to the date you pick on the page, e.g. "2026-09-27"

m = ManagementDetails.objects.first()
before = Report.objects.filter(management_profile=m, created_at__date__lt=DAY)
normal = before.filter(mangebalancesheet=None, managee=False)

print("\nNew balance sheet code on disk:", hasattr(bv, "build_temple_balancesheet"))
print("Opening sheets (managee=True):", ManagementBalanceSheet.objects.filter(management_profile=m, managee=True).count())
print("Opening reports:", Report.objects.filter(management_profile=m).exclude(mangebalancesheet=None).count())

print(f"\n=== Opening balance for {DAY} ===")
print("Profile opening      :", m.opening_balance, m.opening_balance_type, "->", bv.management_opening_signed(m))
print("Bank opening (net)   :", bv.bank_opening_net(m))
print("All income before    :", bv.S(normal.filter(type_choice="Addition")))
print("All expense before   :", bv.S(normal.filter(type_choice="Reduction")))

fk = [f.name for f in Report._meta.get_fields() if f.many_to_one and f.concrete and f.name != "management_profile"]
for kind in ("Addition", "Reduction"):
    print(f"\n  {kind} before {DAY}, by type:")
    for name in fk:
        amt = bv.S(normal.filter(type_choice=kind).exclude(**{name: None}))
        if amt:
            print(f"    {name:<18} {amt}")

total, bank, cash = bv.opening_figures(m, before)
print(f"\nTOTAL opening = {total}   (bank {bank}, cash {cash})")
