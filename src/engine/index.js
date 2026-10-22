 // src/engine/index.js
// API pública del motor de raciones de GanaBov.
//
// Reemplaza a src/utils/nutricion.js manteniendo EXACTAMENTE la misma firma y
// el mismo contrato de salida, para que la pantalla siga funcionando sin
// cambios.
//
// Diferencia de fondo con el motor viejo: acá la ganancia diaria NO se supone,
// se CALCULA. El flujo es:
//
//   1. Perfil del animal (BR-CORTE: PV -> PV vacío -> PV vacío equivalente).
//   2. Consumo de MS predicho por ecuación, no por "% del peso vivo".
//   3. Densidad de EM que hace falta para el objetivo, por bisección.
//   4. Balanceo por PROGRAMACIÓN LINEAL con todas las restricciones de
//      seguridad como filas del problema (no un bucle codicioso).
//   5. Predicción de desempeño por punto fijo consumo<->ganancia, partiendo
//      la energía entre mantenimiento (a densidad ENm) y ganancia (a ENg).
//   6. Validación de la ración terminada contra las mismas reglas con las que
//      se formuló, más la rampa de adaptación.
//
// Fuentes de las ecuaciones y de los límites: research/ecuaciones.md,
// research/seguridad.md y las URLs citadas en cada módulo.

import {
  SISTEMAS, FASES_FEEDLOT, CALIDAD, RATIO_CA_P, normalizarSexo, RAZAS_MAP,
} from './standards.js';
import { perfilAnimal, nemRequerido, negRequerido, mineralesRequeridos, mpRequerida } from './animal.js';
import { perfilEnergetico, meRequeridaParaObjetivo, corregirTdnEstimado } from './energy.js';
import { dmiPredicho } from './intake.js';
import { predecirDesempeno, mpAportada } from './predict.js';
import { evaluarSeguridad, scoreAcidosis, faseSeguridad, SEV } from './safety.js';
import {
  construirRestricciones, indicadoresDieta, msFraccion, esForraje, esConcentrado, numOrNull,
} from './constraints.js';
import { rampaAdaptacion } from './adaptation.js';
import { solveElasticLP } from './solver.js';
import { ALIMENTOS_BASE } from '../data/alimentosBase.js';

export { FASES_FEEDLOT, SISTEMAS, CALIDAD };

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/**
 * Alimentos habituales en Santa Cruz: se les da preferencia en modo "óptimo"
 * para que la ración sea sostenible en el tiempo. Es una decisión de
 * practicidad, NO un criterio nutricional. Los demás alimentos siguen
 * disponibles: si el precio los hace claramente convenientes, entran igual.
 */
const PRIORIDAD_LOCAL = {
  maiz_amarillo: 1.0, maiz_blanco: 1.0, sorgo_grano: 1.0, sorgo_rojo: 1.0,
  harina_soya: 1.0, expeller_soya: 1.0, soya_integral: 1.05,
  torta_girasol: 1.1, torta_algodon: 1.1, semilla_algodon: 1.1,
  salvado_trigo: 1.05, afrecho_arroz: 1.05, melaza_caña: 1.0,
  cascarilla_soya: 1.05, grano_destileria: 1.1, burlanda_maiz: 1.1,
  silo_maiz: 1.0, silo_sorgo: 1.0, yuca_seca: 1.1, cana_azucar: 1.0,
  sal_mineral: 1.0, carbonato_calcio: 1.0, fosfato_bicalcico: 1.0,
  sal_comun: 1.0, urea: 1.0, monensina: 1.0, bicarbonato: 1.0,
};

/**
 * Redondeo de los indicadores que se muestran en pantalla. La pantalla imprime
 * los números tal como vienen, así que sin esto se ve "7.234999999999998 kg".
 * Cada indicador se redondea a los decimales que tienen sentido para el dato:
 * los kilos y las Mcal a 2, los porcentajes a 1, los gramos y las plata a 0-2.
 */
const DECIMALES_INDICADOR = {
  ms_total_kg: 2, ms_pct_pv: 2, peNDF_pct: 1, fdn_pct: 1, fdn_forraje_pct: 1,
  almidon_pct: 1, forraje_pct: 1, concentrado_pct: 1,
  enm_aportada: 2, enm_requerida: 2, em_dieta_mcal_kg: 2,
  pb_aportada: 3, pb_requerida: 3, pb_pct: 1,
  pm_aportada_g: 0, pm_requerida_g: 0,
  ca_total_g: 1, p_total_g: 1, ca_requerida_g: 1, p_requerida_g: 1,
  ratio_ca_p: 2, costo_dia: 2, costo_kg_ganancia: 2, conversion: 2,
  score_acidosis: 0, cumplimiento_energia: 0, cumplimiento_proteina: 0,
  agua_litros_dia: 0,
};

