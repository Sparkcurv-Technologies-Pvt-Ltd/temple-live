"""
Signal handlers for the ``interest`` app.

Owner rule (Feb 2026 — locked): whenever ``PeopleInterestDetails.paid_counts``
changes, keep the rolling ``installment_date`` pointer in lock-step so the
overdue-penalty walker stays accurate.

Rule
----
::

    installment_date  =  interest_date  +  (period_delta × (paid_counts + 1))

- ``paid_counts = 0``  ->  first upcoming due date  (1 cadence step after start)
- ``paid_counts = 1``  ->  second upcoming due date (2 steps after start)
- and so on

Scope
-----
Applies ONLY to loans where
``interest_type == 'Chit fund Interest'`` AND
``interest_category == 'Installment Interest'`` AND
``interest_date IS NOT NULL`` AND the cadence fields are populated.

This one signal replaces the need to edit every ``collection/views.py``
site that touches ``paid_counts`` (add, edit, delete). Any future write
path automatically gets the pointer updated for free.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PeopleInterestDetails


@receiver(post_save, sender=PeopleInterestDetails)
def sync_installment_date(sender, instance, created, update_fields, **kwargs):
    # Skip signal-driven writes that only touched installment_date itself
    # (prevents infinite recursion).
    if update_fields and set(update_fields) <= {"installment_date"}:
        return

    # Scope guard — only Chit-Fund Installment loans carry a pointer.
    if instance.interest_type != "Chit fund Interest":
        return
    if instance.interest_category != "Installment Interest":
        return
    if not instance.interest_date:
        return

    # Local import so the app can boot before overdue_views is loaded.
    try:
        from interest.overdue_views import _installment_delta
    except Exception:
        return

    delta = _installment_delta(instance)
    if not delta:
        return

    paid_counts = int(instance.paid_counts or 0)
    target = instance.interest_date + (delta * (paid_counts + 1))

    # CHIT_FUND_002 fix (Feb 2026 — v5.1, Days-type):
    # When a "Days" installment borrower pays late, the naive formula
    # `interest_date + delta × (paid_counts + 1)` sets installment_date
    # to a date ALREADY IN THE PAST (e.g. paid Sep5, target = Sep3).
    # This causes the penalty walker to traverse the gap and create a
    # penalty whose reportdate == today (the payment day).
    #
    # Fix: for Days loans, cap installment_date at a minimum of
    # `today + delta` (tomorrow) so the walker always starts in the
    # future right after a payment is recorded.  Weeks / Months are
    # UNCHANGED.
    ptype_check = (instance.interest_period_type or "").lower()
    if ptype_check in ("day", "days"):
        from datetime import date as _date_today
        _today = _date_today.today()
        if target <= _today:
            # Advance to tomorrow so the next-due-date is always
            # strictly in the future immediately after recording a payment.
            target = _today + delta

    if instance.installment_date == target:
        return

    # QuerySet.update() bypasses save() so we don't re-enter this signal.
    PeopleInterestDetails.objects.filter(pk=instance.pk).update(
        installment_date=target
    )

    # Mirror the new pointer onto the balance-sheet convenience column
    # ``due_date`` so downstream reports can query without a JOIN.
    _mirror_due_date_to_balancesheet(instance.pk, target)


@receiver(post_save, sender=PeopleInterestDetails)
def mirror_due_date(sender, instance, created, update_fields, **kwargs):
    """Keep ``PeopleInterestBalanceSheet.due_date`` == parent
    ``PeopleInterestDetails.installment_date``.

    Runs on every save (including the initial create) so the mirror
    column tracks any write to ``installment_date`` — signal-driven
    (``sync_installment_date``) or direct (edit paths, migrations,
    admin, tests).  The mirror is idempotent (``.exclude(due_date=…)``
    short-circuits) so running it twice is free.
    """
    _mirror_due_date_to_balancesheet(instance.pk, instance.installment_date)


def _mirror_due_date_to_balancesheet(interest_id, new_due_date):
    """Copy ``installment_date`` onto every ``PeopleInterestBalanceSheet``
    row linked to this loan. ``QuerySet.update()`` bypasses save() so no
    signals are re-triggered on the balancesheet side."""
    if not interest_id:
        return
    try:
        from balancesheet.models import PeopleInterestBalanceSheet
    except Exception:
        return
    PeopleInterestBalanceSheet.objects.filter(
        interest_id=interest_id
    ).exclude(due_date=new_due_date).update(due_date=new_due_date)
