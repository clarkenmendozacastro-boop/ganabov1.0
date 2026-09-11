// src/engine/standards.js
// ============================================================================
// GANABOV — MOTOR NUTRICIONAL v2
// Constantes y tablas de los estándares oficiales. NADA de valores inventados.
// Cada bloque lleva la fuente exacta de donde salió el número.
//
// Fuentes:
//  [NRC96]  NRC 1996 "Nutrient Requirements of Beef Cattle", cap. 10
//           https://nap.nationalacademies.org/resource/beef/beef10.pdf
//  [NRC00]  NRC 2000, 7ª ed. revisada (update 2000)
//  [NASEM]  NASEM 2016, resumido y verificado en Transl. Anim. Sci. 3(3):991
//           https://academic.oup.com/tas/article/3/3/991/5523108
//  [BRC23]  BR-CORTE 2023 https://brcorte.com.br/assets/book2023/en/01.pdf (cap. 1)
//           cap. 2 (consumo), cap. 8 (energía), cap. 9 (proteína y minerales)
//  [BRC16]  BR-CORTE 2016 https://brcorte.com.br/assets/book2016/en/c9.pdf (cap. 9)
//  [NRC01]  NRC 2001 Dairy (sumativa de Weiss) https://www.foragelab.com/media/nrc2001.pdf
//
// REGLA DE ORO del motor: para Bos indicus en el trópico se usa BR-CORTE para
// pesos, mantenimiento, ganancia, consumo, proteína y minerales; y NRC/NASEM
// para los ajustes que BR-CORTE no publica (clima, barro, ionóforos, implantes).
// Ver tabla "Qué estándar usar en Santa Cruz" en research/ecuaciones.md
// ============================================================================

/** Peso vivo vacío de referencia estándar de BR-CORTE = EBW a la madurez del
 *  toro Nelore. [BRC23 cap. 8, Eq. 8.18] */
export const SREBW = 517;

/** Grupos genéticos de BR-CORTE. El motor traduce las razas de la app a estos
 *  tres grupos, porque las ecuaciones oficiales están publicadas por grupo. */
export const GRUPO = {
  ZEBU: 'zebu',
  CRUZA_CARNE: 'cruza_carne',
  CRUZA_LECHERA: 'cruza_lechera',
};

export const SEXO = {
  TORO: 'toro',       // entero
  NOVILLO: 'novillo', // castrado
  VAQUILLA: 'vaquilla',
};

/**
 * Mapeo raza de la app -> grupo genético BR-CORTE + coeficiente de raza del NRC.
 * `be` es el "breed effect" del mantenimiento del NRC 1996 (Tabla 10-1):
 * Brahman 0.90, Nellore 0.90, Angus 1.00, Holstein 1.20. [NRC96]
 * `bi` es el multiplicador de consumo por raza del NRC (Tabla 10-4):
 * razas de carne 1.00, Holstein x carne 1.04, Holstein 1.08. [NRC96]
 * Se conservan TODOS los ids que ya usa src/data/razas.js.
 */
export const RAZAS_MAP = {
  nelore:         { grupo: GRUPO.ZEBU,          be: 0.90, bi: 1.00, nombre: 'Nelore' },
  brahman:        { grupo: GRUPO.ZEBU,          be: 0.90, bi: 1.00, nombre: 'Brahman' },
  nelore_brahman: { grupo: GRUPO.ZEBU,          be: 0.90, bi: 1.00, nombre: 'Nelore × Brahman' },
  angus_brahman:  { grupo: GRUPO.CRUZA_CARNE,   be: 0.95, bi: 1.00, nombre: 'Angus × Brahman' },
  senepol:        { grupo: GRUPO.CRUZA_CARNE,   be: 0.95, bi: 1.00, nombre: 'Senepol' },
  simmental:      { grupo: GRUPO.CRUZA_LECHERA, be: 1.00, bi: 1.04, nombre: 'Cruce Simmental' },
  criollo:        { grupo: GRUPO.ZEBU,          be: 0.90, bi: 1.00, nombre: 'Criollo boliviano' },
  criollo_cruce:  { grupo: GRUPO.ZEBU,          be: 0.90, bi: 1.00, nombre: 'Criollo × cebú' },
  otro:           { grupo: GRUPO.ZEBU,          be: 0.90, bi: 1.00, nombre: 'Otro / no definido' },
};

