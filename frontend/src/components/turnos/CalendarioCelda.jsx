    // frontend/src/components/turnos/CalendarioCelda.jsx

    import React from 'react';
    import moment from 'moment';

    const CalendarioCelda = ({ fecha, hora, horarioData, user, onAbrirModal }) => {
        
        const getCeldaInfo = () => {
            const diaActual = moment(fecha);
            
            // Bloquear domingos
            if (diaActual.day() === 0) {
                return {
                    clase: 'bg-gray-100 text-gray-400',
                    clickeable: false,
                    contenido: <span className="text-sm">Cerrado</span>
                };
            }

            // Bloquear días/horas pasadas
            const horaCompleta = moment(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm');
            if (horaCompleta.isBefore(moment())) {
                return {
                    clase: 'bg-gray-50 text-gray-300',
                    clickeable: false,
                    contenido: <span className="text-sm">-</span>
                };
            }

            // Sin datos de horario
            if (!horarioData) {
                return {
                    clase: 'bg-gray-50 text-gray-400',
                    clickeable: false,
                    contenido: <span className="text-sm">Sin cupos</span>
                };
            }

            // Verificar si está bloqueado (sábado 13-17)
            if (horarioData.cupos_bloqueados && horarioData.cupos_bloqueados > 0) {
                return {
                    clase: 'bg-gray-300 text-gray-600',
                    clickeable: false,
                    contenido: <span className="text-sm">No disponible</span>
                };
            }

            // ✅ USAR VALORES POR DEFECTO si no existen
            const cupos_disponibles = horarioData.cupos_disponibles || 0;
            const total_cupos = horarioData.total_cupos || 10;
            const turnos = horarioData.turnos || [];

            const misTurnos = turnos.filter(t => t.es_mio);

            // Si tengo un turno confirmado
            if (misTurnos.some(t => t.estado === 'CONFIRMADO')) {
                return {
                    clase: 'bg-purple-200 text-purple-900 font-bold hover:bg-purple-300 hover:shadow-lg',
                    clickeable: true,
                    contenido: <div className="text-2xl">✓</div>
                };
            }
            
            // Si tengo un turno reservado
            if (misTurnos.some(t => t.estado === 'RESERVADO')) {
                return {
                    clase: 'bg-indigo-200 text-indigo-900 font-bold hover:bg-indigo-300 hover:shadow-lg animate-pulse',
                    clickeable: true,
                    contenido: <div className="text-2xl">⏱</div>
                };
            }

            // Si hay cupos disponibles
            if (cupos_disponibles > 0) {
                let clase = '';
                const porcentaje = (cupos_disponibles / total_cupos) * 100;
                
                if (porcentaje >= 70) {
                    clase = 'bg-green-200 text-green-900 hover:bg-green-300 hover:shadow-lg';
                } else if (porcentaje >= 40) {
                    clase = 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300 hover:shadow-lg';
                } else {
                    clase = 'bg-orange-200 text-orange-900 hover:bg-orange-300 hover:shadow-lg';
                }
                
                return {
                    clase,
                    clickeable: true,
                    contenido: (
                        <div className="text-center">
                            <div className="text-xl font-bold">
                                {cupos_disponibles}<span className="text-sm text-gray-600">/{total_cupos}</span>
                            </div>
                        </div>
                    )
                };
            }

            // Completamente ocupado
            return {
                clase: 'bg-red-200 text-red-900 hover:bg-red-300 hover:shadow-lg',
                clickeable: true,
                contenido: (
                    <div className="flex flex-col items-center">
                        <div className="text-xl font-bold">✕</div>
                        <div className="text-xs">Completo</div>
                    </div>
                )
            };
        };

        const { clase, clickeable, contenido } = getCeldaInfo();

        const handleClick = () => {
            if (clickeable && horarioData) {
                onAbrirModal(fecha, hora, horarioData);
            }
        };

        return (
            <td
                className={`text-center p-4 border-r-4 border-gray-400 h-16 ${clase} ${clickeable ? 'cursor-pointer select-none transition-all duration-200' : 'cursor-not-allowed'}`}
                onClick={handleClick}
            >
                {contenido}
            </td>
        );
    };

    export default CalendarioCelda;