import datetime

from django.core.management.base import BaseCommand
from django.db import transaction

from management.models import ManagementDetails
from festival.models import ADDFestivalDetails
from sub_tariff.models import ADDSubscriptionTariffDetails
from amount.models import PeoplesAmountDetails
from reports.models import TempleMemberReport


class Command(BaseCommand):
    help = (
        "Bulk-apply overdue festival, subscription-tariff, and death-tariff "
        "penalties for all members (scheduled safety net)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would be changed without writing anything to the DB.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        today = datetime.date.today()

        management_profiles = ManagementDetails.objects.all()
        if not management_profiles.exists():
            self.stdout.write(self.style.WARNING("No ManagementDetails profile found. Nothing to do."))
            return

        festival_count = 0
        tariff_count = 0
        death_count = 0
        for management in management_profiles:
            festival_count += self._apply_festival_penalties(management, today, dry_run)
            tariff_count += self._apply_subscription_tariff_penalties(management, today, dry_run)
            death_count += self._apply_death_penalties(management, today, dry_run)

        verb = "Would apply" if dry_run else "Applied"
        self.stdout.write(self.style.SUCCESS(
            f"{verb} penalties to {festival_count} festival bill(s), "
            f"{tariff_count} subscription-tariff bill(s), and "
            f"{death_count} death-tariff bill(s)."
        ))

    # ------------------------------------------------------------------ #
    # Festival penalties
    # ------------------------------------------------------------------ #
    def _apply_festival_penalties(self, management, today, dry_run):
        expired_festivals = ADDFestivalDetails.objects.filter(
            management_profile=management,
            end_date__lt=today,
            action=True,
        )

        changed = 0
        for fest in expired_festivals:
            # NOTE: unlike the original per-member helper, this covers every
            # unpaid bill tied to the festival, not just the first one found.
            bills = PeoplesAmountDetails.objects.filter(festival=fest, paid=False)

            for bill in bills:
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
                        )
                    else:
                        with transaction.atomic():
                            if needs_new_penalty:
                                bill.penalty = True
                                bill.penalty_applied_date = fest.end_date + datetime.timedelta(days=1)
                                bill.amount_balance = float(bill.amount_balance) + float(bill.penalty_amount)
                                bill.total_bal_amt = float(bill.total_bal_amt) + float(bill.penalty_amount)
                                bill.save()
                            else:
                                # Only reconcile total_bal_amt up to amount_balance;
                                # do NOT add penalty_amount again.
                                bill.total_bal_amt = float(bill.amount_balance)
                                bill.save()
                    changed += 1
                # else: already correctly penalized and reconciled — nothing to do,
                # but still ensure the ledger row exists below.

                # Idempotent ledger row — created once per member/festival pair.
                already_in_ledger = TempleMemberReport.objects.filter(
                    members=member,
                    festivals=fest,
                    type_choice="Festival Penalty",
                ).exists()
                if already_in_ledger:
                    continue

                if dry_run:
                    self.stdout.write(
                        f"[dry-run] Would create Festival Penalty ledger row for "
                        f"member={member_label(member)} festival={fest}"
                    )
                    continue

                last_rep = TempleMemberReport.objects.filter(members=member).order_by("reportdate", "pk").last()
                prev_bal = float(last_rep.balance_amt) if last_rep else 0
                TempleMemberReport.objects.create(
                    management_profile=management,
                    members=member,
                    festivals=fest,
                    reportdate=fest.end_date + datetime.timedelta(days=1),
                    credit_amt=bill.penalty_amount,
                    balance_amt=prev_bal + float(bill.penalty_amount),
                    type_choice="Festival Penalty",
                    created_by=bill.created_by,
                )

        return changed

    # ------------------------------------------------------------------ #
    # Subscription tariff penalties
    # ------------------------------------------------------------------ #
    def _apply_subscription_tariff_penalties(self, management, today, dry_run):
        expired_tariffs = ADDSubscriptionTariffDetails.objects.filter(
            management_profile=management,
            to_date__lt=today,
            action=True,
        )

        changed = 0
        for tariff in expired_tariffs:
            bills = PeoplesAmountDetails.objects.filter(sub_tariff=tariff, paid=False)

            for bill in bills:
                member = bill.member

                needs_new_penalty = not bill.penalty
                needs_stale_fix = bill.penalty and float(bill.total_bal_amt) < float(bill.amount_balance)

                if needs_new_penalty or needs_stale_fix:
                    if dry_run:
                        reason = "new penalty" if needs_new_penalty else "stale total_bal_amt fix"
                        self.stdout.write(
                            f"[dry-run] Would apply tariff penalty ({reason}): bill id={bill.id} "
                            f"member={member_label(member)} tariff={tariff}"
                        )
                    else:
                        with transaction.atomic():
                            if needs_new_penalty:
                                bill.penalty = True
                                bill.amount_balance = float(bill.amount_balance) + float(bill.penalty_amount)
                                bill.total_bal_amt = float(bill.total_bal_amt) + float(bill.penalty_amount)
                                bill.save()
                            else:
                                bill.total_bal_amt = float(bill.amount_balance)
                                bill.save()
                    changed += 1

                already_in_ledger = TempleMemberReport.objects.filter(
                    members=member,
                    sub_tariff=tariff,
                    type_choice="subscription Tariff Penalty",
                ).exists()
                if already_in_ledger:
                    continue

                if dry_run:
                    self.stdout.write(
                        f"[dry-run] Would create subscription Tariff Penalty ledger row for "
                        f"member={member_label(member)} tariff={tariff}"
                    )
                    continue

                last_rep = TempleMemberReport.objects.filter(members=member).order_by("reportdate", "pk").last()
                prev_bal = float(last_rep.balance_amt) if last_rep else 0
                TempleMemberReport.objects.create(
                    management_profile=management,
                    members=member,
                    sub_tariff=tariff,
                    reportdate=tariff.to_date + datetime.timedelta(days=1),
                    credit_amt=bill.penalty_amount,
                    balance_amt=prev_bal + float(bill.penalty_amount),
                    type_choice="subscription Tariff Penalty",
                    created_by=bill.created_by,
                )

        return changed

    # ------------------------------------------------------------------ #
    # Death tariff penalties
    # ------------------------------------------------------------------ #
    def _apply_death_penalties(self, management, today, dry_run):
        # NOTE: DeathDetails.member is a OneToOneField to the person who
        # DIED, not to the members who owe the death-tariff bill. The
        # bill-owing (tax-eligible, living) members are linked via
        # PeoplesAmountDetails.death, so we iterate bills and reach the
        # DeathDetails record through bill.death — not the other way
        # around. (This mirrors the fix applied to
        # family/views.py::_apply_death_penalty_for_member.)
        bills = PeoplesAmountDetails.objects.filter(
            management_profile=management,
            death__isnull=False,
            paid=False,
        ).select_related("death")

        changed = 0
        for bill in bills:
            death_rec = bill.death
            if not death_rec or not death_rec.action:
                continue
            if not death_rec.penalty_apply_date or death_rec.penalty_apply_date >= today:
                continue

            member = bill.member

            needs_new_penalty = not bill.penalty
            # Same reconciliation safety net as festivals/tariffs above:
            # only tops up total_bal_amt to match amount_balance, never
            # re-adds penalty_amount to an already-penalized bill.
            needs_stale_fix = bill.penalty and float(bill.total_bal_amt) < float(bill.amount_balance)

            if needs_new_penalty or needs_stale_fix:
                if dry_run:
                    reason = "new penalty" if needs_new_penalty else "stale total_bal_amt fix"
                    self.stdout.write(
                        f"[dry-run] Would apply death penalty ({reason}): bill id={bill.id} "
                        f"member={member_label(member)} death={death_rec}"
                    )
                else:
                    with transaction.atomic():
                        if needs_new_penalty:
                            if death_rec.pen_amt_type == "Percentage":
                                penalty_value = float(death_rec.tariff_peanalty or 0) * (
                                    float(death_rec.death_tariff_amt or 0) / 100
                                )
                            else:  # "Amount"
                                penalty_value = float(death_rec.tariff_peanalty or 0)

                            death_rec.calculated_tariff_peanalty_amt = penalty_value
                            death_rec.save()

                            bill.penalty = True
                            bill.penalty_amount = penalty_value
                            bill.amount_balance = float(bill.amount_balance) + penalty_value
                            bill.total_bal_amt = float(bill.total_bal_amt) + penalty_value
                            bill.save()
                        else:
                            bill.total_bal_amt = float(bill.amount_balance)
                            bill.save()
                changed += 1

            already_in_ledger = TempleMemberReport.objects.filter(
                members=member,
                death_tariff=death_rec,
                type_choice="Death Tariff Penalty",
            ).exists()
            if already_in_ledger:
                continue

            if dry_run:
                self.stdout.write(
                    f"[dry-run] Would create Death Tariff Penalty ledger row for "
                    f"member={member_label(member)} death={death_rec}"
                )
                continue

            last_rep = TempleMemberReport.objects.filter(members=member).order_by("reportdate", "pk").last()
            prev_bal = float(last_rep.balance_amt) if last_rep else 0
            TempleMemberReport.objects.create(
                management_profile=management,
                members=member,
                death_tariff=death_rec,
                reportdate=death_rec.penalty_apply_date + datetime.timedelta(days=1),
                credit_amt=bill.penalty_amount,
                balance_amt=prev_bal + float(bill.penalty_amount),
                type_choice="Death Tariff Penalty",
                created_by=bill.created_by,
            )

        return changed


def member_label(member):
    """Best-effort human-readable label for log lines; falls back to pk."""
    name = getattr(member, "member_name", None)
    return f"{member.pk} ({name})" if name else str(member.pk)