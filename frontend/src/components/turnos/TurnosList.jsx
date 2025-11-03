// frontend/src/components/turnos/TurnosList.jsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Users, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const TurnosList = ({ userRole, refresh, onEditar }) => {
  const [turnos, setTurnos] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchTurnos() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/turnos/", { credentials:'include' });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setTurnos(data);
      } catch {
        setMsg("Error obteniendo turnos");
      }
    }
    fetchTurnos();
  }, [refresh]);

  if (msg) {
    return <Card><CardContent><p className="text-red-500">{msg}</p></CardContent></Card>;
  }

  return (
    <Card className="mt-4 border-2 border-cyan-700 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-cyan-500" />
          <CardTitle className="text-2xl text-cyan-700">Turnos disponibles</CardTitle>
        </div>
        <CardDescription>Visualizá y gestioná los turnos recientes</CardDescription>
      </CardHeader>
      <CardContent>
        <Separator className="mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {turnos.length === 0 && <p className="text-gray-500">No hay turnos disponibles.</p>}
          {turnos.map((t) => (
            <Card key={t.id} className="bg-white border border-gray-200 rounded-xl shadow-sm mb-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-indigo-600">Fecha: {t.hora_inicio}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Hora fin: {t.hora_fin}
                </CardDescription>
                <Separator className="my-1" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-gray-700">Socio:</span>
                    <span className="text-gray-800">{t.socio_nombre}</span>
                  </div>
                  <span className="font-semibold text-gray-700">Estado:</span>
                  <span className="text-gray-800">{t.estado}</span>
                </div>
                {/* Botón editar solo para admin/entrenador */}
                {["ADMIN", "admin", "ENTRENADOR", "entrenador"].includes(userRole) && (
                  <Button
                    variant="outline"
                    className="mt-3 flex items-center gap-1"
                    onClick={() => onEditar(t)}
                  >
                    <Pencil className="h-4 w-4 text-indigo-700" />
                    Editar
                  </Button>
                )}
                {/* Botones para socios */}
                {userRole === "SOCIO" && t.estado === "PENDIENTE" && !t.socio &&
                  <button className="mt-3 px-3 py-1 bg-cyan-700 text-white rounded hover:bg-cyan-800"
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://127.0.0.1:8000/api/turnos/${t.id}/reservar/`, {
                          method: "POST", credentials:'include', headers: { "Content-Type": "application/json" }
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.detail || "No se pudo reservar");
                        alert("Turno reservado correctamente.");
                      } catch (err) { alert(err.message); }
                    }}
                  >Reservar</button>
                }
                {userRole === "SOCIO" && t.socio_nombre === "Cupo Libre" && t.estado === "CONFIRMADO" &&
                  <button className="mt-3 px-3 py-1 bg-orange-700 text-white rounded hover:bg-orange-800"
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://127.0.0.1:8000/api/turnos/${t.id}/cancelar/`, {
                          method: "POST", credentials:'include', headers: { "Content-Type": "application/json" }
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.detail || "No se pudo cancelar");
                        alert("Turno cancelado correctamente.");
                      } catch (err) { alert(err.message); }
                    }}
                  >Cancelar reserva</button>
                }
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TurnosList;
