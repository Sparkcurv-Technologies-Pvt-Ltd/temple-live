from django.urls import path
from . import views



urlpatterns = [
    path('add_lease_things/', views.add_lease_things,name='add_lease_things'),
    path('get_lease_things/', views.get_lease_things,name='get_lease_things'),
    path('get_rent_things/', views.get_rent_things,name='get_rent_things'),
    path('get_moveablerent_things/', views.get_moveablerent_things,name='get_moveablerent_things'),
    path('edit_lease_things/<int:pk>/', views.edit_lease_things,name='edit_lease_things'),
    # path('rental_view/', views.rental_view,name='rental_view'),
    path('rent_viewlist/<int:pk>/', views.rent_viewlist,name='rent_viewlist'),
    path('movablerentasset_viewlist/<int:pk>/', views.movablerentasset_viewlist,name='movablerentasset_viewlist'),

    
    path('rental_advance_settlement/<int:pk>/', views.rental_advance_settlement,name='rental_advance_settlement'),
    path('force_settlement_close/<int:pk>/', views.force_settlement_close,name='force_settlement_close'),
    
    # movable assets
    path('add_movable_rent_things/', views.add_movable_rent_things,name='add_movable_rent_things'),
    path('edit_moveable_lease_things/<int:pk>/', views.edit_moveable_lease_things,name='edit_moveable_lease_things'),

]
