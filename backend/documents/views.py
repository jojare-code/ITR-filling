from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Document
from .serializers import DocumentSerializer
from orders.models import WorkOrder, OrderStatus

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        order_id = self.request.query_params.get('order', None)
        
        queryset = Document.objects.all()
        
        if user.role == 'client':
            queryset = queryset.filter(order__client=user)
        
        if order_id:
            queryset = queryset.filter(order_id=order_id)
            
        return queryset.order_by('-uploaded_at')

    @action(detail=False, methods=['post'])
    def complete_collection(self, request):
        order_id = request.data.get('order_id')
        portal_password = request.data.get('portal_password')
        consent_given = request.data.get('consent_given')
        
        if not order_id:
            return Response({"error": "order_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            order = WorkOrder.objects.get(id=order_id, client=request.user)
            
            if order.status != OrderStatus.DOCUMENTS_PENDING:
                return Response({"error": "Order is not in documents pending state"}, status=status.HTTP_400_BAD_REQUEST)
                
            order.status = OrderStatus.PROCESSING
            order.it_portal_upload_consent = consent_given
            order.save()
            
            # Save portal password to client profile vault
            # We fetch the profile securely
            if portal_password:
                profile = request.user.client_profile
                profile.it_portal_password_vault = portal_password # In real app, encrypt this with AES-256
                profile.save()
            
            return Response({"status": "Success", "order_status": order.status})
            
        except WorkOrder.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
