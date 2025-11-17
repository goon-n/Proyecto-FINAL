#api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfil, Socio, Clase, Proveedor, Accesorios, Compra, ItemCompra
import re
from rest_framework import serializers


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
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    
    class Meta:
        model = Accesorios
        fields = '__all__'
    
    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre es requerido")
        return value.strip()
    
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value

class ItemCompraSerializer(serializers.ModelSerializer):
    accesorio = serializers.PrimaryKeyRelatedField(queryset=Accesorios.objects.all())
    accesorio_nombre = serializers.CharField(source='accesorio.nombre', read_only=True)
    
    class Meta:
        model = ItemCompra
        fields = ['id', 'accesorio', 'accesorio_nombre', 'cantidad', 'precio_unitario']

class CompraSerializer(serializers.ModelSerializer):
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedor.objects.filter(activo=True))
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    items = ItemCompraSerializer(many=True)

    class Meta:
        model = Compra
        fields = ['id', 'proveedor', 'proveedor_nombre', 'fecha', 'total', 'notas', 'items']

    def validate_items(self, value):
        """Validar que hay al menos un item y que todos los datos son válidos"""
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un ítem en la compra")
        
        for item in value:
            if item.get('cantidad', 0) <= 0:
                raise serializers.ValidationError("La cantidad debe ser mayor a 0")
            if item.get('precio_unitario', 0) <= 0:
                raise serializers.ValidationError("El precio unitario debe ser mayor a 0")
                
        return value

    def validate_total(self, value):
        """Validar que el total sea positivo"""
        if value <= 0:
            raise serializers.ValidationError("El total debe ser mayor a 0")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        compra = Compra.objects.create(**validated_data)
        
        for item_data in items_data:
            item = ItemCompra.objects.create(compra=compra, **item_data)
            # Actualizar stock automáticamente
            accesorio = item.accesorio
            accesorio.stock += item.cantidad
            accesorio.save()
        
        return compra

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Actualizar campos básicos
        instance.proveedor = validated_data.get('proveedor', instance.proveedor)
        instance.total = validated_data.get('total', instance.total)
        instance.notas = validated_data.get('notas', instance.notas)
        instance.save()
        
        # Si se proporcionan nuevos items, reemplazar completamente
        if items_data is not None:
            # Revertir stock de items anteriores
            for item in instance.items.all():
                accesorio = item.accesorio
                accesorio.stock -= item.cantidad
                accesorio.save()
            
            # Eliminar items anteriores
            instance.items.all().delete()
            
            # Crear nuevos items y actualizar stock
            for item_data in items_data:
                item = ItemCompra.objects.create(compra=instance, **item_data)
                accesorio = item.accesorio
                accesorio.stock += item.cantidad
                accesorio.save()
        
        return instance
    