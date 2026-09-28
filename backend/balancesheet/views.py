from decimal import Decimal

from django.db import models as dj_models
from django.db.models import Sum
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from token_app.views import token_checking
from management.models import ManagementDetails, BankDetails
from .models import FundBalanceSheet
from .serializers import FundBalanceSheetSerializer
from income.models import ADDIncomeDetails, ADDIncomeCategory
from festival.models import ADDFestivalDetails
from expense.models import ADDExpenseDetails, ADDExpenseCategory
from amount.models import PeoplesAmountDetails, PeoplesJOININGAmountDetails, CashTransactionDetails
from collection.models import CollectionDetails
from sub_tariff.models import ADDSubscriptionTariffDetails
from marriage.models import MarriageDetails
from death.models import DeathDetails
from family.models import Member_Details
from rental.models import RentalAndLeaseDetails, MovableAssetsRents
from fund.models import FundGroupDetails
from reports.models import Report, ChitFundInterestOverallReport
from chit_fund.models import ChitFundsDetails
from interest.models import PeopleInterestDetails
import logging

logger = logging.getLogger("django")


# =============================================================================
# Common helpers
# =============================================================================

def authenticate(request):
    user = token_checking(request)
    if not user:
        return None, Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return None, Response({"message": "Not Authorized Please Contact Admin"},
                              status=status.HTTP_401_UNAUTHORIZED)
    return user, None


def get_management_or_error():
    management = ManagementDetails.objects.first()
    if not management:
        return None, Response({"message": "First Add Management Profile details"},
                              status=status.HTTP_406_NOT_ACCEPTABLE)
    return management, None


def can_view_balancesheet(user):
    return user.is_superuser or getattr(user, 'user_role', None) in ("User", "Admin")


def read_dates(data):
    """Returns (range_type, start_date, end_date) or raises KeyError / ValueError."""
    range_type = data['range_type']
    start_date = data['start_date']
    if range_type == "custom_date_range":
        end_date = data['end_date']
    elif range_type == "custom_date":
        end_date = start_date
    else:
        raise ValueError("range_type must be custom_date or custom_date_range")
    if not start_date or not end_date:
        raise ValueError("start_date / end_date is required")
    return range_type, start_date, end_date


def S(queryset, field='amount'):
    """Sum of a field, 0 when there are no rows."""
    return queryset.aggregate(total=Sum(field))['total'] or 0


def distinct_ids(queryset, field):
    return [v for v in queryset.values_list(field, flat=True).order_by().distinct() if v is not None]


def as_report_amount(value):
    """Same number type as Report.amount (Decimal or float) so sums never raise a TypeError."""
    field = Report._meta.get_field('amount')
    if isinstance(field, dj_models.FloatField):
        return float(value or 0)
    return Decimal(str(value or 0))


def management_opening_signed(management):
    """Temple opening balance from the Management profile: +Credit, -Debit, 0 if none."""
    amount = as_report_amount(management.opening_balance)
    if management.opening_balance_type == 'Credit':
        return amount
    if management.opening_balance_type == 'Debit':
        return -amount
    return as_report_amount(0)


def bank_opening_net(management):
    """Net of all bank opening balances (Addition - Reduction). Applies to every date."""
    banks = Report.objects.filter(management_profile=management, managee=True).exclude(banks=None)
    return S(banks.filter(type_choice="Addition")) - S(banks.filter(type_choice="Reduction"))


def collection_payment_type(collect):
    return collect.bank_name if collect.bank_link else collect.transaction_type


def rental_payment_type(bank_link):
    return bank_link.bank_name if bank_link else "Cash"


def collection_member(report):
    """Report -> (collection, people amount, member) or (None, None, None)."""
    collect = CollectionDetails.objects.filter(id=report.collection_id).first()
    if not collect:
        return None, None, None
    people = PeoplesAmountDetails.objects.filter(id=collect.amount_link_id).first()
    if not people:
        return None, None, None
    member = Member_Details.objects.filter(id=people.member_id).first()
    if not member:
        return None, None, None
    return collect, people, member


# =============================================================================
# Temple balance sheet sections
# =============================================================================

