// src/api/api.js

// Base URL de tu backend Django
const BASE_URL = "http://localhost:8000/api"; // Cambiado a localhost para consistencia

// Función helper para hacer peticiones con autenticación
const makeAuthenticatedRequest = async (url, options = {}) => {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.detail || 'Error en la petición';
    } catch {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  return response;
};

const api = {
  // ----- Usuarios existentes -----
  listarUsuarios: async () => {
    const res = await fetch(`${BASE_URL}/usuarios/`, { credentials: "include" });
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
  },

  crearUsuario: async (data) => {
    const res = await fetch(`${BASE_URL}/usuarios/crear-usuario/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear usuario");
    return res.json();
  },

  editarRolUsuario: async (userId, rol) => {
    const res = await fetch(`${BASE_URL}/usuarios/${userId}/rol/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rol }),
    });
    if (!res.ok) throw new Error("Error al editar rol");
    return res.json();
  },

  eliminarUsuario: async (userId) => {
    const res = await fetch(`${BASE_URL}/usuarios/${userId}/eliminar/`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al eliminar usuario");
    return res.json();
  },

  // ----- Clases existentes -----
  listarClases: async () => {
    const res = await fetch(`${BASE_URL}/clases/`, { credentials: "include" });
    if (!res.ok) throw new Error("Error al obtener clases");
    return res.json();
  },

  asignarSocio: async (claseId, socioId) => {
    const res = await fetch(`${BASE_URL}/clases/${claseId}/socios/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ socio_id: socioId }),
    });
    if (!res.ok) throw new Error("Error al asignar socio");
    return res.json();
  },

  quitarSocio: async (claseId, socioId) => {
    const res = await fetch(`${BASE_URL}/clases/${claseId}/socios/${socioId}/`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al quitar socio");
    return res.json();
  },

  anotarseClase: async (claseId) => {
    const res = await fetch(`${BASE_URL}/clases/${claseId}/anotarse/`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al anotarse a la clase");
    return res.json();
  },

  desuscribirseClase: async (claseId) => {
    const res = await fetch(`${BASE_URL}/clases/${claseId}/desuscribirse/`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al desuscribirse de la clase");
    return res.json();
  },

  // ----- NUEVOS: AUTH -----
  register: async (data) => {
    const res = await fetch(`${BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al registrar usuario");
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error en login");
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile/`, { credentials: "include" });
    if (!res.ok) throw new Error("Error al obtener perfil");
    return res.json();
  },

  // ----- Proveedores -----
  listarProveedores: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    if (filtros.search) params.append('search', filtros.search);
    
    const url = `${BASE_URL}/proveedores/${params.toString() ? '?' + params.toString() : ''}`;
    const res = await makeAuthenticatedRequest(url);
    return res.json();
  },

  crearProveedor: async (data) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/proveedores/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  obtenerProveedor: async (id) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/proveedores/${id}/`);
    return res.json();
  },

  editarProveedor: async (id, data) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/proveedores/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  eliminarProveedor: async (id) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/proveedores/${id}/`, {
      method: "DELETE",
    });
    return res.json();
  },

  // ----- Accesorios -----
  listarAccesorios: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    if (filtros.proveedor) params.append('proveedor', filtros.proveedor);
    if (filtros.search) params.append('search', filtros.search);
    
    const url = `${BASE_URL}/accesorios/${params.toString() ? '?' + params.toString() : ''}`;
    const res = await makeAuthenticatedRequest(url);
    return res.json();
  },

  crearAccesorio: async (data) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/accesorios/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  obtenerAccesorio: async (id) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/accesorios/${id}/`);
    return res.json();
  },

  editarAccesorio: async (id, data) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/accesorios/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  eliminarAccesorio: async (id) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/accesorios/${id}/`, {
      method: "DELETE",
    });
    return res.json();
  },

  actualizarStock: async (id, stock) => {
    const res = await makeAuthenticatedRequest(`${BASE_URL}/accesorios/${id}/stock/`, {
      method: "PUT",
      body: JSON.stringify({ stock }),
    });
    return res.json();
  },
};

export default api;
