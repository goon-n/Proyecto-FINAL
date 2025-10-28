import { useState } from "react";
import { Pencil, Trash2, RefreshCw, Loader2, Package } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const FilaProveedor = ({ proveedor, esDesactivado, onEditar, onDesactivar, onActivar }) => {
  const [procesando, setProcesando] = useState(false);

  const handleAccion = async (accion) => {
    setProcesando(true);
    try {
      await accion();
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <TableRow className={esDesactivado ? "opacity-60" : ""}>
      <TableCell className="font-medium">{proveedor.id}</TableCell>
      <TableCell className="font-semibold">
        <div className="flex items-center gap-2">
          {proveedor.nombre}
          {esDesactivado && (
            <Badge variant="destructive" className="text-xs">Inactivo</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {proveedor.telefono || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {proveedor.email || "-"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{proveedor.accesorios_count || 0}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatearFecha(proveedor.fecha_creacion)}
      </TableCell>
      <TableCell className="text-right">
        {esDesactivado ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm"
                disabled={procesando}
              >
                {procesando ? (
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
                <AlertDialogTitle>¿Activar proveedor?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esto reactivará al proveedor <strong>{proveedor.nombre}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAccion(() => onActivar(proveedor.id))}
                >
                  Activar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditar(proveedor)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={procesando}
                >
                  {procesando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Desactivar proveedor?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción desactivará al proveedor <strong>{proveedor.nombre}</strong>. 
                    {proveedor.accesorios_count > 0 && (
                      <span className="block mt-2 text-orange-600">
                        ⚠️ Este proveedor tiene {proveedor.accesorios_count} accesorio(s) activo(s).
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleAccion(() => onDesactivar(proveedor.id))}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Desactivar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default FilaProveedor;