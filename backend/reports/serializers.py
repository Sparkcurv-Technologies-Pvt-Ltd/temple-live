from rest_framework import serializers
from .models import Report, TempleMemberReport, FundMemberReport, ChitFundInterestOverallReport, InterestPeopleReport

class TempleMemberReportSerializer(serializers.ModelSerializer):
    name_type = serializers.SerializerMethodField()
    class Meta:
        model =TempleMemberReport
        fields = ['id','management_profile','members','marriage','festivals','sub_tariff','death_tariff','collection','reportdate',
                'credit_amt','debit_amt','balance_amt','type_choice','created_by','created_at','name_type']

    def get_name_type(self, obj):
        if obj.death_tariff_id:
            return obj.death_tariff.member_name
        elif obj.festivals_id:
            return obj.festivals.festival_name
        elif obj.marriage_id:        
            return obj.marriage.marriage_no
        elif obj.sub_tariff_id:
            return obj.sub_tariff.subscription_no
        else:
            return None
        
class ReportNewSerializer(serializers.ModelSerializer):
    bank_name = serializers.SerializerMethodField()
    bank_name2 = serializers.SerializerMethodField()
    type_choice = serializers.SerializerMethodField()


    class Meta:
        model =Report
        fields = ['id','banks','marriage','rentsandlease','festivals','sub_tariff','death_tariff','interest','fund_m','fund_member','moveablerent','management_profile','created_by','type_choice',
                'collection','members','incomes','expenses','amount','created_at','mangebalancesheet','join_amt','managee','balance','from_bank','cash_transaction','bank_name','bank_name2']


    def get_type_choice(self, obj):
        
        if obj.type_choice=="Addition":
            return "Credit"
        elif obj.type_choice=="Reduction":
            return "Debit"
        else:
            return obj.type_choice
    
    def get_bank_name(self, obj):
        if obj.banks_id:
            return obj.banks.bank_name
        else:
            return None
    
    def get_bank_name2(self, obj2):
        if obj2.from_bank_id:
            return obj2.from_bank.bank_name
        else:
            return None
        
class FundMemberReportSerializer(serializers.ModelSerializer):
    class Meta:
        model =FundMemberReport
        fields = '__all__'



class InterestPeopleReportserializer(serializers.ModelSerializer):
    class Meta:
        model =InterestPeopleReport
        fields = '__all__'
        depth = 1


class ChitFundInterestOverallReport_serializer(serializers.ModelSerializer):
    class Meta:
        model =ChitFundInterestOverallReport
        fields = '__all__'