// src/services/accesorios.service.js
import apiClient from "./authServices";

const API_URL = "/general/accesorios/";
const PROV_ACTIVOS_URL = "/general/proveedores/activos/";
const PROV_TODOS_URL = "/general/proveedores/activos/";

// Operaciones CRUD para accesorios
export const getAccesorios = () => apiClient.get(API_URL);

export const getAccesorio = (id) => apiClient.get(`${API_URL}${id}/`);

export const createAccesorio = (data) => apiClient.post(API_URL, data);

export const updateAccesorio = (id, data) => apiClient.put(`${API_URL}${id}/`, data);

export const deleteAccesorio = (id) => apiClient.delete(`${API_URL}${id}/`);

// 🆕 NUEVO - Toggle activo/inactivo
export const toggleAccesorioActivo = async (id, activo) => {
  try {
    // Primero obtener los datos actuales del accesorio
    const accesorioActual = await getAccesorio(id);
    
    // Actualizar solo el campo activo
    const response = await apiClient.patch(
      `${API_URL}${id}/`, 
      { activo: !activo } // Toggle: si está activo lo desactiva y viceversa
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Obtener proveedores para el formulario (solo activos)
export const getProveedores = () => apiClient.get(PROV_ACTIVOS_URL);

// Obtener todos los proveedores (activos e inactivos) para editar
export const getTodosLosProveedores = async () => {
  try {
    const [activos, inactivos] = await Promise.all([
      apiClient.get(PROV_ACTIVOS_URL),
      apiClient.get("/general/proveedores/desactivados/")
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