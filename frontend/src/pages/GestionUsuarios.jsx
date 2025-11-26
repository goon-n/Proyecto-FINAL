// src/pages/GestionUsuarios.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Users, UserCog, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

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

  // Paginación: 10 usuarios por página
  const itemsPerPage = 10;
  const [pageUsuarios, setPageUsuarios] = useState(1); // para admin/entrenadores list
  const [pageSocios, setPageSocios] = useState(1); // para socios list
  const [vistaUsuariosSistema, setVistaUsuariosSistema] = useState("activos"); // NUEVO: para filtrar empleados

  const [dialogoDesactivar, setDialogoDesactivar] = useState({ abierto: false, userId: null, username: '' });
  const [dialogoActivar, setDialogoActivar] = useState({ abierto: false, userId: null, username: '' });

  // Separar usuarios por rol
  const adminYEntrenadoresActivos = usuariosActivos.filter(u => 
    u.perfil__rol === "admin" || u.perfil__rol === "entrenador"
  );
  
  const adminYEntrenadoresDesactivados = usuariosDesactivados.filter(u =>
    u.perfil__rol === "admin" || u.perfil__rol === "entrenador"
  );
  
  const socios = usuariosActivos.filter(u => 
    u.perfil__rol === "socio"
  );

  const usuariosFiltrados = esEntrenador 
    ? socios
    : usuariosActivos;

  // Resetear páginas cuando cambian los conjuntos mostrados (usar longitud para evitar reset por referencia)
  useEffect(() => {
    setPageUsuarios(1);
  }, [adminYEntrenadoresActivos.length, adminYEntrenadoresDesactivados.length, vistaUsuariosSistema]);

  useEffect(() => {
    setPageSocios(1);
  }, [socios.length]);

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
      setDialogoDesactivar({ abierto: false, userId: null, username: '' }); // Cerrar diálogo
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
      setDialogoActivar({ abierto: false, userId: null, username: '' }); // Cerrar diálogo
    } catch (error) {
      alert(error.response?.data?.error || "Error al activar usuario");
    } finally {
      setProcesando(null);
    }
  };

  const abrirDialogoDesactivar = (userId, username) => {
    setDialogoDesactivar({ abierto: true, userId, username });
  };

  const abrirDialogoActivar = (userId, username) => {
    setDialogoActivar({ abierto: true, userId, username });
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

  // Helpers de paginación
  const getTotalPages = (items) => Math.max(1, Math.ceil((items?.length || 0) / itemsPerPage));
  const paginate = (items, page) => items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const renderPaginationControls = (currentPage, totalPages, onPrev, onNext, onSelectPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onPrev} disabled={currentPage <= 1}>Anterior</Button>
          <Button size="sm" variant="outline" onClick={onNext} disabled={currentPage >= totalPages}>Siguiente</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={Users}
          titulo={esEntrenador ? "Gestión de Socios" : "Gestión de Empleados y Socios"}
          descripcion={esEntrenador 
            ? `${socios.length} socio${socios.length !== 1 ? "s" : ""}`
            : `${usuariosActivos.length} usuarios • ${adminYEntrenadoresActivos.length} staff • ${socios.length} socios`
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
                  {adminYEntrenadoresActivos.length}
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
                  {/* NUEVO: Filtros para empleados */}
                  <FiltrosUsuarios
                    vistaActual={vistaUsuariosSistema}
                    onCambiarVista={setVistaUsuariosSistema}
                    cantidadActivos={adminYEntrenadoresActivos.length}
                    cantidadDesactivados={adminYEntrenadoresDesactivados.length}
                  />

                  {/* Paginación para admin/entrenadores */}
                  {(() => {
                    const empleadosList = vistaUsuariosSistema === "activos" 
                      ? adminYEntrenadoresActivos 
                      : adminYEntrenadoresDesactivados;
                    const totalPagesAdmin = getTotalPages(empleadosList);
                    const adminPaginated = paginate(empleadosList, pageUsuarios);
                    return (
                      <>
                        <TablaUsuarios
                          usuarios={adminPaginated}
                          usuarioActualId={user.id}
                          esDesactivados={vistaUsuariosSistema === "desactivados"}
                          rolesEditados={rolesEditados}
                          onCambiarRol={handleRolChange}
                          onGuardarRol={guardarCambioRol}
                          onDesactivar={abrirDialogoDesactivar}
                          onActivar={abrirDialogoActivar}
                          guardando={guardando}
                          procesando={procesando}
                          esEntrenador={false}
                        />

                        {renderPaginationControls(
                          pageUsuarios,
                          totalPagesAdmin,
                          () => setPageUsuarios(p => Math.max(1, p - 1)),
                          () => setPageUsuarios(p => Math.min(totalPagesAdmin, p + 1)),
                        )}
                      </>
                    );
                  })()}
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
            </Card>
            <Card>
                <CardContent className="pt-6">
                  <FiltrosUsuarios
                    vistaActual={vistaActual}
                    onCambiarVista={setVistaActual}
                    cantidadActivos={socios.length}
                    cantidadDesactivados={usuariosDesactivados.filter(u => u.perfil__rol === 'socio').length}
                  />

                  {(() => {
                    const sociosList = vistaActual === "activos" ? socios : usuariosDesactivados.filter(u => u.perfil__rol === 'socio');
                    const totalPagesSoc = getTotalPages(sociosList);
                    const sociosPaginated = paginate(sociosList, pageSocios);

                    return (
                      <>
                        <TablaUsuarios
                          usuarios={sociosPaginated}
                          usuarioActualId={user.id}
                          esDesactivados={vistaActual === "desactivados"}
                          rolesEditados={rolesEditados}
                          onCambiarRol={handleRolChange}
                          onGuardarRol={guardarCambioRol}
                          onDesactivar={abrirDialogoDesactivar}
                          onActivar={abrirDialogoActivar}
                          guardando={guardando}
                          procesando={procesando}
                          esEntrenador={false}
                        />

                        {renderPaginationControls(
                          pageSocios,
                          totalPagesSoc,
                          () => setPageSocios(p => Math.max(1, p - 1)),
                          () => setPageSocios(p => Math.min(totalPagesSoc, p + 1)),
                        )}
                      </>
                    );
                  })()}
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
                {(() => {
                  const totalPagesTrainer = getTotalPages(socios);
                  const sociosPaginatedTrainer = paginate(socios, pageSocios);
                  return (
                    <>
                      <TablaUsuarios
                        usuarios={sociosPaginatedTrainer}
                        usuarioActualId={user.id}
                        esDesactivados={false}
                        rolesEditados={rolesEditados}
                        onCambiarRol={handleRolChange}
                        onGuardarRol={guardarCambioRol}
                        onDesactivar={abrirDialogoDesactivar}
                        onActivar={abrirDialogoActivar}
                        guardando={guardando}
                        procesando={procesando}
                        esEntrenador={true}
                      />

                      {renderPaginationControls(
                        pageSocios,
                        totalPagesTrainer,
                        () => setPageSocios(p => Math.max(1, p - 1)),
                        () => setPageSocios(p => Math.min(totalPagesTrainer, p + 1)),
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        )}

        {/* Diálogo de confirmación para desactivar */}
        <AlertDialog open={dialogoDesactivar.abierto} onOpenChange={(abierto) => !procesando && setDialogoDesactivar({ ...dialogoDesactivar, abierto })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás por desactivar al usuario <strong>{dialogoDesactivar.username}</strong>.
                <br /><br />
                El usuario no tendrá acceso al sistema hasta que sea reactivado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={procesando}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => desactivarUsuario(dialogoDesactivar.userId)}
                disabled={procesando}
                className="bg-red-600 hover:bg-red-700"
              >
                {procesando ? "Desactivando..." : "Desactivar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo de confirmación para activar */}
        <AlertDialog open={dialogoActivar.abierto} onOpenChange={(abierto) => !procesando && setDialogoActivar({ ...dialogoActivar, abierto })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Activar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás por activar al usuario <strong>{dialogoActivar.username}</strong>.
                <br /><br />
                El usuario recuperará el acceso al sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={procesando}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => activarUsuario(dialogoActivar.userId)}
                disabled={procesando}
                className="bg-green-600 hover:bg-green-700"
              >
                {procesando ? "Activando..." : "Activar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default GestionUsuarios;