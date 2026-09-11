// src/engine/predict.js
// ============================================================================
// GANABOV — MOTOR NUTRICIONAL v2
// PREDICCIÓN DE GANANCIA. Este es el módulo que arregla el problema de fondo.
//
// Qué hacía mal el motor viejo (src/utils/nutricion.js):
//   La "gdpEstimada" NUNCA se calculaba. Arrancaba como la gdp OBJETIVO (un
//   número fijo por sistema y fase), se multiplicaba por factores de ajuste
//   inventados y se recortaba entre un mínimo y un máximo del sistema. O sea:
//   la app le devolvía al usuario el número que ella misma había supuesto,
//   disfrazado de predicción. Nunca podía decir si una dieta realmente daba
//   0,9 kg/día. Eso es lo que se arregla acá.
//
// Cómo se hace bien — PARTICIÓN DE LA ENERGÍA:
//   Un kilo de materia seca vale distinto según a qué se destine. Primero se
//   descuenta el alimento que cubre el mantenimiento, valorado a la densidad
//   NEm de la dieta. SOLO EL REMANENTE se valora a la densidad NEg, que
//   siempre es menor. Con esa NEg disponible se invierte la ecuación de
//   ganancia y sale la ADG real.
//
//     MS_mantenimiento = NEm_requerida (Mcal/d) / NEm_dieta (Mcal/kg)
//     MS_ganancia      = DMI - MS_mantenimiento
//     NEg_disponible   = MS_ganancia * NEg_dieta (Mcal/kg)
//     ADG              = inversa(NEg_disponible)
//
//   Sumar NEm_req + NEg_req y dividir por un único NEm sobreestima la ganancia
//   entre 20 y 40 % en dietas de terminación. Era exactamente lo que hacía el
//   motor viejo.
//
// Y ADEMÁS: la ganancia informada es el MÍNIMO entre la que permite la energía
// y la que permite la proteína metabolizable. De nada sirve energía de sobra si
// falta proteína: el animal no la puede usar.
//
// Iteración obligatoria: las ecuaciones de consumo de BR-CORTE toman la ADG
// como entrada y las de energía toman el consumo como entrada. Se resuelve por
// punto fijo hasta que la ADG deja de moverse.
// ============================================================================

import {
  perfilAnimal, nemRequerido, negRequerido, adgDesdeNeg, adgNegativa,
  mpMantenimiento, adgDesdeMp, mpRequerida, mineralesRequeridos,
  adgAEbg, kMp,
} from './animal.js';
import { dmiPredicho, consumoAgua } from './intake.js';
import { densidadMezcla } from './energy.js';
import { MCP_BRCORTE, DIG_MCP, DIG_RUP } from './standards.js';

/**
 * Proteína metabolizable que aporta una dieta, g/d.
 *
 * MCP = -53.07 + 304.9*CPI + 90.8*TDNI - 3.13*TDNI^2   [BRC23 cap. 9 / cap. 3]
 * RDP = MCP   (BR-CORTE 2016/2023 eliminó el factor 1.11 obsoleto)
 * RUP = CPI - RDP
 * MPI = MCP*0.64 + RUP/0.80
 *
 * FIX CRÍTICO (por qué el motor daba 0.74 kg/d cuando debería dar 1.02):
 *   El código anterior usaba `rupKg !== null ? rupKg * 1000 : (cpiG - rdp)`,
 *   es decir: si los alimentos declaraban ALGÚN RUP (aunque fuera incompleto
 *   por tablas con `rup_pct_pb: null`), el motor tomaba ese valor y descartaba
 *   el cálculo por balance de masa. Resultado: alimentos sin `rup_pct_pb`
 *   aportaban 0 RUP, el total quedaba muy por debajo del real, MPI caía, y
 *   el motor elegía "proteína" como limitante cuando en realidad era energía.
 *
 *   La regla física correcta: RUP = CPI − RDP por balance de masa. Si los
 *   alimentos declaran MENOS RUP que el que se infiere por diferencia, los
 *   datos están incompletos y hay que usar el de balance de masa. Si declaran
 *   MÁS, la tabla manda. Se toma el MAYOR de los dos.
 *
 * @param {number} cpiKg   consumo de proteína bruta, kg/d
 * @param {number} tdniKg  consumo de TDN, kg/d
 * @param {number} rupKg   consumo de PNDR medido en los alimentos, kg/d (opcional)
 */
