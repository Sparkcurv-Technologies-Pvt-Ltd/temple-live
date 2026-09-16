from django.urls import path
from . import views



urlpatterns = [
    path('add_family/', views.add_family,name='add_family'),
    path('edit_family/<int:pk>/', views.edit_family,name='edit_family'),
    path('view_family_link_to_ancester/<int:pk>/', views.view_family_link_to_ancester,name='view_family_link_to_ancester'),
    path('ansester_view_edit_family/<int:pk>/', views.ansester_view_edit_family,name='ansester_view_edit_family'),
    path('ansester_view/', views.ansester_view,name='ansester_view'),
    path('family_mem_nodeath_view/', views.family_mem_nodeath_view,name='family_mem_nodeath_view'),
    
    path('family_group_view/', views.family_group_view,name='family_group_view'),
    path('members_view/', views.members_view,name='members_view'),
    path('death_members_view/', views.death_members_view,name='death_members_view'),
    path('marriage_remove_members_view/', views.marriage_remove_members_view,name='marriage_remove_members_view'),
    path('leaving_members_view/', views.leaving_members_view,name='leaving_members_view'),
    path('alive_members_view/', views.alive_members_view,name='alive_members_view'),
    path('tariff_members_view/', views.tariff_members_view,name='tariff_members_view'),
    path('single_member_view/<int:pk>/', views.single_member_view,name='single_member_view'),
    path('marriage_groom_family_view/', views.marriage_groom_family_view,name='marriage_groom_family_view'),
    path('marriage_bride_family_view/', views.marriage_bride_family_view,name='marriage_bride_family_view'),
    path('alive_family_and_the_members/', views.alive_family_and_the_members,name='alive_family_and_the_members'),
    path('ancestor_tree_view/<int:pk>/', views.ancestor_tree_view,name='ancestor_tree_view'),
    path('movablerentassetmember_viewlist/<int:pk>/', views.movablerentassetmember_viewlist,name='movablerentassetmember_viewlist'),
    
    path('Single_mem_balancesheet/', views.Single_mem_balancesheet,name='Single_mem_balancesheet'),
    

    
]
