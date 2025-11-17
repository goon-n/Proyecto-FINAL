// frontend/src/components/turnos/CalendarioControles.jsx

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarioControles = ({ semanaInicio, onCambiarSemana, onVolverHoy }) => {
    return (
        <div className="flex justify-center items-center gap-4 flex-wrap">
            <button
                onClick={() => onCambiarSemana(-1)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium"
            >
                <ChevronLeft size={20} />
                Semana Anterior
            </button>

            <button
                onClick={onVolverHoy}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
                <Calendar size={18} />
                Hoy
            </button>

            <button
                onClick={() => onCambiarSemana(1)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium"
            >
                Semana Siguiente
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default CalendarioControles;