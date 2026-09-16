from django.urls import path
from . import views



urlpatterns = [
    path('add_extrafield_authority/', views.add_extrafield_authority,name='add_extrafield_authority'),
    path('edit_extrafield_authority/<int:pk>/', views.edit_extrafield_authority,name='edit_extrafield_authority'),
    path('add_authority_position/', views.add_authority_position,name='add_authority_position'),
    path('edit_authority_position/<int:pk>/', views.edit_authority_position,name='edit_authority_position'),
    
    path('add_authority_Details/', views.add_authority_Details,name='add_authority_Details'),
    path('edit_authority_Details/<int:pk>/', views.edit_authority_Details,name='edit_authority_Details'),
    
    path('authority_resign/<int:pk>/', views.authority_resign,name='authority_resign'),
    path('authority_rejoin/<int:pk>/', views.authority_rejoin,name='authority_rejoin'),
    
    path('get_authrity_members_view/', views.get_authrity_members_view,name='get_authrity_members_view'),
    path('get_authrity_members_view2/', views.get_authrity_members_view2,name='get_authrity_members_view2'),
    
]
