// src/engine/energy.js
// ============================================================================
// GANABOV — MOTOR NUTRICIONAL v2
// Energía del ALIMENTO. Este bloque no sabe nada del animal.
//
// Cadena oficial:  TDN -> DE -> ME -> NEm y NEg de la dieta
//   DE  = TDN%/100 * 4.409                              [NRC96]
//   ME  = 0.9455*DE - 0.3032  (BR-CORTE, dietas tropicales)  [BRC23 cap. 8]
//   NEm = 1.37 ME - 0.138 ME^2 + 0.0105 ME^3 - 1.12     [NRC96, cúbicas Garrett]
//   NEg = 1.42 ME - 0.174 ME^2 + 0.0122 ME^3 - 1.65     [NRC96]
//
// CLAVE PARA ENTENDER EL MOTOR: un mismo kilo de materia seca tiene DOS
// densidades energéticas distintas según el destino. La energía que se usa
// para mantenimiento rinde a NEm; la que se usa para ganancia rinde a NEg, y
// NEg < NEm siempre. Por eso NO se pueden sumar los requerimientos de
// mantenimiento y ganancia y dividirlos por un único valor de NEm: eso
// sobreestima la ganancia entre 20 y 40 % en dietas de terminación.
// La partición correcta está en predict.js.
// ============================================================================

import {
  MCAL_POR_KG_TDN, ME_DESDE_DE, CUBICA_NEM, CUBICA_NEG,
  IONOFORO, MONENSINA_CONSUMO, CALIDAD,
} from './standards.js';

/** DE (Mcal/kg MS) desde TDN (% MS). [NRC96] */
export function deDesdeTdn(tdnPct) {
  return (tdnPct / 100) * MCAL_POR_KG_TDN;
}

/** ME (Mcal/kg MS) desde DE. `via` = 'brcorte' (trópico) o 'nrc'. */
export function meDesdeDe(de, via = 'brcorte') {
  const c = ME_DESDE_DE[via] || ME_DESDE_DE.brcorte;
  return Math.max(c.factor * de + c.intercepto, 0);
}

/** NEm de la dieta (Mcal/kg MS) desde ME. Cúbica de Garrett. [NRC96] */
export function nemDieta(me) {
  const c = CUBICA_NEM;
  const v = c.c1 * me + c.c2 * me * me + c.c3 * me * me * me + c.c0;
  return Math.max(v, 0);
}

/** NEg de la dieta (Mcal/kg MS) desde ME. Cúbica de Garrett. [NRC96] */
export function negDieta(me) {
  const c = CUBICA_NEG;
  const v = c.c1 * me + c.c2 * me * me + c.c3 * me * me * me + c.c0;
  return Math.max(v, 0);
}

/**
 * TDN por la sumativa de Weiss (NRC 2001), % MS.
 * TDN1X = tdCP + tdNFC + 2.25*tdFA + tdNDF - 7
 *   tdNDF = 0.75 * [(NDF - NDICP) - Lignina] * [1 - (Lignina/(NDF - NDICP))^0.667]
 *   tdNFC = 0.98 * [100 - ((NDF - NDICP) + PB + EE + Cenizas)] * PAF
 *   tdCP  = PB * exp(-1.2 * (PIDA/PB))   para concentrados
 *         = PB * [1 - 0.4*(PIDA/PB)]     para forrajes
 *   tdFA  = EE - 1  (si EE > 1, si no 0)
 * [NRC01] https://www.foragelab.com/media/nrc2001.pdf
 *
 * Solo se usa cuando el alimento NO trae TDN tabulado. Si el alimento tiene
 * TDN publicado en NASEM o BR-CORTE, ese valor manda: la sumativa puede dar
 * valores > 100 en alimentos ricos en grasa.
 */
