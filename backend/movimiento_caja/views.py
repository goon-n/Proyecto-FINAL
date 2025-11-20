# movimiento_caja/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Caja, MovimientoDeCaja
from .serializers import CajaSerializer, MovimientoDeCajaSerializer
from rest_framework.pagination import PageNumberPagination


class CajaPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all().order_by('-fecha_apertura')
    serializer_class = CajaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CajaPagination
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    
    # ✅ PERMITIR ACCESO PÚBLICO A ESTE ENDPOINT
    def get_permissions(self):
        """
        Permitir acceso sin autenticación solo al endpoint 'actual'
        """
        if self.action == 'actual':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def actual(self, request):
        """Obtener la caja actualmente abierta - ENDPOINT PÚBLICO"""
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
        
        serializer.save(empleado_apertura=self.request.user.perfil)
    
    def perform_update(self, serializer):
        """Al cerrar caja, registrar diferencia si existe (solo informativo)"""
        caja = self.get_object()
        
        # Solo procesar si se está cerrando la caja
        if serializer.validated_data.get('estado') == 'CERRADA' and caja.estado == 'ABIERTA':
            closing_counted_amount = serializer.validated_data.get('closing_counted_amount')
            
            # Guardar el cierre
            caja_cerrada = serializer.save(
                empleado_cierre=self.request.user.perfil,
                fecha_cierre=timezone.now()
            )
            
            # REGISTRAR DIFERENCIA SI EXISTE (SOLO INFORMATIVO)
            if closing_counted_amount is not None:
                diferencia = caja_cerrada.difference_amount
                
                # Solo registrar si hay diferencia (no es 0)
                if diferencia != 0:
                    # 🔧 CORREGIDO: Invertir la lógica
                    if diferencia > 0:
                        tipo_texto = "sobrante" 
                    else:
                        tipo_texto = "faltante"  
                    
                    descripcion = f"Caja cerrada con {tipo_texto} de ${abs(diferencia):,.2f}"
                    
                    # Crear movimiento INFORMATIVO (tipo 'cierre' con monto 0)
                    MovimientoDeCaja.objects.create(
                        caja=caja_cerrada,
                        tipo='cierre',
                        monto=0,
                        tipo_pago='',
                        descripcion=descripcion,
                        creado_por=self.request.user.perfil
                    )
                    
                    print(f"✅ Registro informativo creado: {tipo_texto} ${abs(diferencia)}")
        else:
            # Si no es cierre, solo actualizar normalmente
            serializer.save()


class MovimientoDeCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoDeCaja.objects.all().order_by('-fecha')
    serializer_class = MovimientoDeCajaSerializer
    filterset_fields = ['caja']
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']
    
    def perform_create(self, serializer):
        """Guardar el usuario que creó el movimiento"""
        serializer.save(creado_por=self.request.user.perfil)