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
                Monto Contado al Cerrar {caja.estado === 'CERRADA' && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="closing_counted_amount"
                type="number"
                step="0.01"
                name="closing_counted_amount"
                value={caja.closing_counted_amount || ""}
                onChange={handleChange}
                placeholder="Efectivo físico contado"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contar solo el efectivo físico en la caja
              </p>
            </div>

            <div>
              <Label htmlFor="notas">Notas y Observaciones</Label>
              <Input
                id="notas"
                name="notas"
                value={caja.notas || ""}
                onChange={handleChange}
                placeholder="Ej: Faltaron $50 en billetes de 10"
              />
            </div>
          </div>

          {caja.closing_counted_amount && (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-2">Comparación de Cierre</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monto según sistema:</span>
                  <span className="font-mono">${Number(caja.closing_system_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monto contado físicamente:</span>
                  <span className="font-mono">${Number(caja.closing_counted_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Diferencia:</span>
                  <span className={`font-mono ${Math.abs(Number(caja.closing_system_amount) - Number(caja.closing_counted_amount)) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                    ${(Number(caja.closing_system_amount) - Number(caja.closing_counted_amount)).toFixed(2)}
                  </span>
                </div>
              </div>
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