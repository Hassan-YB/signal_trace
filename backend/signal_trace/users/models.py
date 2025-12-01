"""
User Model with Business Logic

ARCHITECTURE NOTE:
==================
This project follows Django best practices where:
- Business logic is handled in models (methods, managers, properties)
- Serializers handle data validation and transformation
- Views are CLASS-BASED and contain minimal code, primarily delegating to models and serializers
- All API responses follow a standardized structure (see utils.py)
- This ensures separation of concerns and makes code more maintainable and testable
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from core.models import BaseDateTimeModel
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    
    Business logic methods are defined here to keep views minimal.
    All user-related operations should be handled through model methods.
    """
    
    def __str__(self):
        return self.email or self.username
    
    def clean(self):
        """Validate user data before saving."""
        super().clean()
        if self.email:
            self.email = self.email.lower().strip()
    
    def save(self, *args, **kwargs):
        """Override save to ensure email is normalized."""
        self.full_clean()
        if self.email:
            self.email = self.email.lower().strip()
        super().save(*args, **kwargs)
    
    @classmethod
    def create_user_with_email(cls, email, password, first_name=None, last_name=None, **extra_fields):
        """
        Business logic: Create a new user with email authentication.
        
        This method encapsulates the user creation logic, ensuring:
        - Email is normalized
        - Username is set from email if not provided
        - User is created with proper defaults
        
        Args:
            email: User's email address (required)
            password: User's password (required)
            first_name: User's first name (optional)
            last_name: User's last name (optional)
            **extra_fields: Additional user fields
        
        Returns:
            User instance
        
        Raises:
            ValidationError: If email is invalid or user already exists
        """
        email = email.lower().strip() if email else None
        
        if not email:
            raise ValidationError("Email is required")
        
        # Check if user with this email already exists
        if cls.objects.filter(email=email).exists():
            raise ValidationError("A user with this email already exists.")
        
        # Set username from email if not provided
        if not extra_fields.get('username'):
            extra_fields['username'] = email
        
        # Set is_active=False by default - user must verify OTP to activate account
        if 'is_active' not in extra_fields:
            extra_fields['is_active'] = False
        
        user = cls(
            email=email,
            first_name=first_name or '',
            last_name=last_name or '',
            **extra_fields
        )
        user.set_password(password)
        user.save()
        return user
    
    def authenticate_user(self, password):
        """
        Business logic: Authenticate user with password.
        
        Args:
            password: Plain text password to check
        
        Returns:
            bool: True if password is correct, False otherwise
        """
        return self.check_password(password) and self.is_active


class OTP(BaseDateTimeModel):
    """
    OTP Model for email verification and password reset.
    
    Stores OTP codes for signup verification and password reset flows.
    Uses fixed OTP code "123456" for now (will integrate email service later).
    """
    OTP_TYPE_CHOICES = [
        ('signup', 'Signup'),
        ('password_reset', 'Password Reset'),
    ]
    
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE_CHOICES)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'otp_type', 'is_verified']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.otp_type} - {self.otp_code}"
    
    def is_expired(self):
        """Check if OTP has expired."""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if OTP is valid (not expired and not verified)."""
        return not self.is_expired() and not self.is_verified
    
    @classmethod
    def generate_otp(cls, email, otp_type):
        """
        Business logic: Generate and store OTP for email.
        
        For now, uses fixed OTP code "123456". Will integrate email service later.
        
        Args:
            email: User's email address
            otp_type: Type of OTP ('signup' or 'password_reset')
        
        Returns:
            OTP instance
        """
        email = email.lower().strip()
        
        # Invalidate any existing unverified OTPs for this email and type
        cls.objects.filter(
            email=email,
            otp_type=otp_type,
            is_verified=False
        ).update(is_verified=True)
        
        # Fixed OTP code for now
        otp_code = "123456"
        
        # OTP expires in 10 minutes
        expires_at = timezone.now() + timedelta(minutes=10)
        
        otp = cls.objects.create(
            email=email,
            otp_code=otp_code,
            otp_type=otp_type,
            expires_at=expires_at
        )
        
        # TODO: Send OTP via email service
        # For now, we just store it with fixed code
        
        return otp
    
    @classmethod
    def verify_otp(cls, email, otp_code, otp_type):
        """
        Business logic: Verify OTP code.
        
        Args:
            email: User's email address
            otp_code: OTP code to verify
            otp_type: Type of OTP ('signup' or 'password_reset')
        
        Returns:
            tuple: (success: bool, otp_instance: OTP or None)
        """
        email = email.lower().strip()
        
        try:
            otp = cls.objects.filter(
                email=email,
                otp_type=otp_type,
                is_verified=False
            ).latest('created_at')
            
            if not otp.is_valid():
                return False, None
            
            if otp.otp_code != otp_code:
                return False, None
            
            # Mark as verified
            otp.is_verified = True
            otp.save()
            
            return True, otp
            
        except cls.DoesNotExist:
            return False, None