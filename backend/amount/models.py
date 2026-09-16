from django.db import models
from management.models import ManagementDetails,BankDetails
from family.models import Member_Details
from festival.models import ADDFestivalDetails
from sub_tariff.models import ADDSubscriptionTariffDetails

from interest.models import PeopleInterestDetails
from marriage.models import MarriageDetails
from death.models import DeathDetails
from django.core.validators import RegexValidator

NAME_CHOICES = (
    ('Festival','Festival'),
    ('Subscription Tariff','Subscription Tariff'),
    ('Marriage','Marriage'),
    ('Death','Death'),
    ('Old Balance','Old Balance'),
)

TRANSACTION_CHOICES = (
    ('Bank To Cash','Bank To Cash'),
    ('Cash To Bank','Cash To Bank'), 
    ('Loan Amount','Loan Amount'),
    ('Loan Repayment','Loan Repayment'), 
    ('Bank To Bank','Bank To Bank'),
    ('Cash Borrowed','Cash Borrowed'),
    ('Cash Paid','Cash Paid'),


    
)

MEMBER_TYPE_CHOICES=(
    ('Member','Member'),
    ('Other','Other'),

)

class PeoplesAmountDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_Amount_Details')
    member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Amount_Details_connected_to_member')
    festival=models.ForeignKey(ADDFestivalDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Amount_Details_connected_to_ADDFestivalDetails')
    sub_tariff=models.ForeignKey(ADDSubscriptionTariffDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Amount_Details_connected_to_ADDSubscriptionTariffDetails')

    # later adding 
    marriage=models.ForeignKey(MarriageDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Amount_Details_connected_to_MarriageDetails')
    daughters_amt=models.BooleanField(default=False,null=True,blank=True)
    
    death=models.ForeignKey(DeathDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Amount_Details_connected_to_DeathDetails')
    
    amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    paid=models.BooleanField(default=False,null=True,blank=True)
    penalty=models.BooleanField(default=False,null=True,blank=True)
    penalty_amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    exception_amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    exception=models.BooleanField(default=False,null=True,blank=True)
    name=models.CharField(max_length=255,null=True,blank=True,choices=NAME_CHOICES)
    amount_balance=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    penalty_balance=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    penalty_applied_date = models.DateField(null=True, blank=True)
    total_paid_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    total_bal_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class PeoplesJOININGAmountDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_PeoplesJOININGAmountDetails')
    member=models.OneToOneField(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='PeoplesJOININGAmountDetails_connected_to_member')
    amount=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    paid=models.BooleanField(default=True,null=True,blank=True)
    
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class CashTransactionDetails(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_CashTransactionDetails')
    amount=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True)
    trans_type=models.CharField(max_length=255,null=True,choices=TRANSACTION_CHOICES)
    banks=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,related_name='CashTransactionDetails_connected_to_BankDetails')
    banks_name=models.CharField(max_length=255,null=True,blank=True)
    banks2=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,related_name='CashTransactionDetails_connected_to_BankDetails2')
    banks2_name=models.CharField(max_length=255,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='CashtransactionDetails_connected_to_member')
    name=models.CharField(max_length=255,null=True,blank=True)
    mobile_number=models.CharField(max_length=255,null=True,validators=[phone_regex])
    address=models.TextField(null=True)
    member_type=models.CharField(choices=MEMBER_TYPE_CHOICES,max_length=255,null=True,blank=True)
    paid_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True)
    paid= models.BooleanField(default=False)
    cash_trans =models.CharField(max_length=255, null=True,blank=True)
    cash_paid_amt = models.DecimalField(max_digits=65,decimal_places=2,default=0)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)