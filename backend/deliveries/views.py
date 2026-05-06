from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import WorkDelivery, DeliveryStatus
from .serializers import WorkDeliverySerializer
from orders.models import WorkOrder, OrderStatus
from queries.models import Query, QueryStatus
from core.utils import send_notification_email

class WorkDeliveryViewSet(viewsets.ModelViewSet):
    serializer_class = WorkDeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        order_id = self.request.query_params.get('order', None)
        
        queryset = WorkDelivery.objects.all()
        
        if user.role == 'client':
            queryset = queryset.filter(order__client=user)
        elif user.role == 'staff':
            queryset = queryset.filter(order__assigned_staff=user)
            
        if order_id:
            queryset = queryset.filter(order_id=order_id)
            
        return queryset.order_by('-submitted_at')

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['staff', 'owner']:
            return Response({"error": "Only staff/owner can submit deliveries"}, status=status.HTTP_403_FORBIDDEN)
            
        order_id = request.data.get('order')
        if not order_id:
            return Response({"error": "Order ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify no open queries exist for this order
        open_queries = Query.objects.filter(order_id=order_id).exclude(status=QueryStatus.CLOSED)
        if open_queries.exists():
            return Response({"error": "Cannot submit delivery. There are open queries."}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        delivery = serializer.save()
        
        # Update order status
        order = delivery.order
        order.status = OrderStatus.REVIEW
        order.save()
        
        # Notify Owner
        # Assuming Owner is the first active owner in the system
        # For a robust system, we would fetch owner explicitly
        send_notification_email(
            to_email="owner@geetanjali-itr.com", # hardcoded for demonstration based on spec
            subject=f"Review Required: Delivery for Order {order.id}",
            html_content=f"<p>Staff {request.user.email} has submitted a work delivery for approval.</p>"
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'owner':
            return Response({"error": "Only the owner can approve deliveries"}, status=status.HTTP_403_FORBIDDEN)
            
        delivery = self.get_object()
        if delivery.approval_status != DeliveryStatus.PENDING:
            return Response({"error": "Delivery is not pending approval"}, status=status.HTTP_400_BAD_REQUEST)
            
        delivery.approval_status = DeliveryStatus.APPROVED
        delivery.approved_by = request.user
        delivery.approved_at = timezone.now()
        delivery.delivered_at = timezone.now()
        delivery.save()
        
        order = delivery.order
        order.status = OrderStatus.COMPLETED
        order.save()
        
        # Notify Client
        send_notification_email(
            to_email=order.client.email,
            subject=f"ITR Filing Completed!",
            html_content=f"<p>Your ITR has been filed successfully. You can download the final documents from your dashboard.</p>"
        )
        
        return Response(WorkDeliverySerializer(delivery).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'owner':
            return Response({"error": "Only the owner can reject deliveries"}, status=status.HTTP_403_FORBIDDEN)
            
        delivery = self.get_object()
        if delivery.approval_status != DeliveryStatus.PENDING:
            return Response({"error": "Delivery is not pending approval"}, status=status.HTTP_400_BAD_REQUEST)
            
        reason = request.data.get('rejection_reason')
        if not reason:
            return Response({"error": "rejection_reason is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        delivery.approval_status = DeliveryStatus.REJECTED
        delivery.rejection_reason = reason
        delivery.save()
        
        order = delivery.order
        order.status = OrderStatus.PROCESSING # Moves back to processing
        order.save()
        
        # Notify Staff
        send_notification_email(
            to_email=delivery.submitted_by.email,
            subject=f"Delivery Rejected for Order {order.id}",
            html_content=f"<p>Your delivery was rejected.</p><p><b>Reason:</b> {reason}</p>"
        )
        
        return Response(WorkDeliverySerializer(delivery).data)
