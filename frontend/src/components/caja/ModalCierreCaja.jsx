import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ModalCierreCaja({ 
  open, 
  onOpenChange, 
  caja, 
  onConfirmar,
  onCancelar
}) {
  const efectivoEsperado = Number(caja.efectivo_esperado || 0);
  const transferenciaEsperada = Number(caja.transferencia_esperada || 0);
  const tarjetaEsperada = Number(caja.tarjeta_esperada || 0);
  const totalEsperado = efectivoEsperado + transferenciaEsperada + tarjetaEsperada;
  
  const montoContado = Number(caja.closing_counted_amount || 0);
  const diferenciaEfectivo = montoContado - efectivoEsperado;
  const hayDiferencia = Math.abs(diferenciaEfectivo) > 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">RESUMEN DE CIERRE DE CAJA</DialogTitle>
          <DialogDescription>
            Revisa la información antes de cerrar la caja
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comparación de EFECTIVO */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
              💵 EFECTIVO:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Esperado:</span>
                <span className="font-mono font-semibold">${efectivoEsperado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Contado:</span>
                <span className="font-mono font-semibold">${montoContado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-blue-300">
                <span>Diferencia:</span>
                <span className={`font-mono ${hayDiferencia ? 'text-red-600' : 'text-green-600'}`}>
                  ${diferenciaEfectivo.toFixed(2)} {hayDiferencia ? '⚠️' : '✅'}
                </span>
              </div>
            </div>
          </div>

          {/* TRANSFERENCIAS Y TARJETAS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                🏦 TRANSFERENCIAS:
              </h4>
              <p className="font-mono text-lg">${transferenciaEsperada.toFixed(2)}</p>
            </div>
            
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                💳 TARJETAS:
              </h4>
              <p className="font-mono text-lg">${tarjetaEsperada.toFixed(2)}</p>
            </div>
          </div>

          {/* TOTAL GENERAL */}
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-lg">💰 TOTAL GENERAL:</h4>
              <span className="font-mono text-2xl font-bold text-green-600">
                ${totalEsperado.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ALERTA SI HAY DIFERENCIA */}
          {hayDiferencia && (
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠️ HAY DIFERENCIA EN EFECTIVO
              </p>
            </div>
          )}

          {!hayDiferencia && (
            <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-sm text-green-800 font-semibold">
                ✅ EFECTIVO CORRECTO
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancelar}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirmar}
            className="bg-green-600 hover:bg-green-700"
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
