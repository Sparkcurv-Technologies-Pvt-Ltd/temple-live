from rest_framework import serializers
from .models import RentalAndLeaseDetails,MovableAssetsRentTable,MovableAssetsRents
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from balancesheet.models import RentalBalanceSheet
from assets.models import MoveableAssetDetails
from datetime import datetime


def Lease_rent_no():
    l=RentalAndLeaseDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("R&L" '%01d' % l)

def moveable_rent_no():
    l=MovableAssetsRents.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("M-RENT" '%01d' % l)


class RentalAndLeaseDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    documents=serializers.FileField(required=False)
    images=serializers.ImageField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =RentalAndLeaseDetails
        fields = '__all__'
        
    def validate_start_date(self, start_date):        
                    

        print(self.initial_data['start_date'])
        if self.instance is None:
            if start_date and start_date < timezone.now().date():
                raise serializers.ValidationError("Start date cannot be less than today's date.")
            return start_date  
        else:
            date_r=self.instance.start_date 
            print("rrrrrrrrrrrrrrrrrrrrrr")
            
            data_initial=self.initial_data['start_date'] 
            data_initial_obj=  datetime.strptime(data_initial, "%Y-%m-%d")  
              
            print(date_r) 
            print(data_initial_obj)         
            print((data_initial))
            print(type(date_r)) 
            print(type(data_initial_obj)) 
            print("yyyyyyyyyyyyyyyyyyyy")   
            print(data_initial_obj.date())             
            if date_r==data_initial_obj.date():
                return start_date 
            else:
                if start_date:
                    print(type(start_date))                    
                    if start_date < datetime.now().date():
                        print("ooooooooo")
                        raise serializers.ValidationError("Start date cannot be less than today's date.")
                return start_date
    
   
    def create(self, validated_data):
        profile_instance = RentalAndLeaseDetails.objects.create(lease_rent_no=Lease_rent_no(),**validated_data)               
        return profile_instance
        
class RentalAndLeaseDetails_new_Serializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    class Meta:
        model =RentalBalanceSheet
        fields = '__all__'


class Rental_serializers(serializers.ModelSerializer):
    rental_new_amt = RentalAndLeaseDetails_new_Serializer(many=True)
    class Meta:
        model =RentalAndLeaseDetails
        fields =['id','lease_rent_no','management_profile','rent','date','category','asset_category_name','asset','asset_name','tenat_type','tenat_member','tenat_name',
                 'tenat_address', 'tenat_email','tenat_mobile','start_date','end_date','documents','images','initial_advance_amt','rent_amt',
                 'rent_pay_type','from_date','increment_apply','increase_time_period','increase_time_period_choice','increment_amt_prcnt','increase_amt_choice','rental_new_amt',
                 'payment_mode','transaction_type','bank_link','bank_name','transaction_date','trans_no','bank_pay','cheque_no']




# movable assets

class MovableAssetsRentTableSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    class Meta:
        model =MovableAssetsRentTable
        fields = '__all__'

