# from festival.models import ADDFestivalDetails
# from sub_tariff.models import ADDSubscriptionTariffDetails

# from family.models import Member_Details
# from management.models import ManagementDetails
# import datetime
# from amount.models import PeoplesAmountDetails
# from death.models import DeathDetails
# from dateutil.relativedelta import *
# from treasure.models import ManagementBalanceSheet
# from income.models import ADDIncomeDetails
# from expense.models import ADDExpenseDetails
# from datetime import date
# from django.db.models import Sum  
# from balancesheet.models import RentalBalanceSheet,MoveableRentBalanceSheet
# from rental.models import RentalAndLeaseDetails,MovableAssetsRents
# import calendar
# import logging
# from assets.models import AssetDetails
# logger = logging.getLogger("django")

# def subscription_delete():
#     # print("sent")
#     now23 = datetime.datetime.now().date()
#     logger.info(now23)   

#     logger.info("ggggggggggggggg")
#     now1=  datetime.datetime.now().date().month  
#     year1= datetime.datetime.now().date().year
#     sub=ADDSubscriptionTariffDetails.objects.filter(from_date__month=now1,action=True,from_date__year=year1).first()
#     month_end =date(year1, now1, calendar.monthrange(year1, now1)[1])
#     if now23==month_end:
#         sub.action=False
#         sub.save() 
#     else:
#         logger.info("not available")   
#     tariff=ADDSubscriptionTariffDetails.objects.filter(action=True,to_date=(now23 + relativedelta(days=1)))
#     if tariff:
#         tariff_check=ADDSubscriptionTariffDetails.objects.filter(action=True,to_date=now23).first()
#         people_amount=PeoplesAmountDetails.objects.filter(sub_tariff=tariff_check)
#         for peoples in people_amount:
#             peoples.penalty=True
#             peoples.amount_balance = float(peoples.amount_balance) + float(peoples.penalty_amount)
#             peoples.total_bal_amt = float(peoples.total_bal_amt) + float(peoples.penalty_amount)
#             peoples.save() 
#     else:
#         logger.info("no tariff date")

  

#     festive_check=ADDFestivalDetails.objects.filter(penalty_start_date=now23) 
    
#     logger.info(festive_check)   
#     if festive_check:
#           for i in festive_check:
#             i.action=False
#             i.save()

#             logger.info("festival check")          
            
#             peoples_amount= PeoplesAmountDetails.objects.filter(festival_id=i.id)
#             logger.info(peoples_amount)

#             for peoples in peoples_amount:
#                 logger.info("vvvvvvvvvvv")            
#                 peoples.penalty=True
#                 peoples.amount_balance = float(peoples.amount_balance) + float(peoples.penalty_amount)
#                 peoples.total_bal_amt = float(peoples.total_bal_amt) + float(peoples.penalty_amount)
#                 peoples.save() 
#     else:
#         logger.info("no festival")
#     death_check=DeathDetails.objects.filter(penalty_apply_date=now23)    
#     if death_check:
#           for i in death_check:          
#             i.action=False
#             i.save()
#             peoples_amount= PeoplesAmountDetails.objects.filter(death_id=i.id)
#             logger.info(peoples_amount)
#             logger.info("no death check avall")
#             for peoples in peoples_amount:
#                 logger.info("summmmm")

#                 peoples.penalty=True
#                 peoples.amount_balance = float(peoples.amount_balance) + float(peoples.penalty_amount)
#                 peoples.total_bal_amt = float(peoples.total_bal_amt) + float(peoples.penalty_amount)
#                 peoples.save()
#     else:
#         logger.info("no death")

#     # adding rent amount for moveable asets
            
#     movable_asset_check=MovableAssetsRents.objects.filter(action=True)
#     logger.info(movable_asset_check)
#     if movable_asset_check:
#         for asset_check in movable_asset_check:
#             logger.info("hhhhhhhhh")
#             adding_days=asset_check.calculating_days + 1
#             logger.info(adding_days)
#             calculating_date=asset_check.start_date + relativedelta(days=adding_days)
#             logger.info(calculating_date)
#             logger.info(type(calculating_date))
#             logger.info(datetime.datetime.now().date())
#             if calculating_date == datetime.datetime.now().date():
#                 evaluating_amt=MoveableRentBalanceSheet.objects.filter(moveablerent=asset_check,paid=False).first()
#                 logger.info(evaluating_amt)
#                 evaluating_amt.credit_amt= float(evaluating_amt.credit_amt) + float(adding_days * evaluating_amt.credit_amt)
#                 logger.info(evaluating_amt.credit_amt)
#                 evaluating_amt.balance_amt=float(evaluating_amt.balance_amt) + float(adding_days * evaluating_amt.credit_amt)
#                 logger.info(evaluating_amt.balance_amt)
#                 evaluating_amt.save()
#                 logger.info("move rent check")
#                 asset_check.calculating_days = asset_check.calculating_days + 1
#                 print(asset_check.calculating_days)
#                 logger.info("cal days")
#                 asset_check.save() 
#             else:
#                 logger.info("no moveable rent date attained")
#     else:
#         logger.info("no moveable rent asset check")



#     # closing rent based on rent time period
    
#     extend_check=RentalAndLeaseDetails.objects.filter(end_date=(datetime.date.today() + relativedelta(days=1)),action=True,rent=True)
#     if extend_check:
#         for checks in extend_check:
#             if checks.increment_apply:
#                 if checks.increase_time_period_choice=="Month":
#                     checks.previous_end_date=checks.end_date
#                     checks.previous_rent_amt=checks.rent_amt
#                     checks.end_date=(checks.previous_end_date)+relativedelta(months=checks.increase_time_period)
#                     checks.increment_apply=False
#                     if checks.rent_pay_type=="Month":
#                         extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
#                         extend_dates.total_months=extend_dates.total_months + checks.increase_time_period
#                         extend_dates.save()
#                     elif checks.rent_pay_type=="Year":
#                         extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
#                         added_months=checks.increase_time_period * 12
#                         extend_dates.total_months=extend_dates.total_months + added_months
#                         extend_dates.save()
#                     if checks.increase_amt_choice=="Amount":
#                         checks.rent_amt=checks.increment_amt_prcnt  
#                         checks.save()
#                     elif checks.increase_amt_choice=="Percentage":
#                         checks.rent_amt=checks.rent_amt * (checks.increment_amt_prcnt/100)
#                     checks.save()
#                 elif checks.increase_time_period_choice=="Year":
#                     checks.previous_end_date=checks.end_date
#                     checks.previous_rent_amt=checks.rent_amt
#                     checks.end_date=(checks.previous_end_date)+relativedelta(year=checks.increase_time_period)
#                     checks.increment_apply=False
#                     extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
#                     extend_dates.total_months=extend_dates.total_months + checks.increase_time_period
#                     extend_dates.save()
#                     if checks.rent_pay_type=="Month":
#                         added_months=checks.increase_time_period * 12
#                         extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
#                         extend_dates.total_months=extend_dates.total_months + added_months
#                         extend_dates.save()
#                     elif checks.rent_pay_type=="Year":
#                         extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
#                         extend_dates.total_months=extend_dates.total_months + checks.increase_time_period
#                         extend_dates.save()
#                     if checks.increase_amt_choice=="Amount":
#                         checks.rent_amt=checks.increment_amt_prcnt  
#                         checks.save()
#                     elif checks.increase_amt_choice=="Percentage":
#                         checks.rent_amt=checks.rent_amt * (checks.increment_amt_prcnt/100)
#                     checks.save()
#             else:
#                 checks.action=False
#                 asset_checking=AssetDetails.objects.filter(id=checks.asset_id).first()
#                 if asset_checking:
#                     asset_checking.is_booked=True
#                     asset_checking.save()
#                 checks.save()
#     else:
#         logger.info("no moveable rent lease heck")
    
