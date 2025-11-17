# turnos/serializers.py
from rest_framework import serializers
from .models import Turno
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializador simple para exponer solo el ID y username del Socio"""
    class Meta:
        model = User
        fields = ('id', 'username',) 

class TurnoSerializer(serializers.ModelSerializer):
    """Serializador usado por los Socios."""
    socio_info = UserSerializer(source='socio', read_only=True)
    
    class Meta:
        model = Turno
        fields = (
            'id', 
            'hora_inicio', 
            'hora_fin', 
            'estado', 
            'socio',
            'socio_info',
            'fecha_reserva',
        )
        read_only_fields = ('socio', 'estado', 'socio_info', 'fecha_reserva') 
        
    def get_hora_fin(self, obj):
        # Asegura que la hora_fin calculada se incluya en la respuesta serializada
        return obj.hora_fin

# ------------------------------------------------------------------

class TurnoStaffSerializer(serializers.ModelSerializer):
    """Serializador usado por el Staff (Admin/Entrenador) para gestión completa."""
    socio_info = UserSerializer(source='socio', read_only=True)
    
    class Meta:
        model = Turno
        fields = (
            'id', 
            'hora_inicio', 
            'hora_fin', 
            'estado', 
            'socio', 
            'socio_info',
            'fecha_reserva',
        )
        read_only_fields = ('socio_info', 'hora_fin')