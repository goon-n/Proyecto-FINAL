// frontend/src/components/turnos/TurnosList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext"; 
import { getTurnos } from "../../services/turnoService";
import TurnoSlot from './TurnoSlot.jsx'; 
import moment from 'moment'; 

const TurnosList = ({ isStaff, onEditar, refreshKey }) => {
    const { user } = useAuth(); 
    const [allTurnos, setAllTurnos] = useState([]); 
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTurnos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTurnos(); 

            
            // Garantizamos que el estado es un array
            if (Array.isArray(data)) {
                setAllTurnos(data);
            } else {
                console.error("La API de turnos no devolvió una lista:", data);
                setAllTurnos([]); 
                setError("No se recibieron datos de turnos o la estructura es incorrecta.");
            }
        } catch (err) {
            console.error("Error al cargar turnos:", err);
            
            setAllTurnos([]); 

            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError("Error de acceso. Por favor, asegúrate de estar logeado. (Error 401/403)");
                } else if (err.response.status === 500) {
                    // Este error debería resolverse con la corrección en views.py
                    setError("Error interno del servidor (500). Puede que la base de datos esté mal inicializada.");
                } else {
                    setError(`Error del servidor al cargar turnos: ${err.response.status}`);
                }
            } else {
                setError("Error de red al intentar cargar los turnos.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTurnos();
    }, [fetchTurnos, refreshKey]);

    const handleActionSuccess = () => {
        fetchTurnos(); 
    };

    const getAvailableDates = () => {
        const availableDates = new Set();
        const today = moment().startOf('day');

        // allTurnos ya está garantizado como array []
        allTurnos.forEach(turno => { 
            const date = moment(turno.hora_inicio).format('YYYY-MM-DD');
            const momentDate = moment(date);
            
            if (momentDate.isSameOrAfter(today, 'day') && momentDate.day() !== 0) { 
                if (turno.estado === 'SOLICITUD' || (user && turno.socio === user.id && turno.estado !== 'FINALIZADO')) {
                    availableDates.add(date);
                }
            }
        });
        return Array.from(availableDates).sort();
    };

    const filteredTurnos = allTurnos 
        .filter(turno => moment(turno.hora_inicio).format('YYYY-MM-DD') === selectedDate)
        .sort((a, b) => moment(a.hora_inicio) - moment(b.hora_inicio));

    
    if (loading) return <div>Cargando calendario...</div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">{error}</div>;

    const availableDates = getAvailableDates();

    return (
        <div className="turnos-container">
            <h2>🗓️ Solicitud de Turnos</h2>

            <div className="calendar-selector">
                <h3>1° Selecciona el día:</h3>
                <div className="date-buttons">
                    {availableDates.map(date => {
                        const dayName = moment(date).format('ddd'); 
                        const isSelected = date === selectedDate;

                        return (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={isSelected ? 'date-button selected' : 'date-button'}
                            >
                                {dayName} {moment(date).format('DD')}
                            </button>
                        );
                    })}
                </div>
            </div>

            <hr />

            <h3>Slots para el {moment(selectedDate).format('dddd DD [de] MMMM [de] YYYY')}</h3>
            <div className="slots-grid">
                {filteredTurnos.length > 0 ? (
                    filteredTurnos.map(turno => (
                        <TurnoSlot 
                            key={turno.id}
                            turno={turno}
                            user={user}
                            isStaff={isStaff}
                            onEditar={onEditar}
                            onActionSuccess={handleActionSuccess}
                        />
                    ))
                ) : (
                    <p>No hay horarios disponibles para el día seleccionado o ya pasaron.</p>
                )}
            </div>
            
        </div>
    );
};

export default TurnosList;