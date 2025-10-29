import React, { useState } from "react";
import { createCaja } from "../../services/caja.service";

export default function CajaAdd({ onChange }) {
  const [monto_inicial, setMontoInicial] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    createCaja({ monto_inicial }).then(() => {
      setMontoInicial("");
      if (onChange) onChange(); // Recarga desde el padre
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={monto_inicial}
        onChange={e => setMontoInicial(e.target.value)}
        placeholder="Monto inicial"
      />
      <button type="submit">Abrir caja</button>
    </form>
  );
}