export function tdnWeiss({ pb, ndf, ndicp = 0, lignina, ee, cenizas, pida = null, esForraje = true, paf = 1.0 }) {
  const ndfn = Math.max(ndf - ndicp, 0.1);
  const lig = Math.max(lignina, 0);

  // Fibra verdaderamente digestible
  const razon = Math.min(lig / ndfn, 0.999);
  const tdNDF = 0.75 * Math.max(ndfn - lig, 0) * (1 - Math.pow(razon, 0.667));

  // Carbohidratos no fibrosos
  const nfc = Math.max(100 - (ndfn + pb + ee + cenizas), 0);
  const tdNFC = 0.98 * nfc * paf;

  // Proteína verdaderamente digestible
  let tdCP;
  const pidaRel = pida !== null && pb > 0 ? pida / pb : 0;
  if (esForraje) {
    tdCP = pb * (1 - 0.4 * pidaRel);
  } else {
    tdCP = pb * Math.exp(-1.2 * pidaRel);
  }

  // Ácidos grasos
  const tdFA = ee > 1 ? ee - 1 : 0;

  const tdn = tdCP + tdNFC + 2.25 * tdFA + tdNDF - 7;
  return Math.min(Math.max(tdn, 5), 100);
}

/**
 * Descuento del TDN por nivel de consumo. A consumos altos el alimento pasa
 * más rápido por el tracto y se digiere menos. [NRC01]
 * Se aplica solo en dietas de alto consumo (feedlot en terminación).
 * @param {number} tdn1x  TDN a nivel de mantenimiento, % MS
 * @param {number} multiploMantenimiento  cuántas veces el mantenimiento (típico 3–4x)
 */
export function descuentoPorConsumo(tdn1x, multiploMantenimiento = 1) {
  if (multiploMantenimiento <= 1) return tdn1x;
  // Descuento de 4 puntos porcentuales por cada múltiplo del mantenimiento
  // por encima de 1x, con piso al 92 % del valor 1x. [NRC01]
  const descuento = 0.04 * (multiploMantenimiento - 1);
  return tdn1x * Math.max(1 - descuento, 0.92);
}

/**
 * Perfil energético completo de UN alimento.
 * Devuelve tdn, de, me, nem, neg por kg de materia seca.
 *
 * @param {object} alimento   ficha del alimento (ver data/alimentosBase.js)
 * @param {object} opts
 * @param {string} opts.calidad   estado de conservación declarado por el usuario
 * @param {string} opts.viaMe     'brcorte' | 'nrc'
 */
export function perfilEnergetico(alimento, opts = {}) {
  const { calidad = 'Óptimo', viaMe = 'brcorte' } = opts;
  const fc = CALIDAD[calidad] || CALIDAD['Óptimo'];

  // 1. TDN: se prefiere el valor tabulado publicado
  let tdn = Number(alimento.tdn);
  let fuenteTdn = 'tabulado';
  if (!Number.isFinite(tdn) || tdn <= 0) {
    if (Number.isFinite(alimento.ndf) && Number.isFinite(alimento.pb)) {
      tdn = tdnWeiss({
        pb: alimento.pb,
        ndf: alimento.ndf,
        ndicp: alimento.ndicp ?? 0,
        lignina: alimento.lignina ?? estimarLignina(alimento),
        ee: alimento.ee ?? 2.5,
        cenizas: alimento.cenizas ?? 8,
        pida: alimento.pida ?? null,
        esForraje: alimento.categoria === 'forraje',
      });
      fuenteTdn = 'sumativa Weiss';
    } else {
      // Sin datos suficientes: no se inventa. Se marca el alimento como
      // inutilizable para el balanceo y se avisa.
      return { valido: false, motivo: 'Sin TDN ni composición fibrosa suficiente para calcular energía' };
    }
  }

  // 2. Castigo por calidad de conservación sobre la digestibilidad
  const tdnAjustado = tdn * fc.dig;

  // 3. Cadena energética
  const de = deDesdeTdn(tdnAjustado);
  const me = meDesdeDe(de, viaMe);
  const nem = nemDieta(me);
  const neg = negDieta(me);

  return {
    valido: true,
    tdn: tdnAjustado,
    tdnBase: tdn,
    fuenteTdn,
    de, me, nem, neg,
    factorCalidad: fc,
  };
}

/**
 * Si no hay lignina medida, se estima desde el ADF. Relación gruesa de
 * referencia en forrajes tropicales: lignina ≈ 0.18 * ADF. Es una estimación
 * declarada, no un dato de norma: por eso queda registrada como tal en la
 * salida (`fuenteTdn: 'sumativa Weiss'`) para que el usuario sepa que ese
 * alimento tiene energía estimada y no tabulada.
 */
