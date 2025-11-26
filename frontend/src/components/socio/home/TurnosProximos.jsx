import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  PlusCircle,
  ChevronDown,
  ChevronUp,
  CalendarCheck
} from "lucide-react";

const TurnosProximos = ({ turnos, loadingTurnos, onNuevoTurno }) => {
  const [mostrarTodosTurnos, setMostrarTodosTurnos] = useState(false);

  const turnosMostrados = mostrarTodosTurnos ? turnos : turnos.slice(0, 2);
  const hayMasTurnos = turnos.length > 2;

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-t-4 border-t-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Mis Turnos</CardTitle>
              <CardDescription>Tus próximas actividades</CardDescription>
            </div>
          </div>
          <Button 
            onClick={onNuevoTurno} 
            variant="outline"
            size="sm"
            className="hidden md:flex"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Turno
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loadingTurnos ? (
           <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
              <p className="text-sm">Cargando turnos...</p>
           </div>
        ) : turnos.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {turnosMostrados.map((turno) => {
                const esConfirmado = turno.estado === 'CONFIRMADO';
                
                return (
                  <div 
                    key={turno.id}
                    className={`flex items-start space-x-4 rounded-lg border p-4 transition-colors ${
                      esConfirmado 
                        ? 'bg-gray-50 border-purple-200 hover:bg-gray-100' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <div className={`mt-1 p-2 rounded-full ${
                      esConfirmado ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      {esConfirmado ? (
                        <CalendarCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-700" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          Entrenamiento
                        </p>
                        <Badge 
                          variant={esConfirmado ? "default" : "secondary"}
                          className={`text-xs ${esConfirmado ? 'bg-green-600' : 'bg-green-600'}`}
                        >
                          {esConfirmado ? '✓ Confirmado' : '⏱ Reservado'}
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
                          })}hs
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hayMasTurnos && (
              <Button
                onClick={() => setMostrarTodosTurnos(!mostrarTodosTurnos)}
                variant="outline"
                className="w-full mt-4"
              >
                {mostrarTodosTurnos ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Ver menos turnos
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Ver más turnos ({turnos.length - 2} más)
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-dashed">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No tienes turnos próximos</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Aún no has reservado ninguna clase o sesión de entrenamiento para los próximos días.
            </p>
            <Button onClick={onNuevoTurno} className="shadow-sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Reservar mi primer turno
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TurnosProximos;