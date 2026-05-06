from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from orders.models import WorkOrder
from documents.models import Document
from deliveries.models import WorkDelivery
from .models import AuditLog
import json
import threading

# Thread-local storage to pass request data (user, ip) to signals
_thread_locals = threading.local()

def get_current_request():
    return getattr(_thread_locals, 'request', None)

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _thread_locals.request = request
        response = self.get_response(request)
        _thread_locals.request = None
        return response

def create_audit_log(sender, instance, created, **kwargs):
    request = get_current_request()
    actor = getattr(request, 'user', None) if request else None
    
    actor_id = actor.id if actor and actor.is_authenticated else None
    actor_role = actor.role if actor and actor.is_authenticated else 'system'
    ip_address = request.META.get('REMOTE_ADDR') if request else None

    action = "CREATED" if created else "UPDATED"
    entity_type = sender.__name__
    entity_id = str(instance.id)
    
    AuditLog.objects.create(
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        ip_address=ip_address
    )

@receiver(post_save, sender=WorkOrder)
def log_work_order(sender, instance, created, **kwargs):
    create_audit_log(sender, instance, created, **kwargs)

@receiver(post_save, sender=Document)
def log_document(sender, instance, created, **kwargs):
    create_audit_log(sender, instance, created, **kwargs)

@receiver(post_save, sender=WorkDelivery)
def log_delivery(sender, instance, created, **kwargs):
    create_audit_log(sender, instance, created, **kwargs)
