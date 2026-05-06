import uuid
from django.db import models
from django.conf import settings
from orders.models import WorkOrder
from documents.models import Document

class DeliveryStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'

class DeliveryType(models.TextChoices):
    PORTAL_UPLOAD = 'portal_upload', 'Portal Upload'
    XML_DELIVERY = 'xml_delivery', 'XML Delivery'

class WorkDelivery(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='deliveries')
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submitted_deliveries')
    
    approval_status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_deliveries'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    delivery_type = models.CharField(max_length=50, choices=DeliveryType.choices, default=DeliveryType.PORTAL_UPLOAD)
    
    # Store references to documents uploaded by staff as final output
    final_documents = models.ManyToManyField(Document, related_name='delivery_references', blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Delivery for Order {self.order.id} - {self.approval_status}"
