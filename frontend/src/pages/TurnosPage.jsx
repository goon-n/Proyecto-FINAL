// frontend/src/pages/TurnosPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ArrowLeft, Zap, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext"; 
import GenerarTurnosSemana from "../components/turnos/GenerarTurnosSemana";
import CalendarioTurnos from "../components/turnos/CalendarioTurnos"; 
import TurnosEdit from "../components/turnos/TurnosEdit";
import CrearTurno from "../components/turnos/CrearTurno";
import EstadoCuota from "../components/turnos/EstadoCuota"; // Asegúrate de que este archivo exista
import { PageHeader } from "../components/shared/PageHeader";

const TurnosPage = ({ userRole }) => {
    const { user } = useAuth(); 
    const navigate = useNavigate();
    const isStaff = user?.rol === 'admin' || user?.rol === 'entrenador';
    const isSocio = user?.rol === 'socio';

    const [vistaActual, setVistaActual] = useState("lista"); 
    const [turnoEditar, setTurnoEditar] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [mostrarGenerador, setMostrarGenerador] = useState(false);

    const volverALista = () => {
        setVistaActual("lista");
        setTurnoEditar(null);
        setMostrarGenerador(false);
    };
    
    const abrirFormularioAgregar = () => {
        setVistaActual("agregar");
        setMostrarGenerador(false);
    };
    
    const abrirFormularioEditar = (turno) => {
        setTurnoEditar(turno);
        setVistaActual("editar");
        setMostrarGenerador(false);
    };

    // Recargar calendario tras una acción exitosa
    const handleTurnoAccion = () => {
        setRefreshKey(prev => prev + 1);
        setMostrarGenerador(false);
        volverALista(); 
    };

    const volverAlInicio = () => {
        navigate('/socio');
    };

    const getTitleConfig = () => {
        switch (vistaActual) {
            case "agregar":
                return {
                    title: "Crear Nuevo Cupo",
                    subtitle: "Definí un horario de 1 hora para un nuevo cupo disponible.",
                    icon: Plus
                };
            case "editar":
                return {
                    title: "Editar Turno",
                    subtitle: "Modifica horarios o el estado de un cupo existente.",
                    icon: Calendar
                };
            default:
                return {
                    title: isStaff ? "Gestión de Turnos" : "Reservar Mi Turno",
                    subtitle: isStaff 
                        ? "Administra cupos y consulta reservas del gimnasio." 
                        : "Selecciona tu día y hora para reservar un cupo.",
                    icon: Calendar
                };
        }
    };
    
    const { title, subtitle, icon: TitleIcon } = getTitleConfig();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <PageHeader
                titulo={title}
                descripcion={subtitle}
                icon={TitleIcon}
            >
                <div className="flex gap-3 flex-wrap">
                    {vistaActual !== "lista" && (
                        <Button 
                            variant="outline" 
                            onClick={volverALista}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver al Calendario
                        </Button>
                    )}
                    
                    {isSocio && (
                        <Button 
                            onClick={volverAlInicio}
                            variant="default"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                            <Home className="h-4 w-4" />
                            Volver al Inicio
                        </Button>
                    )}
                    
                    {isStaff && vistaActual === "lista" && (
                        <>
                            <Button 
                                onClick={() => setMostrarGenerador(!mostrarGenerador)}
                                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg"
                            >
                                <Zap className="h-4 w-4" />
                                {mostrarGenerador ? 'Ocultar Generador' : 'Generar Semana Completa'}
                            </Button>
                        </>
                    )}
                </div>
            </PageHeader>

            <nav className="text-sm text-muted-foreground mb-4">
                <span 
                    className="cursor-pointer hover:text-primary transition-colors" 
                    onClick={volverALista}
                >
                    Turnos
                </span>
                {vistaActual === "agregar" && " / Crear Cupo"}
                {vistaActual === "editar" && " / Editar Turno"}
            </nav>

            {/* 👇 AQUÍ ESTÁ EL CAMBIO: Widget de Estado de Cuota */}
            {isSocio && vistaActual === "lista" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <EstadoCuota />
                </div>
            )}

            {/* Panel de generación de turnos (colapsable) */}
            {isStaff && vistaActual === "lista" && mostrarGenerador && (
                <div className="animate-in slide-in-from-top duration-300">
                    <GenerarTurnosSemana onSuccess={handleTurnoAccion} />
                </div>
            )}
            
            {/* Renderizado de Vistas */}
            {vistaActual === "editar" && turnoEditar && isStaff ? (
                <TurnosEdit 
                    turno={turnoEditar}
                    onUpdate={handleTurnoAccion}
                    onCancel={volverALista}
                />
            ) : vistaActual === "agregar" && isStaff ? (
                <CrearTurno 
                    onCreationSuccess={handleTurnoAccion}
                />
            ) : (
                /* Al pasar refreshKey forzamos al calendario a recargar datos si cambia algo */
                <CalendarioTurnos 
                    key={refreshKey}
                    isStaff={isStaff}
                    onEditar={abrirFormularioEditar} 
                />
            )}
        </div>
    );
};

export default TurnosPage;