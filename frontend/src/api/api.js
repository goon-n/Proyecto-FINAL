// src/api/api.js - ACTUALIZADO CON VERIFICACIÓN DE CAJA SIN AUTH

import apiClient from "../services/authServices";
import axios from 'axios'; // ✅ Importar axios directamente

// ✅ Cliente axios sin autenticación para endpoints públicos
const publicClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Ajusta según tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export const descontarClaseManual = async (cuotaId) => {
    try {
        // ✅ CORREGIR: Agregar 'cuota_mensual' en la ruta
        const response = await apiClient.post(`/cuotas/cuota_mensual/${cuotaId}/descontar_clase_manual/`);
        return response.data;
    } catch (error) {
        console.error("❌ Error al descontar clase:", error);
        throw error;
    }
};

const api = {
  // ----- Usuario Actual -----
  obtenerUsuarioActual: async () => {
    const response = await apiClient.get('/general/user/');
    return response.data;
  },

  // ----- Perfil -----
  obtenerMiPerfil: async () => {
    const response = await apiClient.get('/general/perfil/');
    return response.data;
  },

  actualizarMiPerfil: async (data) => {
    const response = await apiClient.patch('/general/perfil/', data);
    return response.data;
  },

  // ----- Usuarios -----
  listarUsuarios: async () => {
    const response = await apiClient.get('/general/usuarios/');
    return response.data;
  },

  listarUsuariosDesactivados: async () => {
    const response = await apiClient.get('/general/usuarios/desactivados/');
    return response.data;
  },

  desactivarUsuario: async (userId) => {
    const response = await apiClient.delete(`/general/usuarios/${userId}/desactivar/`);
    return response.data;
  },

  activarUsuario: async (userId) => {
    const response = await apiClient.post(`/general/usuarios/${userId}/activar/`);
    return response.data;
  },

  editarRolUsuario: async (userId, rol) => {
    const response = await apiClient.patch(`/general/usuarios/${userId}/rol/`, { rol });
    return response.data;
  },

  crearUsuario: async (data) => {
    const response = await apiClient.post('/general/usuarios/', data);
    return response.data;
  },

  cambiarContrasena: async (userId, data) => {
    const response = await apiClient.patch(`/general/usuarios/${userId}/cambiar-contrasena/`, data);
    return response.data;
  },

  // ----- Cuotas Mensuales -----
  // Planes
  listarPlanes: async () => {
    const response = await apiClient.get('/cuotas/planes/');
    return response.data;
  },

  listarPlanesActivos: async () => {
    const response = await apiClient.get('/cuotas/planes/planes_activos/');
    return response.data;
  },

  obtenerPlanPopular: async () => {
    const response = await apiClient.get('/cuotas/planes/plan_popular/');
    return response.data;
  },

  // Cuotas
  obtenerCuotaSocio: async () => {
    const response = await apiClient.get('/cuotas/cuota_mensual/mi_cuota/');
    return response.data;
  },

  listarCuotas: async () => {
    const response = await apiClient.get('/cuotas/cuota_mensual/');
    return response.data;
  },

  listarCuotasActivas: async () => {
    const response = await apiClient.get('/cuotas/cuota_mensual/cuotas_activas/');
    return response.data;
  },

  listarCuotasVencidas: async () => {
    const response = await apiClient.get('/cuotas/cuota_mensual/cuotas_vencidas/');
    return response.data;
  },

  crearCuota: async (data) => {
    const response = await apiClient.post('/cuotas/cuota_mensual/', data);
    return response.data;
  },

  // Crear cuota con pago
  crearCuotaConPago: async (data) => {
    const response = await apiClient.post('/cuotas/cuota_mensual/crear_con_pago/', data);
    return response.data;
  },

  // Renovación desde el socio (autogestionada)
  solicitarRenovacion: async (data) => {
    const response = await apiClient.post('/cuotas/cuota_mensual/solicitar_renovacion/', data);
    return response.data;
  },

  // Renovación desde admin/entrenador
  renovarCuota: async (cuotaId, data) => {
    const response = await apiClient.post(`/cuotas/cuota_mensual/${cuotaId}/renovar/`, data);
    return response.data;
  },

  suspenderCuota: async (cuotaId) => {
    const response = await apiClient.post(`/cuotas/cuota_mensual/${cuotaId}/suspender/`);
    return response.data;
  },

  cancelarCuota: async (cuotaId) => {
    const response = await apiClient.post(`/cuotas/cuota_mensual/${cuotaId}/cancelar/`);
    return response.data;
  },

  // Historial de pagos
  listarHistorialPagos: async () => {
    const response = await apiClient.get('/cuotas/historial-pagos/');
    return response.data;
  },

  miHistorialPagos: async () => {
    const response = await apiClient.get('/cuotas/historial-pagos/mis_pagos/');
    return response.data;
  },

  // ----- Proveedores -----
  listarProveedoresActivos: async () => {
    const response = await apiClient.get('/general/proveedores/activos/');
    return response.data;
  },

  listarProveedoresDesactivados: async () => {
    const response = await apiClient.get('/general/proveedores/desactivados/');
    return response.data;
  },

  crearProveedor: async (data) => {
    const response = await apiClient.post('/general/proveedores/crear/', data);
    return response.data;
  },

  editarProveedor: async (proveedorId, data) => {
    const response = await apiClient.put(`/general/proveedores/${proveedorId}/editar/`, data);
    return response.data;
  },

  desactivarProveedor: async (proveedorId) => {
    const response = await apiClient.delete(`/general/proveedores/${proveedorId}/desactivar/`);
    return response.data;
  },

  activarProveedor: async (proveedorId) => {
    const response = await apiClient.post(`/general/proveedores/${proveedorId}/activar/`);
    return response.data;
  },

  // ----- Accesorios -----
  listarAccesorios: async () => {
    const response = await apiClient.get('/general/accesorios/');
    return response.data;
  },

  crearAccesorio: async (data) => {
    const response = await apiClient.post('/general/accesorios/', data);
    return response.data;
  },

  editarAccesorio: async (accesorioId, data) => {
    const response = await apiClient.put(`/general/accesorios/${accesorioId}/`, data);
    return response.data;
  },

  eliminarAccesorio: async (accesorioId) => {
    const response = await apiClient.delete(`/general/accesorios/${accesorioId}/`);
    return response.data;
  },

  // ----- Compras -----
  listarCompras: async (params) => {
    const response = await apiClient.get('/general/compras/', { params });
    return response.data;
  },

  crearCompra: async (data) => {
    const response = await apiClient.post('/general/compras/', data);
    return response.data;
  },

  eliminarCompraConStock: async (compraId) => {
    const response = await apiClient.delete(`/general/compras/${compraId}/eliminar-con-stock/`);
    return response.data;
  },

  estadisticasCompras: async () => {
    const response = await apiClient.get('/general/compras/estadisticas/');
    return response.data;
  },

  comprasPorProveedor: async (proveedorId) => {
    const response = await apiClient.get(`/general/compras/proveedor/${proveedorId}/`);
    return response.data;
  },

  // ----- Clases -----
  listarClases: async () => {
    const response = await apiClient.get('/general/clases/');
    return response.data;
  },

  crearClase: async (data) => {
    const response = await apiClient.post('/general/clases/', data);
    return response.data;
  },

  editarClase: async (claseId, data) => {
    const response = await apiClient.put(`/general/clases/${claseId}/editar/`, data);
    return response.data;
  },

  eliminarClase: async (claseId) => {
    const response = await apiClient.delete(`/general/clases/${claseId}/eliminar/`);
    return response.data;
  },

  asignarSocio: async (claseId, socioId) => {
    const response = await apiClient.post(`/general/clases/${claseId}/socios/`, { socio_id: socioId });
    return response.data;
  },

  quitarSocio: async (claseId, socioId) => {
    const response = await apiClient.delete(`/general/clases/${claseId}/socios/${socioId}/`);
    return response.data;
  },

  anotarseClase: async (claseId) => {
    const response = await apiClient.post(`/general/clases/${claseId}/anotarse/`);
    return response.data;
  },

  desuscribirseClase: async (claseId) => {
    const response = await apiClient.delete(`/general/clases/${claseId}/desuscribirse/`);
    return response.data;
  },

  sociosDisponibles: async (claseId) => {
    const response = await apiClient.get(`/general/clases/${claseId}/socios/disponibles/`);
    return response.data;
  },

  // ----- Dashboard Socio -----
  dashboardSocio: async () => {
    const response = await apiClient.get('/general/dashboard/socio/');
    return response.data;
  },

  // ----- Caja -----
  listarCajas: async (params = {}) => {
    const finalParams = {
      page_size: 5,
      ...params
    };
    const response = await apiClient.get('/caja/caja/', { params: finalParams });
    return response.data;
  },

  // ✅ MODIFICADO: Usar cliente público sin autenticación
  cajaActual: async () => {
    try {
      const response = await publicClient.get('/caja/caja/actual/');
      return response.data;
    } catch (error) {
      // Si falla, lanzar el error para que Register lo maneje
      throw error;
    }
  },

  abrirCaja: async (data) => {
    const response = await apiClient.post('/caja/caja/', data);
    return response.data;
  },

  cerrarCaja: async (cajaId, data) => {
    const response = await apiClient.patch(`/caja/caja/${cajaId}/`, data);
    return response.data;
  },

  listarMovimientos: async (cajaId) => {
    const response = await apiClient.get('/caja/movimiento-caja/', {
      params: { caja: cajaId }
    });
    return response.data;
  },

  crearMovimiento: async (data) => {
    const response = await apiClient.post('/caja/movimiento-caja/', data);
    return response.data;
  },

  // ----- Turnos -----
  listarTurnos: async () => {
    const response = await apiClient.get('/turnos/turno/');
    return response.data;
  },

  obtenerCalendarioTurnos: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/turnos/turno/calendario/', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
    return response.data;
  },

  // ✅ AGREGADO: Endpoint para obtener turnos del socio actual
  obtenerMisTurnos: async () => {
    const response = await apiClient.get('/turnos/turno/mis_turnos/');
    return response.data;
  },

  reservarTurno: async (turnoId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/reservar/`);
    return response.data;
  },

  // Staff reserva turno a nombre de un socio
  reservarTurnoParaSocio: async (turnoId, socioId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/reservar_para_socio/`, {
      socio_id: socioId
    });
    return response.data;
  },

  // Staff cancela turno de un socio
  cancelarTurnoParaSocio: async (turnoId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/cancelar_para_socio/`);
    return response.data;
  },

  confirmarTurno: async (turnoId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/confirmar/`);
    return response.data;
  },

  cancelarTurno: async (turnoId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/cancelar/`);
    return response.data;
  },

  crearTurno: async (data) => {
    const response = await apiClient.post('/turnos/turno/', {
      hora_inicio: data.hora_inicio
    });
    return response.data;
  },

  actualizarTurno: async (turnoId, data) => {
    const response = await apiClient.patch(`/turnos/turno/${turnoId}/`, data);
    return response.data;
  },

  eliminarTurno: async (turnoId) => {
    const response = await apiClient.delete(`/turnos/turno/${turnoId}/`);
    return response.data;
  },

  generarTurnosSemana: async (fechaInicio) => {
    const response = await apiClient.post('/turnos/turno/generar_turnos_semana/', {
      fecha_inicio: fechaInicio
    });
    return response.data;
  }, 

    descontarClaseManual,  
};

export default api;