import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  CalendarCheck
} from "lucide-react";

const HistorialAsistencias = ({ turnosHistorial }) => {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  if (turnosHistorial.length === 0) return null;

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-t-4 border-t-green-500">
      <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg" onClick={() => setMostrarHistorial(!mostrarHistorial)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <History className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Historial de Asistencias</CardTitle>
              <CardDescription>Turnos completados ({turnosHistorial.length})</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {mostrarHistorial ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {mostrarHistorial && (
        <CardContent>
          <div className="space-y-3">
            {turnosHistorial.map((turno) => (
              <div 
                key={turno.id}
                className="flex items-start space-x-4 rounded-lg border border-green-200 bg-green-50/50 p-4 hover:bg-green-100/50 transition-colors"
              >
                <div className="mt-1 p-2 rounded-full bg-green-100">
                  <CalendarCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      Entrenamiento
                    </p>
                    <Badge className="text-xs bg-green-600">
                      ✓ Completado
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(turno.hora_inicio).toLocaleDateString('es-AR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })} - {new Date(turno.hora_inicio).toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default HistorialAsistencias;