/**
 * Pruebas del motor de nutrición contra valores PUBLICADOS.
 *
 * La idea de este archivo no es que el motor "no tire error": es que los
 * números que devuelve coincidan con los de las tablas y los ejemplos
 * resueltos del NRC y de BR-CORTE. Si mañana alguien toca una ecuación y el
 * resultado se despega de la fuente, estas pruebas fallan.
 *
 * Correr con:  node tests/motor.test.mjs
 *
 * Fuentes usadas como referencia:
 *  - NRC 1996, cap. 10 (requerimientos y consumo)  https://nap.nationalacademies.org/resource/beef/beef10.pdf
 *  - BR-CORTE 2023, cap. 1, 2, 8 y 9               https://brcorte.com.br/assets/book2023/en/09.pdf
 *  - BR-CORTE 2016, cap. 9 (ejemplo de minerales)  https://brcorte.com.br/assets/book2016/en/c9.pdf
 *  - NRC 2001 (ecuación sumativa de Weiss)         https://www.foragelab.com/media/nrc2001.pdf
 */

import { perfilAnimal, nemRequerido, negRequerido, mineralesRequeridos } from '../src/engine/animal.js';
import { deDesdeTdn, meDesdeDe, nemDieta, negDieta, tdnWeiss, corregirTdnEstimado } from '../src/engine/energy.js';
import { dmiBrCorte, dmiNrc } from '../src/engine/intake.js';
import { evaluarSeguridad, pMinVigente } from '../src/engine/safety.js';
import { construirRestricciones } from '../src/engine/constraints.js';
import { rampaAdaptacion, validarRampa } from '../src/engine/adaptation.js';
import { formularRacionAvanzada } from '../src/engine/index.js';

let pasaron = 0;
let fallaron = 0;

function ok(nombre, condicion, detalle = '') {
  if (condicion) {
    pasaron++;
    console.log(`  ✓ ${nombre}`);
  } else {
    fallaron++;
    console.log(`  ✗ ${nombre}${detalle ? ` → ${detalle}` : ''}`);
  }
}

function cerca(nombre, valor, esperado, tolerancia, unidad = '') {
  const dif = Math.abs(valor - esperado);
  ok(
    `${nombre}: ${valor.toFixed(3)}${unidad} (publicado ${esperado}${unidad})`,
    dif <= tolerancia,
    `difiere ${dif.toFixed(3)}, tolerancia ${tolerancia}`,
  );
}

// ---------------------------------------------------------------------------
console.log('\n1. Conversiones de energía (NRC 1996 cap. 10 / BR-CORTE 2023 cap. 8)');
// ---------------------------------------------------------------------------

cerca('ED de un alimento de 88 % TDN', deDesdeTdn(88), 3.88, 0.02, ' Mcal/kg');
cerca('EM a partir de esa ED', meDesdeDe(deDesdeTdn(88)), 3.366, 0.02, ' Mcal/kg');
cerca('ENm del maíz (EM 3.37)', nemDieta(3.366), 2.24, 0.15, ' Mcal/kg');
cerca('ENg del maíz (EM 3.37)', negDieta(3.366), 1.55, 0.15, ' Mcal/kg');
const emForraje = meDesdeDe(deDesdeTdn(55));
cerca('ENm de un forraje de 55 % TDN', nemDieta(emForraje), 1.15, 0.12, ' Mcal/kg');
cerca('ENg de un forraje de 55 % TDN', negDieta(emForraje), 0.58, 0.12, ' Mcal/kg');

// ---------------------------------------------------------------------------
console.log('\n2. Requerimientos del animal (BR-CORTE 2023)');
// ---------------------------------------------------------------------------

const nelore400 = perfilAnimal({ pv: 400, razaId: 'nelore', sexo: 'macho_entero', entorno: 'confinamiento' });

