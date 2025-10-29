// src/services/compra.service.js

import axios from 'axios';

const API_URL = "http://localhost:8000/api/compras/";
const PROV_URL = "http://localhost:8000/api/proveedores/";
const ACC_URL = "http://localhost:8000/api/accesorios/";

// Compras
export const getCompras = () => axios.get(API_URL, { withCredentials: true });
export const getCompra = (id) => axios.get(`${API_URL}${id}/`, { withCredentials: true });
export const createCompra = (data) => axios.post(API_URL, data, { withCredentials: true });
export const updateCompra = (id, data) => axios.put(`${API_URL}${id}/`, data, { withCredentials: true });
export const deleteCompra = (id) => axios.delete(`${API_URL}${id}/`, { withCredentials: true });

// Proveedores
export const getProveedores = () => axios.get(PROV_URL, { withCredentials: true });

// Accesorios
export const getAccesorios = () => axios.get(ACC_URL, { withCredentials: true });
