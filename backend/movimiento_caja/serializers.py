from rest_framework import serializers
from .models import Caja, MovimientoDeCaja

class MovimientoDeCajaSerializer(serializers.ModelSerializer):
    creado_por_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = MovimientoDeCaja
        fields = '__all__'
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.user.first_name} {obj.creado_por.user.last_name}".strip() or obj.creado_por.user.username
        return "Sistema"

class CajaSerializer(serializers.ModelSerializer):
    closing_system_amount = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )
    difference_amount = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )
    efectivo_esperado = serializers.SerializerMethodField()
    transferencia_esperada = serializers.SerializerMethodField()
    
    # 🔥 AGREGAR campos para mostrar nombres
    empleado_apertura_nombre = serializers.SerializerMethodField()
    empleado_cierre_nombre = serializers.SerializerMethodField()
    
    movimientos = MovimientoDeCajaSerializer(many=True, read_only=True)

    class Meta:
        model = Caja
        fields = [
            'id', 'empleado_apertura', 'fecha_apertura', 'monto_inicial',
            'empleado_cierre', 'fecha_cierre', 'estado',
            'closing_counted_amount', 'closing_system_amount', 'difference_amount',
            'notas', 'movimientos',
            'efectivo_esperado', 'transferencia_esperada',
            'empleado_apertura_nombre', 'empleado_cierre_nombre'  # 🔥 AGREGAR
        ]
    
    def get_efectivo_esperado(self, obj):
        """Calcular cuánto efectivo debería haber"""
        total = obj.monto_inicial
        
        for mov in obj.movimientos.filter(tipo_pago='efectivo'):
            if mov.tipo == "ingreso":
                total += mov.monto
            elif mov.tipo == "egreso":
                total -= mov.monto
        
        return total
    
    def get_transferencia_esperada(self, obj):
        """Calcular cuánto en transferencias debería haber"""
        total = 0
        
        for mov in obj.movimientos.filter(tipo_pago='transferencia'):
            if mov.tipo == "ingreso":
                total += mov.monto
            elif mov.tipo == "egreso":
                total -= mov.monto
        
        return total
    
    # MÉTODOS PARA OBTENER NOMBRES
    def get_empleado_apertura_nombre(self, obj):
        if obj.empleado_apertura:
            user = obj.empleado_apertura.user
            return f"{user.first_name} {user.last_name}".strip() or user.username
        return "No registrado"
    
    def get_empleado_cierre_nombre(self, obj):
        if obj.empleado_cierre:
            user = obj.empleado_cierre.user
            return f"{user.first_name} {user.last_name}".strip() or user.username
        return None