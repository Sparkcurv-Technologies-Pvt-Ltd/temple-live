from django.db import models
from management.models import ManagementDetails
from family.models import Member_Details
from django.core.validators import RegexValidator

NATIVE_CHOICES = (
    ('Member','Member'),
    ('Other','Other')
)

FUND_CHOICES=(
    ('Normal','Normal'),
    ('Fund 20','Fund 20'),
    ('Fund 21','Fund 21')
)

class ADDFundDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_ADDFundDetails')
    fund_name = models.CharField(max_length=255,null=True)
    fund_no = models.CharField(max_length=255,null=True,blank=True)
    start_date=models.DateField(null=True)
    end_date=models.DateField(null=True)
    fund_count=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    month_count=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    fund_type=models.CharField(max_length=255,choices=FUND_CHOICES,null=True,blank=True)
    date=models.DateField(null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    

class FundGroupDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_FundGroupDetails')
    fund=models.OneToOneField(ADDFundDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='fund_link_FundGroupDetails')
    fund_name = models.CharField(max_length=255,null=True)
    from_date=models.DateField(null=True)
    to_date=models.DateField(null=True)
    # lease_completed_colour_change=models.BooleanField(default=False,null=True,blank=True)

    
    head_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Member_Details_head_link_FundGroupDetails')
    head_name=models.CharField(max_length=255,null=True,blank=True)
    head_member_no=models.CharField(max_length=255,null=True,blank=True)
    secretrary_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Member_Details_secretrey_link_FundGroupDetails')
    secretrary_name=models.CharField(max_length=255,null=True,blank=True)
    secretrary_member_no=models.CharField(max_length=255,null=True,blank=True)
    treasury_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Member_Details_treasury_link_FundGroupDetails')
    treasury_name=models.CharField(max_length=255,null=True,blank=True)
    treasury_member_no=models.CharField(max_length=255,null=True,blank=True)    
    fixed_fund_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    # fund_collecting_date=models.PositiveIntegerField(null=True,blank=True)
    month_count=models.PositiveIntegerField(null=True,blank=True,default=0)
    fixed_fund_count=models.PositiveIntegerField(null=True,blank=True,default=0)
    
    total_fund_count=models.PositiveIntegerField(null=True,blank=True,default=0)
    
    # optional
    cash_available_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    cash_lease_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    total_collected_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)
    leased_members_count=models.PositiveIntegerField(null=True,blank=True,default=0)

    per_head_collection_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)  
    
    members_count=models.PositiveIntegerField(null=True,blank=True,default=0)
    # date=models.DateField(null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    


    



class FundMemberDetailss(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_FundMemberDetailss')
    
    fund_group=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='fund_group')
    person_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True,blank=True)
    fund_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Member_Details_fund_member_link_FundMemberDetailss')
    member_fund_count=models.PositiveIntegerField(null=True,default=0)
    member_no=models.CharField(max_length=255,null=True,blank=True)
    member_name=models.CharField(max_length=255,null=True)
    mobile_no=models.CharField(validators=[phone_regex],max_length=255,null=True)
    email=models.EmailField(null=True,blank=True)
    address=models.TextField(null=True)
    lease_completed_colour_change=models.BooleanField(default=False,null=True,blank=True)
    nominee_apply=models.BooleanField(null=True)
    nominee_person_type=models.CharField(max_length=255,choices=NATIVE_CHOICES,null=True,blank=True)
    nominee_member=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Member_Details_nominee_member_link_FundMemberDetailss')
    nominee_member_no=models.CharField(max_length=255,null=True,blank=True)
    nominee_member_name=models.CharField(max_length=255,null=True)
    nominee_mobile_no=models.CharField(validators=[phone_regex],max_length=255,null=True)
    nominee_address=models.TextField(null=True)
    cheque_no=models.CharField(max_length=255,null=True,blank=True)
    lease=models.BooleanField(null=True,default=False,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

# class FundLeaseDetailss(models.Model):
#     management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_Fundlease')
#     fund_group=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='fund_group_in_fundlease')
#     fund_mem=models.ForeignKey(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='FundMemberDetailss_in_fundlease')
#     remaining_fund_count=models.PositiveIntegerField(null=True,blank=True,default=0)
#     finished=models.BooleanField(default=False,null=True,blank=True)
#     fund_name = models.CharField(max_length=255,null=True)
#     lease_date=models.DateField(null=True)
#     fund_lease_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
#     commission_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
#     final_lease_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
#     divided_member_count=models.PositiveIntegerField(null=True,default=0)
#     members_count=models.PositiveIntegerField(null=True,default=0)
#     fund_count=models.PositiveIntegerField(null=True,default=0)
#     from_date=models.DateField(null=True)
#     to_date=models.DateField(null=True)    
#     # tenat_person=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='Member_Details_fund_member_link_Fundleasee')
#     person_name=models.CharField(max_length=255,null=True)
#     per_head_collection_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
#     action=models.BooleanField(default=True,null=True,blank=True)
#     created_by=models.CharField(max_length=255,null=True,blank=True)
#     created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
#     updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class FundLeaseDetailss(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_Fundlease')
    fund_group=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='fund_group_in_fundlease')
    # fund_mem=models.ForeignKey(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='FundMemberDetailss_in_fundlease')
    # remaining_fund_count=models.PositiveIntegerField(null=True,blank=True,default=0)
    finished=models.BooleanField(default=False,null=True,blank=True)
    fund_name = models.CharField(max_length=255,null=True)
    lease_date=models.DateField(null=True)
    fund_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00,blank=True)
    fund_lease_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
    commission_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
    multiplied_commission_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
    final_lease_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00)
    members_count=models.PositiveIntegerField(null=True,default=0)
    leased_members_count=models.PositiveIntegerField(null=True,default=0)
    fund_count=models.PositiveIntegerField(null=True,default=0,blank=True)
    from_date=models.DateField(null=True,blank=True)
    to_date=models.DateField(null=True,blank=True)
  
    # person_name=models.CharField(max_length=255,null=True)
    per_head_collection_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00,blank=True)
    divided_by=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00,blank=True)
    lease_settle_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class FundLeaseMemberDetailss(models.Model):
    flease=models.ForeignKey(FundLeaseDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='flease')
    fund_mem=models.ForeignKey(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='FundMemberDetailss_in_FundLeaseMemberDetailss')
    person_name=models.CharField(max_length=255,null=True)
    lease_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00,blank=True)
    lease_settlement_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,default=0.00,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)