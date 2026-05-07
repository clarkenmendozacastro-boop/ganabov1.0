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
    <input className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all placeholder-zinc-500" {...p}/>
  </div>
);
const Sel = ({ label, children, ...p }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>}
    <select className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all" {...p}>{children}</select>
  </div>
);
const Btn = ({ children, onClick, variant="primary", className="", disabled=false }) => {
  const v = { primary:"bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500", secondary:"bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600", danger:"bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700", ghost:"bg-transparent hover:bg-zinc-800 text-zinc-400 border border-zinc-700" };
  return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${v[variant]||v.primary} ${className}`}>{children}</button>;
};

// ============================================================
// LOGIN
// ============================================================
function LoginScreen({ onLogin }) {
  const [u,sU]=useState(""); const [p,sP]=useState(""); const [err,sE]=useState("");
  const go = () => u==="ganadero"&&p==="bolivia2024" ? onLogin() : sE("Usuario o contraseña incorrectos");
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="text-6xl mb-3">🐄</div><h1 className="text-3xl font-black text-white">GanaBov Pro</h1><p className="text-zinc-500 text-sm mt-1">Santa Cruz · Bolivia · Engorde bovino</p></div>
        <Card className="flex flex-col gap-4">
          <Inp label="Usuario" value={u} onChange={e=>sU(e.target.value)} placeholder="ganadero"/>
          <Inp label="Contraseña" type="password" value={p} onChange={e=>sP(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
          {err&&<p className="text-red-400 text-xs text-center">{err}</p>}
          <Btn onClick={go} className="w-full py-3 text-base">Ingresar</Btn>
          <p className="text-zinc-600 text-xs text-center">usuario: <span className="text-zinc-400">ganadero</span> · pass: <span className="text-zinc-400">bolivia2024</span></p>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ animales, onNav }) {
  const alertas = animales.filter(a => { const g=calcularGDP(a.pesadas); const r=RAZAS.find(x=>x.id===a.raza)||RAZAS[8]; return a.pesadas?.length>=2 && g<r.gdp_base*0.70; }).length;
  const listos  = animales.filter(a => { const u=a.pesadas?.length>0?a.pesadas[a.pesadas.length-1].peso:a.peso_inicial; return u>=430; }).length;
  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-2xl font-black text-white">Panel Principal</h2><p className="text-zinc-500 text-sm">Santa Cruz · Engorde bovino</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[{l:"Animales",v:animales.length,i:"🐄",c:"text-emerald-400"},{l:"Alertas",v:alertas,i:"⚠️",c:"text-amber-400"},{l:"Listos",v:listos,i:"✅",c:"text-sky-400"}].map(s=>(
          <Card key={s.l} className="text-center py-4"><div className="text-2xl mb-1">{s.i}</div><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="text-zinc-500 text-xs">{s.l}</div></Card>
        ))}
      </div>
      {alertas>0&&<Card className="border-amber-700/50 bg-amber-950/30"><div className="text-amber-400 font-bold text-sm mb-1">⚠️ {alertas} animal(es) con bajo rendimiento</div><p className="text-zinc-400 text-xs">Revisá sus raciones.</p><Btn variant="secondary" onClick={()=>onNav("animales")} className="mt-2 text-xs py-1">Ver →</Btn></Card>}
      {listos>0&&<Card className="border-emerald-700/50 bg-emerald-950/30"><div className="text-emerald-400 font-bold text-sm mb-1">✅ {listos} animal(es) listos para venta</div><p className="text-zinc-400 text-xs">Superaron los 430 kg.</p></Card>}
      <div className="grid grid-cols-2 gap-3">
        {[{l:"Mis Animales",i:"🐄",n:"animales"},{l:"Formular Ración",i:"🔬",n:"racion"},{l:"Alimentos y Precios",i:"📦",n:"alimentos"},{l:"Nuevo Animal",i:"➕",n:"nuevo"}].map(m=>(
          <button key={m.n} onClick={()=>onNav(m.n)} className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-emerald-600/60 hover:bg-zinc-800/60 transition-all group">
            <span className="text-3xl group-hover:scale-110 transition-transform">{m.i}</span>
            <span className="text-sm font-semibold text-zinc-300">{m.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LISTA Y CARD DE ANIMALES
// ============================================================
function ListaAnimales({ animales, onSelect, onNav }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-white">Mis Animales</h2><Btn onClick={()=>onNav("nuevo")} className="text-xs py-1.5">+ Agregar</Btn></div>
      {animales.length===0
        ? <Card className="text-center py-10"><div className="text-5xl mb-3">🐄</div><p className="text-zinc-500 text-sm">Sin animales registrados</p><Btn onClick={()=>onNav("nuevo")} className="mt-4">Agregar primer animal</Btn></Card>
        : <div className="flex flex-col gap-3">{animales.map(a=><AnimalCard key={a.id} animal={a} onClick={()=>onSelect(a)}/>)}</div>}
    </div>
  );
}

function AnimalCard({ animal, onClick }) {
  const raza=RAZAS.find(r=>r.id===animal.raza)||RAZAS[8];
  const ult=animal.pesadas?.length>0?animal.pesadas[animal.pesadas.length-1].peso:animal.peso_inicial;
  const gdp=calcularGDP(animal.pesadas);
  const col=animal.pesadas?.length<2?"gray":gdp>=raza.gdp_base*0.85?"green":gdp>=raza.gdp_base*0.60?"yellow":"red";
  return (
    <button onClick={onClick} className="w-full bg-zinc-900 border border-zinc-700/60 rounded-2xl p-4 text-left hover:border-emerald-600/50 hover:bg-zinc-800/40 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div><div className="font-bold text-white">{animal.nombre}</div><div className="text-zinc-500 text-xs">{raza.nombre} · {animal.sexo}</div></div>
        <Badge color={col}>{col==="green"?"Bien":col==="yellow"?"Regular":col==="red"?"Alerta":"Sin datos"}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[{v:`${ult} kg`,l:"actual",c:"text-emerald-400"},{v:`${animal.peso_inicial} kg`,l:"entrada",c:"text-sky-400"},{v:gdp>0?`${gdp.toFixed(2)}/d`:"—",l:"GDP kg",c:"text-amber-400"}].map(s=>(
          <div key={s.l}><div className={`font-black text-lg ${s.c}`}>{s.v}</div><div className="text-zinc-600 text-xs">{s.l}</div></div>
        ))}
      </div>
    </button>
  );
}

// ============================================================
// NUEVO ANIMAL
// ============================================================
function NuevoAnimal({ onGuardar, onBack }) {
  const [f,sF]=useState({nombre:"",raza:"otro",sexo:"macho",peso_inicial:"",fecha_entrada:new Date().toISOString().slice(0,10),notas:""});
  const set=(k,v)=>sF(x=>({...x,[k]:v}));
  const guardar=()=>{
    if(!f.nombre||!f.peso_inicial)return alert("Completá nombre y peso");
    onGuardar({...f,id:Date.now().toString(),peso_inicial:parseFloat(f.peso_inicial),pesadas:[{fecha:f.fecha_entrada,peso:parseFloat(f.peso_inicial),nota:"Peso de entrada"}]});
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3"><Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">← Volver</Btn><h2 className="text-2xl font-black text-white">Nuevo Animal</h2></div>
      <Card className="flex flex-col gap-4">
        <Inp label="Nombre o N° de caravana" value={f.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Ej: Toro #001"/>
        <Sel label="Raza" value={f.raza} onChange={e=>set("raza",e.target.value)}>{RAZAS.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</Sel>
        <Sel label="Sexo" value={f.sexo} onChange={e=>set("sexo",e.target.value)}><option value="macho">Macho (toro/novillo)</option><option value="hembra">Hembra</option></Sel>
        <Inp label="Peso inicial (kg)" type="number" value={f.peso_inicial} onChange={e=>set("peso_inicial",e.target.value)} placeholder="Ej: 220"/>
        <Inp label="Fecha de entrada" type="date" value={f.fecha_entrada} onChange={e=>set("fecha_entrada",e.target.value)}/>
        <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Notas (opcional)</label><textarea className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none h-16 placeholder-zinc-500" value={f.notas} onChange={e=>set("notas",e.target.value)} placeholder="Observaciones..."/></div>
        <Btn onClick={guardar} className="w-full py-3">Guardar Animal</Btn>
      </Card>
    </div>
  );
}

// ============================================================
// DETALLE ANIMAL
// ============================================================
function DetalleAnimal({ animal, onUpdate, onDelete, onBack, preciosUsr }) {
  const [tab,sT]=useState("info");
  const [np,sNP]=useState({fecha:new Date().toISOString().slice(0,10),peso:"",nota:""});
  const [confirmDel,sCD]=useState(false);
  const raza=RAZAS.find(r=>r.id===animal.raza)||RAZAS[8];
  const gdp=calcularGDP(animal.pesadas);
  const ult=animal.pesadas?.length>0?animal.pesadas[animal.pesadas.length-1].peso:animal.peso_inicial;
  const ev=evaluarVenta(ult,gdp,raza);
  const aj=recomendarAjuste(gdp,raza,animal.raza==="criollo"||animal.raza==="criollo_cruce");
  const p450=calcularProyeccion(ult,450,gdp>0?gdp:raza.gdp_base,raza);
  const p500=calcularProyeccion(ult,500,gdp>0?gdp:raza.gdp_base,raza);
  const bajRend=animal.pesadas?.length>=2&&gdp<raza.gdp_base*0.70;

  const addPesada=()=>{
    if(!np.peso)return;
    onUpdate({...animal,pesadas:[...(animal.pesadas||[]),{...np,peso:parseFloat(np.peso)}]});
    sNP({fecha:new Date().toISOString().slice(0,10),peso:"",nota:""});
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">← Volver</Btn><div><div className="text-xl font-black text-white">{animal.nombre}</div><div className="text-zinc-500 text-xs">{raza.nombre} · {animal.sexo}</div></div></div>
        {!confirmDel
          ? <Btn variant="danger" onClick={()=>sCD(true)} className="text-xs py-1 px-3">🗑️ Eliminar</Btn>
          : <div className="flex gap-1"><Btn variant="danger" onClick={()=>onDelete(animal.id)} className="text-xs py-1 px-2">✓ Confirmar</Btn><Btn variant="ghost" onClick={()=>sCD(false)} className="text-xs py-1 px-2">Cancelar</Btn></div>}
      </div>

      {bajRend&&(
        <Card className="border-red-700/50 bg-red-950/30">
          <div className="text-red-400 font-bold text-sm mb-2">⚠️ Bajo rendimiento — GDP: {gdp.toFixed(3)} kg/día · Esperado: {raza.gdp_base}</div>
          {aj.map((a,i)=>(
            <div key={i} className="bg-zinc-900 rounded-xl p-3 mb-2"><div className="text-amber-400 font-semibold text-xs">{a.titulo}</div><div className="text-zinc-400 text-xs mt-0.5">{a.detalle}</div>{a.costo&&<div className="text-emerald-400 text-xs mt-1">Costo extra: {a.costo}</div>}</div>
          ))}
        </Card>
      )}

      <div className="flex gap-1 bg-zinc-900 border border-zinc-700/60 rounded-2xl p-1">
        {[["info","Info"],["pesadas","Pesadas"],["proyeccion","Proyección"],["venta","Venta"]].map(([id,lb])=>(
          <button key={id} onClick={()=>sT(id)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab===id?"bg-emerald-600 text-white":"text-zinc-400"}`}>{lb}</button>
        ))}
      </div>

      {tab==="info"&&(
        <div className="grid grid-cols-2 gap-3">
          {[{l:"Peso inicial",v:`${animal.peso_inicial} kg`,c:"text-zinc-300"},{l:"Peso actual",v:`${ult} kg`,c:"text-emerald-400"},{l:"Ganancia total",v:`${(ult-animal.peso_inicial).toFixed(0)} kg`,c:"text-sky-400"},{l:"GDP promedio",v:gdp>0?`${gdp.toFixed(3)} kg/d`:"Sin datos",c:"text-amber-400"}].map(s=>(
            <Card key={s.l} className="text-center py-3"><div className={`text-xl font-black ${s.c}`}>{s.v}</div><div className="text-zinc-500 text-xs">{s.l}</div></Card>
          ))}
          {animal.notas&&<Card className="col-span-2"><p className="text-zinc-400 text-sm">📝 {animal.notas}</p></Card>}
        </div>
      )}

      {tab==="pesadas"&&(
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Registrar pesada</div>
            <Inp label="Fecha" type="date" value={np.fecha} onChange={e=>sNP(p=>({...p,fecha:e.target.value}))}/>
            <Inp label="Peso (kg)" type="number" value={np.peso} onChange={e=>sNP(p=>({...p,peso:e.target.value}))} placeholder="285"/>
            <Inp label="Nota (opcional)" value={np.nota} onChange={e=>sNP(p=>({...p,nota:e.target.value}))} placeholder="Observación..."/>
            <Btn onClick={addPesada}>Registrar</Btn>
          </Card>
          {[...(animal.pesadas||[])].reverse().map((p,i)=>(
            <Card key={i} className="py-3"><div className="flex justify-between items-center"><div><div className="text-white font-bold">{p.peso} kg</div><div className="text-zinc-500 text-xs">{p.fecha}{p.nota?` · ${p.nota}`:""}</div></div><Badge color="gray">{i===animal.pesadas.length-1?"entrada":"pesada"}</Badge></div></Card>
          ))}
        </div>
      )}

      {tab==="proyeccion"&&(
        <div className="flex flex-col gap-3">
          {[{meta:450,proj:p450},{meta:500,proj:p500}].map(({meta,proj})=>proj?(
            <Card key={meta}>
              <div className="text-emerald-400 font-black text-lg mb-3">Meta: {meta} kg</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-zinc-800 rounded-xl p-3 text-center"><div className="text-white font-black text-xl">{proj.dias} días</div><div className="text-zinc-500 text-xs">{proj.meses} meses</div></div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center"><div className="text-amber-400 font-black text-xl">{proj.canal} kg</div><div className="text-zinc-500 text-xs">peso canal</div></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[{v:`${proj.carneLimpia} kg`,l:"carne",c:"text-emerald-400"},{v:`${proj.huesos} kg`,l:"huesos",c:"text-zinc-300"},{v:`${proj.viseras} kg`,l:"vísceras",c:"text-zinc-300"}].map(s=>(
                  <div key={s.l} className="bg-zinc-800 rounded-xl p-2"><div className={`font-bold text-sm ${s.c}`}>{s.v}</div><div className="text-zinc-600 text-xs">{s.l}</div></div>
                ))}
              </div>
            </Card>
          ):<Card key={meta}><p className="text-zinc-500 text-sm text-center">Ya superó los {meta} kg</p></Card>)}
          <Card className="bg-zinc-800/40 border-zinc-600/40"><p className="text-zinc-500 text-xs">* Basado en GDP {gdp>0?"real del animal":"esperado para la raza"}. Varía según alimentación y condiciones.</p></Card>
        </div>
      )}

      {tab==="venta"&&(
        <div className="flex flex-col gap-3">
          {animal.pesadas?.length>=2?(
            <Card className={ev.conviene?"border-emerald-700/50 bg-emerald-950/30":"border-amber-700/50 bg-amber-950/30"}>
              <div className={`font-black text-base mb-2 ${ev.conviene?"text-emerald-400":"text-amber-400"}`}>{ev.conviene?"✅ Evalúa vender ahora":"⏳ Continuar engorde"}</div>
              <p className="text-zinc-300 text-sm">{ev.recomendacion}</p>
              <div className="mt-3 pt-3 border-t border-zinc-700 flex flex-col gap-1">
                <div className="flex justify-between text-xs"><span className="text-zinc-500">GDP real</span><span className="text-white font-bold">{gdp.toFixed(3)} kg/día</span></div>
                <div className="flex justify-between text-xs"><span className="text-zinc-500">Eficiencia</span><Badge color={ev.eficiencia==="buena"?"green":ev.eficiencia==="regular"?"yellow":"red"}>{ev.eficiencia}</Badge></div>
              </div>
            </Card>
          ):<Card><p className="text-zinc-500 text-sm text-center">Registrá al menos 2 pesadas para la recomendación de venta</p></Card>}
          <Card><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Calculadora de venta</div><VentaCalc pesoActual={ult} raza={raza}/></Card>
        </div>
      )}
    </div>
  );
}

