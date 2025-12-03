from django.db import models
from core.models import BaseDateTimeModel


class Prospect(BaseDateTimeModel):
    class ProspectStatus(models.TextChoices):
        COLD = "cold", "Cold"
        WARM = "warm", "Warm"
        HOT = "hot", "Hot"

    owner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name="prospects")

    # Basic prospect info
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=255, blank=True)

    # Status (Cold, Warm, Hot)
    status = models.CharField(max_length=10, choices=ProspectStatus.choices, default=ProspectStatus.COLD)

    # Intent scoring
    intent_score = models.FloatField(default=0.0, help_text="0-100 score computed by Intent Engine", db_index=True)
    last_scored_at = models.DateTimeField(null=True, blank=True)

    # Enrichment metadata
    is_enriched = models.BooleanField(default=False)
    enrichment_summary = models.TextField(blank=True)

    # Upload source
    source = models.CharField(max_length=50, default="manual")


    class Meta:
        ordering = ["-intent_score", "-updated_at"]


    def __str__(self):
        return f"{self.full_name} @ {self.company_name} ({self.status})"
    
    @classmethod
    def create_prospect(cls, owner, full_name, company_name, title='', email=None, linkedin_url=None, website=None, industry='', status='cold'):
        """
        Business logic: Create a new prospect with validation.
        
        Args:
            owner: User instance who owns this prospect
            full_name: Prospect's full name
            company_name: Company name
            title: Job title (optional)
            email: Email address (optional)
            linkedin_url: LinkedIn URL (optional)
            website: Website URL (optional)
            industry: Industry (optional)
            status: Prospect status (default: 'cold')
        
        Returns:
            Prospect: Created prospect instance
        """
        # Normalize email if provided
        if email:
            email = email.lower().strip() if email else None
        
        # Create and save the prospect
        prospect = cls(
            owner=owner,
            full_name=full_name.strip(),
            company_name=company_name.strip(),
            title=title.strip() if title else '',
            email=email,
            linkedin_url=linkedin_url.strip() if linkedin_url else None,
            website=website.strip() if website else None,
            industry=industry.strip() if industry else '',
            status=status,
            source='manual'
        )
        prospect.save()
        
        return prospect
    
    def update_prospect(self, full_name=None, company_name=None, title=None, email=None, linkedin_url=None, website=None, industry=None, status=None):
        """
        Business logic: Update prospect information.
        
        Args:
            full_name: Updated full name (optional)
            company_name: Updated company name (optional)
            title: Updated job title (optional)
            email: Updated email address (optional)
            linkedin_url: Updated LinkedIn URL (optional)
            website: Updated website URL (optional)
            industry: Updated industry (optional)
            status: Updated prospect status (optional)
        
        Returns:
            Prospect: Updated prospect instance
        """
        if full_name is not None:
            self.full_name = full_name.strip()
        if company_name is not None:
            self.company_name = company_name.strip()
        if title is not None:
            self.title = title.strip() if title else ''
        if email is not None:
            self.email = email.lower().strip() if email else None
        if linkedin_url is not None:
            self.linkedin_url = linkedin_url.strip() if linkedin_url else None
        if website is not None:
            self.website = website.strip() if website else None
        if industry is not None:
            self.industry = industry.strip() if industry else ''
        if status is not None:
            self.status = status
        
        self.save()
        return self

class ProspectEnrichment(BaseDateTimeModel):
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name="enrichments")
    source = models.CharField(max_length=100, help_text="e.g. crunchbase, careers_page, news_scraper")
    data = models.JSONField(default=dict, blank=True)
    confidence = models.FloatField(default=0.0)
    enriched_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        ordering = ["-enriched_at"]


    def __str__(self):
        return f"Enrichment({self.source}) for {self.prospect_id}"

class Signal(BaseDateTimeModel):
    class SignalType(models.TextChoices):
        ENGAGEMENT = "engagement", "Engagement"
        HIRING = "hiring", "Hiring"
        FUNDING = "funding", "Funding"
        NEWS = "news", "News Mention"
        TECHNICAL = "technical", "Tech Stack"
        OTHER = "other", "Other"

    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name="signals")
    signal_type = models.CharField(max_length=30, choices=SignalType.choices)

    # Contribution from this signal
    score = models.FloatField(help_text="Signal strength contribution (positive/negative)")
    absolute_score = models.FloatField(null=True, blank=True, help_text="Absolute intent score after applying this signal (0-100)")

    reason = models.TextField(blank=True)
    source = models.CharField(max_length=100, help_text="Which integration/check created this signal")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]


    def __str__(self):
        return f"Signal({self.signal_type}) for {self.prospect_id}"