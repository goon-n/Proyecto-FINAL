// frontend/src/components/turnos/MisTurnosResumen.jsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle,
  CheckCircle2,
  Loader2,
  CalendarClock,
  Plus,
  Calendar,
  ArrowRight,
  Clock
} from "lucide-react";
import api from "../../api/api";

const MisTurnosResumen = ({ navigate }) => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarMisTurnos();
  }, []);

  const cargarMisTurnos = async () => {
    try {
      setLoading(true);
      
      // 🔥 AQUÍ VA TU LLAMADA REAL A LA API
      // Debes crear este endpoint en tu backend o usar uno existente
      const data = await api.obtenerMisTurnos(); // Crea esta función en api.js
      
      // Filtrar solo turnos futuros y ordenar por fecha
      const ahora = new Date();
      const turnosFuturos = data
        .filter(turno => {
          const fechaHora = new Date(`${turno.hora_inicio}`);
          return fechaHora > ahora && 
                 (turno.estado === 'CONFIRMADO' || turno.estado === 'RESERVADO');
        })
        .sort((a, b) => new Date(a.hora_inicio) - new Date(b.hora_inicio))
        .slice(0, 3); // Mostrar solo los próximos 3 turnos
      
      setTurnos(turnosFuturos);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
      setError("Error al cargar tus turnos");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    const date = new Date(fechaISO);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  };

  const formatearHora = (fechaISO) => {
    const date = new Date(fechaISO);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
        <p className="text-muted-foreground">Cargando tus turnos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (turnos.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarClock className="h-16 w-16 mx-auto text-primary opacity-50 mb-4" />
        <p className="text-muted-foreground mb-4">
          No tienes turnos reservados próximamente
        </p>
        <Button 
          onClick={() => navigate("/socio/turnos")}
          size="lg"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Reservar un Turno
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {turnos.map((turno) => (
        <div
          key={turno.id}
          className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
            turno.estado === "CONFIRMADO"
              ? "bg-purple-50 border-purple-300"
              : "bg-indigo-50 border-indigo-300 animate-pulse"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                turno.estado === "CONFIRMADO" ? "bg-purple-200" : "bg-indigo-200"
              }`}>
                {turno.estado === "CONFIRMADO" ? (
                  <CheckCircle2 className="h-5 w-5 text-purple-700" />
                ) : (
                  <Clock className="h-5 w-5 text-indigo-700" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 capitalize">
                  {formatearFecha(turno.hora_inicio)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-sm text-gray-600">{formatearHora(turno.hora_inicio)}</span>
                  <Badge
                    variant={turno.estado === "CONFIRMADO" ? "default" : "secondary"}
                    className={turno.estado === "CONFIRMADO" ? "bg-purple-600" : "bg-indigo-600"}
                  >
                    {turno.estado === "CONFIRMADO" ? "Confirmado" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <Separator className="my-4" />
      
      <Button 
        onClick={() => navigate("/socio/turnos")}
        className="w-full"
        variant="outline"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Ver Todos mis Turnos
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default MisTurnosResumen;