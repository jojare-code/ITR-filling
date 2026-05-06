from rest_framework import serializers
from .models import WorkOrder, Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'utr_number', 'status', 'proof_url', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

class WorkOrderSerializer(serializers.ModelSerializer):
    payment = PaymentSerializer(read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    
    class Meta:
        model = WorkOrder
        fields = [
            'id', 'client', 'service', 'service_name', 'status', 'assigned_staff', 
            'final_price', 'discount_applied', 'created_at', 'updated_at', 'payment'
        ]
        read_only_fields = ['id', 'client', 'status', 'assigned_staff', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Assign current authenticated user
        request = self.context.get('request')
        if request and hasattr(request, "user"):
            validated_data['client'] = request.user
        return super().create(validated_data)
