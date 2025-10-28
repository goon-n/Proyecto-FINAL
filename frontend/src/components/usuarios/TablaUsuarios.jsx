// src/components/usuarios/TablaUsuarios.jsx

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FilaUsuario } from "./FilaUsuario";

export const TablaUsuarios = ({
  usuarios,
  usuarioActualId,
  esDesactivados,
  rolesEditados,
  onCambiarRol,
  onGuardarRol,
  onDesactivar,
  onActivar,
  guardando,
  procesando
}) => {
  return (
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
        {usuarios.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              {esDesactivados 
                ? "No hay usuarios desactivados" 
                : "No hay usuarios activos"}
            </TableCell>
          </TableRow>
        ) : (
          usuarios.map((usuario) => (
            <FilaUsuario
              key={usuario.id}
              usuario={usuario}
              esUsuarioActual={usuario.id === usuarioActualId}
              esDesactivado={esDesactivados}
              rolEditado={rolesEditados[usuario.id]}
              onCambiarRol={onCambiarRol}
              onGuardarRol={onGuardarRol}
              onDesactivar={onDesactivar}
              onActivar={onActivar}
              guardando={guardando}
              procesando={procesando}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};