class MovableAssetsRentsSerializer(serializers.ModelSerializer):
    movable_rent = MovableAssetsRentTableSerializer(many=True)
    rent_no=serializers.CharField(required=False)
    class Meta:
        model = MovableAssetsRents
        fields = ['id','rent_no','date','tenat_type','tenat_member','tenat_name','tenat_address','tenat_mobile','start_date','total_rent_amt','advance_amt','comments','movable_rent',
                  'payment_mode','transaction_type','bank_link','bank_name','transaction_date','trans_no','bank_pay','cheque_no'] 
        
    def validate_start_date(self, start_date):
        if start_date and start_date < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be less than today's date.")
        return start_date

    def create(self, validated_data):
        movable_rent = validated_data.pop('movable_rent')
        profile_instance = MovableAssetsRents.objects.create(rent_no=moveable_rent_no(),**validated_data) 
        for hobby in movable_rent:
            m_rent=MovableAssetsRentTable.objects.create(movable_rent=profile_instance,**hobby)  
            check_ast=MoveableAssetDetails.objects.filter(id=m_rent.asset_id).first()
            if check_ast:
                check_ast.rent_qty+=m_rent.qnty
                check_ast.avilable_qty-=m_rent.qnty
                check_ast.save()
            
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('movable_rent')
            
            instance.date = validated_data.get('date', instance.date)
            instance.tenat_type = validated_data.get('tenat_type', instance.tenat_type)
            instance.tenat_member = validated_data.get('tenat_member', instance.tenat_member)
            instance.tenat_name = validated_data.get('tenat_name', instance.tenat_name)
            instance.tenat_address = validated_data.get('tenat_address', instance.tenat_address)
            instance.tenat_mobile = validated_data.get('tenat_mobile', instance.tenat_mobile)
            instance.start_date = validated_data.get('start_date', instance.start_date)
            instance.total_rent_amt = validated_data.get('total_rent_amt', instance.total_rent_amt)
            instance.advance_amt = validated_data.get('advance_amt', instance.advance_amt)
            instance.comments = validated_data.get('comments', instance.comments)    
            
            instance.payment_mode = validated_data.get('payment_mode', instance.payment_mode)          
            instance.transaction_type = validated_data.get('transaction_type', instance.transaction_type)
            instance.bank_link = validated_data.get('bank_link', instance.bank_link)          
            instance.bank_name = validated_data.get('bank_name', instance.bank_name)
            instance.transaction_date = validated_data.get('transaction_date', instance.transaction_date)          
            instance.trans_no = validated_data.get('trans_no', instance.trans_no)
            instance.cheque_no = validated_data.get('cheque_no', instance.cheque_no)          
            instance.bank_pay = validated_data.get('bank_pay', instance.bank_pay)            
            
            instance.save()
                
            hobbies_with_same_profile_instance = MovableAssetsRentTable.objects.filter(movable_rent=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            
            hobbies_with_s = MovableAssetsRentTable.objects.filter(movable_rent=instance.pk)
            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                if "id" in hobby.keys():
                    if MovableAssetsRentTable.objects.filter(id=hobby['id']).exists():
                        hobby_instance = MovableAssetsRentTable.objects.get(id=hobby['id'])
                        
                        take_previous_qty=hobby_instance.qnty
                        
                        hobby_instance.category = hobby.get('category', hobby_instance.category)
                        hobby_instance.asset_category_name = hobby.get('asset_category_name', hobby_instance.asset_category_name)
                        hobby_instance.asset = hobby.get('asset', hobby_instance.asset)
                        hobby_instance.asset_name = hobby.get('asset_name', hobby_instance.asset_name)
                        hobby_instance.qnty = hobby.get('qnty', hobby_instance.qnty)
                        hobby_instance.sale_amt = hobby.get('sale_amt', hobby_instance.sale_amt)
                        hobby_instance.total_amt = hobby.get('total_amt', hobby_instance.total_amt)
                        hobby_instance.save()
                        
                        check_ast=MoveableAssetDetails.objects.filter(id=hobby_instance.asset_id).first()
                        if check_ast:
                            check_ast.rent_qty-=take_previous_qty
                            check_ast.avilable_qty+=take_previous_qty
                            check_ast.save()
                            
                            check_ast.rent_qty+=hobby_instance.qnty
                            check_ast.avilable_qty-=hobby_instance.qnty
                            check_ast.save()
                        
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = MovableAssetsRentTable.objects.create(movable_rent=instance, **hobby)
                    
                    check_ast=MoveableAssetDetails.objects.filter(id=hobbies_instance.asset_id).first()
                    if check_ast:
                        check_ast.rent_qty+=hobbies_instance.qnty
                        check_ast.avilable_qty-=hobbies_instance.qnty
                        check_ast.save()
                    
                    hobbies_id_pool.append(hobbies_instance.id)

            for hobby_id in hobbies_with_same_profile_instance:
                if hobby_id not in hobbies_id_pool:
                    m_d=MovableAssetsRentTable.objects.filter(pk=hobby_id).first()
                    check_ast=MoveableAssetDetails.objects.filter(id=m_d.asset_id).first()
                    if check_ast:
                        check_ast.rent_qty-=m_d.qnty
                        check_ast.avilable_qty+=m_d.qnty
                        check_ast.save()
                    
                    m_d.delete()

            return instance