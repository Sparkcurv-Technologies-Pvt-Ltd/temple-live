"""
One-time cleanup script for penalty-ledger duplicates.

Background
----------
Before this fix, the scheduled task in `my_tasks/views.py` inserted a new
TempleMemberReport row every time it ran, without checking for duplicates.
This resulted in multiple identical rows like:

    2026-07-05  subscription Tariff Penalty  Jul-2026  25.00
    2026-07-05  subscription Tariff Penalty  Jul-2026  25.00
    2026-07-05  subscription Tariff Penalty  Jul-2026  25.00
    2026-07-07  Festival Penalty             ABC       50.00
    2026-07-07  Festival Penalty             ABC       50.00

on the Balance Sheet ledger for the same (member + tariff/festival/death).

What this script does
---------------------
1. Groups every penalty ledger row by (member_id, sub_tariff | festivals |
   death_tariff, type_choice).
2. For every group with more than one row, keeps the OLDEST row and
   deletes the rest.
3. Recomputes the `balance_amt` column so it stays monotonically
   consistent per member after the deletes.
4. Optionally rolls back the extra penalty additions on
   PeoplesAmountDetails.total_bal_amt / amount_balance if it was
   over-applied.

Usage
-----
    cd /app/backend && source venv/bin/activate
    python manage.py shell < cleanup_penalty_duplicates.py

    OR

    python manage.py runscript cleanup_penalty_duplicates   # if you use django-extensions

The script runs inside a DB transaction, so if anything fails, nothing
is committed.
"""

import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "temple_proj.settings.settings")
django.setup()

from django.db import transaction
from django.db.models import Count

from reports.models import TempleMemberReport
from amount.models import PeoplesAmountDetails


def cleanup():
    penalty_types = (
        "subscription Tariff Penalty",
        "Festival Penalty",
        "Death Tariff Penalty",
    )

    total_removed = 0
    per_type = {}

    with transaction.atomic():
        # Track (member_id, extra_over_applied_penalty) so we can subtract
        # the inflated portion from PeoplesAmountDetails after cleanup.
        rollback_amounts = {}  # {(member_id, sub_tariff_id, festivals_id, death_tariff_id): extra_amount}

        for tc in penalty_types:
            qs = TempleMemberReport.objects.filter(type_choice=tc).order_by(
                "members_id",
                "sub_tariff_id",
                "festivals_id",
                "death_tariff_id",
                "id",
            )

            # Group manually by (member, tariff/fest/death)
            groups = {}
            for row in qs:
                key = (
                    row.members_id,
                    row.sub_tariff_id,
                    row.festivals_id,
                    row.death_tariff_id,
                )
                groups.setdefault(key, []).append(row)

            removed_here = 0
            for key, rows in groups.items():
                if len(rows) > 1:
                    to_delete = rows[1:]
                    extra = sum(float(r.credit_amt or 0) for r in to_delete)
                    rollback_amounts[key] = rollback_amounts.get(key, 0) + extra
                    TempleMemberReport.objects.filter(
                        id__in=[r.id for r in to_delete]
                    ).delete()
                    removed_here += len(to_delete)

            per_type[tc] = removed_here
            total_removed += removed_here

        # Roll back the inflated total_bal_amt / amount_balance on
        # PeoplesAmountDetails caused by the duplicate additions.
        print("\nRolling back inflated balances on PeoplesAmountDetails...")
        for (mid, stid, fid, dtid), extra in rollback_amounts.items():
            if extra <= 0:
                continue
            filt = {"member_id": mid}
            if stid:  filt["sub_tariff_id"] = stid
            if fid:   filt["festival_id"] = fid
            if dtid:  filt["death_id"] = dtid
            p = PeoplesAmountDetails.objects.filter(**filt).first()
            if p:
                p.total_bal_amt  = max(0.0, float(p.total_bal_amt or 0)  - extra)
                p.amount_balance = max(0.0, float(p.amount_balance or 0) - extra)
                p.save(update_fields=["total_bal_amt", "amount_balance"])

        # Recompute balance_amt column, per member, in the ORDER the
        # rows were originally created (id).  Debit reduces balance,
        # credit increases it.
        print("\nRecomputing balance_amt per member...")
        member_ids = TempleMemberReport.objects.values_list(
            "members_id", flat=True
        ).distinct()

        for mid in member_ids:
            running = 0.0
            rows = TempleMemberReport.objects.filter(members_id=mid).order_by("id")
            for r in rows:
                running += float(r.credit_amt or 0)
                running -= float(r.debit_amt or 0)
                if float(r.balance_amt or 0) != running:
                    r.balance_amt = running
                    r.save(update_fields=["balance_amt"])

    print("\n" + "=" * 60)
    print("Cleanup complete.")
    for tc, n in per_type.items():
        print(f"  {tc:35s} : removed {n} duplicate rows")
    print(f"  {'TOTAL':35s} : removed {total_removed} duplicate rows")
    print("=" * 60)


if __name__ == "__main__":
    cleanup()
