// src/services/movimientoCaja.service.js - CON JWT (CORREGIDO)

import apiClient from "./authServices"; // ✅ Usar el cliente con JWT

// ✅ CORRECCIÓN: Usar ruta relativa como en los otros servicios
// apiClient ya tiene baseURL: 'http://127.0.0.1:8000/api'
const API_URL = "/caja/movimiento-caja/"; // Ruta final: http://127.0.0.1:8000/api/caja/movimiento-caja/

export const getMovimientos = async (params = {}) => {
  try {
    const response = await apiClient.get(API_URL, { params });
    return response;
  } catch (error) {
    console.error("❌ Error al obtener movimientos:", error);
    throw error;
  }
};

export const getMovimiento = async (id) => {
  try {
    const response = await apiClient.get(`${API_URL}${id}/`);
    return response;
  } catch (error) {
    console.error("❌ Error al obtener movimiento:", error);
    throw error;
  }
};

export const createMovimiento = async (data) => {
  try {
    const response = await apiClient.post(API_URL, data);
    return response;
  } catch (error) {
    console.error("❌ Error al crear movimiento:", error);
    throw error;
  }
};

export const updateMovimiento = async (id, data) => {
  try {
    const response = await apiClient.patch(`${API_URL}${id}/`, data);
    return response;
  } catch (error) {
    console.error("❌ Error al actualizar movimiento:", error);
    throw error;
  }
};

export const deleteMovimiento = async (id) => {
  try {
    const response = await apiClient.delete(`${API_URL}${id}/`);
    return response;
  } catch (error) {
    console.error("❌ Error al eliminar movimiento:", error);
    throw error;
  }
};

// Función para obtener movimientos de una caja específica
export const getMovimientosPorCaja = async (cajaId) => {
  try {
    const response = await apiClient.get(API_URL, {
      params: { caja: cajaId }
    });
    return response;
  } catch (error) {
    console.error("❌ Error al obtener movimientos de caja:", error);
    throw error;
  }
};