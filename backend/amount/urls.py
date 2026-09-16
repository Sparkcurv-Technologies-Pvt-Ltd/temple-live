from . import views
from django.urls import path


urlpatterns = [
    
    path('bank_transaction/',views.bank_transaction,name='bank_transaction'),
    path('edit_bank_transaction/<int:pk>/',views.edit_bank_transaction,name='edit_bank_transaction'),
    path('get_bank_details/',views.get_bank_details,name='get_bank_details'),
    path('get_cash_details/',views.get_cash_details,name='get_cash_details'),
    path('cash_tranfer_statement/',views.cash_tranfer_statement,name='cash_tranfer_statement'),
    path('bank_statement/',views.bank_statement,name='bank_statement'),
    path('get_detail_cash_borrowedlist/',views.get_detail_cash_borrowedlist,name='get_detail_cash_borrowedlist'),
    path('get_bank_details_filter/<int:pk>/',views.get_bank_details_filter,name='get_bank_details_filter'),





]
