// src/engine/animal.js
// ============================================================================
// GANABOV — MOTOR NUTRICIONAL v2
// Biología del animal: conversiones de peso, requerimientos de energía,
// proteína y minerales. Todo con BR-CORTE 2023 como base (Bos indicus) y los
// ajustes climáticos del NRC 1996 que BR-CORTE no publica.
//
// IMPORTANTE — unidades. Este es el error nº 2 más frecuente del rubro:
//   NRC/NASEM expresan el mantenimiento sobre SBW^0.75
//   BR-CORTE lo expresa sobre EBW^0.75
// Aplicar 0.075 sobre SBW^0.75 subestima el mantenimiento ~11 %. Nunca mezclar.
// Acá TODA la vía BR-CORTE trabaja sobre EBW.
// ============================================================================

import {
  SREBW, MEBW, EBW_COEF, EBW_PASTOREO, SBW_COEF, EBG_COEF,
  NEM_COEF_BRCORTE, NEG_BRCORTE, EBG_INV_BRCORTE,
  KM_BETA2, MEM_BRCORTE,
  ACLIMATACION_COEF, ACLIMATACION_T_REF, JADEO,
  MPM_BRCORTE, NPG_BRCORTE, K_MP,
  MINERALES_BRCORTE, MINERALES_CREC, GRUPO,
  fichaRaza, normalizarSexo,
} from './standards.js';

// ---------------------------------------------------------------------------
// 1. CONVERSIONES DE PESO
// ---------------------------------------------------------------------------

/**
 * Peso desbastado (SBW) a partir del peso vivo lleno (BW).
 * SBW = 0.8915 * BW^1.0151 para cebú y cruzas de corte. [BRC23 cap. 1, Eq. 1.3]
 * Reproduce mejor el llenado ruminal de dietas tropicales que el 0.96 fijo del NRC.
 */
export function bwASbw(bw, grupo) {
  const c = SBW_COEF[grupo] || SBW_COEF[GRUPO.ZEBU];
  return c.a * Math.pow(bw, c.b);
}

/**
 * Peso vacío corporal (EBW) a partir del SBW, por grupo genético y sexo.
 * [BRC23 cap. 1, Eq. 1.5 a 1.11]
 */
export function sbwAEbw(sbw, grupo, sexo, entorno = 'confinamiento') {
  if (entorno === 'pastoreo') {
    return EBW_PASTOREO.a * Math.pow(sbw, EBW_PASTOREO.b);
  }
  const tabla = EBW_COEF[grupo] || EBW_COEF[GRUPO.ZEBU];
  const c = tabla[sexo] || tabla.novillo;
  return c.a * Math.pow(sbw, c.b);
}

/** EBG = 0.9630 * ADG^1.0151 [BRC23 cap. 1, Eq. 1.12] */
export function adgAEbg(adg) {
  if (adg <= 0) return adg * EBG_COEF.a; // pérdida de peso: relación lineal
  return EBG_COEF.a * Math.pow(adg, EBG_COEF.b);
}

/** Inversa: ADG desde EBG. */
export function ebgAAdg(ebg) {
  if (ebg <= 0) return ebg / EBG_COEF.a;
  return Math.pow(ebg / EBG_COEF.a, 1 / EBG_COEF.b);
}

/**
 * Peso vacío equivalente: EQEBW = (EBW / MEBW) * 517. [BRC23 cap. 8, Eq. 8.18]
 * Esto compara al animal contra SU propia madurez. Sin esto, el modelo
 * "engorda" prematuramente a un Nelore comparándolo con una referencia taurina.
 */
export function eqEbw(ebw, grupo, sexo) {
  const tabla = MEBW[grupo] || MEBW[GRUPO.ZEBU];
  const mebw = tabla[sexo] || tabla.novillo;
  return (ebw / mebw) * SREBW;
}

/**
 * Construye el perfil completo de pesos del animal, una sola vez.
 * @param {object} p
 * @param {number} p.pv        peso vivo lleno, kg
 * @param {string} p.razaId    id de raza de la app
 * @param {string} p.sexo      'toro' | 'novillo' | 'vaquilla'
 * @param {string} p.entorno   'confinamiento' | 'pastoreo'
 */
