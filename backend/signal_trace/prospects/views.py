"""
API Views for Prospects

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
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .serializers import ProspectSerializer
from .models import Prospect
from users.utils import success_response, error_response


class ProspectListView(APIView):
    """
    List all prospects for the authenticated user and create new prospects.
    
    Class-based view that delegates to serializer for validation
    and model method for business logic.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Handle GET request to list all prospects for the authenticated user."""
        prospects = Prospect.objects.filter(owner=request.user)
        serializer = ProspectSerializer(prospects, many=True)
        
        return success_response(
            data={'prospects': serializer.data},
            message='Prospects retrieved successfully.'
        )
    
    def post(self, request):
        """Handle POST request to create a new prospect."""
        serializer = ProspectSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Serializer delegates to model's create_prospect() method
            prospect = serializer.save()
            
            # Return standardized success response
            prospect_serializer = ProspectSerializer(prospect)
            return success_response(
                data={'prospect': prospect_serializer.data},
                message='Prospect created successfully.',
                status_code=status.HTTP_201_CREATED
            )
        
        # Return standardized error response
        return error_response(
            message='Failed to create prospect. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ProspectDetailView(APIView):
    """
    Retrieve, update, or delete a specific prospect.
    
    Class-based view that delegates to serializer for validation
    and model method for business logic.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Handle GET request to retrieve a specific prospect."""
        prospect = get_object_or_404(Prospect, pk=pk, owner=request.user)
        serializer = ProspectSerializer(prospect)
        
        return success_response(
            data={'prospect': serializer.data},
            message='Prospect retrieved successfully.'
        )
    
    def put(self, request, pk):
        """Handle PUT request to update a prospect."""
        prospect = get_object_or_404(Prospect, pk=pk, owner=request.user)
        serializer = ProspectSerializer(prospect, data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Serializer delegates to model's update_prospect() method
            prospect = serializer.save()
            
            # Return standardized success response
            prospect_serializer = ProspectSerializer(prospect)
            return success_response(
                data={'prospect': prospect_serializer.data},
                message='Prospect updated successfully.'
            )
        
        # Return standardized error response
        return error_response(
            message='Failed to update prospect. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    def patch(self, request, pk):
        """Handle PATCH request to partially update a prospect."""
        prospect = get_object_or_404(Prospect, pk=pk, owner=request.user)
        serializer = ProspectSerializer(prospect, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            # Serializer delegates to model's update_prospect() method
            prospect = serializer.save()
            
            # Return standardized success response
            prospect_serializer = ProspectSerializer(prospect)
            return success_response(
                data={'prospect': prospect_serializer.data},
                message='Prospect updated successfully.'
            )
        
        # Return standardized error response
        return error_response(
            message='Failed to update prospect. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    def delete(self, request, pk):
        """Handle DELETE request to delete a prospect."""
        prospect = get_object_or_404(Prospect, pk=pk, owner=request.user)
        prospect.delete()
        
        return success_response(
            message='Prospect deleted successfully.'
        )
