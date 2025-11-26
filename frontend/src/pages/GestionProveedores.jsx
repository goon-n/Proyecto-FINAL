import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom hooks
import { useProveedores } from "../hooks/useProveedores";

// Shared components
import { LoadingCard } from "../components/shared/LoadingCard";
import { ErrorCard } from "../components/shared/ErrorCard";
import { PageHeader } from "../components/shared/PageHeader";

// Proveedores components
import { FiltrosProveedores } from "../components/proveedores/FiltrosProveedores";
import { TablaProveedores } from "../components/proveedores/TablaProveedores";
import FormProveedor from "../components/proveedores/FormProveedor";

// API Client
import apiClient from "../services/authServices";

const GestionProveedores = () => {
  const navigate = useNavigate();
  const { proveedoresActivos, proveedoresDesactivados, loading, error, refetch } = useProveedores();

  const [vistaActual, setVistaActual] = useState("activos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  
  // Paginación
  const itemsPerPage = 10;
  const [paginaActual, setPaginaActual] = useState(1);

  // ========== HANDLERS ==========

  const abrirModalCrear = () => {
    setProveedorEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (proveedor) => {
    setProveedorEditar(proveedor);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProveedorEditar(null);
  };

  // Crear proveedor
  const handleCrearProveedor = async (formData) => {
    setGuardando(true);
    try {
      await apiClient.post('/general/proveedores/crear/', formData);
      await refetch();
      cerrarModal();
    } catch (err) {
      const errorMsg = err.response?.data 
        ? Object.entries(err.response.data)
            .map(([field, msgs]) => {
              const msgText = Array.isArray(msgs) ? msgs.join(", ") : msgs;
              return `${field}: ${msgText}`;
            })
            .join("\n")
        : err.message;
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Editar proveedor
  const handleEditarProveedor = async (formData) => {
    setGuardando(true);
    try {
      await apiClient.put(`/general/proveedores/${proveedorEditar.id}/editar/`, formData);
      await refetch();
      cerrarModal();
    } catch (err) {
      const errorMsg = err.response?.data 
        ? Object.entries(err.response.data)
            .map(([field, msgs]) => {
              const msgText = Array.isArray(msgs) ? msgs.join(", ") : msgs;
              return `${field}: ${msgText}`;
            })
            .join("\n")
        : err.message;
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Desactivar proveedor
  const handleDesactivar = async (id) => {
    try {
      await apiClient.delete(`/general/proveedores/${id}/desactivar/`);
      await refetch();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Error al desactivar");
    }
  };

  // Activar proveedor
  const handleActivar = async (id) => {
    try {
      await apiClient.post(`/general/proveedores/${id}/activar/`);
      await refetch();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Error al activar");
    }
  };

  // ========== CARGA ==========

  if (loading) {
    return <LoadingCard mensaje="Cargando proveedores..." />;
  }

  if (error) {
    return (
      <ErrorCard
        mensaje={error}
        onVolver={() => navigate("/admin")}
        textoBoton="Volver al Panel"
      />
    );
  }

  // ========== RENDER ==========

  const proveedoresAMostrar = (vistaActual === "activos" ? proveedoresActivos : proveedoresDesactivados)
    .slice()
    .sort((a, b) => a.id - b.id);

  const esDesactivados = vistaActual === "desactivados";

  // Helpers de paginación
  const getTotalPages = () => Math.max(1, Math.ceil(proveedoresAMostrar.length / itemsPerPage));
  const totalPages = getTotalPages();
  
  // Resetear página cuando cambia la vista o búsqueda
  const proveedoresPaginados = proveedoresAMostrar.slice(
    (paginaActual - 1) * itemsPerPage,
    paginaActual * itemsPerPage
  );

  // Resetear página al cambiar vista
  const handleCambiarVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
    setPaginaActual(1);
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Página {paginaActual} de {totalPages} • Total: {proveedoresAMostrar.length} proveedor{proveedoresAMostrar.length !== 1 ? 'es' : ''}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))} 
            disabled={paginaActual <= 1}
          >
            Anterior
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setPaginaActual(p => Math.min(totalPages, p + 1))} 
            disabled={paginaActual >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={Users}
          titulo="Gestión de Proveedores"
          descripcion={`${proveedoresActivos.length} activo${proveedoresActivos.length !== 1 ? "s" : ""} • ${proveedoresDesactivados.length} inactivo${proveedoresDesactivados.length !== 1 ? "s" : ""}`}
          onVolver={() => navigate("/admin")}
          textoBoton="Volver al Panel"
        >
          <Button onClick={abrirModalCrear} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Proveedor</span>
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="pt-6">
            <FiltrosProveedores
              vistaActual={vistaActual}
              onCambiarVista={handleCambiarVista}
              cantidadActivos={proveedoresActivos.length}
              cantidadDesactivados={proveedoresDesactivados.length}
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
            />

            <TablaProveedores
              proveedores={proveedoresPaginados}
              esDesactivados={esDesactivados}
              onEditar={abrirModalEditar}
              onDesactivar={handleDesactivar}
              onActivar={handleActivar}
              busqueda={busqueda}
            />
            
            {renderPaginationControls()}
          </CardContent>
        </Card>
      </div>

      <FormProveedor
        open={modalAbierto}
        onClose={cerrarModal}
        onSubmit={proveedorEditar ? handleEditarProveedor : handleCrearProveedor}
        proveedorEditar={proveedorEditar}
        guardando={guardando}
        proveedoresExistentes={[...proveedoresActivos, ...proveedoresDesactivados]}
      />
    </div>
  );
};

export default GestionProveedores;