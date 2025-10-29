#api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfil, Socio, Clase, Proveedor, Accesorios, Compra, ItemCompra
import re

class CustomUserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source='perfil.rol', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'rol']

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = '__all__'

class ClaseSerializer(serializers.ModelSerializer):
    entrenador = CustomUserSerializer(read_only=True)
    socios = CustomUserSerializer(many=True, read_only=True)
    class Meta:
        model = Clase
        fields = '__all__'

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'
    
    def validate_nombre(self, value):
        """Validar que el nombre solo contenga letras y espacios"""
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre es requerido")
        
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):
            raise serializers.ValidationError("El nombre solo puede contener letras y espacios")
        
        return value.strip()
    
    def validate_telefono(self, value):
        """Validar formato y unicidad de teléfono"""
        if value:
            # Validar formato
            if not re.match(r'^[\d\s\-\+\(\)]+$', value):
                raise serializers.ValidationError(
                    "El teléfono solo puede contener números, espacios, guiones, paréntesis y +"
                )
            
            digitos = re.sub(r'[^\d]', '', value)
            
            if len(digitos) < 8:
                raise serializers.ValidationError("El teléfono debe tener al menos 8 dígitos")
            
            if len(digitos) > 15:
                raise serializers.ValidationError("El teléfono no puede tener más de 15 dígitos")
            
            # Validar unicidad (que no exista en otro proveedor)
            proveedor_id = self.instance.id if self.instance else None
            existe = Proveedor.objects.filter(telefono=value).exclude(id=proveedor_id).exists()
            if existe:
                raise serializers.ValidationError("Este teléfono ya está registrado para otro proveedor")
        
        return value
    
    def validate_email(self, value):
        """Validar formato y unicidad de email"""
        if value:
            # Validar formato
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
                raise serializers.ValidationError("El formato del email es inválido")
            
            # Validar unicidad (que no exista en otro proveedor)
            proveedor_id = self.instance.id if self.instance else None
            existe = Proveedor.objects.filter(email=value).exclude(id=proveedor_id).exists()
            if existe:
                raise serializers.ValidationError("Este email ya está registrado para otro proveedor")
        
        return value

class AccesoriosSerializer(serializers.ModelSerializer):
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedor.objects.all())
    class Meta:
        model = Accesorios
        fields = '__all__'

class ItemCompraSerializer(serializers.ModelSerializer):
    accesorio = serializers.PrimaryKeyRelatedField(queryset=Accesorios.objects.all())
    class Meta:
        model = ItemCompra
        fields = ['id', 'accesorio', 'cantidad', 'precio_unitario']

class CompraSerializer(serializers.ModelSerializer):
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedor.objects.all())
    items = ItemCompraSerializer(many=True)

    class Meta:
        model = Compra
        fields = ['id', 'proveedor', 'fecha', 'total', 'notas', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        compra = Compra.objects.create(**validated_data)
        for item_data in items_data:
            ItemCompra.objects.create(compra=compra, **item_data)
        return compra

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance.proveedor = validated_data.get('proveedor', instance.proveedor)
        instance.total = validated_data.get('total', instance.total)
        instance.notas = validated_data.get('notas', instance.notas)
        instance.save()
        return instance