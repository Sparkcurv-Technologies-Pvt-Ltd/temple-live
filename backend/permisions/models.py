from django.db import models
# from user.models import User
from management.models import ManagementDetails

PRODUCT_TYPE_CHOICES = (
    ('variation','variation'),
    ('single','single')
)
class My_Roles(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_LINK_in_permissionss')
    Role_name = models.CharField(max_length=255,null=True,unique=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class Permisions(models.Model):
    role_link=models.ForeignKey(My_Roles,on_delete=models.CASCADE,null=True,blank=True,related_name='role_link')
    # role_link_name=models.CharField(max_length=255,null=True,blank=True)
    dashboard=models.BooleanField(default=False,null=True,blank=True)
    # family
    fam_add=models.BooleanField(default=False,null=True,blank=True)
    fam_view=models.BooleanField(default=False,null=True,blank=True)
    fam_edit=models.BooleanField(default=False,null=True,blank=True)
    fam_delete=models.BooleanField(default=False,null=True,blank=True)
    # asset
    asset_add=models.BooleanField(default=False,null=True,blank=True)
    asset_view=models.BooleanField(default=False,null=True,blank=True)
    asset_edit=models.BooleanField(default=False,null=True,blank=True)
    asset_delete=models.BooleanField(default=False,null=True,blank=True)
    # expense
    expense_add=models.BooleanField(default=False,null=True,blank=True)
    expense_view=models.BooleanField(default=False,null=True,blank=True)
    expense_edit=models.BooleanField(default=False,null=True,blank=True)
    expense_delete=models.BooleanField(default=False,null=True,blank=True)
    # collection
    # collection_add=models.BooleanField(default=False,null=True,blank=True)
    # collection_view=models.BooleanField(default=False,null=True,blank=True)
    # collection_edit=models.BooleanField(default=False,null=True,blank=True)
    # collection_del=models.BooleanField(default=False,null=True,blank=True)
    # management
    # manage_add=models.BooleanField(default=False,null=True,blank=True)
    # manage_view=models.BooleanField(default=False,null=True,blank=True)
    # manage_edit=models.BooleanField(default=False,null=True,blank=True)
    # manage_del=models.BooleanField(default=False,null=True,blank=True)
    # fund
    fund_add=models.BooleanField(default=False,null=True,blank=True)
    fund_view=models.BooleanField(default=False,null=True,blank=True)
    fund_edit=models.BooleanField(default=False,null=True,blank=True)
    fund_delete=models.BooleanField(default=False,null=True,blank=True)
    # chit_fund
    chit_fund_add=models.BooleanField(default=False,null=True,blank=True)
    chit_fund_view=models.BooleanField(default=False,null=True,blank=True)
    chit_fund_edit=models.BooleanField(default=False,null=True,blank=True)
    chit_fund_delete=models.BooleanField(default=False,null=True,blank=True)
    # fund_lease
    # fund_lease_add=models.BooleanField(default=False,null=True,blank=True)
    # fund_lease_view=models.BooleanField(default=False,null=True,blank=True)
    # fund_lease_edit=models.BooleanField(default=False,null=True,blank=True)
    # fund_lease_del=models.BooleanField(default=False,null=True,blank=True)
    # authority
    authority_add=models.BooleanField(default=False,null=True,blank=True)
    authority_view=models.BooleanField(default=False,null=True,blank=True)
    authority_edit=models.BooleanField(default=False,null=True,blank=True)
    authority_delete=models.BooleanField(default=False,null=True,blank=True)
    # user
    # user_add=models.BooleanField(default=False,null=True,blank=True)
    # user_view=models.BooleanField(default=False,null=True,blank=True)
    # user_edit=models.BooleanField(default=False,null=True,blank=True)
    # user_del=models.BooleanField(default=False,null=True,blank=True)
    # death
    death_add=models.BooleanField(default=False,null=True,blank=True)
    death_view=models.BooleanField(default=False,null=True,blank=True)
    death_edit=models.BooleanField(default=False,null=True,blank=True)
    death_delete=models.BooleanField(default=False,null=True,blank=True)
    
    # marriage
    marriage_add=models.BooleanField(default=False,null=True,blank=True)
    marriage_view=models.BooleanField(default=False,null=True,blank=True)
    marriage_edit=models.BooleanField(default=False,null=True,blank=True)
    marriage_delete=models.BooleanField(default=False,null=True,blank=True)
    
    # income
    income_add=models.BooleanField(default=False,null=True,blank=True)
    income_view=models.BooleanField(default=False,null=True,blank=True)
    income_edit=models.BooleanField(default=False,null=True,blank=True)
    income_delete=models.BooleanField(default=False,null=True,blank=True)
    
    # sangam
    sangam_add=models.BooleanField(default=False,null=True,blank=True)
    sangam_view=models.BooleanField(default=False,null=True,blank=True)
    sangam_edit=models.BooleanField(default=False,null=True,blank=True)
    sangam_delete=models.BooleanField(default=False,null=True,blank=True)

    bank_transaction_add=models.BooleanField(default=False,null=True,blank=True)
    bank_transaction_view=models.BooleanField(default=False,null=True,blank=True)
    bank_transaction_edit=models.BooleanField(default=False,null=True,blank=True)
    bank_transaction_delete=models.BooleanField(default=False,null=True,blank=True)
    # balance sheet

    balance_sheet_view=models.BooleanField(default=False,null=True,blank=True)
    # rental
    rental_add=models.BooleanField(default=False,null=True,blank=True)
    rental_view=models.BooleanField(default=False,null=True,blank=True)
    rental_edit=models.BooleanField(default=False,null=True,blank=True)
    rental_delete=models.BooleanField(default=False,null=True,blank=True)
    # festival
    festival_add=models.BooleanField(default=False,null=True,blank=True)
    festival_view=models.BooleanField(default=False,null=True,blank=True)
    festival_edit=models.BooleanField(default=False,null=True,blank=True)
    festival_delete=models.BooleanField(default=False,null=True,blank=True)
    # sub_tariff
    sub_tarif_add=models.BooleanField(default=False,null=True,blank=True)
    sub_tarif_view=models.BooleanField(default=False,null=True,blank=True)
    sub_tarif_edit=models.BooleanField(default=False,null=True,blank=True)
    sub_tarif_delete=models.BooleanField(default=False,null=True,blank=True)
    # tax
    # tax_add=models.BooleanField(default=False,null=True,blank=True)
    # tax_view=models.BooleanField(default=False,null=True,blank=True)
    # tax_edit=models.BooleanField(default=False,null=True,blank=True)
    # tax_del=models.BooleanField(default=False,null=True,blank=True)
    # interest
    interest_add=models.BooleanField(default=False,null=True,blank=True)
    interest_view=models.BooleanField(default=False,null=True,blank=True)
    interest_edit=models.BooleanField(default=False,null=True,blank=True)
    interest_delete=models.BooleanField(default=False,null=True,blank=True)
    
    # amount_collection
    fund=models.BooleanField(default=False,null=True,blank=True)
    festival=models.BooleanField(default=False,null=True,blank=True)
    # tax=models.BooleanField(default=False,null=True,blank=True)
    rent=models.BooleanField(default=False,null=True,blank=True)
    lease=models.BooleanField(default=False,null=True,blank=True)
    management_interest=models.BooleanField(default=False,null=True,blank=True)
    chit_interest=models.BooleanField(default=False,null=True,blank=True)
    sub_tariff=models.BooleanField(default=False,null=True,blank=True)
    # chit_fund=models.BooleanField(default=False,null=True,blank=True)
    balance=models.BooleanField(default=False,null=True,blank=True)
    death_tariff=models.BooleanField(default=False,null=True,blank=True)
    marriage=models.BooleanField(default=False,null=True,blank=True)
    moveable_asset_rent=models.BooleanField(default=False,null=True,blank=True)

    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)