def opening_figures(management, before):
    """Opening balance for the period. `before` = all Reports dated before the start date.
    Returns (total_opening, bank_opening, cash_opening)."""
    normal = before.filter(mangebalancesheet=None, managee=False)
    incomes = normal.filter(type_choice="Addition")
    expenses = normal.filter(type_choice="Reduction")

    cash_tx = before.filter(mangebalancesheet=None).exclude(cash_transaction=None)
    deposit = S(cash_tx.filter(type_choice="Deposit").exclude(banks=None))
    withdraw = S(cash_tx.filter(type_choice="Withdraw").exclude(banks=None))
    borrow_cash = S(cash_tx.filter(type_choice="Borrow", banks=None))
    borrow_paid_cash = S(cash_tx.filter(type_choice="Borrow Paid", banks=None))
    borrow_bank = S(cash_tx.filter(type_choice="Borrow").exclude(banks=None))
    borrow_paid_bank = S(cash_tx.filter(type_choice="Borrow Paid").exclude(banks=None))
    loan = S(cash_tx.filter(type_choice="Loan").exclude(banks=None))
    loan_repay = S(cash_tx.filter(type_choice="Loan Repay").exclude(banks=None))

    opening = management_opening_signed(management)
    bank_open = bank_opening_net(management)

    total_opening = (opening + S(incomes) - S(expenses) + bank_open
                     + borrow_cash - borrow_paid_cash
                     + borrow_bank - borrow_paid_bank
                     + loan - loan_repay)
    bank_opening = (S(incomes.exclude(banks=None)) - S(expenses.exclude(banks=None)) + bank_open
                    + deposit - withdraw
                    + borrow_bank - borrow_paid_bank
                    + loan - loan_repay)
    cash_opening = (S(incomes.filter(banks=None)) - S(expenses.filter(banks=None)) + opening
                    - deposit + withdraw
                    + borrow_cash - borrow_paid_cash)
    return total_opening, bank_opening, cash_opening


def income_section(management, period, start, end):
    reports = (period.filter(type_choice="Addition").exclude(incomes=None)
               .exclude(incomes__income_subcategory="Chit Fund Income"))
    if not reports.exists():
        return None
    incomes = (ADDIncomeDetails.objects.exclude(income_subcategory="Chit Fund Income")
               .filter(management_profile=management, created_at__date__gte=start, created_at__date__lte=end))
    details = []
    for category_id in distinct_ids(incomes, 'category_id'):
        items = incomes.filter(category=category_id)
        category = ADDIncomeCategory.objects.filter(id=category_id).first()
        details.append({
            'name': category.category_name if category else '-',
            'amount': S(items, 'income_amt'),
            'details': [{'name': a.income_name, 'amount': a.income_amt,
                         'payment_type': a.bank_name if a.bank else a.transaction_type} for a in items],
            'id': category_id,
        })
    return {'income_details': details,
            'cash_amount': S(reports.filter(banks=None)),
            'bank_amount': S(reports.exclude(banks=None))}


def expense_section(management, period, start, end):
    reports = (period.filter(type_choice="Reduction").exclude(expenses=None)
               .exclude(expenses__expense_subcategory="Chit Fund Expense"))
    if not reports.exists():
        return None
    expenses = (ADDExpenseDetails.objects.exclude(expense_subcategory="Chit Fund Expense")
                .filter(management_profile=management, created_at__date__gte=start, created_at__date__lte=end))
    details = []
    for category_id in distinct_ids(expenses, 'category_id'):
        items = expenses.filter(category=category_id)
        category = ADDExpenseCategory.objects.filter(id=category_id).first()
        details.append({
            'name': category.category_name if category else '-',
            'amount': S(items, 'expense_amt'),
            'details': [{'name': a.expense_name, 'amount': a.expense_amt,
                         'payment_type': a.bank_name if a.bank else a.transaction_type} for a in items],
            'id': category_id,
        })
    return {'expense_details': details,
            'cash_amount': S(reports.filter(banks=None)),
            'bank_amount': S(reports.exclude(banks=None))}


