// src/pages/GestionCompras.jsx
import React, { useState, useEffect } from "react";
import CompraAdd from "../components/compra/CompraAdd";
import CompraList from "../components/compra/CompraList";
import CompraEdit from "../components/compra/CompraEdit";
import CompraDetail from "../components/compra/CompraDetail";
import { getEstadisticasCompras } from "../services/compra.service";
import toast from "react-hot-toast";

export default function GestionCompras() {
  const [reload, setReload] = useState(false);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'agregar', 'editar', 'detalle'
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [reload]);

  const cargarEstadisticas = async () => {
    try {
      const response = await getEstadisticasCompras();
      setEstadisticas(response.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
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

  const editarCompra = (compraId) => {
    setCompraSeleccionada(compraId);
    setVistaActual('editar');
  };

  const volverALista = () => {
    setVistaActual('lista');
    setCompraSeleccionada(null);
    handleReload();
  };

  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    const { estadisticas_generales, top_proveedores, compras_recientes } = estadisticas;

    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-blue-600 text-sm font-medium">Total Compras</h3>
          <p className="text-2xl font-bold text-blue-700">{estadisticas_generales.total_compras}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-green-600 text-sm font-medium">Monto Total</h3>
          <p className="text-2xl font-bold text-green-700">${estadisticas_generales.monto_total.toFixed(2)}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-purple-600 text-sm font-medium">Promedio por Compra</h3>
          <p className="text-2xl font-bold text-purple-700">${estadisticas_generales.promedio_compra.toFixed(2)}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h3 className="text-orange-600 text-sm font-medium">Compras este Mes</h3>
          <p className="text-2xl font-bold text-orange-700">{estadisticas_generales.compras_mes}</p>
          <p className="text-sm text-orange-600">${estadisticas_generales.monto_mes.toFixed(2)}</p>
        </div>
      </div>
    );
  };

  const renderNavegacion = () => (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setVistaActual('lista')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            vistaActual === 'lista'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📋 Lista de Compras
        </button>
        
        <button
          onClick={() => setVistaActual('agregar')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            vistaActual === 'agregar'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ➕ Nueva Compra
        </button>

        {vistaActual === 'editar' && (
          <button
            onClick={volverALista}
            className="px-4 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            ← Volver a Lista
          </button>
        )}

        {vistaActual === 'detalle' && (
          <button
            onClick={volverALista}
            className="px-4 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            ← Volver a Lista
          </button>
        )}
      </div>
    </div>
  );

  const renderContenido = () => {
    switch (vistaActual) {
      case 'agregar':
        return (
          <CompraAdd 
            onAdd={() => {
              handleReload();
              setVistaActual('lista');
              toast.success('Compra agregada correctamente');
            }} 
          />
        );

      case 'editar':
        return (
          <CompraEdit
            compraId={compraSeleccionada}
            onUpdate={() => {
              handleReload();
              setVistaActual('lista');
              toast.success('Compra actualizada correctamente');
            }}
            onCancel={volverALista}
          />
        );

      case 'detalle':
        return (
          <CompraDetail
            compraId={compraSeleccionada}
            onClose={volverALista}
            onEdit={editarCompra}
          />
        );

      case 'lista':
      default:
        return (
          <CompraList
            reload={reload}
            onView={verDetalle}
            onEdit={editarCompra}
          />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛒 Gestión de Compras
        </h1>
        <p className="text-gray-600">
          Administre las compras, proveedores y controle el inventario de su gimnasio
        </p>
      </div>

      {/* Estadísticas */}
      {vistaActual === 'lista' && renderEstadisticas()}

      {/* Navegación */}
      {renderNavegacion()}

      {/* Contenido Principal */}
      <div className="bg-gray-50 min-h-screen -mx-6 -mb-6 px-6 pb-6">
        {renderContenido()}
      </div>
    </div>
  );
}
