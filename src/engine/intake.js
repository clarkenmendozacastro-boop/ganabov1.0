// src/engine/intake.js
// ============================================================================
// GANABOV — MOTOR NUTRICIONAL v2
// CONSUMO DE MATERIA SECA (DMI).
//
// El consumo es la variable que manda sobre todo lo demás: si el consumo
// estimado está mal, la ganancia predicha está mal, sin importar lo buena que
// sea la dieta. El motor viejo usaba un % fijo del peso vivo (2.8 % en feedlot)
// y por eso las ganancias nunca coincidían con la realidad.
//
// Base: ecuaciones BR-CORTE 2023 cap. 2 (calibradas con Nelore y cruzas
// brasileñas, lo más cercano al ganado de Santa Cruz), corregidas por los
// multiplicadores de clima y barro del NRC 1996 Tabla 10-4, que BR-CORTE no
// publica y que en el trópico son decisivos:
//   >35 °C sin enfriamiento nocturno  -> TEMP1 = 0.65  (35 % menos consumo)
//   barro de 30–60 cm                 -> MUD1  = 0.70
//
// OJO CON LA CIRCULARIDAD: las ecuaciones BR-CORTE de DMI toman la ADG como
// ENTRADA. Usar la ADG objetivo como si fuera la predicha vuelve el modelo
// tautológico (era el defecto nº 9 del motor viejo). La solución está en
// predict.js: punto fijo hasta que ADG converge.
// ============================================================================

import {
  DMI_BRCORTE_CONFINAMIENTO, DMI_BRCORTE_PASTOREO,
  TECHO_DMI_PCT_PV, GRUPO,
  temp1, MUD1, bfaf, IONOFORO,
} from './standards.js';
import { factorConsumoMonensina } from './energy.js';

/**
 * DMI base por BR-CORTE 2023, kg/d.
 * Confinamiento: DMI = i + a*BW^0.75 + b*ADG + c*ADG^2   [BRC23 Eq. 2.1–2.3]
 * Pastoreo:      DMI = i + s*DMIsupl + a*BW^0.75 + b*ADG + c*ADG^2  [Eq. 2.6–2.7]
 *
 * @param {object} animal  salida de perfilAnimal()
 * @param {number} adg     ganancia esperada, kg/d (entrada de la ecuación)
 * @param {number} dmiSuplemento  kg MS/d de suplemento, solo en pastoreo
 */
export function dmiBrCorte(animal, adg, dmiSuplemento = 0) {
  const bw075 = Math.pow(animal.bw, 0.75);
  const g = Math.max(adg, 0);

  if (animal.entorno === 'pastoreo') {
    const c = DMI_BRCORTE_PASTOREO[animal.grupo] || DMI_BRCORTE_PASTOREO[GRUPO.ZEBU];
    return c.i + c.s * dmiSuplemento + c.a * bw075 + c.b * g + c.c * g * g;
  }

  const c = DMI_BRCORTE_CONFINAMIENTO[animal.grupo] || DMI_BRCORTE_CONFINAMIENTO[GRUPO.ZEBU];
  return c.i + c.a * bw075 + c.b * g + c.c * g * g;
}

/**
 * DMI por NRC 1996, usado como control cruzado.
 * DMI = SBW^0.75 * (0.2435*NEm - 0.0466*NEm^2 - k) / NEm
 *   k = 0.1128 para terneros en crecimiento, 0.0869 para novillos "yearling"
 * OJO: acá "NEm" es la CONCENTRACIÓN de NEm de la dieta (Mcal/kg MS), no el
 * requerimiento del animal en Mcal/d. Confundirlos es el error nº 3.
 * Si la NEm de la dieta es < 1.0, se usa 0.95 como divisor. [NRC96]
 */
export function dmiNrc(animal, nemDietaMcalKg, esYearling = null) {
  const yearling = esYearling !== null ? esYearling : animal.sbw >= 300;
  const k = yearling ? 0.0869 : 0.1128;
  const ne = nemDietaMcalKg;
  const divisor = ne < 1.0 ? 0.95 : ne;
  const numerador = 0.2435 * ne - 0.0466 * ne * ne - k;
  return (animal.sbw075 * numerador) / divisor;
}

/**
 * Multiplicadores de ajuste del consumo. [NRC96 Tabla 10-4]
 *
 * @param {object} animal
 * @param {object} opts
 * @param {number} opts.temperatura           °C actual
 * @param {boolean} opts.enfriamientoNocturno  si el corral se enfría de noche
 * @param {string} opts.barro                 'sin_barro' | 'leve' | 'severo'
 * @param {boolean} opts.tieneIonoforo
 * @param {number} opts.monensinaMgKg
 * @param {object} opts.factorCalidadConsumo  castigo por conservación del alimento
 */
