// src/utils/nutricion.js
import { ALIMENTOS_BASE } from "../data/alimentosBase";

// Límites biológicos y configuraciones del nuevo motor
const LIMITES_BIO = {
  yuca_raiz: 0.15,
  urea_pua: 0.01,
  melaza_caña: 0.08,
  subproducto: 0.25,
};

const CONFIG_SISTEMAS = {
  extensivo: { gdp_min: 0.3, gdp_max: 0.8, cms_pct: 2.2, forraje_min: 0.70 },
  semiIntensivo: { gdp_min: 0.8, gdp_max: 1.3, cms_pct: 2.5, forraje_min: 0.45 },
  intensivo: { gdp_min: 1.4, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 0.30 },
};

const CONFIG_CALIDAD = {
  Óptimo: { em: 1.0, pb: 1.0, cms: 1.0 },
  Bueno: { em: 0.95, pb: 0.95, cms: 1.0 },
  Regular: { em: 0.85, pb: 0.82, cms: 0.90 },
  Bajo: { em: 0.70, pb: 0.65, cms: 0.80 },
  "Muy deteriorado": { em: 0.50, pb: 0.45, cms: 0.65 },
};

function calcularRequerimientosNRC(pv, sistemaId, gdpDeseada = null) {
  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const gdp = gdpDeseada || (sistema.gdp_min + sistema.gdp_max) / 2;
  const pvMet = Math.pow(pv, 0.75);
  const em_mant = 0.077 * pvMet * 1.10;
  const em_crec = gdp * (0.0635 * Math.pow(pv, 0.6) + 4.1 * gdp);
  const em_total = em_mant + em_crec;
  const prot_mant = 3.8 * pvMet;
  const prot_crec = gdp * 268 - 29.4 * (em_crec / gdp);
  const pb_total = (prot_mant + prot_crec) / 0.65;
  const cms_optimo = pv * (sistema.cms_pct / 100);
  const cms_maximo = pv * 0.032;
  return { em_total, pb_total, cms_optimo, cms_maximo, gdp, pv };
}

function formularRacionInteligente({
  pv,
  sistemaId,
  alimentosDisponibles,
  preciosUsuario = {},
  estadosCalidad = {},
  modo = "óptimo",
}) {
  const pvN = parseFloat(pv);
  if (!pvN || pvN < 50) return { error: true, msg: "Peso vivo no válido." };
  const req = calcularRequerimientosNRC(pvN, sistemaId);
  const sistemaConfig = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;

  const alimentosProcesados = alimentosDisponibles.map((al) => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const factor = CONFIG_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : 0;
    return {
      ...al,
      em: al.em * factor.em,
      prot: al.prot * factor.pb,
      ms_real: al.ms * factor.cms,
      precio_kg: precio,
      calidad_actual: calidad,
    };
  });

  let forrajes = alimentosProcesados.filter((a) => a.tipo === "forraje_fresco" || a.tipo === "heno_silo");
  let energeticos = alimentosProcesados.filter((a) => a.tipo === "energetico");
  let proteicos = alimentosProcesados.filter((a) => a.tipo === "proteico" || a.tipo === "proteico_animal");
  let minerales = alimentosProcesados.filter((a) => a.tipo === "suplemento");

  if (forrajes.length === 0) {
    return {
      error: false,
      dietaInsuficiente: true,
      msg: "🚨 No es posible formular una dieta balanceada correcta con los alimentos disponibles. Faltan fuentes de Forraje.",
      gdp_estimada: -0.2,
      racion: [],
      alertas: ["Falta forraje base", "Riesgo de pérdida de peso", "Peligro de paro ruminal"],
      indicadores: {
        ms_total_kg: 0,
        ms_pct_pv: 0,
        fdn_pct: 0,
        em_aportada: 0,
        em_requerida: req.em_total.toFixed(1),
        pb_aportada: 0,
        pb_requerida: req.pb_total.toFixed(0),
        costo_dia: 0,
        conversion: "N/A",
      },
    };
  }

  if (modo === "económico") {
    forrajes.sort((a, b) => a.precio_kg - b.precio_kg);
    energeticos.sort((a, b) => a.precio_kg - b.precio_kg);
    proteicos.sort((a, b) => a.precio_kg - b.precio_kg);
  } else {
    forrajes.sort((a, b) => b.em - a.em);
    energeticos.sort((a, b) => b.em - a.em);
    proteicos.sort((a, b) => b.prot - a.prot);
  }

  let racion = [];
  let ms_acum = 0,
    em_acum = 0,
    pb_acum = 0,
    fdn_acum = 0;

  const intentarInyectar = (alimento, msDeseada) => {
    if (msDeseada <= 0.01 || !alimento) return 0;
    let msAsignada = msDeseada;
    if (LIMITES_BIO[alimento.id] !== undefined) {
      const maxMsPermitida = req.cms_optimo * LIMITES_BIO[alimento.id];
      if (msAsignada > maxMsPermitida) msAsignada = maxMsPermitida;
    }
    const kgFrescos = msAsignada / (alimento.ms_real / 100);
    racion.push({
      id: alimento.id,
      nombre: alimento.nombre,
      categoria: alimento.tipo,
      kg_dia: +kgFrescos.toFixed(3),
      ms_kg: +msAsignada.toFixed(3),
      precio_total: +(kgFrescos * alimento.precio_kg).toFixed(2),
      calidad: alimento.calidad_actual,
    });
    ms_acum += msAsignada;
    em_acum += msAsignada * alimento.em;
    pb_acum += msAsignada * (alimento.prot / 100) * 1000;
    fdn_acum += msAsignada * (alimento.fdn / 100);
    return msAsignada;
  };

  const msForrajeInicial = req.cms_optimo * sistemaConfig.forraje_min;
  intentarInyectar(forrajes[0], msForrajeInicial);

  if (minerales[0]) {
    intentarInyectar(minerales[0], pvN * 0.0003);
  }

  let espacioConcentrado = req.cms_optimo - ms_acum;
  if (espacioConcentrado > 0.1) {
    let deficitPB = Math.max(0, req.pb_total - pb_acum);
    let mejorE = energeticos[0];
    let mejorP = proteicos[0];
    if (mejorE && mejorP) {
      const pbObjetivoConcentrado = (deficitPB / 1000 / espacioConcentrado) * 100;
      let diff = mejorP.prot - mejorE.prot;
      let ratioP = diff > 0 ? (pbObjetivoConcentrado - mejorE.prot) / diff : 0.5;
      ratioP = Math.max(0.15, Math.min(0.85, ratioP));
      let ratioE = 1 - ratioP;
      let msAsignadaE = espacioConcentrado * ratioE;
      let msRealE = intentarInyectar(mejorE, msAsignadaE);
      if (msRealE < msAsignadaE && energeticos[1]) intentarInyectar(energeticos[1], msAsignadaE - msRealE);
      let msAsignadaP = espacioConcentrado * ratioP;
      let msRealP = intentarInyectar(mejorP, msAsignadaP);
      if (msRealP < msAsignadaP && proteicos[1]) intentarInyectar(proteicos[1], msAsignadaP - msRealP);
    } else {
      if (mejorE) intentarInyectar(mejorE, espacioConcentrado);
      if (mejorP) intentarInyectar(mejorP, espacioConcentrado);
    }
  }

  const fdnPorcentajeTotal = ms_acum > 0 ? (fdn_acum / ms_acum) * 100 : 0;
  let alertas = [];
  let gdpEstimada = req.gdp;

  if (!energeticos.some((e) => racion.some((r) => r.id === e.id))) alertas.push("⚠ Faltan alimentos energéticos en la ración.");
  if (!proteicos.some((p) => racion.some((r) => r.id === p.id))) alertas.push("⚠ Faltan alimentos proteicos en la ración.");
  if (fdnPorcentajeTotal < 28) {
    alertas.push("🚨 FDN insuficiente (<28%) - Riesgo crítico de acidosis. Agregue fibra (heno/silo).");
    gdpEstimada = gdpEstimada * 0.3;
  }
  if (em_acum < req.em_total * 0.85) {
    alertas.push("⚠ Energía insuficiente. El animal podría presentar baja ganancia de peso.");
    gdpEstimada = Math.min(gdpEstimada, 0.15);
  }
  if (pb_acum < req.pb_total * 0.85) {
    alertas.push("⚠ Proteína insuficiente. Bajo crecimiento muscular.");
    gdpEstimada = Math.max(0, gdpEstimada - 0.4);
  }
  racion.forEach((item) => {
    if (item.calidad === "Bajo" || item.calidad === "Muy deteriorado") {
      alertas.push(`⚠ El ingrediente ${item.nombre} tiene muy baja calidad. Riesgo digestivo.`);
      gdpEstimada -= 0.1;
    }
  });
  if (em_acum < req.em_total * 0.6 || pb_acum < req.pb_total * 0.6) {
    gdpEstimada = -0.2;
    alertas.push("🚨 Dieta Crítica: El animal perderá condición corporal.");
  }

  const totalIngredientes = racion.filter((r) => r.kg_dia > 0).length;
  const costoDiario = racion.reduce((acc, curr) => acc + curr.precio_total, 0);
  const conversionAlimenticia = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";

  return {
    error: false,
    dietaInsuficiente: totalIngredientes < 3,
    gdp_estimada: +gdpEstimada.toFixed(2),
    racion: racion.filter((r) => r.kg_dia > 0),
    indicadores: {
      ms_total_kg: +ms_acum.toFixed(2),
      ms_pct_pv: +((ms_acum / pvN) * 100).toFixed(1),
      fdn_pct: +fdnPorcentajeTotal.toFixed(1),
      em_aportada: +em_acum.toFixed(2),
      em_requerida: +req.em_total.toFixed(2),
      pb_aportada: +pb_acum.toFixed(0),
      pb_requerida: +req.pb_total.toFixed(0),
      costo_dia: +costoDiario.toFixed(2),
      conversion: conversionAlimenticia,
    },
    alertas,
  };
}

// === WRAPPERS PARA COMPATIBILIDAD CON LA UI EXISTENTE ===
export function calcularRequerimientos(pv, razaObj, sistemaId = "semiIntensivo") {
  // razaObj se ignora en el nuevo motor, pero se mantiene por compatibilidad
  const req = calcularRequerimientosNRC(parseFloat(pv), sistemaId);
  // Adaptar a la estructura que usaba la UI antigua
  return {
    em_total: req.em_total,
    pb_total: req.pb_total,
    ms_min: pv * 0.018,
    ms_opt: req.cms_optimo,
    ms_max: req.cms_maximo,
    gdp: req.gdp,
    pvN: parseFloat(pv),
    sistemaId,
  };
}

export function formularRacionConIngredientes(
  forrajesSeleccionados,
  concentradosSeleccionados,
  pv,
  razaObj,
  sistemaId,
  preciosUsr = {},
  minsPersonalizados = {}
) {
  // Unimos forrajes y concentrados en un solo array de alimentos disponibles
  const alimentosDisponibles = [...forrajesSeleccionados, ...concentradosSeleccionados];
  const modo = "óptimo"; // por defecto, el modo automático (se puede cambiar según lógica externa)
  const resultado = formularRacionInteligente({
    pv,
    sistemaId,
    alimentosDisponibles,
    preciosUsuario: preciosUsr,
    estadosCalidad: {}, // sin calidades por ahora
    modo,
  });
  if (resultado.error) return null;
  // Transformar la salida al formato que espera la UI (racion, req, alertas, etc.)
  const req = calcularRequerimientos(pv, razaObj, sistemaId);
  return {
    racion: resultado.racion.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      tipo: r.categoria,
      kg_dia: r.kg_dia,
      ms_kg: r.ms_kg,
      precio_kg: r.precio_total / r.kg_dia,
    })),
    req,
    ms_total: resultado.indicadores.ms_total_kg.toFixed(2),
    ms_pct_pv: resultado.indicadores.ms_pct_pv,
    em_total: resultado.indicadores.em_aportada.toFixed(2),
    prot_total: resultado.indicadores.pb_aportada.toFixed(0),
    fdn_pct: resultado.indicadores.fdn_pct,
    costo_total: resultado.indicadores.costo_dia.toFixed(2),
    balance_em: (resultado.indicadores.em_aportada - req.em_total).toFixed(2),
    balance_prot: (resultado.indicadores.pb_aportada - req.pb_total).toFixed(0),
    alertas: resultado.alertas,
    metodo: "NRC+IA",
    alertaAcidosis: resultado.indicadores.fdn_pct < 35,
    alertaPastoFresco: false,
  };
}