#     # adding rental penalty amount when end dt reached
#     # checking_penalty_lease=RentalAndLeaseDetails.objects.filter(end_date=datetime.date.today(),action=True,rent=True)
#     # if checking_penalty_lease:
#     #     for lease in checking_penalty_lease:
#     #         rental_balance=RentalBalanceSheet.objects.filter(rental_new_amt=lease,paid=False,lease=False).first()
#     #         rental_balance.credit_amt = float(rental_balance.credit_amt) + float(lease.penalty_amt)
#     #         rental_balance.balance_amt = float(rental_balance.balance_amt) + float(lease.penalty_amt)
#     #         rental_balance.save()
#     # else:
#     #     logger.info("checking penalty")

 

#     fam_mem=Member_Details.objects.all()
#     for one_mem in fam_mem:
#         if one_mem.member_dob:
#             today = datetime.date.today()
#             one_mem.member_age = today.year - one_mem.member_dob.year - ((today.month, today.day) < (one_mem.member_dob.month, one_mem.member_dob.day))
#             one_mem.save()
#         if one_mem.member_age!=None and one_mem.member_age>=18:
#             one_mem.adult=True
#             one_mem.save()
            
#         if not one_mem.death and one_mem.member_relation_ship=='SON' or one_mem.member_relation_ship=='FATHER':
#             get_tax_age=ManagementDetails.objects.all().first().tax_age
#             if get_tax_age>0:
#                 gov_tax=get_tax_age
                
#                 if one_mem.member_age >= gov_tax:
#                     one_mem.member_tax_eligible = True
#                     one_mem.save()
#                 else:
#                     one_mem.member_tax_eligible = False
#                     one_mem.save()

#     # increasing rent amount, months done, credit amount for every month 
#     rental_balance=RentalBalanceSheet.objects.filter(paid=False,lease=False)
#     if rental_balance:
#         for i in rental_balance:
#             lease_check=RentalAndLeaseDetails.objects.filter(id=i.rental_new_amt_id,rent=True).first()
#             if lease_check.rent_pay_type=="Month":
#                 lease_check.start_date                     
#                 logger.info(lease_check.start_date)
#                 logger.info(type(lease_check.start_date))
#                 logger.info(i.months_done)
#                 mnth=(i.months_done)+1 
#                 logger.info(mnth)                # end_date_obj = datetime.strptime(lease_check.start_date, "%Y-%m-%d").date()
#                 date_check=lease_check.start_date + relativedelta(months=mnth)
#                 logger.info("tttttttttttttt")
#                 logger.info(date_check)
#                 #  month_start = date(year, month, 1)
#                 start_date=date(date_check.year,date_check.month,1)
#                 logger.info(start_date)
#                 # print(datetime.now().date())
#                 if date_check==datetime.datetime.now().date():
#                     if i.balance_amt == 0:
#                         i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt)
#                         i.balance_amt = float(i.balance_amt) + float(lease_check.rent_amt)
#                         i.months_done = i.months_done + 1
#                         i.save()

                        
#                     elif i.balance_amt > 0:
#                         i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt) + float(lease_check.penalty_amt)
#                         i.balance_amt = float(i.balance_amt) + float(lease_check.rent_amt) + float(lease_check.penalty_amt)
#                         i.months_done = i.months_done + 1
#                         i.save()
#                     else:
#                         logger.info("checking penalty")
#                 else:
#                     logger.info("checking penalty")
                
                
            
#             elif lease_check.rent_pay_type=="Year":
#                 lease_check.start_date                     
#                 print(lease_check.start_date)
#                 print(type(lease_check.start_date))
#                 print(i.months_done)
#                 mnth=(i.months_done)+1        
#                 # end_date_obj = datetime.strptime(lease_check.start_date, "%Y-%m-%d").date()
#                 date_check=lease_check.start_date + relativedelta(year=mnth)
#                 print("tttttttttttttt")
#                 print(date_check)
#                 #  month_start = date(year, month, 1)
#                 start_date=date(date_check.year,date_check.month,1)
#                 print(start_date)
#                 # print(datetime.now().date())
#                 if date_check==datetime.datetime.now().date():
#                     if i.balance_amt == 0:
#                         i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt)
#                         i.balance_amt = float( i.balance_amt) + float(lease_check.rent_amt)
#                         i.months_done = i.months_done + 1
#                         i.save()
#                     elif i.balance_amt > 0:
#                         i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt) +  float(lease_check.penalty_amt)
#                         i.balance_amt = float( i.balance_amt) + float(lease_check.rent_amt) + float(lease_check.penalty_amt)
#                         i.months_done = i.months_done + 1
#                         i.save()
#     else:
#         logger.info("checking rent balance")
#         # elif lease_check.rent_pay_type=="Choose Date":
#         #     if lease_check.end_date ==  datetime.datetime.now().date():
#         #         if lease_check.penalty_amt >0:
#         #             i.credit_amt += lease_check.rent_amt
#         #             i.balance_amt += lease_check.rent_amt
#         #             # i.months_done += 1
#         #             i.save()

#     # month=datetime.datetime.now()
#     # print(month)               
#     # year=datetime.datetime.now().year    
#     # month_start = date(year, month.month, 1) 
#     # if datetime.datetime.now().date()==month_start:
#     #     next_month = month - relativedelta(months=1)
#     #     amount_check=ManagementBalanceSheet.objects.filter(created_at__date__month=next_month.month,created_at__date__year=next_month.year)
#     #     print("uuuuuu")
#     #     if amount_check:
#     #         amount_checks=ManagementBalanceSheet.objects.filter(created_at__date__month=next_month.month,created_at__date__year=next_month.year).first()           
#     #         if amount_checks.opening_balance_type=="Credit":                
                
#     #             opening_balance=amount_checks.opening_balance_amt
#     #         elif amount_checks.opening_balance_type=="Debit":                
                
#     #             opening_balance=amount_checks.opening_balance_amt
#     #     else:  
#     #         opening_balance=0      
#     #         print("99999999999")
#     #     income_check=ADDIncomeDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year)
#     #     print("uuuuuuuuuuuuuuuuu")
#     #     if income_check:
#     #         income_checks=ADDIncomeDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year).first()
            
#     #         income=income_checks.income_amt
#     #     else:
#     #         income=0
#     #     expense_check=ADDExpenseDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year)       
#     #     if expense_check:
#     #         expense_checks=ADDExpenseDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year).first()
            
