from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Turno
from .serializers import TurnoSerializer
from django.db import models
from django.utils import timezone

class TurnoViewSet(viewsets.ModelViewSet):
    serializer_class = TurnoSerializer
    permission_classes = [permissions.AllowAny]  # En producción pon IsAuthenticated o custom

    def get_queryset(self):
        # Antes de devolver el queryset, actualiza estados de vencidos
        self.actualizar_turnos_vencidos()
        now = timezone.now()
        base_queryset = Turno.objects.filter(
            hora_fin__gte=now  # Solo futuros/vigentes
        ).order_by('hora_inicio')
        user = self.request.user
        if not user.is_authenticated or user.is_staff:
            return base_queryset
        return base_queryset.filter(
            models.Q(estado='PENDIENTE', socio__isnull=True) | models.Q(socio=user)
        )

    def actualizar_turnos_vencidos(self):
        now = timezone.now()
        # Turnos vencidos no tomados = SUSPENDIDO
        Turno.objects.filter(
            hora_fin__lt=now,
            estado="PENDIENTE",
            socio__isnull=True
        ).update(estado="SUSPENDIDO")
        # Turnos vencidos tomados = FINALIZADO
        Turno.objects.filter(
            hora_fin__lt=now,
            estado="CONFIRMADO",
            socio__isnull=False
        ).update(estado="FINALIZADO")

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
            return Response({'detail': 'Turno cancelado, cupo libre.'}, status=status.HTTP_200_OK)
        return Response({'detail': 'No se puede cancelar este turno'}, status=status.HTTP_400_BAD_REQUEST)