def marriage_section(period):
    reports = period.filter(type_choice="Addition").exclude(marriage=None)
    ids = distinct_ids(reports, 'marriage_id')
    if not ids:
        return None
    out = []
    last_id = None
    for marriage_id in ids:
        marriage = MarriageDetails.objects.filter(id=marriage_id).first()
        if not marriage:
            continue
        last_id = marriage.id
        for amount in PeoplesAmountDetails.objects.filter(marriage=marriage):
            payment = CollectionDetails.objects.filter(amount_link=amount).first()
            row = {'name': f'{amount.member.member_name}/{amount.member.member_no}',
                   'total_amount': amount.amount,
                   'id': marriage.id}
            if payment:
                row['payment_type'] = collection_payment_type(payment)
            out.append(row)
    return {'amount': S(reports),
            'marriage_details': out,
            'cash_amount': S(reports.filter(banks=None)),
            'bank_amount': S(reports.exclude(banks=None)),
            'id': last_id}


def people_collection_section(period, fk_field, model, header, detailed_members=True):
    """Death tariff / festival / subscription tariff collections."""
    base = period.filter(type_choice="Addition", balance=False).exclude(**{fk_field: None})
    ids = distinct_ids(base, f'{fk_field}_id')
    if not ids:
        return None
    all_rows = period.filter(type_choice="Addition").exclude(**{fk_field: None})
    cash = S(all_rows.filter(banks=None))
    bank = S(all_rows.exclude(banks=None))

    out = []
    for obj_id in ids:
        obj = model.objects.filter(id=obj_id).first()
        if not obj:
            continue
        records = base.filter(**{f'{fk_field}_id': obj_id})
        members = []
        for record in records:
            collect, people, member = collection_member(record)
            if not member:
                continue
            if detailed_members:
                members.append({'name': f'{member.member_name}/{member.member_no}',
                                'total_amount': people.amount,
                                'mobile_number': member.member_mobile_number,
                                'payment_type': collection_payment_type(collect)})
            else:
                members.append({'name': member.member_name,
                                'amount': people.amount,
                                'payment_type': collection_payment_type(collect)})
        row = header(obj)
        row.update({'member_count': records.count(),
                    'total_amount': S(records),
                    'member_details': members,
                    'cash_amount': cash,
                    'bank_amount': bank,
                    'id': obj.id})
        out.append(row)
    return out


def rent_income_section(management, period, start, end):
    rent_advance = period.filter(type_choice="Addition", collection=None).exclude(rentsandlease=None)
    rent_payment = period.filter(type_choice="Addition").exclude(rentsandlease=None).exclude(collection=None)
    move_advance = period.filter(type_choice="Addition", collection=None).exclude(moveablerent=None)
    move_payment = period.filter(type_choice="Addition").exclude(moveablerent=None).exclude(collection=None)

    if not (rent_advance.exists() or rent_payment.exists() or move_advance.exists() or move_payment.exists()):
        return None

    collections = CollectionDetails.objects.filter(management_profile=management,
                                                   created_at__date__gte=start, created_at__date__lte=end)
    rows = []
    for report in rent_advance:
        rent = RentalAndLeaseDetails.objects.filter(id=report.rentsandlease_id).first()
        if rent:
            rows.append({'rent_no': f"Rent Advance - {rent.lease_rent_no}/{rent.asset_name}",
                         'amount': rent.initial_advance_amt,
                         'payment_type': rental_payment_type(rent.bank_link)})
    for rent_id in distinct_ids(rent_payment, 'rentsandlease_id'):
        rent = RentalAndLeaseDetails.objects.filter(id=rent_id).first()
        if rent:
            rows.append({'rent_no': f"Rent Payment - {rent.lease_rent_no}/{rent.asset_name}",
                         'amount': S(collections.filter(rentsandlease=rent)),
                         'payment_type': rental_payment_type(rent.bank_link)})
    for move_id in distinct_ids(move_advance, 'moveablerent_id'):
        move = MovableAssetsRents.objects.filter(id=move_id).first()
        if move:
            rows.append({'rent_no': f"Moveable-Rent Advance - {move.rent_no}",
                         'amount': move.advance_amt,
                         'payment_type': rental_payment_type(move.bank_link)})
    for move_id in distinct_ids(move_payment, 'moveablerent_id'):
        move = MovableAssetsRents.objects.filter(id=move_id).first()
        if move:
            rows.append({'rent_no': f"Moveable-Rent Payment - {move.rent_no}",
                         'amount': S(collections.filter(moveablerent=move)),
                         'payment_type': rental_payment_type(move.bank_link)})

    parts = (rent_advance, rent_payment, move_advance, move_payment)
    return {'rent_details': rows,
            'cash_amount': sum(S(q.filter(banks=None)) for q in parts),
            'bank_amount': sum(S(q.exclude(banks=None)) for q in parts)}


