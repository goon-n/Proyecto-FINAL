// src/components/membresias/TablaMembresias.jsx

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";
import {
  formatearFecha,
  formatearPrecio,
  puedeRenovar,
  getCuotaDisplay,
} from "./utils/membresiaHelpers";

const TablaMembresias = ({ cuotasFiltradas, loading, onAbrirModal, onRecargar }) => {
  const itemsPerPage = 10;
  const [pageCuotas, setPageCuotas] = useState(1);

  // Resetear página cuando cambie el tamaño de la lista filtrada
  useEffect(() => {
    setPageCuotas(1);
  }, [cuotasFiltradas.length]);

  const getTotalPages = (items) => Math.max(1, Math.ceil((items?.length || 0) / itemsPerPage));
  const paginate = (items, page) => items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDescontarClase = async (cuota) => {
    const planTipo = cuota.plan_info?.tipo_limite;
    const cantidadLimite = Number(cuota.plan_info?.cantidad_limite) || 0;
    const nombrePlanLower = (cuota.plan_nombre || '').toLowerCase();
    const matchX = nombrePlanLower.match(/\b(\d+)x\b/);
    const parsedFromName = matchX ? Number(matchX[1]) : null;
    const effectiveLimit = parsedFromName || cantidadLimite;
    const shouldCount = planTipo === 'semanal' && [2, 3].includes(effectiveLimit);

    if (!shouldCount) {
      toast.error("No corresponde descontar manualmente para este tipo de pase (libre/diario).");
      return;
    }

    const totalMensual = effectiveLimit * 4;
    const actuales = Number(cuota.clases_restantes || 0);

    if (actuales <= 0) {
      toast.error("Este socio no tiene clases disponibles");
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmar descuento de 1 clase para ${cuota.socio_username}?\n\n` +
      `Clases actuales: ${Math.min(actuales, totalMensual)}/${totalMensual}\n` +
      `Clases después: ${Math.max(Math.min(actuales - 1, totalMensual), 0)}/${totalMensual}`
    );

    if (!confirmar) return;

    try {
      const response = await api.descontarClaseManual(cuota.id);
      toast.success(response.detail || "Clase descontada exitosamente");
      onRecargar();
    } catch (error) {
      console.error("Error al descontar clase:", error);
      toast.error(error.response?.data?.detail || "Error al descontar la clase");
    }
  };

  const getEstadoBadge = (estado, estadoCalculado) => {
    const estadoFinal = estadoCalculado || estado;

    const configs = {
      activa: {
        label: "Activa",
        icon: CheckCircle,
        className: "bg-green-600 hover:bg-green-700"
      },
      porVencer: {
        label: "Por Vencer",
        icon: AlertCircle,
        className: "bg-yellow-600 hover:bg-yellow-700"
      },
      vencida: {
        label: "Vencida",
        icon: AlertCircle,
        className: "bg-red-600 hover:bg-red-700"
      }
    };

    const config = configs[estadoFinal] || configs.activa;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const renderPaginationControls = (currentPage, totalPages, onPrev, onNext) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onPrev} disabled={currentPage <= 1}>
            Anterior
          </Button>
          <Button size="sm" variant="outline" onClick={onNext} disabled={currentPage >= totalPages}>
            Siguiente
          </Button>
        </div>
      </div>
    );
  };

  const totalPages = getTotalPages(cuotasFiltradas);
  const cuotasPaginated = paginate(cuotasFiltradas, pageCuotas);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Listado de Cuotas Mensuales ({cuotasFiltradas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && cuotasFiltradas.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Actualizando...
          </div>
        )}
        {!loading && cuotasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron cuotas con los filtros aplicados
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Socio</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Días Restantes</TableHead>
                  <TableHead className="w-[100px]">Clases</TableHead>
                  <TableHead className="text-center w-[120px]">Precio</TableHead>
                  <TableHead className="text-center w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuotasPaginated.map((cuota) => (
                  <TableRow
                    key={cuota.id}
                    className={cuota.estado === 'vencida' ? 'bg-red-50 hover:bg-red-100' : ''}
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold">{cuota.socio_username}</p>
                        <p className="text-sm text-muted-foreground">{cuota.socio_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cuota.plan_nombre || cuota.plan_info?.nombre || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(cuota.estado, cuota.estadoCalculado)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatearFecha(cuota.fecha_vencimiento)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        cuota.diasRestantes <= 0
                          ? 'text-red-600'
                          : cuota.diasRestantes <= 5
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}>
                        {cuota.diasRestantes <= 0
                          ? `Vencida (hace ${Math.abs(cuota.diasRestantes)} días)`
                          : `${cuota.diasRestantes} días`
                        }
                      </span>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      {cuota.plan_info?.tipo_limite === 'libre' ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <span className="text-lg">∞</span> Ilimitadas
                        </Badge>
                      ) : (
                        (() => {
                          const { displayRestantes, displayTotal, shouldCount } = getCuotaDisplay(cuota);
                          const restantesNum = displayRestantes === '∞' ? Infinity : Number(displayRestantes);
                          const totalNum = displayTotal === '∞' ? Infinity : Number(displayTotal);
                          let badgeClass = "bg-green-50 text-green-700 border-green-200";
                          if (displayRestantes === 0 || displayRestantes === '0') {
                            badgeClass = "bg-red-50 text-red-700 border-red-200";
                          } else if (isFinite(totalNum) && restantesNum <= totalNum * 0.33) {
                            badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
                          }

                          return (
                            <div className="flex flex-col gap-0.5 items-center w-full">
                              <Badge 
                                variant="outline" 
                                className={`w-full justify-center ${badgeClass}`}
                                style={{ padding: '3px 8px', display: 'inline-block' }}
                              >
                                {displayRestantes}/{displayTotal}
                              </Badge>

                              {cuota.estado === 'activa' && shouldCount && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-full text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2"
                                  onClick={() => handleDescontarClase(cuota)}
                                  disabled={displayRestantes === 0 || displayRestantes === '0'}
                                >
                                  Descontar
                                </Button>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </TableCell>
                    <TableCell className="text-center w-[120px]">
                      <span className="font-semibold text-base">
                        {formatearPrecio(cuota.plan_precio || cuota.plan_info?.precio)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center w-[120px]">
                      {puedeRenovar(cuota) ? (
                        <Button
                          size="sm"
                          onClick={() => onAbrirModal(cuota)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Renovar
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          -
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {renderPaginationControls(
              pageCuotas,
              totalPages,
              () => setPageCuotas(p => Math.max(1, p - 1)),
              () => setPageCuotas(p => Math.min(totalPages, p + 1)),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TablaMembresias;