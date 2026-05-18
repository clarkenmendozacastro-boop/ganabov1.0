// src/utils/nutricion.js
// ============================================================
// GANABOV ENGINE PRO - MOTOR NUTRICIONAL AVANZADO
// ============================================================

// Exportación de FASES_FEEDLOT (para que la interfaz la pueda importar)
export const FASES_FEEDLOT = {
  inicio: { nombre: "Inicio", dias: 14, conc_max: 0.40, peNDF_min: 25, forraje_min: 0.60 },
  desarrollo: { nombre: "Desarrollo", dias: 21, conc_max: 0.65, peNDF_min: 18, forraje_min: 0.45 },
  terminacion: { nombre: "Terminación", dias: 30, conc_max: 0.85, peNDF_min: 12, forraje_min: 0.30 }
};

// Configuración de sistemas
const CONFIG_SISTEMAS = {
  pastoril: { nombre: "Pastoril", gdp_min: 0.3, gdp_max: 0.8, cms_pct: 2.2, forraje_min: 0.70, riesgo_base: 0.1 },
  semiIntensivo: { nombre: "Semi-intensivo", gdp_min: 0.8, gdp_max: 1.3, cms_pct: 2.5, forraje_min: 0.45, riesgo_base: 0.3 },
  feedlot: { nombre: "Feedlot", gdp_min: 1.4, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 0.30, riesgo_base: 0.5 }
};

// Factores de calidad
const FACTORES_CALIDAD = {
  Óptimo: { enm: 1.0, eng: 1.0, pdr: 1.0, pnr: 1.0, digestibilidad: 1.0, consumo: 1.0 },
  Bueno: { enm: 0.95, eng: 0.95, pdr: 0.95, pnr: 0.95, digestibilidad: 0.95, consumo: 0.98 },
  Regular: { enm: 0.85, eng: 0.85, pdr: 0.85, pnr: 0.85, digestibilidad: 0.85, consumo: 0.92 },
  Bajo: { enm: 0.70, eng: 0.70, pdr: 0.70, pnr: 0.70, digestibilidad: 0.70, consumo: 0.85 },
  "Muy deteriorado": { enm: 0.50, eng: 0.50, pdr: 0.50, pnr: 0.50, digestibilidad: 0.50, consumo: 0.70 }
};

// Parámetros raciales
const RAZA_PARAMS = {
  nelore: { ajuste_consumo: 0.95, ajuste_gdp: 0.90 },
  brahman: { ajuste_consumo: 0.92, ajuste_gdp: 0.85 },
  nelore_brahman: { ajuste_consumo: 0.97, ajuste_gdp: 0.95 },
  angus_brahman: { ajuste_consumo: 1.02, ajuste_gdp: 1.00 },
  senepol: { ajuste_consumo: 0.98, ajuste_gdp: 0.88 },
  simmental: { ajuste_consumo: 1.05, ajuste_gdp: 1.05 },
  criollo: { ajuste_consumo: 0.85, ajuste_gdp: 0.55 },
  criollo_cruce: { ajuste_consumo: 0.90, ajuste_gdp: 0.70 },
  otro: { ajuste_consumo: 0.98, ajuste_gdp: 0.78 }
};

// Valores por defecto para campos avanzados
const DEFAULT_NUTRIENTS = {
  enm: 1.0, eng: 0.6, pdr: 5.0, pnr: 2.0, peNDF: 20,
  tam_particula: 2.0, almidon_rapido: 0, almidon_lento: 0,
  azucares: 2.0, digestibilidad_fdn: 65, lignina: 5.0,
  ca: 0.3, p: 0.2, mg: 0.15, k: 1.2, s: 0.15, na: 0.02, cl: 0.1, grasa: 2.0
};

