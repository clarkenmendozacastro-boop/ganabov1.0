// src/utils/proyecciones.js
export const calcularProyeccion = (pesoActual, pesoMeta, gdp, razaObj) => {
  if (pesoMeta <= pesoActual || gdp <= 0) return null;
  const dias = Math.ceil((pesoMeta - pesoActual) / gdp);
  const pc = razaObj ? razaObj.pc_canal : 0.52;
  const canal = Math.round(pesoMeta * pc);
  const huesos = Math.round(canal * 0.2);
  return {
    dias,
    meses: (dias / 30).toFixed(1),
    canal,
    carneLimpia: canal - huesos,
    huesos,
    viseras: Math.round(pesoMeta * 0.08),
  };
};
