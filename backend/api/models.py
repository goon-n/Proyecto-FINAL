#backend/api/models.py
from django.contrib.auth.models import User
from django.db import models

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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='socio')

    #Softdelete

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


class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ['-activo' , 'nombre']
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

