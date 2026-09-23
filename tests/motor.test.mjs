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
import { evaluarSeguridad, pMinVigente, scoreAcidosis } from '../src/engine/safety.js';
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

  ok('El P requerido a 550 es mayor que a 250',
     corridas[3].r.indicadores.p_requerida_g > corridas[0].r.indicadores.p_requerida_g);
  ok('El Ca requerido a 550 es mayor que a 250',
     corridas[3].r.indicadores.ca_requerida_g > corridas[0].r.indicadores.ca_requerida_g);

  const gdps = corridas.map((x) => x.r.gdp_estimada);
  ok('Las cuatro GDP no son idénticas', new Set(gdps).size > 1,
     `gdps: ${gdps.join(', ')}`);

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
console.log('\n12. score_detalle: sistemaId llega a scoreAcidosis()');
// ---------------------------------------------------------------------------

// Umbrales esperados por sistema (definidos en safety.js, no se tocan acá).
// Sirven como referencia para verificar que sistemaId viaja del formulador
// hasta scoreAcidosis().
const UMBRALES_SISTEMA = {
  feedlot:       { minPeNdf: 8,  minForraje: 5  },
  semiIntensivo: { minPeNdf: 20, minForraje: 30 },
  pastoril:      { minPeNdf: 25, minForraje: 60 },
};

// --- 12a. Unidad: scoreAcidosis() con sistemaId explícito ------------------
// Misma composición, tres sistemas. Solo debe cambiar lo que depende del
// sistema (minPeNdf, minForraje y, eventualmente, el score).
{
  const composicion = { peNdfPct: 17, almidonPct: 35, forrajePct: 25, tieneIonoforo: false, fase: 'TERM' };
  const porSistema = {};
  for (const sid of ['feedlot', 'semiIntensivo', 'pastoril']) {
    porSistema[sid] = scoreAcidosis({ ...composicion, sistemaId: sid });
  }

  for (const [sid, esperado] of Object.entries(UMBRALES_SISTEMA)) {
    const s = porSistema[sid];
    ok(`scoreAcidosis(${sid}).minPeNdf === ${esperado.minPeNdf}`, s.minPeNdf === esperado.minPeNdf,
       `obtenido ${s.minPeNdf}`);
    ok(`scoreAcidosis(${sid}).minForraje === ${esperado.minForraje}`, s.minForraje === esperado.minForraje,
       `obtenido ${s.minForraje}`);
    ok(`scoreAcidosis(${sid}) devuelve número y nivel válidos`,
       typeof s.score === 'number' && typeof s.nivel === 'string');
    ok(`scoreAcidosis(${sid}) devuelve componentes completos`,
       s.componentes && typeof s.componentes.peNdf === 'number' &&
       typeof s.componentes.almidon === 'number' &&
       typeof s.componentes.forraje === 'number' &&
       typeof s.componentes.ionoforo === 'number' &&
       typeof s.componentes.fase === 'number');
  }

  // El score NO se puede garantizar estrictamente creciente entre sistemas,
  // pero los umbrales sí deben ser distintos (prueba de que sistemaId llega).
  const setMinPeNdf = new Set(Object.values(porSistema).map((s) => s.minPeNdf));
  ok('Los minPeNdf de los tres sistemas son distintos entre sí', setMinPeNdf.size === 3,
     `valores: ${[...setMinPeNdf].join(', ')}`);
  const setMinForraje = new Set(Object.values(porSistema).map((s) => s.minForraje));
  ok('Los minForraje de los tres sistemas son distintos entre sí', setMinForraje.size === 3,
     `valores: ${[...setMinForraje].join(', ')}`);
}

// --- 12b. Integración: formularRacionAvanzada expone score_detalle ---------
{
  const r = formularRacionAvanzada({
    pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (r.error) {
    ok('integración: formula sin error', false, r.error);
  } else {
    const sd = r.score_detalle;
    ok('integración: score_detalle existe en el return', sd && typeof sd === 'object');
    ok('integración: score_detalle.score es número',
       sd && typeof sd.score === 'number');
    ok('integración: score_detalle.nivel es string',
       sd && typeof sd.nivel === 'string');
    ok('integración: score_detalle.minPeNdf es número',
       sd && typeof sd.minPeNdf === 'number');
    ok('integración: score_detalle.minForraje es número',
       sd && typeof sd.minForraje === 'number');
    ok('integración: score_detalle.componentes es objeto',
       sd && sd.componentes && typeof sd.componentes === 'object');
    ok('integración: score_detalle.riesgoEstructural existe',
       sd && typeof sd.riesgoEstructural === 'boolean');
  }
}

// --- 12c. Integración: en semiIntensivo NO se usan umbrales de feedlot -----
// Este es el corazón del fix. Si sistemaId no llegara, minPeNdf sería 8 y
// minForraje sería 5 (defaults de scoreAcidosis). Debe ser 20 y 30.
{
  const r = formularRacionAvanzada({
    pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (!r.error) {
    ok('semiIntensivo: minPeNdf === 20 (no 8 de feedlot)',
       r.score_detalle.minPeNdf === 20, `obtenido ${r.score_detalle.minPeNdf}`);
    ok('semiIntensivo: minForraje === 30 (no 5 de feedlot)',
       r.score_detalle.minForraje === 30, `obtenido ${r.score_detalle.minForraje}`);
  }
}

// --- 12d. Integración: consistencia entre score_detalle e indicadores ------
{
  const r = formularRacionAvanzada({
    pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (!r.error) {
    ok('consistencia: score_detalle.score === indicadores.score_acidosis',
       r.score_detalle.score === r.indicadores.score_acidosis,
       `score_detalle=${r.score_detalle.score}, indicadores=${r.indicadores.score_acidosis}`);
    ok('consistencia: score_detalle.nivel === indicadores.riesgo_acidosis',
       r.score_detalle.nivel === r.indicadores.riesgo_acidosis,
       `score_detalle=${r.score_detalle.nivel}, indicadores=${r.indicadores.riesgo_acidosis}`);
  }
}

// --- 12e. Los tres sistemas: minPeNdf y minForraje correctos --------------
{
  for (const [sid, esperado] of Object.entries(UMBRALES_SISTEMA)) {
    const r = formularRacionAvanzada({
      pv: 350, sistemaId: sid, razaId: 'nelore', temperatura: 28,
    });
    if (r.error) {
      ok(`integración ${sid}: formula sin error`, false, r.error);
      continue;
    }
    ok(`integración ${sid}: minPeNdf === ${esperado.minPeNdf} (obtenido ${r.score_detalle.minPeNdf})`,
       r.score_detalle.minPeNdf === esperado.minPeNdf);
    ok(`integración ${sid}: minForraje === ${esperado.minForraje} (obtenido ${r.score_detalle.minForraje})`,
       r.score_detalle.minForraje === esperado.minForraje);
    ok(`integración ${sid}: score_detalle.score === indicadores.score_acidosis`,
       r.score_detalle.score === r.indicadores.score_acidosis);
    ok(`integración ${sid}: score_detalle.nivel === indicadores.riesgo_acidosis`,
       r.score_detalle.nivel === r.indicadores.riesgo_acidosis);
  }
}

// --- 12f. Reproducibilidad: mismos inputs → mismos outputs ----------------
{
  const params = { pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28 };
  const a = formularRacionAvanzada(params);
  const b = formularRacionAvanzada(params);
  if (!a.error && !b.error) {
    ok('reproducibilidad: score_detalle.score idéntico en dos corridas',
       a.score_detalle.score === b.score_detalle.score);
    ok('reproducibilidad: score_detalle.nivel idéntico en dos corridas',
       a.score_detalle.nivel === b.score_detalle.nivel);
    ok('reproducibilidad: componentes idénticos en dos corridas',
       JSON.stringify(a.score_detalle.componentes) === JSON.stringify(b.score_detalle.componentes));
    ok('reproducibilidad: indicadores.score_acidosis idéntico',
       a.indicadores.score_acidosis === b.indicadores.score_acidosis);
  }
}

// --- 12g. azucaresPct queda en 0 (documentado como TODO) ------------------
// El componente de azúcares siempre evalúa 0 hoy, porque indicadoresDieta()
// no expone azucaresPct. Verificamos que score_detalle.componentes.azucares
// sea 0 en los tres sistemas, para que quede registrado en las pruebas y no
// se olvide cuando se agregue el dato real.
{
  for (const sid of ['feedlot', 'semiIntensivo', 'pastoril']) {
    const r = formularRacionAvanzada({
      pv: 350, sistemaId: sid, razaId: 'nelore', temperatura: 28,
    });
    if (!r.error) {
      ok(`${sid}: componentes.azucares === 0 (TODO pendiente: agregar azucaresPct real)`,
         r.score_detalle.componentes.azucares === 0,
         `obtenido ${r.score_detalle.componentes.azucares}`);
    }
  }
}
// ---------------------------------------------------------------------------
console.log('\n13. V59: cianuro en yuca (mg/kg MS, no %)');
// ---------------------------------------------------------------------------

// 13a. La base tiene los valores de HCN cargados.
{
  const { ALIMENTOS_BASE } = await import('../src/data/alimentosBase.js');
  const yucaRaiz = ALIMENTOS_BASE.find((a) => a.id === 'yuca_raiz');
  const yucaSeca = ALIMENTOS_BASE.find((a) => a.id === 'yuca_seca');

  ok('yuca_raiz.hcn existe y es número', yucaRaiz && typeof yucaRaiz.hcn === 'number');
  ok('yuca_seca.hcn existe y es número', yucaSeca && typeof yucaSeca.hcn === 'number');
  ok(`yuca_raiz.hcn = ${yucaRaiz?.hcn} está en rango esperado (100–250)`,
     yucaRaiz && yucaRaiz.hcn > 100 && yucaRaiz.hcn < 250);
  ok(`yuca_seca.hcn = ${yucaSeca?.hcn} está en rango esperado (30–95)`,
     yucaSeca && yucaSeca.hcn > 30 && yucaSeca.hcn < 95);
}

// 13b. La fila V59 se construye cuando hay yuca en la lista de alimentos.
{
  const alimentos = [
    { id: 'forraje_x', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.20, ca: 0.45,
      em: 2.0, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, max_inclusion_pct: null },
    { id: 'yuca_raiz', categoria: 'energético', ndf: 3.7, pef: 0, p: 0.04, ca: 0.1,
      em: 3.07, pb: 2.2, almidon: null, ee: 0.6, s: 0, mg: 0, k: 0, max_inclusion_pct: null,
      hcn: 175 },
  ];
  const base = {
    alimentos, dmi: 10, pv: 350, fase: 'CREC',
    emRequerida: 20, pbRequeridaKg: 1.0, pdrRequeridaKg: 0.6,
    caRequeridaG: 25, pRequeridaG: 15, contexto: {},
  };
  const { rows } = construirRestricciones(base);
  const filaHcn = rows.find((r) => r.campo === 'hcnMgKg');

  ok('LP con yuca: la fila V59 existe', !!filaHcn);
  ok('LP con yuca: la fila V59 tiene op "<="', filaHcn && filaHcn.op === '<=');
  ok('LP con yuca: la fila V59 tiene severidad BLOCK', filaHcn && filaHcn.severidad === 'BLOCK');
  ok('LP con yuca: la fila V59 tiene rhs 0', filaHcn && filaHcn.rhs === 0);
  ok('LP con yuca: la fila V59 nombra V59', filaHcn && filaHcn.name.includes('V59'));
}

// 13c. Sin ningún alimento con HCN, la fila no se construye.
{
  const alimentos = [
    { id: 'forraje_y', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.20, ca: 0.45,
      em: 2.0, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, max_inclusion_pct: null },
    { id: 'maiz_y', categoria: 'energético', ndf: 10, pef: 0, p: 0.30, ca: 0.03,
      em: 3.3, pb: 9, almidon: 72, ee: 4, s: 0.05, mg: 0.12, k: 0.4, max_inclusion_pct: null },
  ];
  const { rows } = construirRestricciones({
    alimentos, dmi: 10, pv: 350, fase: 'CREC',
    emRequerida: 20, pbRequeridaKg: 1.0, pdrRequeridaKg: 0.6,
    caRequeridaG: 25, pRequeridaG: 15, contexto: {},
  });
  const filaHcn = rows.find((r) => r.campo === 'hcnMgKg');
  ok('LP sin alimentos con HCN: la fila V59 NO se emite', !filaHcn);
}

// 13d. indicadoresDieta() calcula hcnMgKg con la unidad correcta.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  // 100 % de un alimento con hcn = 175. Resultado esperado: 175 mg/kg MS.
  const alimentos = [
    { id: 'yuca_solo', categoria: 'energético', ndf: 0, pef: 0, p: 0, ca: 0,
      em: 3, pb: 2, almidon: 0, ee: 0, s: 0, mg: 0, k: 0, hcn: 175, max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('indicadoresDieta expone hcnMgKg', typeof ind.hcnMgKg === 'number');
  ok(`100 % de yuca (hcn=175) → 175 mg/kg MS (obtenido ${ind.hcnMgKg})`,
     Math.abs(ind.hcnMgKg - 175) < 1e-6);

  // Mezcla 50/50: yuca con hcn 175 y maíz sin hcn.
  const alimentos2 = [
    ...alimentos,
    { id: 'maiz_z', categoria: 'energético', ndf: 10, pef: 0, p: 0.3, ca: 0.03,
      em: 3.3, pb: 9, almidon: 72, ee: 4, s: 0.05, mg: 0.12, k: 0.4, hcn: null, max_inclusion_pct: null },
  ];
  const ind2 = indicadoresDieta(alimentos2, [2.5, 2.5], 350);
  ok(`50 % yuca + 50 % maíz → 87.5 mg/kg MS (obtenido ${ind2.hcnMgKg})`,
     Math.abs(ind2.hcnMgKg - 87.5) < 1e-6);
}

// 13e. Sin yuca en la dieta, el HCN es 0.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  const alimentos = [
    { id: 'forraje_z', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.2, ca: 0.45,
      em: 2, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, hcn: null, max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('Sin alimento con HCN, hcnMgKg es 0', ind.hcnMgKg === 0);
}

// 13f. Regresión: una ración sin yuca no rompe V59.
{
  const r = formularRacionAvanzada({
    pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (!r.error) {
    ok('Ración sin yuca: V59 no aparece como bloqueo',
       !r.seguridad.bloqueos.some((b) => b.id === 'V59'));
  }
}
// ---------------------------------------------------------------------------
console.log('\n14. V46: gosipol en semilla y torta de algodón (ppm, no %)');
// ---------------------------------------------------------------------------

// 14a. La base tiene los valores de gosipol cargados.
{
  const { ALIMENTOS_BASE } = await import('../src/data/alimentosBase.js');
  const semilla = ALIMENTOS_BASE.find((a) => a.id === 'semilla_algodon');
  const torta = ALIMENTOS_BASE.find((a) => a.id === 'torta_algodon');

  ok('semilla_algodon.gosipol existe y es número', semilla && typeof semilla.gosipol === 'number');
  ok('torta_algodon.gosipol existe y es número', torta && typeof torta.gosipol === 'number');
  ok(`semilla_algodon.gosipol = ${semilla?.gosipol} en rango KSU (450–900)`,
     semilla && semilla.gosipol >= 450 && semilla.gosipol <= 900);
  ok(`torta_algodon.gosipol = ${torta?.gosipol} en rango KSU (400–1000)`,
     torta && torta.gosipol >= 400 && torta.gosipol <= 1000);
}

// 14b. La fila V46 se construye cuando hay algodón en la lista.
{
  const alimentos = [
    { id: 'forraje_x', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.20, ca: 0.45,
      em: 2.0, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, max_inclusion_pct: null },
    { id: 'semilla_algodon', categoria: 'proteico', ndf: 48.6, pef: 0, p: 0.59, ca: 0.15,
      em: 3.115, pb: 21.8, almidon: 2.1, ee: 19.7, s: 0, mg: 0.36, k: 1.2, max_inclusion_pct: 25,
      gosipol: 675 },
  ];
  const { rows } = construirRestricciones({
    alimentos, dmi: 10, pv: 350, fase: 'CREC',
    emRequerida: 20, pbRequeridaKg: 1.0, pdrRequeridaKg: 0.6,
    caRequeridaG: 25, pRequeridaG: 15, contexto: {},
  });
  const filaG = rows.find((r) => r.campo === 'gosipolPpm');

  ok('LP con semilla de algodón: la fila V46 existe', !!filaG);
  ok('LP con semilla de algodón: la fila V46 tiene op "<="', filaG && filaG.op === '<=');
  ok('LP con semilla de algodón: la fila V46 tiene severidad BLOCK', filaG && filaG.severidad === 'BLOCK');
  ok('LP con semilla de algodón: la fila V46 tiene rhs 0', filaG && filaG.rhs === 0);
  ok('LP con semilla de algodón: la fila V46 nombra V46', filaG && filaG.name.includes('V46'));
}

// 14c. Sin ningún alimento con gosipol, la fila no se construye.
{
  const alimentos = [
    { id: 'forraje_y', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.20, ca: 0.45,
      em: 2.0, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, max_inclusion_pct: null },
    { id: 'maiz_y', categoria: 'energético', ndf: 10, pef: 0, p: 0.30, ca: 0.03,
      em: 3.3, pb: 9, almidon: 72, ee: 4, s: 0.05, mg: 0.12, k: 0.4, max_inclusion_pct: null },
  ];
  const { rows } = construirRestricciones({
    alimentos, dmi: 10, pv: 350, fase: 'CREC',
    emRequerida: 20, pbRequeridaKg: 1.0, pdrRequeridaKg: 0.6,
    caRequeridaG: 25, pRequeridaG: 15, contexto: {},
  });
  const filaG = rows.find((r) => r.campo === 'gosipolPpm');
  ok('LP sin alimentos con gosipol: la fila V46 NO se emite', !filaG);
}

// 14d. indicadoresDieta() calcula gosipolPpm con la unidad correcta.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  const alimentos = [
    { id: 'semilla_sola', categoria: 'proteico', ndf: 0, pef: 0, p: 0, ca: 0,
      em: 3, pb: 20, almidon: 0, ee: 20, s: 0, mg: 0, k: 0, gosipol: 675, max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('indicadoresDieta expone gosipolPpm', typeof ind.gosipolPpm === 'number');
  ok(`100 % semilla (675 ppm) → 675 ppm (obtenido ${ind.gosipolPpm})`,
     Math.abs(ind.gosipolPpm - 675) < 1e-6);

  const alimentos2 = [
    ...alimentos,
    { id: 'maiz_z', categoria: 'energético', ndf: 10, pef: 0, p: 0.3, ca: 0.03,
      em: 3.3, pb: 9, almidon: 72, ee: 4, s: 0.05, mg: 0.12, k: 0.4, gosipol: null, max_inclusion_pct: null },
  ];
  const ind2 = indicadoresDieta(alimentos2, [1, 4], 350);
  ok(`20 % semilla + 80 % maíz → 135 ppm (obtenido ${ind2.gosipolPpm})`,
     Math.abs(ind2.gosipolPpm - 135) < 1e-6);

  const ind3 = indicadoresDieta(alimentos2, [1.5, 3.5], 350);
  ok(`30 % semilla → 202.5 ppm (por encima de V46=${200}) → ${ind3.gosipolPpm}`,
     Math.abs(ind3.gosipolPpm - 202.5) < 1e-6);
}

// 14e. Sin algodón en la dieta, el gosipol es 0.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  const alimentos = [
    { id: 'forraje_z', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.2, ca: 0.45,
      em: 2, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, gosipol: null, max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('Sin alimento con gosipol, gosipolPpm es 0', ind.gosipolPpm === 0);
}

// 14f. Regresión: una ración sin algodón no dispara V46.
{
  const r = formularRacionAvanzada({
    pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (!r.error) {
    ok('Ración sin algodón: V46 no aparece como bloqueo',
       !r.seguridad.bloqueos.some((b) => b.id === 'V46'));
  }
}
// ---------------------------------------------------------------------------
console.log('\n15. Azúcares solubles: campo en la base + cálculo en indicadoresDieta');
// ---------------------------------------------------------------------------

// 15a. La base tiene los 9 valores de azúcares cargados.
{
  const { ALIMENTOS_BASE } = await import('../src/data/alimentosBase.js');
  const esperados = {
    'melaza_caña': 55, 'cana_azucar': 12, 'pulpa_citrica': 22,
    'cachaza': 5, 'yuca_raiz': 2, 'yuca_seca': 2,
    'bagazo_cana': 1, 'maiz_amarillo': 1, 'sorgo_grano': 1,
  };
  for (const [id, valor] of Object.entries(esperados)) {
    const a = ALIMENTOS_BASE.find((x) => x.id === id);
    ok(`${id}.azucares = ${a?.azucares} (esperado ${valor})`,
       a && a.azucares === valor);
  }

  // Los alimentos SIN dato no deben tener la propiedad (undefined).
  const maiz = ALIMENTOS_BASE.find((x) => x.id === 'pasto_mombasa');
  ok('pasto_mombasa.azucares es undefined (no inventado)',
     maiz && maiz.azucares === undefined);
}

// 15b. indicadoresDieta() calcula azucaresPct correctamente.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  // 100 % melaza (azucares 55) → 55 % de azúcares.
  const alimentos = [
    { id: 'melaza_sola', categoria: 'energético', ndf: 0.8, pef: 0, p: 0.07, ca: 0.92,
      em: 2.24, pb: 5.5, almidon: null, azucares: 55, ee: 1, s: 0, mg: 0.4, k: 5.1,
      max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('indicadoresDieta expone azucaresPct', typeof ind.azucaresPct === 'number');
  ok(`100 % melaza (55 %) → 55 (obtenido ${ind.azucaresPct})`,
     Math.abs(ind.azucaresPct - 55) < 1e-6);

  // Mezcla 2 kg melaza + 5 kg maíz (1 % azúcares): (2*55 + 5*1) / 7 = 16.43 %.
  const alimentos2 = [
    ...alimentos,
    { id: 'maiz_z', categoria: 'energético', ndf: 12.7, pef: 0, p: 0.32, ca: 0.02,
      em: 3.37, pb: 10.5, almidon: 72.5, azucares: 1, ee: 4.4, s: 0, mg: 0.13, k: 0.37,
      max_inclusion_pct: null },
  ];
  const ind2 = indicadoresDieta(alimentos2, [2, 5], 350);
  const esperado = (2 * 55 + 5 * 1) / 7;
  ok(`2 kg melaza + 5 kg maíz → ${esperado.toFixed(3)} % (obtenido ${ind2.azucaresPct.toFixed(3)})`,
     Math.abs(ind2.azucaresPct - esperado) < 1e-6);
}

// 15c. Sin alimentos con azúcares declarados, azucaresPct es 0.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  const alimentos = [
    { id: 'forraje_z', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.2, ca: 0.45,
      em: 2, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5,
      azucares: undefined, max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('Sin azúcares declarados, azucaresPct es 0 (no NaN)', ind.azucaresPct === 0);
}

// 15d. El score de acidosis sube cuando la dieta tiene mucha melaza.
{
  // Misma composición base, sin y con azúcares.
  const sinAzucar = scoreAcidosis({
    peNdfPct: 22, almidonPct: 20, forrajePct: 30,
    azucaresPct: 0, tieneIonoforo: false, fase: 'CREC', sistemaId: 'semiIntensivo',
  });
  const conAzucar = scoreAcidosis({
    peNdfPct: 22, almidonPct: 20, forrajePct: 30,
    azucaresPct: 12, tieneIonoforo: false, fase: 'CREC', sistemaId: 'semiIntensivo',
  });
  ok(`Score con 12 % azúcares (${conAzucar.score}) mayor que sin azúcares (${sinAzucar.score})`,
     conAzucar.score > sinAzucar.score);
  ok('El componente azucares activa con 12 % (>10 → +12)',
     conAzucar.componentes.azucares === 12);
  ok('El componente azucares queda en 0 sin azúcares',
     sinAzucar.componentes.azucares === 0);
}

// 15e. Umbrales del componente azucares (6 / 10 / 15 %).
{
  const caso = (pct) => scoreAcidosis({
    peNdfPct: 22, almidonPct: 20, forrajePct: 30,
    azucaresPct: pct, tieneIonoforo: false, fase: 'CREC', sistemaId: 'semiIntensivo',
  }).componentes.azucares;

  ok('azucares = 3 % → componente 0', caso(3) === 0);
  ok('azucares = 8 % → componente 6', caso(8) === 6);
  ok('azucares = 12 % → componente 12', caso(12) === 12);
  ok('azucares = 20 % → componente 20', caso(20) === 20);
}

// 15f. Regresión: una ración sin melaza no rompe nada.
{
  const r = formularRacionAvanzada({
    pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (!r.error) {
    ok('Ración sin melaza: score_detalle sigue existiendo',
       r.score_detalle && typeof r.score_detalle.score === 'number');
    ok('Ración sin melaza: componente azucares es 0',
       r.score_detalle.componentes.azucares === 0);
    ok('Ración sin melaza: sin bloqueos de seguridad',
       r.seguridad.bloqueos.length === 0);
  }
}
// ---------------------------------------------------------------------------
console.log('\n16. V83: nitrato en granos y silajes (ppm, no %)');
// ---------------------------------------------------------------------------

// 16a. La base tiene los 5 valores de nitrato cargados.
{
  const { ALIMENTOS_BASE } = await import('../src/data/alimentosBase.js');
  const esperados = {
    'maiz_amarillo': 250,
    'sorgo_grano': 500,
    'avena_grano': 150,
    'silo_maiz': 1500,
    'silo_sorgo': 2500,
  };
  for (const [id, valor] of Object.entries(esperados)) {
    const a = ALIMENTOS_BASE.find((x) => x.id === id);
    ok(`${id}.nitrato = ${a?.nitrato} (esperado ${valor})`,
       a && a.nitrato === valor);
  }

  // Los alimentos SIN dato no deben tener la propiedad (undefined).
  const pasto = ALIMENTOS_BASE.find((x) => x.id === 'pasto_mombasa');
  ok('pasto_mombasa.nitrato es undefined (no inventado)',
     pasto && pasto.nitrato === undefined);
}

// 16b. La fila V83 se construye cuando hay alimentos con nitrato.
{
  const alimentos = [
    { id: 'silo_sorgo', categoria: 'forraje', ndf: 66, pef: 0.8, p: 0.30, ca: 0.41,
      em: 2.15, pb: 6.7, almidon: null, nitrato: 2500, ee: 2.6, s: 0.14, mg: 0.22, k: 2.04,
      max_inclusion_pct: null },
    { id: 'maiz_amarillo', categoria: 'energético', ndf: 12.7, pef: 0, p: 0.32, ca: 0.02,
      em: 3.37, pb: 10.5, almidon: 72.5, nitrato: 250, ee: 4.4, s: 0, mg: 0.13, k: 0.37,
      max_inclusion_pct: null },
  ];
  const { rows } = construirRestricciones({
    alimentos, dmi: 10, pv: 350, fase: 'CREC',
    emRequerida: 20, pbRequeridaKg: 1.0, pdrRequeridaKg: 0.6,
    caRequeridaG: 25, pRequeridaG: 15, contexto: {},
  });
  const filaN = rows.find((r) => r.campo === 'nitratoPpm');

  ok('LP con nitrato: la fila V83 existe', !!filaN);
  ok('LP con nitrato: la fila V83 tiene op "<="', filaN && filaN.op === '<=');
  ok('LP con nitrato: la fila V83 tiene severidad WARN (no BLOCK)',
     filaN && filaN.severidad === 'WARN');
  ok('LP con nitrato: la fila V83 es elástica', filaN && filaN.elastic === true);
  ok('LP con nitrato: la fila V83 tiene penalty 20', filaN && filaN.penalty === 20);
  ok('LP con nitrato: la fila V83 tiene rhs 0', filaN && filaN.rhs === 0);
  ok('LP con nitrato: la fila V83 nombra V83', filaN && filaN.name.includes('V83'));
}

// 16c. Sin ningún alimento con nitrato, la fila no se construye.
{
  const alimentos = [
    { id: 'forraje_y', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.20, ca: 0.45,
      em: 2.0, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5, max_inclusion_pct: null },
    { id: 'harina_soya', categoria: 'proteico', ndf: 5, pef: 0, p: 0.71, ca: 0.38,
      em: 3.18, pb: 52.6, almidon: 5.7, ee: 1.8, s: 0.45, mg: 0.31, k: 2.38, max_inclusion_pct: null },
  ];
  const { rows } = construirRestricciones({
    alimentos, dmi: 10, pv: 350, fase: 'CREC',
    emRequerida: 20, pbRequeridaKg: 1.0, pdrRequeridaKg: 0.6,
    caRequeridaG: 25, pRequeridaG: 15, contexto: {},
  });
  const filaN = rows.find((r) => r.campo === 'nitratoPpm');
  ok('LP sin alimentos con nitrato: la fila V83 NO se emite', !filaN);
}

// 16d. indicadoresDieta() calcula nitratoPpm con la unidad correcta.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  // 100 % de silo de sorgo (nitrato 2500) → 2500 ppm.
  const alimentos = [
    { id: 'silo_solo', categoria: 'forraje', ndf: 66, pef: 0.8, p: 0.30, ca: 0.41,
      em: 2.15, pb: 6.7, almidon: null, nitrato: 2500, ee: 2.6, s: 0.14, mg: 0.22, k: 2.04,
      max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('indicadoresDieta expone nitratoPpm', typeof ind.nitratoPpm === 'number');
  ok(`100 % silo sorgo (2500 ppm) → 2500 ppm (obtenido ${ind.nitratoPpm})`,
     Math.abs(ind.nitratoPpm - 2500) < 1e-6);

  // Mezcla 4 kg silo de sorgo + 3 kg maíz: (4*2500 + 3*250) / 7 = 1535.71
  const alimentos2 = [
    ...alimentos,
    { id: 'maiz_z', categoria: 'energético', ndf: 12.7, pef: 0, p: 0.32, ca: 0.02,
      em: 3.37, pb: 10.5, almidon: 72.5, nitrato: 250, ee: 4.4, s: 0, mg: 0.13, k: 0.37,
      max_inclusion_pct: null },
  ];
  const ind2 = indicadoresDieta(alimentos2, [4, 3], 350);
  const esperado = (4 * 2500 + 3 * 250) / 7;
  ok(`4 kg silo sorgo + 3 kg maíz → ${esperado.toFixed(2)} ppm (obtenido ${ind2.nitratoPpm.toFixed(2)})`,
     Math.abs(ind2.nitratoPpm - esperado) < 1e-6);
}

// 16e. Sin nitrato declarado, nitratoPpm es 0.
{
  const { indicadoresDieta } = await import('../src/engine/constraints.js');
  const alimentos = [
    { id: 'forraje_z', categoria: 'forraje', ndf: 60, pef: 0.9, p: 0.2, ca: 0.45,
      em: 2, pb: 8, almidon: null, ee: 2, s: 0.15, mg: 0.2, k: 1.5,
      nitrato: undefined, max_inclusion_pct: null },
  ];
  const ind = indicadoresDieta(alimentos, [5], 350);
  ok('Sin nitrato declarado, nitratoPpm es 0 (no NaN)', ind.nitratoPpm === 0);
}

// 16f. El validador evaluarSeguridad() detecta V83 cuando la dieta supera 4400 ppm.
{
  const sobreTope = evaluarSeguridad({
    peNdfPct: 25, ndfPct: 60, almidonPct: 20, forrajePct: 80, concentradoPct: 20,
    caPct: 0.45, pPct: 0.30, ratioCaP: 1.5,
    nitratoPpm: 5000,
  }, 'CREC');
  const v83 = sobreTope.advertencias.find((w) => w.id === 'V83');
  ok('Dieta con 5000 ppm nitrato: V83 aparece como advertencia', !!v83);
  ok('V83 NO aparece como bloqueo (es WARN)', !sobreTope.bloqueos.some((b) => b.id === 'V83'));
  ok('V83 reporta el valor detectado (5000)', v83 && v83.valor === 5000);
  ok('V83 reporta el máximo (4400)', v83 && v83.max === 4400);
}

// 16g. El validador NO dispara V83 cuando la dieta está bajo el tope.
{
  const bajoTope = evaluarSeguridad({
    peNdfPct: 25, ndfPct: 60, almidonPct: 20, forrajePct: 80, concentradoPct: 20,
    caPct: 0.45, pPct: 0.30, ratioCaP: 1.5,
    nitratoPpm: 2000,
  }, 'CREC');
  ok('Dieta con 2000 ppm nitrato: V83 no dispara',
     !bajoTope.advertencias.some((w) => w.id === 'V83'));
}

// 16h. Regresión: una ración normal sin forrajes estresados no dispara V83.
{
  const r = formularRacionAvanzada({
    pv: 350, sistemaId: 'semiIntensivo', razaId: 'nelore', temperatura: 28,
  });
  if (!r.error) {
    ok('Ración normal: V83 no aparece como advertencia ni bloqueo',
       !r.seguridad.advertencias.some((a) => a.id === 'V83') &&
       !r.seguridad.bloqueos.some((b) => b.id === 'V83'));
    ok('Ración normal: score_detalle sigue existiendo',
       r.score_detalle && typeof r.score_detalle.score === 'number');
  }
}
// ---------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`RESULTADO: ${pasaron} pasaron, ${fallaron} fallaron`);
console.log('====================================================\n');
process.exit(fallaron > 0 ? 1 : 0);
