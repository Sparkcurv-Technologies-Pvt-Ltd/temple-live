from django.core.management.base import BaseCommand
from amount.models import PeoplesAmountDetails
import datetime


class Command(BaseCommand):
    help = "Backfill penalty_applied_date for existing penalized bills"

    def handle(self, *args, **options):
        rows = PeoplesAmountDetails.objects.filter(
            penalty=True, penalty_applied_date__isnull=True, festival__isnull=False
        )
        count = 0
        for bill in rows:
            bill.penalty_applied_date = bill.festival.end_date + datetime.timedelta(days=1)
            bill.save(update_fields=['penalty_applied_date'])
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Backfilled {count} rows"))