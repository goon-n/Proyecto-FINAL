from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Turno
from .serializers import TurnoSerializer
from django.db import models

class TurnoViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer
    permission_classes = [permissions.AllowAny]  # <-- Solo para pruebas. Usa IsAdminUser / IsAuthenticated en desarrollo real.


    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or user.is_staff:
            return Turno.objects.all()
        return Turno.objects.filter(
            models.Q(estado='PENDIENTE', socio__isnull=True) | models.Q(socio=user)
        ).order_by('hora_inicio')

    @action(methods=['post'], detail=True)
    def reservar(self, request, pk=None):
        turno = self.get_object()
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'No autenticado'}, status=status.HTTP_403_FORBIDDEN)
        if turno.estado != 'PENDIENTE' or turno.socio is not None:
            return Response({'detail': 'Turno no disponible'}, status=status.HTTP_400_BAD_REQUEST)
        turno.socio = user
        turno.estado = 'CONFIRMADO'
        try:
            turno.full_clean()
            turno.save()
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Turno reservado con éxito'}, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True)
    def cancelar(self, request, pk=None):
        turno = self.get_object()
        user = request.user
        if turno.socio != user:
            return Response({'detail': 'No tienes permiso'}, status=status.HTTP_403_FORBIDDEN)
        if turno.estado == 'CONFIRMADO':
            turno.estado = 'PENDIENTE'
            turno.socio = None
            turno.save()
            return Response({'detail': 'Turno cancelado'}, status=status.HTTP_200_OK)
        return Response({'detail': 'No se puede cancelar este turno'}, status=status.HTTP_400_BAD_REQUEST)
