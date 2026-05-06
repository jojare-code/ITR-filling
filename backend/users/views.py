from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ClientProfile
from .serializers import ClientProfileSerializer

class ClientProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own profile unless they are staff/owner
        user = self.request.user
        if user.role in ['staff', 'owner']:
            return ClientProfile.objects.all()
        return ClientProfile.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            profile = ClientProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ClientProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=404)
