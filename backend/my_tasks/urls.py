from django.urls import path
from . import views

urlpatterns = [
    path('run_scheduler_now/', views.run_scheduler_now, name='run_scheduler_now'),
]
