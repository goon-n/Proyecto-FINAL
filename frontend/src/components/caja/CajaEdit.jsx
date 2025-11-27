import React, { useEffect, useState } from "react";
import { getCaja, updateCaja } from "../../services/caja.service";
import { getMovimientos } from "../../services/movimientoCaja.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";

// Componentes
import CajaHeader from "./CajaHeader";
import CajaResumenTab from "./CajaResumenTab";
import CajaControlTab from "./CajaControlTab";
import MovimientoCajaAdd from "./MovimientoCajaAdd";
import GraficoIngresosEgresos from "./GraficoIngresosEgresos";
import MovimientoCajaHistorial from "./MovimientoCajaHistorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ModalCierreCaja from "./ModalCierreCaja";

export default function CajaEdit({ id, onGuardado }) {
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalCierreOpen, setModalCierreOpen] = useState(false);
  const [recargarMovs, setRecargarMovs] = useState(0);
  const [movs, setMovs] = useState([]);
  const [errorMovs, setErrorMovs] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar caja
        const resCaja = await getCaja(id);
        setCaja(resCaja.data);

        // Intentar cargar movimientos
        try {
          const resMovs = await getMovimientos();
          const movimientosFiltrados = resMovs.data.filter(m => m.caja === id);
          setMovs(movimientosFiltrados);
          setErrorMovs(false);
        } catch (errorMovimientos) {
          console.error("⚠️ Error al cargar movimientos:", errorMovimientos);
          setErrorMovs(true);
          setMovs([]);
          
          // Mostrar mensaje de error solo una vez
          if (errorMovimientos.response?.status === 404) {
            toast.error("El endpoint de movimientos no existe. Verifica la URL en movimientoCaja.service.js");
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar caja:", error);
        toast.error("Error al cargar la caja");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, recargarMovs]);

  const handleChange = e => {
    const { name, value } = e.target;
    setCaja(prev => ({ ...prev, [name]: value }));
  };

  const confirmarCierreCaja = async () => {
    setModalCierreOpen(false);
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
      
      toast.success("✅ Caja cerrada correctamente");
      
      if (onGuardado) {
        setTimeout(onGuardado, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al cerrar la caja");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarCierreCaja = () => {
    setModalCierreOpen(false);
    setCaja(prev => ({ ...prev, estado: 'ABIERTA' }));
    toast.info("Cierre de caja cancelado");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (caja.estado === 'CERRADA' && !caja.closing_counted_amount) {
      toast.error("Debes ingresar el efectivo contado al cerrar la caja");
      return;
    }

    if (caja.estado === 'CERRADA') {
      // Mostrar modal de confirmación
      setModalCierreOpen(true);
      return;
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
      
      toast.success(caja.estado === 'CERRADA' ? "✅ Caja cerrada correctamente" : "Caja actualizada correctamente");
      
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
      {/* Header */}
      <CajaHeader caja={caja} />

      {/* Advertencia si no se pueden cargar movimientos */}
      {errorMovs && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800">Error al cargar movimientos</p>
                <p className="text-sm text-yellow-700">
                  Verifica que la URL en <code>movimientoCaja.service.js</code> sea correcta.
                  Endpoint actual: <code>/api/movimiento-caja/</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          {!errorMovs ? (
            <>
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
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No se pueden cargar los movimientos debido a un error en el endpoint.</p>
                <p className="text-sm mt-2">Revisa la configuración de la URL en el servicio.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          {!errorMovs ? (
            <>
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
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No se pueden cargar los gráficos debido a un error en el endpoint de movimientos.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Cierre de Caja */}
      <ModalCierreCaja
        open={modalCierreOpen}
        onOpenChange={setModalCierreOpen}
        caja={caja}
        onConfirmar={confirmarCierreCaja}
        onCancelar={cancelarCierreCaja}
      />
    </div>
  );
}