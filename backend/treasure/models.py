from django.db import models
from management.models import ManagementDetails
from fund.models import FundGroupDetails

OPENING_CHOICES = (
    ('Credit','Credit'),
    ('Debit','Debit'),
)

class ManagementTreasure(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_ManagementTreasure')
    cash_in_hand=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    expence_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    bank_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    bank_withdraw_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    
    loan_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    loan_repay_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    
    income_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    reduce_expence_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    
    treasure_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class ManagementFunds(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_in_ManagementFunds')
    fund=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='FundGroupDetails_in_ManagementFunds')
    date=models.DateField(null=True,blank=True)
    fund_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    collected_fund_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class ManagementBalanceSheet(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_ManagementBalanceSheet')
    date=models.DateField(null=True,blank=True)
    opening_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    opening_balance_type=models.CharField(max_length=255,choices=OPENING_CHOICES,null=True,blank=True)    
    managee=models.BooleanField(default=False,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


