# cuotas_mensuales/management/commands/crear_planes_iniciales.py

from django.core.management.base import BaseCommand
from cuotas_mensuales.models import Plan

class Command(BaseCommand):
    help = 'Crea los planes iniciales del gimnasio'

    def handle(self, *args, **kwargs):
        planes_data = [
            {
                'nombre': '2x Semanal',
                'precio': 18000,
                'frecuencia': '2 veces por semana',
                'descripcion': 'Ideal para quienes comienzan o tienen poco tiempo',
                'caracteristicas': 'Acceso sala de musculación, Vestuarios y duchas, Asesoramiento básico',
                'activo': True,
                'es_popular': False
            },
            {
                'nombre': '3x Semanal',
                'precio': 24000,
                'frecuencia': '3 veces por semana',
                'descripcion': 'Plan intermedio para entrenamientos regulares',
                'caracteristicas': 'Acceso sala de musculación, Seguimiento mensual, Vestuarios y duchas',
                'activo': True,
                'es_popular': False
            },
            {
                'nombre': 'Pase Libre',
                'precio': 32000,
                'frecuencia': 'Todos los días',
                'descripcion': 'Acceso ilimitado para los más comprometidos',
                'caracteristicas': 'Acceso ilimitado, Seguimiento semanal, Prioridad en turnos',
                'activo': True,
                'es_popular': True
            }
        ]

        for plan_data in planes_data:
            plan, created = Plan.objects.update_or_create(
                nombre=plan_data['nombre'],
                defaults=plan_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Plan "{plan.nombre}" creado exitosamente')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️ Plan "{plan.nombre}" ya existía, actualizado')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n✅ {len(planes_data)} planes procesados correctamente')
        )