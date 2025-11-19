// src/components/accesorios/AccesoriosAdd.jsx
import React, { useState, useEffect } from "react";
import { createAccesorio, getProveedores, getAccesorios } from "../../services/accesorios.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function AccesoriosAdd({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    proveedor: "",
    stock: 0,
    activo: true
  });
  const [proveedores, setProveedores] = useState([]);
  const [accesoriosExistentes, setAccesoriosExistentes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProveedores, resAccesorios] = await Promise.all([
          getProveedores(),
          getAccesorios()
        ]);
        setProveedores(resProveedores.data);
        setAccesoriosExistentes(resAccesorios.data);
      } catch (error) {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleProveedorChange = (value) => {
    setFormData(prev => ({ ...prev, proveedor: value }));
    // Limpiar error del proveedor cuando cambia
    if (errors.proveedor) {
      setErrors(prev => ({ ...prev, proveedor: null }));
    }
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

    // Validación: verificar si ya existe el accesorio con el mismo proveedor
    const nombreBuscar = formData.nombre.trim().toLowerCase();
    const proveedorId = parseInt(formData.proveedor);
    
    const yaExiste = accesoriosExistentes.some(acc => 
      acc.nombre.toLowerCase() === nombreBuscar && 
      acc.proveedor === proveedorId
    );

    if (yaExiste) {
      setErrors({ 
        nombre: "Ya existe un accesorio con ese nombre"
      });
      return;
    }

    setGuardando(true);
    setErrors({}); // Limpiar errores previos
    
    try {
      const dataToSend = {
        ...formData,
        proveedor: parseInt(formData.proveedor), // Asegurar que sea número
        stock: parseInt(formData.stock) || 0
      };
      
      const response = await createAccesorio(dataToSend);
      toast.success("Accesorio creado correctamente");
      
      // Limpiar formulario
      setFormData({
        nombre: "",
        descripcion: "",
        proveedor: "",
        stock: 0,
        activo: true
      });
      
      if (onAdd) onAdd();
    } catch (error) {
      // Manejar errores de validación del backend
      if (error.response?.data?.error) {
        // Error de duplicado
        setErrors({ 
          nombre: error.response.data.error
        });
      } else {
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.detail ||
                        "Error al crear accesorio";
        toast.error(errorMsg);
      }
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando formulario...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Agregar Nuevo Accesorio
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
                className={errors.nombre ? "border-red-500" : ""}
                required
              />
              {errors.nombre && (
                <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>
              )}
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
              <Label htmlFor="stock">Stock Inicial</Label>
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
              {guardando ? "Guardando..." : "Crear Accesorio"}
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