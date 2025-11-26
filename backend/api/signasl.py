from django.db.models.signals import post_save
from django.contrib.auth.models import User, Group
from django.dispatch import receiver
from .models import Perfil

@receiver(post_save, sender=User)
def crear_perfil(sender, instance, created, **kwargs):
    """
    Crear perfil automáticamente cuando se crea un usuario
    """
    if created:
        Perfil.objects.create(user=instance)
        print(f"✅ Perfil creado para {instance.username}")


@receiver(post_save, sender=Perfil)
def asignar_grupo_por_rol(sender, instance, created, **kwargs):
    """
    Asignar automáticamente al usuario al grupo según su rol
    Se ejecuta tanto al crear como al actualizar el perfil
    """
    try:
        # Obtener o crear el grupo según el rol
        grupo, _ = Group.objects.get_or_create(name=instance.rol)
        
        # Limpiar grupos anteriores y asignar el nuevo
        instance.user.groups.clear()
        instance.user.groups.add(grupo)
        
        if created:
            print(f"✅ Usuario {instance.user.username} asignado al grupo '{instance.rol}'")
        else:
            print(f"✅ Rol actualizado: {instance.user.username} ahora es '{instance.rol}'")
            
    except Exception as e:
        print(f"❌ Error al asignar grupo a {instance.user.username}: {e}")