from django.urls import path
from .views import RegisterView,LoginView,RegisterView999,RegisterView2,user_edit,users_view,admins_view,g_user_Enable,g_user_disable,RegisterViewinvestor
from .import views

urlpatterns = [
    path('admin_register/', RegisterView2.as_view()),
    path('register', RegisterView.as_view()),
    path('user_register', RegisterView999.as_view()),
    path('login', LoginView.as_view()), 
    path('user_edit/<int:pk>',user_edit),
    path('users_view/',users_view),
    path('admins_view/',admins_view),
    path('g_user_Enable/<int:pk>',g_user_Enable),
    path('g_user_disable/<int:pk>',g_user_disable),
    path('investor_register', RegisterViewinvestor.as_view()),

    
]
