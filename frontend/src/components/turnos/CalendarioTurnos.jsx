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
import ModalHistorial from './ModalHistorial';

moment.locale('es');

const CalendarioTurnos = ({ isStaff, onEditar }) => {
    const { user } = useAuth();
    const [calendarioData, setCalendarioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [semanaInicio, setSemanaInicio] = useState(moment().startOf('isoWeek'));
    const [modalAbierto, setModalAbierto] = useState(false);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
    const [modalHistorial, setModalHistorial] = useState(false);
    const [historialData, setHistorialData] = useState(null);

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

    const abrirModal = async (fecha, hora, horarioData, esHistorial) => {
        // Si es historial de un turno (hora pasada) y tenemos los datos del horario,
        // mostramos el historial de ese turno (confirmados) en el modal.
        if (esHistorial && horarioData) {
            try {
                const turnos = horarioData.turnos || [];
                
                // ✅ CORREGIDO: Los confirmados son TODOS los que tienen socio asignado
                const turnosConfirmados = turnos.filter(t => t.socio || t.socio_id);
                const total_confirmados = turnosConfirmados.length;

                // Permitir ver la lista si sos staff o si tenías un turno en ese horario
                const tengoTurno = turnos.some(t => t.es_mio);
                if (!isStaff && !tengoTurno) {
                    alert('No tienes permisos para ver la asistencia de este turno.');
                    return;
                }

                // ✅ Pasamos solo los turnos confirmados (con socio asignado)
                setHistorialData({ 
                    fecha, 
                    turnos: turnosConfirmados, 
                    total_confirmados 
                });
                setModalHistorial(true);
                return;
            } catch (error) {
                console.error('Error preparando historial del turno:', error);
                alert('No se pudo preparar el historial del turno');
                return;
            }
        }

        // Si es historial pero no tenemos datos específicos del horario, y sos staff,
        // solicitar historial del día completo.
        if (esHistorial && isStaff && !horarioData) {
            try {
                const data = await api.obtenerHistorialDia(fecha);
                setHistorialData({ fecha, data });
                setModalHistorial(true);
            } catch (error) {
                console.error('Error al cargar historial:', error);
                alert('No se pudo cargar el historial del día');
            }
            return;
        }

        // Caso por defecto: abrir modal de gestión del horario (reserva/confirmación)
        setHorarioSeleccionado({ fecha, hora, data: horarioData });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setHorarioSeleccionado(null);
    };

    const cerrarModalHistorial = () => {
        setModalHistorial(false);
        setHistorialData(null);
    };

    const handleAccion = async (turnoId, accion) => {
        // Permitir refresh sin validación de usuario
        if (accion === 'refresh') {
            fetchCalendario();
            cerrarModal();
            return;
        }

        if (!user) {
            alert('Debes iniciar sesión para realizar esta acción.');
            return;
        }

        try {
            console.log(`🔄 Ejecutando acción: ${accion} en turno ${turnoId}`);
            
            let response;
            switch(accion) {
                case 'reservar':
                    // Aquí llamamos al endpoint que valida el plan
                    response = await api.reservarTurno(turnoId);
                    
                    // Si llegamos aquí, la reserva fue exitosa
                    // (Si hubiera error de plan, salta al catch)
                    alert(response.detail || '¡Turno reservado exitosamente!');
                    break;
                    
                case 'cancelar':
                    if (!window.confirm('¿Estás seguro de que deseas cancelar este turno?')) {
                        return;
                    }
                    response = await api.cancelarTurno(turnoId);
                    alert(response.detail || 'Turno cancelado con éxito.');
                    break;
                
                case 'cancelar_staff':
                    if (!window.confirm('¿Estás seguro de que deseas cancelar este turno del socio?')) {
                        return;
                    }
                    response = await api.cancelarTurnoParaSocio(turnoId);
                    alert(response.detail || 'Turno cancelado exitosamente.');
                    break;
                    
                default:
                    throw new Error('Acción no válida');
            }
            
            // Recargar datos para actualizar cupos y UI
            fetchCalendario();
            cerrarModal();
            
        } catch (error) {
            // 👇 LÓGICA MEJORADA DE ERRORES
            console.error('❌ Error en acción:', error);

            let mensajeError = `Error al ${accion} el turno.`;
            
            // Intentar extraer el mensaje detallado del backend (donde viene la restricción del plan)
            if (error.response && error.response.data) {
                if (error.response.data.detail) {
                    // Puede ser un string o un objeto de Django
                    if (typeof error.response.data.detail === 'string') {
                        mensajeError = error.response.data.detail;
                    } else {
                        mensajeError = JSON.stringify(error.response.data.detail);
                    }
                }
            }

            alert(`⚠️ No se pudo completar la acción:\n\n${mensajeError}`);
            
            // Refrescamos por si el estado cambió en el servidor mientras tanto
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

            {modalHistorial && historialData && (
                <ModalHistorial
                    fecha={historialData.fecha}
                    data={historialData.data || historialData}
                    onCerrar={cerrarModalHistorial}
                />
            )}
        </div>
    );
};

export default CalendarioTurnos;