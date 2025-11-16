// components/compra/CompraEdit.jsx
import React, { useEffect, useState } from "react";
import { updateCompra, getCompra, getProveedores, getAccesorios } from "../../services/compra.service";
import toast from "react-hot-toast";

export default function CompraEdit({ compraId, onUpdate, onCancel }) {
  const [proveedores, setProveedores] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [compraRes, proveedoresRes, accesoriosRes] = await Promise.all([
          getCompra(compraId),
          getProveedores(),
          getAccesorios()
        ]);
        
        const compra = compraRes.data;
        setProveedor(compra.proveedor);
        setNotas(compra.notas || "");
        setItems(compra.items || []);
        setProveedores(proveedoresRes.data);
        setAccesorios(accesoriosRes.data);
      } catch (error) {
        toast.error("Error al cargar los datos");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (compraId) {
      cargarDatos();
    }
  }, [compraId]);

  const addItem = () => setItems([...items, { accesorio: "", cantidad: 1, precio_unitario: 0 }]);
  
  const handleItemChange = (idx, field, value) => {
    const copia = [...items];
    copia[idx][field] = value;
    setItems(copia);
  };
  
  const removeItem = idx => setItems(items.filter((_, i) => i !== idx));

  const total = items.reduce((a, i) => a + Number(i.cantidad || 0) * Number(i.precio_unitario || 0), 0);

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!proveedor) {
      toast.error("Debe seleccionar un proveedor");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Debe agregar al menos un ítem");
      return;
    }
    
    if (items.some(i => !i.accesorio || !i.cantidad || !i.precio_unitario)) {
      toast.error("Falta completar algunos ítems");
      return;
    }

    try {
      await updateCompra(compraId, { 
        proveedor, 
        notas, 
        total, 
        items: items.map(item => ({
          accesorio: item.accesorio,
          cantidad: parseInt(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario)
        }))
      });
      
      toast.success("Compra actualizada correctamente");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Error al actualizar la compra");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-4 mb-8 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Editar Compra #{compraId}</h3>
        <button 
          onClick={onCancel}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-bold">Proveedor:</label>
          <select 
            required 
            value={proveedor} 
            onChange={e => setProveedor(e.target.value)} 
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">Seleccione proveedor...</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-bold">Notas:</label>
          <textarea 
            value={notas} 
            onChange={e => setNotas(e.target.value)} 
            className="border px-2 py-1 rounded w-full" 
            rows={3}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold">Ítems de la compra:</h4>
            <button 
              type="button" 
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700" 
              onClick={addItem}
            >
              + Agregar ítem
            </button>
          </div>
          
          {items.length === 0 ? (
            <p className="text-gray-500 italic">No hay ítems. Haga clic en "Agregar ítem" para comenzar.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center p-2 border rounded bg-gray-50">
                  <select 
                    required 
                    value={item.accesorio} 
                    onChange={e => handleItemChange(idx, "accesorio", e.target.value)} 
                    className="border rounded px-2 py-1 flex-1"
                  >
                    <option value="">Seleccionar accesorio...</option>
                    {accesorios.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                  
                  <input 
                    type="number" 
                    min="1" 
                    className="border px-2 py-1 rounded w-20"
                    value={item.cantidad} 
                    onChange={e => handleItemChange(idx, "cantidad", e.target.value)} 
                    placeholder="Cant."
                    required
                  />
                  
                  <input 
                    type="number" 
                    min="0.01" 
                    step="0.01"
                    className="border px-2 py-1 rounded w-28"
                    value={item.precio_unitario} 
                    onChange={e => handleItemChange(idx, "precio_unitario", e.target.value)} 
                    placeholder="Precio"
                    required
                  />
                  
                  <span className="w-20 text-right font-medium">
                    ${(Number(item.cantidad || 0) * Number(item.precio_unitario || 0)).toFixed(2)}
                  </span>
                  
                  <button 
                    type="button" 
                    onClick={() => removeItem(idx)} 
                    className="text-red-600 hover:text-red-800 font-bold w-8"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="font-bold text-lg">
              Total: ${total.toFixed(2)}
            </div>
            
            <div className="space-x-2">
              <button 
                type="button"
                onClick={onCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
              >
                Actualizar compra
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}