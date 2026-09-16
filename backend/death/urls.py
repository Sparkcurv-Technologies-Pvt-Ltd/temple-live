from django.urls import path
from . import views



urlpatterns = [
    path('add_death_details/', views.add_death_details,name='add_death_details'),
    path('edit_death_details/<int:pk>/', views.edit_death_details,name='edit_death_details'),
]
