"""
API Views for Contact Messages

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
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import ContactMessageSerializer
from users.utils import success_response, error_response


class ContactMessageView(APIView):
    """
    Contact form submission endpoint.
    
    Class-based view that delegates to serializer for validation
    and model method for business logic.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request for contact form submission."""
        serializer = ContactMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            # Serializer delegates to model's create_contact_message() method
            contact_message = serializer.save()
            
            # Return standardized success response
            return success_response(
                data={
                    'id': contact_message.id,
                    'message': 'Your message has been received. We will get back to you soon.'
                },
                message='Contact message submitted successfully.',
                status_code=status.HTTP_201_CREATED
            )
        
        # Return standardized error response
        return error_response(
            message='Failed to submit contact message. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
