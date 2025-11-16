// src/components/accesorios/DialogDesactivar.jsx

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
import { Button } from "@/components/ui/button";
import { PackageX, PackageCheck, Loader2 } from "lucide-react";

export const DialogDesactivar = ({ accesorio, onConfirmar, procesando }) => {
  const estaActivo = accesorio.activo;
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={estaActivo ? "destructive" : "default"}
          size="sm" 
          disabled={procesando}
        >
          {procesando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {estaActivo ? (
                <>
                  <PackageX className="mr-2 h-4 w-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Activar
                </>
              )}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            {estaActivo ? (
              <>
                Esta acción desactivará el accesorio <strong>{accesorio.nombre}</strong>. 
                No se eliminará, solo quedará oculto y podrás reactivarlo cuando quieras.
              </>
            ) : (
              <>
                Esta acción activará el accesorio <strong>{accesorio.nombre}</strong>. 
                Volverá a estar disponible en el sistema.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmar}
            className={estaActivo 
              ? "bg-destructive hover:bg-destructive/90" 
              : "bg-green-600 hover:bg-green-700"
            }
          >
            {estaActivo ? "Desactivar" : "Activar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};