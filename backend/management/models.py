from django.db import models

OPENING_CHOICES = (
    ('Credit','Credit'),
    ('Debit','Debit'),
)

class ManagementDetails(models.Model):
    temple_name = models.CharField(max_length=255,null=True)
    address=models.TextField(null=True,blank=True)
    comments=models.TextField(null=True,blank=True)
    opening_balance=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    opening_balance_type=models.CharField(max_length=255,choices=OPENING_CHOICES,null=True,blank=True)
    tax_age=models.PositiveIntegerField(null=True,default=0)
    reg_no=models.CharField(max_length=255,null=True,blank=True)
    
    documents=models.FileField(null=True,blank=True)
    images=models.ImageField(null=True,blank=True)
    
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class BankDetails(models.Model):
    management=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='management')
    bank_name = models.CharField(max_length=255,null=True,blank=True)
    account_no = models.CharField(max_length=255,null=True,blank=True)
    ifsc = models.CharField(max_length=255,null=True,blank=True)
    account_holder_name = models.CharField(max_length=255,null=True,blank=True)
    branch_name = models.CharField(max_length=255,null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    
    bank_opening_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    bank_opening_balance_type=models.CharField(max_length=255,choices=OPENING_CHOICES,null=True,blank=True) 
    
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    loan_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    loan_repay_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class Instructions(models.Model):
    management=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='management_instructions')
    instruction=models.TextField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)