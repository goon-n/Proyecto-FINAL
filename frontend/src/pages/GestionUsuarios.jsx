// src/pages/GestionUsuarios.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Users } from "lucide-react";

// Custom hooks
import { useUsuarios } from "../hooks/useUsuarios";
import { useCSRF } from "../hooks/useCSRF";

// Componentes compartidos
import { LoadingCard } from "../components/shared/LoadingCard";
import { ErrorCard } from "../components/shared/ErrorCard";
import { PageHeader } from "../components/shared/PageHeader";

// Componentes específicos de usuarios
import { FiltrosUsuarios } from "../components/usuarios/FiltrosUsuarios";
import { TablaUsuarios } from "../components/usuarios/TablaUsuarios";
import { AgregarUsuario } from "../components/usuarios/AgregarUsuario"; 

const GestionUsuarios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getCSRFToken } = useCSRF();
  const { usuariosActivos, usuariosDesactivados, loading, error, refetch } = useUsuarios();

  const [rolesEditados, setRolesEditados] = useState({});
  const [guardando, setGuardando] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const [vistaActual, setVistaActual] = useState("activos");


  const esEntrenador = user?.rol === "entrenador";
  const esAdmin = user?.rol === "admin";

 
  const usuariosFiltrados = esEntrenador 
    ? usuariosActivos.filter(u => u.perfil__rol === "socio")
    : usuariosActivos;

  // ========== HANDLERS ==========

  const handleRolChange = (userId, nuevoRol) => {
    setRolesEditados({ ...rolesEditados, [userId]: nuevoRol });
  };

  const guardarCambioRol = async (userId) => {
    const nuevoRol = rolesEditados[userId];
    if (!nuevoRol) return;

    setGuardando(userId);
    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${userId}/rol/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ rol: nuevoRol }),
      });

      if (response.ok) {
        const nuevosRoles = { ...rolesEditados };
        delete nuevosRoles[userId];
        setRolesEditados(nuevosRoles);
        refetch();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al actualizar rol");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setGuardando(null);
    }
  };

  const desactivarUsuario = async (userId) => {
    setProcesando(userId);
    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${userId}/desactivar/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": getCSRFToken() },
        credentials: "include",
      });

      if (response.ok) {
        await refetch();
        setVistaActual("activos");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al desactivar usuario");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setProcesando(null);
    }
  };

  const activarUsuario = async (userId) => {
    setProcesando(userId);
    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${userId}/activar/`, {
        method: "POST",
        headers: { "X-CSRFToken": getCSRFToken() },
        credentials: "include",
      });

      if (response.ok) {
        await refetch();
        setVistaActual("desactivados");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al activar usuario");
      }
    } catch  {
      alert("Error de conexión");
    } finally {
      setProcesando(null);
    }
  };

  // ========== ESTADOS DE CARGA ==========

  if (loading) {
    return <LoadingCard mensaje="Cargando usuarios..." />;
  }

  if (error) {
    return (
      <ErrorCard
        mensaje={error}
        onVolver={() => navigate(esEntrenador ? "/entrenador" : "/admin")}
        textoBoton="Volver al Panel"
      />
    );
  }

  // ========== RENDER ==========

  const usuariosAMostrar = vistaActual === "activos" ? usuariosFiltrados : usuariosDesactivados;
  const esDesactivados = vistaActual === "desactivados";

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={Users}
          titulo={esEntrenador ? "Gestión de Socios" : "Gestión de Usuarios"}
          descripcion={esEntrenador 
            ? `${usuariosFiltrados.length} socio${usuariosFiltrados.length !== 1 ? "s" : ""} activo${usuariosFiltrados.length !== 1 ? "s" : ""}`
            : `${usuariosActivos.length} activo${usuariosActivos.length !== 1 ? "s" : ""} • ${usuariosDesactivados.length} desactivado${usuariosDesactivados.length !== 1 ? "s" : ""}`
          }
          onVolver={() => navigate(esEntrenador ? "/entrenador" : "/admin")}
          textoBoton="Volver al Panel"
        />

        <AgregarUsuario 
          onUsuarioCreado={refetch} 
          esEntrenador={esEntrenador}
        />

        <Card>
          <CardContent className="pt-6">

            {!esEntrenador && (
              <FiltrosUsuarios
                vistaActual={vistaActual}
                onCambiarVista={setVistaActual}
                cantidadActivos={usuariosActivos.length}
                cantidadDesactivados={usuariosDesactivados.length}
              />
            )}

            <TablaUsuarios
              usuarios={usuariosAMostrar}
              usuarioActualId={user.id}
              esDesactivados={esDesactivados}
              rolesEditados={rolesEditados}
              onCambiarRol={handleRolChange}
              onGuardarRol={guardarCambioRol}
              onDesactivar={desactivarUsuario}
              onActivar={activarUsuario}
              guardando={guardando}
              procesando={procesando}
              esEntrenador={esEntrenador} // ← PASAR PROP
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestionUsuarios;