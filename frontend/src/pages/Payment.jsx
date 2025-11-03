import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PaymentSummary from "../components/Payment/PaymentSummary";
import PaymentForm from "../components/Payment/PaymentForm";
import PaymentSuccess from "../components/Payment/PaymentSuccess";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, plan } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Sin datos de pago</h3>
            <p className="text-slate-600 mb-4">
              No hay información de registro. Por favor, volvé al inicio.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePaymentSubmit = (cardData) => {
    setIsLoading(true);

    setTimeout(() => {
      console.log("Pago simulado exitoso:", {
        usuario: user.nombre,
        plan: plan.name,
        monto: plan.price,
        ultimos_digitos: cardData.numero.replace(/\s/g, '').slice(-4)
      });
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "¡Registro exitoso! Ahora podés iniciar sesión." 
          } 
        });
      }, 2000);
    }, 1500);
  };

  if (success) {
    return <PaymentSuccess planName={plan.name} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
      <button
        className="absolute top-4 left-4 text-white hover:text-emerald-400 flex items-center gap-2 transition-colors"
        onClick={() => navigate("/register")}
        disabled={isLoading}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6">
        <PaymentSummary user={user} plan={plan} />
        <PaymentForm plan={plan} onSubmit={handlePaymentSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}