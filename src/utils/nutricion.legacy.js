// src/utils/nutricion.js
// ============================================================
// GANABOV ENGINE PRO - MOTOR NUTRICIONAL AVANZADO
// VERSIÓN CORREGIDA: peNDF parcial, MS completa, mensajes coherentes
// ============================================================

export const FASES_FEEDLOT = {
  inicio: { nombre: "Inicio", dias: 14, conc_max: 50, peNDF_min: 22, forraje_min: 50, gdp_esperado: 1.2 },
  desarrollo: { nombre: "Desarrollo", dias: 21, conc_max: 70, peNDF_min: 16, forraje_min: 35, gdp_esperado: 1.6 },
  terminacion: { nombre: "Terminación", dias: 30, conc_max: 85, peNDF_min: 12, forraje_min: 25, gdp_esperado: 1.9 }
};

const CONFIG_SISTEMAS = {
  pastoril: { nombre: "Pastoril", gdp_min: 0.4, gdp_max: 0.7, cms_pct: 1.0, forraje_min: 0, concentrado_max: 100, enm_factor: 1.0, es_extensivo: true, monensina_mg_kg: 18 },
  semiIntensivo: { nombre: "Semi-intensivo", gdp_min: 0.8, gdp_max: 1.2, cms_pct: 2.5, forraje_min: 55, concentrado_max: 45, enm_factor: 1.0, es_extensivo: false, monensina_mg_kg: 22 },
  feedlot: { nombre: "Feedlot", gdp_min: 1.2, gdp_max: 2.0, cms_pct: 2.8, forraje_min: 30, concentrado_max: 70, enm_factor: 0.85, es_extensivo: false, monensina_mg_kg: 28 }
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

const getPriorityProteico = (id) => {
  if (id === 'harina_soya' || id === 'soya_integral') return 0;
  if (id === 'expeller_soya') return 1;
  if (id === 'torta_mani' || id === 'torta_canola') return 2;
  if (id === 'torta_girasol' || id === 'torta_algodon') return 3;
  if (id === 'harina_pescado') return 4;
  if (id === 'harina_carne' || id === 'harina_sangre') return 5;
  return 6;
};

const getForrajeMinAjustado = (pv, sistema, fase) => {
  let base = sistema.forraje_min;
  if (fase && FASES_FEEDLOT[fase]) base = FASES_FEEDLOT[fase].forraje_min;
  if (pv < 240) base = Math.max(25, base - 20);
  else if (pv < 280) base = Math.max(30, base - 12);
  else if (pv < 320) base = Math.max(35, base - 6);
  return base;
};

const getCaP = (al) => {
  const ca = al.ca !== undefined ? al.ca : (al.categoria === "forraje" ? 0.3 : 0.1);
  const p = al.p !== undefined ? al.p : (al.categoria === "forraje" ? 0.2 : 0.3);
  return { ca, p };
};

const getAjusteTemperatura = (temperatura) => {
  const t = temperatura !== undefined ? temperatura : 28;
  if (t > 38) return 0.80;
  if (t > 35) return 0.85;
  if (t > 32) return 0.90;
  if (t > 30) return 0.95;
  return 1.0;
};

export function formularRacionAvanzada({
  pv, sistemaId, razaId = "otro", alimentosDisponibles,
  preciosUsuario = {}, estadosCalidad = {}, modo = "optimo",
  fase = null, alimentosSeleccionadosIds = null, temperatura = 28
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

  // ========== CONSUMO DE MS CON AJUSTE POR TEMPERATURA ==========
  let cmsBase;
  if (esPastorilAuto) {
    cmsBase = pvN * 0.01;
  } else {
    cmsBase = pvN * (sistema.cms_pct / 100) * razaParam.consumo;
  }
  cmsBase *= getAjusteTemperatura(temperatura);

  if (sistemaId === "feedlot" && fase) {
    if (fase === "inicio") cmsBase *= 0.92;
    else if (fase === "terminacion") cmsBase *= 1.05;
  }

  let maxConcentrado = sistema.concentrado_max;
  if (sistemaId === "feedlot" && fase && FASES_FEEDLOT[fase]) {
    maxConcentrado = FASES_FEEDLOT[fase].conc_max;
  }

  // ========== PROCESAR ALIMENTOS ==========
  let alertasCalidad = [];
  const alimentos = alimentosUsar.map(al => {
    const calidad = estadosCalidad[al.id] || "Óptimo";
    const factor = FACTORES_CALIDAD[calidad];
    const precio = preciosUsuario[al.id] !== undefined ? parseFloat(preciosUsuario[al.id]) : (al.precio_kg || 0);
    if (factor.alerta && al.categoria !== "mineral") {
      alertasCalidad.push({ id: al.id, nombre: al.nombre, calidad, mensaje: factor.msg });
    }
    const { ca, p } = getCaP(al);
    return {
      ...al,
      ms: al.ms || 25,
      prot: (al.prot || 8) * factor.prot,
      enm: (al.enm || 1.0) * factor.enm,
      fdn: al.fdn || 50,
      peNDF: al.peNDF || (al.fdn || 50) * (al.tam_particula ? Math.min(1, al.tam_particula / 3) : 0.5),
      precio_kg: precio,
      calidad_actual: calidad,
      ca, p
    };
  });

  // ========== SEPARAR CATEGORÍAS ==========
  let forrajes = alimentos.filter(a => a.categoria === "forraje");
  let energeticos = alimentos.filter(a => a.categoria === "energético");
  let proteicos = alimentos.filter(a => a.categoria === "proteico");
  let minerales = alimentos.filter(a => a.categoria === "mineral");
  let subproductosFibrosos = alimentos.filter(a => SUBPRODUCTOS_FIBROSOS.includes(a.id) && a.categoria !== "forraje");

  const monensinaDisponible = alimentos.find(a => a.id === "monensina" || a.id === "monensina_ionoforo");

  if (esPastorilAuto) forrajes = [];

  // ========== DEFICIENCIAS ==========
  let deficiencias = [];
  if (esMisAlimentos) {
    if (forrajes.length === 0) deficiencias.push({ tipo: "forraje", msg: "⚠️ No has seleccionado ningún FORRAJE." });
    if (energeticos.length === 0) deficiencias.push({ tipo: "energético", msg: "⚠️ FALTAN ENERGÉTICOS. Recomendación: Maíz, Sorgo, Melaza o Yuca." });
    if (proteicos.length === 0) deficiencias.push({ tipo: "proteico", msg: "⚠️ FALTAN PROTEICOS. Recomendación: Harina de Soya, Torta de Girasol o Afrecho." });
    if (minerales.length === 0) deficiencias.push({ tipo: "mineral", msg: "⚠️ FALTA SAL MINERAL." });
  }

  // ========== ORDENAR ==========
  if (esEconomico) {
    forrajes.sort((a, b) => a.precio_kg - b.precio_kg);
    energeticos.sort((a, b) => a.precio_kg - b.precio_kg);
    proteicos.sort((a, b) => a.precio_kg - b.precio_kg);
    subproductosFibrosos.sort((a, b) => a.precio_kg - b.precio_kg);
  } else {
    forrajes.sort((a, b) => {
      const scoreA = (a.enm * 0.6) + (a.peNDF / 100 * 0.4);
      const scoreB = (b.enm * 0.6) + (b.peNDF / 100 * 0.4);
      return scoreB - scoreA;
    });
    energeticos.sort((a, b) => {
      const aEsGrano = GRANOS_TRADICIONALES.includes(a.id);
      const bEsGrano = GRANOS_TRADICIONALES.includes(b.id);
      if (aEsGrano && !bEsGrano) return -1;
      if (!aEsGrano && bEsGrano) return 1;
      return b.enm - a.enm;
    });
    proteicos.sort((a, b) => {
      const pA = getPriorityProteico(a.id);
      const pB = getPriorityProteico(b.id);
      if (pA !== pB) return pA - pB;
      return b.prot - a.prot;
    });
    subproductosFibrosos.sort((a, b) => b.peNDF - a.peNDF);
  }

  // ========== RESTRICCIONES ==========
  const ingredientesRestringidos = INGREDIENTES_RESTRINGIDOS[sistemaId] || [];
  energeticos = energeticos.filter(e => !ingredientesRestringidos.includes(e.id));
  proteicos = proteicos.filter(p => !ingredientesRestringidos.includes(p.id));
  subproductosFibrosos = subproductosFibrosos.filter(s => !ingredientesRestringidos.includes(s.id));

  // ========== RACIÓN ==========
  let racion = [];
  let ms_acum = 0, enm_acum = 0, pb_acum = 0, peNDF_acum = 0;
  let ca_acum = 0, p_acum = 0;

  const agregar = (al, kgFresco) => {
    if (kgFresco <= 0.05) return;
    const msKg = kgFresco * (al.ms / 100);
    racion.push({
      id: al.id, nombre: al.nombre, categoria: al.categoria,
      kg_dia: +kgFresco.toFixed(2), ms_kg: +msKg.toFixed(2),
      enm_kg: +(msKg * al.enm).toFixed(2),
      pb_kg: +(msKg * (al.prot / 100) * 1000).toFixed(0),
      precio_total: +(kgFresco * al.precio_kg).toFixed(2),
      calidad: al.calidad_actual,
      ca_kg: +(msKg * al.ca / 100).toFixed(3),
      p_kg: +(msKg * al.p / 100).toFixed(3)
    });
    ms_acum += msKg;
    enm_acum += msKg * al.enm;
    pb_acum += msKg * (al.prot / 100) * 1000;
    peNDF_acum += msKg * (al.peNDF / 100);
    ca_acum += msKg * al.ca / 100;
    p_acum += msKg * al.p / 100;
  };

  const forrajeMinDinamico = getForrajeMinAjustado(pvN, sistema, fase);
  const peNDF_min_seguro = sistemaId === "pastoril" ? 22 : (fase && FASES_FEEDLOT[fase] ? FASES_FEEDLOT[fase].peNDF_min : 22);
  const peNDF_min_dec = peNDF_min_seguro / 100;

  // ========== 1. FORRAJE ==========
  if (!esPastorilAuto && forrajes.length > 0) {
    const pctForrajeInicial = forrajeMinDinamico / 100;
    let msForraje = cmsBase * pctForrajeInicial;
    let msForrajeRestante = msForraje;
    for (let i = 0; i < forrajes.length && msForrajeRestante > 0.05; i++) {
      const f = forrajes[i];
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
    const salIdeal = minerales.find(m => m.id === "sal_mineral") || minerales[0];
    agregar(salIdeal, pvN * 0.0004);
  }

  // ========== 3. ITERACIÓN CORREGIDA CON peNDF PARCIAL ==========
  let msDisponibleConcentrado = Math.max(0, cmsBase - ms_acum);
  let iteraciones = 0;
  const MAX_ITERACIONES = 20;

  while (iteraciones < MAX_ITERACIONES) {
    iteraciones++;
    const deficitENm = Math.max(0, ENm_total - enm_acum);
    const deficitPB = Math.max(0, PB_total - pb_acum);

    if (deficitENm < 0.2 && deficitPB < 20) break;
    if (msDisponibleConcentrado < 0.05) {
      // Intentar reducir forraje para hacer espacio (solo en automático)
      if (esAutomatico && forrajes.length > 0) {
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
            ca_acum -= reduccionMS * alForraje.ca / 100;
            p_acum -= reduccionMS * alForraje.p / 100;
            msDisponibleConcentrado = Math.max(0, cmsBase - ms_acum);
          }
        }
      }
      if (msDisponibleConcentrado < 0.05) break;
    }

    let hizoCambio = false;

    // *** A) ENERGÍA CON peNDF PARCIAL ***
    if (deficitENm > 0.2 && energeticos.length > 0) {
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
        const mejorE = candidatos[0];
        let msNecesaria = deficitENm / mejorE.enm;

        // Limitar por max_ms_pct
        if (mejorE.max_ms_pct) {
          const itemActual = racion.find(r => r.id === mejorE.id);
          const msActual = itemActual ? itemActual.ms_kg : 0;
          const maxMs = cmsBase * (mejorE.max_ms_pct / 100);
          msNecesaria = Math.min(msNecesaria, maxMs - msActual);
        }

        // Limitar por espacio disponible
        msNecesaria = Math.min(msNecesaria, msDisponibleConcentrado);

        // *** CÁLCULO DE MÁXIMO SIN BAJAR peNDF ***
        const peNDF_alimento_dec = mejorE.peNDF / 100;
        if (peNDF_alimento_dec < peNDF_min_dec) {
          const numerador = peNDF_acum - peNDF_min_dec * ms_acum;
          const denominador = peNDF_min_dec - peNDF_alimento_dec;
          if (denominador > 0) {
            const msMaximaSinBajarPeNDF = Math.max(0, numerador / denominador);
            msNecesaria = Math.min(msNecesaria, msMaximaSinBajarPeNDF);
          }
        }

        // Mínimo práctico: 0.2 kg MS
        if (msNecesaria >= 0.2) {
          agregar(mejorE, msNecesaria / (mejorE.ms / 100));
          msDisponibleConcentrado -= msNecesaria;
          hizoCambio = true;
          continue;
        } else if (msNecesaria >= 0.05) {
          // Aceptamos cantidades pequeñas si son significativas (evita el "no añadir nada")
          agregar(mejorE, msNecesaria / (mejorE.ms / 100));
          msDisponibleConcentrado -= msNecesaria;
          hizoCambio = true;
          continue;
        }
      }
    }

    // *** B) PROTEÍNA CON peNDF PARCIAL ***
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

        if (mejorP.max_ms_pct) {
          const itemActual = racion.find(r => r.id === mejorP.id);
          const msActual = itemActual ? itemActual.ms_kg : 0;
          const maxMs = cmsBase * (mejorP.max_ms_pct / 100);
          msNecesaria = Math.min(msNecesaria, maxMs - msActual);
        }

        msNecesaria = Math.min(msNecesaria, msDisponibleConcentrado);

        // Aplicar límite peNDF
        const peNDF_alimento_dec = mejorP.peNDF / 100;
        if (peNDF_alimento_dec < peNDF_min_dec) {
          const numerador = peNDF_acum - peNDF_min_dec * ms_acum;
          const denominador = peNDF_min_dec - peNDF_alimento_dec;
          if (denominador > 0) {
            const msMaximaSinBajarPeNDF = Math.max(0, numerador / denominador);
            msNecesaria = Math.min(msNecesaria, msMaximaSinBajarPeNDF);
          }
        }

        if (msNecesaria >= 0.1) {
          agregar(mejorP, msNecesaria / (mejorP.ms / 100));
          msDisponibleConcentrado -= msNecesaria;
          hizoCambio = true;
          continue;
        }
      }
    }

    if (!hizoCambio) break;
  }

  // ========== 4. LLENAR MS RESTANTE CON ENERGÉTICO (si aún queda espacio) ==========
  // Si todavía hay déficit energético pero el peNDF está justo en el mínimo,
  // intentamos llenar el espacio restante con energético hasta el límite del peNDF mínimo
  const deficitENmFinal = Math.max(0, ENm_total - enm_acum);
  if (deficitENmFinal > 0.3 && msDisponibleConcentrado > 0.3 && energeticos.length > 0) {
    const mejorE = energeticos[0];
    const peNDF_alimento_dec = mejorE.peNDF / 100;
    if (peNDF_alimento_dec < peNDF_min_dec) {
      const numerador = peNDF_acum - peNDF_min_dec * ms_acum;
      const denominador = peNDF_min_dec - peNDF_alimento_dec;
      if (denominador > 0) {
        const msMaximaSinBajarPeNDF = Math.max(0, numerador / denominador);
        const msAñadir = Math.min(msDisponibleConcentrado, msMaximaSinBajarPeNDF, 0.5);
        if (msAñadir >= 0.2) {
          agregar(mejorE, msAñadir / (mejorE.ms / 100));
          msDisponibleConcentrado -= msAñadir;
        }
      }
    }
  }

  // ========== 5. SUBPRODUCTOS FIBROSOS SI FALTA peNDF ==========
  const peNDF_pct_check = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;
  if (peNDF_pct_check < peNDF_min_seguro && subproductosFibrosos.length > 0 && msDisponibleConcentrado > 0.1) {
    const fibra = subproductosFibrosos[0];
    const msFibra = Math.min(msDisponibleConcentrado, 0.5);
    agregar(fibra, msFibra / (fibra.ms / 100));
    msDisponibleConcentrado -= msFibra;
  }

  // ========== 6. COMPLETAR 4 INGREDIENTES ==========
  if (racion.length < 4 && !esPastorilAuto) {
    const extras = [...forrajes, ...energeticos, ...proteicos].filter(a => !racion.some(r => r.id === a.id));
    for (let i = 0; i < extras.length && racion.length < 4; i++) {
      if (msDisponibleConcentrado > 0.2) {
        agregar(extras[i], 0.2);
        msDisponibleConcentrado -= 0.2;
      }
    }
  }

  // ========== 7. INDICADORES ==========
  ms_acum = Math.round(ms_acum * 100) / 100;
  const peNDF_pct = ms_acum > 0 ? (peNDF_acum / ms_acum) * 100 : 0;
  const pctConcentrado = ((ms_acum - racion.filter(r => r.categoria === "forraje").reduce((s, r) => s + r.ms_kg, 0)) / ms_acum) * 100;

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

  // ========== 8. RELACIÓN Ca:P ==========
  let alertaCaP = null;
  if (p_acum > 0 && ms_acum > 0) {
    const ratioCaP = ca_acum / p_acum;
    if (ratioCaP < 1.5) {
      alertaCaP = `⚠️ Relación Ca:P baja (${ratioCaP.toFixed(2)}:1). Ideal 2:1 a 4:1. Considere agregar carbonato de calcio.`;
    } else if (ratioCaP > 7) {
      alertaCaP = `⚠️ Relación Ca:P alta (${ratioCaP.toFixed(2)}:1). Puede afectar absorción de fósforo.`;
    }
  }

  // ========== 9. MONENSINA AUTOMÁTICA ==========
  let aditivosRecomendados = [];
  if (esAutomatico && monensinaDisponible && ms_acum > 0) {
    const dosisMgPorKgMS = sistema.monensina_mg_kg || 22;
    const dosisMg = dosisMgPorKgMS * ms_acum;
    const dosisGramos = dosisMg / 1000;
    if (dosisGramos > 0.01) {
      aditivosRecomendados.push({
        id: "monensina",
        nombre: "Monensina (ionóforo)",
        dosisMg: +dosisMg.toFixed(0),
        dosisGramos: +dosisGramos.toFixed(3),
        funcion: "Reduce acidosis subclínica, mejora eficiencia energética (+3-5%), reduce metano.",
        dosisPorKgMS: dosisMgPorKgMS,
        advertencia: "Tóxica para caballos y perros. No usar en esos animales."
      });
    }
  }

  // ========== 10. GDP ESTIMADA ==========
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
  if (cumplimientoPB > 1.2) gdpEstimada *= 0.95;
  if (cumplimientoPB < 0.9) gdpEstimada *= 0.92;
  if (scoreAcidosis > 60) gdpEstimada *= 0.9;
  else if (scoreAcidosis > 40) gdpEstimada *= 0.95;

  gdpEstimada = Math.min(gdpEstimada, sistema.gdp_max * razaParam.gdp);
  gdpEstimada = Math.max(gdpEstimada, sistema.gdp_min * razaParam.gdp * 0.7);
  gdpEstimada = Math.round(gdpEstimada * 100) / 100;

  const costoDiario = racion.reduce((s, r) => s + r.precio_total, 0);
  const conversion = gdpEstimada > 0 ? (ms_acum / gdpEstimada).toFixed(1) : "N/A";

  // ========== 11. ALERTAS Y EXPLICACIONES COHERENTES ==========
  let alertas = [];
  let explicaciones = [];

  const deficitENmPorc = (1 - cumplimientoENm) * 100;
  const deficitPBPorc = (1 - cumplimientoPB) * 100;

  if (esAutomatico) {
    // Solo decir "balanceada" si realmente lo está
    const estaBalanceada = (cumplimientoENm >= 0.95 && cumplimientoPB >= 0.90 && cumplimientoPB <= 1.30);
    
    if (estaBalanceada) {
      explicaciones.push("✅ Ración balanceada según NRC. Cubre los requerimientos de energía y proteína.");
    } else {
      if (deficitENmPorc > 5) {
        alertas.push(`⚠️ Déficit energético (${deficitENmPorc.toFixed(0)}%). El animal podría no alcanzar el GDP proyectado.`);
      }
      if (deficitENmPorc > 15) {
        alertas.push(`🚨 Déficit energético severo (${deficitENmPorc.toFixed(0)}%). Revise la base de alimentos o el sistema.`);
      }
      if (deficitPBPorc > 5) {
        alertas.push(`⚠️ Déficit proteico (${deficitPBPorc.toFixed(0)}%).`);
      }
      if (cumplimientoPB > 1.30) {
        alertas.push(`⚠️ Exceso de proteína (${(cumplimientoPB * 100).toFixed(0)}% del requerimiento).`);
      }
      if (deficitENmPorc <= 5 && deficitPBPorc <= 5 && cumplimientoPB <= 1.30) {
        explicaciones.push("✅ Ración balanceada según NRC.");
      }
    }
    
    if (peNDF_pct > 30) {
      explicaciones.push("Se priorizaron forrajes de buena calidad y fibra efectiva.");
    }
    if (esPastorilAuto) {
      explicaciones.push("🌾 Sistema pastoril: suplemento formulado para complementar el pastoreo.");
    }
  } else {
    if (deficitENmPorc > 5) alertas.push(`⚠️ Déficit energético (${deficitENmPorc.toFixed(0)}%). Agregue más energéticos.`);
    if (deficitPBPorc > 5) alertas.push(`⚠️ Déficit proteico (${deficitPBPorc.toFixed(0)}%). Agregue torta de soya o girasol.`);
    if (cumplimientoPB > 1.3) alertas.push(`⚠️ Exceso de proteína (${(cumplimientoPB * 100).toFixed(0)}%). Reduzca fuentes proteicas.`);
    if (riesgoAcidosis === "alto" || riesgoAcidosis === "crítico") alertas.push(`🔴 Riesgo de acidosis: ${riesgoAcidosis.toUpperCase()}.`);
    if (esMisAlimentos && deficiencias.length > 0) explicaciones.push("Se formuló con los alimentos seleccionados. Revisa las alertas.");
  }

  if (alertaCaP) alertas.push(alertaCaP);

  if (alertasCalidad.length > 0) {
    explicaciones.push(`Hay ${alertasCalidad.length} alimento(s) en mal estado.`);
  }

  if (temperatura > 30) {
    explicaciones.push(`🌡️ Temperatura alta (${temperatura}°C): consumo de MS ajustado -${((1 - getAjusteTemperatura(temperatura)) * 100).toFixed(0)}%.`);
  }

  return {
    error: false,
    gdp_estimada: gdpEstimada,
    racion: racion,
    aditivosRecomendados: aditivosRecomendados,
    indicadores: {
      ms_total_kg: ms_acum,
      ms_pct_pv: +((ms_acum / pvN) * 100).toFixed(1),
      peNDF_pct: +peNDF_pct.toFixed(1),
      enm_aportada: +enm_acum.toFixed(2),
      enm_requerida: +ENm_total.toFixed(2),
      pb_aportada: +pb_acum.toFixed(0),
      pb_requerida: +PB_total.toFixed(0),
      ca_total_g: +(ca_acum * 1000).toFixed(0),
      p_total_g: +(p_acum * 1000).toFixed(0),
      ca_pct_ms: ms_acum > 0 ? +((ca_acum / ms_acum) * 100).toFixed(3) : 0,
      p_pct_ms: ms_acum > 0 ? +((p_acum / ms_acum) * 100).toFixed(3) : 0,
      ratio_ca_p: p_acum > 0 ? +(ca_acum / p_acum).toFixed(2) : null,
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
