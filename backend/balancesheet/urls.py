from django.urls import path
from . import views



urlpatterns = [
    path('collection_page_fund_view/<int:pk>/', views.collection_page_fund_view,name='collection_page_fund_view'),
    path('balancesheet_view/', views.balancesheet_view,name='balancesheet_view'),
    path('balancesheet_chitfundview/', views.balancesheet_chitfundview,name='balancesheet_chitfundview'),



]
