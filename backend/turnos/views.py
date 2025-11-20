# turnos/views.py - IMPORTS CORREGIDOS
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
from rest_framework.permissions import IsAuthenticated
import re

# ✅ CORREGIDO: Importar desde cuotas_mensuales, NO desde turnos
from cuotas_mensuales.models import CuotaMensual

class TurnoViewSet(viewsets.ModelViewSet):
    
    def get_serializer_class(self):
        if self.request.user.is_staff:
            return TurnoStaffSerializer
        return TurnoSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'generar_turnos_semana']:
            self.permission_classes = [IsStaffUser] 
        elif self.action in ['reservar', 'cancelar', 'confirmar', 'mis_turnos']:
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
        
        return Turno.objects.filter(q_filter).filter(hora_inicio__gte=now).order_by('hora_inicio')

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
    
    def _validar_limites_plan(self, socio, fecha_turno):
        """Verifica si el socio puede reservar según su plan actual"""
        
        # 1. BUSCAR CUOTA ACTIVA
        cuota = CuotaMensual.objects.filter(
            socio=socio,
            estado='activa',
            fecha_vencimiento__gte=timezone.now().date()
        ).order_by('-fecha_vencimiento').first()

        if not cuota:
            return False, "No tienes una cuota mensual activa. Por favor, regulariza tu situación para reservar turnos."

        plan = cuota.plan
        
        print("=" * 60)
        print(f"🔍 VALIDANDO LÍMITES DEL PLAN")
        print(f"   Socio: {socio.username}")
        print(f"   Plan: {plan.nombre}")
        print(f"   Tipo límite: {plan.tipo_limite}")
        print(f"   Cantidad límite: {plan.cantidad_limite}")

        # 2. SI ES PASE LIBRE, PERMITIR SIN RESTRICCIONES
        if plan.tipo_limite == 'libre':
            print(f"   ✅ Pase Libre - Sin restricciones")
            print("=" * 60)
            return True, None

        # 3. CALCULAR RANGO DE FECHAS SEGÚN TIPO DE LÍMITE
        if plan.tipo_limite == 'semanal':
            # Calcular lunes y domingo de la semana del turno
            fecha_turno_date = fecha_turno.date() if hasattr(fecha_turno, 'date') else fecha_turno
            
            # Lunes de la semana (weekday 0 = lunes)
            dias_desde_lunes = fecha_turno_date.weekday()
            inicio_semana = fecha_turno_date - timedelta(days=dias_desde_lunes)
            fin_semana = inicio_semana + timedelta(days=6)  # Domingo
            
            inicio_rango = timezone.make_aware(
                datetime.combine(inicio_semana, time.min),
                timezone.get_current_timezone()
            )
            fin_rango = timezone.make_aware(
                datetime.combine(fin_semana, time.max),
                timezone.get_current_timezone()
            )
            
            nombre_periodo = f"esta semana ({inicio_semana.strftime('%d/%m')} - {fin_semana.strftime('%d/%m')})"
            tipo_periodo = "semana"
            
        elif plan.tipo_limite == 'diario':
            # Solo contar turnos del mismo día
            fecha_turno_date = fecha_turno.date() if hasattr(fecha_turno, 'date') else fecha_turno
            
            inicio_rango = timezone.make_aware(
                datetime.combine(fecha_turno_date, time.min),
                timezone.get_current_timezone()
            )
            fin_rango = timezone.make_aware(
                datetime.combine(fecha_turno_date, time.max),
                timezone.get_current_timezone()
            )
            
            nombre_periodo = f"hoy ({fecha_turno_date.strftime('%d/%m/%Y')})"
            tipo_periodo = "día"
        else:
            print(f"   ⚠️ Tipo de límite desconocido: {plan.tipo_limite}")
            print("=" * 60)
            return True, None

        print(f"   📅 Rango: {inicio_rango} - {fin_rango}")

        # 4. CONTAR TURNOS YA RESERVADOS EN EL RANGO
        turnos_ocupados = Turno.objects.filter(
            socio=socio,
            estado__in=['RESERVADO', 'CONFIRMADO'],
            hora_inicio__gte=inicio_rango,
            hora_inicio__lte=fin_rango
        ).count()

        print(f"   📊 Turnos ocupados: {turnos_ocupados}/{plan.cantidad_limite}")

        # 5. VALIDAR LÍMITE
        if turnos_ocupados >= plan.cantidad_limite:
            mensaje_error = (
                f"❌ Límite alcanzado\n\n"
                f"Tu plan '{plan.nombre}' permite {plan.cantidad_limite} "
                f"{'turno' if plan.cantidad_limite == 1 else 'turnos'} por {tipo_periodo}.\n\n"
                f"Ya tienes {turnos_ocupados} {'turno reservado' if turnos_ocupados == 1 else 'turnos reservados'} "
                f"{nombre_periodo}."
            )
            print(f"   ❌ LÍMITE ALCANZADO")
            print("=" * 60)
            return False, mensaje_error
        
        print(f"   ✅ Puede reservar (le quedan {plan.cantidad_limite - turnos_ocupados} turnos)")
        print("=" * 60)
        return True, None

    # turnos/views.py - REEMPLAZAR LOS MÉTODOS reservar y cancelar

    @action(methods=['post'], detail=True, permission_classes=[IsStaffUser])
    def reservar_para_socio(self, request, pk=None):
        """Staff puede reservar turnos a nombre de un socio"""
        turno = self.get_object()
        socio_id = request.data.get('socio_id')
        
        if not socio_id:
            return Response({
                'detail': 'Debe proporcionar el ID del socio (socio_id)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            socio = User.objects.get(id=socio_id, is_active=True)
            
            # Verificar que el usuario sea socio
            if not hasattr(socio, 'perfil') or socio.perfil.rol != 'socio':
                return Response({
                    'detail': 'El usuario seleccionado no es un socio activo'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({
                'detail': 'Socio no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if turno.socio is not None or turno.estado != 'DISPONIBLE':
            return Response({
                'detail': 'Cupo no disponible para reserva'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar cuota activa del socio
        cuota = CuotaMensual.objects.filter(
            socio=socio,
            estado='activa',
            fecha_vencimiento__gte=timezone.now().date()
        ).order_by('-fecha_vencimiento').first()

        if not cuota:
            return Response({
                'detail': f'{socio.username} no tiene una cuota mensual activa.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar clases restantes
        should_count = (cuota.plan.tipo_limite == 'semanal' and cuota.plan.cantidad_limite in (2, 3))
        if should_count and cuota.clases_restantes <= 0:
            return Response({
                'detail': f'{socio.username} no tiene clases disponibles este mes.',
                'error_code': 'sin_clases'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar límites del plan
        puede_reservar, mensaje_error = self._validar_limites_plan(socio, turno.hora_inicio)
        if not puede_reservar:
            return Response({
                'detail': mensaje_error,
                'error_code': 'limite_plan'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Confirmar turno
        turno.socio = socio
        turno.estado = 'CONFIRMADO'
        turno.fecha_reserva = timezone.now()
        
        try:
            turno.full_clean()
            turno.save()
            
            # Descontar clase si aplica
            if should_count:
                cuota.descontar_clase()
            
        except ValidationError as e:
            return Response({'detail': e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        mensaje = f'Turno confirmado exitosamente para {socio.username}.'
        if should_count:
            mensaje += f' Le quedan {cuota.clases_restantes} clases este mes.'
        
        return Response({
            'detail': mensaje,
            'clases_restantes': cuota.clases_restantes if should_count else None
        }, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, permission_classes=[IsStaffUser])
    def cancelar_para_socio(self, request, pk=None):
        """Staff puede cancelar turnos de cualquier socio"""
        turno = self.get_object()
        
        if not turno.socio:
            return Response({
                'detail': 'Este turno no tiene un socio asignado'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if turno.estado not in ['RESERVADO', 'CONFIRMADO']:
            return Response({
                'detail': 'Solo se pueden cancelar turnos reservados o confirmados'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        socio = turno.socio
        socio_username = socio.username
        
        # Devolver la clase si aplica
        cuota = CuotaMensual.objects.filter(
            socio=socio,
            estado='activa'
        ).order_by('-fecha_vencimiento').first()
        
        if cuota:
            should_count_cancel = (cuota.plan.tipo_limite == 'semanal' and cuota.plan.cantidad_limite in (2, 3))
            if should_count_cancel:
                cuota.clases_restantes += 1
                
                # No superar el total calculado
                def _effective_limit_from_cuota_obj(cuota_obj):
                    plan = cuota_obj.plan
                    try:
                        cantidad = int(plan.cantidad_limite)
                    except Exception:
                        cantidad = None
                    nombre = (cuota_obj.plan_nombre or '')
                    m = re.search(r"\b(\d+)x\b", nombre.lower())
                    parsed = int(m.group(1)) if m else None
                    return parsed or cantidad

                eff = _effective_limit_from_cuota_obj(cuota)
                if eff:
                    max_total = eff * 4
                    if cuota.clases_restantes > max_total:
                        cuota.clases_restantes = max_total

                cuota.save(update_fields=['clases_restantes'])
                print(f"✅ Clase devuelta a {socio_username}. Restantes: {cuota.clases_restantes}/{cuota.clases_totales}")
        
        # Liberar turno
        turno.estado = 'DISPONIBLE'
        turno.socio = None
        turno.fecha_reserva = None
        turno.save()
        
        mensaje = f'Turno cancelado. Cupo liberado para {socio_username}.'
        clases_totales_calculado = None
        clases_restantes_dev = None
        
        if cuota and should_count_cancel:
            eff = None
            try:
                eff = int(cuota.plan.cantidad_limite)
            except Exception:
                eff = None
            m = re.search(r"\b(\d+)x\b", (cuota.plan_nombre or '').lower())
            parsed = int(m.group(1)) if m else None
            eff = parsed or eff
            if eff:
                clases_totales_calculado = eff * 4
                clases_restantes_dev = min(cuota.clases_restantes, clases_totales_calculado)

            mensaje += f' Clase devuelta. {socio_username} tiene {clases_restantes_dev} clases disponibles.'

        return Response({
            'detail': mensaje,
            'clases_restantes': clases_restantes_dev if clases_restantes_dev is not None else None,
            'clases_totales_calculado': clases_totales_calculado
        }, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True)
    def reservar(self, request, pk=None):
        """Reserva Y confirma el turno directamente + descuenta 1 clase"""
        turno = self.get_object()
        user = request.user

        print("="*50)
        print(f"🔍 Turno ID: {turno.id}")
        print(f"🔍 Usuario: {user.username} (staff={user.is_staff})")
        print("="*50)
        
        # Validar que el usuario NO sea staff
        if user.is_staff:
            return Response({
                'detail': 'Los administradores y entrenadores no pueden reservar turnos.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if turno.socio is not None or turno.estado != 'DISPONIBLE':
            return Response({
                'detail': 'Cupo no disponible para reserva'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 🆕 1. VALIDAR QUE TENGA CUOTA ACTIVA Y CLASES DISPONIBLES
        cuota = CuotaMensual.objects.filter(
            socio=user,
            estado='activa',
            fecha_vencimiento__gte=timezone.now().date()
        ).order_by('-fecha_vencimiento').first()

        if not cuota:
            return Response({
                'detail': 'No tienes una cuota mensual activa. Por favor, regulariza tu situación para reservar turnos.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 🆕 2. VERIFICAR CLASES RESTANTES: Solo contamos/descontamos para planes semanales limitados (ej. 2x o 3x semanal)
        should_count = (cuota.plan.tipo_limite == 'semanal' and cuota.plan.cantidad_limite in (2, 3))
        if should_count and cuota.clases_restantes <= 0:
            return Response({
                'detail': f'No tienes clases disponibles este mes. Has agotado tus {cuota.clases_totales} clases del plan "{cuota.plan_nombre}". Deberás esperar hasta la renovación.',
                'error_code': 'sin_clases'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar límites del plan (semanal/diario)
        puede_reservar, mensaje_error = self._validar_limites_plan(user, turno.hora_inicio)

        if not puede_reservar:
            return Response({
                'detail': mensaje_error,
                'error_code': 'limite_plan'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Confirmar directamente
        turno.socio = user
        turno.estado = 'CONFIRMADO'
        turno.fecha_reserva = timezone.now()
        
        try:
            print("🔄 Llamando a full_clean()...")
            turno.full_clean()
            print("✅ full_clean() OK")
            turno.save()
            print("✅ save() OK")
            
            # 🆕 3. DESCONTAR 1 CLASE: solo para los planes semanales limitados (2x/3x)
            if should_count:
                cuota.descontar_clase()
                print(f"✅ Clase descontada. Restantes: {cuota.clases_restantes}/{cuota.clases_totales}")
            
        except ValidationError as e:
            print(f"❌ ValidationError: {e.message_dict}")
            return Response({'detail': e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"❌ Exception: {type(e).__name__}: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        # 🆕 Calcular total efectivo según plan (para consistencia con frontend)
        def _effective_limit_from_cuota(cuota_obj):
            plan = cuota_obj.plan
            # Preferir cantidad_limite si tiene sentido
            try:
                cantidad = int(plan.cantidad_limite)
            except Exception:
                cantidad = None

            # Intentar parsear del nombre si no hay cantidad válida
            nombre = (cuota_obj.plan_nombre or '')
            m = re.search(r"\b(\d+)x\b", nombre.lower())
            parsed = int(m.group(1)) if m else None

            effective = parsed or cantidad
            return effective

        effective_limit = _effective_limit_from_cuota(cuota)
        clases_totales_calculado = None
        clases_restantes_dev = None
        if should_count and effective_limit:
            clases_totales_calculado = effective_limit * 4
            clases_restantes_dev = min(cuota.clases_restantes, clases_totales_calculado)

        # Mensaje personalizado con clases restantes
        mensaje = 'Turno confirmado con éxito. Puedes cancelarlo hasta 1 hora antes.'
        if should_count:
            mensaje += f' Te quedan {clases_restantes_dev} clases este mes.'

        resp = {
            'detail': mensaje,
            'clases_restantes': clases_restantes_dev if should_count else None,
            'clases_totales_calculado': clases_totales_calculado
        }

        return Response(resp, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True)
    def cancelar(self, request, pk=None):
        """Cancela el turno si falta más de 1 hora + DEVUELVE la clase"""
        turno = self.get_object()
        user = request.user
        
        if turno.socio != user:
            return Response({
                'detail': 'No tienes permiso para cancelar este turno.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verificar que falte más de 1 hora
        if turno.hora_inicio <= timezone.now() + timedelta(hours=1):
            return Response({
                'detail': 'No se puede cancelar un turno con menos de 1 hora de anticipación. La clase se descontará.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if turno.estado in ['RESERVADO', 'CONFIRMADO']:
            # 🆕 DEVOLVER LA CLASE (solo para planes semanales limitados)
            cuota = CuotaMensual.objects.filter(
                socio=user,
                estado='activa'
            ).order_by('-fecha_vencimiento').first()
            
            if cuota:
                should_count_cancel = (cuota.plan.tipo_limite == 'semanal' and cuota.plan.cantidad_limite in (2, 3))
                if should_count_cancel:
                    cuota.clases_restantes += 1
                    # No superar el total calculado (usar misma regla que en reservar)
                    # Calcular effective limit
                    def _effective_limit_from_cuota_obj(cuota_obj):
                        plan = cuota_obj.plan
                        try:
                            cantidad = int(plan.cantidad_limite)
                        except Exception:
                            cantidad = None
                        nombre = (cuota_obj.plan_nombre or '')
                        m = re.search(r"\b(\d+)x\b", nombre.lower())
                        parsed = int(m.group(1)) if m else None
                        return parsed or cantidad

                    eff = _effective_limit_from_cuota_obj(cuota)
                    if eff:
                        max_total = eff * 4
                        if cuota.clases_restantes > max_total:
                            cuota.clases_restantes = max_total

                    cuota.save(update_fields=['clases_restantes'])
                    print(f"✅ Clase devuelta. Restantes: {cuota.clases_restantes}/{cuota.clases_totales}")
            
            turno.estado = 'DISPONIBLE'
            turno.socio = None
            turno.fecha_reserva = None
            turno.save()
            
            mensaje = 'Turno cancelado, cupo liberado.'
            clases_totales_calculado = None
            clases_restantes_dev = None
            if cuota and should_count_cancel:
                # Calcular effective total
                eff = None
                try:
                    eff = int(cuota.plan.cantidad_limite)
                except Exception:
                    eff = None
                m = re.search(r"\b(\d+)x\b", (cuota.plan_nombre or '').lower())
                parsed = int(m.group(1)) if m else None
                eff = parsed or eff
                if eff:
                    clases_totales_calculado = eff * 4
                    clases_restantes_dev = min(cuota.clases_restantes, clases_totales_calculado)

                mensaje += f' Clase devuelta. Tienes {clases_restantes_dev} clases disponibles.'

            return Response({
                'detail': mensaje,
                'clases_restantes': clases_restantes_dev if clases_restantes_dev is not None else None,
                'clases_totales_calculado': clases_totales_calculado
            }, status=status.HTTP_200_OK)
        
        return Response({
            'detail': 'No se puede cancelar este turno'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='mis_turnos', permission_classes=[IsAuthenticated])
    def mis_turnos(self, request):
        """Devuelve los turnos del usuario autenticado"""
        turnos = Turno.objects.filter(socio=request.user).order_by('hora_inicio')
        serializer = self.get_serializer(turnos, many=True)
        return Response(serializer.data)