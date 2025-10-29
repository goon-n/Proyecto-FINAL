import React, { useEffect, useState } from "react";
import { getCaja, updateCaja } from "../../services/caja.service";
import { getMovimientos } from "../../services/movimientoCaja.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";

// Nuevos componentes separados
import CajaHeader from "./CajaHeader";
import CajaResumenTab from "./CajaResumenTab";
import CajaControlTab from "./CajaControlTab";
import MovimientoCajaAdd from "./MovimientoCajaAdd";
import GraficoIngresosEgresos from "./GraficoIngresosEgresos";
import MovimientoCajaHistorial from "./MovimientoCajaHistorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CajaEdit({ id, onGuardado }) {
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [recargarMovs, setRecargarMovs] = useState(0);
  const [movs, setMovs] = useState([]);

  useEffect(() => {
    setLoading(true);
    getCaja(id).then(res => {
      setCaja(res.data);
      setLoading(false);
    });
    getMovimientos().then(res => {
      setMovs(res.data.filter(m => m.caja === id));
    });
  }, [id, recargarMovs]);

  const handleChange = e => {
    const { name, value } = e.target;
    setCaja(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (caja.estado === 'CERRADA' && !caja.closing_counted_amount) {
      toast.error("Debes ingresar el monto contado al cerrar la caja");
      return;
    }

    if (caja.estado === 'CERRADA') {
      const efectivo = Number(caja.efectivo_esperado || 0);
      const transferencia = Number(caja.transferencia_esperada || 0);
      const montoSistema = Number(caja.closing_system_amount);
      const montoContado = Number(caja.closing_counted_amount);
      const diferencia = montoSistema - montoContado;
      
      const confirmar = window.confirm(
        `RESUMEN DE CIERRE DE CAJA\n\n` +
        `💵 Efectivo esperado: $${efectivo.toFixed(2)}\n` +
        `🏦 Transferencias: $${transferencia.toFixed(2)}\n\n` +
        `💰 TOTALES:\n` +
        `Monto sistema: $${montoSistema.toFixed(2)}\n` +
        `Monto contado: $${montoContado.toFixed(2)}\n` +
        `Diferencia: $${diferencia.toFixed(2)}\n\n` +
        `${Math.abs(diferencia) > 0.01 ? '⚠️ HAY DIFERENCIA - ' : '✅ TODO OK - '}¿Confirmar cierre?`
      );
      
      if (!confirmar) {
        setCaja(prev => ({ ...prev, estado: 'ABIERTA' }));
        toast.info("Cierre de caja cancelado");
        return;
      }
    }

    setGuardando(true);
    try {
      await updateCaja(id, {
        estado: caja.estado,
        monto_inicial: Number(caja.monto_inicial),
        closing_counted_amount: caja.closing_counted_amount ? Number(caja.closing_counted_amount) : null,
        notas: caja.notas
      });
      
      const cajaActualizada = await getCaja(id);
      setCaja(cajaActualizada.data);
      
      toast.success(caja.estado === 'CERRADA' ? "Caja cerrada correctamente" : "Caja actualizada correctamente");
      
      if (caja.estado === 'CERRADA' && onGuardado) {
        setTimeout(onGuardado, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al guardar la caja");
    } finally {
      setGuardando(false);
    }
  };

  if (loading || !caja) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  const totalIngresos = movs.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + Number(m.monto), 0);
  const totalEgresos = movs.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + Number(m.monto), 0);

  return (
    <div className="space-y-6">
      {/* Header separado */}
      <CajaHeader caja={caja} />

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">📊 Resumen</TabsTrigger>
          <TabsTrigger value="control">⚙️ Control de caja</TabsTrigger>
          <TabsTrigger value="movimientos">📝 Movimientos</TabsTrigger>
          <TabsTrigger value="graficos">📈 Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <CajaResumenTab 
            caja={caja} 
            totalIngresos={totalIngresos} 
            totalEgresos={totalEgresos} 
          />
        </TabsContent>

        <TabsContent value="control">
          <CajaControlTab
            caja={caja}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            guardando={guardando}
            onAddMovimiento={() => setRecargarMovs(m => m + 1)}
          />
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-4">
          {/* Agregar movimiento - Solo si la caja está abierta */}
          {caja.estado === 'ABIERTA' && (
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nuevo Movimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <MovimientoCajaAdd cajaId={caja.id} onAdd={() => setRecargarMovs(m => m + 1)} />
              </CardContent>
            </Card>
          )}

          {/* Historial de movimientos */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos ({movs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <MovimientoCajaHistorial cajaId={caja.id} movimientos={movs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total Ingresos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">${totalIngresos.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total Egresos</p>
                <p className="text-3xl font-bold text-red-600 mt-2">${totalEgresos.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <GraficoIngresosEgresos cajaId={caja.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}