export function mpAportada(cpiKg, tdniKg, rupKg = null) {
  const c = MCP_BRCORTE;
  let mcp = c.i + c.cpi * cpiKg + c.tdni * tdniKg + c.tdni2 * tdniKg * tdniKg; // g/d
  mcp = Math.max(mcp, 0);

  // La síntesis microbiana no puede superar la proteína degradable disponible.
  const cpiG = cpiKg * 1000;
  const rdp = Math.min(mcp, cpiG * 0.95);

  // RUP por diferencia: SIEMPRE disponible por balance de masa.
  const rupPorDiferencia = Math.max(cpiG - rdp, 0);

  // RUP declarado por los alimentos (puede estar subestimado si faltan datos).
  const rupDeclaradoG = rupKg !== null ? rupKg * 1000 : 0;

  // FIX: usar el MAYOR de los dos.
  const rupG = Math.max(rupDeclaradoG, rupPorDiferencia);

  const mpi = rdp * DIG_MCP + rupG * DIG_RUP;

  return {
    mpi,
    mcp: rdp,
    rup: rupG,
    rdp,
    rupDeclarado: rupDeclaradoG,
    rupPorDiferencia,
    fuenteRup: rupDeclaradoG > rupPorDiferencia ? 'declarado' : 'por_diferencia',
    // Si la PB de la dieta no alcanza para sostener la síntesis microbiana que
    // permitiría la energía, la fibra se digiere peor: es el primer nutriente
    // limitante en forrajes tropicales de baja calidad.
    microbiosLimitados: mcp > cpiG * 0.95,
  };
}

/**
 * Predice el desempeño real de una dieta concreta.
 *
 * @param {object} p
 * @param {number} p.pv                peso vivo lleno, kg
 * @param {string} p.razaId
 * @param {string} p.sexo
 * @param {string} p.sistemaId         'pastoril' | 'semiIntensivo' | 'feedlot'
 * @param {Array}  p.racion            [{ kgMs, energia, pb, tdn, rup, ... }]
 * @param {object} p.ambiente          { temperatura, tempPrevia, humedad, barro, enfriamientoNocturno }
 * @param {boolean} p.tieneIonoforo
 * @param {number} p.monensinaMgKg
 *
 * @returns objeto con adg (la real), sus dos límites, consumo, energía,
 *          proteína, minerales, agua y avisos.
 */
