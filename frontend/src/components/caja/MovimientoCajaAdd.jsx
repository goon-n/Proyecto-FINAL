import React, { useState } from "react";
import { createMovimiento } from "../../services/movimientoCaja.service";

export default function MovimientoCajaAdd({ cajaId, onAdd }) {
  const [tipo, setTipo] = useState("ingreso");
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    await createMovimiento({
      caja: cajaId,
      tipo,
      tipo_pago: tipoPago,
      monto,
      descripcion
    });
    setTipo("ingreso");
    setTipoPago("efectivo");
    setMonto("");
    setDescripcion("");
    setMsg("Movimiento registrado");
    if (onAdd) onAdd(); // refresca historial en el padre
    setTimeout(() => setMsg(""), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3 space-y-2 bg-gray-50 p-3 rounded">
      <h3 className="font-bold text-md mb-1">Registrar movimiento</h3>
      <div>
        <label className="block">Tipo:</label>
        <select value={tipo} onChange={e => setTipo(e.target.value)} className="border rounded px-2">
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
          <option value="deposito">Depósito</option>
          <option value="cierre">Cierre</option>
          <option value="apertura">Apertura</option>
        </select>
      </div>
      <div>
        <label className="block">Tipo de pago:</label>
        <select value={tipoPago} onChange={e => setTipoPago(e.target.value)} className="border rounded px-2">
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>
      <div>
        <label className="block">Monto:</label>
        <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="border rounded px-2" />
      </div>
      <div>
        <label className="block">Descripción:</label>
        <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="border rounded px-2" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Agregar movimiento</button>
      {msg && <span className="text-green-700 ml-4">{msg}</span>}
    </form>
  );
}
