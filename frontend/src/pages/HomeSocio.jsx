import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LogOut, 
  Calendar, 
  Dumbbell, 
  CreditCard, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle,
  RefreshCw,
  UserCircle,
  ListChecks
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "../api/api";

const HomeSocio = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [membresia, setMembresia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const dataMembresia = await api.obtenerCuotaSocio();
      setMembresia(dataMembresia);
      setError(null);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      if (error.response?.status === 404) {
        setError("No tienes una cuota mensual activa");
      } else {
        setError("Error al cargar los datos de tu membresía");
      }
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasRestantes = (fechaVencimiento) => {
    if (!fechaVencimiento) return 0;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  const puedeRenovar = () => {
    if (!membresia) return false;
    const diasRestantes = calcularDiasRestantes(membresia.fecha_vencimiento);
    return diasRestantes <= 7 || membresia.estado === 'vencida';
  };

  const diasRestantes = membresia ? calcularDiasRestantes(membresia.fecha_vencimiento) : 0;
  const planNombre = membresia?.plan_info?.nombre || membresia?.plan_nombre || "Sin plan";
  const planPrecio = membresia?.plan_info?.precio || membresia?.plan_precio || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-3xl font-bold">
                ¡Hola, {user.username}! 💪
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Bienvenido a tu panel de socio
              </CardDescription>
              <div className="flex gap-2 mt-4">
                {/* BOTÓN DE PERFIL */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(perfil) => navigate("/perfil")}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Ver perfil
                </Button>
                {/* BOTÓN MIS TURNOS */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/socio/mis-turnos")}
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  Mis turnos
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="text-base px-4 py-2">
                👤 {user.rol}
              </Badge>
              <Button onClick={logout} variant="destructive" size="lg">
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Alerta de renovación */}
      {membresia && puedeRenovar() && (
        <div className="max-w-6xl mx-auto mb-6">
          <Alert className={membresia.estado === 'vencida' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}>
            <AlertCircle className={`h-4 w-4 ${membresia.estado === 'vencida' ? 'text-red-600' : 'text-orange-600'}`} />
            <AlertDescription className={membresia.estado === 'vencida' ? 'text-red-800' : 'text-orange-800'}>
              <div className="flex items-center justify-between">
                <span>
                  {membresia.estado === 'vencida' 
                    ? '⚠️ Tu membresía ha vencido.' 
                    : `⚠️ Tu membresía vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}.`
                  }
                </span>
                <Button
                  size="sm"
                  onClick={() => navigate("/socio/membresia")}
                  className={membresia.estado === 'vencida' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Renovar ahora
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Grid de Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card de Reservar Turno (Destacada) */}
        <Card className="hover:shadow-lg transition-shadow border-2 border-primary md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Reservar Turno</CardTitle>
              </div>
              <Button 
                onClick={() => navigate("/socio/turnos")}
                size="lg"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Ver Todos los Turnos
              </Button>
            </div>
            <CardDescription>
              Reservá tu próxima clase o sesión de entrenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto text-primary opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">
                ¡Comienza tu entrenamiento reservando un turno!
              </p>
              <Button 
                onClick={() => navigate("/socio/turnos")}
                size="lg"
                variant="outline"
              >
                Explorar Turnos Disponibles
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card de Rutinas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-2xl text-yellow-600">Tus Rutinas</CardTitle>
            </div>
            <CardDescription>
              Plan de entrenamiento personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-accent rounded-lg">
                <h4 className="font-semibold mb-2">Rutina de Tonificación</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Programa semanal enfocado en tonificación muscular
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">Lunes</Badge>
                  <Badge variant="secondary">Miércoles</Badge>
                  <Badge variant="secondary">Viernes</Badge>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <Button className="w-full" variant="outline">
              <Dumbbell className="mr-2 h-4 w-4" />
              Ver rutina completa
            </Button>
          </CardContent>
        </Card>

        {/* Card de Membresía */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-2xl text-blue-600">Membresía</CardTitle>
            </div>
            <CardDescription>
              Estado de tu suscripción
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : membresia ? (
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  membresia.estado === 'vencida' 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : diasRestantes <= 7 
                      ? 'bg-orange-500/10 border-orange-500/20'
                      : 'bg-green-500/10 border-green-500/20'
                }`}>
                  <div>
                    <p className={`font-semibold ${
                      membresia.estado === 'vencida' 
                        ? 'text-red-700 dark:text-red-400' 
                        : diasRestantes <= 7
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-green-700 dark:text-green-400'
                    }`}>
                      {planNombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {membresia.estado === 'vencida' 
                        ? `Venció el ${formatearFecha(membresia.fecha_vencimiento)}`
                        : `Válida hasta ${formatearFecha(membresia.fecha_vencimiento)}`
                      }
                    </p>
                  </div>
                  <Badge className={
                    membresia.estado === 'vencida' 
                      ? 'bg-red-600' 
                      : diasRestantes <= 7 
                        ? 'bg-orange-600'
                        : 'bg-green-600'
                  }>
                    {membresia.estado === 'vencida' 
                      ? 'Vencida' 
                      : membresia.estado === 'activa' 
                        ? 'Activa' 
                        : membresia.estado
                    }
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-accent rounded-lg">
                    <p className={`text-2xl font-bold ${
                      diasRestantes <= 0 ? 'text-red-600' : diasRestantes <= 7 ? 'text-orange-600' : ''
                    }`}>
                      {diasRestantes > 0 ? diasRestantes : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Días restantes</p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-2xl font-bold">{formatearPrecio(planPrecio)}</p>
                    <p className="text-xs text-muted-foreground">Próximo pago</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No tienes membresía activa</p>
              </div>
            )}
            <Separator className="my-4" />
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate("/socio/membresia")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Ver detalles completos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default HomeSocio;
