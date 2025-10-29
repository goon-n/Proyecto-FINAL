// components/compra/CompraAdd.jsx
import React, { useEffect, useState } from "react";
import { createCompra, getProveedores, getAccesorios } from "../../services/compra.service";
import toast from "react-hot-toast";
import axios from "axios";
import { getCSRFToken } from "../../utils/csrf";

export default function CompraAdd({ onAdd }) {
  const [proveedores, setProveedores] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState("");
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log("Cargando datos y verificando autenticación...");
        
        // Obtener CSRF token primero
        await axios.get("http://localhost:8000/api/user/", { withCredentials: true });
        const csrfToken = getCSRFToken();
        console.log("CSRF Token obtenido:", csrfToken);
        
        // Verificar autenticación
        const usuarioRes = await axios.get("http://localhost:8000/api/user/", { withCredentials: true });
        console.log("Usuario autenticado:", usuarioRes.data);
        setUsuarioAutenticado(usuarioRes.data);
        
        const [proveedoresRes, accesoriosRes] = await Promise.all([
          getProveedores(),
          getAccesorios()
        ]);
        
        console.log("Proveedores cargados:", proveedoresRes.data);
        console.log("Accesorios cargados:", accesoriosRes.data);
        
        setProveedores(proveedoresRes.data);
        setAccesorios(accesoriosRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        if (error.response?.status === 401) {
          toast.error("⚠️ No estás autenticado. Inicia sesión primero.");
          setUsuarioAutenticado(null);
        } else {
          toast.error("Error al cargar datos");
        }
      }
    };
    
    cargarDatos();
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
    
    if (!proveedor) {
      toast.error("Debe seleccionar un proveedor");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Debe agregar al menos un ítem");
      return;
    }
    
    if (items.some(i => !i.accesorio || !i.cantidad || !i.precio_unitario)) {
      toast.error("Falta completar todos los campos de los ítems");
      return;
    }
    
    try {
      const csrfToken = getCSRFToken();
      console.log("CSRF Token antes de enviar:", csrfToken);
      
      const compraData = { 
        proveedor: parseInt(proveedor), 
        notas, 
        total: parseFloat(total), 
        items: items.map(item => ({
          accesorio: parseInt(item.accesorio),
          cantidad: parseInt(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario)
        }))
      };
      
      console.log("Enviando compra:", compraData);
      
      await createCompra(compraData);
      
      setProveedor(""); 
      setItems([]); 
      setNotas("");
      toast.success("Compra registrada correctamente");
      if (onAdd) onAdd();
    } catch (error) {
      console.error("Error al crear compra:", error);
      
      if (error.response?.status === 403) {
        toast.error("Error 403: No tienes permisos para crear compras. ¿Estás logueado?");
      } else if (error.response?.status === 401) {
        toast.error("Error 401: Debes iniciar sesión primero");
      } else {
        toast.error("Error al registrar la compra: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-8 bg-white rounded shadow space-y-4">
      {/* Indicador de autenticación */}
      <div className="mb-4 p-3 rounded-lg border-l-4 bg-gray-50">
        {usuarioAutenticado ? (
          <div className="border-l-green-500 bg-green-50">
            <p className="text-green-700">
              ✅ Autenticado como: <strong>{usuarioAutenticado.username}</strong> ({usuarioAutenticado.rol})
            </p>
          </div>
        ) : (
          <div className="border-l-red-500 bg-red-50">
            <p className="text-red-700">
              ❌ No autenticado. <a href="/login" className="underline">Iniciar sesión</a>
            </p>
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-bold">Proveedor:</label>
        <select required value={proveedor} onChange={e=>setProveedor(e.target.value)} className="border px-2 py-1 rounded w-full">
          <option value="">Seleccione proveedor...</option>
          {proveedores.length === 0 ? (
            <option value="" disabled>No hay proveedores disponibles</option>
          ) : (
            proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))
          )}
        </select>
        {proveedores.length === 0 && (
          <p className="text-red-500 text-sm mt-1">
            ⚠️ No se pudieron cargar los proveedores. Verifique la consola del navegador.
          </p>
        )}
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-500 text-xs">
            Proveedores cargados: {proveedores.length}
          </p>
          <button
            type="button"
            onClick={() => {
              console.log("Recargando datos manualmente...");
              getProveedores()
                .then(res => {
                  console.log("Datos recargados:", res.data);
                  setProveedores(res.data);
                  toast.success("Proveedores recargados");
                })
                .catch(err => {
                  console.error("Error al recargar:", err);
                  toast.error("Error al recargar proveedores");
                });
            }}
            className="text-blue-600 hover:text-blue-800 text-xs underline"
          >
            🔄 Recargar
          </button>
        </div>
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
