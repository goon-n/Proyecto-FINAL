// src/components/accesorios/AccesoriosEdit.jsx
import React, { useState, useEffect } from "react";
import { updateAccesorio, getTodosLosProveedores, getAccesorio } from "../../services/accesorios.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";

export default function AccesoriosEdit({ accesorio, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    proveedor: "",
    stock: 0,
    activo: true
  });
  const [proveedores, setProveedores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Cargar todos los proveedores (activos e inactivos) para editar
        const resProveedores = await getTodosLosProveedores();
        setProveedores(resProveedores.data);

        // Si recibimos un accesorio por props, usarlo; si no, cargar por ID
        if (accesorio) {
          if (typeof accesorio === 'object') {
            setFormData({
              nombre: accesorio.nombre || "",
              descripcion: accesorio.descripcion || "",
              proveedor: accesorio.proveedor?.toString() || "",
              stock: accesorio.stock || 0,
              activo: accesorio.activo !== undefined ? accesorio.activo : true
            });
          } else {
            // Si accesorio es un ID, cargar los datos
            const resAccesorio = await getAccesorio(accesorio);
            const accesorioData = resAccesorio.data;
            setFormData({
              nombre: accesorioData.nombre || "",
              descripcion: accesorioData.descripcion || "",
              proveedor: accesorioData.proveedor?.toString() || "",
              stock: accesorioData.stock || 0,
              activo: accesorioData.activo !== undefined ? accesorioData.activo : true
            });
          }
        }
      } catch (error) {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    if (accesorio) {
      initializeData();
    } else {
      setLoading(false);
    }
  }, [accesorio]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProveedorChange = (value) => {
    setFormData(prev => ({ ...prev, proveedor: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    
    if (!formData.proveedor) {
      toast.error("Debe seleccionar un proveedor");
      return;
    }

    if (formData.stock < 0) {
      toast.error("El stock no puede ser negativo");
      return;
    }

    setGuardando(true);
    try {
      const dataToSend = {
        ...formData,
        proveedor: parseInt(formData.proveedor), // Asegurar que sea número
        stock: parseInt(formData.stock) || 0
      };
      
      const accesorioId = typeof accesorio === 'object' ? accesorio.id : accesorio;
      const response = await updateAccesorio(accesorioId, dataToSend);
      toast.success("Accesorio actualizado correctamente");
      
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.detail ||
                      "Error al actualizar accesorio";
      toast.error(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando datos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Editar Accesorio
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Mancuernas 5kg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor *</Label>
              <Select value={formData.proveedor} onValueChange={handleProveedorChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                      {proveedor.nombre}
                      {!proveedor.activo && " (Inactivo)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción del accesorio..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Actual</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="activo">Accesorio activo</Label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={guardando}
              className="flex-1"
            >
              {guardando ? "Guardando..." : "Actualizar Accesorio"}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={guardando}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}