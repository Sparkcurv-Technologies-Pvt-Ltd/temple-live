from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    ADDFundDetailsSerializer, ADDFundDetailsssssSerializer,
    ADDFundLeaseDetailsSerializer, FundGroupDetailsSerializer,
    FundGroupDetailsSerializer22, FundMemberDetailssSerializer,
    FundLeaseMemberDetailssSerializer,
)
from .models import (
    ADDFundDetails, FundGroupDetails, FundLeaseDetailss,
    FundMemberDetailss, FundLeaseMemberDetailss,
)
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
import datetime
from balancesheet.models import FundMembersBalanceSheet
from permisions.models import Permisions
from permisions.serializers import PermisionsSerializer
from collection.models import CollectionDetails
from collection.serializers import CollectionDetailsSerializer, coll_no
from treasure.models import ManagementTreasure
from reports.models import Report, FundMemberReport
from datetime import date
from reports.serializers import FundMemberReportSerializer

@api_view(['GET','POST'])
def add_fund_name_details(request):
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
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)    
        serializer876 = ADDFundDetailsSerializer(data=request.data)
 
        if (get_role=="User" and perm.fund_add ==True) or get_role=="Admin" or rejin.is_superuser == True or (get_role=="User" and perm.fund_view ==True) or (get_role=="User" and perm.fund_edit ==True):
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                if temp_family.fund_type=="Fund 20":
                    temp_family.fund_count=int(20)
                    temp_family.month_count=int(20)
                    temp_family.save()
                elif temp_family.fund_type=="Fund 21":
                    temp_family.fund_count=int(20)
                    temp_family.month_count=int(20)
                    temp_family.save()
                

                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)    
        return Response({'message':"User does not have permission to add fund"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'GET':
        our_family = ADDFundDetails.objects.filter(management_profile=management)
        serializer = ADDFundDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        

@api_view(['GET','POST'])
def fund_group_view_fundname(request):
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
    if request.method =='GET':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_add ==True):            
            our_family = ADDFundDetails.objects.filter(management_profile=management,action=True)
            serializer = ADDFundDetailsSerializer(our_family,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)       
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)



@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_fund_name_details(request,pk):
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
        customer = ADDFundDetails.objects.get(pk=pk,management_profile=management)  
    except ADDFundDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ADDFundDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':   
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)   
        serializer876 = ADDFundDetailsSerializer(customer,data=request.data)
        if (get_role=="User" and perm.fund_edit ==True) or get_role=="Admin" or rejin.is_superuser == True :

            if serializer876.is_valid():
                group=FundGroupDetails.objects.filter(fund=customer,management_profile=management).first()
                # sheet=CollectionDetails.objects.filter(funds=group,management_profile=management)
                lease_det=FundLeaseDetailss.objects.filter(fund_group=group,management_profile=management)
                if group  or lease_det:
                    return Response({"Message":"Can't be edited as the fund is Used"},status=status.HTTP_226_IM_USED)
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                if temp_family.fund_type=="Fund 20":
                    temp_family.fund_count=int(20)
                    temp_family.month_count=int(20)
                    temp_family.save()
                elif temp_family.fund_type=="Fund 21":
                    temp_family.fund_count=int(20)
                    temp_family.month_count=int(20)
                    temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit fund"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'PATCH':   
        serializer876 = ADDFundDetailsSerializer(customer,data=request.data,partial=True)
        if serializer876.is_valid():
            group=FundGroupDetails.objects.filter(fund=customer,management_profile=management).first()
            sheet=CollectionDetails.objects.filter(funds=group,management_profile=management)
            lease_det=FundLeaseDetailss.objects.filter(fund_group=group,management_profile=management)
            if group or sheet or lease_det:
                return Response({"Message":"Can't be edited as the fund is Used"},status=status.HTTP_226_IM_USED)
            temp_family=serializer876.save()
            temp_family.created_by=rejin.id
            temp_family.save()
            if temp_family.fund_type=="Fund 20":
                    temp_family.fund_count=int(20)
                    temp_family.month_count=int(20)
                    temp_family.save()
            elif temp_family.fund_type=="Fund 21":
                temp_family.fund_count=int(21)
                temp_family.month_count=int(21)
                temp_family.save()
            return Response(serializer876.data,status=status.HTTP_201_CREATED)
        else:
            return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
            
    elif request.method == 'DELETE':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_del ==True):
            group=FundGroupDetails.objects.filter(fund=customer,management_profile=management).first()
            # sheet=CollectionDetails.objects.filter(funds=group,management_profile=management)
            lease_det=FundLeaseDetailss.objects.filter(fund_group=group,management_profile=management)
            if group or lease_det:
                return Response({"Message":"Can't be deleted as the fund is Used"},status=status.HTTP_226_IM_USED)           
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"User does not have permission to delete fund"},status.HTTP_401_UNAUTHORIZED)

   
@api_view(['GET','POST'])
def get_fund_groups(request):
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
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_add ==True):
            fund=request.data['fund']
            fund_details=ADDFundDetails.objects.get(id=fund)
            serializer=ADDFundDetailsSerializer(fund_details)
            return Response(serializer.data,status=status.HTTP_201_CREATED)        
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)


          

@api_view(['GET','POST'])
def add_fund_groups(request):
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
        serializer876 = FundGroupDetailsSerializer(data=request.data)
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id) 
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_add ==True):
         
            if serializer876.is_valid():
                fund=request.data['fund']
                # member_count=request.data['']
                fund_details=ADDFundDetails.objects.get(id=fund)
                if fund_details.fund_type=="Fund 21":                    
                    temp_family=serializer876.save()
                    print(temp_family)
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=management
                    temp_family.save()
                    fund_grp_members_save=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True)
                    for i in fund_grp_members_save:
                        i.management_profile=temp_family.management_profile
                        i.created_by=temp_family.created_by
                        i.save()     


                    fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                    temp_family.members_count=fund_grp_members
                    temp_family.save()
                    fixed_fund_amount=request.data['fixed_fund_amount']
                    amount_per_head=fixed_fund_amount/(temp_family.members_count)
                    temp_family.per_head_collection_amount=amount_per_head
                    temp_family.save()
                    fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                    for mem in fund_mem_pro:                        
                        set_fund=FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                                                fund=temp_family,credit_amt=amount_per_head,debit_amt=amount_per_head) 
                        FundMemberReport.objects.create(management_profile=temp_family.management_profile,balancesheet=set_fund,fund=temp_family,fund_m=mem,
                                          reportdate=datetime.datetime.now().date(),credit_amt= amount_per_head,debit_amt=amount_per_head,type_choice="Fund Initial",created_by=rejin.id)                       
                        CollectionDetails.objects.create(fund_name=fund_details.fund_type,transaction_date=datetime.datetime.now().date(),member_name=mem.member_name,mobile_number=mem.mobile_no,created_by=rejin.id,bill_by_name=rejin.username,fund_type="Initial",pay_date=datetime.datetime.now().date(),transaction_type="Cash",amount=temp_family.per_head_collection_amount,management_profile=temp_family.management_profile,collaction_no=coll_no(),collection_category="Fund",funds=temp_family,fund_member=mem)                      

                    # mem.save() 
                    treasure_check=ManagementTreasure.objects.filter(management_profile=temp_family.management_profile).first()
                    treasure_check.cash_in_hand += temp_family.fixed_fund_amount
                    treasure_check.save() 
                    Report.objects.create(fund_m=temp_family,management_profile=temp_family.management_profile,created_by=temp_family.created_by,type_choice="Addition",amount=temp_family.fixed_fund_amount)
                    # return Response(serializer876.data,status=status.HTTP_201_CREATED)
                
                elif fund_details.fund_type=="Fund 20":
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=management
                    temp_family.save() 
                    fund_grp_members_save=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True)
                    for i in fund_grp_members_save:
                        i.management_profile=temp_family.management_profile
                        i.created_by=temp_family.created_by
                        i.save()                    
                    fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                    temp_family.members_count=fund_grp_members
                    temp_family.save()
                    fixed_fund_amount=request.data['fixed_fund_amount']
                    amount_per_head=float(fixed_fund_amount)/int(fund_details.fund_count)
                    temp_family.per_head_collection_amount=amount_per_head
                    temp_family.save()
                    fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                    for mem in fund_mem_pro:
                        
                        set1=FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                                                fund=temp_family,credit_amt=amount_per_head,debit_amt=amount_per_head) 
                        FundMemberReport.objects.create(management_profile=temp_family.management_profile,balancesheet=set1,fund=temp_family,fund_m=mem,
                                          reportdate=datetime.datetime.now().date(),credit_amt= amount_per_head,debit_amt=amount_per_head,type_choice="Fund Initial",created_by=rejin.id)                                              
                        CollectionDetails.objects.create(fund_name=fund_details.fund_type,transaction_date=datetime.datetime.now().date(),member_name=mem.member_name,mobile_number=mem.mobile_no,created_by=rejin.id,bill_by_name=rejin.username,fund_type="Initial",amount=temp_family.per_head_collection_amount,management_profile=temp_family.management_profile,collaction_no=coll_no(),collection_category="Fund",funds=temp_family,fund_member=mem)                      

                    # mem.save()                        
                    # Report.objects.create(fund_m=temp_family,management_profile=temp_family.management_profile,created_by=temp_family.created_by,type_choice="Addition",amount=temp_family.fixed_fund_amount)
                    available_amount=amount_per_head*temp_family.members_count
                    temp_family.cash_available_amount +=available_amount
                    temp_family.save() 
                elif fund_details.fund_type=="Normal":
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=management
                    temp_family.save()
                    fund_grp_members_save=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True)
                    for i in fund_grp_members_save:
                        i.management_profile=temp_family.management_profile
                        i.created_by=temp_family.created_by
                        i.save()
                    fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                    temp_family.members_count=fund_grp_members
                    temp_family.save()
                    fixed_fund_amount=request.data['fixed_fund_amount']
                    fixed_fund_count=request.data['fixed_fund_count']
                    amount_per_head=float(fixed_fund_amount)/int(fixed_fund_count)
                    temp_family.per_head_collection_amount=amount_per_head
                    temp_family.save()
                    fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                    for mem in fund_mem_pro:
                        
                        set1=FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                                                fund=temp_family,credit_amt=amount_per_head,debit_amt=amount_per_head) 
                        FundMemberReport.objects.create(management_profile=temp_family.management_profile,balancesheet=set1,fund=temp_family,fund_m=mem,
                                          reportdate=datetime.datetime.now().date(),credit_amt= amount_per_head,debit_amt=amount_per_head,type_choice="Fund Initial",created_by=rejin.id)
                        CollectionDetails.objects.create(fund_name=fund_details.fund_type,transaction_date=datetime.datetime.now().date(),member_name=mem.member_name,mobile_number=mem.mobile_no,created_by=rejin.id,bill_by_name=rejin.username,fund_type="Initial",pay_date=datetime.datetime.now().date(),transaction_type="Cash",amount=temp_family.per_head_collection_amount,management_profile=temp_family.management_profile,collaction_no=coll_no(),collection_category="Fund",funds=temp_family,fund_member=mem)                      
                                                                      
                    # mem.save() 
                    print(type(temp_family.cash_available_amount ))  
                    print(temp_family.cash_available_amount )   
                    print(temp_family.fixed_fund_amount) 
                    print(type(temp_family.fixed_fund_amount))                 
                    temp_family.cash_available_amount = float(temp_family.cash_available_amount) + float(temp_family.fixed_fund_amount)
                    temp_family.save()
                fund_details.action=False
                fund_details.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)

                
                
                
                
                # member_count=request.data['member_count']
                # fund=request.data['fund']
                # fund_details=ADDFundDetails.objects.get(id=fund)
                # if fund_details.fund_count >= member_count:
                #     return Response({'message':"Limit Member"},status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
                # elif fund_details.fund_count-1 == member_count:
                #     if fund_details.fund_type=="Fund 21":
                #         temp_family=serializer876.save()
                #         temp_family.created_by=rejin.id
                #         temp_family.management_profile=management
                #         temp_family.save()                    
                #         fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                #         temp_family.members_count=fund_grp_members
                #         temp_family.save()
                #         fixed_fund_amount=request.data['fixed_fund_amount']
                #         amount=fixed_fund_amount/member_count

                #         fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                #         for mem in fund_mem_pro:
                #             mem.management_profile=management
                #             FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                #                                     fund=temp_family,credit_amt=amount)

                        
                #         # kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
                #         # if mem.nominee_apply==False:
                #         #     mem.nominee_person_type='Member'
                #         #     mem.nominee_member=
                #         #     mem.nominee_member_no=
                #         #     mem.nominee_member=
                #         #     mem.nominee_mobile_no=
                #         #     mem.nominee_address=                            
                #         mem.save()                        
                #         return Response(serializer876.data,status=status.HTTP_201_CREATED)
                #     else:
                #         temp_family=serializer876.save()
                #         temp_family.created_by=rejin.id
                #         temp_family.management_profile=management
                #         temp_family.save()                    
                #         fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                #         temp_family.members_count=fund_grp_members
                #         temp_family.save()
                #         # fixed_fund_amount=request.data['fixed_fund_amount']
                #         # amount=fixed_fund_amount/member_count

                #         fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                #         for mem in fund_mem_pro:
                #             mem.management_profile=management
                #             FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                #                                     fund=temp_family)

                        
                #         # kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
                #         # if mem.nominee_apply==False:
                #         #     mem.nominee_person_type='Member'
                #         #     mem.nominee_member=
                #         #     mem.nominee_member_no=
                #         #     mem.nominee_member=
                #         #     mem.nominee_mobile_no=
                #         #     mem.nominee_address=                            
                #         mem.save()                        
                #         return Response(serializer876.data,status=status.HTTP_201_CREATED)

                # else:
                #     return Response({'message':"Add More Members"},status=status.HTTP_300_MULTIPLE_CHOICES)    
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to add fund"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'GET':
        our_family = FundGroupDetails.objects.all()
        serializer = FundGroupDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_fund_groups(request,pk):
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
        customer = FundGroupDetails.objects.get(pk=pk) 
        head_amount= customer.fixed_fund_amount
        head_count=customer.fund.fund_count
        mem_count=customer.members_count
    except FundGroupDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = FundGroupDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':   
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_edit ==True):
     
            serializer876 = FundGroupDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                
                sheet=CollectionDetails.objects.filter(funds=pk,fund_type=None)
                print(sheet)
                if sheet:
               
                        return Response({"Message":"Can't be edited as the amount is collected"},status=status.HTTP_226_IM_USED)
                lease_det=FundLeaseDetailss.objects.filter(fund_group=pk)
                if lease_det:
                    return Response({"Message":"Can't be edited as it is added to lease"},status=status.HTTP_226_IM_USED)
                
                fund=request.data['fund']
                fund_details=ADDFundDetails.objects.filter(id=fund).first()
                
                if fund_details.fund_type=="Fund 21":
                        treasure_check_first=ManagementTreasure.objects.filter(management_profile=customer.management_profile).first()
                        treasure_check_first.cash_in_hand -= head_amount
                        treasure_check_first.save()
                        # fund_member=FundMemberDetailss.objects.filter(fund_group_id=pk)
                        # for i in fund_member:
                        #     i.delete()
                        temp_family=serializer876.save()
                        temp_family.created_by=rejin.id
                        temp_family.management_profile=management
                        temp_family.save()                    
                        fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                        temp_family.members_count=fund_grp_members
                        temp_family.save()
                        fund_grp_members_save=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True)
                        for i in fund_grp_members_save:
                            i.management_profile=temp_family.management_profile
                            i.created_by=temp_family.created_by
                            i.save() 

                        fixed_fund_amount=request.data['fixed_fund_amount']
                        amount_per_head=float(fixed_fund_amount)/(int(temp_family.members_count))
                        temp_family.per_head_collection_amount=amount_per_head
                        temp_family.save()
                        fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                        print("uuuuuuuuuu")
                        print(fund_mem_pro)
                        for mem in fund_mem_pro: 
                            member_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=temp_family,management_profile=temp_family.management_profile)
                            if member_check:
                                member_check_get=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=temp_family,management_profile=temp_family.management_profile).first()
                                member_check_get.credit_amt = amount_per_head
                                member_check_get.debit_amt = amount_per_head
                                member_check_get.save()
                                report_check11=FundMemberReport.objects.filter(balancesheet=member_check_get,fund=temp_family,fund_m=mem,management_profile=temp_family.management_profile)
                                if report_check11:
                                    report_check_update=FundMemberReport.objects.filter(balancesheet=member_check_get,fund=temp_family,fund_m=mem,management_profile=temp_family.management_profile).first()
                                    report_check_update.credit_amt=amount_per_head
                                    report_check_update.debit_amt=amount_per_head
                                    report_check_update.type_choice="Fund Initial"
                                    report_check_update.balancesheet=member_check_get
                                    report_check_update.fund=temp_family
                                    report_check_update.fund_m=mem
                                    report_check_update.save()
                                collection_check=CollectionDetails.objects.filter(management_profile=temp_family.management_profile,collection_category="Fund",funds=temp_family,fund_member=mem)
                                if collection_check:
                                    coll_mem=CollectionDetails.objects.filter(management_profile=temp_family.management_profile,collection_category="Fund",funds=temp_family,fund_member=mem).first()
                                    coll_mem.amount=temp_family.per_head_collection_amount
                                    coll_mem.pay_date=datetime.datetime.now().date()
                                    coll_mem.transaction_date=datetime.datetime.now().date()
                                    coll_mem.fund_name=fund_details.fund_type
                                    coll_mem.save()

                            else:
                                settingsss=FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                                                    fund=temp_family,credit_amt=amount_per_head,debit_amt=amount_per_head)                                                                

                                FundMemberReport.objects.create(management_profile=temp_family.management_profile,balancesheet=settingsss,fund=temp_family,fund_m=mem,
                                          reportdate=datetime.datetime.now().date(),credit_amt= amount_per_head,debit_amt=amount_per_head,type_choice="Fund Initial",created_by=rejin.id)                                              
                        
                                CollectionDetails.objects.create(fund_name=fund_details.fund_type,transaction_date=datetime.datetime.now().date(),member_name=mem.member_name,mobile_number=mem.mobile_no,created_by=rejin.id,bill_by_name=rejin.username,fund_type="Initial",pay_date=datetime.datetime.now().date(),transaction_type="Cash",amount=temp_family.per_head_collection_amount,management_profile=temp_family.management_profile,collaction_no=coll_no(),collection_category="Fund",funds=temp_family,fund_member=mem)                      
                                
                        treasure_check=ManagementTreasure.objects.filter(management_profile=temp_family.management_profile).first()
                        treasure_check.cash_in_hand += temp_family.fixed_fund_amount
                        treasure_check.save()
                        report_check=Report.objects.filter(fund_m=temp_family,management_profile=temp_family.management_profile,type_choice="Addition").first()  
                        report_check.amount=temp_family.fixed_fund_amount
                        report_check.created_by=temp_family.created_by
                        report_check.save()
                        
                        # kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
                        # if mem.nominee_apply==False:
                        #     mem.nominee_person_type='Member'
                        #     mem.nominee_member=
                        #     mem.nominee_member_no=
                        #     mem.nominee_member=
                        #     mem.nominee_mobile_no=
                        #     mem.nominee_address=                            
                                               
                        return Response(serializer876.data,status=status.HTTP_201_CREATED)
                
                elif fund_details.fund_type=="Fund 20":
                        reduced_cal=float(head_amount)/int(head_count)
                        available_amount_reduction=reduced_cal*mem_count
                        customer.cash_available_amount = float(customer.cash_available_amount) - float(available_amount_reduction)
                        customer.save() 
                        temp_family=serializer876.save()
                        temp_family.created_by=rejin.id
                        temp_family.management_profile=management
                        temp_family.save()                    
                        fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                        temp_family.members_count=fund_grp_members
                        temp_family.save()
                        fund_grp_members_save=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True)
                        for i in fund_grp_members_save:
                            i.management_profile=temp_family.management_profile
                            i.created_by=temp_family.created_by
                            i.save()
                        fixed_fund_amount=request.data['fixed_fund_amount']
                        amount_per_head=float(fixed_fund_amount)/(int(fund_details.fund_count))
                        temp_family.per_head_collection_amount=amount_per_head
                        temp_family.save()
                        # fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                        print("uuuuuuuuuu") 
                        # fixed_fund_amount=request.data['fixed_fund_amount']
                        # amount=fixed_fund_amount/member_count

                        fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                        for mem in fund_mem_pro:
                            member_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=temp_family,management_profile=temp_family.management_profile)
                            if member_check:
                                member_check_get=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=temp_family,management_profile=temp_family.management_profile).first()
                                member_check_get.credit_amt = amount_per_head
                                member_check_get.debit_amt = amount_per_head
                                member_check_get.save()
                                report_check11=FundMemberReport.objects.filter(balancesheet=member_check_get,fund=temp_family,fund_m=mem,management_profile=temp_family.management_profile)
                                if report_check11:
                                    report_check_update=FundMemberReport.objects.filter(balancesheet=member_check_get,fund=temp_family,fund_m=mem,management_profile=temp_family.management_profile).first()
                                    report_check_update.credit_amt=amount_per_head
                                    report_check_update.debit_amt=amount_per_head
                                    report_check_update.type_choice="Fund Initial"
                                    report_check_update.balancesheet=member_check_get
                                    report_check_update.fund=temp_family
                                    report_check_update.fund_m=mem
                                    report_check_update.save()
                                collection_check=CollectionDetails.objects.filter(management_profile=temp_family.management_profile,collection_category="Fund",funds=temp_family,fund_member=mem)
                                if collection_check:
                                    coll_mem=CollectionDetails.objects.filter(management_profile=temp_family.management_profile,collection_category="Fund",funds=temp_family,fund_member=mem).first()
                                    coll_mem.amount=temp_family.per_head_collection_amount
                                    coll_mem.pay_date=datetime.datetime.now().date()
                                    coll_mem.transaction_date=datetime.datetime.now().date()
                                    coll_mem.fund_name=fund_details.fund_type
                                    coll_mem.save()

                            else:
                                settingsss=FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                                                    fund=temp_family,credit_amt=amount_per_head,debit_amt=amount_per_head) 
                                FundMemberReport.objects.create(management_profile=temp_family.management_profile,balancesheet=settingsss,fund=temp_family,fund_m=mem,
                                          reportdate=datetime.datetime.now().date(),credit_amt= amount_per_head,debit_amt=amount_per_head,type_choice="Fund Initial",created_by=rejin.id)                                              
                    # mem.save()                        
                                CollectionDetails.objects.create(fund_name=fund_details.fund_type,transaction_date=datetime.datetime.now().date(),member_name=mem.member_name,mobile_number=mem.mobile_no,created_by=rejin.id,bill_by_name=rejin.username,fund_type="Initial",pay_date=datetime.datetime.now().date(),transaction_type="Cash",amount=temp_family.per_head_collection_amount,management_profile=temp_family.management_profile,collaction_no=coll_no(),collection_category="Fund",funds=temp_family,fund_member=mem)                      

                        available_amount=amount_per_head*temp_family.members_count
                        temp_family.cash_available_amount +=available_amount
                        temp_family.save()
                elif fund_details.fund_type=="Normal":
                    customer.cash_available_amount -= head_amount
                    customer.save()
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=management
                    temp_family.save()
                    fund_grp_members_save=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True)
                    for i in fund_grp_members_save:
                        i.management_profile=temp_family.management_profile
                        i.created_by=temp_family.created_by
                        i.save()
                    fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                    temp_family.members_count=fund_grp_members
                    temp_family.save()
                    fixed_fund_amount=request.data['fixed_fund_amount']
                    fixed_fund_count=request.data['fixed_fund_count']
                    amount_per_head=float(fixed_fund_amount)/int(fixed_fund_count)
                    temp_family.per_head_collection_amount=amount_per_head
                    temp_family.save()
                    fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                    for mem in fund_mem_pro:
                        member_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=temp_family,management_profile=temp_family.management_profile)
                        if member_check:
                            member_check_get=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=temp_family,management_profile=temp_family.management_profile).first()
                            member_check_get.credit_amt = amount_per_head
                            member_check_get.debit_amt = amount_per_head
                            member_check_get.save()
                            report_check11=FundMemberReport.objects.filter(balancesheet=member_check_get,fund=temp_family,fund_m=mem,management_profile=temp_family.management_profile)
                            if report_check11:
                                report_check_update=FundMemberReport.objects.filter(balancesheet=member_check_get,fund=temp_family,fund_m=mem,management_profile=temp_family.management_profile).first()
                                report_check_update.credit_amt=amount_per_head
                                report_check_update.debit_amt=amount_per_head
                                report_check_update.type_choice="Fund Initial"
                                report_check_update.balancesheet=member_check_get
                                report_check_update.fund=temp_family
                                report_check_update.fund_m=mem
                                report_check_update.save()
                            collection_check=CollectionDetails.objects.filter(management_profile=temp_family.management_profile,collection_category="Fund",funds=temp_family,fund_member=mem)
                            if collection_check:
                                coll_mem=CollectionDetails.objects.filter(management_profile=temp_family.management_profile,collection_category="Fund",funds=temp_family,fund_member=mem).first()
                                coll_mem.amount=temp_family.per_head_collection_amount
                                coll_mem.pay_date=datetime.datetime.now().date()
                                coll_mem.transaction_date=datetime.datetime.now().date()
                                coll_mem.fund_name=fund_details.fund_type
                                coll_mem.save()

                        else:
                            settingsss=FundMembersBalanceSheet.objects.create(fund_m=mem,management_profile=temp_family.management_profile,
                                                fund=temp_family,credit_amt=amount_per_head,debit_amt=amount_per_head) 
                            FundMemberReport.objects.create(management_profile=temp_family.management_profile,balancesheet=settingsss,fund=temp_family,fund_m=mem,
                                        reportdate=datetime.datetime.now().date(),credit_amt= amount_per_head,debit_amt=amount_per_head,type_choice="Fund Initial",created_by=rejin.id) 
                    
                            CollectionDetails.objects.create(fund_name=fund_details.fund_type,transaction_date=datetime.datetime.now().date(),member_name=mem.member_name,mobile_number=mem.mobile_no,created_by=rejin.id,bill_by_name=rejin.username,fund_type="Initial",pay_date=datetime.datetime.now().date(),transaction_type="Cash",amount=temp_family.per_head_collection_amount,management_profile=temp_family.management_profile,collaction_no=coll_no(),collection_category="Fund",funds=temp_family,fund_member=mem)                      

                    temp_family.cash_available_amount +=temp_family.fixed_fund_amount
                    temp_family.save()
                fund_details.action=False
                fund_details.save()
                        # kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
                        # if mem.nominee_apply==False:
                        #     mem.nominee_person_type='Member'
                        #     mem.nominee_member=
                        #     mem.nominee_member_no=
                        #     mem.nominee_member=
                        #     mem.nominee_mobile_no=
                        #     mem.nominee_address=                            
                       
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
                              
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit fund"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':   
        serializer876 = FundGroupDetailsSerializer(customer,data=request.data,partial=True)
        if serializer876.is_valid():
            member_count=request.data['member_count']
            fund=request.data['fund']
            fund_details=ADDFundDetails.objects.get(id=fund)
            if fund_details.fund_count >= member_count:
                return Response({'message':"Limit Member"},status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
            elif fund_details.fund_count-1 == member_count:

                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                # temp_family.management_profile=management
                temp_family.save()
                
                fund_grp_members=FundMemberDetailss.objects.filter(fund_group=temp_family,action=True).count()
                temp_family.members_count=fund_grp_members
                temp_family.save()
                
                fund_mem_pro=FundMemberDetailss.objects.filter(fund_group=temp_family)
                for mem in fund_mem_pro:
                    # mem.management_profile=management
                    # kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
                    # if mem.nominee_apply==False:
                    #     mem.nominee_person_type='Member'
                    #     mem.nominee_member=
                    #     mem.nominee_member_no=
                    #     mem.nominee_member=
                    #     mem.nominee_mobile_no=
                    #     mem.nominee_address=
                        
                    mem.save()
                    return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response({'message':"Add More Members"},status=status.HTTP_300_MULTIPLE_CHOICES)            
        else:
            return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
            
    elif request.method == 'DELETE':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_del ==True):
            sheet=CollectionDetails.objects.filter(funds=pk,fund_type=None)
            if sheet:
                return Response({"Message":"Can't be deleted as the amount is collected"},status=status.HTTP_226_IM_USED)
            lease_det=FundLeaseDetailss.objects.filter(fund_group=pk)
            if lease_det:
                return Response({"Message":"Can't be deleted as it is added to lease"},status=status.HTTP_226_IM_USED) 
            if customer.fund.fund_type=="Fund 21":
                treasure_check_first=ManagementTreasure.objects.filter(management_profile=customer.management_profile).first()
                treasure_check_first.cash_in_hand -= head_amount
                treasure_check_first.save()                   
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"User does not have permission to delete fund"},status.HTTP_401_UNAUTHORIZED)
    
    
@api_view(['GET','POST'])
def fund_lease_details(request):
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
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_add ==True):
           
        
            f_group=request.data['fund_group'] 
            print(f_group)              
            this_month=datetime.datetime.now().month
            print(this_month)
            this_year=datetime.datetime.now().year
            print(this_year)
            check_lease_obj=FundLeaseDetailss.objects.filter(fund_group=f_group,management_profile=management,lease_date__month=this_month,lease_date__year=this_year)
            if check_lease_obj:
                print("uuuuuuuuu")
                return Response({"Message":"Lease process is already entered this month"},status=status.HTTP_226_IM_USED)
          
                
            serializer876 = ADDFundLeaseDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                
                fund_group=request.data['fund_group']               
                fund_check=FundGroupDetails.objects.filter(id=fund_group).first()
                complete_last=FundLeaseDetailss.objects.filter(fund_group=fund_check,management_profile=management)
                if complete_last:
                    complete_last_take=FundLeaseDetailss.objects.filter(fund_group=fund_check,management_profile=management).last()
                    if complete_last_take.finished ==False:
                        return Response({"Message":"Fund lease cannot be settled before settling the previous one"},status=status.HTTP_226_IM_USED) 
                
                if fund_check.fund.fund_type=="Fund 21": 
                    if fund_check.fund.fund_count ==0:
                        return Response({"Message":"This fund already completed cannot be added"},status=status.HTTP_226_IM_USED)                
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=management
                    temp_family.save() 
                    fund_groups=FundGroupDetails.objects.filter(id=temp_family.fund_group_id).first()
                    fund_groups.cash_lease_amount += temp_family.fund_lease_amount
                    fund_groups.save() 
                    # fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    # for mem in fund_mem_pro:
                    #     print(mem)
                    take_mem=FundMemberDetailss.objects.filter(fund_group=fund_groups)
                    for mem in take_mem:
                        balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups)
                        # balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem)
                        if balance_check:
                            balance_last=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups).first()
                            balance_last.credit_amt += temp_family.per_head_collection_amount
                            balance_last.balance_amt += temp_family.per_head_collection_amount
                            balance_last.save()
                            mem_report_check=FundMemberReport.objects.filter(balancesheet=balance_last,fund=temp_family.fund_group,
                                                            fund_m=mem)
                            if mem_report_check:
                                bala_lst=FundMemberReport.objects.filter(balancesheet=balance_last,fund=temp_family.fund_group,
                                                            fund_m=mem).last()
                                take_last_balance=bala_lst.balance_amt
                                calculating_last_balance=take_last_balance + (temp_family.per_head_collection_amount)
                                FundMemberReport.objects.create(type_choice="Fund Lease",created_by=rejin.id,balancesheet=balance_last,fund_m=mem,management_profile=temp_family.management_profile,
                                                    reportdate=datetime.datetime.now().date(),fund=fund_check,credit_amt=temp_family.per_head_collection_amount,balance_amt=calculating_last_balance)
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    for ssss in fund_mem_pro:
                    
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                        chane.lease_completed_colour_change=True
                        chane.lease=True
                        # chane.le
                        chane.save()
                elif fund_check.fund.fund_type=="Fund 20": 
                    if fund_check.fund.fund_count ==0:
                        return Response({"Message":"This fund already completed cannot be added"},status=status.HTTP_226_IM_USED) 
                    
                    temp_family=serializer876.save()
                    print(request.data)
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=management
                    temp_family.save()
                    fund_groups=FundGroupDetails.objects.filter(id=temp_family.fund_group_id).first()
                    fund_groups.cash_lease_amount += temp_family.fund_lease_amount
                    fund_groups.save() 
                    # fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    # for mem in fund_mem_pro:
                    #     print(mem)
                    take_mem=FundMemberDetailss.objects.filter(fund_group=fund_groups)
                    for mem in take_mem:   
                        balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups)
                        # balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem)
                        if balance_check:
                            balance_last=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups).first()
                            balance_last.credit_amt += temp_family.per_head_collection_amount
                            balance_last.balance_amt += temp_family.per_head_collection_amount
                            balance_last.save()
                            mem_report_check=FundMemberReport.objects.filter(balancesheet=balance_last,fund=temp_family.fund_group,
                                                            fund_m=mem)
                            if mem_report_check:
                                bala_lst=FundMemberReport.objects.filter(balancesheet=balance_last,fund=temp_family.fund_group,
                                                            fund_m=mem).last()
                                take_last_balance=bala_lst.balance_amt
                                calculating_last_balance=take_last_balance + (temp_family.per_head_collection_amount)
                                FundMemberReport.objects.create(type_choice="Fund Lease",created_by=rejin.id,balancesheet=balance_last,fund_m=mem,management_profile=temp_family.management_profile,
                                                    reportdate=datetime.datetime.now().date(),fund=fund_check,credit_amt=temp_family.per_head_collection_amount,balance_amt=calculating_last_balance)
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    for ssss in fund_mem_pro:
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                        chane.lease=True
                        chane.lease_completed_colour_change=True

                        chane.save()
                elif fund_check.fund.fund_type=="Normal": 
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=management                    
                    temp_family.save()
                    lease_taken=FundLeaseMemberDetailss.objects.filter(flease=temp_family).count()
                    temp_family.multiplied_commission_amount = (temp_family.commission_amount)*lease_taken
                    temp_family.save()
                    group_check=FundGroupDetails.objects.filter(id=temp_family.fund_group_id).first()
                    red_cal=group_check.per_head_collection_amount
                    # print(red_cal)
                    group_check.cash_lease_amount += (temp_family.fund_lease_amount)
                    group_check.leased_members_count += lease_taken
                    group_check.save()                 
                    
                    take_mem=FundMemberDetailss.objects.filter(fund_group=group_check)
                    print("yyyyyyy")
                    print(take_mem)
                    for mem in take_mem:
                        balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=group_check)
                        if balance_check:
                            balance_last=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=group_check).first()
                            # for summer in balance_last:
                            balance_last.credit_amt += red_cal
                            balance_last.balance_amt += red_cal
                            balance_last.save()
                            mem_report_check=FundMemberReport.objects.filter(balancesheet=balance_last,fund=temp_family.fund_group,
                                                            fund_m=mem)
                            if mem_report_check:
                                print("gggggggggggggggggggg")
                                bala_lst=FundMemberReport.objects.filter(balancesheet=balance_last,fund=temp_family.fund_group,fund_m=mem).last()
                                print(bala_lst)
                                take_last_balance=bala_lst.balance_amt
                                calculating_last_balance=take_last_balance + red_cal
                                FundMemberReport.objects.create(type_choice="Fund Lease",created_by=rejin.id,balancesheet=balance_last,fund_m=mem,management_profile=temp_family.management_profile,
                                                    reportdate=datetime.datetime.now().date(),fund=fund_check,credit_amt=red_cal,balance_amt=calculating_last_balance)
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    for ssss in fund_mem_pro:
                        print("uuuuuuuuuuuuuu")
                        print(ssss.fund_mem_id)
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                        chane.lease=True
                        chane.lease_completed_colour_change=True
                        chane.save()
                
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to add fund lease"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'GET':
        our_family = FundLeaseDetailss.objects.filter(management_profile=management).exclude(fund_group__fund__fund_type="Normal")
        serializer = ADDFundLeaseDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK) 
    


