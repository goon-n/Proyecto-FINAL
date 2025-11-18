# turnos/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta, time

User = get_user_model()

ESTADO_CHOICES = (
    ('DISPONIBLE', 'Cupo Disponible'),
    ('RESERVADO', 'Reservado - Pendiente de Confirmación'),
    ('CONFIRMADO', 'Confirmado'),
    ('CANCELADO', 'Cancelado/Liberado'),
    ('FINALIZADO', 'Finalizado'),
    ('BLOQUEADO', 'Bloqueado'),
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
        default='DISPONIBLE'
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
        
        # ✅ Convertir a hora local antes de validar
        hora_local = timezone.localtime(self.hora_inicio)
        
        # Validar que no sea domingo
        if hora_local.weekday() == 6:
            raise ValidationError({
                'hora_inicio': 'No se pueden crear turnos los domingos.'
            })
        
        # Usar hora_local para todas las validaciones
        hora_int = hora_local.hour
        minuto_int = hora_local.minute
        es_sabado = hora_local.weekday() == 5
        
        # Validar que sea hora en punto
        if minuto_int != 0:
            raise ValidationError({
                'hora_inicio': 'La hora de inicio debe ser una hora en punto (ej: 08:00, 09:00, etc.).'
            })
        
        # Validar horarios según el día
        if es_sabado:
            # Sábados: 8-12 y 17-22
            if not ((8 <= hora_int <= 12) or (17 <= hora_int <= 22)):
                raise ValidationError({
                    'hora_inicio': 'Los sábados los turnos son de 08:00 a 12:00 y de 17:00 a 22:00.'
                })
        else:
            # Lunes a viernes: 8-22
            if not (8 <= hora_int <= 22):
                raise ValidationError({
                    'hora_inicio': 'Los turnos solo pueden ser entre las 08:00 y las 22:00.'
                })
        
        # ✅ CORREGIDO: Normalizar y validar solapamiento
        if self.socio and self.estado in ['RESERVADO', 'CONFIRMADO']:
            # Normalizar a minutos (ignorar segundos/microsegundos)
            nuevo_inicio = self.hora_inicio.replace(second=0, microsecond=0)
            nuevo_fin = nuevo_inicio + timedelta(hours=1)
            
            # Buscar turnos del mismo socio que se solapen
            solapados = Turno.objects.filter(
                socio=self.socio,
                estado__in=['RESERVADO', 'CONFIRMADO']
            )
            
            if self.pk:
                solapados = solapados.exclude(pk=self.pk)
            
            # Verificar manualmente cada turno
            for turno_existente in solapados:
                # Normalizar turno existente también
                existente_inicio = turno_existente.hora_inicio.replace(second=0, microsecond=0)
                existente_fin = existente_inicio + timedelta(hours=1)
                
                # Hay solapamiento SI:
                # El nuevo empieza antes de que termine el existente Y
                # El nuevo termina después de que empiece el existente
                if nuevo_inicio < existente_fin and nuevo_fin > existente_inicio:
                    raise ValidationError({
                        'socio': 'Ya tienes un turno confirmado o reservado que se solapa con este horario.'
                    })
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)