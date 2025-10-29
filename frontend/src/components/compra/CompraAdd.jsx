// components/compra/CompraAdd.jsx
import React, { useEffect, useState } from "react";
import { createCompra, getProveedores, getAccesorios } from "../../services/compra.service";
import toast from "react-hot-toast";

export default function CompraAdd({ onAdd }) {
  const [proveedores, setProveedores] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    getProveedores().then(res => setProveedores(res.data));
    getAccesorios().then(res => setAccesorios(res.data));
  }, []);

  const addItem = () => setItems([...items, { accesorio: "", cantidad: 1, precio_unitario: 0 }]);
  const handleItemChange = (idx, field, value) => {
    const copia = [...items];
    copia[idx][field] = value;
    setItems(copia);
  };
  const removeItem = idx => setItems(items.filter((_, i) => i !== idx));

  const total = items.reduce((a, i) => a + Number(i.cantidad) * Number(i.precio_unitario), 0);

  const handleSubmit = async e => {
    e.preventDefault();
    if (items.some(i => !i.accesorio || !i.cantidad || !i.precio_unitario)) {
      toast.error("Falta completar los accesorios");
      return;
    }
    await createCompra({ proveedor, notas, total, items });
    setProveedor(""); setItems([]); setNotas("");
    toast.success("Compra registrada");
    if (onAdd) onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-8 bg-white rounded shadow space-y-4">
      <div>
        <label className="block mb-1 font-bold">Proveedor:</label>
        <select required value={proveedor} onChange={e=>setProveedor(e.target.value)} className="border px-2 py-1 rounded w-full">
          <option value="">Seleccione proveedor...</option>
          {proveedores.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-bold">Descripción:</label>
        <textarea value={notas} onChange={e=>setNotas(e.target.value)} className="border px-2 py-1 rounded w-full" />
      </div>
      <div>
        <h4 className="font-bold mb-2">Accesorios / Elementos:</h4>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center mb-2">
            <select required value={item.accesorio} onChange={e=>handleItemChange(idx,"accesorio",e.target.value)} className="border rounded px-2">
              <option value="">Accesorio...</option>
              {accesorios.map(a =>
                <option key={a.id} value={a.id}>{a.nombre}</option>
              )}
            </select>
            <input type="number" min={1} className="border px-2 rounded w-20"
              value={item.cantidad} onChange={e=>handleItemChange(idx,"cantidad",e.target.value)} placeholder="Cantidad" required/>
            <input type="number" min={0} className="border px-2 rounded w-24"
              value={item.precio_unitario} onChange={e=>handleItemChange(idx,"precio_unitario",e.target.value)} placeholder="Precio" required/>
            <button type="button" onClick={()=>removeItem(idx)} className="text-red-600 font-bold">X</button>
          </div>
        ))}
        <button type="button" className="bg-blue-600 text-white px-3 py-1 rounded mt-2" onClick={addItem}>
          + Agregar accesorio
        </button>
      </div>
      <div className="mt-4 font-bold text-lg text-right">
        Total: ${total}
      </div>
      <div className="text-right">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">
          Registrar compra
        </button>
      </div>
    </form>
  );
}
