# cuotas_mensuales/models.py - CORREGIDO

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Plan(models.Model):
    """
    Planes disponibles en el gimnasio
    Ejemplo: 2x Semanal, 3x Semanal, Pase Libre
    """
    nombre = models.CharField(max_length=100, unique=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    frecuencia = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    es_popular = models.BooleanField(default=False)
    
    caracteristicas = models.TextField(
        help_text="Características separadas por coma. Ej: Acceso sala de musculación, Vestuarios y duchas",
        blank=True,
        null=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cuotas_planes'
        verbose_name = 'Plan'
        verbose_name_plural = 'Planes'
        ordering = ['precio']
    
    def __str__(self):
        return f"{self.nombre} - ${self.precio}"
    
    def get_caracteristicas_list(self):
        """Retorna las características como lista"""
        if self.caracteristicas:
            return [c.strip() for c in self.caracteristicas.split(',')]
        return []


class CuotaMensual(models.Model):
    """
    Cuotas mensuales de cada socio
    """
    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('vencida', 'Vencida'),
    ]
    
    socio = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='cuotas_mensuales',
        limit_choices_to={'groups__name': 'socio'}
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='cuotas')
    
    plan_nombre = models.CharField(max_length=100)
    plan_precio = models.DecimalField(max_digits=10, decimal_places=2)
    
    fecha_inicio = models.DateField(default=timezone.now)
    fecha_vencimiento = models.DateField()
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activa')
    
    tarjeta_ultimos_4 = models.CharField(max_length=4, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cuotas_mensuales'
        verbose_name = 'Cuota Mensual'
        verbose_name_plural = 'Cuotas Mensuales'
        ordering = ['-fecha_inicio']
        indexes = [
            models.Index(fields=['socio', 'estado']),
            models.Index(fields=['fecha_vencimiento']),
        ]
    
    def __str__(self):
        estado_display = self.get_estado_calculado()
        return f"{self.socio.username} - {self.plan_nombre} ({estado_display})"
    
    def save(self, *args, **kwargs):
        """
        ✅ CORREGIDO: Calcular estado SIEMPRE antes de guardar
        """
        # 1. Guardar información del plan SI NO EXISTE
        if not self.plan_nombre and self.plan:
            self.plan_nombre = self.plan.nombre
        if not self.plan_precio and self.plan:
            self.plan_precio = self.plan.precio
        
        # 2. Calcular fecha de vencimiento si no existe
        if not self.fecha_vencimiento and self.fecha_inicio:
            self.fecha_vencimiento = self.fecha_inicio + timedelta(days=30)
        
        # 3. ✅ CORREGIDO: SIEMPRE calcular el estado antes de guardar
        hoy = timezone.now().date()
        if hoy > self.fecha_vencimiento:
            self.estado = 'vencida'
        else:
            self.estado = 'activa'

        # 4. Guardar en la base de datos
        super().save(*args, **kwargs)
    
    def actualizar_estado(self):
        """Actualiza el estado según la fecha de vencimiento"""
        hoy = timezone.now().date()
        
        if hoy > self.fecha_vencimiento:
            self.estado = 'vencida'
        else:
            self.estado = 'activa'
    
    def dias_restantes(self):
        """Calcula los días restantes hasta el vencimiento"""
        hoy = timezone.now().date()
        delta = self.fecha_vencimiento - hoy
        return delta.days
    
    def get_estado_calculado(self):
        """
        Retorna el estado real considerando 'por_vencer'
        """
        hoy = timezone.now().date()
        dias = (self.fecha_vencimiento - hoy).days
        
        if hoy > self.fecha_vencimiento:
            return 'vencida'
        elif dias <= 5:
            return 'por_vencer'
        else:
            return 'activa'
    
    def renovar(self, nueva_fecha_vencimiento=None):
        """Renueva la cuota mensual"""
        if nueva_fecha_vencimiento:
            self.fecha_vencimiento = nueva_fecha_vencimiento
        else:
            self.fecha_vencimiento = timezone.now().date() + timedelta(days=30)
        
        self.estado = 'activa'
        self.save()


class HistorialPago(models.Model):
    """
    Historial de pagos de cuotas mensuales
    """
    METODO_PAGO_CHOICES = [
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
    ]
    
    cuota = models.ForeignKey(
        CuotaMensual, 
        on_delete=models.CASCADE, 
        related_name='pagos'
    )
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(default=timezone.now)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES, default='tarjeta')
    
    referencia = models.CharField(max_length=100, blank=True, null=True)
    notas = models.TextField(blank=True, null=True)
    
    movimiento_caja_id = models.IntegerField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cuotas_historial_pagos'
        verbose_name = 'Historial de Pago'
        verbose_name_plural = 'Historial de Pagos'
        ordering = ['-fecha_pago']
    
    def __str__(self):
        return f"Pago {self.monto} - {self.cuota.socio.username} ({self.fecha_pago.strftime('%d/%m/%Y')})"