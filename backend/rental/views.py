from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import RentalAndLeaseDetails,MovableAssetsRents,MovableAssetsRentTable
from django.db.models import Sum 
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails,BankDetails
from permisions.models import Permisions
from balancesheet.models import RentalBalanceSheet
from datetime import datetime,date
from dateutil.relativedelta import relativedelta
from assets.models import AssetDetails
from reports.models import Report
from treasure.models import ManagementTreasure
from collection.models import CollectionDetails
from collection.serializers import CollectionDetailsSerializer
from balancesheet.serializers import RentalBalanceSheetSerializer
from .serializers import MovableAssetsRentsSerializer,RentalAndLeaseDetailsSerializer
from balancesheet.models import MoveableRentBalanceSheet
from balancesheet.serializers import MoveableRentBalanceSheetSerializer


@api_view(['GET','POST'])
def add_lease_things(request):
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
    print("9999999999")
    if request.method =='POST':
        print(request.data) 
        print(rejin)   
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        print(get_role)
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.rental_add ==True):           
            print("hjuhgggg")
            serializer876 = RentalAndLeaseDetailsSerializer(data=request.data)
            if serializer876.is_valid():                
                if request.data['rent']=='true':    
                    print(request.data)
                    start_date=request.data['start_date']
                    end_range=request.data['end_range']        
                    
                    if request.data['rent_pay_type']=="Month":
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")                    
                     
                        end_date_obj = datetime.strptime(end_range, "%Y-%m")
                        print("0000000000000000")            
                        
                        print(end_range)
                        print(type(end_date_obj.year))
                        print(type(end_date_obj.month))
                        print(type(end_date_obj))
                        # print(type(end_date_obj)) 
                        delta = relativedelta(end_date_obj, start_date_obj)
                        print(delta)
                        print("bbbbbbbbbbbbbbbbbbb")
                        print(delta.months)
                        month_diff=int(delta.months) + (int(delta.years) * 12) 
                        if  month_diff ==0 and delta.days < 0 :
                            print("hujyuiooollllllllllllllllllllllllll")

                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        if (start_date_obj.year) > end_date_obj.year or  month_diff !=0 and  month_diff < 1  :                     
                        
                       
                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        else:
                        # if (start_date.month)>end_date_obj.month and (start_date.year)==end_date_obj.year or (start_date.month)>end_date_obj.month and (start_date.year)!=end_date_obj.year:
                            temp_family=serializer876.save()
                            asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                            asset_check.is_booked=True
                            asset_check.save()
                            temp_family.created_by=rejin.id
                            temp_family.management_profile=management
                            temp_family.save()
                            end_date_obj = datetime.strptime(end_range, "%Y-%m")
                            strip=end_date_obj + relativedelta(days=(start_date_obj.day)-1)
                            print(strip)
                            print(end_date_obj)
                            temp_family.end_date=strip.date()                        
                            print("hyhyyyy")                        
                            temp_family.save()                   
                            delta = relativedelta(end_date_obj, start_date_obj)
                            print(delta)
                            print("bbbbbbbbbbbbbbbbbbb")
                            print(delta.months)
                            month=int(delta.months) + (int(delta.years) * 12)
                            print(month)
                            RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,total_months=month)
                    
                    elif request.data['rent_pay_type']=="Year":
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")                     
                        
                        end_date_obj = datetime.strptime(end_range, "%Y")                        
                        print(end_range)
                        print(type(end_range))
                        print(type(end_date_obj))                        
                        if end_range <= str(start_date_obj.year):
                             return Response({'message': 'Please select proper year'},status=status.HTTP_302_FOUND)
                        temp_family=serializer876.save()
                        asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                        asset_check.is_booked=True
                        asset_check.save()
                        temp_family.created_by=rejin.id
                        temp_family.management_profile=management
                        temp_family.save() 
                        if end_range > str(start_date_obj.year):                        
                            
                            print(end_date_obj)
                            strip=end_date_obj + relativedelta(months=(start_date_obj.month),day=(start_date_obj.day))
                            print(strip)
                            temp_family.end_date=strip.date()
                            temp_family.save()
                            print(end_date_obj)
                            print(type(end_date_obj))
                            print(type(start_date_obj))
                            year_diff=(end_date_obj.year)-(start_date_obj.year)
                            print(year_diff)
                            RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,total_months=year_diff)
                        
                    # treasure_check=ManagementTreasure.objects.filter(management_profile=management).first()
                    if temp_family.initial_advance_amt>0:
                        # treasure_check.cash_in_hand += temp_family.initial_advance_amt
                        # treasure_check.save()               
                        m_treasure=ManagementTreasure.objects.filter(management_profile=management).first()
                        if m_treasure:
                            if temp_family.bank_link!=None:
                                my_bank=BankDetails.objects.filter(id=temp_family.bank_link_id).first()
                                if my_bank:
                                    my_bank.credit_amt+=temp_family.initial_advance_amt
                                    my_bank.save()
                                    
                                    m_treasure.bank_amt+=temp_family.initial_advance_amt
                                    m_treasure.save()
                            else:
                                m_treasure.cash_in_hand+= temp_family.initial_advance_amt
                                m_treasure.save()
                        Report.objects.create(banks=temp_family.bank_link,type_choice="Addition",management_profile=management,members=temp_family.tenat_member,rentsandlease=temp_family,amount=temp_family.initial_advance_amt,created_by=rejin.id)
                        
                            
                        
                    return Response(serializer876.data,status=status.HTTP_201_CREATED) 
                    # elif temp_family.rent_pay_type=="Choose Date":
                    #     start_date=temp_family.start_date
                    #     end_range=temp_family.end_range
                    #     temp_family.end_date= temp_family.end_range
                    #     temp_family.save()
                    #     RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,total_months=month,balance_amt=temp_family.rent_amt,credit_amt=temp_family.rent_amt)


                elif request.data['rent']=="false":
                    print("jjjjjjjjjjjj")
                    end_range=request.data['end_range']  
                    start_date=request.data['start_date']                  
                    if request.data['rent_pay_type']=="Month":                       
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")                        
                        end_date_obj = datetime.strptime(end_range, "%Y-%m")
                        print("0000000000000000")                    
                        
                        print(end_range)
                        print(type(end_date_obj.year))
                        print(type(end_date_obj.month))
                        print(type(end_date_obj))
                        # print(type(end_date_obj))
                        
                        year_diff=end_date_obj.year-start_date_obj.year
                        delta = relativedelta(end_date_obj, start_date_obj)
                        print(delta)
                        print("bbbbbbbbbbbbbbbbbbb")
                        print(delta.months)
                        month_diff=int(delta.months) + (int(delta.years) * 12) 
                        if  month_diff ==0 and delta.days < 0 :
                            print("hujyuiooollllllllllllllllllllllllll")

                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        if (start_date_obj.year) > end_date_obj.year or  month_diff !=0 and  month_diff < 1  :
                        

                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        else:
                            temp_family=serializer876.save()
                            asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                            asset_check.is_booked=True
                            asset_check.save()
                            temp_family.created_by=rejin.id
                            temp_family.management_profile=management
                            temp_family.save() 
                        # if (start_date.month)>end_date_obj.month and (start_date.year)==end_date_obj.year or (start_date.month)>end_date_obj.month and (start_date.year)!=end_date_obj.year:
                            end_date_obj = datetime.strptime(end_range, "%Y-%m")
                            strip=end_date_obj + relativedelta(days=(start_date_obj.day)-1)
                            print(strip)
                            print(end_date_obj)
                            temp_family.end_date=strip.date()                        
                            print("hyhyyyy")                        
                            temp_family.save()
                            RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,balance_amt=temp_family.rent_amt,credit_amt=temp_family.rent_amt,lease=True)

                            # RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,balance_amt=temp_family.rent_amt,credit_amt=temp_family.rent_amt)

                        
                    
                    elif request.data['rent_pay_type']=="Year":
                        
                        end_date_obj = datetime.strptime(end_range, "%Y")
                        
                        print(end_range)
                        print(type(end_range))
                        print(type(end_date_obj))
                        print(start_date)
                        print(type(start_date))
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                        print(type(start_date_obj))
                        if end_range <= str(start_date_obj.year):
                                return Response({'message': 'Please select proper year'},status=status.HTTP_302_FOUND)
                        temp_family=serializer876.save()
                        asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                        asset_check.is_booked=True
                        asset_check.save()
                        temp_family.created_by=rejin.id
                        temp_family.management_profile=management
                        temp_family.save() 
                        if end_range > str(start_date_obj.year):
                            print("000000000000000")
                            start_date=temp_family.start_date                            
                            print(end_range)
                            end_date_obj = datetime.strptime(end_range, "%Y")
                            print(end_date_obj)
                            strip=end_date_obj + relativedelta(months=(start_date.month),day=(start_date.day))
                            print(strip)
                            print(strip.date())
                            temp_family.end_date=strip.date()
                            print("llllllllllllllllll")
                            temp_family.save()
                            RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,balance_amt=temp_family.rent_amt,credit_amt=temp_family.rent_amt,lease=True)

                            # RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,balance_amt=temp_family.rent_amt,credit_amt=temp_family.rent_amt)
          
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to add rental"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'GET':
        our_family = RentalAndLeaseDetails.objects.filter(management_profile=management)
        serializer = RentalAndLeaseDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

