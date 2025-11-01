from rest_framework import serializers
from .models import Turno

class TurnoSerializer(serializers.ModelSerializer):
    socio_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Turno
        fields = ['id', 'socio', 'socio_nombre', 'hora_inicio', 'hora_fin', 'estado']

    def get_socio_nombre(self, obj):
        return obj.socio.username if obj.socio else 'Cupo Libre'
