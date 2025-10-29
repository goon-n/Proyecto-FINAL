// src/pages/GestionAccesorios.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

// Components
import AccesoriosList from "../components/accesorios/AccesoriosList";
import AccesoriosAdd from "../components/accesorios/AccesoriosAdd";
import AccesoriosEdit from "../components/accesorios/AccesoriosEdit";

// Shared components
import { PageHeader } from "../components/shared/PageHeader";

// Hook para estadísticas
import { useAccesorios } from "../hooks/useAccesorios";

const GestionAccesorios = () => {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState("lista"); // "lista", "agregar", "editar"
  const [accesorioEditar, setAccesorioEditar] = useState(null);
  const [reload, setReload] = useState(0);

  // Hook para obtener datos de accesorios
  const { accesorios, accesoriosActivos, loading: loadingStats, refetch } = useAccesorios();

  // ========== HANDLERS ==========

  const volverALista = () => {
    setVistaActual("lista");
    setAccesorioEditar(null);
  };

  const abrirFormularioAgregar = () => {
    setVistaActual("agregar");
  };

  const abrirFormularioEditar = (accesorio) => {
    setAccesorioEditar(accesorio);
    setVistaActual("editar");
  };

  const handleAccesorioCreado = () => {
    setReload(prev => prev + 1);
    refetch(); // Actualizar estadísticas
    setVistaActual("lista");
    toast.success("¡Accesorio creado exitosamente!");
  };

  const handleAccesorioActualizado = () => {
    setReload(prev => prev + 1);
    refetch(); // Actualizar estadísticas
    setVistaActual("lista");
    setAccesorioEditar(null);
    toast.success("¡Accesorio actualizado exitosamente!");
  };

  // ========== RENDER ==========

  const renderContent = () => {
    switch (vistaActual) {
      case "agregar":
        return (
          <AccesoriosAdd
            onAdd={handleAccesorioCreado}
            onCancel={volverALista}
          />
        );

      case "editar":
        return (
          <AccesoriosEdit
            accesorio={accesorioEditar}
            onUpdate={handleAccesorioActualizado}
            onCancel={volverALista}
          />
        );

      default:
        return (
          <AccesoriosList
            reload={reload}
            onEditar={abrirFormularioEditar}
          />
        );
    }
  };

  const getTitleConfig = () => {
    switch (vistaActual) {
      case "agregar":
        return {
          title: "Agregar Accesorio",
          subtitle: "Registra un nuevo accesorio en el sistema",
          icon: Plus
        };
      case "editar":
        return {
          title: "Editar Accesorio",
          subtitle: "Modifica la información del accesorio",
          icon: Package
        };
      default:
        return {
          title: "Gestión de Accesorios",
          subtitle: "Administra el inventario de accesorios del gimnasio",
          icon: Package
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
          
          {vistaActual === "lista" && (
            <Button 
              onClick={abrirFormularioAgregar}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Accesorio
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <span 
          className="cursor-pointer hover:text-primary" 
          onClick={() => navigate("/admin")}
        >
          Panel Admin
        </span>
        {" / "}
        <span 
          className={vistaActual === "lista" ? "text-foreground" : "cursor-pointer hover:text-primary"}
          onClick={volverALista}
        >
          Accesorios
        </span>
        {vistaActual === "agregar" && " / Agregar"}
        {vistaActual === "editar" && " / Editar"}
      </nav>

      {/* Estadísticas rápidas */}
      {vistaActual === "lista" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Accesorios</p>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : accesorios.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loadingStats ? "..." : accesoriosActivos.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sin Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {loadingStats ? "..." : accesorios.filter(a => a.stock === 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proveedores Únicos</p>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : new Set(accesorios.map(a => a.proveedor)).size}
                  </p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenido principal */}
      {renderContent()}
    </div>
  );
};

export default GestionAccesorios;