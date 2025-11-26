// src/components/usuarios/TablaUsuarios.jsx

import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Save, Trash2, UserCheck, Loader2, ShieldAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function TablaUsuarios({
  usuarios,
  usuarioActualId,
  esDesactivados,
  rolesEditados,
  onCambiarRol,
  onGuardarRol,
  onDesactivar,
  onActivar,
  guardando,
  procesando,
  esEntrenador,
}) {
  const getRolBadge = (rol) => {
    const estilos = {
      admin: "bg-red-100 text-red-700",
      entrenador: "bg-blue-100 text-blue-700",
      socio: "bg-green-100 text-green-700",
    };
    return estilos[rol] || "bg-gray-100 text-gray-700";
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha de registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No hay usuarios para mostrar
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((usuario) => {
              const esUsuarioActual = usuario.id === usuarioActualId;
              const rolActual = rolesEditados[usuario.id] || usuario.perfil__rol;
              const hayRolEditado = rolesEditados[usuario.id] && rolesEditados[usuario.id] !== usuario.perfil__rol;

              return (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.username}</TableCell>
                  <TableCell>{usuario.email || "-"}</TableCell>
                  <TableCell>
                    {esDesactivados || esUsuarioActual || esEntrenador ? (
                      <Badge className={getRolBadge(usuario.perfil__rol)}>
                        {usuario.perfil__rol}
                      </Badge>
                    ) : (
                      <Select value={rolActual} onValueChange={(value) => onCambiarRol(usuario.id, value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="entrenador">Entrenador</SelectItem>
                          <SelectItem value="socio">Socio</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>{formatearFecha(usuario.date_joined)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {!esDesactivados ? (
                      <>
                        {hayRolEditado && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onGuardarRol(usuario.id)}
                            disabled={guardando === usuario.id}
                          >
                            {guardando === usuario.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {/* ✅ LÓGICA MEJORADA PARA EL BOTÓN DE DESACTIVAR */}
                        {!esUsuarioActual && !esEntrenador && (
                          <>
                            {usuario.tiene_cuota_activa ? (
                              // ✅ Mostrar tooltip si tiene cuota activa
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-block">
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={true}
                                        className="opacity-50 cursor-not-allowed"
                                      >
                                        <ShieldAlert className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">
                                      Este socio tiene una cuota activa. No se puede desactivar hasta que venza o se cancele la membresía.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              // ✅ Mostrar botón normal si NO tiene cuota activa
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDesactivar(usuario.id, usuario.username)}
                                disabled={procesando === usuario.id}
                              >
                                {procesando === usuario.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onActivar(usuario.id, usuario.username)}
                        disabled={procesando === usuario.id}
                      >
                        {procesando === usuario.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}