// src/components/turnos/EstadoCuota.jsx - MODIFICADO CON CLASES
import React, { useEffect, useState } from "react";
import { getMiCuota } from "../../services/turnoService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Crown, AlertCircle, Zap } from "lucide-react";

const EstadoCuota = () => {
    const [cuota, setCuota] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCuota = async () => {
            try {
                const data = await getMiCuota();
                setCuota(data);
            } catch (error) {
                console.error("No se pudo cargar la cuota", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCuota();
    }, []);

    if (loading) return null;

    if (!cuota) {
        return (
            <Card className="border-l-4 border-l-red-500 bg-red-50 mb-6">
                <CardContent className="p-4 flex items-center gap-4">
                    <AlertCircle className="text-red-500 h-8 w-8" />
                    <div>
                        <h3 className="font-bold text-red-700">Sin Plan Activo</h3>
                        <p className="text-sm text-red-600">
                            No tienes una cuota activa. No podrás reservar turnos.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const esVencida = cuota.estado === 'vencida';
    const diasRestantes = cuota.dias_restantes;
    const planTipo = cuota.plan_info?.tipo_limite;
    const cantidadLimite = Number(cuota.plan_info?.cantidad_limite) || 0;
    // Solo contamos/descontamos clases para planes semanales limitados (2x o 3x semanal)
    const shouldCount = planTipo === 'semanal' && [2, 3].includes(cantidadLimite);
    const sinClases = shouldCount && cuota.clases_restantes === 0;

    // Calcular total mensual según tipo de cuota: semanal -> cantidad_limite * 4, diario -> *30, libre -> infinito
    const calcularTotalMensual = () => {
        if (!cuota) return null;
        // Si el plan no se cuenta (pases libres o diarios), tratamos como ilimitado para la UI
        if (!shouldCount) return Infinity;
        // Si es un plan semanal contado, multiplicamos por 4
        if (planTipo === 'semanal') return cantidadLimite * 4;
        // Fallback: usar lo que provenga del backend
        if (cuota.clases_totales !== undefined && cuota.clases_totales !== null) return cuota.clases_totales;
        return null;
    };

    const totalMensual = calcularTotalMensual();

    // Normalizar valor mostrado de clases restantes: no mostrar más que el total (si es finito)
    const getDisplayValues = () => {
        // Para planes que no se cuentan (diario, libre, etc.) mostramos infinito
        if (!shouldCount) return { displayRestantes: '∞', displayTotal: '∞', denomForPercent: Infinity };

        const total = (totalMensual && isFinite(totalMensual)) ? totalMensual : (cuota.clases_totales ?? null);
        const totalFinite = total !== null ? Number(total) : null;

        const restantesRaw = Number(cuota.clases_restantes ?? 0);
        const displayRestantes = totalFinite !== null ? Math.min(restantesRaw, totalFinite) : restantesRaw;
        const displayTotal = totalFinite !== null ? totalFinite : (cuota.clases_totales ?? '-');
        const denomForPercent = totalFinite !== null ? totalFinite : (cuota.clases_totales || 1);

        return { displayRestantes, displayTotal, denomForPercent };
    };

    const { displayRestantes, displayTotal, denomForPercent } = getDisplayValues();
    
    // Determinar color según días restantes
    let colorEstado = "bg-green-100 text-green-800 border-green-200";
    if (esVencida) colorEstado = "bg-red-100 text-red-800 border-red-200";
    else if (diasRestantes <= 5) colorEstado = "bg-yellow-100 text-yellow-800 border-yellow-200";

    // Color para clases restantes (solo para planes que se cuentan)
    let colorClases = "text-green-600";
    if (shouldCount) {
        const porcentaje = (Number(displayRestantes) / Number(denomForPercent)) * 100;
        if (porcentaje === 0) colorClases = "text-red-600";
        else if (porcentaje <= 33) colorClases = "text-orange-600";
        else if (porcentaje <= 66) colorClases = "text-yellow-600";
    }

    return (
        <Card className="mb-6 shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Info del Plan */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <Crown className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Tu Membresía
                        </p>
                        <h3 className="font-bold text-lg text-gray-800">
                            {cuota.plan_nombre}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Badge variant="outline" className="text-xs font-normal">
                                {cuota.plan_info?.tipo_limite === 'semanal' 
                                    ? `Máx: ${cuota.plan_info.cantidad_limite} reservas/semana`
                                    : cuota.plan_info?.tipo_limite === 'diario'
                                        ? `Máx: ${cuota.plan_info.cantidad_limite} reservas/día`
                                        : 'Acceso Ilimitado'
                                }
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 🆕 Clases Restantes */}
                <div className={`px-4 py-2 rounded-lg border ${
                    sinClases ? 'bg-red-100 border-red-200' : 'bg-blue-50 border-blue-200'
                } flex items-center gap-3`}>
                    <Zap className={`h-5 w-5 ${sinClases ? 'text-red-600' : 'text-blue-600'}`} />
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase text-gray-600">
                            Clases Disponibles
                        </p>
                        <p className={`text-xl font-bold ${colorClases}`}>
                            {!shouldCount
                                ? '∞ Ilimitadas'
                                : `${displayRestantes} / ${displayTotal}`
                            }
                        </p>
                    </div>
                </div>

                {/* Estado de Vencimiento */}
                <div className={`px-4 py-2 rounded-lg border ${colorEstado} flex items-center gap-3`}>
                    <CalendarClock className="h-5 w-5" />
                    <div className="text-right">
                        <p className="text-xs font-bold uppercase">
                            {esVencida ? "Vencida" : "Vence en"}
                        </p>
                        <p className="text-sm font-medium">
                            {esVencida 
                                ? "Renueva tu plan" 
                                : `${diasRestantes} días (${cuota.fecha_vencimiento})`
                            }
                        </p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default EstadoCuota;