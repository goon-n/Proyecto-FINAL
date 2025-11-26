import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";

const HeaderSocio = ({ user, logout }) => {
  return (
    <div className="max-w-6xl mx-auto mb-6">
      <Card className="bg-white border-l-4 border-l-primary shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
              ¡Hola, {user.username}! 👋
            </CardTitle>
            <CardDescription className="text-lg mt-1">
              Panel de control personal
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Badge variant="secondary" className="text-sm px-3 py-1 h-9 flex items-center">
              <User className="mr-2 h-3 w-3" />
              {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
            </Badge>
            <Button onClick={logout} variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default HeaderSocio;