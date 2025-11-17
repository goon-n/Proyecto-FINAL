// src/pages/GestionCompras.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Plus, 
  ArrowLeft, 
  DollarSign,
  Package,
  Users
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CompraAdd from "../components/compra/CompraAdd";
import CompraList from "../components/compra/CompraList";
import CompraDetail from "../components/compra/CompraDetail";

// Shared components
import { PageHeader } from "../components/shared/PageHeader";

// Services
import { getEstadisticasCompras } from "../services/compra.service";

export default function GestionCompras() {
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'agregar', 'detalle'
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [reload]);

  const cargarEstadisticas = async () => {
    setLoadingStats(true);
    try {
      const response = await getEstadisticasCompras();
      setEstadisticas(response.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleReload = () => {
    setReload(prev => !prev);
    cargarEstadisticas();
  };

  const verDetalle = (compraId) => {
    setCompraSeleccionada(compraId);
    setVistaActual('detalle');
  };

  const volverALista = () => {
    setVistaActual('lista');
    setCompraSeleccionada(null);
    handleReload();
  };

  const irACrearAccesorio = () => {
    navigate('/admin/accesorios', { state: { accion: 'agregar' } });
  };

  const irAProveedores = () => {
    navigate('/admin/proveedores');
  };

  // ========== ESTADÍSTICAS (Solo 2 cards) ==========
  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    const { estadisticas_generales } = estadisticas;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Compras</p>
                <p className="text-3xl font-bold">
                  {loadingStats ? "..." : estadisticas_generales.total_compras}
                </p>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
                <p className="text-3xl font-bold text-green-600">
                  {loadingStats ? "..." : `$${estadisticas_generales.monto_total.toFixed(2)}`}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ========== CONFIGURACIÓN DE TÍTULO ==========
  const getTitleConfig = () => {
    switch (vistaActual) {
      case 'agregar':
        return {
          title: "Nueva Compra",
          subtitle: "Registra una nueva compra al sistema",
          icon: Plus
        };
      case 'detalle':
        return {
          title: "Detalle de Compra",
          subtitle: "Información completa de la compra",
          icon: ShoppingCart
        };
      default:
        return {
          title: "Gestión de Compras",
          subtitle: "Administra las compras del gimnasio",
          icon: ShoppingCart
        };
    }
  };

  const { title, subtitle, icon: TitleIcon } = getTitleConfig();

  // ========== RENDER CONTENIDO ==========
  const renderContenido = () => {
    switch (vistaActual) {
      case 'agregar':
        return (
          <div className="space-y-4">
            {/* Botón para crear proveedores */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">
                        ¿No encuentras el proveedor?
                      </p>
                      <p className="text-sm text-purple-700">
                        Crea uno nuevo antes de registrar la compra
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={irAProveedores}
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ir a Proveedores
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Botón para crear accesorios */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        ¿No encuentras el accesorio?
                      </p>
                      <p className="text-sm text-blue-700">
                        Crea uno nuevo antes de registrar la compra
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={irACrearAccesorio}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Ir a Accesorios
                  </Button>
                </div>
              </CardContent>
            </Card>

            <CompraAdd 
              onAdd={() => {
                handleReload();
                setVistaActual('lista');
                toast.success('¡Compra agregada exitosamente!');
              }} 
            />
          </div>
        );

      case 'detalle':
        return (
          <CompraDetail
            compraId={compraSeleccionada}
            onClose={volverALista}
          />
        );

      case 'lista':
      default:
        return (
          <CompraList
            reload={reload}
            onView={verDetalle}
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con botones de acción */}
      <PageHeader
        titulo={title}
        descripcion={subtitle}
        icon={TitleIcon}
      >
        <div className="flex gap-3">
          {vistaActual !== 'lista' && (
            <Button 
              variant="outline" 
              onClick={volverALista}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la lista
            </Button>
          )}
          
          {vistaActual === 'lista' && (
            <Button 
              onClick={() => setVistaActual('agregar')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Compra
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <span 
          className="cursor-pointer hover:text-primary" 
          onClick={() => navigate("/admin")}
        >
          Panel Admin
        </span>
        {" / "}
        <span 
          className={vistaActual === 'lista' ? "text-foreground" : "cursor-pointer hover:text-primary"}
          onClick={volverALista}
        >
          Compras
        </span>
        {vistaActual === 'agregar' && " / Nueva Compra"}
        {vistaActual === 'detalle' && " / Detalle"}
      </nav>

      {/* Estadísticas - Solo 2 cards */}
      {vistaActual === 'lista' && renderEstadisticas()}

      {/* Contenido Principal */}
      {renderContenido()}
    </div>
  );
}