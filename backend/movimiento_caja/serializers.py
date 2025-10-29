# backend/movimiento_caja/serializers.py
from rest_framework import serializers
from .models import Caja, MovimientoDeCaja

class MovimientoDeCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoDeCaja
        fields = '__all__'

class CajaSerializer(serializers.ModelSerializer):
    closing_system_amount = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )
    difference_amount = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )
    movimientos = MovimientoDeCajaSerializer(many=True, read_only=True)

    class Meta:
        model = Caja
        fields = [
            'id', 'empleado_apertura', 'fecha_apertura', 'monto_inicial',
            'empleado_cierre', 'fecha_cierre', 'estado',
            'closing_counted_amount', 'closing_system_amount', 'difference_amount',
            'notas', 'movimientos'
        ]
