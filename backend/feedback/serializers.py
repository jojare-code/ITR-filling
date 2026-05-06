from rest_framework import serializers
from .models import Feedback
from users.serializers import UserSerializer

class FeedbackSerializer(serializers.ModelSerializer):
    client_details = UserSerializer(source='client', read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['id', 'order', 'client', 'client_details', 'rating', 'comments', 'submitted_at']
        read_only_fields = ['id', 'client', 'submitted_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['client'] = request.user
        return super().create(validated_data)
