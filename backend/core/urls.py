from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "status": "online",
        "name": "ITR Filing Management API",
        "message": "Django Backend API server is running successfully.",
        "endpoints": {
            "admin": "/admin/",
            "users": "/api/users/",
            "plans": "/api/plans/",
            "orders": "/api/orders/",
            "documents": "/api/documents/",
            "queries": "/api/queries/",
            "deliveries": "/api/deliveries/",
            "feedback": "/api/feedback/",
            "audit": "/api/audit/"
        }
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/plans/', include('plans.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/queries/', include('queries.urls')),
    path('api/deliveries/', include('deliveries.urls')),
    path('api/feedback/', include('feedback.urls')),
    path('api/audit/', include('audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

