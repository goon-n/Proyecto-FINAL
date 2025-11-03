import { CheckCircle } from "lucide-react";

export default function PaymentSuccess({ planName }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-800">¡Pago exitoso! 🎉</h3>
          <p className="text-slate-600 mb-4">
            Tu suscripción al plan <span className="font-bold text-emerald-600">{planName}</span> fue confirmada.
          </p>
          <p className="text-sm text-slate-500">
            Redirigiendo al login...
          </p>
        </div>
      </div>
    </div>
  );
}