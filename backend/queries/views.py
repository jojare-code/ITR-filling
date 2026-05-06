from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Query, QueryStatus
from .serializers import QuerySerializer
from orders.models import WorkOrder, OrderStatus
from core.utils import send_notification_email

class QueryViewSet(viewsets.ModelViewSet):
    serializer_class = QuerySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        order_id = self.request.query_params.get('order', None)
        
        queryset = Query.objects.all()
        
        if user.role == 'client':
            queryset = queryset.filter(order__client=user)
        elif user.role == 'staff':
            queryset = queryset.filter(order__assigned_staff=user)
            
        if order_id:
            queryset = queryset.filter(order_id=order_id)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        query = serializer.save()
        # Update order status
        order = query.order
        order.status = OrderStatus.QUERY_RAISED
        order.save()
        
        # Notify client
        send_notification_email(
            to_email=order.client.email,
            subject="Action Required: Query on your ITR Filing",
            html_content=f"<p>Hello,</p><p>Our team has raised a query regarding your ITR work order. Please log in to the dashboard to reply.</p><p><b>Query:</b> {query.query_text}</p>"
        )

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        query = self.get_object()
        
        if request.user.role != 'client':
            return Response({"error": "Only clients can reply to queries."}, status=status.HTTP_403_FORBIDDEN)
            
        if query.status != QueryStatus.OPEN:
            return Response({"error": "This query is not open."}, status=status.HTTP_400_BAD_REQUEST)
            
        reply_text = request.data.get('client_reply')
        if not reply_text:
            return Response({"error": "client_reply is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        query.client_reply = reply_text
        query.status = QueryStatus.REPLIED
        query.replied_at = timezone.now()
        query.save()
        
        # Update order status
        order = query.order
        order.status = OrderStatus.PROCESSING
        order.save()
        
        # Notify staff
        if order.assigned_staff:
            send_notification_email(
                to_email=order.assigned_staff.email,
                subject=f"Client Replied to Query (Order {order.id})",
                html_content=f"<p>The client has replied to your query.</p><p><b>Reply:</b> {query.client_reply}</p>"
            )
            
        return Response(QuerySerializer(query).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        query = self.get_object()
        
        if request.user.role not in ['staff', 'owner']:
            return Response({"error": "Only staff/owner can close queries."}, status=status.HTTP_403_FORBIDDEN)
            
        query.status = QueryStatus.CLOSED
        query.closed_at = timezone.now()
        query.save()
        
        return Response(QuerySerializer(query).data)
