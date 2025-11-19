# cuotas_mensuales/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanViewSet, CuotaMensualViewSet, HistorialPagoViewSet

router = DefaultRouter()
router.register(r'planes', PlanViewSet, basename='plan')
router.register(r'cuotas', CuotaMensualViewSet, basename='cuota')
router.register(r'historial-pagos', HistorialPagoViewSet, basename='historial-pago')

urlpatterns = [
    path('', include(router.urls)),
    
]