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
import { evaluarSeguridad } from '../src/engine/safety.js';
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

// 1 punto de TDN = 0.04409 Mcal de ED por kg de MS
cerca('ED de un alimento de 88 % TDN', deDesdeTdn(88), 3.88, 0.02, ' Mcal/kg');
// ME = 0.9455*DE - 0.3032  (BR-CORTE 2023, cap. 8)
cerca('EM a partir de esa ED', meDesdeDe(deDesdeTdn(88)), 3.366, 0.02, ' Mcal/kg');
// Maíz grano: ENm ≈ 2.24 y ENg ≈ 1.55 Mcal/kg en las tablas del NRC
cerca('ENm del maíz (EM 3.37)', nemDieta(3.366), 2.24, 0.15, ' Mcal/kg');
cerca('ENg del maíz (EM 3.37)', negDieta(3.366), 1.55, 0.15, ' Mcal/kg');
// Un forraje de 55 % TDN: ENm ≈ 1.15, ENg ≈ 0.58
const emForraje = meDesdeDe(deDesdeTdn(55));
cerca('ENm de un forraje de 55 % TDN', nemDieta(emForraje), 1.15, 0.12, ' Mcal/kg');
cerca('ENg de un forraje de 55 % TDN', negDieta(emForraje), 0.58, 0.12, ' Mcal/kg');

// ---------------------------------------------------------------------------
console.log('\n2. Requerimientos del animal (BR-CORTE 2023)');
// ---------------------------------------------------------------------------

const nelore400 = perfilAnimal({ pv: 400, razaId: 'nelore', sexo: 'macho_entero', entorno: 'confinamiento' });

// SBW = 0.8915 * BW^1.0151 y EBW = 0.8126 * SBW^1.0134
cerca('Peso vivo desbastado (SBW) de un Nelore de 400 kg', nelore400.sbw, 389, 3, ' kg');
cerca('Peso de cuerpo vacío (EBW)', nelore400.ebw, 346, 4, ' kg');

// ENm base = 0.075 * EBW^0.75  (BR-CORTE 2023, cap. 8).
// Sobre esa base el NRC 1996 aplica la aclimatación térmica: en el trópico
// (temperatura del mes previo por encima de 20 °C) el mantenimiento BAJA.
// Por eso se prueban las dos cosas por separado.
const mantNeutro = nemRequerido(nelore400, { tempActual: 20, tempPrevia: 20, jadeo: 'ninguno' });
cerca('ENm base en termoneutralidad', mantNeutro.nem, 0.075 * Math.pow(nelore400.ebw, 0.75), 0.15, ' Mcal/d');
const mantCalor = nemRequerido(nelore400, { tempActual: 25, tempPrevia: 25, jadeo: 'ninguno' });
ok(
  `Con 25 °C previos el mantenimiento baja respecto de 20 °C (${mantCalor.nem.toFixed(2)} vs ${mantNeutro.nem.toFixed(2)} Mcal/d)`,
  mantCalor.nem < mantNeutro.nem && mantCalor.nem > mantNeutro.nem * 0.9,
);

// Ejemplo resuelto de BR-CORTE 2016 cap. 9: Nelore entero de 400 kg con
// ganancia de 1.0 kg/d requiere Ca 21.67, P 14.66, Mg 7.65 y Na 9.31 g/d.
const min400 = mineralesRequeridos(nelore400, 1.0);
cerca('Calcio dietario (ejemplo resuelto BR-CORTE)', min400.ca.dietario, 21.67, 0.5, ' g/d');
cerca('Fósforo dietario (ejemplo resuelto BR-CORTE)', min400.p.dietario, 14.66, 0.5, ' g/d');
cerca('Magnesio dietario', min400.mg.dietario, 7.65, 0.5, ' g/d');
cerca('Sodio dietario', min400.na.dietario, 9.31, 0.5, ' g/d');

// La energía de ganancia tiene que crecer con la ganancia, y más que
// proporcionalmente (el exponente de EBG es mayor que 1).
const neg10 = negRequerido(nelore400, 1.0);
const neg15 = negRequerido(nelore400, 1.5);
const r10 = typeof neg10 === 'number' ? neg10 : neg10.neg;
const r15 = typeof neg15 === 'number' ? neg15 : neg15.neg;
ok('La ENg de ganancia crece más que proporcional a la GDP', r15 / r10 > 1.5, `relación ${(r15 / r10).toFixed(3)}`);

// ---------------------------------------------------------------------------
console.log('\n3. Consumo de materia seca');
// ---------------------------------------------------------------------------

// BR-CORTE, cebuinos: DMI = -2.1948 + 0.08338*BW^0.75 + 3.9328*ADG - 0.9030*ADG^2
const esperadoBrc = -2.1948 + 0.08338 * Math.pow(400, 0.75) + 3.9328 * 1.2 - 0.9030 * 1.44;
cerca('Consumo BR-CORTE, Nelore 400 kg, GDP 1.2', dmiBrCorte(nelore400, 1.2), esperadoBrc, 0.15, ' kg MS/d');

