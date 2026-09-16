from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import ADDIncomeDetailsSerializer,ADDIncomeCategorySerializer,ADDIncomeNamesSerializer
from .models import ADDIncomeDetails,ADDIncomeCategory,ADDIncomeNames
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from permisions.models import Permisions
from treasure.models import ManagementTreasure
from reports.models import Report
from management.models import BankDetails
from datetime import datetime



@api_view(['GET','POST'])
def add_income_categry(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        if get_role=="User" and perm.income_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            category_name=request.data['category_name']   
            category_check=ADDIncomeCategory.objects.filter(management_profile=management,category_name=category_name)
            if category_check:
                return Response({'message': 'Similar category name already exists'},status=status.HTTP_302_FOUND)
            serializer876 = ADDIncomeCategorySerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()

                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = ADDIncomeCategory.objects.filter(management_profile=management)
        serializer = ADDIncomeCategorySerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_income_categry(request,pk):
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
        customer = ADDIncomeCategory.objects.get(pk=pk)  
    except ADDIncomeCategory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    
    if request.method == 'GET':
        serializer = ADDIncomeCategorySerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        if get_role=="User" and perm.expense_edit ==True or get_role=="Admin" or rejin.is_superuser == True:
            category_check=ADDIncomeDetails.objects.filter(category=pk)
            if category_check:
                return Response({'message': 'Cannot be edited as it is added in income details'},status=status.HTTP_302_FOUND) 
            category_name=request.data['category_name']
            category_check=ADDIncomeCategory.objects.filter(management_profile=management,category_name=category_name).exclude(id=pk)
            if category_check:
                return Response({'message': 'Similar category namae already exists'},status=status.HTTP_302_FOUND)
            serializer876 = ADDIncomeCategorySerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.expense_edit ==True or get_role=="Admin" or rejin.is_superuser == True:  
            serializer876 = ADDIncomeCategorySerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.expense_edit ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.expense_delete ==True:
            category_check=ADDIncomeDetails.objects.filter(category=pk)
            if category_check:
                return Response({'message': 'Cannot be deleted as it is added in expense details'},status=status.HTTP_302_FOUND)
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    
@api_view(['GET','POST'])
def add_income_names(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        if get_role=="User" and perm.expense_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            income_name=request.data['income_name']
            expense_check=ADDIncomeNames.objects.filter(management_profile=management,income_name=income_name)
            if expense_check:
                return Response({'message': 'Similar expense namae already exists'},status=status.HTTP_302_FOUND)  
            serializer876 = ADDIncomeNamesSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management                
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = ADDIncomeNames.objects.filter(management_profile=management)
        serializer = ADDIncomeNamesSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_income_names(request,pk):
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
        customer = ADDIncomeNames.objects.get(pk=pk)  
    except ADDIncomeNames.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    
    if request.method == 'GET':
        serializer = ADDIncomeNamesSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        if get_role=="User" and perm.income_edit_edit ==True or get_role=="Admin" or rejin.is_superuser == True:   
            category_check=ADDIncomeDetails.objects.filter(income=pk)
            if category_check:
                return Response({'message': 'Cannot be edited as it is added in income details'},status=status.HTTP_302_FOUND) 
            income_name=request.data['income_name']
            expense_check=ADDIncomeNames.objects.filter(management_profile=management,income_name=income_name).exclude(id=pk)
            if expense_check:
                return Response({'message': 'Similar income namae already exists'},status=status.HTTP_302_FOUND)
            serializer876 = ADDIncomeNamesSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.expense_edit ==True or get_role=="Admin" or rejin.is_superuser == True:  
            serializer876 = ADDIncomeNamesSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.income_delete ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.income_edit ==True :
            category_check=ADDIncomeDetails.objects.filter(income=pk)
            if category_check:
                return Response({'message': 'Cannot be deleted as it is added in income details'},status=status.HTTP_302_FOUND) 
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)


@api_view(['GET','POST'])
def add_income_details(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        if get_role=="User" and perm.income_add ==True or get_role=="Admin" or rejin.is_superuser == True:      
            serializer876 = ADDIncomeDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                manage=ManagementTreasure.objects.filter(management_profile=management)
                if manage:
                    manage_get=ManagementTreasure.objects.filter(management_profile=management).first()
                    if temp_family.bank != None:
                        manage_get.bank_amt = float(manage_get.bank_amt) + float(temp_family.income_amt)
                        manage_get.save()
                        bank=BankDetails.objects.get(id=temp_family.bank.id)
                        bank.credit_amt = float(bank.credit_amt) +float(temp_family.income_amt)
                        bank.save()
                    else:
                        manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(temp_family.income_amt)
                        manage_get.save()
                
                Report.objects.create(banks=temp_family.bank,type_choice="Addition",management_profile=temp_family.management_profile,members=temp_family.member,incomes=temp_family,amount=temp_family.income_amt,created_by=rejin.id)
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
                
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = ADDIncomeDetails.objects.filter(management_profile=management)
        serializer = ADDIncomeDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_income_details(request,pk):
    rejin=token_checking(request)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
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
        customer = ADDIncomeDetails.objects.get(pk=pk) 
        income_check=customer.income_amt 
        income=customer.income_amt
        print("kkkkkkkkkkkkkkkkkk")
        bank_check=customer.bank
        print(bank_check)
    except ADDIncomeDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ADDIncomeDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT': 
        if get_role=="User" and perm.income_edit ==True or get_role=="Admin" or rejin.is_superuser == True:
            date_check=  (customer.date.month != datetime.now().month and customer.date.year != datetime.now().year)  or  (customer.date.month != datetime.now().month and customer.date.year == datetime.now().year)   or (customer.date.month == datetime.now().month and customer.date.year != datetime.now().year)     
            if date_check:
                return Response({'message':"Cannot be edited as this transaction is done in past month"},status.HTTP_302_FOUND)    
            serializer876 = ADDIncomeDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                print(request.data)
                # if customer.income_type == "Donation":
                #     customer.giver_native=None
                #     customer.member=None
                #     customer.member_name=None
                #     customer.name=None
                #     customer.address=None
                #     customer.save()
                # elif customer.income_type == "Sangam":

                #     customer.sangam=None
                #     customer.sangam_name=None
                #     customer.save()
                # elif customer.income_type == "Offering":
                #     print("jkhdfjd")
                #     customer.offering_type=None
                #     customer.festival=None
                #     customer.festival_name=None
                #     customer.save()
                # elif customer.income_type =="Others":
                #     customer.giver_native=None
                #     customer.member=None
                #     customer.member_name=None
                #     customer.name=None
                #     customer.address=None
                #     customer.sangam=None
                #     customer.sangam_name=None
                #     customer.offering_type=None
                #     customer.festival=None
                #     customer.festival_name=None
                #     customer.save()
                if customer.payment_mode == "Online":
                    customer.bank=None
                    customer.transaction_no=None
                    customer.transaction_date=None
                    customer.transaction_type=None
                    customer.bank_name=None
                    customer.bank_pay=None
                    customer.save()
                elif customer.payment_mode == "Offline":
                    if customer.transaction_type == "Cheque":
                        customer.transaction_no=None
                        customer.transaction_date=None
                        customer.cheque_no =None
                        customer.save()


                manage1=ManagementTreasure.objects.filter(management_profile=management)
                if manage1:
                    manage_get1=ManagementTreasure.objects.filter(management_profile=management).first()
                    
                    if bank_check != None:
                        manage_get1.bank_amt = float(manage_get1.bank_amt) - float(income_check)
                        manage_get1.save()
                        bank1=BankDetails.objects.get(id=bank_check.id)
                        bank1.credit_amt = float(bank1.credit_amt) - float(income_check)
                        bank1.save()
                    else:
                        print("jjjjjjjjjjjjjjjj")
                        manage_get1.cash_in_hand = float(manage_get1.cash_in_hand) - float(income_check)
                        manage_get1.save()
                
                try:
                    bank=request.data['bank']
                except Exception:
                    pass
                income_amt=request.data['income_amt']


                manage=ManagementTreasure.objects.filter(management_profile=management)
                if manage:
                    manage_get=ManagementTreasure.objects.filter(management_profile=management).first()
                    # print(temp_family.bank)
                    try:
                        if bank!= None:
                            manage_get.bank_amt = float(manage_get.bank_amt) + float(income_amt)
                            manage_get.save()
                            bank=BankDetails.objects.get(id=bank)
                            bank.credit_amt = float(bank.credit_amt) + float(income_amt)
                            bank.save()
                    except Exception:
                        print("uuuuuuuuuuuuuu")
                        print(manage_get.cash_in_hand)
                        # print(temp_family.income_amt)
                        manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(income_amt)
                        manage_get.save()
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                report_check=Report.objects.filter(incomes=pk)
                if report_check:
                    report_checks=Report.objects.filter(incomes=pk).first()
                    report_checks.amount=temp_family.income_amt
                    report_checks.incomes_id=pk
                    report_checks.banks=temp_family.bank
                    report_checks.type_choice="Addition"
                    report_checks.created_by=rejin.id
                    report_checks.management_profile=management
                    report_checks.members=temp_family.member
                    report_checks.save()                    
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':  
        if get_role=="User" and perm.income_edit ==True or get_role=="Admin" or rejin.is_superuser == True:   
            serializer876 = ADDIncomeDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                manage=ManagementTreasure.objects.filter(management_profile=management)
                if manage:
                    manage_get=ManagementTreasure.objects.filter(management_profile=management).first()
                    manage_get.cash_in_hand = float(manage_get.cash_in_hand) + float(temp_family.income_amt) - float(income)
                    manage_get.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.income_delete ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.income_edit ==True:  
            date_check=  (customer.date.month != datetime.now().month and customer.date.year != datetime.now().year)  or  (customer.date.month != datetime.now().month and customer.date.year == datetime.now().year)   or (customer.date.month == datetime.now().month and customer.date.year != datetime.now().year)     
            if date_check:
                return Response({'message':"Cannot be deleted as this transaction is done in past month"},status.HTTP_302_FOUND) 
                    
            manage1=ManagementTreasure.objects.filter(management_profile=management)
            if manage1:
                manage_get1=ManagementTreasure.objects.filter(management_profile=management).first()
                if customer.bank != None:
                    manage_get1.bank_amt = float(manage_get1.bank_amt) - float(income_check)
                    manage_get1.save()
                    bank1=BankDetails.objects.get(id=customer.bank.id)
                    bank1.credit_amt = float(bank1.credit_amt) - float(income_check)

                    bank1.save()
                else:
                    manage_get1.cash_in_hand = float(manage_get1.cash_in_hand) - float(income_check)
                    manage_get1.save()
            customer.delete()
            # manage=ManagementTreasure.objects.filter(management_profile=management)
            # if manage:
            #     manage_get=ManagementTreasure.objects.filter(management_profile=management).first()
            #     manage_get.cash_in_hand = float(manage_get.cash_in_hand) - float(income)
            #     manage_get.save()


        
            report_check=Report.objects.filter(incomes=pk)
            if report_check:
                report_checks=Report.objects.filter(incomes=pk).first()
                report_checks.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    





@api_view(['GET','POST'])
def income_details_filter(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
    
    if request.method == 'POST':
        jj=request.data['range']
        end_date=jj['end_date']
        start_date=jj['start_date']
        if start_date and end_date:
            start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
            our_family = ADDIncomeDetails.objects.filter(management_profile=management,date__gte=start_date_time_obj,date__lte=end_date_time_obj)
            serializer = ADDIncomeDetailsSerializer(our_family,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
            