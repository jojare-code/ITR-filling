import uuid
from django.db import models
from django.conf import settings
from orders.models import WorkOrder
from django.core.validators import MinValueValidator, MaxValueValidator

class Feedback(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(WorkOrder, on_delete=models.CASCADE, related_name='feedback')
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedbacks')
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comments = models.TextField(blank=True, null=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for Order {self.order.id} - {self.rating} Stars"
