import datetime
from interest.models import PeopleInterestDetails
from balancesheet.models import PeopleInterestBalanceSheet
from reports.models import InterestPeopleReport
from interest.overdue_views import _apply_for_record

for rec_id in [7, 286]:
    record = PeopleInterestDetails.objects.get(id=rec_id)
    bal = PeopleInterestBalanceSheet.objects.get(interest_id=rec_id)

    InterestPeopleReport.objects.filter(interest=record).delete()

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

    InterestPeopleReport.objects.create(
        management_profile=record.management_profile,
        interest=record,
        reportdate=record.interest_date,
        credit_amt=record.principal_amt,
        balance_amt=record.principal_amt,
        type_choice="Initial",
        created_by=record.created_by,
    )

    result = _apply_for_record(record)
    bal.refresh_from_db()
    print(rec_id, "->", len(result.get("applied_months", [])), "months applied",
          "principal_balance=", bal.principal_balance,
          "intrest_balance_amt=", bal.intrest_balance_amt)
