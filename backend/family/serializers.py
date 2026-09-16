from rest_framework import serializers
from .models import Fammily_Details,Member_Details
from rest_framework.exceptions import ValidationError
from management.models import ManagementDetails
from django.utils import timezone
from amount.models import PeoplesJOININGAmountDetails
from treasure.models import ManagementTreasure
from amount.models import PeoplesAmountDetails
from authorities.models import AddAuthorityDetails
from death.models import DeathDetails
from user.models import User
from reports.models import Report

def family_no():
    l=Fammily_Details.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("F" '%01d' % l)

def member_no():
    l=Member_Details.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("M" '%01d' % l)

# def validate_mobile_number(value,serializer_instance=None):
   
#     # Get the family ID from the serializer context
#         family_id = None
#         if serializer_instance:
#             family_id = serializer_instance.context.get('family')
#             print(family_id)
#             print("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")

#         # Check if any other family has the same mobile number
#         # print(family_id)
#         if Member_Details.objects.exclude(family_id=family_id).filter(member_mobile_number=value).exists():
#             raise serializers.ValidationError("Mobile number must be unique across families.")



class member_DetailsSerializer(serializers.ModelSerializer):
    address = serializers.CharField(source='family.address', read_only=True)
    id=serializers.IntegerField(required=False)
    member_photo=serializers.ImageField(required=False)
    im_status=serializers.BooleanField(required=False)
    family_iddd=serializers.CharField(required=False)

    # member_mobile_number = serializers.CharField(validators=[validate_mobile_number])
    class Meta:
        model =Member_Details
        # fields = '__all__'
        # fields = ['id','member_name','member_mobile_number','member_dob','member_email','member_gender',
        #           'member_relation_ship','member_balance_amt','member_joining_amt','member_photo']
        fields = ['member_no','id','member_name','member_mobile_number','member_dob','member_email','member_gender','family_iddd',
                  'member_relation_ship','member_balance_amt','member_joining_amt','member_photo','family','im_status','address','death_date','death']
        
    def validate_member_dob(self, member_dob):
        if member_dob and member_dob > timezone.now().date():
            raise serializers.ValidationError("Date of Birth cannot be greater than today's date.")
        return member_dob
    
    def validate(self, data):
        relation_ship = data.get('member_relation_ship')
        member_dob = data.get('member_dob')
        if relation_ship == 'FATHER':
            if member_dob:
                today = timezone.now().date()
                age = today.year - member_dob.year - ((today.month, today.day) < (member_dob.month, member_dob.day))
                get_tax_age26=ManagementDetails.objects.all().first().tax_age
                if get_tax_age26>0:
                    gov_tax=get_tax_age26
                    if age <= gov_tax:
                        raise serializers.ValidationError("Father's age must be greater than tax applicable age years.")
                elif age <= 18:
                    raise serializers.ValidationError("Father's age must be greater than 18 years.")
            else:
                raise serializers.ValidationError("Date of birth is required for father's profile.")
        
        if relation_ship == 'WIFE':
            if member_dob:
                today = timezone.now().date()
                age = today.year - member_dob.year - ((today.month, today.day) < (member_dob.month, member_dob.day))
                if age <= 18:
                    raise serializers.ValidationError("Spouse age must be greater than 18 years.")
            else:
                raise serializers.ValidationError("Date of birth is required for Spouse's profile.")
        
        return data
        

