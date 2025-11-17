// frontend/src/services/turnoService.js

import apiClient from "./authServices"; // 👈 CAMBIAR a apiClient (JWT)

// Consultas Generales
export const getTurnos = async () => {
    const response = await apiClient.get('/turnos/turno/');
    return response.data;
};

export const getCalendarioTurnos = async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/turnos/turno/calendario/', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
    return response.data;
};

// Acciones del Socio
export const reservarTurno = async (turnoId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/reservar/`);
    return response.data;
};

export const confirmarTurno = async (turnoId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/confirmar/`);
    return response.data;
};

export const cancelarTurno = async (turnoId) => {
    const response = await apiClient.post(`/turnos/turno/${turnoId}/cancelar/`);
    return response.data;
};

// Acciones del Staff
export const createTurno = async (data) => {
    const response = await apiClient.post('/turnos/turno/', {
        hora_inicio: data.hora_inicio
    });
    return response.data;
};

export const updateTurno = async (turnoId, data) => {
    const response = await apiClient.patch(`/turnos/turno/${turnoId}/`, data);
    return response.data;
};

export const deleteTurno = async (turnoId) => {
    const response = await apiClient.delete(`/turnos/turno/${turnoId}/`);
    return response.data;
};

export const generarTurnosSemana = async (fechaInicio) => {
    const response = await apiClient.post('/turnos/turno/generar_turnos_semana/', {
        fecha_inicio: fechaInicio
    });
    return response.data;
};