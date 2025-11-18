// src/pages/GestionUsuarios.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, UserCog, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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
import { AgregarSocioConPago } from "../components/usuarios/AgregarSocioConPago";

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
  const [seccionActiva, setSeccionActiva] = useState("usuarios");

  const esEntrenador = user?.rol === "entrenador";
  const esAdmin = user?.rol === "admin";

  // Separar usuarios por rol
  const adminYEntrenadores = usuariosActivos.filter(u => 
    u.perfil__rol === "admin" || u.perfil__rol === "entrenador"
  );
  
  const socios = usuariosActivos.filter(u => 
    u.perfil__rol === "socio"
  );

  const usuariosFiltrados = esEntrenador 
    ? socios
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
          titulo={esEntrenador ? "Gestión de Socios" : "Gestión de Empleados y Socios"}
          descripcion={esEntrenador 
            ? `${socios.length} socio${socios.length !== 1 ? "s" : ""}`
            : `${usuariosActivos.length} usuarios • ${adminYEntrenadores.length} staff • ${socios.length} socios`
          }
          onVolver={() => navigate(esEntrenador ? "/entrenador" : "/admin")}
          textoBoton="Volver al Panel"
        />

        {/* TABS: Dividir en dos secciones */}
        {!esEntrenador ? (
          <Tabs value={seccionActiva} onValueChange={setSeccionActiva} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="usuarios" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Usuarios del Sistema
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {adminYEntrenadores.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="socios" className="flex items-center gap-2">
                <UsersRound className="h-4 w-4" />
                Socios del Gimnasio
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                  {socios.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* SECCIÓN 1: USUARIOS DEL SISTEMA (Admin/Entrenadores) */}
            <TabsContent value="usuarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-blue-600" />
                    Administradores y Entrenadores
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Gestión de cuentas del personal con acceso al sistema
                  </p>
                </CardHeader>
                <CardContent>
                  <AgregarUsuario 
                    onUsuarioCreado={refetch} 
                    esEntrenador={false}
                    soloStaff={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <TablaUsuarios
                    usuarios={adminYEntrenadores}
                    usuarioActualId={user.id}
                    esDesactivados={false}
                    rolesEditados={rolesEditados}
                    onCambiarRol={handleRolChange}
                    onGuardarRol={guardarCambioRol}
                    onDesactivar={desactivarUsuario}
                    onActivar={activarUsuario}
                    guardando={guardando}
                    procesando={procesando}
                    esEntrenador={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECCIÓN 2: SOCIOS DEL GIMNASIO */}
            <TabsContent value="socios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersRound className="h-5 w-5 text-green-600" />
                    Miembros del Gimnasio
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Gestión de socios con membresías y acceso a clases
                  </p>
              </CardHeader>
              <CardContent>
                <AgregarSocioConPago 
                  onSocioCreado={refetch}
                />
              </CardContent>
            </Card>              <Card>
                <CardContent className="pt-6">
                  <FiltrosUsuarios
                    vistaActual={vistaActual}
                    onCambiarVista={setVistaActual}
                    cantidadActivos={socios.length}
                    cantidadDesactivados={usuariosDesactivados.filter(u => u.perfil__rol === 'socio').length}
                  />

                  <TablaUsuarios
                    usuarios={vistaActual === "activos" ? socios : usuariosDesactivados.filter(u => u.perfil__rol === 'socio')}
                    usuarioActualId={user.id}
                    esDesactivados={vistaActual === "desactivados"}
                    rolesEditados={rolesEditados}
                    onCambiarRol={handleRolChange}
                    onGuardarRol={guardarCambioRol}
                    onDesactivar={desactivarUsuario}
                    onActivar={activarUsuario}
                    guardando={guardando}
                    procesando={procesando}
                    esEntrenador={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // VISTA PARA ENTRENADORES (solo socios, igual al tab de socios del admin)
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5 text-green-600" />
                  Miembros del Gimnasio
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gestión de socios con membresías y acceso a clases
                </p>
              </CardHeader>
              <CardContent>
                <AgregarSocioConPago 
                  onSocioCreado={refetch}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <TablaUsuarios
                  usuarios={socios}
                  usuarioActualId={user.id}
                  esDesactivados={false}
                  rolesEditados={rolesEditados}
                  onCambiarRol={handleRolChange}
                  onGuardarRol={guardarCambioRol}
                  onDesactivar={desactivarUsuario}
                  onActivar={activarUsuario}
                  guardando={guardando}
                  procesando={procesando}
                  esEntrenador={true}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;