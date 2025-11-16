import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CajaResumenTab({ caja, totalIngresos, totalEgresos }) {
  return (
    <div className="space-y-4">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Monto Inicial</p>
            <p className="text-2xl font-bold mt-1">${Number(caja.monto_inicial).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ingresos</p>
            <p className="text-2xl font-bold mt-1 text-green-600">+${totalIngresos.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Egresos</p>
            <p className="text-2xl font-bold mt-1 text-red-600">-${totalEgresos.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              ${(Number(caja.monto_inicial) + totalIngresos - totalEgresos).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por tipo de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Cantidad por Tipo de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Efectivo Esperado</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${Number(caja.efectivo_esperado || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Transferencias</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${Number(caja.transferencia_esperada || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}