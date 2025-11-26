// src/components/usuarios/FiltrosUsuarios.jsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserX, Search } from "lucide-react";

export const FiltrosUsuarios = ({ 
  vistaActual, 
  onCambiarVista, 
  cantidadActivos, 
  cantidadDesactivados,
  busqueda = "",
  onBusquedaChange
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-2">
        <Button
          variant={vistaActual === 'activos' ? 'default' : 'outline'}
          onClick={() => onCambiarVista('activos')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Usuarios Activos ({cantidadActivos})
        </Button>
        <Button
          variant={vistaActual === 'desactivados' ? 'default' : 'outline'}
          onClick={() => onCambiarVista('desactivados')}
          className="flex items-center gap-2"
        >
          <UserX className="h-4 w-4" />
          Usuarios Desactivados ({cantidadDesactivados})
        </Button>
      </div>
      
      {onBusquedaChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
    </div>
  );
};