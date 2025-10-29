// src/components/compra/CompraList.jsx
import React, { useEffect, useState } from "react";
import { getCompras, deleteCompra } from "../../services/compra.service";
import toast from "react-hot-toast";

export default function CompraList({ reload }) {
  const [compras, setCompras] = useState([]);

  useEffect(() => {
    getCompras().then(res => setCompras(res.data));
  }, [reload]);

  const handleDelete = async id => {
    if (window.confirm("¿Eliminar compra?")) {
      await deleteCompra(id);
      toast.success("Compra eliminada");
      setCompras(c => c.filter(x => x.id !== id));
    }
  };

  return (
    <section className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-2">Compras registradas</h3>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>ID</th><th>Proveedor</th><th>Fecha</th><th>Total</th><th>Items</th><th></th>
          </tr>
        </thead>
        <tbody>
          {compras.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.proveedor}</td>
              <td>{c.fecha}</td>
              <td><b>${c.total}</b></td>
              <td>
                {c.items.map(i =>
                  <div key={i.id}>
                    {i.accesorio} | {i.cantidad} x <b>${i.precio_unitario}</b>
                  </div>
                )}
              </td>
              <td>
                <button onClick={()=>handleDelete(c.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
