// src/services/accesorios.service.js
import apiClient from "./authServices";

// ✅ SIN /api/ porque apiClient ya lo tiene en baseURL
const API_URL = "/general/accesorios/";
const PROV_ACTIVOS_URL = "/general/proveedores/activos/";
const PROV_DESACTIVADOS_URL = "/general/proveedores/desactivados/";

// Operaciones CRUD para accesorios
export const getAccesorios = () => apiClient.get(API_URL);

export const getAccesorio = (id) => apiClient.get(`${API_URL}${id}/`);

export const createAccesorio = (data) => apiClient.post(API_URL, data);

export const updateAccesorio = (id, data) => apiClient.put(`${API_URL}${id}/`, data);

export const deleteAccesorio = (id) => apiClient.delete(`${API_URL}${id}/`);

export const toggleAccesorioActivo = async (id, activo) => {
  try {
    const accesorioActual = await getAccesorio(id);
    const response = await apiClient.patch(
      `${API_URL}${id}/`, 
      { activo: !activo }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Obtener proveedores
export const getProveedores = () => apiClient.get(PROV_ACTIVOS_URL);

export const getTodosLosProveedores = async () => {
  try {
    const [activos, inactivos] = await Promise.all([
      apiClient.get(PROV_ACTIVOS_URL),
      apiClient.get(PROV_DESACTIVADOS_URL)
    ]);
    return {
      data: [...activos.data, ...inactivos.data]
    };
  } catch (error) {
    throw error;
  }
};

// Filtros específicos para accesorios
export const getAccesoriosActivos = () => 
  apiClient.get(`${API_URL}?activo=true`);

export const getAccesoriosInactivos = () => 
  apiClient.get(`${API_URL}?activo=false`);

export const getAccesoriosByProveedor = (proveedorId) => 
  apiClient.get(`${API_URL}?proveedor=${proveedorId}`);

// ========== REPORTES DE ACCESORIOS ==========

export const getReportesAccesorios = (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.accesorio) params.append('accesorio', filtros.accesorio);
  
  const url = params.toString() 
    ? `/general/reportes-accesorios/?${params.toString()}`
    : '/general/reportes-accesorios/';
  
  return apiClient.get(url);
};

export const crearReporteAccesorio = (data) => {
  return apiClient.post('/general/reportes-accesorios/', data);
};

export const confirmarReporte = (reporteId, notas = '') => {
  return apiClient.post(`/general/reportes-accesorios/${reporteId}/confirmar/`, {
    notas_confirmacion: notas
  });
};

export const rechazarReporte = (reporteId, notas = '') => {
  return apiClient.post(`/general/reportes-accesorios/${reporteId}/rechazar/`, {
    notas_confirmacion: notas
  });
};

export const getEstadisticasReportes = () => {
  return apiClient.get('/general/reportes-accesorios/estadisticas/');
};