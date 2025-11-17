// frontend/src/components/turnos/CalendarioTurnos.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';
import 'moment/locale/es';
import { Clock } from 'lucide-react';
import api from '../../api/api';
import CalendarioControles from './CalendarioControles';
import CalendarioIndicadores from './CalendarioIndicadores';
import CalendarioTabla from './CalendarioTabla';
import ModalHorario from './ModalHorario';

moment.locale('es');

const CalendarioTurnos = ({ isStaff, onEditar }) => {
    const { user } = useAuth();
    const [calendarioData, setCalendarioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [semanaInicio, setSemanaInicio] = useState(moment().startOf('isoWeek'));
    const [modalAbierto, setModalAbierto] = useState(false);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

    useEffect(() => {
        fetchCalendario();
    }, [semanaInicio]);

    const fetchCalendario = async () => {
        setLoading(true);
        setError(null);

        try {
            const fechaInicio = semanaInicio.format('YYYY-MM-DD');
            const fechaFin = semanaInicio.clone().add(6, 'days').format('YYYY-MM-DD');

            console.log('📡 Cargando calendario:', { fechaInicio, fechaFin });
            
            const data = await api.obtenerCalendarioTurnos(fechaInicio, fechaFin);

            if (Array.isArray(data)) {
                console.log('📅 Calendario cargado:', data.length, 'días');
                setCalendarioData(data);
            } else {
                console.error('❌ La respuesta no es un array:', data);
                setCalendarioData([]);
                setError('El servidor devolvió datos en formato incorrecto');
            }
        } catch (err) {
            console.error('❌ Error al cargar calendario:', err);
            setError('Error al cargar el calendario de turnos');
            setCalendarioData([]);
        } finally {
            setLoading(false);
        }
    };

    const cambiarSemana = (direccion) => {
        setSemanaInicio(prev => prev.clone().add(direccion, 'weeks'));
    };

    const volverHoy = () => {
        setSemanaInicio(moment().startOf('isoWeek'));
    };

    const abrirModal = (fecha, hora, horarioData) => {
        console.log('🎯 Abriendo modal para:', { fecha, hora, cupos: horarioData.total_cupos });
        setHorarioSeleccionado({ fecha, hora, data: horarioData });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setHorarioSeleccionado(null);
    };

    const handleAccion = async (turnoId, accion) => {
        if (!user) {
            alert('Debes iniciar sesión para realizar esta acción.');
            return;
        }

        try {
            console.log(`🔄 Ejecutando acción: ${accion} en turno ${turnoId}`);
            
            let response;
            switch(accion) {
                case 'reservar':
                    response = await api.reservarTurno(turnoId);
                    alert(response.detail || 'Turno confirmado con éxito.');
                    break;
                case 'cancelar':
                    if (!window.confirm('¿Estás seguro de que deseas cancelar este turno?')) {
                        return;
                    }
                    response = await api.cancelarTurno(turnoId);
                    alert(response.detail || 'Turno cancelado con éxito.');
                    break;
                default:
                    throw new Error('Acción no válida');
            }
            
            fetchCalendario();
            cerrarModal();
        } catch (error) {
            const detail = error.response?.data?.detail || `Error al ${accion} el turno.`;
            console.error('❌ Error en acción:', detail);
            alert(`Error: ${detail}`);
            fetchCalendario();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Clock className="animate-spin text-cyan-600" size={40} />
                <p className="mt-4 text-gray-600">Cargando calendario...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 mb-4">{error}</p>
                <button
                    onClick={fetchCalendario}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <CalendarioControles
                semanaInicio={semanaInicio}
                onCambiarSemana={cambiarSemana}
                onVolverHoy={volverHoy}
            />

            <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-800">
                    {semanaInicio.format('DD [de] MMMM')} - {semanaInicio.clone().add(6, 'days').format('DD [de] MMMM, YYYY')}
                </h3>
            </div>

            <CalendarioIndicadores />

            <CalendarioTabla
                semanaInicio={semanaInicio}
                calendarioData={calendarioData}
                user={user}
                onAbrirModal={abrirModal}
            />

            {modalAbierto && horarioSeleccionado && (
                <ModalHorario
                    fecha={horarioSeleccionado.fecha}
                    hora={horarioSeleccionado.hora}
                    data={horarioSeleccionado.data}
                    user={user}
                    isStaff={isStaff}
                    onAccion={handleAccion}
                    onEditar={onEditar}
                    onCerrar={cerrarModal}
                />
            )}
        </div>
    );
};

export default CalendarioTurnos;