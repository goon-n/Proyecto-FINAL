from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfil, Socio, Clase
from .models import Proveedor, Accesorios


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
        fields = [id, nombre, telefono, email, activo]

        read_only_fields = ['fecha_creacion', 'fecha_actualizacoin']
