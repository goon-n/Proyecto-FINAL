# movimiento_caja/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CajaViewSet, MovimientoDeCajaViewSet

router = DefaultRouter()
router.register(r'caja', CajaViewSet, basename='caja')
router.register(r'movimiento-caja', MovimientoDeCajaViewSet, basename='movimiento-caja')

urlpatterns = [
    path('', include(router.urls)),
]