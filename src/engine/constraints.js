// src/engine/constraints.js
// Construye las filas de restricciones del programa lineal que balancea la
// ración.
//
// IDEA CENTRAL: los límites NO se escriben acá. Se leen de engine/safety.js,
// que es el mismo archivo con el que después se valida la ración terminada.
// Así es imposible que el balanceador formule algo que el validador rechace,
// que es exactamente el error que tenía el motor viejo.
//
// Variables del problema: x_i = kg de MATERIA SECA por día del alimento i.
// Todas las filas se expresan como sum(coef_i * x_i) OP rhs, con las unidades
// del numerador del indicador (kg de FDN, kg de almidón, g de Ca, etc.).

import { REGLAS, SEV, FASE } from './safety.js';

// ---------------------------------------------------------------------------
// Clasificación de alimentos
// ---------------------------------------------------------------------------

/** Granos de cereal: entran en las reglas de grano/PV (V19, V20). */
export const IDS_GRANO = new Set([
  'maiz_amarillo', 'maiz_blanco', 'sorgo_grano', 'sorgo_rojo',
  'cebada_grano', 'trigo_grano', 'arroz_pulido', 'avena_grano',
]);

/** Fuentes de sal común, para la regla V87. */
export const IDS_SAL = new Set(['sal_comun']);

/** Proteína de origen mamífero: PROHIBIDA en rumiantes (21 CFR 589.2000). */
export const IDS_PROTEINA_MAMIFERO = new Set(['harina_carne', 'harina_sangre']);

export function esForraje(a) {
  return a.categoria === 'forraje';
}
export function esMineral(a) {
  return a.categoria === 'mineral';
}
export function esConcentrado(a) {
  return !esForraje(a);
}

/** Valor numérico o 0 si la fuente no lo publica. Nunca inventa un típico. */
function v(x) {
  return numOrNull(x) ?? 0;
}

/**
 * Número real o null. IMPRESCINDIBLE: en JavaScript Number(null) es 0 y
 * Number('') también, así que Number.isFinite(Number(null)) da true. Usar eso
 * directamente hacía que un alimento SIN techo de inclusión se leyera como
 * "techo = 0 %", es decir prohibido. Este helper distingue "no hay dato" de
 * "el dato es cero".
 */
export function numOrNull(x) {
  if (x === null || x === undefined || x === '') return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/**
 * MS del alimento. Los minerales comerciales muchas veces no declaran MS;
 * se asume 100 % porque se comercian secos, y queda documentado como supuesto.
 */
export function msFraccion(a) {
  const ms = numOrNull(a.ms);
  if (ms !== null && ms > 0) return ms / 100;
  return esMineral(a) ? 1.0 : 0.9;
}

// ---------------------------------------------------------------------------
// Coeficientes: cuánto aporta 1 kg de MS de cada alimento a cada indicador
// ---------------------------------------------------------------------------
// La clave es el mismo `campo` que usan las reglas de safety.js. El resultado
// está en la unidad del numerador; el rhs se arma con la misma unidad.

export const COEF = {
  // fracciones de la MS
  peNdfPct: (a) => (v(a.ndf) / 100) * v(a.pef),
  ndfPct: (a) => v(a.ndf) / 100,
  fndfPct: (a) => (esForraje(a) ? v(a.ndf) / 100 : 0),
  almidonPct: (a) => v(a.almidon) / 100,
  eePct: (a) => v(a.ee) / 100,
  sPct: (a) => v(a.s) / 100,
  mgPct: (a) => v(a.mg) / 100,
  kPct: (a) => v(a.k) / 100,
  caPct: (a) => v(a.ca) / 100,
  pPct: (a) => v(a.p) / 100,
  forrajePct: (a) => (esForraje(a) ? 1 : 0),
  concentradoPct: (a) => (esConcentrado(a) ? 1 : 0),
  ureaPct: (a) => (a.id === 'urea' ? 1 : 0),
  melazaPct: (a) => (a.id === 'melaza_caña' ? 1 : 0),
  salPct: (a) => (IDS_SAL.has(a.id) ? 1 : 0),
  proteinaMamiferoPct: (a) => (IDS_PROTEINA_MAMIFERO.has(a.id) ? 1 : 0),
  // por peso vivo, no por MS: el rhs se arma con el PV
  granoPctPv: (a) => (IDS_GRANO.has(a.id) ? 1 : 0),
};

/** Campos que el programa lineal sabe expresar linealmente. */
const CAMPOS_LP = new Set(Object.keys(COEF));

/** Campos cuyo rhs se calcula sobre el PESO VIVO y no sobre la MS. */
const CAMPOS_POR_PV = new Set(['granoPctPv']);

// ---------------------------------------------------------------------------
// Lectura de los límites vigentes para una fase
// ---------------------------------------------------------------------------

function aplicaFase(r, fase) {
  if (r.fase === FASE.TODAS) return true;
  // Algunas reglas declaran varias fases en un arreglo (p. ej. V48 vale para
  // RECEP y CREC). Si esto no se contempla, el techo se pierde en silencio y
  // el balanceador formula dietas que después el validador rechaza.
  if (Array.isArray(r.fase)) return r.fase.includes(fase);
  return r.fase === fase;
}

/**
 * Consolida las reglas de safety.js en límites por campo para una fase.
 * Cuando varias reglas tocan el mismo campo se toma la MÁS EXIGENTE
 * (el mayor de los mínimos y el menor de los máximos), separando las que
 * bloquean de las que sólo advierten.
 *
 * @param {string} fase FASE.RECEP | FASE.CREC | FASE.TERM
 * @param {object} contexto valores de la dieta para los máximos dinámicos
 * @returns {object} { [campo]: { minBlock, maxBlock, minWarn, maxWarn, reglas } }
 */
export function limitesVigentes(fase, contexto = {}) {
  const out = {};
  for (const r of REGLAS) {
    if (!aplicaFase(r, fase)) continue;
    if (!CAMPOS_LP.has(r.campo)) continue; // p. ej. días de adaptación, picado

    const max = r.max === 'dinamico' && r.maxDinamico ? r.maxDinamico(contexto) : r.max;
    const o = (out[r.campo] ||= {
      minBlock: null, maxBlock: null, minWarn: null, maxWarn: null, reglas: [],
    });
    o.reglas.push(r.id);

    const kMin = r.sev === SEV.BLOCK ? 'minBlock' : 'minWarn';
    const kMax = r.sev === SEV.BLOCK ? 'maxBlock' : 'maxWarn';
    // numOrNull y no Number.isFinite(Number(x)): una regla con max: null
    // (o sea, "sin techo") se leía como techo = 0 y volvía infactible
    // todo el problema.
    const rMin = numOrNull(r.min);
    const rMax = numOrNull(max);
    if (rMin !== null) {
      o[kMin] = o[kMin] === null ? rMin : Math.max(o[kMin], rMin);
    }
    if (rMax !== null) {
      o[kMax] = o[kMax] === null ? rMax : Math.min(o[kMax], rMax);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Armado de las filas del LP
// ---------------------------------------------------------------------------

/**
 * @param {object} p
 * @param {Array}  p.alimentos      alimentos disponibles, en orden de variable
 * @param {number} p.dmi            MS total objetivo, kg/día (fija la escala)
 * @param {number} p.pv             peso vivo, kg
 * @param {string} p.fase           FASE.RECEP | CREC | TERM
 * @param {number} p.emRequerida    Mcal de EM/día que debe aportar la dieta
 * @param {number} p.pbRequeridaKg  kg de PB/día (derivada del requerimiento de PM)
 * @param {number} p.pdrRequeridaKg kg de proteína degradable/día (= PBmic)
 * @param {number} p.caRequeridaG   g de Ca/día
 * @param {number} p.pRequeridaG    g de P/día
 * @param {object} [p.contexto]     valores de dieta para los máximos dinámicos
 * @param {boolean} [p.exigirWarn]  si true, los límites WARN también se imponen
 *                                  (como filas elásticas)
 * @returns {{rows:Array, meta:object}}
 */
export function construirRestricciones({
  alimentos, dmi, pv, fase,
  emRequerida, pbRequeridaKg, pdrRequeridaKg, caRequeridaG, pRequeridaG,
  contexto = {}, exigirWarn = true,
  // Criterios de practicidad (NO son normas publicadas, ver bloque 9)
  margenPb = 1.25, margenMinerales = 1.6, topeIngredientePct = 60,
}) {
  const n = alimentos.length;
  const rows = [];
  const ceros = () => new Array(n).fill(0);

  // --- 1. La MS total es la que predijo el modelo de consumo -----------------
  // Es una igualdad: si el animal come 9,4 kg de MS, la ración pesa 9,4 kg de
  // MS. Sin esta fila el solver "resuelve" el problema dando de menos.
  rows.push({ coef: ceros().map(() => 1), op: '=', rhs: dmi, name: 'MS total (kg/día)' });

  // --- 2. Energía -----------------------------------------------------------
  // Se restringe la EM y no la ENm/ENg: la EM es aditiva entre alimentos,
  // mientras que la ENm y la ENg NO lo son (dependen de la densidad final de
  // la mezcla por las cúbicas de NRC). Mezclar EN de a un alimento fue uno de
  // los errores del motor viejo.
  rows.push({
    coef: alimentos.map((a) => v(a.em)),
    op: '>=', rhs: emRequerida, elastic: true, penalty: 1000,
    name: 'EM (Mcal/día)',
  });

  // --- 3. Proteína ----------------------------------------------------------
  rows.push({
    coef: alimentos.map((a) => v(a.pb) / 100),
    op: '>=', rhs: pbRequeridaKg, elastic: true, penalty: 800,
    name: 'PB (kg/día)',
  });
  // Proteína degradable en rumen: sin PDR suficiente los microbios no crecen y
  // la PB de sobrepaso no alcanza. PDR = PB x (1 - RUP).
  rows.push({
    coef: alimentos.map((a) => {
      // Sin RUP publicado se asume 30 %, el valor medio de los forrajes
      // tropicales. Es un supuesto declarado, no un dato.
      const rup = numOrNull(a.rup_pct_pb) ?? 30;
      return (v(a.pb) / 100) * (1 - rup / 100);
    }),
    op: '>=', rhs: pdrRequeridaKg, elastic: true, penalty: 400,
    name: 'PDR (kg/día)',
  });

  // --- 4. Minerales ---------------------------------------------------------
  rows.push({
    coef: alimentos.map((a) => (v(a.ca) / 100) * 1000),
    op: '>=', rhs: caRequeridaG, elastic: true, penalty: 300,
    name: 'Ca (g/día)',
  });
  rows.push({
    coef: alimentos.map((a) => (v(a.p) / 100) * 1000),
    op: '>=', rhs: pRequeridaG, elastic: true, penalty: 300,
    name: 'P (g/día)',
  });

  // --- 5. Límites de seguridad, leídos de safety.js -------------------------
  const lim = limitesVigentes(fase, contexto);
  const impuestos = [];

  for (const [campo, l] of Object.entries(lim)) {
    const coef = alimentos.map(COEF[campo]);
    // ¿Algún alimento aporta a este campo? Si ninguno aporta, un mínimo sería
    // infactible por construcción y no tiene sentido imponerlo.
    const aporta = coef.some((c) => c !== 0);
    const base = CAMPOS_POR_PV.has(campo) ? pv : dmi;

    const push = (op, pct, sev) => {
      if (pct === null || pct === undefined) return;
      if (op === '>=' && !aporta) return;
      // Margen del 1 % contra el límite duro. Sin esto el solver se para
      // EXACTAMENTE sobre el límite (grasa 6,000 %) y el validador, que usa
      // aritmética de punto flotante, lo lee como violado. El margen se aplica
      // hacia el lado seguro: los máximos se bajan y los mínimos se suben.
      const margen = sev === SEV.BLOCK ? 0.01 : 0;
      const pctAjustado = op === '<=' ? pct * (1 - margen) : pct * (1 + margen);
      rows.push({
        coef: [...coef], op, rhs: (pctAjustado / 100) * base,
        elastic: sev === SEV.WARN, penalty: sev === SEV.WARN ? 20 : undefined,
        name: `${campo} ${op} ${pct}% (${l.reglas.join('/')})`,
        campo, limitePct: pct, severidad: sev,
      });
      impuestos.push({ campo, op, pct, sev, reglas: l.reglas });
    };

    push('>=', l.minBlock, SEV.BLOCK);
    push('<=', l.maxBlock, SEV.BLOCK);
    if (exigirWarn) {
      push('>=', l.minWarn, SEV.WARN);
      push('<=', l.maxWarn, SEV.WARN);
    }
  }

  // --- 6. Relación Ca:P ----------------------------------------------------
  // La relación es un cociente, no un porcentaje. Se linealiza en dos filas:
  //   Ca - rMin x P >= 0   y   Ca - rMax x P <= 0
  const R_MIN = lim.ratioCaP?.minBlock ?? 1.2;
  const R_MAX = lim.ratioCaP?.maxBlock ?? 6.0;
  // Las filas van en GRAMOS, no en kilos. Es importante: las penalizaciones
  // del solver se comparan entre sí, y una desviación de 5 g escrita como
  // 0,005 kg parecía insignificante al lado de la de energía. El resultado era
  // que el motor sacrificaba la relación Ca:P para ganar unas pocas calorías,
  // o sea elegía engordar antes que cuidar el riñón. Prioridad al revés.
  rows.push({
    coef: alimentos.map((a) => (v(a.ca) - R_MIN * v(a.p)) * 10),
    op: '>=', rhs: 0, elastic: true, penalty: 8000,
    name: `Ca:P >= ${R_MIN}`,
  });
  rows.push({
    coef: alimentos.map((a) => (v(a.ca) - R_MAX * v(a.p)) * 10),
    op: '<=', rhs: 0, elastic: true, penalty: 8000,
    name: `Ca:P <= ${R_MAX}`,
  });

  // --- 7. Techo de inclusión de cada alimento ------------------------------
  // Viene de la propia base de alimentos (max_inclusion_pct), que se armó con
  // los límites de research/seguridad.md.
  alimentos.forEach((a, i) => {
    const tope = numOrNull(a.max_inclusion_pct);
    if (tope === null) return;
    const coef = ceros();
    coef[i] = 1;
    rows.push({
      coef, op: '<=', rhs: (tope / 100) * dmi,
      name: `${a.id} <= ${tope}% MS`,
      campo: 'max_inclusion', alimentoId: a.id, limitePct: tope,
      severidad: SEV.BLOCK,
    });
    if (tope === 0) impuestos.push({ campo: 'prohibido', alimentoId: a.id });
  });

  // --- 8. Urea: dos techos más, además del 1 % de la MS -------------------
  // V39: máximo 25 g de urea por 100 kg de PV y por día.
  const iUrea = alimentos.findIndex((a) => a.id === 'urea');
  if (iUrea >= 0) {
    const coef = ceros();
    coef[iUrea] = 1000; // kg de MS -> g
    rows.push({
      coef, op: '<=', rhs: 25 * (pv / 100),
      name: 'urea <= 25 g/100 kg PV (V39)', campo: 'ureaGPor100kgPv', severidad: SEV.BLOCK,
    });
    // V38: la urea no puede aportar más del 33 % de la PB total.
    rows.push({
      coef: alimentos.map((a, i) => (i === iUrea ? v(a.pb) / 100 * (1 - 0.33) : -v(a.pb) / 100 * 0.33)),
      op: '<=', rhs: 0,
      name: 'urea <= 33% de la PB (V38)', campo: 'ureaPctDePb', severidad: SEV.BLOCK,
    });
  }

  // --- 9. Criterios de PRACTICIDAD -----------------------------------------
  // ATENCIÓN: esto NO sale de una norma publicada. Son decisiones de
  // ingeniería para que la ración sea usable y no un óptimo matemático raro.
  // Sin estas filas el programa lineal hace cosas correctas en el papel y
  // absurdas en el corral: dietas con 40 % de proteína porque una torta estaba
  // barata, o el 90 % de la materia seca en un solo ingrediente.

  // 9a. Techo de proteína: dar mucha más PB de la necesaria no engorda más,
  // cuesta plata y el exceso de nitrógeno se excreta.
  rows.push({
    coef: alimentos.map((a) => v(a.pb) / 100),
    op: '<=', rhs: pbRequeridaKg * margenPb, elastic: true, penalty: 60,
    name: `PB <= ${margenPb}x la requerida (practicidad)`,
  });

  // 9b. Techo de Ca y P: cubrir el requerimiento, no inundar la dieta. Los
  // techos de seguridad (V80/V81) siguen estando aparte y son los que manda.
  rows.push({
    coef: alimentos.map((a) => (v(a.ca) / 100) * 1000),
    op: '<=', rhs: caRequeridaG * margenMinerales, elastic: true, penalty: 40,
    name: `Ca <= ${margenMinerales}x el requerido (practicidad)`,
  });
  rows.push({
    coef: alimentos.map((a) => (v(a.p) / 100) * 1000),
    op: '<=', rhs: pRequeridaG * margenMinerales, elastic: true, penalty: 40,
    name: `P <= ${margenMinerales}x el requerido (practicidad)`,
  });

  // 9c. Ningún ingrediente puede ser más del 60 % de la materia seca si no
  // tiene ya un techo propio. Una ración con un solo alimento dominante es
  // frágil: si ese alimento falta o cambia de calidad, se cae todo el plan.
  alimentos.forEach((a, i) => {
    if (numOrNull(a.max_inclusion_pct) !== null) return; // ya tiene techo real
    const coef = ceros();
    coef[i] = 1;
    rows.push({
      coef, op: '<=', rhs: (topeIngredientePct / 100) * dmi,
      elastic: true, penalty: 30,
      name: `${a.id} <= ${topeIngredientePct}% MS (practicidad)`,
    });
  });

  return { rows, meta: { limites: lim, impuestos, dmi, pv, fase } };
}

/**
 * Indicadores de la dieta ya resuelta, en el mismo vocabulario que las reglas
 * de safety.js, para poder validarla con evaluarSeguridad().
 *
 * @param {Array} alimentos
 * @param {Array<number>} x kg de MS/día de cada alimento
 * @param {number} pv peso vivo, kg
 */
export function indicadoresDieta(alimentos, x, pv) {
  const ms = x.reduce((s, k) => s + k, 0);
  if (ms <= 0) return { msTotal: 0 };
  const pct = (campo) => (alimentos.reduce((s, a, i) => s + COEF[campo](a) * x[i], 0) / ms) * 100;

  const caPct = pct('caPct');
  const pPct = pct('pPct');

  // Cuánta MS viene de concentrados que NO declaran almidón: el índice de
  // acidosis está ciego en esa parte y hay que decirlo.
  const msSinAlmidon = alimentos.reduce(
    (s, a, i) => s + (esConcentrado(a) && numOrNull(a.almidon) === null ? x[i] : 0), 0,
  );

  return {
    msTotal: ms,
    msPctPv: (ms / pv) * 100,
    peNdfPct: pct('peNdfPct'),
    ndfPct: pct('ndfPct'),
    fndfPct: pct('fndfPct'),
    almidonPct: pct('almidonPct'),
    eePct: pct('eePct'),
    sPct: pct('sPct'),
    mgPct: pct('mgPct'),
    kPct: pct('kPct'),
    caPct,
    pPct,
    ratioCaP: pPct > 0 ? caPct / pPct : null,
    forrajePct: pct('forrajePct'),
    concentradoPct: pct('concentradoPct'),
    ureaPct: pct('ureaPct'),
    melazaPct: pct('melazaPct'),
    salPct: pct('salPct'),
    proteinaMamiferoPct: pct('proteinaMamiferoPct'),
    granoPctPv: (alimentos.reduce((s, a, i) => s + COEF.granoPctPv(a) * x[i], 0) / pv) * 100,
    ureaGPor100kgPv:
      (alimentos.reduce((s, a, i) => s + (a.id === 'urea' ? x[i] : 0), 0) * 1000) / (pv / 100),
    almidonCiegoPct: (msSinAlmidon / ms) * 100,
  };
}

export default { construirRestricciones, indicadoresDieta, limitesVigentes, COEF };
