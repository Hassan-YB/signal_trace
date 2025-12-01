"""
User Serializers for API

ARCHITECTURE NOTE:
==================
Serializers handle:
- Data validation (input/output)
- Data transformation
- Field serialization/deserialization

Business logic should remain in models. Serializers validate and transform data,
then delegate to model methods for actual operations.

All API responses use standardized structure via utils.py (success_response/error_response).
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import OTP

User = get_user_model()


class UserSignupSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration/signup.
    
    Handles validation and data transformation for signup.
    Delegates actual user creation to User.create_user_with_email() model method.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True}
        }
    
    def validate_email(self, value):
        """Validate email format and uniqueness."""
        value = value.lower().strip() if value else None
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        """
        Generate OTP for signup instead of creating user immediately.
        
        User will be created after OTP verification.
        """
        # Store signup data in context for later use
        self.signup_data = validated_data.copy()
        
        # Generate OTP using model's business logic
        otp = OTP.generate_otp(
            email=validated_data['email'],
            otp_type='signup'
        )
        
        # Return a dict with email to indicate OTP was sent
        return {'email': validated_data['email'], 'otp_id': otp.id}


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login/authentication.
    
    Validates login credentials and delegates authentication
    to model's authenticate_user() method.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_email(self, value):
        """Normalize email."""
        return value.lower().strip() if value else None
    
    def validate(self, attrs):
        """Validate credentials using model's business logic."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        # Check if user is active first (before password check for better UX)
        if not user.is_active:
            raise serializers.ValidationError({
                "non_field_errors": ["Your account is not verified. Please verify your email with the OTP code sent to your email address."],
                "requires_verification": True
            })
        
        # Use model method for authentication business logic
        if not user.authenticate_user(password):
            raise serializers.ValidationError("Invalid email or password.")
        
        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data representation.
    
    Used for returning user information in API responses.
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'date_joined', 'is_active')
        read_only_fields = ('id', 'date_joined', 'is_active')


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile information.
    
    Allows updating first_name, last_name, and email.
    """
    email = serializers.EmailField(required=False)
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name')
    
    def validate_email(self, value):
        """Validate email format and uniqueness."""
        value = value.lower().strip() if value else None
        if value and User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def update(self, instance, validated_data):
        """Update user profile information."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    
    Validates old password and sets new password.
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        return attrs
    
    def save(self):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class OTPVerificationSerializer(serializers.Serializer):
    """
    Serializer for verifying OTP during signup.
    """
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)
    
    def validate_email(self, value):
        """Normalize email."""
        return value.lower().strip() if value else None
    
    def validate(self, attrs):
        """Verify OTP using model's business logic."""
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        
        success, otp = OTP.verify_otp(email, otp_code, 'signup')
        
        if not success:
            raise serializers.ValidationError("Invalid or expired OTP code.")
        
        attrs['otp'] = otp
        return attrs


class ResendOTPSerializer(serializers.Serializer):
    """
    Serializer for resending OTP.
    """
    email = serializers.EmailField(required=True)
    otp_type = serializers.ChoiceField(choices=['signup', 'password_reset'], required=True)
    
    def validate_email(self, value):
        """Normalize email."""
        return value.lower().strip() if value else None
    
    def validate(self, attrs):
        """Validate email exists for the given OTP type."""
        email = attrs.get('email')
        otp_type = attrs.get('otp_type')
        
        if otp_type == 'signup':
            # For signup, check if active user already exists
            # Allow if user exists but is inactive (for verification resend)
            active_user = User.objects.filter(email=email, is_active=True).exists()
            if active_user:
                raise serializers.ValidationError("User with this email already exists and is verified.")
        elif otp_type == 'password_reset':
            # For password reset, check if user exists
            if not User.objects.filter(email=email).exists():
                raise serializers.ValidationError("No user found with this email address.")
        
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for requesting password reset OTP.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Normalize email and check if user exists."""
        value = value.lower().strip() if value else None
        if not value:
            raise serializers.ValidationError("Email is required.")
        
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        
        return value


class VerifyPasswordResetOTPSerializer(serializers.Serializer):
    """
    Serializer for verifying password reset OTP.
    """
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)
    
    def validate_email(self, value):
        """Normalize email."""
        return value.lower().strip() if value else None
    
    def validate(self, attrs):
        """Verify OTP using model's business logic."""
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        
        success, otp = OTP.verify_otp(email, otp_code, 'password_reset')
        
        if not success:
            raise serializers.ValidationError("Invalid or expired OTP code.")
        
        attrs['otp'] = otp
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting password with OTP verification.
    """
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)
    password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_email(self, value):
        """Normalize email."""
        return value.lower().strip() if value else None
    
    def validate(self, attrs):
        """Validate passwords match and OTP is valid."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        
        # Verify OTP
        success, otp = OTP.verify_otp(email, otp_code, 'password_reset')
        
        if not success:
            raise serializers.ValidationError({"otp_code": "Invalid or expired OTP code."})
        
        attrs['otp'] = otp
        return attrs
    
    def save(self):
        """Reset user password."""
        email = self.validated_data['email']
        password = self.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User not found."})