function redondearIndicadores(ind) {
  const out = {};
  for (const [k, v] of Object.entries(ind)) {
    const d = DECIMALES_INDICADOR[k];
    out[k] = (d !== undefined && typeof v === 'number' && Number.isFinite(v))
      ? Number(v.toFixed(d))
      : v;
  }
  return out;
}

/**
 * Ficha de un aditivo con la dosis ya calculada para el consumo de este animal.
 * La pantalla muestra `dosisGramos`, `dosisPorKgMS` y `dosisMg`, así que se
 * calculan acá y no se deja que la pantalla adivine.
 */
function fichaAditivo({ id, nombre, funcion, dosisPorKgMS, dmi, url }) {
  const dosisMg = dosisPorKgMS * dmi;
  return {
    id,
    nombre,
    funcion,
    motivo: funcion, // alias: distintas pantallas usan un nombre o el otro
    dosisPorKgMS: Number(dosisPorKgMS.toFixed(1)),
    dosisMg: Number(dosisMg.toFixed(0)),
    dosisGramos: Number((dosisMg / 1000).toFixed(2)),
    url,
  };
}

const num = (x, d = 0) => {
  if (x === null || x === undefined || x === '') return d;
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
};

/** Aplica el deterioro por calidad a un alimento, sin tocar el original. */
function aplicarCalidad(a, estado) {
  const c = CALIDAD[estado] || CALIDAD['Óptimo'];
  if (c.dig === 1 && c.pb === 1) return { ...a, _calidad: estado || 'Óptimo', _factorConsumo: 1 };
  return {
    ...a,
    // La calidad baja la digestibilidad: eso se refleja en el TDN, y de ahí
    // caen ED, EM, ENm y ENg. No se toca la fibra: el forraje pasado tiene
    // MÁS fibra, no menos.
    tdn: a.tdn === null ? null : num(a.tdn) * c.dig,
    pb: a.pb === null ? null : num(a.pb) * c.pb,
    prot: a.pb === null ? null : num(a.pb) * c.pb,
    _calidad: estado || 'Óptimo',
    _factorConsumo: c.consumo,
  };
}

/** Objetivo de ganancia según sistema y fase, si el usuario no fijó uno. */
function objetivoGdp(sistemaId, fase, razaId = 'otro') {
  let base;
  if (fase && FASES_FEEDLOT[fase]) {
    base = FASES_FEEDLOT[fase].gdpEsperado;
  } else {
    const s = SISTEMAS[sistemaId] || SISTEMAS.semiIntensivo;
    base = (s.gdpRango[0] + s.gdpRango[1]) / 2;
  }
  const raza = RAZAS_MAP[razaId] || RAZAS_MAP.otro;
  return base * (raza.gdpFactor ?? 1.0);
}

// ---------------------------------------------------------------------------
// Requerimientos (compatibilidad con la API vieja)
// ---------------------------------------------------------------------------

/**
 * Requerimientos del animal. Reemplaza a calcularRequerimientosAvanzado().
 * A diferencia del viejo, la energía viene partida en mantenimiento y ganancia
 * y la proteína pasa por proteína metabolizable, no por un "PB total" inventado.
 */
export function calcularRequerimientosAvanzado(pv, sistemaId = 'semiIntensivo', opts = {}) {
  const {
    razaId = 'otro', sexo = 'novillo', fase = null, temperatura = 28,
    gdpObjetivo = null,
  } = opts;

  const s = SISTEMAS[sistemaId] || SISTEMAS.semiIntensivo;
  const animal = perfilAnimal({ pv, razaId, sexo: normalizarSexo(sexo), entorno: s.entorno });
  const adg = num(gdpObjetivo, objetivoGdp(sistemaId, fase));

  const mant = nemRequerido(animal, { tempActual: temperatura, tempPrevia: temperatura });
  const neg = negRequerido(animal, adg);
  const mp = mpRequerida(animal, adg, neg.re ?? neg.reMcal ?? null);
  const min = mineralesRequeridos(animal, adg);

  return {
    animal,
    gdpObjetivo: adg,
    enm_mantenimiento: mant.nem,
    eng_ganancia: neg.neg ?? neg,
    pm_requerida_g: mp.total,
    ca_g: min.ca.dietario,
    p_g: min.p.dietario,
    mg_g: min.mg.dietario,
    na_g: min.na.dietario,
    k_g: min.k.dietario,
    s_g: min.s.dietario,
    ratio_ca_p_objetivo: RATIO_CA_P,
  };
}

// ---------------------------------------------------------------------------
// Formulación
// ---------------------------------------------------------------------------

/**
 * Formula una ración balanceada y predice el desempeño.
 * Misma firma que la función del motor viejo.
 */
