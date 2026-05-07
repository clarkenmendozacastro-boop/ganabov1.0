import { useState, useEffect } from "react";

// ============================================================
// BASE DE DATOS - Tabla de Morrison + Tropicales Bolivia
// ============================================================
const ALIMENTOS_BASE = [
  // ── FORRAJES FRESCOS ──
  { id:"mombasa",        nombre:"Pasto Mombasa (fresco)",           tipo:"forraje_fresco",    ms:22,  prot:8.5,  em:2.10, fdn:68, max_ms_pct:null, precio_kg:0.50 },
  { id:"marandu",        nombre:"Brachiaria Marandu (fresco)",      tipo:"forraje_fresco",    ms:25,  prot:8.0,  em:2.05, fdn:70, max_ms_pct:null, precio_kg:0.45 },
  { id:"brachiaria",     nombre:"Brachiaria brizantha (fresco)",    tipo:"forraje_fresco",    ms:24,  prot:7.8,  em:2.00, fdn:72, max_ms_pct:null, precio_kg:0.45 },
  { id:"tanzania",       nombre:"Pasto Tanzania (fresco)",          tipo:"forraje_fresco",    ms:21,  prot:9.2,  em:2.12, fdn:67, max_ms_pct:null, precio_kg:0.50 },
  { id:"xaraes",         nombre:"Brachiaria Xaraés (fresco)",       tipo:"forraje_fresco",    ms:23,  prot:8.3,  em:2.08, fdn:71, max_ms_pct:null, precio_kg:0.45 },
  { id:"estrella",       nombre:"Pasto Estrella Africana (fresco)", tipo:"forraje_fresco",    ms:20,  prot:9.0,  em:2.15, fdn:65, max_ms_pct:null, precio_kg:0.50 },
  { id:"maralfalfa",     nombre:"Maralfalfa (fresco)",              tipo:"forraje_fresco",    ms:18,  prot:11.5, em:2.20, fdn:60, max_ms_pct:null, precio_kg:0.60 },
  { id:"king_grass",     nombre:"King Grass (fresco)",              tipo:"forraje_fresco",    ms:19,  prot:8.8,  em:2.05, fdn:68, max_ms_pct:null, precio_kg:0.45 },
  { id:"pennisetum",     nombre:"Pennisetum purpureum (fresco)",    tipo:"forraje_fresco",    ms:20,  prot:9.5,  em:2.18, fdn:64, max_ms_pct:null, precio_kg:0.50 },
  { id:"sorgo_forr",     nombre:"Sorgo Forrajero (fresco)",         tipo:"forraje_fresco",    ms:23,  prot:7.5,  em:2.10, fdn:66, max_ms_pct:null, precio_kg:0.40 },
  { id:"caña_verde",     nombre:"Caña de Azúcar (fresca)",          tipo:"forraje_fresco",    ms:26,  prot:2.8,  em:2.50, fdn:55, max_ms_pct:null, precio_kg:0.25 },
  { id:"alfalfa_verde",  nombre:"Alfalfa (fresca)",                 tipo:"forraje_fresco",    ms:23,  prot:18.0, em:2.40, fdn:42, max_ms_pct:null, precio_kg:0.80 },
  // ── HENOS Y SILAJES ──
  { id:"heno_marandu",   nombre:"Heno de Marandu",                  tipo:"heno_silo",         ms:88,  prot:6.5,  em:1.90, fdn:74, max_ms_pct:60,   precio_kg:1.20 },
  { id:"heno_estrella",  nombre:"Heno de Estrella",                 tipo:"heno_silo",         ms:88,  prot:7.0,  em:1.95, fdn:72, max_ms_pct:60,   precio_kg:1.30 },
  { id:"heno_alfalfa",   nombre:"Heno de Alfalfa",                  tipo:"heno_silo",         ms:90,  prot:17.0, em:2.20, fdn:44, max_ms_pct:50,   precio_kg:2.50 },
  { id:"silo_maiz",      nombre:"Silaje de Maíz",                   tipo:"heno_silo",         ms:33,  prot:8.0,  em:2.70, fdn:48, max_ms_pct:60,   precio_kg:0.80 },
  { id:"silo_sorgo",     nombre:"Silaje de Sorgo",                  tipo:"heno_silo",         ms:30,  prot:7.5,  em:2.50, fdn:55, max_ms_pct:60,   precio_kg:0.70 },
  { id:"silo_brachiaria",nombre:"Silaje de Brachiaria",             tipo:"heno_silo",         ms:30,  prot:7.0,  em:1.95, fdn:68, max_ms_pct:60,   precio_kg:0.65 },
  { id:"bagazo_caña",    nombre:"Bagazo de Caña (seco)",            tipo:"heno_silo",         ms:91,  prot:2.5,  em:1.55, fdn:85, max_ms_pct:20,   precio_kg:0.20 },
  // ── ENERGÉTICOS ──
  { id:"maiz_am",        nombre:"Maíz Amarillo (grano)",            tipo:"energetico",        ms:88,  prot:8.5,  em:3.30, fdn:12, max_ms_pct:40,   precio_kg:2.20 },
  { id:"maiz_bl",        nombre:"Maíz Blanco (grano)",              tipo:"energetico",        ms:88,  prot:8.2,  em:3.28, fdn:12, max_ms_pct:40,   precio_kg:2.10 },
  { id:"sorgo_rojo",     nombre:"Sorgo Rojo (grano)",               tipo:"energetico",        ms:88,  prot:9.0,  em:3.10, fdn:14, max_ms_pct:40,   precio_kg:1.90 },
  { id:"sorgo_blanco",   nombre:"Sorgo Blanco (grano)",             tipo:"energetico",        ms:88,  prot:8.8,  em:3.12, fdn:14, max_ms_pct:40,   precio_kg:1.85 },
  { id:"cebada_grano",   nombre:"Cebada (grano)",                   tipo:"energetico",        ms:88,  prot:11.5, em:3.05, fdn:18, max_ms_pct:30,   precio_kg:2.50 },
  { id:"trigo_grano",    nombre:"Trigo (grano)",                    tipo:"energetico",        ms:88,  prot:12.5, em:3.20, fdn:13, max_ms_pct:30,   precio_kg:2.80 },
  { id:"yuca_seca",      nombre:"Yuca Seca (chips)",                tipo:"energetico",        ms:88,  prot:2.8,  em:3.10, fdn:10, max_ms_pct:30,   precio_kg:1.50 },
  { id:"yuca_fresca",    nombre:"Yuca Raíz (fresca)",               tipo:"energetico",        ms:35,  prot:2.5,  em:3.00, fdn:10, max_ms_pct:30,   precio_kg:0.90 },
  { id:"melaza",         nombre:"Melaza de Caña",                   tipo:"energetico",        ms:74,  prot:3.5,  em:2.60, fdn:0,  max_ms_pct:10,   precio_kg:1.20 },
  { id:"grasa_bypass",   nombre:"Grasa Bypass (sobrepasante)",      tipo:"energetico",        ms:99,  prot:0.0,  em:5.60, fdn:0,  max_ms_pct:5,    precio_kg:12.0 },
  // ── SUBPRODUCTOS ──
  { id:"salvado_trigo",  nombre:"Salvado / Afrechillo de Trigo",    tipo:"subproducto",       ms:88,  prot:15.0, em:2.80, fdn:42, max_ms_pct:20,   precio_kg:1.80 },
  { id:"cascara_soya",   nombre:"Cascarilla de Soya",               tipo:"subproducto",       ms:90,  prot:12.0, em:2.50, fdn:62, max_ms_pct:20,   precio_kg:2.00 },
  { id:"pulpa_citrico",  nombre:"Pulpa de Cítricos (seca)",         tipo:"subproducto",       ms:91,  prot:6.5,  em:2.80, fdn:22, max_ms_pct:15,   precio_kg:2.20 },
  { id:"pulpa_remola",   nombre:"Pulpa de Remolacha",               tipo:"subproducto",       ms:91,  prot:9.0,  em:2.90, fdn:45, max_ms_pct:15,   precio_kg:2.50 },
  { id:"afrecho_arroz",  nombre:"Afrecho de Arroz Integral",        tipo:"subproducto",       ms:90,  prot:12.5, em:2.70, fdn:28, max_ms_pct:15,   precio_kg:1.60 },
  { id:"germen_maiz",    nombre:"Germen de Maíz",                   tipo:"subproducto",       ms:90,  prot:10.0, em:3.00, fdn:15, max_ms_pct:15,   precio_kg:1.70 },
  // ── PROTEICOS VEGETALES ──
  { id:"torta_soya44",   nombre:"Torta de Soya (44% PB)",           tipo:"proteico",          ms:88,  prot:44.0, em:3.20, fdn:10, max_ms_pct:15,   precio_kg:4.50 },
  { id:"torta_soya48",   nombre:"Torta de Soya (48% PB)",           tipo:"proteico",          ms:88,  prot:48.0, em:3.10, fdn:8,  max_ms_pct:15,   precio_kg:5.00 },
  { id:"torta_algod",    nombre:"Torta de Algodón",                 tipo:"proteico",          ms:90,  prot:36.0, em:2.70, fdn:25, max_ms_pct:10,   precio_kg:3.50 },
  { id:"torta_girasol",  nombre:"Torta de Girasol",                 tipo:"proteico",          ms:90,  prot:32.0, em:2.60, fdn:30, max_ms_pct:10,   precio_kg:3.20 },
  { id:"torta_palmiste", nombre:"Torta de Palmiste",                tipo:"proteico",          ms:90,  prot:16.0, em:2.70, fdn:55, max_ms_pct:10,   precio_kg:2.80 },
  { id:"torta_copra",    nombre:"Torta de Copra (coco)",            tipo:"proteico",          ms:90,  prot:21.0, em:2.80, fdn:50, max_ms_pct:10,   precio_kg:3.00 },
  { id:"soya_integral",  nombre:"Soya Integral Tostada",            tipo:"proteico",          ms:90,  prot:38.0, em:3.80, fdn:12, max_ms_pct:10,   precio_kg:4.80 },
  // ── PROTEICOS ANIMALES (Morrison) ──
  { id:"h_sangre",       nombre:"Harina de Sangre",                 tipo:"proteico_animal",   ms:92,  prot:80.0, em:2.90, fdn:0,  max_ms_pct:3,    precio_kg:9.00 },
  { id:"h_carne",        nombre:"Harina de Carne y Hueso",          tipo:"proteico_animal",   ms:92,  prot:50.0, em:2.80, fdn:0,  max_ms_pct:5,    precio_kg:7.00 },
  { id:"h_pescado",      nombre:"Harina de Pescado (65% PB)",       tipo:"proteico_animal",   ms:92,  prot:65.0, em:3.10, fdn:0,  max_ms_pct:5,    precio_kg:10.0 },
  { id:"h_plumas",       nombre:"Harina de Plumas Hidrolizada",     tipo:"proteico_animal",   ms:93,  prot:75.0, em:2.60, fdn:0,  max_ms_pct:3,    precio_kg:6.50 },
  { id:"h_hueso",        nombre:"Harina de Hueso",                  tipo:"proteico_animal",   ms:96,  prot:12.0, em:0.00, fdn:0,  max_ms_pct:2,    precio_kg:3.50 },
  { id:"gallinaza",      nombre:"Gallinaza Tratada",                tipo:"proteico_animal",   ms:88,  prot:28.0, em:1.80, fdn:15, max_ms_pct:5,    precio_kg:0.80 },
  { id:"pollinaza",      nombre:"Pollinaza (cama de pollo)",        tipo:"proteico_animal",   ms:86,  prot:30.0, em:1.85, fdn:20, max_ms_pct:5,    precio_kg:0.70 },
  // ── SUPLEMENTOS ──
  { id:"sal_mineral",    nombre:"Sal Mineral Completa (bovinos)",   tipo:"suplemento",        ms:99,  prot:0.0,  em:0.00, fdn:0,  max_ms_pct:1,    precio_kg:6.50 },
  { id:"sal_comun",      nombre:"Sal Común (NaCl)",                 tipo:"suplemento",        ms:99,  prot:0.0,  em:0.00, fdn:0,  max_ms_pct:0.5,  precio_kg:1.50 },
  { id:"bicarbonato",    nombre:"Bicarbonato de Sodio (buffer)",    tipo:"suplemento",        ms:99,  prot:0.0,  em:0.00, fdn:0,  max_ms_pct:0.5,  precio_kg:4.00 },
  { id:"oxido_mg",       nombre:"Óxido de Magnesio",                tipo:"suplemento",        ms:99,  prot:0.0,  em:0.00, fdn:0,  max_ms_pct:0.3,  precio_kg:8.00 },
  { id:"urea",           nombre:"Urea Ganadera (46% N)",            tipo:"suplemento",        ms:99,  prot:281.0,em:0.00, fdn:0,  max_ms_pct:0.5,  precio_kg:8.00 },
  { id:"monensina",      nombre:"Monensina (ionóforo)",             tipo:"suplemento",        ms:99,  prot:0.0,  em:0.00, fdn:0,  max_ms_pct:0.02, precio_kg:80.0 },
  { id:"fosfato_bic",    nombre:"Fosfato Bicálcico",                tipo:"suplemento",        ms:99,  prot:0.0,  em:0.00, fdn:0,  max_ms_pct:0.5,  precio_kg:5.00 },
  { id:"carbonato_ca",   nombre:"Carbonato de Calcio",              tipo:"suplemento",        ms:99,  prot:0.0,  em:0.00, fdn:0,  max_ms_pct:0.5,  precio_kg:2.50 },
];

const RAZAS = [
  { id:"nelore",         nombre:"Nelore",                   gdp_base:0.90, pc_canal:0.54, ajuste_ms:0.025 },
  { id:"brahman",        nombre:"Brahman",                  gdp_base:0.85, pc_canal:0.53, ajuste_ms:0.025 },
  { id:"nelore_brahman", nombre:"Cruce Nelore × Brahman",   gdp_base:0.95, pc_canal:0.55, ajuste_ms:0.026 },
  { id:"angus_brahman",  nombre:"Cruce Angus × Brahman",    gdp_base:1.00, pc_canal:0.56, ajuste_ms:0.027 },
  { id:"senepol",        nombre:"Senepol",                  gdp_base:0.88, pc_canal:0.54, ajuste_ms:0.025 },
  { id:"simmental",      nombre:"Cruce Simmental",          gdp_base:1.05, pc_canal:0.57, ajuste_ms:0.027 },
  { id:"criollo",        nombre:"Criollo Boliviano",        gdp_base:0.55, pc_canal:0.50, ajuste_ms:0.022 },
  { id:"criollo_cruce",  nombre:"Criollo con cruce cebuíno",gdp_base:0.70, pc_canal:0.51, ajuste_ms:0.023 },
  { id:"otro",           nombre:"Otro / No definido",       gdp_base:0.78, pc_canal:0.52, ajuste_ms:0.024 },
];

const TIPO_LABELS = {
  forraje_fresco: "🌿 Forraje fresco", heno_silo: "🌾 Heno / Silaje",
  energetico: "🌽 Energético", subproducto: "♻️ Subproducto",
  proteico: "🫘 Proteico vegetal", proteico_animal: "🩸 Proteico animal", suplemento: "💊 Suplemento",
};
const TIPOS_ORDER = ["forraje_fresco","heno_silo","energetico","subproducto","proteico","proteico_animal","suplemento"];

// ============================================================
// MOTOR NUTRICIONAL — NRC-2000 + Cuadrado de Pearson
// ============================================================
function calcularRequerimientos(pv, razaObj) {
  const pvN = parseFloat(pv);
  if (!pvN || pvN < 80) return null;
  const gdp = razaObj ? razaObj.gdp_base : 0.78;
  const pvMet = Math.pow(pvN, 0.75);
  const em_mant = 0.077 * pvMet * 1.10;          // +10% calor tropical
  const em_crec = gdp * (0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdp);
  const em_total = em_mant + em_crec;
  const prot_mant = 3.8 * pvMet;
  const prot_crec = gdp * 268 - 29.4 * (em_crec / gdp);
  const pb_total = (prot_mant + prot_crec) / 0.65;
  const ms_min = pvN * 0.020;
  const ms_opt = pvN * (razaObj ? razaObj.ajuste_ms : 0.024);
  const ms_max = pvN * 0.030;
  return { em_total, pb_total, ms_min, ms_opt, ms_max, gdp, pvN };
}

