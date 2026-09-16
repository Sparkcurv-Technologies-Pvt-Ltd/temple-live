from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import AddSangamNameSerializer,AddSangamDetailsSerializer
from .models import AddSangamName,AddSangamDetails,SangamMembers
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from permisions.models import Permisions
from family.models import Member_Details, Fammily_Details
from family.serializers import Member_DetailsSerializer98


@api_view(['GET'])
def get_sangam_members(request):
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
        # QA Bug 10 — Sangam "Member List" was previously filtering
        # `death=True`, which returned only DEAD members instead of active
        # ones. The Sangam "Member List" tab should list currently-active
        # temple members (alive AND not marriage-removed).
        our_MEMBERS = Member_Details.objects.filter(
            management_profile=management,
            death=False,
            marriage_remove=False,
        )
        all_mem=[]
        for mem in our_MEMBERS:
            dict96={}
            serializer1 = Member_DetailsSerializer98(mem)
            dict96['member']=serializer1.data
            dict96['family_no']=mem.family.family_no
            dict96['address']=mem.family.address
            all_mem.append(dict96)
            
        return Response(all_mem,status=status.HTTP_200_OK)


@api_view(['GET','POST'])
def add_sangam_name(request):
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
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sangam_add ==True):
              
            serializer876 = AddSangamNameSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to add sangam"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'GET':
        our_family = AddSangamName.objects.all()
        serializer = AddSangamNameSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_sangam_name(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    try:
        customer = AddSangamName.objects.get(pk=pk)  
    except AddSangamName.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AddSangamNameSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT': 
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sangam_edit ==True):
                
            serializer876 = AddSangamNameSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit sangam"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':   
        serializer876 = AddSangamNameSerializer(customer,data=request.data,partial=True)
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
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sangam_del ==True):
            
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"User does not have permission to delete sangam"},status.HTTP_401_UNAUTHORIZED)

@api_view(['GET','POST'])
def add_sangam_details(request):
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
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sangam_add ==True):
            
            try:
                data=request.data
                che_sangam = AddSangamDetails.objects.filter(sangam_name=data['sangam_name'],sangam_active=True)
                if che_sangam:
                    dict6={}
                    dict6['message']= "Sangam name already used in active sangam"
                    dict6['data']=request.data
                    return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)   
            
            serializer876 = AddSangamDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to add sangam"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'GET':
        our_family = AddSangamDetails.objects.all()
        serializer = AddSangamDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_sangam_details(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    try:
        customer = AddSangamDetails.objects.get(pk=pk)  
    except AddSangamDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AddSangamDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sangam_edit ==True):
            
            try:
                data=request.data
                che_sangam = AddSangamDetails.objects.filter(sangam_name=data['sangam_name'],sangam_active=True).exclude(id=pk)
                if che_sangam:
                    dict6={}
                    dict6['message']= "Sangam name already used in active sangam"
                    dict6['data']=request.data
                    return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)      
            serializer876 = AddSangamDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit sangam"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':  
        try:
            data=request.data
            che_sangam = AddSangamDetails.objects.filter(sangam_name=data['sangam_name'],sangam_active=True).exclude(id=pk)
            if che_sangam:
                dict6={}
                dict6['message']= "Sangam name already used in active sangam"
                dict6['data']=request.data
                return Response(dict6,status=status.HTTP_226_IM_USED)
        except Exception:
            return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)   
        serializer876 = AddSangamDetailsSerializer(customer,data=request.data,partial=True)
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
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.sangam_del ==True):
           
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"User does not have permission to delete sangam"},status.HTTP_401_UNAUTHORIZED)
        