cerca('Peso vivo desbastado (SBW) de un Nelore de 400 kg', nelore400.sbw, 389, 3, ' kg');
cerca('Peso de cuerpo vacío (EBW)', nelore400.ebw, 346, 4, ' kg');

const mantNeutro = nemRequerido(nelore400, { tempActual: 20, tempPrevia: 20, jadeo: 'ninguno' });
cerca('ENm base en termoneutralidad', mantNeutro.nem, 0.075 * Math.pow(nelore400.ebw, 0.75), 0.15, ' Mcal/d');
const mantCalor = nemRequerido(nelore400, { tempActual: 25, tempPrevia: 25, jadeo: 'ninguno' });
ok(
  `Con 25 °C previos el mantenimiento baja respecto de 20 °C (${mantCalor.nem.toFixed(2)} vs ${mantNeutro.nem.toFixed(2)} Mcal/d)`,
  mantCalor.nem < mantNeutro.nem && mantCalor.nem > mantNeutro.nem * 0.9,
);

const min400 = mineralesRequeridos(nelore400, 1.0);
cerca('Calcio dietario (ejemplo resuelto BR-CORTE)', min400.ca.dietario, 21.67, 0.5, ' g/d');
cerca('Fósforo dietario (ejemplo resuelto BR-CORTE)', min400.p.dietario, 14.66, 0.5, ' g/d');
cerca('Magnesio dietario', min400.mg.dietario, 7.65, 0.5, ' g/d');
cerca('Sodio dietario', min400.na.dietario, 9.31, 0.5, ' g/d');

const neg10 = negRequerido(nelore400, 1.0);
const neg15 = negRequerido(nelore400, 1.5);
const r10 = typeof neg10 === 'number' ? neg10 : neg10.neg;
const r15 = typeof neg15 === 'number' ? neg15 : neg15.neg;
ok('La ENg de ganancia crece más que proporcional a la GDP', r15 / r10 > 1.5, `relación ${(r15 / r10).toFixed(3)}`);

// ---------------------------------------------------------------------------
console.log('\n3. Consumo de materia seca');
// ---------------------------------------------------------------------------

const esperadoBrc = -2.1948 + 0.08338 * Math.pow(400, 0.75) + 3.9328 * 1.2 - 0.9030 * 1.44;
cerca('Consumo BR-CORTE, Nelore 400 kg, GDP 1.2', dmiBrCorte(nelore400, 1.2), esperadoBrc, 0.15, ' kg MS/d');

const nem = 1.9;
const nrcYearling = (Math.pow(nelore400.sbw, 0.75) * (0.2435 * nem - 0.0466 * nem * nem - 0.0869)) / nem;
cerca('Consumo NRC 1996, novillo yearling, dieta de ENm 1.9', dmiNrc(nelore400, nem), nrcYearling, 0.2, ' kg MS/d');

const ternero = perfilAnimal({ pv: 200, razaId: 'nelore', sexo: 'macho_entero', entorno: 'confinamiento' });
const nrcTernero = (Math.pow(ternero.sbw, 0.75) * (0.2435 * nem - 0.0466 * nem * nem - 0.1128)) / nem;
cerca('Consumo NRC 1996, ternero de 200 kg, dieta de ENm 1.9', dmiNrc(ternero, nem), nrcTernero, 0.2, ' kg MS/d');

const pctBrc = (dmiBrCorte(nelore400, 1.2) / 400) * 100;
ok(`Consumo entre 1.5 y 3 % del peso vivo (${pctBrc.toFixed(2)} %)`, pctBrc > 1.5 && pctBrc < 3.0);

// ---------------------------------------------------------------------------
console.log('\n4. Ecuación sumativa del NRC 2001 y corrección de TDN');
// ---------------------------------------------------------------------------

const tdnMaiz = tdnWeiss({ pb: 9.4, ndf: 9.5, lignina: 0.6, ee: 4.2, cenizas: 1.5, esForraje: false });
cerca('TDN del maíz por la sumativa', tdnMaiz, 88, 6, ' %');

