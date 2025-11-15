# caja/models.py - AGREGAR campo compra_relacionada
from django.db import models
from api.models import Perfil

class Caja(models.Model):
    ESTADOS = (
        ('ABIERTA', 'Abierta'),
        ('CERRADA', 'Cerrada'),
    )
    empleado_apertura = models.ForeignKey(
        Perfil,
        related_name='cajas_abiertas',
        on_delete=models.PROTECT,
        verbose_name="Empleado Apertura",
        null=True,
        blank=True
    )
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    monto_inicial = models.DecimalField(max_digits=10, decimal_places=2)

    empleado_cierre = models.ForeignKey(
        Perfil,
        related_name='cajas_cerradas',
        on_delete=models.PROTECT,
        verbose_name="Empleado Cierre",
        null=True,
        blank=True
    )
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='ABIERTA')
    closing_counted_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notas = models.TextField(blank=True, null=True) #lo sacas y se rompe todo

    # Propiedades calculadas para efectivo y transferencias
    @property
    def efectivo_esperado(self):
        """Calcula el efectivo esperado en caja"""
        total = self.monto_inicial
        for mov in self.movimientos.filter(tipo_pago='efectivo'):
            if mov.tipo == "ingreso":
                total += mov.monto
            elif mov.tipo == "egreso":
                total -= mov.monto
        return total

    @property
    def transferencia_esperada(self):
        """Calcula el total de transferencias"""
        total = 0
        for mov in self.movimientos.filter(tipo_pago='transferencia'):
            if mov.tipo == "ingreso":
                total += mov.monto
            elif mov.tipo == "egreso":
                total -= mov.monto
        return total

    def __str__(self):
        return f"Caja {self.id} ({self.estado})"
    
    @property
    def closing_system_amount(self):
        total = self.monto_inicial
        for mov in self.movimientos.all():
            if mov.tipo == "ingreso":
                total += mov.monto
            elif mov.tipo == "egreso":
                total -= mov.monto
        return total

    @property
    def difference_amount(self):
        if self.closing_counted_amount is not None:
            return self.closing_system_amount - self.closing_counted_amount
        return None

class MovimientoDeCaja(models.Model):
    TIPOS = (
        ('apertura', 'Apertura'),
        ('cierre', 'Cierre'),
        ('deposito', 'Depósito'),
        ('egreso', 'Egreso'),
        ('ingreso', 'Ingreso'),
    )
    caja = models.ForeignKey(Caja, related_name='movimientos', on_delete=models.CASCADE)
    tipo = models.CharField(max_length=10, choices=TIPOS)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=50, blank=True)
    descripcion = models.CharField(max_length=255, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    creado_por = models.ForeignKey(
        Perfil, on_delete=models.PROTECT,
        null=True, blank=True, verbose_name="Usuario"
    )
    ## Relación con compra
    compra = models.ForeignKey(
        'api.Compra',  # Referencia al modelo Compra
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimientos_caja',
        verbose_name="Compra relacionada"
    )

    def __str__(self):
        return f"{self.tipo} - {self.monto} ({self.fecha})"