"""
URL configuration for users app API endpoints.

All views are class-based views following Django REST Framework best practices.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('api/auth/signup/', views.SignupView.as_view(), name='signup'),
    path('api/auth/signup/verify/', views.SignupOTPVerificationView.as_view(), name='signup-verify'),
    path('api/auth/signup/otp/resend/', views.ResendOTPView.as_view(), name='signup-resend-otp'),
    path('api/auth/login/', views.LoginView.as_view(), name='login'),
    path('api/auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/auth/profile/', views.UserProfileView.as_view(), name='profile'),
    path('api/auth/password/change/', views.PasswordChangeView.as_view(), name='password-change'),
    path('api/auth/password/forgot/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('api/auth/password/forgot/verify/', views.VerifyPasswordResetOTPView.as_view(), name='verify-password-reset-otp'),
    path('api/auth/password/forgot/otp/resend/', views.ResendOTPView.as_view(), name='password-reset-resend-otp'),
    path('api/auth/password/reset/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('api/auth/verify/otp/', views.VerifyInactiveUserOTPView.as_view(), name='verify-inactive-user-otp'),
    path('api/auth/verify/otp/resend/', views.ResendOTPView.as_view(), name='resend-verification-otp'),
]

