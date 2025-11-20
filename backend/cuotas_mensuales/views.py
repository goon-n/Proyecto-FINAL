# cuotas_mensuales/views.py - CORREGIDO COMPLETO

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from datetime import timedelta

from .models import Plan, CuotaMensual, HistorialPago
from .serializers import (
    PlanSerializer,
    CuotaMensualSerializer,
    CuotaMensualCreateSerializer,
    CuotaMensualSocioSerializer,
    HistorialPagoSerializer,
    RenovarCuotaSerializer,
    SolicitudRenovacionSerializer
)
from movimiento_caja.models import Caja, MovimientoDeCaja
from django.contrib.auth.models import User
from decimal import Decimal


class PlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar planes
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    
    def get_permissions(self):
        # GET (list, retrieve) es público para el landing page
        if self.action in ['list', 'retrieve', 'planes_activos', 'plan_popular']:
            return [AllowAny()]
        # POST, PUT, DELETE requieren autenticación
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def planes_activos(self, request):
        """Obtener solo planes activos (para landing page)"""
        planes = Plan.objects.filter(activo=True).order_by('precio')
        serializer = self.get_serializer(planes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def plan_popular(self, request):
        """Obtener el plan marcado como popular"""
        plan = Plan.objects.filter(activo=True, es_popular=True).first()
        if plan:
            serializer = self.get_serializer(plan)
            return Response(serializer.data)
        return Response({'detail': 'No hay plan popular configurado'}, status=404)


def _is_admin_or_entrenador(user):
    """
    ✅ FUNCIÓN AUXILIAR GLOBAL - Verificar si el usuario es admin o entrenador
    """
    if not user or not user.is_authenticated:
        return False
    
    # Verificar por perfil
    if hasattr(user, 'perfil'):
        if user.perfil.rol in ['admin', 'entrenador']:
            return True
    
    # Verificar por grupos
    if user.groups.filter(name__in=['admin', 'entrenador']).exists():
        return True
    
    # Verificar por is_staff (por si acaso)
    if user.is_staff:
        return True
    
    return False


class CuotaMensualViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar cuotas mensuales
    """
    queryset = CuotaMensual.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CuotaMensualCreateSerializer
        elif self.action == 'mi_cuota':
            return CuotaMensualSocioSerializer
        elif self.action == 'solicitar_renovacion':
            return SolicitudRenovacionSerializer
        return CuotaMensualSerializer
    
    def get_queryset(self):
        """
        ✅ CORREGIDO: Usar la función global para verificar permisos
        """
        user = self.request.user
        
        # Admin o entrenador ven todas las cuotas
        if _is_admin_or_entrenador(user):
            return CuotaMensual.objects.all().select_related('socio', 'plan')
        
        # Socio solo ve sus propias cuotas
        return CuotaMensual.objects.filter(socio=user).select_related('plan')
    
    def list(self, request, *args, **kwargs):
        """
        ✅ CORREGIDO: Listar cuotas con logging para debug
        """
        user = request.user
        print("=" * 60)
        print(f"📋 LIST CUOTAS - Usuario: {user.username}")
        print(f"   Is authenticated: {user.is_authenticated}")
        print(f"   Has perfil: {hasattr(user, 'perfil')}")
        if hasattr(user, 'perfil'):
            print(f"   Rol: {user.perfil.rol}")
        print(f"   Is admin/entrenador: {_is_admin_or_entrenador(user)}")
        
        queryset = self.get_queryset()
        print(f"   Cuotas encontradas: {queryset.count()}")
        print("=" * 60)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mi_cuota(self, request):
        """
        Endpoint para que el socio obtenga su cuota actual
        """
        print("=" * 60)
        print(f"📋 MI_CUOTA - Usuario: {request.user.username}")
        
        # Buscar la cuota activa del socio
        cuota = CuotaMensual.objects.filter(
            socio=request.user,
            estado__in=['activa', 'vencida']
        ).order_by('-fecha_inicio').first()
        
        if not cuota:
            print(f"   ❌ No se encontró cuota para {request.user.username}")
            print("=" * 60)
            return Response(
                {'detail': 'No tienes una cuota mensual activa'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        print(f"   ✅ Cuota encontrada: {cuota.id} - Estado: {cuota.estado}")
        print("=" * 60)
        
        serializer = self.get_serializer(cuota)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def cuotas_activas(self, request):
        """
        ✅ CORREGIDO: Usar función global
        """
        if not _is_admin_or_entrenador(request.user):
            return Response(
                {'detail': 'No tienes permisos para esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cuotas = CuotaMensual.objects.filter(estado='activa').select_related('socio', 'plan')
        serializer = CuotaMensualSerializer(cuotas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def cuotas_vencidas(self, request):
        """
        ✅ CORREGIDO: Usar función global
        """
        if not _is_admin_or_entrenador(request.user):
            return Response(
                {'detail': 'No tienes permisos para esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cuotas = CuotaMensual.objects.filter(estado='vencida').select_related('socio', 'plan')
        serializer = CuotaMensualSerializer(cuotas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def solicitar_renovacion(self, request):
        """
        Endpoint para que el SOCIO solicite renovación de su cuota
        ACTUALIZA la cuota existente en lugar de crear nueva
        """
        
        # 1. VERIFICAR PERMISOS (SOLO SOCIO)
        if not hasattr(request.user, 'perfil') or request.user.perfil.rol != 'socio':
            return Response(
                {'detail': 'Solo los socios pueden solicitar renovación'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 2. OBTENER CUOTA ACTUAL (SOLO VENCIDA)
        cuota_actual = CuotaMensual.objects.filter(
            socio=request.user,
            estado='vencida'
        ).order_by('-fecha_inicio').first()
        
        if not cuota_actual:
            return Response(
                {'detail': 'No tienes una cuota vencida para renovar'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 3. OBTENER DATOS Y VALIDAR PAGO
        nuevo_plan_id = request.data.get('plan_id')
        metodo_pago = request.data.get('metodo_pago', 'tarjeta')
        tarjeta_ultimos_4 = request.data.get('tarjeta_ultimos_4', '')
        
        # RESTRICCIÓN DE PAGO: SOLO TARJETA
        if metodo_pago != 'tarjeta':
            return Response(
                {'detail': 'El socio solo puede renovar con el método de pago Tarjeta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not tarjeta_ultimos_4 or len(str(tarjeta_ultimos_4)) < 4:
            return Response(
                {'detail': 'Se requieren los últimos 4 dígitos de la tarjeta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 4. DETERMINAR NUEVO PLAN
        if nuevo_plan_id:
            try:
                nuevo_plan = Plan.objects.get(id=nuevo_plan_id, activo=True)
            except Plan.DoesNotExist:
                return Response(
                    {'detail': 'El plan seleccionado no existe o no está activo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            nuevo_plan = cuota_actual.plan
        
        # 5. VERIFICAR CAJA ABIERTA
        caja_abierta = Caja.objects.filter(estado='ABIERTA').first()
        if not caja_abierta:
            return Response(
                {
                    'detail': 'El sistema de pagos no está disponible. Contacta con la administración.',
                    'error': 'NO_CAJA_ABIERTA'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # 6. ✅ ACTUALIZAR CUOTA EXISTENTE
        try:
            with transaction.atomic():
                plan_anterior = cuota_actual.plan
                
                # Actualizar la cuota existente
                fecha_inicio = timezone.now().date()
                fecha_vencimiento = fecha_inicio + timedelta(days=30)
                
                cuota_actual.plan = nuevo_plan
                cuota_actual.plan_nombre = nuevo_plan.nombre
                cuota_actual.plan_precio = nuevo_plan.precio
                cuota_actual.fecha_inicio = fecha_inicio
                cuota_actual.fecha_vencimiento = fecha_vencimiento
                cuota_actual.estado = 'activa'
                cuota_actual.tarjeta_ultimos_4 = str(tarjeta_ultimos_4)[-4:]
                cuota_actual.save()
                
                print(f"✅ CUOTA ACTUALIZADA (Socio):")
                print(f"   Cuota ID: {cuota_actual.id}")
                print(f"   Estado: {cuota_actual.estado}")
                print(f"   Fecha vencimiento: {cuota_actual.fecha_vencimiento}")
                
                # Registrar el pago en historial
                historial_pago = HistorialPago.objects.create(
                    cuota=cuota_actual,
                    monto=nuevo_plan.precio,
                    metodo_pago=metodo_pago,
                    referencia=f"Renovación - {metodo_pago} {'****' + str(tarjeta_ultimos_4)[-4:]}",
                    notas=f"Renovación autogestionada - Plan anterior: {plan_anterior.nombre}"
                )
                
                # Registrar en caja
                MovimientoDeCaja.objects.create(
                    caja=caja_abierta,
                    tipo='ingreso',
                    monto=nuevo_plan.precio,
                    tipo_pago='tarjeta',
                    descripcion=f"Renovación cuota (autogestionada) - {request.user.username} - {nuevo_plan.nombre}",
                    creado_por=request.user.perfil
                )
                
                cambio_plan = nuevo_plan.id != plan_anterior.id
                mensaje = '¡Renovación exitosa!'
                if cambio_plan:
                    mensaje += f' Has cambiado de {plan_anterior.nombre} a {nuevo_plan.nombre}'
                
                return Response({
                    'success': True,
                    'detail': mensaje,
                    'cuota': CuotaMensualSocioSerializer(cuota_actual).data,
                    'cambio_plan': cambio_plan,
                    'plan_anterior': plan_anterior.nombre,
                    'plan_nuevo': nuevo_plan.nombre,
                    'monto': float(nuevo_plan.precio)
                }, status=status.HTTP_200_OK)
                    
        except Exception as e:
            print(f"❌ Error al procesar renovación: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': f'Error interno al procesar la renovación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def crear_con_pago(self, request):
        """
        Endpoint para crear cuota con pago y registro en caja
        Usado por admin/entrenador al dar de alta un socio
        """
        # Verificar permisos
        if not _is_admin_or_entrenador(request.user):
            return Response(
                {'detail': 'No tienes permisos para esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar datos requeridos
        socio_id = request.data.get('socio')
        plan_id = request.data.get('plan')
        monto = request.data.get('monto')
        metodo_pago = request.data.get('metodo_pago', 'efectivo')
        tarjeta_ultimos_4 = request.data.get('tarjeta_ultimos_4', '')
        
        if not socio_id or not plan_id or not monto:
            return Response(
                {'error': 'Faltan datos obligatorios: socio, plan, monto'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener socio y plan
        try:
            socio = User.objects.get(id=socio_id, perfil__rol='socio')
            plan = Plan.objects.get(id=plan_id, activo=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'El socio no existe o no tiene rol de socio'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Plan.DoesNotExist:
            return Response(
                {'error': 'El plan no existe o no está activo'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar caja abierta
        caja_abierta = Caja.objects.filter(estado='ABIERTA').first()
        if not caja_abierta:
            return Response(
                {
                    'error': 'No hay caja abierta',
                    'detail': 'Debe haber una caja abierta para registrar pagos'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear cuota mensual
        fecha_inicio = timezone.now().date()
        fecha_vencimiento = fecha_inicio + timedelta(days=30)
        
        cuota = CuotaMensual.objects.create(
            socio=socio,
            plan=plan,
            plan_nombre=plan.nombre,
            plan_precio=plan.precio,
            fecha_inicio=fecha_inicio,
            fecha_vencimiento=fecha_vencimiento,
            estado='activa',
            tarjeta_ultimos_4=tarjeta_ultimos_4 if tarjeta_ultimos_4 else ''
        )
        
        # Crear historial de pago
        referencia = f"Alta de socio - {plan.nombre}"
        if tarjeta_ultimos_4:
            referencia += f" - Tarjeta **** {tarjeta_ultimos_4}"
        
        historial_pago = HistorialPago.objects.create(
            cuota=cuota,
            monto=monto,
            metodo_pago=metodo_pago,
            referencia=referencia
        )
        
        # Registrar movimiento en caja
        try:
            descripcion_caja = f"Alta socio: {socio.username} - Plan: {plan.nombre}"
            if tarjeta_ultimos_4:
                descripcion_caja += f" - Tarjeta **** {tarjeta_ultimos_4}"
            
            MovimientoDeCaja.objects.create(
                caja=caja_abierta,
                tipo='ingreso',
                monto=monto,
                tipo_pago=metodo_pago,
                descripcion=descripcion_caja,
                creado_por=request.user.perfil
            )
            
            return Response({
                'success': True,
                'detail': f'Cuota creada y pago registrado exitosamente',
                'cuota_id': cuota.id,
                'socio': socio.username,
                'plan': plan.nombre,
                'monto': float(monto),
                'metodo_pago': metodo_pago
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            historial_pago.delete()
            cuota.delete()
            return Response(
                {'error': f'Error al registrar en caja: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def renovar(self, request, pk=None):
        """
        Renovar una cuota mensual ACTUALIZANDO la existente (no crea nueva)
        """
        cuota = self.get_object()
        
        # ✅ LOG INICIAL
        print("=" * 60)
        print(f"🔄 INICIANDO RENOVACIÓN")
        print(f"   Cuota ID: {cuota.id}")
        print(f"   Socio: {cuota.socio.username}")
        print(f"   Estado actual: {cuota.estado}")
        print(f"   Fecha vencimiento actual: {cuota.fecha_vencimiento}")
        
        # 1. VERIFICAR PERMISOS
        if not _is_admin_or_entrenador(request.user):
            return Response(
                {'detail': 'No tienes permisos para renovar cuotas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 2. VERIFICAR QUE LA CUOTA ESTÉ VENCIDA
        if cuota.estado != 'vencida':
            return Response(
                {'detail': 'Solo se pueden renovar cuotas vencidas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 3. VERIFICAR CAJA ABIERTA
        caja_abierta = Caja.objects.filter(estado='ABIERTA').first()
        if not caja_abierta:
            return Response(
                {
                    'detail': 'No hay caja abierta. Debes abrir una caja antes de registrar pagos.',
                    'error': 'NO_CAJA_ABIERTA'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 4. OBTENER DATOS Y VALIDAR PAGO
        monto = Decimal(request.data.get('monto'))
        metodo_pago = request.data.get('metodo_pago', 'efectivo')
        nuevo_plan_id = request.data.get('plan_id')
        referencia = request.data.get('referencia', '')
        
        if monto <= 0:
            return Response({'detail': 'El monto a pagar debe ser positivo.'}, status=status.HTTP_400_BAD_REQUEST)

        # 5. DETERMINAR NUEVO PLAN
        plan_anterior = cuota.plan
        
        if nuevo_plan_id:
            try:
                nuevo_plan = Plan.objects.get(id=nuevo_plan_id, activo=True)
            except Plan.DoesNotExist:
                return Response(
                    {'detail': 'El plan seleccionado no existe o no está activo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            nuevo_plan = plan_anterior

        # 6. ✅ CALCULAR NUEVAS FECHAS
        fecha_inicio_nueva = timezone.now().date()
        fecha_vencimiento_nueva = fecha_inicio_nueva + timedelta(days=30)
        
        print(f"📅 FECHAS CALCULADAS:")
        print(f"   Fecha inicio nueva: {fecha_inicio_nueva}")
        print(f"   Fecha vencimiento nueva: {fecha_vencimiento_nueva}")
        
        # 7. ✅ ACTUALIZAR LA CUOTA EXISTENTE (NO CREAR NUEVA)
        try:
            with transaction.atomic():
                # Actualizar la cuota existente
                cuota.plan = nuevo_plan
                cuota.plan_nombre = nuevo_plan.nombre
                cuota.plan_precio = monto
                cuota.fecha_inicio = fecha_inicio_nueva
                cuota.fecha_vencimiento = fecha_vencimiento_nueva
                cuota.estado = 'activa'
                
                if metodo_pago == 'tarjeta' and referencia.isdigit() and len(referencia) == 4:
                    cuota.tarjeta_ultimos_4 = referencia
                
                cuota.save()
                
                print(f"✅ CUOTA ACTUALIZADA:")
                print(f"   Cuota ID: {cuota.id} (misma)")
                print(f"   Estado nuevo: {cuota.estado}")
                print(f"   Fecha inicio: {cuota.fecha_inicio}")
                print(f"   Fecha vencimiento: {cuota.fecha_vencimiento}")
                print("=" * 60)

                # Registrar el pago en historial
                historial_pago = HistorialPago.objects.create(
                    cuota=cuota,
                    monto=monto,
                    metodo_pago=metodo_pago,
                    referencia=referencia,
                    notas=f"Renovación por {request.user.username}. Plan anterior: {plan_anterior.nombre}"
                )
                
                # REGISTRAR EN CAJA
                MovimientoDeCaja.objects.create(
                    caja=caja_abierta,
                    tipo='ingreso',
                    monto=monto,
                    tipo_pago=metodo_pago,
                    descripcion=f"Renovación cuota - {cuota.socio.username} - {nuevo_plan.nombre}",
                    creado_por=request.user.perfil
                )
                
                cambio_plan = nuevo_plan.id != plan_anterior.id
                mensaje = 'Cuota renovada exitosamente.'
                if cambio_plan:
                    mensaje += f' Cambio de {plan_anterior.nombre} a {nuevo_plan.nombre} aplicado.'

                return Response({
                    'detail': mensaje,
                    'cuota': CuotaMensualSerializer(cuota).data,
                    'monto': float(monto),
                    'cambio_plan': cambio_plan
                })
                    
        except Exception as e:
            print(f"❌ Error al renovar: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': f'Error al procesar la renovación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HistorialPagoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HistorialPago.objects.all()
    serializer_class = HistorialPagoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin/entrenador pueden ver todos los pagos
        if _is_admin_or_entrenador(user):
            return HistorialPago.objects.all().select_related('cuota', 'cuota__socio')
        
        # Socio solo ve sus propios pagos
        return HistorialPago.objects.filter(
            cuota__socio=user
        ).select_related('cuota')
    
    @action(detail=False, methods=['get'])
    def mis_pagos(self, request):
        """Historial de pagos del socio actual"""
        pagos = HistorialPago.objects.filter(
            cuota__socio=request.user
        ).select_related('cuota').order_by('-fecha_pago')
        
        serializer = self.get_serializer(pagos, many=True)
        return Response(serializer.data)