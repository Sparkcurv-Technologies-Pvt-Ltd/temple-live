from django.db import models
from family.models import Fammily_Details,Member_Details
from management.models import ManagementDetails
from django.core.validators import RegexValidator

NATIVE_CHOICES = (
    ('Member','Member'),
    ('Other','Other')
)

class MarriageDetails(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='management_link_to_marriage')
    
    new_family=models.ForeignKey(Fammily_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='new_family')
    
    marriage_no = models.CharField(max_length=255,null=True,blank=True)
    # groom
    groom_family=models.ForeignKey(Fammily_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='groom_family')
    groom_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='groom_member')
    groom_native_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True)
    groom_name=models.CharField(max_length=255,null=True)
    groom_family_no=models.CharField(max_length=255,null=True,blank=True)
    groom_address=models.TextField(null=True,blank=True)
    groom_dob=models.DateField(null=True,blank=True)
    groom_mobile_number=models.CharField(max_length=255,null=True,validators=[phone_regex])
    groom_marriage_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    # groom_pending_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    
    # bride
    bride_family=models.ForeignKey(Fammily_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='bride_family')
    bride_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='bride_member')
    bride_native_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True,blank=True)
    bride_name=models.CharField(max_length=255,null=True)
    bride_family_no=models.CharField(max_length=255,null=True,blank=True)
    bride_address=models.TextField(null=True,blank=True)
    bride_dob=models.DateField(null=True,blank=True)
    bride_mobile_number=models.CharField(max_length=255,null=True,validators=[phone_regex])
    bride_marriage_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    # bride_pending_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    
    marriage_date=models.DateField(null=True)
    marriage_place=models.TextField(null=True)
    comments=models.TextField(null=True,blank=True)
    date=models.DateField(null=True)
    invitation=models.FileField(null=True,blank=True)
    marriage_certificate=models.FileField(null=True,blank=True)
    marriage_photo=models.ImageField(null=True,blank=True)
    
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
