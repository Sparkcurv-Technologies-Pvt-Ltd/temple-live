from rest_framework import serializers
from .models import OtherPeopleDetails

class OtherPeopleDetailsSerializer(serializers.ModelSerializer):
    # id=serializers.IntegerField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =OtherPeopleDetails
        fields = '__all__'
