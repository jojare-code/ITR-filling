import uuid
from django.db import models
from django.conf import settings
from orders.models import WorkOrder

class DocumentCategory(models.TextChoices):
    SALARY = 'salary', 'Salary'
    HOUSE_PROPERTY = 'house_property', 'House Property'
    OTHER_SOURCES = 'other_sources', 'Other Sources'
    CAPITAL_GAINS = 'capital_gains', 'Capital Gains'
    NRI = 'nri', 'NRI'
    PRESUMPTIVE_BUSINESS = 'presumptive_business', 'Presumptive Business'
    REGULAR_BUSINESS = 'regular_business', 'Regular Business'
    DELIVERY = 'delivery', 'Delivery'
    CONSENT = 'consent', 'Consent'
    OTHER = 'other', 'Other'

class DocumentRole(models.TextChoices):
    CLIENT = 'client', 'Client'
    STAFF = 'staff', 'Staff'
    OWNER = 'owner', 'Owner'

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_documents')
    uploader_role = models.CharField(max_length=20, choices=DocumentRole.choices)
    
    document_category = models.CharField(max_length=50, choices=DocumentCategory.choices)
    document_type = models.CharField(max_length=100) # e.g., Form 16, Bank Statement
    
    file_name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    file_size_kb = models.IntegerField(default=0)
    
    is_delivery_document = models.BooleanField(default=False)
    version = models.IntegerField(default=1)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.file and not self.file_size_kb:
            self.file_size_kb = int(self.file.size / 1024)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.file_name} for Order {self.order_id}"