export function formularRacionAvanzada({
  pv,
  sistemaId,
  razaId = 'otro',
  alimentosDisponibles,
  preciosUsuario = {},
  estadosCalidad = {},
  modo = 'optimo',
  fase = null,
  alimentosSeleccionadosIds = null,
  temperatura = 28,
  sexo = 'novillo',
  gdpObjetivo = null,
}) {
  const explicaciones = [];
  const alertas = [];
  const alertasCalidad = [];

  // --- 0. Validación de entradas -------------------------------------------
  if (!(num(pv) > 0)) {
    return { error: 'Falta el peso vivo del animal.' };
  }
  const sistema = SISTEMAS[sistemaId] || SISTEMAS.semiIntensivo;
  const faseSeg = faseSeguridad(sistemaId, fase);
  // Ficha de la fase de feedlot elegida (inicio / desarrollo / terminación).
  const fichaFase = fase && FASES_FEEDLOT[fase] ? FASES_FEEDLOT[fase] : null;

  // --- 1. Universo de alimentos -------------------------------------------
  let base = Array.isArray(alimentosDisponibles) && alimentosDisponibles.length
    ? alimentosDisponibles
    : ALIMENTOS_BASE;

  if (Array.isArray(alimentosSeleccionadosIds) && alimentosSeleccionadosIds.length) {
    const set = new Set(alimentosSeleccionadosIds);
    base = base.filter((a) => set.has(a.id));
  }

  // Precio y calidad del usuario
  let alimentos = base.map((a) => {
    const conCalidad = aplicarCalidad(a, estadosCalidad[a.id]);
    const precio = num(preciosUsuario[a.id], num(a.precio_kg, null));
    return { ...conCalidad, precio_kg: precio };
  });

  // Avisos de calidad
  for (const a of alimentos) {
    const c = CALIDAD[a._calidad];
    if (c?.alerta) alertasCalidad.push({ id: a.id, nombre: a.nombre, calidad: a._calidad, msg: c.msg });
  }

  // Los alimentos sin energía conocida no pueden entrar al balanceo: sin TDN
  // el motor no sabe cuánta energía aportan y adivinar es justamente lo que
  // no queremos.
  // Los minerales y aditivos NO tienen TDN y no deben tenerlo: no aportan
  // energía. Se les asigna energía cero en lugar de descartarlos. Sin esto el
  // filtro de abajo se llevaba puestos el carbonato de calcio, el fosfato, la
  // sal mineral y la urea, y ninguna ración podía corregir el calcio ni la
  // relación Ca:P.
  const esMineralOAditivo = (a) => a.categoria === 'mineral';
  // Un alimento sin TDN tabulado solo se descarta si TAMPOCO se puede calcular
  // por la sumativa de Weiss. Weiss necesita al menos PB y FDN, y NO funciona
  // con grasas puras (más de 20 % de EE), donde la conversión de ácidos grasos
  // da un TDN físicamente imposible (>100 %).
  const puedeCalcularse = (a) =>
    numOrNull(a.ndf) !== null &&
    numOrNull(a.pb) !== null &&
    numOrNull(a.ee) !== null &&
    numOrNull(a.ee) < 20;
  const sinDatos = alimentos.filter(
    (a) => numOrNull(a.tdn) === null && !puedeCalcularse(a) && !esMineralOAditivo(a),
  );
  alimentos = alimentos.filter(
    (a) => numOrNull(a.tdn) !== null || puedeCalcularse(a) || esMineralOAditivo(a),
  );
  if (sinDatos.length) {
    alertas.push(
      `${sinDatos.length} alimento(s) quedaron fuera del balanceo porque la fuente no publica su energía (TDN) y tampoco tienen composición suficiente para calcularla: ` +
      `${sinDatos.map((a) => a.nombre).join(', ')}. Si tenés un análisis de laboratorio, cargalo y el motor los va a usar.`,
    );
  }
  // Alimentos prohibidos: se sacan del universo directamente.
  // OJO: hay que comprobar que el techo EXISTE antes de compararlo con 0,
  // porque en JavaScript Number(null) es 0 y un alimento sin techo quedaría
  // marcado como prohibido.
  const prohibido = (a) => numOrNull(a.max_inclusion_pct) === 0;
  const prohibidos = alimentos.filter(prohibido);
  if (prohibidos.length) {
    alimentos = alimentos.filter((a) => !prohibido(a));
    alertas.push(
      `Excluidos por prohibición legal: ${prohibidos.map((a) => a.nombre).join(', ')}. ` +
      'La proteína de origen mamífero no se puede dar a rumiantes (riesgo de encefalopatía espongiforme).',
    );
  }

  if (alimentos.length < 2) {
    return { error: 'Hacen falta al menos dos alimentos con datos de energía para poder balancear una ración.' };
  }
  if (!alimentos.some((a) => esForraje(a))) {
    return {
      error: 'No hay ningún forraje disponible. Una ración de engorde sin forraje provoca acidosis: elegí al menos un pasto, heno o silaje.',
    };
  }

  // Energía de cada alimento (ED, EM, ENm, ENg) a partir de su TDN.
  const ENERGIA_CERO = { valido: true, tdn: 0, de: 0, me: 0, nem: 0, neg: 0, mineral: true };
  alimentos = alimentos
    // Antes de calcular energía se corrigen los TDN estimados que no cierran
    // con la composición química. Prefiero que el motor sea conservador y
    // cumpla lo que promete, a que prometa 1,7 kg/día con números inflados.
    .map((a) => corregirTdnEstimado(a))
    .map((a) => ({
      ...a,
      // Solo los minerales reciben energía cero: no aportan energía y no
      // tienen por qué pasar por la sumativa. Todos los demás van a
      // perfilEnergetico, que usa el TDN tabulado si existe y Weiss si no.
      // Si Weiss no puede calcular (le falta composición), devuelve
      // `valido: false` y el filtro siguiente lo saca del balanceo.
      energia: esMineralOAditivo(a) ? ENERGIA_CERO : perfilEnergetico(a),
    }))
    .filter((a) => a.energia?.valido)
    .map((a) => ({ ...a, em: a.energia.me }));

  // --- 2. Animal y objetivo ------------------------------------------------
  const animal = perfilAnimal({
    pv: num(pv), razaId, sexo: normalizarSexo(sexo), entorno: sistema.entorno,
  });
  // Si el usuario ingresó una GDP manual (gdpObjetivo), se respeta tal cual.
  // Si está vacío, el motor usa el default del sistema ajustado por raza (gdpFactor).
  const adgObjetivo = num(gdpObjetivo, objetivoGdp(sistemaId, fase, razaId));
  explicaciones.push(
    `Animal de ${num(pv)} kg, ${animal.fichaRaza?.nombre || razaId}, en sistema ${sistema.nombre}. ` +
    `Objetivo de ganancia: ${adgObjetivo.toFixed(2)} kg/día.`,
  );

  const tieneIonoforo = alimentos.some((a) => a.id === 'monensina');
  const monensinaMgKg = tieneIonoforo ? sistema.monensinaMgKg : 0;

  // --- 3. Consumo esperado -------------------------------------------------
  // Primero con una densidad energética tentativa del sistema; después de
  // resolver la mezcla se recalcula todo con la densidad real.
  const factorCalidadConsumo = alimentos.reduce(
    (m, a) => Math.min(m, num(a._factorConsumo, 1)), 1,
  );
  const nemTentativo = sistemaId === 'feedlot' ? 1.9 : sistemaId === 'semiIntensivo' ? 1.5 : 1.15;
  const consumo0 = dmiPredicho(animal, adgObjetivo, {
    sistemaId, nemDieta: nemTentativo, temperatura,
    tieneIonoforo, monensinaMgKg, factorCalidadConsumo,
  });
  const dmi = consumo0.dmi;
  explicaciones.push(
    `Consumo de materia seca predicho: ${dmi.toFixed(2)} kg/día ` +
    `(${consumo0.dmiPctPv.toFixed(2)} % del peso vivo). No es un porcentaje fijo: sale de la ecuación de consumo ` +
    'de BR-CORTE para cebuinos, corregida por temperatura, ionóforo y calidad del alimento.',
  );

  // --- 4. Requerimientos a cubrir con esa MS -------------------------------
  const mant = nemRequerido(animal, { tempActual: temperatura, tempPrevia: temperatura });
  const negObj = negRequerido(animal, adgObjetivo);
  const negMcal = num(negObj.neg, num(negObj, 0));
  const emReq = meRequeridaParaObjetivo({ dmi, nemReq: mant.nem, negReq: negMcal });

  if (!emReq.alcanzable) {
    alertas.push(
      `Con ${dmi.toFixed(2)} kg de MS por día no se llega a ${adgObjetivo.toFixed(2)} kg/día ni con la dieta más densa que se puede armar sin enfermar al animal. ` +
      'El motor va a formular la mejor ración posible y te va a decir la ganancia real que se puede esperar.',
    );
  }


  const mp = mpRequerida(animal, adgObjetivo, negObj.re ?? null);
  const minReq = mineralesRequeridos(animal, adgObjetivo);

  // De proteína metabolizable a proteína bruta de la dieta: se busca la PB que
  // con el TDN de esta dieta genera la PM requerida (proteína microbiana +
  // sobrepaso). Se resuelve numéricamente porque la ecuación de PB microbiana
  // es cuadrática en el consumo de TDN.
  const tdniKg = (dmi * (emReq.me > 0 ? ((emReq.me + 0.3032) / 0.9455) / 4.409 : 0.6));
  const pbRequeridaKg = resolverPbParaMp(mp.total, dmi, tdniKg);
  const pdrRequeridaKg = num(mpAportada(pbRequeridaKg, tdniKg).mcp, 0) / 1000;

  explicaciones.push(
    `Requerimientos a cubrir: ${(mant.nem + negMcal).toFixed(2)} Mcal de energía neta, ` +
    `${mp.total.toFixed(0)} g de proteína metabolizable, ${minReq.ca.dietario.toFixed(1)} g de calcio y ` +
    `${minReq.p.dietario.toFixed(1)} g de fósforo por día.`,
  );

  // --- 5. Balanceo lineal --------------------------------------------------
  // Costo: en modo económico se minimiza plata; en los demás se minimiza el
  // costo pero penalizando el exceso de concentrado, que es lo que enferma.
  // OJO con los precios: los de la base son de referencia y probablemente no
  // sean los de tu zona. Un balanceo de mínimo costo es tan bueno como los
  // precios que le das, así que cargar los precios reales en la pantalla
  // cambia (y mejora) el resultado.
  const costo = alimentos.map((a) => {
    const precioMs = num(a.precio_kg, 1) / Math.max(msFraccion(a), 0.05);
    if (modo === 'economico') return precioMs;
    // En modo óptimo se penalizan los alimentos poco habituales en la zona:
    // no por nutrición, sino porque una ración que depende de un ingrediente
    // difícil de conseguir no se puede sostener 90 días. Es un criterio de
    // practicidad, no una norma.
    return precioMs * (esForraje(a) ? 1.0 : 1.05) * (PRIORIDAD_LOCAL[a.id] ?? 1.6);
  });

  // Dos pasadas: la primera para conocer la FDN de forraje (el techo de almidón
  // de NASEM depende de ella), la segunda con ese techo ya aplicado.
  let x = null, solucion = null, indic = null;
  let contexto = { fndfPct: 15 };
  for (let pasada = 0; pasada < 2; pasada++) {
       const { rows } = construirRestricciones({
      alimentos, dmi, pv: num(pv), fase: faseSeg,
      sistemaId,
      emRequerida: emReq.me * dmi,
      pbRequeridaKg, pdrRequeridaKg,
      caRequeridaG: minReq.ca.dietario,
      pRequeridaG: minReq.p.dietario,
      contexto,
    });

    // Techo de concentrado del propio sistema y de la fase.
    // Las reglas de seguridad publicadas permiten hasta 90 % de concentrado,
    // pero el sistema que eligió el usuario y la fase en la que está el animal
    // son más exigentes: en "desarrollo" la dieta va al 72 % de concentrado, no
    // al 90 %. Sin esta fila el balanceador respetaba la norma general y se
    // pasaba por arriba del plan de alimentación elegido.
        let topeConcPct = Math.min(
      num(fichaFase?.concentradoMaxPct, sistema.concentradoMaxPct),
      num(sistema.concentradoMaxPct, 90),
    );
    // En semi-intensivo, el techo de 60% es duro. Sin margen extra.
    if (sistemaId === 'semiIntensivo') topeConcPct = 60;
    if (topeConcPct > 0) {
      // 5 puntos de tolerancia: el techo de la fase es una guía de manejo, no un
      // límite fisiológico, y no vale la pena volver infactible el problema por
      // uno o dos puntos de concentrado.
      rows.push({
        coef: alimentos.map((a) => (esConcentrado(a) ? 1 : 0)),
        op: '<=', rhs: (Math.min(topeConcPct, 92) / 100) * dmi,
        elastic: true, penalty: 3000,
        name: `concentrado <= ${topeConcPct + 5}% MS (sistema ${sistema.nombre}${fichaFase ? ', fase ' + fichaFase.nombre : ''})`,
      });
    }

    solucion = solveElasticLP({ cost: costo, rows });
    if (solucion.status !== 'optimal' && solucion.status !== 'ok') break;
    x = solucion.x.slice(0, alimentos.length);
    indic = indicadoresDieta(alimentos, x, num(pv));
    contexto = { ...indic };
  }

  if (!x) {
    return {
      error: 'No se pudo balancear una ración segura con los alimentos elegidos. ' +
        'Probá agregar un forraje de mejor calidad o una fuente proteica.',
      detalle: solucion?.status,
    };
  }

  // Faltantes que el solver no pudo cubrir: se informan como deficiencias
  // concretas en vez de un "infactible" sin explicación.
      const deficiencias = (solucion.violations || [])
    // Filtramos el ruido numérico del solver (menos de 5 gramos, 0.005 kg, 0.005 Mcal).
    // Así evitamos mostrar "Falta PDR: 0.00 kg".
    .filter((v) => Math.abs(v.amount) > 0.005) 
    .map((v) => ({
      nutriente: v.name,
      faltante: v.amount,
      mensaje: mensajeDeficiencia(v),
    }));

  // --- 6. Predicción de desempeño con la ración REAL -----------------------
  // Se descartan las cantidades que en la práctica no se pueden pesar: menos
  // de 5 gramos de alimento tal cual por animal y día. Antes quedaban en la
  // lista y la pantalla las mostraba como "0.00 kg", que no le sirve a nadie.
  const racionItems = alimentos.map((a, i) => ({
    ...a, kgMs: x[i], energia: a.energia,
    // Filtramos cualquier ingrediente que pese menos de 100 gramos/día
  })).filter((it) => it.kgMs > 0.001 && it.kgMs / Math.max(msFraccion(it), 0.05) >= 0.10);

  const pred = predecirDesempeno({
    pv: num(pv), razaId, sexo: normalizarSexo(sexo), sistemaId,
    racion: racionItems,
    ambiente: { temperatura, factorCalidadConsumo },
    tieneIonoforo, monensinaMgKg,
  });

  if (pred.error) return { error: pred.msg };

  // --- 7. Validación de seguridad de la ración terminada -------------------
  const indicFinal = indicadoresDieta(alimentos, x, num(pv));
  // sistemaId es obligatorio: sin él, V93b (mínimo operativo de fósforo) no
  // se puede resolver contra pMinVigente() y evaluarSeguridad devuelve un
  // aviso en `avisosConfiguracion`, que más abajo se propaga a la pantalla.
  const seguridad = evaluarSeguridad(
    { ...indicFinal, ...contextoExtra(racionItems, indicFinal, monensinaMgKg) },
    faseSeg,
    { sistemaId },
  );
  const score = scoreAcidosis({
  peNdfPct: indicFinal.peNdfPct,
  almidonPct: indicFinal.almidonPct,
  forrajePct: indicFinal.forrajePct,
  // Azúcares solubles en % de la MS. Ya se calculan en indicadoresDieta().
  // El score de acidosis usa este dato para el componente azucares.
  azucaresPct: indicFinal.azucaresPct .
    tieneIonoforo,
    fase: faseSeg,
    // sistemaId es el fix principal: sin él, scoreAcidosis() caía por
    // default en 'feedlot' y usaba minPeNdf=8 / minForraje=5 incluso en
    // semiIntensivo y pastoril, subestimando el riesgo de acidosis.
    sistemaId,
    almidonDesconocido: (indicFinal.almidonCiegoPct ?? 0) > 10,
  });

  for (const b of seguridad.bloqueos) alertas.push(`PELIGRO — ${b.nombre}: ${b.mensaje}`);
  for (const w of seguridad.advertencias) alertas.push(`Atención — ${w.nombre}: ${w.mensaje}`);
  // Avisos de configuración del validador. Hoy el único caso posible es que
  // V93b no haya podido resolver su mínimo por falta de sistemaId, pero el
  // canal queda abierto para futuras reglas que dependan de contexto. Sin
  // este loop el diagnóstico se perdía: ni la pantalla ni el usuario se
  // enteraban de que una regla no se había evaluado.
  if (Array.isArray(seguridad.avisosConfiguracion)) {
    for (const m of seguridad.avisosConfiguracion) {
      alertas.push(`Configuración — ${m}`);
    }
  }
  alertas.push(...pred.avisos);

  if (indicFinal.almidonCiegoPct > 10) {
    alertas.push(
      `El ${indicFinal.almidonCiegoPct.toFixed(0)} % de la materia seca viene de concentrados cuya fuente no declara almidón. ` +
      'El semáforo de acidosis está subestimando el riesgo en esa parte de la dieta: tratala como más riesgosa de lo que dice el número.',
    );
  }

  // --- 8. Rampa de adaptación ---------------------------------------------
  const rampa = rampaAdaptacion({ concentradoFinalPct: indicFinal.concentradoPct });
  if (indicFinal.concentradoPct > 45) {
    alertas.push(
      `Esta ración tiene ${indicFinal.concentradoPct.toFixed(0)} % de concentrado. NO se la des de un día para el otro: ` +
      `hay que llegar en ${rampa.diasTotales} días con ${rampa.escalones.length} escalones.`,
    );
  }

  // --- 9. Salida en el contrato que espera la pantalla --------------------
  // Los kilos se redondean a 2 decimales: la pantalla los imprime tal como
  // vienen y nadie pesa 4,347209950440732 kg de silaje.
  const r2 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Number(x.toFixed(2)) : x);
  const r3 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Number(x.toFixed(3)) : x);
  const rPeso = (x) => (Number.isFinite(x) && Math.abs(x) < 1 ? r3(x) : r2(x));

  const racion = racionItems.map((it) => ({
    id: it.id,
    nombre: it.nombre,
    categoria: it.categoria,
    // Los minerales van en gramos: si el ingrediente pesa menos de 1 kg se
    // muestran 3 decimales para que no se vea "0.00 kg".
    kg_dia: rPeso(it.kgMs / Math.max(msFraccion(it), 0.05)), // tal cual, como se pesa
    kg_ms_dia: r3(it.kgMs),
    ms_kg: r3(it.kgMs),
    pct_ms_dieta: r2((it.kgMs / dmi) * 100),
    enm_kg: r3(num(it.energia?.nem, null)),
    pb_kg: r3((it.kgMs * num(it.pb)) / 100),
    precio_total: r2((it.kgMs / Math.max(msFraccion(it), 0.05)) * num(it.precio_kg, 0)),
    calidad: it._calidad,
    fuente: it.fuente,
    url: it.url,
  }));

  const costoDia = racion.reduce((s, r) => s + num(r.precio_total), 0);

  const aditivosRecomendados = [];
  if (!tieneIonoforo && (sistemaId === 'feedlot' || sistemaId === 'semiIntensivo')) {
    const mgPorKgMs = num(sistema.monensinaMgKg, 25);
    aditivosRecomendados.push(fichaAditivo({
      id: 'monensina',
      nombre: 'Monensina (ionóforo)',
      funcion: 'Mejora la eficiencia energética alrededor de 12 % y baja el riesgo de acidosis.',
      dosisPorKgMS: mgPorKgMs,
      dmi,
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    }));
  }
  if (indicFinal.concentradoPct > 70) {
    aditivosRecomendados.push(fichaAditivo({
      id: 'bicarbonato',
      nombre: 'Bicarbonato de sodio',
      funcion: 'Dieta muy concentrada: un buffer al 1 % de la materia seca ayuda a sostener el pH del rumen.',
      dosisPorKgMS: 10000, // 1 % de la MS expresado en mg por kg de MS
      dmi,
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    }));
  }

  return {
    error: null,

    // --- LA PREDICCIÓN: calculada, no supuesta ---
    gdp_estimada: r2(pred.adg),
    gdp_objetivo: r2(adgObjetivo),
    gdp_limitada_por: pred.limitante,
    gdp_por_energia: r2(pred.adgEnergia),
    gdp_por_proteina: r2(pred.adgProteina),

    racion,
    aditivosRecomendados,
    // Alias msg / mensaje: la pantalla vieja lee `.msg` en las deficiencias y
    // `.mensaje` en las alertas de calidad. Se mandan los dos nombres para que
    // ninguna pantalla quede mostrando un cuadro vacío.
    alertasCalidad: alertasCalidad.map((a) => ({ ...a, mensaje: a.mensaje ?? a.msg })),
    deficiencias: deficiencias.map((d) => ({ ...d, msg: d.msg ?? d.mensaje })),
    alertas,
    explicaciones,

    indicadores: redondearIndicadores({
      ms_total_kg: indicFinal.msTotal,
      ms_pct_pv: indicFinal.msPctPv,
      peNDF_pct: indicFinal.peNdfPct,
      fdn_pct: indicFinal.ndfPct,
      fdn_forraje_pct: indicFinal.fndfPct,
      almidon_pct: indicFinal.almidonPct,
      forraje_pct: indicFinal.forrajePct,
      concentrado_pct: indicFinal.concentradoPct,
      enm_aportada: pred.densidad.nem * pred.dmi,
      enm_requerida: mant.nem + negMcal,
      em_dieta_mcal_kg: pred.densidad.me,
      pb_aportada: (racionItems.reduce((s, it) => s + it.kgMs * num(it.pb), 0) / 100),
      pb_requerida: pbRequeridaKg,
      pb_pct: (racionItems.reduce((s, it) => s + it.kgMs * num(it.pb), 0) / dmi),
      pm_aportada_g: pred.proteina?.mpi ?? null,
      pm_requerida_g: mp.total,
      ca_total_g: (indicFinal.caPct / 100) * indicFinal.msTotal * 1000,
      p_total_g: (indicFinal.pPct / 100) * indicFinal.msTotal * 1000,
      ca_requerida_g: minReq.ca.dietario,
      p_requerida_g: minReq.p.dietario,
      ratio_ca_p: indicFinal.ratioCaP,
      costo_dia: costoDia,
      costo_kg_ganancia: pred.adg > 0.01 ? costoDia / pred.adg : null,
      conversion: pred.conversion,
      riesgo_acidosis: score.nivel ?? score.riesgo ?? null,
      score_acidosis: score.score ?? score,
            // Calcula el porcentaje real sobre la ENm total aportada vs requerida
      cumplimiento_energia: (mant.nem + negMcal) > 0 
        ? ((pred.densidad.nem * pred.dmi) / (mant.nem + negMcal)) * 100 
        : null,
      cumplimiento_proteina: pbRequeridaKg > 0
        ? ((racionItems.reduce((s, it) => s + it.kgMs * num(it.pb), 0) / 100) / pbRequeridaKg) * 100
        : null,
      agua_litros_dia: pred.agua?.litros ?? null,
    }),

    // --- Extras nuevos ---
    seguridad,
    adaptacion: rampa,
    prediccion: pred,
    animal,
    // Canal explícito para que la pantalla vea, sin bucear en `seguridad`,
    // qué reglas no pudieron evaluarse por falta de contexto. Hoy el único
    // caso posible es V93b sin sistemaId; el array viene siempre presente
    // (vacío si todo se evaluó bien).
    avisosConfiguracion: seguridad.avisosConfiguracion || [],
    // Detalle completo del score de acidosis: número, nivel, los dos umbrales
    // que dependen del sistema (minPeNdf, minForraje) y los componentes.
    // Se expone tal cual lo devuelve scoreAcidosis(), sin redondear, para que
    // los tests puedan verificar que sistemaId llegó bien.
    score_detalle: score,
  };
}

// ---------------------------------------------------------------------------
// Auxiliares
// ---------------------------------------------------------------------------

/**
 * Busca la PB de la dieta (kg/día) que produce la PM requerida.
 * La PB microbiana depende del consumo de PB y de TDN de forma cuadrática, así
 * que se resuelve por bisección en lugar de despejar.
 */
function resolverPbParaMp(mpRequeridaG, dmi, tdniKg) {
  const pmDe = (pbKg) => num(mpAportada(pbKg, tdniKg).mpi, 0);
  let lo = 0.01, hi = dmi * 0.30; // hasta 30 % de PB en la MS
  if (pmDe(hi) < mpRequeridaG) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (pmDe(mid) < mpRequeridaG) lo = mid; else hi = mid;
  }
  return hi;
}

/** Campos de la dieta que las reglas necesitan y no salen del LP. */
function contextoExtra(racionItems, indic, monensinaMgKg) {
  const ms = indic.msTotal || 1;
  const monensina = racionItems.find((it) => it.id === 'monensina');
  return {
    monensinaMgCab: monensina ? monensinaMgKg * ms : null,
    // El picado y las vitaminas los carga el usuario; sin dato la regla no
    // se evalúa (evaluarSeguridad ignora null en vez de inventar).
    picadoMm: null,
    vitAUiKg: null,
    diasAdaptacion: null,
  };
}

