# turnos/management/commands/generar_cupos.py
from django.core.management.base import BaseCommand
from turnos.models import Turno
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Genera cupos de turnos de 1 hora para las próximas 4 semanas (L-S).'

    def handle(self, *args, **options):
        now = timezone.now().date()
        end_date = now + timedelta(weeks=4)
        
        # Eliminar cupos antiguos (opcional, para limpieza)
        Turno.objects.filter(hora_inicio__lt=timezone.now()).delete()
        
        turnos_creados = 0
        
        # Iterar sobre las fechas
        current_date = now
        while current_date <= end_date:
            # 0=Lunes, 5=Sábado, 6=Domingo
            weekday = current_date.weekday()
            
            # --- LUNES a VIERNES (0 a 4) ---
            if 0 <= weekday <= 4:
                # Horario: 08:00 a 22:30 (slots de 08:00 a 21:00)
                start_hour = 8
                end_hour = 22 # El último turno empieza a las 21:00 (termina 22:00)

            # --- SÁBADO (5) ---
            elif weekday == 5:
                # Horario: 09:00 a 13:00 (slots de 09:00 a 12:00)
                start_hour = 9
                end_hour = 13 # El último turno empieza a las 12:00 (termina 13:00)
                
            # --- DOMINGO (6) ---
            else:
                current_date += timedelta(days=1)
                continue

            # Generar slots de 1 hora
            for hour in range(start_hour, end_hour):
                # Crear el objeto datetime para la hora de inicio del turno
                hora_inicio = timezone.make_aware(
                    timezone.datetime(
                        current_date.year, current_date.month, current_date.day, hour, 0, 0
                    )
                )

                # Si el turno ya pasó, saltarlo
                if hora_inicio < timezone.now():
                    continue

                # Crear el turno si no existe (unique=True en models.py previene duplicados)
                try:
                    Turno.objects.create(
                        hora_inicio=hora_inicio,
                        estado='SOLICITUD',
                        socio=None
                    )
                    turnos_creados += 1
                except Exception as e:
                    # Capturar errores si el slot ya existía (ignoramos)
                    pass 
            
            current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS(f'✅ Proceso finalizado. {turnos_creados} nuevos cupos generados.'))