def rent_expense_section(period):
    rent_settle = period.filter(type_choice="Reduction", collection=None).exclude(rentsandlease=None)
    move_settle = period.filter(type_choice="Reduction").exclude(moveablerent=None).exclude(collection=None)
    if not (rent_settle.exists() or move_settle.exists()):
        return None

    rows = []
    for report in rent_settle:
        rent = RentalAndLeaseDetails.objects.filter(id=report.rentsandlease_id).first()
        if rent:
            rows.append({'rent_no': f'{rent.lease_rent_no}/{rent.asset_name}',
                         'amount': rent.advance_settlement_amt,
                         'payment_type': rental_payment_type(rent.settlement_bank_link)})
    for report in move_settle:
        move = MovableAssetsRents.objects.filter(id=report.moveablerent_id).first()
        if move:
            rows.append({'rent_no': f'{move.rent_no}', 'amount': move.settled_amount, 'payment_type': "Cash"})

    parts = (rent_settle, move_settle)
    return {'rent_details': rows,
            'cash_amount': sum(S(q.filter(banks=None)) for q in parts),
            'bank_amount': sum(S(q.exclude(banks=None)) for q in parts)}


def member_joining_section(management, period):
    reports = period.filter(type_choice="Addition", collection=None).exclude(join_amt=None)
    if not reports.exists():
        return None
    rows = []
    for report in reports:
        joining = PeoplesJOININGAmountDetails.objects.filter(management_profile=management,
                                                             id=report.join_amt_id).first()
        if joining:
            rows.append({'name': joining.member.member_name, 'amount': joining.amount, 'payment_type': "Cash"})
    return {'total_amount': S(reports), 'member_joining_details': rows, 'payment_type': "Cash"}


def balance_section(period):
    reports = period.filter(type_choice="Addition", balance=True).exclude(collection=None)
    member_ids = distinct_ids(reports, 'members_id')
    if not member_ids:
        return None
    rows = []
    for member_id in member_ids:
        member = Member_Details.objects.filter(id=member_id).first()
        if member:
            rows.append({'member_name': member.member_name,
                         'mobile_number': member.member_mobile_number,
                         'member_no': member.member_no,
                         'amount': S(reports.filter(members=member_id))})
    return {'name': "Balance",
            'amount': S(reports),
            'member_details': rows,
            'cash_amount': S(reports.filter(banks=None)),
            'bank_amount': S(reports.exclude(banks=None))}


def borrow_rows(queryset, payment_type):
    rows = []
    for member_id in distinct_ids(queryset.exclude(members=None), 'members_id'):
        member = Member_Details.objects.filter(id=member_id).first()
        if member:
            rows.append({'member_name': member.member_name,
                         'amount': S(queryset.filter(members=member_id)),
                         'payment_type': payment_type})
    for tx_id in distinct_ids(queryset.filter(members=None), 'cash_transaction_id'):
        tx = CashTransactionDetails.objects.filter(id=tx_id).first()
        if tx:
            rows.append({'member_name': tx.name, 'amount': tx.amount, 'payment_type': payment_type})
    return rows


def loan_rows(queryset):
    rows = []
    for bank_id in distinct_ids(queryset, 'banks_id'):
        bank = BankDetails.objects.filter(id=bank_id).first()
        rows.append({'bank_name': bank.bank_name if bank else '-',
                     'amount': S(queryset.filter(banks=bank_id))})
    return rows


def chit_investment_section(management, period, start, end):
    if not period.filter(type_choice="Reduction").exclude(chit_fund=None).exists():
        return None
    investments = (ChitFundInterestOverallReport.objects
                   .filter(management_profile=management, income_choice="Investment",
                           created_at__date__gte=start, created_at__date__lte=end)
                   .exclude(chitfund=None))
    out = []
    for chit_id in distinct_ids(investments, 'chitfund_id'):
        fund = ChitFundsDetails.objects.filter(id=chit_id).first()
        mgmt = investments.filter(chitfund=chit_id, managee=True, chitinvesters=None)
        details = []
        if mgmt.exists():
            details.append({'name': "Management", 'amount': S(mgmt)})
        out.append({'chitfund_name': fund.chit_name if fund else '-',
                    'details': details,
                    'total_amount': S(mgmt),
                    'id': chit_id})
    return out


