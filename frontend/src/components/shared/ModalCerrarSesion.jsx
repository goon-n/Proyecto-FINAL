// src/components/shared/ModalCerrarSesion.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export default function ModalCerrarSesion({ open, onClose, onConfirm }) {
  const [cerrando, setCerrando] = useState(false);
  const [contador, setContador] = useState(3);

  const handleConfirmar = async () => {
    setCerrando(true);
    setContador(3);

    // Countdown de 3 segundos
    for (let i = 3; i > 0; i--) {
      setContador(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Ejecutar cierre de sesión
    if (onConfirm) {
      await onConfirm();
    }
    
    setCerrando(false);
    setContador(3);
  };

  const handleCancelar = () => {
    if (!cerrando) {
      setCerrando(false);
      setContador(3);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancelar}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-600" />
            ¿Cerrar sesión?
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {cerrando 
              ? `Cerrando sesión en ${contador} segundo${contador !== 1 ? 's' : ''}...`
              : "Estás a punto de cerrar tu sesión. ¿Deseas continuar?"
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancelar}
            disabled={cerrando}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={cerrando}
            className="gap-2"
          >
            {cerrando && <Loader2 className="h-4 w-4 animate-spin" />}
            {cerrando ? "Cerrando..." : "Cerrar sesión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
