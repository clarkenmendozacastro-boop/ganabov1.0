// src/engine/solver.js
// ============================================================================
// SOLVER DE PROGRAMACIÓN LINEAL (SIMPLEX DE DOS FASES)
// ----------------------------------------------------------------------------
// Implementación propia, sin dependencias externas.
//
// ¿Por qué un LP y no un bucle "voy agregando alimentos"?
//   Formular una ración es, matemáticamente, un problema de optimización con
//   restricciones: minimizar el costo sujeto a que TODOS los nutrientes queden
//   dentro de rangos simultáneamente. Un algoritmo codicioso (greedy) que
//   agrega un ingrediente a la vez para tapar el hueco más grande NO puede
//   garantizar que se cumplan varias restricciones a la vez, y queda atrapado
//   en soluciones que violan la fibra o el almidón. El simplex sí garantiza
//   el óptimo global cuando el problema es factible.
//
// Resuelve:   minimizar   c'x
//             sujeto a    A x  {<=, >=, =}  b
//                         x >= 0
//
// Referencia del método: Dantzig, two-phase simplex. Regla de Bland como
// respaldo anti-ciclado.
// ============================================================================

const EPS = 1e-9;
const MAX_ITER_FACTOR = 60;

/**
 * @typedef {Object} LPRow
 * @property {number[]} coef  Coeficientes de la fila (largo = nº de variables)
 * @property {"<="|">="|"="} op
 * @property {number} rhs
 * @property {string} [name]
 */

/**
 * Resuelve un programa lineal por el método simplex de dos fases.
 *
 * @param {Object} p
 * @param {number[]} p.cost        Vector de costos c (largo n)
 * @param {LPRow[]} p.rows         Restricciones
 * @param {number} [p.maxIter]
 * @returns {{status:"optimal"|"infeasible"|"unbounded"|"iteration_limit",
 *            x:number[], objective:number, iterations:number,
 *            duals:number[]|null}}
 */
