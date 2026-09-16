from rest_framework import serializers
from .models import ADDIncomeDetails,ADDIncomeCategory,ADDIncomeNames
from django.utils import timezone


class ADDIncomeCategorySerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDIncomeCategory
        fields = '__all__'
        
class ADDIncomeNamesSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDIncomeNames
        fields = '__all__'

class ADDIncomeDetailsSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDIncomeDetails
        fields = '__all__'

    def validate_date(self, date):
        if date and date > timezone.now().date():
            raise serializers.ValidationError("Date cannot be greater than today's date.")
        return date