# turnos/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError 
from .models import Turno
from .serializers import TurnoSerializer, TurnoStaffSerializer
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from backend.permissions import IsStaffUser

class TurnoViewSet(viewsets.ModelViewSet):
    
    def get_serializer_class(self):
        if self.request.user.is_staff:
            return TurnoStaffSerializer
        return TurnoSerializer

    def get_permissions(self):
        # ... (Permisos sin cambios)
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsStaffUser] 
        elif self.action in ['reservar', 'cancelar', 'confirmar']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.AllowAny]
            
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        now = timezone.now()
        user = self.request.user
        
        # 1. Limpieza de turnos pasados
        Turno.objects.filter(hora_inicio__lt=now).exclude(estado='FINALIZADO').update(estado='FINALIZADO')

        # 2. CANCELACIÓN AUTOMÁTICA por 24 horas 
        limite_reserva = now - timedelta(hours=24)
        
        # 🚨 CORRECCIÓN CLAVE: Aseguramos que 'fecha_reserva' no sea nulo antes de compararlo.
        # Esto soluciona el 500 al inicializar una DB vacía.
        Turno.objects.filter(
            estado='RESERVADO', 
            socio__isnull=False, # Solo si tiene un socio asignado
            fecha_reserva__isnull=False, # Y la fecha no es nula
            fecha_reserva__lt=limite_reserva
        ).update(
            estado='SOLICITUD', 
            socio=None,
            fecha_reserva=None
        )
        
        # Staff ve todo
        if user.is_staff:
            return Turno.objects.all().order_by('hora_inicio') 
        
        # Lógica para Socios y No Autenticados (Solo turnos disponibles o propios)
        q_filter = Q(estado='SOLICITUD', socio__isnull=True) # Cupos Libres
        
        if user.is_authenticated:
            # Añadimos sus propios turnos RESERVADOS o CONFIRMADOS futuros
            q_filter |= Q(socio=user, estado__in=['RESERVADO', 'CONFIRMADO'])
        
        # Solo turnos futuros
        return Turno.objects.filter(q_filter).filter(
            hora_inicio__gte=now
        ).order_by('hora_inicio')

    # ... (Resto de las acciones 'create', 'reservar', 'confirmar', 'cancelar' sin cambios)

    def create(self, request, *args, **kwargs):
        # El modelo ahora solo acepta hora_inicio, y se valida que sea una hora en punto
        if request.data.get('hora_inicio') and timezone.datetime.fromisoformat(request.data['hora_inicio']).minute != 0:
            return Response({'detail': 'La hora de inicio debe ser una hora en punto (ej: 08:00, no 08:30).'}, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data.copy()
        data['socio'] = None 
        data['estado'] = 'SOLICITUD' 
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except ValidationError as e:
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'detail': 'Cupo de turno creado con éxito.'}, status=status.HTTP_201_CREATED)

    
    @action(methods=['post'], detail=True)
    def reservar(self, request, pk=None):
        turno = self.get_object()
        user = request.user
        
        if turno.socio is not None or turno.estado != 'SOLICITUD':
            return Response({'detail': 'Cupo no disponible para reserva'}, status=status.HTTP_400_BAD_REQUEST)
            
        turno.socio = user
        turno.estado = 'RESERVADO'
        turno.fecha_reserva = timezone.now()
        
        try:
            turno.full_clean()
            turno.save()
        except ValidationError as e:
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'detail': 'Turno reservado. Tienes 24 horas para confirmarlo.'}, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, permission_classes=[permissions.IsAuthenticated])
    def confirmar(self, request, pk=None):
        turno = self.get_object()
        user = request.user
        
        if turno.socio != user or turno.estado != 'RESERVADO':
            return Response({'detail': 'El turno no está en estado de RESERVADO o no te pertenece.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if turno.hora_inicio < timezone.now():
            return Response({'detail': 'No se puede confirmar un turno que ya ha comenzado.'}, status=status.HTTP_400_BAD_REQUEST)

        if turno.fecha_reserva < timezone.now() - timedelta(hours=24):
            turno.estado = 'SOLICITUD'
            turno.socio = None
            turno.fecha_reserva = None
            turno.save()
            return Response({'detail': 'El plazo de 24 horas para confirmar ha expirado. El turno fue liberado. Intenta reservarlo nuevamente.'}, status=status.HTTP_400_BAD_REQUEST)

        turno.estado = 'CONFIRMADO'
        turno.save()
        return Response({'detail': 'Turno confirmado con éxito.'}, status=status.HTTP_200_OK)


    @action(methods=['post'], detail=True)
    def cancelar(self, request, pk=None):
        turno = self.get_object()
        user = request.user
        
        if turno.socio != user:
            return Response({'detail': 'No tienes permiso para cancelar este turno.'}, status=status.HTTP_403_FORBIDDEN)
        
        if turno.hora_inicio < timezone.now():
            return Response({'detail': 'No se puede cancelar un turno que ya ha comenzado.'}, status=status.HTTP_400_BAD_REQUEST)

        if turno.estado in ['RESERVADO', 'CONFIRMADO']:
            turno.estado = 'SOLICITUD'
            turno.socio = None
            turno.fecha_reserva = None
            turno.save()
            return Response({'detail': 'Turno cancelado, cupo liberado.'}, status=status.HTTP_200_OK)
        
        return Response({'detail': 'No se puede cancelar este turno'}, status=status.HTTP_400_BAD_REQUEST)