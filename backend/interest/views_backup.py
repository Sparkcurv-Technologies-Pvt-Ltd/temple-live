from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import PeopleInterestDetailsSerializer
from .models import PeopleInterestDetails
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
import datetime
from collection.models import CollectionDetails
from collection.serializers import CollectionDetailsSerializer

from balancesheet.models import PeopleInterestBalanceSheet
from balancesheet.serializers import PeopleInterestBalanceSheetSerializer, PeopleInterestssssBalanceSheetSerializer
# calculate sum
from django.db.models import Sum
from permisions.models import Permisions
from family.models import Fammily_Details, Member_Details
from family.serializers import Fammily_DetailsSerializer, member_DetailsSerializer
from treasure.models import ManagementTreasure
from chit_fund.models import ChitFundInvesters, ChitFundsDetails
from reports.models import Report, TempleMemberReport, FundMemberReport, ChitFundInterestOverallReport, InterestPeopleReport
from reports.serializers import InterestPeopleReportserializer, ChitFundInterestOverallReport_serializer
from dateutil.relativedelta import relativedelta





@api_view(['GET','POST'])
def add_interest_given_details(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)   
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else: 
        management=ManagementDetails.objects.all().first()
    if request.method =='POST':  
        if get_role=="User" and perm.interest_add ==True or get_role=="Admin" or rejin.is_superuser == True:    
            serializer876 = PeopleInterestDetailsSerializer(data=request.data)
            interest_type= request.data['interest_type']
            interest_date=request.data['interest_date']
            interest_category=request.data['interest_category']
            date_object = datetime.datetime.strptime(interest_date, "%Y-%m-%d")
            # Owner rule (Sep 2026): Installment Interest can now be added
            # for any past month/year — no longer restricted to the
            # current calendar month. The serializer's own validate()
            # (interest/serializers.py) still blocks any interest_date in
            # the future, and no longer restricts to current/previous
            # month either.
            if serializer876.is_valid():
                interest_type= request.data['interest_type']
                # if request.data['interest_category'] == "Installment Interest":
                #     bal_new1=request.data['final_amt_given']
                # else:
                #     bal_new1=request.data['principal_amt']
                # ------------------------------------------------------------
                # Owner rule (Feb 2026): Management Interest loans are always
                # allowed to be created — cash_in_hand is debited by the
                # principal amount regardless of the current balance, and is
                # permitted to go negative. This makes a cash shortfall
                # visible directly on the treasury figure instead of
                # silently blocking the loan via a separate expence_amt
                # tracker (which previously diverged from cash_in_hand once
                # any repayment came in via bank transfer instead of cash).
                # The insufficient-funds block for Chit fund Interest is
                # untouched — that one is scoped to the chit fund's own
                # cash_inhand_amount, which is a different, unaffected data
                # path.
                # ------------------------------------------------------------
                if interest_type=="Chit fund Interest":
                    chit_fund_obj= ChitFundsDetails.objects.filter(id=request.data['chitt_fund'])
                    if chit_fund_obj:
                        chit_fund_get=ChitFundsDetails.objects.get(id=request.data['chitt_fund'])
                     
                        if float(chit_fund_get.cash_inhand_amount) < float(request.data['principal_amt']):
                            msg={'msg':'Insufficient amount in chit fund'}
                            return Response(msg,status=status.HTTP_226_IM_USED)
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                if interest_type=="Management Interest":
                    managefilter=ManagementTreasure.objects.filter(management_profile=management)
                    if managefilter:
                        manage_get=ManagementTreasure.objects.get(management_profile=management)
                        # Debit cash_in_hand directly by the principal given
                        # out. Allowed to go negative — see owner rule above.
                        manage_get.cash_in_hand = float(manage_get.cash_in_hand) - float(temp_family.principal_amt)
                        manage_get.save()

                    pppp=Report.objects.create(interest=temp_family,management_profile=management,created_by =rejin.id,type_choice='Reduction',amount=temp_family.principal_amt,members=temp_family.people_member)
                    pppp.created_at=temp_family.interest_date
                    pppp.save()
                    if temp_family.apply_first_interest == True:
                        pay1=float(temp_family.interest_amt)
                        pppp=Report.objects.create(interest=temp_family,management_profile=management,created_by =rejin.id,type_choice='Addition',amount=pay1,members=temp_family.people_member)
                        pppp.created_at=temp_family.interest_date
                        pppp.save()
                    
                   
                elif interest_type=="Chit fund Interest":
                    chit_fund_object= ChitFundsDetails.objects.filter(id=temp_family.chitt_fund.id)
                    if chit_fund_object:
                        chit_fund_get_new=ChitFundsDetails.objects.get(id=temp_family.chitt_fund.id)
                        chit_fund_get_new.cash_inhand_amount=float(chit_fund_get_new.cash_inhand_amount) - float(request.data['principal_amt'])
                        chit_fund_get_new.principal_given_amount=float(chit_fund_get_new.principal_given_amount) + float(request.data['principal_amt'])
                        chit_fund_get_new.save()
                        sssss=ChitFundInterestOverallReport.objects.create(interest=temp_family,chitfund=temp_family.chitt_fund,amount=float(request.data['principal_amt']),management_profile=management,income_choice='Principal Given',created_by=rejin.id)
                        sssss.created_at=temp_family.interest_date
                        sssss.save()
                        if temp_family.apply_first_interest ==True:
                            pppp=ChitFundInterestOverallReport.objects.create(created_at=temp_family.interest_date,chitfund=temp_family.chitt_fund,management_profile=management,created_by=rejin.id,amount=temp_family.interest_amt,interest=temp_family,income_choice="Addition")
                            pppp.created_at=temp_family.interest_date
                            pppp.save()
                            

                
                # if temp_family.apply_first_interest ==True:
                #     if temp_family.interest_category == "Installment Interest":
                #         pay=float(temp_family.interest_amt)
                #     else:
                #         pay=0
                # else:
                pay = 0 
                if temp_family.interest_category == "Installment Interest":
                    bal=float(temp_family.final_amt_given)-pay
                else:
                    bal=float(temp_family.principal_amt)-pay   
                    
                # bal_sheet=PeopleInterestBalanceSheet.objects.create(management_profile=management,interest=temp_family,principal_balance=bal,
                #             principal_amt=temp_family.principal_amt,credit_amt=bal,debit_amt=pay,balance_amt=bal,date=temp_family.interest_date,interest_apply_date = temp_family.interest_date)
                                    
                bal_sheet=PeopleInterestBalanceSheet.objects.create(management_profile=management,interest=temp_family,
                            principal_amt=temp_family.principal_amt,credit_amt=bal,balance_amt=bal,date=temp_family.interest_date,interest_apply_date = temp_family.interest_date)
                if temp_family.interest_category == "Interest" : 
                    bal_sheet.principal_balance = temp_family.principal_amt
                    if temp_family.apply_first_interest ==True:
                        bal_sheet.debit_amt = temp_family.interest_amt
                        bal_sheet.intrest_amt = temp_family.interest_amt
                        bal_sheet.intrest_paid_amt = temp_family.interest_amt
                        bal_sheet.save()
                    bal_sheet.save()
                elif temp_family.interest_category == "Interest with capital" : 
                    bal_sheet.principal_balance = temp_family.principal_amt
                    if temp_family.apply_first_interest ==True:
                        bal_sheet.debit_amt = temp_family.interest_amt
                        bal_sheet.intrest_amt = temp_family.interest_amt
                        bal_sheet.intrest_paid_amt = temp_family.interest_amt
                        bal_sheet.save()
                    bal_sheet.save()
                elif temp_family.interest_category == "Installment Interest" : 
                    bal_sheet.principal_balance = bal
                    if temp_family.apply_first_interest ==True:
                        temp_family.paid_counts= int(temp_family.paid_counts) + 1
                        temp_family.save()
                    bal_sheet.save()
              
                if temp_family.apply_first_interest ==True:
                    bal_sheet.first_interest_apply = True
                    bal_sheet.save()

                # ------------------------------------------------------------
                # Owner bug-fix (Feb 2026):
                # On EVERY new Chit-fund Interest submission, populate
                #   balancesheet_peopleinterestbalancesheet.intrest_amt
                # from the Fix-Interest-Rate the operator entered.
                # Previously this field was only written when
                # `apply_first_interest = True`, which left the ledger
                # showing 0 interest for most freshly-created loans
                # (regression flagged during QA on the "chitfund interest"
                # form).
                #
                # Rule (from owner spec):
                #   Fix Interest Rate "%"  -> intrest_amt =
                #       (fix_interest_rate_percent × principal_amt) / 100
                #   Fix Interest Rate "₹"  -> intrest_amt =
                #       fix_interest_rate_percent   (flat rupee value)
                #
                # Scoped strictly to interest_type == "Chit fund Interest"
                # (Management Interest untouched — different flow).
                # ------------------------------------------------------------
                if temp_family.interest_type == "Chit fund Interest":
                    fix_rate  = float(temp_family.fix_interest_rate_percent or 0)
                    principal = float(bal_sheet.principal_amt or 0)
                    if (temp_family.interest_type_new or "").lower() == "percentage":
                        bal_sheet.intrest_amt = round((fix_rate * principal) / 100.0, 2)
                    else:  # "amount"  ->  flat ₹ value
                        bal_sheet.intrest_amt = round(fix_rate, 2)
                    bal_sheet.save()

                # ------------------------------------------------------------
                # Owner rule (Feb 2026): initialise the rolling
                # `installment_date` pointer on the master row for every
                # newly-created Installment-Interest loan. Value = one
                # full cadence step past the loan start date (i.e. the
                # first upcoming installment due date).  Collection
                # views advance / reverse this pointer on payment.
                # ------------------------------------------------------------
                if (temp_family.interest_type == "Chit fund Interest"
                        and temp_family.interest_category == "Installment Interest"
                        and temp_family.interest_date):
                    try:
                        from interest.overdue_views import _installment_delta
                        _delta = _installment_delta(temp_family)
                        if _delta:
                            temp_family.installment_date = temp_family.interest_date + _delta
                            temp_family.save(update_fields=["installment_date"])
                    except Exception as _e:  # pragma: no cover
                        print("init installment_date failed:", _e)

                if temp_family.nominee_apply == False and rejin.is_superuser == False and rejin.member != None:
                    mem_obj= Member_Details.objects.get(id=rejin.member.id)
                    temp_family.nominee_member_name=mem_obj.member_name
                    temp_family.nominee_member=mem_obj
                    temp_family.nominee_mobile_no=mem_obj.member_mobile_number
                    temp_family.nominee_address=mem_obj.family.address
                    temp_family.save()
                InterestPeopleReport.objects.create(management_profile=management,interest=temp_family,reportdate=temp_family.interest_date,credit_amt=bal,balance_amt=bal,type_choice="Initial",created_by =rejin.id)
                if temp_family.apply_first_interest == True:
                    new_interest_report = InterestPeopleReport.objects.create(debit_amt=temp_family.interest_amt,credit_amt=temp_family.interest_amt,management_profile=management,interest=temp_family,reportdate=temp_family.interest_date,balance_amt=bal_sheet.balance_amt,type_choice="Interest",created_by =rejin.id)
                    
                    
                # ------------------------------------------------------------
                # Bug fix (Sep 2026): this legacy catch-up block re-applies
                # the FIRST period's interest by computing it fresh from
                # `checking_day` (the 5th of the month after interest_date),
                # with no awareness that `apply_first_interest = True` already
                # recorded that exact same first period's interest a few
                # lines above (bal_sheet.intrest_amt = temp_family.interest_amt,
                # plus the "Interest" InterestPeopleReport row just created).
                #
                # Once backdating was allowed for any past date/month (not
                # just current/previous month), `checking_day <= today` became
                # true far more often at CREATION time itself — causing this
                # block to unconditionally stack a second interest charge on
                # top of the one apply_first_interest already applied,
                # doubling intrest_amt / intrest_balance_amt for that period.
                #
                # Guard: skip this whole legacy catch-up block when
                # apply_first_interest is True — that period is already
                # accounted for. Any FURTHER overdue periods are handled
                # correctly and idempotently by the newer engine
                # (_apply_for_record / _apply_for_installment in
                # interest/overdue_views.py), which runs whenever the
                # record's profile is viewed or the nightly cron fires, and
                # checks for existing InterestPeopleReport rows before
                # creating new ones.
                # ------------------------------------------------------------
                from dateutil.relativedelta import relativedelta as _rdelta
                if date_object.date() + _rdelta(months=1) <= datetime.date.today() and not temp_family.apply_first_interest:
                   
                    inter_check=PeopleInterestDetails.objects.filter(id=temp_family.id).first()
                    inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                    # ------------------------------------------------------------
                    # Bug fix (Sep 2026): the legacy monthly-interest accrual
                    # block below is only correct for "Interest" and
                    # "Interest with capital" categories, where interest is
                    # billed separately from principal, month over month.
                    #
                    # Installment Interest loans already bake interest into
                    # the fixed installment_amt (principal share + interest
                    # share per period) — they must NOT also accrue this
                    # separate monthly interest charge. The exclusion for
                    # this exact case had been written here previously
                    # (`if inter_check.interest_category == "Installment
                    # Interest": pass`) but was left commented out, so it
                    # never actually ran — every Installment Interest
                    # Management loan was getting a spurious "Interest" row
                    # (and a knock-on spurious "Penalty" row) stacked onto
                    # its balance sheet in addition to its own correct
                    # installment structure.
                    #
                    # This condition now explicitly excludes Installment
                    # Interest, matching the originally-intended behavior.
                    # ------------------------------------------------------------
                    if interest_type=="Management Interest" and inter_check.interest_category != "Installment Interest":
                            checking_dates=temp_family.interest_date + relativedelta(months=1)
                            checking_day=datetime.date(checking_dates.year,checking_dates.month,5)
                            checking_day_penalty=datetime.date(checking_dates.year,checking_dates.month,20)


                            if checking_day <= datetime.date.today():
                                if inter_check.interest_type_new == "amount":
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                elif inter_check.interest_type_new == "percentage":
                                    interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=interest_convert,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                                    
                                if datetime.date.today() >= checking_day_penalty:
                                    # ------------------------------------------------------------
                                    # Fix B (Feb 2026): legacy penalty accrual disabled.
                                    # Penalty is now applied exclusively by the
                                    # single mechanism `_apply_for_installment`
                                    # in overdue_views.py (fixed 3 % ×
                                    # installment_amt × missed_due_dates).
                                    # Leaving this block active would cause a
                                    # DOUBLE-APPLY on interest edits/saves. If
                                    # you ever need to revert, flip the guard.
                                    # ------------------------------------------------------------
                                    if False:  # legacy disabled — do not remove; kept for audit trail
                                        if inter_check.penalty_type == "percentage":
                                            per_convert=(float(inter_bal.intrest_balance_amt) * float(inter_check.penalty_amount))/100
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=datetime.date.today(),credit_amt=float(per_convert),balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)
                                        elif inter_check.penalty_type== "amount":
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=datetime.date.today(),credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                                inter_bal.interest_apply_date=checking_day
                                inter_bal.save() 
                            # elif checking_day < datetime.date.today():
                            #     if inter_check.interest_type_new == "amount":
                            #         inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                            #         inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                            #         inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                            #         inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                            #         inter_bal.save()
                            #         InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                            #     elif inter_check.interest_type_new == "percentage":
                            #         interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                            #         inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                            #         inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                            #         inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                            #         inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                            #         inter_bal.save()
                            #         InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=interest_convert,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                                
                                # if inter_check.penalty_type == "percentage":
                                #     per_convert=(float(inter_bal.intrest_balance_amt) * float(inter_check.penalty_amount))/100
                                #     inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                #     inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                #     inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                                #     inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                #     inter_bal.save()
                                #     InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=datetime.date.today(),credit_amt=float(per_convert),balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)
                                # elif inter_check.penalty_type== "amount":
                                #     inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                #     inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                #     inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)
                                #     inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                #     inter_bal.save()
                                #     InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=datetime.date.today(),credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)
                            
                                inter_bal.interest_apply_date=checking_day
                                inter_bal.save()
                                
                    elif interest_type=="Chit fund Interest":        
                       
                            checking_dates=temp_family.interest_date + relativedelta(months=1)
                            checking_day=datetime.date(checking_dates.year,checking_dates.month,1)
                            checking_day_penalty=datetime.date(checking_dates.year,checking_dates.month,20)


                            if checking_day > datetime.date.today():
                                if inter_check.interest_type_new == "amount":
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                elif inter_check.interest_type_new == "percentage":
                                    interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=interest_convert,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                                    
                                inter_bal.interest_apply_date=checking_day
                                inter_bal.save()

                            elif checking_day <= datetime.date.today():
                                if inter_check.interest_type_new == "amount":
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                elif inter_check.interest_type_new == "percentage":
                                    interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=checking_day,credit_amt=interest_convert,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                                
                                if datetime.date.today() >= checking_day_penalty:
                                    # Fix B (Feb 2026) — legacy penalty
                                    # accrual disabled. See earlier
                                    # sibling block in this file for
                                    # rationale (single-source rule).
                                    if False:  # legacy disabled — kept for audit
                                        if inter_check.penalty_type == "percentage":
                                            per_convert=(float(inter_bal.intrest_balance_amt) * float(inter_check.penalty_amount))/100
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=datetime.date.today(),credit_amt=float(per_convert),balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)
                                        elif inter_check.penalty_type== "amount":
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=datetime.date.today(),credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                                inter_bal.interest_apply_date=checking_day
                                inter_bal.save()
                    
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'GET':
        our_family = PeopleInterestDetails.objects.filter(management_profile=management)
        # our_family = PeopleInterestDetails.objects.all()
        serializer = PeopleInterestDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_interest_given_details(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    try:
        customer = PeopleInterestDetails.objects.get(pk=pk)  
        interest_type=customer.interest_type
    except PeopleInterestDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    
    if request.method == 'GET':
        serializer = PeopleInterestDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT': 
        if get_role=="User" and perm.interest_edit ==True or get_role=="Admin" or rejin.is_superuser == True:   
            check_blansheet=PeopleInterestBalanceSheet.objects.filter(management_profile=management,interest=customer)
            if len(check_blansheet)>1:
                dict6={}
                dict6['message']= "Payment happening"
                return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
            interest_type= customer.interest_type
            # ------------------------------------------------------------
            # Owner rule (Feb 2026): Management Interest no longer blocks
            # on insufficient cash_in_hand — see add_interest_given_details
            # for rationale. cash_in_hand is allowed to go negative.
            # ------------------------------------------------------------
            if interest_type=="Chit fund Interest":
                chit_fund_obj= ChitFundsDetails.objects.filter(id=customer.chitt_fund.id)
                if chit_fund_obj:
                    chit_fund_get=ChitFundsDetails.objects.get(id=customer.chitt_fund.id)
                    if float(chit_fund_get.cash_inhand_amount) < customer.principal_amt:
                        msg={'msg':'Insufficient amount in chit fund'}
                        return Response(msg,status=status.HTTP_226_IM_USED)

            serializer876 = PeopleInterestDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():

                # ------------------------------------------------------------------
                # BUG 1 FIX — Reverse the OLD principal effect BEFORE we save, using
                # `customer` (the existing DB row). After the save we re-apply the
                # NEW principal from `temp_family`. Previous code referenced
                # `temp_family` here, which was NameError since `temp_family` only
                # exists after `serializer876.save()`.
                #
                # Owner rule (Feb 2026): now credits/debits cash_in_hand
                # directly instead of expence_amt, matching
                # add_interest_given_details.
                # ------------------------------------------------------------------
                if interest_type=="Management Interest":
                    managefilter=ManagementTreasure.objects.filter(management_profile=management)
                    if managefilter:
                        manage_get=ManagementTreasure.objects.get(management_profile=management)
                        manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(customer.principal_amt or 0)
                        manage_get.save()
                elif interest_type=="Chit fund Interest":
                    chit_fund_object= ChitFundsDetails.objects.filter(id=customer.chitt_fund.id)
                    if chit_fund_object:
                        chit_fund_get_new=ChitFundsDetails.objects.get(id=customer.chitt_fund.id)
                        old_principal = float(customer.principal_amt or 0)
                        chit_fund_get_new.cash_inhand_amount = float(chit_fund_get_new.cash_inhand_amount) + old_principal
                        chit_fund_get_new.principal_given_amount = float(chit_fund_get_new.principal_given_amount) - old_principal
                        chit_fund_get_new.save()

                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()

                # Apply the NEW principal now that temp_family exists.
                if interest_type=="Management Interest":
                    managefilter=ManagementTreasure.objects.filter(management_profile=management)
                    if managefilter:
                        manage_get=ManagementTreasure.objects.get(management_profile=management)
                        manage_get.cash_in_hand = float(manage_get.cash_in_hand) - float(temp_family.principal_amt or 0)
                        manage_get.save()
                elif interest_type=="Chit fund Interest":
                    chit_fund_object= ChitFundsDetails.objects.filter(id=temp_family.chitt_fund.id)
                    if chit_fund_object:
                        chit_fund_get_new=ChitFundsDetails.objects.get(id=temp_family.chitt_fund.id)
                        new_principal = float(temp_family.principal_amt or 0)
                        chit_fund_get_new.cash_inhand_amount = float(chit_fund_get_new.cash_inhand_amount) - new_principal
                        chit_fund_get_new.principal_given_amount = float(chit_fund_get_new.principal_given_amount) + new_principal
                        chit_fund_get_new.save()
                
                if temp_family.first_interest_amt !=None:
                    pay=float(temp_family.first_interest_amt)
                else:
                    pay=0
                
                bal=float(temp_family.principal_amt)-pay  
                
                check_bal_sheet=PeopleInterestBalanceSheet.objects.filter(interest=customer).first()
                check_bal_sheet.credit_amt=temp_family.principal_amt
                check_bal_sheet.debit_amt=pay
                check_bal_sheet.balance_amt=bal
                check_bal_sheet.save()
                if temp_family.first_interest_amt !=None:
                    check_bal_sheet.first_interest_apply = True
                    check_bal_sheet.save()
                else:
                    check_bal_sheet.first_interest_apply = False
                    check_bal_sheet.save()
                if temp_family.nominee_apply == False and rejin.is_superuser == False:
                    mem_obj= Member_Details.objects.get(id=rejin.member.id)
                    temp_family.nominee_member_name=mem_obj.member_name
                    temp_family.nominee_member=mem_obj
                    temp_family.nominee_mobile_no=mem_obj.member_mobile_number
                    temp_family.nominee_address=mem_obj.family.address
                    temp_family.save()
                else:
                    temp_family.nominee_member_name=None
                    temp_family.nominee_member=None
                    temp_family.nominee_mobile_no=None
                    temp_family.nominee_address=None
                    temp_family.save()     

                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.interest_edit ==True or get_role=="Admin" or rejin.is_superuser == True:   
            serializer876 = PeopleInterestDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.interest_del ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.interest_edit ==True: 
            # interest_type= request.data['interest_type']
            # if interest_type=="Management Interest":
            #     managefil=ManagementTreasure.objects.filter(management_profile=management)
            #     if managefil:
            #         manage=ManagementTreasure.objects.get(management_profile=management)
            #         if (float(manage.cash_in_hand)-float(manage.expence_amt)) < float(request.data['principal_amt']):
            #             return Response(status=status.HTTP_226_IM_USED)
            # elif interest_type=="Chit fund Interest":
            #     chit_fund_obj= ChitFundsDetails.objects.filter(id=request.data['chitt_fund'])
            #     if chit_fund_obj:
            #         chit_fund_get=ChitFundsDetails.objects.get(id=request.data['chitt_fund'])
            #         if float(chit_fund_get.cash_inhand_amount) < float(request.data['principal_amt']):
            #             return Response(status=status.HTTP_226_IM_USED)
            # inter_report=InterestPeopleReport.objects.filter(interest=customer,management_profile=management)      
            # if inter_report:
            #     inter_report_get=InterestPeopleReport.objects.filter(interest=customer,management_profile=management).last()
            #     inter_fil=InterestPeopleReport.objects.filter(id__gt=inter_report_get.id,interest=customer,management_profile=management)  
            #     if inter_fil:
            #         msg={'msg':'interest can not be deleted'}
            #         return Response(status=status.HTTP_226_IM_USED)
            collection_obj=CollectionDetails.objects.filter(interest=customer,management_profile=management)
            if collection_obj:
                    msg={'msg':'interest can not be deleted as it involved in transactions'}
                    return Response(msg,status=status.HTTP_226_IM_USED)
            if customer.interest_type=="Management Interest":
                managefilter=ManagementTreasure.objects.filter(management_profile=management)
                if managefilter:
                    manage_get=ManagementTreasure.objects.get(management_profile=management)
                    # Owner rule (Feb 2026): credit cash_in_hand back
                    # directly instead of expence_amt.
                    manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(customer.principal_amt)
                    manage_get.save()
            
            elif customer.interest_type=="Chit fund Interest":
                chit_fund_object= ChitFundsDetails.objects.filter(id=customer.chitt_fund.id)
                if chit_fund_object:
                    chit_fund_get_new=ChitFundsDetails.objects.get(id=customer.chitt_fund.id)
                    chit_fund_get_new.cash_inhand_amount=float(chit_fund_get_new.cash_inhand_amount) + float(customer.principal_amt)
                    chit_fund_get_new.principal_given_amount=float(chit_fund_get_new.principal_given_amount) - float(customer.principal_amt)
                    chit_fund_get_new.save()
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET'])
def management_interest_details_table(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()

    if request.method == 'GET':
        our_family = PeopleInterestDetails.objects.filter(management_profile=management,interest_type='Management Interest',interest_category="Interest")
        serializer = PeopleInterestDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def management_capital_interest_details_table(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()

    if request.method == 'GET':
        our_family = PeopleInterestDetails.objects.filter(management_profile=management,interest_type='Management Interest',interest_category="Interest with capital")
        serializer = PeopleInterestDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)    

@api_view(['GET'])
def management_installment_interest_details_table(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()

    if request.method == 'GET':
        our_family = PeopleInterestDetails.objects.filter(management_profile=management,interest_type='Management Interest',interest_category="Installment Interest")
        serializer = PeopleInterestDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)    


@api_view(['GET'])
def chit_fund_interest_details_table(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()

    if request.method == 'GET':
        our_family = PeopleInterestDetails.objects.filter(management_profile=management,interest_type='Chit fund Interest',interest_category="Interest")
        serializer = PeopleInterestDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)    

@api_view(['GET'])
def chit_fund_capitalinterest_details_table(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()

    if request.method == 'GET':
        our_family = PeopleInterestDetails.objects.filter(management_profile=management,interest_type='Chit fund Interest',interest_category="Interest with capital")
        serializer = PeopleInterestDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)    

@api_view(['GET'])
def chit_fund_installment_interest_details_table(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()

    if request.method == 'GET':
        our_family = PeopleInterestDetails.objects.filter(management_profile=management,interest_type='Chit fund Interest',interest_category="Installment Interest")
        
        serializer = PeopleInterestDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)    



@api_view(['GET'])
def interest_profile(request, pk):
    print('Fetching Interest Profile...')

    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized. Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    management = ManagementDetails.objects.first()
    if not management:
        return Response({"message": "Management Profile details not found"}, status=status.HTTP_406_NOT_ACCEPTABLE)

    mer = PeopleInterestDetails.objects.filter(pk=pk, management_profile=management).first()
    if not mer:
        return Response({"message": "Interest profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # ------------------------------------------------------------------
    # TC_INTEREST_002 — auto-apply overdue Interest & Penalty rows for
    # this record BEFORE returning its balance sheet so the operator
    # always sees an up-to-date ledger (no manual "Recompute" needed).
    #
    # `_apply_for_record` is fully idempotent: rows are only inserted
    # when the corresponding month is >= today and no matching row
    # exists yet in `InterestPeopleReport`. Safe to run on every load.
    # ------------------------------------------------------------------
    if mer.action:
        try:
            from interest.overdue_views import _apply_for_record
            _apply_for_record(mer)
        except Exception as _e:  # pragma: no cover — never block the read
            print("interest_profile: overdue apply failed:", _e)

    # ------------------------------------------------------------------
    # Owner rule (Feb 2026): rewrite balance_amt on every row of
    # `reports_interestpeoplereport` for this loan using the running
    # formula BEFORE serializing. Fixes drift on Principal Payment /
    # Penalty / Interest Payment rows caused by legacy write-time
    # bugs that copied a stale `PeopleInterestBalanceSheet.balance_amt`
    # instead of computing Σ credit − Σ debit.
    # Idempotent — running twice does nothing.
    # ------------------------------------------------------------------
    try:
        from interest.overdue_views import _recompute_report_balances
        _recompute_report_balances(mer)
    except Exception as _e:  # pragma: no cover
        print("interest_profile: report balance recompute failed:", _e)

    serializer1 = PeopleInterestDetailsSerializer(mer)
    coll_obj = CollectionDetails.objects.filter(management_profile=management, interest=mer)
    serializer5 = CollectionDetailsSerializer(coll_obj, many=True)

    balsheet_objts = PeopleInterestBalanceSheet.objects.filter(management_profile=management, interest=mer)
    ser2 = PeopleInterestBalanceSheetSerializer(balsheet_objts, many=True)

    total_amount_obj = PeopleInterestBalanceSheet.objects.filter(
        interest=mer, management_profile=management
    ).aggregate(total_amount=Sum('balance_amt'))

    total_amount_value = total_amount_obj.get('total_amount', 0) if total_amount_obj else 0

    report = InterestPeopleReport.objects.filter(management_profile=management, interest=mer)
    report_ser = InterestPeopleReportserializer(report, many=True)

    chit_fund_balance_sheet = ChitFundInterestOverallReport.objects.filter(management_profile=management, interest=mer)
    chit_fund_balance_sheet_ser = ChitFundInterestOverallReport_serializer(chit_fund_balance_sheet, many=True)

    response_data = {
        "profile": serializer1.data,
        "balance_sheet": ser2.data,
        "paid_histry": serializer5.data,
        "total_amt": total_amount_value,
        "report_ser": report_ser.data,
        "chit_fund_balance_sheet": chit_fund_balance_sheet_ser.data
    }

  
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET','POST'])
def interest_member_list(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "GET":
        coll_obj=Member_Details.objects.filter(member_tax_eligible=True,death=False,action=True,adult=True)
        list_new=[]
        for i in coll_obj:
            dic={}
            family=Fammily_Details.objects.get(id=i.family.id)
            family_ser=Fammily_DetailsSerializer(family)
            serializer = member_DetailsSerializer(i)
            dic['member'] =serializer.data
            dic['address'] =i.family.address
            list_new.append(dic)

        return Response(list_new,status=status.HTTP_200_OK)




from chit_fund.serializers import ChitFundsDetailsSerializer

@api_view(['GET','POST'])
def get_chit_fund_details(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()

    if request.method == 'GET':
        our_family = ChitFundsDetails.objects.filter(management_profile=management,action=True)
        serializer = ChitFundsDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)   
    



@api_view(['GET','POST'])
def chit_interest_filter_based_type(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "POST":
        type=request.data['type']
        interest = PeopleInterestDetails.objects.filter(interest_type="Chit fund Interest",interest_category=type,management_profile=management)
        interest_ser=PeopleInterestDetailsSerializer(interest,many=True)
        return Response(interest_ser.data,status=status.HTTP_200_OK)
    



@api_view(['GET','POST'])
def management_interest_filter_based_type(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "POST":
        type=request.data['type']
        interest = PeopleInterestDetails.objects.filter(interest_type="Management Interest",interest_category=type,management_profile=management)
        interest_ser=PeopleInterestDetailsSerializer(interest,many=True)
        return Response(interest_ser.data,status=status.HTTP_200_OK)





@api_view(['GET','POST'])
def interest_people_report_get(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "GET":
        interest = InterestPeopleReport.objects.filter(management_profile=management)
        interest_ser=InterestPeopleReportserializer(interest,many=True)
        return Response(interest_ser.data,status=status.HTTP_200_OK)
    elif request.method == "POST":
        jj=request.data['range']
        end_date=jj['end_date']
        start_date=jj['start_date']

        if start_date and end_date:
            start_date_time_obj = datetime.datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.datetime.strptime(str(end_date), '%Y-%m-%d').date()
            interest = InterestPeopleReport.objects.filter(management_profile=management,reportdate__gte=start_date_time_obj,reportdate__lte=end_date_time_obj)
            interest_ser=InterestPeopleReportserializer(interest,many=True)
            return Response(interest_ser.data,status=status.HTTP_200_OK)
        

@api_view(['GET','POST'])
def interest_people_balance_get(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "POST":
        interest_type=request.data['interest_type']
        category=request.data['category']
        interest_balance=PeopleInterestBalanceSheet.objects.filter(interest__interest_category=category,interest__interest_type=interest_type,management_profile=management,intrest_balance_amt__gt=0)
        serializer=PeopleInterestssssBalanceSheetSerializer(interest_balance,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    
# def calculate_payment_amount(request):


@api_view(['GET','POST'])
def interest_people_installmentinterest_balance_get(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "POST":
        interest_type=request.data['interest_type']
        category=request.data['category']
        interest_period=request.data['interest_period']
        interest_balance=PeopleInterestBalanceSheet.objects.filter(interest__interest_type=interest_type,management_profile=management,interest__interest_category=category,interest__interest_period_type=interest_period)
        out=[]
        if interest_period=="Week":
            for iii in interest_balance:
                if iii.interest.interest_period != iii.interest.paid_counts:  
      

                    date_check=iii.interest.interest_date + relativedelta(weeks=iii.interest.paid_counts)
                    limit_date_check=iii.interest.interest_date + relativedelta(weeks=iii.interest.interest_period )

                    da=datetime.date.today()

                    if date_check <=da  and date_check <= limit_date_check:

                        if iii.balance_amt>0 or iii.penalty_balance_amt > 0:    
                            out.append(iii)         
                else:
                    if iii.penalty_balance_amt > 0:
                        out.append(iii)



        elif interest_period=="Days":  
            for iii in interest_balance:
                try:
                    if iii.interest.interest_period != iii.interest.paid_counts:                                       
                        date_check=iii.interest.interest_date + relativedelta(days=iii.interest.paid_counts)
                        limit_date_check=iii.interest.interest_date + relativedelta(days=iii.interest.interest_period )
          
                        if date_check <= datetime.date.today() and date_check <= limit_date_check:                       
                            if iii.balance_amt>0 or iii.penalty_balance_amt > 0:
                                out.append(iii)
                    else:
                        if iii.penalty_balance_amt > 0:
                            out.append(iii)
                except Exception:
                    print("hello")


        elif interest_period=="Month":  
            for iii in interest_balance:
                try:
                    if iii.interest.interest_period != iii.interest.paid_counts:
                        date_check=iii.interest.interest_date + relativedelta(months=iii.interest.paid_counts)
                        limit_date_check=iii.interest.interest_date + relativedelta(months=iii.interest.interest_period )

                        if date_check <= datetime.date.today() and date_check <= limit_date_check:                       
                            if iii.balance_amt>0 or iii.penalty_balance_amt > 0:
                                out.append(iii)
                    else:
                        if iii.penalty_balance_amt > 0:
                            out.append(iii)
                except Exception:
                    print("jjjjjjjjjj")

                                     
        print(out)
        serializer=PeopleInterestssssBalanceSheetSerializer(out,many=True)               
        
        return Response(serializer.data,status=status.HTTP_200_OK)