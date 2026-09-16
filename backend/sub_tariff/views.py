from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import ADDSubscriptionTariffDetailseSerializer
from .models import ADDSubscriptionTariffDetails
from token_app.views import token_checking, generate_token
from user.models import User
import datetime
from datetime import date, timedelta
from management.models import ManagementDetails
from family.models import Member_Details
from amount.models import PeoplesAmountDetails
from permisions.models import Permisions
from collection.models import CollectionDetails
import calendar
from reports.models import TempleMemberReport

@api_view(['GET','POST'])
def add_tariff_details(request):
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
        
    if request.method =='POST': 
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sub_tarif_add ==True):
           
            now1 = datetime.datetime.now().date()    
            check_santha=ADDSubscriptionTariffDetails.objects.filter(action=True,to_date__gte=now1)  
            if check_santha:
                dict6={}
                dict6['message']= "Active Tariff is there"
                return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
                
            serializer876 = ADDSubscriptionTariffDetailseSerializer(data=request.data)
            if serializer876.is_valid():
                # start_date = request.data['from_date']
                # end_date = request.data['to_date']
                # subscription_tariff_instance1 = ADDSubscriptionTariffDetails.objects.filter(action=True,
                # management_profile=management,from_date__range=(start_date, end_date))
                # subscription_tariff_instance2 = ADDSubscriptionTariffDetails.objects.filter(action=True,
                # management_profile=management,to_date__range=(start_date, end_date))
                
                # if subscription_tariff_instance1 or subscription_tariff_instance2:
                #     dict611={}
                #     dict611['message']= "Tariff already added between this time period"
                #     return Response(dict611,status=status.HTTP_406_NOT_ACCEPTABLE)
                    
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                # temp_family.penalty_date =temp_family.penalty_date + timedelta (days=1)
                temp_family.save()
                # month=datetime.datetime.now().month               
                year=datetime.datetime.now().year
                # month_start = date(year, month, 1)
                month_list=datetime.datetime.now()
                # # starting_month = date(year, 1, 1).strftime('%m')
                # month_end =date(year, month, calendar.monthrange(year, month)[1])
                # temp_family.from_date=month_start
                # temp_family.to_date=month_end
                temp_family.subscription_no=f'{month_list.strftime("%b")}-{year}'
                temp_family.save()   

                get_tax_members=Member_Details.objects.filter(management_profile=management,member_tax_eligible=True,death=False,member_gender="Male")
                for mem_tax in get_tax_members:
                    people_amount=PeoplesAmountDetails.objects.create(total_bal_amt=temp_family.tariff_amount,created_by=rejin.id,management_profile=management,amount_balance=temp_family.tariff_amount,member=mem_tax,sub_tariff=temp_family,amount=temp_family.tariff_amount,name='Subscription Tariff')
                    if temp_family.exp_amount_type=="Amount":
                        people_amount.exception_amount=temp_family.exp_amount
                        people_amount.save()
                    elif temp_family.exp_amount_type=="Percentage":
                        amount_cal=temp_family.tariff_amount * (temp_family.exp_amount/100)
                        people_amount.exception_amount=amount_cal
                        people_amount.save()
                    if temp_family.penalty_amount_type=="Amount":
                        people_amount.penalty_amount=temp_family.penalty_amt
                        people_amount.save()
                    elif temp_family.penalty_amount_type=="Percentage":
                        amount_cal=temp_family.tariff_amount * (temp_family.penalty_amt/100)
                        people_amount.penalty_amount=amount_cal
                        people_amount.save()   


                    mem_report= TempleMemberReport.objects.filter(members=mem_tax)
                    if mem_report:
                        mem_report_obj= TempleMemberReport.objects.filter(members=mem_tax).last()
                        bal=float(mem_report_obj.balance_amt) + float(temp_family.tariff_amount)
                        tem_report=TempleMemberReport.objects.create(management_profile=management,members=mem_tax,sub_tariff=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.tariff_amount,balance_amt=bal,type_choice="subscription Tariff",created_by=rejin.id)
                    else:
                        tem_report=TempleMemberReport.objects.create(management_profile=management,members=mem_tax,sub_tariff=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.tariff_amount,balance_amt=temp_family.tariff_amount,type_choice="subscription Tariff",created_by=rejin.id)


                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to add sub tarif"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'GET':
        our_family = ADDSubscriptionTariffDetails.objects.filter(management_profile=management)
        serializer = ADDSubscriptionTariffDetailseSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_tariff_details(request,pk):
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

    try:
        customer = ADDSubscriptionTariffDetails.objects.get(pk=pk,management_profile=management)  
        cal_rep_amt=customer.tariff_amount
    except ADDSubscriptionTariffDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)    
    if request.method == 'GET':
        serializer = ADDSubscriptionTariffDetailseSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT': 
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sub_tarif_edit ==True):         
            take_action=customer.action 
            if not take_action:
                dict6={}
                dict6['message']= "This tariff is expired"
                return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE) 
            collection_check=CollectionDetails.objects.filter(sub_tariff_id=pk) 
            if customer.to_date<datetime.datetime.now().date():
                return Response({'message':"Cannot be edited as the end date is reached"},status.HTTP_302_FOUND)
            if collection_check:
                return Response({'message':"Cannot be edited"},status.HTTP_302_FOUND) 
            date_check=  (customer.created_at.date().month != datetime.datetime.now().month and customer.created_at.date().year != datetime.datetime.now().year)  or  (customer.created_at.date().month != datetime.datetime.now().month and customer.created_at.date().year == datetime.datetime.now().year)   or (customer.created_at.date().month == datetime.datetime.now().month and customer.created_at.date().year != datetime.datetime.now().year)     
            if date_check:
                return Response({'message':"Cannot be edited"},status.HTTP_302_FOUND)                       
            serializer876 = ADDSubscriptionTariffDetailseSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                # temp_family.penalty_date =temp_family.penalty_date + timedelta (days=1)

                temp_family.created_by=rejin.id
                temp_family.save()                
                try:                    
                    p_amt_obj=PeoplesAmountDetails.objects.filter(sub_tariff=customer)
                    for p_amt in p_amt_obj:
                        if p_amt.penalty:
                            to_date=request.data['to_date']
                            if customer.to_date < to_date:
                                p_amt.penalty=False
                                p_amt.amount=temp_family.tariff_amount
                                p_amt.created_by=rejin.id
                                p_amt.amount_balance=temp_family.tariff_amount
                                p_amt.total_bal_amt=temp_family.tariff_amount
                                p_amt.save()
                                if temp_family.exp_amount_type=="Amount":
                                    p_amt.exception_amount=temp_family.exp_amount
                                    p_amt.save()
                                elif temp_family.exp_amount_type=="Percentage":
                                    amount_cal=temp_family.tariff_amount * (temp_family.exp_amount/100)
                                    p_amt.exception_amount=amount_cal
                                    p_amt.save()
                                if temp_family.penalty_amount_type=="Amount":
                                    p_amt.penalty_amount=temp_family.penalty_amt
                                    p_amt.save()
                                elif temp_family.penalty_amount_type=="Percentage":
                                    amount_cal=temp_family.tariff_amount * (temp_family.penalty_amt/100)
                                    p_amt.penalty_amount=amount_cal
                                    p_amt.save()
                        else:
                            p_amt.amount=temp_family.tariff_amount
                            p_amt.created_by=rejin.id
                            p_amt.amount_balance=temp_family.tariff_amount
                            p_amt.total_bal_amt=temp_family.tariff_amount
                            p_amt.save()
                            if temp_family.exp_amount_type=="Amount":
                                p_amt.exception_amount=temp_family.exp_amount
                                p_amt.save()
                            elif temp_family.exp_amount_type=="Percentage":
                                amount_cal=temp_family.tariff_amount * (temp_family.exp_amount/100)
                                p_amt.exception_amount=amount_cal
                                p_amt.save()
                            if temp_family.penalty_amount_type=="Amount":
                                p_amt.penalty_amount=temp_family.penalty_amt
                                p_amt.save()
                            elif temp_family.penalty_amount_type=="Percentage":
                                amount_cal=temp_family.tariff_amount * (temp_family.penalty_amt/100)
                                p_amt.penalty_amount=amount_cal
                                p_amt.save()

                    
                    reports= TempleMemberReport.objects.filter(sub_tariff=temp_family)
                    if reports:
                        for mem_rep in reports:
                            mem_report= TempleMemberReport.objects.get(id=mem_rep.id)
                            if cal_rep_amt > temp_family.tariff_amount:
                                new_credit_amt=float(cal_rep_amt) - float(temp_family.tariff_amount)
                                mem_report.balance_amt = float(mem_report.balance_amt)-float(new_credit_amt)
                                mem_report.credit_amt = float(mem_report.credit_amt)- float(new_credit_amt)
                                mem_report.save()
                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                                for new_mem in  new_mem_report_obj:
                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                        new.balance_amt = float(new.balance_amt)-float(new_credit_amt)
                                        new.save()
                            elif cal_rep_amt < temp_family.tariff_amount:
                                new_credit_amt= float(temp_family.tariff_amount)-float(cal_rep_amt) 
                                mem_report.balance_amt = float(mem_report.balance_amt)+float(new_credit_amt)
                                mem_report.credit_amt = float(mem_report.credit_amt)+float(new_credit_amt)
                                mem_report.save()
                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                                for new_mem in  new_mem_report_obj:
                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                        new.balance_amt = float(new.balance_amt)+float(new_credit_amt)
                                        new.save()
                except Exception:
                    print('people amount geting error')                
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to add sub tarif"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH': 
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sub_tarif_edit ==True):          
            take_action=customer.action 
            if not take_action:
                dict6={}
                dict6['message']= "This tariff is expired"
                return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)  
            
            serializer876 = ADDSubscriptionTariffDetailseSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                try:
                    p_amt_obj=PeoplesAmountDetails.objects.filter(sub_tariff=customer)
                    for p_amt in p_amt_obj:
                        p_amt.amount=temp_family.tariff_amount
                        p_amt.save()
                except Exception:
                    print('people amount geting error')
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit sub tarif"},status.HTTP_401_UNAUTHORIZED)
                
    elif request.method == 'DELETE':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  (get_role=="User" and perm.sub_tarif_delete ==True):
            print(customer.from_date.month )
            # print(datetime.datetime.now().month)
            if customer.to_date<datetime.datetime.now().date():
                return Response({'message':"Cannot be deleted as the end date is reached"},status.HTTP_302_FOUND)
            collection_check=CollectionDetails.objects.filter(sub_tariff_id=pk) 
            if collection_check:
                return Response({'message':"Cannot be deleted as it is involved in transactions"},status.HTTP_302_FOUND)
            date_check=  (customer.created_at.date().month != datetime.datetime.now().month and customer.created_at.date().year != datetime.datetime.now().year)  or  (customer.created_at.date().month != datetime.datetime.now().month and customer.created_at.date().year == datetime.datetime.now().year)   or (customer.created_at.date().month == datetime.datetime.now().month and customer.created_at.date().year != datetime.datetime.now().year)     
            
            # date_check=  (customer.to_date.month != datetime.datetime.now().month and customer.to_date.year != datetime.datetime.now().year)  or  (customer.to_date.month != datetime.datetime.now().month and customer.to_date.year == datetime.datetime.now().year)   or (customer.to_date.month == datetime.datetime.now().month and customer.to_date.year != datetime.datetime.now().year)     
            if date_check:
                return Response({'message':"Cannot be deleted"},status.HTTP_302_FOUND)
            reports= TempleMemberReport.objects.filter(sub_tariff=customer)
            if reports:
                for mem_rep in reports:
                    mem_report= TempleMemberReport.objects.get(id=mem_rep.id)
                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                    for new_mem in  new_mem_report_obj:
                            new=TempleMemberReport.objects.get(id=new_mem.id)
                            new.balance_amt = float(new.balance_amt)-float(customer.tariff_amount)
                            new.save()
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        elif get_role=="Admin" or rejin.is_superuser == True :
            collection_check=CollectionDetails.objects.filter(sub_tariff_id=pk) 
            if collection_check:
                return Response({'message':"Cannot be deleted as it is involved in transactions"},status.HTTP_302_FOUND)
            # date_check=  (customer.to_date.month != datetime.datetime.now().month and customer.to_date.year != datetime.datetime.now().year)  or  (customer.to_date.month != datetime.datetime.now().month and customer.to_date.year == datetime.datetime.now().year)   or (customer.to_date.month == datetime.datetime.now().month and customer.to_date.year != datetime.datetime.now().year)     
            # if date_check:
            #     return Response({'message':"Cannot be deleted"},status.HTTP_302_FOUND)
            reports= TempleMemberReport.objects.filter(sub_tariff=customer)
            if reports:
                for mem_rep in reports:
                    mem_report= TempleMemberReport.objects.get(id=mem_rep.id)
                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                    for new_mem in  new_mem_report_obj:
                            new=TempleMemberReport.objects.get(id=new_mem.id)
                            new.balance_amt = float(new.balance_amt)-float(customer.tariff_amount)
                            new.save()
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response({'message':"User does not have permission to delete sub tarif"},status.HTTP_401_UNAUTHORIZED)
        