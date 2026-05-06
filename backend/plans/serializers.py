from rest_framework import serializers
from .models import ServicePlan, Discount

class ServicePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePlan
        fields = ['id', 'name', 'description', 'base_price', 'required_documents']

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['code', 'discount_type', 'discount_value']
