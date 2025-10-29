from django.contrib import admin
from .models import Caja, MovimientoDeCaja

@admin.register(Caja)
class CajaAdmin(admin.ModelAdmin):
    list_display = ('id', 'estado', 'empleado_apertura', 'fecha_apertura', 'empleado_cierre', 'fecha_cierre')
    list_filter = ('estado',)
    search_fields = ('id', 'empleado_apertura__user__username',)

@admin.register(MovimientoDeCaja)
class MovimientoDeCajaAdmin(admin.ModelAdmin):
    list_display = ('id', 'caja', 'tipo', 'monto', 'fecha', 'creado_por')
    list_filter = ('tipo', 'fecha')
    search_fields = ('descripcion',)
