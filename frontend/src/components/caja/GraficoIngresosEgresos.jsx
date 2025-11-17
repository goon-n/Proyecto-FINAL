import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
// Registro de scales y plugins para Chart.js v3+
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { getMovimientos } from "../../services/movimientoCaja.service";

export default function GraficoIngresosEgresos({ cajaId }) {
  const [grafico, setGrafico] = useState(null);

  useEffect(() => {
    getMovimientos().then(res => {
      const movs = res.data.filter(m => m.caja === cajaId);

      // Agrupa movimientos por día
      const fechas = [...new Set(movs.map(m => m.fecha.substr(0,10)))];
      const ingresos = fechas.map(f =>
        movs.filter(m => m.tipo === 'ingreso' && m.fecha.startsWith(f))
            .reduce((acc, m) => acc + Number(m.monto), 0)
      );
      const egresos = fechas.map(f =>
        movs.filter(m => m.tipo === 'egreso' && m.fecha.startsWith(f))
            .reduce((acc, m) => acc + Number(m.monto), 0)
      );

      setGrafico({
        labels: fechas,
        datasets: [
          { label: "Ingresos", data: ingresos, backgroundColor: "rgba(75,192,192,0.6)" },
          { label: "Egresos", data: egresos, backgroundColor: "rgba(255,99,132,0.6)" }
        ]
      });
    });
  }, [cajaId]);

  if (!grafico || !grafico.labels) return null;

  return (
    <div className="mt-6">
      <h3 className="font-bold mb-2">Ingresos y Egresos por Día</h3>
      <Bar key={"grafico-"+cajaId} data={grafico} />
    </div>
  );
}
