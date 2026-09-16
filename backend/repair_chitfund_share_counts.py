"""
One-time repair script for Chit Fund share counts.

Background
----------
Before the B1 fix, when an investor's settlement application was submitted
we did NOT reduce these three fields on ChitFundsDetails:
    total_share_count
    investers_share_count
    outer_invest_amount

So on historical chit funds the counts are still the pre-settlement totals.
That causes two follow-on problems on every subsequent collection:

  1. The profit divisor `member_count = total_share_count` is too big
     -> the shared_amount per share is too small.
  2. Because the settled investor is filtered out of the distribution
     loop (action=True filter), the settled investor's share of profit
     is not paid to anyone -> that money silently vanishes from the
     books.

What this script does
---------------------
For every ChitFundsDetails row it rebuilds the three counts from ground
truth (the ChitFundInvesters table):

    active_investors_share_count = SUM(share_count) WHERE action=True
    total_share_count            = management_share_count + active_investors_share_count
    outer_invest_amount          = SUM(investment_amt)  WHERE action=True

Investors with action=False (already settled) are excluded from the
totals - exactly as they should be, since they are out of the pool.

Usage
-----
    cd /opt/temple/app/backend && source venv/bin/activate
    python repair_chitfund_share_counts.py

Runs inside a DB transaction so nothing is committed if anything fails.
Prints a per-chit before/after report so you can eyeball the diff.
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "temple_proj.settings.settings")
django.setup()

from decimal import Decimal
from django.db import transaction
from django.db.models import Sum

from chit_fund.models import ChitFundsDetails, ChitFundInvesters


def repair():
    fixed = 0
    unchanged = 0

    print(f"{'Chit':<10} {'Field':<26} {'Before':>16}  {'After':>16}")
    print("-" * 74)

    with transaction.atomic():
        for chit in ChitFundsDetails.objects.all():
            active = ChitFundInvesters.objects.filter(chitt_fund=chit, action=True)
            new_investers = active.aggregate(t=Sum("share_count"))["t"] or 0
            new_invested = active.aggregate(t=Sum("investment_amt"))["t"] or Decimal("0")
            new_total = int(chit.management_share_count or 0) + int(new_investers)

            changed = False

            def show(field, old, new):
                nonlocal changed
                if str(old) != str(new):
                    changed = True
                    print(f"{chit.chit_no:<10} {field:<26} {str(old):>16}  {str(new):>16}")

            show("investers_share_count", chit.investers_share_count, new_investers)
            show("total_share_count",     chit.total_share_count,     new_total)
            show("outer_invest_amount",   chit.outer_invest_amount,   new_invested)

            if changed:
                chit.investers_share_count = new_investers
                chit.total_share_count = new_total
                chit.outer_invest_amount = new_invested
                chit.save(update_fields=[
                    "investers_share_count", "total_share_count", "outer_invest_amount",
                ])
                fixed += 1
            else:
                unchanged += 1

    print("-" * 74)
    print(f"Repaired {fixed} chit fund(s); {unchanged} already correct.")


if __name__ == "__main__":
    repair()
