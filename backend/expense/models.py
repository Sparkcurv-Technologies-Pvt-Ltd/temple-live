from django.db import models
from management.models import ManagementDetails,BankDetails
from family.models import Member_Details
from festival.models import ADDFestivalDetails

EXPENSE_FROM_TYPE_CHOICES = (
    ('Festival','Festival'),
    ('Others','Others'),

)

EXPENSE_SUBCATEGORY_CHOICES = (
    ('Chit Fund Expense', 'Chit Fund Expense'),
    ('Temple Expense', 'Temple Expense'),
)

PAYMENT_MODE_TYPE_CHOICES = (
    ('Online','Online'),
    ('Offline','Offline'),
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
class ADDExpenseCategory(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_EXPENSE_category_LINK')
    category_name = models.CharField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class ADDExpenseNames(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_ADDExpenseNames_LINK')
    expense_name = models.CharField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class ADDExpenseDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_EXPENSE_LINK')
    expense_subcategory=models.CharField(max_length=255,choices=EXPENSE_SUBCATEGORY_CHOICES,null=True,blank=True)
    # Chit-Fund link (Feb 2026): populated ONLY when
    # ``expense_subcategory == "Chit Fund Expense"``. Adding / editing /
    # deleting an expense that carries this FK atomically debits or
    # credits the linked chit fund's ``profit_amount`` and
    # ``cash_inhand_amount`` — kept in sync by ``expense/views.py``.
    chitt_fund=models.ForeignKey(
        'chit_fund.ChitFundsDetails', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='expenses',
    )
    chit_fund_name=models.CharField(max_length=255, null=True, blank=True)
    category=models.ForeignKey(ADDExpenseCategory,on_delete=models.CASCADE,null=True,blank=True,related_name='ADDExpenseCategory_EXPENSE_LINK')
    category_name = models.CharField(max_length=255,null=True)
    expense_from=models.CharField(max_length=255,choices=EXPENSE_FROM_TYPE_CHOICES,null=True,blank=True)
    festival=models.ForeignKey(ADDFestivalDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ADDFestivalDetails_EXPENSE_LINK')
    expense=models.ForeignKey(ADDExpenseNames,on_delete=models.CASCADE,null=True,blank=True,related_name='ADDExpenseNames_EXPENSE_LINK')
    others_name = models.CharField(max_length=255,null=True,blank=True)
    festival_name = models.CharField(max_length=255,null=True,blank=True)

    expense_name = models.CharField(max_length=255,null=True)
    expense_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    payment_mode=models.CharField(max_length=255,choices=PAYMENT_MODE_TYPE_CHOICES,null=True)
    transaction_type=models.CharField(max_length=255,choices=TRANSACTION_TYPE_CHOICES,null=True)
    bank=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Bank_link_with_expp')
    bank_name = models.CharField(max_length=255,null=True,blank=True)
    transaction_no = models.CharField(max_length=255,null=True,blank=True)
    transaction_date=models.DateField(null=True,blank=True)
    cheque_no = models.CharField(max_length=255,null=True,blank=True)
    upi_id = models.CharField(max_length=255,null=True,blank=True)
    comments=models.TextField(null=True,blank=True)
    date=models.DateField(null=True)
    bank_pay=models.CharField(max_length=255,choices=BANK_TYPE_CHOICES,null=True,blank=True)

    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
