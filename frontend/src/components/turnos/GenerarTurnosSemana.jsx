// frontend/src/components/turnos/GenerarTurnosSemana.jsx

import React, { useState } from 'react';
import { Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';
import api from '../../api/api'; 

moment.locale('es');

const GenerarTurnosSemana = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(moment().format('YYYY-MM-DD'));

    const handleGenerar = async () => {
        const fechaMostrar = moment(fechaSeleccionada).format('DD [de] MMMM, YYYY');
        const lunes = moment(fechaSeleccionada).startOf('isoWeek').format('DD/MM/YYYY');
        const sabado = moment(fechaSeleccionada).endOf('isoWeek').subtract(1, 'day').format('DD/MM/YYYY');
        
       if (!window.confirm(
    `¿Generar turnos para la semana que contiene el ${fechaMostrar}?\n\n` +
    `📅 Semana: ${lunes} al ${sabado}\n` +
    `⏰ Lun-Vie: 08:00 a 22:00 (15 horas)\n` +  // ✅ CAMBIO
    `⏰ Sábado: 08:00 a 13:00 y 17:00 a 22:00 (11 horas)\n` +  // ✅ NUEVO
    `📊 Cupos por hora: 10\n` +
    `📆 Días: Lunes a Sábado (6 días)\n\n` +
    `Total a crear: ~860 cupos`  // ✅ CAMBIO
        )) {
            return;
        }

        setLoading(true);
        setError(null);
        setResultado(null);

        try {
            const data = await api.generarTurnosSemana(fechaSeleccionada);
            
            console.log('✅ Turnos generados:', data);
            if (data.errores && data.errores.length > 0) {
            console.log('❌ Errores detallados:', data.errores.slice(0, 10));
      }
            setResultado(data);
            
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }
        } catch (err) {
            console.error('❌ Error al generar turnos:', err);
            const errorMsg = err.response?.data?.detail || 
                           err.response?.data?.error || 
                           'Error al generar turnos de la semana';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border-2 border-cyan-300 rounded-2xl p-8 shadow-2xl mb-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-600 rounded-xl shadow-lg">
                    <Calendar className="text-white" size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        Generador Automático de Turnos
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                        Crea todos los turnos de una semana completa en segundos
                    </p>
                </div>
            </div>

            {/* Info destacada */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-6 border border-cyan-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    ¿Qué se va a generar?
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-cyan-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-cyan-600">10</div>
                        <div className="text-xs text-gray-600">cupos/hora</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">15</div>
                        <div className="text-xs text-gray-600">horas/día</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-indigo-600">6</div>
                        <div className="text-xs text-gray-600">días (L-S)</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">~900</div>
                        <div className="text-xs text-gray-600">cupos totales</div>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Selecciona una fecha dentro de la semana a generar:
                    </label>
                    <input
                        type="date"
                        value={fechaSeleccionada}
                        onChange={(e) => {
                            setFechaSeleccionada(e.target.value);
                            setResultado(null);
                            setError(null);
                        }}
                        min={moment().format('YYYY-MM-DD')}
                        className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition-all text-lg font-medium"
                        disabled={loading}
                    />
                    <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <span className="text-blue-600 font-bold">💡</span>
                        <div>
                            <strong>Semana seleccionada:</strong>
                            <br />
                            Del <strong>{moment(fechaSeleccionada).startOf('isoWeek').format('DD/MM/YYYY')}</strong> al{' '}
                            <strong>{moment(fechaSeleccionada).endOf('isoWeek').subtract(1, 'day').format('DD/MM/YYYY')}</strong>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerar}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all transform ${
                        loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 hover:shadow-2xl hover:scale-[1.02] active:scale-95'
                    }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            Generando turnos...
                        </>
                    ) : (
                        <>
                            <Calendar size={24} />
                            Generar Turnos de la Semana
                        </>
                    )}
                </button>
            </div>

            {/* Resultados */}
            {resultado && (
                <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-4">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={32} />
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-green-800 mb-3">
                                ¡Generación Exitosa! 🎉
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="bg-white/70 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-green-600">
                                        {resultado.turnos_creados}
                                    </div>
                                    <div className="text-xs text-green-700">✅ Turnos creados</div>
                                </div>
                                {resultado.turnos_existentes > 0 && (
                                    <div className="bg-white/70 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {resultado.turnos_existentes}
                                        </div>
                                        <div className="text-xs text-blue-700">ℹ️ Ya existían</div>
                                    </div>
                                )}
                                {resultado.errores && resultado.errores.length > 0 && (
                                    <div className="bg-white/70 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-red-600">
                                            {resultado.errores.length}
                                        </div>
                                        <div className="text-xs text-red-700">⚠️ Errores</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Errores */}
            {error && (
                <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={32} />
                        <div>
                            <h4 className="text-lg font-bold text-red-800 mb-2">
                                Error al Generar Turnos
                            </h4>
                            <p className="text-sm text-red-700 bg-white/50 rounded p-3">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerarTurnosSemana;