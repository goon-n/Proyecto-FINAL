import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, MapPin } from "lucide-react";

const PerfilCard = ({ user, onVerPerfil }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <User className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-indigo-900">Mi Perfil</CardTitle>
            <CardDescription>Datos personales y seguridad</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email || "Socio Activo"}</p>
              </div>
            </div>
            <Separator className="my-3 bg-indigo-200/50" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Gestiona tu dirección y contacto</span>
            </div>
          </div>
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={onVerPerfil}
          >
            <User className="mr-2 h-4 w-4" />
            Ir a mi Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerfilCard;