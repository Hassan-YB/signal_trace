"""
Django Admin configuration for Prospect models.

Provides a comprehensive admin interface for managing prospects with:
- Custom list display and filters
- Search functionality
- Organized fieldsets
- Bulk actions
- User-friendly interface using Unfold
"""

from django.contrib import admin
from unfold.admin import ModelAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import Prospect, ProspectEnrichment, Signal


@admin.register(Prospect)
class ProspectAdmin(ModelAdmin):
    """
    Admin interface for Prospect model.
    
    Provides admin interface for viewing and managing prospects.
    """
    
    # Unfold configuration
    icon_name = "people"
    
    # List display configuration
    list_display = (
        'full_name',
        'company_name',
        'title_display',
        'email_display',
        'status_display',
        'intent_score_display',
        'is_enriched_display',
        'owner',
        'created_at',
    )
    
    list_filter = (
        'status',
        'is_enriched',
        'source',
        'created_at',
        'updated_at',
        'owner',
    )
    
    search_fields = (
        'full_name',
        'company_name',
        'email',
        'title',
        'industry',
        'owner__email',
        'owner__first_name',
        'owner__last_name',
    )
    
    readonly_fields = (
        'intent_score',
        'last_scored_at',
        'is_enriched',
        'enrichment_summary',
        'source',
        'created_at',
        'updated_at',
    )
    
    date_hierarchy = 'created_at'
    
    ordering = ('-intent_score', '-updated_at')
    
    # Fieldsets for add/edit forms
    fieldsets = (
        ('Owner', {
            'fields': ('owner',)
        }),
        ('Basic Information', {
            'fields': (
                'full_name',
                'company_name',
                'title',
                'email',
                'industry',
            )
        }),
        ('Contact & Links', {
            'fields': (
                'linkedin_url',
                'website',
            )
        }),
        ('Status & Scoring', {
            'fields': (
                'status',
                'intent_score',
                'last_scored_at',
            )
        }),
        ('Enrichment', {
            'fields': (
                'is_enriched',
                'enrichment_summary',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'source',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Actions
    actions = ['mark_as_hot', 'mark_as_warm', 'mark_as_cold']
    
    def title_display(self, obj):
        """Display title or dash if empty."""
        return obj.title if obj.title else "-"
    title_display.short_description = "Title"
    
    def email_display(self, obj):
        """Display email or dash if empty."""
        return obj.email if obj.email else "-"
    email_display.short_description = "Email"
    
    def status_display(self, obj):
        """Display status with color coding."""
        colors = {
            'hot': ('red', 'Hot'),
            'warm': ('orange', 'Warm'),
            'cold': ('blue', 'Cold'),
        }
        color, label = colors.get(obj.status, ('gray', obj.status))
        return format_html(
            '<span style="color: {}; font-weight: bold;">● {}</span>',
            color,
            label
        )
    status_display.short_description = "Status"
    status_display.admin_order_field = 'status'
    
    def intent_score_display(self, obj):
        """Display intent score with color coding."""
        score = obj.intent_score
        if score >= 70:
            color = 'green'
        elif score >= 40:
            color = 'orange'
        else:
            color = 'gray'
        score_formatted = f'{score:.1f}'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            score_formatted
        )
    intent_score_display.short_description = "Intent Score"
    intent_score_display.admin_order_field = 'intent_score'
    
    def is_enriched_display(self, obj):
        """Display enrichment status."""
        if obj.is_enriched:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Enriched</span>'
            )
        return format_html(
            '<span style="color: gray;">Not enriched</span>'
        )
    is_enriched_display.short_description = "Enriched"
    is_enriched_display.admin_order_field = 'is_enriched'
    
    @admin.action(description='Mark selected prospects as Hot')
    def mark_as_hot(self, request, queryset):
        """Bulk action to mark prospects as hot."""
        updated = queryset.update(status='hot')
        self.message_user(
            request,
            f'{updated} prospect(s) were successfully marked as Hot.'
        )
    
    @admin.action(description='Mark selected prospects as Warm')
    def mark_as_warm(self, request, queryset):
        """Bulk action to mark prospects as warm."""
        updated = queryset.update(status='warm')
        self.message_user(
            request,
            f'{updated} prospect(s) were successfully marked as Warm.'
        )
    
    @admin.action(description='Mark selected prospects as Cold')
    def mark_as_cold(self, request, queryset):
        """Bulk action to mark prospects as cold."""
        updated = queryset.update(status='cold')
        self.message_user(
            request,
            f'{updated} prospect(s) were successfully marked as Cold.'
        )
    
    def get_queryset(self, request):
        """Optimize queryset."""
        qs = super().get_queryset(request)
        return qs.select_related('owner')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filter owner field to show only active users."""
        if db_field.name == "owner":
            kwargs["queryset"] = db_field.related_model.objects.filter(is_active=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(ProspectEnrichment)
class ProspectEnrichmentAdmin(ModelAdmin):
    """
    Admin interface for ProspectEnrichment model.
    
    Provides admin interface for viewing enrichment data for prospects.
    """
    
    # Unfold configuration
    icon_name = "database"
    
    list_display = (
        'prospect_link',
        'source',
        'confidence_display',
        'enriched_at',
        'created_at',
    )
    
    list_filter = (
        'source',
        'enriched_at',
        'created_at',
    )
    
    search_fields = (
        'prospect__full_name',
        'prospect__company_name',
        'source',
    )
    
    readonly_fields = (
        'prospect',
        'source',
        'data',
        'confidence',
        'enriched_at',
        'created_at',
        'updated_at',
    )
    
    ordering = ('-enriched_at',)
    
    fieldsets = (
        ('Prospect', {
            'fields': ('prospect',)
        }),
        ('Enrichment Data', {
            'fields': (
                'source',
                'confidence',
                'data',
            )
        }),
        ('Timestamps', {
            'fields': (
                'enriched_at',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def prospect_link(self, obj):
        """Display link to prospect."""
        url = reverse('admin:prospects_prospect_change', args=[obj.prospect.id])
        return format_html('<a href="{}">{}</a>', url, obj.prospect)
    prospect_link.short_description = "Prospect"
    prospect_link.admin_order_field = 'prospect__full_name'
    
    def confidence_display(self, obj):
        """Display confidence with color coding."""
        confidence = obj.confidence
        if confidence >= 0.8:
            color = 'green'
        elif confidence >= 0.5:
            color = 'orange'
        else:
            color = 'red'
        confidence_formatted = f'{confidence:.1%}'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            confidence_formatted
        )
    confidence_display.short_description = "Confidence"
    confidence_display.admin_order_field = 'confidence'
    
    def has_add_permission(self, request):
        """Disable adding enrichments manually through admin."""
        return False
    
    def get_queryset(self, request):
        """Optimize queryset."""
        qs = super().get_queryset(request)
        return qs.select_related('prospect')


@admin.register(Signal)
class SignalAdmin(ModelAdmin):
    """
    Admin interface for Signal model.
    
    Provides admin interface for viewing signals associated with prospects.
    """
    
    # Unfold configuration
    icon_name = "notifications"
    
    list_display = (
        'prospect_link',
        'signal_type_display',
        'score_display',
        'absolute_score_display',
        'source',
        'created_at',
    )
    
    list_filter = (
        'signal_type',
        'source',
        'created_at',
    )
    
    search_fields = (
        'prospect__full_name',
        'prospect__company_name',
        'reason',
        'source',
    )
    
    readonly_fields = (
        'prospect',
        'signal_type',
        'score',
        'absolute_score',
        'reason',
        'source',
        'metadata',
        'created_at',
        'updated_at',
    )
    
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Prospect', {
            'fields': ('prospect',)
        }),
        ('Signal Information', {
            'fields': (
                'signal_type',
                'source',
                'reason',
            )
        }),
        ('Scoring', {
            'fields': (
                'score',
                'absolute_score',
            )
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def prospect_link(self, obj):
        """Display link to prospect."""
        url = reverse('admin:prospects_prospect_change', args=[obj.prospect.id])
        return format_html('<a href="{}">{}</a>', url, obj.prospect)
    prospect_link.short_description = "Prospect"
    prospect_link.admin_order_field = 'prospect__full_name'
    
    def signal_type_display(self, obj):
        """Display signal type with color coding."""
        colors = {
            'engagement': 'blue',
            'hiring': 'green',
            'funding': 'purple',
            'news': 'orange',
            'technical': 'teal',
            'other': 'gray',
        }
        color = colors.get(obj.signal_type, 'gray')
        label = obj.get_signal_type_display()
        return format_html(
            '<span style="color: {}; font-weight: bold;">● {}</span>',
            color,
            label
        )
    signal_type_display.short_description = "Type"
    signal_type_display.admin_order_field = 'signal_type'
    
    def score_display(self, obj):
        """Display score with color coding."""
        score = obj.score
        if score > 0:
            color = 'green'
            prefix = '+'
        elif score < 0:
            color = 'red'
            prefix = ''
        else:
            color = 'gray'
            prefix = ''
        score_formatted = f'{prefix}{score:.2f}'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            score_formatted
        )
    score_display.short_description = "Score"
    score_display.admin_order_field = 'score'
    
    def absolute_score_display(self, obj):
        """Display absolute score or dash if not set."""
        if obj.absolute_score is not None:
            score_formatted = f'{obj.absolute_score:.1f}'
            return format_html(
                '<span style="font-weight: bold;">{}</span>',
                score_formatted
            )
        return "-"
    absolute_score_display.short_description = "Absolute Score"
    absolute_score_display.admin_order_field = 'absolute_score'
    
    def has_add_permission(self, request):
        """Disable adding signals manually through admin."""
        return False
    
    def get_queryset(self, request):
        """Optimize queryset."""
        qs = super().get_queryset(request)
        return qs.select_related('prospect')
