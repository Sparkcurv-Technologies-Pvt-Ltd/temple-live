from django.db import models
from django.db import models
from django.utils import timezone

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

# Add this to the SAME app's models.py (below ManagementDetails),
# then run:  python manage.py makemigrations && python manage.py migrate




class OpeningBalanceAdjustment(models.Model):
    management_profile = models.ForeignKey(
        'ManagementDetails',
        on_delete=models.CASCADE,
        related_name='opening_balance_adjustments',
    )
    old_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    old_type = models.CharField(max_length=10, null=True, blank=True)
    new_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    new_type = models.CharField(max_length=10, null=True, blank=True)
    reason = models.TextField()
    changed_by = models.IntegerField(null=True, blank=True)
    changed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.old_amount} {self.old_type} -> {self.new_amount} {self.new_type}"