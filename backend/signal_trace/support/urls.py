"""
URL configuration for support app API endpoints.

All views are class-based views following Django REST Framework best practices.
"""

from django.urls import path
from . import views

app_name = 'support'

urlpatterns = [
    path('api/support/contact/', views.ContactMessageView.as_view(), name='contact'),
]

