import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CajaControlTab({ 
  caja, 
  handleChange, 
  handleSubmit, 
  guardando
}) {
  // Calcular efectivo esperado y transferencias esperadas
  const efectivoEsperado = Number(caja.efectivo_esperado || 0);
  const transferenciaEsperada = Number(caja.transferencia_esperada || 0);
  const totalEsperado = efectivoEsperado + transferenciaEsperada;
  
  const montoContado = Number(caja.closing_counted_amount || 0);
  const diferenciaEfectivo = montoContado - efectivoEsperado;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control de Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monto_inicial">Monto Inicial</Label>
              <Input
                id="monto_inicial"
                type="number"
                step="0.01"
                name="monto_inicial"
                value={caja.monto_inicial}
                onChange={handleChange}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado de la Caja</Label>
              <select
                id="estado"
                name="estado"
                value={caja.estado}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ABIERTA">Abierta</option>
                <option value="CERRADA">Cerrada</option>
              </select>
            </div>

            <div>
              <Label htmlFor="closing_counted_amount">
                💵 Efectivo Contado al Cerrar {caja.estado === 'CERRADA' && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="closing_counted_amount"
                type="number"
                step="0.01"
                name="closing_counted_amount"
                value={caja.closing_counted_amount || ""}
                onChange={handleChange}
                placeholder="Contar solo billetes y monedas"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ Contar SOLO el efectivo físico en la caja
              </p>
            </div>
          </div>

          {/* RESUMEN ANTES DE CERRAR */}
          {caja.closing_counted_amount && (
            <div className="space-y-4">
              {/* Comparación de EFECTIVO */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-3 text-blue-900">💵 Comparación de Efectivo</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Efectivo esperado (según sistema):</span>
                    <span className="font-mono font-semibold">${efectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo contado (físico):</span>
                    <span className="font-mono font-semibold">${montoContado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-blue-300">
                    <span>Diferencia en efectivo:</span>
                    <span className={`font-mono ${Math.abs(diferenciaEfectivo) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                      {diferenciaEfectivo > 0 ? '+' : ''}{diferenciaEfectivo.toFixed(2)}
                      {Math.abs(diferenciaEfectivo) < 0.01 ? ' ✅' : ' ⚠️'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RESUMEN TOTAL */}
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-semibold mb-3">📊 Resumen Total de Caja</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>💵 Efectivo:</span>
                    <span className="font-mono">${efectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏦 Transferencias:</span>
                    <span className="font-mono">${transferenciaEsperada.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t text-lg">
                    <span>💰 TOTAL GENERAL:</span>
                    <span className="font-mono text-green-600">${totalEsperado.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                </p>
              </div>

              {/* ALERTA SI HAY DIFERENCIA */}
              {Math.abs(diferenciaEfectivo) > 0.01 && (
                <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Atención:</strong> Hay una diferencia de ${Math.abs(diferenciaEfectivo).toFixed(2)} en el efectivo.
                    {diferenciaEfectivo > 0 ? ' Sobran billetes/monedas.' : ' Faltan billetes/monedas.'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}