# cuotas_mensuales/models.py - MODELO COMPLETO CON CLASES

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Plan(models.Model):
    """
    Planes disponibles con reglas de límites de turnos
    """
    # CAMPOS PARA RESTRICCIONES DE TURNOS
    TIPO_LIMITE_CHOICES = [
        ('semanal', 'Semanal (X veces por semana)'),
        ('diario', 'Diario (X veces por día)'),
        ('libre', 'Pase Libre (Sin límite)'),
    ]
    
    tipo_limite = models.CharField(
        max_length=20, 
        choices=TIPO_LIMITE_CHOICES, 
        default='semanal',
        help_text="Define cómo se cuenta el límite de turnos"
    )
    
    cantidad_limite = models.PositiveIntegerField(
        default=3,
        help_text="Cantidad de turnos permitidos por período (0 para ilimitado)"
    )
    
    # CAMPOS BÁSICOS
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
        if self.tipo_limite == 'libre':
            limite_str = "Acceso Ilimitado"
        else:
            limite_str = f"{self.cantidad_limite}x {self.get_tipo_limite_display()}"
        return f"{self.nombre} - {limite_str}"
    
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
    
    # 🆕 NUEVOS CAMPOS PARA SISTEMA DE CLASES
    clases_totales = models.PositiveIntegerField(
        default=0,  # ✅ Cambiado a 0
        help_text='Total de clases incluidas en el plan'
    )
    clases_restantes = models.PositiveIntegerField(
        default=0,  # ✅ Cambiado a 0
        help_text='Clases disponibles en el mes actual'
)
    
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
        ✅ CORREGIDO: Calcular estado SIEMPRE antes de guardar + calcular clases
        """
        # 1. Guardar información del plan SI NO EXISTE
        if not self.plan_nombre and self.plan:
            self.plan_nombre = self.plan.nombre
        if not self.plan_precio and self.plan:
            self.plan_precio = self.plan.precio
        
        # 2. 🆕 CALCULAR CLASES SEGÚN EL PLAN (solo si es nueva o se renovó)
        # Si no tiene PK es nueva, o si explícitamente se cambió el plan
        es_nueva = not self.pk
        
        if es_nueva:
            if self.plan.tipo_limite == 'libre':
                self.clases_totales = 999  # Ilimitado
                self.clases_restantes = 999
            elif self.plan.tipo_limite == 'semanal':
                # Ej: 2 veces/semana = 2 * 4 semanas = 8 clases/mes
                self.clases_totales = self.plan.cantidad_limite * 4
                self.clases_restantes = self.plan.cantidad_limite * 4
            elif self.plan.tipo_limite == 'diario':
                # Ej: 1 vez/día = 1 * 30 días = 30 clases/mes
                self.clases_totales = self.plan.cantidad_limite * 30
                self.clases_restantes = self.plan.cantidad_limite * 30
        
        # 3. Calcular fecha de vencimiento si no existe
        if not self.fecha_vencimiento and self.fecha_inicio:
            self.fecha_vencimiento = self.fecha_inicio + timedelta(days=30)
        
        # 4. ✅ SIEMPRE calcular el estado antes de guardar
        hoy = timezone.now().date()
        if hoy > self.fecha_vencimiento:
            self.estado = 'vencida'
        else:
            self.estado = 'activa'

        # 5. Guardar en la base de datos
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
    
    # 🆕 NUEVO MÉTODO
    def descontar_clase(self):
        """Descuenta 1 clase. Retorna True si se pudo descontar, False si no hay clases"""
        if self.clases_restantes > 0:
            self.clases_restantes -= 1
            self.save(update_fields=['clases_restantes'])
            return True
        return False


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