#     #         expense=expense_checks.expense_amt
#     #     else:
#     #         expense=0
#     #     people_check=PeoplesAmountDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year,name="Festival").aggregate(Sum('total_paid_amt')).get('total_paid_amt__sum')
#     #     if people_check==None:
#     #         people_check=0
        
#     #     people_check1=PeoplesAmountDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year,name="Subscription Tariff").aggregate(Sum('total_paid_amt')).get('total_paid_amt__sum')
#     #     if people_check1==None:
#     #         people_check1=0
        
#     #     people_check2=PeoplesAmountDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year,name="Marriage").aggregate(Sum('total_paid_amt')).get('total_paid_amt__sum')
#     #     if people_check2==None:
#     #         people_check2=0
        
#     #     people_check3=PeoplesAmountDetails.objects.filter(created_at__date__month=month.month,created_at__date__year=year,name="Death").aggregate(Sum('total_paid_amt')).get('total_paid_amt__sum')
#     #     if people_check3==None:
#     #         people_check3=0
        
#     #     total= opening_balance + income  + people_check + people_check1 + people_check2 + people_check3
#     #     total1=expense
#     #     total_amount=(total-total1)                   
      
#     #     if total_amount>0:
#     #         ManagementBalanceSheet.objects.create(opening_balance_amt=total_amount,opening_balance_type="Credit",managee=False,date=datetime.datetime.now().date())
#     #     elif total_amount<0:
#     #         ManagementBalanceSheet.objects.create(opening_balance_amt=abs(total_amount),opening_balance_type="Debit",managee=False,date=datetime.datetime.now().date())


from festival.models import ADDFestivalDetails
from sub_tariff.models import ADDSubscriptionTariffDetails

from family.models import Member_Details
from management.models import ManagementDetails
import datetime
from amount.models import PeoplesAmountDetails
from death.models import DeathDetails
from dateutil.relativedelta import relativedelta
from income.models import ADDIncomeDetails
from expense.models import ADDExpenseDetails
from datetime import date,timedelta
from django.db.models import Sum  
from balancesheet.models import RentalBalanceSheet,MoveableRentBalanceSheet,PeopleInterestBalanceSheet
from rental.models import RentalAndLeaseDetails,MovableAssetsRents
import calendar
import logging
from assets.models import AssetDetails
from reports.models import TempleMemberReport,InterestPeopleReport
from interest.models import PeopleInterestDetails
from interest.serializers import PeopleInterestDetailsSerializer


logger = logging.getLogger("django")

def subscription_delete():
    # print("sent")
    now23 = datetime.datetime.now().date()
    logger.info(now23)   

    logger.info("ggggggggggggggg")
    now1=  datetime.datetime.now().date().month  
    logger.info(now1)
    year1= datetime.datetime.now().date().year
    logger.info(year1)

    # sub=ADDSubscriptionTariffDetails.objects.filter(from_date__month=now1,action=True,from_date__year=year1).first()
    # logger.info(sub)
    # month_end =date(year1, now1, calendar.monthrange(year1, now1)[1])
    # logger.info(month_end)
    # if now23==month_end:
    #     sub.action=False
    #     sub.save() 
    # else:
    #     logger.info("not available") 
    tariff=ADDSubscriptionTariffDetails.objects.filter(action=True,to_date=now23)
    logger.info(tariff)

      
    # tariff=ADDSubscriptionTariffDetails.objects.filter(action=True,to_date=(now23 + relativedelta(days=1)))
    if tariff:
        tariff_check=ADDSubscriptionTariffDetails.objects.filter(action=True,to_date=now23).first()
        logger.info(tariff_check)
        logger.info("kikkkkkkkk")
        people_amount=PeoplesAmountDetails.objects.filter(sub_tariff=tariff_check,paid=False)
        logger.info(people_amount)

        for peoples in people_amount:
            logger.info(peoples)

            # Idempotency guard: only apply the penalty to the running
            # balance ONCE.  Without this, every re-run of this task
            # inflates amount_balance / total_bal_amt by penalty_amount.
            already_applied = bool(peoples.penalty)
            peoples.penalty = True
            if not already_applied:
                peoples.amount_balance = float(peoples.amount_balance) + float(peoples.penalty_amount)
                peoples.total_bal_amt  = float(peoples.total_bal_amt)  + float(peoples.penalty_amount)
            peoples.save()

            # Ledger idempotency: if a "subscription Tariff Penalty" row
            # for this member+tariff already exists, do NOT create another.
            existing_ledger = TempleMemberReport.objects.filter(
                members=peoples.member,
                sub_tariff=tariff_check,
                type_choice="subscription Tariff Penalty",
            ).exists()
            if existing_ledger:
                continue

            mem_report = TempleMemberReport.objects.filter(members=peoples.member)
            if mem_report:
                mem_report_obj = TempleMemberReport.objects.filter(members=peoples.member).last()
                bal1 = float(mem_report_obj.balance_amt) + float(peoples.penalty_amount)
                tem_report=TempleMemberReport.objects.create(management_profile=peoples.management_profile,members=peoples.member,sub_tariff=tariff_check,reportdate=datetime.date.today(),credit_amt=peoples.penalty_amount,balance_amt=bal1,type_choice="subscription Tariff Penalty",created_by=peoples.created_by)
            else:
                tem_report=TempleMemberReport.objects.create(management_profile=peoples.management_profile,members=peoples.member,sub_tariff=tariff_check,reportdate=datetime.date.today(),credit_amt=peoples.penalty_amount,balance_amt=peoples.penalty_amount,type_choice="subscription Tariff Penalty",created_by=peoples.created_by)
        tariff_check.action=False
        tariff_check.save()
            
    else:
        logger.info("no tariff date")

  

    # Expire festivals where today is STRICTLY AFTER end_date (day-after removal).
    # Using end_date__lt=now23 means: on the end_date itself the festival is still
    # active; the next morning this condition triggers, action→False and penalties applied.
    # action=True guard prevents re-processing already-expired festivals.
    festive_check=ADDFestivalDetails.objects.filter(end_date__lt=now23, action=True)
    logger.info(festive_check)   
    if festive_check:
          for i in festive_check:
            i.action=False
            i.save()
            logger.info("festival check")          
            peoples_amount_festival= PeoplesAmountDetails.objects.filter(festival_id=i.id,paid=False)
            logger.info(peoples_amount_festival)
            for peoples_festival in peoples_amount_festival:
                logger.info(peoples_festival)
                logger.info("vvvvvvvvvvv")
                # Idempotency guard: only add penalty to running balance ONCE.
                already_applied = bool(peoples_festival.penalty)
                peoples_festival.penalty = True
                if not already_applied:
                    peoples_festival.amount_balance = float(peoples_festival.amount_balance) + float(peoples_festival.penalty_amount)
                    peoples_festival.total_bal_amt  = float(peoples_festival.total_bal_amt)  + float(peoples_festival.penalty_amount)
                peoples_festival.save()

                # Ledger idempotency: skip if a "Festival Penalty" row for
                # this member+festival is already recorded.
                existing_ledger = TempleMemberReport.objects.filter(
                    members=peoples_festival.member,
                    festivals=i,
                    type_choice="Festival Penalty",
                ).exists()
                if existing_ledger:
                    continue

                mem_report= TempleMemberReport.objects.filter(members=peoples_festival.member)
                if mem_report:
                    mem_report_obj= TempleMemberReport.objects.filter(members=peoples_festival.member).last()
                    bal1=float(mem_report_obj.balance_amt) + float(peoples_festival.penalty_amount)
                    tem_report=TempleMemberReport.objects.create(management_profile=peoples_festival.management_profile,members=peoples_festival.member,festivals=i,reportdate=datetime.date.today(),credit_amt=peoples_festival.penalty_amount,balance_amt=bal1,type_choice="Festival Penalty",created_by=peoples_festival.created_by)
                else:
                    tem_report=TempleMemberReport.objects.create(management_profile=peoples_festival.management_profile,members=peoples_festival.member,festivals=i,reportdate=datetime.date.today(),credit_amt=peoples_festival.penalty_amount,balance_amt=peoples_festival.penalty_amount,type_choice="Festival Penalty",created_by=peoples_festival.created_by)
    else:
        logger.info("no festival")
    death_check=DeathDetails.objects.filter(penalty_apply_date=(now23 + relativedelta(days=1)))  
    logger.info((now23 + relativedelta(days=1)))  
    if death_check:
          for i in death_check:          
            i.action=False
            i.save()
            peoples_amount_death= PeoplesAmountDetails.objects.filter(death_id=i.id,paid=False)
            logger.info(peoples_amount_death)
            logger.info("no death check avall")
            for peoples_death in peoples_amount_death:
                logger.info("summmmm")
                logger.info(peoples_death)
                # Idempotency guard: only add penalty to running balance ONCE.
                already_applied = bool(peoples_death.penalty)
                peoples_death.penalty = True
                if not already_applied:
                    peoples_death.amount_balance = float(peoples_death.amount_balance) + float(peoples_death.penalty_amount)
                    peoples_death.total_bal_amt  = float(peoples_death.total_bal_amt)  + float(peoples_death.penalty_amount)
                peoples_death.save()

                # Ledger idempotency: one "Death Tariff Penalty" row per member+death record.
                existing_ledger = TempleMemberReport.objects.filter(
                    members=peoples_death.member,
                    death_tariff=i,
                    type_choice="Death Tariff Penalty",
                ).exists()
                if existing_ledger:
                    continue

                mem_report= TempleMemberReport.objects.filter(members=peoples_death.member)
                if mem_report:
                    mem_report_obj= TempleMemberReport.objects.filter(members=peoples_death.member).last()
                    bal1=float(mem_report_obj.balance_amt) + float(peoples_death.penalty_amount)
                    tem_report=TempleMemberReport.objects.create(management_profile=peoples_death.management_profile,members=peoples_death.member,death_tariff=i,reportdate=datetime.date.today(),credit_amt=peoples_death.penalty_amount,balance_amt=bal1,type_choice="Death Tariff Penalty",created_by=peoples_death.created_by)
                else:
                    tem_report=TempleMemberReport.objects.create(management_profile=peoples_death.management_profile,members=peoples_death.member,death_tariff=i,reportdate=datetime.date.today(),credit_amt=peoples_death.penalty_amount,balance_amt=peoples_death.penalty_amount,type_choice="Death Tariff Penalty",created_by=peoples_death.created_by)
    else:
        logger.info("no death")

    # adding rent amount for moveable asets
            
    movable_asset_check=MovableAssetsRents.objects.filter(action=True)
    logger.info(movable_asset_check)
    if movable_asset_check:
        for asset_check in movable_asset_check:
            logger.info("hhhhhhhhh")
            adding_days=asset_check.calculating_days + 1
            logger.info(adding_days)
            calculating_date=asset_check.start_date + relativedelta(days=adding_days)
            logger.info(calculating_date)
            logger.info(type(calculating_date))
            logger.info(datetime.datetime.now().date())
            if calculating_date == datetime.datetime.now().date() + (relativedelta(days=adding_days)):
                evaluating_amt=MoveableRentBalanceSheet.objects.filter(moveablerent=asset_check,paid=False).first()
                logger.info(evaluating_amt)
                evaluating_amt.credit_amt= float(evaluating_amt.credit_amt) + float(adding_days * evaluating_amt.credit_amt)
                logger.info(evaluating_amt.credit_amt)
                evaluating_amt.balance_amt=float(evaluating_amt.balance_amt) + float(adding_days * evaluating_amt.credit_amt)
                logger.info(evaluating_amt.balance_amt)
                evaluating_amt.save()
                logger.info("move rent check")
                asset_check.calculating_days = asset_check.calculating_days + 1
                print(asset_check.calculating_days)
                logger.info("cal days")
                asset_check.save() 
            else:
                logger.info("no moveable rent date attained")
    else:
        logger.info("no moveable rent asset check")



    # closing rent based on rent time period
    
    extend_check=RentalAndLeaseDetails.objects.filter(end_date=(datetime.date.today() + relativedelta(days=1)),action=True,rent=True)
    if extend_check:
        for checks in extend_check:
            if checks.increment_apply:
                if checks.increase_time_period_choice=="Month":
                    checks.previous_end_date=checks.end_date
                    checks.previous_rent_amt=checks.rent_amt
                    checks.end_date=(checks.previous_end_date)+relativedelta(months=checks.increase_time_period)
                    checks.increment_apply=False
                    if checks.rent_pay_type=="Month":
                        extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
                        extend_dates.total_months=extend_dates.total_months + checks.increase_time_period
                        extend_dates.save()
                    elif checks.rent_pay_type=="Year":
                        extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
                        added_months=checks.increase_time_period * 12
                        extend_dates.total_months=extend_dates.total_months + added_months
                        extend_dates.save()
                    if checks.increase_amt_choice=="Amount":
                        checks.rent_amt=checks.increment_amt_prcnt  
                        checks.save()
                    elif checks.increase_amt_choice=="Percentage":
                        checks.rent_amt=checks.rent_amt * (checks.increment_amt_prcnt/100)
                    checks.save()
                elif checks.increase_time_period_choice=="Year":
                    checks.previous_end_date=checks.end_date
                    checks.previous_rent_amt=checks.rent_amt
                    checks.end_date=(checks.previous_end_date)+relativedelta(year=checks.increase_time_period)
                    checks.increment_apply=False
                    extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
                    extend_dates.total_months=extend_dates.total_months + checks.increase_time_period
                    extend_dates.save()
                    if checks.rent_pay_type=="Month":
                        added_months=checks.increase_time_period * 12
                        extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
                        extend_dates.total_months=extend_dates.total_months + added_months
                        extend_dates.save()
                    elif checks.rent_pay_type=="Year":
                        extend_dates=RentalBalanceSheet.objects.filter(rental_new_amt=checks,lease=False).first()
                        extend_dates.total_months=extend_dates.total_months + checks.increase_time_period
                        extend_dates.save()
                    if checks.increase_amt_choice=="Amount":
                        checks.rent_amt=checks.increment_amt_prcnt  
                        checks.save()
                    elif checks.increase_amt_choice=="Percentage":
                        checks.rent_amt=checks.rent_amt * (checks.increment_amt_prcnt/100)
                    checks.save()
            else:
                checks.action=False
                asset_checking=AssetDetails.objects.filter(id=checks.asset_id).first()
                if asset_checking:
                    asset_checking.is_booked=True
                    asset_checking.save()
                checks.save()
    else:
        logger.info("no moveable rent lease heck")
    
    # adding rental penalty amount when end dt reached
    # checking_penalty_lease=RentalAndLeaseDetails.objects.filter(end_date=datetime.date.today(),action=True,rent=True)
    # if checking_penalty_lease:
    #     for lease in checking_penalty_lease:
    #         rental_balance=RentalBalanceSheet.objects.filter(rental_new_amt=lease,paid=False,lease=False).first()
    #         rental_balance.credit_amt = float(rental_balance.credit_amt) + float(lease.penalty_amt)
    #         rental_balance.balance_amt = float(rental_balance.balance_amt) + float(lease.penalty_amt)
    #         rental_balance.save()
    # else:
    #     logger.info("checking penalty")

 

    fam_mem=Member_Details.objects.all()
    for one_mem in fam_mem:
        if one_mem.member_dob:
            today = datetime.date.today() - (relativedelta(days=1))
            one_mem.member_age = today.year - one_mem.member_dob.year - ((today.month, today.day) < (one_mem.member_dob.month, one_mem.member_dob.day))
            one_mem.save()
        if one_mem.member_age!=None and one_mem.member_age>=18:
            one_mem.adult=True
            one_mem.save()
            
        if not one_mem.death and one_mem.member_relation_ship=='SON' or one_mem.member_relation_ship=='FATHER':
            get_tax_age=ManagementDetails.objects.all().first().tax_age
            if get_tax_age>0:
                gov_tax=get_tax_age                
                if one_mem.member_age >= gov_tax:
                    one_mem.member_tax_eligible = True
                    one_mem.save()
                else:
                    one_mem.member_tax_eligible = False
                    one_mem.save()

                    

    # increasing rent amount, months done, credit amount for every month 
    rental_balance=RentalBalanceSheet.objects.filter(paid=False,lease=False)
    if rental_balance:
        for i in rental_balance:
            lease_check=RentalAndLeaseDetails.objects.filter(id=i.rental_new_amt_id,rent=True).first()
            if lease_check.rent_pay_type=="Month":
                # lease_check.start_date                     
                logger.info(lease_check.start_date)
                logger.info(type(lease_check.start_date))
                logger.info(i.months_done)
                mnth=(i.months_done)+1 
                logger.info(mnth)                # end_date_obj = datetime.strptime(lease_check.start_date, "%Y-%m-%d").date()
                date_check=lease_check.start_date + relativedelta(months=mnth)
                logger.info("tttttttttttttt")
                logger.info(date_check)
                #  month_start = date(year, month, 1)
                rent_create_date=date(date_check.year,date_check.month,5)
                logger.info(rent_create_date)
                penalty_date=date(date_check.year,date_check.month,20)
                logger.info(penalty_date)

                # logger.info(start_date)
                # print(datetime.now().date())
                if rent_create_date==(datetime.datetime.now().date() + relativedelta(days=1)):
                    # if i.balance_amt == 0:
                        logger.info("rental interest")
                        i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt)
                        i.balance_amt = float(i.balance_amt) + float(lease_check.rent_amt)
                        i.months_done = i.months_done + 1
                        i.save()
                if penalty_date == (datetime.datetime.now().date() + relativedelta(days=1)):
                    if i.balance_amt > 0:
                        logger.info("rent penalty")
                        i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt) + float(lease_check.penalty_amt)
                        i.balance_amt = float(i.balance_amt) + float(lease_check.rent_amt) + float(lease_check.penalty_amt)
                        i.months_done = i.months_done + 1
                        i.save()
                    else:
                        logger.info("checking penalty")
                else:
                    logger.info("checking penalty")               
                
            
            elif lease_check.rent_pay_type=="Year":
                lease_check.start_date                     
                print(lease_check.start_date)
                print(type(lease_check.start_date))
                print(i.months_done)
                mnth=(i.months_done)+1        
                # end_date_obj = datetime.strptime(lease_check.start_date, "%Y-%m-%d").date()
                date_check=lease_check.start_date + relativedelta(year=mnth)
                print("tttttttttttttt")
                print(date_check)
                #  month_start = date(year, month, 1)
                start_date=date(date_check.year,date_check.month,1)
                print(start_date)
                # print(datetime.now().date())
                if date_check==datetime.datetime.now().date() + (relativedelta(days=1)):
                    if i.balance_amt == 0:
                        i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt)
                        i.balance_amt = float( i.balance_amt) + float(lease_check.rent_amt)
                        i.months_done = i.months_done + 1
                        i.save()
                    elif i.balance_amt > 0:
                        i.credit_amt = float(i.credit_amt) + float(lease_check.rent_amt) +  float(lease_check.penalty_amt)
                        i.balance_amt = float( i.balance_amt) + float(lease_check.rent_amt) + float(lease_check.penalty_amt)
                        i.months_done = i.months_done + 1
                        i.save()
    else:
        logger.info("checking rent balance")
       
     

    ##################interest module##########
    #
    # DEPRECATED (Feb 2026 — locked): the entire Interest / Interest-with-
    # Capital / Installment-Interest accrual block below has been superseded
    # by ``interest/overdue_views.py::_apply_for_record`` which is idempotent
    # and invoked on every ``interest_profile`` GET as well as via
    # ``manage.py apply_periodic_interest_penalty``. Running BOTH paths
    # caused double-accrual of interest and penalty rows (see PRD Bug 1 —
    # "Consolidate Penalty Accrual"). Neutralized with an early return so
    # the surrounding non-interest logic (Sub-Tariff / Festival / Death /
    # Marriage / Rental) still runs on the daily scheduler.
    return

    # month_end =date(year, month, calendar.monthrange(year, month)[1])
    interest=PeopleInterestDetails.objects.all()
    if interest:
        for inter in interest:
            inter_check=PeopleInterestDetails.objects.filter(id=inter.id).first()
            if inter_check.interest_category == "Interest" :
                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                now2345=inter_bal.interest_apply_date + relativedelta(months=1)
                # now234555=datetime.date(now2345.year,now2345.month,29)
                now234555=datetime.date(now2345.year,now2345.month,4)
                manage_now234555=datetime.date(now2345.year,now2345.month,19)
                chit_inter=datetime.date(now2345.year,now2345.month,1)
                now23456= chit_inter - relativedelta(days=1)
                new_date_penalty=manage_now234555 + relativedelta(days=1)
                new_date_penalty_chit=now234555 + relativedelta(days=1)

                
                if inter_bal.first_interest_apply == False: 
                    penalty_apply_date = inter_bal.interest_apply_date + relativedelta(months=1)
                    penalty_apply_date_new= penalty_apply_date - relativedelta(days=1)
                    if inter_check.interest_type == "Management Interest":
                        if new_date_penalty == now23 + relativedelta(days=1):
                            if inter_bal.intrest_balance_amt > 0:
                                if inter_check.penalty_type == "percentage":
                                    per_convert=(float(inter_bal.intrest_balance_amt) * float(inter_check.penalty_amount))/100
                                    inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                    inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=new_date_penalty,credit_amt=float(per_convert),balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)
                                elif inter_check.penalty_type== "amount":
                                    inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                    inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=new_date_penalty,credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                    if inter_check.interest_type == "Chit fund Interest":
                        if new_date_penalty == now23 + relativedelta(days=1):
                            if inter_bal.intrest_balance_amt > 0:
                                if inter_check.penalty_type == "percentage":
                                    per_convert=(float(inter_bal.intrest_balance_amt) * float(inter_check.penalty_amount))/100
                                    inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                    inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=new_date_penalty,credit_amt=float(per_convert),balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                                elif inter_check.penalty_type== "amount":
                                    inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                    inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=new_date_penalty,credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                if inter_bal.principal_balance > 0:
                    if inter_bal.first_interest_apply == True:
                    
                        start_date1=inter_bal.interest_apply_date
                        end_date1=inter_bal.interest_apply_date+relativedelta(months=2)
                        chit_first_inter_date=datetime.date(end_date1.year,end_date1.month,1)
                        chit_first_inter_date_minus=chit_first_inter_date - relativedelta(days=1)
                        # chit_first_inter_date_minus=end_date1 


                        manage_first_inter_date=datetime.date(end_date1.year,end_date1.month,4)
                        manage_first_inter_date_penalty=manage_first_inter_date+relativedelta(days=1)

                        # date_list = []
                        # while start_date1 < end_date1:
                        #     date_list.append(str(start_date1))
                        #     start_date1 += timedelta(days=1)
                        # if str(now23) not in date_list:
                        if inter_check.interest_type == "Chit fund Interest":
                                if chit_first_inter_date == now23 + relativedelta(days=1):
                                    if inter_check.interest_type_new == "amount":
                                        inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.save()
                                        InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_first_inter_date,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                    elif inter_check.interest_type_new == "percentage":
                                        interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                                        inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                                        inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                                        inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                                        inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                                        inter_bal.save()
                                        InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_first_inter_date,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                    inter_bal.first_interest_apply = False
                                    inter_bal.interest_apply_date = chit_first_inter_date
                                    inter_bal.save()

                        elif inter_check.interest_type == "Management Interest":
                                if now23 + relativedelta(days=1)== manage_first_inter_date_penalty:
                                    inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                                    if inter_check.interest_type_new == "amount":
                                        inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                        inter_bal.save()
                                        InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=manage_first_inter_date_penalty,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                    elif inter_check.interest_type_new == "percentage":
                                        interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                                        inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                                        inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                                        inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                                        inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                                        inter_bal.save()
                                        InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=manage_first_inter_date_penalty,credit_amt=interest_convert,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                    inter_bal.first_interest_apply = False
                                    inter_bal.interest_apply_date = manage_first_inter_date_penalty
                                    inter_bal.save()
                    elif inter_bal.first_interest_apply == False:
                        print("dghksjdg")
                        print(now23456)
                        if inter_check.interest_type == "Chit fund Interest":
                            if now23 + relativedelta(days=1) == chit_inter:
                                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                                if inter_check.interest_type_new == "amount":
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_inter,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                                    
                                elif inter_check.interest_type_new == "percentage":
                                    interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_inter,credit_amt=interest_convert,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                inter_bal.interest_apply_date = chit_inter
                                inter_bal.save()
                        elif inter_check.interest_type == "Management Interest":
                            if now23 + relativedelta(days=1)== new_date_penalty_chit:
                                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                                if inter_check.interest_type_new == "amount":
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=new_date_penalty_chit,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                elif inter_check.interest_type_new == "percentage":
                                    interest_convert=(float(inter_bal.principal_balance) * float(inter_check.fix_interest_rate_percent))/100
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(interest_convert)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(interest_convert)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(interest_convert)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(interest_convert)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=new_date_penalty_chit,credit_amt=interest_convert,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                inter_bal.interest_apply_date = new_date_penalty_chit
                                inter_bal.save()
                        
                else:
                    logger.info("checking penalty")    


            elif inter_check.interest_category == "Interest with capital" :   
                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                now2345=inter_bal.interest_apply_date + relativedelta(months=1)
                now23456= now2345 - relativedelta(days=1)
                manage_chit=datetime.date(now2345.year,now2345.month,4)
                manage_now=datetime.date(now2345.year,now2345.month,19)

                report_chit_date=manage_now + relativedelta(days=1)
                report_manage_date=manage_chit + relativedelta(days=1)

                chit_inter=datetime.date(now2345.year,now2345.month,1)
                chit_new_inter=chit_inter - relativedelta(days=1)

                # if inter_bal.first_interest_apply == False: 
                #     penalty_apply_date = inter_bal.interest_apply_date + relativedelta(months=1)
                #     penalty_apply_date_new= penalty_apply_date - relativedelta(days=1)

                #     if inter_check.interest_type == "Chit fund Interest":
                #         if chit_inter == now23 + relativedelta(days=1):
                #             if inter_bal.intrest_balance_amt > 0:
                #                 if inter_check.interest_type_new == "percentage":
                #                     cal_amt=float(inter_bal.principal_balance)+ float(inter_bal.intrest_balance_amt)
                #                     new_amt=((cal_amt) * float(inter_check.fix_interest_rate_percent))/100
                #                     print(new_amt)
                #                     inter_bal.intrest_amt = float(inter_bal.intrest_amt)+ float(new_amt)
                #                     inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt)+ float(new_amt)
                #                     inter_bal.balance_amt = float(inter_bal.balance_amt)+ float(new_amt)
                #                     inter_bal.credit_amt = float(inter_bal.credit_amt)+ float(new_amt)
                #                     inter_bal.save()
                #                     InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_inter,credit_amt=new_amt,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                #                 elif inter_check.interest_type_new == "amount":
                #                     inter_bal.intrest_amt = float(inter_bal.intrest_amt)+ float(inter_check.fix_interest_rate_percent)
                #                     inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt)+ float(inter_check.fix_interest_rate_percent)
                #                     inter_bal.balance_amt = float(inter_bal.balance_amt)+ float(inter_check.fix_interest_rate_percent)
                #                     inter_bal.credit_amt = float(inter_bal.credit_amt)+ float(inter_check.fix_interest_rate_percent)
                #                     inter_bal.save()
                #                     InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_inter,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                #                 inter_bal.interest_apply_date = chit_inter
                #                 inter_bal.save()
                #     elif inter_check.interest_type == "Management Interest":
                #         if report_manage_date == now23 + relativedelta(days=1):
                #             if inter_bal.intrest_balance_amt > 0:
                #                 if inter_check.interest_type_new == "percentage":
                #                     cal_amount =float(inter_bal.principal_balance)+ float(inter_bal.intrest_balance_amt)
                #                     new_amt=((cal_amount) * float(inter_check.fix_interest_rate_percent))/100
                #                     inter_bal.intrest_amt = float(inter_bal.intrest_amt)+ float(new_amt)
                #                     inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt)+ float(new_amt)
                #                     inter_bal.balance_amt = float(inter_bal.balance_amt)+ float(new_amt)
                #                     inter_bal.credit_amt = float(inter_bal.credit_amt)+ float(new_amt)

                #                     inter_bal.save()
                #                     InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=report_manage_date,credit_amt=new_amt,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                #                 if inter_check.interest_type_new == "amount":
                #                     inter_bal.intrest_amt = float(inter_bal.intrest_amt)+ float(inter_check.fix_interest_rate_percent)
                #                     inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt)+ float(inter_check.fix_interest_rate_percent)
                #                     inter_bal.balance_amt = float(inter_bal.balance_amt)+ float(inter_check.fix_interest_rate_percent)
                #                     inter_bal.credit_amt = float(inter_bal.credit_amt)+ float(inter_check.fix_interest_rate_percent)

                #                     inter_bal.save()
                #                     InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=report_manage_date,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                #                 inter_bal.interest_apply_date = report_manage_date
                #                 inter_bal.save()
                if inter_bal.principal_balance > 0:
                    if inter_bal.first_interest_apply == True:
                        start_date1=inter_check.created_at.date()
                        end_date1=inter_bal.interest_apply_date+relativedelta(months=2)
                        chit_first_inter_date_capital=datetime.date(end_date1.year,end_date1.month,1)
                        chit_first_inter_date_minus_capital=chit_first_inter_date_capital - relativedelta(days=1)
                        manage_first_inter_date_capital=datetime.date(end_date1.year,end_date1.month,4)
                        manage_first_inter_date_capital_new_date= manage_first_inter_date_capital + relativedelta(days=1)
                        if inter_check.interest_type == "Chit fund Interest":
                            if now23 + relativedelta(days=1)== chit_first_inter_date_capital:
                                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                                if inter_check.interest_type_new=="percentage":
                                    new_amt_new=((float(inter_bal.principal_balance)+ float(inter_bal.intrest_balance_amt)) * float(inter_check.fix_interest_rate_percent))/100

                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(new_amt_new)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(new_amt_new)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(new_amt_new)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(new_amt_new)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_first_inter_date_capital,credit_amt=new_amt_new,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)
                                    
                                elif inter_check.interest_type_new=="amount":
                                    logger.info("sfgfsggg")
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_first_inter_date_capital,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                inter_bal.interest_apply_date = chit_first_inter_date_capital
                                inter_bal.first_interest_apply = False
                                inter_bal.save()
                        elif inter_check.interest_type == "Management Interest":
                        
                            if now23 + relativedelta(days=1)== manage_first_inter_date_capital_new_date:
                                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                                if inter_check.interest_type_new=="percentage":
                                    new_amt_new=((float(inter_bal.principal_balance)+ float(inter_bal.intrest_balance_amt)) * float(inter_check.fix_interest_rate_percent))/100

                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(new_amt_new)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(new_amt_new)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(new_amt_new)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(new_amt_new)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=manage_first_inter_date_capital_new_date,credit_amt=new_amt_new,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                    # inter_bal.interest_apply_date = now23
                                    # inter_bal.save()
                                elif inter_check.interest_type_new=="amount":

                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=manage_first_inter_date_capital_new_date,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                inter_bal.interest_apply_date = manage_first_inter_date_capital_new_date
                                inter_bal.first_interest_apply = False
                                inter_bal.save()
                    elif inter_bal.first_interest_apply == False:
                        if inter_check.interest_type == "Chit fund Interest":
                            if now23 + relativedelta(days=1)== chit_inter:
                                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                                if inter_check.interest_type_new=="percentage":
                                    new_amt_new=((float(inter_bal.principal_balance)+ float(inter_bal.intrest_balance_amt)) * float(inter_check.fix_interest_rate_percent))/100

                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(new_amt_new)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(new_amt_new)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(new_amt_new)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(new_amt_new)
                                    inter_bal.save()
                                    inter_bal.interest_apply_date = chit_inter
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_inter,credit_amt=new_amt_new,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                elif inter_check.interest_type_new=="amount":
                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    inter_bal.interest_apply_date = chit_inter
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=chit_inter,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                        elif inter_check.interest_type == "Management Interest":
                        
                            if now23 + relativedelta(days=1)== report_manage_date:
                                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                                if inter_check.interest_type_new=="percentage":
                                    new_amt_new=((float(inter_bal.principal_balance)+ float(inter_bal.intrest_balance_amt)) * float(inter_check.fix_interest_rate_percent))/100

                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(new_amt_new)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(new_amt_new)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(new_amt_new)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(new_amt_new)
                                    inter_bal.save()
                                    inter_bal.interest_apply_date = report_manage_date
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=report_manage_date,credit_amt=new_amt_new,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                                elif inter_check.interest_type_new=="amount":

                                    inter_bal.intrest_amt = float(inter_bal.intrest_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.intrest_balance_amt = float(inter_bal.intrest_balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.fix_interest_rate_percent)
                                    inter_bal.save()
                                    inter_bal.interest_apply_date = report_manage_date
                                    inter_bal.save()
                                    InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=report_manage_date,credit_amt=inter_check.fix_interest_rate_percent,balance_amt=inter_bal.balance_amt,type_choice="Interest",created_by=inter_check.created_by)

                else:
                    logger.info("checking penalty")   

            elif inter_check.interest_category == "Installment Interest" :   
                inter_bal = PeopleInterestBalanceSheet.objects.get(interest_id=inter_check.id)
                logger.info(inter_bal)  
                if inter_bal.first_interest_apply == True:
                    logger.info("kkkkkk")  

                    if inter_check.interest_period_type== "Week":
                        date_new_get=inter_bal.interest_apply_date
                        interst_date1=inter_bal.interest_apply_date+relativedelta(weeks=2)
                        delta = now23 - date_new_get
                        weeks = delta.days // 7
                        if interst_date1 == now23+relativedelta(days=1):
                            inter_bal.first_interest_apply = False
                            inter_bal.interest_apply_date = now23+relativedelta(days=1)
                            inter_bal.save()
                    elif inter_check.interest_period_type== "Month":
                            date_new_get1=inter_bal.interest_apply_date
                            # interst_date11=inter_bal.interest_apply_date+relativedelta(months=1)
                            # months = (now23.year - date_new.year) * 12 + now23.month - date_new.month
                            interst_date11fff=inter_bal.interest_apply_date+relativedelta(months=1)
                            # interst_date11=inter_bal.interest_apply_date+relativedelta(months=1)

                            months = (now23.year - date_new_get1.year) * 12 + now23.month - date_new_get1.month
                            interst_date11=datetime.date(interst_date11fff.year,interst_date11fff.month,20)
                            if interst_date11 == now23+relativedelta(days=1):
                                inter_bal.first_interest_apply = False
                                inter_bal.interest_apply_date = now23+relativedelta(days=1)
                                inter_bal.save()
                    elif inter_check.interest_period_type== "Days":    
                            date_new_get=inter_bal.interest_apply_date
                            interst_date12=inter_bal.interest_apply_date+relativedelta(days=1)
                            if interst_date12 == now23+relativedelta(days=1):
                                inter_bal.first_interest_apply = False
                                inter_bal.interest_apply_date = now23+relativedelta(days=1)
                                inter_bal.save()
                elif inter_bal.first_interest_apply == False:
                    if inter_bal.principal_balance > 0:
                        if inter_check.interest_period_type== "Week":
                            
                                
                            # inter_check = PeopleInterestBalanceSheet.objects.get(id=interest.id)
                            # if inter_bal.first_interest_apply == True:
                            #     interst_date=inter_bal.interest_apply_date+relativedelta(days=14)
                            #     delta = now23 - date_new
                            #     weeks = delta.days // 7
                            #     if interst_date == now23:
                            #         if weeks > inter_check.paid_counts:
                            #             if inter_check.penalty_type == "percentage":
                            #                 per_convert=(float(inter_check.principal_amt) * float(inter_check.penalty_amount))/100
                            #                 inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                            #                 inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                            #                 inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                            #                 inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)

                            #                 inter_bal.save()
                            #             elif inter_check.penalty_type== "amount":
                            #                 inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                            #                 inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                            #                 inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                            #                 inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)

                            #                 inter_bal.save()
                            #             inter_bal.interest_apply_date = now23
                            #             inter_bal.save()

                            # else:
                            
                                date_new_get=inter_bal.interest_apply_date
                                interst_date=inter_bal.interest_apply_date+relativedelta(weeks=2)
                                delta = now23 - date_new_get
                                weeks = delta.days // 7
                                print(weeks)
                                print("weekss")
                                if interst_date == now23+relativedelta(days=1):
                                    if weeks > inter_check.paid_counts:
                                        if inter_check.penalty_type == "percentage":
                                            per_convert=(float(inter_bal.principal_balance) * float(inter_check.penalty_amount))/100
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=now23+relativedelta(days=1),credit_amt=per_convert,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                                        elif inter_check.penalty_type== "amount":
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)

                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=now23+relativedelta(days=1),credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                                    inter_bal.interest_apply_date = now23+relativedelta(days=1)
                                    inter_bal.save()

                        elif inter_check.interest_period_type== "Month":
                            logger.info("cccccccccc")  

                            # inter_check = PeopleInterestBalanceSheet.objects.get(id=interest.id)
                            date_new=inter_check.created_at.date()
                            date_new_get=inter_bal.interest_apply_date
                            interst_datessss=inter_bal.interest_apply_date+relativedelta(months=1)
                            # interst_date=inter_bal.interest_apply_date+relativedelta(months=1)
                            interst_date=datetime.date(interst_datessss.year,interst_datessss.month,20)
                            # interst_date=inter_bal.interest_apply_date+relativedelta(months=1)
                            months = (now23.year - date_new.year) * 12 + now23.month - date_new_get.month

                            # Adjust the difference if the day of the month is before date1's day
                            if now23.day < date_new_get.day:
                                months -= 1
                            logger.info("djfhsjgsg")
                            logger.info(months)
                            logger.info(inter_check.paid_counts)
                            # return abs(months)
                            if interst_date == now23+relativedelta(days=1):
                                logger.info("jhsjghjfghjfgfgfg")
                                if months > inter_check.paid_counts:
                                    logger.info("jfhjgkdfhjdfh")
                                    if inter_check.penalty_type == "percentage":
                                        per_convert=(float(inter_bal.principal_balance) * float(inter_check.penalty_amount))/100
                                        inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                        inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                        inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                        inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)

                                        inter_bal.save()
                                        InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=now23+relativedelta(days=1),credit_amt=per_convert,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                                    elif inter_check.penalty_type== "amount":
                                        inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                        inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                        inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                        inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)

                                        inter_bal.save()
                                        InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=now23+relativedelta(days=1),credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)

                                inter_bal.interest_apply_date = now23+relativedelta(days=1)
                                inter_bal.save()
                        elif inter_check.interest_period_type== "Days":
                            date_new=inter_check.created_at.date()
                            # Catch-up loop: apply one penalty row for EVERY missed day,
                            # not only the exact next day.  Fixes the bug where jumping
                            # the system date by multiple days silently skips penalties.
                            next_due = inter_bal.interest_apply_date + relativedelta(days=1)
                            while next_due <= now23:
                                day_count = (next_due - date_new).days + 1
                                if day_count > inter_check.paid_counts:
                                    # Avoid duplicate penalty rows for the same day
                                    already_exists = InterestPeopleReport.objects.filter(
                                        interest=inter_check,
                                        reportdate=next_due,
                                        type_choice="Penalty",
                                    ).exists()
                                    if not already_exists:
                                        if inter_check.penalty_type == "percentage":
                                            per_convert=(float(inter_bal.principal_balance) * float(inter_check.penalty_amount))/100
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(per_convert)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(per_convert)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(per_convert)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(per_convert)
                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=next_due,credit_amt=per_convert,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)
                                        elif inter_check.penalty_type== "amount":
                                            inter_bal.penalty_balance_amt = float(inter_bal.penalty_balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.penalty_amt = float(inter_bal.penalty_amt) + float(inter_check.penalty_amount)
                                            inter_bal.balance_amt = float(inter_bal.balance_amt) + float(inter_check.penalty_amount)
                                            inter_bal.credit_amt = float(inter_bal.credit_amt) + float(inter_check.penalty_amount)
                                            inter_bal.save()
                                            InterestPeopleReport.objects.create(management_profile=inter_check.management_profile,interest=inter_check,reportdate=next_due,credit_amt=inter_check.penalty_amount,balance_amt=inter_bal.balance_amt,type_choice="Penalty",created_by=inter_check.created_by)
                                inter_bal.interest_apply_date = next_due
                                inter_bal.save()
                                next_due = next_due + relativedelta(days=1)
                    else:
                        logger.info("checking penalty")      



# ─── Manual scheduler trigger (Admin only) ────────────────────────────────────
from rest_framework.decorators import api_view
from rest_framework.response import Response as DRFResponse
from rest_framework import status as drf_status
from token_app.views import token_checking


@api_view(['POST'])
def run_scheduler_now(request):
    """
    POST /api/my_tasks/run_scheduler_now/
    Admin-only endpoint. Immediately runs subscription_delete() so that
    expired festivals / tariffs / death entries get their penalty rows
    applied without waiting for the nightly cron.
    """
    rejin = token_checking(request)
    if isinstance(rejin, DRFResponse):
        return rejin
    if not (rejin.is_superuser or getattr(rejin, 'user_role', '') == 'Admin'):
        return DRFResponse(
            {'message': 'Admin access required'},
            status=drf_status.HTTP_403_FORBIDDEN,
        )
    try:
        subscription_delete()
        return DRFResponse(
            {'message': 'Scheduler ran successfully. Penalties applied for all expired festivals / tariffs.'},
            status=drf_status.HTTP_200_OK,
        )
    except Exception as e:
        return DRFResponse(
            {'message': f'Scheduler error: {str(e)}'},
            status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
