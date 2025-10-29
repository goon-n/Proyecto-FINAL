import React, { useEffect, useState } from "react";
import { getCaja, updateCaja } from "../../services/caja.service";
import MovimientoCajaAdd from "./MovimientoCajaAdd";
import { getMovimientos } from "../../services/movimientoCaja.service";
import GraficoIngresosEgresos from "./GraficoIngresosEgresos";
import MovimientoCajaHistorial from "./MovimientoCajaHistorial";

export default function CajaEdit({ id, onGuardado }) {
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [recargarMovs, setRecargarMovs] = useState(0);
  const [movs, setMovs] = useState([]);
  const [filtroPago, setFiltroPago] = useState("");

  useEffect(() => {
    setLoading(true);
    getCaja(id).then(res => {
      setCaja(res.data);
      setLoading(false);
    });
    getMovimientos().then(res => {
      setMovs(res.data.filter(m => m.caja === id));
    });
  }, [id, recargarMovs]);

  const movimientosFiltrados = filtroPago
    ? movs.filter(m => m.tipo_pago === filtroPago)
    : movs;

  const totalx = (tipo, pago) => movs
    .filter(m => m.tipo === tipo && (!pago || m.tipo_pago === pago))
    .reduce((a, b) => a + Number(b.monto), 0);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setCaja(prev => ({
      ...prev,
      [name]: (type === "number" && value !== "") ? Number(value) : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await updateCaja(id, caja);
    setMsg("Caja actualizada correctamente");
    if (onGuardado) setTimeout(onGuardado, 1200);
  };

  if (loading || !caja) return <div className="text-center mt-10">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-lg p-6 shadow-lg space-y-6">
      {/* Advertencia de diferencia */}
      {caja.difference_amount !== null && Math.abs(Number(caja.difference_amount)) > 0.01 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 px-4 py-3 rounded mb-4 font-semibold shadow">
          <span className="mr-2">⚠️ Atención:</span> Hay una diferencia de cierre: <b>${caja.difference_amount}</b>
        </div>
      )}

      {/* Panel resumen con cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 text-center">
        <div className="bg-blue-50 rounded shadow p-4">
          <p className="font-semibold text-gray-700">Monto inicial</p>
          <p className="text-2xl text-blue-700 font-bold">${caja.monto_inicial}</p>
        </div>
        <div className="bg-green-50 rounded shadow p-4">
          <p className="font-semibold text-gray-700">Total Caja</p>
          <p className="text-2xl text-green-700 font-bold">${caja.closing_system_amount}</p>
        </div>
        <div className="bg-gray-50 rounded shadow p-4">
          <p className="font-semibold text-gray-700">Contado cierre</p>
          <p className="text-2xl text-gray-700 font-bold">
            {caja.closing_counted_amount !== null && caja.closing_counted_amount !== undefined
              ? `$${caja.closing_counted_amount}` : <span className="text-gray-400">No ingresado</span>}
          </p>
        </div>
        <div className="bg-purple-50 rounded shadow p-4">
          <p className="font-semibold text-gray-700">Diferencia</p>
          <p className="text-2xl text-purple-700 font-bold">
            {caja.difference_amount !== null && caja.difference_amount !== undefined
              ? `$${caja.difference_amount}` : <span>-</span>}
          </p>
        </div>
      </div>

      {/* Formulario de edición/cierre como card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block font-semibold mb-1">Monto Inicial</label>
          <input type="number" name="monto_inicial" value={caja.monto_inicial} onChange={handleChange}
                 className="border px-3 py-2 rounded w-full" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Estado</label>
          <select name="estado" value={caja.estado} onChange={handleChange}
                  className="border px-3 py-2 rounded w-full">
            <option value="ABIERTA">Abierta</option>
            <option value="CERRADA">Cerrada</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Contado cierre</label>
          <input type="number" name="closing_counted_amount"
                 value={caja.closing_counted_amount || ""}
                 onChange={handleChange} placeholder="Monto contado al cerrar"
                 className="border px-3 py-2 rounded w-full" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Descripción</label>
          <input name="notas" value={caja.notas || ""} onChange={handleChange}
                 className="border px-3 py-2 rounded w-full" />
        </div>
        <div className="col-span-2 text-right">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition" type="submit">
            Guardar
          </button>
          {msg && <span className="text-green-600 ml-4">{msg}</span>}
        </div>
      </form>

      {/* Formulario para agregar movimiento */}
      <section className="bg-white rounded-lg shadow p-6">
        <MovimientoCajaAdd cajaId={caja.id} onAdd={() => setRecargarMovs(m => m + 1)} />
      </section>

      {/* Filtros y totales destacados */}
      <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-wrap gap-8 items-end justify-between">
        <div>
          <label className="font-semibold mr-2">Filtrar movimientos por tipo de pago:</label>
          <select value={filtroPago} onChange={e=>setFiltroPago(e.target.value)}
                  className="border rounded px-2 py-1">
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div className="flex gap-6 flex-wrap">
          <span className="text-blue-700 font-bold">Efectivo: ${totalx("ingreso","efectivo")}</span>
          <span className="text-green-700 font-bold">Transferencia: ${totalx("ingreso","transferencia")}</span>
        </div>
      </div>

      {/* Barra gráfica moderna */}
      <div className="bg-white rounded-lg shadow p-6">
        <GraficoIngresosEgresos cajaId={caja.id} />
      </div>

      {/* Historial como tabla grande */}
      <section className="bg-white rounded-lg shadow p-6">
        <MovimientoCajaHistorial cajaId={caja.id} movimientos={movimientosFiltrados} />
      </section>
    </div>
  );
}