export function multiplicadoresDmi(animal, opts = {}) {
  const {
    temperatura = 28,
    enfriamientoNocturno = false,
    barro = 'sin_barro',
    tieneIonoforo = false,
    monensinaMgKg = 0,
    factorCalidadConsumo = 1.0,
  } = opts;

  // Ajuste por calor. OJO con el doble descuento: la ecuación de BR-CORTE se
  // calibró con cebú en Brasil, o sea con animales que YA estaban comiendo a
  // 28-32 °C. Descontarles otra vez por temperatura es castigarlos dos veces y
  // por eso el motor predecía consumos de 1,4 % del peso vivo, imposibles en un
  // corral real. En cebú (Bos indicus) el descuento del NRC se aplica solo por
  // encima de 32 °C, que es donde el estrés calórico deja de estar cubierto por
  // la calibración tropical.
  const esCebu = (animal.raza?.bi ?? 1) >= 1 || animal.raza?.tipo === 'cebuino';
  const fTemp = esCebu && temperatura <= 32
    ? 1.0
    : temp1(temperatura, enfriamientoNocturno);
  const fBarro = MUD1[barro] ?? 1.0;
  const fBfaf = bfaf(animal.eqebw / 0.891); // BFAF está tabulado sobre EQSBW
  const fRaza = animal.raza.bi ?? 1.0;

  // Ionóforo: -4 % sobre el consumo. Si además se conoce la dosis de monensina
  // se usa el descuento por dosis, que es más específico, en vez de duplicar.
  let fAditivo = 1.0;
  if (monensinaMgKg > 0) fAditivo = factorConsumoMonensina(monensinaMgKg);
  else if (tieneIonoforo) fAditivo = IONOFORO.consumo;

  const total = fTemp * fBarro * fBfaf * fRaza * fAditivo * factorCalidadConsumo;

  return {
    total,
    detalle: {
      temperatura: fTemp,
      barro: fBarro,
      grasaCorporal: fBfaf,
      raza: fRaza,
      aditivo: fAditivo,
      calidadAlimento: factorCalidadConsumo,
    },
  };
}

/**
 * Consumo predicho final, con multiplicadores y techo por % del peso vivo.
 *
 * El techo evita que el modelo prediga consumos fisiológicamente imposibles.
 * Además, las ecuaciones vigentes sobreestiman el consumo por encima de
 * 500 kg SBW en terminación tardía, así que ahí se aplica una corrección extra.
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/
 *
 * @returns {{dmi:number, dmiBase:number, dmiPctPv:number, multiplicadores:object,
 *           topeAplicado:boolean, avisos:string[]}}
 */
