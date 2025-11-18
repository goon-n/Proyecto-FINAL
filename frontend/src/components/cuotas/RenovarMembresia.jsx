// src/components/cuotas/RenovarMembresia.jsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import api from "../../api/api";
import toast from "react-hot-toast";

const RenovarMembresia = ({ open, onClose, cuotaActual, onSuccess }) => {
  const [planes, setPlanes] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [tarjetaNumero, setTarjetaNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  useEffect(() => {
    if (open) {
      cargarPlanes();
      // Por defecto, seleccionar el plan actual
      if (cuotaActual?.plan) {
        setPlanSeleccionado(cuotaActual.plan);
      }
    }
  }, [open, cuotaActual]);

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

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!planSeleccionado) {
      toast.error("Debes seleccionar un plan");
      return;
    }

    if (metodoPago === "tarjeta" && tarjetaNumero.replace(/\s/g, '').length !== 16) {
      toast.error("El número de tarjeta debe tener 16 dígitos");
      return;
    }

    setLoading(true);

    try {
      const ultimos4 = metodoPago === "tarjeta" 
        ? tarjetaNumero.replace(/\s/g, '').slice(-4) 
        : '';

      const data = {
        plan_id: planSeleccionado,
        metodo_pago: metodoPago,
        tarjeta_ultimos_4: ultimos4
      };

      const response = await api.solicitarRenovacion(data);

      toast.success(response.detail || "¡Renovación exitosa!");
      
      if (response.cambio_plan) {
        toast.success(`Has cambiado de ${response.plan_anterior} a ${response.plan_nuevo}`, {
          duration: 5000
        });
      }

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

  const planActualId = cuotaActual?.plan;
  const planSeleccionadoData = planes.find(p => p.id === planSeleccionado);
  const esCambioPlan = planSeleccionado && planSeleccionado !== planActualId;

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Renovar Membresía
          </DialogTitle>
          <DialogDescription>
            Elige tu plan y método de pago para renovar tu membresía
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Selección de Plan */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Selecciona tu plan</Label>
            
            {loadingPlanes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <RadioGroup
                value={planSeleccionado?.toString()}
                onValueChange={(value) => setPlanSeleccionado(parseInt(value))}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planes.map((plan) => {
                    const esActual = plan.id === planActualId;
                    const esSeleccionado = plan.id === planSeleccionado;

                    return (
                      <Card 
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          esSeleccionado 
                            ? 'border-2 border-blue-600 shadow-lg' 
                            : 'border-2 border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPlanSeleccionado(plan.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <RadioGroupItem value={plan.id.toString()} id={`plan-${plan.id}`} />
                                <h3 className="font-bold text-lg">{plan.nombre}</h3>
                              </div>
                              <p className="text-sm text-gray-600">{plan.frecuencia}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                {formatearPrecio(plan.precio)}
                              </p>
                              <p className="text-xs text-gray-500">por mes</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {esActual && (
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                Plan Actual
                              </Badge>
                            )}
                            {plan.es_popular && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                ⭐ Popular
                              </Badge>
                            )}
                          </div>

                          {plan.features && plan.features.length > 0 && (
                            <ul className="space-y-1">
                              {plan.features.slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Alerta de cambio de plan */}
          {esCambioPlan && (
            <Alert className="bg-blue-50 border-blue-200">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Vas a cambiar tu plan de <strong>{cuotaActual?.plan_nombre}</strong> a{" "}
                <strong>{planSeleccionadoData?.nombre}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Método de Pago */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Método de pago</Label>
            
            <RadioGroup value={metodoPago} onValueChange={setMetodoPago}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer ${metodoPago === 'tarjeta' ? 'border-2 border-blue-600' : 'border-2 border-gray-200'}`}
                  onClick={() => setMetodoPago('tarjeta')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <RadioGroupItem value="tarjeta" id="tarjeta" />
                    <Label htmlFor="tarjeta" className="cursor-pointer flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Tarjeta
                    </Label>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer ${metodoPago === 'transferencia' ? 'border-2 border-blue-600' : 'border-2 border-gray-200'}`}
                  onClick={() => setMetodoPago('transferencia')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <RadioGroupItem value="transferencia" id="transferencia" />
                    <Label htmlFor="transferencia" className="cursor-pointer flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Transferencia
                    </Label>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer ${metodoPago === 'efectivo' ? 'border-2 border-blue-600' : 'border-2 border-gray-200'}`}
                  onClick={() => setMetodoPago('efectivo')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <RadioGroupItem value="efectivo" id="efectivo" />
                    <Label htmlFor="efectivo" className="cursor-pointer flex items-center gap-2">
                      💵 Efectivo
                    </Label>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>

            {/* Campos de tarjeta */}
            {metodoPago === "tarjeta" && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="numero-tarjeta">Número de tarjeta</Label>
                  <Input
                    id="numero-tarjeta"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={tarjetaNumero}
                    onChange={(e) => setTarjetaNumero(formatCardNumber(e.target.value))}
                    maxLength="19"
                    required={metodoPago === "tarjeta"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resumen */}
          {planSeleccionadoData && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Resumen de renovación</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Plan seleccionado:</span>
                    <span className="font-semibold">{planSeleccionadoData.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método de pago:</span>
                    <span className="font-semibold capitalize">{metodoPago}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total a pagar:</span>
                    <span className="text-blue-600">{formatearPrecio(planSeleccionadoData.precio)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              type="submit"
              disabled={loading || !planSeleccionado}
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
                  Confirmar Renovación
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenovarMembresia;