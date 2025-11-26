// src/components/reportes/FiltrosReportes.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FiltrosReportes = ({ busqueda, setBusqueda, filtroEstado, setFiltroEstado }) => {
  const filtros = [
    { value: "todos", label: "Todos" },
    { value: "pendiente", label: "Pendientes" },
    { value: "confirmado", label: "Confirmados" },
    { value: "rechazado", label: "Rechazados" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por accesorio o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1"
          />
          
          <div className="flex gap-2">
            {filtros.map((filtro) => (
              <Button
                key={filtro.value}
                variant={filtroEstado === filtro.value ? "default" : "outline"}
                onClick={() => setFiltroEstado(filtro.value)}
                size="sm"
              >
                {filtro.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltrosReportes;