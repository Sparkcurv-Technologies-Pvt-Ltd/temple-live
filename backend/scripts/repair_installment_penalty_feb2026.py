"""
One-time data-repair script — Feb 2026 penalty hotfix.

Run ONCE on the live server AFTER deploying the code changes AND running
``python manage.py migrate balancesheet``.

What it does
------------
1. Recomputes ``PeopleInterestDetails.installment_date`` for every
   *Installment Interest* loan using the corrected ``_installment_delta``
   formula (1 unit of ``interest_period_type``, not
   ``interest_period × unit``).  The old formula produced dates 5-10
   years into the future for every loan, which is why the penalty
   walker never fired.
2. Invokes ``interest.overdue_views._apply_for_record`` on every active
   loan so previously-missed penalty rows (3 % × ``installment_amt`` per
   missed cycle) get appended to ``InterestPeopleReport`` and the
   corresponding ``penalty_amt / penalty_balance_amt / balance_amt``
   fields on ``PeopleInterestBalanceSheet`` are brought up-to-date.

Safety
------
- Idempotent — running it a second time is a no-op (guarded by
  ``InterestPeopleReport.exists()`` per due-date).
- Read-only for anything already correct — only writes when the
  computed value differs.
- Loans with ``interest_period = 0`` OR ``interest_period_type = None``
  are skipped (defensive; these are legacy open-ended records).

Usage
-----
    cd /path/to/backend
    python manage.py shell < scripts/repair_installment_penalty_feb2026.py
    #   -- OR --
    python scripts/repair_installment_penalty_feb2026.py
"""
import os
import sys

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "temple_proj.settings.settings")

# Allow running as a plain script from anywhere.
_here = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_here)  # /app/backend
if _root not in sys.path:
    sys.path.insert(0, _root)

django.setup()

from interest.models import PeopleInterestDetails  # noqa: E402
from interest.overdue_views import _apply_for_record, _installment_delta  # noqa: E402


def repair_installment_dates():
    """Recompute installment_date using the corrected delta formula."""
    recs = PeopleInterestDetails.objects.filter(
        interest_category="Installment Interest",
        interest_date__isnull=False,
    )
    fixed = 0
    skipped = 0
    for p in recs:
        if not p.interest_period_type:
            skipped += 1
            continue
        try:
            delta = _installment_delta(p)
        except Exception:
            skipped += 1
            continue
        paid_counts = int(p.paid_counts or 0)
        target = p.interest_date + (delta * (paid_counts + 1))
        if p.installment_date != target:
            p.installment_date = target
            p.save(update_fields=["installment_date"])
            fixed += 1
    print(f"[installment_date] Recomputed: {fixed}  Skipped: {skipped}")
    return fixed


def backfill_missing_penalty_rows():
    """Append missing Penalty / Interest rows via the idempotent engine."""
    active = PeopleInterestDetails.objects.filter(action=True)
    touched = 0
    total_penalty_added = 0.0
    errors = 0
    for p in active:
        try:
            res = _apply_for_record(p)
            months = res.get("applied_months") or []
            if months:
                touched += 1
                total_penalty_added += sum(
                    float(m.get("penalty", 0)) for m in months if "penalty" in m
                )
        except Exception as e:
            errors += 1
            print(f"  ! loan {p.id}: {e}")
    print(
        f"[penalty backfill] Loans touched: {touched}   "
        f"Total penalty added: Rs {total_penalty_added:,.2f}   "
        f"Errors: {errors}"
    )
    return touched, total_penalty_added


if __name__ == "__main__":
    print("=== Feb-2026 installment_date + penalty repair ===")
    repair_installment_dates()
    backfill_missing_penalty_rows()
    print("Done. Open Chit Fund -> Pending Amount -> View details to verify.")
