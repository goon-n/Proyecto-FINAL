from django.utils.deprecation import MiddlewareMixin

class DisableCSRFForAPI(MiddlewareMixin):
    """
    Middleware para deshabilitar CSRF solo para las rutas de API
    """
    def process_request(self, request):
        if request.path.startswith('/api/'):
            # Marcar la request como exempt de CSRF
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None