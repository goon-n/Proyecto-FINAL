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
  procesando,
  esEntrenador  // ← YA LO RECIBES desde GestionUsuarios
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          {/* Solo mostrar columna "Cambiar Rol" si NO es entrenador y NO está en desactivados */}
          {!esEntrenador && !esDesactivados && <TableHead>Cambiar Rol</TableHead>}
          {esDesactivados && <TableHead>Desactivado</TableHead>}
          {/* Solo mostrar columna "Acciones" si NO es entrenador */}
          {!esEntrenador && <TableHead className="text-right">Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {usuarios.length === 0 ? (
          <TableRow>
            <TableCell colSpan={esEntrenador ? 4 : 6} className="text-center text-muted-foreground py-8">
              {esDesactivados 
                ? "No hay usuarios desactivados" 
                : esEntrenador 
                  ? "No hay socios activos"
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
              esEntrenador={esEntrenador}  // ← PASAR LA PROP
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};