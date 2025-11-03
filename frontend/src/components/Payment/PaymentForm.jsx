import { useState } from "react";
import { CreditCard, Lock, User, Calendar, Shield, AlertCircle } from "lucide-react";

export default function PaymentForm({ plan, onSubmit, isLoading }) {
  const [cardData, setCardData] = useState({
    numero: "",
    nombre: "",
    vencimiento: "",
    cvv: ""
  });
  const [error, setError] = useState(null);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const cardNumber = cardData.numero.replace(/\s/g, '');
    
    if (cardNumber.length !== 16) {
      setError("El número de tarjeta debe tener 16 dígitos");
      return;
    }

    if (cardData.cvv.length !== 3) {
      setError("El CVV debe tener 3 dígitos");
      return;
    }

    if (!cardData.nombre.trim()) {
      setError("Ingresá el nombre del titular");
      return;
    }

    if (!cardData.vencimiento.match(/^\d{2}\/\d{2}$/)) {
      setError("Formato de vencimiento inválido (MM/AA)");
      return;
    }

    onSubmit(cardData);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-8 h-8 text-emerald-600" />
          <h2 className="text-3xl font-bold text-slate-800">Datos de pago</h2>
        </div>
        <p className="text-slate-600">Ingresa los datos de tu tarjeta (simulación)</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-md">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg shadow-md">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg shadow-md">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Número de tarjeta
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardData.numero}
              onChange={(e) => setCardData({ ...cardData, numero: formatCardNumber(e.target.value) })}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors disabled:bg-slate-100"
            />
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre del titular
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardData.nombre}
              onChange={(e) => setCardData({ ...cardData, nombre: e.target.value.toUpperCase() })}
              placeholder="JUAN PEREZ"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors uppercase disabled:bg-slate-100"
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Vencimiento
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardData.vencimiento}
                onChange={(e) => setCardData({ ...cardData, vencimiento: formatExpiry(e.target.value) })}
                placeholder="MM/AA"
                maxLength="5"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors disabled:bg-slate-100"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              CVV
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                placeholder="123"
                maxLength="3"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors disabled:bg-slate-100"
              />
              <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Procesando pago...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pagar ${plan.price?.toLocaleString()}
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Al confirmar el pago aceptas nuestros términos y condiciones
        </p>
      </form>
    </div>
  );
}