from rest_framework import serializers
from .models import AddSangamName,AddSangamDetails,SangamMembers
from rest_framework.exceptions import ValidationError

def SANGAM_no():
    l=AddSangamDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("SAN" '%01d' % l)

class AddSangamNameSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =AddSangamName
        fields = '__all__'
        

class SangamMembersSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    class Meta:
        model =SangamMembers
        fields = ['id','member','member_name','member_no']  

class AddSangamDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    sangama = SangamMembersSerializer(many=True)
    class Meta:
        model = AddSangamDetails
        fields = ['id','name','sangam_name','head_member','head_name','head_mem_no','secretry_member','secretry_name','secretry_mem_no','treasurey_member',
                  'treasurey_name','treasurey_mem_no','starting_date','opening_balance_amt','sangama'] 

    def create(self, validated_data):
        sangama = validated_data.pop('sangama')
        profile_instance = AddSangamDetails.objects.create(sangam_no=SANGAM_no(),**validated_data)
        for hobby in sangama:
            SangamMembers.objects.create(sangama=profile_instance,**hobby)
                        
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('sangama')
            instance.sangam_name = validated_data.get('sangam_name', instance.sangam_name)         
            instance.name = validated_data.get('name', instance.name)                 
            instance.head_member = validated_data.get('head_member', instance.head_member)          
            instance.head_name = validated_data.get('head_name', instance.head_name) 
            instance.secretry_member = validated_data.get('secretry_member', instance.secretry_member)                  
            instance.secretry_name = validated_data.get('secretry_name', instance.secretry_name)                  
            instance.secretry_mem_no = validated_data.get('secretry_mem_no', instance.secretry_mem_no)        
            instance.treasurey_member = validated_data.get('treasurey_member', instance.treasurey_member)         
            instance.treasurey_name = validated_data.get('treasurey_name', instance.treasurey_name)                 
            instance.treasurey_mem_no = validated_data.get('treasurey_mem_no', instance.treasurey_mem_no)          
            instance.starting_date = validated_data.get('starting_date', instance.starting_date) 
            instance.opening_balance_amt = validated_data.get('opening_balance_amt', instance.opening_balance_amt)                             
            instance.save()
                    
            hobbies_with_same_profile_instance = SangamMembers.objects.filter(sangama=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            
            hobbies_with_s = SangamMembers.objects.filter(sangama=instance.pk)
            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                if "id" in hobby.keys():
                    if SangamMembers.objects.filter(id=hobby['id']).exists():
                        hobby_instance = SangamMembers.objects.get(id=hobby['id'])
                        hobby_instance.member = hobby.get('member', hobby_instance.member)
                        hobby_instance.member_name = hobby.get('member_name', hobby_instance.member_name)
                        hobby_instance.member_no = hobby.get('member_no', hobby_instance.member_no)
                        hobby_instance.save()
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = SangamMembers.objects.create(sangama=instance, **hobby)
                    hobbies_id_pool.append(hobbies_instance.id)
    
            for hobby_id in hobbies_with_same_profile_instance:
                if hobby_id not in hobbies_id_pool:
                    SangamMembers.objects.filter(pk=hobby_id).delete()
            return instance