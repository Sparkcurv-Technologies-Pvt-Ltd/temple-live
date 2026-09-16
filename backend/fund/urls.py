from django.urls import path
from . import views



urlpatterns = [
    path('add_fund_name_details/', views.add_fund_name_details,name='add_fund_name_details'),
    path('edit_fund_name_details/<int:pk>/', views.edit_fund_name_details,name='edit_fund_name_details'),
    path('fund_group_view_fundname/', views.fund_group_view_fundname,name='fund_group_view_fundname'),

    
    path('add_fund_groups/', views.add_fund_groups,name='add_fund_groups'),
    path('edit_fund_groups/<int:pk>/', views.edit_fund_groups,name='edit_fund_groups'),
    
    path('fund_lease_details/', views.fund_lease_details,name='fund_lease_details'),
    path('edit_fund_lease_details/<int:pk>/', views.edit_fund_lease_details,name='edit_fund_lease_details'),
    
    path('close_fund_groups/<int:pk>/', views.close_fund_groups,name='close_fund_groups'),
    
    path('lease_page_fund_get/', views.lease_page_fund_get,name='lease_page_fund_get'),
    path('lease_page_normal_fund_get/', views.lease_page_normal_fund_get,name='lease_page_normal_fund_get'),
    path('lease_normal_view/', views.lease_normal_view,name='lease_normal_view'),


    # path('new_lease_page_fund_get/<int:pk>/', views.new_lease_page_fund_get,name='new_lease_page_fund_get'),

    path('fund_profile_page/<int:pk>/', views.fund_profile_page,name='fund_profile_page'),
    path('lease_fund_settlement/<int:pk>/', views.lease_fund_settlement,name='lease_fund_settlement'),

    
    
]
