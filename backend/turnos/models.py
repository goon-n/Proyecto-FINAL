# turnos/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta, time

User = get_user_model()

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
    hora_inicio = models.DateTimeField()
    
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='SOLICITUD'
    )
    fecha_reserva = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Turno/Cupo de 1 hora"
        verbose_name_plural = "Turnos/Cupos"
        ordering = ['hora_inicio']
        indexes = [
            models.Index(fields=['hora_inicio', 'estado']),
        ]
        
    def __str__(self):
        socio_nombre = self.socio.username if self.socio else "Cupo Libre"
        return f"Cupo {self.hora_inicio.strftime('%Y-%m-%d %H:%M')} - {socio_nombre}"

    @property
    def hora_fin(self):
        """Propiedad calculada: 1 hora después de la hora de inicio."""
        return self.hora_inicio + timedelta(hours=1)
    
    @property
    def puede_cancelar(self):
        """Verifica si el turno puede ser cancelado (más de 1 hora antes)"""
        if self.estado not in ['RESERVADO', 'CONFIRMADO']:
            return False
        return self.hora_inicio > timezone.now() + timedelta(hours=1)

    def clean(self):
        super().clean()
        
        # Validar que no sea domingo
        if self.hora_inicio.weekday() == 6:
            raise ValidationError({
                'hora_inicio': 'No se pueden crear turnos los domingos.'
            })
        
        # ✅ NUEVO: Validar horarios según el día (sábados especiales)
        hora = self.hora_inicio.time()
        es_sabado = self.hora_inicio.weekday() == 5
        
        if es_sabado:
            # Sábados: 8-13 y 17-22
            if not ((time(8, 0) <= hora < time(13, 0)) or (time(17, 0) <= hora < time(23, 0))):
                raise ValidationError({
                    'hora_inicio': 'Los sábados los turnos son de 08:00 a 13:00 y de 17:00 a 22:00.'
                })
        else:
            # Lunes a viernes: 8-22
            if not (time(8, 0) <= hora < time(23, 0)):
                raise ValidationError({
                    'hora_inicio': 'Los turnos solo pueden ser entre las 08:00 y las 22:00.'
                })
        
        # Validar que sea hora en punto (ignorando segundos)
        if self.hora_inicio.minute != 0:
            raise ValidationError({
                'hora_inicio': 'La hora de inicio debe ser una hora en punto (ej: 08:00, 09:00, etc.).'
            })
        
        # Validar Solapamiento para el mismo socio
        if self.socio and self.estado in ['RESERVADO', 'CONFIRMADO']:
            solapados = Turno.objects.filter(
                socio=self.socio,
                estado__in=['RESERVADO', 'CONFIRMADO']
            ).filter(
                Q(hora_inicio__lt=self.hora_fin) & 
                Q(hora_inicio__gte=self.hora_inicio - timedelta(hours=1))
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