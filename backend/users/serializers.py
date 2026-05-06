from rest_framework import serializers
from .models import ClientProfile, User
import sys
import os

# Add core to path to import encryption
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.encryption import encrypt_data, decrypt_data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'mobile_no']
        read_only_fields = ['id', 'email', 'name', 'role', 'mobile_no']

class ClientProfileSerializer(serializers.ModelSerializer):
    pan_number = serializers.CharField(write_only=True)
    aadhaar_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    it_portal_password = serializers.CharField(write_only=True)
    
    pan_masked = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientProfile
        fields = [
            'profile_id', 'user', 'pan_number', 'pan_masked', 'aadhaar_number', 
            'aadhaar_consent', 'fathers_name', 'residential_address', 
            'tax_regime', 'bank_details_encrypted', 'it_portal_password', 
            'data_consent_accepted', 'privacy_policy_version'
        ]
        read_only_fields = ['profile_id', 'user']

    def get_pan_masked(self, obj):
        decrypted_pan = decrypt_data(obj.pan_number)
        if decrypted_pan and len(decrypted_pan) > 4:
            return f"XXXXX{decrypted_pan[-4:]}X"
        return "Not Set"

    def create(self, validated_data):
        pan = validated_data.pop('pan_number', '')
        aadhaar = validated_data.pop('aadhaar_number', '')
        it_password = validated_data.pop('it_portal_password', '')
        
        validated_data['pan_number'] = encrypt_data(pan)
        if aadhaar:
            validated_data['aadhaar_encrypted'] = encrypt_data(aadhaar)
        validated_data['it_portal_password_vault'] = encrypt_data(it_password)
        
        request = self.context.get('request')
        if request and hasattr(request, "user"):
            validated_data['user'] = request.user
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'pan_number' in validated_data:
            validated_data['pan_number'] = encrypt_data(validated_data.pop('pan_number'))
        if 'aadhaar_number' in validated_data:
            validated_data['aadhaar_encrypted'] = encrypt_data(validated_data.pop('aadhaar_number'))
        if 'it_portal_password' in validated_data:
            validated_data['it_portal_password_vault'] = encrypt_data(validated_data.pop('it_portal_password'))
            
        return super().update(instance, validated_data)