function pearsonSquare(prot_obj, pE, pP) {
  if (pP <= prot_obj || prot_obj <= pE) return null;
  const partE = pP - prot_obj, partP = prot_obj - pE, tot = partE + partP;
  return { pct_E: partE / tot, pct_P: partP / tot };
}

function formularRacion(seleccionados, pv, razaObj, preciosUsr) {
  const req = calcularRequerimientos(pv, razaObj);
  if (!req || seleccionados.length === 0) return null;
  const getPrecio = al => preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg;

  const byTipo = t => seleccionados.filter(a => a.tipo === t);
  const ff = byTipo("forraje_fresco"), hs = byTipo("heno_silo");
  const en = byTipo("energetico"), pr = [...byTipo("proteico"), ...byTipo("proteico_animal")];
  const sb = byTipo("subproducto"), sup = byTipo("suplemento");

  const racion = [];
  let ms_u = 0, em_u = 0, prot_u = 0, fdn_u = 0;

  const add = (al, kg) => {
    if (kg <= 0.001) return;
    const msKg = kg * (al.ms / 100);
    racion.push({ ...al, kg_dia: +kg.toFixed(2), ms_kg: +msKg.toFixed(3), precio_kg: getPrecio(al) });
    ms_u += msKg; em_u += msKg * al.em;
    prot_u += msKg * (al.prot / 100) * 1000;
    fdn_u += msKg * (al.fdn / 100);
  };

  // 1. Suplementos (dosis fija técnica)
  sup.forEach(s => {
    const kg = s.id==="sal_mineral"?req.pvN*0.00008 : s.id==="bicarbonato"?0.100 : s.id==="oxido_mg"?0.050 : s.id==="urea"?Math.min(0.050,req.pvN*0.0001) : s.id==="monensina"?0.00030 : s.id==="fosfato_bic"?0.040 : s.id==="carbonato_ca"?0.060 : 0.060;
    add(s, kg);
  });

  // 2. Forraje fresco — máx 60% MS opt, distribuido entre los elegidos
  if (ff.length > 0) {
    const ms_ff = Math.min(req.ms_opt * 0.60, req.ms_opt - ms_u);
    const ms_por = ms_ff / ff.length;
    ff.forEach(f => add(f, ms_por / (f.ms / 100)));
  }

  // 3. Heno/silaje — cubren hasta 50% MS restante
  if (hs.length > 0) {
    const ms_hs = Math.max(0, req.ms_opt * 0.50 - ms_u);
    if (ms_hs > 0.1) { const mp = ms_hs / hs.length; hs.forEach(h => add(h, mp / (h.ms / 100))); }
  }

  // 4. Concentrado: energéticos + proteicos + subproductos con Pearson
  const ms_conc = Math.max(0, req.ms_max - ms_u);
  const todos_conc = [...en, ...pr, ...sb];
  if (ms_conc > 0.2 && todos_conc.length > 0) {
    const em_def = req.em_total - em_u;
    const prot_def_g = Math.max(0, req.pb_total - prot_u);
    const ms_conc_real = Math.min(ms_conc, Math.max(em_def / 2.9, 0.3));
    const prot_obj_pct = ms_conc_real > 0 ? Math.min(Math.max((prot_def_g / 1000 / ms_conc_real) * 100, 8), 40) : 12;

    const mejorE = en.length > 0 ? en.reduce((a,b) => a.em > b.em ? a : b) : (sb.length > 0 ? sb[0] : null);
    const mejorP = pr.length > 0 ? pr.reduce((a,b) => a.prot > b.prot ? a : b) : null;
    let fracs = {};

    if (mejorE && mejorP && mejorP.prot > prot_obj_pct && mejorE.prot < prot_obj_pct) {
      const ps = pearsonSquare(prot_obj_pct, mejorE.prot, mejorP.prot);
      if (ps) {
        const otros = todos_conc.filter(a => a.id !== mejorE.id && a.id !== mejorP.id);
        const fExtra = otros.length > 0 ? 0.10 : 0;
        fracs[mejorE.id] = ps.pct_E * (1 - fExtra);
        fracs[mejorP.id] = ps.pct_P * (1 - fExtra);
        otros.forEach(a => fracs[a.id] = fExtra / otros.length);
      }
    }
    if (Object.keys(fracs).length === 0) {
      const score = a => a.em * 0.5 + (a.prot / 100) * 2;
      const tot = todos_conc.reduce((s,a) => s + score(a), 0);
      todos_conc.forEach(a => fracs[a.id] = score(a) / tot);
    }

    todos_conc.forEach(al => {
      if (!fracs[al.id]) return;
      let ms_al = ms_conc_real * fracs[al.id];
      if (al.max_ms_pct) ms_al = Math.min(ms_al, req.ms_max * (al.max_ms_pct / 100));
      add(al, ms_al / (al.ms / 100));
    });
  }

  const fdn_pct = ms_u > 0 ? (fdn_u / ms_u) * 100 : 0;
  const ms_pct_pv = (ms_u / req.pvN) * 100;
  const costo = racion.reduce((s,a) => s + a.kg_dia * getPrecio(a), 0);
  const contieneFF = ff.length > 0;
  const metodo = (en.length > 0 && pr.length > 0) ? "Cuadrado de Pearson + NRC-2000" : "Ecuaciones algebraicas NRC-2000";

  return {
    racion, req,
    ms_total: ms_u.toFixed(2), ms_pct_pv: ms_pct_pv.toFixed(1),
    em_total: em_u.toFixed(2), prot_total: prot_u.toFixed(0),
    fdn_pct: fdn_pct.toFixed(1), costo_total: costo.toFixed(2),
    balance_em: (em_u - req.em_total).toFixed(2),
    balance_prot: (prot_u - req.pb_total).toFixed(0),
    alertaAcidosis: fdn_pct < 35,
    alertaPastoFresco: contieneFF && fdn_pct < 42,
    metodo,
  };
}

