import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FilaProveedor from "./FilaProveedor";

export const TablaProveedores = ({
  proveedores,
  esDesactivados,
  onEditar,
  onDesactivar,
  onActivar,
  busqueda,
}) => {
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      proveedor.nombre.toLowerCase().includes(textoBusqueda) ||
      proveedor.email?.toLowerCase().includes(textoBusqueda) ||
      proveedor.telefono?.toLowerCase().includes(textoBusqueda)
    );
  });

  if (proveedoresFiltrados.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {busqueda
          ? "No se encontraron proveedores"
          : `No hay proveedores ${esDesactivados ? "inactivos" : "activos"}`}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Accesorios</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proveedoresFiltrados.map((proveedor) => (
            <FilaProveedor
              key={proveedor.id}
              proveedor={proveedor}
              esDesactivado={esDesactivados}
              onEditar={onEditar}
              onDesactivar={onDesactivar}
              onActivar={onActivar}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};