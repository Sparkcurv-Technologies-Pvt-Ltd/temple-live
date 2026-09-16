from rest_framework import serializers
from .models import PeopleInterestDetails
from rest_framework.exceptions import ValidationError
from django.utils import timezone
import datetime
from balancesheet.models import PeopleInterestBalanceSheet
from dateutil.relativedelta import relativedelta
from datetime import date, timedelta
from collection.models import CollectionDetails




def interest_no():
    l=PeopleInterestDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("INT" '%01d' % l)

class PeopleInterestDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    photo=serializers.ImageField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =PeopleInterestDetails
        fields = '__all__'
        
    def create(self, validated_data):
        profile_instance = PeopleInterestDetails.objects.create(intrest_no=interest_no(),**validated_data)               
        return profile_instance
    
    
    def validate(self, validated_data):
        print(validated_data)
        if validated_data['interest_date'] > timezone.now().date():
            raise serializers.ValidationError("Interest date cannot be greater than today")
        else:
            # ------------------------------------------------------------------
            # Owner rule (Sep 2026): interest_date may now be any date on or
            # before today — no longer restricted to the current or previous
            # calendar month. Previously this raised "Interest can only be
            # added with the interest date of current month and previous
            # month." for anything older, which blocked legitimate backdated
            # entries (e.g. Management Interest for 16-Aug-2026 while
            # today's date is in September).
            #
            # Note: backdating a loan by months/years means the overdue
            # accrual engine (interest.overdue_views._apply_for_record /
            # _apply_for_installment) will generate that entire backlog of
            # interest/penalty charges the next time the record is touched
            # (profile view, nightly cron). That's expected behavior, not
            # a bug introduced by this change.
            # ------------------------------------------------------------------
            rate_type = validated_data.get("interest_type_new")
            fix_rate = validated_data.get("fix_interest_rate_percent")
            if (
                rate_type == "percentage"
                and fix_rate is not None
                and float(fix_rate) > 100
            ):
                raise serializers.ValidationError({
                    "fix_interest_rate_percent":
                        "Fix Interest Rate percentage cannot exceed 100%.",
                })

            penalty_type = validated_data.get("penalty_type")
            penalty_amount = validated_data.get("penalty_amount")
            if (
                penalty_type == "percentage"
                and penalty_amount is not None
                and float(penalty_amount) > 100
            ):
                raise serializers.ValidationError({
                    "penalty_amount":
                        "Penalty percentage cannot exceed 100%.",
                })
            return validated_data


class PeopleInterestBalanceDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    # photo=serializers.ImageField(required=False)
    # action = serializers.BooleanField(default=True)
    amount = serializers.SerializerMethodField()
    class Meta:
        model =PeopleInterestDetails
        fields = ['id','management_profile','intrest_no','interest_category','interest_type','chitt_fund',
                        'chit_name','photo','people_type','people_member','people_name','people_address','people_email','people_mobile','principal_amt','interest_amt','interest_period','interest_period_type','installment_amt','amount']

    def get_amount(self, obj):
        # Reads the authoritative outstanding-balance fields
        # (principal_balance + intrest_balance_amt + penalty_balance_amt)
        # directly from PeopleInterestBalanceSheet, matching every payment/
        # reversal path elsewhere in the codebase.
        interest_balance_sheet = PeopleInterestBalanceSheet.objects.filter(interest=obj).first()
        if not interest_balance_sheet:
            return None
        return (
            float(interest_balance_sheet.principal_balance or 0)
            + float(interest_balance_sheet.intrest_balance_amt or 0)
            + float(interest_balance_sheet.penalty_balance_amt or 0)
        )