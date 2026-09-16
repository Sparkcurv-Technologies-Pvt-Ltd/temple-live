from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import AssetCategorySerializer,AssetDetailsSerializer,MoveableAssetCategorySerializer,MoveableAssetDetailsSerializer
from .models import AssetCategory,AssetDetails,MoveableAssetCategory,MoveableAssetDetails
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from permisions.models import Permisions
from rental.models import RentalAndLeaseDetails,MovableAssetsRentTable

@api_view(['GET','POST'])
def add_asset_category_details(request):
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
        if get_role=="User" and perm.asset_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            try:
                data=request.data
                check_units = AssetCategory.objects.filter(categoryname__iexact= data['categoryname'].strip(),mangement=management)
                if check_units:
                    dict6={}
                    dict6['message']= "Data already exists"
                    dict6['data']=request.data
                    return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)
                
            serializer876 = AssetCategorySerializer(data=request.data)
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
        our_family = AssetCategory.objects.all()
        serializer = AssetCategorySerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_asset_category_details(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(irole_link_idd=rejin.my_role.id)
            
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()         
    
    try:
        customer = AssetCategory.objects.get(pk=pk,mangement=management)  
    except AssetCategory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AssetCategorySerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True: 
            aswts=AssetDetails.objects.filter(category=customer)
            rental_check=RentalAndLeaseDetails.objects.filter(category_id=pk)
            if aswts or rental_check:
                return Response({'message': 'Cant be edited as this is involved in transactions'},status=status.HTTP_302_FOUND) 
            try:
                data=request.data
                check_units = AssetCategory.objects.filter(categoryname__iexact= data['categoryname'].strip(),mangement=management).exclude(id=pk)
                if check_units:
                    dict6={}
                    dict6['message']= "Data already exists"
                    dict6['data']=request.data
                    return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED) 
            
            serializer876 = AssetCategorySerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':  
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True:   
            serializer876 = AssetCategorySerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.asset_del ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.asset_edit ==True:  
            rental_check=RentalAndLeaseDetails.objects.filter(category_id=pk)
            if rental_check:
                return Response({'message': 'Cant be deleted as this is involved in transactions'},status=status.HTTP_302_FOUND) 
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET','POST'])
def add_asset_details(request):
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
        if get_role=="User" and perm.asset_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
            try:
                data=request.data
                check_units = AssetDetails.objects.filter(category_id=data['category'],mangement=management)
                for one in check_units:
                    if one.asset_name==str(data['asset_name']):
                        dict6={}
                        dict6['message']= "Data already exists"
                        # dict6['data']=request.data
                        return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)
               
            serializer876 = AssetDetailsSerializer(data=request.data)
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
        our_family = AssetDetails.objects.filter(mangement=management)
        serializer = AssetDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_asset_details(request,pk):
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
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    try:
        customer = AssetDetails.objects.get(pk=pk,mangement=management)  
    except AssetDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AssetDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True:  
            rental_check=RentalAndLeaseDetails.objects.filter(asset_id=pk)
            if rental_check:
                return Response({'message': 'Cant be edited as this is involved in transactions'},status=status.HTTP_302_FOUND)
            try:
                data=request.data
                check_units = AssetDetails.objects.filter(category_id=data['category'],mangement=management).exclude(id=pk)
                for one in check_units:
                    if one.asset_name==str(data['asset_name']):
                        dict6={}
                        dict6['message']= "Data already exists"
                        # dict6['data']=request.data
                        return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)
            
            try:
                if request.data['documents_status']=='false':
                    d_status=False
                else:
                    d_status=True
            except Exception:
                pass
            
            try:
                if request.data['images_status']=='false':
                    i_status=False
                else:
                    i_status=True
            except Exception:
                pass   
                
            serializer876 = AssetDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                
                try:
                    if d_status==False:
                        temp_family.documents=None
                        temp_family.save()
                except Exception:
                    pass
                try:
                    if i_status==False:
                        temp_family.images=None
                        temp_family.save()
                except Exception:
                    pass
                
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True:    
            serializer876 = AssetDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.asset_del ==True:  
            rental_check=RentalAndLeaseDetails.objects.filter(asset_id=pk)
            if rental_check:
                return Response({'message': 'Cant be deleted as this is involved in transactions'},status=status.HTTP_302_FOUND)
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET'])
def categ_wise_asset_details(request,pk):
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
        cate = AssetCategory.objects.get(pk=pk,mangement=management)  
    except AssetCategory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        all_assets=AssetDetails.objects.filter(mangement=management,category=cate)
        serializer = AssetDetailsSerializer(all_assets,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
  
    
@api_view(['GET'])
def lease_page_categ_wise_asset_details(request):
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

    if request.method == 'GET':
        all_category=AssetCategory.objects.filter(mangement=management)
        lease_page=[]
        for one_cate in all_category:
            dict76={}
            ser2=AssetCategorySerializer(one_cate)
            assets=AssetDetails.objects.filter(category=one_cate,is_booked=False,mangement=management)
            ser3=AssetDetailsSerializer(assets,many=True)
            dict76['category']=ser2.data
            dict76['assets']=ser3.data
            lease_page.append(dict76)
        return Response(lease_page,status=status.HTTP_200_OK)
    

# movable assets
@api_view(['GET','POST'])
def add_movableasset_category_details(request):
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
        if get_role=="User" and perm.asset_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            try:
                data=request.data
                check_units = MoveableAssetCategory.objects.filter(categoryname__iexact= data['categoryname'].strip(),mangement=management)
                if check_units:
                    dict6={}
                    dict6['message']= "Data already exists"
                    dict6['data']=request.data
                    return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)
             
            serializer876 = MoveableAssetCategorySerializer(data=request.data)
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
        our_family = MoveableAssetCategory.objects.filter(mangement=management)
        serializer = MoveableAssetCategorySerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_movableasset_category_details(request,pk):
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
    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()        
    
    try:
        customer = MoveableAssetCategory.objects.get(pk=pk,mangement=management)  
    except MoveableAssetCategory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = MoveableAssetCategorySerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True:
            m_asset=MoveableAssetDetails.objects.filter(category=customer)
            rental_check=MovableAssetsRentTable.objects.filter(category_id=pk)
            if m_asset or rental_check:
                return Response({'message': 'Cant be edited as this is involved in transactions'},status=status.HTTP_302_FOUND)
            try:
                data=request.data
                check_units = MoveableAssetCategory.objects.filter(categoryname__iexact= data['categoryname'].strip(),mangement=management).exclude(id=pk)
                if check_units:
                    dict6={}
                    dict6['message']= "Data already exists"
                    dict6['data']=request.data
                    return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)   
            serializer876 = MoveableAssetCategorySerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':  
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True:   
            serializer876 = MoveableAssetCategorySerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.asset_del ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.asset_edit ==True:  
            rental_check=MovableAssetsRentTable.objects.filter(category_id=pk)
            if rental_check:
                return Response({'message': 'Cant be deleted as this is involved in transactions'},status=status.HTTP_302_FOUND)
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET','POST'])
def add_movableasset_details(request):
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
        if get_role=="User" and perm.asset_add ==True or get_role=="Admin" or rejin.is_superuser == True:  
            
            try:
                data=request.data
                check_units = MoveableAssetDetails.objects.filter(category_id=data['category'],mangement=management)
                for one in check_units:
                    if one.asset_name==str(data['asset_name']):
                        dict6={}
                        dict6['message']= "Data already exists"
                        dict6['data']=request.data
                        return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)
            
            serializer876 = MoveableAssetDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.mangement=management
                temp_family.total_qty=temp_family.avilable_qty
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        our_family = MoveableAssetDetails.objects.filter(mangement=management)
        serializer = MoveableAssetDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_movableasset_details(request,pk):
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
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    try:
        customer = MoveableAssetDetails.objects.get(pk=pk)  
        prev_av_qty=customer.avilable_qty
        prev_total_qty=customer.total_qty
    except MoveableAssetDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = MoveableAssetDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True:
            # rental_check=MovableAssetsRentTable.objects.filter(asset_id=pk)
            # if rental_check:
            #     return Response({'message': 'Cant be edited as this is involved in transactions'},status=status.HTTP_302_FOUND)  
            try:
                data=request.data
                check_units = MoveableAssetDetails.objects.filter(category_id=data['category'],mangement=management).exclude(id=pk)
                for one in check_units:
                    if one.asset_name==str(data['asset_name']):
                        dict6={}
                        dict6['message']= "Data already exists"
                        dict6['data']=request.data
                        return Response(dict6,status=status.HTTP_226_IM_USED)
            except Exception:
                return Response(request.data,status=status.HTTP_417_EXPECTATION_FAILED)
            
            serializer876 = MoveableAssetDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                new_avil_qty=temp_family.avilable_qty
                if customer.rent_qty>0:
                    if prev_av_qty>new_avil_qty:
                        cal_diff_avil=prev_av_qty-new_avil_qty
                        temp_family.avilable_qty=cal_diff_avil
                        temp_family.total_qty-=cal_diff_avil
                        temp_family.save()
                    else:
                        cal_diff_avil=new_avil_qty-prev_av_qty
                        temp_family.total_qty+=cal_diff_avil
                        temp_family.save()    
                else:
                    temp_family.total_qty=temp_family.avilable_qty
                    temp_family.save()
                        
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
    elif request.method == 'PATCH': 
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True:    
            serializer876 = MoveableAssetDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.asset_edit ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.asset_del ==True:  
            rental_check=MovableAssetsRentTable.objects.filter(asset_id=pk)
            if rental_check:
                return Response({'message': 'Cant be deleted as this is involved in transactions'},status=status.HTTP_302_FOUND)
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    

@api_view(['GET'])
def lease_page_categ_wise_movable_asset_details(request):
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

    if request.method == 'GET':
        all_category=MoveableAssetCategory.objects.filter(mangement=management)
        lease_page=[]
        for one_cate in all_category:
            dict76={}
            ser2=MoveableAssetCategorySerializer(one_cate)
            # assets=MoveableAssetDetails.objects.filter(category=one_cate,mangement=management)
            assets=MoveableAssetDetails.objects.filter(category=one_cate,avilable_qty__gt=0,mangement=management)
            ser3=MoveableAssetDetailsSerializer(assets,many=True)
            dict76['category']=ser2.data
            dict76['assets']=ser3.data
            lease_page.append(dict76)
        return Response(lease_page,status=status.HTTP_200_OK)