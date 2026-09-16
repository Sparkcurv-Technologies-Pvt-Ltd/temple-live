from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import ADDFestivalDetailsSerializer
from .models import ADDFestivalDetails
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from family.models import Member_Details
from amount.models import PeoplesAmountDetails
from permisions.models import Permisions
from datetime import timedelta, date
from collection.models import CollectionDetails
import datetime
from reports.models import TempleMemberReport


@api_view(['GET','POST'])
def add_festival_details(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    rejin=token_checking(request)
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
        if get_role=="User" and perm.festival_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            # penalty_start_date=request.data['penalty_start_date']
            start_date=request.data['start_date']
            end_date=request.data['end_date']
            # if start_date > end_date:
            #     return Response({'message': 'Start date cannot be greater than end date.'},status=status.HTTP_205_RESET_CONTENT)
            # start_date_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
            # end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
            # date_list = []
            # print(start_date_obj)
            # current_date = start_date_obj + timedelta(days=1)
            # while current_date <= end_date_obj:
            #     date_list.append(current_date.strftime("%Y-%m-%d"))
            #     current_date += timedelta(days=1)
            # print(date_list)
            # if penalty_start_date not in date_list:
            #     return Response({'message': 'Penalty Start date must be between start and end date.'},status=status.HTTP_303_SEE_OTHER)         

            serializer876 = ADDFestivalDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save() 
                end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
                print("uuuuuuuuuuuuuuu")
                print(end_date_obj)
                temp_family.penalty_start_date =  end_date_obj + timedelta(days=1) 
                print(temp_family.penalty_start_date)
                temp_family.save()                
                get_tax_members = Member_Details.objects.filter(
                    management_profile=management,
                    member_age__gte=18,
                    member_gender="Male"
                ).exclude(death=True)
                for mem_tax in get_tax_members:
                    try:
                        people_amount=PeoplesAmountDetails.objects.create(created_by=rejin.id,total_bal_amt=temp_family.tax_per_head,amount_balance=temp_family.tax_per_head,management_profile=management,member=mem_tax,festival=temp_family,amount=temp_family.tax_per_head,name='Festival')
                        if temp_family.choice=="Amount":
                            people_amount.penalty_amount=temp_family.penalty_amt
                            people_amount.save()
                        elif temp_family.choice=="Percentage":
                            amount_cal=temp_family.tax_per_head * (temp_family.penalty_amt/100)
                            people_amount.penalty_amount=amount_cal
                            people_amount.save()
                        mem_report= TempleMemberReport.objects.filter(members=mem_tax)
                        if mem_report:
                            mem_report_obj= TempleMemberReport.objects.filter(members=mem_tax).last()
                            bal=float(mem_report_obj.balance_amt) + float(temp_family.tax_per_head)
                            tem_report=TempleMemberReport.objects.create(management_profile=management,members=mem_tax,festivals=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.tax_per_head,balance_amt=bal,type_choice="Festival",created_by=rejin.id)
                        else:
                            tem_report=TempleMemberReport.objects.create(management_profile=management,members=mem_tax,festivals=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.tax_per_head,balance_amt=temp_family.tax_per_head,type_choice="Festival",created_by=rejin.id)
                    except Exception as e:
                        print(f'[festival] Skipped member id={mem_tax.id} name={mem_tax.member_name}: {e}')

                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        if get_role=="User" and perm.festival_add ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.festival_view ==True or get_role=="User" and perm.festival_edit==True or get_role=="User" and perm.festival_delete==True:
            our_family = ADDFestivalDetails.objects.filter(management_profile=management)
            serializer = ADDFestivalDetailsSerializer(our_family,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_festival_details(request,pk):
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
        customer = ADDFestivalDetails.objects.get(pk=pk)  
    except ADDFestivalDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ADDFestivalDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.festival_edit==True:
            if customer.end_date<=datetime.datetime.now().date():
                return Response({'message':"Cannot be edited as the end date is reached"},status.HTTP_302_FOUND)


            # penalty_start_date=request.data['penalty_start_date']
            start_date=request.data['start_date']
            end_date=request.data['end_date']
            # if start_date > end_date:
            #     return Response({'message': 'Start date cannot be greater than end date.'},status=status.HTTP_205_RESET_CONTENT)
            # start_date_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
            # end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
            # date_list = []
            # print(start_date_obj)
            # current_date = start_date_obj + timedelta(days=1)
            # while current_date <= end_date_obj:
            #     date_list.append(current_date.strftime("%Y-%m-%d"))
            #     current_date += timedelta(days=1)
            # print(date_list)
            # if penalty_start_date not in date_list:
            #     return Response({'message': 'Penalty Start date must be between start and end date.'},status=status.HTTP_303_SEE_OTHER) 
            collection_check=CollectionDetails.objects.filter(festivals_id=pk) 
            if collection_check:
                return Response({'message':"Cannot be edited as it is involved in transactions"},status.HTTP_302_FOUND)
            # date_check=  (customer.penalty_start_date.month != datetime.datetime.now().month and customer.penalty_start_date.year != datetime.datetime.now().year)  or  (customer.penalty_start_date.month != datetime.datetime.now().month and customer.penalty_start_date.year == datetime.datetime.now().year)   or (customer.penalty_start_date.month == datetime.datetime.now().month and customer.penalty_start_date.year != datetime.datetime.now().year)     
            date_check=  (customer.created_at.date().month != datetime.datetime.now().month and customer.created_at.date().year != datetime.datetime.now().year)  or  (customer.created_at.date().month != datetime.datetime.now().month and customer.created_at.date().year == datetime.datetime.now().year)   or (customer.created_at.date().month == datetime.datetime.now().month and customer.created_at.date().year != datetime.datetime.now().year)     
            
            if date_check:
                return Response({'message':"Cannot be edited"},status.HTTP_302_FOUND)
            
            serializer876 = ADDFestivalDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                cal_rep_amt=customer.tax_per_head
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                
                end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
                print("uuuuuuuuuuuuuuu")
                print(end_date_obj)
                temp_family.penalty_start_date =  end_date_obj + timedelta(days=1) 
                print(temp_family.penalty_start_date)
                temp_family.save() 
                                
                try:
                    p_amt_obj=PeoplesAmountDetails.objects.filter(festival=customer)
                    for p_amt in p_amt_obj:
                        p_amt.amount=temp_family.tax_per_head
                        p_amt.amount_balance=temp_family.tax_per_head
                        p_amt.total_bal_amt=temp_family.tax_per_head
                        p_amt.save()
                        if temp_family.choice=="Amount":
                            p_amt.penalty_amount=temp_family.penalty_amt                         

                            p_amt.save()
                        elif temp_family.choice=="Percentage":
                            amount_cal=temp_family.tax_per_head * (temp_family.penalty_amt/100)
                            p_amt.penalty_amount=amount_cal
                            p_amt.save()

                    reports= TempleMemberReport.objects.filter(festivals=temp_family)
                    if reports:
                        for mem_rep in reports:
                            mem_report= TempleMemberReport.objects.get(id=mem_rep.id)
                            if cal_rep_amt > temp_family.tax_per_head:
                                new_credit_amt=float(cal_rep_amt) - float(temp_family.tax_per_head)
                                mem_report.balance_amt = float(mem_report.balance_amt)-float(new_credit_amt)
                                mem_report.credit_amt = float(mem_report.credit_amt)- float(new_credit_amt)
                                mem_report.save()
                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                                for new_mem in  new_mem_report_obj:
                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                        new.balance_amt = float(new.balance_amt)-float(new_credit_amt)
                                        new.save()
                            elif cal_rep_amt < temp_family.tax_per_head:
                                new_credit_amt= float(temp_family.tax_per_head)-float(cal_rep_amt) 
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
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':
        if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.festival_edit==True:
            serializer876 = ADDFestivalDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()                
                try:
                    p_amt_obj=PeoplesAmountDetails.objects.filter(festival=customer)
                    for p_amt in p_amt_obj:
                        p_amt.amount=temp_family.tax_per_head
                        p_amt.save()
                except Exception:
                    print('people amount geting error')                    
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
            
    elif request.method == 'DELETE':
        if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.festival_edit or get_role=="User" and perm.festival_delete:
            if customer.end_date<=datetime.datetime.now().date():
                return Response({'message':"Cannot be deleted as the end date is reached"},status.HTTP_302_FOUND)
            collection_check=CollectionDetails.objects.filter(festivals_id=pk) 
            if collection_check:
                return Response({'message':"Cannot be deleted as it is involved in transactions"},status.HTTP_302_FOUND)
           
            reports= TempleMemberReport.objects.filter(festivals=customer)
            if reports:
                for mem_rep in reports:
                    mem_report= TempleMemberReport.objects.get(id=mem_rep.id)
                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                    for new_mem in  new_mem_report_obj:
                            new=TempleMemberReport.objects.get(id=new_mem.id)
                            new.balance_amt = float(new.balance_amt)-float(customer.tax_per_head)
                            new.save()
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        