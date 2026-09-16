from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
from rest_framework.exceptions import AuthenticationFailed
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails, BankDetails
from .models import FundBalanceSheet, FundMembersBalanceSheet
from .serializers import FundBalanceSheetSerializer
from treasure.models import ManagementBalanceSheet
from income.models import ADDIncomeDetails, ADDIncomeCategory
from festival.models import ADDFestivalDetails
import datetime
from datetime import date
import calendar
from dateutil.relativedelta import relativedelta
from expense.models import ADDExpenseDetails, ADDExpenseCategory
from amount.models import PeoplesAmountDetails, PeoplesJOININGAmountDetails, CashTransactionDetails
from django.db.models import Sum
from collection.models import CollectionDetails
from sub_tariff.models import ADDSubscriptionTariffDetails
from marriage.models import MarriageDetails
from death.models import DeathDetails
from family.models import Member_Details
from family.serializers import member_DetailsSerializer, Member_DetailsSerializer98
from rental.models import RentalAndLeaseDetails, MovableAssetsRents
from fund.models import ADDFundDetails, FundGroupDetails, FundMemberDetailss, FundLeaseDetailss, FundLeaseMemberDetailss
from reports.models import Report, TempleMemberReport, FundMemberReport, ChitFundInterestOverallReport, InterestPeopleReport
from chit_fund.models import ChitFundsDetails
from interest.models import PeopleInterestDetails
import logging
logger = logging.getLogger("django")


@api_view(['GET'])
def collection_page_fund_view(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()        
    try:
        funds = FundGroupDetails.objects.get(pk=pk,management_profile=management)  
    except FundGroupDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)        
    if request.method == 'GET':
        fund_balsheet=FundBalanceSheet.objects.filter(management_profile=management,fund=funds)
        ser1=FundBalanceSheetSerializer(fund_balsheet,many=True)
        return Response(ser1.data,status=status.HTTP_200_OK)
    

