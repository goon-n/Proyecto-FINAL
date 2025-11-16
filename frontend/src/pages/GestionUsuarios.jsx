// src/pages/GestionUsuarios.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Users } from "lucide-react";

// Custom hooks
import { useUsuarios } from "../hooks/useUsuarios";

// Componentes compartidos
import { LoadingCard } from "../components/shared/LoadingCard";
import { ErrorCard } from "../components/shared/ErrorCard";
import { PageHeader } from "../components/shared/PageHeader";

// Componentes específicos de usuarios
import { FiltrosUsuarios } from "../components/usuarios/FiltrosUsuarios";
import { TablaUsuarios } from "../components/usuarios/TablaUsuarios";
import { AgregarUsuario } from "../components/usuarios/AgregarUsuario";

// API Client
import apiClient from "../services/authServices";

const GestionUsuarios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      await apiClient.patch(`/general/usuarios/${userId}/rol/`, { rol: nuevoRol });
      
      const nuevosRoles = { ...rolesEditados };
      delete nuevosRoles[userId];
      setRolesEditados(nuevosRoles);
      refetch();
    } catch (error) {
      alert(error.response?.data?.error || "Error al actualizar rol");
    } finally {
      setGuardando(null);
    }
  };

  const desactivarUsuario = async (userId) => {
    setProcesando(userId);
    try {
      await apiClient.delete(`/general/usuarios/${userId}/desactivar/`);
      await refetch();
      setVistaActual("activos");
    } catch (error) {
      alert(error.response?.data?.error || "Error al desactivar usuario");
    } finally {
      setProcesando(null);
    }
  };

  const activarUsuario = async (userId) => {
    setProcesando(userId);
    try {
      await apiClient.post(`/general/usuarios/${userId}/activar/`);
      await refetch();
      setVistaActual("desactivados");
    } catch (error) {
      alert(error.response?.data?.error || "Error al activar usuario");
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
              esEntrenador={esEntrenador}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestionUsuarios;