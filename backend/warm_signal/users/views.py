"""
API Views for User Authentication

ARCHITECTURE NOTE:
==================
This project uses CLASS-BASED VIEWS exclusively.

Views should contain minimal code and delegate to:
- Serializers for validation and data transformation
- Models for business logic

This keeps views thin and makes the codebase more maintainable.
Following Django REST Framework best practices with class-based views.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserSignupSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    OTPVerificationSerializer,
    ResendOTPSerializer,
    ForgotPasswordSerializer,
    VerifyPasswordResetOTPSerializer,
    ResetPasswordSerializer
)
from .utils import success_response, error_response

User = get_user_model()


class SignupView(APIView):
    """
    User registration endpoint - generates OTP instead of creating user immediately.
    
    Class-based view that delegates to serializer for validation
    and model method for business logic.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request for user registration - generates OTP."""
        serializer = UserSignupSerializer(data=request.data)
        
        if serializer.is_valid():
            # Serializer generates OTP and stores signup data
            result = serializer.save()
            
            # Store signup data in session/cache for OTP verification
            # For now, we'll store it in the OTP model's context
            # In production, use Redis or similar for temporary storage
            
            # Return standardized success response
            return success_response(
                data={
                    'email': result['email'],
                    'message': 'OTP sent to your email. Please verify to complete registration.'
                },
                message='OTP sent successfully. Please check your email.',
                status_code=status.HTTP_200_OK
            )
        
        # Return standardized error response
        return error_response(
            message='Registration failed. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    """
    User login/authentication endpoint.
    
    Class-based view that delegates to serializer for validation
    and model method for authentication business logic.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request for user login."""
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            # Serializer validates and gets user using model's authenticate_user()
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return standardized success response
            user_serializer = UserSerializer(user)
            return success_response(
                data={
                    'user': user_serializer.data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                message='Login successful.'
            )
        
        # Return standardized error response
        return error_response(
            message='Login failed. Please check your credentials.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    """
    User logout endpoint.
    
    Class-based view that blacklists the refresh token to invalidate the session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle POST request for user logout."""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return success_response(
                    message='Logout successful.'
                )
            else:
                return error_response(
                    message='Refresh token is required.',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return error_response(
                message='Invalid token.',
                status_code=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    """
    Get and update current user profile.
    
    Class-based view that returns and updates authenticated user's information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Handle GET request for user profile."""
        serializer = UserSerializer(request.user)
        return success_response(
            data={'user': serializer.data},
            message='Profile retrieved successfully.'
        )
    
    def put(self, request):
        """Handle PUT request to update user profile."""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            user_serializer = UserSerializer(request.user)
            return success_response(
                data={'user': user_serializer.data},
                message='Profile updated successfully.'
            )
        
        return error_response(
            message='Profile update failed. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class PasswordChangeView(APIView):
    """
    Change user password endpoint.
    
    Class-based view that handles password change.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle POST request to change password."""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return success_response(
                message='Password changed successfully.'
            )
        
        return error_response(
            message='Password change failed. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class SignupOTPVerificationView(APIView):
    """
    Verify OTP and complete user registration.
    
    Class-based view that verifies OTP and creates user account.
    Accepts signup data along with OTP for verification.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request for OTP verification and user creation."""
        # First verify OTP
        otp_serializer = OTPVerificationSerializer(data=request.data)
        
        if not otp_serializer.is_valid():
            return error_response(
                message='OTP verification failed.',
                errors=otp_serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # OTP is verified, now create user with signup data
        # Request should include all signup fields along with OTP
        signup_data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'password_confirm': request.data.get('password_confirm'),
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name'),
        }
        
        signup_serializer = UserSignupSerializer(data=signup_data)
        
        if signup_serializer.is_valid():
            # Create user using model's business logic
            validated_data = signup_serializer.validated_data
            validated_data.pop('password_confirm')
            password = validated_data.pop('password')
            
            user = User.create_user_with_email(
                email=validated_data['email'],
                password=password,
                first_name=validated_data.get('first_name'),
                last_name=validated_data.get('last_name')
            )
            
            # Activate user after OTP verification
            user.is_active = True
            user.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return standardized success response
            user_serializer = UserSerializer(user)
            return success_response(
                data={
                    'user': user_serializer.data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                message='User registered successfully.',
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message='User creation failed. Please check your information.',
            errors=signup_serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ResendOTPView(APIView):
    """
    Resend OTP endpoint.
    
    Class-based view that resends OTP for signup or password reset.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request to resend OTP."""
        serializer = ResendOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_type = serializer.validated_data['otp_type']
            
            # Generate new OTP using model's business logic
            from .models import OTP
            otp = OTP.generate_otp(email, otp_type)
            
            return success_response(
                data={'email': email},
                message='OTP sent successfully. Please check your email.'
            )
        
        return error_response(
            message='Failed to resend OTP. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ForgotPasswordView(APIView):
    """
    Request password reset OTP endpoint.
    
    Class-based view that generates OTP for password reset.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request to send password reset OTP."""
        serializer = ForgotPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Generate OTP using model's business logic
            from .models import OTP
            otp = OTP.generate_otp(email, 'password_reset')
            
            return success_response(
                data={'email': email},
                message='OTP sent to your email. Please check your inbox.'
            )
        
        return error_response(
            message='Failed to send password reset OTP.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class VerifyPasswordResetOTPView(APIView):
    """
    Verify password reset OTP endpoint.
    
    Class-based view that verifies OTP for password reset.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request to verify password reset OTP."""
        serializer = VerifyPasswordResetOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            return success_response(
                data={'email': serializer.validated_data['email']},
                message='OTP verified successfully. You can now reset your password.'
            )
        
        return error_response(
            message='OTP verification failed.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ResetPasswordView(APIView):
    """
    Reset password with OTP verification endpoint.
    
    Class-based view that resets password after OTP verification.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request to reset password with OTP."""
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return success_response(
                message='Password reset successfully. You can now login with your new password.'
            )
        
        return error_response(
            message='Password reset failed. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class VerifyInactiveUserOTPView(APIView):
    """
    Verify OTP for inactive users (users who skipped OTP screen during signup).
    
    This allows users to verify their email and activate their account later.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request to verify OTP for inactive user."""
        serializer = OTPVerificationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message='OTP verification failed.',
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Check if user is already active
            if user.is_active:
                return error_response(
                    message='Your account is already verified. You can login now.',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Activate user after OTP verification
            user.is_active = True
            user.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return standardized success response
            user_serializer = UserSerializer(user)
            return success_response(
                data={
                    'user': user_serializer.data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                message='Email verified successfully. Your account is now active.',
                status_code=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return error_response(
                message='No user found with this email address.',
                status_code=status.HTTP_404_NOT_FOUND
            )
