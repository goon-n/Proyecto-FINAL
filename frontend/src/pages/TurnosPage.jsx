// src/pages/TurnosPage.jsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
// Components
import CrearTurno from "../components/turnos/CrearTurno";
import TurnosList from "../components/turnos/TurnosList";
// Header compartido (opcional)
import { PageHeader } from "../components/shared/PageHeader";

const TurnosPage = ({ userRole }) => {
  const [vistaActual, setVistaActual] = useState("lista"); // "lista" | "agregar"
  const [reload, setReload] = useState(0);

  // Handlers
  const volverALista = () => setVistaActual("lista");
  const abrirFormularioAgregar = () => setVistaActual("agregar");

  const handleTurnoCreado = () => {
    setReload(prev => prev + 1);
    setVistaActual("lista");
    toast.success("¡Turno creado exitosamente!");
  };

  // Header contextual (opcional, puedes usar cualquier header)
  const getTitleConfig = () => {
    switch (vistaActual) {
      case "agregar":
        return {
          title: "Crear Turno",
          subtitle: "Creá un nuevo cupo libre o turno directo",
          icon: Plus
        };
      default:
        return {
          title: "Gestión de Turnos",
          subtitle: "Gestioná los cupos y reservas del gimnasio",
          icon: Calendar
        };
    }
  };
  
  const { title, subtitle, icon: TitleIcon } = getTitleConfig();

  // Render principal
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
              Volver a la lista
            </Button>
          )}
          {["ADMIN", "admin", "ENTRENADOR", "entrenador"].includes(userRole) && vistaActual === "lista" && (
            <Button 
              onClick={abrirFormularioAgregar}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Nuevo Turno
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Breadcrumb o navegación corta si lo usas */}
      <nav className="text-sm text-muted-foreground mb-4">
        <span 
          className="cursor-pointer hover:text-primary" 
          onClick={volverALista}
        >
          Turnos
        </span>
        {vistaActual === "agregar" && " / Crear"}
      </nav>
      
      {/* Render condicional */}
      {vistaActual === "agregar" ? (
        <CrearTurno 
          userRole={userRole}
          onTurnoCreado={handleTurnoCreado}
          onCancel={volverALista}
        />
      ) : (
        <TurnosList 
          userRole={userRole}
          reload={reload}
        />
      )}
    </div>
  );
};

export default TurnosPage;
