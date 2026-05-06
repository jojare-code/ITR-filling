import uuid
from django.db import models

class ServicePlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    # Store the required documents as a JSON list (e.g. ["Form 16", "Capital Gains Statement"])
    required_documents = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - ₹{self.base_price}"

class DiscountType(models.TextChoices):
    PERCENTAGE = 'percentage', 'Percentage'
    FIXED = 'fixed', 'Fixed Amount'

class Discount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(
        max_length=20, 
        choices=DiscountType.choices, 
        default=DiscountType.PERCENTAGE
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    valid_until = models.DateTimeField(null=True, blank=True)
    max_uses = models.IntegerField(default=1)
    current_uses = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True)

    def is_valid(self):
        from django.utils import timezone
        if not self.is_active:
            return False
        if self.max_uses > 0 and self.current_uses >= self.max_uses:
            return False
        if self.valid_until and timezone.now() > self.valid_until:
            return False
        return True

    def __str__(self):
        return f"{self.code} ({self.discount_value} {self.discount_type})"