/**
 * Peso vacío a la madurez (MEBW, kg) por grupo genético y sexo.
 * [BRC23 cap. 8, Tabla 8.5]  Es lo que evita que el motor "engorde" un cebú
 * como si fuera un taurino grande: cada animal se compara con SU madurez.
 */
export const MEBW = {
  [GRUPO.ZEBU]:          { toro: 517, novillo: 433, vaquilla: 402 },
  [GRUPO.CRUZA_CARNE]:   { toro: 560, novillo: 482, vaquilla: 417 },
  [GRUPO.CRUZA_LECHERA]: { toro: 616, novillo: 532, vaquilla: 493 },
};

/**
 * Coeficientes de la alométrica EBW = a * SBW^b, en confinamiento.
 * [BRC23 cap. 1, Eq. 1.6 a 1.11]
 */
export const EBW_COEF = {
  [GRUPO.ZEBU]: {
    toro:     { a: 0.8126, b: 1.0134 },
    novillo:  { a: 0.6241, b: 1.0608 },
    vaquilla: { a: 0.6110, b: 1.0667 },
  },
  // BR-CORTE publica las mismas ecuaciones para cruzas de corte y lecheras
  [GRUPO.CRUZA_CARNE]: {
    toro:     { a: 0.7248, b: 1.0314 },
    novillo:  { a: 0.6586, b: 1.0499 },
    vaquilla: { a: 0.6314, b: 1.0602 },
  },
  [GRUPO.CRUZA_LECHERA]: {
    toro:     { a: 0.7248, b: 1.0314 },
    novillo:  { a: 0.6586, b: 1.0499 },
    vaquilla: { a: 0.6314, b: 1.0602 },
  },
};

/** Pastoreo: EBW = 0.8507 * SBW^1.0002 [BRC23 cap. 1, Eq. 1.5] */
export const EBW_PASTOREO = { a: 0.8507, b: 1.0002 };

/** SBW = 0.8915 * BW^1.0151 (cebú y cruzas de corte);
 *  SBW = 0.9247 * BW^1.0085 (cruzas lecheras). [BRC23 cap. 1, Eq. 1.3 y 1.4] */
export const SBW_COEF = {
  [GRUPO.ZEBU]:          { a: 0.8915, b: 1.0151 },
  [GRUPO.CRUZA_CARNE]:   { a: 0.8915, b: 1.0151 },
  [GRUPO.CRUZA_LECHERA]: { a: 0.9247, b: 1.0085 },
};

/** EBG = 0.9630 * ADG^1.0151 [BRC23 cap. 1, Eq. 1.12] */
export const EBG_COEF = { a: 0.9630, b: 1.0151 };

// ---------------------------------------------------------------------------
// ENERGÍA
// ---------------------------------------------------------------------------

/** NEm = 0.075 * EBW^0.75 Mcal/d — igual para todo genotipo y sexo.
 *  [BRC23 cap. 8]  Ojo: va sobre EBW^0.75, NO sobre SBW^0.75. */
export const NEM_COEF_BRCORTE = 0.075;

/** NEm = 0.077 * SBW^0.75 (base taurina del NRC/NASEM). [NRC96 / NASEM] */
export const NEM_COEF_NRC = 0.077;

/** MEm por grupo genético, kcal/EBW^0.75/d. [BRC23 cap. 8] */
export const MEM_BRCORTE = {
  [GRUPO.ZEBU]:          118,
  [GRUPO.CRUZA_CARNE]:   124,
  [GRUPO.CRUZA_LECHERA]: 125,
  pastoreo:              128,
};

/** beta2 de la ecuación de km = [0.513 + 0.173*kg + b2*EBG] * theta. [BRC23 cap. 8] */
export const KM_BETA2 = {
  [GRUPO.ZEBU]:          0.100,
  [GRUPO.CRUZA_CARNE]:   0.073,
  [GRUPO.CRUZA_LECHERA]: 0.010,
};

/** NEg = a * EQEBW^0.75 * EBG^b. [BRC23 cap. 8, Eq. 8.20 y 8.21] */
export const NEG_BRCORTE = {
  confinamiento: { a: 0.061, b: 1.035 },
  pastoreo:      { a: 0.052, b: 1.062 },
};

/** Inversa de BR-CORTE: EBG = 14.914 * NEg^0.9662 * EQEBW^-0.7246. [BRC23 Eq. 8.22] */
export const EBG_INV_BRCORTE = { a: 14.914, expNEg: 0.9662, expEQEBW: -0.7246 };

/** NRC: RE = 0.0635 * EQEBW^0.75 * EBG^1.097; inversa
 *  EBG = 12.341 * EQEBW^-0.6837 * RE^0.9116. [NRC96] */
export const RE_NRC = { a: 0.0635, b: 1.097 };
export const EBG_INV_NRC = { a: 12.341, expEQEBW: -0.6837, expRE: 0.9116 };

/** DE (Mcal/kg MS) = TDN% / 100 * 4.409. [NRC96] */
export const MCAL_POR_KG_TDN = 4.409;

/** ME desde DE. NRC: 0.82*DE. BR-CORTE (mejor para dietas tropicales de caña
 *  y silo de maíz + concentrado): ME = 0.9455*DE - 0.3032. [BRC23 cap. 8] */
export const ME_DESDE_DE = {
  nrc:      { factor: 0.82, intercepto: 0 },
  brcorte:  { factor: 0.9455, intercepto: -0.3032 },
};

/** Cúbicas de Garrett que convierten ME de la dieta en NEm y NEg de la dieta.
 *  NEm = 1.37 ME - 0.138 ME^2 + 0.0105 ME^3 - 1.12
 *  NEg = 1.42 ME - 0.174 ME^2 + 0.0122 ME^3 - 1.65   [NRC96]
 *  (el signo negativo del 0.174 es el correcto; hay transcripciones erradas) */
export const CUBICA_NEM = { c1: 1.37, c2: -0.138, c3: 0.0105, c0: -1.12 };
export const CUBICA_NEG = { c1: 1.42, c2: -0.174, c3: 0.0122, c0: -1.65 };

/** Ionóforo: +12% sobre la energía de la dieta Y -4% sobre el DMI.
 *  Se aplica UNA sola vez a cada lado. [NRC96 Tabla 10-4 / NRC00] */
export const IONOFORO = { energia: 1.12, consumo: 0.96 };

/** Monensina: descuento de consumo según dosis (mg/kg MS). [NRC00] */
export const MONENSINA_CONSUMO = [
  { mgKg: 22, factor: 0.94 },
  { mgKg: 33, factor: 0.90 },
];

// ---------------------------------------------------------------------------
// AJUSTES CLIMÁTICOS Y DE MANEJO (NRC — BR-CORTE no los publica)
// ---------------------------------------------------------------------------

/** Aclimatación térmica sobre el mantenimiento: a2 = 0.0007 * (20 - Tp),
 *  Mcal/SBW^0.75. Con Tp de 25–28 °C en Santa Cruz esto BAJA el mantenimiento
 *  un 5–7 %. [NRC96] */
export const ACLIMATACION_COEF = 0.0007;
export const ACLIMATACION_T_REF = 20;

/** Estrés calórico agudo sobre el mantenimiento. [NRC96] */
export const JADEO = {
  ninguno:      1.00,
  leve:         1.07, // jadeo rápido y superficial (T >= 30 °C)
  severo:       1.18, // jadeo con boca abierta
};

/** TEMP1 — multiplicador del consumo por temperatura. [NRC96 Tabla 10-4]
 *  DECISIVO para Santa Cruz: >35 °C sin enfriamiento nocturno recorta 35 %. */
export function temp1(tempC, enfriamientoNocturno = false) {
  if (tempC > 35) return enfriamientoNocturno ? 0.90 : 0.65;
  if (tempC >= 25) return 0.90;
  if (tempC >= 15) return 1.00;
  if (tempC >= 5)  return 1.03;
  if (tempC >= -5) return 1.05;
  if (tempC >= -15) return 1.07;
  return 1.16;
}

/** MUD1 — multiplicador del consumo por barro. [NRC96 Tabla 10-4]
 *  Relevante en la época de lluvias del este boliviano. */
export const MUD1 = {
  sin_barro: 1.00,
  leve:      0.85, // 10–20 cm
  severo:    0.70, // 30–60 cm
};

/** BFAF — multiplicador del consumo por grasa corporal, según peso
 *  equivalente. [NRC96 Tabla 10-4] */
