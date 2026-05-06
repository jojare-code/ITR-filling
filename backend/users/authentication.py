import jwt
import os
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            jwt_secret = os.environ.get('SUPABASE_JWT_SECRET')
            if not jwt_secret:
                # Fallback for local development if not set, though it should be.
                # In production, this must be set.
                raise AuthenticationFailed('SUPABASE_JWT_SECRET not configured')
                
            decoded = jwt.decode(token, jwt_secret, algorithms=["HS256"], audience="authenticated")
            supabase_uid = decoded.get('sub')
            email = decoded.get('email')
            
            if not supabase_uid:
                raise AuthenticationFailed('Invalid token payload')
                
            # Sync user from Supabase to Django
            user, created = User.objects.get_or_create(
                id=supabase_uid,
                defaults={'email': email, 'username': email, 'is_active': True}
            )
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
