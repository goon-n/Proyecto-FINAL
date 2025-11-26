// src/components/Login.jsx - REDISEÑADO CON ESTILO LANDING
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Lock, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const user = await login(username, password);
      console.log("Login exitoso:", user);
      console.log("Rol del usuario:", user.rol);

      // Redirigir según rol
      if (user.rol === "admin") navigate("/admin");
      else if (user.rol === "entrenador") navigate("/entrenador");
      else if (user.rol === "socio") navigate("/socio");
    } catch (err) {
      setError(err.message || "Usuario o contraseña incorrecta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/85"></div>

      {/* Botón Volver */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-[#00FF41] hover:text-[#00DD35] hover:bg-[#00FF41]/10 border border-[#00FF41]/30 hover:border-[#00FF41]"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al inicio
      </Button>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo ADN FITNESS */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center border-4 border-[#00FF41] shadow-lg shadow-[#00FF41]/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl font-black text-[#10e645] tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                ADN
              </div>
              <div className="text-sm font-bold text-[#10e645] -mt-1" style={{ fontFamily: 'Impact, sans-serif' }}>
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
              INICIAR SESIÓN
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Ingresá tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/20 text-red-300 border border-red-500/50 p-3 rounded-lg text-sm backdrop-blur-sm animate-shake">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300 font-medium">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Tu nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00FF41] focus:ring-[#00FF41] h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00FF41] focus:ring-[#00FF41] h-12"
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="w-56 h-12 bg-[#00FF41] hover:bg-[#00DD35] text-black font-bold text-base shadow-lg shadow-[#00FF41]/30 transition-all duration-300 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Ingresar
                    </>
                  )}
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-3 text-gray-400 font-medium">
                    ¿No tenés cuenta?
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-transparent border-2 border-[#00FF41]/50 text-[#00FF41] hover:bg-[#00FF41] hover:text-black font-semibold transition-all duration-300"
                  onClick={() => navigate("/register")}
                  disabled={isLoading}
                >
                  Crear Cuenta Nueva
                </Button>
              </div>
            </form>
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