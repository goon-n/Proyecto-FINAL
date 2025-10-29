from rest_framework import routers
from .views import CajaViewSet, MovimientoDeCajaViewSet

router = routers.DefaultRouter()
router.register(r'cajas', CajaViewSet)   # <--- asegurate que esté como 'cajas'
router.register(r'movimientos-caja', MovimientoDeCajaViewSet)

urlpatterns = router.urls
