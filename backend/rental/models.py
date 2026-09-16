from django.db import models
from management.models import ManagementDetails,BankDetails
from family.models import Member_Details
from assets.models import AssetCategory,AssetDetails,MoveableAssetCategory,MoveableAssetDetails
from django.core.validators import RegexValidator

NATIVE_CHOICES = (
    ('Member','Member'),
    ('Other','Other')
)

RENT_PAY_CHOICES = (
    ('Month','Month'),
    ('Year','Year'),
    ('Choose Date','Choose Date')
)

PERIOD_CHOICES = (
    ('Month','Month'),
    ('Year','Year')
)

INCREMENT_AMT_CHOICES = (
    ('Amount','Amount'),
    ('Percentage','Percentage')
)

BANK_TYPE_CHOICES = (
    ('UPI','UPI'),
    ('Net Banking','Net Banking'),
    ('NEFT','NEFT'),
)

MODE_CHOICES = (
    ('Online','Online'),
    ('Offline','Offline')
)

TRANSACTION_TYPE_CHOICES = (
    ('Cash','Cash'),
    ('Bank','Bank'),
    ('Cheque','Cheque')
)

class RentalAndLeaseDetails(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    
    lease_rent_no=models.CharField(max_length=255,null=True,blank=True)
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_RentalLeaseDetails')
    rent=models.BooleanField(null=True,blank=True)
    # lease=models.BooleanField(null=True,blank=True)
    date=models.DateField(null=True)
    category=models.ForeignKey(AssetCategory,on_delete=models.CASCADE,null=True,blank=True,related_name='RentalAndLeaseDetails_to_asset_category_link')
    asset_category_name=models.CharField(max_length=255,null=True)
    asset=models.ForeignKey(AssetDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='asset_link_in_RentalAndLeaseDetails')
    asset_name=models.CharField(max_length=255,null=True)
    
    tenat_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True)
    tenat_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='RentalAndLeaseDetails_link_to_member')
    tenat_name = models.CharField(max_length=255,null=True)
    tenat_address=models.TextField(null=True)
    tenat_email=models.EmailField(null=True,blank=True)
    tenat_mobile=models.CharField(validators=[phone_regex],max_length=255,null=True)
    
    start_date=models.DateField(null=True)
    end_date=models.DateField(null=True)
    documents=models.FileField(null=True,blank=True)
    images=models.ImageField(null=True,blank=True)
    end_range=models.CharField(max_length=255,null=True)
    
    # advance amt
    initial_advance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    advance_settlement_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    advance_return=models.BooleanField(default=False,null=True,blank=True)
    advance_return_date=models.DateField(null=True,blank=True)
    retun_person_by=models.CharField(max_length=255,null=True,blank=True)
    
    rent_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    rent_pay_type=models.CharField(max_length=255,choices=RENT_PAY_CHOICES,null=True)
    from_date=models.DateField(null=True,blank=True)
    # to_date=models.DateField(null=True,blank=True)
    
    increment_apply=models.BooleanField(null=True,blank=True)
    increase_time_period=models.PositiveIntegerField(null=True,blank=True,default=0)
    increase_time_period_choice=models.CharField(max_length=255,choices=PERIOD_CHOICES,null=True,blank=True)
    increment_amt_prcnt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    increase_amt_choice=models.CharField(max_length=255,choices=INCREMENT_AMT_CHOICES,null=True,blank=True)
    penalty_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)

    action=models.BooleanField(default=True,null=True,blank=True)
    shutdown_by=models.CharField(max_length=255,null=True,blank=True)
    shutdown_date=models.DateField(null=True,blank=True)

    # previous_start_date=models.DateField(null=True,blank=True)
    previous_end_date=models.DateField(null=True,blank=True)
    previous_rent_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    
    # new
    payment_mode=models.CharField(max_length=255,choices=MODE_CHOICES,null=True,blank=True)
    transaction_type=models.CharField(max_length=255,choices=TRANSACTION_TYPE_CHOICES,null=True,blank=True)
    bank_link=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='BankDetails_link_on_rentallease')
    bank_name=models.CharField(max_length=255,null=True,blank=True)
    transaction_date=models.DateField(null=True,blank=True)
    trans_no=models.CharField(max_length=255,null=True,blank=True)
    # upi_no=models.CharField(max_length=255,null=True,blank=True)
    cheque_no=models.CharField(max_length=255,null=True,blank=True)
    bank_pay=models.CharField(max_length=255,choices=BANK_TYPE_CHOICES,null=True,blank=True)

    # settlement
    settlement_payment_mode=models.CharField(max_length=255,choices=MODE_CHOICES,null=True,blank=True)
    settlement_transaction_type=models.CharField(max_length=255,choices=TRANSACTION_TYPE_CHOICES,null=True,blank=True)
    settlement_bank_link=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='BankDetails_linksum_on_rentallease')
    settlement_bank_name=models.CharField(max_length=255,null=True,blank=True)
    settlement_transaction_date=models.DateField(null=True,blank=True)
    settlement_trans_no=models.CharField(max_length=255,null=True,blank=True)
    # upi_no=models.CharField(max_length=255,null=True,blank=True)
    settlement_cheque_no=models.CharField(max_length=255,null=True,blank=True)
    settlement_bank_pay=models.CharField(max_length=255,choices=BANK_TYPE_CHOICES,null=True,blank=True)
    bill_by_name=models.CharField(max_length=255,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class MovableAssetsRents(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    rent_no=models.CharField(max_length=255,null=True,blank=True)
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_MovableAssetsRents')
    date=models.DateField(null=True)
    tenat_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True)
    tenat_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='MovableAssetsRents_link_to_member')
    tenat_name = models.CharField(max_length=255,null=True)
    tenat_address=models.TextField(null=True)
    tenat_mobile=models.CharField(validators=[phone_regex],max_length=255,null=True)
    start_date=models.DateField(null=True)
    end_date=models.DateField(null=True,blank=True)
    total_rent_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    penalty_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    advance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    settled_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    comments=models.TextField(null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    collected_by=models.CharField(max_length=255,null=True,blank=True)
    calculating_days=models.IntegerField(null=True,blank=True,default=0)
    
    # new
    payment_mode=models.CharField(max_length=255,choices=MODE_CHOICES,null=True,blank=True)
    transaction_type=models.CharField(max_length=255,choices=TRANSACTION_TYPE_CHOICES,null=True,blank=True)
    bank_link=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='BankDetails_link_on_movablerent')
    bank_name=models.CharField(max_length=255,null=True,blank=True)
    transaction_date=models.DateField(null=True,blank=True)
    trans_no=models.CharField(max_length=255,null=True,blank=True)
    # upi_no=models.CharField(max_length=255,null=True,blank=True)
    cheque_no=models.CharField(max_length=255,null=True,blank=True)
    bank_pay=models.CharField(max_length=255,choices=BANK_TYPE_CHOICES,null=True,blank=True)
    
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class MovableAssetsRentTable(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_MovableAssetsRentTable')
    movable_rent=models.ForeignKey(MovableAssetsRents,on_delete=models.CASCADE,null=True,blank=True,related_name='movable_rent')
    
    category=models.ForeignKey(MoveableAssetCategory,on_delete=models.CASCADE,null=True,blank=True,related_name='MovableAssetsRentTable_to_movableasset_category_link')
    asset_category_name=models.CharField(max_length=255,null=True)
    asset=models.ForeignKey(MoveableAssetDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='movableasset_link_in_MovableAssetsRentTable')
    asset_name=models.CharField(max_length=255,null=True)
    qnty=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    sale_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    total_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)