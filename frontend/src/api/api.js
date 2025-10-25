// src/api/api.js

// Base URL de tu backend Django
const BASE_URL = "http://127.0.0.1:8000/api"; // Cambialo si tu backend está en otra URL

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
};

export default api;
