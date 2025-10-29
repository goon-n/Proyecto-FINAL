#api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfil, Socio, Clase, Proveedor, Accesorios, Compra, ItemCompra

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
        # Si quieres actualizar items, implementa aquí la lógica.
        return instance
