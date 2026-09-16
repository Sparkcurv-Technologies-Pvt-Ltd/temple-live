from rest_framework import serializers
from .models import CollectionDetails
from django.utils import timezone

def coll_no():
    l=CollectionDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("COL" '%01d' % l)

class CollectionDetailsSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    interest_category = serializers.SerializerMethodField()
    class Meta:
        model =CollectionDetails
        fields = ['id','management_profile','collaction_no','collection_category','marriage','funds','fund_lease','festivals','rentsandlease','sub_tariff','interest','interest_balance','interest_principle','interest_field','moveablerent','fund_name','death_tariff','amount_link','fund_member','present','fund_type','absent_amt','exception_amt','person_type','member','member_name',
                  'amount','interst_amount','penalty_amount','payment_mode','pay_date','comments','festival_name','death_name','marriage_name','balance_name','moveable_rent_name','rent_name','lease_name','chit_name','chitt_fund','bill_by_name','sub_tariff_no','transaction_type','ref_moverent_bal','bank_link','bank_name','transaction_date','trans_no','upi_no',
                  'cheque_no','bank_pay','action','created_by','moveable_asset_payment','mobile_number','created_at','updated_at','discount_amount','no_count_install','interest_category','balance_split_json']

        read_only_fields = ['balance_split_json']
           
    # def validate_start_date(self, start_date):
    #     if start_date and start_date < timezone.now().date():
    #         raise serializers.ValidationError("From date cannot be less than today's date.")
    #     return start_date
    
    
    def create(self, validated_data):
        profile_instance = CollectionDetails.objects.create(collaction_no=coll_no(),**validated_data)               
        return profile_instance
    

    def get_interest_category(self, object):
        if object.interest_id:
            return object.interest.interest_category
        else:
            return None