@api_view(['GET','POST'])
def get_lease_things(request):
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
    if request.method=="GET":
        rental_get=RentalAndLeaseDetails.objects.filter(rent=False,management_profile=management)
        serializer = RentalAndLeaseDetailsSerializer(rental_get,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)


@api_view(['GET','POST'])
def get_rent_things(request):
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
    if request.method=="GET":
        rental_get=RentalAndLeaseDetails.objects.filter(rent=True,management_profile=management)
        serializer = RentalAndLeaseDetailsSerializer(rental_get,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

@api_view(['GET','POST'])
def get_moveablerent_things(request):
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
    if request.method=="GET":
        rental_get=MovableAssetsRents.objects.filter(management_profile=management)
        serializer = MovableAssetsRentsSerializer(rental_get,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_lease_things(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    try:
        customer = RentalAndLeaseDetails.objects.get(pk=pk) 
        customer_old_amount=customer.initial_advance_amt 
        old_asset=customer.asset
        if old_asset!=None:
            oldassetid=customer.asset_id
        member_type=customer.tenat_type
        bank_link=customer.bank_link
    except RentalAndLeaseDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = RentalAndLeaseDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.rental_edit ==True):

            if customer.advance_return:
                return Response({'message': 'Cant be edited as the transaction is settled down'},status=status.HTTP_302_FOUND)
            collection_check=CollectionDetails.objects.filter(rentsandlease_id=pk)
            if collection_check:
                return Response({'message': 'Cant be edited as this is involved in transactions'},status=status.HTTP_302_FOUND)
            if (get_role=="User" and perm.rental_edit ==True):
                date_check=  (customer.created_at.date().month != datetime.now().month and customer.created_at.date().year != datetime.now().year)  or  (customer.created_at.date().month != datetime.now().month and customer.created_at.date().year == datetime.now().year)   or (customer.created_at.date().month == datetime.now().month and customer.created_at.date().year != datetime.now().year)     
                if date_check:
                # if customer.created_at__date__month != datetime.now().date().month and customer.created_at__date__year != datetime.now().date().year:
                    return Response({'message': 'Cant be edited as this payment is done in past month'},status=status.HTTP_302_FOUND)
                
            
            prod=request.data
            try:
                if prod['documents_status']=='false':
                    documents_status=False
                else:
                    documents_status=True
            except Exception:
                pass
            
            try:
                if prod['photo_status']=='false':
                    photo_status=False
                else:
                    photo_status=True
            except Exception:
                pass

                
            serializer876 = RentalAndLeaseDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                if request.data['rent']=='true':    
                    print(request.data)
                    start_date=request.data['start_date']
                    end_range=request.data['end_range']         
                    
                    if request.data['rent_pay_type']=="Month":
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")                    
                     
                        end_date_obj = datetime.strptime(end_range, "%Y-%m")                       
                       
                        year_diff=end_date_obj.year-start_date_obj.year
                        delta = relativedelta(end_date_obj, start_date_obj)
                        
                        month_diff=int(delta.months) + (int(delta.years) * 12) 
                        if  month_diff ==0 and delta.days < 0 :
                            
                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        if (start_date_obj.year) > end_date_obj.year or  month_diff !=0 and  month_diff < 1 :                   

                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        else:
                        # if (start_date.month)>end_date_obj.month and (start_date.year)==end_date_obj.year or (start_date.month)>end_date_obj.month and (start_date.year)!=end_date_obj.year:
                            temp_family=serializer876.save()
                            if member_type=="Member" and temp_family.tenat_type=="Other":
                                
                                temp_family.tenat_member_id=None
                                temp_family.save()
                            try:
                                asset_check578=AssetDetails.objects.filter(id=oldassetid).first()
                                asset_check578.is_booked=False
                                asset_check578.save()
                            except Exception:
                                pass
                            asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                            asset_check.is_booked=True
                            asset_check.save()                          
                            
                            
                            temp_family.created_by=rejin.id                            
                            temp_family.save()
                            end_date_obj = datetime.strptime(end_range, "%Y-%m")
                            strip=end_date_obj + relativedelta(days=(start_date_obj.day)-1)
                            
                            temp_family.end_date=strip.date()                        
                                                 
                            temp_family.save()                   
                            delta = relativedelta(end_date_obj, start_date_obj)
                            
                            month=int(delta.months) + (int(delta.years) * 12)
                         
                            treasure_check=ManagementTreasure.objects.filter(management_profile=temp_family.management_profile).first()
                            if customer_old_amount>0:
                                if bank_link != None:
                                    my_banks=BankDetails.objects.filter(id=bank_link.id).first()
                                    if my_banks:
                                        my_banks.credit_amt-=customer_old_amount
                                        my_banks.save()
                                        treasure_check.bank_amt -= customer_old_amount
                                        treasure_check.save()
                                elif bank_link == None:
                                    treasure_check.cash_in_hand -= customer_old_amount
                                    treasure_check.save()
                            if temp_family.initial_advance_amt  > 0:
                                if temp_family.bank_link != None:
                                    my_bankss=BankDetails.objects.filter(id=temp_family.bank_link.id).first()
                                    if my_bankss:
                                        my_bankss.credit_amt+=temp_family.initial_advance_amt
                                        my_bankss.save()
                                        treasure_check.bank_amt += temp_family.initial_advance_amt
                                        treasure_check.save()
                                elif temp_family.bank_link == None:
                                    treasure_check.cash_in_hand += temp_family.initial_advance_amt
                                    treasure_check.save()
                            rent=RentalBalanceSheet.objects.filter(rental_new_amt=temp_family).first()
                            rent.rental_new_amt=temp_family
                            rent.management_profile=temp_family.management_profile
                            rent.total_months=month                           
                            rent.save()
                            if customer_old_amount>0:
                                report_check=Report.objects.filter(rentsandlease_id=pk,collection=None)
                                if report_check:
                                    report_checks=Report.objects.filter(rentsandlease_id=pk,collection=None).first()
                                    if temp_family.initial_advance_amt > 0:
                                        report_checks.amount=temp_family.initial_advance_amt
                                        report_checks.rentsandlease_id=pk
                                        report_checks.members=temp_family.tenat_member
                                        report_checks.created_by=rejin.id
                                        report_checks.management_profile=temp_family.management_profile
                                        report_checks.type_choice="Addition"
                                        report_checks.banks=temp_family.bank_link
                                        report_checks.save()
                                    elif temp_family.initial_advance_amt == 0:
                                        report_checks.delete()
                            elif customer_old_amount==0:
                                if temp_family.initial_advance_amt > 0:
                                    Report.objects.create(banks=temp_family.bank_link,type_choice="Addition",management_profile=temp_family.management_profile,members=temp_family.tenat_member,rentsandlease=temp_family,amount=temp_family.initial_advance_amt,created_by=rejin.id)


                            # RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,total_months=month)
                    
                    elif request.data['rent_pay_type']=="Year":
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")                 
                        print(end_range)
                        end_date_obj = datetime.strptime(end_range, "%Y")                        
                        print(end_range)
                        print(type(end_range))
                        print(type(end_date_obj))                        
                        if end_range <= str(start_date_obj.year):
                             return Response({'message': 'Please select proper year'},status=status.HTTP_302_FOUND)
                        temp_family=serializer876.save()
                        if member_type=="Member" and temp_family.tenat_type=="Other":
                                print("iiiiiiiiiiiiiiiii")
                                temp_family.tenat_member_id=None
                                temp_family.save()
                        try:
                            asset_check578=AssetDetails.objects.filter(id=oldassetid).first()
                            asset_check578.is_booked=False
                            asset_check578.save()
                        except Exception:
                            pass
                        
                        asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                        asset_check.is_booked=True
                        asset_check.save()
                        
                        
                        
                        temp_family.created_by=rejin.id
                        # temp_family.management_profile=management
                        temp_family.save() 
                        if end_range > str(start_date_obj.year):                    
                            
                            print(end_date_obj)
                            strip=end_date_obj + relativedelta(months=(start_date_obj.month),day=(start_date_obj.day))
                            print(strip)
                            temp_family.end_date=strip.date()
                            temp_family.save()
                            print(end_date_obj)
                            print(type(end_date_obj))
                            print(type(start_date_obj))
                            year_diff=(end_date_obj.year)-(start_date_obj.year)
                            print(year_diff)
                             
                            treasure_check=ManagementTreasure.objects.filter(management_profile=temp_family.management_profile).first()
                            if customer_old_amount>0:
                                if bank_link != None:
                                    my_banks=BankDetails.objects.filter(id=bank_link.id).first()
                                    if my_banks:
                                        my_banks.credit_amt-=customer_old_amount
                                        my_banks.save()
                                        treasure_check.bank_amt -= customer_old_amount
                                        treasure_check.save()
                                elif bank_link == None:
                                    treasure_check.cash_in_hand -= customer_old_amount
                                    treasure_check.save()
                            if temp_family.initial_advance_amt  > 0:
                                if temp_family.bank_link != None:
                                    my_bankss=BankDetails.objects.filter(id=temp_family.bank_link.id).first()
                                    if my_bankss:
                                        my_bankss.credit_amt+=temp_family.initial_advance_amt
                                        my_bankss.save()
                                        treasure_check.bank_amt += temp_family.initial_advance_amt
                                        treasure_check.save()
                                elif temp_family.bank_link == None:
                                    treasure_check.cash_in_hand += temp_family.initial_advance_amt
                                    treasure_check.save()                            
                            
                            rent=RentalBalanceSheet.objects.filter(rental_new_amt=temp_family).first()
                            rent.rental_new_amt=temp_family
                            rent.management_profile=temp_family.management_profile
                            rent.total_months=year_diff
                            rent.save()                           # RentalBalanceSheet.objects.create(rental_new_amt=temp_family,management_profile=temp_family.management_profile,total_months=year_diff)
                        
                            
                            if customer_old_amount>0:
                                report_check=Report.objects.filter(rentsandlease_id=pk,collection=None)
                                if report_check:
                                    report_checks=Report.objects.filter(rentsandlease_id=pk,collection=None).first()
                                    if temp_family.initial_advance_amt > 0:
                                        report_checks.amount=temp_family.initial_advance_amt
                                        report_checks.rentsandlease_id=pk
                                        report_checks.members=temp_family.tenat_member
                                        report_checks.created_by=rejin.id
                                        report_checks.management_profile=temp_family.management_profile
                                        report_checks.type_choice="Addition"
                                        report_checks.banks=temp_family.bank_link
                                        report_checks.save()
                                    elif temp_family.initial_advance_amt == 0:
                                        report_checks.delete()
                            elif customer_old_amount==0:
                                if temp_family.initial_advance_amt > 0:
                                    Report.objects.create(banks=temp_family.bank_link,type_choice="Addition",management_profile=temp_family.management_profile,members=temp_family.tenat_member,rentsandlease=temp_family,amount=temp_family.initial_advance_amt,created_by=rejin.id)
                                                 
                    try:
                        if documents_status==False:
                            customer.documents=None
                            customer.save()
                    except Exception:
                        pass
                    try:
                        if photo_status==False:
                            customer.images=None
                            customer.save()
                    except Exception:
                        pass
                    return Response(serializer876.data,status=status.HTTP_201_CREATED) 
                    
                elif request.data['rent']=="false":
                    print("jjjjjjjjjjjj")
                    end_range=request.data['end_range']  
                    start_date=request.data['start_date']                  
                    if request.data['rent_pay_type']=="Month":                       
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")                        
                        end_date_obj = datetime.strptime(end_range, "%Y-%m")
                        print("0000000000000000")            
                        
                        print(end_range)
                        print(type(end_date_obj.year))
                        print(type(end_date_obj.month))
                        print(type(end_date_obj))
                        # print(type(end_date_obj))                        
                        year_diff=end_date_obj.year-start_date_obj.year
                        delta = relativedelta(end_date_obj, start_date_obj)
                        print(delta)
                        print("bbbbbbbbbbbbbbbbbbb")
                        print(delta.months)
                        month_diff=int(delta.months) + (int(delta.years) * 12)
                        if  month_diff ==0 and delta.days < 0 :
                            print("hujyuiooollllllllllllllllllllllllll")
                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        if (start_date_obj.year) > end_date_obj.year or  month_diff !=0 and  month_diff < 1  : 
                       
                            return Response({'message': 'End date cannot be less than start date'},status=status.HTTP_302_FOUND) 
                        else:
                            temp_family=serializer876.save()
                            if member_type=="Member" and temp_family.tenat_type=="Other":
                                print("iiiiiiiiiiiiiiiii")
                                temp_family.tenat_member_id=None
                                temp_family.save()
                            try:
                                asset_check578=AssetDetails.objects.filter(id=oldassetid).first()
                                asset_check578.is_booked=False
                                asset_check578.save()
                            except Exception:
                                pass
                            asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                            asset_check.is_booked=True
                            asset_check.save()
                            
                            
                            
                            temp_family.created_by=rejin.id                            
                            temp_family.save() 
                        # if (start_date.month)>end_date_obj.month and (start_date.year)==end_date_obj.year or (start_date.month)>end_date_obj.month and (start_date.year)!=end_date_obj.year:
                            end_date_obj = datetime.strptime(end_range, "%Y-%m")
                            strip=end_date_obj + relativedelta(days=(start_date_obj.day)-1)
                            print(strip)
                            print(end_date_obj)
                            temp_family.end_date=strip.date()                        
                            print("hyhyyyy")                        
                            temp_family.save()
                            rent=RentalBalanceSheet.objects.filter(rental_new_amt=temp_family,lease=True).first()
                            rent.rental_new_amt=temp_family
                            rent.management_profile=temp_family.management_profile
                            rent.credit_amt=temp_family.rent_amt
                            rent.balance_amt=temp_family.rent_amt
                            rent.save()                          

                        
                    
                    elif request.data['rent_pay_type']=="Year":                        
                        end_date_obj = datetime.strptime(end_range, "%Y")                        
                        print(end_range)
                        print(type(end_range))
                        print(type(end_date_obj))
                        print(start_date)
                        print(type(start_date))
                        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                        print(type(start_date_obj))
                        if end_range <= str(start_date_obj.year):
                                return Response({'message': 'Please select proper year'},status=status.HTTP_302_FOUND)
                        temp_family=serializer876.save()
                        if member_type=="Member" and temp_family.tenat_type=="Other":
                                print("iiiiiiiiiiiiiiiii")
                                temp_family.tenat_member_id=None
                                temp_family.save()
                        try:
                            asset_check578=AssetDetails.objects.filter(id=oldassetid).first()
                            asset_check578.is_booked=False
                            asset_check578.save()
                        except Exception:
                            pass
                        asset_check=AssetDetails.objects.filter(id=temp_family.asset_id).first()
                        asset_check.is_booked=True
                        asset_check.save()
                        
                        
                        
                        temp_family.created_by=rejin.id                        
                        temp_family.save() 
                        if end_range > str(start_date_obj.year):
                            print("000000000000000")
                            start_date=temp_family.start_date                            
                            print(end_range)
                            end_date_obj = datetime.strptime(end_range, "%Y")
                            print(end_date_obj)
                            strip=end_date_obj + relativedelta(months=(start_date_obj.month),day=(start_date_obj.day))
                            print(strip)
                            print(strip.date())
                            temp_family.end_date=strip.date()
                            print("llllllllllllllllll")
                            temp_family.save()
                            rent=RentalBalanceSheet.objects.filter(rental_new_amt=temp_family,lease=True).first()
                            rent.rental_new_amt=temp_family
                            rent.management_profile=temp_family.management_profile
                            rent.credit_amt=temp_family.rent_amt
                            rent.balance_amt=temp_family.rent_amt
                            rent.save() 
                            
                    try:
                        if documents_status==False:
                            customer.documents=None
                            customer.save()
                    except Exception:
                        pass
                    try:
                        if photo_status==False:
                            customer.images=None
                            customer.save()
                    except Exception:
                        pass    
                    
                    return Response(serializer876.data,status=status.HTTP_201_CREATED)
                                     
                return Response(serializer876.data,status=status.HTTP_406_NOT_ACCEPTABLE)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit rental"},status.HTTP_401_UNAUTHORIZED)
            
    
    elif request.method == 'PATCH':  
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.rental_edit ==True):                    
            serializer876 = RentalAndLeaseDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                rent=RentalBalanceSheet.objects.get(rental=temp_family)
                rent.rental=temp_family
                rent.management_profile=temp_family.management_profile
                rent.credit_amt=temp_family.rent_amt
                rent.balance_amt=temp_family.rent_amt
                rent.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"User does not have permission to edit rental"},status.HTTP_401_UNAUTHORIZED)
           
    elif request.method == 'DELETE':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.rental_delete ==True): 
           
            if  customer.advance_return:
                return Response({'message': 'Cant be deleted as the transaction is settled down'},status=status.HTTP_302_FOUND)

            collection_check=CollectionDetails.objects.filter(rentsandlease_id=pk)
            if collection_check:
                return Response({'message': 'Cant be deleted as this is involved in transactions'},status=status.HTTP_302_FOUND)
            if (get_role=="User" and perm.rental_delete ==True):
                date_check=  (customer.created_at.date().month != datetime.now().month and customer.created_at.date().year != datetime.now().year)  or  (customer.created_at.date().month != datetime.now().month and customer.created_at.date().year == datetime.now().year)   or (customer.created_at.date().month == datetime.now().month and customer.created_at.date().year != datetime.now().year)     
                if date_check:
                # if customer.created_at__date__month != datetime.now().date().month and customer.created_at__date__year != datetime.now().date().year:
                    return Response({'message': 'Cant be deleted as this transactions are done in past month'},status=status.HTTP_302_FOUND)
            if customer.rent:
                report_check=Report.objects.filter(rentsandlease_id=pk,collection=None)
                if report_check:
                    report_checks=Report.objects.filter(rentsandlease_id=pk,collection=None).first()
                    report_checks.delete()
                    treasure_check=ManagementTreasure.objects.filter(management_profile=customer.management_profile).first()
                    if customer_old_amount>0:
                        if bank_link != None:
                            my_banks=BankDetails.objects.filter(id=bank_link.id).first()
                            if my_banks:
                                my_banks.credit_amt-=customer_old_amount
                                my_banks.save()
                                treasure_check.bank_amt -= customer_old_amount
                                treasure_check.save()
                        elif bank_link == None:
                            treasure_check.cash_in_hand -= customer_old_amount
                            treasure_check.save()
                balance_check=RentalBalanceSheet.objects.filter(rental_new_amt_id=pk).first()
                balance_check.delete()
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)        
        return Response({'message':"User does not have permission to delete rental"},status.HTTP_401_UNAUTHORIZED)


        
