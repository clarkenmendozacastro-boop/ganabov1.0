// src/utils/venta.js
import { calcularGDP as calcularGDPHelper } from "./helpers";

// Re-exportar calcularGDP desde helpers para mantener compatibilidad
export const calcularGDP = calcularGDPHelper;

// Función para evaluar si conviene vender un animal
export const evaluarVenta = (pesoActual, gdp, razaObj) => {
  const gdpEsperado = razaObj ? razaObj.gdp_base : 0.78;
  const eficiencia = gdp >= gdpEsperado * 0.85 ? "buena" : gdp >= gdpEsperado * 0.6 ? "regular" : "baja";
  let recomendacion = "";
  let conviene = false;

  if (pesoActual >= 450) {
    conviene = true;
    recomendacion = "Animal en peso óptimo (450+ kg). Evalúe venta inmediata.";
  } else if (eficiencia === "baja" && pesoActual >= 380) {
    conviene = true;
    recomendacion = "Conversión baja y peso cercano al comercial. Puede ser más rentable vender ahora.";
  } else if (eficiencia === "baja") {
    recomendacion = "Conversión baja pero peso insuficiente. Ajuste la ración primero.";
  } else {
    recomendacion = `Buena conversión (${gdp.toFixed(2)} kg/día). Continúe hasta 430-450 kg.`;
  }

  return { eficiencia, recomendacion, conviene };
};

// Función para recomendar ajustes en la dieta
export const recomendarAjuste = (gdp, razaObj, esCriollo = false) => {
  const gdpEsperado = razaObj ? razaObj.gdp_base : 0.78;
  if (gdp >= gdpEsperado * 0.85) return [];

  const diferencia = gdpEsperado - gdp;
  const ajustes = [];

  if (diferencia > 0.25) {
    ajustes.push({
      titulo: "↑ Energía urgente",
      detalle: "Aumentar 2-3 kg maíz o sorgo/día",
      costo: "4-6 Bs/día extra",
    });
  } else {
    ajustes.push({
      titulo: "↑ Energía moderada",
      detalle: "Agregar 0.5-1 kg maíz o melaza/día",
      costo: "1-2 Bs/día extra",
    });
  }

  if (gdp < gdpEsperado * 0.7) {
    ajustes.push({
      titulo: "↑ Proteína",
      detalle: "Agregar 300-500g torta de soya o harina de carne",
      costo: "1.5-3.5 Bs/día extra",
    });
  }

  if (esCriollo) {
    ajustes.push({
      titulo: "ℹ️ Raza criolla",
      detalle: `GDP esperado: ${gdpEsperado} kg/día (más lento que cebuínos).`,
      costo: "",
    });
  }

  return ajustes;
};

// Función para calcular proyección de peso (puede estar aquí o en proyecciones.js)
export const calcularProyeccion = (pesoActual, pesoMeta, gdp, razaObj) => {
  if (pesoMeta <= pesoActual || gdp <= 0) return null;
  const dias = Math.ceil((pesoMeta - pesoActual) / gdp);
  const pc = razaObj ? razaObj.pc_canal : 0.52;
  const canal = Math.round(pesoMeta * pc);
  const huesos = Math.round(canal * 0.2);
  const viseras = Math.round(pesoMeta * 0.08);
  const carneLimpia = canal - huesos;
  return { dias, meses: (dias / 30).toFixed(1), canal, carneLimpia, huesos, viseras };
};
