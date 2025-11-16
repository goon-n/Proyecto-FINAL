import React, { useState } from "react";
import { createMovimiento } from "../../services/movimientoCaja.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function MovimientoCajaAdd({ cajaId, onAdd }) {
  const [tipo, setTipo] = useState("ingreso");
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!monto || Number(monto) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    setGuardando(true);
    try {
      await createMovimiento({
        caja: cajaId,
        tipo,
        tipo_pago: tipoPago,
        monto: Number(monto),
        descripcion
      });
      
      // Limpiar formulario
      setMonto("");
      setDescripcion("");
      toast.success("Movimiento registrado");
      
      if (onAdd) onAdd();
    } catch (error) {
      toast.error("Error al registrar el movimiento");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Movimiento */}
        <div>
          <Label htmlFor="tipo">Tipo de Movimiento *</Label>
          <select
            id="tipo"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={guardando}
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>

        {/* Tipo de Pago */}
        <div>
          <Label htmlFor="tipoPago">Tipo de Pago *</Label>
          <select
            id="tipoPago"
            value={tipoPago}
            onChange={e => setTipoPago(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={guardando}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta" disabled>Tarjeta (Próximamente)</option>
          </select>
        </div>

        {/* Monto */}
        <div>
          <Label htmlFor="monto">Monto *</Label>
          <Input
            id="monto"
            type="number"
            step="0.01"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder="0.00"
            disabled={guardando}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Descripción */}
        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Concepto del movimiento..."
            disabled={guardando}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={guardando}>
          {guardando ? "Registrando..." : "Registrar Movimiento"}
        </Button>
      </div>
    </form>
  );
}