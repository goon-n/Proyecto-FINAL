# cuotas_mensuales/serializers.py - ARCHIVO COMPLETO CORREGIDO

from rest_framework import serializers
from .models import Plan, CuotaMensual, HistorialPago
from django.contrib.auth.models import User

class PlanSerializer(serializers.ModelSerializer):
    features = serializers.SerializerMethodField()
    
    class Meta:
        model = Plan
        fields = [
            'id',
            'nombre',
            'precio',
            'frecuencia',
            'descripcion',
            'activo',
            'es_popular',
            'features',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_features(self, obj):
        """Retorna las características como lista"""
        return obj.get_caracteristicas_list()


class CuotaMensualSerializer(serializers.ModelSerializer):
    socio_username = serializers.CharField(source='socio.username', read_only=True)
    socio_nombre = serializers.CharField(source='socio.first_name', read_only=True)
    socio_email = serializers.CharField(source='socio.email', read_only=True)
    plan_info = PlanSerializer(source='plan', read_only=True)
    dias_restantes = serializers.SerializerMethodField()
    
    class Meta:
        model = CuotaMensual
        fields = [
            'id',
            'socio',
            'socio_username',
            'socio_nombre',
            'socio_email',
            'plan',
            'plan_info',
            'plan_nombre',
            'plan_precio',
            'fecha_inicio',
            'fecha_vencimiento',
            'estado',
            'tarjeta_ultimos_4',
            'dias_restantes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['plan_nombre', 'plan_precio', 'created_at', 'updated_at']
    
    def get_dias_restantes(self, obj):
        return obj.dias_restantes()


class CuotaMensualCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear nuevas cuotas"""
    
    class Meta:
        model = CuotaMensual
        fields = [
            'socio',
            'plan',
            'fecha_inicio',
            'fecha_vencimiento',
            'tarjeta_ultimos_4'
        ]
    
    def create(self, validated_data):
        # El modelo se encarga de guardar plan_nombre y plan_precio
        return super().create(validated_data)


class CuotaMensualSocioSerializer(serializers.ModelSerializer):
    """Serializer simplificado para que el socio vea su cuota"""
    dias_restantes = serializers.SerializerMethodField()
    plan_info = PlanSerializer(source='plan', read_only=True)
    
    class Meta:
        model = CuotaMensual
        fields = [
            'id',
            'plan',
            'plan_info',
            'plan_nombre',
            'plan_precio',
            'fecha_inicio',
            'fecha_vencimiento',
            'estado',
            'dias_restantes'
        ]
    
    def get_dias_restantes(self, obj):
        return obj.dias_restantes()


class HistorialPagoSerializer(serializers.ModelSerializer):
    cuota_info = serializers.SerializerMethodField()
    
    class Meta:
        model = HistorialPago
        fields = [
            'id',
            'cuota',
            'cuota_info',
            'monto',
            'fecha_pago',
            'metodo_pago',
            'referencia',
            'notas',
            'movimiento_caja_id',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_cuota_info(self, obj):
        return {
            'plan_nombre': obj.cuota.plan_nombre,
            'socio_username': obj.cuota.socio.username
        }


class RenovarCuotaSerializer(serializers.Serializer):
    """
    Serializer para renovar una cuota (ADMIN/ENTRENADOR)
    Acepta plan_id para permitir el cambio de plan y referencia para el comprobante.
    """
    # 🟢 AÑADIDO: Para permitir el cambio de plan
    plan_id = serializers.IntegerField(required=False, help_text="ID del nuevo plan (opcional)") 
    
    # Campo que era opcional en la vista anterior, pero la nueva lógica lo gestiona
    fecha_vencimiento = serializers.DateField(required=False) 
    
    # Monto es requerido, aunque se pueda calcular en el backend, es mejor enviarlo
    monto = serializers.DecimalField(max_digits=10, decimal_places=2, required=True) 
    
    metodo_pago = serializers.ChoiceField(
        choices=['tarjeta', 'efectivo', 'transferencia'],
        default='efectivo' # Admin/Entrenador inicia con 'efectivo'
    )
    
    # 🟢 AÑADIDO: Para el comprobante de pago o últimos 4 de tarjeta
    referencia = serializers.CharField(max_length=100, required=False, allow_blank=True) 


class SolicitudRenovacionSerializer(serializers.Serializer):
    """
    Serializer para que el SOCIO renueve su cuota.
    El método de pago siempre es tarjeta, aunque se acepta como ChoiceField.
    """
    plan_id = serializers.IntegerField(required=False, help_text="ID del nuevo plan (opcional)")
    
    metodo_pago = serializers.ChoiceField(
        choices=['tarjeta', 'efectivo', 'transferencia'],
        default='tarjeta'
    )
    
    # 🟢 AJUSTADO: Se requiere para el registro en historial y se usa como 'referencia' en la vista
    tarjeta_ultimos_4 = serializers.CharField(max_length=4, required=True, allow_blank=False)