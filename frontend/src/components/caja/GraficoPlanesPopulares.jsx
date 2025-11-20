// frontend/src/components/caja/GraficoPlanesPopulares.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import api from "../../api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function GraficoPlanesPopulares() {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCuotas();
  }, []);

  const cargarCuotas = async () => {
    try {
      const response = await api.listarCuotas();
      setCuotas(response);
      console.log(`📊 ${response.length} cuotas cargadas para estadísticas`);
    } catch (error) {
      console.error("Error al cargar cuotas:", error);
      setCuotas([]);
    } finally {
      setLoading(false);
    }
  };

  const estadisticasPorPlan = useMemo(() => {
    if (cuotas.length === 0) return null;

    // Agrupar por nombre de plan
    const conteo = {};
    cuotas.forEach(cuota => {
      const planNombre = cuota.plan_nombre || "Sin plan";
      if (conteo[planNombre]) {
        conteo[planNombre]++;
      } else {
        conteo[planNombre] = 1;
      }
    });

    // Convertir a array y ordenar por cantidad
    const planesOrdenados = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return planesOrdenados;
  }, [cuotas]);

  const grafico = useMemo(() => {
    if (!estadisticasPorPlan || estadisticasPorPlan.length === 0) return null;

    // Colores vibrantes para el gráfico
    const colores = [
      'rgba(59, 130, 246, 0.8)',   // Azul
      'rgba(16, 185, 129, 0.8)',   // Verde
      'rgba(249, 115, 22, 0.8)',   // Naranja
      'rgba(168, 85, 247, 0.8)',   // Púrpura
      'rgba(236, 72, 153, 0.8)',   // Rosa
      'rgba(14, 165, 233, 0.8)',   // Cyan
      'rgba(251, 191, 36, 0.8)',   // Amarillo
      'rgba(239, 68, 68, 0.8)',    // Rojo
    ];

    const coloresBorde = [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(249, 115, 22, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(251, 191, 36, 1)',
      'rgba(239, 68, 68, 1)',
    ];

    return {
      labels: estadisticasPorPlan.map(p => p.nombre),
      datasets: [{
        label: 'Cantidad de cuotas',
        data: estadisticasPorPlan.map(p => p.cantidad),
        backgroundColor: colores,
        borderColor: coloresBorde,
        borderWidth: 2,
        hoverOffset: 15
      }]
    };
  }, [estadisticasPorPlan]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
        </CardContent>
      </Card>
    );
  }

  if (!grafico) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">No hay datos suficientes para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  const totalCuotas = estadisticasPorPlan.reduce((sum, p) => sum + p.cantidad, 0);

  return (
    <Card className="shadow-md border-none">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Planes Más Populares
        </CardTitle>
        <p className="text-white/80 text-sm mt-1">
          Distribución de {totalCuotas} cuotas activas por tipo de plan
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Gráfico */}
          <div className="flex justify-center">
            <div className="w-full max-w-[300px]">
              <Doughnut 
                data={grafico}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false // Ocultamos la leyenda por defecto, la mostramos personalizada
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const percentage = ((value / totalCuotas) * 100).toFixed(1);
                          return `${label}: ${value} cuotas (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Lista de planes */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 mb-3">Ranking de Planes:</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {estadisticasPorPlan.map((plan, index) => {
                const porcentaje = ((plan.cantidad / totalCuotas) * 100).toFixed(1);
                const colores = [
                  'bg-blue-100 text-blue-800 border-blue-300',
                  'bg-green-100 text-green-800 border-green-300',
                  'bg-orange-100 text-orange-800 border-orange-300',
                  'bg-purple-100 text-purple-800 border-purple-300',
                  'bg-pink-100 text-pink-800 border-pink-300',
                  'bg-cyan-100 text-cyan-800 border-cyan-300',
                  'bg-yellow-100 text-yellow-800 border-yellow-300',
                  'bg-red-100 text-red-800 border-red-300',
                ];
                
                return (
                  <div 
                    key={plan.nombre}
                    className={`p-3 rounded-lg border-2 ${colores[index % colores.length]} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">#{index + 1}</span>
                        <div>
                          <p className="font-semibold">{plan.nombre}</p>
                          <p className="text-xs opacity-75">{plan.cantidad} cuotas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{porcentaje}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resumen inferior */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Cuotas</p>
              <p className="text-2xl font-bold text-gray-900">{totalCuotas}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Planes Diferentes</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticasPorPlan.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Más Popular</p>
              <p className="text-lg font-bold text-purple-600">
                {estadisticasPorPlan[0]?.nombre.substring(0, 15)}
                {estadisticasPorPlan[0]?.nombre.length > 15 ? '...' : ''}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
