from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields=['id','name','email','password','user_role','mobile_number']
        extra_kwargs={
            'password':{'write_only':True}
        }
        
    def create(self, validated_data):
        password=validated_data.pop('password', None)
        instance=self.Meta.model(**validated_data)
        instance.password_new = self.validated_data['password']
        instance.save()
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
            
            
class MyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields=['id','name','email','password','user_role','created_at']
        
class MyUserSerializer2(serializers.ModelSerializer):
    class Meta:
        model= User
        fields=['id','name','email','password_new','user_role','created_at','mobile_number']

# new one
class RejinUserSerializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields=['id','member','status','my_role','name','email','password','user_native_type','management_profile','role_name','mobile_number','address','gender','person_email','member_no','othersname']
        extra_kwargs={
            'password':{'write_only':True}
        }
        
    def create(self, validated_data):
        password=validated_data.pop('password', None)
        instance=self.Meta.model(**validated_data)
        instance.password_new = self.validated_data['password']
        instance.save()
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
    

class RejinUserSerializer78(serializers.ModelSerializer):
    class Meta:
        model= User
        fields='__all__'



class Investor_user_Serializer(serializers.ModelSerializer):
    is_investor = serializers.BooleanField(required=False)
    class Meta:
        model= User
        fields=['id','name','email','password','user_role','mobile_number','chit_fund_investor','is_investor','chit_fund','chit_fund_name','chit_fund_investor_name']
        extra_kwargs={
            'password':{'write_only':True}
        }
        
    def create(self, validated_data):
        password=validated_data.pop('password', None)
        instance=self.Meta.model(**validated_data)
        instance.password_new = self.validated_data['password']
        instance.save()
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
            