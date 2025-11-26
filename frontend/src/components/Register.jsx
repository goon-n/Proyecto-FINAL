// src/pages/Register.jsx - CON ESTILO LANDING

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, AlertCircle, Edit, Clock, RefreshCw } from "lucide-react";

import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const planFromNavigation = location.state?.selectedPlan;
  
  const [selectedPlan, setSelectedPlan] = useState(planFromNavigation || null);
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    telefono: ""
  });
  const [error, setError] = useState(null);
  
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [verificandoCaja, setVerificandoCaja] = useState(true);

  useEffect(() => {
    verificarEstadoCaja();
  }, []);

  const verificarEstadoCaja = async () => {
    try {
      setVerificandoCaja(true);
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
      setVerificandoCaja(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError("Debes seleccionar un plan para continuar");
      return;
    }
    
    if (!cajaAbierta) {
      setError("El gimnasio está cerrado. No se pueden procesar registros en este momento.");
      return;
    }
    
    setError(null);
    
    navigate("/payment", { 
      state: { 
        user: {
          username: formData.username,
          email: formData.email,
          nombre: formData.nombre,
          telefono: formData.telefono,
          password: formData.password
        }, 
        plan: selectedPlan 
      } 
    });
  };

  const handleBackToPlans = () => {
    navigate("/");
  };

  return (
    <div 
      className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/85"></div>

      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-[#00FF41] hover:text-[#00DD35] hover:bg-[#00FF41]/10 border border-[#00FF41]/30 hover:border-[#00FF41]"
        onClick={handleBackToPlans}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al inicio
      </Button>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo ADN FITNESS */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center border-4 border-[#00FF41] shadow-lg shadow-[#00FF41]/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl font-black text-[#00FF41] tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                ADN
              </div>
              <div className="text-sm font-bold text-[#00FF41] -mt-1" style={{ fontFamily: 'Impact, sans-serif' }}>
                FITNESS
              </div>
              <div className="text-[10px] text-[#00FF41] font-light tracking-widest">
                SALTA
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900/80 backdrop-blur-md border-2 border-[#00FF41]/30 shadow-2xl shadow-[#00FF41]/10">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-3xl font-black text-white">
              CREAR CUENTA
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Completá tus datos para registrarte
            </CardDescription>
          </CardHeader>

          <CardContent>
            {verificandoCaja ? (
              <div className="bg-gray-800/60 border border-gray-600 p-4 rounded-lg mb-6 flex items-center gap-3 backdrop-blur-sm">
                <div className="animate-spin">⏳</div>
                <span className="text-gray-300">Verificando disponibilidad del gimnasio...</span>
              </div>
            ) : !cajaAbierta ? (
              <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 border-2 border-red-500/50 p-6 rounded-lg mb-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-red-500/20 p-3 rounded-lg flex-shrink-0">
                    <Clock className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-300 mb-2">🚫 Gimnasio Cerrado</h3>
                    <p className="text-red-200 mb-3">
                      No podemos procesar registros en este momento porque el gimnasio está cerrado.
                    </p>
                    <div className="bg-black/40 border border-red-500/30 rounded-lg p-3 mb-3 backdrop-blur-sm">
                      <p className="font-semibold text-red-300 mb-1">⏰ Horario de Atención:</p>
                      <p className="text-lg font-bold text-red-400">Lunes a Domingo: 08:00 - 23:00 hs</p>
                    </div>
                    <p className="text-sm text-red-300 mb-3">
                      Por favor, volvé durante nuestro horario de atención para completar tu registro.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={verificarEstadoCaja}
                        className="border-red-500/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Verificar nuevamente
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleBackToPlans}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Volver al inicio
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {selectedPlan ? (
              <div className="bg-[#00FF41]/10 border border-[#00FF41]/30 p-4 rounded-lg mb-6 relative backdrop-blur-sm">
                <p className="text-sm text-gray-400 mb-1">
                  Plan seleccionado:
                </p>
                <p className="text-xl font-bold text-[#00FF41]">
                  {selectedPlan.name}
                </p>
                <p className="text-2xl font-black text-white">
                  ${selectedPlan.price}/mes
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                  onClick={handleBackToPlans}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-6 flex items-start gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-300 mb-1">
                    No hay plan seleccionado
                  </p>
                  <p className="text-sm text-red-200 mb-3">
                    Primero debes elegir un plan de suscripción.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleBackToPlans}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Ir a seleccionar plan
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 text-red-300 border border-red-500/50 p-3 rounded-lg text-sm mb-4 flex items-center gap-2 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <fieldset disabled={!cajaAbierta || !selectedPlan} className={!cajaAbierta ? 'opacity-50' : ''}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-gray-300 font-medium">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Juan Pérez"
                      value={formData.nombre}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]*$/.test(value)) {
                          setFormData({ ...formData, nombre: value });
                        }
                      }}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00FF41] focus:ring-[#00FF41]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300 font-medium">Usuario</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="juanperez"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00FF41] focus:ring-[#00FF41]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00FF41] focus:ring-[#00FF41]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-gray-300 font-medium">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="387 123-4567"
                      value={formData.telefono}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[\d\s\-]*$/.test(value) && value.length <= 15) {
                          setFormData({ ...formData, telefono: value });
                        }
                      }}
                      maxLength={15}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00FF41] focus:ring-[#00FF41]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password" className="text-gray-300 font-medium">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      minLength={6}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00FF41] focus:ring-[#00FF41]"
                    />
                  </div>
                </div>
                
                <Button                 
                  type="submit"
                  className="w-full h-11 bg-[#00FF41] hover:bg-[#00DD35] text-black font-bold shadow-lg shadow-[#00FF41]/30 transition-all duration-300"
                  disabled={!selectedPlan || !cajaAbierta}
                >
                  <CreditCard className="mr-2 h-4 w-7" />
                  Continuar al Pago
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-gray-400">
                      ¿Ya tenés cuenta?
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent border-2 border-[#00FF41]/50 text-[#00FF41] hover:bg-[#00FF41] hover:text-black font-semibold transition-all duration-300"
                  onClick={() => navigate("/login")}
                >
                  Iniciar Sesión
                </Button>
              </form>
            </fieldset>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center mt-6 text-gray-500 text-xs">
          <p>© 2025 ADN Fitness Salta. Sistema de gestión.</p>
        </div>
      </div>
    </div>
  );
}