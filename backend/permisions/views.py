from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import My_RolesSerializer
from .models import My_Roles
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from permisions.models import Permisions
from permisions.serializers import PermisionsSerializer

@api_view(['GET','POST'])
def add_role_details(request):
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
        # try:
        #     data=request.data
        #     check_roles = My_Roles.objects.filter(Role_name__iexact= data['Role_name'].strip())
        #     if check_roles:
        #         dict6={}
        #         dict6['message']= "Data already exists"
        #         dict6['data']=request.data
        #         return Response(dict6,status=status.HTTP_226_IM_USED)
        # except:
        #     return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)  
           
        serializer876 = My_RolesSerializer(data=request.data)
        if serializer876.is_valid():
            jjj=serializer876.save()
            jjj.created_by=rejin.id
            jjj.management_profile=management
            jjj.save()
            return Response(serializer876.data,status=status.HTTP_201_CREATED)
        else:
            return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
        our_family = My_Roles.objects.all().order_by("-created_at")
        serializer = My_RolesSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_role_details(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    try:
        customer = My_Roles.objects.get(pk=pk)  
    except My_Roles.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = My_RolesSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':   
        # try:
        #     data=request.data
        #     check_roles = My_Roles.objects.filter(Role_name__iexact= data['Role_name'].strip()).exclude(id=pk)
        #     if check_roles:
        #         dict6={}
        #         dict6['message']= "Data already exists"
        #         dict6['data']=request.data
        #         return Response(dict6,status=status.HTTP_226_IM_USED)
        # except:
        #     return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)
        serializer876 = My_RolesSerializer(customer,data=request.data)
        if serializer876.is_valid():
            pp=serializer876.save()
            pp.created_by=rejin.id
            pp.save()
            return Response(serializer876.data,status=status.HTTP_201_CREATED)
        else:
            return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PATCH':   
        serializer876 = My_RolesSerializer(customer,data=request.data,partial=True)
        if serializer876.is_valid():
            pp=serializer876.save()
            pp.created_by=rejin.id
            pp.save()
            return Response(serializer876.data,status=status.HTTP_201_CREATED)
        else:
            return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
            
    elif request.method == 'DELETE':
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


@api_view(['POST','GET'])
def assign_permissions(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    user_check=User.objects.filter(email=rejin).first().id
    print(rejin)
    print(user_check)
     
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if rejin.user_role:                                                                                                                                                                                                                                                                                                                                                                                                                      
            get_role=rejin.user_role 
    if request.method=="GET":
        per_obj=My_Roles.objects.all().order_by('-created_at')
        serial=My_RolesSerializer(per_obj,many=True)
        return Response(serial.data,status=status.HTTP_200_OK)
   
    elif request.method=="POST":                                                                                                                                                                                                                                                                                                                                                                                                                       
        
        if rejin.is_superuser == True or get_role =="Admin":
            try:
                
                dict99={}
                out=[]
                da=request.data
                print(da)
                dict98={}
                dict99['Role_name']=da['Role_name']                
                dict98['dashboard']=da['dashboard']
                
                family_values=da['family_values']
                dict98['fam_add']=family_values['fam_add']
                dict98['fam_edit']=family_values['fam_edit']
                dict98['fam_delete']=family_values['fam_delete']
                if dict98['fam_add']or dict98['fam_edit'] or dict98['fam_delete']:                    
                    dict98['fam_view']=True
                else:                    
                    dict98['fam_view']=False            
                              
                asset_values=da['asset_values']
                dict98['asset_add']=asset_values['asset_add']
                dict98['asset_edit']=asset_values['asset_edit']
                # dict98['is_sale_view']=asset_values['is_sale_view']   

                dict98['asset_delete']=asset_values['asset_delete']
                if dict98['asset_add']or dict98['asset_edit'] or dict98['asset_delete']:                    
                    dict98['asset_view']=True
                else:                    
                    dict98['asset_view']=False

                expense_values=da['expense_values']
                dict98['expense_add']=expense_values['expense_add']
                dict98['expense_edit']=expense_values['expense_edit']
                # dict98['is_branch_view']=True
                dict98['expense_delete']=expense_values['expense_delete']
                # dict98['is_sale_delete']=sale_value['is_sale_delete']
                if dict98['expense_add']or dict98['expense_edit'] or dict98['expense_delete']:                    
                    dict98['expense_view']=True
                else:                    
                    dict98['expense_view']=False
                # collection_values=da['collection_values']
                # dict98['collection_add']=collection_values['collection_add']
                # dict98['collection_edit']=collection_values['collection_edit']
                # # dict98['is_enquiry_view']=True
                # dict98['collection_del']=collection_values['collection_delete']
                # if dict98['collection_add']or dict98['collection_edit'] or dict98['collection_del']:                    
                #     dict98['collection_view']=True
                # else:                    
                #     dict98['collection_view']=False
                    
                # manage_values=da['manage_values']
                # dict98['manage_add']=manage_values['manage_add']
                # dict98['manage_edit']=manage_values['manage_edit']
                
                # dict98['manage_del']=manage_values['manage_delete']
                # if dict98['manage_add']or dict98['manage_edit'] or dict98['manage_del']:                    
                #     dict98['manage_view']=True
                # else:                    
                #     dict98['manage_view']=False

                fund_values=da['fund_values']
                dict98['fund_add']=fund_values['fund_add']
                dict98['fund_edit']=fund_values['fund_edit']
                
                dict98['fund_delete']=fund_values['fund_delete']
                if dict98['fund_add']or dict98['fund_edit'] or dict98['fund_delete']:                    
                    dict98['fund_view']=True
                else:                    
                    dict98['fund_view']=False

                chit_fund_values=da['chit_fund_values']
                dict98['chit_fund_add']=chit_fund_values['chit_fund_add']
                dict98['chit_fund_edit']=chit_fund_values['chit_fund_edit']
                
                dict98['chit_fund_delete']=chit_fund_values['chit_fund_delete']
                if dict98['chit_fund_add']or dict98['chit_fund_edit'] or dict98['chit_fund_delete']:                    
                    dict98['chit_fund_view']=True
                else:                    
                    dict98['chit_fund_view']=False

                # fund_lease_values=da['fund_lease_values']
                # dict98['fund_lease_add']=fund_lease_values['fund_lease_add']
                # dict98['fund_lease_edit']=fund_lease_values['fund_lease_edit']
                
                # dict98['fund_lease_del']=fund_lease_values['fund_lease_delete']
                # if dict98['fund_lease_add']or dict98['fund_lease_edit'] or dict98['fund_lease_del']:                    
                #     dict98['fund_lease_view']=True
                # else:                    
                #     dict98['fund_lease_view']=False
                authority_values=da['authority_values']
                dict98['authority_add']=authority_values['authority_add']
                dict98['authority_edit']=authority_values['authority_edit']
                
                dict98['authority_delete']=authority_values['authority_delete']
                if dict98['authority_add']or dict98['authority_edit'] or dict98['authority_delete']:                    
                    dict98['authority_view']=True
                else:                    
                    dict98['authority_view']=False
                # user_values=da['user_values']
                # dict98['user_add']=user_values['user_add']
                # dict98['user_edit']=user_values['user_edit']
                
                # dict98['user_del']=user_values['user_delete']
                # if dict98['user_add']or dict98['user_edit'] or dict98['user_del']:                    
                #     dict98['user_view']=True
                # else:                    
                #     dict98['user_view']=False                
                death_values=da['death_values']
                dict98['death_add']=death_values['death_add']
                dict98['death_edit']=death_values['death_edit']
                
                dict98['death_delete']=death_values['death_delete']
                if dict98['death_add']or dict98['death_edit'] or dict98['death_delete']:                    
                    dict98['death_view']=True
                else:                    
                    dict98['death_view']=False         
             
                marriage_values=da['marriage_values']
                dict98['marriage_add']=marriage_values['marriage_add']
                dict98['marriage_edit']=marriage_values['marriage_edit']
                # dict98['is_mealplan_view']=True
                dict98['marriage_delete']=marriage_values['marriage_delete']
                if dict98['marriage_add']or dict98['marriage_edit'] or dict98['marriage_delete']:                    
                    dict98['marriage_view']=True
                else:                    
                    dict98['marriage_view']=False
                income_values=da['income_values']
                dict98['income_add']=income_values['income_add']
                dict98['income_edit']=income_values['income_edit']
                # dict98['is_member_view']=True
                dict98['income_delete']=income_values['income_delete']
                if dict98['income_add']or dict98['income_edit'] or dict98['income_delete']:                    
                    dict98['income_view']=True
                else:                    
                    dict98['income_view']=False
                sangam_values=da['sangam_values']
                dict98['sangam_add']=sangam_values['sangam_add']
                dict98['sangam_edit']=sangam_values['sangam_edit']
                # dict98['is_product_view']=True
                dict98['sangam_delete']=sangam_values['sangam_delete']
                if dict98['sangam_add']or dict98['sangam_edit'] or dict98['sangam_delete']:                    
                    dict98['sangam_view']=True
                else:                    
                    dict98['sangam_view']=False                
                rental_values=da['rental_values']
                dict98['rental_add']=rental_values['rental_add']
                dict98['rental_edit']=rental_values['rental_edit']
                # dict98['is_plan_view']=True
                dict98['rental_delete']=rental_values['rental_delete']
                if dict98['rental_add']or dict98['rental_edit'] or dict98['rental_delete']:                    
                    dict98['rental_view']=True
                else:                    
                    dict98['rental_view']=False
                festival_value=da['festival_value']
                dict98['festival_add']=festival_value['festival_add']
                dict98['festival_edit']=festival_value['festival_edit']
                # dict98['is_plan_view']=True
                dict98['festival_delete']=festival_value['festival_delete']
                if dict98['festival_add']or dict98['festival_edit'] or dict98['festival_delete']:                    
                    dict98['festival_view']=True
                else:                    
                    dict98['festival_view']=False                              
                subtariff_values=da['subtariff_values']
                dict98['sub_tarif_add']=subtariff_values['sub_tarif_add']
                dict98['sub_tarif_edit']=subtariff_values['sub_tarif_edit']
                # dict98['is_memberplan_view']=True
                dict98['sub_tarif_delete']=subtariff_values['sub_tarif_delete']
                if dict98['sub_tarif_add']or dict98['sub_tarif_edit'] or dict98['sub_tarif_delete']:                    
                    dict98['sub_tarif_view']=True
                else:                    
                    dict98['sub_tarif_view']=False
                # tax_values=da['tax_values']
                # dict98['tax_add']=tax_values['tax_add']
                # dict98['tax_edit']=tax_values['tax_edit']
                # # dict98['is_followup_view']=True
                # dict98['tax_del']=tax_values['tax_delete']
                # if dict98['tax_add']or dict98['tax_edit'] or dict98['tax_del']:                    
                #     dict98['tax_view']=True                   
                # else:                    
                #     dict98['tax_view']=False
                interest_values=da['interest_values']
                dict98['interest_add']=interest_values['interest_add']   
                dict98['interest_edit']=interest_values['interest_edit']                
                dict98['interest_delete']=interest_values['interest_delete']             

                if dict98['interest_add'] or dict98['interest_edit'] or  dict98['interest_delete']:                    
                    dict98['interest_view']=True
                else:                    
                    dict98['interest_view']=False
                dict98['marriage']=da['marriage']                
                dict98['fund']=da['fund'] 
                dict98['festival']=da['festival'] 
                dict98['rent']=da['rent'] 
                dict98['lease']=da['lease'] 
                dict98['management_interest']=da['management_interest'] 
                dict98['chit_interest']=da['chit_interest'] 
                dict98['sub_tariff']=da['sub_tariff'] 
                dict98['balance']=da['balance'] 
                dict98['death_tariff']=da['death_tariff'] 
                dict98['balance_sheet_view']=da['balance_sheet_view']
                dict98['moveable_asset_rent']=da['moveable_asset_rent']
                out.append(dict98)
                dict99['role_link']=out                
            except Exception:
                return Response({"Message":"Data requirement error"},status=status.HTTP_417_EXPECTATION_FAILED)
            serializer=My_RolesSerializer(data=dict99)
            if serializer.is_valid():
                p=serializer.save()  
                print(user_check)  
                p.management_profile=management
                p.created_by=user_check              
                p.save()
                return Response(serializer.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_401_UNAUTHORIZED)
       
       
           
@api_view(['PUT','GET','DELETE'])
def edit_role(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    user_check=User.objects.filter(email=rejin).first().id
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()    
    try:
        enquiry1 = My_Roles.objects.get(id=pk)
    except My_Roles.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method=="GET":
        serializer=My_RolesSerializer(enquiry1)
        return Response(serializer.data,status=status.HTTP_200_OK)    
    elif request.method=="PUT":
        try:
                
                dict99={}
                out=[]
                da=request.data
                print(da)
                dict98={}
                dict99['Role_name']=da['Role_name']                
                dict98['dashboard']=da['dashboard']
                
                family_values=da['family_values']
                dict98['fam_add']=family_values['fam_add']
                dict98['fam_edit']=family_values['fam_edit']
                dict98['fam_delete']=family_values['fam_delete']
                if dict98['fam_add']or dict98['fam_edit'] or dict98['fam_delete']:                    
                    dict98['fam_view']=True
                else:                    
                    dict98['fam_view']=False            
                              
                asset_values=da['asset_values']
                dict98['asset_add']=asset_values['asset_add']
                dict98['asset_edit']=asset_values['asset_edit']
                # dict98['is_sale_view']=asset_values['is_sale_view']   

                dict98['asset_delete']=asset_values['asset_delete']
                if dict98['asset_add']or dict98['asset_edit'] or dict98['asset_delete']:                    
                    dict98['asset_view']=True
                else:                    
                    dict98['asset_view']=False

                expense_values=da['expense_values']
                dict98['expense_add']=expense_values['expense_add']
                dict98['expense_edit']=expense_values['expense_edit']
                # dict98['is_branch_view']=True
                dict98['expense_delete']=expense_values['expense_delete']
                # dict98['is_sale_delete']=sale_value['is_sale_delete']
                if dict98['expense_add']or dict98['expense_edit'] or dict98['expense_delete']:                    
                    dict98['expense_view']=True
                else:                    
                    dict98['expense_view']=False
                # collection_values=da['collection_values']
                # dict98['collection_add']=collection_values['collection_add']
                # dict98['collection_edit']=collection_values['collection_edit']
                # # dict98['is_enquiry_view']=True
                # dict98['collection_del']=collection_values['collection_delete']
                # if dict98['collection_add']or dict98['collection_edit'] or dict98['collection_del']:                    
                #     dict98['collection_view']=True
                # else:                    
                #     dict98['collection_view']=False
                    
                # manage_values=da['manage_values']
                # dict98['manage_add']=manage_values['manage_add']
                # dict98['manage_edit']=manage_values['manage_edit']
                
                # dict98['manage_delete']=manage_values['manage_delete']
                # if dict98['manage_add']or dict98['manage_edit'] or dict98['manage_delete']:                    
                #     dict98['manage_view']=True
                # else:                    
                #     dict98['manage_view']=False

                fund_values=da['fund_values']
                dict98['fund_add']=fund_values['fund_add']
                dict98['fund_edit']=fund_values['fund_edit']
                
                dict98['fund_delete']=fund_values['fund_delete']
                if dict98['fund_add']or dict98['fund_edit'] or dict98['fund_delete']:                    
                    dict98['fund_view']=True
                else:                    
                    dict98['fund_view']=False

                chit_fund_values=da['chit_fund_values']
                dict98['chit_fund_add']=chit_fund_values['chit_fund_add']
                dict98['chit_fund_edit']=chit_fund_values['chit_fund_edit']
                
                dict98['chit_fund_delete']=chit_fund_values['chit_fund_delete']
                if dict98['chit_fund_add']or dict98['chit_fund_edit'] or dict98['chit_fund_delete']:                    
                    dict98['chit_fund_view']=True
                else:                    
                    dict98['chit_fund_view']=False

                # fund_lease_values=da['fund_lease_values']
                # dict98['fund_lease_add']=fund_lease_values['fund_lease_add']
                # dict98['fund_lease_edit']=fund_lease_values['fund_lease_edit']
                
                # dict98['fund_lease_del']=fund_lease_values['fund_lease_delete']
                # if dict98['fund_lease_add']or dict98['fund_lease_edit'] or dict98['fund_lease_del']:                    
                #     dict98['fund_lease_view']=True
                # else:                    
                #     dict98['fund_lease_view']=False
                authority_values=da['authority_values']
                dict98['authority_add']=authority_values['authority_add']
                dict98['authority_edit']=authority_values['authority_edit']
                
                dict98['authority_delete']=authority_values['authority_delete']
                if dict98['authority_add']or dict98['authority_edit'] or dict98['authority_delete']:                    
                    dict98['authority_view']=True
                else:                    
                    dict98['authority_view']=False
                # user_values=da['user_values']
                # dict98['user_add']=user_values['user_add']
                # dict98['user_edit']=user_values['user_edit']
                
                # dict98['user_del']=user_values['user_delete']
                # if dict98['user_add']or dict98['user_edit'] or dict98['user_del']:                    
                #     dict98['user_view']=True
                # else:                    
                #     dict98['user_view']=False                
                death_values=da['death_values']
                dict98['death_add']=death_values['death_add']
                dict98['death_edit']=death_values['death_edit']
                
                dict98['death_delete']=death_values['death_delete']
                if dict98['death_add']or dict98['death_edit'] or dict98['death_delete']:                    
                    dict98['death_view']=True
                else:                    
                    dict98['death_view']=False         
             
                marriage_values=da['marriage_values']
                dict98['marriage_add']=marriage_values['marriage_add']
                dict98['marriage_edit']=marriage_values['marriage_edit']
                # dict98['is_mealplan_view']=True
                dict98['marriage_delete']=marriage_values['marriage_delete']
                if dict98['marriage_add']or dict98['marriage_edit'] or dict98['marriage_delete']:                    
                    dict98['marriage_view']=True
                else:                    
                    dict98['marriage_view']=False
                income_values=da['income_values']
                dict98['income_add']=income_values['income_add']
                dict98['income_edit']=income_values['income_edit']
                # dict98['is_member_view']=True
                dict98['income_delete']=income_values['income_delete']
                if dict98['income_add']or dict98['income_edit'] or dict98['income_delete']:                    
                    dict98['income_view']=True
                else:                    
                    dict98['income_view']=False
                sangam_values=da['sangam_values']
                dict98['sangam_add']=sangam_values['sangam_add']
                dict98['sangam_edit']=sangam_values['sangam_edit']
                # dict98['is_product_view']=True
                dict98['sangam_delete']=sangam_values['sangam_delete']
                if dict98['sangam_add']or dict98['sangam_edit'] or dict98['sangam_delete']:                    
                    dict98['sangam_view']=True
                else:                    
                    dict98['sangam_view']=False                
                rental_values=da['rental_values']
                dict98['rental_add']=rental_values['rental_add']
                dict98['rental_edit']=rental_values['rental_edit']
                # dict98['is_plan_view']=True
                dict98['rental_delete']=rental_values['rental_delete']
                if dict98['rental_add']or dict98['rental_edit'] or dict98['rental_delete']:                    
                    dict98['rental_view']=True
                else:                    
                    dict98['rental_view']=False
                festival_value=da['festival_value']
                dict98['festival_add']=festival_value['festival_add']
                dict98['festival_edit']=festival_value['festival_edit']
                # dict98['is_plan_view']=True
                dict98['festival_delete']=festival_value['festival_delete']
                if dict98['festival_add']or dict98['festival_edit'] or dict98['festival_delete']:                    
                    dict98['festival_view']=True
                else:                    
                    dict98['festival_view']=False                              
                subtariff_values=da['subtariff_values']
                dict98['sub_tarif_add']=subtariff_values['sub_tarif_add']
                dict98['sub_tarif_edit']=subtariff_values['sub_tarif_edit']
                # dict98['is_memberplan_view']=True
                dict98['sub_tarif_delete']=subtariff_values['sub_tarif_delete']
                if dict98['sub_tarif_add']or dict98['sub_tarif_edit'] or dict98['sub_tarif_delete']:                    
                    dict98['sub_tarif_view']=True
                else:                    
                    dict98['sub_tarif_view']=False
                # tax_values=da['tax_values']
                # dict98['tax_add']=tax_values['tax_add']
                # dict98['tax_edit']=tax_values['tax_edit']
                # # dict98['is_followup_view']=True
                # dict98['tax_del']=tax_values['tax_delete']
                # if dict98['tax_add']or dict98['tax_edit'] or dict98['tax_del']:                    
                #     dict98['tax_view']=True                   
                # else:                    
                #     dict98['tax_view']=False
                interest_values=da['interest_values']
                dict98['interest_add']=interest_values['interest_add']   
                dict98['interest_edit']=interest_values['interest_edit']                
                dict98['interest_delete']=interest_values['interest_delete']             

                if dict98['interest_add'] or dict98['interest_edit'] or  dict98['interest_delete']:                    
                    dict98['interest_view']=True
                else:                    
                    dict98['interest_view']=False
                dict98['marriage']=da['marriage'] 
                dict98['fund']=da['fund'] 
                dict98['festival']=da['festival'] 
                dict98['rent']=da['rent'] 
                dict98['lease']=da['lease'] 
                dict98['management_interest']=da['management_interest'] 
                dict98['chit_interest']=da['chit_interest'] 
                dict98['sub_tariff']=da['sub_tariff'] 
                dict98['balance']=da['balance'] 
                dict98['death_tariff']=da['death_tariff'] 
                dict98['balance_sheet_view']=da['balance_sheet_view']
                dict98['moveable_asset_rent']=da['moveable_asset_rent']

                out.append(dict98)
                dict99['role_link']=out  
        except Exception:
                return Response({"Message":"Data requirement error"},status=status.HTTP_417_EXPECTATION_FAILED)
        serializer = My_RolesSerializer(enquiry1,data=dict99)    
        if serializer.is_valid():
            role=serializer.save()
            role.management_profile=management
            role.created_by=user_check              
            role.save()                        
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
   
    elif request.method == 'DELETE':
        added_role=User.objects.filter(role=pk)
        if added_role:            
            return Response({'message':"Cant be deleted as this role involves user"},status=status.HTTP_302_FOUND)
        else:
            enquiry1.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
   



