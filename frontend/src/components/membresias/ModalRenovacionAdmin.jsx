// src/components/membresias/ModalRenovacionAdmin.jsx

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Wallet,
  Landmark,
  CreditCard,
} from "lucide-react";
import api from "../../api/api";
import { formatearPrecio } from "./utils/membresiaHelpers";

const ModalRenovacionAdmin = ({ open, onClose, cuota, onSuccess, onOpenTarjeta }) => {
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [planes, setPlanes] = useState([]);
  const [planSeleccionadoId, setPlanSeleccionadoId] = useState(null);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [cambioPlan, setCambioPlan] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    if (open && cuota) {
      cargarPlanes();
      setPlanSeleccionadoId(cuota.plan);
      setCambioPlan(false);
      setErrorModal(null);
      setMetodoPago("efectivo");
    }
  }, [open, cuota]);

  const cargarPlanes = async () => {
    try {
      setLoadingPlanes(true);
      const data = await api.listarPlanesActivos();
      setPlanes(data);
    } catch (error) {
      console.error("Error al cargar planes:", error);
      toast.error("Error al cargar los planes disponibles");
    } finally {
      setLoadingPlanes(false);
    }
  };

  if (!cuota) return null;

  const planActualId = cuota.plan;
  const planNuevo = planes.find(p => p.id === planSeleccionadoId);
  const esCambioPlan = cambioPlan && planSeleccionadoId !== planActualId;
  const montoAPagar = planNuevo ? planNuevo.precio : cuota.plan_precio;

  const handleRenovar = async () => {
    // Si es tarjeta, abrir modal de tarjeta y cerrar este modal
    if (metodoPago === 'tarjeta') {
      onOpenTarjeta({
        cuota,
        montoAPagar,
        esCambioPlan,
        planSeleccionadoId,
        planNuevo
      });
      onClose();
      return;
    }

    // Efectivo o Transferencia
    setErrorModal(null);
    setLoading(true);

    try {
      const data = {
        metodo_pago: metodoPago,
        monto: montoAPagar,
        ...(esCambioPlan && { plan_id: planSeleccionadoId }),
        referencia: ''
      };

      console.log("📤 Enviando renovación (Admin/Coach):", data);
      
      await api.renovarCuota(cuota.id, data);
      
      const planFinalNombre = esCambioPlan ? planNuevo.nombre : cuota.plan_nombre;
      toast.success(`Cuota de ${cuota.socio_username} renovada. Plan: ${planFinalNombre}.`);
      
      onClose();
      onSuccess();
      
    } catch (error) {
      console.error("❌ Error al renovar cuota:", error);
      setErrorModal(error.response?.data?.detail || "Error al renovar la cuota mensual");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <RefreshCw className="h-6 w-6 text-blue-600" />
            Renovar Cuota Mensual
          </DialogTitle>
          <DialogDescription className="text-base">
            Registrar pago y renovar la cuota para: <strong>{cuota.socio_username}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {errorModal && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorModal}</AlertDescription>
            </Alert>
          )}

          {/* Toggle para cambio de plan */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">¿El socio solicitó cambio de plan?</p>
                <p className="text-sm text-blue-700">Actual: {cuota.plan_nombre}</p>
              </div>
            </div>
            <Button
              variant={cambioPlan ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCambioPlan(!cambioPlan);
                if (!cambioPlan) {
                  setPlanSeleccionadoId(cuota.plan);
                }
              }}
            >
              {cambioPlan ? "No, mantener plan" : "Sí, cambiar plan"}
            </Button>
          </div>

          {/* Selector de Plan */}
          {cambioPlan && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Seleccionar nuevo plan</Label>
              {loadingPlanes ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <Select 
                  value={planSeleccionadoId?.toString()} 
                  onValueChange={(value) => setPlanSeleccionadoId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{plan.nombre}</span>
                          <span className="ml-4 font-semibold text-green-600">
                            {formatearPrecio(plan.precio)}
                            {plan.id === planActualId && " (Actual)"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Resumen */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan {esCambioPlan ? "nuevo" : "actual"}:</span>
                <span className="font-semibold">
                  {esCambioPlan ? planNuevo?.nombre : cuota.plan_nombre}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="text-muted-foreground">Monto a Pagar:</span>
                <span className="font-bold text-green-600">
                  {formatearPrecio(montoAPagar)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Método de Pago */}
          <div className="space-y-2">
            <Label htmlFor="metodo-pago" className="text-base font-semibold">
              Método de Pago
            </Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger id="metodo-pago">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">
                  <Wallet className="inline h-4 w-4 mr-2" />
                  💵 Efectivo
                </SelectItem>
                <SelectItem value="transferencia">
                  <Landmark className="inline h-4 w-4 mr-2" />
                  🏦 Transferencia
                </SelectItem>
                <SelectItem value="tarjeta">
                  <CreditCard className="inline h-4 w-4 mr-2" />
                  💳 Tarjeta
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleRenovar} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Pago {esCambioPlan && "y Cambio de Plan"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalRenovacionAdmin;