// frontend/src/components/turnos/ModalReservarParaSocio.jsx

import React, { useState, useEffect } from 'react';
import { X, Search, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const ModalReservarParaSocio = ({ fecha, hora, turnoId, onCerrar, onReservaExitosa }) => {
    const [socios, setSocios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    const [reservando, setReservando] = useState(false);

    useEffect(() => {
        cargarSocios();
    }, []);

    const cargarSocios = async () => {
        try {
            setCargando(true);
            const usuarios = await api.listarUsuarios();
            // Filtrar solo socios activos
            const sociosFiltrados = usuarios.filter(u => u.perfil__rol === 'socio');
            setSocios(sociosFiltrados);
        } catch (error) {
            toast.error('Error al cargar la lista de socios');
            console.error('Error cargando socios:', error);
        } finally {
            setCargando(false);
        }
    };

    const sociosFiltrados = socios.filter(socio => 
        socio.username.toLowerCase().includes(busqueda.toLowerCase()) ||
        (socio.email && socio.email.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const handleReservarParaSocio = async (socioId, socioUsername) => {
        if (!turnoId || !socioId) {
            toast.error('Datos incompletos para reservar');
            return;
        }

        setReservando(true);
        try {
            const response = await api.reservarTurnoParaSocio(turnoId, socioId);
            toast.success(response.detail || `Turno reservado exitosamente para ${socioUsername}`);
            
            if (onReservaExitosa) {
                onReservaExitosa();
            }
            onCerrar();
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Error al reservar el turno';
            toast.error(errorMsg);
            console.error('Error reservando turno:', error);
        } finally {
            setReservando(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onCerrar}
        >
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-500 to-blue-500">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Users size={24} />
                            Reservar Turno para Socio
                        </h3>
                        <p className="text-white text-sm mt-1">
                            {fecha} - {hora}hs
                        </p>
                    </div>
                    <button
                        onClick={onCerrar}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        disabled={reservando}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Buscador */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar socio por nombre o email..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                disabled={reservando}
                            />
                        </div>
                    </div>

                    {/* Lista de socios */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {cargando ? (
                            <div className="text-center py-8 text-gray-500">
                                Cargando socios...
                            </div>
                        ) : sociosFiltrados.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="mx-auto mb-2" size={48} />
                                <p>No se encontraron socios</p>
                                {busqueda && (
                                    <p className="text-sm mt-2">Intenta con otro término de búsqueda</p>
                                )}
                            </div>
                        ) : (
                            sociosFiltrados.map(socio => (
                                <div
                                    key={socio.id}
                                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-800">
                                            {socio.username}
                                        </div>
                                        {socio.email && (
                                            <div className="text-sm text-gray-500">
                                                {socio.email}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                            ID: {socio.id}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleReservarParaSocio(socio.id, socio.username)}
                                        disabled={reservando}
                                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                    >
                                        <CheckCircle2 size={18} />
                                        {reservando ? 'Reservando...' : 'Reservar'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer info */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Nota:</strong> El sistema validará automáticamente que el socio tenga cuota activa y clases disponibles antes de confirmar la reserva.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalReservarParaSocio;
