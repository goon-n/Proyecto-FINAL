// src/components/compra/CompraList.jsx
import React, { useEffect, useState } from "react";
import { getCompras, getProveedores } from "../../services/compra.service";
import toast from "react-hot-toast";
import { Eye } from "lucide-react";

export default function CompraList({ reload, onView, paginaActual = 1, itemsPerPage = 10, onCambiarPagina }) {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    proveedor: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [comprasFiltradas, setComprasFiltradas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, [reload]);

  useEffect(() => {
    aplicarFiltros();
  }, [compras, filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [comprasRes, proveedoresRes] = await Promise.all([
        getCompras(),
        getProveedores()
      ]);
      
      // 🔧 CAMBIO 2: Ordenar por ID descendente (más reciente primero)
      const comprasOrdenadas = comprasRes.data.sort((a, b) => b.id - a.id);
      setCompras(comprasOrdenadas);
      setProveedores(proveedoresRes.data);
    } catch (error) {
      toast.error("Error al cargar las compras");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...compras];

    if (filtros.proveedor) {
      resultado = resultado.filter(compra => 
        compra.proveedor.toString() === filtros.proveedor
      );
    }

    if (filtros.fecha_desde) {
      resultado = resultado.filter(compra => 
        new Date(compra.fecha) >= new Date(filtros.fecha_desde)
      );
    }

    if (filtros.fecha_hasta) {
      resultado = resultado.filter(compra => 
        new Date(compra.fecha) <= new Date(filtros.fecha_hasta)
      );
    }

    // 🔧 CAMBIO 3: Asegurar orden descendente después de filtrar
    resultado.sort((a, b) => b.id - a.id);
    
    setComprasFiltradas(resultado);
    if (onCambiarPagina) {
      onCambiarPagina(1);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      proveedor: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const getNombreProveedor = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : `Proveedor ${proveedorId}`;
  };

  // Paginación
  const getTotalPages = () => Math.max(1, Math.ceil(comprasFiltradas.length / itemsPerPage));
  const totalPages = getTotalPages();
  const startIndex = (paginaActual - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const comprasPaginadas = comprasFiltradas.slice(startIndex, endIndex);

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-sm text-gray-600">
          Página {paginaActual} de {totalPages} • Total: {comprasFiltradas.length} compra{comprasFiltradas.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCambiarPagina && onCambiarPagina(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <button
            onClick={() => onCambiarPagina && onCambiarPagina(p => Math.min(totalPages, p + 1))}
            disabled={paginaActual === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Cargando compras...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-xl font-bold text-gray-800">Compras Registradas</h3>
        <p className="text-gray-600">
          Total: {comprasFiltradas.length} compras •
        </p>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <select
              value={filtros.proveedor}
              onChange={(e) => handleFiltroChange('proveedor', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(proveedor => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors w-full"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {comprasPaginadas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No hay compras que mostrar</p>
            <p className="text-sm">Pruebe ajustando los filtros o agregue una nueva compra</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ítems</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comprasPaginadas.map((compra) => (
                <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{compra.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {getNombreProveedor(compra.proveedor)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatFecha(compra.fecha)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                    ${parseFloat(compra.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {compra.items?.length || 0} productos
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => onView && onView(compra.id)}
                      className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-medium transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {renderPaginationControls()}
    </section>
  );
}