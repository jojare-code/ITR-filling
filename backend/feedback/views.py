from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer
from orders.models import WorkOrder, OrderStatus

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        order_id = self.request.query_params.get('order', None)
        
        if user.role == 'client':
            queryset = Feedback.objects.filter(client=user)
        else:
            queryset = Feedback.objects.all()
            
        if order_id:
            queryset = queryset.filter(order_id=order_id)
            
        return queryset.order_by('-submitted_at')

    def create(self, request, *args, **kwargs):
        if request.user.role != 'client':
            return Response({"error": "Only clients can submit feedback."}, status=status.HTTP_403_FORBIDDEN)
            
        order_id = request.data.get('order')
        try:
            order = WorkOrder.objects.get(id=order_id, client=request.user)
            if order.status != OrderStatus.COMPLETED:
                return Response({"error": "Feedback can only be submitted for completed orders."}, status=status.HTTP_400_BAD_REQUEST)
        except WorkOrder.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
            
        return super().create(request, *args, **kwargs)
