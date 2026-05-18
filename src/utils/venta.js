// src/utils/venta.js
import { calcularGDP } from "./helpers";
import { calcularProyeccion } from "./proyecciones";

export const evaluarVenta = (ult, gdp, razaObj) => {
  const gdpE = razaObj ? razaObj.gdp_base : 0.78;
  const ef = gdp >= gdpE * 0.85 ? "buena" : gdp >= gdpE * 0.6 ? "regular" : "baja";
  let rec = "";
  let conv = false;
  if (ult >= 450) {
    conv = true;
    rec = "Animal en peso óptimo (450+ kg). Evalúe venta inmediata.";
  } else if (ef === "baja" && ult >= 380) {
    conv = true;
    rec =
      "Conversión baja y peso cercano al comercial. Puede ser más rentable vender ahora.";
  } else if (ef === "baja")
    rec = "Conversión baja pero peso insuficiente. Ajuste la ración primero.";
  else rec = `Buena conversión (${gdp.toFixed(2)} kg/día). Continúe hasta 430-450 kg.`;
  return { eficiencia: ef, recomendacion: rec, conviene: conv };
};

export const recomendarAjuste = (gdp, razaObj, esCriollo) => {
  const gdpE = razaObj ? razaObj.gdp_base : 0.78;
  if (gdp >= gdpE * 0.85) return [];
  const d = gdpE - gdp;
  const aj = [];
  if (d > 0.25)
    aj.push({
      titulo: "↑ Energía urgente",
      detalle: "Aumentar 2-3 kg maíz o sorgo/día",
      costo: "4-6 Bs/día extra",
    });
  else
    aj.push({
      titulo: "↑ Energía moderada",
      detalle: "Agregar 0.5-1 kg maíz o melaza/día",
      costo: "1-2 Bs/día extra",
    });
  if (gdp < gdpE * 0.7)
    aj.push({
      titulo: "↑ Proteína",
      detalle: "Agregar 300-500g torta de soya o harina de carne",
      costo: "1.5-3.5 Bs/día extra",
    });
  if (esCriollo)
    aj.push({
      titulo: "ℹ️ Raza criolla",
      detalle: `GDP esperado: ${gdpE} kg/día (más lento que cebuínos).`,
      costo: "",
    });
  return aj;
};
export {
  calcularGDP,
  calcularProyeccion
};

