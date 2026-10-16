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

# Safety: only proceed if we still see exactly the state the dry-run
# validated. If anything changed since the validation ran, abort rather
# than risk acting on a different data set.
expected_total, expected_sub, expected_fest, expected_death = 74, 46, 28, 0
actual_total = affected.count()
actual_sub = affected.exclude(sub_tariff_id=None).count()
actual_fest = affected.exclude(festival_id=None).count()
actual_death = affected.exclude(death_id=None).count()
if (actual_total, actual_sub, actual_fest, actual_death) != (
    expected_total, expected_sub, expected_fest, expected_death
):
    print("ABORTING -- affected-bill counts no longer match what the dry-run validated.")
    print(f"  expected: total={expected_total} sub={expected_sub} fest={expected_fest} death={expected_death}")
    print(f"  actual:   total={actual_total} sub={actual_sub} fest={actual_fest} death={actual_death}")
    raise SystemExit(1)

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
        continue

    corrections_by_member[bill.member_id].append({
        "bill": bill,
        "correct_amt": correct_amt,
        "ledger_type": ledger_type,
        "fk_field": fk_field,
        "fk_val": fk_val,
    })

# Re-validate every member's ledger reconstructs cleanly (same check the
# dry-run did) immediately before touching it, since this is the last
# chance to catch drift between the dry-run and now.
bad_members = []
for member_id, corrections in corrections_by_member.items():
    rows = list(TempleMemberReport.objects.filter(members_id=member_id).order_by("reportdate", "id"))
    running = 0.0
    ok = True
    for row in rows:
        running = running + float(row.credit_amt or 0) - float(row.debit_amt or 0)
        if abs(running - float(row.balance_amt or 0)) > 0.01:
            ok = False
            break
    if not ok:
        bad_members.append(member_id)

if bad_members:
    print("ABORTING -- the following members no longer validate cleanly:", bad_members)
    raise SystemExit(1)

bills_updated = 0
report_rows_credit_updated = 0
report_rows_balance_recalculated = 0
total_credited = 0.0
member_results = []

for member_id, corrections in corrections_by_member.items():
    member_credited = 0.0
    for c in corrections:
        bill = c["bill"]
        correct_amt = c["correct_amt"]

        bill.penalty_amount = correct_amt
        bill.amount_balance = float(bill.amount_balance) + correct_amt
        bill.total_bal_amt = float(bill.total_bal_amt) + correct_amt
        bill.save()
        bills_updated += 1

        filter_kwargs = {
            "members_id": member_id,
            c["fk_field"]: c["fk_val"],
            "type_choice": c["ledger_type"],
        }
        ledger_rows = list(TempleMemberReport.objects.filter(**filter_kwargs).order_by("id"))
        if len(ledger_rows) != 1:
            print(
                f"WARNING: member {member_id} has {len(ledger_rows)} ledger rows "
                f"for {c['ledger_type']} (expected 1) -- bill field corrected, "
                f"but ledger NOT updated for this one. Needs manual review."
            )
            continue

        row = ledger_rows[0]
        row.credit_amt = correct_amt
        row.save()
        report_rows_credit_updated += 1
        member_credited += correct_amt

    # Recompute running balance forward through this member's full ledger
    # history, now that the corrected row(s)' credit_amt are in place.
    all_rows = list(TempleMemberReport.objects.filter(members_id=member_id).order_by("reportdate", "id"))
    running = 0.0
    for row in all_rows:
        running = running + float(row.credit_amt or 0) - float(row.debit_amt or 0)
        if abs(float(row.balance_amt or 0) - running) > 0.01:
            row.balance_amt = running
            row.save()
            report_rows_balance_recalculated += 1

    total_credited += member_credited
    member_results.append((member_id, member_credited))

print(f"Members corrected: {len(corrections_by_member)}")
print(f"Bills corrected (penalty_amount + balance fields): {bills_updated}")
print(f"Ledger rows with credit_amt corrected: {report_rows_credit_updated}")
print(f"Ledger rows with balance_amt recalculated forward: {report_rows_balance_recalculated}")
print(f"Total amount credited across all members: {total_credited:.2f}")
print()
print("Per-member amount credited:")
for member_id, amt in sorted(member_results):
    print(f"  member_id={member_id}: +{amt:.2f}")