@api_view(['GET','PUT',"DELETE"])
def rent_viewlist(request,pk):
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
    rental_details=RentalAndLeaseDetails.objects.filter(id=pk).first()
    serializer=RentalAndLeaseDetailsSerializer(rental_details)
    balance_rent_details=RentalBalanceSheet.objects.filter(rental_new_amt_id=pk).first()
    serializer2=RentalBalanceSheetSerializer(balance_rent_details)
    collection_details=CollectionDetails.objects.filter(rentsandlease_id=pk)
    out=[]
    collection_amount=CollectionDetails.objects.filter(rentsandlease_id=pk).aggregate(Sum('amount')).get('amount__sum')
    serializer3=CollectionDetailsSerializer(collection_details,many=True)
    out.append(serializer3.data)

    dict32={}
    dict32['rent_lease']=serializer.data
    dict32['rent_balance_sheet']=serializer2.data
    dict32['collection_details']=out
    dict32['collection_amount']=collection_amount
    return Response(dict32,status=status.HTTP_200_OK)


        
@api_view(['GET','PUT',"DELETE"])
def movablerentasset_viewlist(request,pk):
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
    rental_details=MovableAssetsRents.objects.filter(id=pk).first()
    serializer=MovableAssetsRentsSerializer(rental_details)
    balance_rent_details=MoveableRentBalanceSheet.objects.filter(rental_new_amt_id=pk).first()
    serializer2=MoveableRentBalanceSheetSerializer(balance_rent_details)
    collection_details=CollectionDetails.objects.filter(moveablerent_id=pk)
    out=[]
    collection_amount=CollectionDetails.objects.filter(moveablerent_id=pk).aggregate(Sum('amount')).get('amount__sum')
    serializer3=CollectionDetailsSerializer(collection_details,many=True)
    out.append(serializer3.data)

    dict32={}
    dict32['rent_lease']=serializer.data
    dict32['rent_balance_sheet']=serializer2.data
    dict32['collection_details']=out
    dict32['collection_amount']=collection_amount
    return Response(dict32,status=status.HTTP_200_OK)

    


@api_view(['PUT'])
def rental_advance_settlement(request,pk):
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
    if request.method =='PUT':
        try: 
            advance_settlement_amt=float(request.data['initial_advance_amt'])
        except Exception:
            return Response({'message':"Settlement amount convertion error"},status.HTTP_417_EXPECTATION_FAILED)
            
        checking=RentalAndLeaseDetails.objects.filter(id=pk).first()
        if checking.rent==True:
            if checking.action==False:
                return Response({'message':"Settlement has been done before"},status.HTTP_302_FOUND) 
            if checking.advance_settlement_amt and checking.advance_return==True:
                return Response({'message':"Settlement has been done before"},status.HTTP_302_FOUND)  
                
            if checking.initial_advance_amt!=None:
                c_in_amt=float(checking.initial_advance_amt)
            else:
                return Response({'message':"No initial advance amount"},status.HTTP_302_FOUND)       
                        
            if c_in_amt < advance_settlement_amt:
                return Response({'message':"Settlement amount is higher than advance amount"},status.HTTP_302_FOUND)
            balance_check=RentalBalanceSheet.objects.filter(rental_new_amt=pk).first()
            if balance_check.balance_amt >0:
                return Response({'message':"Please pay the balance amount before initiating settlement"},status.HTTP_302_FOUND)
            hand_check=ManagementTreasure.objects.filter(management_profile=management).first()
            settlement_payment_mode=request.data['settlement_payment_mode']
            if settlement_payment_mode=="Offline":
                print(request.data)
                settlement_transaction_type=request.data['settlement_transaction_type']

                
                if (float(hand_check.cash_in_hand) - float(hand_check.expence_amt)) >= advance_settlement_amt:
                        hand_check.expence_amt = float(hand_check.expence_amt) + float(advance_settlement_amt)
                        hand_check.save()
                        checking.advance_settlement_amt=advance_settlement_amt
                        checking.advance_return=True
                        checking.advance_return_date=datetime.today().date()
                        checking.retun_person_by=rejin.id
                        checking.action=False
                        checking.bill_by_name=rejin.username
                        checking.settlement_transaction_type=settlement_transaction_type
                        checking.settlement_payment_mode=settlement_payment_mode
                        checking.save() 
                        changing_assets=AssetDetails.objects.filter(id=checking.asset_id).first()
                        changing_assets.is_booked=False
                        changing_assets.save()
                        # pending  
                        hand_check.expence_amt = float(hand_check.expence_amt) + float(advance_settlement_amt)
                        hand_check.save()
                        Report.objects.create(type_choice="Reduction",management_profile=management,rentsandlease_id=pk,amount=advance_settlement_amt,created_by=rejin.id)      
                        serializer=RentalAndLeaseDetailsSerializer(checking)
                        return Response(serializer.data,status=status.HTTP_200_OK)
                else:
                        return Response({"message":"Sufficient amount is not available for settlement, Only " + f'{int(float(hand_check.cash_in_hand) - float(hand_check.expence_amt))}'+ "rs is available in treasure cashinhand"},status=status.HTTP_302_FOUND)
                
            elif settlement_payment_mode=="Online":
                settlement_bank_link=request.data['settlement_bank_link']
                settlement_transaction_type=request.data['settlement_transaction_type']
                settlement_bank_name=request.data['settlement_bank_name']
                settlement_transaction_date=request.data['settlement_transaction_date']
                settlement_trans_no=request.data['settlement_trans_no']
                # settlement_cheque_no=request.data['settlement_cheque_no']
                settlement_bank_pay=request.data['settlement_bank_pay']
                bank_check=BankDetails.objects.filter(id=settlement_bank_link).first()
                
                if float(bank_check.credit_amt) >= advance_settlement_amt:
                    bank_check.credit_amt = float(bank_check.credit_amt) - float(advance_settlement_amt)
                    bank_check.debit_amt = float(bank_check.debit_amt) + float(advance_settlement_amt)
                    bank_check.save()
                    checking.advance_settlement_amt=advance_settlement_amt                    
                    checking.advance_return=True
                    checking.advance_return_date=datetime.today().date()
                    checking.retun_person_by=rejin.id
                    checking.action=False
                    checking.settlement_transaction_type=settlement_transaction_type
                    checking.settlement_bank_name=settlement_bank_name
                    checking.settlement_transaction_date=settlement_transaction_date
                    checking.settlement_trans_no=settlement_trans_no
                    # checking.settlement_cheque_no=settlement_cheque_no
                    checking.settlement_bank_link_id=settlement_bank_link
                    checking.bill_by_name=rejin.username

                    checking.settlement_bank_pay=settlement_bank_pay
                    checking.settlement_payment_mode=settlement_payment_mode
                    checking.save() 
                    changing_assets=AssetDetails.objects.filter(id=checking.asset_id).first()
                    changing_assets.is_booked=False
                    changing_assets.save()
                    hand_check.expence_amt = float(hand_check.expence_amt) + float(advance_settlement_amt)
                    hand_check.bank_amt = float(hand_check.bank_amt) - float(advance_settlement_amt)
                    hand_check.bank_withdraw_amt = float(hand_check.bank_withdraw_amt) + float(advance_settlement_amt)

                    hand_check.save()
                    Report.objects.create(banks_id=settlement_bank_link,type_choice="Reduction",management_profile=management,rentsandlease_id=pk,amount=advance_settlement_amt,created_by=rejin.id)      
                    serializer=RentalAndLeaseDetailsSerializer(checking)
                    return Response(serializer.data,status=status.HTTP_200_OK)
                else:
                    return Response({"message":"Sufficient amount is not available for settlement, Only " + f'{int(bank_check.credit_amt)}'+ "rs is available in selected bank"},status=status.HTTP_302_FOUND)

        else:
            return Response({"message":"No settlement amount for lease"},status=status.HTTP_302_FOUND)
            
            
            



