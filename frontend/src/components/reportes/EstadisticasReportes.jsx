// src/components/reportes/EstadisticasReportes.jsx

import { Card, CardContent } from "@/components/ui/card";

const EstadisticasReportes = ({ stats }) => {
  if (!stats) return null;

  const estadisticas = [
    {
      label: "Total Reportes",
      valor: stats.total_reportes,
      color: "text-gray-900"
    },
    {
      label: "Pendientes",
      valor: stats.pendientes,
      color: "text-yellow-600"
    },
    {
      label: "Confirmados",
      valor: stats.confirmados,
      color: "text-green-600"
    },
    {
      label: "Rechazados",
      valor: stats.rechazados,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {estadisticas.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.valor}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EstadisticasReportes;