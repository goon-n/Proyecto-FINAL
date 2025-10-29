# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SocioViewSet,
    ClaseViewSet,
    listar_usuarios,
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
    usuarios_desactivados,
    desactivar_usuario,
    activar_usuario,
    # Proveedores
    listar_proveedores,
    proveedores_desactivados,
    crear_proveedor,
    detalle_proveedor,
    editar_proveedor,
    desactivar_proveedor,
    activar_proveedor,
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
    path('usuarios/', listar_usuarios, name='listar-usuarios'),
    path('usuarios/desactivados/', usuarios_desactivados, name='usuarios-desactivados'),
    path('usuarios/<int:user_id>/desactivar/', desactivar_usuario, name='desactivar-usuario'),
    path('usuarios/<int:user_id>/activar/', activar_usuario, name='activar-usuario'),
    path('usuarios/<int:user_id>/rol/', editar_rol_usuario, name='editar-rol-usuario'),
    
    # Clases y socios
    path('clases/<int:clase_id>/socios/disponibles/', socios_disponibles, name='socios-disponibles'),
    path('clases/<int:clase_id>/socios/', asignar_socio, name='asignar-socio'),
    path('clases/<int:clase_id>/socios/<int:socio_id>/', quitar_socio, name='quitar-socio'),
    path('clases/<int:clase_id>/anotarse/', anotarse_clase, name='anotarse-clase'),
    path('clases/<int:clase_id>/desuscribirse/', desuscribirse_clase, name='desuscribirse-clase'),
    path('clases/<int:clase_id>/editar/', editar_clase, name='editar-clase'),
    path('clases/<int:clase_id>/eliminar/', eliminar_clase, name='eliminar-clase'),
    path('dashboard/socio/', dashboard_socio, name='dashboard-socio'),
    
    # Proveedores
    path('proveedores/', listar_proveedores, name='listar-proveedores'),
    path('proveedores/desactivados/', proveedores_desactivados, name='proveedores-desactivados'),
    path('proveedores/crear/', crear_proveedor, name='crear-proveedor'),
    path('proveedores/<int:proveedor_id>/', detalle_proveedor, name='detalle-proveedor'),
    path('proveedores/<int:proveedor_id>/editar/', editar_proveedor, name='editar-proveedor'),
    path('proveedores/<int:proveedor_id>/desactivar/', desactivar_proveedor, name='desactivar-proveedor'),
    path('proveedores/<int:proveedor_id>/activar/', activar_proveedor, name='activar-proveedor'),
]