class Fammily_DetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    family = member_DetailsSerializer(many=True)
    class Meta:
        model = Fammily_Details
        fields = ['id','ancestor','ancestor_detail','address','head_member_type','head_native_type','years_of_living','family'] 


    def validate_family(self, family):
        # mobile_numbers = set()
        print("eeeeeeeeeeee")
        print(family)            
                   
        for member_data in family:
            if member_data['family_iddd']!="null": 
                print(member_data)
                mobile_number = member_data.get('member_mobile_number')            
                ccc=Member_Details.objects.filter(member_mobile_number=mobile_number).exclude(family_id=member_data["family_iddd"])            
                if ccc:
                    print("jukhhhh")
                    raise serializers.ValidationError("Each family must have unique mobile numbers.") 
          
            else:
                print("uuuuuuuuuuuuuu")
                mobile_number = member_data.get('member_mobile_number')            
                ccc=Member_Details.objects.filter(member_mobile_number=mobile_number)           
                if ccc:
                    print("jukhhhh")
                    raise serializers.ValidationError("Each family must have unique mobile numbers.")

        return family 

    def create(self, validated_data):
        print(validated_data)
        family = validated_data.pop('family')
        profile_instance = Fammily_Details.objects.create(family_no=family_no(),**validated_data)
        for hobby in family:
            varities_datass = hobby.pop('family_iddd')
            if hobby['member_relation_ship']=='FATHER':
                fatherrr=Member_Details.objects.create(member_no=member_no(),head=True,family=profile_instance,**hobby)
                get_tax_age2=ManagementDetails.objects.all().first().tax_age
                if get_tax_age2>0:
                    gov_tax=get_tax_age2
                    if fatherrr.member_age >= gov_tax:
                        fatherrr.member_tax_eligible = True
                        fatherrr.save()
                
                if fatherrr.member_age!=None and fatherrr.member_age>=18:
                    fatherrr.adult=True
                    fatherrr.save()
                else:
                    fatherrr.adult=False
                    fatherrr.save()
            else:
                my_fam=Member_Details.objects.create(member_no=member_no(),head=False,family=profile_instance,**hobby)
                if my_fam.member_relation_ship=='SON':
                    get_tax_age=ManagementDetails.objects.all().first().tax_age
                    if get_tax_age>0:
                        gov_tax=get_tax_age
                        
                        if my_fam.member_age >= gov_tax:
                            my_fam.member_tax_eligible = True
                            my_fam.save()
                           
                if my_fam.member_age!=None and my_fam.member_age>=18:
                    my_fam.adult=True
                    my_fam.save()
                else:
                    my_fam.adult=False
                    my_fam.save()
                    
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('family')
            
            # new
            old_getting_mem_type=instance.head_member_type
            
            instance.ancestor = validated_data.get('ancestor', instance.ancestor)   
            instance.ancestor_detail = validated_data.get('ancestor_detail', instance.ancestor_detail)               
            instance.address = validated_data.get('address', instance.address)                 
            instance.head_member_type = validated_data.get('head_member_type', instance.head_member_type)          
            instance.head_native_type = validated_data.get('head_native_type', instance.head_native_type)   
            instance.years_of_living = validated_data.get('years_of_living', instance.years_of_living)                  
            instance.save()
            # new
            new_getting_mem_type=instance.head_member_type
                    
            hobbies_with_same_profile_instance = Member_Details.objects.filter(family=instance.pk).values_list('id', flat=True)
            print("yyyyyyyyyyyyyyyyyyyyy")
            print(hobbies_with_same_profile_instance)
            
            hobbies_with_s = Member_Details.objects.filter(family=instance.pk)
            
            hobbies_id_pool = []
            print("hhhhhhhhhhhhhhhhhhhhhhhhh")
            print(user_hobby_list)
            for hobby in user_hobby_list:
                print(hobby)
                print(hobby.keys())
                try:
                    varities_data = hobby.pop('im_status')
                except Exception:
                    pass
                varities_datass = hobby.pop('family_iddd')

                print("njmmmmmmm")
                if "id" in hobby.keys():
                    print("kkkkkkkkkkkkkkkkkkkkkkk")
                    if Member_Details.objects.filter(id=hobby['id']).exists():
                        hobby_instance = Member_Details.objects.get(id=hobby['id'])
                        hobby_instance.member_name = hobby.get('member_name', hobby_instance.member_name)
                        hobby_instance.member_mobile_number = hobby.get('member_mobile_number', hobby_instance.member_mobile_number)
                        hobby_instance.member_dob = hobby.get('member_dob', hobby_instance.member_dob)
                        hobby_instance.member_email = hobby.get('member_email', hobby_instance.member_email)
                        
                        # +++++ later  check edit image  
                        hobby_instance.member_photo = hobby.get('member_photo', hobby_instance.member_photo)
                        
                        hobby_instance.death_date = hobby.get('death_date', hobby_instance.death_date)
                        hobby_instance.death = hobby.get('death', hobby_instance.death)
                        
                        
                        hobby_instance.member_relation_ship = hobby.get('member_relation_ship', hobby_instance.member_relation_ship)
                        hobby_instance.member_balance_amt = hobby.get('member_balance_amt', hobby_instance.member_balance_amt)
                        hobby_instance.member_joining_amt = hobby.get('member_joining_amt', hobby_instance.member_joining_amt)
                        hobby_instance.save()
                        
                        # new
                        if old_getting_mem_type=='NEW' and new_getting_mem_type=='EXCISTING':
                            hobby_instance.member_joining_amt=0
                            hobby_instance.save()
                            
                        if old_getting_mem_type=='EXCISTING' and new_getting_mem_type=='NEW':
                            if hobby_instance.balance_amt_paid>0:
                                instance.head_member_type='EXCISTING'
                                instance.save()
                                hobby_instance.member_joining_amt=0
                                hobby_instance.save()
                            else:
                                hobby_instance.member_balance_amt=0
                                hobby_instance.save()
                        
                        if hobby_instance.member_joining_amt<=0:
                            check_pe_amt=PeoplesJOININGAmountDetails.objects.filter(member=hobby_instance).first()
                            if check_pe_amt:
                                temp_treasure=ManagementTreasure.objects.filter(management_profile=hobby_instance.management_profile).first()
                                temp_treasure.cash_in_hand-=check_pe_amt.amount
                                temp_treasure.save()
                                check_pe_amt.delete()
                                
                        if hobby_instance.member_relation_ship=='FATHER':
                            hobby_instance.head=True
                            hobby_instance.save()
                            get_tax_age1=ManagementDetails.objects.all().first().tax_age
                            if get_tax_age1>0:
                                gov_tax=get_tax_age1
                                if hobby_instance.member_age >= gov_tax:
                                    hobby_instance.member_tax_eligible = True
                                    hobby_instance.save()
                                else:
                                    hobby_instance.member_tax_eligible = False
                                    hobby_instance.save()
                                    
                        elif hobby_instance.member_relation_ship=='SON':
                            hobby_instance.head=False
                            hobby_instance.save()
                            get_tax_age1=ManagementDetails.objects.all().first().tax_age
                            if get_tax_age1>0:
                                gov_tax=get_tax_age1
                                if hobby_instance.member_age >= gov_tax:
                                    hobby_instance.member_tax_eligible = True
                                    hobby_instance.save()
                                else:
                                    hobby_instance.member_tax_eligible = False
                                    hobby_instance.save()
                                    
                        elif hobby_instance.member_relation_ship=='DAUGHTER' or hobby_instance.member_relation_ship=='WIFE':
                            hobby_instance.head=False
                            hobby_instance.member_tax_eligible = False
                            hobby_instance.save()            
                        
                        if hobby_instance.member_age!=None and hobby_instance.member_age>=18:
                            hobby_instance.adult=True
                            hobby_instance.save()
                        else:
                            hobby_instance.adult=False
                            hobby_instance.save()
                        
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    # hobbies_instance = Member_Details.objects.create(family=instance, **hobby)
                    # hobbies_id_pool.append(hobbies_instance.id)
                    
                    if hobby['member_relation_ship']=='FATHER':
                        hobbies_instance= Member_Details.objects.create(member_no=member_no(),head=True,family=instance,**hobby)
                        management=ManagementDetails.objects.all().first()
                        if hobbies_instance.member_joining_amt>0:
                            pj=PeoplesJOININGAmountDetails.objects.create(member=hobbies_instance,amount=hobbies_instance.member_joining_amt,management_profile=management,created_by=instance.created_by)
                            Report.objects.create(management_profile=management,amount=hobbies_instance.member_joining_amt,created_by=instance.created_by,join_amt=pj,type_choice='Addition')
                            
                            add_amount=ManagementTreasure.objects.filter(management_profile=management).first()                        
                            add_amount.cash_in_hand += hobbies_instance.member_joining_amt
                            add_amount.save()
                            
                        get_tax_age22=ManagementDetails.objects.all().first().tax_age
                        if get_tax_age22>0:
                            gov_tax=get_tax_age22
                            if hobbies_instance.member_age >= gov_tax:
                                hobbies_instance.member_tax_eligible = True
                                hobbies_instance.save()
                        
                        if hobbies_instance.member_age!=None and hobbies_instance.member_age>=18:
                            hobbies_instance.adult=True
                            hobbies_instance.save()
                        else:
                            hobbies_instance.adult=False
                            hobbies_instance.save()
                            
                        hobbies_id_pool.append(hobbies_instance.id)
                    else:
                        print("jjjjjjjjjjjjjjjj")
                        print(member_no())
                        print(instance)
                        print(hobby)                    
                        hobbies_instance=Member_Details.objects.create(member_no=member_no(),head=False,family=instance,**hobby)
                        print(hobbies_instance.management_profile)
                        print(hobbies_instance.created_by)
                        management=ManagementDetails.objects.all().first()
                        if hobbies_instance.member_joining_amt>0:
                            pj=PeoplesJOININGAmountDetails.objects.create(member=hobbies_instance,amount=hobbies_instance.member_joining_amt,management_profile=management,created_by=instance.created_by)
                            Report.objects.create(management_profile=management,amount=hobbies_instance.member_joining_amt,created_by=instance.created_by,join_amt=pj,type_choice='Addition')
                            
                            add_amount=ManagementTreasure.objects.filter(management_profile=management).first()                        
                            add_amount.cash_in_hand += hobbies_instance.member_joining_amt
                            add_amount.save()
                        print(hobbies_instance.member_relation_ship)
                        if hobbies_instance.member_relation_ship=='SON':
                            get_tax_age=ManagementDetails.objects.all().first().tax_age
                            if get_tax_age>0:
                                gov_tax=get_tax_age
                                if hobbies_instance.member_age >= gov_tax:
                                    hobbies_instance.member_tax_eligible = True
                                    hobbies_instance.save()
                                    
                        if hobbies_instance.member_age!=None and hobbies_instance.member_age>=18:
                            hobbies_instance.adult=True
                            hobbies_instance.save()
                        else:
                            hobbies_instance.adult=False
                            hobbies_instance.save()
                                
                        hobbies_id_pool.append(hobbies_instance.id)
            print("hujjjjjjjjjjjjjj")
            print(hobbies_id_pool)
            print(hobbies_with_same_profile_instance)
            for hobby_id in hobbies_with_same_profile_instance:
                if hobby_id not in hobbies_id_pool:
                    print("jikkkkkkk")
                    member_check=Member_Details.objects.filter(pk=hobby_id).first()
                    print(member_check)
                    
                    check_other_trans=PeoplesAmountDetails.objects.filter(member=member_check)
                    authority_obj=AddAuthorityDetails.objects.filter(member=member_check)
                    death_details=DeathDetails.objects.filter(member=member_check)
                    user_checking=User.objects.filter(member=member_check)
                    if member_check.balance_amt_paid:
                        print('mem not be deleted')
                    elif check_other_trans or authority_obj or death_details or user_checking:
                        print('member connect to other operations')
                        pass
                    else:
                        management=ManagementDetails.objects.all().first()
                        add_amount=ManagementTreasure.objects.filter(management_profile=management).first()                        
                        add_amount.cash_in_hand -= member_check.member_joining_amt
                        add_amount.save()  
                        Member_Details.objects.filter(pk=hobby_id).delete()                 

            return instance
        

