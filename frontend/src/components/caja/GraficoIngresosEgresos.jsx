import React, { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function GraficoIngresosEgresos({ cajaId }) {
  const [movimientos, setMovimientos] = useState([]);
  const [todasLasCajas, setTodasLasCajas] = useState([]);
  const [vista, setVista] = useState('dia'); // dia, semana, mes, año
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    getMovimientos().then(res => {
      // Obtener TODOS los movimientos (de todas las cajas)
      const todosMovs = res.data;
      
      // Obtener las fechas de la caja actual
      const movsActual = todosMovs.filter(m => Number(m.caja) === Number(cajaId));
      const fechasCajaActual = [...new Set(movsActual.map(m => m.fecha.substr(0, 10)))];
      
      // Filtrar todos los movimientos que coincidan con las fechas de la caja actual
      const movsDelMismoDia = todosMovs.filter(m => {
        const fechaMov = m.fecha.substr(0, 10);
        return fechasCajaActual.includes(fechaMov);
      });
      
      setMovimientos(movsDelMismoDia);
      console.log(`📊 Mostrando ${movsDelMismoDia.length} movimientos de todas las cajas en los días que operó la caja ${cajaId}`);
    });
  }, [cajaId]);

  const movimientosFiltrados = useMemo(() => {
    let filtrados = [...movimientos];
    
    // Si hay ambas fechas, filtramos el rango
    if (fechaInicio && fechaFin) {
      filtrados = filtrados.filter(m => {
        const fechaMov = m.fecha.substr(0, 10);
        return fechaMov >= fechaInicio && fechaMov <= fechaFin;
      });
    }
    // Si solo hay fecha inicio
    else if (fechaInicio) {
      filtrados = filtrados.filter(m => m.fecha.substr(0, 10) >= fechaInicio);
    }
    // Si solo hay fecha fin
    else if (fechaFin) {
      filtrados = filtrados.filter(m => m.fecha.substr(0, 10) <= fechaFin);
    }
    
    return filtrados;
  }, [movimientos, fechaInicio, fechaFin]);

  const grafico = useMemo(() => {
    if (movimientosFiltrados.length === 0) return null;

    let labels = [], ingresos = [], egresos = [];

    if (vista === 'dia') {
      const fechas = [...new Set(movimientosFiltrados.map(m => m.fecha.substr(0,10)))].sort();
      labels = fechas.map(f => new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
      fechas.forEach(f => {
        ingresos.push(movimientosFiltrados.filter(m => m.tipo === 'ingreso' && m.fecha.startsWith(f)).reduce((acc, m) => acc + Number(m.monto), 0));
        egresos.push(movimientosFiltrados.filter(m => m.tipo === 'egreso' && m.fecha.startsWith(f)).reduce((acc, m) => acc + Number(m.monto), 0));
      });
    } else if (vista === 'semana') {
      const getSemana = (f) => {
        const d = new Date(f + 'T00:00:00');
        const inicio = new Date(d.getFullYear(), 0, 1);
        const dias = Math.floor((d - inicio) / 86400000);
        return `${d.getFullYear()}-S${Math.ceil((dias + inicio.getDay() + 1) / 7)}`;
      };
      const semanas = [...new Set(movimientosFiltrados.map(m => getSemana(m.fecha.substr(0,10))))].sort();
      labels = semanas;
      semanas.forEach(s => {
        ingresos.push(movimientosFiltrados.filter(m => m.tipo === 'ingreso' && getSemana(m.fecha.substr(0,10)) === s).reduce((acc, m) => acc + Number(m.monto), 0));
        egresos.push(movimientosFiltrados.filter(m => m.tipo === 'egreso' && getSemana(m.fecha.substr(0,10)) === s).reduce((acc, m) => acc + Number(m.monto), 0));
      });
    } else if (vista === 'mes') {
      const meses = [...new Set(movimientosFiltrados.map(m => m.fecha.substr(0,7)))].sort();
      labels = meses.map(m => new Date(m + '-01T00:00:00').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }));
      meses.forEach(m => {
        ingresos.push(movimientosFiltrados.filter(mov => mov.tipo === 'ingreso' && mov.fecha.startsWith(m)).reduce((acc, mov) => acc + Number(mov.monto), 0));
        egresos.push(movimientosFiltrados.filter(mov => mov.tipo === 'egreso' && mov.fecha.startsWith(m)).reduce((acc, mov) => acc + Number(mov.monto), 0));
      });
    } else if (vista === 'año') {
      const años = [...new Set(movimientosFiltrados.map(m => m.fecha.substr(0,4)))].sort();
      labels = años;
      años.forEach(a => {
        ingresos.push(movimientosFiltrados.filter(m => m.tipo === 'ingreso' && m.fecha.startsWith(a)).reduce((acc, m) => acc + Number(m.monto), 0));
        egresos.push(movimientosFiltrados.filter(m => m.tipo === 'egreso' && m.fecha.startsWith(a)).reduce((acc, m) => acc + Number(m.monto), 0));
      });
    }

    return {
      labels,
      datasets: [
        { label: "Ingresos", data: ingresos, backgroundColor: "rgba(34,197,94,0.7)", borderColor: "rgba(34,197,94,1)", borderWidth: 2 },
        { label: "Egresos", data: egresos, backgroundColor: "rgba(239,68,68,0.7)", borderColor: "rgba(239,68,68,1)", borderWidth: 2 }
      ]
    };
  }, [movimientosFiltrados, vista]);

  const totales = useMemo(() => {
    const ing = movimientosFiltrados.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + Number(m.monto), 0);
    const egr = movimientosFiltrados.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + Number(m.monto), 0);
    return { ingresos: ing, egresos: egr, balance: ing - egr };
  }, [movimientosFiltrados]);

  if (!grafico) return null;

  return (
    <div className="space-y-4">
      {/* Filtros de fecha */}
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium block mb-1">📅 Desde</label>
          <Input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
            max={fechaFin || undefined}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium block mb-1">📅 Hasta</label>
          <Input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
            min={fechaInicio || undefined}
          />
        </div>
        {(fechaInicio || fechaFin) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setFechaInicio(''); setFechaFin(''); }}
            className="h-10"
          >
            🔄 Limpiar
          </Button>
        )}
      </div>

      {/* Indicador de filtro activo */}
      {(fechaInicio || fechaFin) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>📌 Periodo seleccionado:</strong>{' '}
            {fechaInicio && fechaFin 
              ? `Del ${new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-ES')} al ${new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-ES')}`
              : fechaInicio 
              ? `Desde ${new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-ES')}`
              : `Hasta ${new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-ES')}`
            }
            {' '}({movimientosFiltrados.length} movimientos)
          </p>
        </div>
      )}

      {/* Gráfico */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">
              {vista === 'dia' && '📅 Vista Diaria'}
              {vista === 'semana' && '📆 Vista Semanal'}
              {vista === 'mes' && '📊 Vista Mensual'}
              {vista === 'año' && '📈 Vista Anual'}
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant={vista === 'dia' ? 'default' : 'outline'} onClick={() => setVista('dia')}>Día</Button>
              <Button size="sm" variant={vista === 'semana' ? 'default' : 'outline'} onClick={() => setVista('semana')}>Semana</Button>
              <Button size="sm" variant={vista === 'mes' ? 'default' : 'outline'} onClick={() => setVista('mes')}>Mes</Button>
              <Button size="sm" variant={vista === 'año' ? 'default' : 'outline'} onClick={() => setVista('año')}>Año</Button>
            </div>
          </div>
          <Bar 
            data={grafico} 
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: (v) => '$' + v }
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
