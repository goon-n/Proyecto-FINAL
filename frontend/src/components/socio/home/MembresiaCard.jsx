import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, AlertCircle, ArrowRight } from "lucide-react";

const MembresiaCard = ({ membresia, loading, error, diasRestantes, onVerDetalles, onAdquirir }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Argentina/Buenos_Aires"
    }).format(date);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  const planNombre = membresia?.plan_info?.nombre || membresia?.plan_nombre || "Sin plan";
  const planPrecio = membresia?.plan_info?.precio || membresia?.plan_precio || 0;

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-900">Membresía</CardTitle>
            <CardDescription>Estado de tu suscripción</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Cargando estado...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        ) : membresia ? (
          <div className="space-y-4">
            <div className={`flex flex-col p-4 rounded-lg border ${
              membresia.estado === 'vencida' 
                ? 'bg-red-50 border-red-100' 
                : diasRestantes <= 7 
                  ? 'bg-orange-50 border-orange-100'
                  : 'bg-green-50 border-green-100'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{planNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence: {formatearFecha(membresia.fecha_vencimiento)}
                  </p>
                </div>
                <Badge className={
                  membresia.estado === 'vencida' 
                    ? 'bg-red-500' 
                    : diasRestantes <= 7 
                      ? 'bg-orange-500'
                      : 'bg-green-600'
                }>
                  {membresia.estado === 'activa' ? 'ACTIVA' : membresia.estado.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white/60 p-2 rounded text-center">
                  <span className="block text-xs text-gray-500">Días Restantes</span>
                  <span className={`block font-bold ${diasRestantes <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
                    {diasRestantes > 0 ? diasRestantes : 0}
                  </span>
                </div>
                <div className="bg-white/60 p-2 rounded text-center">
                  <span className="block text-xs text-gray-500">Valor Cuota</span>
                  <span className="block font-bold text-gray-800">{formatearPrecio(planPrecio)}</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800" 
              variant="outline"
              onClick={onVerDetalles}
            >
              Ver detalles de pagos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">No tienes membresía activa</p>
            <Button onClick={onAdquirir} size="sm">
              Adquirir Membresía
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembresiaCard;