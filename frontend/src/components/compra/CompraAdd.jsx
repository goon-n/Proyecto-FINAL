// components/compra/CompraAdd.jsx - Versión con validación de caja

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
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [cajaAbierta, setCajaAbierta] = useState(null); // ⭐ Estado de caja
  const [cargandoCaja, setCargandoCaja] = useState(true);

  useEffect(() => {
    cargarDatos();
    verificarCajaAbierta();
  }, []);

  // ⭐ Verificar si hay caja abierta
  const verificarCajaAbierta = async () => {
    try {
      setCargandoCaja(true);
      const response = await axios.get("http://localhost:8000/api/caja/actual/", {
        withCredentials: true
      });
      setCajaAbierta(response.data);
      console.log("✅ Caja abierta encontrada:", response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("⚠️ No hay caja abierta");
        setCajaAbierta(null);
      }
    } finally {
      setCargandoCaja(false);
    }
  };

  const cargarDatos = async () => {
    try {
      await axios.get("http://localhost:8000/api/user/", { withCredentials: true });
      const csrfToken = getCSRFToken();
      
      const usuarioRes = await axios.get("http://localhost:8000/api/user/", { withCredentials: true });
      setUsuarioAutenticado(usuarioRes.data);
      
      const [proveedoresRes, accesoriosRes] = await Promise.all([
        getProveedores(),
        getAccesorios()
      ]);
      
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
    
    // ⭐ VALIDACIÓN: Verificar caja abierta
    if (!cajaAbierta) {
      toast.error("⚠️ No hay caja abierta. Debe abrir una caja antes de registrar compras.");
      return;
    }
    
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
      const compraData = { 
        proveedor: parseInt(proveedor), 
        notas, 
        total: parseFloat(total),
        tipo_pago: tipoPago,
        items: items.map(item => ({
          accesorio: parseInt(item.accesorio),
          cantidad: parseInt(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario)
        }))
      };
      
      await createCompra(compraData);
      
      setProveedor(""); 
      setItems([]); 
      setNotas("");
      setTipoPago("efectivo");
      toast.success("✅ Compra registrada y movimiento de caja creado");
      if (onAdd) onAdd();
    } catch (error) {
      console.error("Error al crear compra:", error);
      
      if (error.response?.data?.error === 'No hay caja abierta') {
        toast.error("⚠️ " + error.response.data.detail);
        setCajaAbierta(null); // Actualizar estado
        verificarCajaAbierta(); // Revalidar
      } else if (error.response?.status === 403) {
        toast.error("No tienes permisos para crear compras");
      } else if (error.response?.status === 401) {
        toast.error("Debes iniciar sesión primero");
      } else {
        toast.error("Error al registrar la compra: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 mb-8 bg-white rounded-lg shadow-md space-y-6">
      {/* Header con estado de autenticación */}
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Registrar Nueva Compra</h3>
        
        {/* Estado de autenticación */}
        {usuarioAutenticado ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
            <p className="text-green-700 text-sm">
              ✅ Autenticado como: <strong>{usuarioAutenticado.username}</strong> ({usuarioAutenticado.rol})
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p className="text-red-700 text-sm">
              ❌ No autenticado. <a href="/login" className="underline font-medium">Iniciar sesión</a>
            </p>
          </div>
        )}
      </div>

      {/* ⭐ Estado de Caja */}
      {cargandoCaja ? (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
          <p className="text-gray-600 text-sm">🔄 Verificando estado de caja...</p>
        </div>
      ) : cajaAbierta ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-800 font-semibold text-sm">✅ Caja Abierta</p>
              <p className="text-green-700 text-sm mt-1">
                Caja #{cajaAbierta.id} • Abierta por: <strong>{cajaAbierta.empleado_apertura_nombre}</strong>
              </p>
              <p className="text-green-600 text-xs mt-1">
                Monto inicial: ${Number(cajaAbierta.monto_inicial).toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={verificarCajaAbierta}
              className="text-green-600 hover:text-green-800 text-xs underline"
            >
         
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">No hay caja abierta</p>
              <p className="text-red-700 text-sm mt-1">
                Debe abrir una caja antes de registrar compras.
              </p>
              <div className="mt-3 flex gap-2">
                <a 
                  href="/admin/caja" 
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Ir a Gestión de Caja
                </a>
                <button
                  type="button"
                  onClick={verificarCajaAbierta}
                  className="inline-block text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario - Deshabilitado si no hay caja */}
      <fieldset disabled={!cajaAbierta} className={!cajaAbierta ? 'opacity-50' : ''}>
        {/* Proveedor */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Proveedor *</label>
          <select 
            required 
            value={proveedor} 
            onChange={e => setProveedor(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccione proveedor...</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Pago */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Tipo de Pago *</label>
          <select 
            value={tipoPago} 
            onChange={e => setTipoPago(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="efectivo">💵 Efectivo</option>
            <option value="transferencia">🏦 Transferencia</option>
          </select>
          
        </div>

        {/* Notas */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Notas (opcional)</label>
          <textarea 
            value={notas} 
            onChange={e => setNotas(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
            rows="2"
            placeholder="Observaciones sobre la compra..."
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-700">Productos a comprar</h4>
            <button 
              type="button" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium" 
              onClick={addItem}
            >
              + Agregar Producto
            </button>
          </div>

          {items.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-600">No hay productos agregados</p>
              <p className="text-sm text-gray-500 mt-1">Haga clic en "Agregar Producto"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Producto *</label>
                    <select 
                      required 
                      value={item.accesorio} 
                      onChange={e => handleItemChange(idx, "accesorio", e.target.value)} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      {accesorios.map(a =>
                        <option key={a.id} value={a.id}>{a.nombre} (Stock: {a.stock || 0})</option>
                      )}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad *</label>
                    <input 
                      type="number" 
                      min={1} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={item.cantidad} 
                      onChange={e => handleItemChange(idx, "cantidad", e.target.value)} 
                      required
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Precio *</label>
                    <input 
                      type="number" 
                      min={0} 
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={item.precio_unitario} 
                      onChange={e => handleItemChange(idx, "precio_unitario", e.target.value)} 
                      required
                    />
                  </div>
                  <div className="w-28 pt-6">
                    <div className="text-sm font-semibold text-green-600 text-right">
                      ${(Number(item.cantidad) * Number(item.precio_unitario)).toFixed(2)}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItem(idx)} 
                    className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors mt-6"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        {items.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-700 font-medium">Total de la Compra</p>
                <p className="text-xs text-green-600 mt-1">
                  {items.length} producto(s) • {items.reduce((acc, i) => acc + Number(i.cantidad), 0)} unidades
                </p>
              </div>
              <div className="text-3xl font-bold text-green-700">
                ${total.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Botón Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button"
            onClick={() => {
              setProveedor("");
              setItems([]);
              setNotas("");
              setTipoPago("efectivo");
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Limpiar
          </button>
          <button 
            type="submit" 
            disabled={!cajaAbierta}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            💾 Registrar Compra
          </button>
        </div>
      </fieldset>
    </form>
  );
}