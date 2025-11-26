// src/components/reportes/TablaReportes.jsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

const TablaReportes = ({ 
  reportes, 
  loading, 
  esAdmin, 
  onAbrirModalAccion 
}) => {
  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      confirmado: { label: "Confirmado", className: "bg-green-100 text-green-800", icon: CheckCircle },
      rechazado: { label: "Rechazado", className: "bg-red-100 text-red-800", icon: XCircle }
    };
    return badges[estado] || badges.pendiente;
  };

  const getMotivoBadge = (motivo) => {
    const badges = {
      faltante: { label: "Faltante", className: "bg-orange-100 text-orange-800" },
      roto: { label: "Roto/Dañado", className: "bg-red-100 text-red-800" },
      extraviado: { label: "Extraviado", className: "bg-purple-100 text-purple-800" },
      otro: { label: "Otro", className: "bg-gray-100 text-gray-800" }
    };
    return badges[motivo] || badges.otro;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Accesorio</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Reportado por</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              {esAdmin && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={esAdmin ? 9 : 8} className="text-center py-8">
                  No hay reportes para mostrar
                </TableCell>
              </TableRow>
            ) : (
              reportes.map((reporte) => {
                const estadoBadge = getEstadoBadge(reporte.estado);
                const motivoBadge = getMotivoBadge(reporte.motivo);
                const EstadoIcon = estadoBadge.icon;

                return (
                  <TableRow key={reporte.id}>
                    <TableCell className="font-medium">#{reporte.id}</TableCell>
                    <TableCell>{reporte.accesorio_nombre}</TableCell>
                    <TableCell>{reporte.cantidad}</TableCell>
                    <TableCell>
                      <Badge className={motivoBadge.className}>
                        {motivoBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={reporte.descripcion}>
                      {reporte.descripcion}
                    </TableCell>
                    <TableCell>{reporte.reportado_por_username}</TableCell>
                    <TableCell>
                      {new Date(reporte.fecha_reporte).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoBadge.className}>
                        <EstadoIcon className="w-3 h-3 mr-1" />
                        {estadoBadge.label}
                      </Badge>
                    </TableCell>
                    {esAdmin && (
                      <TableCell>
                        {reporte.estado === 'pendiente' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => onAbrirModalAccion(reporte, 'confirmar')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onAbrirModalAccion(reporte, 'rechazar')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {reporte.confirmado_por_username || 'N/A'}
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TablaReportes;