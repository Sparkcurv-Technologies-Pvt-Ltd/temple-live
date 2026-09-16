from django.db import models
from family.models import Fammily_Details, Member_Details
from management.models import ManagementDetails, BankDetails
from fund.models import ADDFundDetails, FundGroupDetails, FundMemberDetailss, FundLeaseDetailss
from festival.models import ADDFestivalDetails
from rental.models import RentalAndLeaseDetails, MovableAssetsRents
from sub_tariff.models import ADDSubscriptionTariffDetails
from chit_fund.models import ChitFundsDetails
from interest.models import PeopleInterestDetails
from amount.models import PeoplesAmountDetails
from death.models import DeathDetails
from marriage.models import MarriageDetails
from balancesheet.models import PeopleInterestBalanceSheet, FundMembersBalanceSheet, RentalBalanceSheet, MoveableRentBalanceSheet
from django.core.validators import RegexValidator

NATIVE_CHOICES = (
    ('Member','Member'),
    ('Other','Other')
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

COLLECTION_CATEGORY_CHOICES = (
    ('Fund','Fund'),
    ('Festival','Festival'),
    ('Rent','Rent'),
    ('Lease','Lease'),
    ('Subscription Tariff','Subscription Tariff'),
    ('Chit-fund','Chit-fund'),
    ('Balance','Balance'),
    ('Penalty','Penalty'),
    ('Tax','Tax'),
    ('Death Tariff','Death Tariff'),
    ('Marriage','Marriage'),
    ('Management Interest','Management Interest'),
    ('Chit Interest','Chit Interest'),
    ('Moveable Rent','Moveable Rent'),

)



INTEREST_TYPE_CHOICES = (
    ('Principle','Principle'),
    ('Interest','Interest'),

    
)
BANK_TYPE_CHOICES = (
    ('UPI','UPI'),
    ('Net Banking','Net Banking'),
    ('NEFT','NEFT'),


    
)

MOVEABLE_ASSET_PAYMENT_CHOICE=(
    ('Paid','Paid'),
    ('Received','Received'),

)
class CollectionDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_management')
    collaction_no=models.CharField(max_length=255,null=True,blank=True)
    collection_category=models.CharField(max_length=255,choices=COLLECTION_CATEGORY_CHOICES,null=True)
    marriage=models.ForeignKey(MarriageDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Collection_Details_connected_to_MarriageDetails')
    # fund_m=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_FundgroupDetails')
    funds=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_FundGroupDetails')
    fund_lease=models.ForeignKey(FundLeaseDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_FundLeaseDetailss')
    festivals=models.ForeignKey(ADDFestivalDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_ADDFestivalDetails')
    rentsandlease=models.ForeignKey(RentalAndLeaseDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_RentalAndLeaseDetails')
    sub_tariff=models.ForeignKey(ADDSubscriptionTariffDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_ADDSubscriptionTariffDetails')
    interest=models.ForeignKey(PeopleInterestDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_PeopleInterestDetails')
    interest_balance=models.ForeignKey(PeopleInterestBalanceSheet,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_PeopleInterestbalancesheetDetails')
    interest_principle=models.BooleanField(default=False)
    interest_field=models.BooleanField(default=False)
    moveablerent=models.ForeignKey(MovableAssetsRents,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_moveablerentDetails')
    fund_name=models.CharField(max_length=255,null=True,blank=True)
    # interest_type=models.CharField(max_length=255,choices=INTEREST_TYPE_CHOICES,null=True,blank=True)
    death_tariff=models.ForeignKey(DeathDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_DeathDetails')
    
    amount_link=models.ForeignKey(PeoplesAmountDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_PeoplesAmountDetails')
    
    fund_member=models.ForeignKey(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='CollactionDetails_link_on_FundMemberDetailss')
    
    present=models.BooleanField(null=True,blank=True)
    # absent=models.BooleanField(default=False,null=True,blank=True)
    fund_type=models.CharField(max_length=255,null=True,blank=True)
    
    absent_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True)
    exception_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True)
    person_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True)
    member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='mem_linj_CollectionDetails')
    member_name=models.CharField(max_length=255,null=True,blank=True)
    amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    interst_amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    penalty_amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)

    payment_mode=models.CharField(max_length=255,choices=MODE_CHOICES,null=True)
    pay_date=models.DateField(null=True)
    comments=models.TextField(null=True)
    death_name=models.CharField(max_length=255,null=True,blank=True)
    festival_name=models.CharField(max_length=255,null=True,blank=True)
    marriage_name=models.CharField(max_length=255,null=True,blank=True)
    balance_name=models.CharField(max_length=255,null=True,blank=True)
    moveable_rent_name=models.CharField(max_length=255,null=True,blank=True)
    rent_name=models.CharField(max_length=255,null=True,blank=True)
    lease_name=models.CharField(max_length=255,null=True,blank=True)
    chit_name=models.CharField(max_length=255,null=True,blank=True)
    chitt_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null= True,blank=True,related_name="collection_chit_fund_Details")
    bill_by_name=models.CharField(max_length=255,null=True,blank=True)
    sub_tariff_no=models.CharField(max_length=255,null=True,blank=True)
    transaction_type=models.CharField(max_length=255,choices=TRANSACTION_TYPE_CHOICES,default='Cash',null=True)
    
    # cash=models.BooleanField(default=False,null=True,blank=True)
    # cheque=models.BooleanField(default=False,null=True,blank=True)
    # upi=models.BooleanField(default=False,null=True,blank=True)
    # bank=models.BooleanField(default=False,null=True,blank=True)
    ref_moverent_bal=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True)
    bank_link=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='BankDetails_link_on_CollectionDetails')
    bank_name=models.CharField(max_length=255,null=True,blank=True)
    transaction_date=models.DateField(null=True,blank=True)
    trans_no=models.CharField(max_length=255,null=True,blank=True)
    upi_no=models.CharField(max_length=255,null=True,blank=True)
    cheque_no=models.CharField(max_length=255,null=True,blank=True)
    bank_pay=models.CharField(max_length=255,choices=BANK_TYPE_CHOICES,null = True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    moveable_asset_payment=models.CharField(choices=MOVEABLE_ASSET_PAYMENT_CHOICE,max_length=255,default="Received")
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    mobile_number=models.CharField(max_length=255,null=True,validators=[phone_regex])
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    balance_split_json = models.TextField(null=True, blank=True)

    discount_amount=models.DecimalField(max_digits=65,decimal_places=2,default=0)

    no_count_install=models.PositiveBigIntegerField(default=0)
    


    
