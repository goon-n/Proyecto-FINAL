#backend/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import Socio, Perfil, Clase, Proveedor, Accesorios, Compra, ItemCompra
from .serializers import (
    CompraSerializer, ItemCompraSerializer, SocioSerializer,
    ClaseSerializer, CustomUserSerializer, ProveedorSerializer, AccesoriosSerializer,
)
from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import action, api_view, permission_classes

# ========== AUTENTICACIÓN ==========

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({"error": "Username y password requeridos"}, status=400)
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        rol = user.perfil.rol if hasattr(user, "perfil") else "socio"
        data = {
            "id": user.id,
            "username": user.username,
            "rol": rol,
            "email": user.email,
        }
        return Response(data, status=200)
    return Response({"error": "Usuario o contraseña incorrecta"}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logout exitoso"}, status=200)

@api_view(['GET'])
@permission_classes([])
def obtener_usuario_actual(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Not authenticated'}, status=401)
    user = request.user
    data = {
        "id": user.id,
        "username": user.username,
        "rol": user.perfil.rol if hasattr(user, "perfil") else "socio",
        "email": user.email,
    }
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    rol = 'socio'
    if not username or not password:
        return Response({'error': 'Faltan datos'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'El usuario ya existe'}, status=400)
    user = User.objects.create_user(username=username, password=password, email=email)
    Perfil.objects.create(user=user, rol=rol)
    return Response({'message': 'Usuario registrado correctamente'}, status=201)


# Endpoint para establecer la cookie CSRF en el cliente (GET)
@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf(request):
    """Devuelve una respuesta que força a Django a setear la cookie 'csrftoken'.
    Útil para que el frontend obtenga el token CSRF antes de hacer POSTs.
    """
    return Response({'detail': 'CSRF cookie set'})

# ========== VIEWSETS CRUD ==========

class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.all()
    serializer_class = SocioSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['activo', 'nombre']


class AccesoriosViewSet(viewsets.ModelViewSet):
    queryset = Accesorios.objects.all()
    serializer_class = AccesoriosSerializer
    permission_classes = [IsAuthenticated]


class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer

    
    def create(self, request, *args, **kwargs):
        """Crear compra y registrar movimiento en caja automáticamente"""
        from movimiento_caja.models import Caja, MovimientoDeCaja
        
        # VALIDACIÓN: Verificar que haya caja abierta
        caja_abierta = Caja.objects.filter(estado='ABIERTA').first()
        
        if not caja_abierta:
            return Response(
                {
                    'error': 'No hay caja abierta',
                    'detail': 'Debe abrir una caja antes de registrar compras.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Continuar con la creación de la compra
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Guardar la compra
        compra = serializer.save()
        
        # Obtener tipo de pago del request
        tipo_pago = request.data.get('tipo_pago', 'efectivo')
        
        # Registrar movimiento en caja abierta
        try:
            MovimientoDeCaja.objects.create(
                caja=caja_abierta,
                tipo='egreso',
                monto=compra.total,
                tipo_pago=tipo_pago,
                descripcion=f"Compra #{compra.id} - {compra.proveedor.nombre}",
                creado_por=request.user.perfil,
                compra=compra
            )
            print(f"✅ Movimiento de caja creado para compra #{compra.id}")
        except Exception as e:
            print(f"❌ Error al crear movimiento de caja: {e}")
            # Opcional: podrías eliminar la compra si falla el movimiento
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_queryset(self):
        queryset = Compra.objects.all().select_related('proveedor').prefetch_related('items__accesorio')
        
        proveedor_id = self.request.query_params.get('proveedor', None)
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if proveedor_id:
            queryset = queryset.filter(proveedor_id=proveedor_id)
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
            
        return queryset.order_by('-fecha')

class ClaseViewSet(viewsets.ModelViewSet):
    queryset = Clase.objects.all()
    serializer_class = ClaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(entrenador=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'perfil'):
            if user.perfil.rol == 'entrenador':
                return Clase.objects.filter(entrenador=user)
            elif user.perfil.rol == 'socio':
                return user.clases_socio.all()
        return super().get_queryset()

# ========== ENDPOINTS DE USUARIO/ADMIN Y FUNCIONES ADICIONALES ==========

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def listar_usuarios(request):
    """
    GET: Listar usuarios activos
    POST: Crear nuevo usuario
    """
    
    # GET - Listar usuarios
    if request.method == 'GET':
        if not hasattr(request.user, 'perfil') or request.user.perfil.rol not in ['admin', 'entrenador']:
            return Response({'error': 'No tienes permisos'}, status=403)
        
        usuarios = User.objects.filter(perfil__is_active=True).values(
            'id', 'username', 'email', 'date_joined', 'perfil__rol'
        )
        return Response(list(usuarios))
    
    # POST - Crear usuario
    elif request.method == 'POST':
        if not hasattr(request.user, 'perfil'):
            return Response({'error': 'No tienes permisos'}, status=403)
        
        user_rol = request.user.perfil.rol
        if user_rol not in ['admin', 'entrenador']:
            return Response({'error': 'Solo admins y entrenadores pueden crear usuarios'}, status=403)
        
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        rol = request.data.get('rol', 'socio')
        
        if not username:
            return Response({'error': 'El nombre de usuario es obligatorio'}, status=400)
        
        if not password:
            return Response({'error': 'La contraseña es obligatoria'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'El usuario ya existe'}, status=400)
        
        if user_rol == 'entrenador' and rol != 'socio':
            return Response({'error': 'Los entrenadores solo pueden crear socios'}, status=403)
        
        if rol not in ['admin', 'entrenador', 'socio']:
            return Response({'error': 'Rol no válido'}, status=400)
        
        try:
            # Crear usuario
            user = User.objects.create_user(username=username, password=password, email=email)
            print(f"✅ Usuario creado: {user.id} - {user.username}")
            
            # Crear perfil con is_active=True explícitamente
            perfil = Perfil.objects.create(user=user, rol=rol, is_active=True)
            print(f"✅ Perfil creado: {perfil.id} - rol: {perfil.rol} - activo: {perfil.is_active}")
            
            return Response({
                'message': 'Usuario creado correctamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'rol': rol
                }
            }, status=201)
            
        except Exception as e:
            print(f"❌ ERROR al crear usuario: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Error al crear usuario: {str(e)}'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuarios_desactivados(request):
    if not hasattr(request.user, 'perfil') or request.user.perfil.rol != 'admin':
        return Response({'error': 'No tienes permisos'}, status=403)
    usuarios_query = User.objects.filter(perfil__is_active=False).select_related('perfil')
    data = []
    for usuario in usuarios_query:
        data.append({
            'id': usuario.id,
            'username': usuario.username,
            'email': usuario.email,
            'date_joined': usuario.date_joined,
            'perfil__rol': usuario.perfil.rol,
            'perfil__deactivated_at': getattr(usuario.perfil, 'deactivated_at', None),
        })
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def desactivar_usuario(request, user_id):
    if request.user.id == user_id:
        return Response({'error': 'No podés desactivar tu propio usuario'}, status=400)
    user = get_object_or_404(User, id=user_id)
    perfil = user.perfil
    perfil.is_active = False
    perfil.deactivated_at = timezone.now()
    perfil.save()
    user.is_active = False
    user.save()
    return Response({'detail': f'Usuario {user.username} desactivado correctamente'}, status=200)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def activar_usuario(request, user_id):
    user = get_object_or_404(User, id=user_id)
    perfil = user.perfil
    perfil.is_active = True
    perfil.deactivated_at = None
    perfil.save()
    user.is_active = True
    user.save()
    return Response({'detail': f'Usuario {user.username} activado correctamente'}, status=200)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def editar_rol_usuario(request, user_id):
    if request.user.id == user_id:
        return Response({'error': 'No podés editar tu propio rol'}, status=400)
    user = get_object_or_404(User, id=user_id)
    nuevo_rol = request.data.get('rol')
    if nuevo_rol not in ['admin', 'entrenador', 'socio']:
        return Response({'error': 'Rol no válido'}, status=400)
    user.perfil.rol = nuevo_rol
    user.perfil.save()
    return Response({'detail': f'Rol de {user.username} actualizado a {nuevo_rol}'}, status=200)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cambiar_contrasena(request, user_id):
    """Cambiar contraseña de usuario"""
    if request.user.id != user_id:
        return Response({'error': 'Solo puedes cambiar tu propia contraseña'}, status=403)
    
    password_actual = request.data.get('password_actual')
    password_nueva = request.data.get('password_nueva')
    
    if not password_actual or not password_nueva:
        return Response({'error': 'Faltan datos'}, status=400)
    
    if not request.user.check_password(password_actual):
        return Response({'error': 'La contraseña actual es incorrecta'}, status=400)
    
    if len(password_nueva) < 4:
        return Response({'error': 'La contraseña debe tener al menos 4 caracteres'}, status=400)
    
    request.user.set_password(password_nueva)
    request.user.save()
    
    return Response({'detail': 'Contraseña actualizada correctamente'}, status=200)

# ========== REGISTRO DE USUARIO CON MOVIMIENTO DE CAJA ==========

@api_view(['POST'])
@permission_classes([AllowAny])
def register_with_payment(request):
    """Registrar usuario y crear movimiento de caja en una sola transacción"""
    from movimiento_caja.models import Caja, MovimientoDeCaja
    from django.db import transaction
    
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    nombre = request.data.get('nombre')
    telefono = request.data.get('telefono')
    plan_name = request.data.get('plan_name')
    plan_price = request.data.get('plan_price')
    card_last4 = request.data.get('card_last4', '')
    
    # Validaciones
    if not username or not password:
        return Response({'error': 'Faltan datos obligatorios'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'El usuario ya existe'}, status=400)
    
    # Verificar caja abierta
    caja_abierta = Caja.objects.filter(estado='ABIERTA').first()
    if not caja_abierta:
        return Response({
            'error': 'No hay caja abierta',
            'detail': 'Debe haber una caja abierta para registrar nuevos socios. Contacte al administrador.'
        }, status=400)
    
    try:
        with transaction.atomic():
            # 1. Crear usuario
            user = User.objects.create_user(
                username=username, 
                password=password, 
                email=email,
                first_name=nombre
            )
            perfil = Perfil.objects.create(user=user, rol='socio')
            
            # 2. Crear movimiento en caja
            MovimientoDeCaja.objects.create(
                caja=caja_abierta,
                tipo='ingreso',
                monto=plan_price,
                tipo_pago='tarjeta',
                descripcion=f"Nuevo socio: {nombre} ({username}) - Plan: {plan_name}" + 
                           (f" - Tarjeta *{card_last4}" if card_last4 else ""),
                creado_por=caja_abierta.empleado_apertura  # Usuario que abrió la caja
            )
            
            print(f"✅ Usuario {username} registrado y movimiento de caja creado")
            
            return Response({
                'message': 'Usuario registrado correctamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'nombre': nombre
                }
            }, status=201)
        
    except Exception as e:
        print(f"❌ Error en registro: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response({
            'error': f'Error al registrar: {str(e)}'
        }, status=400)



# ========== GESTIÓN DE PROVEEDORES (CRUD COMPLETO) ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_proveedor(request):
    """Crear un nuevo proveedor"""
    serializer = ProveedorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def editar_proveedor(request, proveedor_id):
    """Editar un proveedor existente"""
    proveedor = get_object_or_404(Proveedor, id=proveedor_id)
    serializer = ProveedorSerializer(proveedor, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def desactivar_proveedor(request, proveedor_id):
    """Desactivar (soft delete) un proveedor"""
    proveedor = get_object_or_404(Proveedor, id=proveedor_id)
    proveedor.activo = False
    proveedor.save()
    return Response({'detail': f'Proveedor {proveedor.nombre} desactivado correctamente'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activar_proveedor(request, proveedor_id):
    """Activar un proveedor desactivado"""
    proveedor = get_object_or_404(Proveedor, id=proveedor_id)
    proveedor.activo = True
    proveedor.save()
    return Response({'detail': f'Proveedor {proveedor.nombre} activado correctamente'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def proveedores_activos(request):
    activos = Proveedor.objects.filter(activo=True)
    serializer = ProveedorSerializer(activos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def proveedores_desactivados(request):
    desactivados = Proveedor.objects.filter(activo=False)
    serializer = ProveedorSerializer(desactivados, many=True)
    return Response(serializer.data)

# ========== CLASES Y SOCIOS / DASHBOARD ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def socios_disponibles(request, clase_id):
    clase = get_object_or_404(Clase, id=clase_id)
    ya_anotados = clase.socios.values_list('id', flat=True)
    disponibles = User.objects.filter(perfil__rol='socio').exclude(id__in=ya_anotados)
    data = [{'id': u.id, 'username': u.username} for u in disponibles]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_socio(request, clase_id):
    clase = get_object_or_404(Clase, id=clase_id)
    if request.user != clase.entrenador:
        return Response({'error': 'No sos el entrenador de esta clase'}, status=403)
    socio_id = request.data.get('socio_id')
    socio = get_object_or_404(User, id=socio_id, perfil__rol='socio')
    clase.socios.add(socio)
    return Response({'detail': 'Socio añadido'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def quitar_socio(request, clase_id, socio_id):
    clase = get_object_or_404(Clase, id=clase_id)
    if request.user != clase.entrenador:
        return Response({'error': 'No sos el entrenador de esta clase'}, status=403)
    socio = get_object_or_404(User, id=socio_id, perfil__rol='socio')
    clase.socios.remove(socio)
    return Response({'detail': 'Socio removido'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def anotarse_clase(request, clase_id):
    socio = request.user
    if socio.perfil.rol != 'socio':
        return Response({'error': 'Solo los socios pueden anotarse'}, status=403)
    clase = get_object_or_404(Clase, id=clase_id)
    if clase.socios.filter(id=socio.id).exists():
        return Response({'error': 'Ya estás anotado a esta clase'}, status=400)
    clase.socios.add(socio)
    return Response({'detail': 'Te has anotado correctamente'}, status=200)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def desuscribirse_clase(request, clase_id):
    socio = request.user
    if socio.perfil.rol != 'socio':
        return Response({'error': 'Solo los socios pueden darse de baja'}, status=403)
    clase = get_object_or_404(Clase, id=clase_id)
    if not clase.socios.filter(id=socio.id).exists():
        return Response({'error': 'No estás anotado a esta clase'}, status=400)
    clase.socios.remove(socio)
    return Response({'detail': 'Te has dado de baja correctamente'}, status=200)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def editar_clase(request, clase_id):
    clase = get_object_or_404(Clase, id=clase_id)
    if request.user != clase.entrenador:
        return Response({'error': 'No sos el entrenador de esta clase'}, status=403)
    data = request.data
    clase.nombre = data.get('nombre', clase.nombre)
    clase.descripcion = data.get('descripcion', clase.descripcion)
    clase.dia = data.get('dia', clase.dia)
    clase.hora_inicio = data.get('hora_inicio', clase.hora_inicio)
    clase.hora_fin = data.get('hora_fin', clase.hora_fin)
    clase.save()
    return Response({'detail': 'Clase actualizada'}, status=200)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_clase(request, clase_id):
    clase = get_object_or_404(Clase, id=clase_id)
    if request.user != clase.entrenador:
        return Response({'error': 'No sos el entrenador de esta clase'}, status=403)
    clase.delete()
    return Response({'detail': 'Clase eliminada'}, status=204)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_socio(request):
    user = request.user
    if not hasattr(user, 'perfil') or user.perfil.rol != 'socio':
        return Response({'error': 'Solo los socios pueden acceder'}, status=403)
    clases = user.clases_socio.all()
    clases_data = []
    for clase in clases:
        clases_data.append({
            'id': clase.id,
            'nombre': clase.nombre,
            'dia': clase.dia.strftime('%A'),
            'fecha': clase.dia.strftime('%d/%m/%Y'),
            'hora': clase.hora_inicio.strftime('%H:%M'),
            'hora_fin': clase.hora_fin.strftime('%H:%M'),
            'instructor': clase.entrenador.username if clase.entrenador else 'Sin asignar',
            'descripcion': clase.descripcion
        })
    rutinas_data = [
        {'id': 1, 'nombre': 'Rutina de tonificación muscular', 'descripcion': 'Enfoque en piernas y glúteos', 'duracion': '45 min'}
    ]
    membresia_data = {
        'tipo': 'Premium',
        'estado': 'Activa',
        'fechaVencimiento': '31/12/2025',
        'diasRestantes': 68
    }
    total_clases = clases.count()
    asistencias_mes = 12
    return Response({
        'user': {
            'username': user.username,
            'email': user.email,
            'rol': user.perfil.rol
        },
        'clases': clases_data,
        'rutinas': rutinas_data,
        'membresia': membresia_data,
        'estadisticas': {
            'asistencias_mes': asistencias_mes,
            'clases_reservadas': total_clases,
            'rutinas_activas': len(rutinas_data)
        }
    }, status=200)

# ========== ENDPOINTS ESPECÍFICOS DE COMPRAS ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_compras(request):
    """Obtener estadísticas de compras"""
    from django.db.models import Sum, Count, Avg
    from datetime import datetime, timedelta
    
    # Estadísticas generales
    total_compras = Compra.objects.count()
    monto_total = Compra.objects.aggregate(Sum('total'))['total__sum'] or 0
    promedio_compra = Compra.objects.aggregate(Avg('total'))['total__avg'] or 0
    
    # Compras del mes actual
    hoy = datetime.now()
    inicio_mes = hoy.replace(day=1)
    compras_mes = Compra.objects.filter(fecha__gte=inicio_mes).count()
    monto_mes = Compra.objects.filter(fecha__gte=inicio_mes).aggregate(Sum('total'))['total__sum'] or 0
    
    # Top proveedores
    top_proveedores = Compra.objects.values('proveedor__nombre').annotate(
        total_compras=Count('id'),
        monto_total=Sum('total')
    ).order_by('-monto_total')[:5]
    
    # Compras recientes
    compras_recientes = Compra.objects.select_related('proveedor').order_by('-fecha')[:5]
    compras_recientes_data = []
    for compra in compras_recientes:
        compras_recientes_data.append({
            'id': compra.id,
            'proveedor': compra.proveedor.nombre,
            'fecha': compra.fecha,
            'total': compra.total
        })
    
    return Response({
        'estadisticas_generales': {
            'total_compras': total_compras,
            'monto_total': float(monto_total),
            'promedio_compra': float(promedio_compra),
            'compras_mes': compras_mes,
            'monto_mes': float(monto_mes)
        },
        'top_proveedores': list(top_proveedores),
        'compras_recientes': compras_recientes_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compras_por_proveedor(request, proveedor_id):
    """Obtener todas las compras de un proveedor específico"""
    proveedor = get_object_or_404(Proveedor, id=proveedor_id)
    compras = Compra.objects.filter(proveedor=proveedor).order_by('-fecha')
    serializer = CompraSerializer(compras, many=True)
    
    return Response({
        'proveedor': ProveedorSerializer(proveedor).data,
        'compras': serializer.data
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_compra_con_stock(request, compra_id):
    """Eliminar compra y revertir el stock de accesorios"""
    compra = get_object_or_404(Compra, id=compra_id)
    
    # Revertir stock antes de eliminar
    for item in compra.items.all():
        accesorio = item.accesorio
        accesorio.stock -= item.cantidad
        if accesorio.stock < 0:
            accesorio.stock = 0  # Evitar stock negativo
        accesorio.save()
    
    compra.delete()
    return Response({'detail': 'Compra eliminada y stock actualizado'}, status=200)