export function solveLP({ cost, rows, maxIter = null }) {
  const n = cost.length;
  const m = rows.length;

  if (m === 0) {
    // Sin restricciones: el mínimo de un c'x con x>=0 es 0 (o -inf si algún c<0)
    if (cost.some((c) => c < -EPS)) {
      return { status: "unbounded", x: new Array(n).fill(0), objective: 0, iterations: 0, duals: null };
    }
    return { status: "optimal", x: new Array(n).fill(0), objective: 0, iterations: 0, duals: null };
  }

  // ---------------------------------------------------------------------------
  // 1. Normalizar: rhs >= 0 (invirtiendo la fila y el operador si hace falta)
  // ---------------------------------------------------------------------------
  const norm = rows.map((r) => {
    let coef = r.coef.slice();
    let op = r.op;
    let rhs = r.rhs;
    if (rhs < -EPS) {
      coef = coef.map((v) => -v);
      rhs = -rhs;
      if (op === "<=") op = ">=";
      else if (op === ">=") op = "<=";
    }
    // Saneamiento: cualquier NaN/Infinity se trata como 0 para no envenenar
    // el tableau completo.
    coef = coef.map((v) => (Number.isFinite(v) ? v : 0));
    if (!Number.isFinite(rhs)) rhs = 0;
    return { coef, op, rhs, name: r.name || "" };
  });

  // ---------------------------------------------------------------------------
  // 2. Construir el tableau con holguras (slack), excesos (surplus)
  //    y artificiales para obtener una base inicial identidad.
  //    Orden de columnas: [ x (n) | extras (slack/surplus) | artificiales ]
  // ---------------------------------------------------------------------------
  const extraCols = [];   // {row, sign}
  const artRows = [];     // filas que necesitan variable artificial

  norm.forEach((r, i) => {
    if (r.op === "<=") {
      extraCols.push({ row: i, sign: +1 });      // + slack
    } else if (r.op === ">=") {
      extraCols.push({ row: i, sign: -1 });      // - surplus
      artRows.push(i);
    } else {
      artRows.push(i);                            // igualdad: solo artificial
    }
  });

  const nExtra = extraCols.length;
  const nArt = artRows.length;
  const total = n + nExtra + nArt;

  // T es (m+1) x (total+1): últimas fila = objetivo, última columna = rhs
  const T = [];
  for (let i = 0; i < m; i++) T.push(new Float64Array(total + 1));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) T[i][j] = norm[i].coef[j];
    T[i][total] = norm[i].rhs;
  }
  extraCols.forEach((e, k) => {
    T[e.row][n + k] = e.sign;
  });

  // Base inicial: la artificial de cada fila que la tenga, si no su slack.
  const basis = new Array(m).fill(-1);
  artRows.forEach((rowIdx, k) => {
    const col = n + nExtra + k;
    T[rowIdx][col] = 1;
    basis[rowIdx] = col;
  });
  extraCols.forEach((e, k) => {
    if (e.sign === +1 && basis[e.row] === -1) basis[e.row] = n + k;
  });
  // Toda fila debe tener una base. (Por construcción siempre la tiene.)
  for (let i = 0; i < m; i++) {
    if (basis[i] === -1) {
      return {
        status: "infeasible", x: new Array(n).fill(0),
        objective: 0, iterations: 0, duals: null,
      };
    }
  }

  const iterLimit = maxIter || MAX_ITER_FACTOR * (m + total);
  let iterations = 0;

  // ---------------------------------------------------------------------------
  // 3. FASE 1 — minimizar la suma de variables artificiales.
  //    Si el mínimo es > 0, el problema original es infactible.
  // ---------------------------------------------------------------------------
  if (nArt > 0) {
    const c1 = new Float64Array(total);
    for (let k = 0; k < nArt; k++) c1[n + nExtra + k] = 1;

    const r1 = simplex(T, basis, c1, iterLimit - iterations);
    iterations += r1.iterations;
    if (r1.status === "iteration_limit") {
      return { status: "iteration_limit", x: extractX(T, basis, n, m), objective: 0, iterations, duals: null };
    }

    const phase1Obj = objectiveValue(T, basis, c1, m, total);
    if (phase1Obj > 1e-6) {
      return { status: "infeasible", x: new Array(n).fill(0), objective: 0, iterations, duals: null };
    }

    // Expulsar artificiales que quedaron en la base con valor 0 (degeneración)
    for (let i = 0; i < m; i++) {
      if (basis[i] >= n + nExtra) {
        let pivotCol = -1;
        for (let j = 0; j < n + nExtra; j++) {
          if (Math.abs(T[i][j]) > 1e-8) { pivotCol = j; break; }
        }
        if (pivotCol >= 0) {
          pivot(T, basis, i, pivotCol, m, total);
        }
        // Si no hay columna pivote, la fila es redundante: se deja como está.
      }
    }

    // Prohibir el reingreso de las artificiales en la fase 2
    for (let i = 0; i < m; i++) {
      for (let k = 0; k < nArt; k++) {
        const col = n + nExtra + k;
        if (basis[i] !== col) T[i][col] = 0;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. FASE 2 — minimizar el costo real.
  // ---------------------------------------------------------------------------
  const c2 = new Float64Array(total);
  for (let j = 0; j < n; j++) c2[j] = Number.isFinite(cost[j]) ? cost[j] : 0;
  // Las artificiales llevan costo prohibitivo por seguridad numérica
  for (let k = 0; k < nArt; k++) c2[n + nExtra + k] = 1e12;

  const r2 = simplex(T, basis, c2, iterLimit - iterations);
  iterations += r2.iterations;

  const x = extractX(T, basis, n, m);
  const obj = dot(c2.subarray(0, n), x);

  if (r2.status === "unbounded") {
    return { status: "unbounded", x, objective: obj, iterations, duals: null };
  }
  if (r2.status === "iteration_limit") {
    return { status: "iteration_limit", x, objective: obj, iterations, duals: null };
  }

  return {
    status: "optimal",
    x,
    objective: obj,
    iterations,
    duals: computeDuals(T, basis, c2, m, total, n, nExtra, norm),
  };
}

// ============================================================================
// Núcleo del simplex sobre un tableau ya en forma canónica.
// Minimiza c'x. Modifica T y basis in situ.
// ============================================================================
function simplex(T, basis, c, iterLimit) {
  const m = T.length;
  const total = T[0].length - 1;
  let iterations = 0;
  let blandMode = false;
  const stallThreshold = Math.max(50, 4 * (m + total));

  while (iterations < iterLimit) {
    iterations++;
    if (iterations > stallThreshold) blandMode = true;

    // --- Costos reducidos:  d_j = c_j - c_B' B^-1 A_j
    // Con el tableau mantenido en forma canónica respecto a la base,
    // B^-1 A_j ya está almacenado en T, así que:
    const d = new Float64Array(total);
    for (let j = 0; j < total; j++) {
      let s = c[j];
      for (let i = 0; i < m; i++) {
        const cb = c[basis[i]];
        if (cb !== 0) s -= cb * T[i][j];
      }
      d[j] = s;
    }

    // --- Elegir columna entrante
    let enter = -1;
    if (blandMode) {
      // Regla de Bland: el primer índice con costo reducido negativo.
      // Garantiza terminación (evita ciclado) a costa de más iteraciones.
      for (let j = 0; j < total; j++) {
        if (d[j] < -1e-9) { enter = j; break; }
      }
    } else {
      // Dantzig: el costo reducido más negativo.
      let best = -1e-9;
      for (let j = 0; j < total; j++) {
        if (d[j] < best) { best = d[j]; enter = j; }
      }
    }

    if (enter === -1) return { status: "optimal", iterations };

    // --- Prueba de la razón mínima (Bland: desempate por menor índice de base)
    let leave = -1;
    let bestRatio = Infinity;
    for (let i = 0; i < m; i++) {
      const a = T[i][enter];
      if (a > 1e-11) {
        const ratio = T[i][total] / a;
        if (ratio < bestRatio - 1e-12) {
          bestRatio = ratio;
          leave = i;
        } else if (Math.abs(ratio - bestRatio) <= 1e-12 && leave >= 0) {
          if (basis[i] < basis[leave]) leave = i;
        }
      }
    }

    if (leave === -1) return { status: "unbounded", iterations };

    pivot(T, basis, leave, enter, m, total);
  }

  return { status: "iteration_limit", iterations };
}

// ============================================================================
// Operación de pivote: normaliza la fila y elimina la columna del resto.
// ============================================================================
function pivot(T, basis, row, col, m, total) {
  const piv = T[row][col];
  const inv = 1 / piv;
  const Trow = T[row];
  for (let j = 0; j <= total; j++) Trow[j] *= inv;
  Trow[col] = 1; // exactitud explícita

  for (let i = 0; i < m; i++) {
    if (i === row) continue;
    const f = T[i][col];
    if (f === 0) continue;
    const Ti = T[i];
    for (let j = 0; j <= total; j++) Ti[j] -= f * Trow[j];
    Ti[col] = 0;
  }
  basis[row] = col;
}

function extractX(T, basis, n, m) {
  const total = T[0].length - 1;
  const x = new Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    if (basis[i] < n) {
      const v = T[i][total];
      x[basis[i]] = v > 0 ? v : 0;
    }
  }
  return x;
}

function objectiveValue(T, basis, c, m, total) {
  let s = 0;
  for (let i = 0; i < m; i++) s += c[basis[i]] * T[i][total];
  return s;
}

/**
 * Precios sombra (variables duales) por restricción.
 * Interpretación práctica: cuánto sube el costo diario de la ración por cada
 * unidad extra exigida de ese nutriente. Sirve para decirle al productor
 * "la restricción que te está encareciendo la dieta es la proteína".
 */
function computeDuals(T, basis, c, m, total, n, nExtra, norm) {
  try {
    const d = new Float64Array(total);
    for (let j = 0; j < total; j++) {
      let s = c[j];
      for (let i = 0; i < m; i++) {
        const cb = c[basis[i]];
        if (cb !== 0) s -= cb * T[i][j];
      }
      d[j] = s;
    }
    // El dual de la fila i se lee en la columna extra asociada a esa fila.
    const duals = new Array(m).fill(0);
    let k = 0;
    for (let i = 0; i < m; i++) {
      if (norm[i].op === "<=") {
        duals[i] = -d[n + k]; k++;
      } else if (norm[i].op === ">=") {
        duals[i] = d[n + k]; k++;
      } else {
        duals[i] = 0; // igualdades: requeriría B^-1 explícito
      }
    }
    return duals;
  } catch {
    return null;
  }
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < b.length; i++) s += (a[i] || 0) * (b[i] || 0);
  return s;
}

