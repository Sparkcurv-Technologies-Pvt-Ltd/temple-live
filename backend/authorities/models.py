from django.db import models
from family.models import Fammily_Details,Member_Details
from management.models import ManagementDetails

STATUS_CHOICES=(
    ('Active', 'Active'),
    ('Resign', 'Resign'),
)

class ADD_EXFields(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ADD_EXFields_link_on_management')
    name=models.CharField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class AddPosition(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='AddPosition_link_on_management')
    position_name=models.CharField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class AddAuthorityDetails(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='AddAuthorityDetails_link_on_management')
    desgnation=models.ForeignKey(AddPosition,on_delete=models.CASCADE,null=True,blank=True,related_name='desgnation_link')
    member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='AuthorityDetails_member')
    member_name=models.CharField(max_length=255,null=True)
    member_no=models.CharField(max_length=255,null=True)
    position_name=models.CharField(max_length=255,null=True)
    from_date=models.DateField(null=True)
    to_date=models.DateField(null=True)
    comments=models.TextField(null=True,blank=True)
    status=models.CharField(max_length=255, choices=STATUS_CHOICES,null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class AutharityFields(models.Model):
    atharity=models.ForeignKey(AddAuthorityDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='atharity')
    name=models.CharField(max_length=255,null=True)
    valuess=models.TextField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    