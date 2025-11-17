// src/services/compra.service.js - CON JWT

import apiClient from "./authServices"; // ✅ Usar el cliente con JWT

const API_URL = "/general/compras/";
const PROV_URL = "/general/proveedores/";
const ACC_URL = "/general/accesorios/";

// Compras básicas
export const getCompras = async (filtros = {}) => {
  const params = {};

  if (filtros.proveedor) params.proveedor = filtros.proveedor;
  if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
  if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;

  const response = await apiClient.get(API_URL, { params });
  return response;
};

export const getCompra = async (id) => {
  const response = await apiClient.get(`${API_URL}${id}/`);
  return response;
};

export const createCompra = async (data) => {
  const response = await apiClient.post(API_URL, data);
  return response;
};

export const updateCompra = async (id, data) => {
  const response = await apiClient.put(`${API_URL}${id}/`, data);
  return response;
};

export const deleteCompra = async (id) => {
  const response = await apiClient.delete(`${API_URL}${id}/`);
  return response;
};

// Funciones específicas de compras
export const eliminarCompraConStock = async (id) => {
  const response = await apiClient.delete(`/general/compras/${id}/eliminar-con-stock/`);
  return response;
};

export const getEstadisticasCompras = async () => {
  const response = await apiClient.get("/general/compras/estadisticas/");
  return response;
};

export const getComprasPorProveedor = async (proveedorId) => {
  const response = await apiClient.get(`/general/compras/proveedor/${proveedorId}/`);
  return response;
};

// Proveedores
export const getProveedores = async () => {
  const response = await apiClient.get("/general/proveedores/activos/");
  return response;
};

export const getProveedoresActivos = async () => {
  const response = await apiClient.get("/general/proveedores/activos/");
  return response;
};

// Función alternativa si necesitas todos los proveedores (incluidos inactivos)
export const getTodosLosProveedores = async () => {
  const response = await apiClient.get(PROV_URL);
  return response;
};

// Accesorios
export const getAccesorios = async () => {
  const response = await apiClient.get(ACC_URL);
  return response;
};

// Funciones de utilidad para manejar errores
export const handleApiError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.detail || error.response.data?.error || 'Error en el servidor';

    switch (status) {
      case 400:
        return `Datos inválidos: ${message}`;
      case 401:
        return 'No autorizado. Por favor, inicie sesión nuevamente.';
      case 403:
        return 'No tiene permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 500:
        return 'Error interno del servidor.';
      default:
        return message;
    }
  } else if (error.request) {
    return 'No se pudo conectar con el servidor. Verifique su conexión.';
  } else {
    return 'Error al procesar la solicitud.';
  }
};

// Validaciones del lado del cliente
export const validarCompra = (compra) => {
  const errores = [];

  if (!compra.proveedor) {
    errores.push('Debe seleccionar un proveedor');
  }

  if (!compra.items || compra.items.length === 0) {
    errores.push('Debe agregar al menos un ítem');
  }

  if (compra.items) {
    compra.items.forEach((item, index) => {
      if (!item.accesorio) {
        errores.push(`Ítem ${index + 1}: Debe seleccionar un accesorio`);
      }
      if (!item.cantidad || item.cantidad <= 0) {
        errores.push(`Ítem ${index + 1}: La cantidad debe ser mayor a 0`);
      }
      if (!item.precio_unitario || item.precio_unitario <= 0) {
        errores.push(`Ítem ${index + 1}: El precio unitario debe ser mayor a 0`);
      }
    });
  }

  if (!compra.total || compra.total <= 0) {
    errores.push('El total debe ser mayor a 0');
  }

  return errores;
};

// Función para calcular el total de una compra
export const calcularTotal = (items) => {
  return items.reduce((total, item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const precio = parseFloat(item.precio_unitario) || 0;
    return total + (cantidad * precio);
  }, 0);
};