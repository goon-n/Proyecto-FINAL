# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SocioViewSet,
    ClaseViewSet,
    ProveedorViewSet,  # Nueva vista para Proveedor
    proveedores_activos,
    proveedores_desactivados,
    # crear_usuario,  # <-- Comentar si no existe
    listar_usuarios,
    # eliminar_usuario,  # <-- Ya no se usa
    editar_rol_usuario,
    socios_disponibles,
    asignar_socio,
    quitar_socio,
    anotarse_clase,
    desuscribirse_clase,
    editar_clase,
    eliminar_clase,
    register_user,
    login_view,
    logout_view,
    obtener_usuario_actual,
    dashboard_socio,
    # Nuevas funciones para soft delete
    usuarios_desactivados,
    desactivar_usuario,
    activar_usuario,
)

router = DefaultRouter()
router.register(r'clases', ClaseViewSet)
router.register(r'socios', SocioViewSet)


urlpatterns = [
    # Router (clases y socios)
    path('', include(router.urls)),
    
    # Autenticación
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_user, name='register'),
    path('user/', obtener_usuario_actual, name='user'),
    
    # Gestión de usuarios (admin)
    # path('crear-usuario/', crear_usuario, name='crear-usuario'),  # <-- Comentar si no existe
    path('usuarios/', listar_usuarios, name='listar-usuarios'),
    path('usuarios/desactivados/', usuarios_desactivados, name='usuarios-desactivados'),
    path('usuarios/<int:user_id>/desactivar/', desactivar_usuario, name='desactivar-usuario'),
    path('usuarios/<int:user_id>/activar/', activar_usuario, name='activar-usuario'),
    path('usuarios/<int:user_id>/rol/', editar_rol_usuario, name='editar-rol-usuario'),
    
    #Gestión de proveedores
    path('proveedores/', proveedores_activos, name='proveedores-activos'),
    path('proveedores/desactivados/', proveedores_desactivados, name='proveedores-desactivados'),

    # Clases y socios
    path('clases/<int:clase_id>/socios/disponibles/', socios_disponibles, name='socios-disponibles'),
    path('clases/<int:clase_id>/socios/', asignar_socio, name='asignar-socio'),
    path('clases/<int:clase_id>/socios/<int:socio_id>/', quitar_socio, name='quitar-socio'),
    path('clases/<int:clase_id>/anotarse/', anotarse_clase, name='anotarse-clase'),
    path('clases/<int:clase_id>/desuscribirse/', desuscribirse_clase, name='desuscribirse-clase'),
    path('clases/<int:clase_id>/editar/', editar_clase, name='editar-clase'),
    path('clases/<int:clase_id>/eliminar/', eliminar_clase, name='eliminar-clase'),
    path('dashboard/socio/', dashboard_socio, name='dashboard-socio'),
]