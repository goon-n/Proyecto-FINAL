// src/components/membresias/EstadisticasMembresias.jsx

import { Card, CardContent } from "@/components/ui/card";
import { User, CheckCircle, AlertCircle } from "lucide-react";

const EstadisticasMembresias = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <User className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Cuotas</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.activas}</p>
            <p className="text-sm text-green-700">Activas</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{stats.porVencer}</p>
            <p className="text-sm text-yellow-700">Por Vencer</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <p className="text-3xl font-bold text-red-600">{stats.vencidas}</p>
            <p className="text-sm text-red-700">Vencidas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstadisticasMembresias;