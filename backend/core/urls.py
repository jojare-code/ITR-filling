from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'users',
    'plans',
    'orders',
]

urlpatterns = [
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