def interest_principal_section(period):
    reports = period.filter(type_choice="Reduction").exclude(interest=None)
    if not reports.exists():
        return None
    return {'total_amount': S(reports),
            'details': [{'interest_name': r.interest.people_name, 'amount': r.amount} for r in reports]}


def interest_collection_section(period):
    reports = period.filter(type_choice="Addition").exclude(interest=None).exclude(collection=None)
    if not reports.exists():
        return None
    rows = []
    for interest_id in distinct_ids(reports, 'interest_id'):
        interest = PeopleInterestDetails.objects.filter(id=interest_id).first()
        rows.append({'interest_name': interest.intrest_no if interest else '-',
                     'people_name': (interest.people_name or '-') if interest else '-',
                     'interest_category': (interest.interest_category or '-') if interest else '-',
                     'interest_type': (interest.interest_type or '-') if interest else '-',
                     'amount': S(period.filter(type_choice="Addition", interest=interest_id))})
    return {'total_amount': S(reports), 'details': rows}


def chit_profit_section(period):
    reports = period.filter(type_choice="Addition").exclude(chit_fund=None)
    if not reports.exists():
        return None
    rows = []
    for chit_id in distinct_ids(reports, 'chit_fund_id'):
        fund = ChitFundsDetails.objects.filter(id=chit_id).first()
        rows.append({'name': fund.chit_name if fund else '-', 'amount': S(reports.filter(chit_fund=chit_id))})
    return {'total_amount': S(reports), 'details': rows}


def fund_section(period):
    special = (period.filter(type_choice="Addition", banks=None)
               .exclude(fund_m=None).exclude(fund_m__fund__fund_type="Normal"))
    normal = (period.filter(type_choice="Addition", banks=None, fund_m__fund__fund_type="Normal")
              .exclude(fund_lease=None))
    if not (special.exists() or normal.exists()):
        return None
    rows = []
    for report in special:
        group = report.fund_m
        if group and group.fund.fund_type in ("Fund 21", "Fund 20"):
            rows.append({'fund_name': f'{group.fund.fund_name}({group.fund.fund_type})', 'amount': report.amount})
    for group_id in distinct_ids(normal, 'fund_m_id'):
        group = FundGroupDetails.objects.filter(id=group_id).first()
        if group:
            rows.append({'fund_name': f'{group.fund.fund_name} ({group.fund.fund_type})',
                         'amount': S(normal.filter(fund_m=group_id))})
    return rows


