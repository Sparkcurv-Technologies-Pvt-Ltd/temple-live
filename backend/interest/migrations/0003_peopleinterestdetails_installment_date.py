"""
Adds ``installment_date`` to ``PeopleInterestDetails`` and backfills the
pointer for existing Installment-Interest loans.

Backfill rule (matches how new records are initialised in
``add_interest_given_details``):

    installment_date  =  interest_date  +  (period_delta × (paid_counts + 1))

where ``period_delta`` is derived from ``interest_period`` and
``interest_period_type``. Non-installment loans keep ``installment_date =
NULL``.

Owner rule (Feb 2026 — locked). See interest/overdue_views.py and
collection/views.py for read/write callers.
"""

from django.db import migrations, models
from datetime import timedelta
from dateutil.relativedelta import relativedelta


def _forward_backfill(apps, schema_editor):
    PeopleInterestDetails = apps.get_model("interest", "PeopleInterestDetails")

    def _delta(record):
        p = int(record.interest_period or 0) or 1
        t = (record.interest_period_type or "").lower()
        if t == "days":
            return timedelta(days=p)
        if t == "week":
            return relativedelta(weeks=p)
        if t == "month":
            return relativedelta(months=p)
        return None

    qs = PeopleInterestDetails.objects.filter(
        interest_category="Installment Interest",
        installment_date__isnull=True,
    )
    for rec in qs.iterator():
        if not rec.interest_date:
            continue
        d = _delta(rec)
        if not d:
            continue
        # Pointer = one step past the LAST paid due date. paid_counts=0
        # means the very next due date after the loan start.
        rec.installment_date = rec.interest_date + (d * (int(rec.paid_counts or 0) + 1))
        rec.save(update_fields=["installment_date"])


def _reverse_noop(apps, schema_editor):
    """Reversing is a no-op — leave data as-is if migration is rolled back."""
    return


class Migration(migrations.Migration):

    dependencies = [
        ("interest", "0002_peopleinterestdetails_penalty_enabled"),
    ]

    operations = [
        migrations.AddField(
            model_name="peopleinterestdetails",
            name="installment_date",
            field=models.DateField(null=True, blank=True),
        ),
        migrations.RunPython(_forward_backfill, _reverse_noop),
    ]
