from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'order', 'uploaded_by', 'uploader_role', 
            'document_category', 'document_type', 'file_name', 
            'file', 'file_size_kb', 'is_delivery_document', 
            'version', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploader_role', 'file_size_kb', 'version', 'uploaded_at']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        validated_data['uploaded_by'] = user
        validated_data['uploader_role'] = user.role
        
        # Check if a file of the same type and category exists for this order
        # If so, increment version
        existing_docs = Document.objects.filter(
            order=validated_data['order'],
            document_category=validated_data['document_category'],
            document_type=validated_data['document_type']
        ).order_by('-version')
        
        if existing_docs.exists():
            validated_data['version'] = existing_docs.first().version + 1
            
        return super().create(validated_data)
