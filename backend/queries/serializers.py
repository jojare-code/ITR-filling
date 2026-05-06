from rest_framework import serializers
from .models import Query
from users.serializers import UserSerializer

class QuerySerializer(serializers.ModelSerializer):
    raised_by_details = UserSerializer(source='raised_by', read_only=True)
    
    class Meta:
        model = Query
        fields = [
            'id', 'order', 'raised_by', 'raised_by_details', 'query_text', 
            'status', 'client_reply', 'replied_at', 'closed_at', 'created_at'
        ]
        read_only_fields = ['id', 'raised_by', 'status', 'replied_at', 'closed_at', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['raised_by'] = request.user
        return super().create(validated_data)