export function perfilAnimal({ pv, razaId = 'otro', sexo = 'novillo', entorno = 'confinamiento' }) {
  const raza = fichaRaza(razaId);
  const sx = normalizarSexo(sexo);
  const grupo = raza.grupo;

  const bw = Number(pv);
  const sbw = bwASbw(bw, grupo);
  const ebw = sbwAEbw(sbw, grupo, sx, entorno);
  const eqebw = eqEbw(ebw, grupo, sx);
  const tablaMebw = MEBW[grupo] || MEBW[GRUPO.ZEBU];
  const mebw = tablaMebw[sx] || tablaMebw.novillo;

  return {
    bw, sbw, ebw, eqebw, mebw,
    grupo, sexo: sx, raza,
    entorno,
    // pesos metabólicos precalculados
    ebw075: Math.pow(ebw, 0.75),
    sbw075: Math.pow(sbw, 0.75),
    eqebw075: Math.pow(eqebw, 0.75),
    // fracción de madurez alcanzada: útil para avisar que el animal ya está
    // en punto de terminación y que seguir engordando solo agrega grasa
    madurezPct: (ebw / mebw) * 100,
  };
}

// ---------------------------------------------------------------------------
// 2. MANTENIMIENTO
// ---------------------------------------------------------------------------

/**
 * Requerimiento de energía neta de mantenimiento, Mcal/d.
 * Base: NEm = 0.075 * EBW^0.75 [BRC23 cap. 8] — sin efecto de sexo ni genotipo.
 * Ajustes del NRC 1996 que BR-CORTE no publica:
 *   - aclimatación térmica: a2 = 0.0007 * (20 - Tp) por SBW^0.75
 *     En Santa Cruz (Tp 25–28 °C) esto REDUCE el mantenimiento 5–7 %.
 *   - jadeo por calor agudo: x1.07 (rápido y superficial) o x1.18 (boca abierta)
 *   - actividad en pastoreo
 *
 * @param {object} animal        salida de perfilAnimal()
 * @param {object} opts
 * @param {number} opts.tempPrevia   temperatura media del mes anterior, °C
 * @param {number} opts.tempActual   temperatura actual, °C
 * @param {string} opts.jadeo        'ninguno' | 'leve' | 'severo' | 'auto'
 * @param {number} opts.factorActividad  1.0 corral, hasta 1.2 pastoreo extensivo
 */
export function nemRequerido(animal, opts = {}) {
  const {
    tempPrevia = 26,
    tempActual = 28,
    jadeo = 'auto',
    factorActividad = null,
  } = opts;

  // Base BR-CORTE sobre EBW^0.75
  const base = NEM_COEF_BRCORTE * animal.ebw075;

  // Aclimatación térmica del NRC, expresada sobre SBW^0.75.
  // Con Tp > 20 °C el término es negativo: menos mantenimiento.
  const ajusteAclimatacion = ACLIMATACION_COEF * (ACLIMATACION_T_REF - tempPrevia) * animal.sbw075;

  // Estrés calórico agudo
  let nivelJadeo = jadeo;
  if (jadeo === 'auto') {
    if (tempActual >= 35) nivelJadeo = 'severo';
    else if (tempActual >= 30) nivelJadeo = 'leve';
    else nivelJadeo = 'ninguno';
  }
  const factorJadeo = JADEO[nivelJadeo] ?? 1.0;

  // Actividad: en pastoreo el animal camina y cosecha
  const actividad = factorActividad !== null
    ? factorActividad
    : (animal.entorno === 'pastoreo' ? 1.10 : 1.00);

  const nem = (base + ajusteAclimatacion) * factorJadeo * actividad;

  return {
    nem: Math.max(nem, base * 0.7), // nunca por debajo de un piso fisiológico
    base,
    ajusteAclimatacion,
    factorJadeo,
    nivelJadeo,
    actividad,
  };
}

/**
 * Eficiencias km (ME->NEm) y kg (ME->NEg) de BR-CORTE.
 * km = [0.513 + 0.173*kg + beta2*EBG] * theta;  kg = 0.327 / (0.539 + REp);
 * REp = 1.140 * (RE/EBG)^-1.137.  theta = 1 confinamiento, 0.92 pastoreo.
 * [BRC23 cap. 8]
 * Depende de RE, así que se resuelve por iteración junto al resto del modelo.
 */
