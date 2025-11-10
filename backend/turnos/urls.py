# turnos/urls.py
from rest_framework.routers import DefaultRouter
from .views import TurnoViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'turnos', TurnoViewSet, basename='turno')

urlpatterns = [
    path('', include(router.urls)),
]

# Asegúrate de incluir esto en tu {proyecto}/urls.py:
# path('api/', include('turnos.urls')),