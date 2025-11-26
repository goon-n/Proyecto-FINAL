// src/components/membresias/TarjetaPlan.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, CheckCircle } from "lucide-react";

const TarjetaPlan = ({ plan }) => {
  const getTipoLimiteInfo = () => {
    if (plan.tipo_limite === 'libre') {
      return { text: 'Acceso Ilimitado', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    } else if (plan.tipo_limite === 'semanal') {
      return { text: `${plan.cantidad_limite}x por semana`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
    } else if (plan.tipo_limite === 'diario') {
      return { text: `${plan.cantidad_limite}x por día`, color: 'bg-green-100 text-green-700 border-green-200' };
    }
    return { text: 'N/A', color: 'bg-gray-100 text-gray-700' };
  };

  const limiteInfo = getTipoLimiteInfo();

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.es_popular ? 'border-2 border-blue-500' : ''}`}>
      {plan.es_popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          ⭐ Popular
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900">
              {plan.nombre}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.frecuencia}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <DollarSign className="h-5 w-5 text-green-600 mt-1" />
          <div>
            <span className="text-3xl font-bold text-gray-900">
              ${Number(plan.precio).toLocaleString('es-AR')}
            </span>
            <span className="text-sm text-muted-foreground ml-2">/ mes</span>
          </div>
        </div>

        {/* Badge de tipo de límite */}
        <Badge variant="outline" className={limiteInfo.color}>
          <Users className="h-3 w-3 mr-1" />
          {limiteInfo.text}
        </Badge>

        {/* Características */}
        {plan.caracteristicas && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Incluye:
            </p>
            <ul className="space-y-1">
              {plan.get_caracteristicas_list?.map((caracteristica, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{caracteristica}</span>
                </li>
              )) || plan.caracteristicas.split(',').map((caracteristica, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{caracteristica.trim()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Estado */}
        <div className="pt-2 border-t">
          <Badge variant={plan.activo ? "default" : "secondary"}>
            {plan.activo ? '✓ Activo' : '✗ Inactivo'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TarjetaPlan;