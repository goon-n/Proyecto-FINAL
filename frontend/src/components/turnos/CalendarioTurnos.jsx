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
import { useCustomAlert } from '../../hooks/useCustomAlert'; // ✅ IMPORTAR

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

    // ✅ USAR EL HOOK DE ALERTAS
    const { showSuccess, showError, showInfo, showConfirm, AlertComponent } = useCustomAlert();

    useEffect(() => {
        fetchCalendario();
    }, [semanaInicio]);

    const fetchCalendario = async () => {
        setLoading(true);
        setError(null);

        try {
            const fechaInicio = semanaInicio.format('YYYY-MM-DD');
            const fechaFin = semanaInicio.clone().add(6, 'days').format('YYYY-MM-DD');
            
            const data = await api.obtenerCalendarioTurnos(fechaInicio, fechaFin);

            if (Array.isArray(data)) {
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
        if (esHistorial && horarioData) {
            try {
                const turnos = horarioData.turnos || [];
                const turnosConfirmados = turnos.filter(t => t.socio || t.socio_id);
                const total_confirmados = turnosConfirmados.length;
                const tengoTurno = turnos.some(t => t.es_mio);
                
                if (!isStaff && !tengoTurno) {
                    // ✅ REEMPLAZAR alert() por showError()
                    showError('No tienes permisos para ver la asistencia de este turno.');
                    return;
                }

                setHistorialData({ 
                    fecha, 
                    turnos: turnosConfirmados, 
                    total_confirmados 
                });
                setModalHistorial(true);
                return;
            } catch (error) {
                console.error('Error preparando historial del turno:', error);
                // ✅ REEMPLAZAR alert() por showError()
                showError('No se pudo preparar el historial del turno');
                return;
            }
        }

        if (esHistorial && isStaff && !horarioData) {
            try {
                const data = await api.obtenerHistorialDia(fecha);
                setHistorialData({ fecha, data });
                setModalHistorial(true);
            } catch (error) {
                console.error('Error al cargar historial:', error);
                // ✅ REEMPLAZAR alert() por showError()
                showError('No se pudo cargar el historial del día');
            }
            return;
        }

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
        if (accion === 'refresh') {
            fetchCalendario();
            cerrarModal();
            return;
        }

        if (!user) {
            // ✅ REEMPLAZAR alert() por showInfo()
            showInfo('Debes iniciar sesión para realizar esta acción.');
            return;
        }

        try {
            
            let response;
            switch(accion) {
                case 'reservar':
                    response = await api.reservarTurno(turnoId);
                    // ✅ REEMPLAZAR alert() por showSuccess()
                    showSuccess(response.detail || '¡Turno reservado exitosamente! No olvides confirmarlo.');
                    break;
                    
                case 'cancelar':
                    // ✅ REEMPLAZAR confirm() por showConfirm()
                    const confirmarCancelar = await showConfirm({
                        message: '¿Estás seguro de que deseas cancelar este turno?'
                    });
                    
                    if (!confirmarCancelar) return;
                    
                    response = await api.cancelarTurno(turnoId);
                    showSuccess(response.detail || 'Turno cancelado con éxito.');
                    break;
                
                case 'cancelar_staff':
                    // ✅ REEMPLAZAR confirm() por showConfirm()
                    const confirmarCancelarStaff = await showConfirm({
                        type: 'warning',
                        message: '¿Estás seguro de que deseas cancelar este turno del socio?'
                    });
                    
                    if (!confirmarCancelarStaff) return;
                    
                    response = await api.cancelarTurnoParaSocio(turnoId);
                    showSuccess(response.detail || 'Turno cancelado exitosamente.');
                    break;
                    
                default:
                    throw new Error('Acción no válida');
            }
            
            fetchCalendario();
            cerrarModal();
            
        } catch (error) {
            console.error('❌ Error en acción:', error);

            let mensajeError = `Error al ${accion} el turno.`;
            
            if (error.response && error.response.data) {
                if (error.response.data.detail) {
                    if (typeof error.response.data.detail === 'string') {
                        mensajeError = error.response.data.detail;
                    } else {
                        mensajeError = JSON.stringify(error.response.data.detail);
                    }
                }
            }

            // ✅ REEMPLAZAR alert() por showError()
            showError(`No se pudo completar la acción:\n\n${mensajeError}`);
            
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

            {/* ✅ COMPONENTE DE ALERTAS */}
            <AlertComponent />
        </div>
    );
};

export default CalendarioTurnos;