// ============================================================================
// RESOLUCIÓN ELÁSTICA
// ----------------------------------------------------------------------------
// Un LP puro devuelve "infactible" y nada más. Eso es inútil para el usuario:
// no le dice QUÉ le falta. Aquí agregamos, a cada restricción marcada como
// elástica, una variable de violación con un costo de penalización muy alto.
// El LP entonces SIEMPRE tiene solución, y la magnitud de cada variable de
// violación nos dice exactamente qué nutriente no se pudo cubrir y por cuánto.
//
// Las restricciones de SEGURIDAD (techos de almidón, azufre, urea, pisos de
// fibra) se pasan con elastic:false o con penalización mucho mayor, de modo
// que el solver prefiera dejar un nutriente corto antes que enfermar al animal.
// ============================================================================

/**
 * @param {Object} p
 * @param {number[]} p.cost
 * @param {Array<LPRow & {elastic?:boolean, penalty?:number}>} p.rows
 * @returns {{status:string, x:number[], objective:number, costoReal:number,
 *            violations:Array<{name:string,amount:number,op:string,rhs:number}>,
 *            iterations:number}}
 */
export function solveElasticLP({ cost, rows }) {
  const n = cost.length;
  const elasticIdx = [];
  rows.forEach((r, i) => {
    if (r.elastic) elasticIdx.push(i);
  });

  const nv = elasticIdx.length;
  const extCost = cost.slice();
  for (let k = 0; k < nv; k++) {
    const r = rows[elasticIdx[k]];
    extCost.push(r.penalty != null ? r.penalty : 1e6);
  }

  const extRows = rows.map((r, i) => {
    const coef = r.coef.slice();
    for (let k = 0; k < nv; k++) {
      const target = elasticIdx[k];
      if (target !== i) { coef.push(0); continue; }
      // ">=" queda corto -> la violación SUMA para alcanzar el rhs
      // "<=" se pasa      -> la violación RESTA para no pasarse
      coef.push(r.op === ">=" ? 1 : r.op === "<=" ? -1 : 1);
    }
    return { coef, op: r.op, rhs: r.rhs, name: r.name };
  });

  const res = solveLP({ cost: extCost, rows: extRows });

  const x = res.x.slice(0, n);
  const violations = [];
  for (let k = 0; k < nv; k++) {
    const amt = res.x[n + k] || 0;
    if (amt > 1e-6) {
      const r = rows[elasticIdx[k]];
      violations.push({
        name: r.name || `restriccion_${elasticIdx[k]}`,
        amount: amt,
        op: r.op,
        rhs: r.rhs,
      });
    }
  }

  const costoReal = x.reduce((s, v, i) => s + v * (cost[i] || 0), 0);

  return {
    status: res.status,
    x,
    objective: res.objective,
    costoReal,
    violations,
    iterations: res.iterations,
  };
}
