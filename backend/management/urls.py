from django.urls import path
from . import views

urlpatterns = [
    path('add_management/', views.add_management,name='add_management'),
    path('edit_management/<int:pk>/', views.edit_management,name='edit_management'),
    path('view_bank_details/', views.view_bank_details,name='view_bank_details'),
    path('add_instructions/',views.add_instructions,name="add_instructions"),
    path('edit_instructions/<int:pk>/',views.edit_instructions,name='edit_instructions'),
    
]
