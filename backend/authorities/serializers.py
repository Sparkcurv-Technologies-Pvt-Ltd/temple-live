from rest_framework import serializers
from .models import ADD_EXFields,AddPosition,AddAuthorityDetails,AutharityFields
from rest_framework.exceptions import ValidationError
from django.utils import timezone

class ADD_EXFieldsSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADD_EXFields
        fields = '__all__'
        
class AddPositionSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =AddPosition
        fields = '__all__'

class AutharityFieldsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    class Meta:
        model =AutharityFields
        # fields = '__all__'
        fields = ['id','name','valuess']  

class AddAuthorityDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    status=serializers.CharField(required=False)
    atharity = AutharityFieldsSerializer(many=True,required=False)
    class Meta:
        model = AddAuthorityDetails
        fields = ['id','desgnation','member','member_name','position_name','from_date','to_date','comments','status','member_no','atharity'] 
    
    # optional 
    def validate_end_date(self, to_date):
        if to_date and to_date < timezone.now().date():
            raise serializers.ValidationError("To date cannot be less than today's date.")
        return to_date

    def create(self, validated_data):
        try:
            atharity = validated_data.pop('atharity')
            rejin=True
        except Exception:
            rejin=False
        profile_instance = AddAuthorityDetails.objects.create(**validated_data)
        if rejin:
            for hobby in atharity:
                AutharityFields.objects.create(atharity=profile_instance,**hobby)
                        
        return profile_instance
    
    def update(self, instance, validated_data):
        try:
            user_hobby_list = validated_data.pop('atharity')
        except Exception:
            user_hobby_list=False
            
        instance.desgnation = validated_data.get('desgnation', instance.desgnation)         
        instance.member = validated_data.get('member', instance.member)                 
        instance.member_name = validated_data.get('member_name', instance.member_name)          
        instance.position_name = validated_data.get('position_name', instance.position_name) 
        instance.from_date = validated_data.get('from_date', instance.from_date)                  
        instance.to_date = validated_data.get('to_date', instance.to_date)                  
        instance.comments = validated_data.get('comments', instance.comments)   
        instance.member_no = validated_data.get('member_no', instance.member_no)                         
        instance.save()
        
        if user_hobby_list:      
            hobbies_with_same_profile_instance = AutharityFields.objects.filter(atharity=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            
            hobbies_with_s = AutharityFields.objects.filter(atharity=instance.pk)
            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                if "id" in hobby.keys():
                    if AutharityFields.objects.filter(id=hobby['id']).exists():
                        hobby_instance = AutharityFields.objects.get(id=hobby['id'])
                        hobby_instance.name = hobby.get('name', hobby_instance.name)
                        hobby_instance.valuess = hobby.get('valuess', hobby_instance.valuess)
                        hobby_instance.save()
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = AutharityFields.objects.create(atharity=instance, **hobby)
                    hobbies_id_pool.append(hobbies_instance.id)

            for hobby_id in hobbies_with_same_profile_instance:
                if hobby_id not in hobbies_id_pool:
                    AutharityFields.objects.filter(pk=hobby_id).delete()
                    
        else:
            hobbies_profile=AutharityFields.objects.filter(atharity=instance.pk)
            if hobbies_profile:
                for h in hobbies_profile:
                    h.delete()
            
        return instance