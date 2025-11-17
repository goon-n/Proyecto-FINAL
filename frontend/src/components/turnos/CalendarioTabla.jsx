// frontend/src/components/turnos/CalendarioTabla.jsx

import React from 'react';
import moment from 'moment';
import CalendarioCelda from './CalendarioCelda';

const HORARIOS = Array.from({ length: 15 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const CalendarioTabla = ({ semanaInicio, calendarioData, user, onAbrirModal }) => {
    
    const getHorarioData = (fecha, hora) => {
        const diaData = calendarioData.find(d => d.fecha === fecha);
        if (!diaData) return null;
        return diaData.horarios.find(h => h.hora === hora);
    };

    const renderDiasSemana = () => {
        const dias = [];
        for (let i = 0; i < 7; i++) {
            const dia = semanaInicio.clone().add(i, 'days');
            const esDomingo = dia.day() === 0;
            const esHoy = dia.isSame(moment(), 'day');

            // ✅ NUEVO: Bordes más gruesos
            let headerClass = 'border-b-4 border-r-4 border-gray-400 p-4';
            if (esDomingo) headerClass += ' bg-red-50';
            if (esHoy) headerClass += ' bg-blue-50';

            dias.push(
                <th key={i} className={headerClass}>
                    <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 uppercase">{dia.format('ddd')}</div>
                        <div className={`text-2xl font-bold ${esHoy ? 'text-blue-600' : 'text-gray-800'}`}>
                            {dia.format('DD')}
                        </div>
                        <div className="text-xs text-gray-400">{dia.format('MMM')}</div>
                    </div>
                </th>
            );
        }
        return dias;
    };

    return (
        // Bordes más gruesos en el contenedor
        <div className="overflow-x-auto rounded-xl shadow-xl border-4 border-gray-400">
            <table className="w-full bg-white border-collapse">
                <thead className="bg-gray-50">
                    <tr>
                        {/* ✅ NUEVO: Bordes más gruesos */}
                        <th className="sticky left-0 z-10 bg-gray-50 border-b-4 border-r-4 border-gray-400 p-4 w-20">
                            Hora
                        </th>
                        {renderDiasSemana()}
                    </tr>
                </thead>
                <tbody>
                    {HORARIOS.map(hora => (
                        // ✅ NUEVO: Bordes más gruesos entre filas
                        <tr key={hora} className="border-b-4 border-gray-400">
                            {/* ✅ NUEVO: Bordes más gruesos */}
                            <td className="sticky left-0 z-10 bg-gray-50 font-semibold text-gray-700 text-center p-3 border-r-4 border-gray-400">
                                {hora}
                            </td>
                            {Array.from({ length: 7 }, (_, i) => {
                                const fecha = semanaInicio.clone().add(i, 'days').format('YYYY-MM-DD');
                                const horarioData = getHorarioData(fecha, hora);
                                return (
                                    <CalendarioCelda
                                        key={`${fecha}-${hora}`}
                                        fecha={fecha}
                                        hora={hora}
                                        horarioData={horarioData}
                                        user={user}
                                        onAbrirModal={onAbrirModal}
                                    />
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CalendarioTabla;