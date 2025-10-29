// src/components/compra/CompraList.jsx
import React, { useEffect, useState } from "react";
import { getCompras, eliminarCompraConStock, getProveedores } from "../../services/compra.service";
import toast from "react-hot-toast";

export default function CompraList({ reload, onView, onEdit }) {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    proveedor: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      setCompras(comprasRes.data);
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

    // Filtro por proveedor
    if (filtros.proveedor) {
      resultado = resultado.filter(compra => 
        compra.proveedor.toString() === filtros.proveedor
      );
    }

    // Filtro por fecha desde
    if (filtros.fecha_desde) {
      resultado = resultado.filter(compra => 
        new Date(compra.fecha) >= new Date(filtros.fecha_desde)
      );
    }

    // Filtro por fecha hasta
    if (filtros.fecha_hasta) {
      resultado = resultado.filter(compra => 
        new Date(compra.fecha) <= new Date(filtros.fecha_hasta)
      );
    }

    setComprasFiltradas(resultado);
    setCurrentPage(1); // Resetear a la primera página al filtrar
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

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta compra? Se revertirá el stock automáticamente.")) {
      try {
        await eliminarCompraConStock(id);
        toast.success("Compra eliminada y stock actualizado");
        setCompras(c => c.filter(x => x.id !== id));
      } catch (error) {
        toast.error("Error al eliminar la compra");
        console.error(error);
      }
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const getNombreProveedor = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : `Proveedor ${proveedorId}`;
  };

  // Paginación
  const totalPages = Math.ceil(comprasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const comprasPaginadas = comprasFiltradas.slice(startIndex, endIndex);

  const cambiarPagina = (nuevaPagina) => {
    setCurrentPage(nuevaPagina);
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
        <p className="text-gray-600">Total: {comprasFiltradas.length} compras</p>
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
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
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
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onView && onView(compra.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(compra.id)}
                        className="text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(compra.id)}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(endIndex, comprasFiltradas.length)} de {comprasFiltradas.length} compras
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => cambiarPagina(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => cambiarPagina(page)}
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => cambiarPagina(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
