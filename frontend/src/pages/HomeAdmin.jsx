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
  Settings 
} from "lucide-react";

const HomeAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div className="text-white text-center mt-10">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white from-green-900 via-green-800 to-emerald-900 p-6">
      {/* Header con nombre y botón de logout */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-3xl font-bold">
                ¡Bienvenido, {user.username}!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Panel de administración del gimnasio
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
        
        {/* Gestión de Turnos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-cyan-500" />
              <CardTitle className="text-2xl text-cyan-600">Gestión de Turnos</CardTitle>
            </div>
            <CardDescription>
              Administrá los turnos y horarios de clases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Todos los Turnos
              </Button>
              <Button variant="outline" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Crear Nuevo Cupo
              </Button>
            </div>
          </CardContent>
        </Card>

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
                onClick={() => navigate("/admin/usuarios")}
                variant="outline" 
                size="lg"
                className="justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Gestión de Usuarios
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
              
              <Button variant="outline" size="lg" className="justify-start">
                <Package className="mr-2 h-4 w-4" />
                Accesorios
              </Button>
              
              <Button variant="outline" size="lg" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Asignar Rutinas
              </Button>
              
              <Button variant="outline" size="lg" className="justify-start">
                <Truck className="mr-2 h-4 w-4" />
                Proveedores
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

export default HomeAdmin;