import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    OWNER = 'owner', _('Owner')
    STAFF = 'staff', _('Staff')
    CLIENT = 'client', _('Client')

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20, 
        choices=UserRole.choices, 
        default=UserRole.CLIENT
    )
    name = models.CharField(max_length=255)
    mobile_no = models.CharField(max_length=15, blank=True, null=True)
    google_account = models.CharField(max_length=255, blank=True, null=True)
    registered_by = models.UUIDField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.email} - {self.role}"

class TaxRegime(models.TextChoices):
    NEW = 'new', _('New Regime')
    OLD = 'old', _('Old Regime')

class ClientProfile(models.fields.related.OneToOneField):
    pass # Needs to be models.Model

class ClientProfile(models.Model):
    profile_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    
    # Encrypted fields will be handled via application layer encryption logic
    pan_number = models.CharField(max_length=255) 
    aadhaar_encrypted = models.CharField(max_length=512, blank=True, null=True)
    aadhaar_consent = models.BooleanField(default=False)
    
    fathers_name = models.CharField(max_length=255, blank=True, null=True)
    residential_address = models.TextField()
    
    tax_regime = models.CharField(
        max_length=10,
        choices=TaxRegime.choices,
        default=TaxRegime.NEW
    )
    
    bank_details_encrypted = models.TextField() # JSON string encrypted
    it_portal_password_vault = models.TextField() # AES-256 encrypted
    
    data_consent_accepted = models.BooleanField(default=False)
    privacy_policy_version = models.CharField(max_length=50)

    def __str__(self):
        return f"Profile for {self.user.email}"
