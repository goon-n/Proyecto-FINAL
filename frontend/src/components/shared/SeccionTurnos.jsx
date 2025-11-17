// frontend/src/components/shared/SeccionTurnos.jsx

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, CalendarPlus } from "lucide-react";

export const SeccionTurnos = ({ mostrarBotonCrear = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getRutaTurnos = () => {
    switch(user?.rol) {
      case 'admin':
        return '/admin/turnos';
      case 'entrenador':
        return '/entrenador/turnos';
      case 'socio':
        return '/socio/turnos';
      default:
        return '/login';
    }
  };

  return (
    <Card className="border-2 border-cyan-200 bg-cyan-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-cyan-600" />
          <CardTitle className="text-2xl text-cyan-700">
            {mostrarBotonCrear ? 'Gestión de Turnos' : 'Mis Turnos'}
          </CardTitle>
        </div>
        <CardDescription>
          {mostrarBotonCrear 
            ? 'Administrá los turnos y horarios del gimnasio (Lun-Sáb, 08:00-23:00)'
            : 'Reservá tu horario para entrenar'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate(getRutaTurnos())}
            variant="default" 
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Ver Calendario de Turnos
          </Button>
        
        </div>
      
      </CardContent>
    </Card>
  );
};