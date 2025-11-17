// frontend/src/components/turnos/CalendarioIndicadores.jsx

import React from 'react';

const CalendarioIndicadores = () => {
    const items = [
        { color: 'bg-green-200', label: '7+ cupos disponibles' },
        { color: 'bg-yellow-200', label: '4-6 cupos disponibles' },
        { color: 'bg-orange-200', label: '1-3 cupos disponibles' },
        { color: 'bg-red-200', label: 'Sin cupos' },
        { color: 'bg-purple-200', label: 'Tu turno confirmado' },
        { color: 'bg-indigo-200', label: 'Tu turno reservado (pendiente)' },
    ];

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                📋 Referencia de Colores
            </h4>
            <div className="flex justify-center items-center gap-4 flex-wrap text-sm">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded border border-gray-300 ${item.color}`} />
                        <span className="text-gray-700">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarioIndicadores;