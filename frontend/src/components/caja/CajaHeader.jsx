import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CajaHeader({ caja }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Caja #{caja.id}
              <Badge variant={caja.estado === 'ABIERTA' ? 'default' : 'secondary'}>
                {caja.estado}
              </Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-2 space-y-1">
              <p>👤 Abierta por: <span className="font-medium">{caja.empleado_apertura_nombre}</span></p>
              <p>📅 {new Date(caja.fecha_apertura).toLocaleString('es-AR')}</p>
              {caja.empleado_cierre_nombre && (
                <>
                  <p className="mt-2">👤 Cerrada por: <span className="font-medium">{caja.empleado_cierre_nombre}</span></p>
                  <p>📅 {new Date(caja.fecha_cierre).toLocaleString('es-AR')}</p>
                </>
              )}
            </div>
          </div>
          
          {/* Resumen rápido */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Sistema</p>
            <p className="text-3xl font-bold text-green-600">
              ${Number(caja.closing_system_amount).toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Advertencia de diferencia */}
      {caja.difference_amount !== null && Math.abs(Number(caja.difference_amount)) > 0.01 && (
        <CardContent>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Diferencia detectada</p>
              <p className="text-sm text-yellow-700">
                Hay una diferencia de ${Number(caja.difference_amount).toFixed(2)} entre el sistema y lo contado
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}