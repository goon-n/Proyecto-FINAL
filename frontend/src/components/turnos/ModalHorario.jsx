// frontend/src/components/turnos/ModalHorario.jsx

import React, { useState } from 'react';
import moment from 'moment';
import { Clock, Users, X, UserPlus } from 'lucide-react';
import ModalReservarParaSocio from './ModalReservarParaSocio';

const ModalHorario = ({ fecha, hora, data, user, isStaff, onAccion, onEditar, onCerrar }) => {
    const { cupos_disponibles, cupos_reservados, cupos_confirmados, total_cupos, turnos } = data;
    const misTurnos = turnos.filter(t => t.es_mio);
    const fechaFormateada = moment(fecha).format('dddd DD [de] MMMM, YYYY');
    
    const [mostrarModalReservarParaSocio, setMostrarModalReservarParaSocio] = useState(false);
    const [turnoIdSeleccionado, setTurnoIdSeleccionado] = useState(null);
    
    // ✅ NUEVO: Calcular si puede cancelar (más de 1 hora antes)
    const horaCompleta = `${fecha}T${hora}`;
    const horaTurno = moment(horaCompleta);
    const ahora = moment();
    const puedeCancelar = horaTurno.diff(ahora, 'hours', true) > 1;

    const handleAbrirReservarParaSocio = () => {
        const turnoDisponible = turnos.find(t => t.estado === 'DISPONIBLE' && !t.socio);
        if (turnoDisponible) {
            setTurnoIdSeleccionado(turnoDisponible.id);
            setMostrarModalReservarParaSocio(true);
        }
    };

    const handleReservaExitosa = () => {
        setMostrarModalReservarParaSocio(false);
        if (onAccion) {
            onAccion(null, 'refresh'); // Trigger refresh del calendario
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onCerrar}
        >
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <Clock size={24} className="text-cyan-600" />
                        {fechaFormateada} - {hora}hs
                    </h3>
                    <button
                        onClick={onCerrar}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Resumen de cupos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3">
                            <Users className="text-green-600" size={32} />
                            <div>
                                <div className="text-3xl font-bold text-green-900">{cupos_disponibles}</div>
                                <div className="text-xs text-green-700 uppercase font-medium">Disponibles</div>
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-yellow-900">{cupos_reservados}</div>
                            <div className="text-xs text-yellow-700 uppercase font-medium">Reservados</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-purple-900">{cupos_confirmados}</div>
                            <div className="text-xs text-purple-700 uppercase font-medium">Confirmados</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-blue-900">{total_cupos}</div>
                            <div className="text-xs text-blue-700 uppercase font-medium">Total Cupos</div>
                        </div>
                    </div>

                    {/* Mis turnos */}
                    {misTurnos.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-gray-800">Mis Turnos</h4>
                            {misTurnos.map(turno => (
                                <div
                                    key={turno.id}
                                    className={`p-4 rounded-xl border-2 ${
                                        turno.estado === 'CONFIRMADO'
                                            ? 'bg-purple-50 border-purple-300'
                                            : 'bg-indigo-50 border-indigo-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white">
                                                {turno.estado}
                                            </span>
                                            {/* ✅ NUEVO: Mostrar si puede cancelar */}
                                            {turno.estado === 'CONFIRMADO' && !puedeCancelar && (
                                                <p className="text-xs text-red-600 mt-2">
                                                    ⚠️ Ya no puedes cancelar (menos de 1 hora)
                                                </p>
                                            )}
                                            {turno.estado === 'CONFIRMADO' && puedeCancelar && (
                                                <p className="text-xs text-blue-600 mt-2">
                                                    Puedes cancelar hasta 1 hora antes
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {turno.estado === 'RESERVADO' && (
                                                <>
                                                    <button
                                                        onClick={() => onAccion(turno.id, 'confirmar')}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                                    >
                                                        Confirmar
                                                    </button>
                                                    <button
                                                        onClick={() => onAccion(turno.id, 'cancelar')}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            )}
                                            {/* ✅ NUEVO: Solo mostrar botón si puede cancelar */}
                                            {turno.estado === 'CONFIRMADO' && puedeCancelar && (
                                                <button
                                                    onClick={() => onAccion(turno.id, 'cancelar')}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                                >
                                                    Cancelar Turno
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Botón para reservar (solo socios) */}
                    {cupos_disponibles > 0 && misTurnos.length === 0 && user && !isStaff && (
                        <button
                            onClick={() => {
                                const turnoDisponible = turnos.find(t => t.estado === 'DISPONIBLE' && !t.socio);
                                if (turnoDisponible) {
                                    onAccion(turnoDisponible.id, 'reservar');
                                }
                            }}
                            className="w-full py-4 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-bold text-lg transition-colors"
                        >
                            Reservar Turno
                        </button>
                    )}

                    {/* ✅ NUEVO: Botón para staff - Reservar para un socio */}
                    {cupos_disponibles > 0 && isStaff && (
                        <button
                            onClick={handleAbrirReservarParaSocio}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-bold text-lg transition-colors flex items-center justify-center gap-3"
                        >
                            <UserPlus size={24} />
                            Reservar Turno para un Socio
                        </button>
                    )}

                    {/* Lista de turnos para staff */}
                    {isStaff && (
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-gray-800">
                                Todos los Turnos ({total_cupos})
                            </h4>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {turnos.map(turno => (
                                    <div
                                        key={turno.id}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                    >
                                        <div className="flex gap-3 items-center text-sm">
                                            <span className="font-mono text-gray-500">#{turno.id}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                turno.estado === 'DISPONIBLE' ? 'bg-blue-100 text-blue-800' :
                                                turno.estado === 'RESERVADO' ? 'bg-yellow-100 text-yellow-800' :
                                                turno.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {turno.estado}
                                            </span>
                                            {turno.socio && (
                                                <span className="text-gray-700">👤 {turno.socio}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Botón de cancelar para staff */}
                                            {turno.socio && turno.estado === 'CONFIRMADO' && (
                                                <button
                                                    onClick={() => onAccion(turno.id, 'cancelar_staff')}
                                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onEditar(turno)}
                                                className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensajes informativos */}
                    {cupos_disponibles === 0 && misTurnos.length === 0 && (
                        <div className="text-center py-6 bg-red-50 rounded-xl">
                            <p className="text-red-700 font-medium">No hay cupos disponibles para este horario</p>
                        </div>
                    )}

                    {!user && (
                        <div className="text-center py-6 bg-blue-50 rounded-xl">
                            <p className="text-blue-700 font-medium">Debes iniciar sesión para reservar turnos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ NUEVO: Modal para seleccionar socio */}
            {mostrarModalReservarParaSocio && (
                <ModalReservarParaSocio
                    fecha={fechaFormateada}
                    hora={hora}
                    turnoId={turnoIdSeleccionado}
                    onCerrar={() => setMostrarModalReservarParaSocio(false)}
                    onReservaExitosa={handleReservaExitosa}
                />
            )}
        </div>
    );
};

export default ModalHorario;