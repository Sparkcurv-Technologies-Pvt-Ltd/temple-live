from django.urls import path
from . import views



urlpatterns = [
    path('add_income_details/', views.add_income_details,name='add_income_details'),
    path('edit_income_details/<int:pk>/', views.edit_income_details,name='edit_income_details'),

    path('add_income_categry/', views.add_income_categry,name='add_income_categry'),
    path('edit_income_categry/<int:pk>/', views.edit_income_categry,name='edit_income_categry'),

    path('add_income_names/', views.add_income_names,name='add_income_names'),
    path('edit_income_names/<int:pk>/', views.edit_income_names,name='edit_income_names'),

    path('income_details_filter/', views.income_details_filter,name='income_details_filter'),

]
