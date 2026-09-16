from rest_framework import serializers
from .models import PeoplesAmountDetails,CashTransactionDetails
from treasure.models import ManagementTreasure

class PeoplesAmountDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model= PeoplesAmountDetails
        fields='__all__'


class ManagementTreasureSerializer(serializers.ModelSerializer):
    class Meta:
        model= ManagementTreasure
        fields='__all__'



class PeoplesAmount123DetailsSerializer(serializers.ModelSerializer):
    name_type = serializers.SerializerMethodField()
    member_name = serializers.SerializerMethodField()
    type_name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    member_no = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    name_type_no =serializers.SerializerMethodField()


    class Meta:
        model= PeoplesAmountDetails
       
        fields=['id','management_profile','member','festival','sub_tariff','marriage','daughters_amt','death','amount',
                'paid','penalty','penalty_amount','exception_amount','exception','name','amount_balance',
                'penalty_balance','total_paid_amt','total_bal_amt','created_by','created_at','name_type','member_name','type_name','mobile_number','member_no','date','name_type_no',"penalty_applied_date"]
        
    def get_name_type(self, obj):
        if obj.death_id:
            return obj.death.member_name
        elif obj.festival_id:
            return obj.festival.festival_name
        elif obj.marriage_id:
            return obj.marriage.marriage_no
        elif obj.sub_tariff_id:
            return obj.sub_tariff.subscription_no
        else:
            return None
        
    def get_member_name(self, object):
        if object.member_id:
            return object.member.member_name
        else:
            return None
    def get_mobile_number(self, object2):
        if object2.member_id:
            return object2.member.member_mobile_number
        else:
            return None
    def get_member_no(self, object3):
        if object3.member_id:
            return object3.member.member_no
        else:
            return None
        
    def get_date(self, object5):
            return object5.created_at

    def get_name_type_no(self, obj122):
        if obj122.death_id:
            return obj122.death.death_no
        elif obj122.festival_id:
            return obj122.festival.festival_no
        elif obj122.marriage_id:
            return obj122.marriage.marriage_no
        elif obj122.sub_tariff_id:
            return obj122.sub_tariff.subscription_no
        else:
            return None
         
        
    def get_type_name(self, obj1):
        if obj1.death_id:
            return obj1.death.member_name
        elif obj1.festival_id:
            return obj1.festival.festival_name
        # elif obj1.marriage_id:
        #     return obj1.marriage.marriage_no
        # elif obj1.sub_tariff_id:
        #     return obj1.sub_tariff.subscription_no
        else:
            return None

class Cash_serializer(serializers.ModelSerializer):
    class Meta:
        model= CashTransactionDetails
        fields='__all__'