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
  CreditCard, 
  Clock, 
  User,
  ArrowRight, 
  AlertCircle,
  RefreshCw,
  CalendarCheck,
  PlusCircle,
  MapPin
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "../api/api";

const HomeSocio = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [membresia, setMembresia] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
    cargarTurnos();
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

  const cargarTurnos = async () => {
    try {
      setLoadingTurnos(true);
      // Asumimos que existe este endpoint o uno similar para traer los turnos del usuario logueado
      // Si tu API tiene otro nombre, ajustalo aquí (ej: api.get('/turnos/mis-turnos'))
      const dataTurnos = await api.obtenerMisTurnos(); 
      
      // Filtramos solo los futuros
      const ahora = new Date();
      const turnosFuturos = Array.isArray(dataTurnos) 
        ? dataTurnos.filter(t => new Date(`${t.fecha}T${t.hora}`) > ahora).sort((a,b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`)).slice(0, 2)
        : [];
        
      setTurnos(turnosFuturos);
    } catch (error) {
      console.error("Error al cargar turnos:", error);
      // No mostramos error en UI para no saturar, simplemente dejamos la lista vacía
      setTurnos([]);
    } finally {
      setLoadingTurnos(false);
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
    // Ajustamos la zona horaria para evitar desfases
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

  const puedeRenovar = () => {
    if (!membresia) return false;
    const diasRestantes = calcularDiasRestantes(membresia.fecha_vencimiento);
    return diasRestantes <= 7 || membresia.estado === 'vencida';
  };

  const diasRestantes = membresia ? calcularDiasRestantes(membresia.fecha_vencimiento) : 0;
  const planNombre = membresia?.plan_info?.nombre || membresia?.plan_nombre || "Sin plan";
  const planPrecio = membresia?.plan_info?.precio || membresia?.plan_precio || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <Card className="bg-white border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                ¡Hola, {user.username}! 👋
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Panel de control personal
              </CardDescription>
              <div className="flex gap-2 mt-4">
                {/* BOTÓN DE PERFIL */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(perfil) => navigate("/socio/perfil")}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Ver perfil
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Badge variant="secondary" className="text-sm px-3 py-1 h-9 flex items-center">
                <User className="mr-2 h-3 w-3" />
                {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
              </Badge>
              <Button onClick={logout} variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Salir
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
            <AlertDescription className={`flex flex-col md:flex-row items-center justify-between gap-3 ${membresia.estado === 'vencida' ? 'text-red-800' : 'text-orange-800'}`}>
              <span className="font-medium">
                {membresia.estado === 'vencida' 
                  ? '⚠️ Tu membresía ha vencido. Para ingresar, por favor renueva tu cuota.' 
                  : `⚠️ Tu membresía vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}.`
                }
              </span>
              <Button
                size="sm"
                onClick={() => navigate("/socio/membresia")}
                className={membresia.estado === 'vencida' ? 'bg-red-600 hover:bg-red-700 text-white w-full md:w-auto' : 'bg-orange-600 hover:bg-orange-700 text-white w-full md:w-auto'}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Renovar ahora
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Grid de Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Card de Turnos (Modificada para mostrar reservas) */}
        <Card className="hover:shadow-md transition-all duration-200 border-t-4 border-t-primary md:col-span-2">
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
                onClick={() => navigate("/socio/turnos")} 
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
                  {turnos.map((turno, index) => (
                    <div key={index} className="flex items-start space-x-4 rounded-lg border p-4 bg-card hover:bg-accent/5 transition-colors">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {turno.actividad_nombre || "Entrenamiento"}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatearFecha(turno.fecha)} - {turno.hora}hs
                        </div>
                        {turno.profesor && (
                           <div className="flex items-center text-xs text-muted-foreground mt-1">
                             <User className="mr-1 h-3 w-3" />
                             Prof: {turno.profesor}
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex gap-3 justify-end">
                   <Button variant="ghost" size="sm" onClick={() => navigate("/socio/mis-turnos")}>
                     Ver historial completo
                   </Button>
                   <Button size="sm" onClick={() => navigate("/socio/turnos")}>
                     Reservar otro turno <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-dashed">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No tienes turnos próximos</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Aún no has reservado ninguna clase o sesión de entrenamiento para los próximos días.
                </p>
                <Button onClick={() => navigate("/socio/turnos")} className="shadow-sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Reservar mi primer turno
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Card de Perfil (Reemplaza a Rutinas) */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-indigo-900">Mi Perfil</CardTitle>
                <CardDescription>Datos personales y seguridad</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email || "Socio Activo"}</p>
                  </div>
                </div>
                <Separator className="my-3 bg-indigo-200/50" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Gestiona tu dirección y contacto</span>
                </div>
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                onClick={() => navigate("/socio/perfil")}
              >
                <User className="mr-2 h-4 w-4" />
                Ir a mi Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. Card de Membresía */}
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
                  onClick={() => navigate("/socio/membresia")}
                >
                  Ver detalles de pagos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">No tienes membresía activa</p>
                <Button onClick={() => navigate("/socio/membresia")} size="sm">
                  Adquirir Membresía
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default HomeSocio;