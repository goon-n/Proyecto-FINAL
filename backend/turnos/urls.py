# backend/turnos/urls.py

from rest_framework.routers import DefaultRouter
from .views import TurnoViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'turno', TurnoViewSet, basename='turno')  # 👈 CAMBIAR A SINGULAR

urlpatterns = [
    path('', include(router.urls)),
]