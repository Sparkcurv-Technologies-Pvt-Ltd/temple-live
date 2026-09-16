from rest_framework import serializers
from .models import ADDExpenseCategory,ADDExpenseNames,ADDExpenseDetails
from django.utils import timezone

class ADDExpenseCategorySerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDExpenseCategory
        fields = '__all__'
        
class ADDExpenseNamesSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDExpenseNames
        fields = '__all__'
        
class ADDExpenseDetailsSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDExpenseDetails
        fields = '__all__'

    def validate_date(self, date):
        if date and date > timezone.now().date():
            raise serializers.ValidationError("Date cannot be greater than today's date.")
        return date

    