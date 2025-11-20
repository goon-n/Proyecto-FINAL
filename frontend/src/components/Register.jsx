// src/pages/Register.jsx - SIN CARTEL VERDE DE CAJA ABIERTA

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
    confirmPassword: "",
    telefono: ""
  });
  const [error, setError] = useState(null);
  
  // ✅ Estados para verificación de caja
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [verificandoCaja, setVerificandoCaja] = useState(true);

  // ✅ Verificar estado de caja al cargar
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
      setErrors({ general: "Debes seleccionar un plan para continuar" });
      return;
    }

    // Validar todos los campos
    const newErrors = {};
    Object.keys(validations).forEach(field => {
      const error = validations[field](formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      newErrors.general = "Por favor, corrige los errores";
      return;
    }
    
    // ✅ BLOQUEAR SI LA CAJA ESTÁ CERRADA - NO NAVEGAR
    if (!cajaAbierta) {
      setError("El gimnasio está cerrado. No se pueden procesar registros en este momento.");
      return;
    }
    
    setError(null);
    
    // ✅ Solo navega si TODO está OK
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
    <div className="min-h-screen bg-white from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={handleBackToPlans}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al inicio
      </Button>

      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-center">
            Completá tus datos para registrarte
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ✅ SOLO MOSTRAR ALERTS CUANDO HAY PROBLEMA */}
          {verificandoCaja ? (
            <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg mb-6 flex items-center gap-3">
              <div className="animate-spin">⏳</div>
              <span className="text-gray-700">Verificando disponibilidad del gimnasio...</span>
            </div>
          ) : !cajaAbierta ? (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 p-6 rounded-lg mb-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-red-200 p-3 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-red-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 mb-2">🚫 Gimnasio Cerrado</h3>
                  <p className="text-red-800 mb-3">
                    No podemos procesar registros en este momento porque el gimnasio está cerrado.
                  </p>
                  <div className="bg-white border border-red-300 rounded-lg p-3 mb-3">
                    <p className="font-semibold text-red-900 mb-1">⏰ Horario de Atención:</p>
                    <p className="text-lg font-bold text-red-700">Lunes a Domingo: 08:00 - 23:00 hs</p>
                  </div>
                  <p className="text-sm text-red-700 mb-3">
                    Por favor, volvé durante nuestro horario de atención para completar tu registro.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={verificarEstadoCaja}
                      className="border-red-300 text-red-700 hover:bg-red-50"
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
          {/* ✅ SI CAJA ABIERTA: NO MOSTRAR NADA (null) */}

          {selectedPlan ? (
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-6 relative">
              <p className="text-sm text-muted-foreground mb-1">
                Plan seleccionado:
              </p>
              <p className="text-xl font-bold text-primary">
                {selectedPlan.name}
              </p>
              <p className="text-2xl font-black">
                ${selectedPlan.price}/mes
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleBackToPlans}
              >
                <Edit className="w-4 h-4 mr-1" />
                Cambiar
              </Button>
            </div>
          ) : (
            <div className="bg-destructive/15 border border-destructive/30 p-4 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-1">
                  No hay plan seleccionado
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Primero debes elegir un plan de suscripción.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBackToPlans}
                >
                  Ir a seleccionar plan
                </Button>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="bg-destructive/15 text-destructive border border-destructive/30 p-3 rounded-md text-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.general}
            </div>
          )}

          {/* ✅ DESHABILITAR FORMULARIO SI CAJA CERRADA */}
          <fieldset disabled={!cajaAbierta || !selectedPlan} className={!cajaAbierta ? 'opacity-50' : ''}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="juanperez"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="387 123-4567"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Contraseña</Label>
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
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedPlan || !cajaAbierta}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Continuar al Pago
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ¿Ya tenés cuenta?
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </Button>
            </form>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}