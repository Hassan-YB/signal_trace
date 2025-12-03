"""
URL configuration for prospects app API endpoints.

All views are class-based views following Django REST Framework best practices.
"""

from django.urls import path
from . import views

app_name = 'prospects'

urlpatterns = [
    path('api/prospects/', views.ProspectListView.as_view(), name='prospect-list'),
    path('api/prospects/<int:pk>/', views.ProspectDetailView.as_view(), name='prospect-detail'),
]

