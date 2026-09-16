from django.urls import path
from . import views



urlpatterns = [
    path('add_marriage_details/', views.add_marriage_details,name='add_marriage_details'),
    path('edit_marriage_details/<int:pk>/', views.edit_marriage_details,name='edit_marriage_details'),
]
