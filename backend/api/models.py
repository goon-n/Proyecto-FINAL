from django.contrib.auth.models import User
from django.db import models

class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=254, blank=True, null=True)  # ← AGREGAR
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)  # ← AGREGAR
    fecha_actualizacion = models.DateTimeField(auto_now=True)  # ← AGREGAR (opcional)
    
    class Meta:
        ordering = ['-activo', 'nombre']
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
    
    def __str__(self):
        return self.nombre
    
    
class Accesorios(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.CASCADE,
        related_name='accesorios',
    )
    stock = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    fecha_compra = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-activo', 'nombre']
        verbose_name = 'Accesorio'
        verbose_name_plural = 'Accesorios'
    def __str__(self):
        return f"{self.nombre} - {self.proveedor.nombre}"

class Compra(models.Model):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name="compras")
    fecha = models.DateField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    notas = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"Compra #{self.id} a {self.proveedor.nombre} ({self.fecha})"

class ItemCompra(models.Model):
    compra = models.ForeignKey(Compra, on_delete=models.CASCADE, related_name="items")
    accesorio = models.ForeignKey(Accesorios, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self):
        return f"{self.accesorio.nombre} x {self.cantidad}"

class Socio(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    fecha_nacimiento = models.DateField()
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_alta = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Perfil(models.Model):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('entrenador', 'Entrenador'),
        ('socio', 'Socio'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='socio')
    is_active = models.BooleanField(default=True)
    deactivate_at = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"{self.user.username} ({self.rol})"
    class Meta:
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfiles'

class Clase(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    dia = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    entrenador = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='clases_entrenador',
        limit_choices_to={'perfil__rol': 'entrenador'}
    )
    socios = models.ManyToManyField(
        User,
        related_name='clases_socio',
        limit_choices_to={'perfil__rol': 'socio'},
        blank=True
    )
    def __str__(self):
        return f"{self.nombre} - {self.dia} {self.hora_inicio}"

class ReporteAccesorio(models.Model):
    """
    Reportes de accesorios faltantes, rotos o extraviados
    Creados por entrenadores y confirmados por admins
    """
    MOTIVO_CHOICES = [
        ('faltante', 'Faltante'),
        ('roto', 'Roto/Dañado'),
        ('extraviado', 'Extraviado'),
        ('otro', 'Otro')
    ]
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('rechazado', 'Rechazado')
    ]
    
    accesorio = models.ForeignKey(
        Accesorios,
        on_delete=models.CASCADE,
        related_name='reportes'
    )
    cantidad = models.PositiveIntegerField(default=1)
    motivo = models.CharField(max_length=20, choices=MOTIVO_CHOICES, default='faltante')
    descripcion = models.TextField(help_text="Descripción detallada del problema")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    
    # Quién reporta (entrenador)
    reportado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reportes_creados'
    )
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    
    # Quién confirma/rechaza (admin)
    confirmado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reportes_confirmados'
    )
    fecha_confirmacion = models.DateTimeField(null=True, blank=True)
    notas_confirmacion = models.TextField(blank=True, help_text="Notas del admin al confirmar/rechazar")
    
    class Meta:
        ordering = ['-fecha_reporte']
        verbose_name = 'Reporte de Accesorio'
        verbose_name_plural = 'Reportes de Accesorios'
    
    def __str__(self):
        return f"Reporte #{self.id} - {self.accesorio.nombre} ({self.get_estado_display()})"