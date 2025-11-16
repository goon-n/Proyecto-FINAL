#─ admin.py ──────────────────────────────────────────────────────────────
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Perfil, Socio, Clase, Proveedor, Accesorios


# ──────────── Inline para Perfil (se muestra dentro del User) ────────────
class PerfilInline(admin.StackedInline):
    model = Perfil
    can_delete = False
    verbose_name_plural = 'Perfil'
    fk_name = 'user'


# ──────────── Personalización del UserAdmin ────────────
class UserAdmin(BaseUserAdmin):
    inlines = (PerfilInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_rol', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'perfil__rol')

    def get_rol(self, obj):
        return obj.perfil.rol if hasattr(obj, 'perfil') else '-'
    get_rol.short_description = 'Rol'

    # Filtro rápido por rol
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('perfil')


# Re-registramos User con nuestra configuración
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ──────────── Modelos simples ────────────
@admin.register(Socio)
class SocioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'dni', 'email', 'telefono', 'activo', 'fecha_alta')
    list_filter = ('activo', 'fecha_alta')
    search_fields = ('nombre', 'apellido', 'dni', 'email')


@admin.register(Clase)
class ClaseAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'dia', 'hora_inicio', 'hora_fin', 'entrenador')
    list_filter = ('dia', 'entrenador')
    search_fields = ('nombre', 'entrenador__username')
    filter_horizontal = ('socios',)  # Widget cómodo para ManyToMany


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'telefono', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre',)


@admin.register(Accesorios)
class AccesoriosAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'proveedor', 'stock', 'activo', 'fecha_compra', 'fecha_actualizacion')
    list_filter = ('activo', 'proveedor', 'fecha_compra')
    search_fields = ('nombre', 'proveedor__nombre')