class Member_DetailsSerializer98(serializers.ModelSerializer):
    class Meta:
        model =Member_Details
        fields = '__all__'
        
class Fammily_DetailsSerializer98(serializers.ModelSerializer):
    class Meta:
        model = Fammily_Details
        fields = '__all__'

#family edit needed   
class Member_DetailsSerializer55(serializers.ModelSerializer):
    class Meta:
        model =Member_Details
        fields = '__all__'

class Fammily_DetailsSerializer55(serializers.ModelSerializer):
    family = Member_DetailsSerializer55(many=True)
    class Meta:
        model = Fammily_Details
        fields = ['id','ancestor','ancestor_detail','family_no','address','head_member_type','head_native_type','years_of_living','members_count','family','death_members_count'] 
        

class Member_DetailsSerializer555(serializers.ModelSerializer):
    class Meta:
        model =Member_Details
        # fields = '__all__'
        fields = ['management_profile','member_name','member_mobile_number','member_dob','member_email','member_gender',
                'member_relation_ship','member_balance_amt','member_joining_amt','member_photo']
        

# new
# class MemberDetailsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Member_Details
#         fields = ['member_name']

# class Fammily_DetailsSerializer870(serializers.ModelSerializer):
#     family_members = MemberDetailsSerializer(many=True, source='family.member_details_set')

#     class Meta:
#         model = Fammily_Details
#         fields = '__all__'


class MemberDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member_Details
        fields = ['member_name']

class Fammily_DetailsSerializer9843(serializers.ModelSerializer):
    head_member_name = serializers.SerializerMethodField()

    class Meta:
        model = Fammily_Details
        fields = '__all__'

    def get_head_member_name(self, obj):
        head_member = obj.family.filter(head=True).first()
        if head_member:
            return head_member.member_name
        return None




# Live members
class MemberDetailsSerializer654(serializers.ModelSerializer):
    class Meta:
        model = Member_Details
        fields = '__all__'

class Fammily_DetailsSerialize87834664(serializers.ModelSerializer):
    family_members = serializers.SerializerMethodField()

    class Meta:
        model = Fammily_Details
        fields = '__all__'

    def get_family_members(self, obj):
        members = obj.family.filter(death=False,marriage_remove=False)
        serializer = MemberDetailsSerializer654(instance=members, many=True)
        return serializer.data

