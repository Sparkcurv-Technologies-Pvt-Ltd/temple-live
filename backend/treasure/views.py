from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from token_app.views import token_checking, generate_token
from user.models import User
from .models import ManagementTreasure, ManagementBalanceSheet, ManagementFunds
from management.models import ManagementDetails
from income.models import ADDIncomeDetails
from collection.models import CollectionDetails
from amount.models import PeoplesAmountDetails
from balancesheet.models import PeopleInterestBalanceSheet, FundMembersBalanceSheet, RentalBalanceSheet


@api_view(['GET','POST'])
def temple_balancesheet_details(request):
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
         
    if request.method == 'GET':
        opening_bal=ManagementBalanceSheet.objects.filter(management_profile=management).last().opening_balance_amt
        all_income_amt=ADDIncomeDetails.objects.filter(management_profile=management).aggregate(Sum('income_amt')).get("income_amt__sum")
        
        all_monthtariff_amt=PeoplesAmountDetails.objects.filter(management_profile=management,sub_tariff__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        all_deathtariff_amt=PeoplesAmountDetails.objects.filter(management_profile=management,death__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        all_marriage_amt=PeoplesAmountDetails.objects.filter(management_profile=management,marriage__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        all_festival_amt=PeoplesAmountDetails.objects.filter(management_profile=management,festival__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        
        all_rental_amt=RentalBalanceSheet.objects.filter(management_profile=management).aggregate(Sum('debit_amt')).get("debit_amt__sum")
        all_interest_amt=PeopleInterestBalanceSheet.objects.filter(management_profile=management).aggregate(Sum('debit_amt')).get("debit_amt__sum")
        all_fund_amt=FundMembersBalanceSheet.objects.filter(management_profile=management).aggregate(Sum('debit_amt')).get("debit_amt__sum")
        dict1={}
        dict1['name1']="Income"
        dict1['value1']=all_income_amt       
        dict1['name2']="Opening Balance"
        dict1['value2']=opening_bal
        dict1['name3']="Month Tariff"
        dict1['value3']=all_monthtariff_amt
        dict1['name4']="Death Tariff"
        dict1['value4']=all_deathtariff_amt
        dict1['name5']="Marriage"
        dict1['value5']=all_marriage_amt
        dict1['name6']="Festival"
        dict1['value6']=all_festival_amt
        dict1['name7']="Rent"
        dict1['value7']=all_rental_amt
        dict1['name7']="Interest"
        dict1['value7']=all_interest_amt
        dict1['name7']="Fund"
        dict1['value7']=all_fund_amt
        dict1['total_income']=all_income_amt + opening_bal + all_monthtariff_amt+ all_deathtariff_amt + all_marriage_amt + all_festival_amt + all_rental_amt + all_interest_amt + all_fund_amt

        return Response(dict1,status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data=request.data
        jj=request.data['range']
        end_date=jj['end_date']
        start_date=jj['start_date']
        # if start_date and end_date:
        #     start_date_time_obj = datetime.datetime.strptime(str(start_date), '%Y-%m-%d').date()
        #     end_date_time_obj = datetime.datetime.strptime(str(end_date), '%Y-%m-%d').date()
        opening_bal=ManagementBalanceSheet.objects.filter(management_profile=management).last().opening_balance_amt
        all_income_amt=ADDIncomeDetails.objects.filter(management_profile=management).aggregate(Sum('income_amt')).get("income_amt__sum")
        
        all_monthtariff_amt=PeoplesAmountDetails.objects.filter(management_profile=management,sub_tariff__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        all_deathtariff_amt=PeoplesAmountDetails.objects.filter(management_profile=management,death__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        all_marriage_amt=PeoplesAmountDetails.objects.filter(management_profile=management,marriage__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        all_festival_amt=PeoplesAmountDetails.objects.filter(management_profile=management,festival__isnull=False).aggregate(Sum('total_paid_amt')).get("total_paid_amt__sum")
        
        all_rental_amt=RentalBalanceSheet.objects.filter(management_profile=management).aggregate(Sum('debit_amt')).get("debit_amt__sum")
        all_interest_amt=PeopleInterestBalanceSheet.objects.filter(management_profile=management).aggregate(Sum('debit_amt')).get("debit_amt__sum")
        all_fund_amt=FundMembersBalanceSheet.objects.filter(management_profile=management).aggregate(Sum('debit_amt')).get("debit_amt__sum")
        dict1={}
        dict1['name1']="Income"
        dict1['value1']=all_income_amt       
        dict1['name2']="Opening Balance"
        dict1['value2']=opening_bal
        dict1['name3']="Month Tariff"
        dict1['value3']=all_monthtariff_amt
        dict1['name4']="Death Tariff"
        dict1['value4']=all_deathtariff_amt
        dict1['name5']="Marriage"
        dict1['value5']=all_marriage_amt
        dict1['name6']="Festival"
        dict1['value6']=all_festival_amt
        dict1['name7']="Rent"
        dict1['value7']=all_rental_amt
        dict1['name7']="Interest"
        dict1['value7']=all_interest_amt
        dict1['name7']="Fund"
        dict1['value7']=all_fund_amt
        dict1['total_income']=all_income_amt + opening_bal + all_monthtariff_amt+ all_deathtariff_amt + all_marriage_amt + all_festival_amt + all_rental_amt + all_interest_amt + all_fund_amt

        return Response(dict1,status=status.HTTP_200_OK)