// src/components/Compras/CompraAdd.jsx

import React, { useEffect, useState } from "react";
import { createCompra, getProveedores } from "../../services/compra.service";
import toast from "react-hot-toast";
import api from "../../api/api";
import { Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function CompraAdd({ onAdd }) {
  const [proveedores, setProveedores] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [mostrarAlertaStock, setMostrarAlertaStock] = useState(false);
  const [erroresStockMensaje, setErroresStockMensaje] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState("");
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [cargandoCaja, setCargandoCaja] = useState(true);
  const [cargandoAccesorios, setCargandoAccesorios] = useState(false);
  
  const [busquedaProducto, setBusquedaProducto] = useState({});

  useEffect(() => {
    cargarDatos();
    verificarCajaAbierta();
  }, []);

  useEffect(() => {
    if (proveedor) {
      cargarAccesoriosProveedor(proveedor);
      setItems([]);
      setBusquedaProducto({});
    } else {
      setAccesorios([]);
    }
  }, [proveedor]);

  const verificarCajaAbierta = async () => {
    try {
      setCargandoCaja(true);
      const caja = await api.cajaActual();
      setCajaAbierta(caja);
      console.log("✅ Caja abierta detectada:", caja);
    } catch (error) {
      console.error("Error al verificar caja:", error);
      if (error.response?.status === 404) {
        setCajaAbierta(null);
        console.log("⚠️ No hay caja abierta");
      }
    } finally {
      setCargandoCaja(false);
    }
  };

  const cargarDatos = async () => {
    try {
      const usuarioRes = await api.obtenerUsuarioActual();
      setUsuarioAutenticado(usuarioRes);
      console.log("✅ Usuario autenticado:", usuarioRes);
      
      const proveedoresRes = await getProveedores();
      setProveedores(proveedoresRes.data);
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

  const cargarAccesoriosProveedor = async (proveedorId) => {
    if (!proveedorId) {
      setAccesorios([]);
      return;
    }
    
    try {
      setCargandoAccesorios(true);
      const response = await api.obtenerAccesoriosProveedor(proveedorId);
      setAccesorios(response.accesorios || []);
      console.log(`✅ Cargados ${response.total} accesorios del proveedor`);
      
      if (response.total === 0) {
        toast.info("⚠️ Este proveedor no tiene accesorios disponibles");
      }
    } catch (error) {
      console.error("Error al cargar accesorios:", error);
      toast.error("Error al cargar accesorios del proveedor");
      setAccesorios([]);
    } finally {
      setCargandoAccesorios(false);
    }
  };

  const addItem = () => {
    if (!proveedor) {
      toast.error("Primero seleccione un proveedor");
      return;
    }
    if (accesorios.length === 0) {
      toast.error("Este proveedor no tiene accesorios disponibles");
      return;
    }
    const nuevoItem = { accesorio: "", cantidad: 1, precio_unitario: 0 };
    setItems([...items, nuevoItem]);
    setBusquedaProducto(prev => ({...prev, [items.length]: ""}));
  };
  
  const handleItemChange = (idx, field, value) => {
    const copia = [...items];
    copia[idx][field] = value;
    setItems(copia);
  };
  
  const removeItem = idx => {
    setItems(items.filter((_, i) => i !== idx));
    const nuevaBusqueda = {...busquedaProducto};
    delete nuevaBusqueda[idx];
    setBusquedaProducto(nuevaBusqueda);
  };

  const filtrarAccesorios = (idx) => {
    const busqueda = busquedaProducto[idx] || "";
    if (!busqueda) return accesorios;
    
    return accesorios.filter(a => 
      a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const total = items.reduce((a, i) => a + Number(i.cantidad) * Number(i.precio_unitario), 0);

  const handleSubmit = async e => {
    e.preventDefault();
    
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
    
    // ✅ VALIDACIÓN DE STOCK MÁXIMO
    const STOCK_MAXIMO = 200;
    const erroresStock = [];
    
    for (const item of items) {
      const accesorioSeleccionado = accesorios.find(a => a.id === parseInt(item.accesorio));
      if (accesorioSeleccionado) {
        const stockActual = accesorioSeleccionado.stock || 0;
        const cantidadCompra = parseInt(item.cantidad);
        const stockFinal = stockActual + cantidadCompra;
        
        if (stockFinal > STOCK_MAXIMO) {
          erroresStock.push({
            nombre: accesorioSeleccionado.nombre,
            stockActual,
            cantidadCompra,
            stockFinal,
            exceso: stockFinal - STOCK_MAXIMO
          });
        }
      }
    }
    
    if (erroresStock.length > 0) {
      setErroresStockMensaje(erroresStock);
      setMostrarAlertaStock(true);
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
      setBusquedaProducto({});
      setAccesorios([]);
      toast.success("✅ Compra registrada y movimiento de caja creado");
      if (onAdd) onAdd();
    } catch (error) {
      console.error("Error al crear compra:", error);
      
      if (error.response?.data?.error === 'No hay caja abierta') {
        toast.error("⚠️ " + error.response.data.detail);
        setCajaAbierta(null);
        verificarCajaAbierta();
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
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Registrar Nueva Compra</h3>
        
        {usuarioAutenticado ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
            <p className="text-green-700 text-sm">
              ✅ Autenticado como: <strong>{usuarioAutenticado.username}</strong> ({usuarioAutenticado.rol})
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p className="text-red-700 text-sm">⚠️ No estás autenticado</p>
          </div>
        )}
      </div>

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
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">No hay caja abierta</p>
              <p className="text-red-700 text-sm mt-1">Debe abrir una caja antes de registrar compras.</p>
              <div className="mt-3">
                
                  href={usuarioAutenticado?.rol === 'entrenador' ? '/entrenador/caja' : '/admin/caja'}
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"                
                  Ir a Gestión de Caja
              </div>
            </div>
          </div>
        </div>
      )}

      <fieldset disabled={!cajaAbierta} className={!cajaAbierta ? 'opacity-50' : ''}>
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
          
          {proveedor && (
            <p className="text-sm text-blue-600 mt-1">
              ℹ️ Solo podrás agregar accesorios de este proveedor
            </p>
          )}
        </div>

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

        <div>
          <div className="flex justify-start items-center gap-4 mb-3">
            <h4 className="font-semibold text-gray-700">Productos a comprar</h4>
            <button 
              type="button" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed" 
              onClick={addItem}
              disabled={!proveedor || accesorios.length === 0}
            >
              + Agregar Producto
            </button>
            
            {!proveedor && (
              <span className="text-sm text-orange-600">
                ⚠️ Primero seleccione un proveedor
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {!proveedor ? (
                <>
                  <p className="text-gray-600">Seleccione un proveedor primero</p>
                  <p className="text-sm text-gray-500 mt-1">Los productos se cargarán automáticamente</p>
                </>
              ) : cargandoAccesorios ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-gray-600">Cargando accesorios del proveedor...</p>
                </>
              ) : accesorios.length === 0 ? (
                <>
                  <p className="text-orange-600 font-semibold">⚠️ Este proveedor no tiene accesorios disponibles</p>
                  <p className="text-sm text-gray-500 mt-1">Agregue accesorios a este proveedor primero</p>
                </>
              ) : (
                <>
                  <p className="text-gray-600">No hay productos agregados</p>
                  <p className="text-sm text-gray-500 mt-1">Haga clic en "Agregar Producto"</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const accesoriosFiltrados = filtrarAccesorios(idx);
                
                return (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Producto *</label>
                      
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar producto..."
                          value={busquedaProducto[idx] || ""}
                          onChange={e => setBusquedaProducto({...busquedaProducto, [idx]: e.target.value})}
                          className="w-full border border-gray-300 rounded px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <select 
                        required 
                        value={item.accesorio} 
                        onChange={e => handleItemChange(idx, "accesorio", e.target.value)} 
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        disabled={cargandoAccesorios}
                      >
                        <option value="">Seleccionar...</option>
                        {accesoriosFiltrados.length > 0 ? (
                          accesoriosFiltrados.map(a => (
                            <option 
                              key={a.id} 
                              value={a.id}
                              className={!a.activo ? 'text-orange-600 font-semibold' : ''}
                            >
                              {a.nombre} (Stock: {a.stock || 0})
                              {!a.activo ? ' ⚠️ INACTIVO' : ''}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {cargandoAccesorios ? "Cargando..." : "No hay productos disponibles"}
                          </option>
                        )}
                      </select>
                      
                      {busquedaProducto[idx] && accesoriosFiltrados.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          No se encontraron productos con "{busquedaProducto[idx]}"
                        </p>
                      )}
                    </div>
                    
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad *</label>
                      <input 
                        type="number" 
                        min={1}
                        max={20}
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
                );
              })}
            </div>
          )}
        </div>

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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button"
            onClick={() => {
              setProveedor("");
              setItems([]);
              setNotas("");
              setTipoPago("efectivo");
              setBusquedaProducto({});
              setAccesorios([]);
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
      {/* Modal de alerta de stock */}
      <AlertDialog open={mostrarAlertaStock} onOpenChange={setMostrarAlertaStock}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-xl flex items-center gap-2">
              ⚠️ No se puede completar la compra
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              <div className="mt-4 space-y-4">
                <p className="font-semibold text-gray-700">
                  Los siguientes productos superarían el stock máximo de 200 unidades:
                </p>
                
                {erroresStockMensaje.map((error, index) => (
                  <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="font-bold text-red-800 mb-2">{error.nombre}</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>• Stock actual: <span className="font-semibold">{error.stockActual}</span> unidades</p>
                      <p>• Cantidad a comprar: <span className="font-semibold">{error.cantidadCompra}</span> unidades</p>
                      <p>• Stock resultante: <span className="font-semibold text-red-600">{error.stockFinal}</span> unidades</p>
                      <p className="text-red-600 font-semibold">⚠️ Excede en {error.exceso} unidades el máximo permitido</p>
                    </div>
                  </div>
                ))}
                
                <p className="text-sm text-gray-600 italic mt-4">
                  Por favor, reduce la cantidad a comprar para continuar.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setMostrarAlertaStock(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}