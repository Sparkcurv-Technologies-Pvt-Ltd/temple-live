from django.db import models
from family.models import Fammily_Details,Member_Details
from management.models import ManagementDetails
from django.core.validators import RegexValidator


NATIVE_CHOICES = (
    ('Member','Member'),
    ('Other','Other')
)

class ChitFundsDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundsDetails_link_on_management')
    chit_no=models.CharField(max_length=255,null=True,blank=True)
    chit_name=models.CharField(max_length=255,null=True)
    starting_date=models.DateField(null=True)
    set_profit_percent=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    set_intrest_percent=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    management_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    outer_invest_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    
    total_chitfund_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    
    principal_given_amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    profit_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    
    cash_inhand_amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)    
    
    collected_principal_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    invest_retake=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    profit_retake=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    management_retake=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)

    total_share_count=models.IntegerField(null=True,blank=True,default=0)
    management_share_count=models.IntegerField(null=True,blank=True,default=0)
    investers_share_count=models.IntegerField(null=True,blank=True,default=0)
    fixed_chitfund_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)

    retake_management_share_count=models.IntegerField(null=True,blank=True,default=0)
    retake_investers_share_count=models.IntegerField(null=True,blank=True,default=0)

    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True) 
    #new
    management_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0,blank=True)
    
class ChitFundInvesters(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")    
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundInvesters3_link_on_management')    
    chitt_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='chitt_fund')
    invester_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='mem_linj_ChitFundInvesters')
    invester_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True)
    invester_name=models.CharField(max_length=255,null=True)
    invester_address=models.TextField(null=True)
    invester_email=models.EmailField(null=True,blank=True)
    invester_mobile=models.CharField(validators=[phone_regex],max_length=255,null=True)
    investment_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    documents=models.FileField(null=True,blank=True)
    images=models.ImageField(null=True,blank=True)
    first_investers=models.BooleanField(default=False,null=True,blank=True)
    comments=models.TextField(null=True,blank=True)
    joining_date=models.DateField(null=True,blank=True)
    
    share_count=models.IntegerField(null=True,blank=True,default=0)
    retake_share_count=models.IntegerField(null=True,blank=True,default=0)

    share_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0,blank=True)
    final_settlement_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0,blank=True)
    application_date=models.DateField(null=True,blank=True)
    settled=models.BooleanField(default=False,null=True,blank=True)
    settlement_date=models.DateField(null=True,blank=True)

    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
     #new
    collected_share_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0,blank=True)
    

class ChitFundsettleAplication(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundsettleAplication_link_on_management')
    chitt_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundsettleAplication_link_in_ChitFundsDetails')
    chit_fund_name=models.CharField(max_length=255,null=True)
    investers=models.OneToOneField(ChitFundInvesters,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundInvesters_link_ChitFundsettleAplication')
    invester_name=models.CharField(max_length=255,null=True)
    comments=models.TextField(null=True,blank=True)
    settlement_date=models.DateField(null=True)
    settlement_aplication_no=models.CharField(max_length=255,null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class ChitFundSettlement(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundSettlement_link_on_management_settlement')
    chitt_settilement=models.OneToOneField(ChitFundsettleAplication,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundSettlement_link_in_ChitFundsettleAplication')
    chitt_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundSettlementghfddddff_link_in_ChitFundsDetails')
    chit_fund_name=models.CharField(max_length=255,null=True)
    investers=models.OneToOneField(ChitFundInvesters,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundInvestersrrrr_link_ChitFundSettlement')
    invester_name=models.CharField(max_length=255,null=True)
    invested_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    share_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    final_settlement_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    application_date=models.DateField(null=True)
    date_of_investment=models.DateField(null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class ChitFundDistribution(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundSettlement_link_on_management_distribution')
    chitt_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundSettlementghfddddff_link_in_ChitFundsDetails_distribution')
    chit_fund_name=models.CharField(max_length=255,null=True)
    outside_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    management_invested_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    total_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    profit_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    per_head_share_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    management_share=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    distribution_percent=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    distribution_date=models.DateField(null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
    # new
    managee_share_count=models.IntegerField(null=True,blank=True,default=0)
    profit=models.BooleanField(default=False,null=True,blank=True)
    
class InvestersProfitDistributionTable(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='InvestersProfitDistributionTable_link_on_management_distribution')
    chitt_distribution=models.ForeignKey(ChitFundDistribution,on_delete=models.CASCADE,null=True,blank=True,related_name='chitt_distribution')
    investers=models.ForeignKey(ChitFundInvesters,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundInvesters_link_in_InvestersProfitDistributionTable')
    investment_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0,blank=True)
    share_count=models.IntegerField(null=True,blank=True,default=0)
    share_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0,blank=True)
    profit_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
