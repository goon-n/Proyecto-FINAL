# backend/api/serializers.py - ARCHIVO COMPLETO

from rest_framework import serializers
from .models import Socio, Clase, Proveedor, Accesorios, Compra, ItemCompra, ReporteAccesorio
from django.contrib.auth.models import User

class CustomUserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source='perfil.rol', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'rol']

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = '__all__'

class ClaseSerializer(serializers.ModelSerializer):
    entrenador_username = serializers.CharField(source='entrenador.username', read_only=True)
    socios = CustomUserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Clase
        fields = ['id', 'nombre', 'descripcion', 'dia', 'hora_inicio', 'hora_fin', 'entrenador', 'entrenador_username', 'socios']

class ProveedorSerializer(serializers.ModelSerializer):
    accesorios_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Proveedor
        fields = '__all__'

class AccesoriosSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    
    class Meta:
        model = Accesorios
        fields = '__all__'

class ItemCompraSerializer(serializers.ModelSerializer):
    accesorio_nombre = serializers.CharField(source='accesorio.nombre', read_only=True)
    
    class Meta:
        model = ItemCompra
        fields = ['id', 'accesorio', 'accesorio_nombre', 'cantidad', 'precio_unitario']

class CompraSerializer(serializers.ModelSerializer):
    items = ItemCompraSerializer(many=True, required=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    
    class Meta:
        model = Compra
        fields = ['id', 'proveedor', 'proveedor_nombre', 'fecha', 'total', 'items']
        read_only_fields = ['total']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['total'] = 0  # Inicializar total en 0
        compra = Compra.objects.create(**validated_data)
        
        total = 0
        for item_data in items_data:
            item = ItemCompra.objects.create(compra=compra, **item_data)
            total += item.cantidad * item.precio_unitario
            
            # Actualizar stock del accesorio
            accesorio = item.accesorio
            accesorio.stock += item.cantidad
            accesorio.save()
        
        compra.total = total
        compra.save()
        
        return compra


# 🆕 SERIALIZERS PARA REPORTES DE ACCESORIOS

class ReporteAccesorioSerializer(serializers.ModelSerializer):
    accesorio_nombre = serializers.CharField(source='accesorio.nombre', read_only=True)
    reportado_por_username = serializers.CharField(source='reportado_por.username', read_only=True)
    confirmado_por_username = serializers.CharField(source='confirmado_por.username', read_only=True, allow_null=True)
    motivo_display = serializers.CharField(source='get_motivo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = ReporteAccesorio
        fields = [
            'id',
            'accesorio',
            'accesorio_nombre',
            'cantidad',
            'motivo',
            'motivo_display',
            'descripcion',
            'estado',
            'estado_display',
            'reportado_por',
            'reportado_por_username',
            'fecha_reporte',
            'confirmado_por',
            'confirmado_por_username',
            'fecha_confirmacion',
            'notas_confirmacion'
        ]
        read_only_fields = [
            'reportado_por',
            'fecha_reporte',
            'confirmado_por',
            'fecha_confirmacion'
        ]


class ReporteAccesorioCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear reportes"""
    
    class Meta:
        model = ReporteAccesorio
        fields = ['accesorio', 'cantidad', 'motivo', 'descripcion']
    
    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value