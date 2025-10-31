import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CrearTurno = ({ userRole, onTurnoCreado, onCancel }) => {
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [capacidad, setCapacidad] = useState(10);
  const [estado, setEstado] = useState("PENDIENTE");
  const [msg, setMsg] = useState("");

  // Asegura que userRole es válido
  if (!["ADMIN", "admin", "ENTRENADOR", "entrenador"].includes(userRole)) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/turnos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          capacidad,
          estado
        }),
      });
      if (!response.ok) throw new Error("Error al crear turno");
      setMsg("Turno creado correctamente.");
      setHoraInicio("");
      setHoraFin("");
      setCapacidad(10);
      setEstado("PENDIENTE");
      if (onTurnoCreado) onTurnoCreado();
    } catch {
      setMsg("Error al crear turno");
    }
  };

  return (
    <Card className="mb-7 border-cyan-600">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-6 w-6 text-cyan-600" />
          <CardTitle className="text-xl text-cyan-800">Nuevo Turno</CardTitle>
        </div>
        <CardDescription>Completá los datos para agregar un cupo de turno</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="datetime-local"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
            <input
              type="datetime-local"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
            <input
              type="number"
              value={capacidad}
              min={1}
              max={50}
              onChange={(e) => setCapacidad(Number(e.target.value))}
              className="border rounded px-3 py-2 w-full"
              required
              placeholder="Capacidad"
            />
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded"
            >
              Crear Turno
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="text-gray-700"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
        {msg && (
          <p className={`mt-2 ${msg.includes("correctamente") ? "text-green-600" : "text-red-600"}`}>
            {msg}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CrearTurno;
