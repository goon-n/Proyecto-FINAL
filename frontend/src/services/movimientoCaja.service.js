// services/movimientoCaja.service.js

import axios from "axios";
import { getCSRFToken } from "../utils/csrf";

const API_URL = 'http://localhost:8000/api/movimiento-caja/'; 

export const getMovimientos = () =>
  axios.get(API_URL, { withCredentials: true });

export const getMovimiento = (id) =>
  axios.get(`${API_URL}${id}/`, { withCredentials: true });

export const createMovimiento = (data) =>
  axios.post(API_URL, data, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
  });

export const updateMovimiento = (id, data) =>
  axios.put(`${API_URL}${id}/`, data, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
  });

export const deleteMovimiento = (id) =>
  axios.delete(`${API_URL}${id}/`, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
  });