export function bfaf(eqSbw) {
  if (eqSbw <= 350) return 1.00;
  if (eqSbw <= 400) return 0.97;
  if (eqSbw <= 450) return 0.90;
  if (eqSbw <= 500) return 0.82;
  return 0.73;
}

// ---------------------------------------------------------------------------
// CONSUMO — BR-CORTE 2023 cap. 2
// ---------------------------------------------------------------------------

/** DMI = i + a*BW^0.75 + b*ADG + c*ADG^2, confinamiento. [BRC23 cap. 2, Eq. 2.1–2.3] */
export const DMI_BRCORTE_CONFINAMIENTO = {
  [GRUPO.ZEBU]:          { i: -2.1948, a: 0.08338, b: 3.9328, c: -0.9030 },
  [GRUPO.CRUZA_CARNE]:   { i: -0.6273, a: 0.06453, b: 3.8710, c: -0.6140 },
  [GRUPO.CRUZA_LECHERA]: { i: -2.8836, a: 0.08435, b: 4.5145, c: -0.9631 },
};

/** DMI en pastoreo con suplemento: incluye el término del suplemento.
 *  [BRC23 cap. 2, Eq. 2.6–2.7] */
export const DMI_BRCORTE_PASTOREO = {
  [GRUPO.ZEBU]:          { i: -0.4684, s: 0.7732, a: 0.0742, b: 0.7953, c: -0.9047 },
  [GRUPO.CRUZA_CARNE]:   { i: -0.4684, s: 0.7732, a: 0.0742, b: 0.7953, c: -0.9047 },
  [GRUPO.CRUZA_LECHERA]: { i:  0.9951, s: 0.7732, a: 0.0742, b: 0.7953, c: -0.9047 },
};

/** Techos de consumo como % del peso vivo. No son ecuaciones oficiales: son
 *  topes de seguridad recomendados por extensión para que el motor nunca
 *  prediga un consumo fisiológicamente imposible.
 *  [Iowa Beef Center] https://www.iowabeefcenter.org/bch/DryMatterIntake.pdf */
export const TECHO_DMI_PCT_PV = {
  pastoril:      0.030,
  semiIntensivo: 0.028,
  feedlot:       0.025,
};

// ---------------------------------------------------------------------------
// PROTEÍNA — BR-CORTE cap. 9
// ---------------------------------------------------------------------------

/** MPm en g/EBW^0.75/d. Pastoreo requiere ~8 % más. [BRC23 cap. 9] */
export const MPM_BRCORTE = { confinamiento: 3.96, pastoreo: 4.31 };

/** NPg (g/d) = a*EBG - b*RE, por grupo y sexo. [BRC23 cap. 9] */
export const NPG_BRCORTE = {
  [GRUPO.ZEBU]: {
    toro:     { a: 210.09, b: 10.01 },
    novillo:  { a: 153.13, b: 2.53 },
    vaquilla: { a: 193.90, b: 12.16 },
  },
  [GRUPO.CRUZA_CARNE]: {
    toro:     { a: 281.77, b: 27.66 },
    novillo:  { a: 219.94, b: 12.04 },
    vaquilla: { a: 174.65, b: 3.14 },
  },
  [GRUPO.CRUZA_LECHERA]: {
    toro:     { a: 171.43, b: 3.08 },
    novillo:  { a: 236.36, b: 19.84 },
    vaquilla: { a: 206.58, b: 15.39 },
  },
};

/** Eficiencia MP -> NP: k(%) = 84.665 - 0.1179*EQEBW; piso 47.4 % si SBW >= 340.
 *  [BRC23 cap. 9] */
export const K_MP = { i: 84.665, s: 0.1179, piso: 0.474, sbwUmbral: 340 };

/** MCP (g/d) = -53.07 + 304.9*CPI + 90.8*TDNI - 3.13*TDNI^2  (kg/d de entrada).
 *  [BRC23 cap. 9, remite a cap. 3] */
export const MCP_BRCORTE = { i: -53.07, cpi: 304.9, tdni: 90.8, tdni2: -3.13 };

/** MCP del NRC: 0.13 * TDN, ajustado por eNDF. Lineal, sirve para el LP. [NRC96] */
export const MCP_NRC_FACTOR = 0.13;

/** Digestibilidad verdadera de la proteína microbiana y del RUP. [BRC23 cap. 9] */
export const DIG_MCP = 0.64;  // 0.80 proteína verdadera x 0.80 digestibilidad
export const DIG_RUP = 0.80;

/** Rango de PB de la dieta en terminación, % MS. [NASEM 2016 vía PMC13071399]
 *  https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/
 *  Ensayos BR-CORTE con Nelore: 10 % redujo la ganancia de carcasa, 12 % fue
 *  adecuado. [BRC16 cap. 8] */
export const PB_DIETA_PCT = {
  crecimiento:  { min: 12.0, max: 16.0 },
  terminacion:  { min: 11.5, max: 13.5 },
};

// ---------------------------------------------------------------------------
// MINERALES — BR-CORTE cap. 9 (retenciones verdaderas) + máximos NRC
// ---------------------------------------------------------------------------

/** Mantenimiento neto (mg/kg PV/d) y retención verdadera (%).
 *  [BRC16 cap. 9, Tabla 9.12] */
export const MINERALES_BRCORTE = {
  ca: { mant: 11.7, ret: 0.568 },
  p:  { mant: 13.5, ret: 0.678 },
  mg: { mant: 5.9,  ret: 0.355 },
  na: { mant: 6.3,  ret: 0.371 },
  k:  { mant: 23.5, ret: 0.484 },
  s:  { mant: 10.4, ret: 0.773 },
};

/** Crecimiento neto (g/d) = EBG * (a * EBW^b). [BRC16 cap. 9] */
export const MINERALES_CREC = {
  [GRUPO.ZEBU]: {
    ca: { a: 147,    b: -0.50 },
    p:  { a: 38.6,   b: -0.36 },
    mg: { a: 0.3466, b:  0.0113 },
    na: { a: 5.594,  b: -0.2998 },
    k:  { a: 0.9463, b:  0.1216 },
  },
  cruzados: {
    ca: { a: 66.0,   b: -0.32 },
    p:  { a: 25.4,   b: -0.25 },
    mg: { a: 1.0597, b: -0.2386 },
    na: { a: 1.977,  b: -0.058 },
    k:  { a: 0.3418, b:  0.3200 },
  },
  s: { a: 0.03, b: 0.89 }, // igual para todos
};

/** Concentraciones mínimas en la dieta, crecimiento y terminación.
 *  [NRC96 Tabla 10-3] */
export const MINIMOS_DIETA = {
  mg_pct: 0.10,
  k_pct:  0.60,
  na_pct: 0.07,   // rango publicado 0.06–0.08
  s_pct:  0.15,
  vitA_ui_kg: 2200,
  vitD_ui_kg: 275,
  co_mg_kg: 0.10,
  cu_mg_kg: 10,
  i_mg_kg:  0.50,
  fe_mg_kg: 50,
  mn_mg_kg: 20,
  se_mg_kg: 0.10,
  zn_mg_kg: 30,
};

/** Máximos tolerables. S = 0.40 % MS es el límite duro: por encima aparece
 *  polioencefalomalacia (PEM). Hay que sumar el S del AGUA.
 *  [BRC16 cap. 9 Tabla 9.11 / NRC00 / K-State "Sulfur Toxicity in Feedlots"]
 *  https://www.asi.k-state.edu/doc/beef-cow-calf-nutrition/chars-j-j-wagner-sulfur-toxicity-in-feedlots-cdr-2.pdf */
export const MAXIMOS_TOLERABLES = {
  ca_pct: 4.4,
  k_pct:  2.0,
  mg_pct: 0.4,
  na_pct: 6.5,
  s_pct:  0.40,
  cu_mg_kg: 40,
  mn_mg_kg: 1000,
  se_mg_kg: 5,
  zn_mg_kg: 500,
};

/** Relación Ca:P operativa. ARC recomienda 1:1 a 2:1; NRC 2000 documenta que
 *  de 1:1 a 7:1 dieron desempeño similar. El motor usa una banda prudente:
 *  por debajo de 1.5 hay riesgo de urolitiasis en machos castrados en corral.
 *  [BRC16 cap. 9] */
export const RATIO_CA_P = { min: 1.5, max: 2.5, minAbsoluto: 1.0, maxAbsoluto: 6.0 };

/** Coeficientes de absorción del NRC 2000 usados en la vía NRC. [NRC96] */
export const ABSORCION_NRC = { ca: 0.50, p: 0.68 };

// ---------------------------------------------------------------------------
// AGUA
// ---------------------------------------------------------------------------

/** Ecuación tropical para Bos indicus, la más apropiada para Santa Cruz:
 *  WI (L/d) = 9.449 + 0.190*MBW + 0.271*TMAX - 0.259*HU + 0.489*DMI
 *  [PMC6396249] https://pmc.ncbi.nlm.nih.gov/articles/PMC6396249/ */
export const AGUA_TROPICAL = { i: 9.449, mbw: 0.190, tmax: 0.271, hu: -0.259, dmi: 0.489 };

/** Litros de agua por kg de MS consumida, Bos indicus, CSIRO 2007
 *  (control cruzado). [PMC6396249] */
export const AGUA_POR_KG_MS = [
  { tempMax: 15, litros: 3.0 },
  { tempMax: 20, litros: 3.5 },
  { tempMax: 25, litros: 4.5 },
  { tempMax: 30, litros: 6.0 },
  { tempMax: 99, litros: 8.0 },
];

// ---------------------------------------------------------------------------
// SISTEMAS Y FASES DE LA APP
// ---------------------------------------------------------------------------

/** Se conservan los ids que ya usa la app. `entorno` indica qué juego de
 *  ecuaciones BR-CORTE corresponde (confinamiento vs pastoreo). */
export const SISTEMAS = {
  pastoril: {
    nombre: 'Pastoril',
    entorno: 'pastoreo',
    concentradoMaxPct: 40,
    monensinaMgKg: 18,
    gdpRango: [0.3, 0.9],
  },
  semiIntensivo: {
    nombre: 'Semi-intensivo',
    entorno: 'confinamiento',
    concentradoMaxPct: 60,
    monensinaMgKg: 22,
    gdpRango: [0.6, 1.3],
  },
  feedlot: {
    nombre: 'Feedlot',
    entorno: 'confinamiento',
    concentradoMaxPct: 85,
    monensinaMgKg: 28,
    gdpRango: [1.0, 2.0],
  },
};

/**
 * Fases del feedlot. Los límites de fibra y almidón vienen de las referencias
 * de seguridad ruminal (ver constraints.js y research/seguridad.md); acá solo
 * se declaran los días y el techo de concentrado de cada escalón.
 */
export const FASES_FEEDLOT = {
  inicio:      { nombre: 'Inicio',      dias: 14, concentradoMaxPct: 55, gdpEsperado: 1.2 },
  desarrollo:  { nombre: 'Desarrollo',  dias: 21, concentradoMaxPct: 72, gdpEsperado: 1.5 },
  terminacion: { nombre: 'Terminación', dias: 30, concentradoMaxPct: 85, gdpEsperado: 1.7 },
};

/** Factores de calidad del alimento aplicados sobre digestibilidad y consumo.
 *  Son factores de manejo, no de norma: sirven para castigar un silo mal hecho
 *  o un heno pasado. Se documentan como heurística explícita. */
export const CALIDAD = {
  'Óptimo':          { dig: 1.00, pb: 1.00, consumo: 1.00, alerta: false },
  'Bueno':           { dig: 0.96, pb: 0.96, consumo: 0.98, alerta: false },
  'Regular':         { dig: 0.88, pb: 0.90, consumo: 0.93, alerta: false },
  'Bajo':            { dig: 0.75, pb: 0.78, consumo: 0.85, alerta: true,
                       msg: 'Calidad BAJA: menor digestibilidad y menor consumo. La ganancia real caerá.' },
  'Muy deteriorado': { dig: 0.55, pb: 0.60, consumo: 0.70, alerta: true,
                       msg: 'Calidad MUY DETERIORADA: riesgo de rechazo del alimento y de pérdida de peso. No usar en terminación.' },
};

/** Resuelve la ficha de raza tolerando ids desconocidos. */
export function fichaRaza(razaId) {
  return RAZAS_MAP[razaId] || RAZAS_MAP.otro;
}

/** Resuelve el sexo tolerando entradas viejas o ausentes. Por defecto novillo,
 *  que es el caso más común de engorde en Santa Cruz. */
export function normalizarSexo(sexo) {
  const s = String(sexo || '').toLowerCase();
  if (s.startsWith('toro') || s === 'entero' || s === 'macho_entero') return SEXO.TORO;
  if (s.startsWith('vaq') || s === 'hembra' || s === 'vaca') return SEXO.VAQUILLA;
  return SEXO.NOVILLO;
}