function calcularGDP(pesadas) {
  if (!pesadas || pesadas.length < 2) return 0;
  const p1 = pesadas[0], p2 = pesadas[pesadas.length - 1];
  const dias = Math.max(1, (new Date(p2.fecha) - new Date(p1.fecha)) / 86400000);
  return (p2.peso - p1.peso) / dias;
}

function calcularProyeccion(pesoActual, pesoMeta, gdp, razaObj) {
  if (pesoMeta <= pesoActual || gdp <= 0) return null;
  const dias = Math.ceil((pesoMeta - pesoActual) / gdp);
  const pc = razaObj ? razaObj.pc_canal : 0.52;
  const canal = Math.round(pesoMeta * pc);
  const huesos = Math.round(canal * 0.20);
  return { dias, meses: (dias / 30).toFixed(1), canal, carneLimpia: canal - huesos, huesos, viseras: Math.round(pesoMeta * 0.08) };
}

function evaluarVenta(pesoActual, gdpReal, razaObj) {
  const gdpEsp = razaObj ? razaObj.gdp_base : 0.78;
  const ef = gdpReal >= gdpEsp * 0.85 ? "buena" : gdpReal >= gdpEsp * 0.60 ? "regular" : "baja";
  let rec = "", conv = false;
  if (pesoActual >= 450) { conv = true; rec = "Animal en peso óptimo (450+ kg). Evalúe venta inmediata."; }
  else if (ef === "baja" && pesoActual >= 380) { conv = true; rec = "Conversión muy baja y peso cercano al comercial. Puede ser más rentable vender ahora."; }
  else if (ef === "baja") rec = "Conversión baja pero peso insuficiente. Ajuste la ración primero.";
  else rec = `Buena conversión (${gdpReal.toFixed(2)} kg/día). Continúe hasta 430-450 kg.`;
  return { eficiencia: ef, recomendacion: rec, conviene: conv };
}

