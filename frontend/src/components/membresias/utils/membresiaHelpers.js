// src/components/membresias/utils/membresiaHelpers.js

export const calcularDiasRestantes = (fechaVencimiento) => {
  if (!fechaVencimiento) return 0;
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

export const calcularEstadisticas = (cuotas) => {
  const total = cuotas.length;
  const activas = cuotas.filter(c => c.estadoCalculado === 'activa').length;
  const porVencer = cuotas.filter(c => c.estadoCalculado === 'porVencer').length;
  const vencidas = cuotas.filter(c => c.estado === 'vencida').length;
  
  return { total, activas, porVencer, vencidas };
};

export const getCuotaDisplay = (cuota) => {
  const planTipo = cuota.plan_info?.tipo_limite;
  const cantidadLimite = Number(cuota.plan_info?.cantidad_limite) || 0;
  const nombrePlanLower = (cuota.plan_nombre || '').toLowerCase();
  const matchX = nombrePlanLower.match(/\b(\d+)x\b/);
  const parsedFromName = matchX ? Number(matchX[1]) : null;
  const effectiveLimit = parsedFromName || cantidadLimite;
  const shouldCount = planTipo === 'semanal' && [2,3].includes(effectiveLimit);

  if (!shouldCount) {
    return { displayRestantes: '∞', displayTotal: '∞', shouldCount: false };
  }

  const total = effectiveLimit * 4;
  const restantesRaw = Number(cuota.clases_restantes ?? 0);
  const displayRestantes = Math.min(restantesRaw, total);
  return { displayRestantes, displayTotal: total, shouldCount: true };
};

export const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(precio || 0);
};

export const puedeRenovar = (cuota) => {
  return cuota.estado === 'vencida';
};