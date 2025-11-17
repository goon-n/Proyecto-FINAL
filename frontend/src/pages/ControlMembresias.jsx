// src/pages/ControlMembresias.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft, 
  Search, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  User,
  Filter,
  Download
} from "lucide-react";
import api from "../api/api";

const ControlMembresias = () => {
  const navigate = useNavigate();
  
  const [cuotas, setCuotas] = useState([]);
  const [cuotasFiltradas, setCuotasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  
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
      // Cargar todas las cuotas desde el backend
      const cuotasData = await api.listarCuotas();
      
      // Calcular días restantes y estado para cada cuota
      const cuotasEnriquecidas = cuotasData.map(cuota => {
        const diasRestantes = calcularDiasRestantes(cuota.fecha_vencimiento);
        let estadoCalculado = cuota.estado;
        
        // Ajustar estado basado en días restantes
        if (cuota.estado === 'activa' && diasRestantes <= 7 && diasRestantes > 0) {
          estadoCalculado = 'porVencer';
        }
        
        return {
          ...cuota,
          diasRestantes,
          estadoCalculado
        };
      });
      
      setCuotas(cuotasEnriquecidas);
      calcularEstadisticas(cuotasEnriquecidas);
    } catch (error) {
      console.error("Error al cargar cuotas:", error);
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
    
    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(cuota => 
        cuota.socio_username?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cuota.socio_email?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    // Filtro por estado
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
        variant: "default", 
        label: "Activa", 
        icon: CheckCircle,
        className: "bg-green-600"
      },
      porVencer: { 
        variant: "warning", 
        label: "Por Vencer", 
        icon: AlertCircle,
        className: "bg-yellow-600"
      },
      vencida: { 
        variant: "destructive", 
        label: "Vencida", 
        icon: AlertCircle,
        className: "bg-red-600"
      },
      suspendida: {
        variant: "secondary",
        label: "Suspendida",
        icon: AlertCircle,
        className: "bg-gray-600"
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
    // Implementar exportación a Excel
    alert("Exportando a Excel... (función por implementar)");
  };

  if (loading) {
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

        {/* Estadísticas */}
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
            {cuotasFiltradas.length === 0 ? (
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
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Días Restantes</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cuotasFiltradas.map((cuota) => (
                      <TableRow 
                        key={cuota.id}
                        className={cuota.estado === 'vencida' ? 'bg-red-50' : ''}
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold">{cuota.socio_username || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{cuota.socio_email || 'Sin email'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {cuota.plan_name || cuota.plan?.nombre || 'Sin plan'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(cuota.estado, cuota.estadoCalculado)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatearFecha(cuota.fecha_inicio)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatearFecha(cuota.fecha_vencimiento)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            cuota.diasRestantes < 0 
                              ? 'text-red-600' 
                              : cuota.diasRestantes <= 7 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            {cuota.diasRestantes < 0 
                              ? `Vencida hace ${Math.abs(cuota.diasRestantes)} días`
                              : `${cuota.diasRestantes} días`
                            }
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatearPrecio(cuota.plan_price || cuota.plan?.precio)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => alert(`Ver detalles de cuota #${cuota.id}`)}
                          >
                            Ver Detalles
                          </Button>
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
    </div>
  );
};

export default ControlMembresias;
