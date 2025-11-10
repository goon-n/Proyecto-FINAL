# backend/permissions.py
from rest_framework import permissions

class IsStaffUser(permissions.BasePermission):
    """
    Permite el acceso solo a usuarios que tienen is_staff=True (entrenadores/administradores).
    """
    def has_permission(self, request, view):
        # Asegura que el usuario esté autenticado y tenga la marca is_staff=True.
        return bool(request.user and request.user.is_staff)