import React, { useEffect, useState } from "react";
import { getCajas, deleteCaja } from "../../services/caja.service";

export default function CajaList({ reload, onEditar, onHistorial }) {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCajas = async () => {
    setLoading(true); setError("");
    try {
      const res = await getCajas();
      setCajas(res.data);
    } catch {
      setError("No se pudieron cargar las cajas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCajas(); }, [reload]);

  const handleDelete = async id => {
    if (window.confirm("¿Estás seguro de eliminar la caja?")) {
      try {
        await deleteCaja(id);
        setCajas(cajas.filter(c => c.id !== id));
      } catch {
        setError("Error al eliminar la caja.");
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Cargando cajas...</div>;

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="font-bold text-xl mb-2">Cajas</h2>
      {error && <div className="bg-red-100 text-red-700 border border-red-200 rounded p-2 mb-3">{error}</div>}
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Fecha Apertura</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {cajas.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-400">No hay cajas registradas.</td>
            </tr>
          )}
          {cajas.map(caja => (
            <tr key={caja.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2">{caja.id}</td>
              <td className="p-2">{caja.estado}</td>
              <td className="p-2">{caja.fecha_apertura}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleDelete(caja.id)} className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
                <button onClick={() => onEditar(caja.id)} className="bg-yellow-500 text-white px-3 py-1 rounded">Cerrar/Editar</button>
                <button onClick={() => onHistorial(caja.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Historial</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