const inverosimil = corregirTdnEstimado({
  id: 'prueba', categoria: 'forraje', tdn: 79, tdn_estimado: true,
  pb: 22.3, ndf: 49.7, adf: 34.8, ee: 4.2, cenizas: 10.0,
});
ok(
  `Un TDN estimado de 79 con 49.7 % de FDN se corrige (quedó en ${inverosimil.tdn})`,
  inverosimil.tdn < 70 && inverosimil.tdn_original === 79,
);

const publicado = corregirTdnEstimado({ id: 'x', categoria: 'energético', tdn: 88, tdn_estimado: false, pb: 9.4, ndf: 9.5, lignina: 0.6, ee: 4.2, cenizas: 1.5 });
ok('Un TDN publicado queda intacto', publicado.tdn === 88 && publicado.tdn_original === undefined);

// ---------------------------------------------------------------------------
console.log('\n5. Validador de seguridad');
// ---------------------------------------------------------------------------

const suicida = evaluarSeguridad({
  peNdfPct: 2, ndfPct: 8, almidonPct: 65, forrajePct: 2, concentradoPct: 98,
  caPct: 0.1, pPct: 0.9, ratioCaP: 0.11, sPct: 0.6, ureaPct: 3,
}, 'TERM');
ok(`Una dieta de 98 % concentrado y 65 % almidón se bloquea (${suicida.bloqueos.length} bloqueos)`, suicida.bloqueos.length >= 4 && suicida.ok === false);

const razonable = evaluarSeguridad({
  peNdfPct: 12, ndfPct: 25, almidonPct: 35, forrajePct: 20, concentradoPct: 80,
  caPct: 0.62, pPct: 0.31, ratioCaP: 2.0, sPct: 0.18, ureaPct: 0.8, mgPct: 0.2,
}, 'TERM');
ok(`Una dieta de terminación bien armada no se bloquea (${razonable.bloqueos.length} bloqueos)`, razonable.bloqueos.length === 0);

const conNulos = evaluarSeguridad({ peNdfPct: null, almidonPct: null, ratioCaP: null }, 'TERM');
ok('Un dato desconocido no genera un bloqueo inventado', conNulos.bloqueos.length === 0);

// ---------------------------------------------------------------------------
console.log('\n6. Rampa de adaptación al grano');
// ---------------------------------------------------------------------------

const rampa = rampaAdaptacion({ concentradoFinalPct: 85 });
ok(`La rampa hasta 85 % de concentrado dura al menos 21 días (${rampa.diasTotales} días)`, rampa.diasTotales >= 21);
ok('Ningún escalón sube más de 10 puntos de concentrado', rampa.escalones.every((e, i) => i === 0 || e.concentradoPct - rampa.escalones[i - 1].concentradoPct <= 10.001));
ok('La rampa arranca por debajo del 50 % de concentrado', rampa.escalones[0].concentradoPct <= 50);
ok('La rampa termina en el porcentaje pedido', Math.abs(rampa.escalones.at(-1).concentradoPct - 85) < 0.001);
ok('El validador de rampa acepta su propia rampa', validarRampa(rampa.escalones).ok !== false);

// ---------------------------------------------------------------------------
console.log('\n7. Raciones completas: ninguna puede tener bloqueos de seguridad');
// ---------------------------------------------------------------------------

const escenarios = [
  { nombre: 'feedlot inicio 200 kg', pv: 200, sistemaId: 'feedlot', fase: 'inicio' },
  { nombre: 'feedlot desarrollo 350 kg', pv: 350, sistemaId: 'feedlot', fase: 'desarrollo' },
  { nombre: 'feedlot terminación 450 kg', pv: 450, sistemaId: 'feedlot', fase: 'terminacion' },
  { nombre: 'semiintensivo 300 kg', pv: 300, sistemaId: 'semiIntensivo' },
  { nombre: 'pastoril 250 kg', pv: 250, sistemaId: 'pastoril' },
  { nombre: 'feedlot terminación 380 kg, modo económico', pv: 380, sistemaId: 'feedlot', fase: 'terminacion', modo: 'economico' },
];

