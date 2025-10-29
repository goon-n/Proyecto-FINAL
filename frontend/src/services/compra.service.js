// src/services/compra.service.js

import axios from 'axios';
import { getCSRFToken } from "../utils/csrf";

const API_URL = "http://localhost:8000/api/compras/";
const PROV_URL = "http://localhost:8000/api/proveedores/";
const ACC_URL = "http://localhost:8000/api/accesorios/";

// Compras básicas
export const getCompras = (filtros = {}) => {
  const params = new URLSearchParams();
  
  if (filtros.proveedor) {
    params.append('proveedor', filtros.proveedor);
  }
  if (filtros.fecha_desde) {
    params.append('fecha_desde', filtros.fecha_desde);
  }
  if (filtros.fecha_hasta) {
    params.append('fecha_hasta', filtros.fecha_hasta);
  }
  
  const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
  return axios.get(url, { withCredentials: true });
};

export const getCompra = (id) => axios.get(`${API_URL}${id}/`, { withCredentials: true });

export const createCompra = (data) => axios.post(API_URL, data, {
  withCredentials: true,
  headers: {
    "X-CSRFToken": getCSRFToken(),
  }
});

export const updateCompra = (id, data) => axios.put(`${API_URL}${id}/`, data, {
  withCredentials: true,
  headers: {
    "X-CSRFToken": getCSRFToken(),
  }
});

export const deleteCompra = (id) => axios.delete(`${API_URL}${id}/`, {
  withCredentials: true,
  headers: {
    "X-CSRFToken": getCSRFToken(),
  }
});

// Funciones específicas de compras
export const eliminarCompraConStock = (id) => 
  axios.delete(`http://localhost:8000/api/compras/${id}/eliminar-con-stock/`, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRFToken(),
    }
  });

export const getEstadisticasCompras = () => 
  axios.get("http://localhost:8000/api/compras/estadisticas/", { withCredentials: true });

export const getComprasPorProveedor = (proveedorId) => 
  axios.get(`http://localhost:8000/api/compras/proveedor/${proveedorId}/`, { withCredentials: true });

// Proveedores
export const getProveedores = () => 
  axios.get("http://localhost:8000/api/proveedores/activos/", { withCredentials: true });

export const getProveedoresActivos = () => 
  axios.get("http://localhost:8000/api/proveedores/activos/", { withCredentials: true });

// Función alternativa si necesitas todos los proveedores (incluidos inactivos)
export const getTodosLosProveedores = () => axios.get(PROV_URL, { withCredentials: true });

// Accesorios
export const getAccesorios = () => axios.get(ACC_URL, { withCredentials: true });

// Funciones de utilidad para manejar errores
export const handleApiError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado de error
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
    // La petición se hizo pero no se recibió respuesta
    return 'No se pudo conectar con el servidor. Verifique su conexión.';
  } else {
    // Algo pasó al configurar la petición
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
