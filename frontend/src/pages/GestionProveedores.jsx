import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom hooks
import { useProveedores } from "../hooks/useProveedores";
import { useCSRF } from "../hooks/useCSRF";

// Shared components
import { LoadingCard } from "../components/shared/LoadingCard";
import { ErrorCard } from "../components/shared/ErrorCard";
import { PageHeader } from "../components/shared/PageHeader";

// Proveedores components
import { FiltrosProveedores } from "../components/proveedores/FiltrosProveedores";
import { TablaProveedores } from "../components/proveedores/TablaProveedores";
import FormProveedor from "../components/proveedores/FormProveedor";

const GestionProveedores = () => {
  const navigate = useNavigate();
  const { getCSRFToken } = useCSRF();
  const { proveedoresActivos, proveedoresDesactivados, loading, error, refetch } = useProveedores();

  const [vistaActual, setVistaActual] = useState("activos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // URL base para crear proveedor
  const CREAR_URL = "http://localhost:8000/api/proveedores/crear/";

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
      const response = await fetch(CREAR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const messages = Object.entries(errorData)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");
        throw new Error(messages || "Error al crear proveedor");
      }

      await refetch();
      cerrarModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Editar proveedor
  const handleEditarProveedor = async (formData) => {
    setGuardando(true);
    try {
      const EDITAR_URL = `http://localhost:8000/api/proveedores/${proveedorEditar.id}/editar/`;
      const response = await fetch(EDITAR_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        throw new Error("Respuesta no JSON: " + errorText.substring(0, 100));
      }

      if (!response.ok) {
        const errorData = await response.json();
        const messages = Object.entries(errorData)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");
        throw new Error(messages || "Error al actualizar proveedor");
      }

      await refetch();
      cerrarModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Desactivar proveedor
  const handleDesactivar = async (id) => {
    try {
      const DESACTIVAR_URL = `http://localhost:8000/api/proveedores/${id}/desactivar/`;
      const response = await fetch(DESACTIVAR_URL, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Error al desactivar: " + errorText.substring(0, 100));
      }

      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  // Activar proveedor
  const handleActivar = async (id) => {
    try {
      const ACTIVAR_URL = `http://localhost:8000/api/proveedores/${id}/activar/`;
      const response = await fetch(ACTIVAR_URL, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Error al activar: " + errorText.substring(0, 100));
      }

      await refetch();
    } catch (err) {
      alert(err.message);
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
              onCambiarVista={setVistaActual}
              cantidadActivos={proveedoresActivos.length}
              cantidadDesactivados={proveedoresDesactivados.length}
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
            />

            <TablaProveedores
              proveedores={proveedoresAMostrar}
              esDesactivados={esDesactivados}
              onEditar={abrirModalEditar}
              onDesactivar={handleDesactivar}
              onActivar={handleActivar}
              busqueda={busqueda}
            />
          </CardContent>
        </Card>
      </div>

      <FormProveedor
        open={modalAbierto}
        onClose={cerrarModal}
        onSubmit={proveedorEditar ? handleEditarProveedor : handleCrearProveedor}
        proveedorEditar={proveedorEditar}
        guardando={guardando}
      />
    </div>
  );
};

export default GestionProveedores;
