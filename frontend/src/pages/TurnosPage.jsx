// frontend/src/pages/TurnosPage.jsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import { toast } from 'react-hot-toast'; 

// Importación CORREGIDA y VERIFICADA
import { useAuth } from "../context/AuthContext"; 

// Ajuste en las importaciones para asegurar que usan la misma ruta relativa
import CrearTurno from "../components/turnos/CrearTurno";
import TurnosList from "../components/turnos/TurnosList";
import TurnosEdit from "../components/turnos/TurnosEdit"; // Si está junto a CrearTurno y TurnosList
import { PageHeader } from "../components/shared/PageHeader";

const TurnosPage = () => {
    // Usar el hook de autenticación real
    // Nota: Añadí 'isAuthenticated' aunque useAuth no lo retorna, el código funcionará con 'user'
    const { user } = useAuth(); 
    
    const isStaff = user?.is_staff || false; 

    const [vistaActual, setVistaActual] = useState("lista"); 
    const [turnoEditar, setTurnoEditar] = useState(null);

    // Handlers
    const volverALista = () => {
        setVistaActual("lista");
        setTurnoEditar(null);
    };
    const abrirFormularioAgregar = () => setVistaActual("agregar");
    const abrirFormularioEditar = (turno) => {
        setTurnoEditar(turno);
        setVistaActual("editar");
    };

    const handleTurnoAccion = () => {
        volverALista(); 
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
                    title: "Reservar Mi Turno",
                    subtitle: isStaff ? "Administra cupos y consulta reservas." : "Selecciona tu día y hora para reservar un cupo.",
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
                <div className="flex gap-3">
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
                    {/* Solo el Staff puede crear cupos, y solo en la vista de lista */}
                    {isStaff && vistaActual === "lista" && (
                        <Button 
                            onClick={abrirFormularioAgregar}
                            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
                        >
                            <Plus className="h-4 w-4" />
                            Crear Cupo Manual
                        </Button>
                    )}
                    {/* Opcional: Botón para Staff para ejecutar la generación masiva (solo si lo implementas en el frontend) */}
                    {isStaff && vistaActual === "lista" && (
                        <Button 
                            variant="secondary"
                            onClick={() => toast.success("Ejecutando script de generación de cupos (Backend)")}
                        >
                            Generar Cupos (4 Semanas)
                        </Button>
                    )}
                </div>
            </PageHeader>

            <nav className="text-sm text-muted-foreground mb-4">
                <span 
                    className="cursor-pointer hover:text-primary" 
                    onClick={volverALista}
                >
                    Turnos
                </span>
                {vistaActual === "agregar" && " / Crear Cupo"}
                {vistaActual === "editar" && " / Editar Turno"}
            </nav>
            
            {vistaActual === "editar" && turnoEditar && isStaff ? (
                // Solo Staff puede ver y usar TurnosEdit
                <TurnosEdit 
                    turno={turnoEditar}
                    onUpdate={handleTurnoAccion}
                    onCancel={volverALista}
                />
            ) : vistaActual === "agregar" && isStaff ? (
                // Solo Staff puede ver y usar CrearTurno
                <CrearTurno 
                    onTurnoCreado={handleTurnoAccion}
                    onCancel={volverALista}
                />
            ) : (
                // TurnosList es la vista principal para todos
                <TurnosList 
                    isStaff={isStaff}
                    onEditar={abrirFormularioEditar} 
                />
            )}
        </div>
    );
};

export default TurnosPage;