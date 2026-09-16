from django.db import models
from management.models import ManagementDetails,BankDetails
from family.models import Member_Details
from festival.models import ADDFestivalDetails
from sangam.models import AddSangamDetails

INCOME_TYPE_CHOICES = (
    ('Donation','Donation'),
    ('Offering','Offering'),
    ('Others','Others'),
    ('Sangam','Sangam')
)

OFFERING_TYPE_CHOICES = (
    ('Festival','Festival'),
    ('Offering Box','Offering Box'),
    ('Others','Others')
)

PAYMENT_MODE_TYPE_CHOICES = (
    ('Online','Online'),
    ('Offline','Offline'),
)

NATIVE_TYPE_CHOICES = (
    ('Native','Native'),
    ('Others','Others'),
)

TRANSACTION_TYPE_CHOICES = (
    ('Cash','Cash'),
    ('Bank','Bank'),

    ('Cheque','Cheque')
)

BANK_TYPE_CHOICES = (
    ('UPI','UPI'),
    ('Net Banking','Net Banking'),
    ('NEFT','NEFT'),
 
)

INCOME_SUBCATEGORY_CHOICES = (
    ('Chit Fund Income', 'Chit Fund Income'),
    ('Temple Income', 'Temple Income'),
)

class ADDIncomeCategory(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_income_category_LINK')
    category_name = models.CharField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class ADDIncomeNames(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_ADDincomeNames_LINK')
    income_name = models.CharField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)



class ADDIncomeDetails(models.Model):
    income_subcategory=models.CharField(max_length=255,choices=INCOME_SUBCATEGORY_CHOICES,null=True,blank=True)
    category=models.ForeignKey(ADDIncomeCategory,on_delete=models.CASCADE,null=True,blank=True,related_name='ADDincomeCategory_income_LINK')
    income=models.ForeignKey(ADDIncomeNames,on_delete=models.CASCADE,null=True,blank=True,related_name='ADDincomename_income_LINK')
    category_name = models.CharField(max_length=255,null=True)
    
    
    festival=models.ForeignKey(ADDFestivalDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='festival_link_in_INCOME')
    festival_name = models.CharField(max_length=255,null=True,blank=True)
    sangam=models.ForeignKey(AddSangamDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='sangam_link_with_INCOME')
    sangam_name = models.CharField(max_length=255,null=True,blank=True)
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_INCOME')
    income_type=models.CharField(max_length=255,choices=INCOME_TYPE_CHOICES,null=True)
    offering_type=models.CharField(max_length=255,choices=OFFERING_TYPE_CHOICES,null=True,blank=True)
    giver_native=models.CharField(max_length=255,choices=NATIVE_TYPE_CHOICES,null=True,blank=True)
    member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='income_link_member')
    member_name = models.CharField(max_length=255,null=True,blank=True)
    name = models.CharField(max_length=255,null=True,blank=True)
    address=models.TextField(null=True,blank=True)
    income_name = models.CharField(max_length=255,null=True)
    income_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    payment_mode=models.CharField(max_length=255,choices=PAYMENT_MODE_TYPE_CHOICES,null=True)
    transaction_type=models.CharField(max_length=255,choices=TRANSACTION_TYPE_CHOICES,null=True)
    bank=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Bank_link_with_INCOME')
    bank_name = models.CharField(max_length=255,null=True,blank=True)
    transaction_no = models.CharField(max_length=255,null=True,blank=True)
    transaction_date=models.DateField(null=True,blank=True)
    cheque_no = models.CharField(max_length=255,null=True,blank=True)
    upi_id = models.CharField(max_length=255,null=True,blank=True)
    comments=models.TextField(null=True,blank=True)
    date=models.DateField(null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    bank_pay=models.CharField(max_length=255,choices=BANK_TYPE_CHOICES,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
