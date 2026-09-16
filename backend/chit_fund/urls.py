from django.urls import path
from . import views
from .pending_views import chit_fund_pending_borrowers



urlpatterns = [
    path('get_chitfund_member_details/', views.get_chitfund_member_details,name='get_chitfund_member_details'),

    path('add_chit_fund/', views.add_chit_fund,name='add_chit_fund'),
    path('edit_chit_fund/<int:pk>/', views.edit_chit_fund,name='edit_chit_fund'),
    
    path('add_chit_fund_investors/', views.add_chit_fund_investors,name='add_chit_fund_investors'),
    path('edit_chit_fund_investors/<int:pk>/', views.edit_chit_fund_investors,name='edit_chit_fund_investors'),
    
    path('add_chit_fund_settlement_application_details/', views.add_chit_fund_settlement_application_details,name='add_chit_fund_settlement_application_details'),
    path('edit_chit_fund_settlement_application_details/<int:pk>/', views.edit_chit_fund_settlement_application_details,name='edit_chit_fund_settlement_application_details'),
    
    path('add_chit_fund_settlement/', views.add_chit_fund_settlement,name='add_chit_fund_settlement'),
    path('edit_chit_fund_settlement/<int:pk>/', views.edit_chit_fund_settlement,name='edit_chit_fund_settlement'),

    path('get_chitfund_distribution/', views.get_chitfund_distribution,name='get_chitfund_distribution'),
    path('add_chitfund_distribution/', views.add_chitfund_distribution,name='add_chitfund_distribution'),
    path('get_chitfund_members/', views.get_chitfund_members,name='get_chitfund_members'),
    
    path('get_chitfund_settlement_application_mem/', views.get_chitfund_settlement_application_mem,name='get_chitfund_settlement_application_mem'),
    
    path('chit_fund_settlement_application_get/', views.chit_fund_settlement_application_get,name='chit_fund_settlement_application_get'),
    
    path('get_active_chitfunds/', views.get_active_chitfunds,name='get_active_chitfunds'),
    
    path('distributed_chit_fund/<int:pk>/', views.distributed_chit_fund,name='distributed_chit_fund'),
    path('get_chitfund_members_amount/', views.get_chitfund_members_amount,name='get_chitfund_members_amount'),
    
    path('chitfund_only_profit_distribution/', views.chitfund_only_profit_distribution,name='chitfund_only_profit_distribution'),
    path('profit_only_chit_fund_edit/<int:pk>/', views.profit_only_chit_fund_edit,name='profit_only_chit_fund_edit'),
    
    path('chit_fund_investers_register_list/', views.chit_fund_investers_register_list,name='chit_fund_investers_register_list'),
    path('management_treasure_get/', views.management_treasure_get,name='management_treasure_get'),
    path('recompute_cash_inhand/<int:pk>/', views.recompute_cash_inhand,name='recompute_cash_inhand'),
    path('pending_borrowers/<int:chit_id>/', chit_fund_pending_borrowers, name='chit_fund_pending_borrowers'),


]
