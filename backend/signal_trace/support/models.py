from django.db import models
from core.models import BaseDateTimeModel


class ContactMessage(BaseDateTimeModel):
    """
    Model for storing contact form submissions.
    
    Business logic methods handle data validation and creation.
    """
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True)
    message = models.TextField()
    
    # Status tracking
    is_read = models.BooleanField(default=False)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
    
    def __str__(self):
        return f"Contact from {self.first_name} {self.last_name} ({self.email})"
    
    @classmethod
    def create_contact_message(cls, first_name, last_name, email, message, phone_number=''):
        """
        Business logic: Create a new contact message with validation.
        
        Args:
            first_name: Contact's first name
            last_name: Contact's last name
            email: Contact's email address
            message: Contact's message
            phone_number: Optional phone number
        
        Returns:
            ContactMessage: Created contact message instance
        """
        # Normalize email
        email = email.lower().strip() if email else None
        
        # Create and save the contact message
        contact_message = cls(
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            email=email,
            phone_number=phone_number.strip() if phone_number else '',
            message=message.strip()
        )
        contact_message.save()
        
        return contact_message
    
    def mark_as_read(self):
        """Mark the contact message as read."""
        self.is_read = True
        self.save()
    
    def mark_as_responded(self):
        """Mark the contact message as responded to."""
        from django.utils import timezone
        self.is_read = True
        self.responded_at = timezone.now()
        self.save()
