// src/components/membresias/ModalEditarPrecios.jsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertCircle, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/api";
import TarjetaPlan from "./TarjetaPlan";

const ModalEditarPrecios = ({ open, onClose, onSuccess }) => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [preciosEditados, setPreciosEditados] = useState({});

  useEffect(() => {
    if (open) {
      cargarPlanes();
    }
  }, [open]);

  const cargarPlanes = async () => {
    setLoading(true);
    try {
      const data = await api.listarPlanes();
      setPlanes(data);
      
      // Inicializar precios editados con los valores actuales
      const preciosIniciales = {};
      data.forEach(plan => {
        preciosIniciales[plan.id] = plan.precio;
      });
      setPreciosEditados(preciosIniciales);
    } catch (error) {
      console.error("Error al cargar planes:", error);
      toast.error("Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  const handlePrecioChange = (planId, nuevoPrecio) => {
    setPreciosEditados(prev => ({
      ...prev,
      [planId]: nuevoPrecio
    }));
  };

  const handleGuardar = async () => {
    // Validar que todos los precios sean válidos
    const preciosInvalidos = Object.entries(preciosEditados).some(([_, precio]) => {
      const num = parseFloat(precio);
      return isNaN(num) || num <= 0;
    });

    if (preciosInvalidos) {
      toast.error("Todos los precios deben ser números positivos");
      return;
    }

    setGuardando(true);
    try {
      // Actualizar cada plan que haya cambiado de precio
      const promesas = planes.map(async (plan) => {
        const nuevoPrecio = parseFloat(preciosEditados[plan.id]);
        const precioActual = parseFloat(plan.precio);
        
        if (nuevoPrecio !== precioActual) {
          return api.actualizarPrecioPlan(plan.id, nuevoPrecio);
        }
        return null;
      });

      await Promise.all(promesas);
      
      toast.success("✅ Precios actualizados correctamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al actualizar precios:", error);
      toast.error(error.response?.data?.detail || "Error al actualizar los precios");
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrar = () => {
    if (guardando) return;
    setPreciosEditados({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6 text-green-600" />
            Editar Precios de Planes
          </DialogTitle>
          <DialogDescription>
            Modifica los precios de los planes de membresía. Los cambios se aplicarán para nuevas suscripciones.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Cargando planes...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Los precios actualizados solo afectarán a las <strong>nuevas suscripciones y renovaciones</strong>. 
                Las membresías activas mantendrán su precio original.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planes.map((plan) => (
                <div key={plan.id} className="space-y-3">
                  {/* Vista previa del plan */}
                  <TarjetaPlan plan={plan} />
                  
                  {/* Input de precio */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <Label htmlFor={`precio-${plan.id}`} className="text-sm font-medium">
                      Nuevo precio (ARS)
                    </Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id={`precio-${plan.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={preciosEditados[plan.id] || ""}
                        onChange={(e) => handlePrecioChange(plan.id, e.target.value)}
                        className="pl-9"
                        placeholder="0.00"
                        disabled={guardando}
                      />
                    </div>
                    {parseFloat(preciosEditados[plan.id]) !== parseFloat(plan.precio) && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Precio modificado: ${plan.precio} → ${preciosEditados[plan.id]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCerrar}
                disabled={guardando}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleGuardar}
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditarPrecios;