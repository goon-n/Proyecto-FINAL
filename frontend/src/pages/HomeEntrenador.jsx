// src/pages/HomeEntrenador.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SeccionTurnos } from "../components/shared/SeccionTurnos";
import { 
  LogOut, 
  Users, 
  Package, 
  Box,
  TrendingUp,
  CreditCard,
  Activity,
  CalendarCheck,
  ArrowRight
} from "lucide-react";
import api from "../api/api";

const HomeEntrenador = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    socios: 0,
    accesorios: 0,
    cajaActual: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [usuarios, accesorios] = await Promise.all([
        api.listarUsuarios().catch(() => []),
        api.listarAccesorios().catch(() => [])
      ]);

      let cajaActual = null;
      try {
        cajaActual = await api.cajaActual();
      } catch (error) {
        // No hay caja abierta
      }

      setStats({
        totalUsuarios: usuarios.length || 0,
        socios: usuarios.filter(u => u.perfil__rol === 'socio').length || 0,
        accesorios: accesorios.length || 0,
        cajaActual: cajaActual
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="h-10 w-10 text-blue-600 mb-4" />
          <p className="text-lg font-medium text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Hola, {user.username} 👋
              </h1>
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1">
                  {user.rol.toUpperCase()}
                </Badge>
                <span className="text-sm">Panel de Control General</span>
              </p>
            </div>
            <Button 
              onClick={logout} 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* --- ESTADÍSTICAS SUPERIORES (KPIs) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* KPI Socios */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Socios Activos</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.socios}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Inventario */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Items en Stock</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.accesorios}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Caja (Dinámica) */}
          <Card className={`shadow-sm hover:shadow-md transition-shadow border-l-4 ${stats.cajaActual ? 'border-l-green-500' : 'border-l-gray-300'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Estado de Caja</p>
                  {stats.cajaActual ? (
                    <>
                      <h3 className="text-3xl font-bold text-green-700">
                        ${Number(stats.cajaActual.closing_system_amount || 0).toLocaleString('es-AR')}
                      </h3>
                      <p className="text-xs text-green-600 font-medium mt-1">● Caja Abierta</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-500 mt-1">Cerrada</h3>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-blue-600 text-xs mt-1"
                        onClick={() => navigate("/entrenador/caja")}
                      >
                        Abrir caja ahora &rarr;
                      </Button>
                    </>
                  )}
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stats.cajaActual ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Box className={`h-6 w-6 ${stats.cajaActual ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- SECCIÓN PRINCIPAL: ACCIONES Y TURNOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: MENÚ DE ACCIONES RÁPIDAS */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-green-600 text-white py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-white-400" />
                  Gestión Administrativa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y">
                  
                  {/* Botón Usuarios */}
                  <button 
                    onClick={() => navigate("/entrenador/usuarios")}
                    className="flex items-center gap-4 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Usuarios</p>
                      <p className="text-xs text-gray-500">Gestionar socios</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  {/* Botón Caja */}
                  <button 
                    onClick={() => navigate("/entrenador/caja")}
                    className="flex items-center gap-4 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Box className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Caja</p>
                      <p className="text-xs text-gray-500">Movimientos y cierres</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  {/* Botón Inventario */}
                  <button 
                    onClick={() => navigate("/entrenador/accesorios")}
                    className="flex items-center gap-4 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Package className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Accesorios</p>
                      <p className="text-xs text-gray-500">Control de Inventario</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  {/* Botón Membresías */}
                  <button 
                    onClick={() => navigate("/entrenador/membresias")}
                    className="flex items-center gap-4 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <CreditCard className="h-5 w-5 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Cuotas</p>
                      <p className="text-xs text-gray-500">Control y renovación</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA (MÁS ANCHA): GESTIÓN DE TURNOS */}
          <div className="lg:col-span-2">
             <Card className="h-full shadow-md border-none">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-blue-600" />
                        Agenda de Turnos
                      </CardTitle>
                      <CardDescription>Gestión de clases y reservas del día</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Envuelve tu componente existente en un contenedor limpio */}
                  <div className="bg-white rounded-lg">
                    <SeccionTurnos mostrarBotonCrear={true} />
                  </div>
                </CardContent>
             </Card>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomeEntrenador;