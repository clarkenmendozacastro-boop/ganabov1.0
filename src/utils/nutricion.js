// src/utils/nutricion.js
// GANABOV ENGINE PRO - VERSIÓN CORREGIDA

export const FASES_FEEDLOT = {
  inicio: { nombre: "Inicio", dias: 14, conc_max: 40, peNDF_min: 25, forraje_min: 60 },
  desarrollo: { nombre: "Desarrollo", dias: 21, conc_max: 65, peNDF_min: 18, forraje_min: 45 },
  terminacion: { nombre: "Terminación", dias: 30, conc_max: 85, peNDF_min: 12, forraje_min: 30 }
};

const CONFIG_SISTEMAS = {
  pastoril: { nombre: "Pastoril", gdp_min: 0.3, gdp_max: 0.8, cms_pct: 2.2, forraje_min: 70, concentrado_max: 30 },
  semiIntensivo: { nombre: "Semi-intensivo", gdp_min: 0.8, gdp_max: 1.3, cms_pct: 2.5, forraje_min: 50, concentrado_max: 50 },
  feedlot: { nombre: "Feedlot", gdp_min: 1.4, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 30, concentrado_max: 70 }
};

const FACTORES_CALIDAD = {
  Óptimo: { enm: 1.0, prot: 1.0, digestibilidad: 1.0, consumo: 1.0 },
  Bueno: { enm: 0.95, prot: 0.95, digestibilidad: 0.95, consumo: 0.98 },
  Regular: { enm: 0.85, prot: 0.85, digestibilidad: 0.85, consumo: 0.92 },
  Bajo: { enm: 0.70, prot: 0.70, digestibilidad: 0.70, consumo: 0.85 },
  "Muy deteriorado": { enm: 0.50, prot: 0.50, digestibilidad: 0.50, consumo: 0.70 }
};

const RAZA_PARAMS = {
  nelore: { consumo: 0.95, gdp: 0.90 },
  brahman: { consumo: 0.92, gdp: 0.85 },
  angus_brahman: { consumo: 1.02, gdp: 1.00 },
  senepol: { consumo: 0.98, gdp: 0.88 },
  criollo: { consumo: 0.85, gdp: 0.55 },
  otro: { consumo: 0.98, gdp: 0.78 }
};

