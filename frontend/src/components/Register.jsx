import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, AlertCircle, Edit } from "lucide-react";

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
  const [errors, setErrors] = useState({});

  // Validaciones
  const validations = {
    nombre: (v) => {
      if (!v.trim()) return "Nombre requerido";
      if (v.length < 3) return "Mínimo 3 caracteres";
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return "Solo letras";
      if (v.trim().split(/\s+/).length < 2) return "Ingresa nombre y apellido";
      return "";
    },
    username: (v) => {
      if (!v.trim()) return "Usuario requerido";
      if (v.length < 4 || v.length > 30) return "Entre 4 y 30 caracteres";
      if (!/^[a-zA-Z0-9_-]+$/.test(v)) return "Solo letras, números, - y _";
      return "";
    },
    email: (v) => {
      if (!v.trim()) return "Email requerido";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Email inválido";
      const domain = v.split('@')[1]?.toLowerCase();
      if (!['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com'].includes(domain)) {
        return "Usa gmail, hotmail, outlook, yahoo o live";
      }
      return "";
    },
    password: (v) => {
      if (!v) return "Contraseña requerida";
      if (v.length < 8) return "Mínimo 8 caracteres";
      if (!/[A-Z]/.test(v)) return "Incluye una mayúscula";
      if (!/[a-z]/.test(v)) return "Incluye una minúscula";
      if (!/[0-9]/.test(v)) return "Incluye un número";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(v)) return "Incluye un símbolo";
      return "";
    },
    confirmPassword: (v) => {
      if (!v) return "Confirma tu contraseña";
      if (v !== formData.password) return "Las contraseñas no coinciden";
      return "";
    },
    telefono: (v) => {
      if (!v.trim()) return "Teléfono requerido";
      const clean = v.replace(/[\s-]/g, '');
      if (!/^[0-9]+$/.test(clean)) return "Solo números";
      if (clean.length < 10 || clean.length > 15) return "Entre 10 y 15 dígitos";
      return "";
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: validations[field](value) });
    }
    // Re-validar confirmPassword si se cambia password
    if (field === "password" && formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: value !== formData.confirmPassword ? "Las contraseñas no coinciden" : "" }));
    }
  };

  const handleBlur = (field) => {
    setErrors({ ...errors, [field]: validations[field](formData[field]) });
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
    
    // Navegar al pago
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  onBlur={() => handleBlur("nombre")}
                  disabled={!selectedPlan}
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && (
                  <p className="text-xs text-red-500">{errors.nombre}</p>
                )}
              </div>

              {/* Usuario */}
              <div className="space-y-2">
                <Label htmlFor="username">Usuario *</Label>
                <Input
                  id="username"
                  placeholder="juanperez"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  onBlur={() => handleBlur("username")}
                  disabled={!selectedPlan}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={!selectedPlan}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="387 123-4567"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  onBlur={() => handleBlur("telefono")}
                  disabled={!selectedPlan}
                  className={errors.telefono ? "border-red-500" : ""}
                />
                {errors.telefono && (
                  <p className="text-xs text-red-500">{errors.telefono}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres, mayúsculas, números y símbolos"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={!selectedPlan}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  disabled={!selectedPlan}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!selectedPlan}
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
        </CardContent>
      </Card>
    </div>
  );
}