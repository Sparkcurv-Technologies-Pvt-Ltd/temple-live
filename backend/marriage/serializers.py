from rest_framework import serializers
from .models import MarriageDetails
from django.utils import timezone

def mage_no():
    l=MarriageDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("MARAGE" '%01d' % l)

class MarriageDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    marriage_photo=serializers.ImageField(required=False)
    invitation=serializers.FileField(required=False)
    marriage_photo=serializers.FileField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =MarriageDetails
        fields = '__all__'


    def validate(self, data):
        bride_dob=data.get("bride_dob")
        groom_dob=data.get("groom_dob")
        print(groom_dob)
        if bride_dob > timezone.now().date() or groom_dob>timezone.now().date():
            raise serializers.ValidationError("Birth date cannot be greater than today's date.")
        if bride_dob :
            today = timezone.now().date()
            bride_age = today.year - bride_dob.year - ((today.month, today.day) < (bride_dob.month, bride_dob.day))
            print(bride_age)
            print("99999999")
            if bride_age<18:
                raise serializers.ValidationError("Age must be above 18 years")
        if groom_dob :
            today = timezone.now().date()
            print(groom_dob)
            groom_age = today.year - groom_dob.year - ((today.month, today.day) < (groom_dob.month, groom_dob.day))
            print(groom_age)
            if groom_age<18:
                raise serializers.ValidationError("Age must be above 18 years")
        return data
        

    def create(self, validated_data):
        profile_instance = MarriageDetails.objects.create(marriage_no=mage_no(),**validated_data)               
        return profile_instance
    
    