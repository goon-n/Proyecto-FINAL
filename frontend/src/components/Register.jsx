import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, AlertCircle, Edit } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener el plan desde el state de la navegación
  const planFromNavigation = location.state?.selectedPlan;
  
  const [selectedPlan, setSelectedPlan] = useState(planFromNavigation || null);
  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    email: "",
    password: "",
    telefono: ""
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError("Debes seleccionar un plan para continuar");
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      // Aquí va tu lógica de registro con el backend
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plan_id: selectedPlan?.id,
          rol: "socio"
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Pasar la info al pago por navegación (NO localStorage)
        navigate("/payment", { 
          state: { 
            user: data, 
            plan: selectedPlan 
          } 
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error en el registro");
      }
    } catch (err) {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPlans = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 relative">
      {/* Botón volver */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:text-[#00FF41]"
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
          {/* Plan seleccionado */}
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

          {error && (
            <div className="bg-destructive/15 text-destructive border border-destructive/30 p-3 rounded-md text-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

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
                  disabled={isLoading || !selectedPlan}
                />
              </div>

              <div className="space-y-2">

                <Label htmlFor="nombre">Usuario</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="juanperez"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  disabled={isLoading || !selectedPlan}
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
                  disabled={isLoading || !selectedPlan}
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
                  disabled={isLoading || !selectedPlan}
                />
              </div>

              <div className="space-y-2">
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
                  disabled={isLoading || !selectedPlan}
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !selectedPlan}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isLoading ? "Procesando..." : "Continuar al Pago"}
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
              disabled={isLoading}
            >
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}