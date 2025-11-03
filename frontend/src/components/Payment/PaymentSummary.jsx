import { User, CheckCircle, Lock } from "lucide-react";

export default function PaymentSummary({ user, plan }) {
  return (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white shadow-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Resumen de compra</h2>
        <p className="text-emerald-100 opacity-90">Verifica los datos antes de pagar</p>
      </div>

      {/* Usuario */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">Información del socio</h3>
        </div>
        <div className="space-y-2 text-emerald-50">
          <p className="text-lg font-medium">{user.nombre}</p>
          <p className="text-sm opacity-90">{user.email}</p>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <div className="mb-4">
          <div className="inline-block bg-lime-400 text-emerald-900 px-3 py-1 rounded-full text-sm font-bold mb-3">
            {plan.name}
          </div>
          <p className="text-emerald-100 text-sm mb-3">{plan.frequency}</p>
          <div className="space-y-2">
            {plan.features?.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-lime-400" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-emerald-100">Total a pagar</span>
          <span className="text-4xl font-bold">${plan.price?.toLocaleString()}</span>
        </div>
        <p className="text-xs text-emerald-100 opacity-75">Primer mes - Renovación automática</p>
      </div>

      {/* Seguridad */}
      <div className="mt-6 flex items-center gap-2 text-emerald-100 text-sm">
        <Lock className="w-4 h-4" />
        <span>Pago seguro y encriptado</span>
      </div>
    </div>
  );
}