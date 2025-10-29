#backend/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import Socio, Perfil, Clase, Proveedor, Accesorios, Compra, ItemCompra
from .serializers import (
    CompraSerializer, ItemCompraSerializer, SocioSerializer,
    ClaseSerializer, CustomUserSerializer, ProveedorSerializer, AccesoriosSerializer,
)
from django.utils import timezone

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
    permission_classes = [IsAuthenticated]

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_usuarios(request):
    if not hasattr(request.user, 'perfil') or request.user.perfil.rol != 'admin':
        return Response({'error': 'No tienes permisos'}, status=403)
    usuarios = User.objects.filter(perfil__is_active=True).values(
        'id', 'username', 'email', 'date_joined', 'perfil__rol'
    )
    return Response(list(usuarios))

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
