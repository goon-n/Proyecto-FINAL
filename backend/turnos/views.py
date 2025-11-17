# turnos/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError 
from .models import Turno
from .serializers import TurnoSerializer, TurnoStaffSerializer
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta, datetime, time
from backend.permissions import IsStaffUser

class TurnoViewSet(viewsets.ModelViewSet):
    
    def get_serializer_class(self):
        if self.request.user.is_staff:
            return TurnoStaffSerializer
        return TurnoSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'generar_turnos_semana']:
            self.permission_classes = [IsStaffUser] 
        elif self.action in ['reservar', 'cancelar', 'confirmar']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.AllowAny]
            
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        now = timezone.now()
        user = self.request.user
        
        # Limpieza de turnos pasados
        Turno.objects.filter(hora_inicio__lt=now).exclude(estado='FINALIZADO').update(estado='FINALIZADO')
        
        # Staff ve todo
        if user.is_staff:
            return Turno.objects.all().order_by('hora_inicio') 
        
        # Socios y no autenticados
        q_filter = Q(estado='DISPONIBLE', socio__isnull=True)
        
        if user.is_authenticated:
            q_filter |= Q(socio=user, estado__in=['RESERVADO', 'CONFIRMADO'])
        
        return Turno.objects.filter(q_filter).filter(
            hora_inicio__gte=now
        ).order_by('hora_inicio')

    def create(self, request, *args, **kwargs):
        if request.data.get('hora_inicio'):
            try:
                hora_dt = timezone.datetime.fromisoformat(request.data['hora_inicio'].replace('Z', '+00:00'))
                if hora_dt.minute != 0:
                    return Response({
                        'detail': 'La hora de inicio debe ser una hora en punto (ej: 08:00, no 08:30).'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except:
                return Response({
                    'detail': 'Formato de fecha inválido.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data.copy()
        data['socio'] = None 
        data['estado'] = 'DISPONIBLE'
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except ValidationError as e:
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'detail': 'Cupo de turno creado con éxito.'}, status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=False, permission_classes=[IsStaffUser])
    def generar_turnos_semana(self, request):
        """
        Genera automáticamente todos los turnos de una semana específica
        Lunes a Viernes: 8:00 a 22:00
        Sábados: 8:00 a 13:00 y 17:00 a 22:00
        10 cupos por hora
        """
        fecha_inicio_str = request.data.get('fecha_inicio')
        
        if not fecha_inicio_str:
            return Response({
                'detail': 'Debe proporcionar una fecha_inicio en formato YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'detail': 'Formato de fecha inválido. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Ajustar al lunes de esa semana
        dias_desde_lunes = fecha_inicio.weekday()
        lunes = fecha_inicio - timedelta(days=dias_desde_lunes)
        
        turnos_creados = 0
        turnos_bloqueados = 0
        turnos_existentes = 0
        errores = []
        
        # Generar turnos de lunes a sábado
        for dia in range(6):
            fecha = lunes + timedelta(days=dia)
            es_sabado = fecha.weekday() == 5
            
            # Definir horarios según el día
            if es_sabado:
                horarios = list(range(8, 13)) + list(range(17, 23))
            else:
                horarios = list(range(8, 23))
            
            # Crear turnos para cada hora
            for hora in horarios:
                # ✅ SOLUCIÓN: Crear datetime naive y convertir con la timezone configurada
                dt_naive = datetime.combine(fecha, time(hora, 0))
                hora_inicio = timezone.make_aware(dt_naive, timezone.get_current_timezone())
                
                # Contar cupos existentes en ese rango de 1 hora
                cupos_existentes = Turno.objects.filter(
                    hora_inicio__gte=hora_inicio,
                    hora_inicio__lt=hora_inicio + timedelta(hours=1)
                ).count()
                
                cupos_a_crear = 10 - cupos_existentes
                
                if cupos_a_crear <= 0:
                    turnos_existentes += 10
                    continue
                
                # Crear los cupos
                for cupo in range(cupos_a_crear):
                    try:
                        hora_con_segundos = hora_inicio + timedelta(seconds=cupo)
                        
                        turno = Turno.objects.create(
                            hora_inicio=hora_con_segundos,
                            estado='DISPONIBLE'
                        )
                        turnos_creados += 1
                    except Exception as e:
                        errores.append(f"Error en {hora_inicio} cupo {cupo+1}: {str(e)}")
                
                if cupos_existentes > 0:
                    turnos_existentes += cupos_existentes
            
            # Bloquear horarios no disponibles del sábado (13-17)
            if es_sabado:
                for hora in range(13, 17):
                    dt_naive = datetime.combine(fecha, time(hora, 0))
                    hora_bloqueada = timezone.make_aware(dt_naive, timezone.get_current_timezone())
                    
                    if not Turno.objects.filter(
                        hora_inicio__gte=hora_bloqueada,
                        hora_inicio__lt=hora_bloqueada + timedelta(hours=1)
                    ).exists():
                        try:
                            Turno.objects.create(
                                hora_inicio=hora_bloqueada,
                                estado='BLOQUEADO'
                            )
                            turnos_bloqueados += 1
                        except:
                            pass
        
        return Response({
            'detail': f'Generación completada',
            'turnos_creados': turnos_creados,
            'turnos_bloqueados': turnos_bloqueados,
            'turnos_existentes': turnos_existentes,
            'errores': errores if errores else None
        }, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=False)
    def calendario(self, request):
        """
        Endpoint para obtener turnos agrupados por fecha y hora para el calendario
        """
        now = timezone.now()
        user = request.user
        
        fecha_inicio_str = request.query_params.get('fecha_inicio')
        fecha_fin_str = request.query_params.get('fecha_fin')
        
        if fecha_inicio_str:
            fecha_inicio = timezone.make_aware(datetime.strptime(fecha_inicio_str, '%Y-%m-%d'))
        else:
            fecha_inicio = now
        
        if fecha_fin_str:
            fecha_fin = timezone.make_aware(datetime.strptime(fecha_fin_str, '%Y-%m-%d'))
        else:
            fecha_fin = fecha_inicio + timedelta(days=30)
        
        # Obtener turnos según permisos
        if user.is_staff:
            turnos = Turno.objects.filter(
                hora_inicio__gte=fecha_inicio,
                hora_inicio__lte=fecha_fin
            )
        else:
            q_filter = Q(estado='DISPONIBLE', socio__isnull=True) | Q(estado='BLOQUEADO')
            if user.is_authenticated:
                q_filter |= Q(socio=user, estado__in=['RESERVADO', 'CONFIRMADO'])
            
            turnos = Turno.objects.filter(q_filter).filter(
                hora_inicio__gte=fecha_inicio,
                hora_inicio__lte=fecha_fin
            )
        
        # Agrupar por fecha y hora
        calendario_data = {}
        for turno in turnos.order_by('hora_inicio'):
            # ✅ Convertir a hora local para agrupar correctamente
            turno_local = timezone.localtime(turno.hora_inicio)
            fecha_key = turno_local.strftime('%Y-%m-%d')
            hora_key = turno_local.strftime('%H:00')
            
            if fecha_key not in calendario_data:
                calendario_data[fecha_key] = {}
            
            if hora_key not in calendario_data[fecha_key]:
                calendario_data[fecha_key][hora_key] = {
                    'hora': hora_key,
                    'total_cupos': 0,
                    'cupos_disponibles': 0,
                    'cupos_reservados': 0,
                    'cupos_confirmados': 0,
                    'cupos_bloqueados': 0,
                    'turnos': []
                }
            
            # Contar cupos
            calendario_data[fecha_key][hora_key]['total_cupos'] += 1
            
            if turno.estado == 'DISPONIBLE':
                calendario_data[fecha_key][hora_key]['cupos_disponibles'] += 1
            elif turno.estado == 'RESERVADO':
                calendario_data[fecha_key][hora_key]['cupos_reservados'] += 1
            elif turno.estado == 'CONFIRMADO':
                calendario_data[fecha_key][hora_key]['cupos_confirmados'] += 1
            elif turno.estado == 'BLOQUEADO':
                calendario_data[fecha_key][hora_key]['cupos_bloqueados'] += 1
            
            # Agregar info del turno
            turno_info = {
                'id': turno.id,
                'estado': turno.estado,
                'socio': turno.socio.username if turno.socio else None,
                'socio_id': turno.socio.id if turno.socio else None,
                'es_mio': turno.socio == user if user.is_authenticated else False,
                'puede_cancelar': turno.puede_cancelar if turno.socio == user else False
            }
            
            calendario_data[fecha_key][hora_key]['turnos'].append(turno_info)
        
        # Convertir a lista ordenada
        resultado = []
        for fecha, horas in sorted(calendario_data.items()):
            resultado.append({
                'fecha': fecha,
                'es_domingo': datetime.strptime(fecha, '%Y-%m-%d').weekday() == 6,
                'horarios': sorted(horas.values(), key=lambda x: x['hora'])
            })
        
        return Response(resultado)
    
    @action(methods=['post'], detail=True)
    def reservar(self, request, pk=None):
        """Reserva Y confirma el turno directamente"""
        turno = self.get_object()
        user = request.user
        
        # Validar que el usuario NO sea staff
        if user.is_staff:
            return Response({
                'detail': 'Los administradores y entrenadores no pueden reservar turnos.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if turno.socio is not None or turno.estado != 'DISPONIBLE':
            return Response({
                'detail': 'Cupo no disponible para reserva'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Confirmar directamente sin pasar por estado RESERVADO
        turno.socio = user
        turno.estado = 'CONFIRMADO'
        turno.fecha_reserva = timezone.now()
        
        try:
            turno.full_clean()
            turno.save()
        except ValidationError as e:
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            'detail': 'Turno confirmado con éxito. Puedes cancelarlo hasta 1 hora antes.'
        }, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, permission_classes=[permissions.IsAuthenticated])
    def confirmar(self, request, pk=None):
        """Confirma un turno que estaba en estado RESERVADO (por compatibilidad)"""
        turno = self.get_object()
        user = request.user
        
        if turno.socio != user or turno.estado != 'RESERVADO':
            return Response({'detail': 'El turno no está en estado de RESERVADO o no te pertenece.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if turno.hora_inicio < timezone.now():
            return Response({'detail': 'No se puede confirmar un turno que ya ha comenzado.'}, status=status.HTTP_400_BAD_REQUEST)

        turno.estado = 'CONFIRMADO'
        turno.save()
        return Response({'detail': 'Turno confirmado con éxito.'}, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True)
    def cancelar(self, request, pk=None):
        """Cancela el turno si falta más de 1 hora"""
        turno = self.get_object()
        user = request.user
        
        if turno.socio != user:
            return Response({
                'detail': 'No tienes permiso para cancelar este turno.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verificar que falte más de 1 hora
        if turno.hora_inicio <= timezone.now() + timedelta(hours=1):
            return Response({
                'detail': 'No se puede cancelar un turno con menos de 1 hora de anticipación.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if turno.estado in ['RESERVADO', 'CONFIRMADO']:
            turno.estado = 'DISPONIBLE'
            turno.socio = None
            turno.fecha_reserva = None
            turno.save()
            return Response({
                'detail': 'Turno cancelado, cupo liberado.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'detail': 'No se puede cancelar este turno'
        }, status=status.HTTP_400_BAD_REQUEST)