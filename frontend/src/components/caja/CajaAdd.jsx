import React, { useState } from "react";
import { createCaja } from "../../services/caja.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function CajaAdd({ onChange, onAbrirCaja }) {  // ← Agregar onAbrirCaja
  const [monto_inicial, setMontoInicial] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!monto_inicial || Number(monto_inicial) <= 0) {
      toast.error("El monto inicial debe ser mayor a 0");
      return;
    }

    setGuardando(true);
    try {
      const response = await createCaja({ monto_inicial: Number(monto_inicial) });
      setMontoInicial("");
      toast.success("Caja abierta correctamente");
      
      // Redirigir automáticamente a gestionar la caja recién creada
      if (onAbrirCaja && response.data?.id) {
        onAbrirCaja(response.data.id);  // ← Llamar al callback con el ID
      } else if (onChange) {
        onChange();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al abrir la caja");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abrir Nueva Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="monto_inicial">Monto Inicial *</Label>
            <Input
              id="monto_inicial"
              type="number"
              step="0.01"
              value={monto_inicial}
              onChange={e => setMontoInicial(e.target.value)}
              placeholder="Ej: 5000.00"
              disabled={guardando}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <Button type="submit" disabled={guardando}>
            {guardando ? "Abriendo..." : "Abrir Caja"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}