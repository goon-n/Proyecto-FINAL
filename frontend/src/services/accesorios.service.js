// src/services/accesorios.service.js
import axios from 'axios';
import { getCSRFToken } from "../utils/csrf";

const API_URL = "http://localhost:8000/api/accesorios/";
const PROV_ACTIVOS_URL = "http://localhost:8000/api/proveedores/activos/";
const PROV_TODOS_URL = "http://localhost:8000/api/proveedores/activos/"; // Para formularios, solo activos

// Operaciones CRUD para accesorios
export const getAccesorios = () => axios.get(API_URL, { withCredentials: true });

export const getAccesorio = (id) => axios.get(`${API_URL}${id}/`, { withCredentials: true });

export const createAccesorio = (data) => axios.post(API_URL, data, {
  withCredentials: true,
  headers: {
    "X-CSRFToken": getCSRFToken(),
  }
});

export const updateAccesorio = (id, data) => axios.put(`${API_URL}${id}/`, data, {
  withCredentials: true,
  headers: {
    "X-CSRFToken": getCSRFToken(),
  }
});

export const deleteAccesorio = (id) => axios.delete(`${API_URL}${id}/`, {
  withCredentials: true,
  headers: {
    "X-CSRFToken": getCSRFToken(),
  }
});

// Obtener proveedores para el formulario (solo activos)
export const getProveedores = () => axios.get(PROV_ACTIVOS_URL, { withCredentials: true });

// Obtener todos los proveedores (activos e inactivos) para editar
export const getTodosLosProveedores = async () => {
  try {
    const [activos, inactivos] = await Promise.all([
      axios.get(PROV_ACTIVOS_URL, { withCredentials: true }),
      axios.get("http://localhost:8000/api/proveedores/desactivados/", { withCredentials: true })
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
  axios.get(`${API_URL}?activo=true`, { withCredentials: true });

export const getAccesoriosInactivos = () => 
  axios.get(`${API_URL}?activo=false`, { withCredentials: true });

export const getAccesoriosByProveedor = (proveedorId) => 
  axios.get(`${API_URL}?proveedor=${proveedorId}`, { withCredentials: true });