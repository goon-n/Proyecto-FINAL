// src/components/cuotas/RenovarMembresia.jsx - CORREGIDO

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  TrendingUp 
} from "lucide-react";
import api from "../../api/api";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ModalPagoTarjeta from "../caja/ModalPagoTarjeta"; // ✅ IMPORTAR EL MODAL


const RenovarMembresia = ({ open, onClose, cuotaActual, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorPlanes, setErrorPlanes] = useState(null); 
  const [modalTarjetaAbierto, setModalTarjetaAbierto] = useState(false); // ✅ NUEVO
  
  // Estados para la selección de plan
  const [planes, setPlanes] = useState([]);
  const planActualId = cuotaActual?.plan || cuotaActual?.plan_info?.id;
  const [planSeleccionadoId, setPlanSeleccionadoId] = useState(planActualId);

  useEffect(() => {
    if (open) {
      // Cargar planes activos
      const fetchPlanes = async () => {
        try {
          const data = await api.listarPlanesActivos();
          setPlanes(data);
          setErrorPlanes(null);
        } catch (err) {
          console.error("Error al cargar planes:", err);
          setErrorPlanes("No se pudieron cargar los planes disponibles para el cambio.");
        }
      };

      fetchPlanes();
      setPlanSeleccionadoId(planActualId); 
    }
  }, [open, planActualId]);

  const planElegido = planes.find(p => p.id === planSeleccionadoId) || cuotaActual?.plan_info;
  const precioFinal = planElegido?.precio || cuotaActual?.plan_precio;

  // ✅ NUEVA FUNCIÓN: Abrir modal de tarjeta
  const handleAbrirModalTarjeta = () => {
    setModalTarjetaAbierto(true);
  };

  // ✅ NUEVA FUNCIÓN: Procesar pago con tarjeta
  const handlePagoTarjeta = async (datosTarjeta) => {
    setModalTarjetaAbierto(false);
    setLoading(true);

    try {
      const isPlanChanged = planSeleccionadoId !== planActualId;

      const data = {
        metodo_pago: 'tarjeta',
        tarjeta_ultimos_4: datosTarjeta.ultimos4,
        ...(isPlanChanged && { plan_id: planSeleccionadoId })
      };

      console.log("📤 Enviando renovación (Socio - Tarjeta):", data);

      const response = await api.solicitarRenovacion(data); 

      toast.success(response.detail || "¡Renovación exitosa!");
      
      onSuccess && onSuccess(response);
      onClose();
    } catch (error) {
      console.error("Error al renovar:", error);
      const mensaje = error.response?.data?.detail || "Error al procesar la renovación";
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  if (!cuotaActual) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Renovar Membresía y Cambiar Plan
            </DialogTitle>
            <DialogDescription>
              Renueva tu plan actual o selecciona uno nuevo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            
            {/* Selector de Plan */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                  <TrendingUp className="h-5 w-5"/>
                  Selección de Plan
              </h3>
              {errorPlanes ? (
                   <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorPlanes}</AlertDescription>
                  </Alert>
              ) : (
                  <Select 
                      value={String(planSeleccionadoId)} 
                      onValueChange={(value) => setPlanSeleccionadoId(Number(value))}
                      disabled={loading || planes.length === 0}
                  >
                      <SelectTrigger>
                          <SelectValue placeholder="Selecciona un plan" />
                      </SelectTrigger>
                      <SelectContent>
                          {planes.map((plan) => (
                              <SelectItem key={plan.id} value={String(plan.id)}>
                                  {plan.nombre} - {formatearPrecio(plan.precio)}
                                  {plan.id === planActualId && " (Actual)"}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              )}
            </div>

            {/* Información de Pago */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                💳 Solo se acepta pago con tarjeta para renovaciones en línea.
              </AlertDescription>
            </Alert>

            {/* Resumen del Pago */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Resumen de Renovación</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-semibold">{planElegido?.nombre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método de pago:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      Tarjeta
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total a pagar:</span>
                    <span className="text-blue-600">
                      {formatearPrecio(precioFinal)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAbrirModalTarjeta}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Pagar con Tarjeta
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ MODAL DE PAGO CON TARJETA */}
      <ModalPagoTarjeta
        isOpen={modalTarjetaAbierto}
        onClose={() => setModalTarjetaAbierto(false)}
        onSubmit={handlePagoTarjeta}
        monto={precioFinal}
        descripcion={`Renovación - ${planElegido?.nombre || 'Plan actual'}`}
      />
    </>
  );
};

export default RenovarMembresia;