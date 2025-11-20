// src/components/turnos/ModalHistorial.jsx

import React from 'react';
import moment from 'moment';
import { X, CheckCircle, Clock, Users } from 'lucide-react';

const ModalHistorial = ({ fecha, data, onCerrar }) => {
    const fechaFormateada = moment(fecha).format('dddd DD [de] MMMM [de] YYYY');
    const turnosListado = data.turnos || [];
    
    // ✅ CORREGIDO: El total confirmado es simplemente la cantidad de turnos con socio
    const totalConfirmados = data.total_confirmados || turnosListado.length;

    // Agrupar por hora
    const turnosPorHora = turnosListado.reduce((acc, turno) => {
        const hora = moment(turno.hora_inicio).format('HH:00');
        if (!acc[hora]) {
            acc[hora] = [];
        }
        acc[hora].push(turno);
        return acc;
    }, {});

    const horasOrdenadas = Object.keys(turnosPorHora).sort();

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            {/* ✅ ELIMINADO el gap entre divs internos */}
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <CheckCircle className="h-6 w-6" />
                                Historial de Asistencia
                            </h2>
                            <p className="text-purple-100 mt-1 capitalize">
                                {fechaFormateada}
                            </p>
                        </div>
                        <button
                            onClick={onCerrar}
                            className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                    <div className="flex items-center gap-2 text-blue-900">
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">
                            Total de asistentes confirmados: {totalConfirmados}
                        </span>
                    </div>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {horasOrdenadas.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No hubo asistentes confirmados este día</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {horasOrdenadas.map(hora => (
                                <div key={hora} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {hora}hs ({turnosPorHora[hora].length} asistente{turnosPorHora[hora].length !== 1 ? 's' : ''})
                                        </h3>
                                    </div>
                                    <div className="bg-white divide-y divide-gray-100">
                                        {turnosPorHora[hora].map((turno) => {
                                            const estado = (turno.estado || '').toUpperCase();
                                            let badgeText = 'Confirmado';
                                            let badgeClasses = 'bg-green-100 text-green-800';
                                            
                                            if (estado === 'CANCELADO' || estado === 'ANULADO') {
                                                badgeText = 'Cancelado';
                                                badgeClasses = 'bg-red-100 text-red-800';
                                            } else if (estado === 'FINALIZADO') {
                                                badgeText = 'Finalizado';
                                                badgeClasses = 'bg-gray-100 text-gray-800';
                                            }

                                            return (
                                                <div 
                                                    key={turno.id} 
                                                    className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">
                                                            {turno.socio}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ID: #{turno.id}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}>
                                                            {badgeText}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onCerrar}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalHistorial;