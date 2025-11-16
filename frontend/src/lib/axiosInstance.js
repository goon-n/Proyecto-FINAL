// src/lib/axiosInstance.js

import axios from 'axios';

// Función para obtener el CSRF token de las cookies
const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
};

const BASE_URL = "http://127.0.0.1:8000/api"; 

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Habilita el envío de cookies
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// Interceptor para añadir el header X-CSRFToken a métodos POST/PATCH/DELETE
axiosInstance.interceptors.request.use(config => {
    const method = config.method.toUpperCase();
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        } else {
            console.error("CSRF Token no encontrado. ¿Estás logueado?");
            // Opcional: throw new axios.Cancel('CSRF token missing');
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;