// frontend/src/pages/TurnosPage.jsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import CrearTurno from "../components/turnos/CrearTurno";
import TurnosList from "../components/turnos/TurnosList";
import TurnosEdit from "@/components/turnos/TurnosEdit";
import { PageHeader } from "../components/shared/PageHeader";

const TurnosPage = ({ userRole }) => {
  const [vistaActual, setVistaActual] = useState("lista"); // "lista" | "agregar" | "editar"
  const [reload, setReload] = useState(0);
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

  const handleTurnoCreado = () => {
    setReload(prev => prev + 1);
    setVistaActual("lista");
    toast.success("¡Turno creado exitosamente!");
  };

  const handleTurnoActualizado = () => {
    setReload(prev => prev + 1);
    setVistaActual("lista");
    setTurnoEditar(null);
    toast.success("¡Turno actualizado exitosamente!");
  };

  const getTitleConfig = () => {
    switch (vistaActual) {
      case "agregar":
        return {
          title: "Crear Turno",
          subtitle: "Creá un nuevo cupo libre o turno directo",
          icon: Plus
        };
      case "editar":
        return {
          title: "Editar Turno",
          subtitle: "Modifica los datos del turno",
          icon: Calendar
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

      <nav className="text-sm text-muted-foreground mb-4">
        <span 
          className="cursor-pointer hover:text-primary" 
          onClick={volverALista}
        >
          Turnos
        </span>
        {vistaActual === "agregar" && " / Crear"}
        {vistaActual === "editar" && " / Editar"}
      </nav>
      
      {vistaActual === "editar" ? (
        <TurnosEdit 
          turno={turnoEditar}
          onUpdate={handleTurnoActualizado}
          onCancel={volverALista}
        />
      ) : vistaActual === "agregar" ? (
        <CrearTurno 
          userRole={userRole}
          onTurnoCreado={handleTurnoCreado}
          onCancel={volverALista}
        />
      ) : (
        <TurnosList 
          userRole={userRole}
          refresh={reload}
          onEditar={abrirFormularioEditar}
        />
      )}
    </div>
  );
};

export default TurnosPage;
