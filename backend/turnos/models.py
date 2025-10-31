# turnos/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()
CAPACIDAD_MAXIMA_DIARIA = 10

class Turno(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente de Validación'),
        ('CONFIRMADO', 'Confirmado'),
        ('CANCELADO', 'Cancelado por Socio'),
        ('FINALIZADO', 'Finalizado (Asistido)'),
    ]

    socio = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='turnos', null=True, blank=True
    )
    hora_inicio = models.DateTimeField(verbose_name="Fecha/Hora de Inicio")
    hora_fin = models.DateTimeField(verbose_name="Fecha/Hora de Fin")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['hora_inicio']

    def __str__(self):
        socio_nombre = self.socio.username if self.socio else 'Cupo Libre'
        return f"Turno de {socio_nombre} el {self.hora_inicio.strftime('%Y-%m-%d %H:%M')}"

    def clean(self):
        super().clean()
        if self.hora_inicio and self.hora_fin and self.hora_inicio >= self.hora_fin:
            raise ValidationError("La hora de fin debe ser posterior a la hora de inicio.")
        if self.hora_inicio and self.hora_inicio < timezone.now():
            if not self.pk or self.estado not in ['FINALIZADO', 'CANCELADO']:
                raise ValidationError("No se puede crear/modificar un turno en el pasado.")
        if self.socio and self.estado in ['CONFIRMADO', 'PENDIENTE']:
            solapados = Turno.objects.filter(
                socio=self.socio,
                estado__in=['CONFIRMADO', 'PENDIENTE']
            ).exclude(pk=self.pk).filter(
                hora_inicio__lt=self.hora_fin,
                hora_fin__gt=self.hora_inicio
            )
            if solapados.exists():
                raise ValidationError("Ya tienes un turno activo solapado con este horario.")
        if self.hora_inicio:
            fecha_turno = self.hora_inicio.date()
            cupos_ocupados = Turno.objects.filter(
                hora_inicio__date=fecha_turno
            ).exclude(
                estado__in=['CANCELADO', 'FINALIZADO']
            )
            if self.pk:
                cupos_ocupados = cupos_ocupados.exclude(pk=self.pk)
            if cupos_ocupados.count() >= CAPACIDAD_MAXIMA_DIARIA:
                raise ValidationError(f'El día {fecha_turno} alcanzó su capacidad máxima de {CAPACIDAD_MAXIMA_DIARIA} turnos.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
