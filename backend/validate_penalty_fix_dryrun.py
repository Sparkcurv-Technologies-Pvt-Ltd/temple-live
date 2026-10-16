from collections import defaultdict

from amount.models import PeoplesAmountDetails
from reports.models import TempleMemberReport


def calc_sub_tariff_penalty(tariff):
    if tariff.penalty_amount_type == "Amount":
        return float(tariff.penalty_amt or 0)
    elif tariff.penalty_amount_type == "Percentage":
        return float(tariff.tariff_amount or 0) * (float(tariff.penalty_amt or 0) / 100)
    return 0.0


def calc_festival_penalty(festival):
    if festival.choice == "Amount":
        return float(festival.penalty_amt or 0)
    elif festival.choice == "Percentage":
        return float(festival.tax_per_head or 0) * (float(festival.penalty_amt or 0) / 100)
    return 0.0


affected = PeoplesAmountDetails.objects.filter(paid=False, penalty=True, penalty_amount=0)

print("Total affected bills found now:", affected.count())
print("  sub_tariff:", affected.exclude(sub_tariff_id=None).count())
print("  festival:", affected.exclude(festival_id=None).count())
print("  death:", affected.exclude(death_id=None).count())
print()

corrections_by_member = defaultdict(list)

for bill in affected:
    if bill.sub_tariff_id:
        tariff = bill.sub_tariff
        correct_amt = calc_sub_tariff_penalty(tariff)
        ledger_type = "subscription Tariff Penalty"
        fk_field = "sub_tariff_id"
        fk_val = bill.sub_tariff_id
    elif bill.festival_id:
        festival = bill.festival
        correct_amt = calc_festival_penalty(festival)
        ledger_type = "Festival Penalty"
        fk_field = "festivals_id"
        fk_val = bill.festival_id
    else:
        continue

    if correct_amt <= 0:
        print(f"  NOTE: bill id={bill.id} member_id={bill.member_id} computed penalty is 0 -- skipping (nothing to credit)")
        continue

    corrections_by_member[bill.member_id].append({
        "bill_id": bill.id,
        "correct_amt": correct_amt,
        "ledger_type": ledger_type,
        "fk_field": fk_field,
        "fk_val": fk_val,
    })

clean_members = []
dirty_members = []

for member_id, corrections in corrections_by_member.items():
    rows = list(
        TempleMemberReport.objects.filter(members_id=member_id).order_by("reportdate", "id")
    )
    running = 0.0
    mismatch = None
    for row in rows:
        running = running + float(row.credit_amt or 0) - float(row.debit_amt or 0)
        stored = float(row.balance_amt or 0)
        if abs(running - stored) > 0.01:
            mismatch = (row.id, row.reportdate, row.type_choice, running, stored)
            break
    if mismatch:
        dirty_members.append((member_id, mismatch))
    else:
        clean_members.append(member_id)

print(f"Members needing correction: {len(corrections_by_member)}")
print(f"  Clean (ledger reconstructs correctly, safe to auto-fix): {len(clean_members)}")
print(f"  Dirty (ledger history doesn't reconstruct cleanly, needs manual review): {len(dirty_members)}")
print()
if dirty_members:
    print("Dirty member details (member_id, first mismatching row: id/date/type/computed/stored):")
    for m in dirty_members:
        print(" ", m)
