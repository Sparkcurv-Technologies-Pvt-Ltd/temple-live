from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import ADD_EXFieldsSerializer,AddPositionSerializer,AddAuthorityDetailsSerializer
from .models import ADD_EXFields,AddPosition,AddAuthorityDetails,AutharityFields
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
import datetime
from permisions.models import Permisions
from family.models import Member_Details
from family.serializers import Member_DetailsSerializer98
# from datetime import datetime, date

@api_view(['GET'])
def get_authrity_members_view2(request):
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
        
    if request.method == 'GET':
        if get_role=="User" and perm.authority_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            our_MEMBERS = Member_Details.objects.filter(management_profile=management,action=True,adult=True,death=False)
            all_mem=[]
            for mem in our_MEMBERS:
                dict96={}
                dict96['member2_id']=mem.id
                dict96['member_name']=mem.member_name
                dict96['member_no']=mem.member_no
                dict96['member_mobile_number']=mem.member_mobile_number
                dict96['family_no']=mem.family.family_no
                dict96['address']=mem.family.address
                all_mem.append(dict96)
            return Response(all_mem,status=status.HTTP_200_OK)
        else:
            return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_authrity_members_view(request):
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
        
    if request.method == 'GET':
        if get_role=="User" and perm.authority_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            our_MEMBERS = Member_Details.objects.filter(management_profile=management,action=True,adult=True,death=False)
            all_mem=[]
            for mem in our_MEMBERS:
                dict96={}
                dict96['member_id']=mem.id
                dict96['member_name']=mem.member_name
                dict96['member_no']=mem.member_no
                dict96['member_mobile_number']=mem.member_mobile_number
                # serializer1 = Member_DetailsSerializer98(mem)
                # dict96['member']=serializer1.data
                dict96['family_no']=mem.family.family_no
                dict96['address']=mem.family.address
                all_mem.append(dict96)
            return Response(all_mem,status=status.HTTP_200_OK)
        else:
            return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        

@api_view(['GET','POST'])
def add_extrafield_authority(request):
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
        if get_role=="User" and perm.authority_add ==True or get_role=="Admin" or rejin.is_superuser == True:  

            serializer876 = ADD_EXFieldsSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.mangement=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = ADD_EXFields.objects.all()
        serializer = ADD_EXFieldsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_extrafield_authority(request,pk):
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
        customer = ADD_EXFields.objects.get(pk=pk)  
    except ADD_EXFields.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ADD_EXFieldsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        if get_role=="User" and perm.authority_edit ==True or get_role=="Admin" or rejin.is_superuser == True: 

            serializer876 = ADD_EXFieldsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.authority_edit ==True or get_role=="Admin" or rejin.is_superuser == True:  

            serializer876 = ADD_EXFieldsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.authority_delete ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.authority_edit ==True :  

            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET','POST'])
def add_authority_position(request):
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
        if get_role=="User" and perm.authority_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
            
            serializer876 = AddPositionSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.mangement=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = AddPosition.objects.all()
        serializer = AddPositionSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_authority_position(request,pk):
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
        customer = AddPosition.objects.get(pk=pk)  
    except AddPosition.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AddPositionSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT': 
        if get_role=="User" and perm.authority_edit ==True or get_role=="Admin" or rejin.is_superuser == True: 
            serializer876 = AddPositionSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.authority_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
            serializer876 = AddPositionSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.authority_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET','POST'])
def add_authority_Details(request):
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
        if get_role=="User" and perm.authority_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
            serializer876 = AddAuthorityDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                date_string = request.data['from_date']
                date_object = datetime.datetime.strptime(date_string, "%Y-%m-%d").date()
                # Adding one month using relativedelta
                date_string_new = request.data['to_date']
                new_date_object = datetime.datetime.strptime(date_string_new, "%Y-%m-%d").date()
                if date_object >= new_date_object:
                    msg={"error":"From date should not greater than to date"}
                    return Response(msg,status=status.HTTP_226_IM_USED)
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.mangement=management
                temp_family.status='Active'
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = AddAuthorityDetails.objects.filter(mangement=management)
        serializer = AddAuthorityDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_authority_Details(request,pk):
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
        customer = AddAuthorityDetails.objects.get(pk=pk)  
    except AddAuthorityDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AddAuthorityDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        if get_role=="User" and perm.authority_edit ==True or get_role=="Admin" or rejin.is_superuser == True: 
            serializer876 = AddAuthorityDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                date_string = request.data['from_date']
                date_object = datetime.datetime.strptime(date_string, "%Y-%m-%d").date()
                # Adding one month using relativedelta
                date_string_new = request.data['to_date']
                new_date_object = datetime.datetime.strptime(date_string_new, "%Y-%m-%d").date()
                if date_object >= new_date_object:
                    msg={"error":"From date should not greater than to date"}
                    return Response(msg,status=status.HTTP_226_IM_USED)
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.authority_edit ==True or get_role=="Admin" or rejin.is_superuser == True: 
            serializer876 = AddAuthorityDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                date_string = request.data['from_date']
                date_object = datetime.datetime.strptime(date_string, "%Y-%m-%d").date()
                # Adding one month using relativedelta
                date_string_new = request.data['to_date']
                new_date_object = datetime.datetime.strptime(date_string_new, "%Y-%m-%d").date()
                if date_object >= new_date_object:
                    msg={"error":"From date should not greater than to date"}
                    return Response(msg,status=status.HTTP_226_IM_USED)
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.authority_delete ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.authority_edit ==True: 
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['PATCH'])
def authority_resign(request,pk):
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
        customer = AddAuthorityDetails.objects.get(pk=pk)  
    except AddAuthorityDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PATCH':
        if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.authority_edit ==True: 
            customer.status='Resign' 
            customer.action=False  
            customer.save()
            return Response(status=status.HTTP_200_OK)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    
@api_view(['PATCH'])
def authority_rejoin(request,pk):
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
        customer = AddAuthorityDetails.objects.get(pk=pk)  
    except AddAuthorityDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PATCH':
        if  get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.authority_edit ==True: 
            today_date=datetime.datetime.now().date()

            print(today_date)
            if customer.to_date >= today_date:
                customer.status='Active' 
                customer.action=True
                customer.save()                                   
                return Response(status=status.HTTP_200_OK)
            return Response({"message":"Position Period Expired"},status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED) 
        
