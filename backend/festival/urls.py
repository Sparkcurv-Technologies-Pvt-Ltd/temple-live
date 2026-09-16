from django.urls import path
from . import views



urlpatterns = [
    path('add_festival_details/', views.add_festival_details,name='add_festival_details'),
    path('edit_festival_details/<int:pk>/', views.edit_festival_details,name='edit_festival_details'),
]