def build_temple_balancesheet(management, range_type, start, end):
    reports = Report.objects.filter(management_profile=management)
    period = reports.filter(created_at__date__gte=start, created_at__date__lte=end)
    before = reports.filter(created_at__date__lt=start)

    credit = {}
    debit = {}

    # ---- Opening balance: ONE line.
    #   Management opening balance (Credit adds, Debit subtracts)
    #   + all income before the selected date
    #   - all expenses before the selected date
    #   Result > 0 -> Opening Balance on the Credit side
    #   Result < 0 -> Opening Balance on the Debit side
    total_opening, bank_opening, cash_opening = opening_figures(management, before)

    opening_credit = 0
    opening_debit = 0
    if total_opening > 0:
        credit['opening_balance'] = total_opening
        opening_credit = total_opening
    elif total_opening < 0:
        debit['opening_balance'] = abs(total_opening)
        opening_debit = abs(total_opening)

    # ---- Sections
    sections = [
        (credit, 'income', income_section(management, period, start, end)),
        (debit, 'expense', expense_section(management, period, start, end)),
        (credit, 'marriage', marriage_section(period)),
        (credit, 'death', people_collection_section(
            period, 'death_tariff', DeathDetails,
            lambda d: {'name': f'{d.death_no}/{d.member_name}', 'amount': d.death_tariff_amt})),
        (credit, 'festival', people_collection_section(
            period, 'festivals', ADDFestivalDetails,
            lambda f: {'name': f.festival_name, 'amount': f.tax_per_head})),
        (credit, 'tariff', people_collection_section(
            period, 'sub_tariff', ADDSubscriptionTariffDetails,
            lambda t: {'name': t.subscription_no}, detailed_members=False)),
        (credit, 'other_incomes', rent_income_section(management, period, start, end)),
        (debit, 'other_expense', rent_expense_section(period)),
        (credit, 'member_joining', member_joining_section(management, period)),
        (debit, 'Chit_fund_Investment', chit_investment_section(management, period, start, end)),
        (debit, 'Interest_Principal_amount', interest_principal_section(period)),
        (credit, 'Interest_Collection', interest_collection_section(period)),
        (credit, 'Chit_fund_Profit', chit_profit_section(period)),
        (credit, 'Fund', fund_section(period)),
    ]
    for side, key, value in sections:
        if value:
            side[key] = value

    balance = balance_section(period)
    balance_amount = S(period.filter(type_choice="Addition", balance=True).exclude(collection=None))

    # ---- Borrow
    cash_tx = period.exclude(cash_transaction=None)
    borrow_bank_q = cash_tx.filter(type_choice="Borrow").exclude(banks=None)
    borrow_cash_q = cash_tx.filter(type_choice="Borrow", banks=None)
    paid_bank_q = cash_tx.filter(type_choice="Borrow Paid").exclude(banks=None)
    paid_cash_q = cash_tx.filter(type_choice="Borrow Paid", banks=None)
    borrow_bank, borrow_cash = S(borrow_bank_q), S(borrow_cash_q)
    paid_bank, paid_cash = S(paid_bank_q), S(paid_cash_q)

    has_borrow = borrow_bank_q.exists() or borrow_cash_q.exists()
    has_paid = paid_bank_q.exists() or paid_cash_q.exists()
    if has_borrow:
        credit['borrow_income'] = {'member_details': borrow_rows(borrow_bank_q, "Bank") + borrow_rows(borrow_cash_q, "Cash"),
                                   'total_amount': borrow_bank + borrow_cash}
    if has_paid:
        debit['borrowpaid_amount'] = {'member_details': borrow_rows(paid_bank_q, "Bank") + borrow_rows(paid_cash_q, "Cash"),
                                      'total_amount': paid_bank + paid_cash}

    # ---- Deposit / withdraw
    withdraw = S(cash_tx.filter(type_choice="Withdraw").exclude(banks=None))
    deposit = S(cash_tx.filter(type_choice="Deposit").exclude(banks=None))

    # ---- Loan
    loan_q = cash_tx.filter(type_choice="Loan").exclude(banks=None)
    repay_q = cash_tx.filter(type_choice="Loan Repay").exclude(banks=None)
    loan, repay = S(loan_q), S(repay_q)
    if loan_q.exists():
        credit['loan_income'] = {'bank_details': loan_rows(loan_q), 'total_amount': loan}
    if repay_q.exists():
        debit['loan_repayment'] = {'bank_details': loan_rows(repay_q), 'total_amount': repay}

    # ---- Totals
    normal = period.filter(mangebalancesheet=None, managee=False)
    total_credit = S(normal.filter(type_choice="Addition", balance=False))
    total_debit = S(normal.filter(type_choice="Reduction", balance=False))
    credit_cash = S(normal.filter(type_choice="Addition", banks=None))
    credit_bank = S(normal.filter(type_choice="Addition").exclude(banks=None))
    debit_cash = S(normal.filter(type_choice="Reduction", banks=None))
    debit_bank = S(normal.filter(type_choice="Reduction").exclude(banks=None))

    result = {'Credit': credit, 'Debit': debit}
    result['total_credit_amount'] = (total_credit + balance_amount + loan + borrow_bank + borrow_cash
                                     + opening_credit)
    result['total_debit_amount'] = (total_debit + repay + paid_cash + paid_bank
                                    + opening_debit)
    result['opening_balance_type'] = management.opening_balance_type
    result['net_opening_balance'] = total_opening
    result['name'] = range_type
    result['start_date'] = start
    if range_type == "custom_date_range":
        result['end_date'] = end

    result['overall_bank_amount'] = (credit_bank - debit_bank + bank_opening - withdraw + deposit
                                     + loan - repay + borrow_bank - paid_bank)
    result['overall_cash_amount'] = abs(credit_cash - debit_cash + cash_opening + withdraw - deposit
                                        + borrow_cash - paid_cash)

    if loan_q.exists() or repay_q.exists():
        result['loan_details_bottom'] = {'loan_pending_amount': loan - repay}
    if has_borrow or has_paid:
        result['borrow_details_bottom'] = {'borrow_amount': (borrow_bank + borrow_cash) - (paid_bank + paid_cash)}

    cash_in = credit_cash + cash_opening + withdraw + borrow_cash
    cash_out = debit_cash + deposit + paid_cash
    if cash_in > cash_out:
        result['balance_type'] = "Credit"
        result['balance_amount'] = cash_in - cash_out
    elif cash_in < cash_out:
        result['balance_type'] = "Debit"
        result['balance_amount'] = cash_out - cash_in
    else:
        result['balance_type'] = ""
        result['balance_amount'] = 0

    if balance:
        result['balance'] = balance
    return result


