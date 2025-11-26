import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

const AlertaRenovacion = ({ membresia, diasRestantes, onRenovar }) => {
  if (!membresia) return null;

  const esVencida = membresia.estado === 'vencida';
  const puedeRenovar = diasRestantes <= 7 || esVencida;

  if (!puedeRenovar) return null;

  return (
    <div className="max-w-6xl mx-auto mb-6">
      <Alert className={esVencida ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}>
        <AlertCircle className={`h-4 w-4 ${esVencida ? 'text-red-600' : 'text-orange-600'}`} />
        <AlertDescription className={`flex flex-col md:flex-row items-center justify-between gap-3 ${esVencida ? 'text-red-800' : 'text-orange-800'}`}>
          <span className="font-medium">
            {esVencida 
              ? '⚠️ Tu membresía ha vencido. Para ingresar, por favor renueva tu cuota.' 
              : `⚠️ Tu membresía vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}.`
            }
          </span>
          <Button
            size="sm"
            onClick={onRenovar}
            className={esVencida ? 'bg-red-600 hover:bg-red-700 text-white w-full md:w-auto' : 'bg-orange-600 hover:bg-orange-700 text-white w-full md:w-auto'}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Renovar ahora
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AlertaRenovacion;