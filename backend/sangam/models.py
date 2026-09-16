from django.db import models
from family.models import Fammily_Details,Member_Details
from management.models import ManagementDetails

class AddSangamName(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='AddSangamName_link')
    sangam_name=models.CharField(max_length=255,null=True,unique=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class AddSangamDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='AddSangamDetails_link')
    sangam_no=models.CharField(max_length=255,null=True,blank=True)
    sangam_name=models.ForeignKey(AddSangamName,on_delete=models.CASCADE,null=True,blank=True,related_name='sangam_name_khjjgg')
    name=models.CharField(max_length=255,null=True)
    head_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='sangam_heaad_member')
    head_name=models.CharField(max_length=255,null=True)
    head_mem_no=models.CharField(max_length=255,null=True)
    secretry_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='sangam_secretry_member')
    secretry_name=models.CharField(max_length=255,null=True)
    secretry_mem_no=models.CharField(max_length=255,null=True)
    treasurey_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='sangam_treasurey_member')
    treasurey_name=models.CharField(max_length=255,null=True)
    treasurey_mem_no=models.CharField(max_length=255,null=True)
    starting_date=models.DateField(null=True)
    closing_date=models.DateField(null=True,blank=True)
    sangam_active=models.BooleanField(default=True,null=True,blank=True)
    opening_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class SangamMembers(models.Model):
    sangama=models.ForeignKey(AddSangamDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='sangama')
    member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='sangam_member')
    member_name=models.CharField(max_length=255,null=True)
    member_no=models.CharField(max_length=255,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)