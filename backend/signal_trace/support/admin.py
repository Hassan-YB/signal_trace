"""
Django Admin configuration for ContactMessage model.

Provides a comprehensive admin interface for managing contact form submissions with:
- Custom list display and filters
- Search functionality
- Organized fieldsets
- Bulk actions (mark as read/unread, mark as responded)
- User-friendly interface using Unfold
"""

from django.contrib import admin
from unfold.admin import ModelAdmin
from django.utils.html import format_html

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    """
    Admin interface for ContactMessage model.
    
    Provides admin interface for viewing and managing contact form submissions.
    """
    
    # Unfold configuration
    icon_name = "mail"
    
    # List display configuration
    list_display = (
        'full_name_display',
        'email',
        'phone_number_display',
        'message_preview',
        'is_read_display',
        'responded_at_display',
        'created_at',
    )
    
    list_filter = (
        'is_read',
        'created_at',
        'responded_at',
    )
    
    search_fields = (
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'message',
    )
    
    readonly_fields = (
        'created_at',
        'updated_at',
        'responded_at',
    )
    
    date_hierarchy = 'created_at'
    
    ordering = ('-created_at',)
    
    # Fieldsets for add/edit forms
    fieldsets = (
        ('Contact Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number')
        }),
        ('Message', {
            'fields': ('message',)
        }),
        ('Status', {
            'fields': ('is_read', 'responded_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Actions
    actions = ['mark_as_read', 'mark_as_unread', 'mark_as_responded']
    
    def full_name_display(self, obj):
        """Display contact's full name."""
        return f"{obj.first_name} {obj.last_name}".strip()
    full_name_display.short_description = "Name"
    full_name_display.admin_order_field = 'first_name'
    
    def phone_number_display(self, obj):
        """Display phone number or dash if empty."""
        return obj.phone_number if obj.phone_number else "-"
    phone_number_display.short_description = "Phone"
    
    def message_preview(self, obj):
        """Display a preview of the message (first 50 characters)."""
        if obj.message:
            preview = obj.message[:50]
            if len(obj.message) > 50:
                preview += "..."
            return preview
        return "-"
    message_preview.short_description = "Message Preview"
    
    def is_read_display(self, obj):
        """Display read status with color coding."""
        if obj.is_read:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Read</span>'
            )
        return format_html(
            '<span style="color: orange; font-weight: bold;">● Unread</span>'
        )
    is_read_display.short_description = "Status"
    is_read_display.admin_order_field = 'is_read'
    
    def responded_at_display(self, obj):
        """Display responded date or dash if not responded."""
        if obj.responded_at:
            return obj.responded_at.strftime('%Y-%m-%d %H:%M')
        return format_html('<span style="color: gray;">Not responded</span>')
    responded_at_display.short_description = "Responded"
    responded_at_display.admin_order_field = 'responded_at'
    
    @admin.action(description='Mark selected messages as read')
    def mark_as_read(self, request, queryset):
        """Bulk action to mark messages as read."""
        updated = queryset.update(is_read=True)
        self.message_user(
            request,
            f'{updated} message(s) were successfully marked as read.'
        )
    
    @admin.action(description='Mark selected messages as unread')
    def mark_as_unread(self, request, queryset):
        """Bulk action to mark messages as unread."""
        updated = queryset.update(is_read=False)
        self.message_user(
            request,
            f'{updated} message(s) were successfully marked as unread.'
        )
    
    @admin.action(description='Mark selected messages as responded')
    def mark_as_responded(self, request, queryset):
        """Bulk action to mark messages as responded."""
        from django.utils import timezone
        updated = queryset.update(
            is_read=True,
            responded_at=timezone.now()
        )
        self.message_user(
            request,
            f'{updated} message(s) were successfully marked as responded.'
        )
    
    def has_add_permission(self, request):
        """Disable adding contact messages manually through admin."""
        return False
    
    def get_queryset(self, request):
        """Optimize queryset."""
        qs = super().get_queryset(request)
        return qs.select_related()
