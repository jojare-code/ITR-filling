from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source='actor.email', read_only=True)
    actor_name = serializers.CharField(source='actor.name', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'actor', 'actor_email', 'actor_name', 'actor_role',
            'action', 'entity_type', 'entity_id', 'old_value', 'new_value',
            'ip_address', 'timestamp'
        ]
        read_only_fields = fields
