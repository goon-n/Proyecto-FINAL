// src/components/cuotas/RenovarMembresia.jsx - CÓDIGO COMPLETO Y CORREGIDO PARA SOCIO

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Info,
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


const RenovarMembresia = ({ open, onClose, cuotaActual, onSuccess }) => {
  const [tarjetaNumero, setTarjetaNumero] = useState("");
  const [tarjetaTitular, setTarjetaTitular] = useState("");
  const [tarjetaVencimiento, setTarjetaVencimiento] = useState("");
  const [tarjetaCVV, setTarjetaCVV] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorPlanes, setErrorPlanes] = useState(null); 
  
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
      // Reset form cuando se abre el modal
      setTarjetaNumero("");
      setTarjetaTitular("");
      setTarjetaVencimiento("");
      setTarjetaCVV("");
    }
  }, [open, planActualId]);

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

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const planElegido = planes.find(p => p.id === planSeleccionadoId) || cuotaActual.plan_info;
  const precioFinal = planElegido?.precio || cuotaActual.plan_precio;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    const numeroLimpio = tarjetaNumero.replace(/\s/g, '');
    if (numeroLimpio.length !== 16) {
      toast.error("El número de tarjeta debe tener 16 dígitos");
      return;
    }
    if (!tarjetaTitular.trim()) {
      toast.error("Debes ingresar el nombre del titular");
      return;
    }
    if (tarjetaVencimiento.length !== 5) {
      toast.error("Formato de vencimiento inválido (MM/AA)");
      return;
    }
    if (tarjetaCVV.length !== 3 && tarjetaCVV.length !== 4) {
      toast.error("El CVV debe tener 3 o 4 dígitos");
      return;
    }

    setLoading(true);

    try {
      const ultimos4 = numeroLimpio.slice(-4);
      const isPlanChanged = planSeleccionadoId !== planActualId;

      const data = {
        metodo_pago: 'tarjeta', // Restricción de Socio
        tarjeta_ultimos_4: ultimos4, // Se envía como referencia
        ...(isPlanChanged && { plan_id: planSeleccionadoId }) // Envío del nuevo plan
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
          {/* ^^^^^^ ESTA ETIQUETA DE CIERRE ESTABA MAL ESCRITA */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
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

          {/* Datos de la Tarjeta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Datos de la Tarjeta (Único método permitido)
            </h3>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              {/* Número de Tarjeta */}
              <div>
                <Label htmlFor="numero-tarjeta">Número de Tarjeta *</Label>
                <Input
                  id="numero-tarjeta"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={tarjetaNumero}
                  onChange={(e) => setTarjetaNumero(formatCardNumber(e.target.value))}
                  maxLength="19"
                  required
                  className="text-lg tracking-wider"
                />
              </div>

              {/* Titular */}
              <div>
                <Label htmlFor="titular">Nombre del Titular *</Label>
                <Input
                  id="titular"
                  type="text"
                  placeholder="JUAN PEREZ"
                  value={tarjetaTitular}
                  onChange={(e) => setTarjetaTitular(e.target.value.toUpperCase())}
                  required
                />
              </div>

              {/* Vencimiento y CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vencimiento">Vencimiento (MM/AA) *</Label>
                  <Input
                    id="vencimiento"
                    type="text"
                    placeholder="12/25"
                    value={tarjetaVencimiento}
                    onChange={(e) => setTarjetaVencimiento(formatExpiry(e.target.value))}
                    maxLength="5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={tarjetaCVV}
                    onChange={(e) => setTarjetaCVV(e.target.value.replace(/\D/g, ''))}
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  🔒 Tus datos están seguros. No almacenamos información completa de tarjetas.
                </AlertDescription>
              </Alert>
            </div>
          </div>

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
              type="submit"
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
                  Confirmar Pago
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