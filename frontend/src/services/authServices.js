// src/services/authServices.js

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Crear instancia de axios sin interceptores aún
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar el refresh token automáticamente
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No hay refresh token, redirigir al login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/';
          return Promise.reject(error);
        }

        // Intentar refrescar el token
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  // Login con JWT
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password,
      });

      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Obtener datos del usuario
        const userResponse = await apiClient.get('/general/user/');
        return {
          success: true,
          user: userResponse.data,
          tokens: response.data
        };
      }
      
      return { success: false, error: 'No se recibieron tokens' };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al iniciar sesión'
      };
    }
  },

  // Registro (sigue usando tu endpoint actual)
  async register(username, password, email) {
    try {
      const response = await axios.post(`${API_URL}/general/register/`, {
        username,
        password,
        email,
        rol: 'socio'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrar usuario'
      };
    }
  },

  // 🔧 NUEVO: Registro con pago y movimiento de caja
  async registerWithPayment(userData) {
    try {
      const response = await axios.post(`${API_URL}/general/register-with-payment/`, {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono,
        plan_name: userData.plan_name,
        plan_price: userData.plan_price,
        card_last4: userData.card_last4
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en registerWithPayment:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Error al registrar usuario'
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await apiClient.get('/general/user/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener perfil'
      };
    }
  },

  // Refrescar token manualmente (opcional)
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken,
      });
      
      localStorage.setItem('access_token', response.data.access);
      return { success: true, access: response.data.access };
    } catch (error) {
      return { success: false, error: 'Error al refrescar token' };
    }
  }
};

// Exportar también la instancia de axios configurada
export default apiClient;