// src/utils/nutricion.js
// ============================================================
// GANABOV ENGINE PRO - MOTOR NUTRICIONAL AVANZADO
// VERSIÓN CORREGIDA: forraje dinámico, iteración de energía y proteína
// ============================================================

export const FASES_FEEDLOT = {
  inicio: { nombre: "Inicio", dias: 14, conc_max: 50, peNDF_min: 22, forraje_min: 50, gdp_esperado: 1.2 },
  desarrollo: { nombre: "Desarrollo", dias: 21, conc_max: 70, peNDF_min: 16, forraje_min: 35, gdp_esperado: 1.6 },
  terminacion: { nombre: "Terminación", dias: 30, conc_max: 85, peNDF_min: 12, forraje_min: 25, gdp_esperado: 1.9 }
};

const CONFIG_SISTEMAS = {
  pastoril: { nombre: "Pastoril", gdp_min: 0.4, gdp_max: 0.7, cms_pct: 1.0, forraje_min: 0, concentrado_max: 100, enm_factor: 1.0, es_extensivo: true },
  semiIntensivo: { nombre: "Semi-intensivo", gdp_min: 0.8, gdp_max: 1.2, cms_pct: 2.5, forraje_min: 55, concentrado_max: 45, enm_factor: 1.0, es_extensivo: false },
  feedlot: { nombre: "Feedlot", gdp_min: 1.2, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 30, concentrado_max: 70, enm_factor: 0.85, es_extensivo: false }
};

