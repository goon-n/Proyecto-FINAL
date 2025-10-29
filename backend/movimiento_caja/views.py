from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Caja, MovimientoDeCaja
from .serializers import CajaSerializer, MovimientoDeCajaSerializer

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all().order_by('-fecha_apertura')
    serializer_class = CajaSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    
    @action(detail=False, methods=['get'])
    def actual(self, request):
        """Obtener la caja actualmente abierta"""
        caja = Caja.objects.filter(estado='ABIERTA').first()
        if caja:
            serializer = self.get_serializer(caja)
            return Response(serializer.data)
        return Response({'detail': 'No hay caja abierta'}, status=status.HTTP_404_NOT_FOUND)
    
    def perform_create(self, serializer):
        """Al crear caja, verificar que no haya otra abierta"""
        if Caja.objects.filter(estado='ABIERTA').exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Ya existe una caja abierta. Ciérrala antes de abrir una nueva.')
        
        # Guardar el usuario que abre la caja
        serializer.save(empleado_apertura=self.request.user.perfil)
    
    def perform_update(self, serializer):
        """Al cerrar caja, guardar el usuario que cierra"""
        caja = self.get_object()
        if serializer.validated_data.get('estado') == 'CERRADA' and caja.estado == 'ABIERTA':
            serializer.save(
                empleado_cierre=self.request.user.perfil,
                fecha_cierre=timezone.now()
            )
        else:
            serializer.save()

class MovimientoDeCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoDeCaja.objects.all().order_by('-fecha')
    serializer_class = MovimientoDeCajaSerializer
    filterset_fields = ['caja']
    permission_classes = [permissions.IsAuthenticated]
    # ❌ ELIMINAR la opción de DELETE (no se puede borrar movimientos)
    http_method_names = ['get', 'post', 'head', 'options']
    
    def perform_create(self, serializer):
        """Guardar el usuario que creó el movimiento"""
        serializer.save(creado_por=self.request.user.perfil)