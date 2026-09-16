from . import views
from django.urls import path
urlpatterns = [
    # path('token_check',views.token_check,name='token_check'),
    path('generate_token',views.generate_token,name='generate_token'), 
]