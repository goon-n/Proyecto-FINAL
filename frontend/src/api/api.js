// src/api/api.js (REEMPLAZAR TODO)

import axiosInstance from "../lib/axiosInstance"; // Asegúrate que esta ruta sea correcta

const api = {
 // ----- Usuarios -----
  listarUsuarios: async () => {
     const response = await axiosInstance.get('/usuarios/');
    return response.data;
  },
  crearUsuario: async (data) => {
     const response = await axiosInstance.post('/usuarios/crear-usuario/', data);
    return response.data;
  },
  
  editarRolUsuario: async (userId, rol) => {
     const response = await axiosInstance.patch(`/usuarios/${userId}/rol/`, { rol });
    return response.data;
  },

  eliminarUsuario: async (userId) => {
    const response = await axiosInstance.delete(`/usuarios/${userId}/eliminar/`);
    return response.data;
  },

  // ----- Clases -----
  listarClases: async () => {
    const response = await axiosInstance.get('/clases/');
    return response.data;
  },
  
  asignarSocio: async (claseId, socioId) => {
    const response = await axiosInstance.post(`/clases/${claseId}/socios/`, { socio_id: socioId });
    return response.data;
  },

  quitarSocio: async (claseId, socioId) => {
    const response = await axiosInstance.delete(`/clases/${claseId}/socios/${socioId}/`);
    return response.data;
  },

  anotarseClase: async (claseId) => {
   const response = await axiosInstance.post(`/clases/${claseId}/anotarse/`);
    return response.data;
  },

  desuscribirseClase: async (claseId) => {
    const response = await axiosInstance.delete(`/clases/${claseId}/desuscribirse/`);
    return response.data;
  },

// ----- AUTH (Si ya están en AuthContext, estas son redundantes) -----
// Pero si las usas, deben usar axiosInstance.
  register: async (data) => {
    const response = await axiosInstance.post('/register/', data);
    return response.data;
  },

  login: async (data) => {
    const response = await axiosInstance.post('/login/', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/profile/');
    return response.data;
  },
};

export default api;