"""
One-off patch (run directly on the server) for my_tasks/views.py and
amount/management/commands/apply_penalties.py.

PERMANENT fix for the "penalty row created but not applied" bug: 74 bills
were found with penalty=True and a "subscription Tariff Penalty" /
"Festival Penalty" ledger row already created, but penalty_amount stuck at
0.00 -- meaning the penalty was logged but never actually charged. The
historical root cause (why penalty_amount ended up 0 at bill-creation time
for some members) could not be traced -- the server logs that would have
shown the original exception had already rotated away.

Rather than leave the door open for this to recur silently, this patch
makes the penalty-APPLICATION code self-healing: every place that reads
peoples.penalty_amount / bill.penalty_amount to decide how much to credit
now first recomputes the correct value LIVE from the tariff's own
penalty_amount_type/penalty_amt (or festival's choice/penalty_amt) config
-- the exact same formula used at bill-creation time -- and corrects the
stored field if it's wrong, BEFORE the balance gets credited or the ledger
row gets created. This closes the loop completely: even if whatever
flakiness caused the original gap happens again, the very next time this
job runs it will charge the correct amount instead of silently charging 0.

(death-tariff penalties already compute this live correctly -- that
function is left untouched, it's the reference implementation this patch
is bringing the other two in line with.)

Run from the Django project root:
    python3 patch_permanent_penalty_amount_fix.py
"""
import pathlib

# ------------------------------------------------------------------ #
# File 1: my_tasks/views.py
# ------------------------------------------------------------------ #
TARGET1 = pathlib.Path("my_tasks/views.py")
BACKUP1 = pathlib.Path("my_tasks/views.py.bak_before_permanent_penalty_amount_fix")

OLD1_SUB = '''        for peoples in people_amount:
            logger.info(peoples)

            # Idempotency guard: only apply the penalty to the running
            # balance ONCE.  Without this, every re-run of this task
            # inflates amount_balance / total_bal_amt by penalty_amount.
            already_applied = bool(peoples.penalty)
            peoples.penalty = True
            if not already_applied:
                peoples.amount_balance = float(peoples.amount_balance) + float(peoples.penalty_amount)
                peoples.total_bal_amt  = float(peoples.total_bal_amt)  + float(peoples.penalty_amount)
            peoples.save()'''

NEW1_SUB = '''        for peoples in people_amount:
            logger.info(peoples)

            # Owner fix (permanent, Oct 2026): self-heal penalty_amount.
            # It's normally snapshotted onto the bill at creation time
            # (sub_tariff/views.py), but 74 historical bills were found
            # stuck at penalty_amount=0 despite their tariff being
            # configured with a real penalty -- so the penalty got
            # flagged and logged, but never actually charged. The
            # original cause couldn't be traced after the fact (logs had
            # rotated away), so instead of trusting the stored snapshot,
            # recompute the correct amount LIVE from tariff_check every
            # time this runs, using the exact same formula as creation
            # time. This makes the charge self-correcting even if the
            # stored value is ever wrong again.
            if tariff_check.penalty_amount_type == "Amount":
                live_penalty_amt = float(tariff_check.penalty_amt or 0)
            elif tariff_check.penalty_amount_type == "Percentage":
                live_penalty_amt = float(tariff_check.tariff_amount or 0) * (float(tariff_check.penalty_amt or 0) / 100)
            else:
                live_penalty_amt = float(peoples.penalty_amount or 0)
            if live_penalty_amt > 0 and float(peoples.penalty_amount or 0) != live_penalty_amt:
                peoples.penalty_amount = live_penalty_amt

            # Idempotency guard: only apply the penalty to the running
            # balance ONCE.  Without this, every re-run of this task
            # inflates amount_balance / total_bal_amt by penalty_amount.
            already_applied = bool(peoples.penalty)
            peoples.penalty = True
            if not already_applied:
                peoples.amount_balance = float(peoples.amount_balance) + float(peoples.penalty_amount)
                peoples.total_bal_amt  = float(peoples.total_bal_amt)  + float(peoples.penalty_amount)
            peoples.save()'''

