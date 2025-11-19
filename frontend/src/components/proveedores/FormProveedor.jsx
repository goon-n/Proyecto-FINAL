import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const FormProveedor = ({ open, onClose, onSubmit, proveedorEditar = null, guardando, proveedoresExistentes = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (proveedorEditar) {
      setFormData({
        nombre: proveedorEditar.nombre || '',
        telefono: proveedorEditar.telefono || '',
        email: proveedorEditar.email || '',
      });
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
      });
    }
    setErrores({});
  }, [proveedorEditar, open]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar nombre (obligatorio, solo letras y espacios)
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios';
    } else {
      // Validar duplicado de nombre
      const nombreExiste = proveedoresExistentes.some(
        proveedor => 
          proveedor.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim() &&
          proveedor.id !== proveedorEditar?.id // Excluir el proveedor que se está editando
      );
      if (nombreExiste) {
        nuevosErrores.nombre = 'Ya existe un proveedor con ese nombre';
      }
    }

    // Validar teléfono (opcional, pero si tiene valor debe ser válido)
    if (formData.telefono) {
      if (!/^[\d\s\-\+\(\)]+$/.test(formData.telefono)) {
        nuevosErrores.telefono = 'El teléfono solo puede contener números, espacios, guiones, paréntesis y +';
      } else {
        const digitos = formData.telefono.replace(/\D/g, '');
        if (digitos.length < 8) {
          nuevosErrores.telefono = 'El teléfono debe tener al menos 8 dígitos';
        } else if (digitos.length > 15) {
          nuevosErrores.telefono = 'El teléfono no puede tener más de 15 dígitos';
        }
      }
    }

    // Validar email (opcional, pero si tiene valor debe ser válido)
    if (formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nuevosErrores.email = 'Email inválido';
      } else {
        // Validar duplicado de email
        const emailExiste = proveedoresExistentes.some(
          proveedor => 
            proveedor.email && 
            proveedor.email.toLowerCase().trim() === formData.email.toLowerCase().trim() &&
            proveedor.id !== proveedorEditar?.id // Excluir el proveedor que se está editando
        );
        if (emailExiste) {
          nuevosErrores.email = 'Ya existe un proveedor con ese email';
        }
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSubmit(formData);
    }
  };

  const handleChange = (campo, valor) => {
    // Filtrado en tiempo real para el nombre (solo letras y espacios)
    if (campo === 'nombre') {
      valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    
    // Filtrado en tiempo real para el teléfono (solo números y símbolos válidos)
    if (campo === 'telefono') {
      valor = valor.replace(/[^\d\s\-\+\(\)]/g, '');
    }

    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Limpiar error del campo al escribir
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
            <DialogDescription>
              {proveedorEditar 
                ? 'Modifica los datos del proveedor' 
                : 'Completa los datos del nuevo proveedor'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* NOMBRE */}
            <div className="grid gap-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Proveedor XYZ"
                className={errores.nombre ? 'border-destructive' : ''}
                maxLength={100}
              />
              {errores.nombre && (
                <p className="text-sm text-destructive">{errores.nombre}</p>
              )}
            </div>

            {/* TELÉFONO */}
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="Ej: +54 387 123-4567"
                className={errores.telefono ? 'border-destructive' : ''}
                maxLength={20}
              />
              {errores.telefono && (
                <p className="text-sm text-destructive">{errores.telefono}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mínimo 8 dígitos, máximo 15 dígitos
              </p>
            </div>

            {/* EMAIL */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Ej: proveedor@ejemplo.com"
                className={errores.email ? 'border-destructive' : ''}
              />
              {errores.email && (
                <p className="text-sm text-destructive">{errores.email}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                proveedorEditar ? 'Guardar Cambios' : 'Crear Proveedor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormProveedor;