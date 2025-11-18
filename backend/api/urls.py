# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SocioViewSet,
    ClaseViewSet,
    ProveedorViewSet,
    AccesoriosViewSet,
    CompraViewSet,
    proveedores_activos,
    proveedores_desactivados,
    listar_usuarios,
    editar_rol_usuario,
    cambiar_contrasena,
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
    crear_proveedor,
    editar_proveedor,
    desactivar_proveedor,
    activar_proveedor,
    estadisticas_compras,
    compras_por_proveedor,
    eliminar_compra_con_stock,
    get_csrf,
    register_with_payment,
    mi_perfil  # ← AGREGAR ESTA LÍNEA

)

router = DefaultRouter()
router.register(r'clases', ClaseViewSet)
router.register(r'socios', SocioViewSet)
router.register(r'accesorios', AccesoriosViewSet)
router.register(r'compras', CompraViewSet)
# NO registramos ProveedorViewSet aquí para evitar conflictos

urlpatterns = [
    # Autenticación (PRIMERO)
    path('login/', login_view, name='login'),
    path('csrf/', get_csrf, name='get-csrf'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_user, name='register'),
    path('user/', obtener_usuario_actual, name='user'),
    path('perfil/', mi_perfil, name='mi-perfil'),  # ← AGREGAR ESTA LÍNEA


    # Gestión de usuarios (admin)
    path('usuarios/', listar_usuarios, name='listar-usuarios'),
    path('usuarios/desactivados/', usuarios_desactivados, name='usuarios-desactivados'),
    path('usuarios/<int:user_id>/desactivar/', desactivar_usuario, name='desactivar-usuario'),
    path('usuarios/<int:user_id>/activar/', activar_usuario, name='activar-usuario'),
    path('usuarios/<int:user_id>/rol/', editar_rol_usuario, name='editar-rol-usuario'),
    path('usuarios/<int:user_id>/cambiar-contrasena/', cambiar_contrasena, name='cambiar-contrasena'),
    path('register-with-payment/', register_with_payment, name='register_with_payment'),


    # Gestión de proveedores (ANTES del router)
    path('proveedores/activos/', proveedores_activos, name='proveedores-activos'),
    path('proveedores/desactivados/', proveedores_desactivados, name='proveedores-desactivados'),
    path('proveedores/crear/', crear_proveedor, name='crear-proveedor'),
    path('proveedores/<int:proveedor_id>/editar/', editar_proveedor, name='editar-proveedor'),
    path('proveedores/<int:proveedor_id>/desactivar/', desactivar_proveedor, name='desactivar-proveedor'),
    path('proveedores/<int:proveedor_id>/activar/', activar_proveedor, name='activar-proveedor'),

    # Gestión de compras (extras)
    path('compras/estadisticas/', estadisticas_compras, name='estadisticas-compras'),
    path('compras/proveedor/<int:proveedor_id>/', compras_por_proveedor, name='compras-por-proveedor'),
    path('compras/<int:compra_id>/eliminar-con-stock/', eliminar_compra_con_stock, name='eliminar-compra-con-stock'),

    # Clases y socios (extras)
    path('clases/<int:clase_id>/socios/disponibles/', socios_disponibles, name='socios-disponibles'),
    path('clases/<int:clase_id>/socios/', asignar_socio, name='asignar-socio'),
    path('clases/<int:clase_id>/socios/<int:socio_id>/', quitar_socio, name='quitar-socio'),
    path('clases/<int:clase_id>/anotarse/', anotarse_clase, name='anotarse-clase'),
    path('clases/<int:clase_id>/desuscribirse/', desuscribirse_clase, name='desuscribirse-clase'),
    path('clases/<int:clase_id>/editar/', editar_clase, name='editar-clase'),
    path('clases/<int:clase_id>/eliminar/', eliminar_clase, name='eliminar-clase'),
    path('dashboard/socio/', dashboard_socio, name='dashboard-socio'),

    # Router AL FINAL (clases, socios, accesorios, compras)
    path('', include(router.urls)),
]