function VentaCalc({ pesoActual, raza }) {
  const [pV,sPV]=useState("22"); const [pC,sPC]=useState("65");
  const pc=raza.pc_canal, canal=Math.round(pesoActual*pc), huesos=Math.round(canal*0.20), carne=canal-huesos, viseras=Math.round(pesoActual*0.08);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3"><Inp label="Bs/kg peso vivo" type="number" value={pV} onChange={e=>sPV(e.target.value)}/><Inp label="Bs/kg carne limpia" type="number" value={pC} onChange={e=>sPC(e.target.value)}/></div>
      <div className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex justify-between text-sm"><span className="text-zinc-400">Venta en pie ({pesoActual} kg)</span><span className="text-emerald-400 font-bold">Bs. {(pesoActual*parseFloat(pV||0)).toFixed(0)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-zinc-400">Venta por carne ({carne} kg)</span><span className="text-sky-400 font-bold">Bs. {(carne*parseFloat(pC||0)).toFixed(0)}</span></div>
        <div className="border-t border-zinc-700 mt-1 pt-2 text-zinc-500 text-xs">Canal: {canal} kg · Huesos: {huesos} kg · Vísceras: {viseras} kg · Rendimiento: {(pc*100).toFixed(0)}%</div>
      </div>
    </div>
  );
}

// ============================================================
// GESTIÓN DE ALIMENTOS Y PRECIOS
// ============================================================
function GestionAlimentos({ preciosUsr, onPrecio, customAl, onAddCustom }) {
  const [busq,sB]=useState(""); const [editId,sEI]=useState(null); const [editVal,sEV]=useState("");
  const [showForm,sSF]=useState(false);
  const [form,sForm]=useState({nombre:"",tipo:"energetico",ms:"",prot:"",em:"",fdn:"30",max_ms_pct:""});
  const todos=[...ALIMENTOS_BASE,...customAl];
  const filtrados=todos.filter(a=>a.nombre.toLowerCase().includes(busq.toLowerCase())||TIPO_LABELS[a.tipo]?.toLowerCase().includes(busq.toLowerCase()));
  const save=(id)=>{const v=parseFloat(editVal);if(!isNaN(v)&&v>=0)onPrecio(id,v);sEI(null);};
  const guardar=()=>{
    if(!form.nombre||!form.ms)return alert("Completá nombre y MS%");
    onAddCustom({...form,id:`c_${Date.now()}`,ms:+form.ms,prot:+(form.prot||0),em:+(form.em||0),fdn:+(form.fdn||30),max_ms_pct:form.max_ms_pct?+form.max_ms_pct:null,precio_kg:0});
    sForm({nombre:"",tipo:"energetico",ms:"",prot:"",em:"",fdn:"30",max_ms_pct:""});sSF(false);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-white">Alimentos y Precios</h2><Btn onClick={()=>sSF(!showForm)} className="text-xs py-1.5">+ Agregar</Btn></div>
      <Card className="bg-sky-950/30 border-sky-700/40"><p className="text-sky-300 text-xs">💡 Tocá el precio en verde para editarlo. Tus precios se usan en todos los cálculos automáticamente.</p></Card>
      {showForm&&(
        <Card className="flex flex-col gap-3">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nuevo alimento personalizado</div>
          <Inp label="Nombre" value={form.nombre} onChange={e=>sForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Pasto Colonial"/>
          <Sel label="Tipo" value={form.tipo} onChange={e=>sForm(f=>({...f,tipo:e.target.value}))}>{TIPOS_ORDER.map(t=><option key={t} value={t}>{TIPO_LABELS[t]}</option>)}</Sel>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="MS %" type="number" value={form.ms} onChange={e=>sForm(f=>({...f,ms:e.target.value}))} placeholder="22"/>
            <Inp label="PB %" type="number" value={form.prot} onChange={e=>sForm(f=>({...f,prot:e.target.value}))} placeholder="9"/>
            <Inp label="EM Mcal/kg MS" type="number" value={form.em} onChange={e=>sForm(f=>({...f,em:e.target.value}))} placeholder="2.1"/>
            <Inp label="FDN %" type="number" value={form.fdn} onChange={e=>sForm(f=>({...f,fdn:e.target.value}))} placeholder="65"/>
            <Inp label="Máx MS ración %" type="number" value={form.max_ms_pct} onChange={e=>sForm(f=>({...f,max_ms_pct:e.target.value}))} placeholder="Opcional"/>
          </div>
          <div className="flex gap-2"><Btn onClick={guardar} className="flex-1">Guardar</Btn><Btn variant="secondary" onClick={()=>sSF(false)} className="flex-1">Cancelar</Btn></div>
        </Card>
      )}
      <Inp placeholder="Buscar alimento..." value={busq} onChange={e=>sB(e.target.value)}/>
      {TIPOS_ORDER.map(tipo=>{
        const grupo=filtrados.filter(a=>a.tipo===tipo);
        if(!grupo.length)return null;
        return (
          <div key={tipo}>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{TIPO_LABELS[tipo]}</div>
            <div className="flex flex-col gap-2">
              {grupo.map(al=>{
                const precio=preciosUsr[al.id]!==undefined?preciosUsr[al.id]:al.precio_kg;
                return (
                  <Card key={al.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="text-white font-semibold text-sm">{al.nombre}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">MS:{al.ms}% · PB:{al.prot}% · EM:{al.em} · FDN:{al.fdn}%</div>
                        {al.max_ms_pct&&<div className="text-zinc-600 text-xs">Máx ración: {al.max_ms_pct}% MS</div>}
                      </div>
                      <div className="text-right">
                        {editId===al.id?(
                          <div className="flex items-center gap-1">
                            <input type="number" value={editVal} onChange={e=>sEV(e.target.value)} className="bg-zinc-700 border border-emerald-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none" autoFocus onKeyDown={e=>e.key==="Enter"&&save(al.id)}/>
                            <button onClick={()=>save(al.id)} className="text-emerald-400 font-bold px-1">✓</button>
                            <button onClick={()=>sEI(null)} className="text-zinc-500 px-1">✕</button>
                          </div>
                        ):(
                          <button onClick={()=>{sEI(al.id);sEV(precio.toString());}} className="text-emerald-400 font-bold text-sm hover:text-emerald-300 underline underline-offset-2">Bs.{precio.toFixed(2)}/kg ✏️</button>
                        )}
                        {al.id?.startsWith("c_")&&<div className="mt-1"><Badge color="blue">Custom</Badge></div>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// CALCULADORA DE RACIÓN
// ============================================================
function CalculadoraRacion({ preciosUsr, customAl }) {
  const [peso,sP]=useState(""); const [raza,sR]=useState("otro");
  const [selIds,sS]=useState(new Set()); const [busq,sB]=useState("");
  const [resultado,sRes]=useState(null); const [showSel,sSS]=useState(false);
  const [modo,sM]=useState("formulado");

  const todosAl=[...ALIMENTOS_BASE,...customAl];
  const filtrados=todosAl.filter(a=>a.nombre.toLowerCase().includes(busq.toLowerCase())||TIPO_LABELS[a.tipo]?.toLowerCase().includes(busq.toLowerCase()));
  const razaObj=RAZAS.find(r=>r.id===raza)||RAZAS[8];
  const seleccionados=todosAl.filter(a=>selIds.has(a.id));
  const toggle=(id)=>sS(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

  const calcular=()=>{
    if(!peso||parseFloat(peso)<80)return alert("Peso mínimo 80 kg");
    if(modo==="formulado"&&seleccionados.length===0)return alert("Seleccioná al menos un alimento");
    if(modo==="estandar"){const req=calcularRequerimientos(peso,razaObj);sRes({tipo:"estandar",req});}
    else{const res=formularRacion(seleccionados,peso,razaObj,preciosUsr);sRes({tipo:"formulado",res});}
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-white">🔬 Formulación de Ración</h2>
      <Card className="flex flex-col gap-4">
        <Inp label="Peso vivo (kg)" type="number" value={peso} onChange={e=>{sP(e.target.value);sRes(null);}} placeholder="Ej: 280"/>
        <Sel label="Raza" value={raza} onChange={e=>{sR(e.target.value);sRes(null);}}>
          {RAZAS.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Sel>
        <div className="flex gap-2">
          {[["estandar","🌾 Estándar NRC"],["formulado","🔬 Formular con mis alimentos"]].map(([id,lb])=>(
            <button key={id} onClick={()=>{sM(id);sRes(null);}} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${modo===id?"bg-emerald-600 border-emerald-500 text-white":"bg-zinc-800 border-zinc-600 text-zinc-400"}`}>{lb}</button>
          ))}
        </div>
        {modo==="formulado"&&(
          <div className="flex flex-col gap-3">
            <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3"><p className="text-zinc-400 text-xs">Elegí los alimentos que tenés. La app usa <span className="text-emerald-400 font-semibold">Cuadrado de Pearson + NRC-2000</span> para calcular las cantidades óptimas respetando MS 2-3% PV, FDN mínimo y seguridad ruminal.</p></div>
            <Btn variant="secondary" onClick={()=>sSS(!showSel)}>{showSel?"Cerrar":`+ Elegir alimentos${seleccionados.length>0?` (${seleccionados.length})`:""}` }</Btn>
            {showSel&&(
              <div className="flex flex-col gap-1">
                <Inp placeholder="Buscar..." value={busq} onChange={e=>sB(e.target.value)}/>
                {TIPOS_ORDER.map(tipo=>{
                  const gr=filtrados.filter(a=>a.tipo===tipo);
                  if(!gr.length)return null;
                  return(
                    <div key={tipo}>
                      <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1 mt-3">{TIPO_LABELS[tipo]}</div>
                      {gr.map(al=>(
                        <button key={al.id} onClick={()=>{toggle(al.id);sRes(null);}} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-all mb-1 ${selIds.has(al.id)?"border-emerald-600 bg-emerald-950/40 text-emerald-300":"border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500"}`}>
                          <div className="flex justify-between"><span className="font-semibold">{al.nombre}</span><span>{selIds.has(al.id)?"✓":""}</span></div>
                          <span className="text-zinc-500 text-xs">PB:{al.prot}% · EM:{al.em} · FDN:{al.fdn}% · Bs.{(preciosUsr[al.id]??al.precio_kg).toFixed(2)}/kg</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
            {seleccionados.length>0&&(
              <div className="flex flex-wrap gap-1.5">
                {seleccionados.map(al=>(
                  <span key={al.id} className="inline-flex items-center gap-1 bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                    {al.nombre.split("(")[0].trim()}<button onClick={()=>{toggle(al.id);sRes(null);}} className="text-emerald-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <Btn onClick={calcular} className="w-full py-3 text-base">Calcular Ración</Btn>
      </Card>

      {/* RESULTADO ESTÁNDAR */}
      {resultado?.tipo==="estandar"&&resultado.req&&(()=>{
        const req=resultado.req; const pv=parseFloat(peso);
        return(
          <Card>
            <div className="text-emerald-400 font-black text-base mb-1">🌾 Requerimientos NRC-2000</div>
            <p className="text-zinc-500 text-xs mb-4">{razaObj.nombre} · GDP esperado: {req.gdp} kg/día · Trópico boliviano</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{l:"EM/día",v:`${req.em_total.toFixed(2)} Mcal`,c:"text-amber-400"},{l:"PB/día",v:`${req.pb_total.toFixed(0)} g`,c:"text-sky-400"},{l:"MS óptima",v:`${req.ms_opt.toFixed(1)} kg`,c:"text-emerald-400"}].map(s=>(
                <div key={s.l} className="bg-zinc-800 rounded-xl p-3 text-center"><div className={`font-black text-base ${s.c}`}>{s.v}</div><div className="text-zinc-500 text-xs">{s.l}</div></div>
              ))}
            </div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Ración diaria sugerida</div>
            {[
              {n:"Pasto Mombasa/Marandu (fresco)",kg:(req.ms_opt*0.60/0.22).toFixed(1)},
              {n:"Maíz Amarillo (grano)",kg:(req.ms_opt*0.22/0.88).toFixed(1)},
              {n:"Torta de Soya 44%",kg:(req.ms_opt*0.08/0.88).toFixed(1)},
              {n:"Sal Mineral",kg:"0.08"},
              {n:"Bicarbonato de Sodio",kg:"0.10"},
            ].map(r=>(
              <div key={r.n} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-300 text-sm">{r.n}</span><span className="text-emerald-400 font-bold text-sm">{r.kg} kg</span>
              </div>
            ))}
            <div className="mt-3 bg-zinc-800/50 rounded-xl p-3"><p className="text-zinc-500 text-xs">MS rango saludable: {req.ms_min.toFixed(1)} – {req.ms_max.toFixed(1)} kg/día ({((req.ms_min/pv)*100).toFixed(0)}–{((req.ms_max/pv)*100).toFixed(0)}% PV)</p></div>
          </Card>
        );
      })()}

      {/* RESULTADO FORMULADO */}
      {resultado?.tipo==="formulado"&&resultado.res&&(()=>{
        const r=resultado.res;
        const bEM=parseFloat(r.balance_em), bPB=parseFloat(r.balance_prot);
        const msPV=parseFloat(r.ms_pct_pv);
        const msOk=msPV>=2.0&&msPV<=3.0;
        return(
          <div className="flex flex-col gap-3">
            {r.alertaAcidosis&&(
              <Card className="border-red-700/50 bg-red-950/30">
                <div className="text-red-400 font-bold text-sm mb-1">🚨 Riesgo de acidosis ruminal</div>
                <p className="text-zinc-400 text-xs">FDN: {r.fdn_pct}% de la MS (mín. recomendado: 35%). Agregá heno o paja. Considerá 100 g/día de bicarbonato de sodio como buffer.</p>
              </Card>
            )}
            {r.alertaPastoFresco&&!r.alertaAcidosis&&(
              <Card className="border-amber-700/50 bg-amber-950/30">
                <div className="text-amber-400 font-bold text-sm mb-1">⚠️ Precaución — pasto fresco</div>
                <p className="text-zinc-400 text-xs">Alta proporción de pasto verde. Puede causar timpanismo o acidez. Suplementá con heno seco y bicarbonato.</p>
              </Card>
            )}
            <Card>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sky-400 font-black text-base">🔬 Ración formulada</div>
                <Badge color="purple">Pearson + NRC</Badge>
              </div>
              <p className="text-zinc-500 text-xs mb-4">Método: {r.metodo}</p>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Ingredientes — kg tal cual / día</div>
              <div className="flex flex-col gap-2 mb-4">
                {r.racion.map((al,i)=>(
                  <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3">
                    <div><div className="text-white font-semibold text-sm">{al.nombre}</div><div className="text-zinc-500 text-xs">{TIPO_LABELS[al.tipo]}</div></div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-black text-lg">{al.kg_dia<0.1?`${(al.kg_dia*1000).toFixed(0)} g`:`${al.kg_dia} kg`}</div>
                      <div className="text-zinc-600 text-xs">{al.ms_kg} kg MS</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Resumen nutricional</div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  {l:"MS total",v:`${r.ms_total} kg`,sub:`${r.ms_pct_pv}% del PV`,ok:msOk},
                  {l:"FDN",v:`${r.fdn_pct}%`,sub:"mín. 35%",ok:parseFloat(r.fdn_pct)>=35},
                  {l:"EM aportada",v:`${r.em_total} Mcal`,sub:`req: ${r.req.em_total.toFixed(2)}`,ok:bEM>=-0.5},
                  {l:"PB aportada",v:`${r.prot_total} g`,sub:`req: ${r.req.pb_total.toFixed(0)} g`,ok:bPB>=-30},
                  {l:"Costo/día",v:`Bs. ${r.costo_total}`,sub:"",ok:true},
                  {l:"Costo/mes",v:`Bs. ${(parseFloat(r.costo_total)*30).toFixed(0)}`,sub:"",ok:true},
                ].map(s=>(
                  <div key={s.l} className="bg-zinc-800 rounded-xl p-3"><div className={`font-bold text-sm ${s.ok?"text-emerald-400":"text-red-400"}`}>{s.v}</div><div className="text-zinc-500 text-xs">{s.l}</div>{s.sub&&<div className="text-zinc-600 text-xs">{s.sub}</div>}</div>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-3 flex flex-col gap-1.5">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Balances (aportado − requerido)</div>
                {[{l:"Energía",v:r.balance_em,u:"Mcal"},{l:"Proteína bruta",v:r.balance_prot,u:"g"}].map(b=>{
                  const ok=parseFloat(b.v)>=-0.5;
                  return <div key={b.l} className="flex justify-between items-center"><span className="text-zinc-400 text-sm">{b.l}</span><Badge color={ok?"green":"red"}>{parseFloat(b.v)>0?"+":""}{b.v} {b.u}</Badge></div>;
                })}
              </div>
            </Card>
            {(bEM<-1.0||bPB<-80)&&(
              <Card className="border-amber-700/50 bg-amber-950/30">
                <div className="text-amber-300 font-bold text-sm mb-1">⚠️ Déficit nutricional</div>
                <p className="text-zinc-400 text-xs">{bEM<-1.0?"Déficit de energía → agregá maíz, sorgo o melaza. ":""}{bPB<-80?"Déficit de proteína → agregá torta de soya, harina de carne o gallinaza.":""}</p>
              </Card>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function App() {
  const [logged,sL]=useState(false);
  const [nav,sN]=useState("dashboard");
  const [animales,sA]=useState([]);
  const [animalSel,sAS]=useState(null);
  const [preciosUsr,sPU]=useState({});
  const [customAl,sCA]=useState([]);

  const navItems=[{id:"dashboard",i:"🏠",l:"Inicio"},{id:"animales",i:"🐄",l:"Animales"},{id:"racion",i:"🔬",l:"Ración"},{id:"alimentos",i:"📦",l:"Alimentos"}];

  if(!logged)return <LoginScreen onLogin={()=>sL(true)}/>;

  return(
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-xl">🐄</span><span className="font-black text-white tracking-tight">GanaBov Pro</span><Badge color="gray">Santa Cruz</Badge></div>
        <button onClick={()=>sL(false)} className="text-zinc-500 text-xs hover:text-zinc-300">Salir</button>
      </div>
      <div className="max-w-lg mx-auto px-4 py-5 pb-28">
        {nav==="dashboard"&&<Dashboard animales={animales} onNav={sN}/>}
        {nav==="animales"&&<ListaAnimales animales={animales} onSelect={a=>{sAS(a);sN("detalle");}} onNav={sN}/>}
        {nav==="nuevo"&&<NuevoAnimal onGuardar={a=>{sA(p=>[...p,a]);sN("animales");}} onBack={()=>sN("animales")}/>}
        {nav==="detalle"&&animalSel&&<DetalleAnimal animal={animalSel} onUpdate={a=>{sA(p=>p.map(x=>x.id===a.id?a:x));sAS(a);}} onDelete={id=>{sA(p=>p.filter(x=>x.id!==id));sN("animales");sAS(null);}} onBack={()=>sN("animales")} preciosUsr={preciosUsr}/>}
        {nav==="racion"&&<CalculadoraRacion preciosUsr={preciosUsr} customAl={customAl}/>}
        {nav==="alimentos"&&<GestionAlimentos preciosUsr={preciosUsr} onPrecio={(id,v)=>sPU(p=>({...p,[id]:v}))} customAl={customAl} onAddCustom={a=>sCA(p=>[...p,a])}/>}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex">
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>sN(item.id)} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${nav===item.id||(nav==="detalle"&&item.id==="animales")?"text-emerald-400":"text-zinc-600 hover:text-zinc-400"}`}>
            <span className="text-xl">{item.i}</span><span className="text-xs font-semibold">{item.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
       
