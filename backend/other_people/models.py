from django.db import models
from management.models import ManagementDetails
from django.core.validators import RegexValidator

GENDER_CHOICES = (
    ('Male','Male'),
    ('Female','Female'),
)

ADDING_CHOICES = (
    ('User','User'),
    ('Interest','Interest'),
)

class OtherPeopleDetails(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_LINK_in_otherpeople')
    name=models.CharField(max_length=255,null=True,blank=True)
    mobile_number=models.CharField(max_length=255,null=True,validators=[phone_regex],blank=True)
    email=models.EmailField(null=True,blank=True)
    address=models.TextField(null=True,blank=True)
    gender=models.CharField(max_length=255,choices=GENDER_CHOICES,null=True,blank=True)
    added_for=models.CharField(max_length=255,choices=ADDING_CHOICES,null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)