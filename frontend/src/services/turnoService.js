// src/services/turnoService.js

import axiosInstance from "../lib/axiosInstance";

// ----------------------------------------------------------------------
// Consultas Generales (Usadas por Socio y Staff)
// ----------------------------------------------------------------------

export const getTurnos = async () => {
    const response = await axiosInstance.get('/turnos/');
    return response.data;
};


// ----------------------------------------------------------------------
// Acciones del Socio (Reservar/Cancelar)
// ----------------------------------------------------------------------

export const reservarTurno = async (turnoId) => {
    const response = await axiosInstance.post(`/turnos/${turnoId}/reservar/`);
    return response.data;
};

export const confirmarTurno = async (turnoId) => {
    const response = await axiosInstance.post(`/turnos/${turnoId}/confirmar/`);
    return response.data;
};

export const cancelarTurno = async (turnoId) => {
    const response = await axiosInstance.post(`/turnos/${turnoId}/cancelar/`);
    return response.data;
};


// ----------------------------------------------------------------------
// Acciones del Staff (Crear/Editar/Eliminar Cupos)
// ----------------------------------------------------------------------

export const createTurno = async (data) => {
    // 🚨 CORRECCIÓN 404: POST al endpoint base /turnos/
    const response = await axiosInstance.post('/turnos/', {
        hora_inicio: data.hora_inicio
    });
    return response.data;
};

export const updateTurno = async (turnoId, data) => {
    const response = await axiosInstance.patch(`/turnos/${turnoId}/`, data);
    return response.data;
};

export const deleteTurno = async (turnoId) => {
    const response = await axiosInstance.delete(`/turnos/${turnoId}/`);
    return response.data;
};