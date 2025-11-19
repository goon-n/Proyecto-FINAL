// src/pages/HomeAdmin.jsx - VERSIÓN FINAL

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeccionTurnos } from "../components/shared/SeccionTurnos";
import { 
  LogOut, 
  Users, 
  DollarSign, 
  Package, 
  Truck, 
  Settings,
  Box,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  CreditCard
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
    return <div className="text-center mt-10">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-3xl font-bold">
                ¡Bienvenido, {user.username}!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Panel de administración del gimnasio
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="text-base px-4 py-2">
                👑 {user.rol}
              </Badge>
              <Button onClick={logout} variant="destructive" size="lg">
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuarios Totales</p>
                  <p className="text-3xl font-bold">{stats.totalUsuarios}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.usuariosActivos} socios activos
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-500 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proveedores</p>
                  <p className="text-3xl font-bold">{stats.proveedoresActivos}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Activos en sistema
                  </p>
                </div>
                <Truck className="h-12 w-12 text-purple-500 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accesorios</p>
                  <p className="text-3xl font-bold">{stats.totalAccesorios}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    En inventario
                  </p>
                </div>
                <Package className="h-12 w-12 text-orange-500 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compras (Mes)</p>
                  <p className="text-3xl font-bold">{stats.comprasRecientes}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mes
                  </p>
                </div>
                <ShoppingCart className="h-12 w-12 text-green-500 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado de Caja */}
        {stats.cajaActual ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Box className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Caja Abierta</p>
                    <p className="text-sm text-green-700">
                      Total sistema: ${Number(stats.cajaActual.closing_system_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate("/admin/caja")}
                  variant="default"
                >
                  <Box className="mr-2 h-4 w-4" />
                  Ir a Caja
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900">No hay caja abierta</p>
                    <p className="text-sm text-yellow-700">
                      Abre una caja para empezar a registrar movimientos
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate("/admin/caja")}
                  variant="default"
                >
                  <Box className="mr-2 h-4 w-4" />
                  Abrir Caja
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sección de Turnos */}
        <SeccionTurnos mostrarBotonCrear={true} />

        {/* Accesos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              Accesos Rápidos
            </CardTitle>
            <CardDescription>
              Gestiona todos los aspectos del gimnasio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button 
                onClick={() => navigate("/admin/usuarios")}
                variant="outline" 
                size="lg"
                className="justify-start h-auto py-4"
              >
                <div className="flex items-start gap-3 w-full">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Usuarios</div>
                    <div className="text-xs text-muted-foreground">
                      Gestionar socios y staff
                    </div>
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/admin/caja")}
                variant="outline" 
                size="lg"
                className="justify-start h-auto py-4"
              >
                <div className="flex items-start gap-3 w-full">
                  <Box className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Caja</div>
                    <div className="text-xs text-muted-foreground">
                      Control de ingresos/egresos
                    </div>
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/admin/proveedores")}
                variant="outline" 
                size="lg"
                className="justify-start h-auto py-4"
              >
                <div className="flex items-start gap-3 w-full">
                  <Truck className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Proveedores</div>
                    <div className="text-xs text-muted-foreground">
                      Gestionar proveedores
                    </div>
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/admin/accesorios")}
                variant="outline" 
                size="lg"
                className="justify-start h-auto py-4"
              >
                <div className="flex items-start gap-3 w-full">
                  <Package className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Accesorios</div>
                    <div className="text-xs text-muted-foreground">
                      Inventario y stock
                    </div>
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/admin/compras")}
                variant="outline"
                size="lg"
                className="justify-start h-auto py-4"
              >
                <div className="flex items-start gap-3 w-full">
                  <DollarSign className="h-5 w-5 text-lime-600 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Compras</div>
                    <div className="text-xs text-muted-foreground">
                      Registrar compras
                    </div>
                  </div>
                </div>
                
              </Button>
              <Button 
                onClick={() => navigate("/admin/membresias")}
                variant="outline"
                size="lg"
                className="justify-start h-auto py-4"
              >
                <div className="flex items-start gap-3 w-full">
                  <CreditCard className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Cuotas</div>
                    <div className="text-xs text-muted-foreground">
                      Gestión De Pagos
                    </div>
                  </div>
                </div>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeAdmin;