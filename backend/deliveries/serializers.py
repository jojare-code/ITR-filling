from rest_framework import serializers
from .models import WorkDelivery
from users.serializers import UserSerializer
from documents.serializers import DocumentSerializer

class WorkDeliverySerializer(serializers.ModelSerializer):
    submitted_by_details = UserSerializer(source='submitted_by', read_only=True)
    approved_by_details = UserSerializer(source='approved_by', read_only=True)
    documents_list = DocumentSerializer(source='final_documents', many=True, read_only=True)
    
    class Meta:
        model = WorkDelivery
        fields = [
            'id', 'order', 'submitted_by', 'submitted_by_details', 'approval_status', 
            'approved_by', 'approved_by_details', 'approved_at', 'rejection_reason',
            'delivery_type', 'final_documents', 'documents_list', 'submitted_at', 'delivered_at'
        ]
        read_only_fields = [
            'id', 'submitted_by', 'approval_status', 'approved_by', 
            'approved_at', 'submitted_at', 'delivered_at'
        ]

    def create(self, validated_data):
        # Allow many-to-many field setup
        docs = validated_data.pop('final_documents', [])
        
        request = self.context.get('request')
        validated_data['submitted_by'] = request.user
        
        delivery = super().create(validated_data)
        if docs:
            delivery.final_documents.set(docs)
            
        return delivery
