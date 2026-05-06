import uuid
from django.db import models
from django.conf import settings
from orders.models import WorkOrder

class QueryStatus(models.TextChoices):
    OPEN = 'open', 'Open'
    REPLIED = 'replied', 'Replied'
    CLOSED = 'closed', 'Closed'

class Query(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='queries')
    raised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='raised_queries')
    
    query_text = models.TextField()
    status = models.CharField(max_length=20, choices=QueryStatus.choices, default=QueryStatus.OPEN)
    
    client_reply = models.TextField(blank=True, null=True)
    
    replied_at = models.DateTimeField(blank=True, null=True)
    closed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Query {self.id} for Order {self.order.id}"