export function eficiencias(animal, ebg, re) {
  const theta = animal.entorno === 'pastoreo' ? 0.92 : 1.0;
  const beta2 = KM_BETA2[animal.grupo] ?? KM_BETA2[GRUPO.ZEBU];

  let kg = 0.40; // semilla razonable
  if (ebg > 0.01 && re > 0.01) {
    const rePorKg = re / ebg;               // Mcal por kg de ganancia vacía
    const rep = 1.140 * Math.pow(rePorKg, -1.137);
    kg = 0.327 / (0.539 + rep);
  }
  const km = (0.513 + 0.173 * kg + beta2 * Math.max(ebg, 0)) * theta;

  return {
    km: Math.min(Math.max(km, 0.45), 0.80),
    kg: Math.min(Math.max(kg, 0.20), 0.60),
  };
}

/** MEm de referencia por grupo, kcal/EBW^0.75/d -> Mcal/d. [BRC23 cap. 8] */
export function memReferencia(animal) {
  const kcal = animal.entorno === 'pastoreo'
    ? MEM_BRCORTE.pastoreo
    : (MEM_BRCORTE[animal.grupo] ?? MEM_BRCORTE[GRUPO.ZEBU]);
  return (kcal / 1000) * animal.ebw075;
}

// ---------------------------------------------------------------------------
// 3. ENERGÍA DE GANANCIA
// ---------------------------------------------------------------------------

/**
 * Energía retenida / NEg requerida para una ganancia dada, Mcal/d.
 * NEg = 0.061 * EQEBW^0.75 * EBG^1.035   (confinamiento)
 * NEg = 0.052 * EQEBW^0.75 * EBG^1.062   (pastoreo)
 * [BRC23 cap. 8, Eq. 8.20 y 8.21]
 */
export function negRequerido(animal, adg) {
  if (adg <= 0) return 0;
  const ebg = adgAEbg(adg);
  const c = animal.entorno === 'pastoreo' ? NEG_BRCORTE.pastoreo : NEG_BRCORTE.confinamiento;
  return c.a * animal.eqebw075 * Math.pow(ebg, c.b);
}

/**
 * Inversa: ganancia diaria alcanzable con la NEg disponible.
 * EBG = 14.914 * NEg^0.9662 * EQEBW^-0.7246 [BRC23 cap. 8, Eq. 8.22]
 * Nota: la ecuación 8.22 está calibrada para confinamiento. En pastoreo se
 * invierte numéricamente la 8.21 para no forzar coeficientes ajenos.
 */
export function adgDesdeNeg(animal, negDisponible) {
  if (negDisponible <= 0) return 0;

  if (animal.entorno === 'confinamiento') {
    const ebg = EBG_INV_BRCORTE.a
      * Math.pow(negDisponible, EBG_INV_BRCORTE.expNEg)
      * Math.pow(animal.eqebw, EBG_INV_BRCORTE.expEQEBW);
    return ebgAAdg(ebg);
  }

  // Pastoreo: invertir NEg = 0.052 * EQEBW^0.75 * EBG^1.062
  const c = NEG_BRCORTE.pastoreo;
  const ebg = Math.pow(negDisponible / (c.a * animal.eqebw075), 1 / c.b);
  return ebgAAdg(ebg);
}

/**
 * Pérdida de peso cuando la energía no alcanza para el mantenimiento.
 * El déficit se valora a NEm (no a NEg): la movilización de reservas rinde
 * energía de mantenimiento. Se usa el equivalente calórico del tejido
 * movilizado, ~4.92 Mcal por kg de peso vivo perdido. [NRC96]
 */
export function adgNegativa(deficitMcal) {
  const MCAL_POR_KG_PERDIDO = 4.92;
  return -(deficitMcal / MCAL_POR_KG_PERDIDO);
}

// ---------------------------------------------------------------------------
// 4. PROTEÍNA
// ---------------------------------------------------------------------------

/**
 * Proteína metabolizable de mantenimiento, g/d.
 * MPm = 3.96 g/EBW^0.75 en confinamiento; 4.31 en pastoreo. [BRC23 cap. 9]
 */
export function mpMantenimiento(animal) {
  const coef = animal.entorno === 'pastoreo'
    ? MPM_BRCORTE.pastoreo
    : MPM_BRCORTE.confinamiento;
  return coef * animal.ebw075;
}

/**
 * Proteína neta de ganancia, g/d. NPg = a*EBG - b*RE, por grupo y sexo.
 * [BRC23 cap. 9]
 */
export function npGanancia(animal, adg, re) {
  if (adg <= 0) return 0;
  const ebg = adgAEbg(adg);
  const tabla = NPG_BRCORTE[animal.grupo] || NPG_BRCORTE[GRUPO.ZEBU];
  const c = tabla[animal.sexo] || tabla.novillo;
  return Math.max(c.a * ebg - c.b * re, 0);
}

/**
 * Eficiencia de uso de la MP para ganancia.
 * k(%) = 84.665 - 0.1179*EQEBW; piso 47.4 % si SBW >= 340 kg. [BRC23 cap. 9]
 */
export function kMp(animal) {
  if (animal.sbw >= K_MP.sbwUmbral) return K_MP.piso;
  const k = (K_MP.i - K_MP.s * animal.eqebw) / 100;
  return Math.min(Math.max(k, K_MP.piso), 0.85);
}

/**
 * Requerimiento total de proteína metabolizable, g/d.
 * MP_req = MPm + NPg / k
 */
export function mpRequerida(animal, adg, re) {
  const mpm = mpMantenimiento(animal);
  const npg = npGanancia(animal, adg, re);
  const k = kMp(animal);
  const mpg = npg / k;
  return { total: mpm + mpg, mpm, mpg, npg, k };
}

/**
 * Inversa: ganancia permitida por la proteína metabolizable disponible.
 * Se resuelve numéricamente porque NPg depende de RE y RE depende de ADG.
 * Bisección sobre ADG en [0, 3] kg/d.
 */
export function adgDesdeMp(animal, mpDisponible) {
  const mpm = mpMantenimiento(animal);
  if (mpDisponible <= mpm) return 0;

  const k = kMp(animal);
  let lo = 0, hi = 3.0;

  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const re = negRequerido(animal, mid);
    const npg = npGanancia(animal, mid, re);
    const req = mpm + npg / k;
    if (req < mpDisponible) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------
// 5. MINERALES
// ---------------------------------------------------------------------------

/**
 * Requerimientos dietarios de macrominerales, g/d.
 * Vía BR-CORTE: requerimiento neto (mantenimiento + crecimiento) dividido por
 * la retención verdadera. [BRC16 cap. 9, Tabla 9.12 y ecuaciones de crecimiento]
 *
 * Validación: el propio libro trae un ejemplo trabajado — toro Nelore de 400 kg
 * con ADG 1.0 kg/d requiere Ca 21.67, P 14.66, Mg 7.65, Na 9.31 g/d.
 * Ese caso está en los tests del motor.
 */
export function mineralesRequeridos(animal, adg) {
  const ebg = Math.max(adgAEbg(adg), 0);
  const esZebu = animal.grupo === GRUPO.ZEBU;
  const tablaCrec = esZebu ? MINERALES_CREC[GRUPO.ZEBU] : MINERALES_CREC.cruzados;

  const out = {};
  for (const m of ['ca', 'p', 'mg', 'na', 'k']) {
    // mantenimiento: mg/kg PV/d -> g/d  (se usa BW, peso vivo lleno)
    const mant = (MINERALES_BRCORTE[m].mant * animal.bw) / 1000;
    const c = tablaCrec[m];
    const crec = ebg * (c.a * Math.pow(animal.ebw, c.b));
    const neto = mant + crec;
    out[m] = {
      neto,
      dietario: neto / MINERALES_BRCORTE[m].ret,
      mantenimiento: mant,
      crecimiento: crec,
    };
  }

  // Azufre: coeficientes comunes a todos los genotipos
  const mantS = (MINERALES_BRCORTE.s.mant * animal.bw) / 1000;
  const crecS = ebg * (MINERALES_CREC.s.a * Math.pow(animal.ebw, MINERALES_CREC.s.b));
  out.s = {
    neto: mantS + crecS,
    dietario: (mantS + crecS) / MINERALES_BRCORTE.s.ret,
    mantenimiento: mantS,
    crecimiento: crecS,
  };

  return out;
}
