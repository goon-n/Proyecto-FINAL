import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getMovimientos } from "../../services/movimientoCaja.service";

export default function MovimientoCajaHistorial({ movimientos: movimientosProp, cajaId }) {
  const [movimientos, setMovimientos] = useState(movimientosProp || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si se pasa cajaId, cargar los movimientos
    if (cajaId && !movimientosProp) {
      setLoading(true);
      getMovimientos().then(res => {
        const movsFiltrados = res.data.filter(m => m.caja === cajaId);
        setMovimientos(movsFiltrados);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (movimientosProp) {
      setMovimientos(movimientosProp);
    }
  }, [cajaId, movimientosProp]);

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando movimientos...
      </div>
    );
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay movimientos registrados
      </div>
    );
  }

  const getTipoBadge = (tipo) => {
    const config = {
      ingreso: { variant: "default", label: "Ingreso", color: "bg-green-100 text-green-800" },
      egreso: { variant: "destructive", label: "Egreso", color: "bg-red-100 text-red-800" },
    };
    return config[tipo] || { variant: "outline", label: tipo };
  };

  const getTipoPagoIcon = (tipoPago) => {
  const icons = {
    'efectivo': '💵',
    'transferencia': '🏦',
    'tarjeta': '💳'
  };
  return icons[tipoPago] || '💰';
};

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((mov) => (
            <TableRow key={mov.id} className={mov.compra_info ? 'bg-amber-50' : ''}>
              <TableCell className="text-sm">
                {new Date(mov.fecha).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
              <TableCell>
                <Badge className={getTipoBadge(mov.tipo).color}>
                  {getTipoBadge(mov.tipo).label}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate">
                  {mov.descripcion || '-'}
                </div>
                {/* ⭐ NUEVO: Mostrar info de compra si existe */}
                {mov.compra_info && (
                  <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                   
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {getTipoPagoIcon(mov.tipo_pago)} {mov.tipo_pago}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                👤 {mov.creado_por_nombre || 'Sistema'}
              </TableCell>
              <TableCell className={`text-right font-mono font-semibold ${
                mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
              }`}>
                {mov.tipo === 'ingreso' ? '+' : '-'}${Number(mov.monto).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}