from django.urls import path
from . import views
from . import public_views
from . import pdf_views

urlpatterns = [
    path('add_collection_details/', views.add_collection_details,name='add_collection_details'),
    path('edit_collections_details/<int:pk>/', views.edit_collections_details,name='edit_collections_details'),
    path('get_select_type/', views.get_select_type,name='get_select_type'),
    path('get_select_member_collection/', views.get_select_member_collection,name='get_select_member_collection'),
    path('get_amount_details/', views.get_amount_details,name='get_amount_details'),
    path('get_active_sub_tarrif/', views.get_active_sub_tarrif,name='get_active_sub_tarrif'),
    path('get_sub_tariff_details/', views.get_sub_tariff_details,name='get_sub_tariff_details'),

####################################

    path('get_member_balance/', views.get_member_balance,name='get_member_balance'),


    path('get_marriage_detail/', views.get_marriage_detail,name='get_marriage_detail'),
    # path('get_moveableassetrent_detail/', views.get_moveableassetrent_detail,name='get_moveableassetrent_detail'),
    path('collection_summary_user/<int:pk>/', views.collection_summary_user,name='collection_summary_user'),
    path('collection_summary_user_date/', views.collection_summary_user_date,name='collection_summary_user_date'),

    path('collection_user_list/', views.collection_user_list,name='collection_user_list'),

    path('collection_list_filter_by_user/', views.collection_list_filter_by_user,name='collection_list_filter_by_user'),



############NEW
    path('unpaid_list/', views.unpaid_list,name='unpaid_list'),
    path('unpaid_list_member/', views.unpaid_list_member,name='festival_unpaid_list_member'),

    # path('unpaid_list_date_filter/', views.unpaid_list_date_filter,name='unpaid_list_date_filter'),
    path('unpaid_list_member_date_filter/', views.unpaid_list_member_date_filter,name='festival_unpaid_list_member_date_filter'),


    path('collection_amountdetails_filter_by_user_list/', views.collection_amountdetails_filter_by_user_list,name='collection_amountdetails_filter_by_user_list'),
    path('collection_amountdetails_filter_by_user/', views.collection_amountdetails_filter_by_user,name='collection_amountdetails_filter_by_user'),

    path('management_interest_member_details/', views.management_interest_member_details,name='management_interest_member_details'),
    path('chitfund_interest_member_details/', views.chitfund_interest_member_details,name='chitfund_interest_member_details'),
    path('chit_fund_details/', views.chit_fund_details,name='chit_fund_details'),
    path('chitname_withfiltering_category/', views.chitname_withfiltering_category,name='chitname_withfiltering_category'),
    path('chitname_withfiltering_category/', views.chitname_withfiltering_category,name='chitname_withfiltering_category'),
    path('interest_balance_collection/', views.interest_balance_collection,name='interest_balance_collection'),

    # ---- Public (unauthenticated) 1-year member statement (WhatsApp link)
    path('member_statement/token/<int:member_id>/', public_views.get_member_statement_token, name='get_member_statement_token'),
    path('public/member_statement/<str:token>/', public_views.public_member_statement, name='public_member_statement'),
    # ---- Public 1-year interest-loan statement (for non-Member borrowers)
    path('interest_statement/token/<int:interest_id>/', public_views.get_interest_statement_token, name='get_interest_statement_token'),
    path('public/interest_statement/<str:token>/', public_views.public_interest_statement, name='public_interest_statement'),

    # ---- Public DIRECT-PDF statement endpoints (WhatsApp link opens PDF)
    path('public/member_statement_pdf/<str:token>/', pdf_views.public_member_statement_pdf, name='public_member_statement_pdf'),
    path('public/interest_statement_pdf/<str:token>/', pdf_views.public_interest_statement_pdf, name='public_interest_statement_pdf'),


]
