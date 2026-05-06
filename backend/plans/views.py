from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ServicePlan, Discount
from .serializers import ServicePlanSerializer
from decimal import Decimal

class ServicePlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServicePlan.objects.filter(is_active=True)
    serializer_class = ServicePlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def validate_discount(self, request):
        code = request.data.get('code')
        service_id = request.data.get('service_id')
        
        if not code or not service_id:
            return Response({"error": "code and service_id are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            discount = Discount.objects.get(code__iexact=code)
            if not discount.is_valid():
                return Response({"error": "Discount code is invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)
                
            service = ServicePlan.objects.get(id=service_id)
            
            if discount.discount_type == 'percentage':
                deduction = (service.base_price * discount.discount_value) / Decimal('100')
                new_price = service.base_price - deduction
            else:
                new_price = service.base_price - discount.discount_value
                
            new_price = max(new_price, Decimal('0.00'))
            
            return Response({
                "valid": True,
                "original_price": str(service.base_price),
                "new_price": str(new_price),
                "discount_applied": str(service.base_price - new_price),
                "discount_type": discount.discount_type,
                "discount_value": str(discount.discount_value)
            })
            
        except Discount.DoesNotExist:
            return Response({"error": "Discount code not found"}, status=status.HTTP_404_NOT_FOUND)
        except ServicePlan.DoesNotExist:
            return Response({"error": "Service plan not found"}, status=status.HTTP_404_NOT_FOUND)
