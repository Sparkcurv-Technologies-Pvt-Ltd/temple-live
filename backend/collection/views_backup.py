from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import CollectionDetailsSerializer
from .models import CollectionDetails
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from family.models import Member_Details
from amount.models import PeoplesAmountDetails
from permisions.models import Permisions
from fund.models import ADDFundDetails
from fund.serializers import ADDFundDetailsSerializer
from festival.models import ADDFestivalDetails
from festival.serializers import ADDFestivalDetailsSerializer
from rental.models import RentalAndLeaseDetails
from rental.serializers import RentalAndLeaseDetailsSerializer
from chit_fund.models import ChitFundsDetails
from chit_fund.serializers import ChitFundsDetailsSerializer
from death.models import DeathDetails
from death.serializers import DeathDetailsSerializer
from fund.models import FundGroupDetails
from fund.serializers import FundGroupDetailsSerializer
from balancesheet.models import RentalBalanceSheet, FundBalanceSheet, FundMembersBalanceSheet, \
    PeopleInterestBalanceSheet
from rental.serializers import Rental_serializers
from family.serializers import member_DetailsSerializer
from amount.serializers import PeoplesAmountDetailsSerializer
from datetime import date, timedelta, datetime
import calendar
from interest.models import PeopleInterestDetails
from interest.serializers import PeopleInterestBalanceDetailsSerializer

from dateutil.relativedelta import relativedelta
from treasure.models import ManagementTreasure
from balancesheet.serializers import FundBalanceSheetSerializer, FundMembersBalanceSheetSerializer, \
    RentalBalanceSheetSerializer, PeopleInterestBalanceSheetSerializer
from marriage.models import MarriageDetails

from rental.models import MovableAssetsRents
from reports.models import Report
from rental.serializers import MovableAssetsRentsSerializer
from balancesheet.models import MoveableRentBalanceSheet
from balancesheet.serializers import MoveableRentBalanceSheetSerializer
from rental.models import MovableAssetsRentTable, MoveableAssetDetails

from user.serializers import UserSerializer, RejinUserSerializer78
from amount.serializers import PeoplesAmount123DetailsSerializer
from management.models import BankDetails
from reports.models import TempleMemberReport
from income.models import ADDIncomeDetails
from expense.models import ADDExpenseDetails
from fund.models import FundMemberDetailss
from fund.serializers import FundMemberDetailssSerializer
from reports.models import ChitFundInterestOverallReport
from reports.models import InterestPeopleReport
from chit_fund.models import ChitFundInvesters
from interest.serializers import PeopleInterestDetailsSerializer
from sub_tariff.models import ADDSubscriptionTariffDetails
from sub_tariff.serializers import ADDSubscriptionTariffDetailseSerializer
from chit_fund.serializers import ChitFundsDetailssSerializer
from decimal import Decimal


def _installment_expected_count(record, today):
    """How many installments the borrower should have paid by the END of
    today's current period (day / week / month), given the loan's
    ``interest_period_type`` cadence.

    Owner rule (Feb 2026 — QA COLLECTIONS_002 v2): a borrower must appear
    in the ``Choose Person`` dropdown WHENEVER they are behind schedule
    for the CURRENT period, not just once the strict "next due date"
    has arrived. Concretely:

    - **Day**: expected count grows by 1 each calendar day since
      ``interest_date`` (inclusive).
    - **Week**: rolling 7-day windows from ``interest_date`` (matches the
      penalty engine's ``_installment_delta = weeks=1``). Week 1 covers
      day 0-6, week 2 day 7-13, etc.
    - **Month**: calendar-month arithmetic — every calendar-month
      transition after ``interest_date`` bumps the expected count by 1.

    Capped at ``interest_period`` (total installments) so borrowers whose
    loan is finished naturally drop off. Returns 0 if the loan has not
    yet started (today < interest_date).
    """
    start = record.interest_date
    if not start:
        return 0
    if today < start:
        return 0

    ptype = (record.interest_period_type or "month").lower()
    if ptype in ("day", "days"):
        expected = (today - start).days + 1
    elif ptype in ("week", "weeks"):
        expected = ((today - start).days // 7) + 1
    else:  # month / months / anything else
        expected = (today.year - start.year) * 12 + (today.month - start.month) + 1

    total = 0
    try:
        total = int(record.interest_period or 0)
    except (TypeError, ValueError):
        total = 0
    if total > 0:
        expected = min(expected, total)
    return max(0, expected)



@api_view(['GET', 'POST'])
def add_collection_details(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':
        print('my glad')
        print(request.data)
        if get_role == "User" or get_role == "Admin" or rejin.is_superuser == True:
            serializer876 = CollectionDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                if request.data['collection_category'] == "Moveable Rent":
                    if request.data['moveable_asset_payment'] == "Paid":
                        new = MoveableRentBalanceSheet.objects.filter(
                            moveablerent_id=request.data['moveablerent']).first()
                        new_asset = MovableAssetsRents.objects.filter(id=request.data['moveablerent']).first()
                        if new.balance_amt < new_asset.advance_amt:
                            bal = float(new_asset.advance_amt) - float(new.balance_amt)
                            manage_treasure = ManagementTreasure.objects.filter(management_profile=management)
                            if manage_treasure:
                                manage_treasure_get = ManagementTreasure.objects.get(management_profile=management)
                                if (float(manage_treasure_get.cash_in_hand) - float(
                                        manage_treasure_get.expence_amt)) < float(bal):
                                    return Response(
                                        {'message': 'Due to less amount in cash in hand ,Can not pay Amount to member'},
                                        status=status.HTTP_226_IM_USED)


                    else:
                        festival_new = MoveableRentBalanceSheet.objects.filter(
                            moveablerent=request.data['moveablerent'], management_profile=management).first()
                        if festival_new.balance_amt <= 0:
                            return Response({'message': 'Collection Amount already added for this moveable rent'},
                                            status=status.HTTP_226_IM_USED)

                elif request.data['collection_category'] == "Festival":
                    festival_new = PeoplesAmountDetails.objects.filter(festival=request.data['festivals'],
                                                                       member=request.data['member'],
                                                                       management_profile=management, paid=True)
                    if festival_new:
                        return Response({'message': 'Collection Amount already added for this member'},
                                        status=status.HTTP_226_IM_USED)

                elif request.data['collection_category'] == "Marriage":
                    festival_new = PeoplesAmountDetails.objects.filter(id=request.data['amount_link'], paid=True)
                    if festival_new:
                        return Response({'message': 'Collection Amount already added for this member'},
                                        status=status.HTTP_226_IM_USED)

                elif request.data['collection_category'] == "Subscription Tariff":
                    festival_new = PeoplesAmountDetails.objects.filter(sub_tariff=request.data['sub_tariff'],
                                                                       member=request.data['member'],
                                                                       management_profile=management, paid=True)

                    if festival_new:
                        return Response({'message': 'Collection Amount already added for this member'},
                                        status=status.HTTP_226_IM_USED)
                elif request.data['collection_category'] == "Death Tariff":
                    festival_new = PeoplesAmountDetails.objects.filter(death=request.data['death_tariff'],
                                                                       member=request.data['member'],
                                                                       management_profile=management, paid=True)
                    if festival_new:
                        return Response({'message': 'Collection Amount already added for this member'},
                                        status=status.HTTP_226_IM_USED)
                elif request.data['collection_category'] == "Rent":
                    festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=request.data['rentsandlease'],
                                                                     rental_new_amt__rent=True,
                                                                     management_profile=management).first()

                    if festival_new.balance_amt <= 0:
                        return Response({'message': 'Collection Amount already added for this rent'},
                                        status=status.HTTP_226_IM_USED)
                elif request.data['collection_category'] == "Lease":
                    festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=request.data['rentsandlease'],
                                                                     rental_new_amt__rent=False,
                                                                     management_profile=management).first()
                    if festival_new.balance_amt <= 0:
                        return Response({'message': 'Collection Amount already added for this lease'},
                                        status=status.HTTP_226_IM_USED)

                elif request.data['collection_category'] == "Fund":
                    festival_new = FundMembersBalanceSheet.objects.filter(fund=request.data['funds'],
                                                                          fund_m=request.data['fund_member'],
                                                                          management_profile=management).first()
                    if festival_new.balance_amt <= 0:
                        return Response({'message': 'Collection Amount already added for this lease'},
                                        status=status.HTTP_226_IM_USED)
                # elif request.data['collection_category'] =="Management Interest":
                #     festival_new=PeopleInterestBalanceSheet.objects.filter(interest=request.data['interest'],interest__interest_type="Management Interest",management_profile=management).first()
                #     if festival_new.balance_amt <=0 :
                #         return Response({'message':'Collection Amount already added for this lease'},status=status.HTTP_226_IM_USED)
                elif request.data['collection_category'] == "Chit Interest":
                    festival_new = PeopleInterestBalanceSheet.objects.filter(interest=request.data['interest'],
                                                                             interest__interest_type="Chit fund Interest",
                                                                             management_profile=management).first()
                    if festival_new.balance_amt <= 0:
                        return Response({'message': 'Collection Amount already added for this lease'},
                                        status=status.HTTP_226_IM_USED)

                temp_family = serializer876.save()
                temp_family.created_by = rejin.id
                if get_role == "User" or get_role == "Admin":
                    user_objectss = User.objects.filter(id=rejin.id).first()
                    temp_family.bill_by_name = user_objectss.name
                    temp_family.save()
                else:
                    temp_family.bill_by_name = 'superuser'
                    temp_family.save()
                temp_family.management_profile = management
                temp_family.save()
                manage = ManagementTreasure.objects.filter(management_profile=management)
                if manage:
                    manage_get = ManagementTreasure.objects.get(management_profile=management)
                    if temp_family.collection_category != "Moveable Rent" and temp_family.collection_category != "Fund" and temp_family.collection_category != "Chit Interest":
                        if temp_family.bank_link != None:
                            manage_get.bank_amt = float(manage_get.bank_amt) + float(temp_family.amount)
                            manage_get.save()
                            bank_obj = BankDetails.objects.filter(id=temp_family.bank_link.id).first()
                            bank_obj.credit_amt = float(bank_obj.credit_amt) + float(temp_family.amount)
                            bank_obj.save()
                        else:
                            if temp_family.collection_category == "Management Interest":
                                manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(
                                    temp_family.amount) + float(temp_family.interst_amount) + float(
                                    temp_family.penalty_amount)
                                manage_get.save()
                            else:
                                manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(temp_family.amount)
                                manage_get.save()

                if temp_family.collection_category == "Festival":
                    festival = PeoplesAmountDetails.objects.filter(festival=temp_family.festivals,
                                                                   member=temp_family.member,
                                                                   management_profile=management)
                    if festival:
                        festival_get = PeoplesAmountDetails.objects.get(festival=temp_family.festivals,
                                                                        member=temp_family.member,
                                                                        management_profile=management)
                        festival_get.total_bal_amt = float(festival_get.total_bal_amt) - float(temp_family.amount)
                        festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                        festival_get.save()
                        festival_get.paid = True
                        festival_get.save()

                        temp_family.amount_link = festival_get
                        temp_family.save()
                        member_obj = Member_Details.objects.filter(id=festival_get.member.id).first()
                        temp_family.mobile_number = member_obj.member_mobile_number
                        temp_family.save()
                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family,
                                              members=temp_family.member, amount=temp_family.amount,
                                              festivals=temp_family.festivals, banks=temp_family.bank_link)

                elif temp_family.collection_category == "Marriage":
                    festival_get = PeoplesAmountDetails.objects.filter(id=temp_family.amount_link.id)

                    if festival_get:
                        festival_get = PeoplesAmountDetails.objects.get(id=temp_family.amount_link.id)
                        festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                        festival_get.total_bal_amt = float(festival_get.total_bal_amt) - float(temp_family.amount)

                        festival_get.save()
                        festival_get.paid = True
                        festival_get.save()
                        member_obj = Member_Details.objects.filter(id=festival_get.member.id).first()
                        temp_family.member_name = member_obj.member_name
                        temp_family.mobile_number = member_obj.member_mobile_number
                        temp_family.member_id = member_obj.id
                        temp_family.save()
                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family,
                                              members=temp_family.member, amount=temp_family.amount,
                                              marriage=temp_family.marriage, banks=temp_family.bank_link)

                elif temp_family.collection_category == "Death Tariff":
                    festival = PeoplesAmountDetails.objects.filter(death=temp_family.death_tariff,
                                                                   member=temp_family.member,
                                                                   management_profile=management)
                    if festival:
                        festival_get = PeoplesAmountDetails.objects.get(death=temp_family.death_tariff,
                                                                        member=temp_family.member,
                                                                        management_profile=management)
                        # festival_get.amount_balance = float(festival_get.amount_balance)-float(temp_family.amount)
                        festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                        festival_get.total_bal_amt = float(festival_get.total_bal_amt) - float(temp_family.amount)

                        festival_get.save()
                        temp_family.amount_link = festival_get
                        temp_family.save()
                        festival_get.paid = True
                        festival_get.save()

                        member_obj = Member_Details.objects.filter(id=festival_get.member.id).first()
                        temp_family.member_name = member_obj.member_name
                        temp_family.member_id = member_obj.id

                        temp_family.mobile_number = member_obj.member_mobile_number
                        temp_family.save()
                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family,
                                              members=temp_family.member, amount=temp_family.amount,
                                              death_tariff=temp_family.death_tariff, banks=temp_family.bank_link)

                elif temp_family.collection_category == "Subscription Tariff":
                    festival = PeoplesAmountDetails.objects.filter(sub_tariff=temp_family.sub_tariff,
                                                                   member=temp_family.member,
                                                                   management_profile=management)
                    if festival:
                        festival_get = PeoplesAmountDetails.objects.get(sub_tariff=temp_family.sub_tariff,
                                                                        member=temp_family.member,
                                                                        management_profile=management)
                        if request.data['present'] != True:
                            # festival_get.amount_balance =float(festival_get.amount_balance)+float(festival_get.exception_amount)
                            festival_get.total_bal_amt = float(festival_get.total_bal_amt) + float(
                                festival_get.exception_amount)

                            festival_get.save()
                        # festival_get.amount_balance =float(festival_get.amount_balance)- float(temp_family.amount)
                        festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                        festival_get.total_bal_amt = float(festival_get.total_bal_amt) - float(temp_family.amount)

                        festival_get.save()
                        festival_get.paid = True
                        festival_get.save()
                        if request.data['present'] != True:
                            festival_get.exception = True
                            festival_get.save()
                        temp_family.amount_link = festival_get
                        temp_family.save()
                        sub_obj = ADDSubscriptionTariffDetails.objects.filter(id=temp_family.sub_tariff.id).first()
                        temp_family.sub_tariff_no = sub_obj.subscription_no
                        temp_family.save()
                        member_obj = Member_Details.objects.filter(id=festival_get.member.id).first()
                        temp_family.mobile_number = member_obj.member_mobile_number
                        temp_family.member_name = member_obj.member_name

                        temp_family.save()
                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family,
                                              members=temp_family.member, amount=temp_family.amount,
                                              sub_tariff=temp_family.sub_tariff, banks=temp_family.bank_link)

                elif temp_family.collection_category == "Rent":
                    festival = RentalBalanceSheet.objects.filter(rental_new_amt=temp_family.rentsandlease,
                                                                 rental_new_amt__rent=True,
                                                                 management_profile=management)
                    print(festival)
                    if festival:
                        festival_get = RentalBalanceSheet.objects.get(rental_new_amt=temp_family.rentsandlease,
                                                                      rental_new_amt__rent=True,
                                                                      management_profile=management)
                        # festival_get.credit_amt = float(festival_get.credit_amt)-float(temp_family.amount)
                        festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                        festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)
                        # festival_get.paid=True
                        festival_get.save()
                        rent = RentalAndLeaseDetails.objects.filter(id=temp_family.rentsandlease.id).first()
                        temp_family.member_name = rent.tenat_name
                        temp_family.member = rent.tenat_member
                        temp_family.mobile_number = rent.tenat_mobile
                        temp_family.save()

                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family,
                                              members=temp_family.member, amount=temp_family.amount, rentsandlease=rent,
                                              banks=temp_family.bank_link)


                elif temp_family.collection_category == "Lease":
                    festival = RentalBalanceSheet.objects.filter(rental_new_amt=temp_family.rentsandlease,
                                                                 rental_new_amt__rent=False,
                                                                 management_profile=management)
                    if festival:
                        festival_get = RentalBalanceSheet.objects.get(rental_new_amt=temp_family.rentsandlease,
                                                                      rental_new_amt__rent=False,
                                                                      management_profile=management)
                        # festival_get.credit_amt = float(festival_get.credit_amt)- float(temp_family.amount)
                        festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                        festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)
                        festival_get.save()
                        rent = RentalAndLeaseDetails.objects.filter(id=temp_family.rentsandlease.id).first()
                        temp_family.member_name = rent.tenat_name
                        temp_family.mobile_number = rent.tenat_mobile
                        temp_family.member = rent.tenat_member
                        temp_family.save()

                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family,
                                              members=temp_family.member, amount=temp_family.amount, rentsandlease=rent,
                                              banks=temp_family.bank_link)

                elif temp_family.collection_category == "Fund":
                    festival = FundMembersBalanceSheet.objects.filter(fund=temp_family.funds,
                                                                      fund_m=temp_family.fund_member,
                                                                      management_profile=management)
                    print(festival)
                    if festival:
                        festival_get = FundMembersBalanceSheet.objects.get(fund=temp_family.funds,
                                                                           fund_m=temp_family.fund_member,
                                                                           management_profile=management)

                        # festival_get.credit_amt = float(festival_get.credit_amt)-float(temp_family.amount)
                        festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                        festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                        festival_get.save()
                        fund_grp = FundGroupDetails.objects.filter(id=temp_family.funds.id).first()
                        fund_grp.cash_available_amount = float(fund_grp.cash_available_amount) + float(
                            temp_family.amount)
                        fund_grp.total_collected_amount = float(fund_grp.total_collected_amount) + float(
                            temp_family.amount)
                        fund_grp.save()

                elif temp_family.collection_category == "Management Interest":
                    festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                         interest__interest_type="Management Interest",
                                                                         management_profile=management)
                    if festival:
                        interest_obj = PeopleInterestDetails.objects.filter(id=temp_family.interest.id).first()
                        festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                              interest__interest_type="Management Interest",
                                                                              management_profile=management)
                        if temp_family.interest_principle == True and temp_family.interest_field == False:
                            print(float(temp_family.amount))
                            print(float(temp_family.discount_amount))
                            print(festival_get.principal_paid)

                            # Feb 2026 owner rule — WAIVER mode.
                            # ``discount_amount`` is a bookkept waiver:
                            # the borrower pays ``amount`` in cash, but
                            # the DEBT drops by ``amount + discount``
                            # (the discount is treated as if paid).
                            _discount = float(temp_family.discount_amount or 0)
                            _pay = float(temp_family.amount or 0)
                            _settled = _pay + _discount

                            festival_get.principal_paid = float(festival_get.principal_paid) + _settled
                            print(festival_get.principal_paid)

                            # Clamp the running balances at 0 – a payment
                            # that overshoots must NOT leave a negative on
                            # the ledger (per operator business rule and
                            # TC_TEMPLE_INTEREST_001).
                            festival_get.principal_balance = max(
                                0.0,
                                float(festival_get.principal_balance) - _settled,
                            )
                            festival_get.balance_amt = max(
                                0.0,
                                float(festival_get.balance_amt) - _settled,
                            )
                            festival_get.debit_amt = float(festival_get.debit_amt) + _settled
                            # Feb 2026 owner rule: accumulate every
                            # discount (installment + penalty) on the
                            # authoritative ``discount_amt`` column so
                            # Loss-of-Pay reports read a single source
                            # of truth (Chit Fund view / balance sheet
                            # / reconciliation).
                            if _discount > 0:
                                festival_get.discount_amt = float(festival_get.discount_amt or 0) + _discount
                            festival_get.save()
                            # InterestPeopleReport.objects.create(management_profile=festival_get.management_profile,interest_id=festival_get.interest.id,reportdate=datetime.date(),debit_amt=temp_family.amount,balance_amt=festival_get.balance_amt,type_choice="Payment",created_by =rejin.id)

                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except Exception:
                                    pay_coun = 1
                                # interest_obj.paid_counts = int(interest_obj.paid_counts)+ 1
                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun
                                interest_obj.save()

                        elif temp_family.interest_field == True and temp_family.interest_principle == False:

                            # Feb 2026 owner rule — WAIVER mode on
                            # penalty. Discount here bookkeeps a waiver
                            # of Penalty: cash-in = penalty_amount, but
                            # penalty balance drops by
                            # penalty_amount + discount.
                            _discount = float(temp_family.discount_amount or 0)
                            _pen_pay = float(temp_family.penalty_amount or 0)
                            _int_pay = float(temp_family.interst_amount or 0)
                            _pen_settled = _pen_pay + _discount

                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + _int_pay
                            festival_get.intrest_balance_amt = max(
                                0.0,
                                float(festival_get.intrest_balance_amt) - _int_pay,
                            )
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + _pen_settled
                            festival_get.penalty_balance_amt = max(
                                0.0,
                                float(festival_get.penalty_balance_amt) - _pen_settled,
                            )
                            festival_get.balance_amt = max(
                                0.0,
                                float(festival_get.balance_amt)
                                - _int_pay
                                - _pen_settled,
                            )
                            festival_get.debit_amt = float(festival_get.debit_amt) + _int_pay + _pen_settled
                            # Feb 2026 owner rule: penalty-branch
                            # discount also flows into ``discount_amt``
                            # so Loss-of-Pay = SUM(discount_amt).
                            if _discount > 0:
                                festival_get.discount_amt = float(festival_get.discount_amt or 0) + _discount
                            festival_get.save()
                            # InterestPeopleReport.objects.create(management_profile=festival_get.management_profile,interest_id=festival_get.interest.id,reportdate=datetime.date(),debit_amt=temp_family.amount,balance_amt=festival_get.balance_amt,type_choice="Payment",created_by =rejin.id)

                        elif temp_family.interest_field == True and temp_family.interest_principle == True:

                            # Feb 2026 owner rule — WAIVER mode when
                            # both principal AND interest/penalty are
                            # paid in one collection. The ``discount``
                            # applies to the PRINCIPAL side (matches
                            # test-case 1: Installment Interest chosen +
                            # discount => reduce Installment Amount).
                            _discount = float(temp_family.discount_amount or 0)
                            _pay = float(temp_family.amount or 0)
                            _pen_pay = float(temp_family.penalty_amount or 0)
                            _int_pay = float(temp_family.interst_amount or 0)
                            _prin_settled = _pay + _discount

                            festival_get.principal_paid = float(festival_get.principal_paid) + _prin_settled
                            festival_get.principal_balance = max(
                                0.0,
                                float(festival_get.principal_balance) - _prin_settled,
                            )
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + _int_pay
                            festival_get.intrest_balance_amt = max(
                                0.0,
                                float(festival_get.intrest_balance_amt) - _int_pay,
                            )
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + _pen_pay
                            festival_get.penalty_balance_amt = max(
                                0.0,
                                float(festival_get.penalty_balance_amt) - _pen_pay,
                            )
                            festival_get.balance_amt = max(
                                0.0,
                                float(festival_get.balance_amt)
                                - _int_pay
                                - _pen_pay
                                - _prin_settled,
                            )
                            festival_get.debit_amt = float(festival_get.debit_amt) + _int_pay + _pen_pay + _prin_settled
                            # Feb 2026 owner rule: combined-branch
                            # discount (applied to principal side)
                            # also lands on ``discount_amt``.
                            if _discount > 0:
                                festival_get.discount_amt = float(festival_get.discount_amt or 0) + _discount
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except Exception:
                                    pay_coun = 1

                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun
                                # interest_obj.paid_counts = int(interest_obj.paid_counts)+ 1
                                interest_obj.save()

                        festival_get.save()
                        interest_obj = PeopleInterestDetails.objects.filter(id=temp_family.interest.id).first()
                        # Cash actually received — do NOT subtract discount.
                        # Discount is a waiver already applied to festival_get.balance_amt
                        # in the branch above; subtracting it here produced a negative
                        # debit (shown as 0.00 in the UI) for pure-waiver collections.
                        new_amt = (
                            float(temp_family.amount)
                            + float(temp_family.penalty_amount)
                            + float(temp_family.interst_amount)
                        )
                        # festival_get.balance_amt is already the post-payment value
                        # (branches above updated and saved it). The old formula added
                        # discount back to an already-reduced balance, making the
                        # "Interest Payment" row show the pre-waiver balance.
                        payment_bal = float(festival_get.balance_amt)
                        type_choice_interest = InterestPeopleReport.objects.create(
                            management_profile=festival_get.management_profile, interest_id=festival_get.interest.id,
                            reportdate=temp_family.created_at.date(), debit_amt=new_amt, balance_amt=payment_bal,
                            created_by=rejin.id, collection=temp_family)
                        if temp_family.interest_principle == True and temp_family.interest_field == False:
                            type_choice_interest.type_choice = "Principal Payment"
                        elif temp_family.interest_principle == False and temp_family.interest_field == True:
                            type_choice_interest.type_choice = "Interest Payment"
                        elif temp_family.interest_field == True and temp_family.interest_principle == True:
                            type_choice_interest.type_choice = "Principal Interest Payment"
                        type_choice_interest.save()

                        if temp_family.discount_amount > 0:
                            InterestPeopleReport.objects.create(management_profile=festival_get.management_profile,
                                                                interest_id=festival_get.interest.id,
                                                                reportdate=temp_family.created_at.date(),
                                                                debit_amt=float(temp_family.discount_amount),
                                                                balance_amt=new_amt, type_choice="Discount",
                                                                created_by=rejin.id, collection=temp_family)

                        temp_family.interest_balance = festival_get
                        temp_family.save()
                        if interest_obj.interest_category == "Installment Interest":
                            tot_int_amt = float(temp_family.amount) + float(temp_family.penalty_amount) + float(
                                temp_family.interst_amount) - float(temp_family.discount_amount)
                        else:
                            tot_int_amt = float(temp_family.amount) + float(temp_family.penalty_amount) + float(
                                temp_family.interst_amount)

                        # tot_int_amt=float(temp_family.amount) + float(temp_family.penalty_amount) + float(temp_family.interst_amount) - float(temp_family.discount_amount)
                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family, amount=tot_int_amt,
                                              interest=temp_family.interest, banks=temp_family.bank_link)



                from decimal import Decimal

                # Make sure to use the correct type (float or Decimal) for the calculation.

                if temp_family.collection_category == "Chit Interest":
                    print('chitfund interest processing')
                    festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                         interest__interest_type="Chit fund Interest",
                                                                         management_profile=management)
                    if festival:
                        interest_obj = PeopleInterestDetails.objects.filter(id=temp_family.interest.id).first()

                        festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                              interest__interest_type="Chit fund Interest",
                                                                              management_profile=management)
                        if temp_family.interest_principle == True and temp_family.interest_field == False:
                            # Feb 2026 owner rule — WAIVER mode on the
                            # Chit-Interest principal path.  ``discount``
                            # is bookkept as if paid so the borrower's
                            # DEBT drops by ``amount + discount``.
                            _discount = float(temp_family.discount_amount or 0)
                            _pay = float(temp_family.amount or 0)
                            _settled = _pay + _discount

                            festival_get.principal_paid = float(festival_get.principal_paid) + _settled
                            # Clamp so payments overshooting the remaining
                            # balance do NOT leave a negative on the ledger.
                            festival_get.principal_balance = max(
                                0.0,
                                float(festival_get.principal_balance) - _settled,
                            )
                            festival_get.balance_amt = max(
                                0.0,
                                float(festival_get.balance_amt) - _settled,
                            )
                            festival_get.debit_amt = float(festival_get.debit_amt) + _settled
                            # Owner rule (Feb 2026): if the collection
                            # includes a penalty portion (Chit-fund
                            # borrower paying overdue penalty alongside
                            # principal — Apply-Penalty checkbox ON),
                            # flow it into penalty_paid_amt / drain from
                            # penalty_balance_amt on the SAME balance
                            # sheet row. Previously this only ran when
                            # the "Interest" checkbox was ticked, which
                            # caused principal+penalty collections to
                            # silently drop the penalty payment.
                            _pen = float(temp_family.penalty_amount or 0)
                            if _pen > 0:
                                festival_get.penalty_paid_amt = (
                                    float(festival_get.penalty_paid_amt) + _pen
                                )
                                festival_get.penalty_balance_amt = max(
                                    0.0,
                                    float(festival_get.penalty_balance_amt) - _pen,
                                )
                                festival_get.balance_amt = max(
                                    0.0,
                                    float(festival_get.balance_amt) - _pen,
                                )
                                festival_get.debit_amt = float(festival_get.debit_amt) + _pen
                            # Feb 2026 owner rule: principal-branch
                            # discount also flows into ``discount_amt``
                            # so Loss-of-Pay = SUM(discount_amt).
                            if _discount > 0:
                                festival_get.discount_amt = float(festival_get.discount_amt or 0) + _discount
                            festival_get.save()
                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except Exception:
                                    pay_coun = 1

                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun
                                interest_obj.save()

                        elif temp_family.interest_field == True and temp_family.interest_principle == False:
                            # Feb 2026 owner rule — WAIVER on penalty
                            # for Chit-Interest. Discount waives penalty.
                            _discount = float(temp_family.discount_amount or 0)
                            _pen_pay = float(temp_family.penalty_amount or 0)
                            _int_pay = float(temp_family.interst_amount or 0)
                            _pen_settled = _pen_pay + _discount

                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + _int_pay
                            festival_get.intrest_balance_amt = max(
                                0.0,
                                float(festival_get.intrest_balance_amt) - _int_pay,
                            )
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + _pen_settled
                            festival_get.penalty_balance_amt = max(
                                0.0,
                                float(festival_get.penalty_balance_amt) - _pen_settled,
                            )
                            festival_get.balance_amt = max(
                                0.0,
                                float(festival_get.balance_amt) - _int_pay - _pen_settled,
                            )
                            festival_get.debit_amt = float(festival_get.debit_amt) + _int_pay + _pen_settled
                            # Feb 2026 owner rule: penalty-branch
                            # discount also flows into ``discount_amt``
                            # so Loss-of-Pay = SUM(discount_amt).
                            if _discount > 0:
                                festival_get.discount_amt = float(festival_get.discount_amt or 0) + _discount
                            festival_get.save()

                        elif temp_family.interest_field == True and temp_family.interest_principle == True:
                            # Feb 2026 owner rule — WAIVER on the
                            # combined principal+penalty path. Discount
                            # applies to PRINCIPAL (test-case 1: chosen
                            # Installment Interest + discount => reduce
                            # installment amount).
                            _discount = float(temp_family.discount_amount or 0)
                            _pay = float(temp_family.amount or 0)
                            _pen_pay = float(temp_family.penalty_amount or 0)
                            _int_pay = float(temp_family.interst_amount or 0)
                            _prin_settled = _pay + _discount

                            festival_get.principal_paid = float(festival_get.principal_paid) + _prin_settled
                            festival_get.principal_balance = max(
                                0.0,
                                float(festival_get.principal_balance) - _prin_settled,
                            )
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + _int_pay
                            festival_get.intrest_balance_amt = max(
                                0.0,
                                float(festival_get.intrest_balance_amt) - _int_pay,
                            )
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + _pen_pay
                            festival_get.penalty_balance_amt = max(
                                0.0,
                                float(festival_get.penalty_balance_amt) - _pen_pay,
                            )
                            festival_get.balance_amt = max(
                                0.0,
                                float(festival_get.balance_amt) - _int_pay - _pen_pay - _prin_settled,
                            )
                            festival_get.debit_amt = float(festival_get.debit_amt) + _int_pay + _pen_pay + _prin_settled
                            # Feb 2026 owner rule: combined-branch
                            # discount (applied to principal side)
                            # also lands on ``discount_amt``.
                            if _discount > 0:
                                festival_get.discount_amt = float(festival_get.discount_amt or 0) + _discount
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except Exception:
                                    pay_coun = 1

                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun

                                interest_obj.save()  # signal updates installment_date
                                # CHIT_FUND_002 fix (Feb 2026 — v5.1, Days-type):
                                # The overdue walker may have created a penalty whose
                                # reportdate == today BEFORE this payment was recorded
                                # (e.g. operator loaded balance sheet earlier today).
                                # Delete it now so payment and penalty don't share the
                                # same date. Only applies to Days-type loans.
                                if interest_obj.interest_period_type == "Days":
                                    _pay_date = temp_family.pay_date
                                    _same_day_pens = InterestPeopleReport.objects.filter(
                                        interest=interest_obj,
                                        reportdate=_pay_date,
                                        type_choice="Penalty",
                                    )
                                    for _pen in _same_day_pens:
                                        _pen_amt = float(_pen.credit_amt or 0)
                                        try:
                                            _bal = PeopleInterestBalanceSheet.objects.filter(
                                                interest=interest_obj
                                            ).first()
                                            if _bal and _pen_amt > 0:
                                                _bal.penalty_amt = max(0.0, float(_bal.penalty_amt or 0) - _pen_amt)
                                                _bal.penalty_balance_amt = max(0.0, float(_bal.penalty_balance_amt or 0) - _pen_amt)
                                                _bal.credit_amt = max(0.0, float(_bal.credit_amt or 0) - _pen_amt)
                                                _bal.balance_amt = max(0.0, float(_bal.balance_amt or 0) - _pen_amt)
                                                _bal.save()
                                        except Exception:
                                            pass
                                        _pen.delete()


                        chit_fund_obj = ChitFundsDetails.objects.filter(id=temp_family.interest.chitt_fund.id)
                        if chit_fund_obj:
                            chit_fund_get = ChitFundsDetails.objects.get(id=temp_family.interest.chitt_fund.id)
                            if interest_obj.interest_type_new == "percentage":
                                if interest_obj.interest_category == "Installment Interest":
                                    interest_obj_priciple_amount = (float(interest_obj.principal_amt) * float(
                                        interest_obj.fix_interest_rate_percent)) / 100
                                    if interest_obj.interest_period_type == "Days":
                                        new_pro_amount = float(interest_obj.interest_amt) / float(
                                            interest_obj.interest_period)
                                    elif interest_obj.interest_period_type == "Week":
                                        new_pro_amount = float(interest_obj.interest_amt) / float(
                                            interest_obj.interest_period)
                                    elif interest_obj.interest_period_type == "Month":
                                        new_pro_amount = float(interest_obj.interest_amt) / float(
                                            interest_obj.interest_period)

                                    new_principal_amt = float(temp_family.amount) - new_pro_amount  # converted to float
                                else:
                                    interest_obj_priciple_amount = (float(interest_obj.principal_amt) * float(
                                        interest_obj.fix_interest_rate_percent)) / 100
                                    new_pro_amount = float(interest_obj.interest_amt) / float(
                                        interest_obj.interest_period)
                                    new_principal_amt = float(temp_family.amount) - new_pro_amount  # converted to float

                            else:
                                if interest_obj.interest_category == "Installment Interest":
                                    # Ensure both operands are of float type for multiplication
                                    new_pro_amount = float(temp_family.no_count_install) * float(
                                        interest_obj.fix_interest_rate_percent / interest_obj.interest_period)
                                    new_principal_amt = float(temp_family.amount) - new_pro_amount  # converted to float
                                else:
                                    new_pro_amount = float(temp_family.no_count_install) * float(
                                        interest_obj.fix_interest_rate_percent)
                                    new_principal_amt = float(temp_family.amount) - new_pro_amount  # converted to float

                            if interest_obj.interest_category == "Installment Interest":
                                _discount = float(temp_family.discount_amount or 0)
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) + new_principal_amt
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) + float(
                                    temp_family.amount) + float(temp_family.penalty_amount)
                                if temp_family.interest_field and not temp_family.interest_principle:
                                    # Discount applied against Penalty — profit is NOT reduced.
                                    chit_fund_get.profit_amount = float(
                                        chit_fund_get.profit_amount) + new_pro_amount + float(temp_family.penalty_amount)
                                else:
                                    # Discount applied against Installment (principal) — profit
                                    # is reduced by HALF the discount amount.
                                    chit_fund_get.profit_amount = float(
                                        chit_fund_get.profit_amount) + new_pro_amount + float(temp_family.penalty_amount)

                                chit_fund_get.save()
                            else:
                                _discount = float(temp_family.discount_amount or 0)
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) + float(temp_family.amount)
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) + float(
                                    temp_family.amount) + float(temp_family.interst_amount) + float(
                                    temp_family.penalty_amount)

                                print("DEBUG:", "field=", temp_family.interest_field, "principle=", temp_family.interest_principle, "penalty_amt=", temp_family.penalty_amount, "new_pro_amount=", new_pro_amount)
                                # Profit calculation:
                                # Penalty-only path (interest_field=True, interest_principle=False):
                                #   penalty_amount = net cash received; discount = additional waiver.
                                #   Full billed penalty = net cash + waiver → profit += penalty + discount.
                                #   Subtracting discount here double-deducts it (penalty_amount is already
                                #   the net-cash side; discount is the waiver side on top of it).
                                # Other paths (principal or combined): discount is on principal, keep as-is.
                                if temp_family.interest_field and not temp_family.interest_principle:
                                    chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) + float(temp_family.penalty_amount)
                                else:
                                    chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) + float(
                                        temp_family.interst_amount) + float(temp_family.penalty_amount) - _discount
                                
                                chit_fund_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                invester_sharing_profit_amount = new_pro_amount + float(temp_family.penalty_amount)
                            else:
                                invester_sharing_profit_amount = float(temp_family.interst_amount) + float(
                                    temp_family.penalty_amount)

                            invester_list = ChitFundInvesters.objects.filter(chitt_fund=chit_fund_get, action=True)
                            final_profit_amount1 = (float(invester_sharing_profit_amount) * float(
                                chit_fund_get.set_profit_percent / 100))
                            final_profit_amount = round(final_profit_amount1, 2)
                            chit_fund_get.management_amount = float(
                                chit_fund_get.management_amount) + final_profit_amount
                            chit_fund_get.save()
                            balance_profit_amount = invester_sharing_profit_amount - final_profit_amount
                            member_count = chit_fund_get.total_share_count
                            shared_amount1 = balance_profit_amount / member_count
                            shared_amount = round(shared_amount1, 2)

                            chit_fund_get.management_amount = float(chit_fund_get.management_amount) + (
                                    chit_fund_get.management_share_count * shared_amount)
                            chit_fund_get.save()

                            for ii in invester_list:
                                ii.collected_share_amount = float(ii.collected_share_amount) + (
                                            ii.share_count * shared_amount)
                                ii.save()

                        # NOTE: festival_get.balance_amt was already correctly
                        # updated and saved inside each of the three branches
                        # above (principle-only / interest-only / combined).
                        # The previous code block here double-updated the same
                        # fields, causing the balance to be subtracted twice.
                        # It has been removed. The temp_family FK link and save
                        # are preserved below.
                        temp_family.interest_balance = festival_get
                        temp_family.save()

                        # Cash actually received from the borrower (no discount
                        # subtraction — discount is a waiver already reflected in
                        # festival_get.balance_amt via branch 2, and is shown
                        # separately in the Discount row below).
                        # Subtracting discount here produced a negative debit that
                        # the frontend clamped to 0, hiding the payment entirely.
                        tot_int_amt = (
                            float(temp_family.amount)
                            + float(temp_family.penalty_amount)
                            + float(temp_family.interst_amount)
                        )

                        # Use the balance already stored on festival_get — the
                        # branches above set it to the correct post-payment value.
                        # The old formula re-added discount to an already-reduced
                        # balance, making it appear as if the balance *increased*
                        # after a pure-waiver (discount-only) collection.
                        report_bal = float(festival_get.balance_amt)

                        type_choice_interest = InterestPeopleReport.objects.create(
                            management_profile=festival_get.management_profile, interest_id=festival_get.interest.id,
                            reportdate=temp_family.pay_date, debit_amt=tot_int_amt, balance_amt=report_bal,
                            type_choice="Payment", created_by=rejin.id, collection=temp_family)

                        if temp_family.interest_principle == True and temp_family.interest_field == False:
                            type_choice_interest.type_choice = "Principal Payment"
                        elif temp_family.interest_principle == False and temp_family.interest_field == True:
                            type_choice_interest.type_choice = "Interest Payment"
                        elif temp_family.interest_field == True and temp_family.interest_principle == True:
                            type_choice_interest.type_choice = "Principal Interest Payment"

                        type_choice_interest.save()

                        if temp_family.discount_amount > 0:
                            InterestPeopleReport.objects.create(
                                management_profile=festival_get.management_profile,
                                interest_id=festival_get.interest.id,
                                reportdate=temp_family.pay_date, debit_amt=float(temp_family.discount_amount),
                                balance_amt=tot_int_amt, type_choice="Discount", created_by=rejin.id,
                                collection=temp_family)

                        ChitFundInterestOverallReport.objects.create(
                            chitfund=temp_family.chitt_fund, management_profile=management, created_by=rejin.id,
                            collection=temp_family, amount=tot_int_amt, interest=temp_family.interest,
                            income_choice="Addition")



                elif temp_family.collection_category == "Balance":
                    member_obj = Member_Details.objects.filter(id=temp_family.member.id).first()
                    temp_family.member_name = member_obj.member_name
                    temp_family.member_id = member_obj.id
                    temp_family.mobile_number = member_obj.member_mobile_number
                    temp_family.save()

                    # FIX: explicit branch instead of bare try/except so a bug inside
                    # "Interest Balance" can never silently fall through and get
                    # re-processed as a generic balance payment (double-apply bug).
                    balance_type = request.data.get('balance_type')

                    if balance_type == "Interest Balance":
                        interest_obj = PeopleInterestDetails.objects.filter(id=temp_family.interest.id).first()
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                             management_profile=management)
                        for ssss in festival:
                            if ssss.interest.interest_type == "Management Interest":
                                if ssss.interest.interest_category in ("Interest", "Interest with capital"):

                                    festival_get = PeopleInterestBalanceSheet.objects.get(
                                        interest=temp_family.interest, management_profile=management)

                                    festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + float(
                                        temp_family.amount)
                                    festival_get.intrest_balance_amt = float(
                                        festival_get.intrest_balance_amt) - float(temp_family.amount)

                                    festival_get.balance_amt = float(festival_get.balance_amt) - float(
                                        temp_family.amount)
                                    festival_get.debit_amt = float(festival_get.debit_amt) + float(
                                        temp_family.amount)

                                    festival_get.save()
                                    InterestPeopleReport.objects.create(
                                        management_profile=festival_get.management_profile,
                                        interest_id=festival_get.interest.id,
                                        reportdate=temp_family.created_at.date(), debit_amt=festival_get.debit_amt,
                                        balance_amt=festival_get.balance_amt, type_choice="Payment",
                                        created_by=rejin.id, collection=temp_family)

                                elif ssss.interest.interest_category == "Installment Interest":
                                    festival_get = PeopleInterestBalanceSheet.objects.get(
                                        interest=temp_family.interest, management_profile=management)

                                    festival_get.balance_amt = float(festival_get.balance_amt) - float(
                                        temp_family.amount)
                                    festival_get.debit_amt = float(festival_get.debit_amt) + float(
                                        temp_family.amount)
                                    count_cal = (temp_family.amount / ssss.interest.installment_amt)
                                    ssss.interest.paid_counts = (ssss.interest.paid_counts + round(count_cal))
                                    ssss.save()
                                    temp_family.no_count_install = temp_family.no_count_install + round(count_cal)
                                    temp_family.save()

                                    InterestPeopleReport.objects.create(
                                        management_profile=festival_get.management_profile,
                                        interest_id=festival_get.interest.id,
                                        reportdate=temp_family.created_at.date(), debit_amt=festival_get.debit_amt,
                                        balance_amt=festival_get.balance_amt, type_choice="Payment",
                                        created_by=rejin.id, collection=temp_family)
                                Report.objects.create(management_profile=management, created_by=rejin.id,
                                                      type_choice="Addition", collection=temp_family,
                                                      amount=temp_family.amount, interest=temp_family.interest,
                                                      banks=temp_family.bank_link)


                            elif ssss.interest.interest_type == "Chit Interest":
                                if ssss.interest.interest_category in ("Interest", "Interest with capital"):
                                    festival_get = PeopleInterestBalanceSheet.objects.get(
                                        interest=temp_family.interest, management_profile=management)
                                    festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + float(
                                        temp_family.amount)
                                    festival_get.intrest_balance_amt = float(
                                        festival_get.intrest_balance_amt) - float(temp_family.amount)
                                    festival_get.balance_amt = float(festival_get.balance_amt) - float(
                                        temp_family.amount)
                                    festival_get.debit_amt = float(festival_get.debit_amt) + float(
                                        temp_family.amount)
                                    festival_get.save()
                                    InterestPeopleReport.objects.create(
                                        management_profile=festival_get.management_profile,
                                        interest_id=festival_get.interest.id,
                                        reportdate=temp_family.created_at.date(), debit_amt=festival_get.debit_amt,
                                        balance_amt=festival_get.balance_amt, type_choice="Payment",
                                        created_by=rejin.id, collection=temp_family)



                                elif ssss.interest.interest_category == "Installment Interest":
                                    festival_get = PeopleInterestBalanceSheet.objects.get(
                                        interest=temp_family.interest, management_profile=management)

                                    festival_get.balance_amt = float(festival_get.balance_amt) - float(
                                        temp_family.amount)
                                    festival_get.debit_amt = float(festival_get.debit_amt) + float(
                                        temp_family.amount)
                                    count_cal = (temp_family.amount / ssss.interest.installment_amt)
                                    ssss.interest.paid_counts = (ssss.interest.paid_counts + round(count_cal))
                                    ssss.save()
                                    temp_family.no_count_install = temp_family.no_count_install + round(count_cal)
                                    temp_family.save()
                                    InterestPeopleReport.objects.create(
                                        management_profile=festival_get.management_profile,
                                        interest_id=festival_get.interest.id,
                                        reportdate=temp_family.created_at.date(), debit_amt=festival_get.debit_amt,
                                        balance_amt=festival_get.balance_amt, type_choice="Payment",
                                        created_by=rejin.id, collection=temp_family)

                                chit_fund_obj = ChitFundsDetails.objects.filter(
                                    id=temp_family.interest.chitt_fund.id)
                                if chit_fund_obj:
                                    chit_fund_get = ChitFundsDetails.objects.get(
                                        id=temp_family.interest.chitt_fund.id)
                                    if ssss.interest.interest_category in ("Interest", "Interest with capital"):
                                        chit_fund_get.cash_inhand_amount = float(
                                            chit_fund_get.cash_inhand_amount) + float(temp_family.amount)
                                        chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) + float(
                                            temp_family.amount)
                                        chit_fund_get.save()
                                    elif ssss.interest.interest_category == "Installment Interest":
                                        calculate_proft_for_intallment = float(temp_family.amount) / float(
                                            ssss.interest.installment_amt)
                                        interest_amount_install_profit = (float(ssss.interest.interest_amt) / int(
                                            ssss.interest.interest_period)) * int(calculate_proft_for_intallment)
                                        chit_fund_get.collected_principal_amount = float(
                                            chit_fund_get.collected_principal_amount) + float(
                                            temp_family.amount) - interest_amount_install_profit
                                        chit_fund_get.cash_inhand_amount = float(
                                            chit_fund_get.cash_inhand_amount) + float(temp_family.amount)
                                        chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) + float(
                                            interest_amount_install_profit)
                                        chit_fund_get.save()

                                invester_list = ChitFundInvesters.objects.filter(chitt_fund=chit_fund_get, action=True)
                                if ssss.interest.interest_category == "Installment Interest":
                                    final_profit_amount1 = (float(interest_amount_install_profit) * float(
                                        chit_fund_get.set_profit_percent / 100))
                                elif ssss.interest.interest_category in ("Interest", "Interest with capital"):
                                    final_profit_amount1 = (float(temp_family.amount) * float(
                                        chit_fund_get.set_profit_percent / 100))
                                final_profit_amount = round((final_profit_amount1), 2)

                                chit_fund_get.management_amount = float(chit_fund_get.management_amount) + float(
                                    final_profit_amount)
                                chit_fund_get.save()
                                balance_profit_amount = float(temp_family.amount) - final_profit_amount
                                member_count = chit_fund_get.total_share_count
                                shared_amount1 = balance_profit_amount / (member_count)
                                shared_amount = round((shared_amount1), 2)
                                chit_fund_get.management_amount = (float(chit_fund_get.management_amount) + (
                                            (chit_fund_get.management_share_count) * float(shared_amount)))
                                chit_fund_get.save()
                                for ii in invester_list:
                                    ii.collected_share_amount = float(ii.collected_share_amount) + (
                                                float(ii.share_count) * float(shared_amount))
                                    ii.save()

                                ChitFundInterestOverallReport.objects.create(chitfund=temp_family.chitt_fund,
                                                                             management_profile=management,
                                                                             created_by=rejin.id,
                                                                             collection=temp_family,
                                                                             amount=temp_family.amount,
                                                                             interest=temp_family.interest,
                                                                             income_choice="Addition")

                    else:
                        import json
                        amt_obj = 0
                        balance_portion = 0.0
                        if member_obj.balance_amt_paid == False:
                            if member_obj.balance_pending_amt <= temp_family.amount:
                                balance_portion = float(member_obj.balance_pending_amt)
                                amt_obj = float(temp_family.amount) - balance_portion
                                member_obj.balance_paid_amount = float(member_obj.balance_paid_amount) + balance_portion
                                member_obj.balance_pending_amt = 0.0
                                member_obj.balance_amt_paid = True
                                member_obj.save()
                            else:
                                balance_portion = float(temp_family.amount)
                                member_obj.balance_pending_amt = float(member_obj.balance_pending_amt) - balance_portion
                                member_obj.balance_paid_amount = float(member_obj.balance_paid_amount) + balance_portion
                                member_obj.save()
                                amt_obj = 0
                        else:
                            amt_obj = temp_family.amount

                        festival = PeoplesAmountDetails.objects.filter(
                            member_id=temp_family.member.id, paid=False, management_profile=management
                        ).order_by('id')

                        rows_touched = []   # [{'id': int, 'amount': float}, ...]
                        _touched_last = None
                        if amt_obj > 0:
                            remaining = amt_obj
                            for fes in festival:
                                if remaining <= 0:
                                    break
                                fest_obj = PeoplesAmountDetails.objects.filter(id=fes.id).first()
                                applied = min(float(remaining), float(fest_obj.total_bal_amt))
                                fest_obj.total_paid_amt = float(fest_obj.total_paid_amt) + applied
                                fest_obj.total_bal_amt = float(fest_obj.total_bal_amt) - applied
                                if fest_obj.total_bal_amt <= 0:
                                    fest_obj.total_bal_amt = 0.0
                                    fest_obj.paid = True
                                fest_obj.save()
                                rows_touched.append({'id': fest_obj.id, 'amount': applied})
                                _touched_last = fest_obj
                                remaining = float(remaining) - applied

                        if _touched_last is not None:
                            temp_family.amount_link = _touched_last

                        temp_family.balance_split_json = json.dumps({
                            'member_portion': balance_portion,
                            'rows': rows_touched,
                        })
                        temp_family.save()

                        rep = Report.objects.create(management_profile=management, created_by=rejin.id,
                                                    type_choice="Addition", collection=temp_family,
                                                    members=temp_family.member, amount=temp_family.amount, balance=True,
                                                    banks=temp_family.bank_link)

                elif temp_family.collection_category == "Moveable Rent":
                    festival = MoveableRentBalanceSheet.objects.filter(moveablerent=temp_family.moveablerent,
                                                                       management_profile=management)
                    if festival:
                        festival_get = MoveableRentBalanceSheet.objects.get(moveablerent=temp_family.moveablerent,
                                                                            management_profile=management)
                        festival_get.paid = True
                        festival_get.collected_by = rejin.id
                        festival_get.save()
                        move_asset = MovableAssetsRents.objects.filter(id=temp_family.moveablerent.id).first()
                        move_asset.action = False
                        move_asset.end_date = temp_family.pay_date
                        move_asset.save()
                        temp_family.member = move_asset.tenat_member
                        temp_family.member_name = move_asset.tenat_name
                        temp_family.mobile_number = move_asset.tenat_mobile
                        temp_family.save()
                        move_asset_tab = MovableAssetsRentTable.objects.filter(movable_rent=move_asset)
                        for move in move_asset_tab:
                            move_asset_tab_obj = MovableAssetsRentTable.objects.get(id=move.id)
                            asset_obj = MoveableAssetDetails.objects.get(id=move_asset_tab_obj.asset.id)
                            asset_obj.avilable_qty = float(asset_obj.avilable_qty) + float(move_asset_tab_obj.qnty)
                            asset_obj.save()
                        move_asset.collected_by = rejin.id
                        move_asset.save()
                        if request.data['moveable_asset_payment'] == "Paid":
                            if festival_get.balance_amt < move_asset.advance_amt:
                                bal_new = float(move_asset.advance_amt) - float(festival_get.balance_amt)
                                temp_family.ref_moverent_bal = festival_get.balance_amt
                                temp_family.save()
                                manage_treasure = ManagementTreasure.objects.filter(management_profile=management)
                                if manage_treasure:
                                    manage_treasure_get = ManagementTreasure.objects.get(management_profile=management)
                                    manage_treasure_get.cash_in_hand = float(manage_treasure_get.cash_in_hand) - float(
                                        bal_new)
                                    manage_treasure_get.expence_amt = float(manage_treasure_get.expence_amt) + float(
                                        bal_new)

                                    manage_treasure_get.save()
                                    festival_get.debit_amt = float(festival_get.debit_amt) - float(
                                        temp_family.amount) + float(move_asset.advance_amt)
                                    festival_get.balance_amt = 0
                                    festival_get.save()
                                    move_asset.settled_amount = float(temp_family.amount)
                                    move_asset.save()
                                Report.objects.create(management_profile=management, created_by=rejin.id,
                                                      type_choice="Reduction", collection=temp_family, amount=bal_new,
                                                      moveablerent=temp_family.moveablerent,
                                                      banks=temp_family.bank_link)


                        elif request.data['moveable_asset_payment'] == "Received":
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(
                                temp_family.amount) - float(move_asset.advance_amt)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount) + float(
                                move_asset.advance_amt)
                            festival_get.save()
                            manage_treasure = ManagementTreasure.objects.filter(management_profile=management)
                            if manage_treasure:
                                manage_treasure_get = ManagementTreasure.objects.get(management_profile=management)
                                if temp_family.bank_link != None:
                                    manage_treasure_get.bank_amt = float(manage_treasure_get.bank_amt) + float(
                                        temp_family.amount)
                                    manage_treasure_get.save()
                                    bank_obj1 = BankDetails.objects.filter(id=temp_family.bank_link.id).first()
                                    bank_obj1.credit_amt = float(bank_obj1.credit_amt) + float(temp_family.amount)
                                    bank_obj1.save()
                                else:
                                    manage_treasure_get.cash_in_hand = float(manage_treasure_get.cash_in_hand) + float(
                                        temp_family.amount)
                                    manage_treasure_get.save()
                            move_asset.collected_by = rejin.id
                            move_asset.save()

                            Report.objects.create(management_profile=management, created_by=rejin.id,
                                                  type_choice="Addition", collection=temp_family,
                                                  amount=temp_family.amount, moveablerent=temp_family.moveablerent,
                                                  banks=temp_family.bank_link)
                if temp_family.sub_tariff != None or temp_family.death_tariff != None or temp_family.marriage != None or temp_family.festivals != None or temp_family.collection_category == "Balance":
                    if temp_family.sub_tariff != None:
                        mem_report = TempleMemberReport.objects.filter(members=temp_family.member)
                        if mem_report:
                            mem_report_obj = TempleMemberReport.objects.filter(members=temp_family.member).last()
                            if request.data['present'] == True:
                                bal = float(mem_report_obj.balance_amt) - float(temp_family.amount)
                            else:
                                bal = float(mem_report_obj.balance_amt) + float(festival_get.exception_amount) - float(
                                    temp_family.amount)
                            tem_report = TempleMemberReport.objects.create(management_profile=management,
                                                                           members=temp_family.member,
                                                                           reportdate=temp_family.pay_date,
                                                                           debit_amt=temp_family.amount,
                                                                           balance_amt=bal, created_by=rejin.id,
                                                                           collection=temp_family)
                        else:

                            tem_report = TempleMemberReport.objects.create(management_profile=management,
                                                                           members=temp_family.member,
                                                                           reportdate=temp_family.pay_date,
                                                                           debit_amt=temp_family.amount, balance_amt=0,
                                                                           created_by=rejin.id, collection=temp_family)
                    else:
                        mem_report = TempleMemberReport.objects.filter(members=temp_family.member)
                        if mem_report:
                            mem_report_obj = TempleMemberReport.objects.filter(members=temp_family.member).last()
                            bal = float(mem_report_obj.balance_amt) - float(temp_family.amount)
                            tem_report = TempleMemberReport.objects.create(management_profile=management,
                                                                           members=temp_family.member,
                                                                           reportdate=temp_family.pay_date,
                                                                           debit_amt=temp_family.amount,
                                                                           balance_amt=bal, created_by=rejin.id,
                                                                           collection=temp_family)
                        else:
                            tem_report = TempleMemberReport.objects.create(management_profile=management,
                                                                           members=temp_family.member,
                                                                           reportdate=temp_family.pay_date,
                                                                           debit_amt=temp_family.amount, balance_amt=0,
                                                                           created_by=rejin.id, collection=temp_family)
                    if temp_family.sub_tariff != None:
                        tem_report.type_choice = "subscription Tariff"
                        tem_report.sub_tariff = temp_family.sub_tariff
                        tem_report.save()
                    if temp_family.marriage != None:
                        tem_report.type_choice = "Marriage Amount"
                        tem_report.marriage = temp_family.marriage
                        tem_report.save()
                    elif temp_family.death_tariff != None:
                        tem_report.type_choice = "Death Tariff"
                        tem_report.death_tariff = temp_family.death_tariff
                        tem_report.save()
                    elif temp_family.festivals != None:
                        tem_report.type_choice = "Festival"
                        tem_report.festivals = temp_family.festivals
                        tem_report.save()
                    elif temp_family.collection_category == "Balance":
                        tem_report.type_choice = "Balance"
                        tem_report.save()
                return Response(serializer876.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = CollectionDetails.objects.all().order_by('-created_at')
        serializer = CollectionDetailsSerializer(our_family, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH', "DELETE"])
def edit_collections_details(request, pk):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    try:
        customer = CollectionDetails.objects.get(pk=pk)
    except CollectionDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    amt = customer.amount
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()

    if request.method == 'GET':
        serializer = CollectionDetailsSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if get_role == "User" or get_role == "Admin" or rejin.is_superuser == True:

            date_string = customer.created_at__date
            date_object = datetime.strptime(date_string, "%Y-%m-%d").date()

            # Adding one month using relativedelta
            new_date_object = date_object + relativedelta(months=1)
            today = date.today()
            if today > new_date_object:
                msg = {"error": "Collection details can not edit"}
                return Response(msg, status=status.HTTP_226_IM_USED)
            else:
                serializer876 = CollectionDetailsSerializer(customer, data=request.data)
                if serializer876.is_valid():
                    pay_date = customer.created_at__date

                    if customer.collection_category == "Festival":
                        festival_new = PeoplesAmountDetails.objects.filter(festival=customer.festivals,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(festival=customer.festivals,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()
                    elif customer.collection_category == "Marriage":
                        festival_new = PeoplesAmountDetails.objects.filter(marriage=customer.marriage,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(marriage=customer.marriage,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()

                    elif customer.collection_category == "Death Tariff":
                        festival_new = PeoplesAmountDetails.objects.filter(death=customer.death_tariff,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(death=customer.death_tariff,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()

                    elif customer.collection_category == "Subscription Tariff":
                        festival_new = PeoplesAmountDetails.objects.filter(sub_tariff=customer.sub_tariff,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(sub_tariff=customer.sub_tariff,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()


                    elif customer.collection_category == "Rent":
                        festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=customer.rentsandlease,
                                                                         rental_new_amt__tenat_member=customer.member,
                                                                         rental_new_amt__action=True)
                        if festival_new:
                            festival_new_get = RentalBalanceSheet.objects.get(rental_new_amt=customer.rentsandlease,
                                                                              rental_new_amt__tenat_member=customer.member,
                                                                              rental_new_amt__action=True)
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)

                            festival_new_get.save()



                    elif customer.collection_category == "Lease":
                        festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=customer.rentsandlease,
                                                                         rental_new_amt__tenat_member=customer.member,
                                                                         rental_new_amt__action=False)
                        if festival_new:
                            festival_new_get = RentalBalanceSheet.objects.get(rental_new_amt=customer.rentsandlease,
                                                                              rental_new_amt__tenat_member=customer.member,
                                                                              rental_new_amt__action=False)
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)

                            festival_new_get.save()



                    elif customer.collection_category == "Fund":
                        festival_new = FundMembersBalanceSheet.objects.filter(fund=customer.fund_m,
                                                                              fund_m__fund_member=customer.member)
                        if festival_new:
                            festival_new_get = FundMembersBalanceSheet.objects.get(fund=customer.fund_m,
                                                                                   fund_m__fund_member=customer.member)
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)

                            festival_new_get.save()


                    elif customer.collection_category == "Management Interest":
                        festival_new = PeopleInterestBalanceSheet.objects.filter(interest=customer.interest,
                                                                                 interest__people_member=customer.member,
                                                                                 interest__interest_type="Management Interest")
                        if festival_new:
                            festival_new_get = PeopleInterestBalanceSheet.objects.get(interest=customer.interest,
                                                                                      interest__people_member=customer.member,
                                                                                      interest__interest_type="Management Interest")
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(
                                customer.amount)

                            festival_new_get.save()



                    elif customer.collection_category == "Chit Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=customer.interest,
                                                                             interest__people_member=customer.member,
                                                                             interest__interest_type="Chit fund Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=customer.interest,
                                                                                  interest__people_member=customer.member,
                                                                                  interest__interest_type="Chit fund Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) + float(customer.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) - float(customer.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) + float(customer.amount)

                            # Fix C (Feb 2026): reverse the penalty
                            # portion of the collection being edited /
                            # deleted so penalty_paid_amt and
                            # penalty_balance_amt reflect the new state.
                            _pen_prev = float(customer.penalty_amount or 0)
                            if _pen_prev > 0:
                                festival_get.penalty_paid_amt = max(
                                    0.0,
                                    float(festival_get.penalty_paid_amt) - _pen_prev,
                                )
                                festival_get.penalty_balance_amt = (
                                    float(festival_get.penalty_balance_amt) + _pen_prev
                                )

                            festival_get.save()




                    elif customer.collection_category == "Balance":
                        import json
                        split = json.loads(customer.balance_split_json or '{}')
                        member_portion = float(split.get('member_portion', 0) or 0)
                        rows = split.get('rows', [])

                        for row in rows:
                            r = PeoplesAmountDetails.objects.filter(id=row['id']).first()
                            if r is not None:
                                applied = float(row['amount'])
                                r.total_paid_amt = float(r.total_paid_amt) - applied
                                r.total_bal_amt = float(r.total_bal_amt) + applied
                                r.paid = False
                                r.save()

                        if member_portion > 0:
                            _m = Member_Details.objects.filter(id=customer.member.id).first()
                            if _m is not None:
                                _m.balance_paid_amount = float(_m.balance_paid_amount or 0) - member_portion
                                _m.balance_pending_amt = float(_m.balance_pending_amt or 0) + member_portion
                                _m.balance_amt_paid = False
                                _m.save()

                    temp_family = serializer876.save()
                    temp_family.created_by = rejin.id
                    temp_family.save()
                    manage = ManagementTreasure.objects.filter(management_profile=management)
                    if manage:
                        manage_get = ManagementTreasure.objects.get(management_profile=management)
                        manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(temp_family.amount) - float(
                            amt)
                        manage_get.save()
                    if temp_family.collection_category == "Festival":
                        festival = PeoplesAmountDetails.objects.filter(festival=temp_family.festivals,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(festival=temp_family.festivals,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()
                    elif temp_family.collection_category == "Marriage":
                        festival = PeoplesAmountDetails.objects.filter(marriage=temp_family.marriage,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(marriage=temp_family.marriages,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()

                    elif temp_family.collection_category == "Death Tariff":
                        festival = PeoplesAmountDetails.objects.filter(death=temp_family.death_tariff,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(death=temp_family.death_tariff,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()

                    elif temp_family.collection_category == "Subscription Tariff":
                        festival = PeoplesAmountDetails.objects.filter(sub_tariff=temp_family.sub_tariff,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(sub_tariff=temp_family.sub_tariff,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()


                    elif temp_family.collection_category == "Rent":
                        festival = RentalBalanceSheet.objects.filter(rental_new_amt=temp_family.rentsandlease,
                                                                     rental_new_amt__tenat_member=temp_family.member,
                                                                     rental_new_amt__action=True)
                        if festival:
                            festival_get = RentalBalanceSheet.objects.get(rental_new_amt=temp_family.rentsandlease,
                                                                          rental_new_amt__tenat_member=temp_family.member,
                                                                          rental_new_amt__action=True)
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Lease":
                        festival = RentalBalanceSheet.objects.filter(rental_new_amt=temp_family.rentsandlease,
                                                                     rental_new_amt__tenat_member=temp_family.member,
                                                                     rental_new_amt__action=False)
                        if festival:
                            festival_get = RentalBalanceSheet.objects.get(rental_new_amt=temp_family.rentsandlease,
                                                                          rental_new_amt__tenat_member=temp_family.member,
                                                                          rental_new_amt__action=False)
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Fund":
                        festival = FundMembersBalanceSheet.objects.filter(fund=temp_family.fund_m,
                                                                          fund_m__fund_member=temp_family.member)
                        if festival:
                            festival_get = FundMembersBalanceSheet.objects.get(fund=temp_family.fund_m,
                                                                               fund_m__fund_member=temp_family.member)
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Management Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                             interest__people_member=temp_family.member,
                                                                             interest__interest_type="Management Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                  interest__people_member=temp_family.member,
                                                                                  interest__interest_type="Management Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Chit Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                             interest__people_member=temp_family.member,
                                                                             interest__interest_type="Chit fund Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                  interest__people_member=temp_family.member,
                                                                                  interest__interest_type="Chit fund Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Balance":
                        festival_get = temp_family.amount_link
                        if festival_get is None:
                            festival_get = PeoplesAmountDetails.objects.filter(
                                member=temp_family.member, paid=False
                            ).order_by('id').first()
                        if festival_get is not None:
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.total_bal_amt = float(festival_get.total_bal_amt) - float(temp_family.amount)
                            festival_get.save()


                    return Response(serializer876.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

    elif request.method == 'PATCH':
        if get_role == "User" or get_role == "Admin" or rejin.is_superuser == True:

            date_string = customer.created_at__date
            date_object = datetime.strptime(date_string, "%Y-%m-%d").date()

            # Adding one month using relativedelta
            new_date_object = date_object + relativedelta(months=1)
            today = date.today()
            if today > new_date_object:
                msg = {"error": "Collection details can not edit"}
                return Response(msg, status=status.HTTP_226_IM_USED)
            else:
                serializer876 = CollectionDetailsSerializer(customer, data=request.data, partial=True)
                if serializer876.is_valid():
                    if customer.collection_category == "Festival":
                        festival_new = PeoplesAmountDetails.objects.filter(festival=customer.festivals,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(festival=customer.festivals,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()
                    elif customer.collection_category == "Marriage":
                        festival_new = PeoplesAmountDetails.objects.filter(marriage=customer.marriage,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(marriage=customer.marriage,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()

                    elif customer.collection_category == "Death Tariff":
                        festival_new = PeoplesAmountDetails.objects.filter(death=customer.death_tariff,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(death=customer.death_tariff,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()

                    elif customer.collection_category == "Subscription Tariff":
                        festival_new = PeoplesAmountDetails.objects.filter(sub_tariff=customer.sub_tariff,
                                                                           member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(sub_tariff=customer.sub_tariff,
                                                                                member=customer.member)
                            festival_new_get.amount_balance = float(festival_new_get.amount_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.save()


                    elif customer.collection_category == "Rent":
                        festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=customer.rentsandlease,
                                                                         rental_new_amt__tenat_member=customer.member,
                                                                         rental_new_amt__action=True)
                        if festival_new:
                            festival_new_get = RentalBalanceSheet.objects.get(rental_new_amt=customer.rentsandlease,
                                                                              rental_new_amt__tenat_member=customer.member,
                                                                              rental_new_amt__action=True)
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)

                            festival_new_get.save()



                    elif customer.collection_category == "Lease":
                        festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=customer.rentsandlease,
                                                                         rental_new_amt__tenat_member=customer.member,
                                                                         rental_new_amt__action=False)
                        if festival_new:
                            festival_new_get = RentalBalanceSheet.objects.get(rental_new_amt=customer.rentsandlease,
                                                                              rental_new_amt__tenat_member=customer.member,
                                                                              rental_new_amt__action=False)
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)

                            festival_new_get.save()



                    elif customer.collection_category == "Fund":
                        festival_new = FundMembersBalanceSheet.objects.filter(fund=customer.fund_m,
                                                                              fund_m__fund_member=customer.member)
                        if festival_new:
                            festival_new_get = FundMembersBalanceSheet.objects.get(fund=customer.fund_m,
                                                                                   fund_m__fund_member=customer.member)
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)

                            festival_new_get.save()


                    elif customer.collection_category == "Management Interest":
                        festival_new = PeopleInterestBalanceSheet.objects.filter(interest=customer.interest,
                                                                                 interest__people_member=customer.member,
                                                                                 interest__interest_type="Management Interest")
                        if festival_new:
                            festival_new_get = PeopleInterestBalanceSheet.objects.get(interest=customer.interest,
                                                                                      interest__people_member=customer.member,
                                                                                      interest__interest_type="Management Interest")
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(
                                customer.amount)

                            festival_new_get.save()


                    elif customer.collection_category == "Chit Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=customer.interest,
                                                                             interest__people_member=customer.member,
                                                                             interest__interest_type="Chit fund Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=customer.interest,
                                                                                  interest__people_member=customer.member,
                                                                                  interest__interest_type="Chit fund Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) + float(customer.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) - float(customer.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) + float(customer.amount)

                            # Fix C (Feb 2026): reverse the penalty
                            # portion of the collection being edited /
                            # deleted so penalty_paid_amt and
                            # penalty_balance_amt reflect the new state.
                            _pen_prev = float(customer.penalty_amount or 0)
                            if _pen_prev > 0:
                                festival_get.penalty_paid_amt = max(
                                    0.0,
                                    float(festival_get.penalty_paid_amt) - _pen_prev,
                                )
                                festival_get.penalty_balance_amt = (
                                    float(festival_get.penalty_balance_amt) + _pen_prev
                                )

                            festival_get.save()




                    elif customer.collection_category == "Balance":
                        import json
                        split = json.loads(customer.balance_split_json or '{}')
                        member_portion = float(split.get('member_portion', 0) or 0)
                        rows = split.get('rows', [])

                        for row in rows:
                            r = PeoplesAmountDetails.objects.filter(id=row['id']).first()
                            if r is not None:
                                applied = float(row['amount'])
                                r.total_paid_amt = float(r.total_paid_amt) - applied
                                r.total_bal_amt = float(r.total_bal_amt) + applied
                                r.paid = False
                                r.save()

                        if member_portion > 0:
                            _m = Member_Details.objects.filter(id=customer.member.id).first()
                            if _m is not None:
                                _m.balance_paid_amount = float(_m.balance_paid_amount or 0) - member_portion
                                _m.balance_pending_amt = float(_m.balance_pending_amt or 0) + member_portion
                                _m.balance_amt_paid = False
                                _m.save()

                    temp_family = serializer876.save()
                    temp_family.created_by = rejin.id
                    temp_family.save()
                    manage = ManagementTreasure.objects.filter(management_profile=management)
                    if manage:
                        manage_get = ManagementTreasure.objects.get(management_profile=management)
                        manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(temp_family.amount) - float(
                            amt)
                        manage_get.save()
                    if temp_family.collection_category == "Festival":
                        festival = PeoplesAmountDetails.objects.filter(festival=temp_family.festivals,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(festival=temp_family.festivals,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()
                    elif temp_family.collection_category == "Marriage":
                        festival = PeoplesAmountDetails.objects.filter(marriage=temp_family.marriage,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(marriage=temp_family.marriages,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()

                    elif temp_family.collection_category == "Death Tariff":
                        festival = PeoplesAmountDetails.objects.filter(death=temp_family.death_tariff,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(death=temp_family.death_tariff,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()

                    elif temp_family.collection_category == "Subscription Tariff":
                        festival = PeoplesAmountDetails.objects.filter(sub_tariff=temp_family.sub_tariff,
                                                                       member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(sub_tariff=temp_family.sub_tariff,
                                                                            member=temp_family.member)
                            festival_get.amount_balance = float(festival_get.amount_balance) - float(temp_family.amount)
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.save()


                    elif temp_family.collection_category == "Rent":
                        festival = RentalBalanceSheet.objects.filter(rental_new_amt=temp_family.rentsandlease,
                                                                     rental_new_amt__tenat_member=temp_family.member,
                                                                     rental_new_amt__action=True)
                        if festival:
                            festival_get = RentalBalanceSheet.objects.get(rental_new_amt=temp_family.rentsandlease,
                                                                          rental_new_amt__tenat_member=temp_family.member,
                                                                          rental_new_amt__action=True)
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Lease":
                        festival = RentalBalanceSheet.objects.filter(rental_new_amt=temp_family.rentsandlease,
                                                                     rental_new_amt__tenat_member=temp_family.member,
                                                                     rental_new_amt__action=False)
                        if festival:
                            festival_get = RentalBalanceSheet.objects.get(rental_new_amt=temp_family.rentsandlease,
                                                                          rental_new_amt__tenat_member=temp_family.member,
                                                                          rental_new_amt__action=False)
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Fund":
                        festival = FundMembersBalanceSheet.objects.filter(fund=temp_family.fund_m,
                                                                          fund_m__fund_member=temp_family.member)
                        if festival:
                            festival_get = FundMembersBalanceSheet.objects.get(fund=temp_family.fund_m,
                                                                               fund_m__fund_member=temp_family.member)
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Management Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                             interest__people_memberr=temp_family.member,
                                                                             interest__interest_type="Management Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                  interest__people_member=temp_family.member,
                                                                                  interest__interest_type="Management Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Chit Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                             interest__people_memberr=temp_family.member,
                                                                             interest__interest_type="Chit fund Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                  interest__people_member=temp_family.member,
                                                                                  interest__interest_type="Chit fund Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Balance":
                        festival_get = temp_family.amount_link
                        if festival_get is None:
                            festival_get = PeoplesAmountDetails.objects.filter(
                                member=temp_family.member, paid=False
                            ).order_by('id').first()
                        if festival_get is not None:
                            festival_get.total_paid_amt = float(festival_get.total_paid_amt) + float(temp_family.amount)
                            festival_get.total_bal_amt = float(festival_get.total_bal_amt) - float(temp_family.amount)
                            festival_get.save()
                    return Response(serializer876.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

    elif request.method == 'DELETE':
        if get_role == "User" or get_role == "Admin" or rejin.is_superuser == True or get_role == "User":
            date_string = customer.pay_date
            # date_object = datetime.strptime(date_string, "%Y-%m-%d").date()

            # Adding one month using relativedelta
            new_date_object = date_string + relativedelta(months=1)
            today = date.today()
            if today > new_date_object:
                msg = {"msg": "Collection details can not delete"}
                return Response(msg, status=status.HTTP_226_IM_USED)
            else:
                if customer.collection_category == "Chit Interest" or customer.collection_category == "Management Interest":
                    inter_rep = InterestPeopleReport.objects.filter(management_profile=customer.management_profile,
                                                                    interest_id=customer.interest.id,
                                                                    collection=customer)
                    if inter_rep:
                        inter_rep_obj = InterestPeopleReport.objects.filter(
                            management_profile=customer.management_profile, interest_id=customer.interest.id,
                            collection=customer).last()
                        inter_rep_obj_new = InterestPeopleReport.objects.filter(id__gt=inter_rep_obj.id,
                                                                                interest_id=customer.interest.id)
                        if inter_rep_obj_new:
                            msg = {"msg": "Collection details can not delete"}
                            return Response(msg, status=status.HTTP_226_IM_USED)
                if customer.collection_category == "Moveable Rent":
                    if customer.moveable_asset_payment == "Paid":
                        new = MoveableRentBalanceSheet.objects.filter(moveablerent_id=customer.moveablerent.id).first()
                        new_asset = MovableAssetsRents.objects.filter(id=customer.moveablerent.id).first()
                        if customer.ref_moverent_bal < new_asset.advance_amt:
                            bal = float(new_asset.advance_amt) - float(customer.ref_moverent_bal)
                            manage_treasure = ManagementTreasure.objects.filter(management_profile=management)
                            if manage_treasure:
                                manage_treasure_get = ManagementTreasure.objects.get(management_profile=management)
                                if (float(manage_treasure_get.cash_in_hand) - float(
                                        manage_treasure_get.expence_amt)) < float(bal):
                                    return Response(
                                        {'msg': 'Due to less amount in cash in hand ,Can not pay Amount to member'},
                                        status=status.HTTP_226_IM_USED)
                manage = ManagementTreasure.objects.filter(management_profile=management)
                if manage:
                    manage_get = ManagementTreasure.objects.get(management_profile=management)
                    if customer.collection_category != "Moveable Rent" and customer.collection_category != "Fund" and customer.collection_category != "Chit Interest":
                        if customer.bank_link != None:
                            bank_obj2 = BankDetails.objects.filter(id=customer.bank_link.id).first()
                            if float(manage_get.bank_amt) < float(amt) or float(bank_obj2.credit_amt) < float(
                                    customer.amount):
                                return Response(
                                    {'msg': 'Due to less amount in bank account can not delete this collection'},
                                    status=status.HTTP_226_IM_USED)
                            else:
                                manage_get.bank_amt = float(manage_get.bank_amt) - float(amt)
                                manage_get.save()

                                bank_obj2.credit_amt = float(bank_obj2.credit_amt) - float(customer.amount)
                                bank_obj2.save()
                        else:
                            if (float(manage_get.cash_in_hand) - float(manage_get.expence_amt)) < float(amt):
                                return Response(
                                    {'msg': 'Due to less amount in cash in hand can not delete this collection'},
                                    status=status.HTTP_226_IM_USED)
                            else:
                                if customer.collection_category == "Management Interest":
                                    manage_get.cash_in_hand = float(manage_get.cash_in_hand) - float(
                                        customer.amount) - float(customer.interst_amount) - float(
                                        customer.penalty_amount)
                                    manage_get.save()
                                else:
                                    manage_get.cash_in_hand = float(manage_get.cash_in_hand) - float(amt)
                                    manage_get.save()

                if customer.collection_category == "Festival":
                    festival_new = PeoplesAmountDetails.objects.filter(festival=customer.festivals,
                                                                       member=customer.member)
                    if festival_new:
                        festival_new_get = PeoplesAmountDetails.objects.get(festival=customer.festivals,
                                                                            member=customer.member)
                        festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) + float(customer.amount)
                        festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                            customer.amount)
                        festival_new_get.paid = False
                        festival_new_get.save()
                elif customer.collection_category == "Marriage":
                    festival_new = PeoplesAmountDetails.objects.filter(id=customer.amount_link.id)
                    if festival_new:
                        festival_new_get = PeoplesAmountDetails.objects.get(id=customer.amount_link.id)
                        festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) + float(customer.amount)
                        festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                            customer.amount)
                        festival_new_get.paid = False
                        festival_new_get.save()

                elif customer.collection_category == "Death Tariff":
                    festival_new = PeoplesAmountDetails.objects.filter(death=customer.death_tariff,
                                                                       member=customer.member)
                    if festival_new:
                        festival_new_get = PeoplesAmountDetails.objects.get(death=customer.death_tariff,
                                                                            member=customer.member)
                        festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) + float(customer.amount)
                        festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                            customer.amount)
                        festival_new_get.paid = False
                        festival_new_get.save()

                elif customer.collection_category == "Subscription Tariff":
                    festival_new = PeoplesAmountDetails.objects.filter(sub_tariff=customer.sub_tariff,
                                                                       member=customer.member)
                    if festival_new:

                        festival_new_get = PeoplesAmountDetails.objects.get(sub_tariff=customer.sub_tariff,
                                                                            member=customer.member)
                        if customer.present != True:
                            # festival_get.amount_balance =float(festival_get.amount_balance)+float(festival_get.exception_amount)
                            festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) - float(
                                festival_new_get.exception_amount)

                            festival_new_get.save()
                        # festival_get.amount_balance =float(festival_get.amount_balance)- float(temp_family.amount)
                        festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                            customer.amount)
                        festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) + float(customer.amount)

                        festival_new_get.save()
                        festival_new_get.paid = False

                        festival_new_get.exception = False
                        festival_new_get.save()

                elif customer.collection_category == "Rent":
                    festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=customer.rentsandlease,
                                                                     rental_new_amt__rent=True)
                    if festival_new:
                        festival_new_get = RentalBalanceSheet.objects.get(rental_new_amt=customer.rentsandlease,
                                                                          rental_new_amt__rent=True)
                        # festival_new_get.credit_amt =  float(festival_new_get.credit_amt) + float(customer.amount)
                        festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                        festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)
                        # festival_new_get.paid=False

                        festival_new_get.save()



                elif customer.collection_category == "Lease":
                    festival_new = RentalBalanceSheet.objects.filter(rental_new_amt=customer.rentsandlease,
                                                                     rental_new_amt__rent=False)
                    if festival_new:
                        festival_new_get = RentalBalanceSheet.objects.get(rental_new_amt=customer.rentsandlease,
                                                                          rental_new_amt__rent=False)
                        # festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(customer.amount)
                        festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                        festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)
                        # festival_new_get.paid=False

                        festival_new_get.save()



                elif customer.collection_category == "Fund":
                    festival_new = FundMembersBalanceSheet.objects.filter(fund=customer.funds,
                                                                          fund_m=customer.fund_member,
                                                                          management_profile=management)
                    if festival_new:
                        festival_new_get = FundMembersBalanceSheet.objects.get(fund=customer.funds,
                                                                               fund_m=customer.fund_member,
                                                                               management_profile=management)
                        # festival_new_get.credit_amt += float(customer.amount)
                        festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(customer.amount)
                        festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(customer.amount)

                        festival_new_get.save()

                        fund_grp = FundGroupDetails.objects.filter(id=customer.funds.id).first()
                        fund_grp.cash_available_amount = float(fund_grp.cash_available_amount) - float(customer.amount)
                        fund_grp.total_collected_amount = float(fund_grp.total_collected_amount) - float(
                            customer.amount)
                        fund_grp.save()



                elif customer.collection_category == "Management Interest":
                    festival = PeopleInterestBalanceSheet.objects.filter(interest=customer.interest,
                                                                         interest__interest_type="Management Interest",
                                                                         management_profile=management)
                    if festival:
                        interest_obj = PeopleInterestDetails.objects.filter(id=customer.interest.id).first()
                        festival_get = PeopleInterestBalanceSheet.objects.get(interest=customer.interest,
                                                                              interest__interest_type="Management Interest",
                                                                              management_profile=management)
                        if customer.interest_principle == True and customer.interest_field == False:
                            festival_get.principal_paid = float(festival_get.principal_paid) - float(customer.amount)
                            festival_get.principal_balance = float(festival_get.principal_balance) + float(
                                customer.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) + float(customer.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) - float(customer.amount)
                            festival_get.save()
                            if interest_obj.interest_category == "Installment Interest":
                                interest_obj.paid_counts = int(interest_obj.paid_counts) - 1
                                interest_obj.save()
                            # InterestPeopleReport.objects.create(management_profile=festival_get.management_profile,interest_id=festival_get.interest.id,reportdate=datetime.date(),debit_amt=temp_family.amount,balance_amt=festival_get.balance_amt,type_choice="Payment",created_by =rejin.id)


                        elif customer.interest_field == True and customer.interest_principle == False:

                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) - float(
                                customer.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) + float(
                                customer.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) - float(
                                customer.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) + float(
                                customer.penalty_amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) + float(
                                customer.interst_amount) + float(customer.penalty_amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) - float(
                                customer.interst_amount) - float(customer.penalty_amount)
                            festival_get.save()
                            # InterestPeopleReport.objects.create(management_profile=festival_get.management_profile,interest_id=festival_get.interest.id,reportdate=datetime.date(),debit_amt=temp_family.amount,balance_amt=festival_get.balance_amt,type_choice="Payment",created_by =rejin.id)

                        elif customer.interest_field == True and customer.interest_principle == True:

                            festival_get.principal_paid = float(festival_get.principal_paid) - float(customer.amount)
                            festival_get.principal_balance = float(festival_get.principal_balance) + float(
                                customer.amount)
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) - float(
                                customer.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) + float(
                                customer.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) - float(
                                customer.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) + float(
                                customer.penalty_amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) + float(
                                customer.interst_amount) + float(customer.penalty_amount) + float(customer.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) - float(
                                customer.interst_amount) - float(customer.penalty_amount) - float(customer.amount)
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                interest_obj.paid_counts = int(interest_obj.paid_counts) - 1
                                interest_obj.save()


                elif customer.collection_category == "Chit Interest":
                    festival = PeopleInterestBalanceSheet.objects.filter(interest=customer.interest,
                                                                         interest__interest_type="Chit fund Interest",
                                                                         management_profile=management)
                    interest_obj = PeopleInterestDetails.objects.filter(id=customer.interest.id).first()
                    if festival:
                        festival_get = PeopleInterestBalanceSheet.objects.get(interest=customer.interest,
                                                                              interest__interest_type="Chit fund Interest",
                                                                              management_profile=management)

                        # FIX (Loss-of-Pay / discount revert): POST folds any
                        # discount into a "_settled" amount (amount +
                        # discount_amount) before touching
                        # principal_balance/penalty_balance_amt, and
                        # separately accumulates every discount onto
                        # discount_amt (the Loss-of-Pay source of truth read
                        # by the Chit Fund view / balance sheet /
                        # reconciliation). This DELETE branch used to only
                        # reverse `customer.amount`, never the discount
                        # portion and never discount_amt itself — leaving
                        # principal_balance permanently understated and
                        # Loss-of-Pay permanently inflated by every deleted
                        # discounted collection. Mirrored here exactly, one
                        # branch at a time, matching POST's math in reverse.
                        _discount = float(customer.discount_amount or 0)

                        if customer.interest_principle == True and customer.interest_field == False:
                            _settled = float(customer.amount or 0) + _discount
                            festival_get.principal_paid = float(festival_get.principal_paid) - _settled
                            festival_get.principal_balance = float(festival_get.principal_balance) + _settled

                            # FIX: POST's principal-only branch also drains
                            # penalty_paid_amt/penalty_balance_amt whenever
                            # the collection carried a penalty portion
                            # alongside principal (Apply-Penalty checkbox on,
                            # Interest checkbox off). This branch never
                            # reversed that half, so the penalty stayed
                            # marked as collected forever after delete.
                            _pen = float(customer.penalty_amount or 0)
                            if _pen > 0:
                                festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) - _pen
                                festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) + _pen

                            if _discount > 0:
                                festival_get.discount_amt = max(
                                    0.0, float(festival_get.discount_amt or 0) - _discount
                                )
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                interest_obj.paid_counts = int(interest_obj.paid_counts) - 1
                                interest_obj.save()

                        elif customer.interest_field == True and customer.interest_principle == False:
                            _pen_settled = float(customer.penalty_amount or 0) + _discount
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) - float(
                                customer.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) + float(
                                customer.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) - _pen_settled
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) + _pen_settled

                            if _discount > 0:
                                festival_get.discount_amt = max(
                                    0.0, float(festival_get.discount_amt or 0) - _discount
                                )
                            festival_get.save()

                        elif customer.interest_field == True and customer.interest_principle == True:

                            _prin_settled = float(customer.amount or 0) + _discount
                            festival_get.principal_paid = float(festival_get.principal_paid) - _prin_settled
                            festival_get.principal_balance = float(festival_get.principal_balance) + _prin_settled
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) - float(
                                customer.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) + float(
                                customer.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) - float(
                                customer.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) + float(
                                customer.penalty_amount)

                            if _discount > 0:
                                festival_get.discount_amt = max(
                                    0.0, float(festival_get.discount_amt or 0) - _discount
                                )
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                interest_obj.paid_counts = int(interest_obj.paid_counts) - 1
                                interest_obj.save()
                        chit_fund_obj = ChitFundsDetails.objects.filter(id=customer.interest.chitt_fund.id)
                        if chit_fund_obj:
                            chit_fund_get = ChitFundsDetails.objects.get(id=customer.interest.chitt_fund.id)
                            if interest_obj.interest_category == "Installment Interest":
                                # FIX (profit-subtraction bug): this branch used to
                                # compute new_pro_amount WITHOUT dividing by
                                # interest_period, in both the percentage and
                                # non-percentage cases:
                                #
                                #   if interest_type_new == "percentage":
                                #       interest_obj_priciple_amount = (principal_amt * fix_interest_rate_percent) / 100
                                #       new_pro_amount = no_count_install * interest_obj_priciple_amount
                                #   else:
                                #       new_pro_amount = no_count_install * fix_interest_rate_percent
                                #
                                # That treated a SINGLE installment's profit share
                                # as if it carried the loan's ENTIRE interest
                                # amount (percentage case) or an undivided
                                # per-period rate (fixed-rate case) — inflating
                                # new_pro_amount by roughly a factor of
                                # interest_period. Since profit_amount was then
                                # reduced by that inflated new_pro_amount, deleting
                                # a single installment collection could wipe out
                                # most or all of the chit fund's profit.
                                #
                                # POST (add_collection_details) always divides by
                                # interest_period:
                                #   percentage: new_pro_amount = interest_amt / interest_period
                                #   fixed-rate: new_pro_amount = no_count_install * (fix_interest_rate_percent / interest_period)
                                # Mirrored exactly here so DELETE reverses precisely
                                # what POST applied.
                                if interest_obj.interest_type_new == "percentage":
                                    new_pro_amount = float(interest_obj.interest_amt) / float(
                                        interest_obj.interest_period)
                                else:
                                    new_pro_amount = float(customer.no_count_install) * float(
                                        interest_obj.fix_interest_rate_percent / interest_obj.interest_period)
                                new_principal_amt = float(customer.amount) - new_pro_amount

                                # FIX (cash_inhand_amount under-reversal): POST's
                                # Installment Interest branch credits
                                # cash_inhand_amount with
                                # `temp_family.amount + temp_family.penalty_amount`
                                # (see the matching POST block above — it never
                                # includes interst_amount here since installment
                                # loans don't carry a separate interest figure).
                                # This line used to subtract ONLY
                                # `customer.amount`, silently dropping the penalty
                                # portion. For a penalty-only collection
                                # (customer.amount == 0, e.g. "penalty with
                                # discount"), that meant NOTHING was subtracted —
                                # cash_inhand_amount stayed permanently inflated by
                                # the full penalty amount after every such delete.
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) - float(new_principal_amt)
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) - float(
                                    customer.amount) - float(customer.penalty_amount)
                                chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) - float(
                                    new_pro_amount) - float(customer.penalty_amount)
                                chit_fund_get.save()
                            else:
                                # FIX: also reverse interst_amount and
                                # penalty_amount here — POST's non-installment
                                # branch credits cash_inhand_amount with
                                # amount + interst_amount + penalty_amount, but
                                # this previously only subtracted `amount`,
                                # leaving cash_inhand_amount permanently
                                # inflated by whatever interest/penalty was
                                # collected on that row.
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) - float(customer.amount)
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) - float(
                                    customer.amount) - float(customer.interst_amount) - float(customer.penalty_amount)
                                chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) - float(
                                    customer.interst_amount) - float(customer.penalty_amount)
                                chit_fund_get.save()

                        # festival_get.credit_amt = float(festival_get.credit_amt)-float(customer.amount)
                        festival_get.debit_amt = float(festival_get.debit_amt) - float(customer.amount) - float(
                            customer.penalty_amount) - float(customer.interst_amount)
                        festival_get.balance_amt = float(festival_get.balance_amt) + float(customer.amount) + float(
                            customer.penalty_amount) + float(customer.interst_amount)

                        festival_get.save()

                elif customer.collection_category == "Chit-fund":
                    festival_new = PeopleInterestBalanceSheet.objects.filter(interest=customer.interest,
                                                                             interest__member=customer.member)
                    if festival_new:
                        festival_new_get = PeopleInterestBalanceSheet.objects.get(interest=customer.interest,
                                                                                  interest__member=customer.member)
                        festival_new_get.credit_amt += float(customer.amount)
                        festival_new_get.debit_amt -= float(customer.amount)
                        festival_new_get.balance += float(customer.amount)

                        festival_new_get.save()



                elif customer.collection_category == "Balance":
                    import json
                    split = json.loads(customer.balance_split_json or '{}')
                    member_portion = float(split.get('member_portion', 0) or 0)
                    rows = split.get('rows', [])

                    for row in rows:
                        r = PeoplesAmountDetails.objects.filter(id=row['id']).first()
                        if r is not None:
                            applied = float(row['amount'])
                            r.total_paid_amt = float(r.total_paid_amt) - applied
                            r.total_bal_amt = float(r.total_bal_amt) + applied
                            r.paid = False
                            r.save()

                    if member_portion > 0:
                        _m = Member_Details.objects.filter(id=customer.member.id).first()
                        if _m is not None:
                            _m.balance_paid_amount = float(_m.balance_paid_amount or 0) - member_portion
                            _m.balance_pending_amt = float(_m.balance_pending_amt or 0) + member_portion
                            _m.balance_amt_paid = False
                            _m.save()

                    # FIX: also reverse the member's own balance_pending_amt /
                    # balance_paid_amount (the part add_collection_details applies
                    # FIRST). The original delete never touched this half at all,
                    # so repeated delete/recreate cycles permanently drift those
                    # two fields away from reality.
                    _member_for_balance = Member_Details.objects.filter(id=customer.member.id).first()
                    if _member_for_balance is not None:
                        _reverse_amt = min(
                            float(customer.amount or 0),
                            float(_member_for_balance.balance_paid_amount or 0),
                        )
                        if _reverse_amt > 0:
                            _member_for_balance.balance_paid_amount = float(
                                _member_for_balance.balance_paid_amount or 0
                            ) - _reverse_amt
                            _member_for_balance.balance_pending_amt = float(
                                _member_for_balance.balance_pending_amt or 0
                            ) + _reverse_amt
                            _member_for_balance.balance_amt_paid = False
                            _member_for_balance.save()
                elif customer.collection_category == "Moveable Rent":
                    festival_new = MoveableRentBalanceSheet.objects.filter(moveablerent=customer.moveablerent)
                    if festival_new:
                        festival_new_get = MoveableRentBalanceSheet.objects.get(moveablerent=customer.moveablerent)
                        festival_new_get.paid = False
                        festival_new_get.save()

                        move_asset = MovableAssetsRents.objects.filter(id=customer.moveablerent.id).first()
                        move_asset.end_date = None
                        move_asset.action = True
                        move_asset.save()
                        move_asset_tab = MovableAssetsRentTable.objects.filter(movable_rent=move_asset)
                        for move in move_asset_tab:
                            move_asset_tab_obj = MovableAssetsRentTable.objects.get(id=move.id)
                            asset_obj = MoveableAssetDetails.objects.get(id=move_asset_tab_obj.asset.id)
                            asset_obj.avilable_qty = float(asset_obj.avilable_qty) - float(move_asset_tab_obj.qnty)
                            asset_obj.save()
                        if customer.moveable_asset_payment == "Paid":
                            if customer.ref_moverent_bal < move_asset.advance_amt:
                                # bal_new=float(move_asset.advance_amt)- float(festival_get.balance_amt)
                                manage_treasure = ManagementTreasure.objects.filter(management_profile=management)
                                if manage_treasure:
                                    manage_treasure_get = ManagementTreasure.objects.get(management_profile=management)
                                    manage_treasure_get.cash_in_hand = float(manage_treasure_get.cash_in_hand) + float(
                                        customer.amount)
                                    manage_treasure_get.expence_amt = float(manage_treasure_get.expence_amt) - float(
                                        customer.amount)

                                    manage_treasure_get.save()
                                    festival_new_get.debit_amt = float(festival_new_get.debit_amt) + float(
                                        customer.amount) - float(move_asset.advance_amt)
                                    festival_new_get.balance_amt = customer.ref_moverent_bal
                                    festival_new_get.save()
                                    move_asset.settled_amount = 0
                                    move_asset.save()


                        elif customer.moveable_asset_payment == "Received":
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(
                                customer.amount) + float(move_asset.advance_amt)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(
                                customer.amount) - float(move_asset.advance_amt)
                            festival_new_get.save()

                            manage_treasure = ManagementTreasure.objects.filter(management_profile=management)
                            if manage_treasure:
                                manage_treasure_get = ManagementTreasure.objects.get(management_profile=management)
                                if customer.bank_link != None:
                                    manage_treasure_get.bank_amt = float(manage_treasure_get.bank_amt) - float(
                                        customer.amount)
                                    manage_treasure_get.save()
                                    bank_obj2 = BankDetails.objects.filter(id=customer.bank_link.id).first()
                                    bank_obj2.credit_amt = float(bank_obj2.credit_amt) - float(customer.amount)
                                    bank_obj2.save()
                                else:
                                    manage_treasure_get.cash_in_hand = float(manage_treasure_get.cash_in_hand) - float(
                                        customer.amount)
                                    manage_treasure_get.save()
                        move_asset.collected_by = None
                        move_asset.save()
                if customer.sub_tariff != None or customer.festivals != None or customer.sub_tariff != None or customer.death_tariff != None or customer.marriage != None or customer.collection_category == "Balance":

                    if customer.sub_tariff != None:
                        if customer.present == True:
                            mem_report = TempleMemberReport.objects.filter(collection=customer).first()
                            new_mem_report_obj = TempleMemberReport.objects.filter(id__gt=mem_report.id,
                                                                                   members=mem_report.members.id)
                            for new_mem in new_mem_report_obj:
                                new = TempleMemberReport.objects.get(id=new_mem.id)
                                new.balance_amt = float(new.balance_amt) + float(customer.amount)
                                new.save()
                        else:
                            mem_report = TempleMemberReport.objects.filter(collection=customer).first()
                            new_mem_report_obj = TempleMemberReport.objects.filter(id__gt=mem_report.id,
                                                                                   members=mem_report.members.id)
                            for new_mem in new_mem_report_obj:
                                new = TempleMemberReport.objects.get(id=new_mem.id)
                                new.balance_amt = float(new.balance_amt) + float(customer.amount) - float(
                                    festival_new_get.exception_amount)
                                new.save()
                    else:
                        mem_report = TempleMemberReport.objects.filter(collection=customer).first()
                        new_mem_report_obj = TempleMemberReport.objects.filter(id__gt=mem_report.id,
                                                                               members=mem_report.members.id)
                        for new_mem in new_mem_report_obj:
                            new = TempleMemberReport.objects.get(id=new_mem.id)
                            new.balance_amt = float(new.balance_amt) + float(customer.amount)
                            new.save()
                customer.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)




@api_view(['GET', 'POST'])
def get_select_type(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)

    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':

        data = request.data['category']
        if data == "Fund":
            if get_role == "User" and perm.fund == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = FundGroupDetails.objects.filter(action=True, management_profile=management)

                serializer = FundGroupDetailsSerializer(fund, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)
        elif data == "Festival":
            if get_role == "User" and perm.festival == True or get_role == "Admin" or rejin.is_superuser == True:
                today = date.today()
                # Show all active festivals within their valid date window.
                # Member-level filtering (paid/unpaid) is done after festival selection.
                fund = ADDFestivalDetails.objects.filter(
                    action=True,
                    management_profile=management,
                    start_date__lte=today,
                    end_date__gte=today,
                )
                serializer = ADDFestivalDetailsSerializer(fund, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        elif data == "Rent":


            if get_role == "User" and perm.rent == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = RentalAndLeaseDetails.objects.filter(rent=True, management_profile=management)
                new_list = []
                for new_fund in fund:
                    fund_obj = RentalAndLeaseDetails.objects.get(id=new_fund.id)
                    move_bal = RentalBalanceSheet.objects.filter(rental_new_amt=fund_obj)
                    if move_bal:
                        move_bal_obj = RentalBalanceSheet.objects.get(rental_new_amt=fund_obj)

                        if move_bal_obj.balance_amt > 0:
                            new_list.append(fund_obj)
                serializer = Rental_serializers(new_list, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)
        elif data == "Lease":
            if get_role == "User" and perm.lease == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = RentalAndLeaseDetails.objects.filter(rent=False, management_profile=management)
                new_list = []
                for new_fund in fund:
                    fund_obj = RentalAndLeaseDetails.objects.get(id=new_fund.id)
                    move_bal = RentalBalanceSheet.objects.filter(rental_new_amt=fund_obj)
                    if move_bal:
                        move_bal_obj = RentalBalanceSheet.objects.get(rental_new_amt=fund_obj)

                        if move_bal_obj.balance_amt > 0:
                            new_list.append(fund_obj)
                serializer = Rental_serializers(new_list, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)
        elif data == "Subscription Tariff":
            if get_role == "User" and perm.sub_tariff == True or get_role == "Admin" or rejin.is_superuser == True:
                today = date.today()
                # Only list tariffs whose validity window (from_date..to_date, set
                # when the tariff was created) currently covers today — same rule
                # as the Festival branch above.
                fund = ADDSubscriptionTariffDetails.objects.filter(
                    action=True,
                    management_profile=management,
                    from_date__lte=today,
                    to_date__gte=today,
                )
                fund_list = []
                for fund_obj in fund:
                    amount_obj = PeoplesAmountDetails.objects.filter(sub_tariff_id=fund_obj.id, penalty=False,
                                                                    paid=False, management_profile=management)
                    if amount_obj:
                        fund_list.append(fund_obj)
                serializer = ADDSubscriptionTariffDetailseSerializer(fund_list, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)


        elif data == "Management Interest":
            if get_role == "User" and perm.management_interest == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = PeopleInterestDetails.objects.filter(action=True, interest_type="Management Interest",
                                                            management_profile=management)
                serializer = PeopleInterestDetailsSerializer(fund, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)


        elif data == "Chit Interest":
            if get_role == "User" and perm.chit_interest == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = PeopleInterestDetails.objects.filter(action=True, interest_type="Chit fund Interest",
                                                            management_profile=management)
                serializer = PeopleInterestDetailsSerializer(fund, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        elif data == "Death Tariff":
            if get_role == "User" and perm.death_tariff == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = DeathDetails.objects.filter(action=True, mangement=management)
                fund_list = []
                for fund_obj in fund:
                    amount = PeoplesAmountDetails.objects.filter(death_id=fund_obj.id, penalty=False, paid=False,
                                                                 management_profile=management)
                    if amount:
                        fund_list.append(fund_obj)
                serializer = DeathDetailsSerializer(fund_list, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)
        elif data == "Moveable Rent":
            if get_role == "User" and perm.moveable_asset_rent == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = MovableAssetsRents.objects.filter(action=True, management_profile=management)
                new_list = []
                for new_fund in fund:
                    fund_obj = MovableAssetsRents.objects.get(id=new_fund.id)
                    move_bal = MoveableRentBalanceSheet.objects.get(moveablerent=fund_obj)
                    if move_bal.balance_amt > 0:
                        new_list.append(fund_obj)
                serializer = MovableAssetsRentsSerializer(new_list, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'GET':
        our_family = CollectionDetails.objects.filter(management_profile=management)
        serializer = CollectionDetailsSerializer(our_family, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def get_select_member_collection(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':

        data = request.data['category']
        type = request.data['type']
        today = date.today()  # <-- add this

        # Guard: for Subscription Tariff the "Choose Member" dropdown MUST
        # be scoped to a single active tariff that is currently within its
        # valid date window (from_date..to_date). If the caller omitted the
        # `type` (empty string / null), fall back to the newest tariff that
        # is BOTH action=True AND currently within its date window — not
        # just the newest action=True row, which could be expired.
        if data == "Subscription Tariff" and not type:
            latest_active = ADDSubscriptionTariffDetails.objects.filter(
                action=True,
                management_profile=management,
                from_date__lte=today,
                to_date__gte=today,
            ).order_by('-id').first()
            if latest_active:
                type = latest_active.id
            else:
                type = None  # no currently-valid tariff -> empty dropdown

        member = Member_Details.objects.filter(action=True)
        mem_list = []
        for mem in member:

            if data == "Subscription Tariff":
                # Only show members whose sub_tariff is action=True AND
                # currently within its from_date/to_date window. Filtering
                # on sub_tariff_id=type alone lets expired tariffs' unpaid
                # rows keep showing up in the dropdown after to_date passes.
                sub_filter = {
                    "sub_tariff__action": True,
                    "sub_tariff__from_date__lte": today,
                    "sub_tariff__to_date__gte": today,
                    "paid": False,
                }
                if type:
                    sub_filter["sub_tariff_id"] = type
                amount = PeoplesAmountDetails.objects.filter(
                    member=mem, management_profile=management, **sub_filter,
                )
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.sub_tariff is not None and mem_obj.total_bal_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)
            elif data == "Festival":
                amount = PeoplesAmountDetails.objects.filter(member=mem, festival_id=type, paid=False,
                                                             management_profile=management)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.festival != None and mem_obj.total_bal_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Marriage":
                amount = PeoplesAmountDetails.objects.filter(member=mem, management_profile=management, paid=False)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.marriage != None:

                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Death Tariff":
                amount = PeoplesAmountDetails.objects.filter(member=mem, death_id=type, paid=False,
                                                             management_profile=management)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.death != None and mem_obj.total_bal_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)


            elif data == "Balance":
                # FIX: this used to check `mem_obj.penalty_amount > 0` — a field
                # unrelated to whether the member has any outstanding balance —
                # so members with total_bal_amt == 0 (and balance_pending_amt == 0)
                # were still showing up in the "Choose Member" dropdown whenever
                # penalty_amount happened to be non-zero on some unrelated row.
                # Mirrors the correct calculation already used in get_member_balance
                # and get_amount_details: sum unpaid total_bal_amt across all
                # PeoplesAmountDetails rows for this member, plus their
                # balance_pending_amt if not yet paid off, and only include the
                # member when that total is actually > 0.
                unpaid_rows = PeoplesAmountDetails.objects.filter(
                    member=mem, management_profile=management, paid=False
                )
                total_bal = sum(float(r.total_bal_amt or 0) for r in unpaid_rows)
                if not mem.balance_amt_paid:
                    total_bal += float(mem.balance_pending_amt or 0)
                if total_bal > 0:
                    if mem not in mem_list:
                        mem_list.append(mem)

            elif data == "Rent":
                amount = RentalBalanceSheet.objects.filter(rental_new_amt__tenat_member=mem, rental_new_amt__rent=True,
                                                           rental_new_amt_id=type, management_profile=management)
                for new_mem in amount:
                    mem_obj = RentalBalanceSheet.objects.get(id=new_mem.id)
                    if mem_obj.credit_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Lease":
                amount = RentalBalanceSheet.objects.filter(rental_new_amt__tenat_member=mem, rental_new_amt__rent=False,
                                                           rental_new_amt_id=type, management_profile=management)
                for new_mem in amount:
                    mem_obj = RentalBalanceSheet.objects.get(id=new_mem.id)
                    if mem_obj.credit_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Fund":
                amount = FundMembersBalanceSheet.objects.filter(fund_m__fund_member=mem, fund_id=type,
                                                                management_profile=management)
                for new_mem in amount:
                    mem_obj = FundMembersBalanceSheet.objects.get(id=new_mem.id)
                    if mem_obj.balance_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Management Interest":
                amount = PeopleInterestBalanceSheet.objects.filter(interest__people_member=mem,
                                                                   interest__interest_type="Management Interest",
                                                                   interest_id=type, management_profile=management)
                for new_mem in amount:
                    mem_obj = PeopleInterestBalanceSheet.objects.get(id=new_mem.id)
                    if mem_obj.credit_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Chit Interest":
                amount = PeopleInterestBalanceSheet.objects.filter(interest__people_member=mem,
                                                                   interest__interest_type="Chit fund Interest",
                                                                   interest_id=type, management_profile=management)
                for new_mem in amount:
                    mem_obj = PeopleInterestBalanceSheet.objects.get(id=new_mem.id)
                    if mem_obj.credit_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)
        serializer = member_DetailsSerializer(mem_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)





@api_view(['GET', 'POST'])
def get_active_sub_tarrif(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':
        category = request.data['category']

        if category == "Subscription Tariff":
            sub = ADDSubscriptionTariffDetails.objects.filter(action=True, management_profile=management).last()
            ser = ADDFestivalDetailsSerializer(sub)
            return Response(ser.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def get_amount_details(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':

        member = request.data['member']
        data = request.data['category']
        type = request.data['type']
        if data == "Festival":
            amount_get = PeoplesAmountDetails.objects.filter(member_id=member, festival_id=type,
                                                             management_profile=management).first()
            serializer = PeoplesAmountDetailsSerializer(amount_get)
        elif data == "Subscription Tariff":
            amount_get = PeoplesAmountDetails.objects.filter(member_id=member, sub_tariff_id=type,
                                                             management_profile=management).first()
            serializer = PeoplesAmountDetailsSerializer(amount_get)
        elif data == "Marriage":
            amount_get = PeoplesAmountDetails.objects.filter(member_id=member, marriage_id=type,
                                                             management_profile=management).first()
            serializer = PeoplesAmountDetailsSerializer(amount_get)

        elif data == "Death Tariff":
            amount_get = PeoplesAmountDetails.objects.filter(member_id=member, death_id=type,
                                                             management_profile=management).first()
            serializer = PeoplesAmountDetailsSerializer(amount_get)

        elif data == "Balance":
            unpaid_rows = PeoplesAmountDetails.objects.filter(
                member_id=member, management_profile=management, paid=False
            )
            total_bal = sum(float(r.total_bal_amt or 0) for r in unpaid_rows)
            mem_obj = Member_Details.objects.filter(id=member).first()
            if mem_obj and not mem_obj.balance_amt_paid:
                total_bal += float(mem_obj.balance_pending_amt or 0)
            return Response({'total_bal_amt': total_bal}, status=status.HTTP_200_OK)

        elif data == "Rent":
            amount_get = RentalBalanceSheet.objects.filter(rental_new_amt_id=type,
                                                           management_profile=management).first()

            serializer = RentalBalanceSheetSerializer(amount_get)

        elif data == "Lease":
            amount_get = RentalBalanceSheet.objects.filter(rental_new_amt_id=type,
                                                           management_profile=management).first()
            serializer = RentalBalanceSheetSerializer(amount_get)


        elif data == "Management Interest":
            amount_get = PeopleInterestBalanceSheet.objects.filter(interest_id=type,
                                                                   management_profile=management).first()
            serializer = PeopleInterestBalanceSheetSerializer(amount_get)



        elif data == "Chit Interest":
            amount_get = PeopleInterestBalanceSheet.objects.filter(interest_id=type,
                                                                   management_profile=management).first()
            serializer = PeopleInterestBalanceSheetSerializer(amount_get)


        elif data == "Fund":
            amount_get = FundMembersBalanceSheet.objects.filter(fund_m_id=member, fund_id=type,
                                                                management_profile=management).first()
            serializer = FundMembersBalanceSheetSerializer(amount_get)

        elif data == "Moveable Rent":
            amount_get = MoveableRentBalanceSheet.objects.filter(moveablerent_id=type,
                                                                 management_profile=management).first()
            serializer = MoveableRentBalanceSheetSerializer(amount_get)

        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def get_sub_tariff_details(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "POST":
        member = request.data['member']
        type = request.data['type']
        # present =request.data['present']

        amount_get = PeoplesAmountDetails.objects.filter(member_id=member, sub_tariff_id=type,
                                                         management_profile=management).last()
        serializer = PeoplesAmountDetailsSerializer(amount_get)

        sub_tari = ADDSubscriptionTariffDetails.objects.filter(id=type, action=True,
                                                               management_profile=management).last()

        sub_tari_ser = ADDSubscriptionTariffDetailseSerializer(sub_tari)

        dic = {}
        dic['amount_ser'] = serializer.data
        dic['sub_tari_ser'] = sub_tari_ser.data
        return Response(dic, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def get_member_balance(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "POST":
        data = request.data['category']
        amount = PeoplesAmountDetails.objects.filter(penalty=True, paid=False, management_profile=management)

        if data == "Balance":

            member = Member_Details.objects.filter(action=True)
            list = []
            for mem in member:
                dic = {}
                ser = member_DetailsSerializer(mem)
                people_amt = PeoplesAmountDetails.objects.filter(
                    member_id=mem.id, paid=False, management_profile=management
                )
                amt = 0
                for peo_amt in people_amt:
                    amt += float(peo_amt.total_bal_amt or 0)

                if mem.balance_pending_amt and float(mem.balance_pending_amt) > 0:
                    amt += float(mem.balance_pending_amt)
                dic['list'] = ser.data
                dic['amount'] = amt
                if amt > 0:
                    list.append(dic)
            return Response(list, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def get_marriage_detail(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "POST":
        data = request.data['category']
        amount = PeoplesAmountDetails.objects.filter(paid=False, management_profile=management)

        if data == "Marriage":
            amount = PeoplesAmountDetails.objects.filter(paid=False, management_profile=management)
            list = []
            for new_mem in amount:
                mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                mem_ser = PeoplesAmountDetailsSerializer(mem_obj)
                dic = {}
                if mem_obj.marriage != None:
                    dic['list'] = f'{mem_obj.member.member_name}' + "/" + f'{mem_obj.marriage.marriage_no}'
                    dic['ser'] = mem_ser.data
                    dic['mobile_number'] = mem_obj.member.member_mobile_number
                    list.append(dic)

            return Response(list, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def collection_summary_user(request, pk):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()

    if request.method == "GET":
        if get_role == "User" or get_role == "Admin" or rejin.is_superuser == True:
            # user=User.objects.all()
            # for i in user:
            collection = CollectionDetails.objects.filter(created_by=pk, pay_date=datetime.today(),
                                                          management_profile=management)
            collection_ser = CollectionDetailsSerializer(collection, many=True)

            dic = {}
            dic['collection'] = collection_ser

            return Response(dic, status=status.HTTP_200_OK)
        return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'POST'])
def collection_summary_user_date(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()

    if request.method == "POST":
        jj = request.data['range']
        end_date = jj['end_date']
        start_date = jj['start_date']
        user_id = request.data['user_id']
        if start_date and end_date:
            start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
            collection = CollectionDetails.objects.filter(created_by=user_id, pay_date__gte=start_date_time_obj,
                                                          pay_date__lte=end_date_time_obj,
                                                          management_profile=management).order_by('-created_at')
            collection_ser = CollectionDetailsSerializer(collection, many=True)

            dic = {}
            dic['collection'] = collection_ser

            return Response(collection_ser.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def collection_user_list(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            permm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    user = User.objects.all()
    list = []
    for i in user:
        user_obj = User.objects.get(id=i.id)
        if user_obj.user_role == "Admin" or user_obj.is_superuser == True:
            if user_obj not in list:
                dic2 = {}
                if user_obj.is_superuser == True:
                    dic2['name'] = "Superuser"
                else:
                    dic2['name'] = user_obj.name

                dic2['id'] = user_obj.id
                dic2['email'] = user_obj.email
                dic2['username'] = user_obj.username
                dic2['user_role'] = user_obj.user_role
                dic2['role_name'] = user_obj.role_name
                dic2['person_email'] = user_obj.person_email
                dic2['othersname'] = user_obj.othersname
                dic2['status'] = user_obj.status
                dic2['address'] = user_obj.address
                dic2['mobile_number'] = user_obj.mobile_number
                dic2['user_native_type'] = user_obj.user_native_type
                dic2['member_no'] = user_obj.member_no

                list.append(dic2)
        elif user_obj.user_role == "User":

            if user_obj not in list:
                # list.append(user_obj)
                dic2 = {}
                dic2['name'] = user_obj.name
                dic2['id'] = user_obj.id
                dic2['email'] = user_obj.email
                dic2['username'] = user_obj.username
                dic2['user_role'] = user_obj.user_role
                dic2['role_name'] = user_obj.role_name
                dic2['person_email'] = user_obj.person_email
                dic2['othersname'] = user_obj.othersname
                dic2['status'] = user_obj.status
                dic2['address'] = user_obj.address
                dic2['mobile_number'] = user_obj.mobile_number
                dic2['user_native_type'] = user_obj.user_native_type
                dic2['member_no'] = user_obj.member_no
                list.append(dic2)


    dic = {}
    dic['user'] = list
    return Response(dic, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def collection_list_filter_by_user(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "GET":
        collection = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management).order_by(
            '-created_at')
        collection_ser = CollectionDetailsSerializer(collection, many=True)

        dic = {}
        dic['collection'] = collection_ser

        return Response(collection_ser.data, status=status.HTTP_200_OK)


    elif request.method == "POST":
        jj = request.data['range']
        end_date = jj['end_date']
        start_date = jj['start_date']
        # user_id=request.data['user_id']
        if start_date and end_date:
            start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
            collection = CollectionDetails.objects.filter(created_by=rejin.id, pay_date__gte=start_date_time_obj,
                                                          pay_date__lte=end_date_time_obj,
                                                          management_profile=management).order_by('-created_at')
            collection_ser = CollectionDetailsSerializer(collection, many=True)

            dic = {}
            dic['collection'] = collection_ser

            return Response(collection_ser.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def unpaid_list(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':

        data = request.data['category']

        if data == "Festival":
            if get_role == "User" and perm.festival == True or get_role == "Admin" or rejin.is_superuser == True:
                today = date.today()
                fund = ADDFestivalDetails.objects.filter(
                    management_profile=management,
                    start_date__lte=today,
                    end_date__gte=today,
                )
                serializer = ADDFestivalDetailsSerializer(fund, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        elif data == "Subscription Tariff":
            if get_role == "User" and perm.sub_tariff == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = ADDSubscriptionTariffDetails.objects.filter(management_profile=management)
                serializer = ADDSubscriptionTariffDetailseSerializer(fund, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        elif data == "Death Tariff":
            if get_role == "User" and perm.death_tariff == True or get_role == "Admin" or rejin.is_superuser == True:
                fund = DeathDetails.objects.filter(mangement=management, old_death=False)
                serializer = DeathDetailsSerializer(fund, many=True)
            else:
                return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def unpaid_list_member(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':

        data = request.data['category']
        type = request.data['type']
        member = Member_Details.objects.filter(action=True)
        mem_list = []
        amount_list = []

        if data == "Subscription Tariff":
            amount = PeoplesAmountDetails.objects.filter(management_profile=management, paid=False, sub_tariff_id=type)

        elif data == "Festival":
            amount = PeoplesAmountDetails.objects.filter(festival_id=type, management_profile=management, paid=False)



        elif data == "Death Tariff":
            amount = PeoplesAmountDetails.objects.filter(death_id=type, management_profile=management, paid=False)


        elif data == "Marriage":
            amount = []
            new_amount = PeoplesAmountDetails.objects.filter(management_profile=management, paid=False)
            for new_mem in new_amount:
                mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                if mem_obj.marriage != None and mem_obj.total_bal_amt > 0:
                    amount.append(mem_obj)
        serializer = member_DetailsSerializer(mem_list, many=True)
        ser = PeoplesAmount123DetailsSerializer(amount, many=True)
        dic = {}
        dic['member'] = serializer.data
        dic['amount'] = ser.data

        return Response(dic, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def unpaid_list_member_date_filter(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == 'POST':

        data = request.data['category']

        jj = request.data['range']
        end_date = jj['end_date']
        start_date = jj['start_date']
        if start_date and end_date:
            start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
            member = Member_Details.objects.filter(action=True)
            mem_list = []
            # for mem in member:

            if data == "Subscription Tariff":
                amount = []
                new_amount = PeoplesAmountDetails.objects.filter(management_profile=management, paid=False,
                                                                 created_at__date__gte=start_date_time_obj,
                                                                 created_at__date__lte=end_date_time_obj)
                for new_mem in new_amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.sub_tariff != None:
                        amount.append(mem_obj)
            elif data == "Festival":
                amount = []
                new_amount = PeoplesAmountDetails.objects.filter(management_profile=management, paid=False,
                                                                 created_at__date__gte=start_date_time_obj,
                                                                 created_at__date__lte=end_date_time_obj)
                for new_mem in new_amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.festival != None:
                        amount.append(mem_obj)



            elif data == "Death Tariff":
                amount = []
                new_amount = PeoplesAmountDetails.objects.filter(management_profile=management, paid=False,
                                                                 created_at__date__gte=start_date_time_obj,
                                                                 created_at__date__lte=end_date_time_obj)
                for new_mem in new_amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.death != None:
                        amount.append(mem_obj)

            elif data == "Marriage":
                amount = []
                new_amount = PeoplesAmountDetails.objects.filter(management_profile=management, paid=False,
                                                                 created_at__date__gte=start_date_time_obj,
                                                                 created_at__date__lte=end_date_time_obj)
                for new_mem in new_amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.marriage != None and mem_obj.total_bal_amt > 0:
                        amount.append(mem_obj)
            serializer = member_DetailsSerializer(mem_list, many=True)
            ser = PeoplesAmount123DetailsSerializer(amount, many=True)
            dic = {}
            dic['member'] = serializer.data
            dic['amount'] = ser.data

            return Response(dic, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def collection_amountdetails_filter_by_user_list(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "GET":
        user = User.objects.all()
        list_new = []
        for i in user:
            user_obj = User.objects.get(id=i.id)
            if user_obj.user_role == "Admin" or user_obj.is_superuser == True:
                if user_obj not in list_new:
                    list_new.append(user_obj)
            elif user_obj.user_role == "User":

                list_new.append(user_obj)
        list = []
        for user_list in list_new:
            fest_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                        collection_category="Festival").order_by('-created_at')
            festi_amount = 0
            for j in fest_col:
                festi_amount = float(festi_amount) + float(j.amount)

            death_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                         collection_category="Death Tariff").order_by('-created_at')
            death_amount = 0
            for death in death_col:
                death_amount = float(death_amount) + float(death.amount)
            sub_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                       collection_category="Subscription Tariff").order_by(
                '-created_at')
            sub_amount = 0
            for sub in sub_col:
                sub_amount = float(sub_amount) + float(sub.amount)
            ######
            marriage_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                            collection_category="Marriage").order_by('-created_at')
            marriage_amount = 0
            for marge in marriage_col:
                marriage_amount = float(marriage_amount) + float(marge.amount)

            bal_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                       collection_category="Balance").order_by('-created_at')
            bal_amount = 0
            for bal in bal_col:
                bal_amount = float(bal_amount) + float(bal.amount)

            lease_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                         collection_category="Lease").order_by('-created_at')
            lease_amount = 0
            for lease in lease_col:
                lease_amount = float(lease_amount) + float(lease.amount)

            income_det = ADDIncomeDetails.objects.filter(management_profile=management,
                                                         created_by=user_list.id).order_by('-created_at')
            income_amount = 0
            for inc in income_det:
                income_amount = float(income_amount) + float(inc.income_amt)

            exp_det = ADDExpenseDetails.objects.filter(management_profile=management, created_by=user_list.id).order_by(
                '-created_at')
            expense_amount = 0
            for exp in exp_det:
                expense_amount = float(expense_amount) + float(exp.expense_amt)

            mem_det = Member_Details.objects.filter(management_profile=management, created_by=user_list.id,
                                                    family__head_member_type="NEW").order_by('-created_at')
            join_amt = 0
            for mem in mem_det:
                join_amt = float(join_amt) + float(mem.member_joining_amt)

            rent_det = RentalAndLeaseDetails.objects.filter(management_profile=management, created_by=user_list.id)
            rent_advance = 0
            settlement_amt = 0
            for rent in rent_det:
                if rent.initial_advance_amt > 0:
                    rent_advance = float(rent_advance) + float(rent.initial_advance_amt)
                if rent.advance_settlement_amt > 0:
                    settlement_amt = float(settlement_amt) + float(rent.advance_settlement_amt)

            rent_col1 = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                         collection_category="Rent").order_by('-created_at')
            rent_amount = 0
            for rent1 in rent_col1:
                rent_amount = float(rent_amount) + float(rent1.amount)

            move_rent_details = MovableAssetsRents.objects.filter(management_profile=management,
                                                                  created_by=user_list.id)
            move_amount = 0
            for move in move_rent_details:
                if move.advance_amt > 0:
                    move_amount = float(move_amount) + float(move.advance_amt)

            move_col1 = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                         collection_category="Moveable Rent").order_by('-created_at')
            move_receive_amt = 0
            move_pay_amt = 0
            for move1 in move_col1:
                if move1.moveable_asset_payment == "Paid":
                    move_pay_amt = float(move_pay_amt) + float(move1.amount)
                elif move1.moveable_asset_payment == "Received":
                    move_receive_amt = float(move_receive_amt) + float(move1.amount)

            fund_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                        collection_category="Fund").order_by('-created_at')
            fund_amount = 0
            for fund in fund_col:
                fund_amount = float(fund_amount) + float(fund.amount)

            manage_inter_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                                collection_category="Management Interest").order_by(
                '-created_at')
            manageinter_amount = 0
            for manage_inter in manage_inter_col:
                manageinter_amount = float(manageinter_amount) + float(manage_inter.amount)

            chit_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                        collection_category="Chit Interest").order_by('-created_at')
            chit_amount = 0
            for chit in chit_col:
                chit_amount = float(chit_amount) + float(chit.amount)

            dic = {}
            dic['festi_amount'] = festi_amount
            dic['death_amount'] = death_amount
            dic['sub_amount'] = sub_amount
            dic['marriage_amount'] = marriage_amount
            dic['rent_amount'] = rent_amount
            dic['lease_amount'] = lease_amount
            dic['bal_amount'] = bal_amount
            dic['move_amount'] = move_amount
            dic['rent_settlement_amount'] = settlement_amt
            dic['rent_advance_amount'] = rent_advance
            dic['income_amount'] = income_amount
            dic['expense_amount'] = expense_amount
            dic['member_joining_amount'] = join_amt
            dic['move_receive_amt'] = move_receive_amt
            dic['move_pay_amt'] = move_pay_amt
            dic['fund_amount'] = fund_amount
            dic['manageinter_amount'] = manageinter_amount
            dic['chit_amount'] = chit_amount

            dic['total_amount'] = float(sub_amount) + float(festi_amount) + float(death_amount) + float(
                marriage_amount) + float(rent_amount) + float(bal_amount) + float(lease_amount) + float(
                move_amount) + float(rent_advance) + float(income_amount) + float(join_amt) + float(
                move_receive_amt) + float(fund_amount) + float(chit_amount) + float(manageinter_amount)
            dic['debit_amount'] = float(expense_amount) + float(settlement_amt) + float(move_pay_amt)
            dic['user_id'] = user_list.id
            if user_list.is_superuser == True:
                dic['user'] = "Superuser"
            else:
                dic['user'] = user_list.name
            tot_amt = float(sub_amount) + float(festi_amount) + float(death_amount) + float(marriage_amount) + float(
                rent_amount) + float(bal_amount) + float(lease_amount) + float(move_amount) + float(
                rent_advance) + float(income_amount) + float(join_amt) + float(move_receive_amt) + float(
                fund_amount) + float(chit_amount) + float(manageinter_amount)
            deb_amt = float(expense_amount) + float(settlement_amt) + float(move_pay_amt)
            if tot_amt > 0 or deb_amt > 0:
                list.append(dic)
        return Response(list, status=status.HTTP_200_OK)



    elif request.method == "POST":
        jj = request.data['range']
        end_date = jj['end_date']
        start_date = jj['start_date']
        if start_date and end_date:
            start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
            user = User.objects.all()
            list_new = []
            for i in user:
                user_obj = User.objects.get(id=i.id)
                if user_obj.user_role == "Admin" or user_obj.is_superuser == True:
                    if user_obj not in list_new:
                        list_new.append(user_obj)
                elif user_obj.user_role == "User":

                    list_new.append(user_obj)
                list = []
                for user_list in list_new:

                    fest_col = CollectionDetails.objects.filter(created_by=user_list.id,
                                                                pay_date__gte=start_date_time_obj,
                                                                pay_date__lte=end_date_time_obj,
                                                                management_profile=management,
                                                                collection_category="Festival").order_by('-created_at')
                    festi_amount = 0
                    for j in fest_col:
                        festi_amount = float(festi_amount) + float(j.amount)

                    death_col = CollectionDetails.objects.filter(created_by=user_list.id,
                                                                 pay_date__gte=start_date_time_obj,
                                                                 pay_date__lte=end_date_time_obj,
                                                                 management_profile=management,
                                                                 collection_category="Death Tariff").order_by(
                        '-created_at')
                    death_amount = 0
                    for death in death_col:
                        death_amount = float(death_amount) + float(death.amount)
                    sub_col = CollectionDetails.objects.filter(created_by=user_list.id,
                                                               pay_date__gte=start_date_time_obj,
                                                               pay_date__lte=end_date_time_obj,
                                                               management_profile=management,
                                                               collection_category="Subscription Tariff").order_by(
                        '-created_at')
                    sub_amount = 0
                    for sub in sub_col:
                        sub_amount = float(sub_amount) + float(sub.amount)

                    marriage_col = CollectionDetails.objects.filter(created_by=user_list.id,
                                                                    management_profile=management,
                                                                    collection_category="Marriage",
                                                                    pay_date__gte=start_date_time_obj,
                                                                    pay_date__lte=end_date_time_obj).order_by(
                        '-created_at')
                    marriage_amount = 0
                    for marge in marriage_col:
                        marriage_amount = float(marriage_amount) + float(marge.amount)

                    bal_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                               collection_category="Balance",
                                                               pay_date__gte=start_date_time_obj,
                                                               pay_date__lte=end_date_time_obj).order_by('-created_at')
                    bal_amount = 0
                    for bal in bal_col:
                        bal_amount = float(bal_amount) + float(bal.amount)

                    rent_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                                collection_category="Rent",
                                                                pay_date__gte=start_date_time_obj,
                                                                pay_date__lte=end_date_time_obj).order_by('-created_at')
                    rent_amount = 0
                    for rent in rent_col:
                        rent_amount = float(rent_amount) + float(rent.amount)

                    lease_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                                 collection_category="Lease",
                                                                 pay_date__gte=start_date_time_obj,
                                                                 pay_date__lte=end_date_time_obj).order_by(
                        '-created_at')
                    lease_amount = 0
                    for lease in lease_col:
                        lease_amount = float(lease_amount) + float(lease.amount)

                    move_col = CollectionDetails.objects.filter(created_by=user_list.id, management_profile=management,
                                                                collection_category="Moveable Rent",
                                                                pay_date__gte=start_date_time_obj,
                                                                pay_date__lte=end_date_time_obj).order_by('-created_at')
                    move_amount = 0
                    for move in move_col:
                        move_amount = float(move_amount) + float(move.amount)

                    dic = {}
                    dic['festi_amount'] = festi_amount
                    dic['death_amount'] = death_amount
                    dic['sub_amount'] = sub_amount
                    dic['marriage_amount'] = marriage_amount
                    dic['rent_amount'] = rent_amount
                    dic['lease_amount'] = lease_amount
                    dic['bal_amount'] = bal_amount
                    dic['move_amount'] = move_amount
                    dic['user_id'] = user_list.id
                    if user_list.is_superuser == True:
                        dic['user'] = "Superuser"
                    else:
                        dic['user'] = user_list.name
                    dic['total_amount'] = float(sub_amount) + float(festi_amount) + float(death_amount) + float(
                        marriage_amount) + float(rent_amount) + float(bal_amount) + float(lease_amount) + float(
                        move_amount)
                    tot_amt = float(sub_amount) + float(festi_amount) + float(death_amount) + float(
                        marriage_amount) + float(rent_amount) + float(bal_amount) + float(lease_amount) + float(
                        move_amount)
                    if tot_amt > 0:
                        list.append(dic)
                return Response(list, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def collection_amountdetails_filter_by_user(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "GET":

        list = []
        fest_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                    collection_category="Festival").order_by('-created_at')
        festi_amount = 0
        for j in fest_col:
            festi_amount = float(festi_amount) + float(j.amount)

        death_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                     collection_category="Death Tariff").order_by('-created_at')
        death_amount = 0
        for death in death_col:
            death_amount = float(death_amount) + float(death.amount)
        sub_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                   collection_category="Subscription Tariff").order_by('-created_at')
        sub_amount = 0
        for sub in sub_col:
            sub_amount = float(sub_amount) + float(sub.amount)
        marriage_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                        collection_category="Marriage").order_by('-created_at')
        marriage_amount = 0
        for marge in marriage_col:
            marriage_amount = float(marriage_amount) + float(marge.amount)

        bal_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                   collection_category="Balance").order_by('-created_at')
        bal_amount = 0
        for bal in bal_col:
            bal_amount = float(bal_amount) + float(bal.amount)

        rent_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                    collection_category="Rent").order_by('-created_at')
        rent_amount = 0
        for rent in rent_col:
            rent_amount = float(rent_amount) + float(rent.amount)

        lease_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                     collection_category="Lease").order_by('-created_at')
        lease_amount = 0
        for lease in lease_col:
            lease_amount = float(lease_amount) + float(lease.amount)

        move_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                    collection_category="Moveable Rent").order_by('-created_at')
        move_amount = 0
        for move in move_col:
            move_amount = float(move_amount) + float(move.amount)

        fund_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                    collection_category="Fund").order_by('-created_at')
        fund_amount = 0
        for fund in fund_col:
            fund_amount = float(fund_amount) + float(fund.amount)

        manage_inter_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                            collection_category="Management Interest").order_by(
            '-created_at')
        manageinter_amount = 0
        for manage_inter in manage_inter_col:
            manageinter_amount = float(manageinter_amount) + float(manage_inter.amount)

        chit_col = CollectionDetails.objects.filter(created_by=rejin.id, management_profile=management,
                                                    collection_category="Chit Interest").order_by('-created_at')
        chit_amount = 0
        for chit in chit_col:
            chit_amount = float(chit_amount) + float(chit.amount)

        dic = {}
        dic['festi_amount'] = festi_amount
        dic['death_amount'] = death_amount
        dic['sub_amount'] = sub_amount
        dic['user_id'] = rejin.id
        dic['marriage_amount'] = marriage_amount
        dic['rent_amount'] = rent_amount
        dic['lease_amount'] = lease_amount
        dic['bal_amount'] = bal_amount
        dic['move_amount'] = move_amount
        dic['fund_amount'] = fund_amount
        dic['manageinter_amount'] = manageinter_amount
        dic['chit_amount'] = chit_amount
        dic['total_amount'] = float(sub_amount) + float(festi_amount) + float(death_amount) + float(
            marriage_amount) + float(rent_amount) + float(bal_amount) + float(lease_amount) + float(
            move_amount) + float(fund_amount) + float(chit_amount) + float(manageinter_amount)

        if rejin.is_superuser == True:
            dic['user'] = "Superuser"
        else:
            dic['user'] = rejin.name
        tot_amt = float(sub_amount) + float(festi_amount) + float(death_amount) + float(marriage_amount) + float(
            rent_amount) + float(bal_amount) + float(lease_amount) + float(move_amount) + float(fund_amount) + float(
            chit_amount) + float(manageinter_amount)
        if tot_amt > 0:
            list.append(dic)
        return Response(list, status=status.HTTP_200_OK)



    elif request.method == "POST":
        jj = request.data['range']
        end_date = jj['end_date']
        start_date = jj['start_date']
        user_id = request.data['user_id']

        if start_date and end_date:
            start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()

            list = []
            fest_col = CollectionDetails.objects.filter(created_by=user_id, pay_date__gte=start_date_time_obj,
                                                        pay_date__lte=end_date_time_obj, management_profile=management,
                                                        collection_category="Festival").order_by('-created_at')
            festi_amount = 0
            for j in fest_col:
                festi_amount = float(festi_amount) + float(j.amount)

            death_col = CollectionDetails.objects.filter(created_by=user_id, pay_date__gte=start_date_time_obj,
                                                         pay_date__lte=end_date_time_obj, management_profile=management,
                                                         collection_category="Death Tariff").order_by('-created_at')
            death_amount = 0
            for death in death_col:
                death_amount = float(death_amount) + float(death.amount)
            sub_col = CollectionDetails.objects.filter(created_by=user_id, pay_date__gte=start_date_time_obj,
                                                       pay_date__lte=end_date_time_obj, management_profile=management,
                                                       collection_category="Subscription Tariff").order_by(
                '-created_at')
            sub_amount = 0
            for sub in sub_col:
                sub_amount = float(sub_amount) + float(sub.amount)

            marriage_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                            collection_category="Marriage",
                                                            pay_date__gte=start_date_time_obj,
                                                            pay_date__lte=end_date_time_obj).order_by('-created_at')
            marriage_amount = 0
            for marge in marriage_col:
                marriage_amount = float(marriage_amount) + float(marge.amount)

            bal_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                       collection_category="Balance", pay_date__gte=start_date_time_obj,
                                                       pay_date__lte=end_date_time_obj).order_by('-created_at')
            bal_amount = 0
            for bal in bal_col:
                bal_amount = float(bal_amount) + float(bal.amount)

            lease_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                         collection_category="Lease", pay_date__gte=start_date_time_obj,
                                                         pay_date__lte=end_date_time_obj).order_by('-created_at')
            lease_amount = 0
            for lease in lease_col:
                lease_amount = float(lease_amount) + float(lease.amount)

            income_det = ADDIncomeDetails.objects.filter(management_profile=management, created_by=user_id,
                                                         created_at__date__gte=start_date_time_obj,
                                                         created_at__date__lte=end_date_time_obj).order_by(
                '-created_at')
            income_amount = 0
            for inc in income_det:
                income_amount = float(income_amount) + float(inc.income_amt)

            exp_det = ADDExpenseDetails.objects.filter(management_profile=management, created_by=user_id,
                                                       created_at__date__gte=start_date_time_obj,
                                                       created_at__date__lte=end_date_time_obj).order_by('-created_at')
            expense_amount = 0
            for exp in exp_det:
                expense_amount = float(expense_amount) + float(exp.expense_amt)

            mem_det = Member_Details.objects.filter(management_profile=management, created_by=user_id,
                                                    family__head_member_type="NEW",
                                                    created_at__date__gte=start_date_time_obj,
                                                    created_at__date__lte=end_date_time_obj).order_by('-created_at')
            join_amt = 0
            for mem in mem_det:
                join_amt = float(join_amt) + float(mem.member_joining_amt)

            rent_det = RentalAndLeaseDetails.objects.filter(management_profile=management,
                                                            created_at__date__gte=start_date_time_obj,
                                                            created_at__date__lte=end_date_time_obj, created_by=user_id)
            rent_advance = 0
            settlement_amt = 0
            for rent in rent_det:
                if rent.initial_advance_amt > 0:
                    rent_advance = float(rent_advance) + float(rent.initial_advance_amt)
                if rent.advance_settlement_amt > 0:
                    settlement_amt = float(settlement_amt) + float(rent.advance_settlement_amt)

            collection_rent_obj = CollectionDetails.objects.filter(collection_category="Rent", created_by=user_id,
                                                                   pay_date__gte=start_date_time_obj,
                                                                   pay_date__lte=end_date_time_obj)
            rent_amount = 0
            for rent_col in collection_rent_obj:
                rent_amount = float(rent_amount) + float(rent_col.amount)

            move_rent_details = MovableAssetsRents.objects.filter(management_profile=management,
                                                                  created_at__date__gte=start_date_time_obj,
                                                                  created_at__date__lte=end_date_time_obj,
                                                                  created_by=user_id)
            move_amount = 0
            for move in move_rent_details:
                if move.advance_amt > 0:
                    move_amount = float(move_amount) + float(move.advance_amt)

            fund_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                        collection_category="Fund", pay_date__gte=start_date_time_obj,
                                                        pay_date__lte=end_date_time_obj).order_by('-created_at')
            fund_amount = 0
            for fund in fund_col:
                fund_amount = float(fund_amount) + float(fund.amount)

            manage_inter_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                                collection_category="Management Interest",
                                                                pay_date__gte=start_date_time_obj,
                                                                pay_date__lte=end_date_time_obj).order_by('-created_at')
            manageinter_amount = 0
            for manage_inter in manage_inter_col:
                manageinter_amount = float(manageinter_amount) + float(manage_inter.amount)

            chit_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                        collection_category="Chit Interest",
                                                        pay_date__gte=start_date_time_obj,
                                                        pay_date__lte=end_date_time_obj).order_by('-created_at')
            chit_amount = 0
            for chit in chit_col:
                chit_amount = float(chit_amount) + float(chit.amount)

            move_collection_obj = CollectionDetails.objects.filter(collection_category='Moveable Rent',
                                                                   created_by=user_id,
                                                                   pay_date__gte=start_date_time_obj,
                                                                   pay_date__lte=end_date_time_obj)
            move_receive_amt = 0
            move_pay_amt = 0
            for move_obj in move_collection_obj:
                if move_obj.moveable_asset_payment == "Paid":
                    move_pay_amt = float(move_pay_amt) + float(move_obj.amount)
                elif move_obj.moveable_asset_payment == "Received":
                    move_receive_amt = float(move_receive_amt) + float(move_obj.amount)

            fund_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                        collection_category="Fund", pay_date__gte=start_date_time_obj,
                                                        pay_date__lte=end_date_time_obj).order_by('-created_at')
            fund_amount = 0
            for fund in fund_col:
                fund_amount = float(fund_amount) + float(fund.amount)

            manage_inter_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                                collection_category="Management Interest",
                                                                pay_date__gte=start_date_time_obj,
                                                                pay_date__lte=end_date_time_obj).order_by('-created_at')
            manageinter_amount = 0
            for manage_inter in manage_inter_col:
                manageinter_amount = float(manageinter_amount) + float(manage_inter.amount)

            chit_col = CollectionDetails.objects.filter(created_by=user_id, management_profile=management,
                                                        collection_category="Chit Interest",
                                                        pay_date__gte=start_date_time_obj,
                                                        pay_date__lte=end_date_time_obj).order_by('-created_at')
            chit_amount = 0
            for chit in chit_col:
                chit_amount = float(chit_amount) + float(chit.amount)

            user_obj = User.objects.get(id=user_id)
            dic = {}
            dic['festi_amount'] = festi_amount
            dic['death_amount'] = death_amount
            dic['sub_amount'] = sub_amount
            dic['marriage_amount'] = marriage_amount
            dic['rent_amount'] = rent_amount
            dic['lease_amount'] = lease_amount
            dic['bal_amount'] = bal_amount
            dic['move_amount'] = move_amount
            dic['rent_settlement_amount'] = settlement_amt
            dic['rent_advance_amount'] = rent_advance
            dic['income_amount'] = income_amount
            dic['expense_amount'] = expense_amount
            dic['member_joining_amount'] = join_amt
            dic['move_receive_amt'] = move_receive_amt
            dic['move_pay_amt'] = move_pay_amt
            dic['fund_amount'] = fund_amount
            dic['manageinter_amount'] = manageinter_amount
            dic['chit_amount'] = chit_amount
            dic['total_amount'] = float(sub_amount) + float(festi_amount) + float(death_amount) + float(
                marriage_amount) + float(rent_amount) + float(bal_amount) + float(lease_amount) + float(
                move_amount) + float(rent_advance) + float(income_amount) + float(join_amt) + float(
                move_receive_amt) + float(fund_amount) + float(chit_amount) + float(manageinter_amount)
            dic['debit_amount'] = float(expense_amount) + float(settlement_amt) + float(move_pay_amt)
            dic['user_id'] = user_id
            if user_obj.is_superuser == True:
                dic['user'] = "Superuser"
            else:
                dic['user'] = user_obj.name
            tot_amt = float(sub_amount) + float(festi_amount) + float(death_amount) + float(marriage_amount) + float(
                rent_amount) + float(bal_amount) + float(lease_amount) + float(move_amount) + float(
                rent_advance) + float(income_amount) + float(join_amt) + float(move_receive_amt) + float(
                fund_amount) + float(chit_amount) + float(manageinter_amount)
            deb_amt = float(expense_amount) + float(settlement_amt) + float(move_pay_amt)
            if tot_amt > 0 or deb_amt > 0:
                list.append(dic)
            if not list:
                dic = {}
                dic['festi_amount'] = 0
                dic['death_amount'] = 0
                dic['sub_amount'] = 0
                dic['marriage_amount'] = 0
                dic['rent_amount'] = 0
                dic['lease_amount'] = 0
                dic['bal_amount'] = 0
                dic['move_amount'] = 0
                dic['rent_settlement_amount'] = 0
                dic['rent_advance_amount'] = 0
                dic['expense_amount'] = 0
                dic['member_joining_amount'] = 0
                dic['move_receive_amt'] = 0
                dic['move_pay_amt'] = 0
                dic['total_amount'] = 0
                dic['debit_amount'] = 0
                dic['fund_amount'] = 0
                dic['manageinter_amount'] = 0
                dic['chit_amount'] = 0

                dic['user_id'] = user_id
                if user_obj.is_superuser == True:
                    dic['user'] = "Superuser"
                else:
                    dic['user'] = user_obj.name
                list.append(dic)
            return Response(list, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def management_interest_member_details(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "GET":
        # type=request.data['type']
        fund_member = PeopleInterestDetails.objects.filter(interest_type='Management Interest', action=True,
                                                           management_profile=management)
        print(f"Filtered Fund Members: {fund_member.count()}")

        # Owner rule (Feb 2026 — QA COLLECTIONS_002 v2): only borrowers
        # who currently owe the CURRENT-period installment appear. See
        # ``_installment_expected_count`` for the day / week / month
        # semantics.  A borrower whose ``paid_counts`` >= expected count
        # is up-to-date for this period and must be hidden.
        today = date.today()
        fund_mem_list = []

        for fund in fund_member:
            mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id).first()
            if mem_obj1:
                mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)
                has_balance = (
                    mem_obj.penalty_balance_amt > 0
                    or mem_obj.intrest_balance_amt > 0
                    or mem_obj.principal_balance > 0
                )
                if not has_balance:
                    continue
                if fund.interest_category == "Installment Interest":
                    expected = _installment_expected_count(fund, today)
                    if int(fund.paid_counts or 0) >= expected:
                        continue
                fund_mem_list.append(mem_obj.interest)
        serializer = PeopleInterestDetailsSerializer(fund_mem_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)




@api_view(['GET', 'POST'])
def chit_fund_details(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "GET":
        fund_member = PeopleInterestDetails.objects.filter(interest_type='Chit fund Interest', action=True,
                                                           management_profile=management)
        fund_mem_list = []
        for fund in fund_member:
            if fund.chitt_fund != None:
                if fund.chitt_fund not in fund_mem_list:
                    fund_mem_list.append(fund.chitt_fund)
        serializer = ChitFundsDetailssSerializer(fund_mem_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def chitfund_interest_member_details(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "POST":
        type = request.data['type']
        fund_member = PeopleInterestDetails.objects.filter(chitt_fund_id=type, interest_type='Chit fund Interest',
                                                           action=True, management_profile=management)
        # Owner rule (Feb 2026 — QA COLLECTIONS_002 v2): "Choose Person"
        # must list ONLY borrowers who currently owe an installment for
        # THIS period (day / week / month) based on their
        # ``interest_period_type`` cadence. See
        # ``_installment_expected_count`` for the exact semantics — the
        # helper returns the number of installments the borrower should
        # have PAID by end of today's period. If ``paid_counts`` >=
        # expected, the borrower is up-to-date for this period and is
        # hidden. If ``paid_counts`` < expected, the borrower is behind
        # (or has just entered a new period without paying yet) and is
        # shown.
        #
        # Non-installment categories (Interest / Interest with capital)
        # keep the original "any outstanding balance" rule because there
        # is no cadence to compare against.
        today = date.today()
        fund_mem_list = []
        for fund in fund_member:
            mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
            if mem_obj1:
                mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)
                has_balance = (
                    mem_obj.penalty_balance_amt > 0
                    or mem_obj.intrest_balance_amt > 0
                    or mem_obj.principal_balance > 0
                )
                if not has_balance:
                    continue
                if fund.interest_category == "Installment Interest":
                    expected = _installment_expected_count(fund, today)
                    if int(fund.paid_counts or 0) >= expected:
                        continue
                fund_mem_list.append(mem_obj.interest)
        serializer = PeopleInterestDetailsSerializer(fund_mem_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# filter chit name based on category type
@api_view(['GET', 'POST'])
def chitname_withfiltering_category(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()

    if request.method == "POST":
        interest_category = request.data['interest_category']
        interest_type = request.data['interest_type']
        if interest_type == "Chit Interest":
            interest_type = "Chit fund Interest"
            type1 = request.data['type']
            chit_name = request.data['chit_name']

        # Owner rule (Feb 2026): honour the collection form's selected
        # `pay_date` so the "Choose Person" dropdown only lists borrowers
        # whose installment is due on-or-before that date. Falls back to
        # today when the frontend doesn't send `selected_date` (legacy
        # callers / cron jobs).
        _sel = request.data.get('selected_date')
        checking_date = date.today()
        if _sel:
            try:
                checking_date = datetime.strptime(_sel, "%Y-%m-%d").date()
            except (TypeError, ValueError):
                checking_date = date.today()

        checking_date_month = checking_date.month
        checking_date_year = checking_date.year
        checking_date_date = checking_date.day

        if interest_category in ["Interest", "Interest with capital"]:
            fund_mem_list = []
            interest_principle = request.data['interest_principle']
            interest_field = request.data['interest_field']

            # Base query for fund members
            if interest_type == "Chit fund Interest":
                fund_member = PeopleInterestDetails.objects.filter(
                    chitt_fund_id=type1, action=True, management_profile=management,
                    chit_name=chit_name, interest_category=interest_category, interest_type=interest_type
                )
            else:
                fund_member = PeopleInterestDetails.objects.filter(
                    action=True, management_profile=management,
                    interest_category=interest_category, interest_type=interest_type
                )

            for fund in fund_member:
                try:
                    mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
                    has_balance_sheet = mem_obj1.exists()
                    mem_obj = mem_obj1.get() if has_balance_sheet else None

                    if interest_category == "Interest with capital":
                        # Include records even without a balance sheet if they are eligible
                        if not has_balance_sheet:
                            # Assume new record with pending interest payment
                            if interest_field:
                                print(f"Adding fund {fund.id} to fund_mem_list (no balance sheet, interest_field=True)")
                                fund_mem_list.append(fund)
                            continue

                        # For records with balance sheet, check balances
                        if (interest_principle and mem_obj.principal_balance > 0) or \
                           (interest_field and (mem_obj.intrest_balance_amt > 0 or mem_obj.penalty_balance_amt > 0)):
                            # Check if the payment is due this month
                            apply_date = mem_obj.interest_apply_date
                            next_due_date = apply_date + relativedelta(months=1)
                            if next_due_date.year <= checking_date_year and \
                               next_due_date.month <= checking_date_month:
                                print(f"Adding fund {fund.id} to fund_mem_list for Interest with capital")
                                fund_mem_list.append(fund)
                    elif interest_category == "Interest":
                        if not has_balance_sheet:
                            print(f"Skipping fund {fund.id} for Interest (no balance sheet)")
                            continue

                        if interest_principle and not interest_field:
                            if mem_obj.principal_balance > 0:
                                fund_mem_list.append(fund)
                        elif not interest_principle and interest_field:
                            if mem_obj.penalty_balance_amt > 0 or mem_obj.intrest_balance_amt > 0:
                                apply_date = mem_obj.interest_apply_date
                                next_due_date = apply_date + relativedelta(months=1)
                                if next_due_date.year == checking_date_year and \
                                   next_due_date.month == checking_date_month:
                                    fund_mem_list.append(fund)
                        elif interest_principle and interest_field:
                            if mem_obj.principal_balance > 0 or \
                               mem_obj.penalty_balance_amt > 0 or \
                               mem_obj.intrest_balance_amt > 0:
                                apply_date = mem_obj.interest_apply_date
                                next_due_date = apply_date + relativedelta(months=1)
                                if next_due_date.year == checking_date_year and \
                                   next_due_date.month == checking_date_month:
                                    fund_mem_list.append(fund)
                except Exception as e:
                    print(f"Error processing fund {fund.id}: {e}")
                    continue

            # -------------------------------------------------------------
            # Owner rule (Feb 2026): Date-scoped post-filter for
            # non-installment interest (Interest / Interest with capital).
            # A row stays visible if the next expected interest apply
            # date is on-or-before the operator's selected date, OR the
            # borrower owes penalty / interest right now.
            _filtered = []
            for _f in fund_mem_list:
                try:
                    _bs = PeopleInterestBalanceSheet.objects.filter(interest_id=_f.id).first()
                    _pen = float(_bs.penalty_balance_amt or 0) if _bs else 0.0
                    _int = float(_bs.intrest_balance_amt or 0) if _bs else 0.0
                    if not (_pen > 0 or _int > 0) and _bs and _bs.interest_apply_date:
                        _next_due = _bs.interest_apply_date + relativedelta(months=1)
                        if _next_due > checking_date:
                            continue
                except Exception:
                    pass
                _filtered.append(_f)
            fund_mem_list = _filtered

            serializer = PeopleInterestDetailsSerializer(fund_mem_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif interest_category == "Installment Interest":

            interest_principle = request.data['interest_principle']
            interest_field = request.data['interest_field']
            if interest_principle == True and interest_field == False:
                if interest_type == "Chit Interest":
                    fund_member = PeopleInterestDetails.objects.filter(chitt_fund_id=type1, action=True,
                                                                       management_profile=management,
                                                                       chit_name=chit_name,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)
                else:
                    fund_member = PeopleInterestDetails.objects.filter(action=True, management_profile=management,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)

                fund_mem_list = []
                for fund in fund_member:
                    mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
                    if mem_obj1:
                        mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)

                        nnnn = mem_obj.interest.paid_counts

                        current_date = checking_date

                        # Owner rule (Feb 2026): use the operator's
                        # selected `checking_date` for the current
                        # month/year window so the "Choose Person"
                        # dropdown reflects the picked pay_date, not
                        # today.
                        month = checking_date.month
                        year = checking_date.year
                        number_of_days = calendar.monthrange(year, month)[1]
                        first_date = date(year, month, 1)
                        last_date = date(year, month, number_of_days)
                        delta = last_date - first_date
                        final_dates = []
                        for i in range(delta.days + 1):
                            final_dates.append((first_date + timedelta(days=i)))

                        last_day_of_month = calendar.monthrange(year, month)[1]
                        last_date = datetime(year, month, last_day_of_month)
                        start_date = datetime(year, month, 1)


                        # if mem_obj.interest.interest_period_type == "Month":
                        #     print('Processing monthly interest...')
                        #     try:
                        #         # Calculate the next expected payment date
                        #         next_expected_payment_date = mem_obj.interest.interest_date + relativedelta(
                        #             months=mem_obj.interest.paid_counts
                        #         )

                        #         # Retrieve the collection details for this interest
                        #         checking_collection_date = CollectionDetails.objects.filter(
                        #             interest_id=mem_obj.interest_id
                        #         )

                        #         # Check if payments are missing
                        #         if checking_collection_date.exists():
                        #             # Get the latest payment record
                        #             latest_payment = checking_collection_date.last()

                        #             # Check if the last payment date does not match the current month or year
                        #             if (
                        #                 latest_payment.pay_date.month != month
                        #                 or latest_payment.pay_date.year != year
                        #             ):
                        #                 fund_mem_list.append(mem_obj.interest)
                        #         else:
                        #             # If no collection records exist, add the person to the list
                        #             fund_mem_list.append(mem_obj.interest)

                        #         # Check if the interest period is over but payments are still pending
                        #         if mem_obj.interest.paid_counts < mem_obj.interest.interest_period:
                               
                        #             # Add to the fund list even if the interest period is over
                        #             if mem_obj.interest not in fund_mem_list:
                        #                 fund_mem_list.append(mem_obj.interest)

                        #     except Exception as e:
                        #         print(f"Error processing monthly interest: {e}")



                        if mem_obj.interest.interest_period_type == "Month":
                            print("Processing interest period in months...")

                            try:
                                # Retrieve collection details for the interest
                                checking_collection_months = CollectionDetails.objects.filter(
                                    interest_id=mem_obj.interest_id
                                )

                                terminating_date = mem_obj.interest.interest_date + relativedelta(
                                    months=mem_obj.interest.interest_period
                                )

                                # Calculate the number of months since the interest started
                                calcu_months = abs(mem_obj.interest.interest_date - date.today())
                                months_num = calcu_months.days // 30  # Approximate month count

                                checking_days_months = (
                                    mem_obj.interest.interest_date + relativedelta(months=months_num)
                                )
                                checking_days_months_limit = (
                                    mem_obj.interest.interest_date + relativedelta(months=months_num + 1)
                                )

                                dates = []
                                current_date = checking_days_months

                                # Generate valid dates within the month range
                                while current_date < checking_days_months_limit:
                                    dates.append(current_date)
                                    current_date += timedelta(days=1)

                                if checking_collection_months.exists():
                                    # Collection records exist
                                    checking_collection_month = checking_collection_months.last()
                                    last_payment_date = checking_collection_month.pay_date

                                    if (
                                        last_payment_date not in dates
                                        and mem_obj.interest.paid_counts < mem_obj.interest.interest_period
                                    ):
                                        # Check if terminating_date has passed but payments are still pending
                                        if terminating_date < date.today():
                                            print("Interest period is over but payments are still pending.")
                                        fund_mem_list.append(mem_obj.interest)
                                else:
                                    # Handle case where no collections exist
                                    if months_num > 0:
                                        print(
                                            mem_obj.interest_apply_date
                                            + relativedelta(months=mem_obj.interest.paid_counts)
                                        )

                                        if (
                                            (mem_obj.interest_apply_date + relativedelta(
                                                months=mem_obj.interest.paid_counts
                                            )) not in dates
                                            and mem_obj.interest.paid_counts < mem_obj.interest.interest_period
                                        ):
                                            # Check if terminating_date has passed but payments are still pending
                                            if terminating_date < date.today():
                                                print("Interest period is over but payments are still pending.")
                                            fund_mem_list.append(mem_obj.interest)

                            except Exception as e:
                                print(f"Error processing interest period in months: {e}")

                        elif mem_obj.interest.interest_period_type == "Days":
                            # CHIT_FUND_002 fix (Feb 2026): the old logic compared
                            # last_payment_date < next_expected_payment_date which
                            # fails whenever the payment is made ON the expected date
                            # (e.g. interest_date=Jan31, first payment on Feb1 →
                            # next_expected=Feb1, last_payment=Feb1 → Feb1 < Feb1 = False).
                            # Use the same _installment_expected_count helper already
                            # used in chitfund_interest_member_details for consistency:
                            # show the borrower whenever today's cumulative day-count
                            # exceeds their paid_counts (helper caps at interest_period
                            # so overdue borrowers with remaining installments still appear).
                            expected = _installment_expected_count(mem_obj.interest, date.today())
                            if int(mem_obj.interest.paid_counts or 0) < expected:
                                fund_mem_list.append(mem_obj.interest)


                        elif mem_obj.interest.interest_period_type == "Week":
                            print("Processing interest period in weeks...")

                            try:
                                # Retrieve collection details for the interest
                                checking_collection_weeks = CollectionDetails.objects.filter(
                                    interest_id=mem_obj.interest_id
                                )

                                terminating_date = mem_obj.interest.interest_date + relativedelta(
                                    weeks=mem_obj.interest.interest_period
                                )
                                calcu_weeks = abs(mem_obj.interest.interest_date - date.today())
                                weeks_num = calcu_weeks.days // 7
                                checking_days_weeks = (
                                        mem_obj.interest.interest_date + relativedelta(weeks=weeks_num)
                                )
                                checking_days_weeks_limit = (
                                        mem_obj.interest.interest_date + relativedelta(weeks=weeks_num + 1)
                                )
                                dates = []
                                current_date = checking_days_weeks

                                # Generate valid dates within the week range
                                while current_date < checking_days_weeks_limit:
                                    dates.append(current_date)
                                    current_date += timedelta(days=1)

                                if checking_collection_weeks.exists():
                                    # Collection records exist
                                    checking_collection_week = checking_collection_weeks.last()
                                    last_payment_date = checking_collection_week.pay_date

                                    if (
                                            last_payment_date not in dates
                                            and mem_obj.interest.paid_counts < mem_obj.interest.interest_period
                                    ):
                                        # Check if terminating_date has passed but payments are still pending
                                        if terminating_date < date.today():
                                            print("Interest period is over but payments are still pending.")
                                        fund_mem_list.append(mem_obj.interest)
                                else:
                                    # Handle case where no collections exist
                                    if weeks_num > 0:
                                        print(
                                            mem_obj.interest_apply_date
                                            + relativedelta(weeks=mem_obj.interest.paid_counts)
                                        )

                                        if (
                                                (mem_obj.interest_apply_date + relativedelta(
                                                    weeks=mem_obj.interest.paid_counts
                                                )) not in dates
                                                and mem_obj.interest.paid_counts < mem_obj.interest.interest_period
                                        ):
                                            # Check if terminating_date has passed but payments are still pending
                                            if terminating_date < date.today():
                                                print("Interest period is over but payments are still pending.")
                                            fund_mem_list.append(mem_obj.interest)

                            except Exception as e:
                                print(f"Error processing interest period in weeks: {e}")

            elif interest_principle == False and interest_field == True:

                if interest_type == "Chit Interest":
                    fund_member = PeopleInterestDetails.objects.filter(chitt_fund_id=type1, action=True,
                                                                       management_profile=management,
                                                                       chit_name=chit_name,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)
                else:
                    fund_member = PeopleInterestDetails.objects.filter(action=True, management_profile=management,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)

                fund_mem_list = []
                for fund in fund_member:
                    mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
                    if mem_obj1:
                        mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)
                        if mem_obj.penalty_balance_amt > 0:
                            fund_mem_list.append(mem_obj.interest)

            elif interest_principle == True and interest_field == True:

                if interest_type == "Chit Interest":
                    fund_member = PeopleInterestDetails.objects.filter(chitt_fund_id=type1, action=True,
                                                                       management_profile=management,
                                                                       chit_name=chit_name,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)
                else:

                    fund_member = PeopleInterestDetails.objects.filter(action=True, management_profile=management,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)

                fund_mem_list = []
                for fund in fund_member:
                    mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
                    if mem_obj1:
                        mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)

                        nnnn = mem_obj.interest.paid_counts

                        current_date = checking_date

                        # Owner rule (Feb 2026): use the operator's
                        # selected `checking_date` for the current
                        # month/year window so the "Choose Person"
                        # dropdown reflects the picked pay_date, not
                        # today.
                        month = checking_date.month
                        year = checking_date.year
                        number_of_days = calendar.monthrange(year, month)[1]
                        first_date = date(year, month, 1)
                        last_date = date(year, month, number_of_days)
                        delta = last_date - first_date
                        final_dates = []
                        for i in range(delta.days + 1):
                            final_dates.append((first_date + timedelta(days=i)))

                        last_day_of_month = calendar.monthrange(year, month)[1]
                        last_date = datetime(year, month, last_day_of_month)
                        start_date = datetime(year, month, 1)


                        if mem_obj.interest.interest_period_type == "Month":
                            try:

                                if mem_obj.penalty_balance_amt > 0 or ((mem_obj.interest.interest_date + relativedelta(
                                        months=mem_obj.interest.paid_counts)) < start_date.date()):
                                    checking_collection_date = CollectionDetails.objects.filter(
                                        interest_id=mem_obj.interest_id)
                                    if checking_collection_date:
                                        checking_collection_dates = CollectionDetails.objects.filter(
                                            interest_id=mem_obj.interest_id).last()
                                        if mem_obj.penalty_balance_amt > 0 or (
                                                checking_collection_dates.pay_date.month != month and checking_collection_dates.pay_date.year == year):
                                            fund_mem_list.append(mem_obj.interest)
                                    else:

                                        fund_mem_list.append(mem_obj.interest)


                            except Exception:
                                print("hhhhhhhhhh")

                        if mem_obj.interest.interest_period_type == "Month":
                            try:
                                # Check if there is an overdue penalty or missed payment
                                if mem_obj.penalty_balance_amt > 0 or (
                                    (mem_obj.interest.interest_date + relativedelta(
                                        months=mem_obj.interest.paid_counts
                                    )) < start_date.date()
                                ):
                                    checking_collection_date = CollectionDetails.objects.filter(
                                        interest_id=mem_obj.interest_id
                                    )
                                    if checking_collection_date.exists():
                                        # Get the latest collection details
                                        last_collection = checking_collection_date.last()
                                        # Check if payment was made in the current month and year
                                        if mem_obj.penalty_balance_amt > 0 or (
                                            last_collection.pay_date.month != month
                                            or last_collection.pay_date.year != year
                                        ):
                                            # Add to the fund list if payment is overdue
                                            fund_mem_list.append(mem_obj.interest)
                                    else:
                                        # If no payment history exists, consider it overdue
                                        fund_mem_list.append(mem_obj.interest)
                            except Exception as e:
                                print(f"Error while processing member {mem_obj.interest_id}: {e}")
                                
                        elif mem_obj.interest.interest_period_type == "Days":
                            # CHIT_FUND_002 fix (Feb 2026): unified visibility rule
                            # using _installment_expected_count (same helper used in
                            # chitfund_interest_member_details).  Show borrower whenever
                            # paid_counts < expected count for checking_date, or penalty
                            # is outstanding.
                            _days_expected = _installment_expected_count(mem_obj.interest, checking_date)
                            if mem_obj.penalty_balance_amt > 0 or int(mem_obj.interest.paid_counts or 0) < _days_expected:
                                fund_mem_list.append(mem_obj.interest)


                        elif mem_obj.interest.interest_period_type == "Week":
                            # with collection added

                            checking_collection_weeks = CollectionDetails.objects.filter(
                                interest_id=mem_obj.interest_id)

                            if checking_collection_weeks:
                                checking_collection_week = CollectionDetails.objects.filter(
                                    interest_id=mem_obj.interest_id).last()
                                terminating_date = mem_obj.interest.interest_date + relativedelta(
                                    weeks=mem_obj.interest.interest_period)
                                calcu_weeks = abs(mem_obj.interest.interest_date - date.today())

                                weeks_num = calcu_weeks.days // 7
                                predicting_weeks = (mem_obj.interest.interest_date + relativedelta(weeks=weeks_num))
                                checking_days_weeks_limit = (
                                            mem_obj.interest.interest_date + relativedelta(weeks=weeks_num + 1))
                                dates = []
                                current_date = (mem_obj.interest.interest_date + relativedelta(weeks=weeks_num))
                                while current_date >= predicting_weeks and current_date < checking_days_weeks_limit:
                                    dates.append(current_date)
                                    current_date += timedelta(days=1)
                                if mem_obj.penalty_balance_amt > 0 or (checking_collection_week.pay_date not in dates and mem_obj.interest.paid_counts != mem_obj.interest.interest_period and terminating_date and terminating_date >= checking_date):
                                        # checking_collection_week.pay_date not in dates and mem_obj.interest.paid_counts != mem_obj.interest.interest_period and terminating_date >= checking_date):

                                    fund_mem_list.append(mem_obj.interest)



                            else:
                                calcu_weeks = abs(mem_obj.interest.interest_date - date.today())
                                weeks_num = calcu_weeks.days // 7
                                if weeks_num != 0:
                                    if weeks_num == 1:
                                        checking_days_weeks = (
                                                    mem_obj.interest.interest_date + relativedelta(weeks=weeks_num))
                                        checking_days_weeks_limit = (
                                                    mem_obj.interest.interest_date + relativedelta(weeks=weeks_num + 1))
                                        dates = []
                                        current_date = (mem_obj.interest.interest_date + relativedelta(weeks=weeks_num))
                                        while current_date >= checking_days_weeks and current_date < checking_days_weeks_limit:
                                            dates.append(current_date)
                                            current_date += timedelta(days=1)
                                        print(mem_obj.interest_apply_date + relativedelta(
                                            weeks=mem_obj.interest.paid_counts))
                                        terminating_date = mem_obj.interest.interest_date + relativedelta(
                                            weeks=mem_obj.interest.interest_period)

                                        if checking_days_weeks <= checking_date:

                                            if mem_obj.penalty_balance_amt > 0 or (((
                                                                                            mem_obj.interest_apply_date + relativedelta(
                                                                                            weeks=mem_obj.interest.paid_counts)) not in dates) and mem_obj.interest.paid_counts != mem_obj.interest.interest_period and terminating_date >= checking_date):
                                                # if checking_date == i and ((mem_obj.interest_apply_date + relativedelta(weeks=mem_obj.interest.paid_counts)) != i):
                                                fund_mem_list.append(mem_obj.interest)
                                    else:
                                        checking_days_weeks = (
                                                    mem_obj.interest.interest_date + relativedelta(weeks=weeks_num))
                                        checking_days_weeks_limit = (
                                                    mem_obj.interest.interest_date + relativedelta(weeks=weeks_num + 1))
                                        dates = []
                                        current_date = (mem_obj.interest.interest_date + relativedelta(weeks=weeks_num))
                                        while current_date >= checking_days_weeks and current_date < checking_days_weeks_limit:
                                            dates.append(current_date)
                                            current_date += timedelta(days=1)

                                        print(mem_obj.interest_apply_date + relativedelta(
                                            weeks=mem_obj.interest.paid_counts))
                                        terminating_date = mem_obj.interest.interest_date + relativedelta(
                                            weeks=mem_obj.interest.interest_period)

                                        if checking_days_weeks <= checking_date:

                                            if mem_obj.penalty_balance_amt > 0 or (((
                                                                                            mem_obj.interest_apply_date + relativedelta(
                                                                                            weeks=mem_obj.interest.paid_counts)) in dates) and mem_obj.interest.paid_counts != mem_obj.interest.interest_period and terminating_date >= checking_date):
                                                # if checking_date == i and ((mem_obj.interest_apply_date + relativedelta(weeks=mem_obj.interest.paid_counts)) != i):
                                                fund_mem_list.append(mem_obj.interest)
                                else:
                                    print("999999999999999")

                if interest_type == "Chit Interest":
                    fund_member = PeopleInterestDetails.objects.filter(chitt_fund_id=type1, action=True,
                                                                       management_profile=management,
                                                                       chit_name=chit_name,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)
                else:
                    fund_member = PeopleInterestDetails.objects.filter(action=True, management_profile=management,
                                                                       interest_category=interest_category,
                                                                       interest_type=interest_type)

                fund_mem_list = []
                for fund in fund_member:
                    mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
                    if mem_obj1:
                        mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)
                        if mem_obj.interest.interest_period_type == "Month":
                            if mem_obj.penalty_balance_amt > 0 or ((mem_obj.interest_apply_date + relativedelta(
                                    months=1)).year == checking_date_year and (
                                                                           mem_obj.interest_apply_date + relativedelta(
                                                                           months=1)).month == checking_date_month):
                                fund_mem_list.append(mem_obj.interest)
                        elif mem_obj.interest.interest_period_type == "Days":
                            # CHIT_FUND_002 fix (Feb 2026): unified visibility rule
                            # using _installment_expected_count.
                            _days_expected = _installment_expected_count(mem_obj.interest, checking_date)
                            if mem_obj.penalty_balance_amt > 0 or int(mem_obj.interest.paid_counts or 0) < _days_expected:
                                fund_mem_list.append(mem_obj.interest)
                        elif mem_obj.interest.interest_period_type == "Week":
                            checking_days_weeks = (mem_obj.interest_apply_date + relativedelta(weeks=1))
                            checking_days_weeks_limit = (mem_obj.interest_apply_date + relativedelta(weeks=2))
                            dates = []
                            current_date = (mem_obj.interest_apply_date + relativedelta(weeks=1))
                            while current_date >= checking_days_weeks and current_date < checking_days_weeks_limit:
                                dates.append(current_date)
                                current_date += timedelta(days=1)

                            print(mem_obj.interest_apply_date + relativedelta(weeks=mem_obj.interest.paid_counts))
                            if (mem_obj.interest_apply_date + relativedelta(weeks=1)).year == checking_date_year and (
                                    mem_obj.interest_apply_date + relativedelta(weeks=1)).month == checking_date_month:

                                if mem_obj.penalty_balance_amt > 0 or ((mem_obj.interest_apply_date + relativedelta(
                                        weeks=mem_obj.interest.paid_counts)) not in dates) and mem_obj.interest.interest_date != checking_date and mem_obj.interest.paid_counts != mem_obj.interest.interest_period:
                                    # if checking_date == i and ((mem_obj.interest_apply_date + relativedelta(weeks=mem_obj.interest.paid_counts)) != i):
                                    fund_mem_list.append(mem_obj.interest)

            # -------------------------------------------------------------
            # Owner rule (Feb 2026): Date-scoped post-filter.
            # After the legacy branches build `fund_mem_list`, drop any
            # borrower whose next installment isn't due yet on
            # `checking_date` (the operator's selected pay_date). A row
            # stays visible if EITHER:
            #   - `installm` (rolling due-date pointer maintained
            #     by the interest.signals sync) <= checking_date, OR
            #   - the borrower owes penalty  (penalty_balance_amt > 0), OR
            #   - the borrower owes interest (intrest_balance_amt > 0).
            # Rows whose `installment_date` isn't populated (legacy /
            # non-installment sources) are left in-place — the older
            # month/week/day branches already filter them.
            _filtered = []
            for _f in fund_mem_list:
                try:
                    _bs = PeopleInterestBalanceSheet.objects.filter(interest_id=_f.id).first()
                    _pen = float(_bs.penalty_balance_amt or 0) if _bs else 0.0
                    _int = float(_bs.intrest_balance_amt or 0) if _bs else 0.0
                    if _f.installment_date and not (_pen > 0 or _int > 0):
                        if _f.installment_date > checking_date:
                            # Not yet due on the selected date and no
                            # outstanding penalty/interest — hide.
                            continue
                except Exception:
                    pass
                _filtered.append(_f)
            fund_mem_list = _filtered

            serializer = PeopleInterestDetailsSerializer(fund_mem_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def interest_balance_collection(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)
    get_role = rejin.user_role
    if rejin.my_role != None:
        permiss = Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm = Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()
    if request.method == "POST":

        people_int = PeopleInterestDetails.objects.filter(
            management_profile=management,
            interest_type="Management Interest"
        )
        bal = []
        for qqq in people_int:
            check_balaaa = PeopleInterestBalanceSheet.objects.filter(
                management_profile=management, interest_id=qqq.id
            ).first()
            if not check_balaaa:
                continue

            has_balance = (
                float(check_balaaa.principal_balance or 0) > 0
                or float(check_balaaa.intrest_balance_amt or 0) > 0
                or float(check_balaaa.penalty_balance_amt or 0) > 0
            )
            if has_balance:
                bal.append(qqq)

        serializer = PeopleInterestBalanceDetailsSerializer(bal, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)