from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import WorkOrder, Payment, OrderStatus
from .serializers import WorkOrderSerializer, PaymentSerializer

class WorkOrderViewSet(viewsets.ModelViewSet):
    serializer_class = WorkOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['staff', 'owner']:
            return WorkOrder.objects.all().order_by('-created_at')
        return WorkOrder.objects.filter(client=user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def submit_payment(self, request, pk=None):
        order = self.get_object()
        
        # Ensure order doesn't already have a verified payment
        if hasattr(order, 'payment') and order.payment.status == 'verified':
            return Response({"error": "Order is already paid"}, status=status.HTTP_400_BAD_REQUEST)
            
        utr_number = request.data.get('utr_number')
        amount = request.data.get('amount')
        
        if not utr_number or not amount:
            return Response({"error": "utr_number and amount are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create or update payment proof
        payment, created = Payment.objects.update_or_create(
            order=order,
            defaults={
                'amount': amount,
                'utr_number': utr_number,
                'status': 'pending',
                'proof_url': request.data.get('proof_url', '')
            }
        )
        
        # Move order forward to Document collection phase since payment is pending verification
        order.status = OrderStatus.DOCUMENTS_PENDING
        order.save()
        
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
