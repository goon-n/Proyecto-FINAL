// src/components/usuarios/AgregarSocioConPago.jsx - CON LÓGICA DE COMPRAS

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, CreditCard, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";
import ModalPagoTarjeta from "../caja/ModalPagoTarjeta";

export const AgregarSocioConPago = ({ onSocioCreado }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [modalTarjetaAbierto, setModalTarjetaAbierto] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState(null);
  
  // ✅ Estado de la caja (igual que en CompraAdd)
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [cargandoCaja, setCargandoCaja] = useState(true);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    nombre: "",
    telefono: "",
    plan_id: "",
    monto_pago: "",
    metodo_pago: "efectivo"
  });

  useEffect(() => {
    verificarCajaAbierta();
  }, []);

  useEffect(() => {
    if (mostrarFormulario) {
      cargarPlanes();
    }
  }, [mostrarFormulario]);

  // ✅ VERIFICAR CAJA (igual que en CompraAdd)
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

  const cargarPlanes = async () => {
    try {
      const data = await api.listarPlanesActivos();
      setPlanes(data);
      
      if (data.length > 0) {
        setFormData(prev => ({
          ...prev,
          plan_id: data[0].id,
          monto_pago: data[0].precio
        }));
        setPlanSeleccionado(data[0]);
      }
    } catch (error) {
      console.error("Error al cargar planes:", error);
      toast.error("Error al cargar planes de membresía");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "plan_id") {
      const plan = planes.find(p => p.id === parseInt(value));
      setPlanSeleccionado(plan);
      setFormData({
        ...formData,
        [name]: value,
        monto_pago: plan ? plan.precio : ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ VALIDAR CAJA (igual que en CompraAdd)
    if (!cajaAbierta) {
      toast.error("⚠️ No hay caja abierta. Debe abrir una caja antes de registrar pagos.");
      return;
    }
    
    if (!formData.username) {
      toast.error("El nombre de usuario es obligatorio");
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      toast.error("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    if (!formData.nombre) {
      toast.error("El nombre completo es obligatorio");
      return;
    }

    if (!formData.plan_id) {
      toast.error("Debe seleccionar un plan");
      return;
    }

    if (!formData.monto_pago || parseFloat(formData.monto_pago) <= 0) {
      toast.error("El monto del pago es obligatorio");
      return;
    }

    if (formData.metodo_pago === "tarjeta") {
      setModalTarjetaAbierto(true);
      return;
    }

    procesarCreacionSocio();
  };

  const handlePagoTarjeta = async (datosTarjeta) => {
    setDatosTarjeta(datosTarjeta);
    setModalTarjetaAbierto(false);
    await procesarCreacionSocio(datosTarjeta);
  };

  const procesarCreacionSocio = async (datosTarjeta = null) => {
    setGuardando(true);
    try {
      const usuarioData = {
        username: formData.username,
        password: formData.password,
        email: formData.email
      };
      
      console.log("📤 Creando usuario:", usuarioData);
      const usuarioCreado = await api.crearUsuario(usuarioData);
      console.log("✅ Usuario creado:", usuarioCreado);
      
      const cuotaData = {
        socio: usuarioCreado.user.id,
        plan: parseInt(formData.plan_id),
        monto: parseFloat(formData.monto_pago),
        metodo_pago: formData.metodo_pago,
        ...(datosTarjeta && { tarjeta_ultimos_4: datosTarjeta.ultimos4 })
      };
      
      console.log("📤 Creando cuota con pago:", cuotaData);
      const cuotaResponse = await api.crearCuotaConPago(cuotaData);
      console.log("✅ Cuota creada:", cuotaResponse);
      
      const mensajeTarjeta = datosTarjeta ? ` - Tarjeta **** ${datosTarjeta.ultimos4}` : '';
      toast.success(`✅ Socio ${formData.nombre} creado con membresía ${planSeleccionado?.nombre}${mensajeTarjeta}`);
      
      setFormData({
        username: "",
        password: "",
        email: "",
        nombre: "",
        telefono: "",
        plan_id: planes[0]?.id || "",
        monto_pago: planes[0]?.precio || "",
        metodo_pago: "efectivo"
      });
      setPlanSeleccionado(planes[0] || null);
      setMostrarFormulario(false);
      setDatosTarjeta(null);
      
      if (onSocioCreado) onSocioCreado();
      
    } catch (error) {
      console.error("❌ Error completo:", error);
      
      // ✅ MANEJO DE ERROR DE CAJA (igual que en CompraAdd)
      if (error.response?.data?.error === 'No hay caja abierta') {
        toast.error("⚠️ " + error.response.data.detail);
        setCajaAbierta(null);
        verificarCajaAbierta();
      } else {
        const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
        toast.error("❌ " + errorMsg);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            <CardTitle>Agregar Nuevo Socio con Membresía</CardTitle>
          </div>
          
          <Button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            variant={mostrarFormulario ? "outline" : "default"}
            disabled={!cajaAbierta && !mostrarFormulario}
          >
            {mostrarFormulario ? "Cancelar" : "+ Agregar Socio"}
          </Button>
        </div>
      </CardHeader>

      {/* ✅ ESTADO DE CAJA (igual que en CompraAdd) */}
      <CardContent>
        {cargandoCaja ? (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded mb-4">
            <p className="text-gray-600 text-sm">🔄 Verificando estado de caja...</p>
          </div>
        ) : cajaAbierta ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={verificarCajaAbierta}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-bold text-red-800 text-sm">No hay caja abierta</p>
                <p className="text-red-700 text-sm mt-1">
                  Debe abrir una caja antes de crear socios con membresía.
                </p>
                <div className="mt-3 flex gap-2">
                  <a 
                    href="/admin/caja" 
                    className="inline-block bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Ir a Gestión de Caja
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={verificarCajaAbierta}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verificar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ FORMULARIO CON FIELDSET DISABLED (igual que en CompraAdd) */}
        {mostrarFormulario && (
          <fieldset disabled={!cajaAbierta} className={!cajaAbierta ? 'opacity-50' : ''}>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECCIÓN 1: DATOS DE ACCESO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Datos de Acceso</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Usuario * <span className="text-xs text-muted-foreground">(para login)</span></Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="usuario123"
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      disabled={guardando}
                      minLength={4}
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS PERSONALES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-sm">Datos Personales</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="3874123456"
                      disabled={guardando}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="socio@ejemplo.com"
                      disabled={guardando}
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: PLAN Y PAGO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-sm">Plan y Pago</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan_id">Plan de Membresía *</Label>
                    <select
                      id="plan_id"
                      name="plan_id"
                      value={formData.plan_id}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                      disabled={guardando || planes.length === 0}
                    >
                      {planes.length === 0 ? (
                        <option value="">Cargando planes...</option>
                      ) : (
                        planes.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.nombre} - ${plan.precio}
                          </option>
                        ))
                      )}
                    </select>
                    {planSeleccionado && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {planSeleccionado.frecuencia}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="monto_pago">Monto a Pagar *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="monto_pago"
                        name="monto_pago"
                        type="number"
                        value={formData.monto_pago}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        disabled={guardando}
                        className="pl-9"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="metodo_pago">Método de Pago *</Label>
                    <select
                      id="metodo_pago"
                      name="metodo_pago"
                      value={formData.metodo_pago}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                      disabled={guardando}
                    >
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="transferencia">🏦 Transferencia</option>
                      <option value="tarjeta">💳 Tarjeta</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BOTONES */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setFormData({
                      username: "",
                      password: "",
                      email: "",
                      nombre: "",
                      telefono: "",
                      plan_id: planes[0]?.id || "",
                      monto_pago: planes[0]?.precio || "",
                      metodo_pago: "efectivo"
                    });
                  }}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={guardando || !cajaAbierta}
                >
                  {guardando ? "Creando..." : "Crear Socio y Registrar Pago"}
                </Button>
              </div>
            </form>
          </fieldset>
        )}
      </CardContent>

      {/* Modal de Pago con Tarjeta */}
      <ModalPagoTarjeta
        isOpen={modalTarjetaAbierto}
        onClose={() => setModalTarjetaAbierto(false)}
        onSubmit={handlePagoTarjeta}
        monto={formData.monto_pago}
        descripcion={`Alta socio: ${formData.nombre} - Plan: ${planSeleccionado?.nombre || ''}`}
      />
    </Card>
  );
};