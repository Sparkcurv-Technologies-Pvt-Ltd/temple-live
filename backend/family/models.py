from django.db import models
from management.models import ManagementDetails
from django.core.validators import RegexValidator
import datetime

MEMBER_TYPE_CHOICES = (
    ('NEW','NEW'),
    ('EXCISTING','EXCISTING')
)

NATIVE_TYPE_CHOICES = (
    ('NATIVE','NATIVE'),
    ('OTHERS','OTHERS')
)

RELATION_TYPE_CHOICES = (
    ('FATHER','FATHER'),
    ('DAUGHTER','DAUGHTER'),
    ('SON','SON'),
    ('WIFE','WIFE'),
)

GENDER_CHOICES = (
    ('Male','Male'),
    ('Female','Female'),
)

class Fammily_Details(models.Model):
    ancestor=models.CharField(max_length=255,null=True,blank=True)
    ancestor_detail=models.CharField(max_length=255,null=True,blank=True)
    women_ancestor=models.CharField(max_length=255,null=True,blank=True)
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile')
    family_no=models.CharField(max_length=255,null=True,blank=True)
    address=models.TextField(null=True,blank=True)
    head_member_type=models.CharField(max_length=255,choices=MEMBER_TYPE_CHOICES,null=True,blank=True)
    head_native_type=models.CharField(max_length=255,choices=NATIVE_TYPE_CHOICES,null=True,blank=True)
    years_of_living=models.IntegerField(null=True,blank=True,default=0)
    members_count=models.IntegerField(null=True,blank=True,default=0)
    action=models.BooleanField(default=True,null=True,blank=True)
    death_members_count=models.IntegerField(null=True,blank=True,default=0)
    married_remove_count=models.IntegerField(null=True,blank=True,default=0)
    # later adding fields
    festival_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    sub_tariff_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    penalty_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class Member_Details(models.Model):
    phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_iii_member')
    family=models.ForeignKey(Fammily_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='family')
    member_no=models.CharField(max_length=255,null=True,blank=True)
    member_name = models.CharField(max_length=255,null=True)
    # optional
    last_name = models.CharField(max_length=255,null=True,blank=True)
    
    member_mobile_number=models.CharField(max_length=255,null=True,validators=[phone_regex])
    member_dob=models.DateField(null=True,blank=True)
    member_age=models.IntegerField(null=True,blank=True,default=0)
    member_email=models.EmailField(null=True,blank=True)
    member_photo=models.ImageField(null=True,blank=True)

    member_relation_ship=models.CharField(max_length=255,choices=RELATION_TYPE_CHOICES,null=True,blank=True)
    member_gender=models.CharField(max_length=255,choices=GENDER_CHOICES,null=True,blank=True)

    member_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    balance_pending_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    balance_amt_paid=models.BooleanField(default=False,null=True,blank=True)
    balance_paid_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)

    member_joining_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    # is_member_balance_amt=models.BooleanField(default=False,null=True,blank=True)

    member_tax_eligible=models.BooleanField(default=False,null=True,blank=True)
    head=models.BooleanField(default=False,null=True,blank=True)
    
    leaving_date=models.DateField(null=True,blank=True)
    releving_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0)
    reason_for_leaving=models.TextField(null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    
    # later adding fields
    separate=models.BooleanField(default=False,null=True,blank=True)
    death=models.BooleanField(default=False,null=True,blank=True)
    marriage_remove=models.BooleanField(default=False,null=True,blank=True)
    
    adult=models.BooleanField(default=False,null=True,blank=True)
    
    death_date=models.DateField(null=True,blank=True)
    
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
    
    def save(self, *args, **kwargs):
        if self.member_dob:
            today = datetime.date.today()
            self.member_age = today.year - self.member_dob.year - ((today.month, today.day) < (self.member_dob.month, self.member_dob.day))
            # Auto-set tax eligibility: members older than 18 are eligible.
            self.member_tax_eligible = self.member_age >= 18
        super(Member_Details, self).save(*args, **kwargs)
    
    # def calculate_age(self):
    #     if not self.member_dob:
    #         return 0
    #     today = datetime.date.today()
    #     return today.year - self. member_dob.year - ((today.month, today.day) < (self.member_dob.month, self.member_dob.day))

    # def is_major(self):
    #     age = self.calculate_age()
    #     if age >= 18:
    #         return True
    #     if age < 18:
    #         return False
  
    
# class MarriedMember_Details(models.Model):
#     phone_regex = RegexValidator(regex=r'^[6789]\d{9}$', message="Please enter a valid mobile in 10 digit format")
    
#     management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_iii_married_Member_Details')
#     family=models.ForeignKey(Fammily_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='family_in_married_Member_Details')
#     member_no=models.CharField(max_length=255,null=True,blank=True)
#     member_name = models.CharField(max_length=255,null=True)
#     # optional
#     last_name = models.CharField(max_length=255,null=True,blank=True)
    
#     member_mobile_number=models.CharField(max_length=255,null=True,validators=[phone_regex])
#     member_dob=models.DateField(null=True,blank=True)
#     member_age=models.IntegerField(null=True,blank=True)
#     member_email=models.EmailField(null=True,blank=True)
#     member_photo=models.ImageField(null=True,blank=True)

#     member_relation_ship=models.CharField(max_length=255,choices=RELATION_TYPE_CHOICES,null=True,blank=True)
#     member_gender=models.CharField(max_length=255,choices=GENDER_CHOICES,null=True,blank=True)

#     member_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True)
#     member_joining_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True)
#     member_tax_eligible=models.BooleanField(default=False,null=True,blank=True)
#     head=models.BooleanField(default=False,null=True,blank=True)
    
#     leaving_date=models.DateField(null=True,blank=True)
#     releving_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True)
#     reason_for_leaving=models.TextField(null=True,blank=True)
#     action=models.BooleanField(default=True,null=True,blank=True)
    
    
#     created_by=models.CharField(max_length=255,null=True,blank=True)
#     created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
#     updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
    