for (const esc of escenarios) {
  const r = formularRacionAvanzada({ razaId: 'nelore', temperatura: 30, ...esc });
  if (r.error) {
    ok(`${esc.nombre}: formula sin error`, false, r.error);
    continue;
  }
  const i = r.indicadores;
  ok(`${esc.nombre}: sin bloqueos de seguridad`, r.seguridad.bloqueos.length === 0,
    r.seguridad.bloqueos.map((b) => b.detalle).join(' ; '));
  ok(`${esc.nombre}: la ganancia está calculada, no es null (${r.gdp_estimada} kg/d)`,
    typeof r.gdp_estimada === 'number' && Number.isFinite(r.gdp_estimada) && r.gdp_estimada > 0);
  ok(`${esc.nombre}: consumo entre 1.2 y 3 % del peso vivo (${i.ms_pct_pv} %)`,
    i.ms_pct_pv >= 1.2 && i.ms_pct_pv <= 3.0);
  ok(`${esc.nombre}: relación Ca:P dentro de 1.2 a 6 (${i.ratio_ca_p})`,
    i.ratio_ca_p >= 1.2 - 1e-6 && i.ratio_ca_p <= 6 + 1e-6);
  ok(`${esc.nombre}: la suma de la ración da el consumo predicho`,
    Math.abs(r.racion.reduce((s, it) => s + it.kg_ms_dia, 0) - i.ms_total_kg) < 0.05);
  ok(`${esc.nombre}: todos los ingredientes tienen kilos positivos`,
    r.racion.every((it) => it.kg_dia > 0));
  ok(`${esc.nombre}: la conversión es creíble (2 a 15 kg MS por kg de ganancia): ${i.conversion}`,
    i.conversion >= 2 && i.conversion <= 15);
}

// ---------------------------------------------------------------------------
console.log('\n8. La ganancia predicha responde a la calidad de la dieta');
// ---------------------------------------------------------------------------

const soloForrajePobre = formularRacionAvanzada({
  pv: 350, sistemaId: 'pastoril', razaId: 'nelore', temperatura: 28,
  alimentosSeleccionadosIds: ['pasto_brachiaria', 'sal_mineral'],
});
const conConcentrado = formularRacionAvanzada({
  pv: 350, sistemaId: 'feedlot', fase: 'terminacion', razaId: 'nelore', temperatura: 28,
});
if (!soloForrajePobre.error && !conConcentrado.error) {
  ok(
    `Con pasto solo se gana menos que en corral (${soloForrajePobre.gdp_estimada} vs ${conConcentrado.gdp_estimada} kg/d)`,
    soloForrajePobre.gdp_estimada < conConcentrado.gdp_estimada,
  );
} else {
  ok('Los dos escenarios de contraste formulan', false,
    soloForrajePobre.error || conConcentrado.error);
}

const buena = formularRacionAvanzada({ pv: 300, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28 });
const mala = formularRacionAvanzada({
  pv: 300, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  estadosCalidad: Object.fromEntries((buena.racion || []).map((it) => [it.id, 'Muy deteriorado'])),
});
if (!buena.error && !mala.error) {
  ok(
    `Con alimentos deteriorados la ganancia baja (${mala.gdp_estimada} vs ${buena.gdp_estimada} kg/d)`,
    mala.gdp_estimada <= buena.gdp_estimada,
  );
}

// ---------------------------------------------------------------------------
console.log('\n9. V93b resuelto por pMinVigente() — política WARN');
// ---------------------------------------------------------------------------

