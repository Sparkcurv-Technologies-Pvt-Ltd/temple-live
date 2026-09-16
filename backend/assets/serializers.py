from rest_framework import serializers
from .models import AssetCategory,AssetDetails,MoveableAssetCategory,MoveableAssetDetails

class AssetCategorySerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model= AssetCategory
        fields='__all__'
           
class AssetDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    images=serializers.ImageField(required=False)
    documents=serializers.FileField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model= AssetDetails
        fields='__all__'


class MoveableAssetCategorySerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model= MoveableAssetCategory
        fields='__all__'
           
class MoveableAssetDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    action = serializers.BooleanField(default=True)
    class Meta:
        model= MoveableAssetDetails
        fields='__all__'