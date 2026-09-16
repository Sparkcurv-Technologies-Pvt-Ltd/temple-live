from rest_framework.views import APIView
from .serializers import UserSerializer,MyUserSerializer,MyUserSerializer2,RejinUserSerializer,Investor_user_Serializer
from rest_framework.response import Response
from .models import User
import jwt
from rest_framework.decorators import api_view
from rest_framework import status
import logging
import datetime
from token_app.views import token_checking, generate_token
from other_people.models import OtherPeopleDetails
from other_people.serializers import OtherPeopleDetailsSerializer
from management.models import ManagementDetails
from permisions.models import Permisions
from family.models import Member_Details

login_logout_logger = logging.getLogger('login_logout')

class RegisterView(APIView):
    def post(self, request):
        rejin=token_checking(request)
        if not rejin:
            return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
        if not rejin.is_active:
            return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
        get_role=rejin.user_role
        super_power=rejin.is_superuser
        if get_role =='Admin' or super_power:
            serializer=UserSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            my_user=serializer.save()
            my_user.user_role = "User"
            my_user.username=my_user.name
            my_user.save() 
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_200_OK)

class RegisterView999(APIView):
    def post(self, request):
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
        super_power=rejin.is_superuser
        if get_role =='Admin' or super_power:
            serializer=RejinUserSerializer(data=request.data)
            if serializer.is_valid():
                # serializer.is_valid(raise_exception=True)
                my_user=serializer.save()
                my_user.user_role = "User"
                my_user.username=my_user.name
                my_user.management_profile=management
                my_user.created_by=rejin.id
                my_user.save() 
                if my_user.user_native_type !=None:
                    if my_user.user_native_type=='Other':
                        dict87={}
                        dict87['name']=my_user.othersname
                        dict87['mobile_number']=my_user.mobile_number
                        dict87['email']=my_user.person_email
                        dict87['address']=my_user.address
                        dict87['gender']=my_user.gender
                        serializer65=OtherPeopleDetailsSerializer(data=dict87)
                        serializer65.is_valid(raise_exception=True)
                        oo=serializer65.save()
                        oo.created_by=rejin.id
                        oo.added_for='User'
                        oo.management_profile=management
                        oo.save()
                return Response(serializer.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_200_OK)
        
class RegisterView2(APIView):
    def post(self, request):
        serializer=UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        my_user=serializer.save()
        my_user.user_role = "Admin"
        my_user.username=my_user.name
        my_user.save()  
        return Response(serializer.data,status=status.HTTP_201_CREATED)

    
class LoginView(APIView):
    def post(self, request):
        
        fam_mem=Member_Details.objects.all()
        for one_mem in fam_mem:
            if one_mem.member_dob:
                today = datetime.date.today()
                one_mem.member_age = today.year - one_mem.member_dob.year - ((today.month, today.day) < (one_mem.member_dob.month, one_mem.member_dob.day))
                one_mem.save()
            if one_mem.member_age!=None and one_mem.member_age>=18:
                one_mem.adult=True
                one_mem.save()
                
            if not one_mem.death and one_mem.member_relation_ship=='SON' or one_mem.member_relation_ship=='FATHER':
                get_tax_age=ManagementDetails.objects.all().first().tax_age
                if get_tax_age>0:
                    gov_tax=get_tax_age
                    
                    if one_mem.member_age >= gov_tax:
                        one_mem.member_tax_eligible = True
                        one_mem.save()
                    else:
                        one_mem.member_tax_eligible = False
                        one_mem.save()
                        
        email=request.data['email']
        password=request.data['password']
        user=User.objects.filter(email=email).first()        
        if user is None:
            # raise AuthenticationFailed('user not found')
            login_logout_logger.warning(f"Login attempt failed for user '.")
            return Response({'message':'User not found'},status=status.HTTP_204_NO_CONTENT)
        
        if not user.check_password(password):
            # raise AuthenticationFailed('incorrect password!')
            login_logout_logger.warning(f"Login attempt failed for user '{user.email}'.")
            return Response({'message':'Incorrect password!'},status=status.HTTP_204_NO_CONTENT)
            
        user_active=user.is_active
        if user_active:
        
            # 60 minuts
            
            # payload={
            #     "id":user.id,
            #     "exp":datetime.datetime.utcnow()+datetime.timedelta(hours=8),
            #     "iat":datetime.datetime.utcnow()
            # }
            
            # 24 hours
            payload={
                "id":user.id,
                "exp":datetime.datetime.utcnow()+datetime.timedelta(hours=8),
                "iat":datetime.datetime.utcnow(),
            }
            
            token=jwt.encode(payload,'secret',algorithm='HS256')
            response=Response()
            response.set_cookie(key='jwt',value=token,httponly=True)
            
            if user.user_role!="Invester" and user.user_role!="Admin" and user.is_superuser==False:
                perms=Permisions.objects.filter(role_link_id=user.my_role.id).first()
                print(user.user_role)
                print(perms)               
                dic1={}
                # dic2={}
                dic3={}
                dic4={}
                dic5={}
                dic6={}
                dic7={}
                dic8={}
                dic9={}
                dic10={}
                dic11={}
                # dic12={}
                dic13={}
                dic14={}
                dic15={}
                # dic16={}
                dic17={}
                dic18={}
                dic19={}
                dic20={}
                dic21={}
                dic22={}
                dic23={}
                dic24={}
                dic25={}
                dic26={}
                dic27={}
                dic28={}
                dic29={}
                dic30={}
                dic31={}
                dict={}
                dict32={}
                dict33={}
                dict34={}

                print("hhhhhhhhhhh") 
                if perms.dashboard:
                    dic21['dashboard']=True
                else:
                    dic21['dashboard']=False
                dict['dashboard']=dic21
                # family              
                if perms.fam_add:
                    dic1['Add']=True
                else:
                    dic1['Add']=False
                if perms.fam_edit:
                    dic1['Edit']=True
                else:
                    dic1['Edit']=False
                if perms.fam_view:
                    dic1['View']=True
                else:
                    dic1['View']=False
                if perms.fam_delete:
                    dic1['Delete']=True
                else:
                    dic1['Delete']=False
                dict['Family']=dic1             

                #asset
                if perms.asset_add:
                    dic3['Add']=True
                else:
                    dic3['Add']=False
                if perms.asset_edit:
                    dic3['Edit']=True
                else:
                    dic3['Edit']=False
                if perms.asset_view:
                    dic3['View']=True
                else:
                    dic3['View']=False
                if perms.asset_delete:
                    dic3['Delete']=True
                else:
                    dic3['Delete']=False
                dict['Assets']=dic3


                #Expense
                if perms.expense_add:
                    dic4['Add']=True
                else:
                    dic4['Add']=False
                if perms.expense_edit:
                    dic4['Edit']=True
                else:
                    dic4['Edit']=False
                if perms.expense_view:
                    dic4['View']=True
                else:
                    dic4['View']=False
                if perms.expense_delete:
                    dic4['Delete']=True
                else:
                    dic4['Delete']=False
                dict['Expense']=dic4


                #Collection
                # if perms.collection_add:
                #     dic5['Add']=True
                # else:
                #     dic5['Add']=False
                # if perms.collection_edit:
                #     dic5['Edit']=True
                # else:
                #     dic5['Edit']=False
                # if perms.collection_view:
                #     dic5['View']=True
                # else:
                #     dic5['View']=False
                # if perms.collection_del:
                #     dic5['Delete']=True
                # else:
                #     dic5['Delete']=False
                # dict['Collection']=dic5


                #management
                # if perms.manage_add:
                #     dic6['Add']=True
                # else:
                #     dic6['Add']=False
                # if perms.manage_edit:
                #     dic6['Edit']=True
                # else:
                #     dic6['Edit']=False
                # if perms.manage_view:
                #     dic6['View']=True
                # else:
                #     dic6['View']=False
                # if perms.manage_del:
                #     dic6['Delete']=True
                # else:
                #     dic6['Delete']=False
                # dict['Management']=dic6

                #fund
                if perms.fund_add:
                    dic7['Add']=True
                else:
                    dic7['Add']=False
                if perms.fund_edit:
                    dic7['Edit']=True
                else:
                    dic7['Edit']=False
                if perms.fund_view:
                    dic7['View']=True
                else:
                    dic7['View']=False
                if perms.fund_delete:
                    dic7['Delete']=True
                else:
                    dic7['Delete']=False
                dict['Fund_list']=dic7

                #chit fund
                if perms.chit_fund_add:
                    dic8['Add']=True
                else:
                    dic8['Add']=False
                if perms.chit_fund_edit:
                    dic8['Edit']=True
                else:
                    dic8['Edit']=False
                if perms.chit_fund_view:
                    dic8['View']=True
                else:
                    dic8['View']=False
                if perms.chit_fund_delete:
                    dic8['Delete']=True
                else:
                    dic8['Delete']=False
                dict['Chitfund']=dic8

                #fund lease
                # if perms.fund_lease_add:
                #     dic9['Add']=True
                # else:
                #     dic9['Add']=False
                # if perms.fund_lease_edit:
                #     dic9['Edit']=True
                # else:
                #     dic9['Edit']=False
                # if perms.fund_lease_view:
                #     dic9['View']=True
                # else:
                #     dic9['View']=False
                # if perms.fund_lease_del:
                #     dic9['Delete']=True  
                # else:
                #     dic9['Delete']=False
                # dict['Fund lease']=dic9  

                #authority
                if perms.authority_add:
                    dic10['Add']=True
                else:
                    dic10['Add']=False
                if perms.authority_edit:
                    dic10['Edit']=True
                else:
                    dic10['Edit']=False
                if perms.authority_view:
                    dic10['View']=True
                else:
                    dic10['View']=False
                if perms.authority_delete:
                    dic10['Delete']=True
                else:
                    dic10['Delete']=False
                dict['Authority']=dic10

                #user
                # if perms.user_add:
                #     dic11['Add']=True
                # else:
                #     dic11['Add']=False
                # if perms.user_edit:
                #     dic11['Edit']=True
                # else:
                #     dic11['Edit']=False
                # if perms.user_view:
                #     dic11['View']=True
                # else:
                #     dic11['View']=False
                # if perms.user_del:
                #     dic11['Delete']=True
                # else:
                #     dic11['Delete']=False
                # dict['User']=dic11

                #death
                if perms.death_add:
                    dic13['Add']=True
                else:
                    dic13['Add']=False
                if perms.death_edit:
                    dic13['Edit']=True
                else:
                    dic13['Edit']=False
                if perms.death_view:
                    dic13['View']=True
                else:
                    dic13['View']=False
                if perms.death_delete:
                    dic13['Delete']=True
                else:
                    dic13['Delete']=False
                dict['Death']=dic13

                #marriage
                if perms.marriage_add:
                    dic14['Add']=True
                else:
                    dic14['Add']=False
                if perms.marriage_edit:
                    dic14['Edit']=True
                else:
                    dic14['Edit']=False
                if perms.marriage_view:
                    dic14['View']=True
                else:
                    dic14['View']=False
                if perms.marriage_delete:
                    dic14['Delete']=True
                else:
                    dic14['Delete']=False
                dict['Marriage']=dic14  
               
                #income
                if perms.income_add:
                    dic15['Add']=True
                else:
                    dic15['Add']=False
                if perms.income_edit:
                    dic15['Edit']=True
                else:
                    dic15['Edit']=False
                if perms.income_view:
                    dic15['View']=True
                else:
                    dic15['View']=False
                if perms.income_delete:
                    dic15['Delete']=True
                else:
                    dic15['Delete']=False
                dict['Income']=dic15

                #sangam
                if perms.sangam_add:
                    dic17['Add']=True
                else:
                    dic17['Add']=False
                if perms.sangam_edit:
                    dic17['Edit']=True
                else:
                    dic17['Edit']=False
                if perms.sangam_view:
                    dic17['View']=True
                else:
                    dic17['View']=False
                if perms.sangam_delete:
                    dic17['Delete']=True
                else:
                    dic17['Delete']=False
                dict['Sangam']=dic17
                #rental
                if perms.rental_add:
                    dic18['Add']=True
                else:
                    dic18['Add']=False
                if perms.rental_view:
                    dic18['View']=True
                else:
                    dic18['View']=False
                if perms.rental_edit:
                    dic18['Edit']=True
                else:
                    dic18['Edit']=False
                if perms.rental_delete:
                    dic18['Delete']=True
                else:
                    dic18['Delete']=False
                dict['Rental']=dic18
                # festival
                if perms.festival_add:
                    dic19['Add']=True
                else:
                    dic19['Add']=False
                if perms.festival_view:
                    dic19['View']=True
                else:
                    dic19['View']=False
                if perms.festival_edit:
                    dic19['Edit']=True
                else:
                    dic19['Edit']=False
                if perms.festival_delete:
                    dic19['Delete']=True
                else:
                    dic19['Delete']=False
                dict['Festival_list']=dic19
                # sub_tariff
                if perms.sub_tarif_add:
                    dic20['Add']=True
                else:
                    dic20['Add']=False
                if perms.sub_tarif_view:
                    dic20['View']=True
                else:
                    dic20['View']=False
                if perms.sub_tarif_edit:
                    dic20['Edit']=True
                else:
                    dic20['Edit']=False
                if perms.sub_tarif_delete:
                    dic20['Delete']=True
                else:
                    dic20['Delete']=False
                dict['SubTariff']=dic20
                # tax
                # if perms.tax_add:
                #     dic21['Add']=True
                # else:
                #     dic21['Add']=False
                # if perms.tax_edit:
                #     dic21['Edit']=True
                # else:
                #     dic21['Edit']=False
                # if perms.tax_view:
                #     dic21['View']=True
                # else:
                #     dic21['View']=False
                # if perms.tax_del:
                #     dic21['Delete']=True
                # else:
                #     dic21['Delete']=False
                # dict['Tax']=dic21
                   # interest
                if perms.interest_add:
                    dic22['Add']=True
                else:
                    dic22['Add']=False
                if perms.interest_edit:
                    dic22['Edit']=True
                else:
                    dic22['Edit']=False
                if perms.interest_view:
                    dic22['View']=True
                else:
                    dic22['View']=False
                if perms.interest_delete:
                    dic22['Delete']=True
                else:
                    dic22['Delete']=False
                dict['Interest']=dic22
                # balance sheet
                if perms.balance_sheet_view:
                    dic23['View']=True
                else:
                    dic23['View']=False
                dict['BalanceSheet']=dic23
                # amount_collection
                if perms.fund:
                    dic24['Fund']=True
                else:
                    dic24['Fund']=False
                dict['Fund']=dic24

                if perms.festival:
                    dic25['Festival']=True
                else:
                    dic25['Festival']=False
                dict['Festival']=dic25

                if perms.rent:
                    dic25['Rent']=True
                else:
                    dic25['Rent']=False
                dict['Rent']=dic25

                if perms.lease:
                    dic26['Lease']=True
                else:
                    dic26['Lease']=False
                dict['Lease']=dic26
                if perms.management_interest:
                    dic27['ManagementInterest']=True
                else:
                    dic27['ManagementInterest']=False
                dict['ManagementInterest']=dic27
                if perms.chit_interest:
                    dic28['ChitInterest']=True
                else:
                    dic28['ChitInterest']=False
                dict['ChitInterest']=dic28
                if perms.sub_tariff:
                    dic29['SubTariffCollection']=True
                else:
                    dic29['SubTariffCollection']=False
                dict['SubTariffCollection']=dic29
                if perms.balance:
                    dic30['Balance']=True
                else:
                    dic30['Balance']=False
                dict['Balance']=dic30
                if perms.death_tariff:
                    dic31['DeathTariff']=True
                else:
                    dic31['DeathTariff']=False
                dict['DeathTariff']=dic31
                if perms.moveable_asset_rent:
                    dict32['Movableassetrent']=True
                else:
                   dict32['Movableassetrent']=False
                dict['Movableassetrent']=dict32
                if perms.marriage:
                    dict33['Marriagecollection']=True
                else:
                   dict33['Marriagecollection']=False
                dict['Marriagecollection']=dict33

                dict['Management_view']=True
                dict['collection']=True
                if perms.bank_transaction_add:
                    dict34['Add']=True
                else:
                    dict34['Add']=False
                if perms.bank_transaction_edit:
                    dict34['Edit']=True
                else:
                    dict34['Edit']=False
                if perms.bank_transaction_delete:
                    dict34['Delete']=True
                else:
                    dict34['Delete']=False
                if perms.bank_transaction_view:
                    dict34['View']=True
                else:
                    dict34['View']=False
                dict['Cash_transaction']=dict34
                    
            else:
                dict={}
            response.data={
                'jwt':token,
                'role':user.user_role,
                'permission':dict,
                'superUsers':user.is_superuser,
                "exp":datetime.datetime.utcnow()+datetime.timedelta(hours=8),
                'username':user.name,
                'email':user.email,
                
            }
            login_logout_logger.info(f"User '{user.email}' logged in.")
            return response
        else:
            return Response({"message":'Contact Admin'},status=status.HTTP_401_UNAUTHORIZED)
        

@api_view(['GET','PUT','PATCH','DELETE'])
def user_edit(request, pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    super_power=rejin.is_superuser
    try:
        transformer = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        if get_role =='Admin' or super_power:
            serializer = RejinUserSerializer(transformer)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_401_UNAUTHORIZED)
  
    elif request.method == 'PUT':
        if get_role =='Admin' or super_power:
            serializer = RejinUserSerializer(transformer, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'PATCH':
        if get_role =='Admin' or super_power:
            serializer = RejinUserSerializer(transformer,data=request.data,partial=True)
            if serializer.is_valid():
                smy_user=serializer.save()
                try:
                    take_pass=serializer.validated_data['password']
                    smy_user.set_password(take_pass)
                    smy_user.password_new=take_pass
                    smy_user.save() 
                except Exception:
                    print('nothing')
                return Response(serializer.data,status=status.HTTP_200_OK)  
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_401_UNAUTHORIZED)
  
    elif request.method == 'DELETE':
        if get_role =='Admin' or super_power:
            transformer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            print('role else condition')
            return Response({'message':'Un-authenticate'},status=status.HTTP_401_UNAUTHORIZED)
        
@api_view(['GET'])
def users_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    super_power=rejin.is_superuser
    if request.method == 'GET':
        if get_role =='Admin' or super_power:
            all_users=User.objects.filter(user_role='User').order_by("-created_at")
            serializer = RejinUserSerializer(all_users,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_401_UNAUTHORIZED)
        

       
        
