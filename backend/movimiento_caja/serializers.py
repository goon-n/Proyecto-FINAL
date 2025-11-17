# movimiento_caja/serializers.py

from rest_framework import serializers
from .models import Caja, MovimientoDeCaja

class MovimientoDeCajaSerializer(serializers.ModelSerializer):
    creado_por_nombre = serializers.CharField(source='creado_por.user.username', read_only=True)
    
    #  Mostrar info de la compra si existe
    compra_info = serializers.SerializerMethodField()
    
    class Meta:
        model = MovimientoDeCaja
        fields = [
            'id', 'caja', 'tipo', 'monto', 'tipo_pago', 
            'descripcion', 'fecha', 'creado_por', 'creado_por_nombre',
            'compra', 'compra_info'  
        ]
        read_only_fields = ['creado_por', 'fecha']
    
    def get_compra_info(self, obj):
        """Devolver información de la compra relacionada"""
        if obj.compra:
            return {
                'id': obj.compra.id,
                'proveedor': obj.compra.proveedor.nombre,
                'total': float(obj.compra.total),
                'fecha': obj.compra.fecha
            }
        return None


class CajaSerializer(serializers.ModelSerializer):
    empleado_apertura_nombre = serializers.CharField(
        source='empleado_apertura.user.username', 
        read_only=True
    )
    empleado_cierre_nombre = serializers.CharField(
        source='empleado_cierre.user.username', 
        read_only=True
    )
    closing_system_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    difference_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    
    #  Propiedades calculadas
    efectivo_esperado = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    transferencia_esperada = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    
    tarjeta_esperada = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    
    class Meta:
        model = Caja
        fields = [
            'id', 'empleado_apertura', 'empleado_apertura_nombre',
            'fecha_apertura', 'monto_inicial', 'empleado_cierre',
            'empleado_cierre_nombre', 'fecha_cierre', 'estado',
            'closing_counted_amount', 'closing_system_amount',
            'difference_amount', 'notas',
            'efectivo_esperado', 'transferencia_esperada', 
            'tarjeta_esperada'  # ⭐ Agregar este
        ]
        read_only_fields = ['empleado_apertura', 'fecha_apertura', 'empleado_cierre', 'fecha_cierre']