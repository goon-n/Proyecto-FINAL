// src/components/accesorios/ModalCrearReporte.jsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, FileWarning, Loader2 } from "lucide-react";
import { crearReporteAccesorio, getAccesorios } from "../../services/accesorios.service";
import toast from "react-hot-toast";

const ModalCrearReporte = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [accesorios, setAccesorios] = useState([]);
  const [loadingAccesorios, setLoadingAccesorios] = useState(true);
  
  const [formData, setFormData] = useState({
    accesorio: "",
    cantidad: 1,
    motivo: "faltante",
    descripcion: ""
  });

  useEffect(() => {
    if (open) {
      cargarAccesorios();
      resetForm();
    }
  }, [open]);

  const cargarAccesorios = async () => {
    try {
      setLoadingAccesorios(true);
      const response = await getAccesorios();
      // Solo mostrar accesorios activos
      const accesoriosActivos = response.data.filter(acc => acc.activo);
      setAccesorios(accesoriosActivos);
    } catch (error) {
      toast.error("Error al cargar accesorios");
    } finally {
      setLoadingAccesorios(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accesorio: "",
      cantidad: 1,
      motivo: "faltante",
      descripcion: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.accesorio) {
      toast.error("Debes seleccionar un accesorio");
      return;
    }

    if (formData.cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    if (!formData.descripcion.trim()) {
      toast.error("Debes agregar una descripción del problema");
      return;
    }

    setLoading(true);

    try {
      await crearReporteAccesorio({
        accesorio: parseInt(formData.accesorio),
        cantidad: parseInt(formData.cantidad),
        motivo: formData.motivo,
        descripcion: formData.descripcion.trim()
      });

      toast.success("Reporte creado exitosamente");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.detail || 
                      "Error al crear el reporte";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const motivosOpciones = [
    { value: "faltante", label: "Faltante" },
    { value: "roto", label: "Roto/Dañado" },
    { value: "extraviado", label: "Extraviado" },
    { value: "otro", label: "Otro" }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileWarning className="h-5 w-5 text-orange-600" />
            Reportar Problema con Accesorio
          </DialogTitle>
          <DialogDescription>
            Completa los detalles del problema para notificar al administrador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleccionar Accesorio */}
          <div className="space-y-2">
            <Label htmlFor="accesorio">Accesorio *</Label>
            {loadingAccesorios ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <Select 
                value={formData.accesorio} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, accesorio: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un accesorio" />
                </SelectTrigger>
                <SelectContent>
                  {accesorios.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>
                      {acc.nombre} - Stock: {acc.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData(prev => ({ ...prev, cantidad: e.target.value }))}
                required
              />
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo *</Label>
              <Select 
                value={formData.motivo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, motivo: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {motivosOpciones.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción del Problema *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe detalladamente qué sucedió con el accesorio..."
              rows={4}
              required
            />
          </div>

          {/* Alerta informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">¿Qué sucede después?</p>
              <p>El administrador recibirá tu reporte y podrá confirmarlo o rechazarlo. Si lo confirma, se descontará automáticamente del stock.</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando reporte...
                </>
              ) : (
                "Crear Reporte"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCrearReporte;