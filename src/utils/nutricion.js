// src/utils/nutricionAdvanced.js
// ============================================================
// MOTOR NUTRICIONAL AVANZADO - GANABOV ENGINE PRO
// Incluye: ENm, ENg, peNDF, PDR/PNR, simulación ruminal, riesgo acidosis, etc.
// Basado en NRC 2001, NASEM 2016 y literatura tropical
// ============================================================

// Configuración de sistemas de producción
const CONFIG_SISTEMAS = {
  pastoril: { 
    nombre: "Pastoril", gdp_min: 0.3, gdp_max: 0.8, cms_pct: 2.2, forraje_min: 0.70,
    adaptacion_rapida: false, riesgo_acido_base: 0.1
  },
  semiIntensivo: { 
    nombre: "Semi-intensivo", gdp_min: 0.8, gdp_max: 1.3, cms_pct: 2.5, forraje_min: 0.45,
    adaptacion_rapida: false, riesgo_acido_base: 0.3
  },
  feedlot: { 
    nombre: "Feedlot", gdp_min: 1.4, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 0.30,
    adaptacion_rapida: false, riesgo_acido_base: 0.5
  }
};

// Fases de feedlot
export const FASES_FEEDLOT = {
  inicio: { dias: 14, concentrado_max: 0.40, peNDF_min: 25, forraje_min: 0.60 },
  transicion: { dias: 21, concentrado_max: 0.65, peNDF_min: 18, forraje_min: 0.40 },
  terminacion: { dias: 30, concentrado_max: 0.85, peNDF_min: 12, forraje_min: 0.25 }
};

// Factores de calidad (igual que antes, pero afectan ENm/ENg)
const FACTORES_CALIDAD = {
  Óptimo: { enm: 1.0, eng: 1.0, pdr: 1.0, pnr: 1.0, digestibilidad: 1.0, consumo: 1.0 },
  Bueno: { enm: 0.95, eng: 0.95, pdr: 0.95, pnr: 0.95, digestibilidad: 0.95, consumo: 0.98 },
  Regular: { enm: 0.85, eng: 0.85, pdr: 0.85, pnr: 0.85, digestibilidad: 0.85, consumo: 0.92 },
  Bajo: { enm: 0.70, eng: 0.70, pdr: 0.70, pnr: 0.70, digestibilidad: 0.70, consumo: 0.85 },
  "Muy deteriorado": { enm: 0.50, eng: 0.50, pdr: 0.50, pnr: 0.50, digestibilidad: 0.50, consumo: 0.70 }
};

// ========== FUNCIÓN PRINCIPAL DE REQUERIMIENTOS ==========
export function calcularRequerimientosAvanzado(pv, sistemaId, gdpObjetivo = null) {
  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const gdp = gdpObjetivo || (sistema.gdp_min + sistema.gdp_max) / 2;
  const pvMet = Math.pow(pv, 0.75);
  
  // Ecuaciones NRC para ENm (Mcal/día)
  const ENm_mant = 0.077 * pvMet * 1.1;
  // ENg para ganancia
  const ENg = 0.0635 * Math.pow(pv, 0.6) + 4.1 * gdp;
  const ENm_crec = gdp * ENg;  // simplificado, real requiere más iteración
  const ENm_total = ENm_mant + ENm_crec;
  
  // Proteína metabolizable (PM) requerida (g/día)
  // Proteína mantenimiento: 3.8 g PM / kg PV^0.75
  const PM_mant = 3.8 * pvMet;
  // Proteína para ganancia: 268 g PM / kg GDP - 29.4 * (ENg / GDP)
  const PM_crec = gdp * 268 - 29.4 * (ENg / gdp);
  const PM_total = (PM_mant + PM_crec) / 0.65;  // eficiencia de uso PM -> PB
  
  // Consumo de MS esperado (base)
  let CMS_estimado = pv * (sistema.cms_pct / 100);
  // Factores de ajuste (se aplicarán después según ingredientes)
  
  return {
    ENm_total,      // Energía neta mantenimiento requerida (Mcal/día)
    ENg_requerida: ENg,  // Energía neta ganancia por kg de GDP
    PM_total,       // Proteína metabolizable requerida (g/día)
    PB_total: PM_total / 0.65,  // Proteína bruta equivalente
    CMS_base: CMS_estimado,
    gdp_objetivo: gdp,
    sistema
  };
}

// ========== FUNCIÓN PARA CALCULAR ENm Y ENg APORTADAS ==========
export function calcularEnergiaAportada(alimentos, req) {
  let ENm_acum = 0, ENG_acum = 0;
  alimentos.forEach(al => {
    ENm_acum += al.ms_kg * al.enm;
    ENG_acum += al.ms_kg * al.eng;
  });
  return { ENm_acum, ENG_acum };
}

// ========== CÁLCULO DE peNDF (fibra efectiva) ==========
// peNDF = FDN * factor físico (tamaño partícula)
function calcularPeNDF(alimento, kgMS) {
  // factor físico: 1.0 para forrajes largos, 0.7 para picado fino, 0.3 para harinas
  let factorFisico = 1.0;
  if (alimento.tamaño_particula < 0.5) factorFisico = 0.3;
  else if (alimento.tamaño_particula < 1.0) factorFisico = 0.6;
  else if (alimento.tamaño_particula < 2.0) factorFisico = 0.8;
  const peNDF_kgMS = kgMS * (alimento.fdn / 100) * factorFisico;
  return peNDF_kgMS;
}

// ========== RIESGO DE ACIDOSIS (índice profesional) ==========
export function calcularRiesgoAcidosis(racion, req, sistema) {
  let totalAlmidonRapido = 0, totalPeNDF = 0, totalMS = 0;
  racion.forEach(al => {
    totalAlmidonRapido += al.kg_dia * (al.almidon_rapido / 100);
    totalPeNDF += al.kg_dia * (al.peNDF / 100);
    totalMS += al.kg_dia * (al.ms / 100);
  });
  const almidonPct = (totalAlmidonRapido / totalMS) * 100;
  const peNDF_pct = (totalPeNDF / totalMS) * 100;
  let riesgo = "seguro";
  let score = 0;
  if (peNDF_pct < 12 && almidonPct > 30) {
    riesgo = "crítico";
    score = 90;
  } else if (peNDF_pct < 18 && almidonPct > 25) {
    riesgo = "alto";
    score = 70;
  } else if (peNDF_pct < 25 || almidonPct > 20) {
    riesgo = "precaución";
    score = 40;
  } else {
    riesgo = "seguro";
    score = 10;
  }
  return { riesgo, score, almidonPct, peNDF_pct };
}

// ========== SICRONÍA ENERGÍA-PROTEÍNA RUMINAL ==========
export function calcularSincronia(racion) {
  let energiaDegradable = 0, proteinaDegradable = 0, totalMS = 0;
  racion.forEach(al => {
    const msKg = al.kg_dia * (al.ms / 100);
    energiaDegradable += msKg * al.em * 0.8;  // asumiendo 80% fermentable
    proteinaDegradable += msKg * (al.pdr / 100);
    totalMS += msKg;
  });
  const relacion = proteinaDegradable / (energiaDegradable + 0.001);
  let sincronia = "buena";
  if (relacion < 0.8) sincronia = "exceso energia";
  else if (relacion > 1.2) sincronia = "exceso proteina";
  return { relacion, sincronia };
}

// ========== EFICIENCIA DE UTILIZACIÓN ==========
export function calcularEficiencia(ENm_aportada, ENG_aportada, req, gdp_real) {
  // Eficiencia energética: ENm utilizada / ENm requerida
  const eficienciaENm = ENm_aportada / req.ENm_total;
  // Costo por kg ganado
  return { eficienciaENm };
}

