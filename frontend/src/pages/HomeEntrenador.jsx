// frontend/src/pages/HomeEntrenador.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LogOut, 
  Calendar, 
  Users, 
  DollarSign, 
  CreditCard, 
  Dumbbell, 
  Package, 
  FileText, 
  Truck, 
  Settings,
  Box 
} from "lucide-react";
import { SeccionTurnos } from "../components/shared/SeccionTurnos"; // ✨ AGREGAR ESTO

const HomeEntrenador = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div className="text-white text-center mt-10">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white from-green-900 via-green-800 to-emerald-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-3xl font-bold">
                ¡Bienvenido, {user.username}! 💪
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Panel de entrenador
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

      {/* Grid de secciones */}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ✨ REEMPLAZAR toda esta Card por: */}
        <SeccionTurnos mostrarBotonCrear={true} />

        {/* Tareas de Administración */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-2xl text-yellow-600">Tareas de Administración</CardTitle>
            </div>
            <CardDescription>
              Gestioná todos los aspectos del gimnasio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button 
                onClick={() => navigate("/entrenador/usuarios")} 
                variant="outline" 
                size="lg"
                className="justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Gestión de Usuarios
              </Button>
              <Button 
                onClick={() => navigate("/entrenador/caja")} 
                variant="outline" 
                size="lg"
                className="justify-start"
              >
                <Box className="mr-2 h-4 w-4 text-green-600" />
                Gestión de Caja
              </Button>
              <Button variant="outline" size="lg" className="justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Planes y Precios
              </Button>
              <Button variant="outline" size="lg" className="justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Membresías
              </Button>
              <Button variant="outline" size="lg" className="justify-start">
                <Dumbbell className="mr-2 h-4 w-4" />
                Clases
              </Button>
              <Button 
                onClick={() => navigate("/entrenador/accesorios")} 
                variant="outline" 
                size="lg" 
                className="justify-start"
              >
                <Package className="mr-2 h-4 w-4" />
                Accesorios
              </Button>
              <Button variant="outline" size="lg" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Asignar Rutinas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración General */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-2xl text-blue-600">Configuración General</CardTitle>
            </div>
            <CardDescription>
              Ajustes de perfil y sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="lg">
              <Settings className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default HomeEntrenador;