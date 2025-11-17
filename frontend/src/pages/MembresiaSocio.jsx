// src/pages/MembresiaSocio.jsx
import { useEffect, useState } from "react";

const MembresiaSocio = () => {
  const [cuotaMensual, setCuotaMensual] = useState(null);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Simular datos de cuota mensual
      const mockCuota = {
        id: 1,
        plan_nombre: "3x Semanal",
        plan_precio: 24000,
        fecha_inicio: "2025-01-15",
        fecha_vencimiento: "2025-02-15",
        estado: "activa",
        socio_nombre: "Usuario Demo"
      };
      
      // Simular historial de pagos
      const mockPagos = [
        {
          id: 1,
          monto: 24000,
          fecha_pago: "2025-01-15T10:30:00",
          metodo_pago: "tarjeta",
          referencia: "Pago inicial - Tarjeta ****1234"
        },
        {
          id: 2,
          monto: 24000,
          fecha_pago: "2024-12-15T14:20:00",
          metodo_pago: "efectivo",
          referencia: "Renovación cuota #1"
        }
      ];
      
      setCuotaMensual(mockCuota);
      setHistorialPagos(mockPagos);
      setError(null);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar la información de tu membresía");
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
      return { label: "Vencida", color: "bg-red-600 text-white" };
    }
    if (estado === 'suspendida') {
      return { label: "Suspendida", color: "bg-gray-600 text-white" };
    }
    if (diasRestantes <= 7 && diasRestantes > 0) {
      return { label: "Por Vencer", color: "bg-yellow-600 text-white" };
    }
    return { label: "Activa", color: "bg-green-600 text-white" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => window.history.back()} 
            className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
          >
            ← Volver
          </button>
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-xl">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cuotaMensual) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => window.history.back()} 
            className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
          >
            ← Volver
          </button>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">No tienes una membresía activa</h3>
            <p className="text-gray-600">
              Contáctate con la administración para adquirir una membresía
            </p>
          </div>
        </div>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(cuotaMensual.fecha_vencimiento);
  const estadoBadge = getEstadoBadge(cuotaMensual.estado, diasRestantes);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
          >
            ← Volver al Inicio
          </button>
        </div>

        {/* Título */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                💳 Mi Cuota Mensual
              </h1>
              <p className="text-gray-600 mt-2">
                Plan: {cuotaMensual.plan_nombre || 'N/A'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold ${estadoBadge.color}`}>
              {estadoBadge.label}
            </span>
          </div>
        </div>

        {/* Alerta de vencimiento */}
        {diasRestantes > 0 && diasRestantes <= 7 && cuotaMensual.estado === "activa" && (
          <div className="bg-yellow-50 border-2 border-yellow-400 text-yellow-800 p-4 rounded-xl">
            <p className="font-semibold">
              ⚠️ Tu cuota mensual vence en {diasRestantes} {diasRestantes === 1 ? "día" : "días"}. 
              Contacta con la administración para renovarla.
            </p>
          </div>
        )}

        {/* Alerta vencida */}
        {cuotaMensual.estado === "vencida" && (
          <div className="bg-red-50 border-2 border-red-400 text-red-800 p-4 rounded-xl">
            <p className="font-semibold">
              ⚠️ Tu cuota mensual ha vencido. Contacta con la administración para renovarla.
            </p>
          </div>
        )}

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detalles del Plan */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📋 Detalles del Plan
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Plan</p>
                <p className="text-xl font-semibold text-gray-800">
                  {cuotaMensual.plan_nombre}
                </p>
              </div>
              <hr />
              <div>
                <p className="text-sm text-gray-500">Precio Mensual</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatearPrecio(cuotaMensual.plan_precio)}
                </p>
              </div>
            </div>
          </div>

          {/* Vigencia */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📅 Vigencia
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Fecha de Inicio</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatearFecha(cuotaMensual.fecha_inicio)}
                </p>
              </div>
              <hr />
              <div>
                <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatearFecha(cuotaMensual.fecha_vencimiento)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Estadísticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-4xl font-bold text-blue-600">
                {diasRestantes > 0 ? diasRestantes : 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">Días Restantes</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-4xl font-bold text-green-600">✓</p>
              <p className="text-sm text-gray-600 mt-2">Estado</p>
              <p className="text-lg font-semibold text-green-700 mt-1">
                {estadoBadge.label}
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="text-4xl font-bold text-purple-600">💰</p>
              <p className="text-sm text-gray-600 mt-2">Próximo Pago</p>
              <p className="text-lg font-semibold text-purple-700 mt-1">
                {formatearPrecio(cuotaMensual.plan_precio)}
              </p>
            </div>
          </div>
        </div>

        {/* Historial de Pagos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📝 Historial de Pagos ({historialPagos.length})
          </h3>
          {historialPagos.length > 0 ? (
            <div className="space-y-4">
              {historialPagos.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      📅 {formatearFecha(pago.fecha_pago)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {pago.referencia || 'Pago de cuota mensual'}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {pago.metodo_pago}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 ml-4">
                    {formatearPrecio(pago.monto)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-5xl mb-4">📄</p>
              <p>No hay historial de pagos disponible</p>
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Importante:</strong> Para renovar tu cuota mensual o realizar cambios en tu plan, 
            contáctate con la administración del gimnasio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembresiaSocio;