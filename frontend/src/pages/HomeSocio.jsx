import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, Calendar, Dumbbell, CreditCard, Clock } from "lucide-react";

const HomeSocio = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white from-green-900 via-green-800 to-emerald-900 p-6">
      {/* Header con nombre y botón de logout */}
      <div className="max-w-6xl mx-auto mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-3xl font-bold">
                ¡Hola, {user.username}! 💪
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Bienvenido a tu panel de socio
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-base px-4 py-2">
                {user.rol}
              </Badge>
              <Button onClick={logout} variant="destructive" size="lg">
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Grid de Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card de Clases */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-cyan-500" />
              <CardTitle className="text-2xl text-cyan-600">Tus Clases</CardTitle>
            </div>
            <CardDescription>
              Clases en las que estás inscripto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">Yoga</p>
                  <p className="text-sm text-muted-foreground">Lunes 18:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">Spinning</p>
                  <p className="text-sm text-muted-foreground">Miércoles 19:30</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">HIIT</p>
                  <p className="text-sm text-muted-foreground">Viernes 17:00</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <Button className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Ver todas las clases
            </Button>
          </CardContent>
        </Card>

        {/* Card de Rutinas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-2xl text-yellow-600">Tus Rutinas</CardTitle>
            </div>
            <CardDescription>
              Plan de entrenamiento personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-accent rounded-lg">
                <h4 className="font-semibold mb-2">Rutina de Tonificación</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Programa semanal enfocado en tonificación muscular general
                </p>
                <div className="flex gap-2">
                  <Badge>Lunes</Badge>
                  <Badge>Miércoles</Badge>
                  <Badge>Viernes</Badge>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <Button className="w-full" variant="outline">
              <Dumbbell className="mr-2 h-4 w-4" />
              Ver rutina completa
            </Button>
          </CardContent>
        </Card>

        {/* Card de Membresía */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-2xl text-blue-600">Membresía</CardTitle>
            </div>
            <CardDescription>
              Estado de tu suscripción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Cuota Activa
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Válida hasta 31/12/2025
                  </p>
                </div>
                <Badge className="bg-green-600">Activo</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">124</p>
                  <p className="text-xs text-muted-foreground">Días restantes</p>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">$45</p>
                  <p className="text-xs text-muted-foreground">Próximo pago</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <Button className="w-full" variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Ver detalles de pago
            </Button>
          </CardContent>
        </Card>

        {/* Card de Reserva de Turno */}
        <Card className="hover:shadow-lg transition-shadow border-2 border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Reservar Turno</CardTitle>
            </div>
            <CardDescription>
              Reservá tu próxima clase o sesión de entrenamiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Tenés turnos disponibles para reservar en las siguientes actividades:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full"></span>
                  Clases grupales
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full"></span>
                  Entrenamiento personalizado
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full"></span>
                  Evaluación física
                </li>
              </ul>
            </div>
            <Button className="w-full" size="lg">
              <Calendar className="mr-2 h-5 w-5" />
              Reservar Ahora
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default HomeSocio;