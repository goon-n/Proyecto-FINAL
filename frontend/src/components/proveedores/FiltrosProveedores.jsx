import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const FiltrosProveedores = ({
  vistaActual,
  onCambiarVista,
  cantidadActivos,
  cantidadDesactivados,
  busqueda,
  onBusquedaChange,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={vistaActual} onValueChange={onCambiarVista}>
        <TabsList>
          <TabsTrigger value="activos">
            Activos ({cantidadActivos})
          </TabsTrigger>
          <TabsTrigger value="desactivados">
            Inactivos ({cantidadDesactivados})
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};