"""
One-off correction for the 27 production "Interest with capital" loans
(ids 286-313 minus any gaps) that each had exactly ONE erroneous Interest
row folded into principal_balance by the old day-5 compounding code on
2026-10-05, with zero real payments on any of them (confirmed via
check_real_payments.py). Safe to fully reset and rebuild each one with
the corrected day-20 code in overdue_views.py.
"""
from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet
from reports.models import InterestPeopleReport
from interest.overdue_views import _apply_for_record

IDS = [286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 297, 298, 299,
       300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313]

for rec_id in IDS:
    try:
        record = PeopleInterestDetails.objects.get(id=rec_id)
        bal = PeopleInterestBalanceSheet.objects.get(interest_id=rec_id)
    except (PeopleInterestDetails.DoesNotExist, PeopleInterestBalanceSheet.DoesNotExist):
        print(rec_id, "-> SKIPPED (not found)")
        continue

    # Keep the "Initial" row; remove only the erroneous Interest row(s).
    deleted, _ = InterestPeopleReport.objects.filter(
        interest=record, type_choice="Interest"
    ).delete()

    bal.principal_balance = record.principal_amt
    bal.principal_paid = 0
    bal.intrest_amt = 0
    bal.intrest_paid_amt = 0
    bal.intrest_balance_amt = 0
    bal.penalty_amt = 0
    bal.penalty_paid_amt = 0
    bal.penalty_balance_amt = 0
    bal.credit_amt = record.principal_amt
    bal.debit_amt = 0
    bal.balance_amt = record.principal_amt
    bal.interest_apply_date = None
    bal.paid = False
    bal.closed = False
    bal.discount = False
    bal.discount_amt = 0
    bal.save()

    result = _apply_for_record(record)
    bal.refresh_from_db()
    print(
        rec_id, record.people_name, "->",
        len(result.get("applied_months", [])), "months applied,",
        "principal_balance=", bal.principal_balance,
        "intrest_balance_amt=", bal.intrest_balance_amt,
    )
