// src/utils/nutricion.js - VERSIÓN CON MEJORAS COMPLETAS
export const FASES_FEEDLOT = {
  inicio: { nombre: "Inicio", dias: 14, conc_max: 40, peNDF_min: 25, forraje_min: 60 },
  desarrollo: { nombre: "Desarrollo", dias: 21, conc_max: 65, peNDF_min: 18, forraje_min: 45 },
  terminacion: { nombre: "Terminación", dias: 30, conc_max: 85, peNDF_min: 12, forraje_min: 30 }
};

const CONFIG_SISTEMAS = {
  pastoril: { nombre: "Pastoril", gdp_min: 0.4, gdp_max: 0.7, cms_pct: 2.2, forraje_min: 70, concentrado_max: 30 },
  semiIntensivo: { nombre: "Semi-intensivo", gdp_min: 0.9, gdp_max: 1.2, cms_pct: 2.5, forraje_min: 60, concentrado_max: 40 },
  feedlot: { nombre: "Feedlot", gdp_min: 1.4, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 30, concentrado_max: 70 }
};

const FACTORES_CALIDAD = {
  Óptimo: { enm: 1.0, prot: 1.0, digestibilidad: 1.0, consumo: 1.0, alerta: false },
  Bueno: { enm: 0.95, prot: 0.95, digestibilidad: 0.95, consumo: 0.98, alerta: false },
  Regular: { enm: 0.85, prot: 0.85, digestibilidad: 0.85, consumo: 0.92, alerta: false },
  Bajo: { 
    enm: 0.70, prot: 0.70, digestibilidad: 0.70, consumo: 0.85, alerta: true,
    msg: "⚠️ ALERTA: Calidad BAJA - Menor digestibilidad (-30%), menor consumo (-15%), riesgo de baja ganancia"
  },
  "Muy deteriorado": { 
    enm: 0.50, prot: 0.50, digestibilidad: 0.50, consumo: 0.70, alerta: true,
    msg: "🚨 ALERTA CRÍTICA: Calidad MUY DETERIORADA - Riesgo de rechazo del alimento, posible pérdida de peso, peligro de toxicidad"
  }
};

const RAZA_PARAMS = {
  nelore: { consumo: 0.95, gdp: 0.95 },
  brahman: { consumo: 0.92, gdp: 0.90 },
  angus_brahman: { consumo: 1.02, gdp: 1.00 },
  senepol: { consumo: 0.98, gdp: 0.92 },
  criollo: { consumo: 0.85, gdp: 0.70 },
  otro: { consumo: 0.98, gdp: 0.85 }
};

// Ingredientes prohibidos por sistema (para evitar selecciones no realistas)
const INGREDIENTES_RESTRINGIDOS = {
  pastoril: ['grasa_bypass', 'harina_sangre', 'harina_pescado', 'monensina'],
  semiIntensivo: ['grasa_bypass', 'harina_sangre', 'harina_pescado'],
  feedlot: []
};

// Granos tradicionales (prioridad en selección)
const GRANOS_TRADICIONALES = ['maiz_amarillo', 'maiz_blanco', 'sorgo_grano', 'sorgo_rojo', 'cebada_grano', 'trigo_grano', 'avena_grano'];

