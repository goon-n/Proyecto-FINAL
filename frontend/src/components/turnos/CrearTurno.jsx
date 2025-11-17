// frontend/src/components/turnos/CrearTurno.jsx

import React, { useState } from 'react';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext'; 
import { createTurno } from "../../services/turnoService"; // 
import api from '../../api/api';

const CrearTurno = ({ onCreationSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        fecha: moment().format('YYYY-MM-DD'),
        hora: '08:00',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!user || !user.is_staff) {
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const hora_inicio_iso = `${formData.fecha}T${formData.hora}:00`;

        try {
            const response = await api.crearTurno({ hora_inicio: hora_inicio_iso }); // 👈 CAMBIO

            setMessage(response.detail || 'Cupo de turno creado con éxito.');
            setLoading(false);
            
            if (onCreationSuccess) {
                onCreationSuccess();
            }

        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.detail || 
                                err.response?.data?.error || 
                                'Error desconocido al crear el cupo.';
            console.error("Error al crear el cupo:", errorMessage);
            setError(errorMessage);
        }
    };

    const generateHourOptions = () => {
        const hours = [];
        for (let h = 8; h <= 22; h++) { // 👈 CAMBIAR A 22 (hasta 22:00)
            const hourString = h.toString().padStart(2, '0') + ':00';
            hours.push(hourString);
        }
        return hours;
    };

    return (
        <div className="p-4 border rounded-lg shadow-md mb-6 bg-white">
            <h3 className="text-lg font-semibold mb-3 text-indigo-700">Crear Cupo Único de 1 Hora</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                        Fecha y Hora de Inicio (Slot de 1 hora)
                    </label>
                    <div className='flex space-x-2'>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <select
                            id="hora"
                            name="hora"
                            value={formData.hora}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {generateHourOptions().map(hour => (
                                <option key={hour} value={hour}>
                                    {hour}hs
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        **Importante:** Solo acepta horas en punto (ej: 10:00, no 10:30).
                    </p>
                </div>
                
                {message && (
                    <div className="text-green-600 p-2 bg-green-50 border border-green-300 rounded">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="text-red-600 p-2 bg-red-50 border border-red-300 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-white font-medium rounded-md shadow-sm ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                    >
                        {loading ? 'Creando...' : 'Crear Cupo'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CrearTurno;