# =============================================================================
# Chit fund balance sheet
# =============================================================================

def build_chitfund_balancesheet(management, range_type, start, end):
    chit = ChitFundInterestOverallReport.objects.filter(management_profile=management).exclude(chitfund=None)
    before = chit.filter(created_at__date__lt=start)
    period = chit.filter(created_at__date__gte=start, created_at__date__lte=end)
    chit_expenses = ADDExpenseDetails.objects.filter(management_profile=management,
                                                     expense_subcategory="Chit Fund Expense")
    chit_incomes = ADDIncomeDetails.objects.filter(management_profile=management,
                                                   income_subcategory="Chit Fund Income")

    credit = {}
    debit = {}

    # ---- Opening balance
    opening_in = (S(before.filter(income_choice="Investment"))
                  + S(before.filter(income_choice="Addition").exclude(interest=None))
                  + S(chit_incomes.filter(date__lt=start), 'income_amt'))
    opening_out = (S(before.filter(income_choice="Principal Given").exclude(interest=None))
                   + S(before.filter(income_choice="Distribution").exclude(chitdistribution=None))
                   + S(chit_expenses.filter(date__lt=start), 'expense_amt'))
    if opening_in > opening_out:
        credit['opening_balance'] = opening_in - opening_out
    elif opening_in < opening_out:
        debit['opening_balance'] = opening_out - opening_in

    # ---- Investment
    investments = period.filter(income_choice="Investment")
    invest_total = S(investments)
    if investments.exists():
        out = []
        for chit_id in distinct_ids(investments, 'chitfund_id'):
            fund = ChitFundsDetails.objects.filter(id=chit_id).first()
            fund_q = investments.filter(chitfund=chit_id)
            details = []
            mgmt = fund_q.filter(managee=True, chitinvesters=None)
            if mgmt.exists():
                details.append({'name': "Management", 'amount': S(mgmt)})
            investors = fund_q.filter(managee=False).exclude(chitinvesters=None)
            for investor_id in distinct_ids(investors, 'chitinvesters_id'):
                rows = investors.filter(chitinvesters_id=investor_id)
                details.append({'name': rows.first().chitinvesters.invester_name, 'amount': S(rows)})
            out.append({'chitfund_name': fund.chit_name if fund else '-',
                        'details': details,
                        'total_amount': S(fund_q),
                        'id': chit_id})
        credit['Chit_fund_Investment'] = out

    # ---- Profit distribution
    distribution = period.filter(income_choice="Distribution").exclude(chitdistribution=None)
    distribution_total = S(distribution)
    if distribution.exists():
        rows = []
        for chit_id in distinct_ids(distribution, 'chitfund_id'):
            fund = ChitFundsDetails.objects.filter(id=chit_id).first()
            rows.append({'name': fund.chit_name if fund else '-',
                         'amount': S(period.filter(income_choice="Distribution", chitfund=chit_id))})
        debit['Chit_fund_Profit_Distribution'] = {'total_amount': distribution_total, 'details': rows}

    # ---- Principal given
    given = period.filter(income_choice="Principal Given").exclude(interest=None)
    given_total = S(given)
    if given.exists():
        debit['Chit_fund_Interest_Given'] = {
            'total_amount': given_total,
            'details': [{'person_name': r.interest.people_name if r.interest else '-',
                         'chit_name': r.chitfund.chit_name if r.chitfund else '-',
                         'amount': r.amount} for r in given],
        }

    # ---- Collection
    collection = period.filter(income_choice="Addition").exclude(interest=None)
    collection_total = S(collection)
    if collection.exists():
        rows = []
        for chit_id in distinct_ids(collection, 'chitfund_id'):
            fund = ChitFundsDetails.objects.filter(id=chit_id).first()
            records = collection.filter(chitfund=chit_id)
            rows.append({'name': fund.chit_name if fund else '-',
                         'amount': S(period.filter(income_choice="Addition", chitfund=chit_id)),
                         'member_details': [{'person_name': r.interest.people_name if r.interest else '-',
                                             'amount': r.amount} for r in records]})
        credit['From_Collection'] = {'total_amount': collection_total, 'details': rows}

    # ---- Chit fund expense / income entered in Expense / Income
    expense_q = chit_expenses.filter(date__gte=start, date__lte=end)
    expense_total = Decimal(str(S(expense_q, 'expense_amt')))
    if expense_total:
        debit['Chit_Fund_Expense'] = {
            'total_amount': expense_total,
            'details': [{'id': e.id, 'category_name': e.category_name, 'chit_fund_name': e.chit_fund_name,
                         'chit_fund_id': e.chitt_fund_id, 'expense_name': e.expense_name,
                         'amount': e.expense_amt, 'date': e.date, 'payment_mode': e.payment_mode,
                         'transaction_type': e.transaction_type, 'bank_name': e.bank_name}
                        for e in expense_q],
        }

    income_q = chit_incomes.filter(date__gte=start, date__lte=end)
    income_total = Decimal(str(S(income_q, 'income_amt')))
    if income_total:
        credit['Chit_Fund_Income'] = {
            'total_amount': income_total,
            'details': [{'id': i.id, 'category_name': i.category_name, 'income_name': i.income_name,
                         'amount': i.income_amt, 'date': i.date, 'payment_mode': i.payment_mode,
                         'transaction_type': i.transaction_type, 'bank_name': i.bank_name}
                        for i in income_q],
        }

    result = {'Credit': credit, 'Debit': debit}
    opening_net = opening_in - opening_out
    result['total_credit_amount'] = (invest_total + collection_total + income_total
                                     + (opening_net if opening_net > 0 else 0))
    result['total_debit_amount'] = (given_total + distribution_total + expense_total
                                    + (abs(opening_net) if opening_net < 0 else 0))
    result['name'] = range_type
    result['start_date'] = start
    if range_type == "custom_date_range":
        result['end_date'] = end

    net = (invest_total + collection_total + opening_in - opening_out + income_total
           - given_total - distribution_total - expense_total)
    if net > 0:
        result['balance_amount'] = net
        result['balance_type'] = "Credit"
    elif net < 0:
        result['balance_amount'] = abs(net)
        result['balance_type'] = "Debit"
    else:
        result['balance_amount'] = 0
        result['balance_type'] = ""
    return result