// --- 9a. Valores de pMinVigente() por sistema ------------------------------
ok('pMinVigente(pastoril) === 0.18',      pMinVigente({ sistemaId: 'pastoril' }) === 0.18);
ok('pMinVigente(semiIntensivo) === 0.22', pMinVigente({ sistemaId: 'semiIntensivo' }) === 0.22);
ok('pMinVigente(feedlot) === 0.28',       pMinVigente({ sistemaId: 'feedlot' }) === 0.28);
ok('pMinVigente({}) === null (sin fallback silencioso)', pMinVigente({}) === null);
ok('pMinVigente({ sistemaId: "desconocido" }) === null',
   pMinVigente({ sistemaId: 'desconocido' }) === null);

// --- 9b. pastoril con P = 0.15 % MS → WARN V93b con min 0.18 --------------
{
  const r = evaluarSeguridad(
    { pPct: 0.15, caPct: 0.5, ratioCaP: 3.33, ndfPct: 55, peNdfPct: 40, forrajePct: 80 },
    'CREC',
    { sistemaId: 'pastoril' },
  );
  const v93b = r.advertencias.find((w) => w.id === 'V93b');
  ok('pastoril P=0.15: V93b aparece como advertencia', !!v93b);
  ok('pastoril P=0.15: V93b NO aparece como bloqueo', !r.bloqueos.some((b) => b.id === 'V93b'));
  ok('pastoril P=0.15: el mínimo resuelto es 0.18', v93b && v93b.min === 0.18);
  ok('pastoril P=0.15: sin avisos de configuración',
     !r.avisosConfiguracion || r.avisosConfiguracion.length === 0);
}

// --- 9c. semiIntensivo con P = 0.15 % MS → umbral 0.22 --------------------
{
  const r = evaluarSeguridad(
    { pPct: 0.15, caPct: 0.5, ratioCaP: 3.33 },
    'CREC',
    { sistemaId: 'semiIntensivo' },
  );
  const v93b = r.advertencias.find((w) => w.id === 'V93b');
  ok('semiIntensivo P=0.15: V93b aparece', !!v93b);
  ok('semiIntensivo P=0.15: el mínimo resuelto es 0.22', v93b && v93b.min === 0.22);
  ok('semiIntensivo P=0.15: sin bloqueo V93b', !r.bloqueos.some((b) => b.id === 'V93b'));
}

// --- 9d. feedlot con P = 0.15 % MS → umbral 0.28 --------------------------
{
  const r = evaluarSeguridad(
    { pPct: 0.15, caPct: 0.5, ratioCaP: 3.33 },
    'TERM',
    { sistemaId: 'feedlot' },
  );
  const v93b = r.advertencias.find((w) => w.id === 'V93b');
  ok('feedlot P=0.15: V93b aparece', !!v93b);
  ok('feedlot P=0.15: el mínimo resuelto es 0.28', v93b && v93b.min === 0.28);
}

// --- 9e. P ≥ umbral en cada sistema → sin V93b ----------------------------
{
  const pares = [['pastoril', 0.18], ['semiIntensivo', 0.22], ['feedlot', 0.28]];
  for (const [sid, umbral] of pares) {
    const r = evaluarSeguridad(
      { pPct: umbral + 0.02, caPct: 0.5, ratioCaP: 2.0 },
      'CREC',
      { sistemaId: sid },
    );
    ok(`${sid} P=${(umbral + 0.02).toFixed(2)}: V93b no dispara`,
       !r.advertencias.some((w) => w.id === 'V93b'));
  }
}

// --- 9f. Sin sistemaId → diagnóstico explícito, no silencio ---------------
{
  const r = evaluarSeguridad({ pPct: 0.15, caPct: 0.5, ratioCaP: 3.33 }, 'CREC');
  ok('sin sistemaId: la respuesta trae avisosConfiguracion',
     Array.isArray(r.avisosConfiguracion));
  ok('sin sistemaId: hay al menos un aviso', r.avisosConfiguracion.length >= 1);
  ok('sin sistemaId: V93b NO se evalúa silenciosamente',
     !r.advertencias.some((w) => w.id === 'V93b'));
  ok('sin sistemaId: el aviso menciona V93b',
     r.avisosConfiguracion.some((m) => m.includes('V93b')));
}

