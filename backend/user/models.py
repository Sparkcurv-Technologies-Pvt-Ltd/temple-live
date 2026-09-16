from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.conf import settings
from family.models import Member_Details
from permisions.models import My_Roles
from management.models import ManagementDetails
from chit_fund.models import ChitFundInvesters,ChitFundsDetails
ROLE_CHOICES=(
    ('Admin', 'Admin'),
    ('User', 'User'),
    ('Invester', 'Invester'),
)

NATIVE_CHOICES=(
    ('Member', 'Member'),
    ('Other', 'Other'),
)

GENDER_CHOICES = (
    ('Male','Male'),
    ('Female','Female'),
)

STATUS_CHOICES=(
    ('Disabled', 'Disabled'),
    ('Enabled', 'Enabled'),
)

class User(AbstractUser):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_user')
    
    member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='member_link_user')
    member_no=models.CharField(max_length=200,blank=True,null=True)
    my_role=models.ForeignKey(My_Roles,on_delete=models.CASCADE,null=True,blank=True,related_name='role_link_user')
    name=models.CharField(max_length=255)
    email=models.EmailField(unique=True)
    password=models.CharField(max_length=255)
    username=models.CharField(max_length=200,blank=True,null=True)
    user_role=models.CharField(max_length=255, choices=ROLE_CHOICES,null=True,blank=True)
    user_native_type=models.CharField(max_length=255, choices=NATIVE_CHOICES,null=True,blank=True)
    role_name=models.CharField(max_length=255,blank=True,null=True)
    password_new=models.CharField(max_length=255,blank=True,null=True)
    mobile_number=models.CharField(validators=[phone_regex],max_length=17,null=True,unique=True,blank=True)
    address=models.TextField(null=True,blank=True)
    status=models.CharField(max_length=200,null=True,choices=STATUS_CHOICES,default='Enabled',blank=True)
    

#############
    chit_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name="chit_fund_detaills")
    chit_fund_name=models.CharField(max_length=255,null=True,blank=True)
   
    chit_fund_investor=models.ForeignKey(ChitFundInvesters,on_delete=models.CASCADE,null=True,blank=True,related_name="chit_fund_investor_user")
    chit_fund_investor_name=models.CharField(max_length=255,null=True,blank=True)
    is_investor = models.BooleanField(default=False,blank=True)
    person_email=models.EmailField(null=True,blank=True)
    othersname=models.CharField(max_length=255,blank=True,null=True)
    
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    gender=models.CharField(max_length=255,choices=GENDER_CHOICES,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)