# =============================================================================
# Views
# =============================================================================

@api_view(['GET'])
def collection_page_fund_view(request, pk):
    user, error = authenticate(request)
    if error:
        return error
    management, error = get_management_or_error()
    if error:
        return error

    funds = FundGroupDetails.objects.filter(pk=pk, management_profile=management).first()
    if not funds:
        return Response(status=status.HTTP_404_NOT_FOUND)

    fund_balsheet = FundBalanceSheet.objects.filter(management_profile=management, fund=funds)
    return Response(FundBalanceSheetSerializer(fund_balsheet, many=True).data, status=status.HTTP_200_OK)


def _balancesheet_request(request, builder):
    user, error = authenticate(request)
    if error:
        return error
    management, error = get_management_or_error()
    if error:
        return error

    if request.method != 'POST':
        return Response({"message": "Use POST with range_type and dates"},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)
    if not can_view_balancesheet(user):
        return Response({'message': "un-authenticate"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        range_type, start_date, end_date = read_dates(request.data)
    except KeyError as e:
        return Response({"message": f"{e.args[0]} is required"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(builder(management, range_type, start_date, end_date), status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def balancesheet_view(request):
    return _balancesheet_request(request, build_temple_balancesheet)


@api_view(['GET', 'POST'])
def balancesheet_chitfundview(request):
    return _balancesheet_request(request, build_chitfund_balancesheet)