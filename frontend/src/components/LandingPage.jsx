import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Users, TrendingUp, CheckCircle, Zap, Trophy, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import api from '@/api/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🆕 CARGAR PLANES DESDE LA API
  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    setLoading(true);
    try {
      const data = await api.listarPlanes(); // Usa tu método existente
      
      // Mapear los datos de la API al formato que espera tu componente
      const planesFormateados = data.map(plan => ({
        id: plan.id,
        name: plan.nombre,
        price: parseFloat(plan.precio).toLocaleString('es-AR'), // Formatear precio
        frequency: plan.frecuencia,
        features: plan.features || [],
        popular: plan.es_popular,
        icon: obtenerIcono(plan.nombre) // Función helper para asignar íconos
      }));
      
      setPlans(planesFormateados);
    } catch (error) {
      console.error("Error al cargar planes:", error);
      // Si falla, usar planes por defecto (opcional)
      setPlans([
        {
          id: 1,
          name: "2x Semanal",
          price: "18.000",
          frequency: "2 veces por semana",
          features: [
            "Acceso sala de musculación",
            "Asesoramiento básico"
          ],
          popular: false,
          icon: Dumbbell
        },
        {
          id: 2,
          name: "3x Semanal",
          price: "24.000",
          frequency: "3 veces por semana",
          features: [
            "Acceso sala de musculación", 
            "Seguimiento mensual",
          ],
          popular: false,
          icon: TrendingUp
        },
        {
          id: 3,
          name: "Pase Libre",
          price: "32.000",
          frequency: "Todos los días",
          features: [
            "Acceso ilimitado", 
            "Seguimiento semanal",
            "Prioridad en turnos"
          ],
          popular: true,
          icon: Trophy
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Asignar íconos según el nombre del plan
  const obtenerIcono = (nombrePlan) => {
    if (nombrePlan.toLowerCase().includes('libre')) return Trophy;
    if (nombrePlan.toLowerCase().includes('3x')) return TrendingUp;
    return Dumbbell;
  };

  const handleSelectPlan = (plan) => {
    // Crear una copia del plan SIN el ícono
    const planData = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      frequency: plan.frequency,
      features: plan.features,
      popular: plan.popular
    };
    
    navigate('/register', { state: { selectedPlan: planData } });
  };

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00FF41] mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando planes...</p>
        </div>
      </div>
    );
  }

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
      
      {/* BOTONES LOGIN Y REGISTRO - ESQUINA SUPERIOR DERECHA */}
      <div className="absolute top-4 right-4 z-20 flex gap-3">
        <Button
          variant="outline"
          className="bg-transparent border-2 border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41] hover:text-black transition-all duration-300 font-semibold"
          onClick={() => navigate('/login')}
        >
          Iniciar Sesión
        </Button>
        <Button
          className="bg-[#00FF41] text-black hover:bg-[#00DD35] transition-all duration-300 font-semibold"
          onClick={() => navigate('/register')}
        >
          Registrarse
        </Button>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        
        {/* Header con Logo y INFO */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center border-4 border-[#00FF41] shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-center">
                <div className="text-3xl font-black text-[#00FF41] tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                  ADN
                </div>
                <div className="text-base font-bold text-[#00FF41] -mt-1" style={{ fontFamily: 'Impact, sans-serif' }}>
                  FITNESS
                </div>
                <div className="text-xs text-[#00FF41] font-light tracking-widest">
                  SALTA
                </div>
              </div>
            </div>
          </div>

          {/* INFO: Ubicación, Horarios, Contacto */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="bg-black/60 backdrop-blur-md border border-[#00FF41]/40 rounded-full px-4 py-2 flex items-center gap-2 hover:border-[#00FF41] transition-all duration-200">
              <span className="text-[#00FF41]">📍</span>
              <span className="text-gray-200 text-sm">Sarmiento 799, Salta</span>
            </div>
            
            <div className="bg-black/60 backdrop-blur-md border border-[#00FF41]/40 rounded-full px-4 py-2 flex items-center gap-2 hover:border-[#00FF41] transition-all duration-200">
              <span className="text-[#00FF41]">🕐</span>
              <span className="text-gray-200 text-sm">Lun-Vie 6:00-23:00</span>
            </div>
            
            <div className="bg-black/60 backdrop-blur-md border border-[#00FF41]/40 rounded-full px-4 py-2 flex items-center gap-2 hover:border-[#00FF41] transition-all duration-200">
              <span className="text-[#00FF41]">📞</span>
              <span className="text-gray-200 text-sm">(387) 123-4567</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-3 text-white drop-shadow-2xl">
            TRANSFORMÁ TU <span className="text-[#00FF41]">CUERPO</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-4 text-gray-300 font-light">
            El gimnasio más completo de Salta
          </p>

          <div className="inline-block bg-black/60 backdrop-blur-md px-5 py-2 rounded-full border border-[#00FF41]/40 mb-6 hover:border-[#00FF41] transition-all duration-200">
            <p className="text-sm text-gray-200">
              💪 <span className="font-bold text-[#00FF41]">Pase diario:</span> $4.000
            </p>
          </div>
        </div>

        {/* Grid de Planes - Centrado con 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id}
                className={`bg-gray-900/80 backdrop-blur-sm border-2 ${
                  plan.popular 
                    ? 'border-[#00FF41] shadow-lg shadow-[#00FF41]/20' 
                    : 'border-gray-700'
                } transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:border-[#00FF41] hover:shadow-xl hover:shadow-[#00FF41]/30 cursor-pointer relative overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-[#00FF41] text-black text-xs font-bold py-1 text-center flex items-center justify-center gap-1">
                    <Trophy className="w-3 h-3" />
                    MÁS POPULAR
                  </div>
                )}
                
                <CardHeader className={`pb-4 ${plan.popular ? 'pt-8' : 'pt-6'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className={`w-8 h-8 ${plan.popular ? 'text-[#00FF41]' : 'text-gray-400'}`} />
                  </div>
                  <CardTitle className="text-2xl font-black text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm font-medium">{plan.frequency}</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="mb-5">
                    <span className="text-4xl font-black text-[#00FF41]">${plan.price}</span>
                    <span className="text-gray-400 text-base ml-1">/mes</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#00FF41] mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-3">
                  <Button 
                    className={`w-full font-bold text-sm ${
                      plan.popular
                        ? 'bg-[#00FF41] hover:bg-[#00DD35] text-black shadow-lg' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                    } transition-all duration-300`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <Zap className="mr-2 w-4 h-4" />
                    ELEGIR PLAN
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#00FF41]" />
              <span>Equipamiento Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00FF41]" />
              <span>Sistema de Turnos</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00FF41]" />
              <span>Entrenadores Certificados</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">© 2025 ADN Fitness Salta. Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;