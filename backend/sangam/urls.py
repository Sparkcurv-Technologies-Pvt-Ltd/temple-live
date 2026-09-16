from django.urls import path
from . import views



urlpatterns = [
    path('get_sangam_members/', views.get_sangam_members,name='get_sangam_members'),
    
    path('add_sangam_name/', views.add_sangam_name,name='add_sangam_name'),
    path('edit_sangam_name/<int:pk>/', views.edit_sangam_name,name='edit_sangam_name'),
    path('add_sangam_details/', views.add_sangam_details,name='add_sangam_details'),
    path('edit_sangam_details/<int:pk>/', views.edit_sangam_details,name='edit_sangam_details'),
    
]
