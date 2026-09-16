from django.urls import path
from . import views


urlpatterns = [
    path('add_role_details/', views.add_role_details,name='add_role_details'),
    path('edit_role_details/<int:pk>/', views.edit_role_details,name='edit_role_details'),
    path('assign_permissions/',views.assign_permissions,name='assign_permissions'),
    path('edit_role/<int:pk>/',views.edit_role,name='edit_role'),
]
