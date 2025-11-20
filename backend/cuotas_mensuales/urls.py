# cuotas_mensuales/urls.py - CORREGIDO

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanViewSet, CuotaMensualViewSet, HistorialPagoViewSet

router = DefaultRouter()
router.register(r'planes', PlanViewSet, basename='plan')
# ✅ CORREGIDO: Usar 'cuota_mensual' (singular) para coincidir con el frontend
router.register(r'cuota_mensual', CuotaMensualViewSet, basename='cuota')
router.register(r'historial-pagos', HistorialPagoViewSet, basename='historial-pago')

urlpatterns = [
    path('', include(router.urls)),
]