function estimarLignina(alimento) {
  const adf = Number(alimento.adf);
  if (Number.isFinite(adf) && adf > 0) return 0.18 * adf;
  return alimento.categoria === 'forraje' ? 6 : 3;
}

/**
 * Aplica el efecto del ionóforo a la densidad energética de la dieta: +12 %.
 * OJO: se aplica UNA sola vez, y el -4 % sobre el consumo se aplica aparte en
 * intake.js. Aplicar 1.12 dos veces (a NEm y otra vez a la ganancia final) es
 * el error nº 6 de la lista de errores frecuentes. [NRC96 Tabla 10-4]
 */
export function aplicarIonoforo(densidad, tieneIonoforo) {
  if (!tieneIonoforo) return densidad;
  return {
    ...densidad,
    nem: densidad.nem * IONOFORO.energia,
    neg: densidad.neg * IONOFORO.energia,
    me: densidad.me * IONOFORO.energia,
    conIonoforo: true,
  };
}

/** Factor de descuento del consumo por monensina, según dosis (mg/kg MS). [NRC00] */
export function factorConsumoMonensina(mgKg) {
  if (!mgKg || mgKg <= 0) return 1.0;
  if (mgKg >= MONENSINA_CONSUMO[1].mgKg) return MONENSINA_CONSUMO[1].factor;
  if (mgKg >= MONENSINA_CONSUMO[0].mgKg) return MONENSINA_CONSUMO[0].factor;
  // Interpolación lineal entre "sin ionóforo" (1.0) y 22 mg/kg (0.94)
  const t = mgKg / MONENSINA_CONSUMO[0].mgKg;
  return 1.0 - t * (1.0 - MONENSINA_CONSUMO[0].factor);
}

/**
 * Densidad energética de una MEZCLA.
 *
 * Se promedia el ME de forma ponderada por materia seca (el ME es aditivo) y
 * SOLO DESPUÉS se derivan NEm y NEg de la dieta con las cúbicas. Este orden es
 * el correcto: las cúbicas son no lineales, así que promediar NEm/NEg de cada
 * ingrediente por separado da un resultado distinto y sesgado.
 *
 * @param {Array<{kgMs:number, energia:object}>} items
 * @param {boolean} tieneIonoforo
 */
export function densidadMezcla(items, tieneIonoforo = false) {
  let msTotal = 0, meTotal = 0, tdnTotal = 0;
  for (const it of items) {
    if (!it.energia?.valido || !(it.kgMs > 0)) continue;
    msTotal += it.kgMs;
    meTotal += it.kgMs * it.energia.me;
    tdnTotal += it.kgMs * it.energia.tdn;
  }
  if (msTotal <= 0) return { valido: false, motivo: 'Mezcla sin materia seca' };

  const me = meTotal / msTotal;
  const base = {
    valido: true,
    msTotal,
    me,
    tdn: tdnTotal / msTotal,
    nem: nemDieta(me),
    neg: negDieta(me),
  };
  return aplicarIonoforo(base, tieneIonoforo);
}

/**
 * Encuentra la densidad de ME de dieta necesaria para que un consumo dado
 * cubra mantenimiento y una ganancia objetivo.
 *
 * Resuelve  DMI = NEm_req / NEm(ME) + NEg_req / NEg(ME)  para ME.
 * No se puede despejar analíticamente (las cúbicas), así que se hace bisección.
 * El resultado alimenta la restricción de energía del balanceo lineal, que así
 * queda lineal en ME (que sí es aditivo entre ingredientes).
 *
 * @returns {{me:number, nem:number, neg:number, alcanzable:boolean}}
 */
