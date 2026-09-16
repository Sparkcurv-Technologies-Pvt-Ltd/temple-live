"""
Idempotent scheduler entry-point for periodic Interest + Penalty accrual.

Business logic lives in `interest.overdue_views._apply_for_record`, which
already implements the exact rules requested:

    * On day 5 of every month after `interest_date` → one Interest row.
    * On day 20 of the same month, if unpaid → one Penalty row.
    * Respects `interest_type_new` ("amount" | "percentage") and
      `penalty_type` ("amount" | "percentage").
    * Creates matching `InterestPeopleReport` rows (type_choice
      "Interest" / "Penalty").
    * Advances `PeopleInterestBalanceSheet.interest_apply_date` only up
      to periods actually due as of `today`, so running the command
      multiple times on the same day never double-applies.
    * Handles arbitrarily-old records — a 92-month-old untouched record
      will get all 92 periods applied in one run.

This command simply walks every active PeopleInterestDetails row and
calls the engine, so cron / django-apscheduler / any scheduler can hit
it daily.

Usage:
    python manage.py apply_periodic_interest_penalty
    python manage.py apply_periodic_interest_penalty --dry-run
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from interest.models import PeopleInterestDetails
from interest.overdue_views import _apply_for_record


class Command(BaseCommand):
    help = "Apply overdue Interest and Penalty rows to every active interest record."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Compute what would be applied but roll back the transaction.",
        )

    def handle(self, *args, **options):
        dry = options.get("dry_run", False)
        qs = PeopleInterestDetails.objects.filter(action=True)
        total_records = qs.count()
        total_months_applied = 0
        errors = []

        for record in qs.iterator(chunk_size=200):
            try:
                with transaction.atomic():
                    result = _apply_for_record(record)
                    applied_months = result.get("applied_months") or []
                    total_months_applied += len(applied_months)
                    if applied_months:
                        self.stdout.write(
                            f"  #{record.id} {record.people_name} ({record.interest_type}) "
                            f"→ {len(applied_months)} period(s) applied"
                        )
                    if dry:
                        transaction.set_rollback(True)
            except Exception as e:  # pragma: no cover - safety net
                errors.append({"id": record.id, "error": str(e)})
                self.stderr.write(f"  #{record.id} ERROR: {e}")

        summary = (
            f"Scanned {total_records} active interest records · "
            f"{total_months_applied} total period rows applied"
            f"{' (dry-run — rolled back)' if dry else ''}"
        )
        if errors:
            summary += f" · {len(errors)} record(s) errored"
        self.stdout.write(self.style.SUCCESS(summary))
