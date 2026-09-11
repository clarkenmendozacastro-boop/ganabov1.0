// tests/solver.test.mjs
// Verificación del solver contra problemas de programación lineal con
// solución óptima conocida y publicada. Si estos fallan, nada de lo que
// esté encima del solver es confiable.

import { solveLP, solveElasticLP } from "../src/engine/solver.js";

let pass = 0, fail = 0;
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

function check(nombre, cond, detalle = "") {
  if (cond) { pass++; console.log(`  ok   ${nombre}`); }
  else { fail++; console.log(`  FAIL ${nombre} ${detalle}`); }
}

console.log("\n=== 1. Mínimo trivial con una restricción >= ===");
{
  // min x1 + x2  s.a. x1 + x2 >= 1   ->  óptimo 1
  const r = solveLP({ cost: [1, 1], rows: [{ coef: [1, 1], op: ">=", rhs: 1 }] });
  check("status optimal", r.status === "optimal", r.status);
  check("objetivo = 1", near(r.objective, 1), `obj=${r.objective}`);
}

console.log("\n=== 2. LP clásico de libro (máx 3x+5y) ===");
{
  // maximizar 3x + 5y  s.a. x<=4, 2y<=12, 3x+2y<=18
  // Óptimo conocido: x=2, y=6, Z=36.  Minimizamos el negativo.
  const r = solveLP({
    cost: [-3, -5],
    rows: [
      { coef: [1, 0], op: "<=", rhs: 4 },
      { coef: [0, 2], op: "<=", rhs: 12 },
      { coef: [3, 2], op: "<=", rhs: 18 },
    ],
  });
  check("status optimal", r.status === "optimal", r.status);
  check("objetivo = -36", near(r.objective, -36, 1e-6), `obj=${r.objective}`);
  check("x = 2", near(r.x[0], 2, 1e-6), `x=${r.x[0]}`);
  check("y = 6", near(r.x[1], 6, 1e-6), `y=${r.x[1]}`);
}

console.log("\n=== 3. Mezcla con igualdad y rangos (tipo ración) ===");
{
  // Dos ingredientes, 10 kg totales, proteína entre 15% y 18%
  // A: 10% PB, costo 1 ; B: 40% PB, costo 4
  // Al mínimo costo la PB se pega al piso de 15%:
  //   0.10a + 0.40b = 1.5  y  a + b = 10  ->  b = 5/3, a = 25/3
  //   costo = 25/3 + 4*5/3 = 45/3 = 15
  const r = solveLP({
    cost: [1, 4],
    rows: [
      { coef: [1, 1], op: "=", rhs: 10, name: "MS total" },
      { coef: [0.10, 0.40], op: ">=", rhs: 1.5, name: "PB min" },
      { coef: [0.10, 0.40], op: "<=", rhs: 1.8, name: "PB max" },
    ],
  });
  check("status optimal", r.status === "optimal", r.status);
  check("costo = 15", near(r.objective, 15, 1e-6), `obj=${r.objective}`);
  check("a = 8.333", near(r.x[0], 25 / 3, 1e-6), `a=${r.x[0]}`);
  check("b = 1.667", near(r.x[1], 5 / 3, 1e-6), `b=${r.x[1]}`);
  const pb = (0.10 * r.x[0] + 0.40 * r.x[1]) / 10 * 100;
  check("PB resultante 15%", near(pb, 15, 1e-6), `pb=${pb}`);
}

console.log("\n=== 4. Ejemplo de Beale (prueba anti-ciclado) ===");
{
  // LP degenerado que hace ciclar al simplex con la regla de Dantzig pura.
  // Óptimo conocido: -0.05
  const r = solveLP({
    cost: [-0.75, 150, -0.02, 6],
    rows: [
      { coef: [0.25, -60, -0.04, 9], op: "<=", rhs: 0 },
      { coef: [0.5, -90, -0.02, 3], op: "<=", rhs: 0 },
      { coef: [0, 0, 1, 0], op: "<=", rhs: 1 },
    ],
  });
  check("no cicla (termina)", r.status === "optimal", r.status);
  check("objetivo = -0.05", near(r.objective, -0.05, 1e-7), `obj=${r.objective}`);
}

