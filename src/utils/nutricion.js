// src/utils/nutricion.js
// ============================================================
// GANABOV ENGINE PRO - MOTOR NUTRICIONAL CNCPS/NRC
// Simulación ruminal, acidosis, peNDF, sincronía, ENg, optimización multi-restricción
// ============================================================

// ========== CONFIGURACIÓN DE SISTEMAS Y FASES ==========
const CONFIG_SISTEMAS = {
  pastoril: {
    nombre: "Pastoril", gdp_min: 0.3, gdp_max: 0.8, cms_pct: 2.2, forraje_min: 0.70,
    riesgo_base: 0.1, ajuste_consumo: 0.95,
  },
  semiIntensivo: {
    nombre: "Semi-intensivo", gdp_min: 0.8, gdp_max: 1.3, cms_pct: 2.5, forraje_min: 0.45,
    riesgo_base: 0.3, ajuste_consumo: 1.0,
  },
  feedlot: {
    nombre: "Feedlot", gdp_min: 1.4, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 0.30,
    riesgo_base: 0.5, ajuste_consumo: 1.05,
  },
};

export const FASES_FEEDLOT = {
  inicio: { dias: 14, conc_max: 0.40, peNDF_min: 25, forraje_min: 0.60, ajuste_consumo: 0.90 },
  adaptacion: { dias: 10, conc_max: 0.55, peNDF_min: 20, forraje_min: 0.50, ajuste_consumo: 0.95 },
  desarrollo: { dias: 20, conc_max: 0.70, peNDF_min: 15, forraje_min: 0.40, ajuste_consumo: 1.00 },
  terminacion: { dias: 30, conc_max: 0.85, peNDF_min: 10, forraje_min: 0.30, ajuste_consumo: 1.05 },
};

// Factores de calidad (afectan ENm, ENg, PDR, PNR, digestibilidad, consumo)
const FACTORES_CALIDAD = {
  Óptimo: { enm: 1.0, eng: 1.0, pdr: 1.0, pnr: 1.0, digestibilidad: 1.0, consumo: 1.0 },
  Bueno: { enm: 0.95, eng: 0.95, pdr: 0.95, pnr: 0.95, digestibilidad: 0.95, consumo: 0.98 },
  Regular: { enm: 0.85, eng: 0.85, pdr: 0.85, pnr: 0.85, digestibilidad: 0.85, consumo: 0.92 },
  Bajo: { enm: 0.70, eng: 0.70, pdr: 0.70, pnr: 0.70, digestibilidad: 0.70, consumo: 0.85 },
  "Muy deteriorado": { enm: 0.50, eng: 0.50, pdr: 0.50, pnr: 0.50, digestibilidad: 0.50, consumo: 0.70 },
};

// Parámetros raciales (afectan consumo y eficiencia)
const RAZA_PARAMS = {
  nelore: { ajuste_consumo: 0.95, ajuste_gdp: 0.90, rusticidad: 1.05 },
  brahman: { ajuste_consumo: 0.92, ajuste_gdp: 0.85, rusticidad: 1.10 },
  nelore_brahman: { ajuste_consumo: 0.97, ajuste_gdp: 0.95, rusticidad: 1.03 },
  angus_brahman: { ajuste_consumo: 1.02, ajuste_gdp: 1.00, rusticidad: 0.98 },
  senepol: { ajuste_consumo: 0.98, ajuste_gdp: 0.88, rusticidad: 1.05 },
  simmental: { ajuste_consumo: 1.05, ajuste_gdp: 1.05, rusticidad: 0.95 },
  criollo: { ajuste_consumo: 0.85, ajuste_gdp: 0.55, rusticidad: 1.15 },
  criollo_cruce: { ajuste_consumo: 0.90, ajuste_gdp: 0.70, rusticidad: 1.08 },
  otro: { ajuste_consumo: 0.98, ajuste_gdp: 0.78, rusticidad: 1.00 },
};

// ========== CÁLCULO DE REQUERIMIENTOS NRC (ENm, ENg, PB) ==========
export function calcularRequerimientosAvanzado(pv, sistemaId, razaId = "otro", gdpObjetivo = null) {
  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const gdp = gdpObjetivo || (sistema.gdp_min + sistema.gdp_max) / 2;
  const pvMet = Math.pow(pv, 0.75);
  // ENm mantenimiento (Mcal/día)
  const ENm_mant = 0.077 * pvMet * 1.1;
  // Ecuación NRC para ENg (Mcal/kg ganancia)
  const ENg_por_kg = 0.0635 * Math.pow(pv, 0.6) + 4.1 * gdp;
  const ENm_crec = gdp * ENg_por_kg;
  const ENm_total = ENm_mant + ENm_crec;
  // Proteína metabolizable requerida (g/día)
  const PM_mant = 3.8 * pvMet;
  const PM_crec = gdp * 268 - 29.4 * ENg_por_kg;
  const PM_total = PM_mant + PM_crec;
  const PB_total = PM_total / 0.65; // eficiencia de uso PM -> PB
  // Consumo base
  let CMS_base = pv * (sistema.cms_pct / 100);
  // Ajuste por raza
  const razaParam = RAZA_PARAMS[razaId] || RAZA_PARAMS.otro;
  CMS_base *= razaParam.ajuste_consumo;
  return { ENm_total, ENg_por_kg, PM_total, PB_total, CMS_base, gdp_objetivo: gdp, sistema, razaParam };
}

// ========== CÁLCULO DE peNDF REAL ==========
function calcularPeNDF(alimento, kgMS, tamParticula = null) {
  let factorFisico = 1.0;
  const tam = tamParticular || alimento.tam_particula || 1.0;
  if (tam < 0.5) factorFisico = 0.10;
  else if (tam < 1.0) factorFisico = 0.30;
  else if (tam < 2.0) factorFisico = 0.60;
  else if (tam < 3.0) factorFisico = 0.80;
  else factorFisico = 1.0;
  // Factor adicional por tipo de alimento (forrajes largos vs picados)
  if (alimento.categoria === "forraje" && alimento.fdn > 50) factorFisico = Math.min(1.0, factorFisico * 1.1);
  const peNDF_kg = kgMS * (alimento.fdn / 100) * factorFisico;
  return { peNDF_kg, factorFisico };
}

// ========== ÍNDICE DINÁMICO DE ACIDOSIS (0-100) ==========
function calcularIndiceAcidosis(racion, ms_total, peNDF_total, pctConcentrado, almidonRapidoTotal) {
  let score = 0;
  // peNDF
  const peNDF_pct = (peNDF_total / ms_total) * 100;
  if (peNDF_pct < 12) score += 40;
  else if (peNDF_pct < 18) score += 30;
  else if (peNDF_pct < 24) score += 15;
  else score += 0;
  // % concentrado
  if (pctConcentrado > 75) score += 30;
  else if (pctConcentrado > 60) score += 20;
  else if (pctConcentrado > 45) score += 10;
  // almidón rápido
  const almidonPct = (almidonRapidoTotal / ms_total) * 100;
  if (almidonPct > 25) score += 30;
  else if (almidonPct > 18) score += 20;
  else if (almidonPct > 12) score += 10;
  // límite
  score = Math.min(100, score);
  let riesgo = "seguro";
  let color = "green";
  if (score >= 70) { riesgo = "crítico"; color = "red"; }
  else if (score >= 50) { riesgo = "alto"; color = "orange"; }
  else if (score >= 25) { riesgo = "precaución"; color = "yellow"; }
  return { indice_acidosis: score, riesgo, color, peNDF_pct, almidon_pct: almidonPct };
}

// ========== SINCRONÍA RUMINAL ==========
function calcularSincronia(racion, ms_total) {
  let proteinaDegradable = 0, carbohidratosFermentables = 0;
  racion.forEach(al => {
    const msKg = al.ms_kg;
    proteinaDegradable += msKg * (al.pdr / 100);
    // Carbohidratos fermentables: almidón rápido + lento + azúcares
    const carb = (al.almidon_rapido + al.almidon_lento + (al.azucares || 0)) / 100;
    carbohidratosFermentables += msKg * carb;
  });
  const ratio = proteinaDegradable / (carbohidratosFermentables + 0.001);
  let sincronia = "buena";
  if (ratio < 0.8) sincronia = "exceso energía";
  else if (ratio > 1.2) sincronia = "exceso proteína";
  return { ratio, sincronia, proteinaDegradable, carbohidratosFermentables };
}

// ========== CONSUMO DINÁMICO DE MS ==========
function calcularCMSDinamico(req, racion, ms_total, peNDF_pct, indice_acidosis, temperatura = 25) {
  let cms = req.CMS_base;
  // Ajuste por digestibilidad media
  let digestProm = 0.7;
  if (ms_total > 0) {
    let suma = 0;
    racion.forEach(r => { suma += r.digestibilidad || 70; });
    digestProm = suma / racion.length / 100;
  }
  cms *= (0.8 + digestProm * 0.4);
  // Penalización por acidosis
  if (indice_acidosis > 50) cms *= 0.85;
  else if (indice_acidosis > 25) cms *= 0.95;
  // Fibra muy alta reduce consumo
  if (peNDF_pct > 30) cms *= 0.95;
  // Temperatura alta (>30°C) reduce consumo
  if (temperatura > 30) cms *= 0.92;
  // Ajuste final
  cms = Math.min(cms, req.CMS_base * 1.1);
  cms = Math.max(cms, req.CMS_base * 0.7);
  return +cms.toFixed(2);
}

// ========== FUNCIÓN PRINCIPAL DE FORMULACIÓN (MULTI-OBJETIVO) ==========
export function formularRacionAvanzada({
  pv, sistemaId, razaId = "otro", alimentosDisponibles,
  preciosUsuario = {}, estadosCalidad = {}, modo = "optimo",
  fase = null, temperatura = 25, gdpDeseada = null
}) {
  const pvN = parseFloat(pv);
  if (isNaN(pvN) || pvN < 80) return { error: true, msg: "Peso mínimo 80 kg" };
  const req = calcularRequerimientosAvanzado(pvN, sistemaId, razaId, gdpDeseada);
  let limiteConcentrado = req.sistema.forraje_min;
  let ajusteConsumoFase = 1.0;
  if (sistemaId === "feedlot" && fase && FASES_FEEDLOT[fase]) {
    limiteConcentrado = FASES_FEEDLOT[fase].conc_max;
    ajusteConsumoFase = FASES_FEEDLOT[fase].ajuste_consumo;
  }
  // Aplicar calidad
  const alimentos = alimentosDisponibles.map(al => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const f = FACTORES_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : (al.precio_kg || 0);
    return {
      ...al,
      enm: al.enm * f.enm,
      eng: al.eng * f.eng,
      pdr: al.pdr * f.pdr,
      pnr: al.pnr * f.pnr,
      digestibilidad: (al.digestibilidad_fdn || 70) * f.digestibilidad,
      ms_real: al.ms * f.consumo,
      precio_kg: precio,
      calidad_actual: calidad,
      factor_consumo_individual: f.consumo,
    };
  });
  // Separar categorías
  let forrajes = alimentos.filter(a => a.categoria === "forraje");
  let energeticos = alimentos.filter(a => a.categoria === "energético");
  let proteicos = alimentos.filter(a => a.categoria === "proteico");
  let minerales = alimentos.filter(a => a.categoria === "mineral");
  if (forrajes.length === 0) return { error: false, dietaInsuficiente: true, msg: "Faltan forrajes", alertas: ["Sin forraje"], indicadores: {} };
  // Ordenar según modo
  const esEconomico = (modo === "economico");
  forrajes.sort((a,b) => esEconomico ? a.precio_kg - b.precio_kg : b.enm - a.enm);
  energeticos.sort((a,b) => esEconomico ? a.precio_kg - b.precio_kg : b.enm - a.enm);
  proteicos.sort((a,b) => esEconomico ? a.precio_kg - b.precio_kg : (b.pdr - a.pdr));
  // Construcción de la ración (optimización greedy + iterativa)
  let racion = [];
  let ms_acum = 0, enm_acum = 0, eng_acum = 0, pb_acum = 0, pdr_acum = 0, pnr_acum = 0, peNDF_acum = 0, almidonRapido_acum = 0;
  const agregar = (al, kgFresco) => {
    if (kgFresco <= 0.01) return;
    const msKg = kgFresco * (al.ms_real / 100);
    const enmKg = msKg * al.enm;
    const engKg = msKg * al.eng;
    const pbKg = msKg * (al.prot / 100) * 1000;
    const pdrKg = msKg * (al.pdr / 100) * 1000;
    const pnrKg = msKg * (al.pnr / 100) * 1000;
    const { peNDF_kg, factorFisico } = calcularPeNDF(al, msKg, al.tam_particula);
    peNDF_acum += peNDF_kg;
    almidonRapido_acum += msKg * ((al.almidon_rapido || 0) / 100);
    racion.push({
      id: al.id, nombre: al.nombre, categoria: al.categoria,
      kg_dia: +kgFresco.toFixed(3), ms_kg: +msKg.toFixed(3),
      enm_kg: +enmKg.toFixed(3), eng_kg: +engKg.toFixed(3),
      pb_kg: +pbKg.toFixed(0), pdr_kg: +pdrKg.toFixed(0), pnr_kg: +pnrKg.toFixed(0),
      peNDF_kg: +peNDF_kg.toFixed(3), factor_fisico: factorFisico,
      precio_total: +(kgFresco * al.precio_kg).toFixed(2),
      calidad: al.calidad_actual, digestibilidad: al.digestibilidad,
    });
    ms_acum += msKg;
    enm_acum += enmKg;
    eng_acum += engKg;
    pb_acum += pbKg;
    pdr_acum += pdrKg;
    pnr_acum += pnrKg;
  };
  // 1. Forraje mínimo (40% o lo que pida el sistema)
  let msObjetivo = req.CMS_base * ajusteConsumoFase;
  let msForrajeMin = msObjetivo * Math.max(0.40, req.sistema.forraje_min);
  let msForraje = 0;
  for (let i=0; i<forrajes.length && msForraje < msForrajeMin; i++) {
    const f = forrajes[i];
    const msRestante = msForrajeMin - msForraje;
    let kg = msRestante / (f.ms_real / 100);
    agregar(f, kg);
    msForraje += msRestante;
  }
  // 2. Minerales (dosis fija)
  if (minerales.length) agregar(minerales[0], pvN * 0.0003);
  // 3. Concentrados (energía + proteína) hasta completar CMS
  let msConcentradoMax = msObjetivo - ms_acum;
  if (msConcentradoMax < 0) msConcentradoMax = 0;
  msConcentradoMax = Math.min(msConcentradoMax, msObjetivo * limiteConcentrado);
  if (msConcentradoMax > 0.2) {
    const deficitENm = Math.max(0, req.ENm_total - enm_acum);
    const deficitPB = Math.max(0, req.PB_total - pb_acum);
    // Proporción de energía vs proteína en el concentrado
    let pctEnergia = 0.6, pctProteina = 0.4;
    if (deficitENm > 0 && deficitPB > 0) {
      const ratio = deficitENm / (deficitPB/1000);
      pctEnergia = Math.min(0.8, Math.max(0.4, ratio / (ratio+1)));
      pctProteina = 1 - pctEnergia;
    }
    let msEnergia = msConcentradoMax * pctEnergia;
    let msProteina = msConcentradoMax * pctProteina;
    // Asignar energéticos (evitar exceso de un solo ingrediente)
    let restEnergia = msEnergia;
    for (let i=0; i<energeticos.length && restEnergia>0.05; i++) {
      const e = energeticos[i];
      let msAsig = Math.min(restEnergia, e.ms_max_recomendado || restEnergia);
      if (msAsig < 0.05) continue;
      agregar(e, msAsig / (e.ms_real/100));
      restEnergia -= msAsig;
    }
    // Asignar proteicos (priorizar no exceder PB)
    let restProteina = msProteina;
    for (let i=0; i<proteicos.length && restProteina>0.05; i++) {
      const p = proteicos[i];
      // Límite biológico: no más del 15% de MS como proteico puro
      let msMax = msObjetivo * 0.15;
      let msAsig = Math.min(restProteina, msMax);
      if (msAsig < 0.05) continue;
      agregar(p, msAsig / (p.ms_real/100));
      restProteina -= msAsig;
    }
  }
  // 4. Verificar mínimo 4 ingredientes
  if (racion.length < 4) {
    const faltantes = 4 - racion.length;
    const otros = [...forrajes, ...energeticos, ...proteicos].filter(a => !racion.some(r => r.id === a.id));
    for (let i=0; i<faltantes && i<otros.length; i++) {
      const a = otros[i];
      const kgMin = 0.2 / (a.ms_real/100);
      agregar(a, kgMin);
    }
  }
  // Recalcular acumuladores reales
  ms_acum = racion.reduce((s,r)=>s+r.ms_kg,0);
  enm_acum = racion.reduce((s,r)=>s+r.enm_kg,0);
  pb_acum = racion.reduce((s,r)=>s+r.pb_kg,0);
  peNDF_acum = racion.reduce((s,r)=>s+r.peNDF_kg,0);
  almidonRapido_acum = racion.reduce((s,r)=>s+(r.ms_kg * ((r.almidon_rapido||0)/100)),0);
  const pctConcentrado = (ms_acum - (racion.filter(r=>r.categoria==="forraje").reduce((s,r)=>s+r.ms_kg,0))) / ms_acum * 100;
  const acidosis = calcularIndiceAcidosis(racion, ms_acum, peNDF_acum, pctConcentrado, almidonRapido_acum);
  const sincronia = calcularSincronia(racion, ms_acum);
  const cms_dinamico = calcularCMSDinamico(req, racion, ms_acum, acidosis.peNDF_pct, acidosis.indice_acidosis, temperatura);
  // Ajustar ganancia por acidosis y exceso proteico
  let gdpEstimada = req.gdp_objetivo;
  if (acidosis.indice_acidosis > 70) gdpEstimada *= 0.3;
  else if (acidosis.indice_acidosis > 50) gdpEstimada *= 0.6;
  else if (acidosis.indice_acidosis > 25) gdpEstimada *= 0.85;
  // Penalización por exceso de proteína (PB > 115% del requerimiento)
  const cumplimientoPB = pb_acum / req.PB_total;
  if (cumplimientoPB > 1.15) {
    const exceso = Math.min(0.3, (cumplimientoPB - 1.15) * 0.5);
    gdpEstimada *= (1 - exceso);
  }
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;
  if (gdpEstimada < -0.2) gdpEstimada = -0.2;
  const costoDiario = racion.reduce((s,r)=>s+r.precio_total,0);
  const conversion = gdpEstimada>0 ? (ms_acum/gdpEstimada).toFixed(1) : "N/A";
  // Explicaciones IA
  let explicaciones = [];
  if (acidosis.indice_acidosis > 50) explicaciones.push(`Se redujo la inclusión de concentrado por riesgo de acidosis (score ${acidosis.indice_acidosis}).`);
  if (cumplimientoPB > 1.15) explicaciones.push(`Se limitó la proteína porque excedía el requerimiento biológico (${(cumplimientoPB*100).toFixed(0)}%).`);
  if (acidosis.peNDF_pct < 20) explicaciones.push(`Se aumentó la fibra efectiva (peNDF) para mejorar rumia.`);
  // Scores profesionales
  const score_ruminal = Math.max(0, 100 - acidosis.indice_acidosis);
  const score_economico = Math.min(100, (req.gdp_objetivo / gdpEstimada) * 50 + 50);
  const score_eficiencia = Math.min(100, (req.gdp_objetivo / (costoDiario+0.01)) * 20);
  const scores = { score_ruminal, score_economico, score_eficiencia };
  return {
    error: false,
    dietaInsuficiente: false,
    gdp_estimada: gdpEstimada,
    racion,
    indicadores: {
      ms_total_kg: +ms_acum.toFixed(2),
      ms_pct_pv: +((ms_acum/pvN)*100).toFixed(1),
      peNDF_pct: +((peNDF_acum/ms_acum)*100).toFixed(1),
      enm_aportada: +enm_acum.toFixed(2), enm_requerida: +req.ENm_total.toFixed(2),
      pb_aportada: +pb_acum.toFixed(0), pb_requerida: +req.PB_total.toFixed(0),
      costo_dia: +costoDiario.toFixed(2), conversion,
      riesgo_acidosis: acidosis.riesgo, indice_acidosis: acidosis.indice_acidosis,
      sincronia: sincronia.sincronia,
      cms_dinamico: cms_dinamico,
      ...scores,
    },
    alertas: [
      acidosis.indice_acidosis > 50 ? `🔴 Riesgo de acidosis (${acidosis.indice_acidosis})` : null,
      cumplimientoPB > 1.15 ? `⚠️ Exceso de proteína (${(cumplimientoPB*100).toFixed(0)}%)` : null,
      acidosis.peNDF_pct < 20 ? `⚠️ Fibra efectiva baja (peNDF ${acidosis.peNDF_pct.toFixed(0)}%)` : null,
    ].filter(Boolean),
    explicaciones,
  };
}
