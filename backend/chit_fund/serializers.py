from rest_framework import serializers
from .models import ChitFundsDetails,ChitFundInvesters,ChitFundsettleAplication,ChitFundSettlement,ChitFundDistribution,InvestersProfitDistributionTable
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from treasure.models import ManagementTreasure


def chit_fnd_no():
    l=ChitFundsDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("CHIT" '%01d' % l)

def chit_fnd_application_no():
    l=ChitFundsettleAplication.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("CHIT-APP" '%01d' % l)


class ChitFundsDetailsSerializer26(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    # chitt_fund = ChitFundInvestersSerializer(many=True)
    class Meta:
        model = ChitFundsDetails
        fields = "__all__"


class ManagementTreasureSerializer(serializers.ModelSerializer):    
    class Meta:
        model =ManagementTreasure
        fields = '__all__'


class ChitFundInvestersSerializer2(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    documents=serializers.FileField(required=False)
    images=serializers.ImageField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ChitFundInvesters
        fields = '__all__'

class ChitFundInvestersSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    documents=serializers.FileField(required=False)
    images=serializers.ImageField(required=False)
    action = serializers.BooleanField(default=True)
    joining_date=serializers.DateField(required=False)
    # new
    im_status=serializers.BooleanField(required=False)
    doc_status=serializers.BooleanField(required=False)
    class Meta:
        model =ChitFundInvesters
        # fields = '__all__'
        # new
        fields=['id','invester_member','invester_type','invester_name','invester_address','invester_email','invester_mobile','investment_amt','documents','images',
                'comments','joining_date','share_count','im_status','doc_status','chitt_fund','share_amount','final_settlement_amount','application_date','settled','settlement_date','action','created_by']

class ChitFundsDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    chitt_fund = ChitFundInvestersSerializer(many=True)
    class Meta:
        model = ChitFundsDetails
        fields = ['id','management_share_count','fixed_chitfund_amount','chit_name','starting_date','management_amt','set_profit_percent','set_intrest_percent','chitt_fund'] 

    def validate(self, data):
        # Enforce hard 100 % cap for both Set Profit and Set Fund Interest.
        for field_name, label in (
            ("set_profit_percent", "Set Profit"),
            ("set_intrest_percent", "Set Fund Interest"),
        ):
            value = data.get(field_name)
            if value is None and self.instance is not None:
                value = getattr(self.instance, field_name, None)
            if value is not None and float(value) > 100:
                raise serializers.ValidationError({
                    field_name: f"{label} percentage cannot exceed 100%."
                })
        return data

    def create(self, validated_data):
        chitt_fund = validated_data.pop('chitt_fund')
        profile_instance = ChitFundsDetails.objects.create(chit_no=chit_fnd_no(),**validated_data)
        for hobby in chitt_fund:
            ChitFundInvesters.objects.create(first_investers=True,chitt_fund=profile_instance,**hobby)
                        
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('chitt_fund')
            instance.chit_name = validated_data.get('chit_name', instance.chit_name)         
            instance.starting_date = validated_data.get('starting_date', instance.starting_date)                 
            instance.management_amt = validated_data.get('management_amt', instance.management_amt)          
            instance.set_profit_percent = validated_data.get('set_profit_percent', instance.set_profit_percent) 
            instance.set_intrest_percent = validated_data.get('set_intrest_percent', instance.set_intrest_percent)  
            instance.management_share_count = validated_data.get('management_share_count', instance.management_share_count)                                  
            instance.fixed_chitfund_amount = validated_data.get('fixed_chitfund_amount', instance.fixed_chitfund_amount)                                  

            instance.save()
                    
            hobbies_with_same_profile_instance = ChitFundInvesters.objects.filter(chitt_fund=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            
            hobbies_with_s = ChitFundInvesters.objects.filter(chitt_fund=instance.pk)
            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                # new
                try:
                    varities_data1 = hobby.pop('im_status')
                except Exception:
                    pass
                
                try:
                    varities_data1 = hobby.pop('doc_status')
                except Exception:
                    pass
                
                if "id" in hobby.keys():
                    if ChitFundInvesters.objects.filter(id=hobby['id']).exists():
                        hobby_instance = ChitFundInvesters.objects.get(id=hobby['id'])
                        hobby_instance.invester_member = hobby.get('invester_member', hobby_instance.invester_member)
                        hobby_instance.invester_type = hobby.get('invester_type', hobby_instance.invester_type)
                        hobby_instance.invester_name = hobby.get('invester_name', hobby_instance.invester_name)
                        hobby_instance.invester_address = hobby.get('invester_address', hobby_instance.invester_address)
                        hobby_instance.invester_email = hobby.get('invester_email', hobby_instance.invester_email)    
                        hobby_instance.invester_mobile = hobby.get('invester_mobile', hobby_instance.invester_mobile)
                        hobby_instance.investment_amt = hobby.get('investment_amt', hobby_instance.investment_amt)
                        hobby_instance.documents = hobby.get('documents', hobby_instance.documents)
                        hobby_instance.images = hobby.get('images', hobby_instance.images)    
                        hobby_instance.save()
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = ChitFundInvesters.objects.create(first_investers=True,chitt_fund=instance, **hobby)
                    hobbies_id_pool.append(hobbies_instance.id)
    
            for hobby_id in hobbies_with_same_profile_instance:
                if hobby_id not in hobbies_id_pool:
                    ChitFundInvesters.objects.filter(pk=hobby_id).delete()
            return instance

class ChitFundsettleAplicationSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    action = serializers.BooleanField(default=True)
    # Derived fields pulled from the linked investor so the settlement
    # application list can show Share Amount and Total Amount directly.
    investment_amt = serializers.SerializerMethodField()
    share_amount = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    share_count = serializers.SerializerMethodField()

    class Meta:
        model =ChitFundsettleAplication
        fields = '__all__'

    def get_investment_amt(self, obj):
        inv = getattr(obj, 'investers', None)
        return float(getattr(inv, 'investment_amt', 0) or 0)

    def get_share_amount(self, obj):
        inv = getattr(obj, 'investers', None)
        # collected_share_amount = live accumulated share; falls back to share_amount if 0
        collected = float(getattr(inv, 'collected_share_amount', 0) or 0)
        if collected == 0:
            collected = float(getattr(inv, 'share_amount', 0) or 0)
        return collected

    def get_total_amount(self, obj):
        return self.get_investment_amt(obj) + self.get_share_amount(obj)

    def get_share_count(self, obj):
        inv = getattr(obj, 'investers', None)
        return int(getattr(inv, 'share_count', 0) or 0)
        
    def validate_settlement_date(self, settlement_date):
        if settlement_date and settlement_date < timezone.now().date():
            raise serializers.ValidationError("The settlement_date cannot be less than today's date.")
        return settlement_date
    
    def create(self, validated_data):
        profile_instance = ChitFundsettleAplication.objects.create(settlement_aplication_no=chit_fnd_application_no(),**validated_data)               
        return profile_instance

class ChitFundSettlementSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ChitFundSettlement
        fields = '__all__'


class ChitFundsDistributionSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)    
    class Meta:
        model = ChitFundDistribution
        fields = "__all__"

# used only for get
class ChitFundInvesterssSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    documents=serializers.FileField(required=False)
    images=serializers.ImageField(required=False)
    action = serializers.BooleanField(default=True)
    joining_date=serializers.DateField(required=False)
    class Meta:
        model =ChitFundInvesters
        fields = '__all__'

class ChitFundsDetailssSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    chitt_fund = ChitFundInvesterssSerializer(many=True)
    class Meta:
        model = ChitFundsDetails
        fields = ['id','management_profile','invest_retake','action','collected_principal_amount','cash_inhand_amount','principal_given_amount','profit_amount','outer_invest_amount','set_intrest_percent','management_amt','chit_name','starting_date','set_profit_percent','id','chit_name','starting_date','management_amt','set_profit_percent','set_intrest_percent','chitt_fund','chit_no',
                  'profit_retake','management_retake','total_share_count','management_share_count','investers_share_count','fixed_chitfund_amount','retake_management_share_count','retake_investers_share_count','action','created_by','created_at','updated_at'] 
        
        
# for profit distribution 
class InvestersProfitDistributionTableSerializer987(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)   
    invester_name = serializers.CharField(source='investers.invester_name', read_only=True) 
    class Meta:
        model = InvestersProfitDistributionTable
        # fields = "__all__"
        fields = ['id','management_profile','investers','investment_amt','share_count','share_amount','profit_amount','created_by','created_at','updated_at','invester_name']
        

class ChitFundsDistributionSerializer98756(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False) 
    chitt_distribution = InvestersProfitDistributionTableSerializer987(many=True)   
    class Meta:
        model = ChitFundDistribution
        # fields = "__all__"
        fields = ['id','chitt_distribution','management_profile','chitt_fund','chit_fund_name','outside_amount','management_invested_amount','total_amount','profit_amount','per_head_share_amount','management_share','distribution_percent','distribution_date','created_by','created_at','updated_at','managee_share_count','profit'] 
        