// src/pages/HomeAdmin.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeccionTurnos } from "../components/shared/SeccionTurnos";
import GraficoPlanesPopulares from "../components/caja/GraficoPlanesPopulares";
import { 
  LogOut, 
  Users, 
  DollarSign, 
  Package, 
  Truck, 
  Box, 
  TrendingUp, 
  ShoppingCart, 
  AlertCircle, 
  CreditCard,
  Activity,
  CalendarCheck,
  ArrowRight
} from "lucide-react";
import api from "../api/api";

const HomeAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    proveedoresActivos: 0,
    totalAccesorios: 0,
    cajaActual: null,
    comprasRecientes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [usuarios, proveedores, accesorios, compras] = await Promise.all([
        api.listarUsuarios().catch(() => []),
        api.listarProveedoresActivos().catch(() => []),
        api.listarAccesorios().catch(() => []),
        api.estadisticasCompras().catch(() => ({ estadisticas_generales: {} }))
      ]);

      // Intentar obtener caja actual
      let cajaActual = null;
      try {
        cajaActual = await api.cajaActual();
      } catch (error) {
        // No hay caja abierta
      }

      setStats({
        totalUsuarios: usuarios.length || 0,
        usuariosActivos: usuarios.filter(u => u.perfil__rol === 'socio').length || 0,
        proveedoresActivos: proveedores.length || 0,
        totalAccesorios: accesorios.length || 0,
        cajaActual: cajaActual,
        comprasRecientes: compras.estadisticas_generales?.compras_mes || 0
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
          <p className="text-lg font-medium text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                Bienvenido, <span className="font-semibold text-gray-900">{user.username}</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 px-2 py-0.5 text-xs">
                  {user.rol.toUpperCase()}
                </Badge>
              </p>
            </div>
            <div className="flex items-center gap-3">
               <Button 
                onClick={logout} 
                variant="destructive" 
                size="sm"
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 shadow-none"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* --- ESTADÍSTICAS SUPERIORES (KPIs) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Usuarios */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Usuarios Totales</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</h3>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    {stats.usuariosActivos} socios activos
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Estado de Caja (Dinámico) */}
          <Card className={`shadow-sm hover:shadow-md transition-shadow border-l-4 ${stats.cajaActual ? 'border-l-green-500 bg-green-50/30' : 'border-l-amber-400 bg-amber-50/30'}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Estado de Caja</p>
                  {stats.cajaActual ? (
                    <>
                      <h3 className="text-2xl font-bold text-green-700">
                        ${Number(stats.cajaActual.closing_system_amount || 0).toLocaleString('es-AR')}
                      </h3>
                      <p className="text-xs text-green-600 mt-1 font-bold flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500 block animate-pulse"></span>
                        ABIERTA
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-500 mt-1">CERRADA</h3>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-amber-600 text-xs mt-1 underline decoration-amber-400/50"
                        onClick={() => navigate("/admin/caja")}
                      >
                        Abrir caja ahora
                      </Button>
                    </>
                  )}
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stats.cajaActual ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {stats.cajaActual ? (
                    <Box className="h-5 w-5 text-green-600" />
                  ) : (
                     <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Compras Mes */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Compras (Mes)</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.comprasRecientes}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Operaciones registradas
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Proveedores */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Proveedores</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.proveedoresActivos}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Activos en sistema
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- SECCIÓN PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: MENÚ DE GESTIÓN */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-green-500 text-white py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-white-400" />
                  Gestión Administrativa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y">
                  
                  {/* Usuarios */}
                  <button 
                    onClick={() => navigate("/admin/usuarios")}
                    className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Usuarios</p>
                      <p className="text-xs text-gray-500">Socios y Empleados</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  {/* Caja */}
                  <button 
                    onClick={() => navigate("/admin/caja")}
                    className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Box className="h-4 w-4 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Caja</p>
                      <p className="text-xs text-gray-500">Movimientos y cierres</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  {/* Proveedores */}
                  <button 
                    onClick={() => navigate("/admin/proveedores")}
                    className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Truck className="h-4 w-4 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Proveedores</p>
                      <p className="text-xs text-gray-500">Gestión de proveedores</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  {/* Compras */}
                  <button 
                    onClick={() => navigate("/admin/compras")}
                    className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-md bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <DollarSign className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Compras</p>
                      <p className="text-xs text-gray-500">Registrar compras</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                  {/* Accesorios */}
                  <button 
                    onClick={() => navigate("/admin/accesorios")}
                    className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-md bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Package className="h-4 w-4 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Accesorios</p>
                      <p className="text-xs text-gray-500">Control de Inventario</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                   {/* Membresías */}
                   <button 
                    onClick={() => navigate("/admin/membresias")}
                    className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-md bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <CreditCard className="h-4 w-4 text-teal-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Cuotas</p>
                      <p className="text-xs text-gray-500">Control y renovación</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                  </button>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: TURNERO (Prioridad Visual) */}
          <div className="lg:col-span-2">
             <Card className="h-full shadow-md border-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-purple-600" />
                        Gestión de Turnos
                      </CardTitle>
                      <CardDescription>Vista global de la agenda del gimnasio</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-6">
                  <div className="bg-white rounded-lg border p-1">
                    <SeccionTurnos mostrarBotonCrear={true} />
                  </div>
                </CardContent>
             </Card>
          </div>

        </div>

        {/* --- GRÁFICO DE PLANES MÁS POPULARES --- */}
        <GraficoPlanesPopulares />

      </main>
    </div>
  );
};

export default HomeAdmin;