export function predecirDesempeno({
  pv, razaId = 'otro', sexo = 'novillo', sistemaId = 'semiIntensivo',
  racion = [], ambiente = {}, tieneIonoforo = false, monensinaMgKg = 0,
}) {
  const entorno = sistemaId === 'pastoril' ? 'pastoreo' : 'confinamiento';
  const animal = perfilAnimal({ pv, razaId, sexo, entorno });

  // --- Densidad energética de la mezcla (no depende del animal) ---
  const densidad = densidadMezcla(racion, tieneIonoforo);
  if (!densidad.valido) {
    return { error: true, msg: densidad.motivo };
  }

  // --- Requerimiento de mantenimiento (no depende del consumo) ---
  const mant = nemRequerido(animal, {
    tempPrevia: ambiente.tempPrevia ?? ambiente.temperatura ?? 26,
    tempActual: ambiente.temperatura ?? 28,
    jadeo: ambiente.jadeo ?? 'auto',
  });

  // Proporciones de la mezcla: los aportes se escalan con el consumo real,
  // manteniendo la MISMA composición porcentual de la ración formulada.
  const msFormulada = densidad.msTotal;
  const pbFormulada = racion.reduce((s, it) => s + (it.kgMs || 0) * (it.pb || 0) / 100, 0);
  const rupFormulada = racion.reduce((s, it) => s + (it.kgMs || 0) * (it.rup_pct_pb || 0) / 100 * (it.pb || 0) / 100, 0);
  const pbPct = msFormulada > 0 ? (pbFormulada / msFormulada) * 100 : 0;
  const rupPctMs = msFormulada > 0 ? (rupFormulada / msFormulada) * 100 : 0;

  // ---------------------------------------------------------------------
  // PUNTO FIJO: consumo <-> ganancia
  // ---------------------------------------------------------------------
  let adg = 1.0;              // semilla
  let iteraciones = 0;
  let consumo = null, particion = null, proteina = null;
  let convergio = false;

  for (let i = 0; i < 30; i++) {
    iteraciones = i + 1;

    // 1. Consumo esperado para esa ganancia
    consumo = dmiPredicho(animal, adg, {
      sistemaId,
      nemDieta: densidad.nem,
      temperatura: ambiente.temperatura ?? 28,
      enfriamientoNocturno: ambiente.enfriamientoNocturno ?? false,
      barro: ambiente.barro ?? 'sin_barro',
      tieneIonoforo,
      monensinaMgKg,
      factorCalidadConsumo: ambiente.factorCalidadConsumo ?? 1.0,
      dmiSuplemento: ambiente.dmiSuplemento ?? 0,
    });

    // 2. PARTICIÓN DE LA ENERGÍA — el paso que el motor viejo hacía mal
    const msMantenimiento = mant.nem / densidad.nem;
    const msGanancia = consumo.dmi - msMantenimiento;

    let adgEnergia;
    if (msGanancia <= 0) {
      // No alcanza ni para mantenerse: el animal pierde peso
      const deficitMcal = Math.abs(msGanancia) * densidad.nem;
      adgEnergia = adgNegativa(deficitMcal);
      particion = {
        msMantenimiento, msGanancia, negDisponible: 0, deficitMcal, pierdePeso: true,
      };
    } else {
      const negDisponible = msGanancia * densidad.neg;
      adgEnergia = adgDesdeNeg(animal, negDisponible);
      particion = {
        msMantenimiento, msGanancia, negDisponible, deficitMcal: 0, pierdePeso: false,
      };
    }

    // 3. Proteína: aportada vs requerida, con el consumo de esta iteración
    const cpiKg = (consumo.dmi * pbPct) / 100;
    const tdniKg = (consumo.dmi * densidad.tdn) / 100;
    const rupKg = (consumo.dmi * rupPctMs) / 100;
    const aporte = mpAportada(cpiKg, tdniKg, rupKg > 0 ? rupKg : null);
    const adgProteina = adgDesdeMp(animal, aporte.mpi);

    proteina = { ...aporte, cpiKg, tdniKg, pbPct, adgProteina };

    // 4. La ganancia real es la menor de las dos
    const adgNueva = Math.min(adgEnergia, adgProteina);
    proteina.adgEnergia = adgEnergia;

    if (Math.abs(adgNueva - adg) < 0.005) {
      adg = adgNueva;
      convergio = true;
      break;
    }
    // Amortiguación para evitar oscilaciones
    adg = adg + 0.6 * (adgNueva - adg);
  }

  const adgFinal = Math.max(adg, -2);
  const ebg = adgAEbg(Math.max(adgFinal, 0));
  const re = negRequerido(animal, Math.max(adgFinal, 0));

  // --- Requerimientos a la ganancia REAL alcanzada (para el informe) ---
  const mpReq = mpRequerida(animal, Math.max(adgFinal, 0), re);
  const minerales = mineralesRequeridos(animal, Math.max(adgFinal, 0));
  const agua = consumoAgua(animal, consumo.dmi, {
    tempMax: ambiente.tempMax ?? (ambiente.temperatura ?? 28) + 4,
    humedad: ambiente.humedad ?? 65,
  });

  // --- Qué está limitando la ganancia ---
  let limitante = 'energía';
  if (proteina.adgProteina < proteina.adgEnergia - 0.02) limitante = 'proteína';
  if (consumo.topeAplicado) limitante = 'consumo (tope fisiológico)';
  if (particion.pierdePeso) limitante = 'energía insuficiente para el mantenimiento';

  const avisos = [...consumo.avisos];
  if (limitante === 'proteína') {
    avisos.push(
      `La proteína es lo que está frenando la ganancia: con la energía de esta dieta el animal podría hacer ${proteina.adgEnergia.toFixed(2)} kg/día, ` +
      `pero la proteína solo alcanza para ${proteina.adgProteina.toFixed(2)} kg/día. Subir la PB de la dieta rinde más que subir el grano.`
    );
  }
  if (proteina.microbiosLimitados) {
    avisos.push('La proteína bruta de la dieta no alcanza para alimentar bien los microbios del rumen. Eso hace que la fibra se digiera peor y se pierda energía del forraje.');
  }
  if (particion.pierdePeso) {
    avisos.push('Con esta dieta y este consumo el animal NO cubre su mantenimiento: perdería peso. Hay que subir la densidad energética o el consumo.');
  }
  if (animal.madurezPct > 95) {
    avisos.push(`El animal está al ${animal.madurezPct.toFixed(0)} % de su peso de madurez: de acá en adelante casi todo lo que gane será grasa y la conversión empeora. Conviene evaluar la venta.`);
  }
  if (!convergio) {
    avisos.push('El cálculo no se estabilizó del todo; el resultado es aproximado. Revisar que los datos del animal y del clima sean razonables.');
  }

  return {
    error: false,
    animal,
    // --- LA PREDICCIÓN, ahora sí calculada ---
    adg: adgFinal,
    adgEnergia: proteina.adgEnergia,
    adgProteina: proteina.adgProteina,
    limitante,
    ebg,
    // --- consumo ---
    dmi: consumo.dmi,
    dmiPctPv: consumo.dmiPctPv,
    consumo,
    // --- energía ---
    densidad,
    mantenimiento: mant,
    particion,
    reMcal: re,
    // --- proteína ---
    proteina,
    mpRequerida: mpReq,
    balanceMp: proteina.mpi - mpReq.total,
    // --- minerales y agua ---
    minerales,
    agua,
    // --- diagnóstico ---
    iteraciones,
    convergio,
    avisos,
    // eficiencia
    conversion: adgFinal > 0.01 ? consumo.dmi / adgFinal : null,
  };
}
