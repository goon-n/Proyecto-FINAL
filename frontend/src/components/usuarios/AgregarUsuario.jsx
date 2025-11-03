// src/components/usuarios/AgregarUsuario.jsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useCSRF } from "../../hooks/useCSRF";

export const AgregarUsuario = ({ onUsuarioCreado, esEntrenador }) => {
  const { getCSRFToken } = useCSRF();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    rol: "socio"
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

    // Si es admin, la contraseña es obligatoria
    if (!esEntrenador && !formData.password) {
      toast.error("La contraseña es obligatoria");
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch("http://localhost:8000/api/usuarios/crear/", {
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
        throw new Error(errorData.error || "Error al crear usuario");
      }

      const data = await response.json();
      
      if (esEntrenador) {
        toast.success(
          "Socio creado exitosamente. Deberá configurar su contraseña en el primer inicio de sesión.",
          { duration: 5000 }
        );
      } else {
        toast.success("Usuario creado exitosamente");
      }
      
      setFormData({
        username: "",
        password: "",
        email: "",
        rol: "socio"
      });
      setMostrarFormulario(false);
      if (onUsuarioCreado) onUsuarioCreado();
    } catch (error) {
      toast.error(error.message);
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
              {esEntrenador ? "Agregar Nuevo Socio" : "Agregar Nuevo Usuario"}
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

              {/* Solo mostrar contraseña si es ADMIN */}
              {!esEntrenador && (
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
                </div>
              )}

              <div>
                <Label htmlFor="rol">Rol *</Label>
                {esEntrenador ? (
                  <Input
                    value="Socio"
                    disabled
                    className="bg-gray-100"
                  />
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
                    rol: "socio"
                  });
                }}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Creando..." : esEntrenador ? "Crear Socio" : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
};