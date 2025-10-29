import axios from "axios";
import { getCSRFToken } from "../utils/csrf";

const API_URL = "http://localhost:8000/api/cajas/";

export const getCajas = () =>
  axios.get(API_URL, { withCredentials: true });

export const getCaja = (id) =>
  axios.get(`${API_URL}${id}/`, { withCredentials: true });

export const createCaja = (data) =>
  axios.post(API_URL, data, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
  });

export const updateCaja = (id, data) =>
  axios.put(`${API_URL}${id}/`, data, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
  });

export const deleteCaja = (id) =>
  axios.delete(`${API_URL}${id}/`, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
  });
