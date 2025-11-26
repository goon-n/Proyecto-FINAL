// src/pages/GestionReportes.jsx 

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../components/shared/PageHeader";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FileWarning, Plus, ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react"; // ← AGREGADO Download

// Imports de componentes
import ModalCrearReporte from "../components/reportes/ModalCrearReporte";
import EstadisticasReportes from "../components/reportes/EstadisticasReportes";
import FiltrosReportes from "../components/reportes/FiltrosReportes";
import TablaReportes from "../components/reportes/TablaReportes";
import ModalAccionReporte from "../components/reportes/ModalAccionReporte";

// Servicios
import { 
  getReportesAccesorios, 
  confirmarReporte, 
  rechazarReporte,
  getEstadisticasReportes 
} from "../services/accesorios.service";

import { generarPDFReportes } from "../utils/generarPDFReportes";

const GestionReportes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const esAdmin = user?.rol === 'admin';

  // Estados principales
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // ✅ PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const reportesPorPagina = 10;

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalAccion, setModalAccion] = useState({ 
    open: false, 
    reporte: null, 
    tipo: null 
  });

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado]);

  // ✅ Resetear página cuando cambian filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, busqueda]);

  const cargarDatos = async () => {
    await Promise.all([
      cargarReportes(),
      cargarEstadisticas()
    ]);
  };

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const filtros = filtroEstado !== "todos" ? { estado: filtroEstado } : {};
      const response = await getReportesAccesorios(filtros);
      setReportes(response.data);
    } catch (error) {
      toast.error("Error al cargar reportes");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await getEstadisticasReportes();
      setStats(response.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const abrirModalAccion = (reporte, tipo) => {
    setModalAccion({ open: true, reporte, tipo });
  };

  const cerrarModalAccion = () => {
    setModalAccion({ open: false, reporte: null, tipo: null });
  };

  const handleConfirmarReporte = async (notas) => {
    try {
      await confirmarReporte(modalAccion.reporte.id, notas);
      toast.success("Reporte confirmado y stock actualizado");
      await cargarDatos();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error al confirmar reporte";
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleRechazarReporte = async (notas) => {
    try {
      await rechazarReporte(modalAccion.reporte.id, notas);
      toast.success("Reporte rechazado");
      await cargarDatos();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error al rechazar reporte";
      toast.error(errorMsg);
      throw error;
    }
  };

  // ✅ FILTRADO Y PAGINACIÓN
  const reportesFiltrados = reportes.filter(reporte => {
    const matchBusqueda = reporte.accesorio_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         reporte.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return matchBusqueda;
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(reportesFiltrados.length / reportesPorPagina);
  const indiceInicio = (paginaActual - 1) * reportesPorPagina;
  const indiceFin = indiceInicio + reportesPorPagina;
  const reportesPaginados = reportesFiltrados.slice(indiceInicio, indiceFin);

  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(prev => prev - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(prev => prev + 1);
    }
  };

  const handleGenerarPDF = () => {
    if (reportesFiltrados.length === 0) {
      toast.error("No hay reportes para exportar");
      return;
    }

    try {
      generarPDFReportes(reportesFiltrados, { estado: filtroEstado });
      toast.success("PDF generado correctamente");
    } catch (error) {
      toast.error("Error al generar PDF");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <PageHeader
        titulo="Gestión de Reportes"
        descripcion="Reportes de accesorios faltantes, rotos o extraviados"
        icon={FileWarning}
    >
      <div className="flex gap-3">
        {/* BOTÓN VOLVER */}
        <Button 
          variant="outline"
          onClick={() => navigate(`/${user?.rol}/accesorios`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Accesorios
        </Button>

        {/* ✅ BOTÓN EXPORTAR PDF */}
        <Button 
          variant="outline"
          onClick={handleGenerarPDF}
          className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          disabled={loading || reportesFiltrados.length === 0}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>

        {/* BOTÓN CREAR REPORTE - Solo para entrenadores */}
        {!esAdmin && (
          <Button 
            onClick={() => setModalCrearAbierto(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Reporte
          </Button>
        )}
      </div>
    </PageHeader>

      {/* Estadísticas */}
      <EstadisticasReportes stats={stats} />

      {/* Filtros */}
      <FiltrosReportes
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
      />

      {/* Tabla de Reportes */}
      <TablaReportes
        reportes={reportesPaginados} 
        loading={loading}
        esAdmin={esAdmin}
        onAbrirModalAccion={abrirModalAccion}
      />

      {/* ✅ PAGINACIÓN */}
      {!loading && reportesFiltrados.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {indiceInicio + 1} - {Math.min(indiceFin, reportesFiltrados.length)} de {reportesFiltrados.length} reportes
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={paginaAnterior}
              disabled={paginaActual === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            {/* Números de página */}
            <div className="flex gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                <Button
                  key={numero}
                  variant={paginaActual === numero ? "default" : "outline"}
                  size="sm"
                  onClick={() => irAPagina(numero)}
                  className="min-w-[40px]"
                >
                  {numero}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={paginaSiguiente}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Crear Reporte */}
      <ModalCrearReporte
        open={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
        onSuccess={cargarDatos}
      />

      {/* Modal Confirmar/Rechazar */}
      <ModalAccionReporte
        open={modalAccion.open}
        onClose={cerrarModalAccion}
        reporte={modalAccion.reporte}
        tipo={modalAccion.tipo}
        onConfirmar={handleConfirmarReporte}
        onRechazar={handleRechazarReporte}
      />
    </div>
  );
};

export default GestionReportes;