const FACTORES_CALIDAD = {
  Óptimo: { enm: 1.0, prot: 1.0, digestibilidad: 1.0, consumo: 1.0, alerta: false },
  Bueno: { enm: 0.95, prot: 0.95, digestibilidad: 0.95, consumo: 0.98, alerta: false },
  Regular: { enm: 0.85, prot: 0.85, digestibilidad: 0.85, consumo: 0.92, alerta: false },
  Bajo: {
    enm: 0.70, prot: 0.70, digestibilidad: 0.70, consumo: 0.85, alerta: true,
    msg: "⚠️ ALERTA: Calidad BAJA - Menor digestibilidad, menor consumo, riesgo de baja ganancia"
  },
  "Muy deteriorado": {
    enm: 0.50, prot: 0.50, digestibilidad: 0.50, consumo: 0.70, alerta: true,
    msg: "🚨 ALERTA CRÍTICA: Calidad MUY DETERIORADA - Riesgo de rechazo del alimento, posible pérdida de peso"
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

const INGREDIENTES_RESTRINGIDOS = {
  pastoril: ['grasa_bypass', 'harina_sangre', 'harina_pescado', 'monensina'],
  semiIntensivo: ['grasa_bypass', 'harina_sangre', 'harina_pescado'],
  feedlot: ['harina_sangre']
};

const GRANOS_TRADICIONALES = ['maiz_amarillo', 'maiz_blanco', 'sorgo_grano', 'sorgo_rojo', 'cebada_grano', 'trigo_grano', 'avena_grano'];
const SUBPRODUCTOS_FIBROSOS = ['cascarilla_soya', 'afrecho_trigo', 'salvado_trigo', 'pulpa_citrica', 'germen_maiz'];

// Prioridad de proteicos: soya > tortas > harinas animales
const getPriorityProteico = (id) => {
  if (id === 'harina_soya' || id === 'soya_integral') return 0;
  if (id === 'expeller_soya') return 1;
  if (id === 'torta_mani' || id === 'torta_canola') return 2;
  if (id === 'torta_girasol' || id === 'torta_algodon') return 3;
  if (id === 'harina_pescado') return 4;
  if (id === 'harina_carne' || id === 'harina_sangre') return 5;
  return 6;
};

// Calcular forraje_min ajustado según peso del animal
const getForrajeMinAjustado = (pv, sistema, fase) => {
  let base = sistema.forraje_min;
  if (fase && FASES_FEEDLOT[fase]) base = FASES_FEEDLOT[fase].forraje_min;

  // Ajuste por peso: animales livianos necesitan menos forraje relativo (más concentrado)
  if (pv < 240) base = Math.max(25, base - 20);
  else if (pv < 280) base = Math.max(30, base - 12);
  else if (pv < 320) base = Math.max(35, base - 6);

  return base;
};

export function formularRacionAvanzada({
  pv, sistemaId, razaId = "otro", alimentosDisponibles,
  preciosUsuario = {}, estadosCalidad = {}, modo = "optimo",
  fase = null, alimentosSeleccionadosIds = null
}) {
  const pvN = parseFloat(pv);
  if (isNaN(pvN) || pvN < 80) return { error: true, msg: "Peso mínimo 80 kg" };

  const sistema = CONFIG_SISTEMAS[sistemaId] || CONFIG_SISTEMAS.semiIntensivo;
  const razaParam = RAZA_PARAMS[razaId] || RAZA_PARAMS.otro;
  const esPersonalizado = (modo === "personalizado");
  const esMisAlimentos = (modo === "mis_alimentos");
  const esEconomico = (modo === "economico");
  const esAutomatico = (modo === "optimo" || modo === "economico");
  const esPastorilAuto = (sistemaId === "pastoril" && esAutomatico);

  // Filtrar alimentos según modo
  let alimentosUsar = alimentosDisponibles;
  if (esMisAlimentos && alimentosSeleccionadosIds && alimentosSeleccionadosIds.size > 0) {
    alimentosUsar = alimentosDisponibles.filter(al => alimentosSeleccionadosIds.has(al.id));
  }

  // ========== GDP OBJETIVO ==========
  let gdpObjetivo;
  if (sistemaId === "feedlot" && fase && FASES_FEEDLOT[fase]) {
    gdpObjetivo = FASES_FEEDLOT[fase].gdp_esperado * razaParam.gdp;
  } else {
    gdpObjetivo = (sistema.gdp_min + sistema.gdp_max) / 2 * razaParam.gdp;
  }
  gdpObjetivo = Math.min(gdpObjetivo, sistema.gdp_max * razaParam.gdp);
  gdpObjetivo = Math.max(gdpObjetivo, sistema.gdp_min * razaParam.gdp * 0.8);

  // ========== REQUERIMIENTOS ==========
  const pvMet = Math.pow(pvN, 0.75);
  const ENm_mant = 0.077 * pvMet * 1.1;
  const ENg_por_kg = 0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdpObjetivo;
  const ENm_crec = gdpObjetivo * ENg_por_kg;
  let ENm_total = (ENm_mant + ENm_crec) * sistema.enm_factor;
  const PB_total = (3.8 * pvMet + gdpObjetivo * 268 - 29.4 * ENg_por_kg) / 0.65;

  // ========== CONSUMO DE MS ==========
  let cmsBase;
  if (esPastorilAuto) {
    cmsBase = pvN * 0.01; // 1% PV para suplemento
  } else {
    cmsBase = pvN * (sistema.cms_pct / 100) * razaParam.consumo;
  }
  if (sistemaId === "feedlot" && fase) {
    if (fase === "inicio") cmsBase *= 0.92;
    else if (fase === "terminacion") cmsBase *= 1.05;
  }

  let maxConcentrado = sistema.concentrado_max;
  if (sistemaId === "feedlot" && fase && FASES_FEEDLOT[fase]) {
    maxConcentrado = FASES_FEEDLOT[fase].conc_max;
  }

  // ========== PROCESAR ALIMENTOS CON CALIDAD ==========
  let alertasCalidad = [];
  const alimentos = alimentosUsar.map(al => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const factor = FACTORES_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : (al.precio_kg || 0);
    if (factor.alerta && al.categoria !== "mineral") {
      alertasCalidad.push({ id: al.id, nombre: al.nombre, calidad, mensaje: factor.msg });
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

  // ========== SEPARAR POR CATEGORÍA ==========
  let forrajes = alimentos.filter(a => a.categoria === "forraje");
  let energeticos = alimentos.filter(a => a.categoria === "energético");
  let proteicos = alimentos.filter(a => a.categoria === "proteico");
  let minerales = alimentos.filter(a => a.categoria === "mineral");
  let subproductosFibrosos = alimentos.filter(a => SUBPRODUCTOS_FIBROSOS.includes(a.id) && a.categoria !== "forraje");

  if (esPastorilAuto) forrajes = [];

  // ========== DETECCIÓN DE DEFICIENCIAS (solo en modos manuales) ==========
  let deficiencias = [];
  if (esMisAlimentos) {
    if (forrajes.length === 0) deficiencias.push({ tipo: "forraje", msg: "⚠️ No has seleccionado ningún FORRAJE." });
    if (energeticos.length === 0) deficiencias.push({ tipo: "energético", msg: "⚠️ FALTAN ENERGÉTICOS. Recomendación: Maíz, Sorgo, Melaza o Yuca." });
    if (proteicos.length === 0) deficiencias.push({ tipo: "proteico", msg: "⚠️ FALTAN PROTEICOS. Recomendación: Harina de Soya, Torta de Girasol o Afrecho." });
    if (minerales.length === 0) deficiencias.push({ tipo: "mineral", msg: "⚠️ FALTA SAL MINERAL." });
  }

  // ========== ORDENAR SEGÚN MODO ==========
  if (esEconomico) {
    forrajes.sort((a, b) => a.precio_kg - b.precio_kg);
    energeticos.sort((a, b) => a.precio_kg - b.precio_kg);
    proteicos.sort((a, b) => a.precio_kg - b.precio_kg);
    subproductosFibrosos.sort((a, b) => a.precio_kg - b.precio_kg);
  } else {
    // Forrajes: ordenar por CALIDAD (ENm + peNDF balanceado), no solo fibra
    forrajes.sort((a, b) => {
      const scoreA = (a.enm * 0.6) + (a.peNDF / 100 * 0.4);
      const scoreB = (b.enm * 0.6) + (b.peNDF / 100 * 0.4);
      return scoreB - scoreA;
    });
    // Energéticos: granos primero, luego por ENm
    energeticos.sort((a, b) => {
      const aEsGrano = GRANOS_TRADICIONALES.includes(a.id);
      const bEsGrano = GRANOS_TRADICIONALES.includes(b.id);
      if (aEsGrano && !bEsGrano) return -1;
      if (!aEsGrano && bEsGrano) return 1;
      return b.enm - a.enm;
    });
    // Proteicos: por prioridad de calidad
    proteicos.sort((a, b) => {
      const pA = getPriorityProteico(a.id);
      const pB = getPriorityProteico(b.id);
      if (pA !== pB) return pA - pB;
      return b.prot - a.prot;
    });
    subproductosFibrosos.sort((a, b) => b.peNDF - a.peNDF);
  }

  // ========== RESTRICCIONES POR SISTEMA ==========
  const ingredientesRestringidos = INGREDIENTES_RESTRINGIDOS[sistemaId] || [];
  energeticos = energeticos.filter(e => !ingredientesRestringidos.includes(e.id));
  proteicos = proteicos.filter(p => !ingredientesRestringidos.includes(p.id));
  subproductosFibrosos = subproductosFibrosos.filter(s => !ingredientesRestringidos.includes(s.id));

  // ========== CONSTRUCCIÓN DE LA RACIÓN ==========
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

  // Calcular forraje mínimo dinámico
  const forrajeMinDinamico = getForrajeMinAjustado(pvN, sistema, fase);
  const peNDF_min_seguro = sistemaId === "pastoril" ? 22 : (fase && FASES_FEEDLOT[fase] ? FASES_FEEDLOT[fase].peNDF_min : 22);

  // ========== 1. FORRAJE ==========
  if (!esPastorilAuto && forrajes.length > 0) {
    const pctForrajeInicial = forrajeMinDinamico / 100;
    let msForraje = cmsBase * pctForrajeInicial;

    // Asignar los mejores forrajes (ya están ordenados por calidad)
    let msForrajeRestante = msForraje;
    for (let i = 0; i < forrajes.length && msForrajeRestante > 0.05; i++) {
      const f = forrajes[i];
      // Para el primer forraje 70%, segundo 30%, resto 0
      let pctAsignar = i === 0 ? 0.7 : (i === 1 ? 0.3 : 0);
      if (forrajes.length === 1) pctAsignar = 1.0;
      const msAsignar = Math.min(msForrajeRestante, msForraje * pctAsignar);
      if (msAsignar > 0.05) {
        agregar(f, msAsignar / (f.ms / 100));
        msForrajeRestante -= msAsignar;
      }
    }
  }

  // ========== 2. MINERAL ==========
  if (minerales.length) {
    // Priorizar sal mineral de engorde, luego lactancia, luego recría
    const salIdeal = minerales.find(m => m.id === "sal_mineral") || minerales[0];
    agregar(salIdeal, pvN * 0.0004);
  }

  // ========== 3. ITERACIÓN PARA CUBRIR ENERGÍA Y PROTEÍNA ==========
  // Capacidad de concentrado disponible
  let msDisponibleConcentrado = Math.max(0, cmsBase - ms_acum);

  // Iterar: en automático intentamos cubrir el 100%
  let iteraciones = 0;
  const MAX_ITERACIONES = 8;

  while (iteraciones < MAX_ITERACIONES) {
    iteraciones++;

    const deficitENm = Math.max(0, ENm_total - enm_acum);
    const deficitPB = Math.max(0, PB_total - pb_acum);
    const peNDF_pct_actual = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;

    // Si ya cubrimos ambos, salimos
    if (deficitENm < 0.2 && deficitPB < 20) break;

    // Si no hay espacio de concentrado, salimos
    if (msDisponibleConcentrado < 0.1) {
      // En automático, intentar reducir forraje para hacer espacio
      if (esAutomatico && forrajes.length > 0) {
        // Reducir la ración de forraje actual en 0.3 kg MS
        const forrajeItem = racion.find(r => r.categoria === "forraje");
        if (forrajeItem && forrajeItem.ms_kg > 0.5) {
          const alForraje = alimentos.find(a => a.id === forrajeItem.id);
          if (alForraje) {
            const reduccionMS = Math.min(0.3, forrajeItem.ms_kg - 0.5);
            const kgReducir = reduccionMS / (alForraje.ms / 100);
            forrajeItem.kg_dia = +(forrajeItem.kg_dia - kgReducir).toFixed(2);
            forrajeItem.ms_kg = +(forrajeItem.ms_kg - reduccionMS).toFixed(2);
            forrajeItem.enm_kg = +(forrajeItem.ms_kg * alForraje.enm).toFixed(2);
            forrajeItem.pb_kg = +(forrajeItem.ms_kg * (alForraje.prot / 100) * 1000).toFixed(0);
            forrajeItem.precio_total = +(forrajeItem.kg_dia * alForraje.precio_kg).toFixed(2);
            ms_acum -= reduccionMS;
            enm_acum -= reduccionMS * alForraje.enm;
            pb_acum -= reduccionMS * (alForraje.prot / 100) * 1000;
            peNDF_acum -= reduccionMS * (alForraje.peNDF / 100);
            msDisponibleConcentrado = Math.max(0, cmsBase - ms_acum);
          }
        }
      }
      if (msDisponibleConcentrado < 0.1) break;
    }

    // ---------- A) CUBRIR ENERGÍA ----------
    if (deficitENm > 0.2 && energeticos.length > 0) {
      // Buscar el mejor energético disponible que no haya excedido su límite
      const candidatos = energeticos.filter(e => {
        const itemActual = racion.find(r => r.id === e.id);
        const msActual = itemActual ? itemActual.ms_kg : 0;
        if (e.max_ms_pct) {
          const maxMs = cmsBase * (e.max_ms_pct / 100);
          return msActual < maxMs;
        }
        return true;
      });

      if (candidatos.length > 0) {
        const mejorE = candidatos[0]; // ya está ordenado por prioridad
        // Calcular cuánto necesitamos para cubrir el déficit
        let msNecesaria = deficitENm / mejorE.enm;
        msNecesaria = Math.min(msNecesaria, msDisponibleConcentrado);

        // Aplicar límite individual
        if (mejorE.max_ms_pct) {
          const itemActual = racion.find(r => r.id === mejorE.id);
          const msActual = itemActual ? itemActual.ms_kg : 0;
          const maxMs = cmsBase * (mejorE.max_ms_pct / 100);
          msNecesaria = Math.min(msNecesaria, maxMs - msActual);
        }

        // Mínimo práctico: 0.3 kg MS (evita cantidades ridículas)
        msNecesaria = Math.max(msNecesaria, 0.3);

        if (msNecesaria > 0.1 && msDisponibleConcentrado >= msNecesaria) {
          // Verificar que el peNDF resultante sea seguro
          const nuevoMs = ms_acum + msNecesaria;
          const nuevoPeNDF = peNDF_acum + msNecesaria * (mejorE.peNDF / 100);
          const nuevoPeNDF_pct = nuevoMs > 0 ? (nuevoPeNDF / nuevoMs) * 100 : 0;

          if (nuevoPeNDF_pct >= peNDF_min_seguro || !esAutomatico) {
            agregar(mejorE, msNecesaria / (mejorE.ms / 100));
            msDisponibleConcentrado -= msNecesaria;
            continue; // Volver al inicio del while para recalcular
          } else {
            // En automático, si bajaría peNDF por debajo del mínimo, intentamos reducir un poco
            // En manual, dejamos que el usuario decida
            if (!esAutomatico) {
              agregar(mejorE, msNecesaria / (mejorE.ms / 100));
              msDisponibleConcentrado -= msNecesaria;
              continue;
            }
            // En automático, no agregamos y pasamos a proteína
          }
        }
      }
    }

    // ---------- B) CUBRIR PROTEÍNA ----------
    if (deficitPB > 20 && proteicos.length > 0) {
      const candidatos = proteicos.filter(p => {
        const itemActual = racion.find(r => r.id === p.id);
        const msActual = itemActual ? itemActual.ms_kg : 0;
        if (p.max_ms_pct) {
          const maxMs = cmsBase * (p.max_ms_pct / 100);
          return msActual < maxMs;
        }
        return true;
      });

      if (candidatos.length > 0) {
        const mejorP = candidatos[0];
        let msNecesaria = (deficitPB / 1000) / (mejorP.prot / 100);
        msNecesaria = Math.min(msNecesaria, msDisponibleConcentrado);

        if (mejorP.max_ms_pct) {
          const itemActual = racion.find(r => r.id === mejorP.id);
          const msActual = itemActual ? itemActual.ms_kg : 0;
          const maxMs = cmsBase * (mejorP.max_ms_pct / 100);
          msNecesaria = Math.min(msNecesaria, maxMs - msActual);
        }

        // Mínimo práctico: 0.15 kg MS para proteicos
        msNecesaria = Math.max(msNecesaria, 0.15);

        if (msNecesaria > 0.1 && msDisponibleConcentrado >= msNecesaria) {
          agregar(mejorP, msNecesaria / (mejorP.ms / 100));
          msDisponibleConcentrado -= msNecesaria;
          continue;
        }
      }
    }

    // Si no pudimos hacer nada más, salimos
    break;
  }

  // ========== 4. COMPLETAR CON SUBPRODUCTOS FIBROSOS SI FALTA FIBRA ==========
  const peNDF_pct_check = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;
  if (peNDF_pct_check < peNDF_min_seguro && subproductosFibrosos.length > 0 && msDisponibleConcentrado > 0.1) {
    const fibra = subproductosFibrosos[0];
    const msFibra = Math.min(msDisponibleConcentrado, 0.5);
    agregar(fibra, msFibra / (fibra.ms / 100));
    msDisponibleConcentrado -= msFibra;
  }

  // ========== 5. COMPLETAR MÍNIMO 4 INGREDIENTES ==========
  if (racion.length < 4 && !esPastorilAuto) {
    const extras = [...forrajes, ...energeticos, ...proteicos].filter(a => !racion.some(r => r.id === a.id));
    for (let i = 0; i < extras.length && racion.length < 4; i++) {
      if (msDisponibleConcentrado > 0.2) {
        agregar(extras[i], 0.2);
        msDisponibleConcentrado -= 0.2;
      }
    }
  }

  // ========== 6. CÁLCULO DE INDICADORES ==========
  ms_acum = Math.round(ms_acum * 100) / 100;
  const peNDF_pct = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;
  const pctConcentrado = ((ms_acum - racion.filter(r => r.categoria === "forraje").reduce((s, r) => s + r.ms_kg, 0)) / ms_acum) * 100;

  // Score acidosis
  let scoreAcidosis = 0;
  if (peNDF_pct < 18) scoreAcidosis += 40;
  else if (peNDF_pct < 24) scoreAcidosis += 25;
  else if (peNDF_pct < 30) scoreAcidosis += 10;
  if (pctConcentrado > 65) scoreAcidosis += 30;
  else if (pctConcentrado > 50) scoreAcidosis += 15;
  else if (pctConcentrado > 35) scoreAcidosis += 5;

  let riesgoAcidosis = "seguro";
  if (scoreAcidosis >= 70) riesgoAcidosis = "crítico";
  else if (scoreAcidosis >= 50) riesgoAcidosis = "alto";
  else if (scoreAcidosis >= 25) riesgoAcidosis = "precaución";

  let riesgoMostrado = riesgoAcidosis;
  if (esPastorilAuto && (riesgoAcidosis === "crítico" || riesgoAcidosis === "alto")) {
    riesgoMostrado = "precaución (con pasto)";
  }

  // ========== 7. GDP ESTIMADA ==========
  let gdpEstimada = gdpObjetivo;
  const cumplimientoENm = enm_acum / ENm_total;
  const cumplimientoPB = pb_acum / PB_total;

  if (cumplimientoENm < 0.95) {
    const deficitRelativo = 1 - cumplimientoENm;
    gdpEstimada = gdpEstimada * (1 - deficitRelativo * 1.1);
  }
  if (cumplimientoENm > 1.05) {
    gdpEstimada = gdpEstimada * Math.min(1.1, cumplimientoENm);
  }
  if (cumplimientoPB > 1.2) {
    gdpEstimada *= 0.95;
  }
  if (cumplimientoPB < 0.9) {
    gdpEstimada *= 0.92;
  }
  if (scoreAcidosis > 60) gdpEstimada *= 0.9;
  else if (scoreAcidosis > 40) gdpEstimada *= 0.95;

  gdpEstimada = Math.min(gdpEstimada, sistema.gdp_max * razaParam.gdp);
  gdpEstimada = Math.max(gdpEstimada, sistema.gdp_min * razaParam.gdp * 0.7);
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;

  const costoDiario = racion.reduce((s, r) => s + r.precio_total, 0);
  const conversion = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";

  // ========== 8. ALERTAS Y EXPLICACIONES ==========
  let alertas = [];
  let explicaciones = [];

  // En modo automático: solo alertar si el déficit es CRÍTICO (> 15%)
  const deficitENmPorc = (1 - cumplimientoENm) * 100;
  const deficitPBPorc = (1 - cumplimientoPB) * 100;

  if (esAutomatico) {
    if (deficitENmPorc > 15) {
      alertas.push(`⚠️ Déficit energético severo (${deficitENmPorc.toFixed(0)}%). Considere revisar la base de alimentos o el sistema de producción.`);
    }
    if (cumplimientoPB > 1.3) {
      alertas.push(`⚠️ Exceso de proteína (${(cumplimientoPB * 100).toFixed(0)}% del requerimiento). Se puede optimizar costos.`);
    }
    if (peNDF_pct > 30) {
      explicaciones.push("Se priorizaron forrajes de buena calidad y fibra efectiva.");
    }
    if (esPastorilAuto) {
      explicaciones.push("🌾 Sistema pastoril: suplemento formulado para complementar el pastoreo. El animal debe tener acceso a pasto fresco.");
    } else {
      explicaciones.push("✅ Ración balanceada según NRC. Se priorizó cobertura energética y de proteína.");
    }
  } else {
    // Modo manual: alertar déficit de cualquier tipo
    if (deficitENmPorc > 5) {
      alertas.push(`⚠️ Déficit energético (${deficitENmPorc.toFixed(0)}%). Agregue más alimentos energéticos (maíz, sorgo, melaza).`);
    }
    if (deficitPBPorc > 5) {
      alertas.push(`⚠️ Déficit proteico (${deficitPBPorc.toFixed(0)}%). Agregue torta de soya, girasol o harina de carne.`);
    }
    if (cumplimientoPB > 1.3) {
      alertas.push(`⚠️ Exceso de proteína (${(cumplimientoPB * 100).toFixed(0)}%). Considere reducir fuentes proteicas.`);
    }
    if (riesgoAcidosis === "alto" || riesgoAcidosis === "crítico") {
      alertas.push(`🔴 Riesgo de acidosis: ${riesgoAcidosis.toUpperCase()}. Agregue fibra o reduzca concentrado.`);
    }
    if (esMisAlimentos && deficiencias.length > 0) {
      explicaciones.push("Se formuló con los alimentos que seleccionaste. Revisa las alertas de deficiencia.");
    }
  }

  // Explicaciones de calidad (siempre)
  if (alertasCalidad.length > 0) {
    explicaciones.push(`Hay ${alertasCalidad.length} alimento(s) en mal estado. Revisa las alertas específicas.`);
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
      riesgo_acidosis: riesgoMostrado,
      score_acidosis: scoreAcidosis,
      cumplimiento_energia: +(Math.min(120, cumplimientoENm * 100)).toFixed(0),
      cumplimiento_proteina: +(Math.min(130, cumplimientoPB * 100)).toFixed(0)
    },
    alertasCalidad: alertasCalidad,
    deficiencias: deficiencias,
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
  let ENm_total = (ENm_mant + (gdpObjetivo * ENg)) * sistema.enm_factor;
  const PB_total = (3.8 * pvMet + gdpObjetivo * 268 - 29.4 * ENg) / 0.65;
  return { ENm_total, PB_total, gdp_objetivo: gdpObjetivo };
}
