"""
Prospect Serializers for API

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
from .models import Prospect


class ProspectSerializer(serializers.ModelSerializer):
    """
    Serializer for prospect operations.
    
    Handles validation and data transformation for prospects.
    Delegates actual creation/update to Prospect model methods.
    """
    
    class Meta:
        model = Prospect
        fields = (
            'id',
            'full_name',
            'company_name',
            'title',
            'email',
            'linkedin_url',
            'website',
            'industry',
            'status',
            'intent_score',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'intent_score', 'created_at', 'updated_at')
        extra_kwargs = {
            'full_name': {'required': True},
            'company_name': {'required': True},
            'title': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True, 'allow_null': True},
            'linkedin_url': {'required': False, 'allow_blank': True, 'allow_null': True},
            'website': {'required': False, 'allow_blank': True, 'allow_null': True},
            'industry': {'required': False, 'allow_blank': True},
            'status': {'required': False},
        }
    
    def validate_full_name(self, value):
        """Validate full name."""
        if not value or not value.strip():
            raise serializers.ValidationError("Full name is required.")
        return value.strip()
    
    def validate_company_name(self, value):
        """Validate company name."""
        if not value or not value.strip():
            raise serializers.ValidationError("Company name is required.")
        return value.strip()
    
    def validate_email(self, value):
        """Validate email format."""
        if value:
            value = value.lower().strip()
        return value if value else None
    
    def validate_status(self, value):
        """Validate status choice."""
        if value and value not in [choice[0] for choice in Prospect.ProspectStatus.choices]:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join([choice[0] for choice in Prospect.ProspectStatus.choices])}")
        return value or 'cold'
    
    def create(self, validated_data):
        """
        Create prospect using model's business logic.
        
        Delegates to Prospect.create_prospect() for actual creation.
        """
        owner = self.context['request'].user
        return Prospect.create_prospect(
            owner=owner,
            full_name=validated_data['full_name'],
            company_name=validated_data['company_name'],
            title=validated_data.get('title', ''),
            email=validated_data.get('email'),
            linkedin_url=validated_data.get('linkedin_url'),
            website=validated_data.get('website'),
            industry=validated_data.get('industry', ''),
            status=validated_data.get('status', 'cold')
        )
    
    def update(self, instance, validated_data):
        """
        Update prospect using model's business logic.
        
        Delegates to Prospect.update_prospect() for actual update.
        """
        instance.update_prospect(
            full_name=validated_data.get('full_name'),
            company_name=validated_data.get('company_name'),
            title=validated_data.get('title'),
            email=validated_data.get('email'),
            linkedin_url=validated_data.get('linkedin_url'),
            website=validated_data.get('website'),
            industry=validated_data.get('industry'),
            status=validated_data.get('status')
        )
        return instance

