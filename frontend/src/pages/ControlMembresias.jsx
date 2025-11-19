// src/pages/ControlMembresias.jsx - ARCHIVO COMPLETO

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Search, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  User,
  Filter,
  Download,
  MoreHorizontal,
  RefreshCw,
  Ban,
  Loader2
} from "lucide-react";
import api from "../api/api";

// Modal de Renovación para Admin
const ModalRenovacionAdmin = ({ open, onClose, cuota, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");

  if (!cuota) return null;

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  const handleRenovar = async () => {
    setLoading(true);
    try {
      const data = {
        metodo_pago: metodoPago,
        monto: cuota.plan_price || cuota.plan_precio
      };
      
      await api.renovarCuota(cuota.id, data);
      
      toast.success(`Membresía de ${cuota.socio_username} renovada exitosamente.`);
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error("Error al renovar cuota:", error);
      toast.error(error.response?.data?.detail || "Error al renovar la membresía");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Renovar Membresía
          </DialogTitle>
          <DialogDescription>
            Registrar pago y renovar la cuota para: <strong>{cuota.socio_username}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Resumen */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold">{cuota.plan_name}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Monto a Pagar:</span>
                <span className="font-bold text-green-600">
                  {formatearPrecio(cuota.plan_price)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Método de Pago */}
          <div className="space-y-2">
            <Label htmlFor="metodo-pago">Método de Pago</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger id="metodo-pago">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                <SelectItem value="transferencia">💳 Transferencia</SelectItem>
                <SelectItem value="tarjeta">🏦 Tarjeta (Posnet)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleRenovar} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Pago y Renovar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ControlMembresias = () => {
  const navigate = useNavigate();
  
  const [cuotas, setCuotas] = useState([]);
  const [cuotasFiltradas, setCuotasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    porVencer: 0,
    vencidas: 0
  });

  useEffect(() => {
    cargarCuotas();
  }, []);

  useEffect(() => {
    filtrarCuotas();
  }, [cuotas, busqueda, filtroEstado]);

  const cargarCuotas = async () => {
    setLoading(true);
    try {
      const cuotasData = await api.listarCuotas();
      
      const cuotasEnriquecidas = cuotasData.map(cuota => {
        const diasRestantes = calcularDiasRestantes(cuota.fecha_vencimiento);
        let estadoCalculado = cuota.estado;
        
        if (cuota.estado === 'activa' && diasRestantes <= 7 && diasRestantes > 0) {
          estadoCalculado = 'porVencer';
        }
        
        return {
          ...cuota,
          diasRestantes,
          estadoCalculado,
          // ✅ Usar los nombres correctos del serializer
          plan_name: cuota.plan_info?.nombre || cuota.plan_nombre,
          plan_price: cuota.plan_info?.precio || cuota.plan_precio,
        };
      });
      
      setCuotas(cuotasEnriquecidas);
      calcularEstadisticas(cuotasEnriquecidas);
    } catch (error) {
      console.error("Error al cargar cuotas:", error);
      toast.error("Error al cargar las cuotas");
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

  const calcularEstadisticas = (cuotas) => {
    const total = cuotas.length;
    const activas = cuotas.filter(c => c.estadoCalculado === 'activa').length;
    const porVencer = cuotas.filter(c => c.estadoCalculado === 'porVencer').length;
    const vencidas = cuotas.filter(c => c.estado === 'vencida').length;
    
    setStats({ total, activas, porVencer, vencidas });
  };

  const filtrarCuotas = () => {
    let resultado = [...cuotas];
    
    if (busqueda) {
      resultado = resultado.filter(cuota => 
        cuota.socio_username?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuota.socio_email?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    if (filtroEstado !== "todos") {
      if (filtroEstado === "porVencer") {
        resultado = resultado.filter(cuota => cuota.estadoCalculado === "porVencer");
      } else {
        resultado = resultado.filter(cuota => cuota.estado === filtroEstado);
      }
    }
    
    setCuotasFiltradas(resultado);
  };

  const getEstadoBadge = (estado, estadoCalculado) => {
    const estadoFinal = estadoCalculado || estado;
    
    const configs = {
      activa: { 
        label: "Activa", 
        icon: CheckCircle,
        className: "bg-green-600 hover:bg-green-700"
      },
      porVencer: { 
        label: "Por Vencer", 
        icon: AlertCircle,
        className: "bg-yellow-600 hover:bg-yellow-700"
      },
      vencida: { 
        label: "Vencida", 
        icon: AlertCircle,
        className: "bg-red-600 hover:bg-red-700"
      },
      suspendida: {
        label: "Suspendida",
        icon: Ban,
        className: "bg-gray-600 hover:bg-gray-700"
      }
    };
    
    const config = configs[estadoFinal] || configs.activa;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  const exportarExcel = () => {
    toast.error("Exportación a Excel aún no implementada.");
  };

  const handleAbrirModal = (cuota) => {
    setCuotaSeleccionada(cuota);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setTimeout(() => setCuotaSeleccionada(null), 300);
  };

  const handleRenovacionExitosa = () => {
    handleCerrarModal();
    cargarCuotas();
  };
  
  const handleSuspender = async (cuotaId) => {
    try {
      await api.suspenderCuota(cuotaId);
      toast.success("Cuota suspendida correctamente");
      cargarCuotas();
    } catch (error) {
      toast.error("Error al suspender la cuota");
    }
  };

  if (loading && cuotas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-center text-muted-foreground">Cargando cuotas mensuales...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  Control de Cuotas Mensuales
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Gestiona el estado de las cuotas mensuales de todos los socios
                </CardDescription>
              </div>
            </div>
            <Button onClick={exportarExcel} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </CardHeader>
        </Card>

        {/* Estadísticas - 4 CARDS SIN DUPLICADOS */}
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

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activa">Activas</SelectItem>
                  <SelectItem value="porVencer">Por Vencer</SelectItem>
                  <SelectItem value="vencida">Vencidas</SelectItem>
                  <SelectItem value="suspendida">Suspendidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Cuotas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Listado de Cuotas Mensuales ({cuotasFiltradas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && cuotas.length > 0 && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </div>
            )}
            {!loading && cuotasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron cuotas con los filtros aplicados
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Socio</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Días Restantes</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cuotasFiltradas.map((cuota) => (
                      <TableRow 
                        key={cuota.id}
                        className={cuota.estado === 'vencida' ? 'bg-red-50 hover:bg-red-100' : ''}
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold">{cuota.socio_username}</p>
                            <p className="text-sm text-muted-foreground">{cuota.socio_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {cuota.plan_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(cuota.estado, cuota.estadoCalculado)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatearFecha(cuota.fecha_vencimiento)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            cuota.diasRestantes <= 0 
                              ? 'text-red-600' 
                              : cuota.diasRestantes <= 7 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            {cuota.diasRestantes <= 0 
                              ? `Vencida (hace ${Math.abs(cuota.diasRestantes - 1)} días)`
                              : `${cuota.diasRestantes} días`
                            }
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatearPrecio(cuota.plan_price)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleAbrirModal(cuota)}
                                className="text-blue-600"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Renovar / Registrar Pago
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSuspender(cuota.id)}
                                className="text-orange-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Suspender
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {cuotaSeleccionada && (
        <ModalRenovacionAdmin
          open={modalAbierto}
          onClose={handleCerrarModal}
          cuota={cuotaSeleccionada}
          onSuccess={handleRenovacionExitosa}
        />
      )}
    </div>
  );
};

export default ControlMembresias;