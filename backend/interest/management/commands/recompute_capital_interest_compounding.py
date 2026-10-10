"""
Management command: recompute_capital_interest_compounding

Retroactively rebuilds the UNPAID TAIL of "Interest with capital" loans
so it reflects monthly COMPOUNDING (each month's interest folded into
principal_balance before the next month's interest is computed on the
larger base), per the Oct 2026 owner rule.

Option A design (owner-confirmed, Oct 2026)
---------------------------------------------
A loan's history up to and including its LAST real payment (an
InterestPeopleReport row with debit_amt > 0 AND a non-null collection_id
-- i.e. an actual payment made through the Collection screen) is NEVER
touched. Those months were genuinely paid and are internally consistent
with the real money that was collected at the time; rewriting them under
compounding would retroactively manufacture a mismatch against real,
already-settled transactions.

Only the stretch of months AFTER a loan's last real payment (or, if it
has never had one, its entire history) is eligible for recompute --
that is the genuinely-missed, still-unpaid stretch the Oct 2026
compounding rule is meant to fix.

Because `principal_balance` was, under the old flat-interest code, only
ever changed by real payments (never by compounding, since compounding
did not exist yet), its CURRENT value already correctly reflects the
principal as of the last real payment. No reset is needed before
re-walking the tail.

Penalty rows (`type_choice="Penalty"`) and penalty_balance_amt /
penalty_amt are NEVER touched by this script, in any mode.

Usage
-----
    # Audit only -- see each loan's anchor date and unpaid-tail size.
    # Nothing is changed.
    python manage.py recompute_capital_interest_compounding --dry-run

    # Test on a single loan first (use its PeopleInterestDetails id,
    # not its intrest_no -- look it up with:
    #   SELECT id FROM interest_peopleinterestdetails WHERE intrest_no='INT7';
    python manage.py recompute_capital_interest_compounding --id=<pk> --dry-run
    python manage.py recompute_capital_interest_compounding --id=<pk>

    # Full batch, once you've spot-checked one loan and it looks right.
    python manage.py recompute_capital_interest_compounding

Requires the compounding patch already deployed in
interest/overdue_views.py (_apply_for_record folding each month's
interest into principal_balance for interest_category ==
"Interest with capital") -- this script re-walks the tail using that
same function, so it must already be live before you run this.
"""
from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet
from reports.models import InterestPeopleReport
from interest.overdue_views import _apply_for_record


class Command(BaseCommand):
    help = (
        "Retroactively recompute the UNPAID TAIL of 'Interest with capital' "
        "loans (everything after each loan's last real payment) so it "
        "reflects monthly compounding. Paid history before the last real "
        "payment, and all Penalty rows/balances, are never touched."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Audit only -- print each loan's anchor date (last real "
                 "payment, or loan start if none) and how many unpaid "
                 "months would be recomputed, without changing anything.",
        )
        parser.add_argument(
            "--id",
            type=int,
            default=None,
            help="Limit to a single interest record id (PeopleInterestDetails.id), "
                 "for testing on one loan before running the full batch.",
        )

    def _find_anchor(self, record):
        """Return (anchor_date, last_payment_row_or_None).

        anchor_date is the date after which everything is considered an
        unpaid tail eligible for compounding recompute: the loan's last
        real payment date, or its interest_date if it has never had one.
        """
        last_payment = (
            InterestPeopleReport.objects
            .filter(interest=record, debit_amt__gt=0, collection_id__isnull=False)
            .order_by("reportdate", "id")
            .last()
        )
        if last_payment:
            return last_payment.reportdate, last_payment
        return record.interest_date, None

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        single_id = options["id"]

        qs = PeopleInterestDetails.objects.filter(
            action=True,
            interest_category__iexact="Interest with capital",
        )
        if single_id:
            qs = qs.filter(id=single_id)

        plan = []  # list of dicts describing what will happen per loan

        for record in qs:
            try:
                bal = PeopleInterestBalanceSheet.objects.get(interest_id=record.id)
            except PeopleInterestBalanceSheet.DoesNotExist:
                plan.append({"record": record, "bal": None, "skip": "no balance sheet"})
                continue

            anchor_date, last_payment = self._find_anchor(record)

            tail_qs = InterestPeopleReport.objects.filter(
                interest=record,
                type_choice="Interest",
                reportdate__gt=anchor_date,
            )
            tail_count = tail_qs.count()

            if tail_count == 0:
                plan.append({
                    "record": record, "bal": bal, "skip": "no unpaid tail",
                    "anchor_date": anchor_date, "last_payment": last_payment,
                })
                continue

            old_tail_sum = sum(float(r.credit_amt or 0) for r in tail_qs)
            plan.append({
                "record": record, "bal": bal, "skip": None,
                "anchor_date": anchor_date, "last_payment": last_payment,
                "tail_count": tail_count, "old_tail_sum": old_tail_sum,
            })

        self.stdout.write(self.style.NOTICE(
            f"Found {qs.count()} active 'Interest with capital' loan(s)."
        ))

        to_recompute = [p for p in plan if p["skip"] is None]
        no_tail = [p for p in plan if p["skip"] == "no unpaid tail"]
        no_balsheet = [p for p in plan if p["skip"] == "no balance sheet"]

        self.stdout.write(self.style.SUCCESS(
            f"  Will recompute unpaid tail: {len(to_recompute)}"
        ))
        for p in to_recompute:
            r = p["record"]
            pay_desc = (
                f"last payment {p['anchor_date']}"
                if p["last_payment"] else
                f"no payments ever -- full history ({p['anchor_date']} onward)"
            )
            self.stdout.write(
                f"    - id={r.id}  {r.people_name}  intrest_no={r.intrest_no}  "
                f"{pay_desc}  tail_months={p['tail_count']}  "
                f"old_tail_interest_sum={p['old_tail_sum']:.2f}  "
                f"current principal_balance={float(p['bal'].principal_balance or 0):.2f}"
            )

        if no_tail:
            self.stdout.write(self.style.NOTICE(
                f"  Already up to date (no unpaid tail): {len(no_tail)}"
            ))
            for p in no_tail:
                r = p["record"]
                self.stdout.write(f"    - id={r.id}  {r.people_name}")

        if no_balsheet:
            self.stdout.write(self.style.WARNING(
                f"  Skipped (no balance sheet row found): {len(no_balsheet)}"
            ))
            for p in no_balsheet:
                r = p["record"]
                self.stdout.write(f"    - id={r.id}  {r.people_name}")

        if dry_run:
            self.stdout.write(self.style.NOTICE("Dry run -- nothing was changed."))
            return

        if not to_recompute:
            self.stdout.write(self.style.NOTICE("Nothing to recompute."))
            return

        self.stdout.write(self.style.NOTICE(
            f"Recomputing the unpaid tail for {len(to_recompute)} loan(s)..."
        ))

        for p in to_recompute:
            record = p["record"]
            bal = p["bal"]
            anchor_date = p["anchor_date"]
            old_tail_sum = p["old_tail_sum"]

            with transaction.atomic():
                # 1) Delete only the unpaid-tail "Interest" rows (strictly
                #    after the loan's last real payment, or after
                #    interest_date if it never had one). Everything up to
                #    and including that payment -- plus all Penalty,
                #    Initial, and Payment rows -- is left completely alone.
                InterestPeopleReport.objects.filter(
                    interest=record,
                    type_choice="Interest",
                    reportdate__gt=anchor_date,
                ).delete()

                # 2) Back out the tail's old flat-interest totals from the
                #    running balance-sheet fields. principal_balance is
                #    NOT reset -- its current value already correctly
                #    reflects the loan as of the last real payment, since
                #    the old code only ever moved it via real payments,
                #    never via compounding (compounding didn't exist yet).
                bal.refresh_from_db()
                bal.intrest_amt = max(0.0, float(bal.intrest_amt or 0) - old_tail_sum)
                bal.intrest_balance_amt = max(0.0, float(bal.intrest_balance_amt or 0) - old_tail_sum)
                bal.credit_amt = max(0.0, float(bal.credit_amt or 0) - old_tail_sum)
                bal.balance_amt = max(0.0, float(bal.balance_amt or 0) - old_tail_sum)
                bal.interest_apply_date = anchor_date
                bal.save()

                # 3) Re-walk forward from the anchor date to today using
                #    the already-deployed compounding logic in
                #    _apply_for_record -- this recreates the "Interest"
                #    rows month by month for just the unpaid tail, folding
                #    each month's charge into principal_balance before
                #    computing the next month's. Penalty logic inside
                #    _apply_for_record is unchanged and untouched.
                result = _apply_for_record(record)

            bal.refresh_from_db()
            self.stdout.write(self.style.SUCCESS(
                f"  id={record.id}  {record.people_name}: "
                f"{len(result.get('applied_months', []))} month(s) recomputed, "
                f"new principal_balance={float(bal.principal_balance):.2f}, "
                f"new intrest_balance_amt={float(bal.intrest_balance_amt):.2f}"
            ))

        self.stdout.write(self.style.SUCCESS("Done."))