OLD1_FEST = '''            for peoples_festival in peoples_amount_festival:
                logger.info(peoples_festival)
                logger.info("vvvvvvvvvvv")
                # Idempotency guard: only add penalty to running balance ONCE.
                already_applied = bool(peoples_festival.penalty)
                peoples_festival.penalty = True
                if not already_applied:
                    peoples_festival.amount_balance = float(peoples_festival.amount_balance) + float(peoples_festival.penalty_amount)
                    peoples_festival.total_bal_amt  = float(peoples_festival.total_bal_amt)  + float(peoples_festival.penalty_amount)
                peoples_festival.save()'''

NEW1_FEST = '''            for peoples_festival in peoples_amount_festival:
                logger.info(peoples_festival)
                logger.info("vvvvvvvvvvv")

                # Owner fix (permanent, Oct 2026): self-heal penalty_amount
                # the same way as the subscription-tariff path above --
                # recompute live from the festival's own choice/penalty_amt
                # config instead of trusting a possibly-stale stored value.
                if i.choice == "Amount":
                    live_penalty_amt = float(i.penalty_amt or 0)
                elif i.choice == "Percentage":
                    live_penalty_amt = float(i.tax_per_head or 0) * (float(i.penalty_amt or 0) / 100)
                else:
                    live_penalty_amt = float(peoples_festival.penalty_amount or 0)
                if live_penalty_amt > 0 and float(peoples_festival.penalty_amount or 0) != live_penalty_amt:
                    peoples_festival.penalty_amount = live_penalty_amt

                # Idempotency guard: only add penalty to running balance ONCE.
                already_applied = bool(peoples_festival.penalty)
                peoples_festival.penalty = True
                if not already_applied:
                    peoples_festival.amount_balance = float(peoples_festival.amount_balance) + float(peoples_festival.penalty_amount)
                    peoples_festival.total_bal_amt  = float(peoples_festival.total_bal_amt)  + float(peoples_festival.penalty_amount)
                peoples_festival.save()'''

text1 = TARGET1.read_text()
missing1 = []
if OLD1_SUB not in text1:
    missing1.append("subscription-tariff block")
if OLD1_FEST not in text1:
    missing1.append("festival block")
if missing1:
    raise SystemExit(
        f"ABORTING -- could not find the expected {', '.join(missing1)} in "
        f"{TARGET1}. It may differ from what this patch expects. No "
        f"changes written to either file."
    )

BACKUP1.write_text(text1)
text1 = text1.replace(OLD1_SUB, NEW1_SUB, 1)
text1 = text1.replace(OLD1_FEST, NEW1_FEST, 1)
TARGET1.write_text(text1)
print(f"Patched {TARGET1} (backup saved to {BACKUP1}).")

# ------------------------------------------------------------------ #
# File 2: amount/management/commands/apply_penalties.py
# ------------------------------------------------------------------ #
TARGET2 = pathlib.Path("amount/management/commands/apply_penalties.py")
BACKUP2 = pathlib.Path("amount/management/commands/apply_penalties.py.bak_before_permanent_penalty_amount_fix")

OLD2_SUB = '''            for bill in bills:
                member = bill.member

                needs_new_penalty = not bill.penalty
                needs_stale_fix = bill.penalty and float(bill.total_bal_amt) < float(bill.amount_balance)

                if needs_new_penalty or needs_stale_fix:
                    if dry_run:
                        reason = "new penalty" if needs_new_penalty else "stale total_bal_amt fix"
                        self.stdout.write(
                            f"[dry-run] Would apply tariff penalty ({reason}): bill id={bill.id} "
                            f"member={member_label(member)} tariff={tariff}"
                        )'''