// ========== FUNCIÓN PRINCIPAL ==========
export function formularRacionAvanzada({
  pv, sistemaId, razaId = "otro", alimentosDisponibles,
  preciosUsuario = {}, estadosCalidad = {}, modo = "optimo",
  fase = null, temperatura = 25
}) {
  const pvN = parseFloat(pv);
  if (isNaN(pvN) || pvN < 80) {
    return { error: true, msg: "Peso mínimo 80 kg" };
  }

  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const razaParam = RAZA_PARAMS[razaId] || RAZA_PARAMS.otro;

  // Calcular requerimientos
  const pvMet = Math.pow(pvN, 0.75);
  const ENm_mant = 0.077 * pvMet * 1.1;
  const gdpBase = (sistema.gdp_min + sistema.gdp_max) / 2;
  const ENg_por_kg = 0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdpBase;
  const ENm_crec = gdpBase * ENg_por_kg;
  const ENm_total = ENm_mant + ENm_crec;
  const PB_total = (3.8 * pvMet + gdpBase * 268 - 29.4 * ENg_por_kg) / 0.65;
  
  // Consumo base
  let cmsBase = pvN * (sistema.cms_pct / 100) * razaParam.ajuste_consumo;
  if (sistemaId === "feedlot" && fase === "inicio") cmsBase *= 0.9;
  else if (sistemaId === "feedlot" && fase === "terminacion") cmsBase *= 1.05;

  // Procesar alimentos
  const alimentos = alimentosDisponibles.map(al => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const factor = FACTORES_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : (al.precio_kg || 0);
    
    return {
      ...al,
      ms: al.ms || 25,
      prot: al.prot || 8,
      em: al.em || 1.8,
      fdn: al.fdn || 50,
      enm: (al.enm || DEFAULT_NUTRIENTS.enm) * factor.enm,
      eng: (al.eng || DEFAULT_NUTRIENTS.eng) * factor.eng,
      pdr: (al.pdr || DEFAULT_NUTRIENTS.pdr) * factor.pdr,
      pnr: (al.pnr || DEFAULT_NUTRIENTS.pnr) * factor.pnr,
      peNDF: al.peNDF || DEFAULT_NUTRIENTS.peNDF,
      tam_particula: al.tam_particula || DEFAULT_NUTRIENTS.tam_particula,
      almidon_rapido: al.almidon_rapido || DEFAULT_NUTRIENTS.almidon_rapido,
      digestibilidad: (al.digestibilidad_fdn || DEFAULT_NUTRIENTS.digestibilidad_fdn) * factor.digestibilidad,
      precio_kg: precio,
      calidad_actual: calidad
    };
  });

  // Separar categorías
  let forrajes = alimentos.filter(a => a.categoria === "forraje");
  let energeticos = alimentos.filter(a => a.categoria === "energético");
  let proteicos = alimentos.filter(a => a.categoria === "proteico");
  let minerales = alimentos.filter(a => a.categoria === "mineral");

  if (forrajes.length === 0) {
    return {
      error: false, dietaInsuficiente: true,
      msg: "No hay forrajes disponibles",
      alertas: ["⚠️ CRÍTICO: No hay forrajes"],
      racion: [], gdp_estimada: -0.3,
      indicadores: { ms_total_kg: 0, costo_dia: 0 }
    };
  }

  // Ordenar según modo
  const esEconomico = (modo === "economico");
  forrajes.sort((a,b) => esEconomico ? a.precio_kg - b.precio_kg : b.enm - a.enm);
  energeticos.sort((a,b) => esEconomico ? a.precio_kg - b.precio_kg : b.enm - a.enm);
  proteicos.sort((a,b) => esEconomico ? a.precio_kg - b.precio_kg : b.pdr - a.pdr);

  let racion = [];
  let ms_acum = 0, enm_acum = 0, pb_acum = 0, peNDF_acum = 0, almidonRapido_acum = 0;

  const agregar = (al, kgFresco) => {
    if (kgFresco <= 0.01) return;
    const msKg = kgFresco * (al.ms / 100);
    const factorFisico = al.tam_particula < 0.5 ? 0.2 : (al.tam_particula < 1.5 ? 0.5 : (al.tam_particula < 2.5 ? 0.8 : 1.0));
    const peNDF_kg = msKg * (al.fdn / 100) * factorFisico;
    
    racion.push({
      id: al.id, nombre: al.nombre, categoria: al.categoria,
      kg_dia: +kgFresco.toFixed(2), ms_kg: +msKg.toFixed(2),
      enm_kg: +(msKg * al.enm).toFixed(2), pb_kg: +(msKg * al.prot / 100 * 1000).toFixed(0),
      precio_total: +(kgFresco * al.precio_kg).toFixed(2), calidad: al.calidad_actual
    });
    
    ms_acum += msKg;
    enm_acum += msKg * al.enm;
    pb_acum += msKg * (al.prot / 100) * 1000;
    peNDF_acum += peNDF_kg;
    almidonRapido_acum += msKg * (al.almidon_rapido / 100);
  };

  // 1. Forraje
  const pctForraje = sistemaId === "feedlot" ? 0.45 : 0.60;
  let msForraje = cmsBase * pctForraje;
  let kgForraje = msForraje / (forrajes[0].ms / 100);
  agregar(forrajes[0], kgForraje);

  // 2. Mineral
  if (minerales.length) agregar(minerales[0], pvN * 0.0003);

  // 3. Energéticos
  let msRestante = cmsBase - ms_acum;
  if (energeticos.length > 0 && msRestante > 0.2) {
    let msEnerg = Math.min(msRestante * 0.6, cmsBase * 0.30);
    let kgEnerg = msEnerg / (energeticos[0].ms / 100);
    agregar(energeticos[0], kgEnerg);
    msRestante = cmsBase - ms_acum;
  }

  // 4. Proteicos
  if (proteicos.length > 0 && msRestante > 0.2) {
    let msProt = Math.min(msRestante, cmsBase * 0.15);
    let kgProt = msProt / (proteicos[0].ms / 100);
    agregar(proteicos[0], kgProt);
  }

  // 5. Completar mínimo 4 ingredientes
  if (racion.length < 4) {
    const candidatos = [...forrajes.slice(1), ...energeticos.slice(1), ...proteicos.slice(1)];
    for (let i = 0; i < candidatos.length && racion.length < 4; i++) {
      agregar(candidatos[i], 0.3);
    }
  }

  // Calcular indicadores
  ms_acum = Math.round(ms_acum * 100) / 100;
  const pctConcentrado = ((ms_acum - (racion.filter(r => r.categoria === "forraje").reduce((s,r) => s + r.ms_kg, 0))) / ms_acum) * 100;
  const peNDF_pct = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;
  const almidon_pct = ms_acum > 0 ? (almidonRapido_acum / ms_acum) * 100 : 0;

  // Score acidosis
  let scoreAcidosis = 0;
  if (peNDF_pct < 12) scoreAcidosis += 40;
  else if (peNDF_pct < 18) scoreAcidosis += 30;
  else if (peNDF_pct < 24) scoreAcidosis += 15;
  if (pctConcentrado > 75) scoreAcidosis += 30;
  else if (pctConcentrado > 60) scoreAcidosis += 20;
  else if (pctConcentrado > 45) scoreAcidosis += 10;
  if (almidon_pct > 25) scoreAcidosis += 30;
  else if (almidon_pct > 18) scoreAcidosis += 20;
  else if (almidon_pct > 12) scoreAcidosis += 10;
  
  let riesgoAcidosis = "seguro";
  if (scoreAcidosis >= 70) riesgoAcidosis = "crítico";
  else if (scoreAcidosis >= 50) riesgoAcidosis = "alto";
  else if (scoreAcidosis >= 25) riesgoAcidosis = "precaución";

  // GDP estimada
  let gdpEstimada = gdpBase * razaParam.ajuste_gdp;
  if (scoreAcidosis > 50) gdpEstimada *= 0.5;
  else if (scoreAcidosis > 25) gdpEstimada *= 0.8;
  if (enm_acum < ENm_total * 0.8) gdpEstimada *= (enm_acum / ENm_total);
  if (pb_acum < PB_total * 0.8) gdpEstimada *= (pb_acum / PB_total);
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;
  if (gdpEstimada < -0.2) gdpEstimada = -0.2;

  const costoDiario = racion.reduce((s,r) => s + r.precio_total, 0);
  const scoreRuminal = Math.max(0, 100 - scoreAcidosis);
  const scoreEficiencia = Math.min(100, (gdpEstimada / gdpBase) * 100);
  const scoreEconomico = Math.min(100, (gdpEstimada / (costoDiario + 0.01)) * 20);

  // Alertas
  let alertas = [];
  if (peNDF_pct < 20) alertas.push(`⚠️ Fibra efectiva baja (peNDF ${peNDF_pct.toFixed(0)}%)`);
  if (pb_acum > PB_total * 1.2) alertas.push(`⚠️ Exceso de proteína (${(pb_acum/PB_total*100).toFixed(0)}%)`);
  if (enm_acum < ENm_total * 0.85) alertas.push(`⚠️ Energía insuficiente (${(enm_acum/ENm_total*100).toFixed(0)}%)`);
  if (riesgoAcidosis !== "seguro") alertas.push(`🔴 Riesgo de acidosis: ${riesgoAcidosis}`);

  let explicaciones = [];
  if (scoreAcidosis > 50) explicaciones.push("Se limitó el concentrado para evitar acidosis ruminal.");
  if (pb_acum > PB_total * 1.15) explicaciones.push("Se redujo la proteína porque excedía el requerimiento.");
  if (peNDF_pct < 20) explicaciones.push("Se aumentó la fibra efectiva para mejorar rumia.");

  return {
    error: false,
    dietaInsuficiente: false,
    gdp_estimada: gdpEstimada,
    racion: racion,
    indicadores: {
      ms_total_kg: ms_acum,
      ms_pct_pv: +((ms_acum / pvN) * 100).toFixed(1),
      peNDF_pct: +peNDF_pct.toFixed(1),
      enm_aportada: +enm_acum.toFixed(2),
      enm_requerida: +ENm_total.toFixed(2),
      pb_aportada: +pb_acum.toFixed(0),
      pb_requerida: +PB_total.toFixed(0),
      costo_dia: +costoDiario.toFixed(2),
      conversion: gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A",
      riesgo_acidosis: riesgoAcidosis,
      score_acidosis: scoreAcidosis,
      score_ruminal: scoreRuminal,
      score_eficiencia: scoreEficiencia,
      score_economico: scoreEconomico
    },
    alertas: alertas,
    explicaciones: explicaciones
  };
}

export function calcularRequerimientosAvanzado(pv, sistemaId, razaId = "otro") {
  const pvN = parseFloat(pv);
  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const razaParam = RAZA_PARAMS[razaId] || RAZA_PARAMS.otro;
  const pvMet = Math.pow(pvN, 0.75);
  const ENm_mant = 0.077 * pvMet * 1.1;
  const gdpBase = (sistema.gdp_min + sistema.gdp_max) / 2;
  const ENg_por_kg = 0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdpBase;
  const ENm_crec = gdpBase * ENg_por_kg;
  const ENm_total = ENm_mant + ENm_crec;
  const PB_total = (3.8 * pvMet + gdpBase * 268 - 29.4 * ENg_por_kg) / 0.65;
  const cmsBase = pvN * (sistema.cms_pct / 100) * razaParam.ajuste_consumo;
  return { ENm_total, PB_total, CMS_base: cmsBase, gdp_objetivo: gdpBase };
}
