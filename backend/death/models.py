from django.db import models
from family.models import Fammily_Details,Member_Details
from management.models import ManagementDetails

NATIVE_CHOICES = (
    ('Member','Member'),
    ('Other','Other')
)

TARIFF_CHOICES = (
    ('Amount','Amount'),
    ('Percentage','Percentage')
)

class DeathDetails(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='manage_link_in_death')
    # family=models.ForeignKey(Fammily_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='DeathDetails_family')
    member=models.OneToOneField(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='DeathDetails_member')
    member_name=models.CharField(max_length=255,null=True)
    death_date=models.DateField(null=True)
    comments=models.TextField(null=True,blank=True)
    # amount_details=models.TextField(null=True,blank=True)
    # death_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    # pending_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    # pending=models.BooleanField(default=True,null=True,blank=True)
    date=models.DateField(null=True)
    documents=models.FileField(null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    death_no=models.CharField(max_length=255,null=True,blank=True)
    death_tariff_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    tariff_peanalty=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    pen_amt_type=models.CharField(max_length=255,choices=TARIFF_CHOICES,null=True)
    penalty_apply_date=models.DateField(null=True)
    calculated_tariff_peanalty_amt=models.DecimalField(max_digits=65,default=0.00,decimal_places=2,null=True,blank=True)
    photo=models.ImageField(null=True,blank=True)    
    old_death=models.BooleanField(default=False,null=True,blank=True)    
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
