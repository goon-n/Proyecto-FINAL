import { useState } from "react";
import { CreditCard, Lock, User, Calendar, Shield, AlertCircle } from "lucide-react";

export default function PaymentForm({ plan, onSubmit, isLoading }) {
  const [cardData, setCardData] = useState({
    numero: "",
    nombre: "",
    vencimiento: "",
    cvv: ""
  });
  const [errors, setErrors] = useState({});
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

  // Validaciones
  const validateExpiry = (value) => {
    if (!value.match(/^\d{2}\/\d{2}$/)) return "Formato inválido (MM/AA)";
    
    const [month, year] = value.split('/').map(Number);
    
    if (month < 1 || month > 12) return "Mes inválido (01-12)";
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "Tarjeta vencida";
    }
    
    return "";
  };

  const validateNombre = (value) => {
    if (!value.trim()) return "Nombre requerido";
    if (value.length < 5) return "Mínimo 5 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "Solo letras y espacios";
    const words = value.trim().split(/\s+/);
    if (words.length < 2) return "Ingresa nombre y apellido";
    return "";
  };

  const validateCVV = (value) => {
    if (!value) return "CVV requerido";
    if (!/^\d{3}$/.test(value)) return "Debe tener 3 dígitos";
    return "";
  };

  const handleBlur = (field) => {
    let error = "";
    
    if (field === "vencimiento") {
      error = validateExpiry(cardData.vencimiento);
    } else if (field === "nombre") {
      error = validateNombre(cardData.nombre);
    } else if (field === "cvv") {
      error = validateCVV(cardData.cvv);
    }
    
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field, value) => {
    setCardData({ ...cardData, [field]: value });
    
    // Limpiar error si existe
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const cardNumber = cardData.numero.replace(/\s/g, '');
    
    // Validar todos los campos
    const newErrors = {
      numero: cardNumber.length !== 16 ? "Debe tener 16 dígitos" : "",
      nombre: validateNombre(cardData.nombre),
      vencimiento: validateExpiry(cardData.vencimiento),
      cvv: validateCVV(cardData.cvv)
    };

    setErrors(newErrors);

    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some(err => err !== "");
    
    if (hasErrors) {
      setError("Por favor, corrige los errores en el formulario");
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
              onChange={(e) => handleChange("numero", formatCardNumber(e.target.value))}
              onBlur={() => handleBlur("numero")}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors disabled:bg-slate-100 ${
                errors.numero ? "border-red-500" : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          {errors.numero && (
            <p className="text-xs text-red-500 mt-1">{errors.numero}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre del titular
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value.toUpperCase())}
              onBlur={() => handleBlur("nombre")}
              placeholder="JUAN PEREZ"
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors uppercase disabled:bg-slate-100 ${
                errors.nombre ? "border-red-500" : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          {errors.nombre && (
            <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
          )}
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
                onChange={(e) => handleChange("vencimiento", formatExpiry(e.target.value))}
                onBlur={() => handleBlur("vencimiento")}
                placeholder="MM/AA"
                maxLength="5"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors disabled:bg-slate-100 ${
                  errors.vencimiento ? "border-red-500" : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            {errors.vencimiento && (
              <p className="text-xs text-red-500 mt-1">{errors.vencimiento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              CVV
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) => handleChange("cvv", e.target.value.replace(/\D/g, '').slice(0, 3))}
                onBlur={() => handleBlur("cvv")}
                placeholder="123"
                maxLength="3"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors disabled:bg-slate-100 ${
                  errors.cvv ? "border-red-500" : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            {errors.cvv && (
              <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
            )}
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