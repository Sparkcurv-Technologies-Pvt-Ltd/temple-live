from rest_framework import serializers
from .models import ADDFundDetails, FundGroupDetails, FundMemberDetailss, FundLeaseDetailss, FundLeaseMemberDetailss
from django.utils import timezone
from datetime import datetime

def fund_no():
    l=ADDFundDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("FND" '%01d' % l)

class ADDFundDetailsssssSerializer(serializers.ModelSerializer):   
    class Meta:
        model =ADDFundDetails
        fields = '__all__'


class ADDFundDetailsSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDFundDetails
        fields = '__all__'

    def validate_start_date(self, start_date):
        print("jjjjjj")
        if self.instance is None: 
            if start_date and start_date < (datetime.now().date()):
                print("ooooooooo")
                raise serializers.ValidationError("From date cannot be less than today's date.")
            return start_date
        else: 

            date_r=self.instance.start_date  
            print("ooooooooooooooo")
            data_initial=self.initial_data['start_date'] 
            data_initial_obj=  datetime.strptime(data_initial, "%Y-%m-%d")  
            # from_date_obj = datetime.strftime(date_r, "%Y-%m-%d")  
            print(date_r) 
            print(data_initial_obj)         
            print((data_initial))
            print(type(date_r)) 
            print(type(data_initial_obj)) 
            print("yyyyyyyyyyyyyyyyyyyy")   
            print(data_initial_obj.date())  
            if data_initial_obj.date()==date_r:
                return start_date             
            else:                
                if start_date:
                    print(type(start_date))                    
                    if start_date < datetime.now().date():
                        print("ooooooooo")
                        raise serializers.ValidationError("From date cannot be less than today's date.")
                return start_date
           
    # def validate_start_date(self, start_date):
    #     if start_date and start_date < timezone.now().date():
    #         raise serializers.ValidationError("From date cannot be less than today's date.")
    #     return start_date
    def validate_end_date(self, end_date):
        print("ggggggggggggggg")
        print(self.instance)
        print(end_date)
        print("jjjjjj")
        if self.instance is None: 
            if end_date and end_date <= (datetime.now().date()):
                print("ooooooooo")
                raise serializers.ValidationError("To date cannot be less than or equal to today's date.")
            return end_date
        else: 

            date_r=self.instance.end_date  
            print("ooooooooooooooo")
            data_initial=self.initial_data['end_date'] 
            data_initial_obj=  datetime.strptime(data_initial, "%Y-%m-%d")  
            # from_date_obj = datetime.strftime(date_r, "%Y-%m-%d")  
            print(date_r) 
            print(data_initial_obj)         
            print((data_initial))
            print(type(date_r)) 
            print(type(data_initial_obj)) 
            print("yyyyyyyyyyyyyyyyyyyy")   
            print(data_initial_obj.date())  
            if data_initial_obj.date()==date_r:
                return end_date             
            else:                
                if end_date:
                    print(type(end_date))                    
                    if end_date <= datetime.now().date():
                        print("ooooooooo")
                        raise serializers.ValidationError("End date cannot be less than or equal to today's date.")
                return end_date
            

    # def validate_end_date(self, end_date):
    #     if end_date and end_date < timezone.now().date():
    #         raise serializers.ValidationError("To date cannot be less than today's date.")
    #     return end_date
    
    def create(self, validated_data):
        profile_instance = ADDFundDetails.objects.create(fund_no=fund_no(),**validated_data)               
        return profile_instance

     
class FundMemberDetailssSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =FundMemberDetailss
        fields = '__all__' 

class FundGroupDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    fund_group = FundMemberDetailssSerializer(many=True)
    fund_type = serializers.CharField(source='fund.fund_type', read_only=True)
    class Meta:
        model = FundGroupDetails
        fields = ['id','fund','fund_name','head_member','head_name','head_member_no','secretrary_member','secretrary_name','secretrary_member_no','treasury_member','treasury_name','treasury_member_no','fixed_fund_amount','per_head_collection_amount',
                  'cash_available_amount','leased_members_count','fund_type','month_count','fixed_fund_count','total_fund_count','from_date','to_date','fund_group'] 

    def create(self, validated_data):
        fund_group = validated_data.pop('fund_group')
        profile_instance = FundGroupDetails.objects.create(**validated_data)
        for hobby in fund_group:
            FundMemberDetailss.objects.create(fund_group=profile_instance,**hobby)                
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('fund_group')
            instance.fund = validated_data.get('fund', instance.fund)         
            instance.fund_name = validated_data.get('fund_name', instance.fund_name)    
            instance.from_date = validated_data.get('from_date', instance.from_date)
            instance.to_date = validated_data.get('to_date', instance.to_date)     
            instance.head_member = validated_data.get('head_member', instance.head_member)          
            instance.head_name = validated_data.get('head_name', instance.head_name) 
            instance.head_member_no = validated_data.get('head_member_no', instance.head_member_no) 
            instance.secretrary_member = validated_data.get('secretrary_member', instance.secretrary_member)                  
            instance.secretrary_name = validated_data.get('secretrary_name', instance.secretrary_name) 
            instance.secretrary_member_no = validated_data.get('secretrary_member_no', instance.secretrary_member_no)              
            instance.treasury_member_no = validated_data.get('treasury_member_no', instance.treasury_member_no)              
            instance.treasury_member = validated_data.get('treasury_member', instance.treasury_member)        
            instance.treasury_name = validated_data.get('treasury_name', instance.treasury_name)         
            instance.fixed_fund_amount = validated_data.get('fixed_fund_amount', instance.fixed_fund_amount)                 
            # instance.fund_collecting_date = validated_data.get('fund_collecting_date', instance.fund_collecting_date)          
            instance.month_count = validated_data.get('month_count', instance.month_count)      
            instance.fixed_fund_count = validated_data.get('fixed_fund_count', instance.fixed_fund_count)     
            instance.total_fund_count = validated_data.get('total_fund_count', instance.total_fund_count)
            instance.save()
                    
            hobbies_with_same_profile_instance = FundMemberDetailss.objects.filter(fund_group=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            print("yyyyyyyyyyyyyy")
            
            hobbies_with_s = FundMemberDetailss.objects.filter(fund_group=instance.pk)
            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                # print(hobby.keys())
                if "id" in hobby.keys():
                    if FundMemberDetailss.objects.filter(id=hobby['id']).exists():
                        hobby_instance = FundMemberDetailss.objects.get(id=hobby['id'])
                        hobby_instance.person_type = hobby.get('person_type', hobby_instance.person_type)
                        hobby_instance.member_name = hobby.get('member_name', hobby_instance.member_name)
                        hobby_instance.member_no = hobby.get('member_no', hobby_instance.member_no)
                        hobby_instance.fund_member = hobby.get('fund_member', hobby_instance.fund_member)
                        hobby_instance.member_fund_count = hobby.get('member_fund_count', hobby_instance.member_fund_count)
                        hobby_instance.mobile_no = hobby.get('mobile_no', hobby_instance.mobile_no)
                        hobby_instance.email = hobby.get('email', hobby_instance.email)
                        hobby_instance.address = hobby.get('address', hobby_instance.address)
                        hobby_instance.nominee_apply = hobby.get('nominee_apply', hobby_instance.nominee_apply)
                        hobby_instance.nominee_person_type = hobby.get('nominee_person_type', hobby_instance.nominee_person_type)
                        hobby_instance.nominee_member = hobby.get('nominee_member', hobby_instance.nominee_member)
                        hobby_instance.nominee_member_no = hobby.get('nominee_member_no', hobby_instance.nominee_member_no)
                        hobby_instance.nominee_member_name = hobby.get('nominee_member_name', hobby_instance.nominee_member_name)
                        hobby_instance.nominee_mobile_no = hobby.get('nominee_mobile_no', hobby_instance.nominee_mobile_no)
                        hobby_instance.nominee_address = hobby.get('nominee_address', hobby_instance.nominee_address)
                        hobby_instance.cheque_no = hobby.get('cheque_no', hobby_instance.cheque_no)
                        hobby_instance.lease_completed_colour_change = hobby.get('lease_completed_colour_change', hobby_instance.lease_completed_colour_change)

                        hobby_instance.save()
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = FundMemberDetailss.objects.create(fund_group=instance, **hobby)
                    hobbies_id_pool.append(hobbies_instance.id)
    
            for hobby_id in hobbies_with_same_profile_instance:
                print(hobbies_id_pool)
                if hobby_id not in hobbies_id_pool:
                    
                    FundMemberDetailss.objects.filter(pk=hobby_id).delete()
            return instance
    

        
# class ADDFundLeaseDetailsSerializer(serializers.ModelSerializer):
#     action = serializers.BooleanField(default=True)
#     fund_type=serializers.CharField(source='fund_group.fund.fund_type', read_only=True)
#     class Meta:
#         model =FundLeaseDetailss
#         fields = ['id','fund_group','management_profile','fund_mem','remaining_fund_count','finished','fund_name','lease_date','fund_lease_amount','commission_amount','final_lease_amount','members_count',
#                  'fund_count','from_date','to_date','person_name','per_head_collection_amount','action','created_by','created_at','fund_type','divided_member_count' ]
        
#     def validate_lease_date(self, lease_date):
#         if lease_date and lease_date < timezone.now().date():
#             raise serializers.ValidationError("From date cannot be less than today's date.")
#         return lease_date
    
# get
class FundMemberDetailssSerializer22(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    action = serializers.BooleanField(default=True)
    # lease=serializers.BooleanField(default=False)
    class Meta:
        model =FundMemberDetailss
        fields = '__all__' 

class FundGroupDetailsSerializer22(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    # fund = serializers.SerializerMethodField()
    fund_group = serializers.SerializerMethodField() 
    fund_type = serializers.CharField(source='fund.fund_type', read_only=True)
    class Meta:
        model = FundGroupDetails
        fields = ['id','fund','fund_name','head_member','head_name','head_member_no','secretrary_member','secretrary_name','secretrary_member_no','treasury_member','treasury_name','treasury_member_no','fixed_fund_amount','members_count','per_head_collection_amount',
                  'cash_available_amount','leased_members_count','month_count','fixed_fund_count','total_fund_count','from_date','to_date','fund_group','fund_type'] 
    
    # def get_fund(self, obj): 
    #     print(obj)
    #     print("zzzzzzzzzzzzzzzzzzzzz")      
    #     fund_details = FundGroupDetails.objects.filter(fund=obj)  
    #     # print("uuuuuuuuuuuuuuu")
    #     print(fund_details)    
    #     serializer = ADDFundDetailsSerializer(instance=fund_details, many=True)
    #     # print(serializer.data)
    #     return serializer.data 
    
    def get_fund_group(self, obj):       
        member_details = FundMemberDetailss.objects.filter(fund_group=obj,lease=False)      
        serializer = FundMemberDetailssSerializer(instance=member_details, many=True)
        # print(serializer.data)
        return serializer.data   

# class FundGroupDetailssssSerializer(serializers.ModelSerializer):
#     id = serializers.IntegerField(required=False)
#     fund_group = serializers.SerializerMethodField()

#     class Meta:
#         model = FundGroupDetails
#         fields = ['id', 'fund', 'fund_name', 'head_member', 'head_name', 'head_member_no', 'secretrary_member', 'secretrary_name', 'secretrary_member_no', 'treasury_member', 'treasury_name', 'treasury_member_no', 'fixed_fund_amount', 'per_head_collection_amount', 'month_count', 'fixed_fund_count', 'total_fund_count', 'from_date', 'to_date', 'fund_group']

#     def get_fund_group(self, obj):       
#         member_details = FundMemberDetailss.objects.filter(fund_group=obj, lease=False)      
#         serializer = FundMemberDetailssSerializer(instance=member_details, many=True)
#         return serializer.data

class FundLeaseNormalSerializer22(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    fund_group = serializers.SerializerMethodField() 
    fund_type = serializers.CharField(source='fund_group.fund.fund_type', read_only=True)
    class Meta:
        model = FundLeaseDetailss
        fields = ['id','fund_group','finished','fund_name','lease_date','fund_amount','fund_lease_amount','commission_amount','final_lease_amount','members_count','fund_count','from_date','to_date','per_head_collection_amount','divided_by',
                  'finished','multiplied_commission_amount','lease_settle_amount','action','created_by','created_at','fund_type'] 
    
    def get_fund_group(self, obj):       
        member_details = FundMemberDetailss.objects.filter(fund_group=obj, lease=False)      
        serializer = FundMemberDetailssSerializer(instance=member_details, many=True)
        print(serializer.data)
        return serializer.data  


class FundLeaseMemberDetailssSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =FundLeaseMemberDetailss
        fields = '__all__' 

class ADDFundLeaseDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    flease = FundLeaseMemberDetailssSerializer(many=True)
    fund_type=serializers.CharField(source='fund_group.fund.fund_type', read_only=True)
    class Meta:
        model = FundLeaseDetailss
        fields = ['id','fund_group','fund_name','lease_date','fund_amount','fund_lease_amount','commission_amount','final_lease_amount','members_count','fund_count','from_date','to_date','per_head_collection_amount',
                  'finished','multiplied_commission_amount','leased_members_count','divided_by','flease','fund_type'] 
    

    def validate_lease_date(self, lease_date):
        print("jjjjjj")
        if self.instance is None: 
            if lease_date and lease_date < (datetime.now().date()):
                print("ooooooooo")
                raise serializers.ValidationError("Lease date cannot be less than today's date.")
            return lease_date
        else: 

            date_r=self.instance.lease_date  
            print("ooooooooooooooo")
            data_initial=self.initial_data['lease_date'] 
            data_initial_obj=  datetime.strptime(data_initial, "%Y-%m-%d")  
            # from_date_obj = datetime.strftime(date_r, "%Y-%m-%d")  
            print(date_r) 
            print(data_initial_obj)         
            print((data_initial))
            print(type(date_r)) 
            print(type(data_initial_obj)) 
            print("yyyyyyyyyyyyyyyyyyyy")   
            print(data_initial_obj.date())  
            if data_initial_obj.date()==date_r:
                return lease_date             
            else:                
                if lease_date:
                    print(type(lease_date))                    
                    if lease_date < datetime.now().date():
                        print("ooooooooo")
                        raise serializers.ValidationError("Lease date cannot be less than today's date.")
                return lease_date
            

    # def validate_lease_date(self, lease_date):
    #     if lease_date and lease_date < timezone.now().date():
    #         raise serializers.ValidationError("From date cannot be less than today's date.")
    #     return lease_date

    def create(self, validated_data):
        flease = validated_data.pop('flease')
        profile_instance = FundLeaseDetailss.objects.create(**validated_data)
        for hobby in flease:
            FundLeaseMemberDetailss.objects.create(flease=profile_instance,**hobby)                
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('flease')
            instance.fund_group = validated_data.get('fund_group', instance.fund_group)         
            instance.fund_name = validated_data.get('fund_name', instance.fund_name)    
            instance.lease_date = validated_data.get('lease_date', instance.lease_date)
            instance.fund_amount = validated_data.get('fund_amount', instance.fund_amount)     
            instance.fund_lease_amount = validated_data.get('fund_lease_amount', instance.fund_lease_amount)          
            instance.commission_amount = validated_data.get('commission_amount', instance.commission_amount) 
            instance.final_lease_amount = validated_data.get('final_lease_amount', instance.final_lease_amount) 
            instance.members_count = validated_data.get('members_count', instance.members_count)                  
            instance.fund_count = validated_data.get('fund_count', instance.fund_count) 
            instance.from_date = validated_data.get('from_date', instance.from_date)              
            instance.to_date = validated_data.get('to_date', instance.to_date)
            instance.leased_members_count = validated_data.get('leased_members_count', instance.leased_members_count)          

            instance.per_head_collection_amount = validated_data.get('per_head_collection_amount', instance.per_head_collection_amount)        
            instance.divided_by = validated_data.get('divided_by', instance.divided_by)         
            instance.save()                    
            hobbies_with_same_profile_instance = FundLeaseMemberDetailss.objects.filter(flease=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            print("yyyyyyyyyyyyyy")
            
            hobbies_with_s = FundLeaseMemberDetailss.objects.filter(flease=instance.pk)            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                # print(hobby.keys())
                if "id" in hobby.keys():
                    if FundLeaseMemberDetailss.objects.filter(id=hobby['id']).exists():
                        hobby_instance = FundLeaseMemberDetailss.objects.get(id=hobby['id'])
                        hobby_instance.fund_mem = hobby.get('fund_mem', hobby_instance.fund_mem)
                        hobby_instance.person_name = hobby.get('person_name', hobby_instance.person_name)
                        hobby_instance.lease_amount = hobby.get('lease_amount', hobby_instance.lease_amount)
                        hobby_instance.save()
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = FundLeaseMemberDetailss.objects.create(flease=instance, **hobby)
                    hobbies_id_pool.append(hobbies_instance.id)
    
            for hobby_id in hobbies_with_same_profile_instance:
                print(hobbies_id_pool)
                if hobby_id not in hobbies_id_pool:                    
                    FundLeaseMemberDetailss.objects.filter(pk=hobby_id).delete()
            return instance 