console.log("\n=== 5. Detección de infactibilidad ===");
{
  const r = solveLP({
    cost: [1],
    rows: [
      { coef: [1], op: ">=", rhs: 5 },
      { coef: [1], op: "<=", rhs: 2 },
    ],
  });
  check("detecta infactible", r.status === "infeasible", r.status);
}

console.log("\n=== 6. Detección de no acotado ===");
{
  const r = solveLP({ cost: [-1], rows: [{ coef: [0], op: "<=", rhs: 1 }] });
  check("detecta no acotado", r.status === "unbounded", r.status);
}

console.log("\n=== 7. Degeneración con rhs = 0 e igualdades redundantes ===");
{
  const r = solveLP({
    cost: [1, 1, 1],
    rows: [
      { coef: [1, 1, 0], op: "=", rhs: 4 },
      { coef: [1, 1, 0], op: "=", rhs: 4 },   // fila duplicada (redundante)
      { coef: [0, 1, 1], op: ">=", rhs: 2 },
      { coef: [1, 0, 0], op: ">=", rhs: 0 },  // rhs cero
    ],
  });
  check("resuelve con filas redundantes", r.status === "optimal", r.status);
  check("objetivo = 4", near(r.objective, 4, 1e-6), `obj=${r.objective}`);
}

console.log("\n=== 8. LP elástico: reporta el faltante en vez de fallar ===");
{
  // Se exige 40% de PB pero el mejor ingrediente tiene 20%: imposible.
  // El LP puro sería infactible; el elástico debe resolver y reportar
  // exactamente cuánta PB falta.
  const r = solveElasticLP({
    cost: [1, 2],
    rows: [
      { coef: [1, 1], op: "=", rhs: 10, name: "MS total" },
      { coef: [0.10, 0.20], op: ">=", rhs: 4.0, elastic: true, penalty: 1e6, name: "PB min" },
    ],
  });
  check("resuelve pese a ser imposible", r.status === "optimal", r.status);
  check("reporta 1 violación", r.violations.length === 1, JSON.stringify(r.violations));
  if (r.violations.length === 1) {
    // Máxima PB posible = 10 kg del ingrediente 2 al 20% = 2.0 -> faltan 2.0
    check("faltante = 2.0", near(r.violations[0].amount, 2.0, 1e-5),
      `falta=${r.violations[0].amount}`);
    check("nombra la restricción", r.violations[0].name === "PB min", r.violations[0].name);
  }
}

console.log("\n=== 9. LP elástico factible: sin violaciones y costo real limpio ===");
{
  const r = solveElasticLP({
    cost: [1, 4],
    rows: [
      { coef: [1, 1], op: "=", rhs: 10, name: "MS total" },
      { coef: [0.10, 0.40], op: ">=", rhs: 1.5, elastic: true, penalty: 1e6, name: "PB min" },
    ],
  });
  check("sin violaciones", r.violations.length === 0, JSON.stringify(r.violations));
  check("costo real = 15", near(r.costoReal, 15, 1e-6), `costo=${r.costoReal}`);
}

console.log("\n=== 10. Problema mediano (25 variables, 12 restricciones) ===");
{
  // Verifica que no explote por tamaño ni por escalas mezcladas.
  const n = 25;
  const cost = Array.from({ length: n }, (_, i) => 1 + (i % 7) * 0.5);
  const rows = [{ coef: new Array(n).fill(1), op: "=", rhs: 12, name: "MS" }];
  for (let k = 0; k < 11; k++) {
    rows.push({
      coef: Array.from({ length: n }, (_, i) => ((i * 7 + k * 13) % 19) / 19),
      op: k % 2 === 0 ? ">=" : "<=",
      rhs: k % 2 === 0 ? 2 + k * 0.1 : 9 + k,
      name: `r${k}`,
    });
  }
  const t0 = Date.now();
  const r = solveLP({ cost, rows });
  const ms = Date.now() - t0;
  check("resuelve", r.status === "optimal", r.status);
  check("suma MS = 12", near(r.x.reduce((a, b) => a + b, 0), 12, 1e-6));
  check("rápido (<300 ms)", ms < 300, `${ms} ms`);
  console.log(`       (${r.iterations} iteraciones, ${ms} ms)`);
}

console.log(`\n${"=".repeat(52)}`);
console.log(`RESULTADO: ${pass} pasaron, ${fail} fallaron`);
console.log("=".repeat(52));
process.exit(fail === 0 ? 0 : 1);
