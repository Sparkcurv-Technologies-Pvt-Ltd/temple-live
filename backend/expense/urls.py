from django.urls import path
from . import views



urlpatterns = [
    path('add_expen_categry/', views.add_expen_categry,name='add_expen_categry'),
    path('edit_expen_categry/<int:pk>/', views.edit_expen_categry,name='edit_expen_categry'),
    path('add_expen_names/', views.add_expen_names,name='add_expen_names'),
    path('edit_expen_names/<int:pk>/', views.edit_expen_names,name='edit_expen_names'),
    path('add_expen_details/', views.add_expen_details,name='add_expen_details'),
    path('edit_expen_details/<int:pk>/', views.edit_expen_details,name='edit_expen_details'),
    path('expense_detail_filter/', views.expense_detail_filter,name='expense_detail_filter'),

]
