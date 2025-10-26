from django.contrib import admin
from .models import Perfil, Socio, Clase, Proveedor, Accesorios


@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ['user', 'rol', 'is_active', 'deactivate_at']
    list_filter = ['rol', 'is_active']
    search_fields = ['user__username', 'user__email']


@admin.register(Socio)
class SocioAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'apellido', 'dni', 'email', 'activo', 'fecha_alta']
    list_filter = ['activo', 'fecha_alta']
    search_fields = ['nombre', 'apellido', 'dni', 'email']
    readonly_fields = ['fecha_alta']


@admin.register(Clase)
class ClaseAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'dia', 'hora_inicio', 'hora_fin', 'entrenador']
    list_filter = ['dia', 'entrenador']
    search_fields = ['nombre', 'entrenador__username']
    filter_horizontal = ['socios']


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'telefono', 'email', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'email']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']


@admin.register(Accesorios)
class AccesoriosAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'proveedor', 'stock', 'activo', 'fecha_compra']
    list_filter = ['activo', 'proveedor', 'fecha_compra']
    search_fields = ['nombre', 'proveedor__nombre']
    readonly_fields = ['fecha_compra', 'fecha_actualizacion']
    list_editable = ['stock']
