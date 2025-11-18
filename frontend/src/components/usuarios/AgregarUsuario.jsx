// src/components/usuarios/AgregarUsuario.jsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";

export const AgregarUsuario = ({ onUsuarioCreado, esEntrenador, soloStaff, soloSocios }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Determinar rol por defecto según la sección
  const rolPorDefecto = soloStaff ? "admin" : "socio";
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    rol: rolPorDefecto
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username) {
      toast.error("El nombre de usuario es obligatorio");
      return;
    }

    // ✅ Ahora la contraseña es obligatoria para todos
    if (!formData.password) {
      toast.error("La contraseña es obligatoria");
      return;
    }

    if (formData.password.length < 4) {
      toast.error("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setGuardando(true);
    try {
      await api.crearUsuario(formData);
      
      if (esEntrenador) {
        toast.success("✅ Socio creado exitosamente. Puede iniciar sesión con las credenciales proporcionadas.");
      } else if (soloStaff) {
        toast.success("✅ Usuario del sistema creado exitosamente");
      } else if (soloSocios) {
        toast.success("✅ Socio creado exitosamente");
      } else {
        toast.success("✅ Usuario creado exitosamente");
      }
      
      setFormData({
        username: "",
        password: "",
        email: "",
        rol: rolPorDefecto
      });
      setMostrarFormulario(false);
      if (onUsuarioCreado) onUsuarioCreado();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
      toast.error("❌ " + errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            <CardTitle>
              {esEntrenador 
                ? "Agregar Nuevo Socio" 
                : soloStaff 
                  ? "Agregar Usuario del Sistema"
                  : soloSocios
                    ? "Agregar Nuevo Socio"
                    : "Agregar Nuevo Usuario"}
            </CardTitle>
          </div>
          <Button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            variant={mostrarFormulario ? "outline" : "default"}
          >
            {mostrarFormulario ? "Cancelar" : "+ Agregar"}
          </Button>
        </div>
      </CardHeader>

      {mostrarFormulario && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Usuario *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="nombre_usuario"
                  required
                  disabled={guardando}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  disabled={guardando}
                />
              </div>

              {/* ✅ Ahora SIEMPRE se muestra la contraseña */}
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={guardando}
                  minLength={4}
                />
                {esEntrenador && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 El socio podrá cambiar su contraseña desde su perfil
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="rol">Rol *</Label>
                {esEntrenador || soloSocios ? (
                  <Input
                    value="Socio"
                    disabled
                    className="bg-gray-100"
                  />
                ) : soloStaff ? (
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={guardando}
                  >
                    <option value="admin">Administrador</option>
                    <option value="entrenador">Entrenador</option>
                  </select>
                ) : (
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={guardando}
                  >
                    <option value="socio">Socio</option>
                    <option value="entrenador">Entrenador</option>
                    <option value="admin">Administrador</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMostrarFormulario(false);
                  setFormData({
                    username: "",
                    password: "",
                    email: "",
                    rol: rolPorDefecto
                  });
                }}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando 
                  ? "Creando..." 
                  : esEntrenador || soloSocios
                    ? "Crear Socio" 
                    : soloStaff
                      ? "Crear Usuario"
                      : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
};