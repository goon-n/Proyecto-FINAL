// src/utils/formatters.js

/**
 * Formatea una fecha a formato legible
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada o '-' si no existe
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  try {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

/**
 * Retorna la variante del badge según el rol
 * @param {string} rol - Rol del usuario (admin, entrenador, socio)
 * @returns {string} Variante del badge
 */
export const getRolBadgeVariant = (rol) => {
  const variants = {
    admin: 'default',
    entrenador: 'secondary',
    socio: 'outline'
  };
  return variants[rol] || 'outline';
};

/**
 * Formatea un número a moneda argentina
 * @param {number} monto - Monto a formatear
 * @returns {string} Monto formateado
 */
export const formatearMoneda = (monto) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(monto);
};