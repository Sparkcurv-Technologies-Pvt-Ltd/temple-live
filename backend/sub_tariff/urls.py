from django.urls import path
from . import views



urlpatterns = [
    path('add_tariff_details/', views.add_tariff_details,name='add_tariff_details'),
    path('edit_tariff_details/<int:pk>/', views.edit_tariff_details,name='edit_tariff_details'),
]