// NRC 1996: DMI = SBW^0.75 * (0.2435*NEm - 0.0466*NEm^2 - k) / NEm
// con k = 0.0869 para novillos "yearling" (SBW >= 300 kg) y 0.1128 para
// terneros en crecimiento. El de 400 kg entra como yearling.
const nem = 1.9;
const nrcYearling = (Math.pow(nelore400.sbw, 0.75) * (0.2435 * nem - 0.0466 * nem * nem - 0.0869)) / nem;
cerca('Consumo NRC 1996, novillo yearling, dieta de ENm 1.9', dmiNrc(nelore400, nem), nrcYearling, 0.2, ' kg MS/d');

const ternero = perfilAnimal({ pv: 200, razaId: 'nelore', sexo: 'macho_entero', entorno: 'confinamiento' });
const nrcTernero = (Math.pow(ternero.sbw, 0.75) * (0.2435 * nem - 0.0466 * nem * nem - 0.1128)) / nem;
cerca('Consumo NRC 1996, ternero de 200 kg, dieta de ENm 1.9', dmiNrc(ternero, nem), nrcTernero, 0.2, ' kg MS/d');

// El consumo tiene que estar en un rango fisiológico creíble: entre 1.5 y 3 %
// del peso vivo. Si se sale de ahí, hay algo mal.
const pctBrc = (dmiBrCorte(nelore400, 1.2) / 400) * 100;
ok(`Consumo entre 1.5 y 3 % del peso vivo (${pctBrc.toFixed(2)} %)`, pctBrc > 1.5 && pctBrc < 3.0);

// ---------------------------------------------------------------------------
console.log('\n4. Ecuación sumativa del NRC 2001 y corrección de TDN');
// ---------------------------------------------------------------------------

// Maíz grano por composición: PB 9.4, FDN 9.5, lignina 0.6, EE 4.2, cenizas 1.5
const tdnMaiz = tdnWeiss({ pb: 9.4, ndf: 9.5, lignina: 0.6, ee: 4.2, cenizas: 1.5, esForraje: false });
cerca('TDN del maíz por la sumativa', tdnMaiz, 88, 6, ' %');

// Un TDN estimado inverosímil tiene que quedar corregido hacia abajo.
const inverosimil = corregirTdnEstimado({
  id: 'prueba', categoria: 'forraje', tdn: 79, tdn_estimado: true,
  pb: 22.3, ndf: 49.7, adf: 34.8, ee: 4.2, cenizas: 10.0,
});
ok(
  `Un TDN estimado de 79 con 49.7 % de FDN se corrige (quedó en ${inverosimil.tdn})`,
  inverosimil.tdn < 70 && inverosimil.tdn_original === 79,
);

// Un TDN publicado NO se toca.
const publicado = corregirTdnEstimado({ id: 'x', categoria: 'energético', tdn: 88, tdn_estimado: false, pb: 9.4, ndf: 9.5, lignina: 0.6, ee: 4.2, cenizas: 1.5 });
ok('Un TDN publicado queda intacto', publicado.tdn === 88 && publicado.tdn_original === undefined);

// ---------------------------------------------------------------------------
console.log('\n5. Validador de seguridad');
// ---------------------------------------------------------------------------

// Dieta suicida: casi todo grano, sin fibra efectiva.
const suicida = evaluarSeguridad({
  peNdfPct: 2, ndfPct: 8, almidonPct: 65, forrajePct: 2, concentradoPct: 98,
  caPct: 0.1, pPct: 0.9, ratioCaP: 0.11, sPct: 0.6, ureaPct: 3,
}, 'TERM');
ok(`Una dieta de 98 % concentrado y 65 % almidón se bloquea (${suicida.bloqueos.length} bloqueos)`, suicida.bloqueos.length >= 4 && suicida.ok === false);

// Dieta razonable de terminación: no debería tener bloqueos.
const razonable = evaluarSeguridad({
  peNdfPct: 12, ndfPct: 25, almidonPct: 35, forrajePct: 20, concentradoPct: 80,
  caPct: 0.62, pPct: 0.31, ratioCaP: 2.0, sPct: 0.18, ureaPct: 0.8, mgPct: 0.2,
}, 'TERM');
ok(`Una dieta de terminación bien armada no se bloquea (${razonable.bloqueos.length} bloqueos)`, razonable.bloqueos.length === 0);

// Los valores que no se conocen (null) no se pueden inventar ni bloquear.
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

// Una dieta con un alimento en mal estado tiene que dar menos ganancia.
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
console.log('\n====================================================');
console.log(`RESULTADO: ${pasaron} pasaron, ${fallaron} fallaron`);
console.log('====================================================\n');
process.exit(fallaron > 0 ? 1 : 0);
