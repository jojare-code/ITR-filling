import uuid
from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    actor_role = models.CharField(max_length=50) # owner, staff, client, system
    
    action = models.CharField(max_length=255) # e.g. STATUS_CHANGED, DOCUMENT_UPLOADED
    entity_type = models.CharField(max_length=100) # e.g. WorkOrder, Document
    entity_id = models.CharField(max_length=255)
    
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on {self.entity_type} {self.entity_id} at {self.timestamp}"
