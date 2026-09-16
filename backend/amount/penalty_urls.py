from django.urls import path
from . import penalty_views

urlpatterns = [
    path("pending/", penalty_views.pending_penalty_list, name="pending_penalty_list"),
    path("recompute/", penalty_views.recompute_penalties, name="recompute_penalties"),
    path("summary/", penalty_views.penalty_summary, name="penalty_summary"),
]
