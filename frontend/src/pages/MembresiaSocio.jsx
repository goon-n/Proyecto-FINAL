// src/pages/MembresiaSocio.jsx - CORREGIDO

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  RefreshCw
} from "lucide-react";
import RenovarMembresia from "../components/cuotas/RenovarMembresia";

const MembresiaSocio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cuotaMensual, setCuotaMensual] = useState(null);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalRenovacion, setMostrarModalRenovacion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar cuota mensual
      const cuotaData = await api.obtenerCuotaSocio();
      setCuotaMensual(cuotaData);
      
      // Cargar historial de pagos
      try {
        const pagosData = await api.miHistorialPagos();
        setHistorialPagos(pagosData || []);
      } catch (errorPagos) {
        setHistorialPagos([]);
      }
      
      setError(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setCuotaMensual(null);
        setError("No tienes una membresía activa");
      } else {
        setError("Error al cargar la información de tu membresía");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRenovacionExitosa = () => {
    cargarDatos();
    setMostrarModalRenovacion(false);
  };

  const calcularDiasRestantes = (fechaVencimiento) => {
    if (!fechaVencimiento) {
      return 0;
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    const diferencia = vencimiento - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    return dias;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  const getEstadoBadge = (estado, diasRestantes) => {
    if (estado === 'vencida') {
      return { label: "Vencida", className: "bg-red-600", icon: AlertTriangle };
    }
    if (diasRestantes <= 5 && diasRestantes > 0) {
      return { label: "Por Vencer", className: "bg-yellow-600", icon: Clock };
    }
    return { label: "Activa", className: "bg-green-600", icon: CheckCircle2 };
  };

  // ✅ CORREGIDO: Solo puede renovar cuando está VENCIDA
  const puedeRenovar = () => {
    if (!cuotaMensual) {
      return false;
    }
    
    return cuotaMensual.estado === 'vencida';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Cargando información de membresía...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate("/socio")} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!cuotaMensual) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate("/socio")} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tienes una membresía activa</h3>
                <p className="text-muted-foreground mb-6">
                  Contáctate con la administración para adquirir una membresía
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(cuotaMensual.fecha_vencimiento);
  const estadoBadge = getEstadoBadge(cuotaMensual.estado, diasRestantes);
  const mostrarBotonRenovar = puedeRenovar();
  const EstadoIcon = estadoBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Button 
            onClick={() => navigate("/socio")} 
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>

          {/* ✅ Botón de Renovar solo si está VENCIDA */}
          {mostrarBotonRenovar && (
            <Button 
              onClick={() => setMostrarModalRenovacion(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renovar Membresía
            </Button>
          )}
        </div>

        {/* Título */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  <CreditCard className="h-8 w-8 text-primary" />
                  Mi Membresía
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Plan: {cuotaMensual.plan_nombre || cuotaMensual.plan_info?.nombre || 'N/A'}
                </CardDescription>
              </div>
              <Badge className={estadoBadge.className}>
                <EstadoIcon className="w-4 h-4 mr-1" />
                {estadoBadge.label}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* ✅ Alerta de vencimiento próximo (SOLO ALERTA, NO BOTÓN) */}
        {diasRestantes > 0 && diasRestantes <= 5 && cuotaMensual.estado === "activa" && (
          <Alert className="mb-6 border-yellow-600 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <span>
                ⚠️ Tu membresía vence en <strong>{diasRestantes}</strong> {diasRestantes === 1 ? "día" : "días"}. 
                Podrás renovar una vez que expire.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* ✅ Alerta de membresía vencida con botón */}
        {cuotaMensual.estado === "vencida" && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span>❌ Tu membresía ha vencido. Renueva para seguir disfrutando del gimnasio.</span>
               <Button
                size="sm"
                onClick={() => setMostrarModalRenovacion(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Renovar ahora
              </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Información del Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Detalles del Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Plan</p>
                <p className="text-xl font-semibold">
                  {cuotaMensual.plan_nombre || cuotaMensual.plan_info?.nombre}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Precio Mensual</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatearPrecio(cuotaMensual.plan_precio || cuotaMensual.plan_info?.precio)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Vigencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                <p className="text-lg font-semibold">
                  {formatearFecha(cuotaMensual.fecha_inicio)}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                <p className="text-lg font-semibold">
                  {formatearFecha(cuotaMensual.fecha_vencimiento)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Estado de la Membresía
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`text-center p-6 rounded-lg border ${
                diasRestantes <= 0 ? 'bg-red-50 border-red-200' : 
                diasRestantes <= 5 ? 'bg-yellow-50 border-yellow-200' : 
                'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-4xl font-bold ${
                  diasRestantes <= 0 ? 'text-red-600' : 
                  diasRestantes <= 5 ? 'text-yellow-600' : 
                  'text-blue-600'
                }`}>
                  {diasRestantes <= 0 ? Math.abs(diasRestantes) : diasRestantes}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {diasRestantes <= 0 ? 'Días Vencida' : 'Días Restantes'}
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <EstadoIcon className="h-10 w-10 mx-auto mb-2" style={{color: estadoBadge.className.includes('red') ? '#dc2626' : estadoBadge.className.includes('yellow') ? '#ca8a04' : '#16a34a'}} />
                <p className="text-sm text-muted-foreground">
                  Estado
                </p>
                <p className="text-lg font-semibold mt-1" style={{color: estadoBadge.className.includes('red') ? '#dc2626' : estadoBadge.className.includes('yellow') ? '#ca8a04' : '#16a34a'}}>
                  {estadoBadge.label}
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                <DollarSign className="h-10 w-10 mx-auto text-purple-600 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Valor del Plan
                </p>
                <p className="text-lg font-semibold text-purple-700 mt-1">
                  {formatearPrecio(cuotaMensual.plan_precio || cuotaMensual.plan_info?.precio)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial de Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Historial de Pagos ({historialPagos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historialPagos.length > 0 ? (
              <div className="space-y-4">
                {historialPagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {formatearFecha(pago.fecha_pago)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {pago.referencia || 'Pago de cuota mensual'}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {pago.metodo_pago}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatearPrecio(pago.monto)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay historial de pagos disponible</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Renovación */}
      {cuotaMensual && (
        <RenovarMembresia
          open={mostrarModalRenovacion}
          onClose={() => setMostrarModalRenovacion(false)}
          cuotaActual={cuotaMensual}
          onSuccess={handleRenovacionExitosa}
        />
      )}
    </div>
  );
};

export default MembresiaSocio;