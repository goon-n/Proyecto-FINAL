// src/services/caja.service.js - CON JWT

import apiClient from "./authServices"; // ✅ Usar el cliente con JWT

const API_URL = '/caja/caja/';

export const getCajas = async (params = {}) => {
  const finalParams = {
    page_size: 100,
    ...params
  };
  const response = await apiClient.get(API_URL, { params: finalParams });
  return response;
};

export const getCaja = async (id) => {
  const response = await apiClient.get(`${API_URL}${id}/`);
  return response;
};

export const createCaja = async (data) => {
  const response = await apiClient.post(API_URL, data);
  return response;
};

export const updateCaja = async (id, data) => {
  const response = await apiClient.patch(`${API_URL}${id}/`, data);
  return response;
};

export const deleteCaja = async (id) => {
  const response = await apiClient.delete(`${API_URL}${id}/`);
  return response;
};

export const getCajaActual = async () => {
  const response = await apiClient.get(`${API_URL}actual/`);
  return response;
};