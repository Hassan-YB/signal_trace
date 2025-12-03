"""
Contact Message Serializers for API

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
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for contact form submissions.
    
    Handles validation and data transformation for contact messages.
    Delegates actual creation to ContactMessage.create_contact_message() model method.
    """
    
    class Meta:
        model = ContactMessage
        fields = ('first_name', 'last_name', 'email', 'phone_number', 'message')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'message': {'required': True},
            'phone_number': {'required': False, 'allow_blank': True}
        }
    
    def validate_email(self, value):
        """Validate email format."""
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value.lower().strip()
    
    def validate_first_name(self, value):
        """Validate first name."""
        if not value or not value.strip():
            raise serializers.ValidationError("First name is required.")
        return value.strip()
    
    def validate_last_name(self, value):
        """Validate last name."""
        if not value or not value.strip():
            raise serializers.ValidationError("Last name is required.")
        return value.strip()
    
    def validate_message(self, value):
        """Validate message."""
        if not value or not value.strip():
            raise serializers.ValidationError("Message is required.")
        return value.strip()
    
    def create(self, validated_data):
        """
        Create contact message using model's business logic.
        
        Delegates to ContactMessage.create_contact_message() for actual creation.
        """
        return ContactMessage.create_contact_message(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            message=validated_data['message'],
            phone_number=validated_data.get('phone_number', '')
        )

