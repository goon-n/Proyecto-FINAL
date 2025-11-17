# cuotas_mensuales/admin.py

from django.contrib import admin
from .models import Plan, CuotaMensual, HistorialPago

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'precio', 'frecuencia', 'activo', 'es_popular', 'created_at']
    list_filter = ['activo', 'es_popular', 'created_at']
    search_fields = ['nombre', 'descripcion']
    list_editable = ['activo', 'es_popular']
    ordering = ['precio']


@admin.register(CuotaMensual)
class CuotaMensualAdmin(admin.ModelAdmin):
    list_display = [
        'socio',
        'plan_nombre',
        'plan_precio',
        'fecha_inicio',
        'fecha_vencimiento',
        'estado',
        'dias_restantes_display'
    ]
    list_filter = ['estado', 'fecha_inicio', 'fecha_vencimiento', 'plan']
    search_fields = ['socio__username', 'socio__email', 'plan_nombre']
    readonly_fields = ['plan_nombre', 'plan_precio', 'created_at', 'updated_at']
    date_hierarchy = 'fecha_inicio'
    
    fieldsets = (
        ('Información del Socio', {
            'fields': ('socio',)
        }),
        ('Información del Plan', {
            'fields': ('plan', 'plan_nombre', 'plan_precio')
        }),
        ('Fechas', {
            'fields': ('fecha_inicio', 'fecha_vencimiento')
        }),
        ('Estado y Pago', {
            'fields': ('estado', 'tarjeta_ultimos_4')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def dias_restantes_display(self, obj):
        dias = obj.dias_restantes()
        if dias == 0:
            return '⚠️ Vencida'
        elif dias <= 7:
            return f'⚠️ {dias} días'
        return f'✅ {dias} días'
    dias_restantes_display.short_description = 'Días Restantes'
    
    actions = ['renovar_cuotas_seleccionadas', 'suspender_cuotas']
    
    def renovar_cuotas_seleccionadas(self, request, queryset):
        for cuota in queryset:
            cuota.renovar()
        self.message_user(request, f'{queryset.count()} cuotas renovadas exitosamente')
    renovar_cuotas_seleccionadas.short_description = 'Renovar cuotas seleccionadas (30 días)'
    
    def suspender_cuotas(self, request, queryset):
        queryset.update(estado='suspendida')
        self.message_user(request, f'{queryset.count()} cuotas suspendidas')
    suspender_cuotas.short_description = 'Suspender cuotas seleccionadas'


@admin.register(HistorialPago)
class HistorialPagoAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'cuota',
        'monto',
        'fecha_pago',
        'metodo_pago',
        'referencia'
    ]
    list_filter = ['metodo_pago', 'fecha_pago']
    search_fields = ['cuota__socio__username', 'referencia', 'notas']
    readonly_fields = ['created_at']
    date_hierarchy = 'fecha_pago'
    
    fieldsets = (
        ('Información del Pago', {
            'fields': ('cuota', 'monto', 'fecha_pago', 'metodo_pago')
        }),
        ('Detalles Adicionales', {
            'fields': ('referencia', 'notas', 'movimiento_caja_id')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )