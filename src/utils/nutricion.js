// src/utils/nutricion.js
// ============================================================
// MOTOR DE NUTRICIÓN BOVINA INTELIGENTE (GANABOV ENGINE PRO)
// Basado en NRC 2000 / NASEM 2016
// Cumple con todas las reglas veterinarias y de campo
// ============================================================

// Configuración de sistemas
const CONFIG_SISTEMAS = {
  pastoril: { gdp_min: 0.3, gdp_max: 0.8, cms_pct: 2.2, forraje_min: 0.70, nombre: "Pastoril" },
  semiIntensivo: { gdp_min: 0.8, gdp_max: 1.3, cms_pct: 2.5, forraje_min: 0.45, nombre: "Semi-intensivo" },
  feedlot: { gdp_min: 1.4, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 0.30, nombre: "Feedlot" },
};

// Límites biológicos por ingrediente (máximo % de MS total)
const LIMITES_MAXIMO = {
  maiz_amarillo: 0.45,
  sorgo_grano: 0.45,
  melaza_caña: 0.08,
  urea_pua: 0.01,
  yuca_raiz: 0.15,
  afrecho_trigo: 0.25,
  afrecho_arroz_blanco: 0.25,
  cascarilla_soya: 0.20,
  burlanda_maiz_dggs: 0.30,
};

// Calidad de alimentos (factores de ajuste)
const FACTORES_CALIDAD = {
  Óptimo: { em: 1.0, prot: 1.0, ms: 1.0, digestibilidad: 1.0, consumo: 1.0 },
  Bueno: { em: 0.95, prot: 0.95, ms: 1.0, digestibilidad: 0.95, consumo: 0.98 },
  Regular: { em: 0.85, prot: 0.82, ms: 0.95, digestibilidad: 0.85, consumo: 0.92 },
  Bajo: { em: 0.70, prot: 0.65, ms: 0.90, digestibilidad: 0.70, consumo: 0.85 },
  "Muy deteriorado": { em: 0.50, prot: 0.45, ms: 0.85, digestibilidad: 0.50, consumo: 0.70 },
};

// Función para calcular requerimientos NRC
export function calcularRequerimientosNRC(pv, sistemaId, gdpDeseada = null) {
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
  return { em_total, pb_total, cms_optimo, cms_maximo, gdp, pv, sistema };
}

// Función principal de formulación inteligente
export function formularRacionInteligente({
  pv,
  sistemaId,
  alimentosDisponibles,
  preciosUsuario = {},
  estadosCalidad = {},
  modo = "optimo", // "optimo" o "economico"
}) {
  const pvN = parseFloat(pv);
  if (isNaN(pvN) || pvN < 80) return { error: true, msg: "Peso mínimo 80 kg" };

  const req = calcularRequerimientosNRC(pvN, sistemaId);
  const sistema = req.sistema;

  // Aplicar calidad a los alimentos
  const alimentosProcesados = alimentosDisponibles.map(al => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const factor = FACTORES_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : 0;
    return {
      ...al,
      em_real: al.em * factor.em,
      prot_real: al.prot * factor.prot,
      ms_real: al.ms * factor.ms,
      digestibilidad: al.digestibilidad || 70,
      precio_kg: precio,
      calidad_actual: calidad,
      factor_consumo: factor.consumo,
    };
  });

  // Separar por categorías
  let forrajes = alimentosProcesados.filter(a => a.categoria === "forraje");
  let energeticos = alimentosProcesados.filter(a => a.categoria === "energético");
  let proteicos = alimentosProcesados.filter(a => a.categoria === "proteico");
  let minerales = alimentosProcesados.filter(a => a.categoria === "mineral");

  // Ordenar según modo
  if (modo === "economico") {
    forrajes.sort((a, b) => a.precio_kg - b.precio_kg);
    energeticos.sort((a, b) => a.precio_kg - b.precio_kg);
    proteicos.sort((a, b) => a.precio_kg - b.precio_kg);
  } else {
    forrajes.sort((a, b) => b.em_real - a.em_real);
    energeticos.sort((a, b) => b.em_real - a.em_real);
    proteicos.sort((a, b) => b.prot_real - a.prot_real);
  }

  // Verificar si hay suficientes categorías
  const tieneForraje = forrajes.length > 0;
  const tieneEnergetico = energeticos.length > 0;
  const tieneProteico = proteicos.length > 0;
  const tieneMineral = minerales.length > 0;

  let alertas = [];
  let dietaInsuficiente = false;

  if (!tieneForraje) {
    alertas.push("🚨 CRÍTICO: No hay fuentes de forraje. La dieta no es posible.");
    dietaInsuficiente = true;
  }
  if (!tieneEnergetico) alertas.push("⚠️ Faltan alimentos energéticos. El animal tendrá baja ganancia.");
  if (!tieneProteico) alertas.push("⚠️ Faltan alimentos proteicos. El desarrollo muscular será limitado.");
  if (!tieneMineral) alertas.push("⚠️ No hay sal mineral. Riesgo de deficiencias minerales.");

  // Si no hay forraje, no podemos continuar
  if (!tieneForraje) {
    return {
      error: false,
      dietaInsuficiente: true,
      msg: "No es posible formular una dieta sin forraje.",
      gdp_estimada: -0.3,
      racion: [],
      alertas,
      indicadores: crearIndicadoresVacios(req),
    };
  }

  // Inicializar acumuladores
  let racion = [];
  let ms_acum = 0, em_acum = 0, pb_acum = 0, fdn_acum = 0;

  const agregarIngrediente = (alimento, kgFresco) => {
    if (kgFresco <= 0.01) return 0;
    const msKg = kgFresco * (alimento.ms_real / 100);
    racion.push({
      id: alimento.id,
      nombre: alimento.nombre,
      categoria: alimento.categoria,
      kg_dia: +kgFresco.toFixed(3),
      ms_kg: +msKg.toFixed(3),
      precio_total: +(kgFresco * alimento.precio_kg).toFixed(2),
      calidad: alimento.calidad_actual,
    });
    ms_acum += msKg;
    em_acum += msKg * alimento.em_real;
    pb_acum += msKg * (alimento.prot_real / 100) * 1000;
    fdn_acum += msKg * (alimento.fdn / 100);
    return msKg;
  };

  // 1. Forraje base: mínimo 40% de la MS total (o lo que permita el sistema)
  const msObjetivo = req.cms_optimo;
  const pctForrajeMin = Math.max(0.40, sistema.forraje_min);
  let msForrajeObjetivo = msObjetivo * pctForrajeMin;
  let msForrajeAsignado = 0;

  // Distribuir forrajes disponibles
  for (let i = 0; i < forrajes.length && msForrajeAsignado < msForrajeObjetivo; i++) {
    const f = forrajes[i];
    const msRestante = msForrajeObjetivo - msForrajeAsignado;
    const kg = msRestante / (f.ms_real / 100);
    // Aplicar límite máximo si existe
    let msMax = Infinity;
    if (LIMITES_MAXIMO[f.id]) msMax = msObjetivo * LIMITES_MAXIMO[f.id];
    const msPosible = Math.min(msRestante, msMax);
    if (msPosible > 0.05) {
      const kgReal = msPosible / (f.ms_real / 100);
      agregarIngrediente(f, kgReal);
      msForrajeAsignado += msPosible;
    }
  }

  // Si no se alcanzó el forraje mínimo, ajustar alerta
  const pctForrajeReal = ms_acum > 0 ? (msForrajeAsignado / ms_acum) * 100 : 0;
  if (pctForrajeReal < 40) {
    alertas.push(`⚠️ Forraje bajo (${pctForrajeReal.toFixed(0)}% vs mínimo 40%). Riesgo de acidosis.`);
  }

  // 2. Minerales (dosis fija)
  if (minerales.length > 0) {
    const sal = minerales[0];
    const kgSal = pvN * 0.0003; // 0.03% del peso vivo
    agregarIngrediente(sal, kgSal);
  }

  // 3. Calcular déficit de energía y proteína después del forraje
  let deficitEM = Math.max(0, req.em_total - em_acum);
  let deficitPB = Math.max(0, req.pb_total - pb_acum);

  // Espacio para concentrados (hasta CMS máximo)
  let msConcentradoMax = req.cms_maximo - ms_acum;
  if (msConcentradoMax < 0) msConcentradoMax = 0;

  // Determinar la relación energía/proteína necesaria
  let mejorE = energeticos[0];
  let mejorP = proteicos[0];

  if (mejorE && mejorP && msConcentradoMax > 0.2) {
    // Calcular PB objetivo del concentrado
    let pbObjetivoConcentrado = (deficitPB / 1000 / msConcentradoMax) * 100;
    pbObjetivoConcentrado = Math.min(Math.max(pbObjetivoConcentrado, 10), 30);
    let diff = mejorP.prot_real - mejorE.prot_real;
    let ratioP = diff > 0 ? (pbObjetivoConcentrado - mejorE.prot_real) / diff : 0.5;
    ratioP = Math.max(0.2, Math.min(0.8, ratioP));
    let msE = msConcentradoMax * (1 - ratioP);
    let msP = msConcentradoMax * ratioP;

    // Asignar energético
    let msPosibleE = msE;
    if (LIMITES_MAXIMO[mejorE.id]) msPosibleE = Math.min(msE, msObjetivo * LIMITES_MAXIMO[mejorE.id]);
    if (msPosibleE > 0.05) agregarIngrediente(mejorE, msPosibleE / (mejorE.ms_real / 100));

    // Asignar proteico
    let msPosibleP = msP;
    if (LIMITES_MAXIMO[mejorP.id]) msPosibleP = Math.min(msP, msObjetivo * LIMITES_MAXIMO[mejorP.id]);
    if (msPosibleP > 0.05) agregarIngrediente(mejorP, msPosibleP / (mejorP.ms_real / 100));
  } else if (mejorE && msConcentradoMax > 0.2) {
    // Solo energético
    let msPosible = msConcentradoMax;
    if (LIMITES_MAXIMO[mejorE.id]) msPosible = Math.min(msConcentradoMax, msObjetivo * LIMITES_MAXIMO[mejorE.id]);
    if (msPosible > 0.05) agregarIngrediente(mejorE, msPosible / (mejorE.ms_real / 100));
  } else if (mejorP && msConcentradoMax > 0.2) {
    let msPosible = msConcentradoMax;
    if (LIMITES_MAXIMO[mejorP.id]) msPosible = Math.min(msConcentradoMax, msObjetivo * LIMITES_MAXIMO[mejorP.id]);
    if (msPosible > 0.05) agregarIngrediente(mejorP, msPosible / (mejorP.ms_real / 100));
  }

  // Si aún faltan ingredientes y hay más de cada categoría, intentar agregar otros
  if (racion.length < 4) {
    const todos = [...forrajes, ...energeticos, ...proteicos];
    for (let i = 0; i < todos.length && racion.length < 4; i++) {
      if (!racion.some(r => r.id === todos[i].id)) {
        const kgMin = 0.2 / (todos[i].ms_real / 100); // mínimo 0.2 kg MS
        agregarIngrediente(todos[i], kgMin);
      }
    }
  }

  // Calcular indicadores finales
  const fdn_pct = ms_acum > 0 ? (fdn_acum / ms_acum) * 100 : 0;
  const em_cumplimiento = (em_acum / req.em_total) * 100;
  const pb_cumplimiento = (pb_acum / req.pb_total) * 100;

  // Determinar GDP estimada
  let gdpEstimada = req.gdp;
  if (fdn_pct < 28) {
    alertas.push("🚨 FDN insuficiente (<28%) - Riesgo alto de acidosis. Agregue fibra.");
    gdpEstimada = gdpEstimada * 0.3;
  } else if (fdn_pct < 35) {
    alertas.push("⚠️ FDN moderado (28-35%) - Vigilar rumia.");
    gdpEstimada = gdpEstimada * 0.8;
  }
  if (em_cumplimiento < 70) {
    alertas.push(`⚠️ Energía muy baja (${em_cumplimiento.toFixed(0)}% del requerimiento). Pérdida de peso probable.`);
    gdpEstimada = -0.2;
  } else if (em_cumplimiento < 85) {
    alertas.push(`⚠️ Energía insuficiente (${em_cumplimiento.toFixed(0)}%). Baja ganancia.`);
    gdpEstimada = gdpEstimada * 0.6;
  }
  if (pb_cumplimiento < 70) {
    alertas.push(`⚠️ Proteína muy baja (${pb_cumplimiento.toFixed(0)}%).`);
    if (gdpEstimada > 0) gdpEstimada = Math.max(0.1, gdpEstimada - 0.4);
  } else if (pb_cumplimiento < 85) {
    alertas.push(`⚠️ Proteína moderada (${pb_cumplimiento.toFixed(0)}%).`);
    if (gdpEstimada > 0) gdpEstimada = gdpEstimada * 0.85;
  }

  // Ajustar por calidad de ingredientes
  racion.forEach(r => {
    if (r.calidad === "Bajo" || r.calidad === "Muy deteriorado") {
      alertas.push(`⚠️ ${r.nombre} tiene baja calidad. Menor digestibilidad.`);
      gdpEstimada *= 0.9;
    }
  });

  // Redondear GDP
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;
  if (gdpEstimada < -0.2) gdpEstimada = -0.2;

  const costoDiario = racion.reduce((sum, r) => sum + r.precio_total, 0);
  const conversion = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";

  // Verificar mínimo de ingredientes
  if (racion.length < 4 && !dietaInsuficiente) {
    alertas.push(`⚠️ Solo ${racion.length} ingredientes. Se recomienda al menos 4 para una dieta balanceada.`);
  }

  return {
    error: false,
    dietaInsuficiente,
    gdp_estimada: gdpEstimada,
    racion,
    indicadores: {
      ms_total_kg: +ms_acum.toFixed(2),
      ms_pct_pv: +((ms_acum / pvN) * 100).toFixed(1),
      fdn_pct: +fdn_pct.toFixed(1),
      em_aportada: +em_acum.toFixed(2),
      em_requerida: +req.em_total.toFixed(2),
      pb_aportada: +pb_acum.toFixed(0),
      pb_requerida: +req.pb_total.toFixed(0),
      costo_dia: +costoDiario.toFixed(2),
      conversion,
      cumplimiento_energia: +em_cumplimiento.toFixed(0),
      cumplimiento_proteina: +pb_cumplimiento.toFixed(0),
    },
    alertas,
  };
}

// Función para reemplazar un ingrediente por otro de la misma categoría
export function reemplazarIngrediente(racionActual, idAEliminar, alimentosDisponibles, preciosUsuario, estadosCalidad, pv, sistemaId, modo) {
  const alimentoEliminado = racionActual.find(r => r.id === idAEliminar);
  if (!alimentoEliminado) return { error: true, msg: "Ingrediente no encontrado" };

  const categoria = alimentoEliminado.categoria;
  // Buscar otro alimento de la misma categoría que no esté ya en la ración
  const candidatos = alimentosDisponibles.filter(a =>
    a.categoria === categoria &&
    a.id !== idAEliminar &&
    !racionActual.some(r => r.id === a.id)
  );
  if (candidatos.length === 0) {
    return { error: true, msg: `No hay otro alimento de la categoría ${categoria} disponible para reemplazar.` };
  }
  // Elegir el mejor según el modo (óptimo o económico)
  if (modo === "economico") {
    candidatos.sort((a, b) => (preciosUsuario[a.id] ?? a.precio_kg) - (preciosUsuario[b.id] ?? b.precio_kg));
  } else {
    if (categoria === "energético") candidatos.sort((a, b) => b.em - a.em);
    else if (categoria === "proteico") candidatos.sort((a, b) => b.prot - a.prot);
    else candidatos.sort((a, b) => b.ms - a.ms);
  }
  const nuevoAlimento = candidatos[0];
  // Reemplazar manteniendo la misma cantidad en MS (o ajustando según límites)
  const msOriginal = alimentoEliminado.ms_kg;
  const nuevoKg = msOriginal / (nuevoAlimento.ms / 100);
  // Crear nueva ración
  const nuevaRacion = racionActual.filter(r => r.id !== idAEliminar);
  nuevaRacion.push({
    id: nuevoAlimento.id,
    nombre: nuevoAlimento.nombre,
    categoria: nuevoAlimento.categoria,
    kg_dia: +nuevoKg.toFixed(3),
    ms_kg: +msOriginal.toFixed(3),
    precio_total: +(nuevoKg * (preciosUsuario[nuevoAlimento.id] ?? nuevoAlimento.precio_kg)).toFixed(2),
    calidad: estadosCalidad[nuevoAlimento.id] || "Óptimo",
  });
  return { error: false, nuevaRacion, nuevoAlimento };
}

// Función para recalcular la ración después de cambios
export function recalcularRacion(racion, pv, sistemaId, req, modo) {
  let ms_acum = 0, em_acum = 0, pb_acum = 0, fdn_acum = 0;
  racion.forEach(r => {
    ms_acum += r.ms_kg;
    em_acum += r.ms_kg * r.em_real;
    pb_acum += r.ms_kg * (r.prot_real / 100) * 1000;
    fdn_acum += r.ms_kg * (r.fdn / 100);
  });
  const fdn_pct = ms_acum > 0 ? (fdn_acum / ms_acum) * 100 : 0;
  const em_cumplimiento = (em_acum / req.em_total) * 100;
  const pb_cumplimiento = (pb_acum / req.pb_total) * 100;
  let gdpEstimada = req.gdp;
  let alertas = [];
  if (fdn_pct < 28) gdpEstimada *= 0.3;
  else if (fdn_pct < 35) gdpEstimada *= 0.8;
  if (em_cumplimiento < 70) gdpEstimada = -0.2;
  else if (em_cumplimiento < 85) gdpEstimada *= 0.6;
  if (pb_cumplimiento < 70 && gdpEstimada > 0) gdpEstimada = Math.max(0.1, gdpEstimada - 0.4);
  else if (pb_cumplimiento < 85 && gdpEstimada > 0) gdpEstimada *= 0.85;
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;
  if (gdpEstimada < -0.2) gdpEstimada = -0.2;
  const costoDiario = racion.reduce((sum, r) => sum + r.precio_total, 0);
  const conversion = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";
  return {
    racion,
    gdp_estimada: gdpEstimada,
    indicadores: {
      ms_total_kg: +ms_acum.toFixed(2),
      ms_pct_pv: +((ms_acum / pv) * 100).toFixed(1),
      fdn_pct: +fdn_pct.toFixed(1),
      em_aportada: +em_acum.toFixed(2),
      em_requerida: +req.em_total.toFixed(2),
      pb_aportada: +pb_acum.toFixed(0),
      pb_requerida: +req.pb_total.toFixed(0),
      costo_dia: +costoDiario.toFixed(2),
      conversion,
      cumplimiento_energia: +em_cumplimiento.toFixed(0),
      cumplimiento_proteina: +pb_cumplimiento.toFixed(0),
    },
    alertas,
  };
}

function crearIndicadoresVacios(req) {
  return {
    ms_total_kg: 0,
    ms_pct_pv: 0,
    fdn_pct: 0,
    em_aportada: 0,
    em_requerida: req.em_total.toFixed(2),
    pb_aportada: 0,
    pb_requerida: req.pb_total.toFixed(0),
    costo_dia: 0,
    conversion: "N/A",
    cumplimiento_energia: 0,
    cumplimiento_proteina: 0,
  };
}
