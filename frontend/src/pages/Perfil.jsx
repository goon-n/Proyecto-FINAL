// src/pages/Perfil.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Calendar,
  Shield,
  ArrowLeft,
  Save,
  Lock,
  AlertCircle,
  CheckCircle2,
  Edit,
  X,
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";

const Perfil = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Estados para datos del perfil
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para formulario de edición
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: ""
  });

  // Estados para cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password_actual: "",
    password_nueva: "",
    password_confirmar: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // 🆕 Estados para alerts de contraseña
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const data = await api.obtenerMiPerfil();
      setPerfil(data);
      setFormData({
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || ""
      });
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await api.actualizarMiPerfil(formData);
      
      setPerfil({
        ...perfil,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      });

      // Actualizar el contexto de autenticación
      if (updateUser) {
        updateUser({
          ...user,
          email: formData.email
        });
      }

      setEditMode(false);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error(error.response?.data?.error || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      email: perfil.email || "",
      first_name: perfil.first_name || "",
      last_name: perfil.last_name || ""
    });
    setEditMode(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 🆕 Limpiar mensajes previos
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validaciones
    if (!passwordData.password_actual || !passwordData.password_nueva || !passwordData.password_confirmar) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }

    if (passwordData.password_nueva !== passwordData.password_confirmar) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordData.password_nueva.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setChangingPassword(true);
      await api.cambiarContrasena(user.id, {
        password_actual: passwordData.password_actual,
        password_nueva: passwordData.password_nueva
      });

      // 🆕 Mostrar mensaje de éxito
      setPasswordSuccess(true);
      
      // Limpiar formulario
      setPasswordData({
        password_actual: "",
        password_nueva: "",
        password_confirmar: ""
      });
      
      toast.success("Contraseña actualizada correctamente");

      // 🆕 Ocultar el formulario después de 2 segundos
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      
      // 🆕 Mostrar error específico según respuesta del servidor
      const errorMessage = error.response?.data?.error || "Error al cambiar la contraseña";
      
      if (errorMessage.toLowerCase().includes("incorrecta") || 
          errorMessage.toLowerCase().includes("no corresponde") ||
          errorMessage.toLowerCase().includes("actual")) {
        setPasswordError("La contraseña actual no es correcta");
      } else {
        setPasswordError(errorMessage);
      }
      
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getRolBadge = (rol) => {
    const roles = {
      admin: { label: "Administrador", className: "bg-purple-600" },
      entrenador: { label: "Entrenador", className: "bg-blue-600" },
      socio: { label: "Socio", className: "bg-green-600" }
    };
    return roles[rol] || { label: rol, className: "bg-gray-600" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Cargando perfil...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rolBadge = getRolBadge(perfil?.rol);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => {
              if (perfil?.rol === "admin") navigate("/admin");
              else if (perfil?.rol === "entrenador") navigate("/entrenador");
              else navigate("/socio");
            }}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
        </div>

        {/* Título */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Mi Perfil</CardTitle>
                  <CardDescription className="text-lg mt-1">
                    Gestiona tu información personal
                  </CardDescription>
                </div>
              </div>
              <Badge className={rolBadge.className}>{rolBadge.label}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Información del Perfil */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Información Personal
              </CardTitle>
              {!editMode && (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              // Modo Edición
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    disabled={saving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              // Modo Vista
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Nombre
                    </p>
                    <p className="text-lg font-semibold">
                      {perfil.first_name || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Apellido
                    </p>
                    <p className="text-lg font-semibold">
                      {perfil.last_name || "No especificado"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg">{perfil.email || "No especificado"}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Usuario</p>
                    <p className="text-lg font-mono">{perfil.username}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Miembro desde
                    </p>
                    <p className="text-lg">
                      {formatearFecha(perfil.date_joined)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cambio de Contraseña */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-600" />
                Seguridad
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <div className="text-center py-6">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Mantén tu cuenta segura actualizando tu contraseña regularmente
                </p>
                <Button
                  onClick={() => setShowPasswordForm(true)}
                  variant="outline"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Cambiar Contraseña
                </Button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* 🆕 Alert de información general */}
                {!passwordError && !passwordSuccess && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tu contraseña debe tener al menos 6 caracteres
                    </AlertDescription>
                  </Alert>
                )}

                {/* 🆕 Alert de ERROR - Contraseña incorrecta */}
                {passwordError && (
                  <Alert variant="destructive" className="animate-shake">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="font-semibold">
                      {passwordError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* 🆕 Alert de ÉXITO - Contraseña cambiada */}
                {passwordSuccess && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="font-semibold text-green-800">
                      ✅ Contraseña actualizada correctamente
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password_actual">Contraseña Actual</Label>
                  <Input
                    id="password_actual"
                    type="password"
                    value={passwordData.password_actual}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        password_actual: e.target.value
                      });
                      // Limpiar error al escribir
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Tu contraseña actual"
                    required
                    disabled={changingPassword || passwordSuccess}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_nueva">Contraseña Nueva</Label>
                  <Input
                    id="password_nueva"
                    type="password"
                    value={passwordData.password_nueva}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        password_nueva: e.target.value
                      });
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Nueva contraseña"
                    required
                    minLength={6}
                    disabled={changingPassword || passwordSuccess}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmar">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    id="password_confirmar"
                    type="password"
                    value={passwordData.password_confirmar}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        password_confirmar: e.target.value
                      });
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Confirmar nueva contraseña"
                    required
                    minLength={6}
                    disabled={changingPassword || passwordSuccess}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={changingPassword || passwordSuccess}
                    className="flex-1"
                  >
                    {changingPassword ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Cambiar Contraseña
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        password_actual: "",
                        password_nueva: "",
                        password_confirmar: ""
                      });
                      setPasswordError(null);
                      setPasswordSuccess(false);
                    }}
                    variant="outline"
                    disabled={changingPassword}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;