// Función principal de formulación
export function formularRacionAvanzada({
  pv, sistemaId, razaId = "otro", alimentosDisponibles,
  preciosUsuario = {}, estadosCalidad = {}, modo = "optimo",
  fase = null
}) {
  const pvN = parseFloat(pv);
  if (isNaN(pvN) || pvN < 80) return { error: true, msg: "Peso mínimo 80 kg" };

  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const razaParam = RAZA_PARAMS[razaId] || RAZA_PARAMS.otro;

  // Calcular requerimientos NRC
  const pvMet = Math.pow(pvN, 0.75);
  const ENm_mant = 0.077 * pvMet * 1.1;
  const gdpObjetivo = (sistema.gdp_min + sistema.gdp_max) / 2;
  const ENg = 0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdpObjetivo;
  const ENm_total = ENm_mant + (gdpObjetivo * ENg);
  const PB_total = (3.8 * pvMet + gdpObjetivo * 268 - 29.4 * ENg) / 0.65;

  // Consumo de MS esperado
  let cmsBase = pvN * (sistema.cms_pct / 100) * razaParam.consumo;
  if (sistemaId === "feedlot" && fase === "inicio") cmsBase *= 0.9;
  else if (sistemaId === "feedlot" && fase === "terminacion") cmsBase *= 1.05;

  // Limitar concentrado según sistema o fase
  let maxConcentrado = sistema.concentrado_max;
  if (sistemaId === "feedlot" && fase && FASES_FEEDLOT[fase]) {
    maxConcentrado = FASES_FEEDLOT[fase].conc_max;
  }

  // Procesar alimentos con calidad
  const alimentos = alimentosDisponibles.map(al => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const factor = FACTORES_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : (al.precio_kg || 0);
    return {
      ...al,
      ms: al.ms || 25,
      prot: (al.prot || 8) * factor.prot,
      enm: (al.enm || 1.0) * factor.enm,
      fdn: al.fdn || 50,
      peNDF: al.peNDF || (al.fdn || 50) * (al.tam_particula ? (al.tam_particula > 2 ? 0.8 : 0.5) : 0.5),
      precio_kg: precio,
      calidad_actual: calidad
    };
  });

  // Separar por categoría
  let forrajes = alimentos.filter(a => a.categoria === "forraje");
  let energeticos = alimentos.filter(a => a.categoria === "energético");
  let proteicos = alimentos.filter(a => a.categoria === "proteico");
  let minerales = alimentos.filter(a => a.categoria === "mineral");

  if (forrajes.length === 0) {
    return { error: false, dietaInsuficiente: true, msg: "No hay forrajes", racion: [], gdp_estimada: -0.3 };
  }

  // Ordenar según modo
  const esEconomico = (modo === "economico");
  if (esEconomico) {
    forrajes.sort((a,b) => a.precio_kg - b.precio_kg);
    energeticos.sort((a,b) => a.precio_kg - b.precio_kg);
    proteicos.sort((a,b) => a.precio_kg - b.precio_kg);
  } else {
    forrajes.sort((a,b) => b.enm - a.enm);
    energeticos.sort((a,b) => b.enm - a.enm);
    proteicos.sort((a,b) => b.prot - a.prot);
  }

  let racion = [];
  let ms_acum = 0, enm_acum = 0, pb_acum = 0, peNDF_acum = 0;

  const agregar = (al, kgFresco) => {
    if (kgFresco <= 0.05) return;
    const msKg = kgFresco * (al.ms / 100);
    racion.push({
      id: al.id, nombre: al.nombre, categoria: al.categoria,
      kg_dia: +kgFresco.toFixed(2), ms_kg: +msKg.toFixed(2),
      enm_kg: +(msKg * al.enm).toFixed(2),
      pb_kg: +(msKg * (al.prot / 100) * 1000).toFixed(0),
      precio_total: +(kgFresco * al.precio_kg).toFixed(2),
      calidad: al.calidad_actual
    });
    ms_acum += msKg;
    enm_acum += msKg * al.enm;
    pb_acum += msKg * (al.prot / 100) * 1000;
    peNDF_acum += msKg * (al.peNDF / 100);
  };

  // 1. Forraje base (proporción según sistema, mínimo 40% siempre)
  const pctForraje = Math.max(0.40, sistema.forraje_min / 100);
  let msForraje = cmsBase * pctForraje;
  let kgForraje = msForraje / (forrajes[0].ms / 100);
  agregar(forrajes[0], kgForraje);

  // 2. Mineral (dosis fija 0.05% del PV)
  if (minerales.length) {
    agregar(minerales[0], pvN * 0.0005);
  }

  // 3. Calcular espacio para concentrados
  let msRestante = cmsBase - ms_acum;
  let msConcentradoMax = Math.min(msRestante, cmsBase * (maxConcentrado / 100));
  
  if (msConcentradoMax > 0.2) {
    // Calcular déficit de energía y proteína
    const deficitENm = Math.max(0, ENm_total - enm_acum);
    const deficitPB = Math.max(0, PB_total - pb_acum);
    
    // Determinar proporción energía/proteína en el concentrado
    let pctEnergia = 0.6, pctProteina = 0.4;
    if (deficitENm > 0 && deficitPB > 0) {
      const ratio = deficitENm / (deficitPB / 1000);
      pctEnergia = Math.min(0.8, Math.max(0.4, ratio / (ratio + 1)));
      pctProteina = 1 - pctEnergia;
    }
    
    let msEnergia = msConcentradoMax * pctEnergia;
    let msProteina = msConcentradoMax * pctProteina;
    
    // Limitar proteína máxima (no más del 15% de la MS total)
    const maxMsProteina = cmsBase * 0.12;
    if (msProteina > maxMsProteina) {
      msProteina = maxMsProteina;
      msEnergia = msConcentradoMax - msProteina;
    }
    
    // Agregar energético
    if (energeticos.length && msEnergia > 0.1) {
      let kgEnerg = msEnergia / (energeticos[0].ms / 100);
      agregar(energeticos[0], kgEnerg);
    }
    
    // Agregar proteico (solo si es necesario)
    if (proteicos.length && msProteina > 0.1 && deficitPB > 50) {
      let kgProt = msProteina / (proteicos[0].ms / 100);
      agregar(proteicos[0], kgProt);
    }
  }

  // 4. Completar hasta 4 ingredientes si es necesario
  if (racion.length < 4) {
    const extras = [...forrajes.slice(1), ...energeticos.slice(1), ...proteicos.slice(1)];
    for (let i = 0; i < extras.length && racion.length < 4; i++) {
      agregar(extras[i], 0.3);
    }
  }

  // Calcular indicadores
  ms_acum = Math.round(ms_acum * 100) / 100;
  const peNDF_pct = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;
  const pctConcentrado = ((ms_acum - racion.filter(r => r.categoria === "forraje").reduce((s,r) => s + r.ms_kg, 0)) / ms_acum) * 100;

  // Score de acidosis
  let scoreAcidosis = 0;
  if (peNDF_pct < 15) scoreAcidosis += 40;
  else if (peNDF_pct < 22) scoreAcidosis += 25;
  else if (peNDF_pct < 28) scoreAcidosis += 10;
  if (pctConcentrado > 70) scoreAcidosis += 30;
  else if (pctConcentrado > 55) scoreAcidosis += 20;
  else if (pctConcentrado > 40) scoreAcidosis += 10;
  
  let riesgoAcidosis = "seguro";
  if (scoreAcidosis >= 70) riesgoAcidosis = "crítico";
  else if (scoreAcidosis >= 50) riesgoAcidosis = "alto";
  else if (scoreAcidosis >= 25) riesgoAcidosis = "precaución";

  // GDP estimada (corregida)
  let gdpEstimada = gdpObjetivo * razaParam.gdp;
  if (scoreAcidosis > 50) gdpEstimada *= 0.6;
  else if (scoreAcidosis > 25) gdpEstimada *= 0.85;
  
  const cumplimientoENm = enm_acum / ENm_total;
  const cumplimientoPB = pb_acum / PB_total;
  if (cumplimientoENm < 0.85) gdpEstimada *= cumplimientoENm;
  if (cumplimientoPB > 1.15) gdpEstimada *= 0.95;
  if (cumplimientoPB < 0.8) gdpEstimada *= cumplimientoPB;
  
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;
  if (gdpEstimada < 0) gdpEstimada = 0;

  // Alertas
  let alertas = [];
  if (peNDF_pct < 22) alertas.push(`⚠️ Fibra efectiva baja (peNDF ${peNDF_pct.toFixed(0)}% - riesgo acidosis)`);
  if (cumplimientoPB > 1.2) alertas.push(`⚠️ Exceso de proteína (${(cumplimientoPB*100).toFixed(0)}% del requerimiento)`);
  if (cumplimientoENm < 0.85) alertas.push(`⚠️ Energía insuficiente (${(cumplimientoENm*100).toFixed(0)}%)`);
  if (riesgoAcidosis !== "seguro") alertas.push(`🔴 Riesgo de acidosis: ${riesgoAcidosis.toUpperCase()}`);

  // Explicaciones IA
  let explicaciones = [];
  if (peNDF_pct < 22) explicaciones.push("Se requiere aumentar fibra larga (heno o pasto) para mejorar rumia.");
  if (cumplimientoPB > 1.15) explicaciones.push("Se redujo la harina de soya por exceso de proteína.");
  if (pctConcentrado > maxConcentrado) explicaciones.push(`Se limitó el concentrado al ${maxConcentrado}% según el sistema.`);

  const costoDiario = racion.reduce((s,r) => s + r.precio_total, 0);
  const conversion = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";

  return {
    error: false,
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
      conversion: conversion,
      riesgo_acidosis: riesgoAcidosis,
      score_acidosis: scoreAcidosis,
      cumplimiento_proteina: +(cumplimientoPB * 100).toFixed(0),
      cumplimiento_energia: +(cumplimientoENm * 100).toFixed(0)
    },
    alertas: alertas,
    explicaciones: explicaciones
  };
}

export function calcularRequerimientosAvanzado(pv, sistemaId) {
  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const pvN = parseFloat(pv);
  const pvMet = Math.pow(pvN, 0.75);
  const ENm_mant = 0.077 * pvMet * 1.1;
  const gdpObjetivo = (sistema.gdp_min + sistema.gdp_max) / 2;
  const ENg = 0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdpObjetivo;
  const ENm_total = ENm_mant + (gdpObjetivo * ENg);
  const PB_total = (3.8 * pvMet + gdpObjetivo * 268 - 29.4 * ENg) / 0.65;
  return { ENm_total, PB_total, gdp_objetivo: gdpObjetivo };
}
