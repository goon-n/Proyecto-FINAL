import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Users, UserX, Save, Loader2, RefreshCw } from "lucide-react";

const GestionUsuarios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [usuariosDesactivados, setUsuariosDesactivados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rolesEditados, setRolesEditados] = useState({});
  const [guardando, setGuardando] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const [vistaActual, setVistaActual] = useState('activos');

  const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const responseActivos = await fetch("http://localhost:8000/api/usuarios/", {
        credentials: "include",
      });
      
      const responseDesactivados = await fetch("http://localhost:8000/api/usuarios/desactivados/", {
        credentials: "include",
      });
      
      if (responseActivos.ok && responseDesactivados.ok) {
        const dataActivos = await responseActivos.json();
        const dataDesactivados = await responseDesactivados.json();
        setUsuariosActivos(dataActivos);
        setUsuariosDesactivados(dataDesactivados);
        setError(null);
      } else {
        setError("Error al cargar usuarios");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRolChange = (userId, nuevoRol) => {
    setRolesEditados({
      ...rolesEditados,
      [userId]: nuevoRol
    });
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
        fetchUsuarios();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al actualizar rol");
      }
    } catch (err) {
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
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
      });

      if (response.ok) {
        await fetchUsuarios();
        // Cambiar a la vista de activos después de desactivar
        setVistaActual('activos');
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al desactivar usuario");
      }
    } catch (err) {
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
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
      });

      if (response.ok) {
        await fetchUsuarios();
        // Cambiar a la vista de desactivados después de activar
        setVistaActual('desactivados');
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al activar usuario");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setProcesando(null);
    }
  };

  const getRolBadgeVariant = (rol) => {
    switch(rol) {
      case 'admin': return 'default';
      case 'entrenador': return 'secondary';
      case 'socio': return 'outline';
      default: return 'outline';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const usuariosAMostrar = vistaActual === 'activos' ? usuariosActivos : usuariosDesactivados;
  const esDesactivados = vistaActual === 'desactivados';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/admin")} className="mt-4">
              Volver al Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">Gestión de Usuarios</CardTitle>
                  <CardDescription className="text-lg mt-1">
                    {usuariosActivos.length} activo{usuariosActivos.length !== 1 ? 's' : ''} • {usuariosDesactivados.length} desactivado{usuariosDesactivados.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => navigate("/admin")} variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Panel
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Botones de filtro y tabla */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-6">
              <Button
                variant={vistaActual === 'activos' ? 'default' : 'outline'}
                onClick={() => setVistaActual('activos')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Usuarios Activos ({usuariosActivos.length})
              </Button>
              <Button
                variant={vistaActual === 'desactivados' ? 'default' : 'outline'}
                onClick={() => setVistaActual('desactivados')}
                className="flex items-center gap-2"
              >
                <UserX className="h-4 w-4" />
                Usuarios Desactivados ({usuariosDesactivados.length})
              </Button>
            </div>

            {/* Tabla de usuarios */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  {!esDesactivados && <TableHead>Cambiar Rol</TableHead>}
                  {esDesactivados && <TableHead>Desactivado</TableHead>}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosAMostrar.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {esDesactivados ? "No hay usuarios desactivados" : "No hay usuarios activos"}
                    </TableCell>
                  </TableRow>
                ) : (
                  usuariosAMostrar.map((usuario) => (
                    <TableRow key={usuario.id} className={esDesactivados ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{usuario.id}</TableCell>
                      <TableCell className="font-semibold">
                        {usuario.username}
                        {esDesactivados && (
                          <Badge variant="destructive" className="ml-2 text-xs">Desactivado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {usuario.email || "Sin email"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRolBadgeVariant(usuario.perfil__rol)}>
                          {usuario.perfil__rol}
                        </Badge>
                      </TableCell>
                      {!esDesactivados && (
                        <TableCell>
                          {usuario.id !== user.id ? (
                            <div className="flex gap-2 items-center">
                              <Select
                                defaultValue={usuario.perfil__rol}
                                onValueChange={(value) => handleRolChange(usuario.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="socio">Socio</SelectItem>
                                  <SelectItem value="entrenador">Entrenador</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              {rolesEditados[usuario.id] && (
                                <Button
                                  onClick={() => guardarCambioRol(usuario.id)}
                                  size="sm"
                                  disabled={guardando === usuario.id}
                                >
                                  {guardando === usuario.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Save className="mr-1 h-4 w-4" />
                                      Guardar
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">Tu usuario</span>
                          )}
                        </TableCell>
                      )}
                      {esDesactivados && (
                        <TableCell className="text-muted-foreground text-sm">
                          {formatearFecha(usuario.perfil__deactivated_at)}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {usuario.id !== user.id ? (
                          esDesactivados ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  disabled={procesando === usuario.id}
                                >
                                  {procesando === usuario.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Activar
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Activar usuario?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esto reactivará al usuario <strong>{usuario.username}</strong> y podrá volver a acceder al sistema.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => activarUsuario(usuario.id)}
                                  >
                                    Activar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={procesando === usuario.id}
                                >
                                  {procesando === usuario.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Desactivar
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción desactivará al usuario <strong>{usuario.username}</strong>. Sus datos se conservarán y podrás reactivarlo cuando quieras.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => desactivarUsuario(usuario.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Desactivar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )
                        ) : (
                          <span className="text-muted-foreground italic text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default GestionUsuarios;