@api_view(['GET'])
def admins_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    super_power=rejin.is_superuser
    if request.method == 'GET':
        if get_role =='Admin' or super_power:
            all_users=User.objects.filter(user_role='Admin').exclude(id=rejin.id).order_by('-created_at')
            serializer = UserSerializer(all_users,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_401_UNAUTHORIZED)
        

@api_view(['PATCH'])
def g_user_Enable(request, pk):
   
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    super_power=rejin.is_superuser   
    try:
        transformer = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)   
    if request.method == 'PATCH':
        # get_role=user.user_choice
        if get_role =='Admin' or super_power:
            transformer.is_active=True
            transformer.status='Enabled'
            transformer.save()
            serializer=RejinUserSerializer(transformer)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            print('role else condition')
            return Response({'message':'Un-authenticate'},
                                status=status.HTTP_401_UNAUTHORIZED)
        

         
@api_view(['PATCH'])
def g_user_disable(request, pk):   
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    super_power=rejin.is_superuser
    try:
        transformer = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)   
    if request.method == 'PATCH':
        # get_role=user.user_choice       
        if get_role =='Admin' or super_power:
            transformer.is_active=False
            transformer.status='Disabled'
            transformer.save()
            serializer=RejinUserSerializer(transformer)

            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            print('role else condition')
            return Response({'message':'Un-authenticate'},
                                status=status.HTTP_401_UNAUTHORIZED)



########################INVESTOR REG
        

class RegisterViewinvestor(APIView):
    def post(self, request):
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
        super_power=rejin.is_superuser
        if get_role =='Admin' or super_power:
            serializer=Investor_user_Serializer(data=request.data)
            if serializer.is_valid():
                # serializer.is_valid(raise_exception=True)
                my_user=serializer.save()
                my_user.username=my_user.name
                my_user.management_profile=management
                my_user.created_by=rejin.id
                my_user.user_role='Invester'
                my_user.is_investor=True
                my_user.save() 
                return Response(serializer.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':'Un-authenticate'},status=status.HTTP_200_OK)