function mensajeDeficiencia(v) {
  const n = v.name || '';
  if (n.startsWith('EM')) {
    return `Falta energía: la dieta queda ${num(v.amount).toFixed(1)} Mcal/día por debajo de lo necesario. ` +
      'Con los alimentos elegidos no se llega al objetivo. Hace falta un energético más denso (grano, melaza) o mejor forraje.';
  }
  if (n.startsWith('PB')) {
    return `Falta proteína: ${num(v.amount).toFixed(2)} kg/día. Agregá una fuente proteica (torta de soya, girasol) o urea dentro del 1 % de la MS.`;
  }
  if (n.startsWith('PDR')) {
    return `Falta proteína degradable en rumen: ${num(v.amount).toFixed(2)} kg/día. Los microbios se quedan cortos y la fibra se digiere peor.`;
  }
  if (n.startsWith('Ca')) {
    return `Falta calcio: ${num(v.amount).toFixed(1)} g/día. Sin calcio el animal no deposita hueso y aparecen problemas de aplomos. Agregá carbonato de calcio o una sal mineral.`;
  }
  if (n.startsWith('pPct')) {
    const gramos = num(v.amount) * 1000;
    return `Falta fósforo: ${gramos.toFixed(1)} g/día para llegar al mínimo del sistema. Agregá fosfato bicálcico o una sal mineral con fósforo.`;
  }
  if (n.startsWith('P ')) {
    return `Falta fósforo: ${num(v.amount).toFixed(1)} g/día. Agregá fosfato bicálcico o una sal mineral con fósforo.`;
  }
  return `No se pudo cumplir la restricción "${n}" (faltan ${num(v.amount).toFixed(3)}).`;
}

export default { formularRacionAvanzada, calcularRequerimientosAvanzado, FASES_FEEDLOT };