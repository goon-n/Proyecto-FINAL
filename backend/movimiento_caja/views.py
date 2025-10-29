from rest_framework import viewsets, permissions
from .models import Caja, MovimientoDeCaja
from .serializers import CajaSerializer, MovimientoDeCajaSerializer

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all().order_by('-fecha_apertura')
    serializer_class = CajaSerializer
    permission_classes = [permissions.IsAuthenticated]

class MovimientoDeCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoDeCaja.objects.all().order_by('-fecha')
    serializer_class = MovimientoDeCajaSerializer
    filterset_fields = ['caja']
    permission_classes = [permissions.IsAuthenticated]
