// src/components/reportes/ModalAccionReporte.jsx

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

const ModalAccionReporte = ({ 
  open, 
  onClose, 
  reporte, 
  tipo, 
  onConfirmar, 
  onRechazar 
}) => {
  const [notas, setNotas] = useState("");
  const [procesando, setProcesando] = useState(false);

  const handleAccion = async () => {
    setProcesando(true);
    try {
      if (tipo === 'confirmar') {
        await onConfirmar(notas);
      } else {
        await onRechazar(notas);
      }
      setNotas("");
      onClose();
    } finally {
      setProcesando(false);
    }
  };

  const handleClose = () => {
    setNotas("");
    onClose();
  };

  if (!reporte) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tipo === 'confirmar' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Confirmar Reporte
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Rechazar Reporte
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {tipo === 'confirmar' 
              ? `¿Confirmar el reporte y descontar ${reporte.cantidad} unidad(es) del stock de "${reporte.accesorio_nombre}"?`
              : `¿Rechazar el reporte de "${reporte.accesorio_nombre}"?`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {tipo === 'confirmar' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                Esta acción descontará el stock automáticamente y no se puede deshacer.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agrega notas sobre esta decisión..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            onClick={handleAccion}
            disabled={procesando}
            className={tipo === 'confirmar' 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-red-600 hover:bg-red-700"
            }
          >
            {procesando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              tipo === 'confirmar' ? 'Confirmar' : 'Rechazar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalAccionReporte;