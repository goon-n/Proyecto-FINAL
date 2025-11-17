import React, { useState } from "react";
import { CreditCard, X, Calendar, Shield, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ModalPagoTarjeta({ isOpen, onClose, onSubmit, monto, descripcion }) {
  const [cardData, setCardData] = useState({
    numero: "",
    nombre: "",
    vencimiento: "",
    cvv: ""
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

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

  const handleSubmit = async (e) => {
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

    setGuardando(true);
    try {
      const ultimos4 = cardNumber.slice(-4);
      await onSubmit({
        ...cardData,
        ultimos4
      });
      
      // Limpiar y cerrar
      setCardData({ numero: "", nombre: "", vencimiento: "", cvv: "" });
      onClose();
    } catch (error) {
      setError(error.message || "Error al procesar el pago");
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Pago con Tarjeta</h2>
          </div>
          <button
            onClick={onClose}
            disabled={guardando}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600 mb-1">Monto a cobrar</p>
            <p className="text-3xl font-bold text-blue-600">${Number(monto).toFixed(2)}</p>
            {descripcion && (
              <p className="text-sm text-slate-600 mt-2">{descripcion}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Iconos de tarjetas */}
          <div className="flex gap-3 mb-6">
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

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Número de tarjeta */}
            <div>
              <Label htmlFor="numero">Número de tarjeta *</Label>
              <div className="relative">
                <Input
                  id="numero"
                  type="text"
                  value={cardData.numero}
                  onChange={(e) => setCardData({ ...cardData, numero: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                  disabled={guardando}
                  className="pr-10"
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            {/* Nombre del titular */}
            <div>
              <Label htmlFor="nombre">Nombre del titular *</Label>
              <div className="relative">
                <Input
                  id="nombre"
                  type="text"
                  value={cardData.nombre}
                  onChange={(e) => setCardData({ ...cardData, nombre: e.target.value.toUpperCase() })}
                  placeholder="JUAN PEREZ"
                  required
                  disabled={guardando}
                  className="pr-10 uppercase"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Vencimiento */}
              <div>
                <Label htmlFor="vencimiento">Vencimiento *</Label>
                <div className="relative">
                  <Input
                    id="vencimiento"
                    type="text"
                    value={cardData.vencimiento}
                    onChange={(e) => setCardData({ ...cardData, vencimiento: formatExpiry(e.target.value) })}
                    placeholder="MM/AA"
                    maxLength="5"
                    required
                    disabled={guardando}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* CVV */}
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    placeholder="123"
                    maxLength="3"
                    required
                    disabled={guardando}
                    className="pr-10"
                  />
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={guardando}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardando}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {guardando ? "Procesando..." : `Cobrar $${Number(monto).toFixed(2)}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}