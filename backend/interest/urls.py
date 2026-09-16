from django.urls import path
from . import views
from . import overdue_views



urlpatterns = [
    path('add_interest_given_details/', views.add_interest_given_details,name='add_interest_given_details'),
    path('edit_interest_given_details/<int:pk>/', views.edit_interest_given_details,name='edit_interest_given_details'),
    
    path('management_interest_details_table/', views.management_interest_details_table,name='management_interest_details_table'),
    path('management_capital_interest_details_table/', views.management_capital_interest_details_table,name='management_capital_interest_details_table'),
    path('management_installment_interest_details_table/', views.management_installment_interest_details_table,name='management_installment_interest_details_table'),

    path('chit_fund_interest_details_table/', views.chit_fund_interest_details_table,name='chit_fund_interest_details_table'),
    path('chit_fund_capitalinterest_details_table/', views.chit_fund_capitalinterest_details_table,name='chit_fund_capitalinterest_details_table'),
    path('chit_fund_installment_interest_details_table/', views.chit_fund_installment_interest_details_table,name='chit_fund_installment_interest_details_table'),
    
    path('interest_profile/<int:pk>/', views.interest_profile,name='interest_profile'),

    path('interest_member_list', views.interest_member_list,name='interest_member_list'),
    path('get_chit_fund_details/', views.get_chit_fund_details,name='get_chit_fund_details'),
    path('chit_interest_filter_based_type/', views.chit_interest_filter_based_type,name='chit_interest_filter_based_type'),
    path('management_interest_filter_based_type/', views.management_interest_filter_based_type,name='management_interest_filter_based_type'),

    path('interest_people_report_get/', views.interest_people_report_get,name='interest_people_report_get'),

    path('interest_people_balance_get/', views.interest_people_balance_get,name='interest_people_balance_get'),
    path('interest_people_installmentinterest_balance_get/', views.interest_people_installmentinterest_balance_get,name='interest_people_installmentinterest_balance_get'),

    # Backfill missed monthly interest + overdue penalty rows for every
    # active interest record. Optional ?id=<pk> to run for a single record.
    path('apply_overdue_interest_and_penalty/', overdue_views.apply_overdue_interest_and_penalty, name='apply_overdue_interest_and_penalty'),

    # Heal balance-sheet drift by recomputing from the audit trail
    # (`InterestPeopleReport`). Idempotent; supports ?id=<pk> and ?dry_run=1.
    path('recompute_interest_balance/', overdue_views.recompute_interest_balance, name='recompute_interest_balance'),



    
]
