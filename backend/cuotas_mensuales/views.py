# cuotas_mensuales/views.py

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
    RenovarCuotaSerializer
)
from movimiento_caja.models import Caja, MovimientoDeCaja


class PlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar planes
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    
    def get_permissions(self):
        # GET (list, retrieve) es público para el landing page
        if self.action in ['list', 'retrieve', 'planes_activos']:
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
        return CuotaMensualSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Si es admin o entrenador, ver todas las cuotas
        if user.groups.filter(name__in=['admin', 'entrenador']).exists():
            return CuotaMensual.objects.all().select_related('socio', 'plan')
        
        # Si es socio, solo ver sus propias cuotas
        return CuotaMensual.objects.filter(socio=user).select_related('plan')
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mi_cuota(self, request):
        """
        Endpoint para que el socio obtenga su cuota actual
        """
        # Buscar la cuota activa del socio
        cuota = CuotaMensual.objects.filter(
            socio=request.user,
            estado__in=['activa', 'vencida']
        ).order_by('-fecha_inicio').first()
        
        if not cuota:
            return Response(
                {'detail': 'No tienes una cuota mensual activa'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(cuota)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def cuotas_activas(self, request):
        """Listar todas las cuotas activas (admin/entrenador)"""
        if not request.user.groups.filter(name__in=['admin', 'entrenador']).exists():
            return Response(
                {'detail': 'No tienes permisos para esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cuotas = CuotaMensual.objects.filter(estado='activa').select_related('socio', 'plan')
        serializer = CuotaMensualSerializer(cuotas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def cuotas_vencidas(self, request):
        """Listar todas las cuotas vencidas (admin/entrenador)"""
        if not request.user.groups.filter(name__in=['admin', 'entrenador']).exists():
            return Response(
                {'detail': 'No tienes permisos para esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cuotas = CuotaMensual.objects.filter(estado='vencida').select_related('socio', 'plan')
        serializer = CuotaMensualSerializer(cuotas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def renovar(self, request, pk=None):
        """
        Renovar una cuota mensual Y registrar el pago en caja
        """
        cuota = self.get_object()
        
        # Verificar permisos
        if not request.user.groups.filter(name__in=['admin', 'entrenador']).exists():
            return Response(
                {'detail': 'No tienes permisos para renovar cuotas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que hay caja abierta
        caja_abierta = Caja.objects.filter(estado='ABIERTA').first()
        if not caja_abierta:
            return Response(
                {
                    'detail': 'No hay caja abierta. Debes abrir una caja antes de registrar pagos.',
                    'error': 'NO_CAJA_ABIERTA'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = RenovarCuotaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Renovar la cuota
        nueva_fecha = serializer.validated_data.get('fecha_vencimiento')
        cuota.renovar(nueva_fecha_vencimiento=nueva_fecha)
        
        # Registrar el pago
        monto = serializer.validated_data.get('monto', cuota.plan_precio)
        metodo_pago = serializer.validated_data.get('metodo_pago', 'tarjeta')
        
        # Crear historial de pago
        historial_pago = HistorialPago.objects.create(
            cuota=cuota,
            monto=monto,
            metodo_pago=metodo_pago,
            referencia=f"Renovación cuota #{cuota.id}",
            notas=f"Renovado por {request.user.username}"
        )
        
        # 🔥 REGISTRAR EN CAJA
        try:
            # Determinar tipo de pago para caja
            tipo_pago_caja = 'efectivo' if metodo_pago == 'efectivo' else 'transferencia'
            
            movimiento = MovimientoDeCaja.objects.create(
                caja=caja_abierta,
                tipo='ingreso',
                monto=monto,
                tipo_pago=tipo_pago_caja,
                descripcion=f"Renovación cuota - {cuota.socio.username} - {cuota.plan_nombre}",
                creado_por=request.user.perfil
            )
            
            # Vincular movimiento con historial
            historial_pago.movimiento_caja_id = movimiento.id
            historial_pago.save()
            
            print(f"✅ Movimiento de caja creado: ID {movimiento.id}")
            
            return Response({
                'detail': 'Cuota renovada exitosamente y registrada en caja',
                'cuota': CuotaMensualSerializer(cuota).data,
                'movimiento_caja_id': movimiento.id,
                'monto': float(monto)
            })
                
        except Exception as e:
            # Si falla la creación del movimiento, revertir todo
            print(f"❌ Error al crear movimiento de caja: {str(e)}")
            raise  # Esto hará rollback de la transacción completa
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def suspender(self, request, pk=None):
        """Suspender una cuota"""
        cuota = self.get_object()
        
        if not request.user.groups.filter(name__in=['admin', 'entrenador']).exists():
            return Response(
                {'detail': 'No tienes permisos para suspender cuotas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cuota.estado = 'suspendida'
        cuota.save()
        
        return Response({
            'detail': 'Cuota suspendida exitosamente',
            'cuota': CuotaMensualSerializer(cuota).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancelar(self, request, pk=None):
        """Cancelar una cuota"""
        cuota = self.get_object()
        
        if not request.user.groups.filter(name__in=['admin', 'entrenador']).exists():
            return Response(
                {'detail': 'No tienes permisos para cancelar cuotas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cuota.estado = 'cancelada'
        cuota.save()
        
        return Response({
            'detail': 'Cuota cancelada exitosamente',
            'cuota': CuotaMensualSerializer(cuota).data
        })


class HistorialPagoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver el historial de pagos
    """
    queryset = HistorialPago.objects.all()
    serializer_class = HistorialPagoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin/entrenador pueden ver todos los pagos
        if user.groups.filter(name__in=['admin', 'entrenador']).exists():
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