export function meRequeridaParaObjetivo({ dmi, nemReq, negReq }) {
  const consumoNecesario = (me) => {
    const nm = nemDieta(me);
    const ng = negDieta(me);
    if (nm <= 0) return Infinity;
    const msMant = nemReq / nm;
    const msGan = ng > 0 ? negReq / ng : Infinity;
    return msMant + msGan;
  };

  let lo = 1.0;   // dieta muy pobre
  let hi = 3.6;   // techo práctico de una dieta de grano con grasa

  // Si ni con la dieta más densa alcanza, el objetivo no es alcanzable con ese consumo
  if (consumoNecesario(hi) > dmi) {
    const me = hi;
    return { me, nem: nemDieta(me), neg: negDieta(me), alcanzable: false };
  }
  // Si una dieta pobre ya alcanza, se devuelve el mínimo (más barato y más seguro)
  if (consumoNecesario(lo) <= dmi) {
    const me = lo;
    return { me, nem: nemDieta(me), neg: negDieta(me), alcanzable: true };
  }

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (consumoNecesario(mid) > dmi) lo = mid; else hi = mid;
  }
  const me = hi;
  return { me, nem: nemDieta(me), neg: negDieta(me), alcanzable: true };
}

/**
 * Corrección de los TDN estimados por la ecuación sumativa del NRC 2001.
 *
 * Por qué existe esta función: varios alimentos de la base traen un TDN
 * "estimado" (marcado con ᵉ en la fuente) que sale de una digestibilidad de la
 * materia orgánica y queda inflado. Ejemplos que aparecieron en las pruebas:
 * hoja de Gliricidia con TDN 79 (imposible con 49,7 % de FDN), torta de maní
 * con 100 y soya integral tostada con 108. Con esos números el balanceador
 * armaba raciones que sobre el papel daban 1,7 kg de ganancia y en el corral
 * no las iban a dar.
 *
 * Cuando el alimento tiene composición suficiente (FDN, lignina, EE, cenizas,
 * PB) se recalcula el TDN con la ecuación sumativa del NRC 2001, que parte de
 * la composición química y no de una digestibilidad prestada. Si la diferencia
 * con el valor estimado supera el umbral, manda el valor sumativo y queda
 * registrado en `tdn_origen`.
 *
 * Los TDN publicados (tdn_estimado = false) NO se tocan.
 *
 * Fuente: [NRC 2001, ecuación sumativa de Weiss](https://www.foragelab.com/media/nrc2001.pdf)
 */
export function corregirTdnEstimado(alimento, { umbral = 8, techoSinGrasa = 90 } = {}) {
  const n = (x) => {
    if (x === null || x === undefined || x === '') return null;
    const v = Number(x);
    return Number.isFinite(v) ? v : null;
  };

  const tdn = n(alimento.tdn);
  if (tdn === null || !alimento.tdn_estimado) return alimento;

  const pb = n(alimento.pb);
  const ndf = n(alimento.ndf);
  const ee = n(alimento.ee);
  const cenizas = n(alimento.cenizas);
  let lignina = n(alimento.lignina);
  const adf = n(alimento.adf);

  // Si no hay lignina medida se estima a partir de la FDA (relación habitual
  // en forrajes tropicales). Es una aproximación, pero la ecuación sumativa es
  // poco sensible a ella comparada con el error que estamos corrigiendo.
  if (lignina === null && adf !== null) lignina = adf * 0.20;

  const completo = [pb, ndf, ee, cenizas, lignina].every((v) => v !== null);

  if (completo) {
    const tdnSum = tdnWeiss({
      pb, ndf, lignina, ee, cenizas,
      esForraje: alimento.categoria === 'forraje',
    });
    if (Math.abs(tdnSum - tdn) > umbral) {
      return {
        ...alimento,
        tdn: Number(tdnSum.toFixed(1)),
        tdn_original: tdn,
        tdn_origen: 'sumativa NRC 2001 (el valor estimado de la fuente no cierra con la composición)',
        tdn_url: 'https://www.foragelab.com/media/nrc2001.pdf',
      };
    }
    return { ...alimento, tdn_origen: 'estimado, verificado contra la sumativa NRC 2001' };
  }

  // Sin composición completa no se puede recalcular. Al menos se corta lo
  // físicamente imposible: solo las grasas y aceites superan 90 de TDN.
  if (tdn > techoSinGrasa && (ee === null || ee < 12)) {
    return {
      ...alimento,
      tdn: techoSinGrasa,
      tdn_original: tdn,
      tdn_origen: `estimado inverosímil (${tdn}); recortado a ${techoSinGrasa} porque sin grasa agregada un alimento no supera ese TDN`,
    };
  }
  return alimento;
}