NEW2_SUB = '''            for bill in bills:
                member = bill.member

                # Owner fix (permanent, Oct 2026): self-heal penalty_amount
                # live from the tariff's own config before deciding
                # anything below, the same fix applied to the equivalent
                # code path in my_tasks/views.py. See that file for the
                # full rationale (74 historical bills found stuck at
                # penalty_amount=0 despite being penalty=True).
                if not dry_run:
                    if tariff.penalty_amount_type == "Amount":
                        live_penalty_amt = float(tariff.penalty_amt or 0)
                    elif tariff.penalty_amount_type == "Percentage":
                        live_penalty_amt = float(tariff.tariff_amount or 0) * (float(tariff.penalty_amt or 0) / 100)
                    else:
                        live_penalty_amt = float(bill.penalty_amount or 0)
                    if live_penalty_amt > 0 and float(bill.penalty_amount or 0) != live_penalty_amt:
                        bill.penalty_amount = live_penalty_amt
                        bill.save(update_fields=["penalty_amount"])

                needs_new_penalty = not bill.penalty
                needs_stale_fix = bill.penalty and float(bill.total_bal_amt) < float(bill.amount_balance)

                if needs_new_penalty or needs_stale_fix:
                    if dry_run:
                        reason = "new penalty" if needs_new_penalty else "stale total_bal_amt fix"
                        self.stdout.write(
                            f"[dry-run] Would apply tariff penalty ({reason}): bill id={bill.id} "
                            f"member={member_label(member)} tariff={tariff}"
                        )'''

OLD2_FEST = '''            for bill in bills:
                member = bill.member

                needs_new_penalty = not bill.penalty
                # IMPORTANT: once penalty=True, amount_balance already has the
                # penalty folded in. Only compare total_bal_amt against
                # amount_balance itself here — NOT amount_balance + penalty_amount
                # again — or this re-fires (and re-charges) every run.
                needs_stale_fix = bill.penalty and float(bill.total_bal_amt) < float(bill.amount_balance)

                if needs_new_penalty or needs_stale_fix:
                    if dry_run:
                        reason = "new penalty" if needs_new_penalty else "stale total_bal_amt fix"
                        self.stdout.write(
                            f"[dry-run] Would apply festival penalty ({reason}): bill id={bill.id} "
                            f"member={member_label(member)} festival={fest}"
                        )'''

NEW2_FEST = '''            for bill in bills:
                member = bill.member

                # Owner fix (permanent, Oct 2026): self-heal penalty_amount
                # live from the festival's own config before deciding
                # anything below. See _apply_subscription_tariff_penalties
                # above and my_tasks/views.py for the full rationale.
                if not dry_run:
                    if fest.choice == "Amount":
                        live_penalty_amt = float(fest.penalty_amt or 0)
                    elif fest.choice == "Percentage":
                        live_penalty_amt = float(fest.tax_per_head or 0) * (float(fest.penalty_amt or 0) / 100)
                    else:
                        live_penalty_amt = float(bill.penalty_amount or 0)
                    if live_penalty_amt > 0 and float(bill.penalty_amount or 0) != live_penalty_amt:
                        bill.penalty_amount = live_penalty_amt
                        bill.save(update_fields=["penalty_amount"])

                needs_new_penalty = not bill.penalty
                # IMPORTANT: once penalty=True, amount_balance already has the
                # penalty folded in. Only compare total_bal_amt against
                # amount_balance itself here — NOT amount_balance + penalty_amount
                # again — or this re-fires (and re-charges) every run.
                needs_stale_fix = bill.penalty and float(bill.total_bal_amt) < float(bill.amount_balance)

                if needs_new_penalty or needs_stale_fix:
                    if dry_run:
                        reason = "new penalty" if needs_new_penalty else "stale total_bal_amt fix"
                        self.stdout.write(
                            f"[dry-run] Would apply festival penalty ({reason}): bill id={bill.id} "
                            f"member={member_label(member)} festival={fest}"
                        )'''

text2 = TARGET2.read_text()
missing2 = []
if OLD2_SUB not in text2:
    missing2.append("subscription-tariff block")
if OLD2_FEST not in text2:
    missing2.append("festival block")
if missing2:
    raise SystemExit(
        f"ABORTING -- could not find the expected {', '.join(missing2)} in "
        f"{TARGET2}. It may differ from what this patch expects. No "
        f"changes written to {TARGET2} (changes to {TARGET1} already "
        f"written above, if that part succeeded)."
    )

BACKUP2.write_text(text2)
text2 = text2.replace(OLD2_SUB, NEW2_SUB, 1)
text2 = text2.replace(OLD2_FEST, NEW2_FEST, 1)
TARGET2.write_text(text2)
print(f"Patched {TARGET2} (backup saved to {BACKUP2}).")

print()
print("Both penalty-application code paths now self-heal penalty_amount")
print("live from tariff/festival config before crediting anything.")
