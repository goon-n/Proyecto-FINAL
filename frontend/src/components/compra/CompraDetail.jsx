// components/compra/CompraDetail.jsx
import React, { useEffect, useState } from "react";
import { getCompra } from "../../services/compra.service";
import toast from "react-hot-toast";
import { X, Package, Calendar, DollarSign } from "lucide-react";

export default function CompraDetail({ compraId, onClose }) {
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCompra = async () => {
      try {
        setLoading(true);
        const response = await getCompra(compraId);
        setCompra(response.data);
      } catch (error) {
        toast.error("Error al cargar los detalles de la compra");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (compraId) {
      cargarCompra();
    }
  }, [compraId]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="text-center text-red-600">
          <p>No se pudo cargar la compra</p>
          <button 
            onClick={onClose}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalItems = compra.items?.reduce((total, item) => total + item.cantidad, 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">Compra #{compra.id}</h2>
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="h-4 w-4" />
              <span>{formatFecha(compra.fecha)}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Información del Proveedor */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información del Proveedor
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xl font-medium text-gray-900">
              {compra.proveedor_nombre || `Proveedor ID: ${compra.proveedor}`}
            </p>
          </div>
        </div>

        {/* Resumen de la Compra */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-600 text-sm font-medium">Total de la Compra</p>
              <p className="text-3xl font-bold text-green-700">${compra.total}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-600 text-sm font-medium">Total de Unidades</p>
              <p className="text-3xl font-bold text-blue-700">{totalItems}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-purple-600 text-sm font-medium">Tipos de Productos</p>
              <p className="text-3xl font-bold text-purple-700">{compra.items?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Notas */}
        {compra.notas && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Notas</h3>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-gray-700">{compra.notas}</p>
            </div>
          </div>
        )}

        {/* Detalles de los Ítems */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Detalles de los Ítems</h3>
          {compra.items && compra.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                      Producto
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                      Cantidad
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                      Precio Unitario
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compra.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="font-medium">{item.accesorio || `Accesorio ID: ${item.accesorio}`}</span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        ${parseFloat(item.precio_unitario).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-bold text-green-600">
                        ${(item.cantidad * parseFloat(item.precio_unitario)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <td colSpan="3" className="border border-gray-300 px-4 py-4 text-right font-bold text-gray-700 text-lg">
                      TOTAL:
                    </td>
                    <td className="border border-gray-300 px-4 py-4 text-right font-bold text-2xl text-green-600">
                      ${parseFloat(compra.total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No hay ítems en esta compra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}