export function formularRacionAvanzada({
  pv, sistemaId, razaId = "otro", alimentosDisponibles,
  preciosUsuario = {}, estadosCalidad = {}, modo = "optimo",
  fase = null, alimentosSeleccionadosIds = null  // Para modo "mis_alimentos"
}) {
  const pvN = parseFloat(pv);
  if (isNaN(pvN) || pvN < 80) return { error: true, msg: "Peso mínimo 80 kg" };

  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const razaParam = RAZA_PARAMS[razaId] || RAZA_PARAMS.otro;
  const esPersonalizado = (modo === "personalizado");
  const esMisAlimentos = (modo === "mis_alimentos");
  const esEconomico = (modo === "economico");

  // Filtrar alimentos según modo "mis_alimentos"
  let alimentosUsar = alimentosDisponibles;
  if (esMisAlimentos && alimentosSeleccionadosIds && alimentosSeleccionadosIds.size > 0) {
    alimentosUsar = alimentosDisponibles.filter(al => alimentosSeleccionadosIds.has(al.id));
  }

  // Calcular requerimientos
  const pvMet = Math.pow(pvN, 0.75);
  const ENm_mant = 0.077 * pvMet * 1.1;
  const gdpObjetivo = (sistema.gdp_min + sistema.gdp_max) / 2;
  const ENg = 0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdpObjetivo;
  const ENm_total = ENm_mant + (gdpObjetivo * ENg);
  const PB_total = (3.8 * pvMet + gdpObjetivo * 268 - 29.4 * ENg) / 0.65;
  let cmsBase = pvN * (sistema.cms_pct / 100) * razaParam.consumo;
  if (sistemaId === "feedlot" && fase === "inicio") cmsBase *= 0.9;
  else if (sistemaId === "feedlot" && fase === "terminacion") cmsBase *= 1.05;

  let maxConcentrado = sistema.concentrado_max;
  if (sistemaId === "feedlot" && fase && FASES_FEEDLOT[fase]) {
    maxConcentrado = FASES_FEEDLOT[fase].conc_max;
  }

  // Procesar alimentos con calidad
  let alertasCalidad = [];
  const alimentos = alimentosUsar.map(al => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const factor = FACTORES_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : (al.precio_kg || 0);
    
    // Registrar alerta si la calidad es mala
    if (factor.alerta && al.categoria !== "mineral") {
      alertasCalidad.push({
        id: al.id,
        nombre: al.nombre,
        calidad: calidad,
        mensaje: factor.msg
      });
    }
    
    return {
      ...al,
      ms: al.ms || 25,
      prot: (al.prot || 8) * factor.prot,
      enm: (al.enm || 1.0) * factor.enm,
      fdn: al.fdn || 50,
      peNDF: al.peNDF || (al.fdn || 50) * (al.tam_particula ? Math.min(1, al.tam_particula / 3) : 0.5),
      precio_kg: precio,
      calidad_actual: calidad
    };
  });

  // Separar por categoría
  let forrajes = alimentos.filter(a => a.categoria === "forraje");
  let energeticos = alimentos.filter(a => a.categoria === "energético");
  let proteicos = alimentos.filter(a => a.categoria === "proteico");
  let minerales = alimentos.filter(a => a.categoria === "mineral");

  // Verificar disponibilidad de categorías (para modo mis_alimentos)
  let deficiencias = [];
  if (esMisAlimentos) {
    if (forrajes.length === 0) deficiencias.push({ tipo: "forraje", msg: "⚠️ No has seleccionado ningún FORRAJE. El animal no podrá alimentarse correctamente." });
    if (energeticos.length === 0) deficiencias.push({ tipo: "energético", msg: "⚠️ FALTAN ENERGÉTICOS. El animal podría tener baja ganancia de peso. Recomendación: Maíz, Sorgo, Melaza o Yuca." });
    if (proteicos.length === 0) deficiencias.push({ tipo: "proteico", msg: "⚠️ FALTAN PROTEICOS. El desarrollo muscular será limitado. Recomendación: Harina de Soya, Torta de Girasol o Afrecho." });
    if (minerales.length === 0) deficiencias.push({ tipo: "mineral", msg: "⚠️ FALTA SAL MINERAL. Riesgo de deficiencias minerales." });
  }

  if (forrajes.length === 0) {
    return { error: false, dietaInsuficiente: true, msg: "No hay forrajes", racion: [], gdp_estimada: 0, alertasCalidad, deficiencias };
  }

  // Ordenar según modo
  if (esEconomico) {
    forrajes.sort((a,b) => a.precio_kg - b.precio_kg);
    energeticos.sort((a,b) => a.precio_kg - b.precio_kg);
    proteicos.sort((a,b) => a.precio_kg - b.precio_kg);
  } else {
    // Priorizar fibra larga para forrajes
    forrajes.sort((a,b) => b.peNDF - a.peNDF);
    // Priorizar granos tradicionales sobre grasas para energéticos
    energeticos.sort((a,b) => {
      const aEsGrano = GRANOS_TRADICIONALES.includes(a.id);
      const bEsGrano = GRANOS_TRADICIONALES.includes(b.id);
      if (aEsGrano && !bEsGrano) return -1;
      if (!aEsGrano && bEsGrano) return 1;
      return b.enm - a.enm;
    });
    proteicos.sort((a,b) => b.prot - a.prot);
  }

  // Filtrar ingredientes restringidos por sistema
  const ingredientesRestringidos = INGREDIENTES_RESTRINGIDOS[sistemaId] || [];
  energeticos = energeticos.filter(e => !ingredientesRestringidos.includes(e.id));
  proteicos = proteicos.filter(p => !ingredientesRestringidos.includes(p.id));

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

  // 1. Forraje base
  let forrajePrincipal = forrajes[0];
  let forrajeSecundario = forrajes.length > 1 ? forrajes[1] : null;
  const pctForraje = Math.max(sistema.forraje_min / 100, 0.55);
  let msForraje = cmsBase * pctForraje;
  
  let kgForraje1 = (msForraje * 0.7) / (forrajePrincipal.ms / 100);
  agregar(forrajePrincipal, kgForraje1);
  
  if (forrajeSecundario) {
    let kgForraje2 = (msForraje * 0.3) / (forrajeSecundario.ms / 100);
    agregar(forrajeSecundario, kgForraje2);
  }

  // 2. Mineral
  if (minerales.length) {
    agregar(minerales[0], pvN * 0.0004);
  }

  // 3. Concentrados
  let msRestante = cmsBase - ms_acum;
  let msConcentradoMax = Math.min(msRestante, cmsBase * (maxConcentrado / 100));
  
  if (msConcentradoMax > 0.2 && !esMisAlimentos) {
    const deficitENm = Math.max(0, ENm_total - enm_acum);
    const deficitPB = Math.max(0, PB_total - pb_acum);
    
    let msEnergia = msConcentradoMax;
    let msProteina = 0;
    
    if (deficitPB > 80 && proteicos.length > 0) {
      const maxMsProteina = cmsBase * 0.08;
      msProteina = Math.min(msConcentradoMax * 0.3, maxMsProteina);
      msEnergia = msConcentradoMax - msProteina;
    }
    
    if (energeticos.length && msEnergia > 0.1) {
      let kgEnerg = msEnergia / (energeticos[0].ms / 100);
      agregar(energeticos[0], kgEnerg);
    }
    
    if (proteicos.length && msProteina > 0.1 && deficitPB > 100) {
      let kgProt = msProteina / (proteicos[0].ms / 100);
      agregar(proteicos[0], kgProt);
    }
  }

  // Para modo mis_alimentos, si no hay concentrados suficientes, usar lo que hay
  if (esMisAlimentos && msRestante > 0.2) {
    if (energeticos.length && msRestante > 0.1) {
      let kgEnerg = Math.min(msRestante, cmsBase * 0.3) / (energeticos[0].ms / 100);
      agregar(energeticos[0], kgEnerg);
      msRestante = cmsBase - ms_acum;
    }
    if (proteicos.length && msRestante > 0.1 && pb_acum < PB_total) {
      let kgProt = Math.min(msRestante, cmsBase * 0.1) / (proteicos[0].ms / 100);
      agregar(proteicos[0], kgProt);
    }
  }

  // Completar mínimo 4 ingredientes
  if (racion.length < 4) {
    const extras = [...forrajes.slice(2), ...energeticos.slice(1), ...proteicos.slice(1)];
    for (let i = 0; i < extras.length && racion.length < 4; i++) {
      agregar(extras[i], 0.3);
    }
  }

  // Calcular indicadores
  ms_acum = Math.round(ms_acum * 100) / 100;
  const peNDF_pct = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;
  const pctConcentrado = ((ms_acum - racion.filter(r => r.categoria === "forraje").reduce((s,r) => s + r.ms_kg, 0)) / ms_acum) * 100;

  // Score acidosis
  let scoreAcidosis = 0;
  if (peNDF_pct < 18) scoreAcidosis += 40;
  else if (peNDF_pct < 24) scoreAcidosis += 25;
  else if (peNDF_pct < 30) scoreAcidosis += 10;
  if (pctConcentrado > 60) scoreAcidosis += 30;
  else if (pctConcentrado > 45) scoreAcidosis += 15;
  else if (pctConcentrado > 35) scoreAcidosis += 5;
  
  let riesgoAcidosis = "seguro";
  if (scoreAcidosis >= 70) riesgoAcidosis = "crítico";
  else if (scoreAcidosis >= 50) riesgoAcidosis = "alto";
  else if (scoreAcidosis >= 25) riesgoAcidosis = "precaución";

  // GDP estimada
  let gdpEstimada = gdpObjetivo * razaParam.gdp;
  if (esMisAlimentos && (forrajes.length === 0 || energeticos.length === 0)) {
    gdpEstimada *= 0.5;
  }
  if (scoreAcidosis > 60) gdpEstimada *= 0.85;
  else if (scoreAcidosis > 40) gdpEstimada *= 0.95;
  
  const cumplimientoENm = enm_acum / ENm_total;
  if (cumplimientoENm < 0.85) gdpEstimada *= cumplimientoENm;
  
  gdpEstimada = Math.min(gdpEstimada, sistema.gdp_max * razaParam.gdp);
  gdpEstimada = Math.max(gdpEstimada, sistema.gdp_min * razaParam.gdp * 0.85);
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;

  const costoDiario = racion.reduce((s,r) => s + r.precio_total, 0);
  const conversion = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";

  // Explicaciones IA
  let explicaciones = [];
  if (peNDF_pct > 30) explicaciones.push("Se priorizaron pastos largos para garantizar fibra efectiva y prevenir acidosis.");
  if (esMisAlimentos && deficiencias.length > 0) {
    explicaciones.push("Se formuló la mejor dieta posible con los alimentos que seleccionaste.");
  }

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
      cumplimiento_energia: +(cumplimientoENm * 100).toFixed(0)
    },
    alertasCalidad: alertasCalidad,
    deficiencias: deficiencias,
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