export function dmiPredicho(animal, adg, opts = {}) {
  const {
    sistemaId = 'semiIntensivo',
    dmiSuplemento = 0,
    nemDieta = null,
  } = opts;

  const avisos = [];
  const dmiBrc = dmiBrCorte(animal, adg, dmiSuplemento);

  // Qué ecuación manda según el sistema:
  //
  // La de BR-CORTE depende de la ganancia (GDP). En confinamiento eso genera un
  // círculo vicioso: si la dieta rinde poco, el modelo predice menos ganancia,
  // con menos ganancia predice menos consumo, con menos consumo predice todavía
  // menos ganancia, y termina en un consumo de 1,4 % del peso vivo que ningún
  // novillo en corral tiene. El animal no come menos porque esté ganando poco:
  // come según su tamaño y la densidad energética de la dieta.
  //
  // Por eso en corral (feedlot y semiintensivo) manda la ecuación del NRC 1996,
  // que depende del peso y de la ENm de la dieta y NO de la ganancia. A pastoreo
  // manda BR-CORTE, que es la calibrada para cebú en pastura tropical.
  // La otra queda siempre como control cruzado.
  const enCorral = sistemaId === 'feedlot' || sistemaId === 'semiIntensivo';
  let dmiBase = dmiBrc;
  let ecuacion = 'BR-CORTE (cebú, depende de la GDP objetivo)';

  // Control cruzado con NRC cuando se conoce la densidad de la dieta
  let dmiNrcVal = null;
  if (Number.isFinite(nemDieta) && nemDieta > 0) {
    dmiNrcVal = dmiNrc(animal, nemDieta);
    if (enCorral && dmiNrcVal > 0) {
      // En corral se promedian las dos referencias. La del NRC responde a la
      // densidad de la dieta (que es lo que de verdad regula el consumo en
      // confinamiento) y la de BR-CORTE está calibrada en cebú. Ninguna de las
      // dos es "la" verdad: el promedio queda entre ambas y el aviso de abajo
      // te dice cuándo difieren tanto que conviene pesar el comedero.
      dmiBase = (dmiNrcVal + dmiBrc) / 2;
      ecuacion = `promedio NRC 1996 (${dmiNrcVal.toFixed(1)} kg) y BR-CORTE (${dmiBrc.toFixed(1)} kg)`;
    }
    // Si las dos predicciones difieren más de 25 %, se avisa: es señal de que
    // el animal está fuera del rango de calibración de alguna de las dos.
    if (dmiNrcVal > 0 && Math.abs(dmiBrc - dmiNrcVal) / dmiNrcVal > 0.25) {
      avisos.push(
        `Las dos referencias de consumo difieren (BR-CORTE ${dmiBrc.toFixed(1)} kg vs NRC ${dmiNrcVal.toFixed(1)} kg MS/d). ` +
        `Conviene pesar el comedero unos días y ajustar.`
      );
    }
  }

  const mult = multiplicadoresDmi(animal, opts);
  let dmi = dmiBase * mult.total;

  // Sobreestimación conocida en terminación tardía
  if (animal.sbw > 500) {
    const correccion = 1 - Math.min((animal.sbw - 500) / 500, 0.10);
    dmi *= correccion;
    avisos.push(
      'Animal por encima de 500 kg desbastado: las ecuaciones publicadas sobreestiman el consumo en terminación tardía, se aplicó una corrección a la baja.'
    );
  }

  // Techo por % del peso vivo
  const pctTecho = TECHO_DMI_PCT_PV[sistemaId] ?? 0.028;
  const techo = animal.bw * pctTecho;
  let topeAplicado = false;
  if (dmi > techo) {
    dmi = techo;
    topeAplicado = true;
  }

  // Piso: por debajo del 1 % del peso vivo el animal no sobrevive; si el
  // modelo llega ahí es porque el clima o el barro son extremos.
  const piso = animal.bw * 0.010;
  if (dmi < piso) {
    dmi = piso;
    avisos.push('Consumo estimado muy bajo por las condiciones ambientales declaradas. Revisar sombra, agua y limpieza del corral antes de confiar en la ganancia proyectada.');
  }

  if (mult.detalle.temperatura <= 0.70) {
    avisos.push(
      `Calor severo: el consumo cae ~${Math.round((1 - mult.detalle.temperatura) * 100)} %. ` +
      `Con sombra y agua fresca, o dando de comer al atardecer, se recupera buena parte de la ganancia.`
    );
  }
  if (mult.detalle.barro <= 0.85) {
    avisos.push('Barro en el corral: reduce el consumo y por lo tanto la ganancia. Drenar o cambiar de piquete.');
  }

  return {
    dmi,
    dmiBase,
    dmiBrCorte: dmiBrc,
    dmiNrc: dmiNrcVal,
    ecuacion,
    dmiPctPv: (dmi / animal.bw) * 100,
    multiplicadores: mult,
    topeAplicado,
    avisos,
  };
}

/**
 * Consumo de agua, L/d. Ecuación tropical para Bos indicus, la más apropiada
 * para Santa Cruz: WI = 9.449 + 0.190*MBW + 0.271*TMAX - 0.259*HU + 0.489*DMI
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC6396249/
 * Se contrasta con la relación L/kg MS de CSIRO 2007 para no dar un número
 * absurdo si el clima declarado es extremo.
 */
export function consumoAgua(animal, dmi, { tempMax = 32, humedad = 65 } = {}) {
  const mbw = Math.pow(animal.bw, 0.75);
  const wi = 9.449 + 0.190 * mbw + 0.271 * tempMax - 0.259 * humedad + 0.489 * dmi;

  // Control cruzado CSIRO: litros por kg de MS según temperatura
  let lPorKg = 3.0;
  if (tempMax >= 35) lPorKg = 8.0;
  else if (tempMax >= 30) lPorKg = 6.0;
  else if (tempMax >= 25) lPorKg = 4.5;
  else if (tempMax >= 20) lPorKg = 3.5;
  const wiCsiro = dmi * lPorKg;

  // Se toma el mayor de los dos: en agua, quedarse corto es lo peligroso.
  const litros = Math.max(wi, wiCsiro, dmi * 3);

  return {
    litros,
    porEcuacionTropical: wi,
    porRelacionCsiro: wiCsiro,
    nota: 'El agua es el primer nutriente. Sin agua fresca y suficiente ninguna ración funciona, y el azufre del agua cuenta para el límite de 0,40 % de la materia seca.',
  };
}
