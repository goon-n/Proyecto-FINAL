// src/pages/ControlMembresias.jsx - ACTUALIZADO CON BOTÓN DE PRECIOS

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Settings } from "lucide-react"; // 🆕 Agregado Settings
import api from "@/api/api";
import ModalPagoTarjeta from "@/components/caja/ModalPagoTarjeta";

// Importar componentes refactorizados
import ModalRenovacionAdmin from "@/components/membresias/ModalRenovacionAdmin";
import EstadisticasMembresias from "@/components/membresias/EstadisticasMembresias";
import FiltrosMembresias from "@/components/membresias/FiltrosMembresias";
import TablaMembresias from "@/components/membresias/TablaMembresias";
import ModalEditarPrecios from "@/components/membresias/ModalEditarPrecios"; // 🆕 NUEVO
import { calcularDiasRestantes, calcularEstadisticas } from "@/components/membresias/utils/membresiaHelpers";

const ControlMembresias = () => {
  const navigate = useNavigate();
  
  const [cuotas, setCuotas] = useState([]);
  const [cuotasFiltradas, setCuotasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  
  // Estados para modal de tarjeta
  const [modalTarjetaAbierto, setModalTarjetaAbierto] = useState(false);
  const [datosPagoTarjeta, setDatosPagoTarjeta] = useState(null);
  
  // 🆕 NUEVO: Estado para modal de precios
  const [modalPreciosAbierto, setModalPreciosAbierto] = useState(false);
  
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
      const timestamp = new Date().getTime();
      const cuotasData = await api.listarCuotas();
      
      console.log("📊 Total cuotas recibidas:", cuotasData.length);
      
      if (!Array.isArray(cuotasData)) {
        toast.error("Error en el formato de datos");
        setCuotas([]);
        return;
      }
      
      // Filtrar solo la cuota más reciente de cada socio
      const cuotasPorSocio = {};
      cuotasData.forEach(cuota => {
        const socioId = cuota.socio;
        const fechaInicio = new Date(cuota.fecha_inicio);
        
        if (!cuotasPorSocio[socioId]) {
          cuotasPorSocio[socioId] = cuota;
        } else {
          const fechaExistente = new Date(cuotasPorSocio[socioId].fecha_inicio);
          if (fechaInicio > fechaExistente) {
            console.log(`🔄 Reemplazando cuota de ${cuota.socio_username}: ID ${cuotasPorSocio[socioId].id} por ID ${cuota.id}`);
            cuotasPorSocio[socioId] = cuota;
          }
        }
      });
      
      const cuotasMasRecientes = Object.values(cuotasPorSocio);
      
      console.log("✅ Cuotas filtradas (más recientes):", cuotasMasRecientes.length);
      
      // Enriquecer cuotas con datos calculados
      const cuotasEnriquecidas = cuotasMasRecientes.map(cuota => {
        const diasRestantes = calcularDiasRestantes(cuota.fecha_vencimiento);
        let estadoCalculado = cuota.estado;
        
        if (cuota.estado === 'activa' && diasRestantes <= 5 && diasRestantes > 0) {
          estadoCalculado = 'porVencer';
        }
        
        return {
          ...cuota,
          diasRestantes,
          estadoCalculado,
        };
      });
      
      setCuotas(cuotasEnriquecidas);
      setStats(calcularEstadisticas(cuotasEnriquecidas));
    } catch (error) {
      console.error("❌ Error al cargar cuotas:", error);
      toast.error(error.response?.data?.detail || "Error al cargar las cuotas");
      setCuotas([]);
    } finally {
      setLoading(false);
    }
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

  const handleAbrirModal = (cuota) => {
    setCuotaSeleccionada(cuota);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setTimeout(() => setCuotaSeleccionada(null), 300);
  };

  const handleRenovacionExitosa = () => {
    console.log("🔄 Renovación exitosa, recargando cuotas...");
    cargarCuotas();
  };

  // Función para abrir modal de tarjeta
  const handleOpenTarjeta = (datos) => {
    setDatosPagoTarjeta(datos);
    setModalTarjetaAbierto(true);
  };

  // Función para procesar pago con tarjeta
  const handlePagoTarjeta = async (datosTarjeta) => {
    setModalTarjetaAbierto(false);

    try {
      const data = {
        metodo_pago: 'tarjeta',
        monto: datosPagoTarjeta.montoAPagar,
        ...(datosPagoTarjeta.esCambioPlan && { plan_id: datosPagoTarjeta.planSeleccionadoId }),
        referencia: datosTarjeta.ultimos4
      };

      console.log("📤 Enviando renovación con tarjeta (Admin/Coach):", data);
      
      await api.renovarCuota(datosPagoTarjeta.cuota.id, data);
      
      const planFinalNombre = datosPagoTarjeta.esCambioPlan 
        ? datosPagoTarjeta.planNuevo.nombre 
        : datosPagoTarjeta.cuota.plan_nombre;
      
      toast.success(`Cuota de ${datosPagoTarjeta.cuota.socio_username} renovada. Plan: ${planFinalNombre}.`);
      
      handleRenovacionExitosa();
      
    } catch (error) {
      console.error("❌ Error al renovar cuota:", error);
      toast.error(error.response?.data?.detail || "Error al renovar la cuota mensual");
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
            
            {/* 🆕 BOTÓN NUEVO: Editar Precios */}
            <Button
              variant="outline"
              onClick={() => setModalPreciosAbierto(true)}
              className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Settings className="h-4 w-4" />
              Editar Precios
            </Button>
          </CardHeader>
        </Card>

        {/* Estadísticas */}
        <EstadisticasMembresias stats={stats} />

        {/* Filtros */}
        <FiltrosMembresias 
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
        />

        {/* Tabla de Cuotas */}
        <TablaMembresias 
          cuotasFiltradas={cuotasFiltradas}
          loading={loading}
          onAbrirModal={handleAbrirModal}
          onRecargar={cargarCuotas}
        />
      </div>

      {/* Modal de Renovación */}
      {cuotaSeleccionada && (
        <ModalRenovacionAdmin
          open={modalAbierto}
          onClose={handleCerrarModal}
          cuota={cuotaSeleccionada}
          onSuccess={handleRenovacionExitosa}
          onOpenTarjeta={handleOpenTarjeta}
        />
      )}

      {/* Modal de Pago con Tarjeta */}
      {datosPagoTarjeta && (
        <ModalPagoTarjeta
          isOpen={modalTarjetaAbierto}
          onClose={() => {
            setModalTarjetaAbierto(false);
            setDatosPagoTarjeta(null);
          }}
          onSubmit={handlePagoTarjeta}
          monto={datosPagoTarjeta.montoAPagar}
          descripcion={`Renovación cuota - ${datosPagoTarjeta.cuota.socio_username} - ${
            datosPagoTarjeta.esCambioPlan 
              ? datosPagoTarjeta.planNuevo?.nombre 
              : datosPagoTarjeta.cuota.plan_nombre
          }`}
        />
      )}

      {/* Modal de Edición de Precios */}
      <ModalEditarPrecios
        open={modalPreciosAbierto}
        onClose={() => setModalPreciosAbierto(false)}
        onSuccess={() => {
          toast.success("✅ Los cambios se aplicarán en nuevas suscripciones");
          // Opcional: recargar si quieres actualizar algo en pantalla
        }}
      />
    </div>
  );
};

export default ControlMembresias;