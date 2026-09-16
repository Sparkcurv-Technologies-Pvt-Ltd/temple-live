from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import CollectionDetailsSerializer
from .models import CollectionDetails
from token_app.views import *
from management.models import ManagementDetails
from family.models import Member_Details
from amount.models import PeoplesAmountDetails
from balancesheet.models import PeopleInterestBalanceSheet
from permisions.models import Permisions
from fund.models import ADDFundDetails
from fund.serializers import ADDFundDetailsSerializer
from festival.models import ADDFestivalDetails
from festival.serializers import ADDFestivalDetailsSerializer
from rental.models import RentalAndLeaseDetails
from rental.serializers import RentalAndLeaseDetailsSerializer
from sub_tariff.models import ADDSubscriptionTariffDetails
from sub_tariff.serializers import ADDSubscriptionTariffDetailseSerializer
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
from rental.models import MovableAssetsRents
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
                            festival_get.total_bal_amt = float(festival_get.total_bal_amt) + float(
                                festival_get.exception_amount)

                            festival_get.save()
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
                    if festival:
                        festival_get = RentalBalanceSheet.objects.get(rental_new_amt=temp_family.rentsandlease,
                                                                      rental_new_amt__rent=True,
                                                                      management_profile=management)
                        festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                        festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)
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
                    if festival:
                        festival_get = FundMembersBalanceSheet.objects.get(fund=temp_family.funds,
                                                                           fund_m=temp_family.fund_member,
                                                                           management_profile=management)

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
 

                            festival_get.principal_paid = float(festival_get.principal_paid) + float(temp_family.amount)

                            festival_get.principal_balance = float(festival_get.principal_balance) - float(
                                temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount)
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except:
                                    pay_coun = 1
                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun
                                interest_obj.save()

                        elif temp_family.interest_field == True and temp_family.interest_principle == False:

                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + float(
                                temp_family.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) - float(
                                temp_family.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + float(
                                temp_family.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) - float(
                                temp_family.penalty_amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(
                                temp_family.interst_amount) - float(temp_family.penalty_amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(
                                temp_family.interst_amount) + float(temp_family.penalty_amount)
                            festival_get.save()

                        elif temp_family.interest_field == True and temp_family.interest_principle == True:

                            festival_get.principal_paid = float(festival_get.principal_paid) + float(temp_family.amount)
                            festival_get.principal_balance = float(festival_get.principal_balance) - float(
                                temp_family.amount)
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + float(
                                temp_family.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) - float(
                                temp_family.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + float(
                                temp_family.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) - float(
                                temp_family.penalty_amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) - float(
                                temp_family.interst_amount) - float(temp_family.penalty_amount) - float(
                                temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) + float(
                                temp_family.interst_amount) + float(temp_family.penalty_amount) + float(
                                temp_family.amount)
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except:
                                    pay_coun = 1

                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun
                                interest_obj.save()

                        festival_get.save()
                        interest_obj = PeopleInterestDetails.objects.filter(id=temp_family.interest.id).first()
                        if interest_obj.interest_category == "Installment Interest":
                            new_amt = float(temp_family.amount) + float(temp_family.penalty_amount) + float(
                                temp_family.interst_amount) - float(temp_family.discount_amount)
                        else:
                            new_amt = float(temp_family.amount) + float(temp_family.penalty_amount) + float(
                                temp_family.interst_amount)
                        payment_bal = float(festival_get.balance_amt) - float(temp_family.interst_amount) - float(
                            temp_family.penalty_amount) - float(temp_family.amount) + float(temp_family.discount_amount)
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

                        Report.objects.create(management_profile=management, created_by=rejin.id,
                                              type_choice="Addition", collection=temp_family, amount=tot_int_amt,
                                              interest=temp_family.interest, banks=temp_family.bank_link)




                from decimal import Decimal


                if temp_family.collection_category == "Chit Interest":
                    festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                         interest__interest_type="Chit fund Interest",
                                                                         management_profile=management)
                    if festival:
                        interest_obj = PeopleInterestDetails.objects.filter(id=temp_family.interest.id).first()

                        festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                              interest__interest_type="Chit fund Interest",
                                                                              management_profile=management)
                        if temp_family.interest_principle == True and temp_family.interest_field == False:
                            festival_get.principal_paid = float(festival_get.principal_paid) + float(temp_family.amount)
                            festival_get.principal_balance = float(festival_get.principal_balance) - float(
                                temp_family.amount)
                            festival_get.save()
                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except:
                                    pay_coun = 1

                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun
                                interest_obj.save()

                        elif temp_family.interest_field == True and temp_family.interest_principle == False:
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + float(
                                temp_family.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) - float(
                                temp_family.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + float(
                                temp_family.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) - float(
                                temp_family.penalty_amount)
                            festival_get.save()

                        elif temp_family.interest_field == True and temp_family.interest_principle == True:
                            festival_get.principal_paid = float(festival_get.principal_paid) + float(temp_family.amount)
                            festival_get.principal_balance = float(festival_get.principal_balance) - float(
                                temp_family.amount)
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) + float(
                                temp_family.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) - float(
                                temp_family.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) + float(
                                temp_family.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) - float(
                                temp_family.penalty_amount)
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                try:
                                    pay_coun = request.data['no_count_install']
                                except:
                                    pay_coun = 1

                                interest_obj.paid_counts = int(interest_obj.paid_counts) + pay_coun
                                interest_obj.save()

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

                                    new_principal_amt = float(temp_family.amount) - new_pro_amount 
                                else:
                                    interest_obj_priciple_amount = (float(interest_obj.principal_amt) * float(
                                        interest_obj.fix_interest_rate_percent)) / 100
                                    new_pro_amount = float(interest_obj.interest_amt) / float(
                                        interest_obj.interest_period)
                                    new_principal_amt = float(temp_family.amount) - new_pro_amount  

                            else:
                                if interest_obj.interest_category == "Installment Interest":
                                    new_pro_amount = float(temp_family.no_count_install) * float(
                                        interest_obj.fix_interest_rate_percent / interest_obj.interest_period)
                                    new_principal_amt = float(temp_family.amount) - new_pro_amount  
                                else:
                                    new_pro_amount = float(temp_family.no_count_install) * float(
                                        interest_obj.fix_interest_rate_percent)
                                    new_principal_amt = float(temp_family.amount) - new_pro_amount  

                            if interest_obj.interest_category == "Installment Interest":
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) + new_principal_amt
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) + float(
                                    temp_family.amount) + float(temp_family.interst_amount) + float(
                                    temp_family.penalty_amount)
                                chit_fund_get.profit_amount = float(
                                    chit_fund_get.profit_amount) + new_pro_amount + float(temp_family.penalty_amount)
                                chit_fund_get.save()
                            else:
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) + float(temp_family.amount)
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) + float(
                                    temp_family.amount) + float(temp_family.interst_amount) + float(
                                    temp_family.penalty_amount)
                                chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) + float(
                                    temp_family.interst_amount) + float(temp_family.penalty_amount)
                                chit_fund_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                invester_sharing_profit_amount = new_pro_amount + float(temp_family.penalty_amount)
                            else:
                                invester_sharing_profit_amount = float(temp_family.interst_amount) + float(
                                    temp_family.penalty_amount)

                            invester_list = ChitFundInvesters.objects.filter(chitt_fund=chit_fund_get)
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

                        festival_get.debit_amt = float(festival_get.debit_amt) + float(temp_family.amount) + float(
                            temp_family.penalty_amount) + float(temp_family.interst_amount)
                        festival_get.balance_amt = float(festival_get.balance_amt) - float(temp_family.amount) - float(
                            temp_family.penalty_amount) - float(temp_family.interst_amount)
                        festival_get.save()
                        temp_family.interest_balance = festival_get
                        temp_family.save()

                        if interest_obj.interest_category == "Installment Interest":
                            tot_int_amt = float(temp_family.amount) + float(temp_family.penalty_amount) + float(
                                temp_family.interst_amount) - float(temp_family.discount_amount)
                        else:
                            tot_int_amt = float(temp_family.amount) + float(temp_family.penalty_amount) + float(
                                temp_family.interst_amount)

                        report_bal = float(festival_get.balance_amt) - float(temp_family.amount) - float(
                            temp_family.penalty_amount) - float(temp_family.interst_amount) + float(
                            temp_family.discount_amount)

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
                    try:
                        balance_type = request.data['balance_type']
                        if balance_type == "Interest Balance":
                            interest_obj = PeopleInterestDetails.objects.filter(id=temp_family.interest.id).first()
                            festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                                 management_profile=management)
                            for ssss in festival:
                                if ssss.interest.interest_type == "Management Interest":
                                    if ssss.interest.interest_category == "Interest" or "Interest with capital":

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
                                    if ssss.interest.interest_category == "Interest" or "Interest with capital":
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
                                        if ssss.interest.interest_category == "Interest" or "Interest with capital":
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

                                    invester_list = ChitFundInvesters.objects.filter(chitt_fund=chit_fund_get)
                                    if ssss.interest.interest_category == "Installment Interest":
                                        final_profit_amount1 = (float(interest_amount_install_profit) * float(
                                            chit_fund_get.set_profit_percent / 100))
                                    elif ssss.interest.interest_category == "Interest" or "Interest with capital":
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


                    except:
                        member_obj = Member_Details.objects.filter(id=temp_family.member.id).first()
                        temp_family.member_name = member_obj.member_name
                        temp_family.member_id = member_obj.id
                        temp_family.mobile_number = member_obj.member_mobile_number
                        temp_family.save()
                        if member_obj.balance_amt_paid == False:
                            if member_obj.balance_pending_amt <= temp_family.amount:
                                amt_obj = float(temp_family.amount) - float(member_obj.balance_pending_amt)
                                member_obj.balance_paid_amount = float(member_obj.balance_paid_amount) + float(
                                    member_obj.balance_pending_amt)

                                member_obj.balance_pending_amt = float(member_obj.balance_pending_amt) - float(
                                    member_obj.balance_pending_amt)
                                member_obj.balance_amt_paid = True
                                member_obj.save()

                            elif member_obj.balance_pending_amt > temp_family.amount:
                                member_obj.balance_pending_amt = float(member_obj.balance_pending_amt) - float(
                                    temp_family.amount)
                                member_obj.balance_paid_amount = float(member_obj.balance_paid_amount) + float(
                                    temp_family.amount)
                                member_obj.save()
                                amt_obj = 0
                        else:
                            amt_obj = temp_family.amount
                        festival = PeoplesAmountDetails.objects.filter(member_id=temp_family.member.id, penalty=True,
                                                                       paid=False)
                        if amt_obj > 0:
                            print(amt_obj)
                            for fes in festival:
                                fest_obj = PeoplesAmountDetails.objects.filter(id=fes.id).first()

                                if fest_obj.total_bal_amt > amt_obj:
                                    fest_obj.total_paid_amt = float(fest_obj.total_paid_amt) + float(amt_obj)
                                    fest_obj.total_bal_amt = float(fest_obj.total_bal_amt) - float(amt_obj)
                                    fest_obj.save()
                                    break
                                elif fest_obj.total_bal_amt == amt_obj:
                                    fest_obj.total_paid_amt = float(fest_obj.total_paid_amt) + float(amt_obj)
                                    fest_obj.total_bal_amt = float(fest_obj.total_bal_amt) - float(amt_obj)
                                    fest_obj.paid = True
                                    fest_obj.save()
                                    break
                                elif fest_obj.total_bal_amt < amt_obj:
                                    amt_obj = float(amt_obj) - float(fest_obj.total_bal_amt)
                                    fest_obj.total_paid_amt = float(fest_obj.total_paid_amt) + float(
                                        fest_obj.total_bal_amt)
                                    fest_obj.total_bal_amt = float(fest_obj.total_bal_amt) - float(
                                        fest_obj.total_bal_amt)
                                    fest_obj.paid = True
                                    fest_obj.save()

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
                            # if request.data['present'] == True:
                            #      bal=float(temp_family.amount)
                            # else:
                            #     bal=float(temp_family.amount)
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
                        festival_new = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                                 interest__people_member=temp_family.member,
                                                                                 interest__interest_type="Management Interest")
                        if festival_new:
                            festival_new_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                      interest__people_member=temp_family.member,
                                                                                      interest__interest_type="Management Interest")
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(temp_family.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(temp_family.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(
                                temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Chit Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                             interest__people_member=temp_family.member,
                                                                             interest__interest_type="Chit fund Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                  interest__people_member=temp_family.member,
                                                                                  interest__interest_type="Chit fund Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) + float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) - float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) + float(temp_family.amount)

                            festival_get.save()




                    elif customer.collection_category == "Balance":
                        festival_new = PeoplesAmountDetails.objects.filter(member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(member=customer.member)
                            festival_new_get.penalty_balance = float(festival_new_get.penalty_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) + float(
                                customer.amount)

                            festival_new_get.save()

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
                        festival = PeoplesAmountDetails.objects.filter(member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(member=temp_family.member)
                            festival_get.penalty_balance = float(festival_get.penalty_balance) - float(
                                temp_family.amount)
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
                        festival_new = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                                 interest__people_member=temp_family.member,
                                                                                 interest__interest_type="Management Interest")
                        if festival_new:
                            festival_new_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                      interest__people_member=temp_family.member,
                                                                                      interest__interest_type="Management Interest")
                            festival_new_get.credit_amt = float(festival_new_get.credit_amt) + float(temp_family.amount)
                            festival_new_get.debit_amt = float(festival_new_get.debit_amt) - float(temp_family.amount)
                            festival_new_get.balance_amt = float(festival_new_get.balance_amt) + float(
                                temp_family.amount)

                            festival_get.save()



                    elif temp_family.collection_category == "Chit Interest":
                        festival = PeopleInterestBalanceSheet.objects.filter(interest=temp_family.interest,
                                                                             interest__people_member=temp_family.member,
                                                                             interest__interest_type="Chit fund Interest")
                        if festival:
                            festival_get = PeopleInterestBalanceSheet.objects.get(interest=temp_family.interest,
                                                                                  interest__people_member=temp_family.member,
                                                                                  interest__interest_type="Chit fund Interest")
                            festival_get.credit_amt = float(festival_get.credit_amt) + float(temp_family.amount)
                            festival_get.debit_amt = float(festival_get.debit_amt) - float(temp_family.amount)
                            festival_get.balance_amt = float(festival_get.balance_amt) + float(temp_family.amount)

                            festival_get.save()




                    elif customer.collection_category == "Balance":
                        festival_new = PeoplesAmountDetails.objects.filter(member=customer.member)
                        if festival_new:
                            festival_new_get = PeoplesAmountDetails.objects.get(member=customer.member)
                            festival_new_get.penalty_balance = float(festival_new_get.penalty_balance) + float(
                                customer.amount)
                            festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                                customer.amount)
                            festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) + float(
                                customer.amount)

                            festival_new_get.save()

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
                        festival = PeoplesAmountDetails.objects.filter(member=temp_family.member)
                        if festival:
                            festival_get = PeoplesAmountDetails.objects.get(member=temp_family.member)
                            festival_get.penalty_balance = float(festival_get.penalty_balance) - float(
                                temp_family.amount)
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
                        if customer.interest_principle == True and customer.interest_field == False:
                            festival_get.principal_paid = float(festival_get.principal_paid) - float(customer.amount)
                            festival_get.principal_balance = float(festival_get.principal_balance) + float(
                                customer.amount)
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                interest_obj.paid_counts = int(interest_obj.paid_counts) - 1
                                interest_obj.save()

                        elif customer.interest_field == True and customer.interest_principle == False:
                            festival_get.intrest_paid_amt = float(festival_get.intrest_paid_amt) - float(
                                customer.interst_amount)
                            festival_get.intrest_balance_amt = float(festival_get.intrest_balance_amt) + float(
                                customer.interst_amount)
                            festival_get.penalty_paid_amt = float(festival_get.penalty_paid_amt) - float(
                                customer.penalty_amount)
                            festival_get.penalty_balance_amt = float(festival_get.penalty_balance_amt) + float(
                                customer.penalty_amount)
                            festival_get.save()

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
                            festival_get.save()

                            if interest_obj.interest_category == "Installment Interest":
                                interest_obj.paid_counts = int(interest_obj.paid_counts) - 1
                                interest_obj.save()
                        chit_fund_obj = ChitFundsDetails.objects.filter(id=customer.interest.chitt_fund.id)
                        if chit_fund_obj:
                            chit_fund_get = ChitFundsDetails.objects.get(id=customer.interest.chitt_fund.id)
                            if interest_obj.interest_type_new == "percentage":
                                interest_obj_priciple_amount = (float(interest_obj.principal_amt) * float(
                                    interest_obj.fix_interest_rate_percent)) / 100
                                new_pro_amount = float(customer.no_count_install) * float(interest_obj_priciple_amount)
                                new_principal_amt = float(customer.amount) - float(new_pro_amount)
                            else:
                                new_pro_amount = float(customer.no_count_install) * float(
                                    interest_obj.fix_interest_rate_percent)
                                new_principal_amt = float(customer.amount) - float(new_pro_amount)
                            if interest_obj.interest_category == "Installment Interest":
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) - float(new_principal_amt)
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) - float(
                                    customer.amount)
                                chit_fund_get.profit_amount = float(chit_fund_get.profit_amount) - float(
                                    new_pro_amount) - float(customer.penalty_amount)
                                chit_fund_get.save()
                            else:
                                chit_fund_get.collected_principal_amount = float(
                                    chit_fund_get.collected_principal_amount) - float(customer.amount)
                                chit_fund_get.cash_inhand_amount = float(chit_fund_get.cash_inhand_amount) - float(
                                    customer.amount)
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
                    festival_new = PeoplesAmountDetails.objects.filter(id=customer.amount_link.id)
                    if festival_new:
                        festival_new_get = PeoplesAmountDetails.objects.get(id=customer.amount_link.id)
                        # festival_new_get.penalty_balance += float(customer.amount)
                        festival_new_get.total_paid_amt = float(festival_new_get.total_paid_amt) - float(
                            customer.amount)
                        festival_new_get.total_bal_amt = float(festival_new_get.total_bal_amt) + float(customer.amount)
                        festival_new_get.paid = False
                        festival_new_get.save()
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
                fund = ADDFestivalDetails.objects.filter(action=True, management_profile=management)
                fund_list = []
                for fund_obj in fund:
                    amount_obj = PeoplesAmountDetails.objects.filter(festival_id=fund_obj.id, penalty=False, paid=False,
                                                                     management_profile=management)
                    if amount_obj:
                        fund_list.append(fund_obj)
                serializer = ADDFestivalDetailsSerializer(fund_list, many=True)
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
                fund = ADDSubscriptionTariffDetails.objects.filter(action=True, management_profile=management)
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
        member = Member_Details.objects.filter(action=True)
        mem_list = []
        for mem in member:

            if data == "Subscription Tariff":
                amount = PeoplesAmountDetails.objects.filter(member=mem, sub_tariff__action=True, penalty=False,
                                                             management_profile=management)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id, sub_tariff__action=True, penalty=False)
                    if mem_obj.sub_tariff != None and mem_obj.total_bal_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)
            elif data == "Festival":
                amount = PeoplesAmountDetails.objects.filter(member=mem, festival_id=type, penalty=False,
                                                             management_profile=management)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.festival != None and mem_obj.total_bal_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Marriage":
                amount = PeoplesAmountDetails.objects.filter(member=mem, management_profile=management)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.marriage != None:

                        if mem not in mem_list:
                            mem_list.append(mem)

            elif data == "Death Tariff":
                amount = PeoplesAmountDetails.objects.filter(member=mem, death_id=type, penalty=False,
                                                             management_profile=management)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.death != None and mem_obj.total_bal_amt > 0:
                        if mem not in mem_list:
                            mem_list.append(mem)


            elif data == "Balance":
                amount = PeoplesAmountDetails.objects.filter(member=mem, management_profile=management)
                for new_mem in amount:
                    mem_obj = PeoplesAmountDetails.objects.get(id=new_mem.id)
                    if mem_obj.penalty_amount > 0:
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
            amount_get = PeoplesAmountDetails.objects.filter(member_id=member, management_profile=management).first()
            serializer = PeoplesAmountDetailsSerializer(amount_get)

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
                people_amt = PeoplesAmountDetails.objects.filter(member_id=mem.id, paid=False, penalty=True)
                amt = 0
                if people_amt:
                    for peo_amt in people_amt:
                        people_amt_get = PeoplesAmountDetails.objects.get(id=peo_amt.id)
                        amt += float(people_amt_get.total_bal_amt)

                if mem.balance_amt_paid == False:
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
                fund = ADDFestivalDetails.objects.filter(management_profile=management)
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
                move_receive_amt) + float(fund_amount) + float(chit_amount) + float(manageinter_amount) + float(
                chit_amount) + float(manageinter_amount) + float(fund_amount)
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
def fund_member_details(request):
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

        fund_member = FundMemberDetailss.objects.filter(fund_group_id=type, action=True)
        fund_mem_list = []
        for fund in fund_member:
            mem_obj = FundMembersBalanceSheet.objects.get(fund_m_id=fund.id, fund_id=type)
            if mem_obj.balance_amt > 0:
                fund_mem_list.append(mem_obj.fund_m)
        serializer = FundMemberDetailssSerializer(fund_mem_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        fund_mem_list = []
        for fund in fund_member:
            mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
            if mem_obj1:
                mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)
                if mem_obj.penalty_balance_amt > 0 or mem_obj.intrest_balance_amt > 0 or mem_obj.principal_balance > 0:
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
        fund_mem_list = []
        for fund in fund_member:
            mem_obj1 = PeopleInterestBalanceSheet.objects.filter(interest_id=fund.id)
            if mem_obj1:
                mem_obj = PeopleInterestBalanceSheet.objects.get(interest_id=fund.id)
                if mem_obj.penalty_balance_amt > 0 or mem_obj.intrest_balance_amt > 0 or mem_obj.principal_balance > 0:
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

        checking_date = date.today()

        checking_date_month = checking_date.month
        checking_date_year = checking_date.year
        checking_date_date = checking_date.day

        if interest_category == "Interest" or interest_category == "Interest with capital":
            fund_mem_list = []

            interest_principle = request.data['interest_principle']
            interest_field = request.data['interest_field']
            if interest_principle == True and interest_field == False:
                if interest_type == "Chit Interest":
                    # if
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
                        if mem_obj.principal_balance > 0:
                            fund_mem_list.append(mem_obj.interest)
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
                        try:
                            print(mem_obj.interest.interest_date.year)
                            print(mem_obj.interest.interest_date.month)
                            print(checking_date_year)
                            print(checking_date_month)

                            if mem_obj.interest.interest_date.year == checking_date_year and mem_obj.interest.interest_date.month == checking_date_month:
                                if mem_obj.penalty_balance_amt > 0 or mem_obj.intrest_balance_amt > 0 and (
                                        mem_obj.interest_apply_date + relativedelta(
                                        months=1)).year == checking_date_year and (
                                        mem_obj.interest_apply_date + relativedelta(
                                        months=1)).month == checking_date_month:
                                    fund_mem_list.append(mem_obj.interest)
                            else:
                                if mem_obj.penalty_balance_amt > 0 or mem_obj.intrest_balance_amt > 0 and (
                                mem_obj.interest_apply_date).year == checking_date_year and (
                                mem_obj.interest_apply_date).month == checking_date_month:
                                    fund_mem_list.append(mem_obj.interest)
                        except:
                            print("jjjjjj")

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
                        try:
                            if mem_obj.interest.interest_date.year == checking_date_year and mem_obj.interest.interest_date.month == checking_date_month:
                                if mem_obj.principal_balance > 0 or mem_obj.penalty_balance_amt > 0 or mem_obj.intrest_balance_amt > 0 and (
                                        mem_obj.interest_apply_date + relativedelta(
                                        months=1)).year == checking_date_year and (
                                        mem_obj.interest_apply_date + relativedelta(
                                        months=1)).month == checking_date_month:
                                    fund_mem_list.append(mem_obj.interest)
                            else:
                                if mem_obj.principal_balance > 0 or mem_obj.penalty_balance_amt > 0 or mem_obj.intrest_balance_amt > 0 and (
                                mem_obj.interest_apply_date).year == checking_date_year and (
                                mem_obj.interest_apply_date).month == checking_date_month:
                                    fund_mem_list.append(mem_obj.interest)
                        except:
                            print("jjjjjj")

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

                        month = datetime.now().month
                        year = datetime.now().year
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

                            try:
                                # Retrieve collection details for the interest
                                checking_collection_date = CollectionDetails.objects.filter(
                                    interest_id=mem_obj.interest_id
                                )

                                # Calculate the terminating date for the interest period
                                terminating_date = mem_obj.interest.interest_date + relativedelta(
                                    days=mem_obj.interest.interest_period
                                )
                                

                                # Calculate days passed since interest start date
                                days_passed = (date.today() - mem_obj.interest.interest_date).days
                               

                                # Calculate expected payment date based on paid counts
                                next_expected_payment_date = mem_obj.interest.interest_date + relativedelta(
                                    days=mem_obj.interest.paid_counts
                                )
                                

                                if checking_collection_date.exists():
                                    # Get the last collection record
                                    last_payment_date = checking_collection_date.last().pay_date
                                    print(f"Last payment date: {last_payment_date}")

                                    # Check if payment is missing for the current day or overdue
                                    if (
                                            last_payment_date < next_expected_payment_date
                                            and mem_obj.interest.paid_counts < mem_obj.interest.interest_period
                                            and date.today() <= terminating_date
                                    ):
                                        print("Pending payment detected within valid period.")
                                        fund_mem_list.append(mem_obj.interest)

                                    elif terminating_date < date.today():
                                        print("Interest period is over but payments are still pending.")
                                        fund_mem_list.append(mem_obj.interest)
                                else:
                                    # Handle case where no collections exist
                                    print("No collection records found.")
                                    if (
                                            mem_obj.interest.paid_counts < mem_obj.interest.interest_period
                                            and date.today() <= terminating_date
                                    ):
                                        print("Adding to fund list due to missing collections and pending payments.")
                                        fund_mem_list.append(mem_obj.interest)
                                    elif terminating_date < date.today():
                                        print("Interest period is over but no payments were made.")
                                        fund_mem_list.append(mem_obj.interest)

                            except Exception as e:
                                print(f"Error processing interest period in days: {e}")


                        elif mem_obj.interest.interest_period_type == "Week":

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

                        month = datetime.now().month
                        year = datetime.now().year
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


                            except:
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
                            checking_collection_date = CollectionDetails.objects.filter(interest_id=mem_obj.interest_id)
                            if checking_collection_date:
                                checking_collection_dates = checking_collection_date.last()
                                terminating_date = mem_obj.interest.interest_date + relativedelta(
                                    days=mem_obj.interest.interest_period)
                                # addednew
                                calcu_days = abs(mem_obj.interest.interest_date - date.today()).days
                                predicting_date = mem_obj.interest.interest_date + relativedelta(days=calcu_days)
                                checking_days_limit = mem_obj.interest.interest_date + relativedelta(
                                    days=calcu_days + 1

                                )
                                dates = []
                                current_date = predicting_date
                                while current_date >= predicting_date and current_date < checking_days_limit:
                                    dates.append(current_date)
                                    current_date += timedelta(days=1)

                                # Check conditions for adding to the fund_mem_list
                                if (
                                        mem_obj.penalty_balance_amt > 0
                                        or (
                                        checking_collection_dates.pay_date not in dates
                                        and mem_obj.interest.paid_counts != mem_obj.interest.interest_period
                                        and terminating_date
                                        and terminating_date >= checking_date
                                )
                                ):
                                    fund_mem_list.append(mem_obj.interest)

                            else:
                                # Handle case where there are no collection records
                                terminating_date = mem_obj.interest.interest_date + relativedelta(
                                    days=mem_obj.interest.interest_period
                                )
                                if (
                                        mem_obj.penalty_balance_amt > 0
                                        or (
                                        mem_obj.interest.paid_counts != mem_obj.interest.interest_period
                                        and terminating_date >= checking_date
                                )
                                ):
                                    fund_mem_list.append(mem_obj.interest)

                            #     if mem_obj.penalty_balance_amt > 0 or ((mem_obj.interest_apply_date + relativedelta(
                            #             days=1)).year == checking_date_year and (
                            #                                                    mem_obj.interest_apply_date + relativedelta(
                            #                                                    days=1)).month == checking_date_month and (
                            #                                                    (
                            #                                                            mem_obj.interest.interest_date + relativedelta(
                            #                                                            days=mem_obj.interest.paid_counts)) != checking_date) and checking_collection_dates.pay_date != checking_date and terminating_date >= checking_date):
                            #         fund_mem_list.append(mem_obj.interest)
                            # else:
                            #     if mem_obj.penalty_balance_amt > 0 or ((mem_obj.interest_apply_date + relativedelta(
                            #             days=1)).year == checking_date_year and (
                            #                                                    mem_obj.interest_apply_date + relativedelta(
                            #                                                    days=1)).month == checking_date_month and (
                            #                                                    (
                            #                                                            mem_obj.interest.interest_date + relativedelta(
                            #                                                            days=mem_obj.interest.paid_counts)) != checking_date)):
                            #         fund_mem_list.append(mem_obj.interest)


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

                            if mem_obj.penalty_balance_amt > 0 or ((mem_obj.interest_apply_date + relativedelta(
                                    days=1)).year == checking_date_year and (
                                                                           mem_obj.interest_apply_date + relativedelta(
                                                                           days=1)).month == checking_date_month and (
                                                                           mem_obj.interest_apply_date + relativedelta(
                                                                           days=1)).day == checking_date_date):
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
        # category=request.data="Balance"

        people_int = PeopleInterestDetails.objects.filter(management_profile=management)
        bal = []
        for qqq in people_int:
            if qqq.interest_category == "Interest":
                check_balaaa = PeopleInterestBalanceSheet.objects.filter(management_profile=management,
                                                                         interest_id=qqq.id).first()

                date_check = date.today()
                date_check_year = date_check.year
                date_check_month = date_check.month
                start_date = date(date_check_year, date_check_month, 1)
                if check_balaaa.intrest_balance_amt > qqq.interest_amt:
                    # if check_balaaa.intrest_balance_amt > 0 and check_balaaa.intrest_balance_amt != check_balaaa.intrest_amt:
                    bal.append(qqq)

            elif qqq.interest_category == "Installment Interest":

                check_balaaa = PeopleInterestBalanceSheet.objects.filter(management_profile=management,
                                                                         interest_id=qqq.id).first()
                date_check = date.today()
                date_check_year = date_check.year
                date_check_month = date_check.month
                start_date = date(date_check_year, date_check_month, 1)

                if qqq.interest_period_type == "Days":
                    date_checking = qqq.interest_date + relativedelta(days=qqq.interest_period)
                    date_checking_initial = qqq.interest_date + relativedelta(days=1)
                    days_diff = (date.today()) - ((qqq.interest_date + relativedelta(days=qqq.paid_counts)))
                    days_cal_diff = (days_diff.days)
                    if (((qqq.interest_date + relativedelta(days=qqq.paid_counts))) < (date.today())) and (
                            (date.today()) != date_checking_initial) and days_cal_diff > 1:
                        bal.append(qqq)

                elif qqq.interest_period_type == "Week":
                    # Calculate the total difference in days and weeks
                    count = abs((qqq.interest_date) - (date.today()))
                    weeks_cal = (count.days // 7)
                    # Determine the starting week and limits
                    starting_date = (qqq.interest_date) + relativedelta(weeks=weeks_cal)
                    start_initial_week = (qqq.interest_date) + relativedelta(weeks=1)
                    start_initial_week_limit = (qqq.interest_date) + relativedelta(weeks=2)

                    # Populate dates for the current week
                    dates = []
                    current_date = start_initial_week

                    while current_date >= start_initial_week and current_date < start_initial_week_limit:
                        dates.append(current_date)
                        current_date += timedelta(days=1)

                    # Calculate the difference in weeks from the last paid count
                    week_diff = (date.today()) - ((qqq.interest_date + relativedelta(weeks=qqq.paid_counts)))
                    weeks_diff_cal = (week_diff.days // 7)

                    # Logic to handle missed or overdue payments
                    if ((qqq.interest_date + relativedelta(weeks=qqq.paid_counts)) < starting_date
                            and (date.today() not in dates)
                            and weeks_diff_cal > 1):
                        # Log and handle overdue
                        print(f"Overdue detected for: {qqq}")
                        bal.append(qqq)

                    # Optional: Notify about missed payment
                    if weeks_diff_cal > 1:
                        missed_weeks = weeks_diff_cal
                        print(f"Missed {missed_weeks} week(s) for: {qqq}")


                elif qqq.interest_period_type == "Month":


                    date_checking = qqq.interest_date + relativedelta(months=qqq.interest_period)
                    date_checking_month = qqq.interest_date + relativedelta(months=1)
                    today = datetime.today()
                    # Find the first day of the current month
                    first_day = today.replace(day=1)
                    # Find the last day of the current month
                    _, last_day = calendar.monthrange(today.year, today.month)
                    # Generate all dates of the current month
                    dates_of_month = [(first_day + timedelta(days=d)).date() for d in range(last_day)]
                    diff = relativedelta(
                        (((qqq.interest_date + relativedelta(months=qqq.paid_counts))), ((date.today()))))
                    month_diff = diff.years * 12 + diff.months
                    first_ddddd = date(today.year, today.month, 1)

                    if (((qqq.interest_date + relativedelta(months=qqq.paid_counts))) < start_date) and (
                            date_checking_month not in dates_of_month) and month_diff > 1 and (
                            month_diff > 1 or (month_diff == 1 and (date.today()) > first_ddddd)):
                        bal.append(qqq)

        serializer = PeopleInterestBalanceDetailsSerializer(bal, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
