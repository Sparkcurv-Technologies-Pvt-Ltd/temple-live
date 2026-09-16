from django.db import models
from family.models import Fammily_Details,Member_Details
from management.models import ManagementDetails
from chit_fund.models import ChitFundsDetails
from django.core.validators import RegexValidator

CATEGORY_CHOICES = (
    ('Interest','Interest'),
    ('Interest with capital','Interest with capital'),
    ('Installment Interest','Installment Interest')
    
)

INTEREST_TYPE_CHOICES = (
    ('Management Interest','Management Interest'),
    ('Chit fund Interest','Chit fund Interest')
)

NATIVE_CHOICES = (
    ('Member','Member'),
    ('Other','Other')
)

PERIOD_CHOICES = (
    ('Week','Week'),
    ('Month','Month'),
    ('Days','Days')
)

PENALTY_CHOICES = (
    ('percentage','percentage'),
    ('amount','amount'),

)

class PeopleInterestDetails(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='PeopleInterestDetails_link_on_management')
    intrest_no=models.CharField(max_length=255,null=True,blank=True)
    interest_category=models.CharField(max_length=255,choices=CATEGORY_CHOICES,null=True)
    interest_type=models.CharField(max_length=255,choices=INTEREST_TYPE_CHOICES,null=True)
    chitt_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='chitt_fund_link_in_PeopleInterestDetails')
    chit_name=models.CharField(max_length=255,null=True)
    photo=models.ImageField(null=True,blank=True)
    people_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True)
    people_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='mem_liiknj_PeopleInterestDetails')
    people_name=models.CharField(max_length=255,null=True)
    people_address=models.TextField(null=True)
    people_email=models.EmailField(null=True,blank=True)
    people_mobile=models.CharField(validators=[phone_regex],max_length=255,null=True)
    
    principal_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0)
    fix_interest_rate_percent=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    interest_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    interest_period=models.PositiveIntegerField(null=True,default=0)
    interest_period_type=models.CharField(max_length=255,choices=PERIOD_CHOICES,null=True)
    

    interest_type_new= models.CharField(max_length=255,choices=PENALTY_CHOICES,null=True,blank=True)
    interest_new_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)

    apply_first_interest=models.BooleanField(default=False,null=True,blank=True)
    first_interest_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    final_amt_given=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    
    penalty_percentage=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    penalty_type=models.CharField(max_length=255,choices=PENALTY_CHOICES,null=True,blank=True)
    penalty_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    # Owner-controlled toggle (Feb 2026). When False, the periodic
    # accrual job skips penalty rows entirely for this loan — interest
    # still accrues normally.
    penalty_enabled=models.BooleanField(default=True,null=True,blank=True)
    
    nominee_apply=models.BooleanField(null=True)
    nominee_person_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True,blank=True)
    nominee_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Member_Details_nominee_member_link_PeopleInterestDetails')
    nominee_member_name=models.CharField(max_length=255,null=True)
    nominee_mobile_no=models.CharField(max_length=255,null=True)
    nominee_address=models.TextField(null=True)
    cheque_no=models.CharField(max_length=255,null=True,blank=True)
    installment_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    action=models.BooleanField(default=True,null=True,blank=True)
    total_counts=models.CharField(max_length=255,null=True,blank=True)
    paid_counts=models.IntegerField(default=0)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    interest_date = models.DateField(null=True,blank=True)
    # Feb 2026 owner rule — rolling pointer to the NEXT installment due
    # date. Initialised at loan-creation to (interest_date + one cadence
    # step). Advances by (interest_period × interest_period_type) on
    # every installment payment and reverses on collection edit/delete.
    # Used by the overdue-penalty walker so late-payment counters stay
    # accurate no matter how many edits happen on the collection ledger.
    installment_date = models.DateField(null=True, blank=True)
    

    