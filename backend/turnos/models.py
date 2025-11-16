# turnos/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

# --- Constantes de Estado ---
ESTADO_CHOICES = (
    ('SOLICITUD', 'Cupo Libre'),
    ('RESERVADO', 'Reservado - Pendiente de Confirmación'),
    ('CONFIRMADO', 'Confirmado'),
    ('CANCELADO', 'Cancelado/Liberado'),
    ('FINALIZADO', 'Finalizado'),
)

class Turno(models.Model):
    socio = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='turnos_reservados'
    )
    # Almacenamos solo la hora de inicio (cupos de 1 hora fijos)
    hora_inicio = models.DateTimeField(unique=True) 
    
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='SOLICITUD'
    )
    # Campo para registrar cuándo se reservó (necesario para el plazo de 24h)
    fecha_reserva = models.DateTimeField(null=True, blank=True) 

    class Meta:
        verbose_name = "Turno/Cupo de 1 hora"
        verbose_name_plural = "Turnos/Cupos"
        ordering = ['hora_inicio']
        
    def __str__(self):
        socio_nombre = self.socio.username if self.socio else "Cupo Libre"
        return f"Cupo {self.hora_inicio.strftime('%Y-%m-%d %H:%M')} - {socio_nombre}"

    @property
    def hora_fin(self):
        """Propiedad calculada: 1 hora después de la hora de inicio."""
        return self.hora_inicio + timedelta(hours=1)

    def clean(self):
        super().clean()
        
        # Validar Solapamiento para el mismo socio
        if self.socio and self.estado in ['RESERVADO', 'CONFIRMADO']:
            
            # Buscar otros turnos RESERVADOS o CONFIRMADOS del mismo socio que se solapen
            solapados = Turno.objects.filter(
                socio=self.socio,
                estado__in=['RESERVADO', 'CONFIRMADO']
            ).filter(
                Q(hora_inicio__lt=self.hora_fin) & Q(hora_fin__gt=self.hora_inicio)
            )

            if self.pk:
                solapados = solapados.exclude(pk=self.pk)

            if solapados.exists():
                raise ValidationError({
                    'socio': 'Ya tienes un turno confirmado o reservado que se solapa con este horario.'
                })
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)