@api_view(['GET'])
def lease_normal_view(request):
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
        our_family = FundLeaseDetailss.objects.filter(management_profile=management,fund_group__fund__fund_type="Normal")
        serializer = ADDFundLeaseDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_fund_lease_details(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    try:
        customer = FundLeaseDetailss.objects.get(pk=pk) 
        multiply=customer.multiplied_commission_amount 
        commiss=customer.fund_lease_amount
        commiss_count=customer.divided_by
        reduced_lease=customer.fund_lease_amount
        reduced_lease_20=customer.final_lease_amount 
        collec_red_amount=customer.per_head_collection_amount
    except FundLeaseDetailss.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ADDFundLeaseDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':   
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_edit ==True):

         
            serializer876 = ADDFundLeaseDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                sheet_check=CollectionDetails.objects.filter(fund_lease=pk)                
                if sheet_check:
                    return Response({"Message":"Can't be edited as the amount is collected"},status=status.HTTP_226_IM_USED)
                settlement_check=FundLeaseDetailss.objects.filter(id=pk).first()                
                if settlement_check.finished:
                    return Response({"Message":"Can't be edited as settlement is done before"},status=status.HTTP_226_IM_USED)
                fund_group=request.data['fund_group']               
                fund_check=FundGroupDetails.objects.filter(id=fund_group).first()
                print(fund_check)
                complete_last=FundLeaseDetailss.objects.filter(fund_group=fund_check,management_profile=customer.management_profile).exclude(id=pk)
                print(complete_last)
                print("eeeeeeeeeeeee")
                if complete_last:
                    complete_last_take=FundLeaseDetailss.objects.filter(fund_group=fund_check,management_profile=customer.management_profile).exclude(id=pk).last()
                    if complete_last_take.finished ==False:
                        return Response({"Message":"Fund lease cannot be settled before settling the previous one"},status=status.HTTP_226_IM_USED)  
                print(fund_check.fund.fund_type)
                if fund_check.fund.fund_type=="Fund 21":
                    if fund_check.fund.fund_count ==0:
                        return Response({"Message":"This fund already completed cannot be added"},status=status.HTTP_226_IM_USED)
                    fund_groups=FundGroupDetails.objects.filter(id=customer.fund_group_id).first()
                    fund_groups.cash_lease_amount -= reduced_lease
                    fund_groups.save()  
                    
                    take_mem=FundMemberDetailss.objects.filter(fund_group=fund_groups)
                    for mem in take_mem:
                            balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups)                            
                            if balance_check:
                                balance_check_prev=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups).first()                        
                                balance_check_prev.credit_amt -= collec_red_amount
                                balance_check_prev.balance_amt -= collec_red_amount
                                balance_check_prev.save()
                                mem_report_check_preev=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=fund_groups,
                                                                fund_m=mem)
                                if mem_report_check_preev:
                                    bala_lst_prev=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=fund_groups,
                                                                fund_m=mem).last()
                                    bala_lst_prev.delete()
                                # take_last_balance_prev=bala_lst_prev.balance_amt
                                # calculating_last_balance_prev=take_last_balance_prev + (temp_family.per_head_collection_amount)
                                # FundMemberReport.objects.create(type_choice="Fund Lease",created_by=rejin.id,balancesheet=balance_last,fund_m=mem,management_profile=temp_family.management_profile,
                                #                     reportdate=datetime.datetime.now().date(),fund=fund_check,credit_amt=temp_family.per_head_collection_amount,balance_amt=calculating_last_balance)
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=pk)
                    for ssss in fund_mem_pro:
                            chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                            chane.lease=False
                            chane.lease_completed_colour_change=False
                            chane.save()
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.management_profile=customer.management_profile
                    temp_family.save() 
                    fund_groups=FundGroupDetails.objects.filter(id=temp_family.fund_group_id).first()
                    fund_groups.cash_lease_amount += temp_family.fund_lease_amount
                    fund_groups.save() 
                    
                    take_mem=FundMemberDetailss.objects.filter(fund_group=fund_groups)
                    for mem in take_mem:
                        balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups)                        
                        if balance_check:
                                balance_check_prev=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups).first()                            
                                balance_check_prev.credit_amt += temp_family.per_head_collection_amount
                                balance_check_prev.balance_amt += temp_family.per_head_collection_amount
                                balance_check_prev.save()
                                mem_report_check=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=temp_family.fund_group,
                                                                fund_m=mem)
                                if mem_report_check:
                                    bala_lst=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=temp_family.fund_group,
                                                                fund_m=mem).last()
                                    take_last_balance=bala_lst.balance_amt
                                    calculating_last_balance=take_last_balance + (temp_family.per_head_collection_amount)
                                    FundMemberReport.objects.create(type_choice="Fund Lease",created_by=rejin.id,balancesheet=balance_check_prev,fund_m=mem,management_profile=temp_family.management_profile,
                                                        reportdate=datetime.datetime.now().date(),fund=fund_check,credit_amt=temp_family.per_head_collection_amount,balance_amt=calculating_last_balance)
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    for ssss in fund_mem_pro:
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                        chane.lease=True
                        chane.lease_completed_colour_change=True
                        chane.save()
                elif fund_check.fund.fund_type=="Fund 20":
                    if fund_check.fund.fund_count ==0:
                        return Response({"Message":"This fund already completed cannot be added"},status=status.HTTP_226_IM_USED)
                    fund_groups=FundGroupDetails.objects.filter(id=customer.fund_group_id).first()
                    fund_groups.cash_lease_amount -= reduced_lease
                    fund_groups.save()  
                    
                    take_mem=FundMemberDetailss.objects.filter(fund_group=fund_groups)
                    for mem in take_mem:
                        balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups)                                     
                        if balance_check:
                                balance_check_prev=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups).first()                           
                                balance_check_prev.credit_amt -= reduced_lease_20
                                balance_check_prev.balance_amt -= reduced_lease_20
                                balance_check_prev.save()
                                mem_report_check_preev=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=fund_groups,
                                                                fund_m=mem)
                                if mem_report_check_preev:
                                    bala_lst_prev=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=fund_groups,
                                                                fund_m=mem).last()
                                    bala_lst_prev.delete()
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=pk)
                    for ssss in fund_mem_pro:
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                        chane.lease=False
                        chane.lease_completed_colour_change=False

                        chane.save()
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.save()
                    fund_groups=FundGroupDetails.objects.filter(id=temp_family.fund_group_id).first()
                    fund_groups.cash_lease_amount += temp_family.fund_lease_amount
                    fund_groups.save() 
                    # fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    # for mem in fund_mem_pro:
                    #     print(mem)
                    take_mem=FundMemberDetailss.objects.filter(fund_group=fund_groups)
                    for mem in take_mem:
                        balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups)
                        # balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem)
                        if balance_check:
                                balance_check_prev=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups).first()

                            
                                balance_check_prev.credit_amt += temp_family.per_head_collection_amount
                                balance_check_prev.balance_amt += temp_family.per_head_collection_amount
                                balance_check_prev.save()
                                mem_report_check=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=temp_family.fund_group,
                                                                fund_m=mem)
                                if mem_report_check:
                                    bala_lst=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=temp_family.fund_group,
                                                                fund_m=mem).last()
                                    take_last_balance=bala_lst.balance_amt
                                    calculating_last_balance=take_last_balance + (temp_family.per_head_collection_amount)
                                    FundMemberReport.objects.create(type_choice="Fund Lease",created_by=rejin.id,balancesheet=balance_check_prev,fund_m=mem,management_profile=temp_family.management_profile,
                                                        reportdate=datetime.datetime.now().date(),fund=fund_check,credit_amt=temp_family.per_head_collection_amount,balance_amt=calculating_last_balance)
                    
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    for ssss in fund_mem_pro:
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                            # chane=FundMemberDetailss.objects.filter(id=mem.fund_mem_id).first()
                        chane.lease=True
                        chane.lease_completed_colour_change=True

                        chane.save()

                elif fund_check.fund.fund_type=="Normal":
                    print("uuuuuuuuuuuuuuuuuu")
                    print(request.data)
                    fund_groups=FundGroupDetails.objects.filter(id=fund_group).first()
                    fund_groups.cash_lease_amount -= reduced_lease
                    fund_groups.save()
                    lease_taken_prev=FundLeaseMemberDetailss.objects.filter(flease=pk).count()
                    group_check=FundGroupDetails.objects.filter(id=customer.fund_group_id).first()                    
                    customer.multiplied_commission_amount = float(multiply) - float(commiss * commiss_count)
                    customer.save()
                    group_check.leased_members_count -= lease_taken_prev
                    group_check.save()                    
                    take_mem=FundMemberDetailss.objects.filter(fund_group=group_check)
                    for mem in take_mem:
                        balance_check_prev=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=group_check)                                   
                        if balance_check_prev:
                                balance_check_prev=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=group_check).first()                           
                                balance_check_prev.credit_amt -= collec_red_amount
                                balance_check_prev.balance_amt -= collec_red_amount
                                balance_check_prev.save()
                                mem_report_check_preev=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=group_check,
                                                                fund_m=mem)
                                if mem_report_check_preev:
                                    bala_lst_prev=FundMemberReport.objects.filter(balancesheet=balance_check_prev,fund=group_check,
                                                                fund_m=mem).last()
                                    bala_lst_prev.delete()
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=pk)
                    for ssss in fund_mem_pro:
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                        # chane=FundMemberDetailss.objects.filter(flease_id=pk).first()
                        chane.lease=False
                        chane.lease_completed_colour_change=False
                        chane.save()
                    temp_family=serializer876.save()
                    temp_family.created_by=rejin.id
                    temp_family.save()
                    lease_taken=FundLeaseMemberDetailss.objects.filter(flease=temp_family).count()
                    temp_family.multiplied_commission_amount = (temp_family.commission_amount)*lease_taken
                    temp_family.save()
                    fund_groups=FundGroupDetails.objects.filter(id=temp_family.fund_group_id).first()
                    red_cal=fund_groups.per_head_collection_amount
                    fund_groups.cash_lease_amount += temp_family.fund_lease_amount
                    fund_groups.leased_members_count += lease_taken                    
                    fund_groups.save() 
                    # fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    # for mem in fund_mem_pro:
                    #     print(mem)
                    take_mem=FundMemberDetailss.objects.filter(fund_group=fund_groups)
                    for mem in take_mem:    
                        balance_check=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups)                        
                        if balance_check:                            
                                balance_prev=FundMembersBalanceSheet.objects.filter(fund_m=mem,fund=fund_groups).first()
                                balance_prev.credit_amt += red_cal
                                balance_prev.balance_amt += red_cal
                                balance_prev.save()
                                mem_report_check=FundMemberReport.objects.filter(balancesheet=balance_prev,fund=temp_family.fund_group,
                                                                fund_m=mem)
                                if mem_report_check:
                                    bala_lst=FundMemberReport.objects.filter(balancesheet=balance_prev,fund=temp_family.fund_group,
                                                                fund_m=mem).last()
                                    take_last_balance=bala_lst.balance_amt
                                    calculating_last_balance=take_last_balance + (red_cal)
                                    FundMemberReport.objects.create(type_choice="Fund Lease",created_by=rejin.id,balancesheet=balance_prev,fund_m=mem,management_profile=temp_family.management_profile,
                                                        reportdate=datetime.datetime.now().date(),fund=fund_check,credit_amt=red_cal,balance_amt=calculating_last_balance)
                    fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=temp_family)
                    for ssss in fund_mem_pro:
                        chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                            
                        chane.lease=True
                        chane.lease_completed_colour_change=True
                        chane.save()
                   
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit fund lease"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':   
        serializer876 = ADDFundLeaseDetailsSerializer(customer,data=request.data,partial=True)
        if serializer876.is_valid():
            temp_family=serializer876.save()
            temp_family.created_by=rejin.id
            temp_family.save()
            return Response(serializer876.data,status=status.HTTP_201_CREATED)
        else:
            return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
            
    elif request.method == 'DELETE':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.fund_del ==True):
            sheet_check=CollectionDetails.objects.filter(fund_lease=pk)
            if sheet_check:
                return Response({"Message":"Can't be deleted as the amount is collected"},status=status.HTTP_226_IM_USED) 
            if customer.finished==True:
                return Response({"Message":"Can't be deleted as settlement is done before"},status=status.HTTP_226_IM_USED) 

            fund_mem_pro=FundLeaseMemberDetailss.objects.filter(flease=pk)
            for ssss in fund_mem_pro:
                chane=FundMemberDetailss.objects.filter(id=ssss.fund_mem_id).first()
                chane.lease=False
                chane.lease_completed_colour_change=False
                chane.save()
            fund_groups=FundGroupDetails.objects.filter(id=customer.fund_group_id).first()
            fund_groups.cash_lease_amount = float(fund_groups.cash_lease_amount) - float(reduced_lease)
            fund_groups.save()       
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"User does not have permission to delete fund lease"},status.HTTP_401_UNAUTHORIZED)
    
    
@api_view(['PATCH'])
def close_fund_groups(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    try:
        customer = FundGroupDetails.objects.get(pk=pk)  
    except FundGroupDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'PATCH':   
        customer.action=False
        customer.save()
        take_f_name_id=customer.fund_id
        try:
            funddd_name=ADDFundDetails.objects.get(id=take_f_name_id)
            funddd_name.action=False
            funddd_name.save()
        except Exception:
            print('fundclose error')
    

@api_view(['GET'])
def lease_page_fund_get(request):
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
        our_family = FundGroupDetails.objects.filter(management_profile=management,fund__fund_count__gt=0).exclude(fund__fund_type="Normal")
        print("ooooooooooooooooo")
        # print(our_family)
        serializer = FundGroupDetailsSerializer22(our_family,many=True)
        # print(serializer.data)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def lease_page_normal_fund_get(request):
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
        our_family = FundGroupDetails.objects.filter(management_profile=management,fund__fund_type="Normal")
        print("ooooooooooooooooo")
        # print(our_family)
        serializer = FundGroupDetailsSerializer22(our_family,many=True)
        # print(serializer.data)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

# @api_view(['GET'])   
# def new_lease_page_fund_get(request,pk):
#     rejin=token_checking(request)
#     if not rejin:
#         return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
#     if not rejin.is_active:
#         return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
#     print(f'token---{rejin}')
#     check_management=ManagementDetails.objects.all()
#     if not check_management:
#         dict6={}
#         dict6['message']= "First Add Management Profile details"
#         return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
#     else:
#         management=ManagementDetails.objects.all().first()
        
#     if request.method == 'GET':
#         our_family = FundGroupDetails.objects.filter(management_profile=management,id=pk).first()
#         fund_get=ADDFundDetails.objects.filter(id=our_family.fund_id)
#         print(fund_get)
#         serializer = ADDFundDetailsssssSerializer(fund_get)
#         print("ooooooooooooo")
#         print(serializer.data)
#         return Response(serializer.data,status=status.HTTP_200_OK)  

# def new_lease_page_fund_get(request,pk):
#     rejin=token_checking(request)
#     if not rejin:
#         return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
#     if not rejin.is_active:
#         return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
#     print(f'token---{rejin}')
#     check_management=ManagementDetails.objects.all()
#     if not check_management:
#         dict6={}
#         dict6['message']= "First Add Management Profile details"
#         return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
#     else:
#         management=ManagementDetails.objects.all().first()
        
#     if request.method == 'GET':
#         our_family = FundLeaseDetailss.objects.filter(management_profile=management,fund_group__fund_id=pk).first()
#         serializer = ADDFundLeaseDetailsSerializer(our_family)
#         return Response(serializer.data,status=status.HTTP_200_OK)                                                                                    


@api_view(['GET'])
def fund_profile_page(request,pk):
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
        mem = FundMemberDetailss.objects.get(pk=pk,management_profile=management)  
    except FundMemberDetailss.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'GET':
        ser=FundMemberDetailssSerializer(mem)
        lease_object=FundLeaseMemberDetailss.objects.filter(fund_mem=mem).first()
        # print("qqqqqqqqqqq")
        # print(lease_object)
        # print(lease_object.flease_id)
        
        if lease_object:
            out_lease=[]
            lease_object_m=FundLeaseDetailss.objects.filter(id=lease_object.flease_id).first()
            ser1=ADDFundLeaseDetailsSerializer(lease_object_m)
            out_lease.append(ser1.data)
        

        # print("kkkkkkkkkkkkkkk")
        # print(ser1.data)
        print(mem)
        # out_bal=[]
        # bal_sheet=FundMemberReport.objects.filter(management_profile=management,fund_m=mem)
        # print(bal_sheet)
        # seri2=FundMemberReportSerializer(bal_sheet,many=True)
        # out_bal.append(seri2.data)
        # print(out_bal)
        bal_sheet=FundMemberReport.objects.filter(management_profile=management,fund_m=mem)
       
        seri2=FundMemberReportSerializer(bal_sheet,many=True)
        
        coll_obj=CollectionDetails.objects.filter(management_profile=management,fund_member=mem)
        serializer5 = CollectionDetailsSerializer(coll_obj,many=True)
        
        dict32={}
        dict32['profile']=ser.data
        if lease_object:  
            dict32['lease_histry']=ser1.data
        else:
            dict32['lease_histry']={}

        dict32['balance_sheet']=seri2.data
        dict32['paid_histry']=serializer5.data
        print(dict32)
        # dict32['total_amt']=total_amount_value
        return Response(dict32,status=status.HTTP_200_OK)
    



@api_view(['PUT'])
def lease_fund_settlement(request,pk):
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
        customer = FundLeaseDetailss.objects.get(pk=pk) 
        fund_grou=customer.fund_group_id
        commision_amount=customer.commission_amount
      
    except FundLeaseDetailss.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ADDFundLeaseDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
    elif request.method == 'PUT':
        fund_type=request.data['fund_type']
        print(fund_type)
        final_lease_amount=request.data['final_lease_amount']
        print(final_lease_amount)
        if customer.finished==True:
            return Response({"Message":"Settlement is done before, cant be settled further"},status=status.HTTP_226_IM_USED)

        # fund_lease_amount=request.data['fund_lease_amount']
        check_amount=FundGroupDetails.objects.filter(id=fund_grou).first()
        if float(check_amount.cash_available_amount) < float(final_lease_amount):
            print("hhhhhhhhhhh")
            return Response({"Message":"No sufficient amount,so amount cannot be settled"},status=status.HTTP_226_IM_USED)        
        if fund_type=="Fund 21":
            group_checking=FundGroupDetails.objects.filter(id=customer.fund_group_id).first()
            group_checking.cash_available_amount = float(group_checking.cash_available_amount) - float(final_lease_amount)
            group_checking.save()
            funds_check=ADDFundDetails.objects.filter(id=group_checking.fund_id).first()
            print(funds_check)
            funds_check.fund_count -= 1
            funds_check.save()
            member_checkkk=FundLeaseMemberDetailss.objects.filter(flease_id=pk).first()
            # for i in member_checkkk:
            member_checkkk.lease_settlement_amount = (member_checkkk.lease_amount) 
            member_checkkk.save()
            customer.finished=True
            customer.save()
            return Response({"message":"Success"},status=status.HTTP_201_CREATED)
        elif fund_type=="Fund 20":
            group_checking=FundGroupDetails.objects.filter(id=customer.fund_group_id).first()            
            group_checking.cash_available_amount = float(group_checking.cash_available_amount ) -float(final_lease_amount)
            group_checking.save()
            funds_check=ADDFundDetails.objects.filter(id=group_checking.fund_id).first()
            funds_check.fund_count -= 1
            funds_check.save()
            member_checkkk=FundLeaseMemberDetailss.objects.filter(flease_id=pk).first()
            # for i in member_checkkk:
            member_checkkk.lease_settlement_amount = member_checkkk.lease_amount
            member_checkkk.save()
            treasure_check=ManagementTreasure.objects.filter(management_profile=management).first()
            if group_checking.fund.fund_count==0:
                treasure_check.cash_in_hand = float(treasure_check.cash_in_hand) + float(group_checking.cash_available_amount)
                treasure_check.save()
                Report.objects.create(fund_lease_id=pk,fund_m=group_checking,management_profile=management,created_by=customer.created_by,type_choice="Addition",amount=group_checking.cash_available_amount)

                
            customer.finished=True
            customer.save()
            return Response({"message":"Success"},status=status.HTTP_201_CREATED)
        elif fund_type=="Normal":
            # lease_settle_amount=request.data['lease_settle_amount']

            group_checking=FundGroupDetails.objects.filter(id=customer.fund_group_id).first()
            group_checking.cash_available_amount = float(group_checking.cash_available_amount) - float(final_lease_amount)
            reasure_check=ManagementTreasure.objects.filter(management_profile=management).first()
            reasure_check.cash_in_hand = float(reasure_check.cash_in_hand ) + float(customer.multiplied_commission_amount)

            reasure_check.save()
            group_checking.save()
            Report.objects.create(fund_lease_id=pk,fund_m=group_checking,management_profile=management,created_by=customer.created_by,type_choice="Addition",amount=customer.multiplied_commission_amount)
            member_checkkk=FundLeaseMemberDetailss.objects.filter(flease_id=pk)
            for i in member_checkkk:
                i.lease_settlement_amount = (i.lease_amount) - (commision_amount)
                i.save()
            customer.finished=True
            customer.save()
            return Response({"message":"Success"},status=status.HTTP_201_CREATED)
        else:
            print("No available")



@api_view(['GET'])
def view_fund_lease_profile_page(request,pk):
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
    fund_lease_get=FundLeaseDetailss.objects.filter(fund_group=pk)
    serializer=ADDFundLeaseDetailsSerializer(fund_lease_get,many=True)
    return Response(serializer.data,status=status.HTTP_201_CREATED)