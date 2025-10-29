import React, { useEffect, useState } from "react";
import { getMovimientos } from "../../services/movimientoCaja.service";

export default function MovimientoCajaHistorial({ cajaId, recargar }) {
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovs = () => {
    getMovimientos().then(res => {
      setMovs(res.data.filter(m => m.caja === cajaId));
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMovs();
    // eslint-disable-next-line
  }, [cajaId, recargar]);

  if (loading) return <div>Cargando movimientos...</div>;
  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Movimientos Caja #{cajaId}</h2>
      {movs.length === 0
        ? <p className="text-gray-400">No hay movimientos registrados.</p>
        : (
          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Fecha</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Tipo de pago</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {movs.map(m => (
                <tr key={m.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2">{new Date(m.fecha).toLocaleString()}</td>
                  <td className="p-2">{m.tipo}</td>
                  <td className="p-2">{m.tipo_pago}</td>
                  <td className="p-2">${m.monto}</td>
                  <td className="p-2">{m.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}