@api_view(['GET','POST'])
def balancesheet_view(request):
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
    get_role=rejin.user_role   
    
    
    if request.method == 'POST':
        if get_role=="User" or get_role=="Admin" or rejin.is_superuser == True:      

            range_type=request.data['range_type']
            if range_type=="custom_date_range":
                dic={}
                dic1={}      
                start_date=request.data['start_date']
                end_date=request.data['end_date']
                all_incomes=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Addition",mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if all_incomes==None:
                    all_incomes=0
                
                all_incomes_bank_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Addition",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_incomes_bank_amount==None:
                    all_incomes_bank_amount=0
                all_incomes_cash_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Addition",mangebalancesheet=None,banks=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if all_incomes_cash_amount==None:
                    all_incomes_cash_amount=0

                all_income_deposit=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Deposit",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_deposit==None:
                    all_income_deposit=0
                all_income_withdraw=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Withdraw",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_withdraw==None:
                    all_income_withdraw=0

                all_income_borrow_cash=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow",mangebalancesheet=None,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_borrow_cash==None:
                    all_income_borrow_cash=0
                all_income_borrow_paid_cash=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow Paid",mangebalancesheet=None,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_borrow_paid_cash==None:
                    all_income_borrow_paid_cash=0
                
                all_income_borrow_bank=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_borrow_bank==None:
                    all_income_borrow_bank=0
                all_expense_borrow_bank=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow Paid",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_expense_borrow_bank==None:
                    all_expense_borrow_bank=0

                all_income_loan_bank=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Loan",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_loan_bank==None:
                    all_income_loan_bank=0
                all_expense_loan_repay=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Loan Repay",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_expense_loan_repay==None:
                    all_expense_loan_repay=0

                
                all_expenses=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Reduction",mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if all_expenses==None:
                    all_expenses=0  

                all_expenses_bank_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Reduction",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_expenses_bank_amount==None:
                    all_expenses_bank_amount=0
                all_expenses_cash_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Reduction",mangebalancesheet=None,banks=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if all_expenses_cash_amount==None:
                    all_expenses_cash_amount=0

                opening_balance_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(mangebalancesheet=None)
                if opening_balance_check:
                    opening_balance_check_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(mangebalancesheet=None).first()
                    if opening_balance_check_amount.type_choice =="Addition":
                        opening_balance_check_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,banks=None).exclude(mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                        
                        opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                        
                        if opening_balance_bank_amounts==None:
                            opening_balance_bank_amounts=0
                        opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                        
                        if opening_balance_bank_amounts_reduction==None:
                            opening_balance_bank_amounts_reduction=0

                        
                        total_opening_balnce= opening_balance_check_amounts + all_incomes - all_expenses + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount + opening_balance_check_amounts  - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash
                       

                    elif opening_balance_check_amount.type_choice =="Reduction":
                        opening_balance_check_amounts=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                        opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                        if opening_balance_bank_amounts==None:
                            opening_balance_bank_amounts=0
                        opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                        if opening_balance_bank_amounts_reduction==None:
                            opening_balance_bank_amounts_reduction=0
                        total_opening_balnce=all_incomes -all_expenses - opening_balance_check_amounts + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount - opening_balance_check_amounts - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash               
                    else:
                        total_opening_balnce=0
                        calculating_bank_opening=0
                        calculating_cash_opening=0
                else:
                    opening_balance_check=Report.objects.filter(management_profile=management,created_at__date__lt=start_date).exclude(mangebalancesheet=None)
                    if opening_balance_check:
                        opening_balance_check_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date).exclude(mangebalancesheet=None).first()
                        if opening_balance_check_amount.type_choice =="Addition":
                            opening_balance_check_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lt=start_date).exclude(mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                            opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            if opening_balance_bank_amounts==None:
                                opening_balance_bank_amounts=0
                            opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                            if opening_balance_bank_amounts_reduction==None:
                                opening_balance_bank_amounts_reduction=0
                            
                            total_opening_balnce= opening_balance_check_amounts + all_incomes - all_expenses + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount + opening_balance_check_amounts - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash

                        elif opening_balance_check_amount.type_choice =="Reduction":
                            opening_balance_check_amounts=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lt=start_date).exclude(mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                            opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            if opening_balance_bank_amounts==None:
                                opening_balance_bank_amounts=0
                            opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                            if opening_balance_bank_amounts_reduction==None:
                                opening_balance_bank_amounts_reduction=0
                            total_opening_balnce=all_incomes -all_expenses - opening_balance_check_amounts + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount + opening_balance_check_amounts   - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash              
                        else:
                            total_opening_balnce=0
                            calculating_bank_opening=0
                            calculating_cash_opening=0
                    else:                        
                            opening_balance_check=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,mangebalancesheet=None)
                            if opening_balance_check:
                                    opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                                    if opening_balance_bank_amounts==None:
                                        opening_balance_bank_amounts=0                     
                                    opening_balance_check_amounts=0  
                                    opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                                    if opening_balance_bank_amounts_reduction==None:
                                        opening_balance_bank_amounts_reduction=0                      #     
                                    total_opening_balnce= opening_balance_check_amounts + all_incomes - all_expenses + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                                    calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                                    calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount + opening_balance_check_amounts - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash
                        
                            else:
                                opening_balance_check=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,managee=True)
                                if opening_balance_check:
                                    opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                                    if opening_balance_bank_amounts==None:
                                        opening_balance_bank_amounts=0                     
                                     
                                    opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lt=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                                    if opening_balance_bank_amounts_reduction==None:
                                        opening_balance_bank_amounts_reduction=0 
                                    total_opening_balnce=   opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                                    calculating_bank_opening= opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                                    calculating_cash_opening= 0
                                else: 

                                    total_opening_balnce=0
                                    calculating_bank_opening=0
                                    calculating_cash_opening=0  

                if total_opening_balnce>0:
                    dic['opening_balance']=total_opening_balnce
                    opening_balance_credit=total_opening_balnce
                
                elif total_opening_balnce==0:
                    opening_balance=total_opening_balnce 
                    print(opening_balance)              
                else:
                    dic1['opening_balance']=abs(total_opening_balnce)  
                    opening_balance_debit=total_opening_balnce
                
                all_incomes_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income").aggregate(Sum('amount')).get('amount__sum')
                if all_incomes_check==None:
                    all_incomes_check=0
                all_income_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income")
                if all_income_details:                    
                   
                    out2=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income").aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income").exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    category_check_expense=ADDIncomeDetails.objects.exclude(income_subcategory="Chit Fund Income").filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).values("category_id").distinct()
                    for i in category_check_expense:
                        print(i['category_id'])
                        category_check_expense_details=ADDIncomeDetails.objects.exclude(income_subcategory="Chit Fund Income").filter(category=i['category_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date)
                        category_check_expense_total_amount=ADDIncomeDetails.objects.exclude(income_subcategory="Chit Fund Income").filter(category=i['category_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).aggregate(Sum('income_amt')).get('income_amt__sum')
                        category_name=ADDIncomeCategory.objects.filter(id=i['category_id']).first().category_name
                        category_id=ADDIncomeCategory.objects.filter(id=i['category_id']).first()

                        out1=[]
                        for a in category_check_expense_details:
                            dict1111={}
                            dict1111['name']=a.income_name
                            dict1111['amount']=a.income_amt
                            if a.bank:
                                dict1111['payment_type']=a.bank_name
                            else:
                                dict1111['payment_type']=a.transaction_type
                            

                            out1.append(dict1111)
                        dict3={}
                        dict3['name']=category_name
                        dict3['amount']=category_check_expense_total_amount
                        dict3['details']=  out1
                        dict3['id']=  category_id.id 

                        out2.append(dict3)
                        print(out2)
                    dicttttt={}
                    dicttttt['income_details']=out2
                    dicttttt['cash_amount']=all_festival_cash_amount
                    dicttttt['bank_amount']=all__festival_bank_amount
                   

                    dic['income']=dicttttt 

                all_expense_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense").aggregate(Sum('amount')).get('amount__sum')
                if all_expense_check==None:
                    all_expense_check=0
                all_expense_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense")
                if all_expense_details:
                    out2=[]
                    category_check_expense=ADDExpenseDetails.objects.exclude(expense_subcategory="Chit Fund Expense").filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).values("category_id").distinct()
                    all_expense_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense").exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_expense_bank_amount==None:
                        all_expense_bank_amount=0
                    all_expense_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",banks=None).exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense").aggregate(Sum('amount')).get('amount__sum')
                    if all_expense_cash_amount==None:
                        all_expense_cash_amount=0
                    for i in category_check_expense:
                        print(i['category_id'])
                        category_check_expense_details=ADDExpenseDetails.objects.exclude(expense_subcategory="Chit Fund Expense").filter(category=i['category_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date)
                        category_check_expense_total_amount=ADDExpenseDetails.objects.exclude(expense_subcategory="Chit Fund Expense").filter(category=i['category_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).aggregate(Sum('expense_amt')).get('expense_amt__sum')
                        category_name=ADDExpenseCategory.objects.filter(id=i['category_id']).first().category_name
                        category_id=ADDExpenseCategory.objects.filter(id=i['category_id']).first()
                        out1=[]
                        for a in category_check_expense_details:
                            dict1111={}
                            dict1111['name']=a.expense_name
                            dict1111['amount']=a.expense_amt
                            if a.bank:
                                dict1111['payment_type']=a.bank_name
                            else:
                                dict1111['payment_type']=a.transaction_type
                            

                            out1.append(dict1111)
                        dict3={}
                        dict3['name']=category_name
                        dict3['amount']=category_check_expense_total_amount
                        dict3['details']=  out1
                        dict3['id']=  category_id.id 

                                   
                        out2.append(dict3)
                    dict222={}
                    dict222['expense_details']=out2
                    dict222['cash_amount']=all_expense_cash_amount
                    dict222['bank_amount']=all_expense_bank_amount 
                    dic1['expense']  =dict222


                all_marriage_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(marriage=None).aggregate(Sum('amount')).get('amount__sum')
                if all_marriage_check==None:
                    all_marriage_check=0
                all_marriage_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(marriage=None).values("marriage_id").distinct()
                if all_marriage_details:
                    out=[]
                    all_marriage_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(marriage=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_marriage_cash_amount==None:
                        all_marriage_cash_amount=0
                    all_marriage_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(marriage=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_marriage_bank_amount==None:
                        all_marriage_bank_amount=0
                    for i in all_marriage_details:                    
                        fest_details=MarriageDetails.objects.filter(id=i["marriage_id"]).first()                        
                        amount_details=PeoplesAmountDetails.objects.filter(marriage=fest_details)
                        if len(amount_details) >1:
                            for i in  amount_details: 
                                print("ggggggggggggggg")
                                payment_nature=CollectionDetails.objects.filter(amount_link=i).first() 
                                dict1222={}                   
                                dict1222['name']=f'{i.member.member_name}' +"/"+f'{i.member.member_no}'       
                                dict1222['total_amount']= i.amount
                                if  payment_nature: 
                                    if payment_nature.bank_link:
                                        dict1222['payment_type']= payment_nature.bank_name  
                                    else:
                                        dict1222['payment_type']= payment_nature.transaction_type  

                                dict1222['id']=fest_details.id 

                                out.append(dict1222)
                        elif len(amount_details)==1:
                            amount_detail=PeoplesAmountDetails.objects.filter(marriage=fest_details).first()
                            payment_nature=CollectionDetails.objects.filter(amount_link=amount_detail).first() 

                            amount_details_check=PeoplesAmountDetails.objects.filter(marriage=fest_details).first()
                            dict1={}
                            dict1['name']=f'{amount_details_check.member.member_name}' +"/"+f'{amount_details_check.member.member_no}'       
                            dict1['total_amount']= amount_details_check.amount 
                            if payment_nature:
                                if payment_nature.bank_link:
                                    dict1['payment_type']= payment_nature.bank_name  
                                else:
                                    dict1['payment_type']= payment_nature.transaction_type   
                            dict1['id']=fest_details.id 
                                            
                            out.append(dict1)

                        dict11111={}
                        dict11111['amount']=all_marriage_check
                        dict11111['marriage_details']=out
                        dict11111['cash_amount']=all_marriage_cash_amount
                        dict11111['bank_amount']=all_marriage_bank_amount
                        dict11111['id']=fest_details.id

                    dic['marriage']=dict11111                

                
                all_death_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False).exclude(death_tariff=None).values("death_tariff_id").distinct()
                if all_death_details:
                    out=[]
                    all_death_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(death_tariff=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_death_cash_amount==None:
                        all_death_cash_amount=0
                    all__death_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(death_tariff=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__death_bank_amount==None:
                        all__death_bank_amount=0
                    for i in all_death_details:

                        death_num=DeathDetails.objects.filter(id=i["death_tariff_id"]).first()
                        paid_check_count=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,death_tariff_id=i["death_tariff_id"]).count()
                        
                        peopl_link_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,death_tariff_id=i["death_tariff_id"])
                        
                        all_death_check=Report.objects.filter(death_tariff=death_num,management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False).aggregate(Sum('amount')).get('amount__sum')
                        if all_death_check==None:
                            all_death_check=0
                        out1=[]                      
                        
                        for people in peopl_link_details:
                            collect=CollectionDetails.objects.filter(id=people.collection_id).first()

                            link_details=collect.amount_link_id
                            get_people=PeoplesAmountDetails.objects.filter(id=link_details).first()
                            mem_det=Member_Details.objects.filter(id=get_people.member_id).first()
                            dict11={}  
                                            
                            dict11['name']=f'{mem_det.member_name}/{mem_det.member_no}'       
                            dict11['total_amount']= get_people.amount
                            dict11['mobile_number']=mem_det.member_mobile_number
                            if collect.bank_link:
                                dict11['payment_type']= collect.bank_name  
                            else:
                                dict11['payment_type']= collect.transaction_type 
                                           
                            
                            out1.append(dict11)
                        dict1={}
                        dict1['name']=f'{death_num.death_no}/{death_num.member_name}'                    
                        dict1['amount']=death_num.death_tariff_amt
                        dict1['member_count']=paid_check_count
                        dict1['total_amount']=all_death_check
                        dict1['member_details']=out1
                        dict1['cash_amount']=all_death_cash_amount
                        dict1['bank_amount']=all__death_bank_amount

                        dict1['id'] =  death_num.id
                        out.append(dict1)
                        
                    dic['death']=out


                all_festival_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False).exclude(festivals=None).values("festivals_id").distinct()
                if all_festival_details:
                    out=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(festivals=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(festivals=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    for i in all_festival_details:
                        fest_details=ADDFestivalDetails.objects.filter(id=i["festivals_id"]).first()
                        peopl_link_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,festivals_id=i["festivals_id"])
                        
                        paid_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,festivals_id=i["festivals_id"]).count()

                        all_festival_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,festivals=fest_details).aggregate(Sum('amount')).get('amount__sum')
                        if all_festival_check==None:
                            all_festival_check=0
                        out1=[]
                        for people in peopl_link_details:
                            collect=CollectionDetails.objects.filter(id=people.collection_id).first()

                            link_details=collect.amount_link_id
                            get_people=PeoplesAmountDetails.objects.filter(id=link_details).first()
                            mem_det=Member_Details.objects.filter(id=get_people.member_id).first()
                            dict11={}                   
                            dict11['name']=f'{mem_det.member_name}/{mem_det.member_no}'             
                            dict11['total_amount']= get_people.amount
                            dict11['mobile_number']=mem_det.member_mobile_number
                            if collect.bank_link:
                                dict11['payment_type']= collect.bank_name  
                            else:
                                dict11['payment_type']= collect.transaction_type
                            out1.append(dict11)
                        dict1={}
                        dict1['name']=fest_details.festival_name
                        dict1['amount']=fest_details.tax_per_head
                        dict1['member_count']=paid_check
                        dict1['total_amount']=all_festival_check
                        dict1['member_details']=out1
                        dict1['cash_amount']=all_festival_cash_amount
                        dict1['bank_amount']=all__festival_bank_amount
                        dict1['id']=fest_details.id
                        
                        out.append(dict1)
                    dic['festival']=out

                        
                all_tariff_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False).exclude(sub_tariff=None).values("sub_tariff_id").distinct()
                if all_tariff_details:
                    out=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(sub_tariff=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(sub_tariff=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    for i in all_tariff_details:
                        fest_details=ADDSubscriptionTariffDetails.objects.filter(id=i["sub_tariff_id"]).first()
                        paid_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,sub_tariff_id=i["sub_tariff_id"]).count()
                        
                        peopl_link_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,sub_tariff_id=i["sub_tariff_id"])
                        
                        all_tariff_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,sub_tariff=fest_details).aggregate(Sum('amount')).get('amount__sum')
                        if all_tariff_check==None:
                            all_tariff_check=0
                        out1=[]
                        
                        
                        for people in peopl_link_details:
                            collect=CollectionDetails.objects.filter(id=people.collection_id).first()

                            link_details=collect.amount_link_id
                            get_people=PeoplesAmountDetails.objects.filter(id=link_details).first()
                            mem_det=Member_Details.objects.filter(id=get_people.member_id).first()
                            dict11={}
                            dict11['name']=mem_det.member_name      
                            dict11['amount']= get_people.amount
                            if collect.bank_link:
                                dict11['payment_type']= collect.bank_name  
                            else:
                                dict11['payment_type']= collect.transaction_type
                            out1.append(dict11)
                        dict1={}
                        dict1['name']=fest_details.subscription_no
                        dict1['member_count']=paid_check
                        dict1['total_amount']=all_tariff_check
                        dict1['member_details']=out1
                        dict1['cash_amount']=all_festival_cash_amount
                        dict1['bank_amount']=all__festival_bank_amount
                        dict1['id']=fest_details.id

                        
                        out.append(dict1)                    
                    dic['tariff']=out 

              
                rent_out1=[]  
                all_rentlease_check1=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')
                if all_rentlease_check1==None:
                    all_rentlease_check1=0
                all_rentlease_details1=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(rentsandlease=None)
                out1=[]
                if all_rentlease_details1:
                    rent_lease_bank_amount=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(rentsandlease=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount==None:
                        rent_lease_bank_amount=0
                    
                    rent_lease_cash_amount=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None,banks=None).exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount==None:
                        rent_lease_cash_amount=0
                    for i in all_rentlease_details1:
                        dict1={}                     

                        rent_lease_expense=RentalAndLeaseDetails.objects.filter(id=i.rentsandlease_id).first()
                        dict1['rent_no']="Rent Advance - " + f'{rent_lease_expense.lease_rent_no}/{rent_lease_expense.asset_name}'
                        dict1['amount']=rent_lease_expense.initial_advance_amt
                        if rent_lease_expense.bank_link:
                            dict1['payment_type']=rent_lease_expense.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash" 
                        
                        rent_out1.append(dict1)
                else:
                    rent_lease_bank_amount=0  
                    rent_lease_cash_amount=0 


                all_rentlease_check2=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(rentsandlease=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_rentlease_check2==None:
                    all_rentlease_check2=0
                all_rentlease_details2=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(rentsandlease=None).exclude(collection=None).values("rentsandlease_id").distinct()             
                
                if all_rentlease_details2:
                    rent_lease_bank_amount1=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(rentsandlease=None).exclude(collection=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount1==None:
                        rent_lease_bank_amount1=0
                    
                    rent_lease_cash_amount1=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(rentsandlease=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount1==None:
                        rent_lease_cash_amount1=0
                    for i in all_rentlease_details2:
                        dict1={}                       
                        
                        rent_lease_expense=RentalAndLeaseDetails.objects.filter(id=i["rentsandlease_id"]).first()
                        rent_lease_amounts=CollectionDetails.objects.filter(rentsandlease=rent_lease_expense,management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).aggregate(Sum('amount')).get('amount__sum')
                        dict1['rent_no']="Rent Payment - " + f'{rent_lease_expense.lease_rent_no}/{rent_lease_expense.asset_name}'
                        dict1['amount']=rent_lease_amounts
                        if rent_lease_expense.bank_link:
                            dict1['payment_type']=rent_lease_expense.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash" 
                        rent_out1.append(dict1)
                else:
                    rent_lease_bank_amount1=0  
                    rent_lease_cash_amount1=0

                all_moveable_check1=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')
                if all_moveable_check1==None:
                    all_moveable_check1=0
                all_moveable_details1=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(moveablerent=None).values("moveablerent_id").distinct()
                if all_moveable_details1:
                    rent_lease_bank_amount2=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(moveablerent=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount2==None:
                        rent_lease_bank_amount2=0
                    
                    rent_lease_cash_amount2=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None,collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount2==None:
                        rent_lease_cash_amount2=0
                    for i in all_moveable_details1:
                        dict1={}
                        rent_lease_expense_moveable=MovableAssetsRents.objects.filter(id=i["moveablerent_id"]).first()
                        dict1['rent_no']="Moveable-Rent Advance - "+f'{rent_lease_expense_moveable.rent_no}'
                        dict1['amount']=rent_lease_expense_moveable.advance_amt  
                        if rent_lease_expense_moveable.bank_link:
                            dict1['payment_type']=rent_lease_expense_moveable.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash"                   
                        rent_out1.append(dict1) 
                else:
                    
                    rent_lease_bank_amount2=0  
                    rent_lease_cash_amount2=0
                all_moveable_check2=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(moveablerent=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_moveable_check2==None:
                    all_moveable_check2=0
                
                all_moveable_details2=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(moveablerent=None).exclude(collection=None).values("moveablerent_id").distinct()
                if all_moveable_details2:
                    rent_lease_bank_amount3=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(moveablerent=None).exclude(collection=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount3==None:
                        rent_lease_bank_amount3=0
                    
                    rent_lease_cash_amount3=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount3==None:
                        rent_lease_cash_amount3=0
                    for i in all_moveable_details2:
                        dict1={}
                        rent_lease_expense_moveable=MovableAssetsRents.objects.filter(id=i["moveablerent_id"]).first()
                        rent_moveable_lease_amounts=CollectionDetails.objects.filter(moveablerent=rent_lease_expense_moveable,management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).aggregate(Sum('amount')).get('amount__sum')

                        dict1['rent_no']="Moveable-Rent Payment - "+f'{rent_lease_expense_moveable.rent_no}'
                        dict1['amount']=rent_moveable_lease_amounts 
                        if rent_lease_expense_moveable.bank_link:
                            dict1['payment_type']=rent_lease_expense_moveable.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash"                     
                        rent_out1.append(dict1)
                else:
                    rent_lease_bank_amount3=0
                    rent_lease_cash_amount3=0
                overall_rent_cash=rent_lease_cash_amount2 + rent_lease_cash_amount1 + rent_lease_cash_amount + rent_lease_cash_amount3
                overall_rent_bank=rent_lease_bank_amount2 + rent_lease_bank_amount1 + rent_lease_bank_amount + rent_lease_bank_amount3

                
                if all_rentlease_details1 or all_rentlease_details2 or all_moveable_details1 or all_moveable_details2:
                    dictttt={}
                    dictttt['rent_details']=rent_out1
                    dictttt['cash_amount']=overall_rent_cash
                    dictttt['bank_amount']=overall_rent_bank
                    dic['other_incomes']=dictttt 

                rent_out=[]
                all_rentlease_check3=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')
                if all_rentlease_check3==None:
                    all_rentlease_check3=0
                all_rentlease_details3=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",collection=None).exclude(rentsandlease=None)
                if all_rentlease_details3:
                    moveable_bank_amount=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",collection=None).exclude(rentsandlease=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_bank_amount==None:
                        moveable_bank_amount=0
                    
                    moveable_cash_amount=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",banks=None,collection=None).exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_cash_amount==None:
                        moveable_cash_amount=0
                    for i in all_rentlease_details3:
                        rent_lease_expense=RentalAndLeaseDetails.objects.filter(id=i.rentsandlease_id).first()
                        dict1={}
                        dict1['rent_no']=f'{rent_lease_expense.lease_rent_no}/{rent_lease_expense.asset_name}'
                        dict1['amount']=rent_lease_expense.advance_settlement_amt
                        if rent_lease_expense.settlement_bank_link:
                            dict1['payment_type']=rent_lease_expense.settlement_bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash"  
                        rent_out.append(dict1)
                else:
                        moveable_bank_amount=0
                        moveable_cash_amount=0


                all_moveable_check3=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(moveablerent=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_moveable_check3==None:
                    all_moveable_check3=0
                all_moveable_details3=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(moveablerent=None).exclude(collection=None)
                if all_moveable_details3:
                    moveable_bank_amount1=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(collection=None).exclude(moveablerent=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_bank_amount1==None:
                        moveable_bank_amount1=0
                    
                    moveable_cash_amount1=  Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",banks=None).exclude(collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_cash_amount1==None:
                        moveable_cash_amount1=0
                    for i in all_moveable_details3:
                        rent_lease_expense_moveable=MovableAssetsRents.objects.filter(id=i.moveablerent_id).first()
                        dict1={}
                        dict1['rent_no']=f'{rent_lease_expense_moveable.rent_no}'
                        dict1['amount']=rent_lease_expense_moveable.settled_amount
                        dict1['payment_type']="Cash"
                        rent_out.append(dict1)
                else:
                    moveable_bank_amount1=0
                    moveable_cash_amount1=0
                overall_rent_cash_settlement=moveable_cash_amount + moveable_cash_amount1
                overall_rent_bank_settlement=moveable_bank_amount + moveable_bank_amount1
                if all_rentlease_details3 or all_moveable_details3:
                    dictttt={}
                    dictttt['rent_details']=rent_out
                    dictttt['cash_amount']=overall_rent_cash_settlement
                    dictttt['bank_amount']=overall_rent_bank_settlement

                    dic1['other_expense']=dictttt 

                member_joinng_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(join_amt=None).aggregate(Sum('amount')).get('amount__sum')
                if member_joinng_amount==None:
                    member_joinng_amount=0
                member_joinng_details=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",collection=None).exclude(join_amt=None)
                if member_joinng_details:
                    out1=[]
                    for i in member_joinng_details:
                            joining__checks=PeoplesJOININGAmountDetails.objects.filter(management_profile=management,id=i.join_amt_id).first()
                            print(joining__checks.member_id)
                            joining_member=Member_Details.objects.filter(id=joining__checks.member_id).first()
                            dict1={}
                            dict1['name']=joining__checks.member.member_name
                            dict1['amount']=joining__checks.amount
                            dict1['payment_type']="Cash"

                            out1.append(dict1)
                    dict11111={}
                    dict11111['total_amount']=member_joinng_amount
                    dict11111['member_joining_details']=out1
                    
                    dic['member_joining']=dict11111 

                all_check_balance=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=True).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_check_balance==None:
                    all_check_balance=0
                balance_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=True).values("members_id").distinct()
                if balance_check:
                    balance_check_total_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=True).aggregate(Sum('amount')).get('amount__sum')
                    if balance_check_total_amount==None:
                        balance_check_total_amount=0
                    balance_check_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=True,banks=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                    if balance_check_cash_amount==None:
                        balance_check_cash_amount=0
                    balance_check_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=True).exclude(collection=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if balance_check_bank_amount==None:
                        balance_check_bank_amount=0
                    out_balance=[]
                    for i in balance_check:
                        balance_check_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=True,members=i['members_id']).aggregate(Sum('amount')).get('amount__sum')
                        member_check=Member_Details.objects.filter(id=i['members_id']).first()
                        dict11={}
                        dict11['member_name']=member_check.member_name
                        dict11['mobile_number']=member_check.member_mobile_number
                        dict11['member_no']=member_check.member_no
                        dict11['amount']=balance_check_amount
                        out_balance.append(dict11)
                    dic_balance={}
                    dic_balance['name'] ="Balance"  
                    dic_balance['amount'] =  balance_check_total_amount
                    dic_balance['member_details'] =  out_balance  
                    dic_balance['cash_amount']=balance_check_cash_amount

                    dic_balance['bank_amount']=  balance_check_bank_amount                  

                cash_borrow_bank=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrow_bank==None:
                    cash_borrow_bank=0
                cash_borrow_bank_details=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None)
                out_borrow=[]
                if cash_borrow_bank_details:
                    borrow_check_member=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,type_choice="Borrow",created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).exclude(members=None).values("members_id").distinct()
                    if borrow_check_member:
                        
                        for borrow in borrow_check_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,type_choice="Borrow",created_at__date__lte=end_date,members=borrow['members_id']).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Bank"
                            out_borrow.append(dic_bank)
                           
                            
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow",members=None).exclude(cash_transaction=None).exclude(banks=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:
                        
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Bank"
                            out_borrow.append(dic_bank)
                                

                cash_borrow=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrow==None:
                    cash_borrow=0
                cash_borrow_details=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,banks=None).exclude(cash_transaction=None)
               
                if cash_borrow_details:
                    borrow_check_member=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,type_choice="Borrow",created_at__date__lte=end_date,banks=None).exclude(cash_transaction=None).exclude(members=None).values("members_id").distinct()
                    if borrow_check_member:
                        
                        for borrow in borrow_check_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,type_choice="Borrow",created_at__date__lte=end_date,members=borrow['members_id'],banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Cash"
                            out_borrow.append(dic_bank)
                           
                        
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow",members=None,banks=None).exclude(cash_transaction=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:
                        
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Cash"
                            out_borrow.append(dic_bank)

                if cash_borrow_bank_details or cash_borrow_details:
                    dic_final={}
                    dic_final['member_details']=out_borrow
                    dic_final['total_amount']=cash_borrow_bank + cash_borrow
                    dic_borrow_amount={}
                    dic['borrow_income']=dic_final
                    dic_borrow_amount['borrow_amount']=cash_borrow_bank + cash_borrow


                cash_borrow_paid_bank=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrow_paid_bank==None:
                    cash_borrow_paid_bank=0
                cash_borrow_paid_details=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None)
                out_borrow_paid=[]
                if cash_borrow_paid_details:
                    borrowpaid_check_member=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow Paid").exclude(cash_transaction=None).exclude(banks=None).exclude(members=None).values("members_id").distinct()
                    if borrowpaid_check_member:                        
                        for borrow in borrowpaid_check_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow Paid",members=borrow['members_id']).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Bank"
                            out_borrow_paid.append(dic_bank)
                            
                        
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow Paid",members=None).exclude(cash_transaction=None).exclude(banks=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:                            
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Bank"
                            out_borrow_paid.append(dic_bank)
                                

                cash_borrowpaid=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrowpaid==None:
                    cash_borrowpaid=0
                cash_borrowpaid_details=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,banks=None).exclude(cash_transaction=None)
               
                if cash_borrowpaid_details:
                    borrowpaid_cash_member=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow Paid",banks=None).exclude(cash_transaction=None).exclude(members=None).values("members_id").distinct()
                    if borrowpaid_cash_member:
                        
                        for borrow in borrowpaid_cash_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow Paid",members=borrow['members_id'],banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Cash"
                            out_borrow_paid.append(dic_bank)
                            
                        
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Borrow Paid",members=None,banks=None).exclude(cash_transaction=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:
                        
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Cash"
                            out_borrow_paid.append(dic_bank)

                if cash_borrow_paid_details or cash_borrowpaid_details:
                    dic_final={}
                    dic_final['member_details']=out_borrow_paid
                    dic_final['total_amount']=cash_borrow_paid_bank + cash_borrowpaid
                    
                    dic1['borrowpaid_amount']=dic_final
                    dic_borrow_amount['borrow_amount']= (cash_borrow_bank + cash_borrow) - (cash_borrow_paid_bank + cash_borrowpaid)
                

                cash_withdraw_check=Report.objects.filter(type_choice="Withdraw",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_withdraw_check==None:
                    cash_withdraw_check=0

                cash_deposit_check=Report.objects.filter(type_choice="Deposit",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_deposit_check==None:
                    cash_deposit_check=0

                bank_loan=Report.objects.filter(type_choice="Loan",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if bank_loan==None:
                    bank_loan=0
                bank_loan_details=Report.objects.filter(type_choice="Loan",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None)
                if bank_loan_details:
                    loan_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Loan").exclude(cash_transaction=None).exclude(banks=None).values("banks_id").distinct()
                    out_loan=[]
                    for loans in loan_check:
                        bank_details=BankDetails.objects.filter(id=loans['banks_id']).first()
                        bank_respective_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Loan",banks=loans['banks_id']).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                        dic_bank={}
                        dic_bank['bank_name']=bank_details.bank_name
                        dic_bank['amount']=bank_respective_amount
                        out_loan.append(dic_bank)
                        dic_final={}
                        dic_final['bank_details']=out_loan
                        dic_final['total_amount']=bank_loan
                    dic_pending_loan={}
                    dic['loan_income']=dic_final
                    dic_pending_loan['loan_pending_amount']=bank_loan
                    

                bank_loan_repay=Report.objects.filter(type_choice="Loan Repay",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if bank_loan_repay==None:
                    bank_loan_repay=0
                bank_loan_repay_details=Report.objects.filter(type_choice="Loan Repay",management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None)
                if bank_loan_repay_details:
                    loan_repay_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,type_choice="Loan Repay",created_at__date__lte=end_date).exclude(cash_transaction=None).exclude(banks=None).values("banks_id").distinct()
                    out_loan_repay=[]
                    for loans in loan_repay_check:
                        bank_details=BankDetails.objects.filter(id=loans['banks_id']).first()
                        bank_respective_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Loan Repay",banks=loans['banks_id']).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                        dic_bank={}
                        dic_bank['bank_name']=bank_details.bank_name
                        dic_bank['amount']=bank_respective_amount
                        out_loan_repay.append(dic_bank)
                        dic_final={}
                        dic_final['bank_details']=out_loan_repay
                        dic_final['total_amount']=bank_loan_repay
                    dic1['loan_repayment']=dic_final
                    dic_pending_loan['loan_pending_amount']=bank_loan - bank_loan_repay


                report_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(chit_fund=None)
                if report_check:
                    check_mnagement_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment").exclude(chitfund=None).values("chitfund_id").distinct()
                    out_final=[]                  
                    
                    for iiii in check_mnagement_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()
                        out_fund=[]
                        report_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id']).exclude(chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if report_check==None:
                            report_check=0
                        manage_check_exists=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None)
                        
                        manage_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if manage_check==None:
                            manage_check=0

                        
                        if manage_check_exists:
                            chi_fund={}
                            chi_fund['name']="Management"
                            chi_fund['amount']=manage_check
                            out_fund.append(chi_fund)
                        dic_final={}
                        dic_final['chitfund_name']=fund_name.chit_name
                        dic_final['details']=out_fund
                        dic_final['total_amount']=manage_check
                        dic_final['id']=fund_name.id
                        out_final.append(dic_final)

                    dic1['Chit_fund_Investment']=out_final

                interest_report=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(interest=None)
                interest_report_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction").exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if interest_report_amount==None:
                    interest_report_amount=0                    
                if interest_report:
                    out_int=[]
                    for iiii in interest_report:
                        int_name=iiii.interest.people_name
                        
                        dic_interest={}
                        dic_interest['interest_name']=int_name
                        dic_interest['amount']=iiii.amount
                        out_int.append(dic_interest)
                    difffff={}
                    difffff['total_amount']=interest_report_amount
                    difffff['details']=out_int
                    dic1['Interest_Principal_amount']=difffff

                interest_collection=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(interest=None).exclude(collection=None)
                interest_collection_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(interest=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if interest_collection_amount==None:
                    interest_collection_amount=0 
                if interest_collection:
                    interest_take=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(interest=None).exclude(collection=None).values("interest_id").distinct()
                    ouuuuuu=[]
                    for aaaaa in interest_take:
                        interest_amttt=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",interest=aaaaa['interest_id']).aggregate(Sum('amount')).get('amount__sum')
                        interest_noooo=PeopleInterestDetails.objects.filter(id=aaaaa['interest_id']).first()
                        dic_aaa={}
                        dic_aaa['interest_name']=interest_noooo.intrest_no
                        dic_aaa['amount']=interest_amttt
                        ouuuuuu.append(dic_aaa)
                    difffff={}
                    difffff['total_amount']=interest_collection_amount
                    difffff['details']=ouuuuuu
                    dic['Interest_Collection']=difffff


                chit_fund_profit_distribution=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(chit_fund=None)
                chit_fund_profit_distribution_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(chit_fund=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_profit_distribution_amount==None:
                    chit_fund_profit_distribution_amount=0
                if chit_fund_profit_distribution:
                    chit_fund_profit_distribution_check=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").exclude(chit_fund=None).values("chit_fund_id").distinct()

                    out_chit_disxxxx=[]
                    for iiii in chit_fund_profit_distribution_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chit_fund_id']).first()                    
                        amount_check=Report.objects.filter(chit_fund=iiii['chit_fund_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition").aggregate(Sum('amount')).get('amount__sum')

                        
                        dic_interestxxxx={}
                        dic_interestxxxx['name']=fund_name.chit_name
                        dic_interestxxxx['amount']=amount_check
                        out_chit_disxxxx.append(dic_interestxxxx)

                    difffffvv={}
                    difffffvv['total_amount']=chit_fund_profit_distribution_amount
                    difffffvv['details']=out_chit_disxxxx
                    dic['Chit_fund_Profit']=difffffvv

                
                out_fund21ffffff=[]
                fund_total_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(fund_m=None).exclude(fund_m__fund__fund_type="Normal").aggregate(Sum('amount')).get('amount__sum') 
                if fund_total_amount==None:
                    fund_total_amount=0
                fund_initial_cash_amount_exists=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None).exclude(fund_m=None).exclude(fund_m__fund__fund_type="Normal")
                
                if fund_initial_cash_amount_exists:
                    
                    for cccc in fund_initial_cash_amount_exists:
                        if cccc.fund_m.fund.fund_type == "Fund 21":                                                  
                            
                                fund_group_id=cccc.fund_m_id
                                fund_group=FundGroupDetails.objects.filter(id=fund_group_id).first()
                                dic_type21={}
                                dic_type21['fund_name']=fund_group.fund.fund_name + "" f'({fund_group.fund.fund_type})'
                                dic_type21['amount']=cccc.amount
                                out_fund21ffffff.append(dic_type21)                             
                        
                            
                        elif cccc.fund_m.fund.fund_type == "Fund 20":                                   
                                        fund_group_20id=cccc.fund_m_id
                                        fund_group=FundGroupDetails.objects.filter(id=fund_group_20id).first()
                                        dic_type20={}
                                        dic_type20['fund_name']=fund_group.fund.fund_name + "" f'({fund_group.fund.fund_type})'
                                        dic_type20['amount']=cccc.amount
                                        out_fund21ffffff.append(dic_type20)
                                       
                check_normal=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None,fund_m__fund__fund_type="Normal").exclude(fund_lease=None)
                if check_normal:
                        check_diff_norm=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None,fund_m__fund__fund_type="Normal").exclude(fund_lease=None).values("fund_m_id").distinct()
                        for iiii in check_diff_norm:
                            fund_group=FundGroupDetails.objects.filter(id=iiii['fund_m_id']).first()
                            total_fund_normal_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None,fund_m__fund__fund_type="Normal",fund_m=iiii['fund_m_id']).exclude(fund_lease=None).aggregate(Sum('amount')).get('amount__sum') 
                            dic_normal={}
                            dic_normal['fund_name']=fund_group.fund.fund_name + " " f'({fund_group.fund.fund_type})'
                            dic_normal['amount']=total_fund_normal_amount
                            out_fund21ffffff.append(dic_normal)
                if fund_initial_cash_amount_exists or check_normal:
                    dic["Fund"]=out_fund21ffffff

                total_credit_cash_amountsssssssss=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None,managee=False,mangebalancesheet=None)
                
                
                total_credit_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",banks=None,managee=False,mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                if total_credit_cash_amount==None:
                    total_credit_cash_amount=0
                
                total_credit_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if total_credit_bank_amount==None:
                    total_credit_bank_amount=0
                
                
                total_credit=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Addition",balance=False,mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if total_credit == None:
                    total_credit=0
                total_debit=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",balance=False,mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if total_debit == None:
                    total_debit=0

                total_debit_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",mangebalancesheet=None,banks=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if total_debit_cash_amount==None:
                    total_debit_cash_amount=0
                
                total_debit_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,type_choice="Reduction",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if total_debit_bank_amount==None:
                    total_debit_bank_amount=0 
                
                if total_opening_balnce>0:
                    dic['opening_balance']=total_opening_balnce
                    opening_balance_credit=total_opening_balnce
                elif total_opening_balnce==0:
                    opening_balance=total_opening_balnce  
                else:
                    dic1['opening_balance']=abs(total_opening_balnce)  
                    opening_balance_debit=total_opening_balnce
                dict={}
                dict['Credit']=dic
                dict['Debit']=dic1


                if total_opening_balnce>0:
                    dict['total_credit_amount']=total_credit + opening_balance_credit + all_check_balance + bank_loan + cash_borrow_bank + cash_borrow 
                    dict['total_debit_amount']=total_debit + bank_loan_repay + cash_borrowpaid + cash_borrow_paid_bank
                    dict['name']="custom_date_range"
                    dict['start_date']=start_date
                    dict['end_date']=end_date
                    dict['overall_bank_amount']=total_credit_bank_amount - total_debit_bank_amount + calculating_bank_opening - cash_withdraw_check + cash_deposit_check + bank_loan - bank_loan_repay - cash_borrow_paid_bank + cash_borrow_bank
                    dict['overall_cash_amount']=abs(total_credit_cash_amount - total_debit_cash_amount + calculating_cash_opening + cash_withdraw_check - cash_deposit_check + cash_borrow - cash_borrowpaid )
                    if bank_loan_details or bank_loan_repay_details:
                        dict['loan_details_bottom']=dic_pending_loan
                    if cash_borrow_paid_details or cash_borrowpaid_details or cash_borrow_bank_details or cash_borrow_details:                    
                        dict['borrow_details_bottom']=dic_borrow_amount
                    check_balance_credit=total_credit_cash_amount + calculating_cash_opening + cash_withdraw_check   + cash_borrow
                    check_balance_debit=total_debit_cash_amount + cash_deposit_check + cash_borrowpaid
                    if check_balance_credit > check_balance_debit:
                        overall_balance=check_balance_credit - check_balance_debit
                        dict['balance_type']="Credit"
                        dict['balance_amount']=overall_balance
                    elif check_balance_credit < check_balance_debit:
                        overall_balance=check_balance_debit - check_balance_credit
                        dict['balance_type']="Debit"
                        dict['balance_amount']=overall_balance
                    else:
                        dict['balance_type']=""
                        dict['balance_amount']=0 

                elif total_opening_balnce==0:
                    dict['total_credit_amount']=total_credit + bank_loan + cash_borrow_bank + cash_borrow 
                    dict['total_debit_amount']=total_debit + bank_loan_repay + cash_borrowpaid + cash_borrow_paid_bank
                    dict['name']="custom_date_range"
                    dict['start_date']=start_date
                    dict['end_date']=end_date
                    dict['overall_bank_amount']=total_credit_bank_amount - total_debit_bank_amount + calculating_bank_opening - cash_withdraw_check + cash_deposit_check + bank_loan - bank_loan_repay + cash_borrow_bank - cash_borrow_paid_bank 
                    dict['overall_cash_amount']=abs(total_credit_cash_amount - total_debit_cash_amount + calculating_cash_opening + cash_withdraw_check - cash_deposit_check + cash_borrow - cash_borrowpaid) 
                    if bank_loan_details or bank_loan_repay_details:
                        dict['loan_details_bottom']=dic_pending_loan
                    if cash_borrow_paid_details or cash_borrowpaid_details or cash_borrow_bank_details or cash_borrow_details:                    
                        dict['borrow_details_bottom']=dic_borrow_amount
                    check_balance_credit=total_credit_cash_amount + calculating_cash_opening + cash_withdraw_check   + cash_borrow
                    check_balance_debit=total_debit_cash_amount + cash_deposit_check + cash_borrowpaid
                    if check_balance_credit > check_balance_debit:
                        overall_balance=check_balance_credit - check_balance_debit
                        dict['balance_type']="Credit"
                        dict['balance_amount']=overall_balance
                    elif check_balance_credit < check_balance_debit:
                        overall_balance=check_balance_debit - check_balance_credit
                        dict['balance_type']="Debit"
                        dict['balance_amount']=overall_balance
                    else:
                        dict['balance_type']=""
                        dict['balance_amount']=0 

                else:
                    dict['total_credit_amount']=total_credit + all_check_balance + bank_loan 
                    dict['total_debit_amount']=total_debit +  abs(opening_balance_debit)   + bank_loan
                    dict['name']="custom_date_range"
                    dict['start_date']=start_date 
                    dict['end_date']=end_date
                    dict['overall_bank_amount']=total_credit_bank_amount - total_debit_bank_amount + calculating_bank_opening - cash_withdraw_check + cash_deposit_check + bank_loan  - bank_loan_repay  + cash_borrow_bank - cash_borrow_paid_bank
                    dict['overall_cash_amount']=abs(total_credit_cash_amount - total_debit_cash_amount + calculating_cash_opening + cash_withdraw_check - cash_deposit_check + cash_borrow - cash_borrowpaid )
                    if bank_loan_details or bank_loan_repay_details:
                        dict['loan_details_bottom']=dic_pending_loan
                    if cash_borrow_paid_details or cash_borrowpaid_details or cash_borrow_bank_details or cash_borrow_details:
                    
                        dict['borrow_details_bottom']=dic_borrow_amount
                    check_balance_credit=total_credit_cash_amount + calculating_cash_opening + cash_withdraw_check   + cash_borrow
                    check_balance_debit=total_debit_cash_amount + cash_deposit_check + cash_borrowpaid
                    if check_balance_credit > check_balance_debit:
                        overall_balance=check_balance_credit - check_balance_debit
                        dict['balance_type']="Credit"
                        dict['balance_amount']=overall_balance
                    elif check_balance_credit < check_balance_debit:
                        overall_balance=check_balance_debit - check_balance_credit
                        dict['balance_type']="Debit"
                        dict['balance_amount']=overall_balance
                    else:
                        dict['balance_type']=""
                        dict['balance_amount']=0 

                if balance_check:
                    dict['balance']=dic_balance   
                return Response(dict,status=status.HTTP_201_CREATED) 
       
             
            elif range_type=="custom_date":
                dic={}
                dic1={}      
                start_date=request.data['start_date']
                all_incomes=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Addition",mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                all_incomessssssss=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Addition",mangebalancesheet=None,managee=False)
                if all_incomes==None:
                    all_incomes=0


                all_income_deposit=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Deposit",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_deposit==None:
                    all_income_deposit=0
                all_income_withdraw=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Withdraw",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_withdraw==None:
                    all_income_withdraw=0

                all_income_borrow_cash=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow",mangebalancesheet=None,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_borrow_cash==None:
                    all_income_borrow_cash=0
                all_income_borrow_paid_cash=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow Paid",mangebalancesheet=None,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_borrow_paid_cash==None:
                    all_income_borrow_paid_cash=0
                
                all_income_borrow_bank=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_borrow_bank==None:
                    all_income_borrow_bank=0
                all_expense_borrow_bank=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Borrow Paid",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_expense_borrow_bank==None:
                    all_expense_borrow_bank=0

                all_income_loan_bank=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Loan",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_income_loan_bank==None:
                    all_income_loan_bank=0
                all_expense_loan_repay=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Loan Repay",mangebalancesheet=None).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_expense_loan_repay==None:
                    all_expense_loan_repay=0


                all_incomes_bank_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Addition",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_incomes_bank_amount==None:
                    all_incomes_bank_amount=0
                all_incomes_cash_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Addition",mangebalancesheet=None,banks=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if all_incomes_cash_amount==None:
                    all_incomes_cash_amount=0
                all_expenses=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Reduction",mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if all_expenses==None:
                    all_expenses=0
                all_expenses_bank_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Reduction",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if all_expenses_bank_amount==None:
                    all_expenses_bank_amount=0
                all_expenses_cash_amount=Report.objects.filter(management_profile=management,created_at__date__lt=start_date,type_choice="Reduction",mangebalancesheet=None,banks=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if all_expenses_cash_amount==None:
                    all_expenses_cash_amount=0
                opening_balance_check=Report.objects.filter(management_profile=management,created_at__date__lte=start_date).exclude(mangebalancesheet=None)
                if opening_balance_check:
                    opening_balance_check_amount=Report.objects.filter(management_profile=management,created_at__date__lte=start_date).exclude(mangebalancesheet=None).first()
                    if opening_balance_check_amount.type_choice =="Addition":
                        opening_balance_check_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lte=start_date,banks=None).exclude(mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                        opening_balance_check_amounts_check=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lte=start_date,banks=None).exclude(mangebalancesheet=None)

                        opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                        if opening_balance_bank_amounts==None:
                            opening_balance_bank_amounts=0
                        opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                        if opening_balance_bank_amounts_reduction==None:
                            opening_balance_bank_amounts_reduction=0
                        logger.info("999999999999")
                        logger.info(opening_balance_check_amounts)
                        

                        logger.info(all_incomes)
                        logger.info(all_expenses)
                        logger.info(opening_balance_bank_amounts)
                        logger.info(opening_balance_bank_amounts)
                        logger.info(all_expenses)
                        logger.info(all_income_borrow_cash)
                        logger.info(all_income_borrow_bank)
                        logger.info(all_expense_borrow_bank)
                        logger.info(all_income_loan_bank)
                        logger.info(all_expense_loan_repay)


                        total_opening_balnce= opening_balance_check_amounts + all_incomes - all_expenses + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount + opening_balance_check_amounts - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash


                    elif opening_balance_check_amount.type_choice =="Reduction":
                        opening_balance_check_amounts=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lte=start_date,banks=None).exclude(mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                        opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                        if opening_balance_bank_amounts==None:
                            opening_balance_bank_amounts=0
                        opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                        if opening_balance_bank_amounts_reduction==None:
                            opening_balance_bank_amounts_reduction=0
                        logger.info("ttttttttttttt")
                        logger.info(opening_balance_check_amounts)
                        logger.info(opening_balance_check_amounts)
                        logger.info(all_incomes)
                        logger.info(all_expenses)
                        logger.info(all_income_borrow_cash)
                        logger.info(all_income_borrow_paid_cash)
                        logger.info(all_income_borrow_bank)
                        logger.info(all_expense_borrow_bank)
                        logger.info(all_income_loan_bank)
                        logger.info(all_expense_loan_repay)
                        total_opening_balnce=all_incomes -all_expenses - opening_balance_check_amounts + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction  + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                        calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount - opening_balance_check_amounts - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash
                    else:
                        total_opening_balnce=0
                        calculating_bank_opening=0
                        calculating_cash_opening=0
                else:
                    opening_balance_check=Report.objects.filter(management_profile=management,created_at__date__lte=start_date,mangebalancesheet=None)                    
                    if opening_balance_check: 
                            opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            if opening_balance_bank_amounts==None:
                                opening_balance_bank_amounts=0
                            opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                            if opening_balance_bank_amounts_reduction==None:
                                opening_balance_bank_amounts_reduction=0
                                                
                            opening_balance_check_amounts=0 

                            total_opening_balnce= opening_balance_check_amounts + all_incomes - all_expenses + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_bank_opening=all_incomes_bank_amount - all_expenses_bank_amount + opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_cash_opening=all_incomes_cash_amount - all_expenses_cash_amount + opening_balance_check_amounts - all_income_deposit + all_income_withdraw + all_income_borrow_cash - all_income_borrow_paid_cash
                    else:
                        opening_balance_bank_amounts_recheck=Report.objects.filter(management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                        if  opening_balance_bank_amounts_recheck:  
                            opening_balance_bank_amounts=Report.objects.filter(type_choice="Addition",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            if opening_balance_bank_amounts==None:
                                opening_balance_bank_amounts=0
                            opening_balance_bank_amounts_reduction=Report.objects.filter(type_choice="Reduction",management_profile=management,created_at__date__lte=start_date,managee=True).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                            if opening_balance_bank_amounts_reduction==None:
                                opening_balance_bank_amounts_reduction=0                            
                            total_opening_balnce= opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_borrow_cash - all_income_borrow_paid_cash + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_bank_opening= opening_balance_bank_amounts - opening_balance_bank_amounts_reduction + all_income_deposit - all_income_withdraw + all_income_borrow_bank - all_expense_borrow_bank + all_income_loan_bank - all_expense_loan_repay
                            calculating_cash_opening=0
                
                        else:
                            total_opening_balnce=0
                            calculating_bank_opening=0
                            calculating_cash_opening=0
                logger.info("8888888888888888")
                logger.info(total_opening_balnce) 

                if total_opening_balnce>0:
                    dic['opening_balance']=total_opening_balnce
                    opening_balance_credit=total_opening_balnce
                elif total_opening_balnce==0:
                    opening_balance=total_opening_balnce  
                else:
                    dic1['opening_balance']=abs(total_opening_balnce)  
                    opening_balance_debit=total_opening_balnce  

                
                all_incomes_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income").aggregate(Sum('amount')).get('amount__sum')
                if all_incomes_check==None:
                    all_incomes_check=0
                all_income_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income")
                if all_income_details:
                    out2=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income").aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income").exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    category_check_expense=ADDIncomeDetails.objects.exclude(income_subcategory="Chit Fund Income").filter(management_profile=management,created_at__date=start_date).values("category_id").distinct()
                    for i in category_check_expense:
                        category_check_expense_details=ADDIncomeDetails.objects.exclude(income_subcategory="Chit Fund Income").filter(category=i['category_id'],management_profile=management,created_at__date=start_date)
                        category_check_expense_total_amount=ADDIncomeDetails.objects.exclude(income_subcategory="Chit Fund Income").filter(category=i['category_id'],management_profile=management,created_at__date=start_date).aggregate(Sum('income_amt')).get('income_amt__sum')
                        category_name=ADDIncomeCategory.objects.filter(id=i['category_id']).first().category_name
                        category_id=ADDIncomeCategory.objects.filter(id=i['category_id']).first()
                        out1=[]
                        for a in category_check_expense_details:
                            dict1111={}
                            dict1111['name']=a.income_name
                            dict1111['amount']=a.income_amt
                            if a.bank:
                                dict1111['payment_type']=a.bank_name
                            else:
                                dict1111['payment_type']=a.transaction_type                        

                            out1.append(dict1111)
                        dict3={}
                        dict3['name']=category_name
                        dict3['amount']=category_check_expense_total_amount
                        dict3['details']=  out1 
                        dict3['id']=  category_id.id                                           
                        out2.append(dict3)
                    dicttttt={}
                    dicttttt['income_details']=out2
                    dicttttt['cash_amount']=all_festival_cash_amount
                    dicttttt['bank_amount']=all__festival_bank_amount
                    dic['income']  =dicttttt               

                all_expense_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense").aggregate(Sum('amount')).get('amount__sum')
                if all_expense_check==None:
                    all_expense_check=0
                all_expense_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense")
                if all_expense_details:
                    out2=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",banks=None).exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense").aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(expenses=None).exclude(expenses__expense_subcategory="Chit Fund Expense").exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    category_check_expense=ADDExpenseDetails.objects.exclude(expense_subcategory="Chit Fund Expense").filter(management_profile=management,created_at__date=start_date).values("category_id").distinct()
                    for i in category_check_expense:
                        category_check_expense_details=ADDExpenseDetails.objects.exclude(expense_subcategory="Chit Fund Expense").filter(category=i['category_id'],management_profile=management,created_at__date=start_date)
                        category_check_expense_total_amount=ADDExpenseDetails.objects.exclude(expense_subcategory="Chit Fund Expense").filter(category=i['category_id'],management_profile=management,created_at__date=start_date).aggregate(Sum('expense_amt')).get('expense_amt__sum')
                        category_name=ADDExpenseCategory.objects.filter(id=i['category_id']).first().category_name
                        category_id=ADDExpenseCategory.objects.filter(id=i['category_id']).first()
                        out1=[]
                        for a in category_check_expense_details:
                            dict1111={}
                            dict1111['name']=a.expense_name
                            dict1111['amount']=a.expense_amt
                            if a.bank:
                                dict1111['payment_type']=a.bank_name
                            else:
                                dict1111['payment_type']=a.transaction_type

                            out1.append(dict1111)
                        dict3={}
                        dict3['name']=category_name
                        dict3['amount']=category_check_expense_total_amount
                        dict3['details']=  out1 
                        dict3['id']=  category_id.id 

                                          
                        out2.append(dict3)
                    dict222={}
                    dict222['expense_details']=out2
                    dict222['cash_amount']=all_festival_cash_amount
                    dict222['bank_amount']=all__festival_bank_amount 
                    dic1['expense']  =dict222


                all_marriage_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(marriage=None).aggregate(Sum('amount')).get('amount__sum')
                if all_marriage_check==None:
                    all_marriage_check=0
                all_marriage_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(marriage=None).values("marriage_id").distinct()
                if all_marriage_details:
                    out=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(marriage=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(marriage=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    for i in all_marriage_details:                    
                        fest_details=MarriageDetails.objects.filter(id=i['marriage_id']).first() 
                        amount_details=PeoplesAmountDetails.objects.filter(marriage=fest_details)
                        
                        if len(amount_details) >1:
                            for i in  amount_details:  
                                dict1={} 
                                print(i)
                                payment_nature=CollectionDetails.objects.filter(amount_link_id=i.id).first() 

                                dict1['name']=f'{i.member.member_name}' +"/"+f'{i.member.member_no}'       
                                dict1['total_amount']= i.amount
                                if payment_nature:
                                    if payment_nature.bank_link !=None:
                                        dict1['payment_type']= payment_nature.bank_name  
                                    else:
                                        dict1['payment_type']= payment_nature.transaction_type  
                                dict1['id']=fest_details.id 

                                out.append(dict1)
                        elif len(amount_details)==1:
                            amount_detail=PeoplesAmountDetails.objects.filter(marriage=fest_details).first()
                            payment_nature=CollectionDetails.objects.filter(amount_link=amount_detail).first() 

                            amount_details_check=PeoplesAmountDetails.objects.filter(marriage=fest_details).first()
                            dict1={}
                            dict1['name']=f'{amount_details_check.member.member_name}' +"/"+f'{amount_details_check.member.member_no}'       
                            dict1['total_amount']= amount_details_check.amount
                            print("yyyyyyyyyyyyyyyyy")
                            if payment_nature:                  
                                if payment_nature.bank_link:
                                    dict1['payment_type']= payment_nature.bank_name  
                                else:
                                    dict1['payment_type']= payment_nature.transaction_type 
                            dict1['id']=fest_details.id 
                            out.append(dict1)
                        print(out)
                        dict11111={}
                        dict11111['amount']=all_marriage_check
                        dict11111['marriage_details']=out
                        dict11111['cash_amount']=all_festival_cash_amount
                        dict11111['bank_amount']=all__festival_bank_amount
                    

                    dic['marriage']=dict11111                

                
                all_death_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False).exclude(death_tariff=None).values("death_tariff_id").distinct()
                print(all_death_details)
                print("cheeeeeeeeeeeeeeeeeeeeeeeeek")
                              
                if all_death_details:
                    death1=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(death_tariff=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(death_tariff=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    for i in all_death_details:
                        
                        print("ccccccccccccccccccccccccccccccccccccccccc")
                        death_num=DeathDetails.objects.filter(id=i['death_tariff_id']).first()
                        print(death_num)
                        paid_check_count=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,death_tariff_id=i["death_tariff_id"]).count()
                        peopl_link_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,death_tariff_id=i["death_tariff_id"])

                        print(peopl_link_details)
                        all_death_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,death_tariff=death_num).aggregate(Sum('amount')).get('amount__sum')
                        if all_death_check==None:
                            all_death_check=0                                                
                        dict123={}
                        death12=[] 
                        for people in peopl_link_details:
                            collect=CollectionDetails.objects.filter(id=people.collection_id).first()

                            link_details=collect.amount_link_id
                            get_people=PeoplesAmountDetails.objects.filter(id=link_details).first()
                            mem_det=Member_Details.objects.filter(id=get_people.member_id).first()
                            dict11={} 
                                            
                            dict11['name']=f'{mem_det.member_name}/{mem_det.member_no}'     
                            dict11['total_amount']= get_people.amount
                            dict11['mobile_number']=mem_det.member_mobile_number
                            if collect.bank_link:
                                dict11['payment_type']= collect.bank_name  
                            else:
                                dict11['payment_type']= collect.transaction_type                   
                            death12.append(dict11) 
                        print(death12)  
                        print("ddddddddddddddddddddddddddd")               
                        
                        dict123['name']=f'{death_num.death_no}/{death_num.member_name}'                   
                        dict123['amount']=death_num.death_tariff_amt
                        dict123['member_count']=paid_check_count
                        dict123['total_amount']=all_death_check
                        dict123['member_details']=death12
                        dict123['cash_amount']=all_festival_cash_amount
                        dict123['bank_amount']=all__festival_bank_amount
                        dict123['id']=death_num.id

                        death1.append(dict123) 
                        print(death1)                   
                    dic['death']=death1
                   

                all_festival_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False).exclude(festivals=None).values("festivals_id").distinct()
                
                if all_festival_details:
                    fes_out=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(festivals=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(festivals=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    for i in all_festival_details:
                        
                        fest_details=ADDFestivalDetails.objects.filter(id=i["festivals_id"]).first()
                        peopl_link_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,festivals_id=i["festivals_id"])

                        print(peopl_link_details)
                        print("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")
                        paid_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,festivals_id=i["festivals_id"]).count()

                        all_festival_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,festivals=fest_details).aggregate(Sum('amount')).get('amount__sum')
                        if all_festival_check==None:
                            all_festival_check=0
                        fes_out1=[]
                        for people in peopl_link_details:
                            
                            collect=CollectionDetails.objects.filter(id=people.collection_id).first()
                            link_details=collect.amount_link_id
                            get_people=PeoplesAmountDetails.objects.filter(id=link_details).first()
                            mem_det=Member_Details.objects.filter(id=get_people.member_id).first()
                            fes_dict11={}                   
                            fes_dict11['name']=f'{mem_det.member_name}/{mem_det.member_no}'       
                            fes_dict11['total_amount']= get_people.amount
                            fes_dict11['mobile_number']=mem_det.member_mobile_number
                            if collect.bank_link:
                                fes_dict11['payment_type']= collect.bank_name  
                            else:
                                fes_dict11['payment_type']= collect.transaction_type
                            fes_out1.append(fes_dict11)
                        fes_dict1={}
                        fes_dict1['name']=fest_details.festival_name
                        fes_dict1['amount']=fest_details.tax_per_head
                        fes_dict1['member_count']=paid_check
                        fes_dict1['total_amount']=all_festival_check
                        fes_dict1['member_details']=fes_out1
                        fes_dict1['cash_amount']=all_festival_cash_amount
                        fes_dict1['bank_amount']=all__festival_bank_amount
                        fes_dict1['id']=fest_details.id                       
                        fes_out.append(fes_dict1)
                    print(fes_out)
                    print("9999999999999999")
                    dic['festival']=fes_out

                
                all_tariff_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False).exclude(sub_tariff=None).values("sub_tariff_id").distinct()
                
                if all_tariff_details:
                    out=[]
                    all_festival_cash_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,type_choice="Addition",banks=None).exclude(sub_tariff=None).aggregate(Sum('amount')).get('amount__sum')
                    if all_festival_cash_amount==None:
                        all_festival_cash_amount=0
                    all__festival_bank_amount=Report.objects.filter(management_profile=management,created_at__date__gte=start_date,type_choice="Addition").exclude(sub_tariff=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    if all__festival_bank_amount==None:
                        all__festival_bank_amount=0
                    for i in all_tariff_details:
                        fest_details=ADDSubscriptionTariffDetails.objects.filter(id=i["sub_tariff_id"]).first()
                        paid_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,sub_tariff_id=i["sub_tariff_id"]).count()

                        print("llllllllllllllllllllllllllll")
                        peopl_link_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,sub_tariff_id=i["sub_tariff_id"])
                        
                        out1=[]                        
                        dict1={}
                        for people in peopl_link_details:
                            collect=CollectionDetails.objects.filter(id=people.collection_id).first()
                            link_details=collect.amount_link_id
                            get_people=PeoplesAmountDetails.objects.filter(id=link_details).first()
                            mem_det=Member_Details.objects.filter(id=get_people.member_id).first()
                            dict11={}
                            dict11['name']=mem_det.member_name      
                            dict11['amount']= get_people.amount
                            if collect.bank_link:
                                dict11['payment_type']= collect.bank_name  
                            else:
                                dict11['payment_type']= collect.transaction_type
                            out1.append(dict11)
                        all_tariff_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,sub_tariff=fest_details).aggregate(Sum('amount')).get('amount__sum')
                        if all_tariff_check==None:
                            all_tariff_check=0
                        dict1['name']=fest_details.subscription_no
                        dict1['member_count']=paid_check
                        dict1['total_amount']=all_tariff_check
                        dict1['member_details']=out1
                        dict1['cash_amount']=all_festival_cash_amount
                        dict1['bank_amount']=all__festival_bank_amount
                        dict1['id']=fest_details.id                        
                        out.append(dict1)                    
                    dic['tariff']=out 

                
                rent_out_date=[] 
                all_rentlease_check1=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')
                if all_rentlease_check1==None:
                    all_rentlease_check1=0
                all_rentlease_details1=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(rentsandlease=None)
                print(all_rentlease_details1)
                
                if all_rentlease_details1:
                    rent_lease_bank_amount=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(rentsandlease=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount==None:
                        rent_lease_bank_amount=0
                    
                    rent_lease_cash_amount=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None,banks=None).exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount==None:
                        rent_lease_cash_amount=0
                    for i in all_rentlease_details1:
                        dict1={}                        
                        rent_lease_expense=RentalAndLeaseDetails.objects.filter(id=i.rentsandlease_id).first()
                        dict1['rent_no']="Rent Advance - " + f'{rent_lease_expense.lease_rent_no}/{rent_lease_expense.asset_name}'
                        dict1['amount']=rent_lease_expense.initial_advance_amt 
                        if rent_lease_expense.bank_link:
                            dict1['payment_type']=rent_lease_expense.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash"

                        
                        rent_out_date.append(dict1)
                else:
                    rent_lease_bank_amount=0  
                    rent_lease_cash_amount=0     


                all_rentlease_check2=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(rentsandlease=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_rentlease_check2==None:
                    all_rentlease_check2=0
                all_rentlease_details2=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(rentsandlease=None).exclude(collection=None).values("rentsandlease_id").distinct()               
                
                if all_rentlease_details2:
                    rent_lease_bank_amount1=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(rentsandlease=None).exclude(collection=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount1==None:
                        rent_lease_bank_amount1=0
                    
                    rent_lease_cash_amount1=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(rentsandlease=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount1==None:
                        rent_lease_cash_amount1=0
                    for i in all_rentlease_details2:
                        dict1={}
                        rent_lease_expense=RentalAndLeaseDetails.objects.filter(id=i["rentsandlease_id"]).first()
                        rent_lease_expense_amount=CollectionDetails.objects.filter(rentsandlease=rent_lease_expense,management_profile=management,created_at__date=start_date).aggregate(Sum('amount')).get('amount__sum')
                        dict1['rent_no']="Rent Payment" + f'{rent_lease_expense.lease_rent_no}/{rent_lease_expense.asset_name}'
                        dict1['amount']=rent_lease_expense_amount
                        if rent_lease_expense.bank_link:
                            dict1['payment_type']=rent_lease_expense.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash"
                       
                        rent_out_date.append(dict1)
                else:
                    rent_lease_bank_amount1=0  
                    rent_lease_cash_amount1=0

                all_moveable_check1=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')
                if all_moveable_check1==None:
                    all_moveable_check1=0
                all_moveable_details1=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(moveablerent=None)
                if all_moveable_details1:
                    rent_lease_bank_amount2=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(moveablerent=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount2==None:
                        rent_lease_bank_amount2=0 
                    
                    rent_lease_cash_amount2=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None,collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount2==None:
                        rent_lease_cash_amount2=0
                    for i in all_moveable_details1:
                        dict1={}
                        print("tttttttttttttttttttttt")
                        rent_lease_expense_moveable=MovableAssetsRents.objects.filter(id=i.moveablerent_id).first()
                        dict1['rent_no']="Moveable-Rent Advance - "+f'{rent_lease_expense_moveable.rent_no}'
                        dict1['amount']=rent_lease_expense_moveable.advance_amt                    
                        rent_out_date.append(dict1) 
                        if rent_lease_expense_moveable.bank_link:
                            dict1['payment_type']=rent_lease_expense_moveable.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash"
                else:
                    rent_lease_bank_amount2=0  
                    rent_lease_cash_amount2=0

                all_moveable_check2=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(moveablerent=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_moveable_check2==None:
                    all_moveable_check2=0
                
                all_moveable_details2=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(moveablerent=None).exclude(collection=None).values("moveablerent_id").distinct()
                if all_moveable_details2:
                    rent_lease_bank_amount3=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(moveablerent=None).exclude(collection=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_bank_amount3==None:
                        rent_lease_bank_amount3=0
                    
                    rent_lease_cash_amount3=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if rent_lease_cash_amount3==None:
                        rent_lease_cash_amount3=0
                    for i in all_moveable_details2:
                        dict1={}
                        rent_lease_expense_moveable=MovableAssetsRents.objects.filter(id=i["moveablerent_id"]).first()
                        rent_lease_expense_moveable_amount=CollectionDetails.objects.filter(moveablerent=rent_lease_expense_moveable,management_profile=management,created_at__date=start_date).aggregate(Sum('amount')).get('amount__sum')
                        
                        dict1['rent_no']="Moveable-Rent Payment - "+f'{rent_lease_expense_moveable.rent_no}'
                        dict1['amount']=rent_lease_expense_moveable_amount 
                        if rent_lease_expense_moveable.bank_link:
                            dict1['payment_type']=rent_lease_expense_moveable.bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash"                   
                        rent_out_date.append(dict1)
                else:
                    rent_lease_bank_amount3=0
                    rent_lease_cash_amount3=0
                overall_rent_cash=rent_lease_cash_amount2 + rent_lease_cash_amount1 + rent_lease_cash_amount + rent_lease_cash_amount3
                overall_rent_bank=rent_lease_bank_amount2 + rent_lease_bank_amount1 + rent_lease_bank_amount + rent_lease_bank_amount3
                

                if all_rentlease_details1 or all_rentlease_details2 or all_moveable_details1 or all_moveable_details2:
                    dictttt={}
                    dictttt['rent_details']=rent_out_date
                    dictttt['cash_amount']=overall_rent_cash
                    dictttt['bank_amount']=overall_rent_bank
                    dic['other_incomes']=dictttt 
                   

                print(dic)
                print("jjjjjjjjjjjjjj")

                rent_out_date1=[]
                all_rentlease_check3=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",collection=None).exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')
                if all_rentlease_check3==None:
                    all_rentlease_check3=0
                all_rentlease_details3=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",collection=None).exclude(rentsandlease=None)
                if all_rentlease_details3:
                    moveable_bank_amount=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",collection=None).exclude(rentsandlease=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_bank_amount==None:
                        moveable_bank_amount=0
                    
                    moveable_cash_amount=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",banks=None,collection=None).exclude(rentsandlease=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_cash_amount==None:
                        moveable_cash_amount=0

                    for i in all_rentlease_details3:
                        dict1={}
                        rent_lease_expense=RentalAndLeaseDetails.objects.filter(id=i.rentsandlease_id).first()
                        dict1['rent_no']=f'{rent_lease_expense.lease_rent_no}/{rent_lease_expense.asset_name}'
                        dict1['amount']=rent_lease_expense.advance_settlement_amt
                        if rent_lease_expense.settlement_bank_link:
                            dict1['payment_type']=rent_lease_expense.settlement_bank_link.bank_name
                        else:
                            dict1['payment_type']="Cash" 
                        
                        rent_out_date1.append(dict1)
                else:
                        moveable_bank_amount=0
                        moveable_cash_amount=0


                all_moveable_check3=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(moveablerent=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_moveable_check3==None:
                    all_moveable_check3=0
                all_moveable_details3=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(moveablerent=None).exclude(collection=None)
                if all_moveable_details3:
                    moveable_bank_amount1=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(collection=None).exclude(moveablerent=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_bank_amount1==None:
                        moveable_bank_amount1=0
                    
                    moveable_cash_amount1=  Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",banks=None).exclude(collection=None).exclude(moveablerent=None).aggregate(Sum('amount')).get('amount__sum')                       
                    if moveable_cash_amount1==None:
                        moveable_cash_amount1=0
                    for i in all_moveable_details3:
                        rent_lease_expense_moveable=MovableAssetsRents.objects.filter(id=i.moveablerent_id).first()
                        dict1={}
                        dict1['rent_no']=f'{rent_lease_expense_moveable.rent_no}'
                        dict1['amount']=rent_lease_expense_moveable.settled_amount                       
                        dict1['payment_type']="Cash" 
                        rent_out_date1.append(dict1)
                else:
                    moveable_bank_amount1=0
                    moveable_cash_amount1=0
                overall_rent_cash_settlement=moveable_cash_amount + moveable_cash_amount1
                overall_rent_bank_settlement=moveable_bank_amount + moveable_bank_amount1
                

                if all_rentlease_details3 or all_moveable_details3:
                    dictttt={}
                    dictttt['rent_details']=rent_out_date1
                    dictttt['cash_amount']=overall_rent_cash_settlement
                    dictttt['bank_amount']=overall_rent_bank_settlement

                    dic1['other_expense']=dictttt
                   

                member_joinng_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(join_amt=None).aggregate(Sum('amount')).get('amount__sum')
                if member_joinng_amount==None:
                    member_joinng_amount=0
                member_joinng_details=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",collection=None).exclude(join_amt=None)
                if member_joinng_details:
                    print(member_joinng_details)
                    print("oooooooooooooooooooooo")
                    out1=[]
                    for i in member_joinng_details:
                            joining__checks=PeoplesJOININGAmountDetails.objects.filter(management_profile=management,id=i.join_amt_id).first()
                            print(joining__checks.member_id)
                            joining_member=Member_Details.objects.filter(id=joining__checks.member_id).first()
                            dict1={}
                            dict1['name']=joining__checks.member.member_name
                            dict1['amount']=joining__checks.amount
                            dict1['payment_type']="Cash"

                            out1.append(dict1)
                    dict11111={}
                    dict11111['total_amount']=member_joinng_amount
                    dict11111['member_joining_details']=out1
                    dict11111['payment_type']="Cash"
                    dic['member_joining']=dict11111 
                    print(dic)

                all_check_balance=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=True).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if all_check_balance==None:
                    all_check_balance=0  

                balance_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=True).exclude(collection=None).values("members_id").distinct()
                print("tttttttttttttttttttttt")
                print(balance_check)
                if balance_check:
                    balance_check_total_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=True).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                    print(balance_check_total_amount)
                    if balance_check_total_amount==None:
                        balance_check_total_amount=0
                    balance_check_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=True,banks=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                    print(balance_check_cash_amount)
                    if balance_check_cash_amount==None:
                        balance_check_cash_amount=0
                    balance_check_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=True).exclude(collection=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                    print(balance_check_bank_amount)
                    if balance_check_bank_amount==None:
                        balance_check_bank_amount=0

                    out_balance=[]
                    for i in balance_check:
                        balance_check_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=True,members=i['members_id']).aggregate(Sum('amount')).get('amount__sum')
                        if balance_check_amount==None:
                            balance_check_amount=0
                        member_check=Member_Details.objects.filter(id=i['members_id']).first()
                        dict11={}
                        dict11['member_name']=member_check.member_name
                        dict11['mobile_number']=member_check.member_mobile_number
                        dict11['member_no']=member_check.member_no
                        dict11['amount']=balance_check_amount
                        out_balance.append(dict11)
                    dic_balance={}
                    dic_balance['name'] ="Balance"  
                    dic_balance['amount'] =  balance_check_total_amount
                    dic_balance['member_details'] =  out_balance  
                    dic_balance['cash_amount']=balance_check_cash_amount
                    dic_balance['bank_amount']=  balance_check_bank_amount 

                cash_borrow_bank=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrow_bank==None:
                    cash_borrow_bank=0
                cash_borrow_bank_details=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None)
                out_borrow=[]
                if cash_borrow_bank_details:
                    borrow_check_member=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow").exclude(cash_transaction=None).exclude(banks=None).exclude(members=None).values("members_id").distinct()
                    if borrow_check_member:
                        
                        for borrow in borrow_check_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow",members=borrow['members_id']).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Bank"
                            out_borrow.append(dic_bank)
                           
                            
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow",members=None).exclude(cash_transaction=None).exclude(banks=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:
                        
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Bank"
                            out_borrow.append(dic_bank)
                                

                cash_borrow=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date=start_date,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrow==None:
                    cash_borrow=0
                cash_borrow_details=Report.objects.filter(type_choice="Borrow",management_profile=management,created_at__date=start_date,banks=None).exclude(cash_transaction=None)
             
                if cash_borrow_details:
                    borrow_check_member=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow",banks=None).exclude(cash_transaction=None).exclude(members=None).values("members_id").distinct()
                    if borrow_check_member:                        
                        for borrow in borrow_check_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow",members=borrow['members_id'],banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Cash"
                            out_borrow.append(dic_bank)              
                        
                   
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow",members=None,banks=None).exclude(cash_transaction=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:                            
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Cash"
                            out_borrow.append(dic_bank)

                if cash_borrow_bank_details or cash_borrow_details:
                    dic_final={}
                    dic_final['member_details']=out_borrow
                    dic_final['total_amount']=cash_borrow_bank + cash_borrow
                    dic_borrow_amount={}
                    dic['borrow_income']=dic_final
                    dic_borrow_amount['borrow_amount']=cash_borrow_bank + cash_borrow


                cash_borrow_paid_bank=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrow_paid_bank==None:
                    cash_borrow_paid_bank=0
                cash_borrow_paid_details=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None)
                out_borrow_paid=[]
                if cash_borrow_paid_details:
                    borrowpaid_check_member=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow Paid").exclude(cash_transaction=None).exclude(banks=None).exclude(members=None).values("members_id").distinct()
                    if borrowpaid_check_member:                        
                        for borrow in borrowpaid_check_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow Paid",members=borrow['members_id']).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Bank"
                            out_borrow_paid.append(dic_bank)
                            
                        
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow Paid",members=None).exclude(cash_transaction=None).exclude(banks=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:                            
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Bank"
                            out_borrow_paid.append(dic_bank)


                interest_collection=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(interest=None).exclude(collection=None)
                interest_collection_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(interest=None).exclude(collection=None).aggregate(Sum('amount')).get('amount__sum')
                if interest_collection_amount==None:
                    interest_collection_amount=0 
                if interest_collection:
                    interest_take=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(interest=None).exclude(collection=None).values("interest_id").distinct()
                    ouuuuuu=[]
                    for aaaaa in interest_take:
                        interest_amttt=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",interest=aaaaa['interest_id']).aggregate(Sum('amount')).get('amount__sum')
                        interest_noooo=PeopleInterestDetails.objects.filter(id=aaaaa['interest_id']).first()
                        dic_aaa={}
                        dic_aaa['interest_name']=interest_noooo.intrest_no
                        dic_aaa['amount']=interest_amttt
                        ouuuuuu.append(dic_aaa)
                    difffff={}
                    difffff['total_amount']=interest_collection_amount
                    difffff['details']=ouuuuuu
                    dic['Interest_Collection']=difffff
                                

                cash_borrowpaid=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date=start_date,banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_borrowpaid==None:
                    cash_borrowpaid=0
                cash_borrowpaid_details=Report.objects.filter(type_choice="Borrow Paid",management_profile=management,created_at__date=start_date,banks=None).exclude(cash_transaction=None)
               
                if cash_borrowpaid_details:
                    borrowpaid_cash_member=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow Paid",banks=None).exclude(cash_transaction=None).exclude(members=None).values("members_id").distinct()
                    if borrowpaid_cash_member:                        
                        for borrow in borrowpaid_cash_member:
                            mem_details=Member_Details.objects.filter(id=borrow['members_id']).first()
                            mem_respective_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow Paid",members=borrow['members_id'],banks=None).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                            dic_bank={}
                            dic_bank['member_name']=mem_details.member_name
                            dic_bank['amount']=mem_respective_amount
                            dic_bank['payment_type']="Cash"
                            out_borrow_paid.append(dic_bank)
                            
                 
                    borrow_check_nomember=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Borrow Paid",members=None,banks=None).exclude(cash_transaction=None).values("cash_transaction_id").distinct()
                    if borrow_check_nomember:
                        
                        for borrow in borrow_check_nomember:
                            transaction_check=CashTransactionDetails.objects.filter(id=borrow["cash_transaction_id"]).first()
                            dic_bank={}
                            dic_bank['member_name']=transaction_check.name
                            dic_bank['amount']=transaction_check.amount
                            dic_bank['payment_type']="Cash"
                            out_borrow_paid.append(dic_bank)

                if cash_borrow_paid_details or cash_borrowpaid_details:
                    dic_final={}
                    dic_final['member_details']=out_borrow_paid
                    dic_final['total_amount']=cash_borrow_paid_bank + cash_borrowpaid
                    dic_borrow_amount={}
                    dic1['borrowpaid_amount']=dic_final
                    dic_borrow_amount['borrow_amount']= (cash_borrow_bank + cash_borrow) - (cash_borrow_paid_bank + cash_borrowpaid)
                
                cash_withdraw_check=Report.objects.filter(type_choice="Withdraw",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_withdraw_check==None:
                    cash_withdraw_check=0


                cash_deposit_check=Report.objects.filter(type_choice="Deposit",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if cash_deposit_check==None:
                    cash_deposit_check=0

                bank_loan=Report.objects.filter(type_choice="Loan",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if bank_loan==None:
                    bank_loan=0
                bank_loan_details=Report.objects.filter(type_choice="Loan",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None)
                if bank_loan_details:
                    loan_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Loan").exclude(cash_transaction=None).exclude(banks=None).values("banks_id").distinct()
                    out_loan=[]
                    for loans in loan_check:
                        bank_details=BankDetails.objects.filter(id=loans['banks_id']).first()
                        bank_respective_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Loan",banks=loans['banks_id']).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                        dic_bank={}
                        dic_bank['bank_name']=bank_details.bank_name
                        dic_bank['amount']=bank_respective_amount
                        out_loan.append(dic_bank)
                        dic_final={}
                        dic_final['bank_details']=out_loan
                        dic_final['total_amount']=bank_loan
                    dic_pending_loan={}
                    dic['loan_income']=dic_final
                    dic_pending_loan['loan_pending_amount']=bank_loan

                bank_loan_repay=Report.objects.filter(type_choice="Loan Repay",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')                        
                if bank_loan_repay==None:
                    bank_loan_repay=0
                bank_loan_repay_details=Report.objects.filter(type_choice="Loan Repay",management_profile=management,created_at__date=start_date).exclude(cash_transaction=None).exclude(banks=None)
                if bank_loan_repay_details:
                    loan_repay_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Loan Repay").exclude(cash_transaction=None).exclude(banks=None).values("banks_id").distinct()
                    out_loan_repay=[]
                    for loans in loan_repay_check:
                        bank_details=BankDetails.objects.filter(id=loans['banks_id']).first()
                        bank_respective_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Loan Repay",banks=loans['banks_id']).exclude(cash_transaction=None).aggregate(Sum('amount')).get('amount__sum')
                        dic_bank={}
                        dic_bank['bank_name']=bank_details.bank_name
                        dic_bank['amount']=bank_respective_amount
                        out_loan_repay.append(dic_bank)
                        dic_final={}
                        dic_final['bank_details']=out_loan_repay
                        dic_final['total_amount']=bank_loan_repay
                    dic1['loan_repayment']=dic_final
                    dic_pending_loan['loan_pending_amount']=bank_loan - bank_loan_repay

                out_fund21ffffff=[]
                fund_total_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(fund_m=None).exclude(fund_m__fund__fund_type="Normal").aggregate(Sum('amount')).get('amount__sum') 
                if fund_total_amount==None:
                    fund_total_amount=0
                print(fund_total_amount)
                fund_initial_cash_amount_exists=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None).exclude(fund_m=None).exclude(fund_m__fund__fund_type="Normal")
                print(fund_initial_cash_amount_exists)
                print("pppppppppppppppppppppppppppp")                
                if fund_initial_cash_amount_exists:                    
                    for cccc in fund_initial_cash_amount_exists:
                        print("kkkkkkkkkkkkkkkkkkk")
                        print(cccc)
                        print(cccc.fund_m.fund.fund_type)                        
                        if cccc.fund_m.fund.fund_type == "Fund 21": 
                                print("ffffffffffffffffffffffffffff")                           
                                fund_group_id=cccc.fund_m_id
                                fund_group=FundGroupDetails.objects.filter(id=fund_group_id).first()
                                dic_type21={}
                                dic_type21['fund_name']=fund_group.fund.fund_name + "" f'({fund_group.fund.fund_type})'
                                dic_type21['amount']=cccc.amount
                                out_fund21ffffff.append(dic_type21)
                        
                        elif cccc.fund_m.fund.fund_type == "Fund 20":
                                        fund_group_20id=cccc.fund_m_id
                                        fund_group=FundGroupDetails.objects.filter(id=fund_group_20id).first()
                                        dic_type20={}
                                        dic_type20['fund_name']=fund_group.fund.fund_name + "" f'({fund_group.fund.fund_type})'
                                        dic_type20['amount']=cccc.amount
                                        out_fund21ffffff.append(dic_type20)
                check_normal=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None,fund_m__fund__fund_type="Normal").exclude(fund_lease=None)
                if check_normal:
                        check_diff_norm=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None,fund_m__fund__fund_type="Normal").exclude(fund_lease=None).values("fund_m_id").distinct()
                        for iiii in check_diff_norm:
                            fund_group=FundGroupDetails.objects.filter(id=iiii['fund_m_id']).first()
                            total_fund_normal_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None,fund_m__fund__fund_type="Normal",fund_m=iiii['fund_m_id']).exclude(fund_lease=None).aggregate(Sum('amount')).get('amount__sum') 
                            dic_normal={}
                            dic_normal['fund_name']=fund_group.fund.fund_name + " " f'({fund_group.fund.fund_type})'
                            dic_normal['amount']=total_fund_normal_amount
                            out_fund21ffffff.append(dic_normal)
                if fund_initial_cash_amount_exists or check_normal:
                    print(out_fund21ffffff)
                    dic["Fund"]=out_fund21ffffff

                report_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(chit_fund=None)
                if report_check:
                    check_mnagement_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment").exclude(chitfund=None).values("chitfund_id").distinct()
                    out_final=[]                 
                    
                    for iiii in check_mnagement_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()
                        out_fund=[]
                        report_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id']).exclude(chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if report_check==None:
                            report_check=0
                        manage_check_exists=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None)
                        
                        manage_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if manage_check==None:
                            manage_check=0

                        
                        if manage_check_exists:
                            chi_fund={}
                            chi_fund['name']="Management"
                            chi_fund['amount']=manage_check
                            out_fund.append(chi_fund)
                        dic_final={}
                        dic_final['chitfund_name']=fund_name.chit_name
                        dic_final['details']=out_fund
                        dic_final['total_amount']=manage_check
                        dic_final['id']=fund_name.id
                        out_final.append(dic_final)
                        print(out_fund)
                        print("000000000")

                    dic1['Chit_fund_Investment']=out_final

                interest_report=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(interest=None)
                interest_report_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction").exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if interest_report_amount==None:
                    interest_report_amount=0
                    
                if interest_report:
                    out_int=[]
                    for iiii in interest_report:
                        int_name=iiii.interest.people_name
                        
                        dic_interest={}
                        dic_interest['interest_name']=int_name
                        dic_interest['amount']=iiii.amount
                        out_int.append(dic_interest)
                    difffff={}
                    difffff['total_amount']=interest_report_amount
                    difffff['details']=out_int
                    dic1['Interest_Principal_amount']=difffff


                chit_fund_profit_distribution=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(chit_fund=None)
                chit_fund_profit_distribution_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(chit_fund=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_profit_distribution_amount==None:
                    chit_fund_profit_distribution_amount=0
                if chit_fund_profit_distribution:
                    chit_fund_profit_distribution_check=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition").exclude(chit_fund=None).values("chit_fund_id").distinct()

                    out_chit_dis=[]
                    for iiii in chit_fund_profit_distribution_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chit_fund_id']).first()                    
                        amount_check=Report.objects.filter(chit_fund=iiii['chit_fund_id'],management_profile=management,created_at__date=start_date,type_choice="Addition").aggregate(Sum('amount')).get('amount__sum')

                        
                        dic_interest={}
                        dic_interest['name']=fund_name.chit_name
                        dic_interest['amount']=amount_check
                        out_chit_dis.append(dic_interest)
                    difffff={}
                    difffff['total_amount']=chit_fund_profit_distribution_amount
                    difffff['details']=out_chit_dis
                    dic['Chit_fund_Profit']=difffff


                total_credit=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                total_creditssss=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",balance=False,mangebalancesheet=None,managee=False)
                print(total_creditssss)
                print("oooooooooooooooooooooooooooooooooooooooooooooooooooooo")

                if total_credit == None:
                    total_credit=0

                total_credit_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",banks=None,mangebalancesheet=None).aggregate(Sum('amount')).get('amount__sum')
                if total_credit_cash_amount==None:
                    total_credit_cash_amount=0
                total_credit_cash_amounts=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",mangebalancesheet=None,banks=None)
                logger.info(total_credit_cash_amounts)
                logger.info(total_credit_cash_amount)

                total_credit_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Addition",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if total_credit_bank_amount==None:
                    total_credit_bank_amount=0
                logger.info(total_credit_cash_amount)

                
                total_debit=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",balance=False,mangebalancesheet=None,managee=False).aggregate(Sum('amount')).get('amount__sum')
                if total_debit == None:
                    total_debit=0 

                total_debit_cash_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",mangebalancesheet=None,banks=None).aggregate(Sum('amount')).get('amount__sum')
                if total_debit_cash_amount==None:
                    total_debit_cash_amount=0
                
                total_debit_bank_amount=Report.objects.filter(management_profile=management,created_at__date=start_date,type_choice="Reduction",mangebalancesheet=None,managee=False).exclude(banks=None).aggregate(Sum('amount')).get('amount__sum')
                if total_debit_bank_amount==None:
                    total_debit_bank_amount=0
                print("uuuuuuuuuuuuuuuuuuuu")
                logger.info(total_opening_balnce)               
                if total_opening_balnce>0:
                    dic['opening_balance']=total_opening_balnce
                    opening_balance_credit=total_opening_balnce
                elif total_opening_balnce==0:
                    opening_balance=total_opening_balnce  
                    print(opening_balance)              
                else:
                    dic1['opening_balance']=abs(total_opening_balnce)  
                    opening_balance_debit=total_opening_balnce
                print("ssssssssssssssssssssssssssssssss")
                dict={}
                dict['Credit']=dic
                dict['Debit']=dic1
                print(total_opening_balnce)
                print("yyyyyyyyyyy")
                print(total_debit)
                print("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
                print(cash_borrow)
                print(bank_loan_repay)
                print(cash_borrowpaid)
                print(total_credit)
                print(all_check_balance)
                print(bank_loan)
                print("vvvvvvvvvvvvvvvvvvvvv")
                print(total_credit_cash_amount)
                print(total_debit_cash_amount)
                print(calculating_cash_opening)
                print(cash_withdraw_check)
                print(cash_deposit_check)
                print(cash_borrow)
                print(cash_borrowpaid)
                
                if total_opening_balnce>0:
                    dict['total_credit_amount']=total_credit + opening_balance_credit + all_check_balance + bank_loan + cash_borrow_bank + cash_borrow 
                    dict['total_debit_amount']=total_debit + bank_loan_repay + cash_borrowpaid + cash_borrow_paid_bank
                    dict['name']="custom_date"
                    dict['start_date']=start_date
                    dict['overall_bank_amount']=total_credit_bank_amount - total_debit_bank_amount + calculating_bank_opening - cash_withdraw_check + cash_deposit_check + bank_loan - bank_loan_repay - cash_borrow_paid_bank + cash_borrow_bank
                    dict['overall_cash_amount']=abs(total_credit_cash_amount - total_debit_cash_amount + calculating_cash_opening + cash_withdraw_check - cash_deposit_check + cash_borrow - cash_borrowpaid)
                    if bank_loan_details or bank_loan_repay_details:
                        dict['loan_details_bottom']=dic_pending_loan
                    if cash_borrow_paid_details or cash_borrowpaid_details or cash_borrow_bank_details or cash_borrow_details:
                        dict['borrow_details_bottom']=dic_borrow_amount
                    check_balance_credit=total_credit_cash_amount + calculating_cash_opening + cash_withdraw_check + cash_borrow
                    check_balance_debit=total_debit_cash_amount + cash_deposit_check + cash_borrowpaid
                    print(check_balance_credit)
                    print(check_balance_debit)
                    if check_balance_credit > check_balance_debit:
                        overall_balance=check_balance_credit - check_balance_debit
                        dict['balance_type']="Credit"
                        dict['balance_amount']=overall_balance
                    
                    elif check_balance_credit < check_balance_debit:
                        overall_balance=check_balance_debit - check_balance_credit
                        dict['balance_type']="Debit"
                        dict['balance_amount']=overall_balance
                    else:
                        dict['balance_type']=""
                        dict['balance_amount']=0 


                elif total_opening_balnce==0:
                    dict['total_credit_amount']=total_credit + bank_loan + cash_borrow_bank + cash_borrow 
                    dict['total_debit_amount']=total_debit + bank_loan_repay + cash_borrowpaid + cash_borrow_paid_bank
                    dict['name']="custom_date"
                    dict['start_date']=start_date
                    dict['overall_bank_amount']=total_credit_bank_amount - total_debit_bank_amount + calculating_bank_opening - cash_withdraw_check + cash_deposit_check + bank_loan - bank_loan_repay + cash_borrow_bank - cash_borrow_paid_bank
                    dict['overall_cash_amount']=abs(total_credit_cash_amount - total_debit_cash_amount + calculating_cash_opening + cash_withdraw_check - cash_deposit_check + cash_borrow - cash_borrowpaid) 
                    if bank_loan_details or bank_loan_repay_details:
                        dict['loan_details_bottom']=dic_pending_loan
                    if cash_borrow_paid_details or cash_borrowpaid_details or cash_borrow_bank_details or cash_borrow_details:
                        dict['borrow_details_bottom']=dic_borrow_amount                    
                    check_balance_credit=total_credit_cash_amount + calculating_cash_opening + cash_withdraw_check + cash_borrow
                    check_balance_debit=total_debit_cash_amount + cash_deposit_check + cash_borrowpaid
                    if check_balance_credit > check_balance_debit:
                        overall_balance=check_balance_credit - check_balance_debit
                        dict['balance_type']="Credit"
                        dict['balance_amount']=overall_balance
                    elif check_balance_credit < check_balance_debit:
                        overall_balance=check_balance_debit - check_balance_credit
                        dict['balance_type']="Debit"
                        dict['balance_amount']=overall_balance
                    else:
                        dict['balance_type']=""
                        dict['balance_amount']=0
                else:
                    print(total_credit_cash_amount)
                    print(total_debit_cash_amount)
                    print(calculating_cash_opening)
                    print(total_credit_cash_amount)
                    print(total_credit_cash_amount)
                    print(total_credit_cash_amount)
                    print(total_credit_cash_amount)
                    print(total_credit_cash_amount)

                    dict['total_credit_amount']=total_credit + all_check_balance + bank_loan + cash_borrow_bank + cash_borrow 
                    dict['total_debit_amount']=total_debit +  abs(opening_balance_debit) + bank_loan_repay + cash_borrowpaid + cash_borrow_paid_bank
                    dict['name']="custom_date"
                    dict['start_date']=start_date
                    dict['overall_bank_amount']=total_credit_bank_amount - total_debit_bank_amount + calculating_bank_opening - cash_withdraw_check + cash_deposit_check + bank_loan - bank_loan_repay  + cash_borrow_bank - cash_borrow_paid_bank
                    dict['overall_cash_amount']=abs(total_credit_cash_amount - total_debit_cash_amount + calculating_cash_opening + cash_withdraw_check - cash_deposit_check + cash_borrow - cash_borrowpaid ) 
                    if bank_loan_details or bank_loan_repay_details:
                        dict['loan_details_bottom']=dic_pending_loan
                    if cash_borrow_paid_details or cash_borrowpaid_details or cash_borrow_bank_details or cash_borrow_details:                    
                        dict['borrow_details_bottom']=dic_borrow_amount                    
                    check_balance_credit=total_credit_cash_amount + calculating_cash_opening + cash_withdraw_check  + cash_borrow
                    check_balance_debit=total_debit_cash_amount + cash_deposit_check + cash_borrowpaid
                    if check_balance_credit > check_balance_debit:
                        overall_balance=check_balance_credit - check_balance_debit
                        dict['balance_type']="Credit"
                        dict['balance_amount']=overall_balance
                    elif check_balance_credit < check_balance_debit:
                        overall_balance=check_balance_debit - check_balance_credit
                        dict['balance_type']="Debit"
                        dict['balance_amount']=overall_balance
                    else:
                        dict['balance_type']=""
                        dict['balance_amount']=0
                if balance_check:
                    dict['balance']=dic_balance   
                logger.info(dict)             
                return Response(dict,status=status.HTTP_201_CREATED) 
            

@api_view(['GET','POST'])
def balancesheet_chitfundview(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    get_role=rejin.user_role
    print(get_role)     
    
    
    if request.method == 'POST':
        if get_role=="User" or get_role=="Admin" or rejin.is_superuser == True:      

            range_type=request.data['range_type']
            if range_type=="custom_date_range":
                dic={}
                dic1={}      
                start_date=request.data['start_date']
                end_date=request.data['end_date']

                opening_balance_in=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Investment").exclude(chitfund=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_balance_in==None:
                    opening_balance_in=0
                print(opening_balance_in)
                print("qqqqqq")
                opening_bal_collec=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_bal_collec==None:
                    opening_bal_collec=0
                print(opening_bal_collec)
                
                total_in_opening_balance = opening_balance_in + opening_bal_collec
                print(total_in_opening_balance)

                opening_balance_out = ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Principal Given").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_balance_out==None:
                    opening_balance_out=0
                print(opening_balance_out)
                
                opening_balance_outdistribution = ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_balance_outdistribution==None:
                    opening_balance_outdistribution=0
                print(opening_balance_outdistribution)
                
                total_out_opening_balance = opening_balance_out + opening_balance_outdistribution
                print(total_out_opening_balance)


                if total_in_opening_balance > total_out_opening_balance:
                    dic['opening_balance'] = total_in_opening_balance - total_out_opening_balance
                elif total_in_opening_balance < total_out_opening_balance:
                    dic1['opening_balance'] = total_out_opening_balance - total_in_opening_balance


                check_invest_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment").exclude(chitfund=None).aggregate(Sum('amount')).get('amount__sum')
                if check_invest_amount==None:
                    check_invest_amount=0
                check_mnagement=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment").exclude(chitfund=None)
                if check_mnagement:
                    check_mnagement_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment").exclude(chitfund=None).values("chitfund_id").distinct()
                    out_final=[]              
                    
                    for iiii in check_mnagement_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()
                        out_fund=[]
                        report_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id']).exclude(chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if report_check==None:
                            report_check=0
                        manage_check_exists=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None)
                        manage_checkinvesters_exists=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=False).exclude(chitinvesters=None)
                        
                        manage_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if manage_check==None:
                            manage_check=0

                        manage_check_total_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id']).aggregate(Sum('amount')).get('amount__sum')
                        if manage_check_total_amount==None:
                            manage_check_total_amount=0                        
                        
                        if manage_check_exists:
                            chi_fund={}
                            chi_fund['name']="Management"
                            chi_fund['amount']=manage_check
                            out_fund.append(chi_fund)
                        if manage_checkinvesters_exists:
                            for dddd in manage_checkinvesters_exists:
                                manage_checkinvesters_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=False,chitinvesters_id=dddd.chitinvesters_id).aggregate(Sum('amount')).get('amount__sum')
                                chi_fund1={}
                                chi_fund1['name']=dddd.chitinvesters.invester_name
                                chi_fund1['amount']=manage_checkinvesters_amount
                                out_fund.append(chi_fund1)
                        dic_final={}
                        dic_final['chitfund_name']=fund_name.chit_name
                        dic_final['details']=out_fund
                        dic_final['total_amount']=manage_check_total_amount
                        dic_final['id']=fund_name.id
                        out_final.append(dic_final)
                        print(out_fund)
                        print("000000000")

                    dic['Chit_fund_Investment']=out_final

                chit_fund_profit_distribution=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None)
                chit_fund_profit_distribution_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_profit_distribution_amount==None:
                    chit_fund_profit_distribution_amount=0
                if chit_fund_profit_distribution:
                    chit_fund_profit_distribution_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None).values("chitfund_id").distinct()

                    out_chit_dis=[]
                    for iiii in chit_fund_profit_distribution_check:
                        amount_check=ChitFundInterestOverallReport.objects.filter(chitfund=iiii['chitfund_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Distribution").aggregate(Sum('amount')).get('amount__sum')
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()                    
                        
                        dic_interest={}
                        dic_interest['name']=fund_name.chit_name
                        dic_interest['amount']=amount_check
                        out_chit_dis.append(dic_interest)
                    difffff={}
                    difffff['total_amount']=chit_fund_profit_distribution_amount
                    difffff['details']=out_chit_dis
                    dic1['Chit_fund_Profit_Distribution']=difffff

                chit_fund_interest_given=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Principal Given").exclude(chitfund=None).exclude(interest=None)
                chit_fund_interest_given_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Principal Given").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_interest_given_amount==None:
                    chit_fund_interest_given_amount=0
                if chit_fund_interest_given:
                    out_chit_dis=[]
                    for rec in chit_fund_interest_given:
                        chit_name = rec.chitfund.chit_name if rec.chitfund else '-'
                        person_name = rec.interest.people_name if rec.interest else '-'
                        out_chit_dis.append({
                            'person_name': person_name,
                            'chit_name': chit_name,
                            'amount': rec.amount,
                        })
                    difffff={}
                    difffff['total_amount']=chit_fund_interest_given_amount
                    difffff['details']=out_chit_dis
                    dic1['Chit_fund_Interest_Given']=difffff

                chit_fund_interest_collection=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None)
                chit_fund_interest_collection_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_interest_collection_amount==None:
                    chit_fund_interest_collection_amount=0
                if chit_fund_interest_collection:
                    chit_fund_collection_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None).values("chitfund_id").distinct()

                    out_chit_dis=[]
                    for iiii in chit_fund_collection_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()                    
                        amount_check=ChitFundInterestOverallReport.objects.filter(chitfund=iiii['chitfund_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Addition").aggregate(Sum('amount')).get('amount__sum')

                        int_name=fund_name.chit_name

                        chit_fund_records=ChitFundInterestOverallReport.objects.filter(chitfund=iiii['chitfund_id'],management_profile=management,created_at__date__gte=start_date,created_at__date__lte=end_date,income_choice="Addition").exclude(interest=None)
                        member_details=[]
                        for rec in chit_fund_records:
                            member_details.append({
                                'person_name': rec.interest.people_name if rec.interest else '-',
                                'amount': rec.amount,
                            })

                        dic_interest={}
                        dic_interest['name']=int_name 
                        dic_interest['amount']=amount_check
                        dic_interest['member_details']=member_details
                        out_chit_dis.append(dic_interest)
                    difffff={}
                    difffff['total_amount']=chit_fund_interest_collection_amount
                    difffff['details']=out_chit_dis
                    dic['From_Collection']=difffff


                print(check_invest_amount)
                print(total_in_opening_balance - total_out_opening_balance)
                print(chit_fund_interest_collection_amount)

                chit_expense_qs = ADDExpenseDetails.objects.filter(
                    management_profile=management,
                    date__gte=start_date,
                    date__lte=end_date,
                    expense_subcategory="Chit Fund Expense",
                )
                from decimal import Decimal
                chit_expense_total = Decimal(str(chit_expense_qs.aggregate(Sum('expense_amt')).get('expense_amt__sum') or 0))
                chit_expense_details = []
                for exp in chit_expense_qs:
                    chit_expense_details.append({
                        'id': exp.id,
                        'category_name': exp.category_name,
                        'chit_fund_name': exp.chit_fund_name,
                        'chit_fund_id': exp.chitt_fund_id,
                        'expense_name': exp.expense_name,
                        'amount': exp.expense_amt,
                        'date': exp.date,
                        'payment_mode': exp.payment_mode,
                        'transaction_type': exp.transaction_type,
                        'bank_name': exp.bank_name,
                    })
                if chit_expense_total:
                    dic1['Chit_Fund_Expense'] = {
                        'total_amount': chit_expense_total,
                        'details': chit_expense_details,
                    }

                chit_income_qs = ADDIncomeDetails.objects.filter(
                    management_profile=management,
                    date__gte=start_date,
                    date__lte=end_date,
                    income_subcategory="Chit Fund Income",
                )
                chit_income_total = Decimal(str(chit_income_qs.aggregate(Sum('income_amt')).get('income_amt__sum') or 0))
                chit_income_details = []
                for inc in chit_income_qs:
                    chit_income_details.append({
                        'id': inc.id,
                        'category_name': inc.category_name,
                        'income_name': inc.income_name,
                        'amount': inc.income_amt,
                        'date': inc.date,
                        'payment_mode': inc.payment_mode,
                        'transaction_type': inc.transaction_type,
                        'bank_name': inc.bank_name,
                    })
                if chit_income_total:
                    dic['Chit_Fund_Income'] = {
                        'total_amount': chit_income_total,
                        'details': chit_income_details,
                    }

                dict={}
                dict['Credit']=dic
                dict['Debit']=dic1
                dict['total_credit_amount']=check_invest_amount  + chit_fund_interest_collection_amount + total_in_opening_balance - total_out_opening_balance + chit_income_total
                dict['total_debit_amount']=chit_fund_interest_given_amount + chit_fund_profit_distribution_amount + chit_expense_total
                dict['name']="custom_date_range"
                dict['start_date']=start_date
                dict['end_date']=end_date

                net = check_invest_amount + chit_fund_interest_collection_amount + total_in_opening_balance - chit_fund_interest_given_amount - chit_fund_profit_distribution_amount - total_out_opening_balance - chit_expense_total + chit_income_total
                if net > 0:
                    dict['balance_amount']=net
                    dict['balance_type']="Credit"
                elif net == 0:
                    dict['balance_amount']=0
                    dict['balance_type']=""
                else:
                    dict['balance_amount']=abs(net)
                    dict['balance_type']="Debit"

                print(dict)
                return Response(dict,status=status.HTTP_201_CREATED) 

            elif range_type=="custom_date":
                dic={}
                dic1={}      
                start_date=request.data['start_date']

                opening_balance_in=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Investment").exclude(chitfund=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_balance_in==None:
                    opening_balance_in=0
                print(opening_balance_in)
                print("qqqqqq")
                opening_bal_collec=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_bal_collec==None:
                    opening_bal_collec=0
                print(opening_bal_collec)
                
                total_in_opening_balance = opening_balance_in + opening_bal_collec
                print(total_in_opening_balance)

                opening_balance_out = ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Principal Given").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_balance_out==None:
                    opening_balance_out=0
                print(opening_balance_out)
                
                opening_balance_outdistribution = ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date__lt=start_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None).aggregate(Sum('amount')).get('amount__sum')
                if opening_balance_outdistribution==None:
                    opening_balance_outdistribution=0
                print(opening_balance_outdistribution)
                
                total_out_opening_balance = opening_balance_out + opening_balance_outdistribution
                print(total_out_opening_balance)

                opening_expense_out = ADDExpenseDetails.objects.filter(
                    management_profile=management,
                    date__lt=start_date,
                    expense_subcategory="Chit Fund Expense",
                ).aggregate(Sum('expense_amt')).get('expense_amt__sum')
                if opening_expense_out is None:
                    opening_expense_out = 0

                opening_income_in = ADDIncomeDetails.objects.filter(
                    management_profile=management,
                    date__lt=start_date,
                    income_subcategory="Chit Fund Income",
                ).aggregate(Sum('income_amt')).get('income_amt__sum')
                if opening_income_in is None:
                    opening_income_in = 0

                total_in_opening_balance = total_in_opening_balance + opening_income_in
                total_out_opening_balance = total_out_opening_balance + opening_expense_out

                if total_in_opening_balance > total_out_opening_balance:
                    dic['opening_balance'] = total_in_opening_balance - total_out_opening_balance
                elif total_in_opening_balance < total_out_opening_balance:
                    dic1['opening_balance'] = total_out_opening_balance - total_in_opening_balance

                check_invest_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment").exclude(chitfund=None).aggregate(Sum('amount')).get('amount__sum')
                if check_invest_amount==None:
                    check_invest_amount=0
                check_mnagement=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment").exclude(chitfund=None)
                if check_mnagement:
                    check_mnagement_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment").exclude(chitfund=None).values("chitfund_id").distinct()
                    out_final=[]                 
                    
                    for iiii in check_mnagement_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()
                        out_fund=[]
                        report_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id']).exclude(chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if report_check==None:
                            report_check=0
                        manage_check_exists=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None)
                        manage_checkinvesters_exists=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=False).exclude(chitinvesters=None)
                        
                        manage_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=True,chitinvesters=None).aggregate(Sum('amount')).get('amount__sum')
                        if manage_check==None:
                            manage_check=0

                        manage_check_total_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id']).aggregate(Sum('amount')).get('amount__sum')
                        if manage_check_total_amount==None:
                            manage_check_total_amount=0                       
                        
                        if manage_check_exists:
                            chi_fund={}
                            chi_fund['name']="Management"
                            chi_fund['amount']=manage_check
                            out_fund.append(chi_fund)
                        if manage_checkinvesters_exists:
                            for dddd in manage_checkinvesters_exists:
                                manage_checkinvesters_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Investment",chitfund=iiii['chitfund_id'],managee=False,chitinvesters_id=dddd.chitinvesters_id).aggregate(Sum('amount')).get('amount__sum')
                                chi_fund1={}
                                chi_fund1['name']=dddd.chitinvesters.invester_name
                                chi_fund1['amount']=manage_checkinvesters_amount
                                out_fund.append(chi_fund1)
                        dic_final={}
                        dic_final['chitfund_name']=fund_name.chit_name
                        dic_final['details']=out_fund
                        dic_final['total_amount']=manage_check_total_amount
                        dic_final['id']=fund_name.id
                        out_final.append(dic_final)                       
                    print(out_final)
                    print("ttttttttttttt")
                    dic['Chit_fund_Investment']=out_final

                chit_fund_profit_distribution=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None)
                chit_fund_profit_distribution_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_profit_distribution_amount==None:
                    chit_fund_profit_distribution_amount=0
                if chit_fund_profit_distribution:
                    chit_fund_profit_distribution_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Distribution").exclude(chitfund=None).exclude(chitdistribution=None).values("chitfund_id").distinct()

                    out_chit_dis=[]
                    for iiii in chit_fund_profit_distribution_check:
                        amount_check=ChitFundInterestOverallReport.objects.filter(chitfund=iiii['chitfund_id'],management_profile=management,created_at__date=start_date,income_choice="Distribution").aggregate(Sum('amount')).get('amount__sum')
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()                    
                        
                        dic_interest={}
                        dic_interest['name']=fund_name.chit_name
                        dic_interest['amount']=amount_check
                        out_chit_dis.append(dic_interest)
                    difffff={}
                    difffff['total_amount']=chit_fund_profit_distribution_amount
                    difffff['details']=out_chit_dis
                    dic1['Chit_fund_Profit_Distribution']=difffff

                chit_fund_interest_given=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Principal Given").exclude(chitfund=None).exclude(interest=None)
                chit_fund_interest_given_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Principal Given").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_interest_given_amount==None:
                    chit_fund_interest_given_amount=0
                if chit_fund_interest_given:
                    out_chit_dis=[]
                    for rec in chit_fund_interest_given:
                        chit_name = rec.chitfund.chit_name if rec.chitfund else '-'
                        person_name = rec.interest.people_name if rec.interest else '-'
                        out_chit_dis.append({
                            'person_name': person_name,
                            'chit_name': chit_name,
                            'amount': rec.amount,
                        })
                    difffff={}
                    difffff['total_amount']=chit_fund_interest_given_amount
                    difffff['details']=out_chit_dis
                    dic1['Chit_fund_Interest_Given']=difffff
                
                chit_fund_interest_collection=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None)
                chit_fund_interest_collection_amount=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None).aggregate(Sum('amount')).get('amount__sum')
                if chit_fund_interest_collection_amount==None:
                    chit_fund_interest_collection_amount=0
                if chit_fund_interest_collection:
                    chit_fund_collection_check=ChitFundInterestOverallReport.objects.filter(management_profile=management,created_at__date=start_date,income_choice="Addition").exclude(chitfund=None).exclude(interest=None).values("chitfund_id").distinct()

                    out_chit_dis=[]
                    for iiii in chit_fund_collection_check:
                        fund_name=ChitFundsDetails.objects.filter(id=iiii['chitfund_id']).first()                    
                        amount_check=ChitFundInterestOverallReport.objects.filter(chitfund=iiii['chitfund_id'],management_profile=management,created_at__date=start_date,income_choice="Addition").aggregate(Sum('amount')).get('amount__sum')

                        int_name=fund_name.chit_name

                        chit_fund_records=ChitFundInterestOverallReport.objects.filter(chitfund=iiii['chitfund_id'],management_profile=management,created_at__date=start_date,income_choice="Addition").exclude(interest=None)
                        member_details=[]
                        for rec in chit_fund_records:
                            member_details.append({
                                'person_name': rec.interest.people_name if rec.interest else '-',
                                'amount': rec.amount,
                            })

                        dic_interest={}
                        dic_interest['name']=int_name 
                        dic_interest['amount']=amount_check
                        dic_interest['member_details']=member_details
                        out_chit_dis.append(dic_interest)
                    difffff={}
                    difffff['total_amount']=chit_fund_interest_collection_amount
                    difffff['details']=out_chit_dis
                    dic['From_Collection']=difffff


                chit_expense_qs = ADDExpenseDetails.objects.filter(
                    management_profile=management,
                    date=start_date,
                    expense_subcategory="Chit Fund Expense",
                )
                from decimal import Decimal
                chit_expense_total = Decimal(str(chit_expense_qs.aggregate(Sum('expense_amt')).get('expense_amt__sum') or 0))
                chit_expense_details = []
                for exp in chit_expense_qs:
                    chit_expense_details.append({
                        'id': exp.id,
                        'category_name': exp.category_name,
                        'chit_fund_name': exp.chit_fund_name,
                        'chit_fund_id': exp.chitt_fund_id,
                        'expense_name': exp.expense_name,
                        'amount': exp.expense_amt,
                        'date': exp.date,
                        'payment_mode': exp.payment_mode,
                        'transaction_type': exp.transaction_type,
                        'bank_name': exp.bank_name,
                    })
                if chit_expense_total:
                    dic1['Chit_Fund_Expense'] = {
                        'total_amount': chit_expense_total,
                        'details': chit_expense_details,
                    }

                chit_income_qs = ADDIncomeDetails.objects.filter(
                    management_profile=management,
                    date=start_date,
                    income_subcategory="Chit Fund Income",
                )
                chit_income_total = Decimal(str(chit_income_qs.aggregate(Sum('income_amt')).get('income_amt__sum') or 0))
                chit_income_details = []
                for inc in chit_income_qs:
                    chit_income_details.append({
                        'id': inc.id,
                        'category_name': inc.category_name,
                        'income_name': inc.income_name,
                        'amount': inc.income_amt,
                        'date': inc.date,
                        'payment_mode': inc.payment_mode,
                        'transaction_type': inc.transaction_type,
                        'bank_name': inc.bank_name,
                    })
                if chit_income_total:
                    dic['Chit_Fund_Income'] = {
                        'total_amount': chit_income_total,
                        'details': chit_income_details,
                    }

                dict={}
                dict['Credit']=dic
                dict['Debit']=dic1
                dict['total_credit_amount']=check_invest_amount + chit_fund_interest_collection_amount + total_in_opening_balance - total_out_opening_balance + chit_income_total
                dict['total_debit_amount']=chit_fund_interest_given_amount + chit_fund_profit_distribution_amount + chit_expense_total
                dict['name']="custom_date"
                dict['start_date']=start_date

                net = check_invest_amount + chit_fund_interest_collection_amount + total_in_opening_balance - chit_fund_interest_given_amount - chit_fund_profit_distribution_amount - total_out_opening_balance - chit_expense_total + chit_income_total
                if net > 0:
                    dict['balance_amount']=net
                    dict['balance_type']="Credit"
                elif net == 0:
                    dict['balance_amount']=0
                    dict['balance_type']=""
                else:
                    dict['balance_amount']=abs(net)
                    dict['balance_type']="Debit"
                print(dict)
                return Response(dict,status=status.HTTP_201_CREATED)