// --- 9g. La fila V93b llega al LP como WARN elástica ----------------------
// El nombre de la fila incluye TODAS las reglas que tocan el campo `pPct` en
// esa fase (V81 max + V93b min), así que buscar por `name.includes('V93b')`
// puede devolver la fila de V81. Filtramos por las propiedades reales que
// emite `push()` dentro del loop de la sección 5 de construirRestricciones:
//   campo, op, elastic, severidad, penalty, rhs.
{
  const alimentos = [
    { id: 'forraje_x', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.20, ca: 0.45,
      em: 2.0, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, max_inclusion_pct: null },
    { id: 'maiz_x',    categoria: 'energético', ndf: 10, pef: 0, p: 0.30, ca: 0.03,
      em: 3.3, pb: 9, almidon: 72, ee: 4, s: 0.05, mg: 0.12, k: 0.4, max_inclusion_pct: null },
    { id: 'fosfato_x', categoria: 'mineral', ndf: 0, pef: 0, p: 17.0, ca: 23.9,
      em: 0, pb: 0, almidon: 0, ee: 0, s: 0, mg: 0.6, k: 0, max_inclusion_pct: 2 },
  ];
  const base = {
    alimentos, dmi: 10, pv: 350, fase: 'CREC',
    emRequerida: 20, pbRequeridaKg: 1.0, pdrRequeridaKg: 0.6,
    caRequeridaG: 25, pRequeridaG: 15, contexto: {},
  };

  // Filtro robusto: la fila del mínimo WARN de fósforo se identifica por las
  // tres propiedades que la definen, no por el nombre.
  const esFilaV93b = (r) =>
    r.campo === 'pPct' && r.op === '>=' && r.severidad === 'WARN';

  const { rows: rowsCon } = construirRestricciones({ ...base, sistemaId: 'pastoril' });
  const { rows: rowsSin } = construirRestricciones({ ...base });

  const filaV93b = rowsCon.find(esFilaV93b);
  ok('LP con sistemaId: la fila V93b existe', !!filaV93b);
  ok('LP con sistemaId: la fila V93b tiene campo "pPct"', filaV93b && filaV93b.campo === 'pPct');
  ok('LP con sistemaId: la fila V93b tiene op ">="', filaV93b && filaV93b.op === '>=');
  ok('LP con sistemaId: la fila V93b es elástica', filaV93b && filaV93b.elastic === true);
  ok('LP con sistemaId: la fila V93b lleva severidad WARN (no BLOCK)',
     filaV93b && filaV93b.severidad === 'WARN');
  // rhs en kg de P/día: 0.18 % de 10 kg MS = 0.018 kg
  ok(`LP con sistemaId: el rhs de V93b es ${(0.18 / 100 * 10).toFixed(4)} kg P/día`,
     filaV93b && Math.abs(filaV93b.rhs - (0.18 / 100) * 10) < 1e-9);

  // Sin sistemaId, no debe emitirse ninguna fila V93b.
  const sinV93b = rowsSin.filter(esFilaV93b);
  ok('LP sin sistemaId: NO se emite la fila V93b', sinV93b.length === 0);

  // La fila WARN es blanda: penalización baja comparada con un BLOCK.
  ok('LP con sistemaId: la penalización de V93b es menor que la de un BLOCK',
     filaV93b && typeof filaV93b.penalty === 'number' && filaV93b.penalty < 100);

  // La fila V81 de máximo BLOCK sigue existiendo y NO lleva `elastic`.
  const filaV81 = rowsCon.find((r) => r.campo === 'pPct' && r.op === '<=');
  ok('LP con sistemaId: la fila V81 (max P) sigue como BLOCK sin elastic',
     filaV81 && filaV81.elastic !== true && filaV81.severidad === 'BLOCK');
}

