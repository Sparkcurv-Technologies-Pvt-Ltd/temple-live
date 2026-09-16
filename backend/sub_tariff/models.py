from django.db import models
from management.models import ManagementDetails


AMOUNT_CHOICES = (
    ('Percentage','Percentage'),
    ('Amount','Amount')
)



class ADDSubscriptionTariffDetails(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_link_ADDSubscriptionTariffDetails')
    date=models.DateField(null=True)
    from_date=models.DateField(null=True)
    to_date=models.DateField(null=True)
    tariff_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True)
    subscription_no=models.CharField(max_length=255, null=True,blank=True)
    exp_amount_type=models.CharField(max_length=255, choices=AMOUNT_CHOICES,null=True,blank=True)
    exp_amount=models.DecimalField(max_digits=65,decimal_places=2,null=True)
    penalty_amount_type=models.CharField(max_length=255, choices=AMOUNT_CHOICES,null=True,blank=True)
    penalty_amt=models.DecimalField(max_digits=65,decimal_places=2,null=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