function recomendarAjuste(gdpReal, razaObj, esCriollo) {
  const gdpEsp = razaObj ? razaObj.gdp_base : 0.78;
  if (gdpReal >= gdpEsp * 0.85) return [];
  const deficit = gdpEsp - gdpReal;
  const aj = [];
  if (deficit > 0.25) aj.push({ titulo:"↑ Energía urgente", detalle:"Aumentar 2-3 kg maíz o sorgo en grano/día", costo:"4-6 Bs/día extra" });
  else aj.push({ titulo:"↑ Energía moderada", detalle:"Agregar 0.5-1 kg maíz o melaza/día", costo:"1-2 Bs/día extra" });
  if (gdpReal < gdpEsp * 0.70) aj.push({ titulo:"↑ Proteína", detalle:"Agregar 300-500 g torta de soya o harina de carne", costo:"1.5-3.5 Bs/día extra" });
  if (esCriollo) aj.push({ titulo:"ℹ️ Raza criolla", detalle:`GDP esperado para criollos: ${gdpEsp} kg/día. Es más lento que cebuínos. Puede usar cruzamiento para mejorar.`, costo:"" });
  return aj;
}

// ============================================================
// UI BASE
// ============================================================
const Badge = ({ children, color="green" }) => {
  const c = { green:"bg-emerald-900/50 text-emerald-300 border-emerald-700", yellow:"bg-amber-900/50 text-amber-300 border-amber-700", red:"bg-red-900/50 text-red-300 border-red-700", blue:"bg-sky-900/50 text-sky-300 border-sky-700", gray:"bg-zinc-800 text-zinc-400 border-zinc-600", purple:"bg-purple-900/50 text-purple-300 border-purple-700" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${c[color]||c.gray}`}>{children}</span>;
};
const Card = ({ children, className="" }) => <div className={`bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 ${className}`}>{children}</div>;
const Inp = ({ label, ...p }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>}
    <input className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text
