from rest_framework import serializers
from .models import PeopleInterestBalanceSheet,FundBalanceSheet,FundMembersBalanceSheet,RentalBalanceSheet,MoveableRentBalanceSheet



class PeopleInterestssssBalanceSheetSerializer(serializers.ModelSerializer):
    # interest_no =serializers.SerializerMethodField()
    member_name =serializers.CharField(source='interest.people_name', read_only=True)
    interest_no = serializers.CharField(source='interest.intrest_no', read_only=True)
    mobile_no = serializers.CharField(source='interest.people_mobile', read_only=True)
    installment_amt = serializers.CharField(source='interest.installment_amt', read_only=True)


    class Meta:
        model= PeopleInterestBalanceSheet
        fields=['installment_amt','mobile_no','interest_no','member_name','id','management_profile','interest','date','principal_amt','principal_paid','principal_balance','intrest_amt','intrest_paid_amt','intrest_balance_amt','penalty_amt','penalty_paid_amt','penalty_balance_amt','credit_amt','debit_amt','balance_amt','interest_apply_date','first_interest_apply','first_penalty_apply','paid','discount','discount_amt','closed','pay_done']

class PeopleInterestBalanceSheetSerializer(serializers.ModelSerializer):
    interest_cat =serializers.SerializerMethodField()
    installment_amt =serializers.SerializerMethodField()
    interest_current_month=serializers.SerializerMethodField()

    class Meta:
        model= PeopleInterestBalanceSheet
        fields=['id','interest_current_month','management_profile','interest','date','principal_amt','principal_paid','principal_balance','intrest_amt','intrest_paid_amt','intrest_balance_amt','penalty_amt','penalty_paid_amt','penalty_balance_amt','credit_amt','debit_amt','balance_amt','interest_apply_date','first_interest_apply','first_penalty_apply','paid','discount','discount_amt','closed','pay_done','interest_cat','installment_amt']
        

    def get_interest_cat(self, object1):
        if object1.interest_id:
            return object1.interest.interest_category
        else:
            return None
        
    def get_installment_amt(self, object2):
        if object2.interest_id:
            return object2.interest.installment_amt
        else:
            return None
        
    def get_interest_current_month(self, object3):
        if object3.interest_id:
            return object3.interest.interest_amt
        else:
            return None
        
        
class FundBalanceSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model= FundBalanceSheet
        fields='__all__'



class FundMembersBalanceSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model= FundMembersBalanceSheet
        fields='__all__'



class RentalBalanceSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model= RentalBalanceSheet
        fields='__all__'


class MoveableRentBalanceSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model= MoveableRentBalanceSheet
        fields='__all__'