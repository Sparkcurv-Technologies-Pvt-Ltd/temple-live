from django.db import models
from management.models import ManagementDetails

class AssetCategory(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Asset_category_link_on_management')
    categoryname=models.CharField(max_length=255,null=True,unique=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class AssetDetails(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='AssetDetails_link_on_management')
    category=models.ForeignKey(AssetCategory,on_delete=models.CASCADE,null=True,blank=True,related_name='asset_category_link')
    category_name=models.CharField(max_length=255,null=True)
    is_booked=models.BooleanField(default=True,null=True,blank=True)
    asset_name=models.CharField(max_length=255,null=True)
    details=models.TextField(null=True,blank=True)
    comments=models.TextField(null=True,blank=True)
    images=models.ImageField(null=True,blank=True)
    documents=models.FileField(null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)


class MoveableAssetCategory(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='MoveableAssetCategory_link_on_management')
    categoryname=models.CharField(max_length=255,null=True,unique=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class MoveableAssetDetails(models.Model):
    mangement=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='MoveableAssetDetails_link_on_management')
    category=models.ForeignKey(MoveableAssetCategory,on_delete=models.CASCADE,null=True,blank=True,related_name='MoveableAssetCategory_link')
    category_name=models.CharField(max_length=255,null=True)
    asset_name=models.CharField(max_length=255,null=True)
    total_qty=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    rent_qty=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    avilable_qty=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    per_sale_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0)
    details=models.TextField(null=True,blank=True)
    comments=models.TextField(null=True,blank=True)
    action=models.BooleanField(default=True,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)