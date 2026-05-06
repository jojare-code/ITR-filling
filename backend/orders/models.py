import uuid
from django.db import models
from django.conf import settings
from plans.models import ServicePlan

class OrderStatus(models.TextChoices):
    PENDING_PAYMENT = 'pending_payment', 'Pending Payment'
    DOCUMENTS_PENDING = 'documents_pending', 'Documents Pending'
    PROCESSING = 'processing', 'Processing'
    QUERY_RAISED = 'query_raised', 'Query Raised'
    REVIEW = 'review', 'Review'
    COMPLETED = 'completed', 'Completed'

class FinancialYear(models.TextChoices):
    FY_2024_25 = 'FY2024-25', 'FY 2024-25'
    FY_2025_26 = 'FY2025-26', 'FY 2025-26'

class EntityType(models.TextChoices):
    INDIVIDUAL = 'individual', 'Individual'
    NRI = 'nri', 'NRI'
    PARTNERSHIP = 'partnership', 'Partnership'
    PVT_LTD = 'pvt_ltd', 'Pvt Ltd'
    PUBLIC_LTD = 'public_ltd', 'Public Ltd'
    TRUST_AOP_BOI = 'trust_aop_boi', 'Trust-AOP-BOI'

class ReturnType(models.TextChoices):
    ORIGINAL = 'original', 'Original'
    REVISED = 'revised', 'Revised'

class WorkOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    service = models.ForeignKey(ServicePlan, on_delete=models.RESTRICT, related_name='orders')
    status = models.CharField(max_length=50, choices=OrderStatus.choices, default=OrderStatus.PENDING_PAYMENT)
    
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_orders'
    )
    
    financial_year = models.CharField(max_length=20, choices=FinancialYear.choices, default=FinancialYear.FY_2024_25)
    entity_type = models.CharField(max_length=50, choices=EntityType.choices, default=EntityType.INDIVIDUAL)
    income_types = models.JSONField(default=list)
    original_or_revised = models.CharField(max_length=20, choices=ReturnType.choices, default=ReturnType.ORIGINAL)
    it_portal_upload_consent = models.BooleanField(default=False)
    
    final_price = models.DecimalField(max_digits=10, decimal_places=2) # Captured at time of order
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.client.email}"


class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Verification'
    VERIFIED = 'verified', 'Verified'
    REJECTED = 'rejected', 'Rejected'

class PaymentMethod(models.TextChoices):
    GPAY = 'gpay', 'Google Pay'
    BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'

class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(WorkOrder, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PaymentMethod.choices, default=PaymentMethod.GPAY)
    utr_number = models.CharField(max_length=100)
    status = models.CharField(max_length=50, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    proof_url = models.URLField(max_length=1024, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.utr_number} - {self.status}"
