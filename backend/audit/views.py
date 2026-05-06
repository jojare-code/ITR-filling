from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'owner':
            # Only owners can see audit logs
            return AuditLog.objects.none()
            
        entity_id = self.request.query_params.get('entity_id', None)
        queryset = AuditLog.objects.all().order_by('-timestamp')
        
        if entity_id:
            queryset = queryset.filter(entity_id=entity_id)
            
        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != 'owner':
            return Response({"error": "Unauthorized. Only Owners can view audit logs."}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)