@api_view(['PUT'])
def force_settlement_close(request,pk):
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
    if request.method =='PUT': 
        checking=RentalAndLeaseDetails.objects.filter(id=pk).first()
        if checking.rent==False:
            return Response({"message":"No settlement amount for lease"},status=status.HTTP_302_FOUND)
        if checking.action==False:
                return Response({'message':"Settlement has been done before"},status.HTTP_302_FOUND) 
        # advance_settlement_amt=request.data['advance_settlement_amt']
        checking=RentalAndLeaseDetails.objects.filter(id=pk).first()
        checking.action=False
        checking.shutdown_by=rejin.id
        checking.shutdown_date=datetime.today().date()
        checking.bill_by_name=rejin.name
        asset=checking.asset_id
        asset_check=AssetDetails.objects.filter(id=asset).first()
        asset_check.is_booked=False
        asset_check.save()
        checking.save()
        return Response({"message":"Success"},status=status.HTTP_200_OK)

        
    
    





# # movable assets
@api_view(['GET','POST'])
def add_movable_rent_things(request):
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
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.rental_add ==True):  
                     
            serializer876 = MovableAssetsRentsSerializer(data=request.data)
            if serializer876.is_valid():
                m_rent=serializer876.save()
                m_rent.management_profile=management
                m_rent.created_by=rejin.id
                m_rent.save()
                
                m_table=MovableAssetsRentTable.objects.filter(movable_rent=m_rent)
                for one_rent in m_table:
                    one_rent.management_profile=management
                    one_rent.created_by=rejin.id
                    one_rent.save()
                    
                MoveableRentBalanceSheet.objects.create(management_profile=management,moveablerent=m_rent,credit_amt=m_rent.total_rent_amt,balance_amt=m_rent.total_rent_amt,advance_amt=m_rent.advance_amt)
                # if m_rent.advance_amt>0:
                #     get_treasuree=ManagementTreasure.objects.filter(management_profile=management).first()
                #     if get_treasuree:
                #         get_treasuree.cash_in_hand+=m_rent.advance_amt
                #         get_treasuree.save()
                if m_rent.advance_amt>0:
                    get_treasuree=ManagementTreasure.objects.filter(management_profile=management).first()
                    if get_treasuree:
                        if m_rent.bank_link != None:
                            my_banks=BankDetails.objects.filter(id=m_rent.bank_link.id).first()
                            if my_banks:
                                my_banks.credit_amt+= m_rent.advance_amt
                                my_banks.save()
                                get_treasuree.bank_amt += m_rent.advance_amt
                                get_treasuree.save()
                        elif m_rent.bank_link == None:
                            get_treasuree.cash_in_hand += m_rent.advance_amt
                            get_treasuree.save()
                        Report.objects.create(banks=m_rent.bank_link,management_profile=management,created_by=rejin.id,type_choice='Addition',moveablerent=m_rent,amount=m_rent.advance_amt)  
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':"User does not have permission to add rental"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'GET':
        our_family = MovableAssetsRents.objects.filter(management_profile=management)
        serializer = MovableAssetsRentsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
@api_view(['GET','PUT',"DELETE"])
def edit_moveable_lease_things(request,pk):
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
        customer = MovableAssetsRents.objects.get(pk=pk,management_profile=management) 
        take_old_advan_amt= customer.advance_amt
        member_type=customer.tenat_type
        bank_link=customer.bank_link
    except MovableAssetsRents.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = RentalAndLeaseDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':  
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.rental_edit ==True):
            collection_check=CollectionDetails.objects.filter(moveablerent_id=pk)
            if collection_check:
                return Response({'message': 'Cant be edited as this is involved in transactions'},status=status.HTTP_302_FOUND)
            # if (get_role=="User" and perm.rental_edit ==True):  
            if customer.created_at.date() != datetime.now().date():
                return Response({'message': 'Oneday edited session expired!. Contact Admin'},status=status.HTTP_302_FOUND)
            
            serializer876 = MovableAssetsRentsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                if member_type=="Member" and temp_family.tenat_type=="Other":
                    print("iiiiiiiiiiiiiiiii")
                    temp_family.tenat_member_id=None
                    temp_family.save()
                temp_family.created_by=rejin.id
                temp_family.save()                
                m_table=MovableAssetsRentTable.objects.filter(movable_rent=temp_family)
                for one_rent in m_table:
                    one_rent.created_by=rejin.id
                    one_rent.save()
                
                get_bal_sheett=MoveableRentBalanceSheet.objects.filter(management_profile=management,moveablerent=customer).first()
                if get_bal_sheett:
                    get_bal_sheett.credit_amt=temp_family.total_rent_amt
                    get_bal_sheett.balance_amt=temp_family.total_rent_amt
                    get_bal_sheett.advance_amt=temp_family.advance_amt
                    get_bal_sheett.save()
                
                if take_old_advan_amt>0 and temp_family.advance_amt>0 and (temp_family.advance_amt!=take_old_advan_amt):
                    get_treasuree=ManagementTreasure.objects.filter(management_profile=management).first()
                    if get_treasuree:
                        if bank_link != None:
                            my_banks=BankDetails.objects.filter(id=bank_link.id).first()
                            if my_banks:
                                my_banks.credit_amt-= take_old_advan_amt
                                my_banks.save()
                                get_treasuree.bank_amt -= take_old_advan_amt
                                get_treasuree.save()
                        elif bank_link == None:
                            get_treasuree.cash_in_hand -= take_old_advan_amt
                            get_treasuree.save()
                        if temp_family.bank_link !=None:
                            my_bankss=BankDetails.objects.filter(id=temp_family.bank_link.id).first()
                            if my_bankss:
                                my_bankss.credit_amt+= temp_family.advance_amt
                                my_bankss.save()
                                get_treasuree.bank_amt += temp_family.advance_amt
                                get_treasuree.save()
                        elif temp_family.bank_link ==None:
                            get_treasuree.cash_in_hand+=temp_family.advance_amt
                            get_treasuree.save()
                    get_report=Report.objects.filter(management_profile=management,type_choice='Addition',moveablerent=customer,collection=None).first()   
                    if get_report:
                        get_report.amount=temp_family.advance_amt
                        get_report.banks=temp_family.bank_link
                        get_report.save()
                elif take_old_advan_amt>0 and temp_family.advance_amt<=0:
                    get_treasuree=ManagementTreasure.objects.filter(management_profile=management).first()
                    if get_treasuree:
                        if bank_link != None:
                            my_banks=BankDetails.objects.filter(id=bank_link.id).first()
                            if my_banks:
                                my_banks.credit_amt-= take_old_advan_amt
                                my_banks.save()
                                get_treasuree.bank_amt -= take_old_advan_amt
                                get_treasuree.save()
                        else:
                            get_treasuree.cash_in_hand-=take_old_advan_amt
                            get_treasuree.save()
                    get_report=Report.objects.filter(management_profile=management,type_choice='Addition',moveablerent=customer,collection=None).first()   
                    get_report.delete()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':"User does not have permission to edit rental"},status.HTTP_401_UNAUTHORIZED)
          
    elif request.method == 'DELETE':
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)  
        if  get_role=="Admin" or rejin.is_superuser == True  or (get_role=="User" and perm.rental_delete ==True):
            collection_check=CollectionDetails.objects.filter(moveablerent_id=pk)
            if collection_check:
                return Response({'message': 'Cant be deleted as this is involved in transactions'},status=status.HTTP_302_FOUND)
            if (get_role=="User" and perm.rental_delete ==True):
                if customer.created_at.date() != datetime.now().date():
                    return Response({'message': 'Cant be deleted.Oneday edited session expired!. Contact Admin'},status=status.HTTP_302_FOUND)
            if take_old_advan_amt>0:
                get_treasuree=ManagementTreasure.objects.filter(management_profile=management).first()
                if get_treasuree:
                    if bank_link != None:
                        my_banks=BankDetails.objects.filter(id=bank_link.id).first()
                        if my_banks:
                            my_banks.credit_amt-= take_old_advan_amt
                            my_banks.save()
                            get_treasuree.bank_amt -= take_old_advan_amt
                            get_treasuree.save()
                    elif bank_link == None:
                        get_treasuree.cash_in_hand -= take_old_advan_amt
                        get_treasuree.save()
                get_report=Report.objects.filter(management_profile=management,type_choice='Addition',moveablerent=customer,collection=None).first()   
                get_report.delete()
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'message':"User does not have permission to delete rental"},status.HTTP_401_UNAUTHORIZED)