// ---------------------------------------------------------------------------
console.log('\n10. Requerimientos escalan con el peso (250, 350, 450 y 550 kg)');
// ---------------------------------------------------------------------------

const pesos = [250, 350, 450, 550];
const corridas = [];
for (const pv of pesos) {
  const r = formularRacionAvanzada({
    pv, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (r.error) {
    ok(`peso ${pv} kg: formula sin error`, false, r.error);
    continue;
  }
  corridas.push({ pv, r });
}

ok('Los cuatro pesos formularon', corridas.length === 4);

if (corridas.length === 4) {
  const cas = corridas.map((x) => x.r.indicadores.ca_requerida_g);
  const ps = corridas.map((x) => x.r.indicadores.p_requerida_g);
  const dmis = corridas.map((x) => x.r.indicadores.ms_total_kg);

  // "No están fijos": los cuatro valores no pueden ser idénticos.
  // NO se exige monotonicidad estricta porque:
  //   - El Ca requerido tiene un mínimo fisiológico alrededor de 300–350 kg
  //     (mantenimiento crece lineal con BW, crecimiento decrece como BW^-0.5;
  //     la suma tiene un mínimo). BR-CORTE 2016 cap. 9.
  //   - El DMI cae un poco al pasar de ~350 a ~450 kg porque BFAF (multiplicador
  //     por grasa corporal del NRC Tabla 10-4) baja de 1.00 a 0.90 cuando el
  //     EQSBW supera 350 kg.
  // Ambos son comportamientos documentados del propio modelo, no bugs.
  ok('Los Ca requeridos no son todos idénticos',
     new Set(cas).size > 1, `cas: ${cas.join(', ')}`);
  ok('Los P requeridos no son todos idénticos',
     new Set(ps).size > 1, `ps: ${ps.join(', ')}`);
  ok('Los consumos MS no son todos idénticos',
     new Set(dmis).size > 1, `dmis: ${dmis.join(', ')}`);

  ok(`Todos los Ca requeridos en rango fisiológico (15–30 g/d): ${cas.join(', ')}`,
     cas.every((c) => c > 15 && c < 30));
  ok(`Todos los P requeridos en rango fisiológico (10–22 g/d): ${ps.join(', ')}`,
     ps.every((p) => p > 10 && p < 22));
  ok('Todos los consumos MS en rango fisiológico (1.2–3 % PV)',
     corridas.every((x) => x.r.indicadores.ms_pct_pv > 1.2 && x.r.indicadores.ms_pct_pv < 3.0));

  // Tendencia global: el P de mantenimiento crece lineal con el peso, así que
  // el P total a 550 debe superar al de 250 aunque no crezca en cada paso.
  ok('El P requerido a 550 es mayor que a 250',
     corridas[3].r.indicadores.p_requerida_g > corridas[0].r.indicadores.p_requerida_g);
  ok('El Ca requerido a 550 es mayor que a 250',
     corridas[3].r.indicadores.ca_requerida_g > corridas[0].r.indicadores.ca_requerida_g);

  const gdps = corridas.map((x) => x.r.gdp_estimada);
  ok('Las cuatro GDP no son idénticas', new Set(gdps).size > 1,
     `gdps: ${gdps.join(', ')}`);

  // Caso principal: Nelore 350 kg semiIntensivo
  const principal = corridas.find((x) => x.pv === 350);
  const r350 = principal.r;

  ok('Nelore 350 semiIntensivo: gdp_objetivo es número > 0',
     typeof r350.gdp_objetivo === 'number' && r350.gdp_objetivo > 0);
  ok(`Nelore 350 semiIntensivo: gdp_estimada > 0 (${r350.gdp_estimada} kg/d)`,
     typeof r350.gdp_estimada === 'number' && r350.gdp_estimada > 0);
  ok('Nelore 350 semiIntensivo: sin bloqueos de seguridad',
     r350.seguridad.bloqueos.length === 0,
     r350.seguridad.bloqueos.map((b) => b.detalle).join(' ; '));
  ok('Nelore 350 semiIntensivo: sin avisos de configuración',
     Array.isArray(r350.avisosConfiguracion) && r350.avisosConfiguracion.length === 0);
  ok(`Nelore 350 semiIntensivo: score de acidosis presente (${r350.indicadores.score_acidosis})`,
     typeof r350.indicadores.score_acidosis === 'number');
  ok(`Nelore 350 semiIntensivo: nivel de acidosis coherente (${r350.indicadores.riesgo_acidosis})`,
     typeof r350.indicadores.riesgo_acidosis === 'string');
  ok(`Nelore 350 semiIntensivo: la energía reportada no es null (${r350.indicadores.enm_aportada} Mcal)`,
     typeof r350.indicadores.enm_aportada === 'number');
  ok(`Nelore 350 semiIntensivo: la proteína reportada no es null (${r350.indicadores.pb_aportada} kg)`,
     typeof r350.indicadores.pb_aportada === 'number');
}

// ---------------------------------------------------------------------------
console.log('\n11. Unidades de fósforo (% de la MS, no fracción ni g/kg)');
// ---------------------------------------------------------------------------

// pPct se reconstruye desde p_total_g (gramos) y ms_total_kg (kg):
//   pPct (% MS) = p_total_g / (ms_total_kg * 1000) * 100 = p_total_g / ms_total_kg / 10
// Si la unidad fuera fracción (0–1) el resultado no coincidiría con un umbral
// de 0.18–0.28. Si fuera g/kg sería 10× más grande.
{
  const r = formularRacionAvanzada({ pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28 });
  if (!r.error) {
    const pPctReconstruido = r.indicadores.p_total_g / r.indicadores.ms_total_kg / 10;
    ok(`pPct reconstruido (${pPctReconstruido.toFixed(3)} %) está en rango fisiológico (0.1 – 0.8)`,
       pPctReconstruido > 0.1 && pPctReconstruido < 0.8);
    ok(`pPct reconstruido (${pPctReconstruido.toFixed(3)}) es del orden de los umbrales pMinVigente (0.18–0.28)`,
       pPctReconstruido > 0.1 && pPctReconstruido < 0.5);

    const pG_rec = (pPctReconstruido / 100) * r.indicadores.ms_total_kg * 1000;
    ok(`p_total_g reportado (${r.indicadores.p_total_g}) coincide con el reconstruido (${pG_rec.toFixed(2)})`,
       Math.abs(r.indicadores.p_total_g - pG_rec) < 0.05);
  }
}

// La propiedad `a.p` de la base es un porcentaje de MS (0–100), no una fracción.
{
  const { ALIMENTOS_BASE } = await import('../src/data/alimentosBase.js');
  const maiz = ALIMENTOS_BASE.find((a) => a.id === 'maiz_amarillo');
  ok('maiz_amarillo.p existe en la base', !!maiz && typeof maiz.p === 'number');
  ok(`maiz_amarillo.p = ${maiz?.p} está en % de la MS (0 < p < 2)`,
     maiz && maiz.p > 0 && maiz.p < 2);
  const fosfato = ALIMENTOS_BASE.find((a) => a.id === 'fosfato_bicalcico');
  ok(`fosfato_bicalcico.p = ${fosfato?.p} está en % (no en fracción)`,
     fosfato && fosfato.p > 5 && fosfato.p < 30);
}

// ---------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`RESULTADO: ${pasaron} pasaron, ${fallaron} fallaron`);
console.log('====================================================\n');
process.exit(fallaron > 0 ? 1 : 0);
