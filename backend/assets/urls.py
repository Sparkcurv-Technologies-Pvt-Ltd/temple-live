from django.urls import path
from . import views


urlpatterns = [
    path('add_asset_category_details/', views.add_asset_category_details,name='add_asset_category_details'),
    path('edit_asset_category_details/<int:pk>/', views.edit_asset_category_details,name='edit_asset_category_details'),
    
    path('add_asset_details/', views.add_asset_details,name='add_asset_details'),
    path('edit_asset_details/<int:pk>/', views.edit_asset_details,name='edit_asset_details'),
    
    path('categ_wise_asset_details/<int:pk>/', views.categ_wise_asset_details,name='categ_wise_asset_details'),
    
    path('lease_page_categ_wise_asset_details/', views.lease_page_categ_wise_asset_details,name='lease_page_categ_wise_asset_details'),
    
    # movable asset
    path('add_movableasset_category_details/', views.add_movableasset_category_details,name='add_movableasset_category_details'),
    path('edit_movableasset_category_details/<int:pk>/', views.edit_movableasset_category_details,name='edit_movableasset_category_details'),
    path('lease_page_categ_wise_movable_asset_details/', views.lease_page_categ_wise_movable_asset_details,name='lease_page_categ_wise_movable_asset_details'),
    
    path('add_movableasset_details/', views.add_movableasset_details,name='add_movableasset_details'),
    path('edit_movableasset_details/<int:pk>/', views.edit_movableasset_details,name='edit_movableasset_details'),
    
]
