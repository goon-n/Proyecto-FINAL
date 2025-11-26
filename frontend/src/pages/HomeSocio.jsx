import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

// Importar componentes
import HeaderSocio from "../components/socio/home/HeaderSocio";
import AlertaRenovacion from "../components/socio/home/AlertaRenovacion";
import TurnosProximos from "../components/socio/home/TurnosProximos";
import HistorialAsistencias from "../components/socio/home/HistorialAsistencias";
import PerfilCard from "../components/socio/home/PerfilCard";
import MembresiaCard from "../components/socio/home/MembresiaCard";

const HomeSocio = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [membresia, setMembresia] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [turnosHistorial, setTurnosHistorial] = useState([]);
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
      const dataTurnos = await api.obtenerMisTurnos(); 
      
      console.log('🎯 Todos mis turnos:', dataTurnos);
      
      const ahora = new Date();
      
      if (Array.isArray(dataTurnos)) {
        // Turnos futuros (CONFIRMADO o cualquier estado que no sea FINALIZADO)
        const futuros = dataTurnos
          .filter(t => {
            const fechaHoraTurno = new Date(t.hora_inicio);
            return fechaHoraTurno > ahora && t.estado !== 'FINALIZADO';
          })
          .sort((a, b) => new Date(a.hora_inicio) - new Date(b.hora_inicio));
        
        // 🔹 CAMBIO: Turnos pasados con estado FINALIZADO (donde asistió)
        const pasados = dataTurnos
          .filter(t => {
            const fechaHoraTurno = new Date(t.hora_inicio);
            return fechaHoraTurno <= ahora && t.estado === 'FINALIZADO';
          })
          .sort((a, b) => new Date(b.hora_inicio) - new Date(a.hora_inicio))
          .slice(0, 5);
            
        console.log('📅 Turnos futuros:', futuros);
        console.log('📋 Turnos pasados (FINALIZADOS):', pasados);
            
        setTurnos(futuros);
        setTurnosHistorial(pasados);
      }
    } catch (error) {
      console.error("Error al cargar turnos:", error);
      setTurnos([]);
      setTurnosHistorial([]);
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

  const diasRestantes = membresia ? calcularDiasRestantes(membresia.fecha_vencimiento) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <HeaderSocio user={user} logout={logout} />

      {/* Alerta de renovación */}
      <AlertaRenovacion 
        membresia={membresia}
        diasRestantes={diasRestantes}
        onRenovar={() => navigate("/socio/membresia")}
      />

      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 1. Card de Turnos Próximos */}
        <TurnosProximos 
          turnos={turnos}
          loadingTurnos={loadingTurnos}
          onNuevoTurno={() => navigate("/socio/turnos")}
        />

        {/* 2. Card de Historial de Asistencias */}
        <HistorialAsistencias turnosHistorial={turnosHistorial} />

        {/* Grid de 2 columnas para Perfil y Membresía */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 3. Card de Perfil */}
          <PerfilCard 
            user={user}
            onVerPerfil={() => navigate("/socio/perfil")}
          />

          {/* 4. Card de Membresía */}
          <MembresiaCard 
            membresia={membresia}
            loading={loading}
            error={error}
            diasRestantes={diasRestantes}
            onVerDetalles={() => navigate("/socio/membresia")}
            onAdquirir={() => navigate("/socio/membresia")}
          />

        </div>
      </div>
    </div>
  );
};

export default HomeSocio;