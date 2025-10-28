// src/components/usuarios/FilaUsuario.jsx

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SelectorRol } from "./SelectorRol";
import { DialogDesactivar } from "./DialogDesactivar";
import { DialogActivar } from "./DialogActivar";
import { getRolBadgeVariant, formatearFecha } from "@/utils/formatters";

export const FilaUsuario = ({
  usuario,
  esUsuarioActual,
  esDesactivado,
  rolEditado,
  onCambiarRol,
  onGuardarRol,
  onDesactivar,
  onActivar,
  guardando,
  procesando
}) => {
  return (
    <TableRow className={esDesactivado ? "opacity-60" : ""}>
      <TableCell className="font-medium">{usuario.id}</TableCell>
      
      <TableCell className="font-semibold">
        {usuario.username}
        {esDesactivado && (
          <Badge variant="destructive" className="ml-2 text-xs">
            Desactivado
          </Badge>
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

      {!esDesactivado && (
        <TableCell>
          {!esUsuarioActual ? (
            <SelectorRol
              rolActual={usuario.perfil__rol}
              rolEditado={rolEditado}
              onCambiar={(nuevoRol) => onCambiarRol(usuario.id, nuevoRol)}
              onGuardar={() => onGuardarRol(usuario.id)}
              guardando={guardando === usuario.id}
            />
          ) : (
            <span className="text-muted-foreground italic text-sm">
              Tu usuario
            </span>
          )}
        </TableCell>
      )}

      {esDesactivado && (
        <TableCell className="text-muted-foreground text-sm">
          {formatearFecha(usuario.perfil__deactivated_at)}
        </TableCell>
      )}

      <TableCell className="text-right">
        {!esUsuarioActual ? (
          esDesactivado ? (
            <DialogActivar
              usuario={usuario}
              onConfirmar={() => onActivar(usuario.id)}
              procesando={procesando === usuario.id}
            />
          ) : (
            <DialogDesactivar
              usuario={usuario}
              onConfirmar={() => onDesactivar(usuario.id)}
              procesando={procesando === usuario.id}
            />
          )
        ) : (
          <span className="text-muted-foreground italic text-sm">-</span>
        )}
      </TableCell>
    </TableRow>
  );
};