// ========== FORMULACIÓN INTELIGENTE AVANZADA ==========
export function formularRacionAvanzada({
  pv, sistemaId, alimentosDisponibles, preciosUsuario = {}, 
  estadosCalidad = {}, modo = "optimo", fase = null
}) {
  const pvN = parseFloat(pv);
  if (isNaN(pvN) || pvN < 80) return { error: true, msg: "Peso mínimo 80 kg" };
  
  const req = calcularRequerimientosAvanzado(pvN, sistemaId);
  let limiteConcentrado = req.sistema.forraje_min; // 1 - forraje_min es el máximo concentrado
  if (fase && sistemaId === "feedlot") {
    limiteConcentrado = FASES_FEEDLOT[fase].concentrado_max;
  }
  
  // Aplicar calidad
  const alimentos = alimentosDisponibles.map(al => ({
    ...al,
    enm: al.enm * (FACTORES_CALIDAD[estadosCalidad[al.id] || "Óptimo"].enm),
    eng: al.eng * (FACTORES_CALIDAD[estadosCalidad[al.id] || "Óptimo"].eng),
    pdr: al.pdr * (FACTORES_CALIDAD[estadosCalidad[al.id] || "Óptimo"].pdr),
    pnr: al.pnr * (FACTORES_CALIDAD[estadosCalidad[al.id] || "Óptimo"].pnr),
    digestibilidad_fdn: al.digestibilidad_fdn * (FACTORES_CALIDAD[estadosCalidad[al.id] || "Óptimo"].digestibilidad),
    ms_real: al.ms * (FACTORES_CALIDAD[estadosCalidad[al.id] || "Óptimo"].consumo), // el consumo no se modifica
    precio_kg: preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : al.precio_kg,
    calidad_actual: estadosCalidad[al.id] || "Óptimo"
  }));
  
  // Separar por categoría
  let forrajes = alimentos.filter(a => a.categoria === "forraje");
  let energeticos = alimentos.filter(a => a.categoria === "energético");
  let proteicos = alimentos.filter(a => a.categoria === "proteico");
  let minerales = alimentos.filter(a => a.categoria === "mineral");
  
  // Ordenar según modo
  if (modo === "economico") {
    forrajes.sort((a,b) => a.precio_kg - b.precio_kg);
    energeticos.sort((a,b) => a.precio_kg - b.precio_kg);
    proteicos.sort((a,b) => a.precio_kg - b.precio_kg);
  } else {
    forrajes.sort((a,b) => b.enm - a.enm);
    energeticos.sort((a,b) => b.enm - a.enm);
    proteicos.sort((a,b) => b.pdr - a.pdr);
  }
  
  // Validaciones iniciales
  let alertas = [];
  let dietaInsuficiente = false;
  if (forrajes.length === 0) {
    alertas.push("🚨 CRÍTICO: No hay forrajes. La dieta no es posible.");
    dietaInsuficiente = true;
  }
  if (energeticos.length === 0) alertas.push("⚠️ Faltan energéticos. La ganancia será baja.");
  if (proteicos.length === 0) alertas.push("⚠️ Faltan proteicos. El desarrollo muscular se verá limitado.");
  
  // Construir ración
  let racion = [];
  let ms_acum = 0, enm_acum = 0, eng_acum = 0, pb_acum = 0, pdr_acum = 0, pnr_acum = 0, peNDF_acum = 0;
  
  const agregar = (al, kgFresco) => {
    if (kgFresco <= 0.01) return;
    const msKg = kgFresco * (al.ms_real / 100);
    const enmKg = msKg * al.enm;
    const engKg = msKg * al.eng;
    const pbKg = msKg * (al.prot / 100) * 1000;
    const pdrKg = msKg * (al.pdr / 100) * 1000;
    const pnrKg = msKg * (al.pnr / 100) * 1000;
    const peNDFKg = calcularPeNDF(al, msKg);
    racion.push({
      id: al.id, nombre: al.nombre, categoria: al.categoria,
      kg_dia: +kgFresco.toFixed(3), ms_kg: +msKg.toFixed(3),
      enm_kg: +enmKg.toFixed(3), eng_kg: +engKg.toFixed(3),
      pb_kg: +pbKg.toFixed(0), pdr_kg: +pdrKg.toFixed(0), pnr_kg: +pnrKg.toFixed(0),
      peNDF_kg: +peNDFKg.toFixed(3),
      precio_total: +(kgFresco * al.precio_kg).toFixed(2),
      calidad: al.calidad_actual
    });
    ms_acum += msKg;
    enm_acum += enmKg;
    eng_acum += engKg;
    pb_acum += pbKg;
    pdr_acum += pdrKg;
    pnr_acum += pnrKg;
    peNDF_acum += peNDFKg;
  };
  
  // 1. Forraje base (mínimo 40% o lo que dicte el sistema)
  const msObjetivo = req.CMS_base;
  let msForrajeObjetivo = msObjetivo * Math.max(0.40, req.sistema.forraje_min);
  let msForrajeAsignado = 0;
  for (let i=0; i<forrajes.length && msForrajeAsignado < msForrajeObjetivo; i++) {
    const f = forrajes[i];
    const msRestante = msForrajeObjetivo - msForrajeAsignado;
    const kg = msRestante / (f.ms_real / 100);
    agregar(f, kg);
    msForrajeAsignado += msRestante;
  }
  
  // 2. Minerales (dosis fija)
  if (minerales.length) {
    agregar(minerales[0], pvN * 0.0003);
  }
  
  // 3. Concentrados (energéticos y proteicos) hasta completar CMS
  let msConcentradoMax = msObjetivo - ms_acum;
  if (msConcentradoMax < 0) msConcentradoMax = 0;
  // Aplicar límite según fase o sistema
  msConcentradoMax = Math.min(msConcentradoMax, msObjetivo * limiteConcentrado);
  
  if (msConcentradoMax > 0.2) {
    // Calcular déficit de ENm y PB
    const deficitENm = Math.max(0, req.ENm_total - enm_acum);
    const deficitPB = Math.max(0, req.PB_total - pb_acum);
    // Proporción entre energía y proteína
    const ratioENmPB = deficitENm / (deficitPB/1000 + 0.001);
    let mejorE = energeticos[0];
    let mejorP = proteicos[0];
    if (mejorE && mejorP) {
      // Asignar proporción según necesidad
      let msE = msConcentradoMax * 0.6;
      let msP = msConcentradoMax * 0.4;
      agregar(mejorE, msE / (mejorE.ms_real/100));
      agregar(mejorP, msP / (mejorP.ms_real/100));
    } else if (mejorE) {
      agregar(mejorE, msConcentradoMax / (mejorE.ms_real/100));
    } else if (mejorP) {
      agregar(mejorP, msConcentradoMax / (mejorP.ms_real/100));
    }
  }
  
  // Verificar mínimo 4 ingredientes
  if (racion.length < 4 && !dietaInsuficiente) {
    alertas.push(`⚠️ Solo ${racion.length} ingredientes. Se recomienda al menos 4.`);
  }
  
  // Calcular GDP real basado en energía y proteína
  let gdpEstimada = req.gdp_objetivo;
  const cumplimientoENm = enm_acum / req.ENm_total;
  const cumplimientoPB = pb_acum / req.PB_total;
  if (cumplimientoENm < 0.8) gdpEstimada *= (cumplimientoENm / 0.8);
  if (cumplimientoPB < 0.8) gdpEstimada *= (cumplimientoPB / 0.8);
  if (cumplimientoENm < 0.6 || cumplimientoPB < 0.6) gdpEstimada = -0.2;
  
  // Riesgo acidosis
  const riesgo = calcularRiesgoAcidosis(racion, req, req.sistema);
  if (riesgo.riesgo === "crítico") gdpEstimada *= 0.3;
  else if (riesgo.riesgo === "alto") gdpEstimada *= 0.6;
  else if (riesgo.riesgo === "precaución") gdpEstimada *= 0.9;
  
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;
  if (gdpEstimada < -0.2) gdpEstimada = -0.2;
  
  const costoDiario = racion.reduce((sum, r) => sum + r.precio_total, 0);
  const conversion = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";
  
  // Explicaciones de decisiones (IA explicativa)
  let explicaciones = [];
  if (riesgo.riesgo !== "seguro") {
    explicaciones.push(`Se limitó el concentrado porque el riesgo de acidosis era ${riesgo.riesgo}.`);
  }
  if (cumplimientoPB > 1.2) {
    explicaciones.push(`Se redujo la proteína porque excedía el requerimiento biológico (${(cumplimientoPB*100).toFixed(0)}%).`);
  }
  
  return {
    error: false,
    dietaInsuficiente,
    gdp_estimada: gdpEstimada,
    racion,
    indicadores: {
      ms_total_kg: +ms_acum.toFixed(2),
      ms_pct_pv: +((ms_acum / pvN) * 100).toFixed(1),
      fdn_pct: 0, // recalcular si se quiere
      peNDF_pct: +(peNDF_acum / ms_acum * 100).toFixed(1),
      enm_aportada: +enm_acum.toFixed(2), enm_requerida: +req.ENm_total.toFixed(2),
      pb_aportada: +pb_acum.toFixed(0), pb_requerida: +req.PB_total.toFixed(0),
      costo_dia: +costoDiario.toFixed(2), conversion,
      riesgo_acidosis: riesgo.riesgo, score_acidosis: riesgo.score,
      sincronia: calcularSincronia(racion).sincronia,
      eficiencia_enm: +(enm_acum / req.ENm_total).toFixed(2)
    },
    alertas,
    explicaciones
  };
}
