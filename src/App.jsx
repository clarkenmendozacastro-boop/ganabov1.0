import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, setDoc, getDoc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

// ============================================================
// ADMIN
// ============================================================
const ADMIN_EMAIL = "ganabovProappcuenta@gmail.com";

// ============================================================
// RUTAS FIRESTORE
// ============================================================
const userCol = (uid, col) => collection(db, "users", uid, col);
const userDoc = (uid, col, id) => doc(db, "users", uid, col, id);

// ============================================================
// SISTEMAS DE PRODUCCIÓN
// ============================================================
const SISTEMAS = {
  extensivo: {
    nombre: "🌾 Extensivo (pastoreo)",
    forraje: [85, 100],
    concentrado: [0, 15],
    ms: [2.0, 2.2],
    gdp: "0.3 - 0.7 kg/día",
    desc: "Alta fibra, bajo costo"
  },
  semiIntensivo: {
    nombre: "⚡ Semi-intensivo",
    forraje: [60, 75],
    concentrado: [25, 40],
    ms: [2.2, 2.7],
    gdp: "0.8 - 1.3 kg/día",
    desc: "Balanceado, crecimiento óptimo"
  },
  intensivo: {
    nombre: "🔥 Intensivo (feedlot)",
    forraje: [15, 35],
    concentrado: [65, 85],
    ms: [2.5, 3.0],
    gdp: "1.4 - 2.0 kg/día",
    desc: "Alta ganancia, máximo concentrado"
  }
};

// ============================================================
// ALIMENTOS BASE (más de 80 opciones)
// ============================================================
const ALIMENTOS_BASE = [
  { id:"mombasa", nombre:"Pasto Mombasa (fresco)", tipo:"forraje_fresco", ms:22, prot:8.5, em:2.10, fdn:68, max_ms_pct:null, precio_kg:0.50 },
  { id:"marandu", nombre:"Brachiaria Marandu (fresco)", tipo:"forraje_fresco", ms:25, prot:8.0, em:2.05, fdn:70, max_ms_pct:null, precio_kg:0.45 },
  { id:"brachiaria", nombre:"Brachiaria brizantha (fresco)", tipo:"forraje_fresco", ms:24, prot:7.8, em:2.00, fdn:72, max_ms_pct:null, precio_kg:0.45 },
  { id:"tanzania", nombre:"Pasto Tanzania (fresco)", tipo:"forraje_fresco", ms:21, prot:9.2, em:2.12, fdn:67, max_ms_pct:null, precio_kg:0.50 },
  { id:"xaraes", nombre:"Brachiaria Xaraés (fresco)", tipo:"forraje_fresco", ms:23, prot:8.3, em:2.08, fdn:71, max_ms_pct:null, precio_kg:0.45 },
  { id:"estrella", nombre:"Pasto Estrella Africana (fresco)", tipo:"forraje_fresco", ms:20, prot:9.0, em:2.15, fdn:65, max_ms_pct:null, precio_kg:0.50 },
  { id:"maralfalfa", nombre:"Maralfalfa (fresco)", tipo:"forraje_fresco", ms:18, prot:11.5, em:2.20, fdn:60, max_ms_pct:null, precio_kg:0.60 },
  { id:"king_grass", nombre:"King Grass (fresco)", tipo:"forraje_fresco", ms:19, prot:8.8, em:2.05, fdn:68, max_ms_pct:null, precio_kg:0.45 },
  { id:"pennisetum", nombre:"Pennisetum purpureum (fresco)", tipo:"forraje_fresco", ms:20, prot:9.5, em:2.18, fdn:64, max_ms_pct:null, precio_kg:0.50 },
  { id:"sorgo_forr", nombre:"Sorgo Forrajero (fresco)", tipo:"forraje_fresco", ms:23, prot:7.5, em:2.10, fdn:66, max_ms_pct:null, precio_kg:0.40 },
  { id:"caña_verde", nombre:"Caña de Azúcar (fresca)", tipo:"forraje_fresco", ms:26, prot:2.8, em:2.50, fdn:55, max_ms_pct:null, precio_kg:0.25 },
  { id:"alfalfa_verde", nombre:"Alfalfa (fresca)", tipo:"forraje_fresco", ms:23, prot:18.0, em:2.40, fdn:42, max_ms_pct:null, precio_kg:0.80 },
  { id:"pasto_bermuda", nombre:"Pasto Bermuda (fresco)", tipo:"forraje_fresco", ms:28, prot:7.0, em:1.95, fdn:72, max_ms_pct:null, precio_kg:0.40 },
  { id:"pasto_rhodes", nombre:"Pasto Rhodes (fresco)", tipo:"forraje_fresco", ms:22, prot:8.0, em:2.00, fdn:70, max_ms_pct:null, precio_kg:0.45 },
  { id:"pasto_guinea", nombre:"Pasto Guinea (fresco)", tipo:"forraje_fresco", ms:21, prot:9.0, em:2.10, fdn:66, max_ms_pct:null, precio_kg:0.50 },
  { id:"avena_forr", nombre:"Avena Forrajera (fresco)", tipo:"forraje_fresco", ms:24, prot:10.0, em:2.25, fdn:58, max_ms_pct:null, precio_kg:0.55 },
  { id:"ryegrass", nombre:"Ryegrass (fresco)", tipo:"forraje_fresco", ms:18, prot:12.0, em:2.30, fdn:54, max_ms_pct:null, precio_kg:0.70 },
  { id:"trigo_forr", nombre:"Trigo Forrajero (fresco)", tipo:"forraje_fresco", ms:26, prot:8.5, em:2.15, fdn:62, max_ms_pct:null, precio_kg:0.45 },
  { id:"heno_marandu", nombre:"Heno de Marandu", tipo:"heno_silo", ms:88, prot:6.5, em:1.90, fdn:74, max_ms_pct:60, precio_kg:1.20 },
  { id:"heno_estrella", nombre:"Heno de Estrella", tipo:"heno_silo", ms:88, prot:7.0, em:1.95, fdn:72, max_ms_pct:60, precio_kg:1.30 },
  { id:"heno_alfalfa", nombre:"Heno de Alfalfa", tipo:"heno_silo", ms:90, prot:17.0, em:2.20, fdn:44, max_ms_pct:50, precio_kg:2.50 },
  { id:"silo_maiz", nombre:"Silaje de Maíz", tipo:"heno_silo", ms:33, prot:8.0, em:2.70, fdn:48, max_ms_pct:60, precio_kg:0.80 },
  { id:"silo_sorgo", nombre:"Silaje de Sorgo", tipo:"heno_silo", ms:30, prot:7.5, em:2.50, fdn:55, max_ms_pct:60, precio_kg:0.70 },
  { id:"silo_brachiaria", nombre:"Silaje de Brachiaria", tipo:"heno_silo", ms:30, prot:7.0, em:1.95, fdn:68, max_ms_pct:60, precio_kg:0.65 },
  { id:"silo_avena", nombre:"Silaje de Avena", tipo:"heno_silo", ms:32, prot:9.0, em:2.40, fdn:58, max_ms_pct:60, precio_kg:0.85 },
  { id:"heno_bermuda", nombre:"Heno de Bermuda", tipo:"heno_silo", ms:89, prot:6.0, em:1.85, fdn:73, max_ms_pct:60, precio_kg:1.10 },
  { id:"heno_rhodes", nombre:"Heno de Rhodes", tipo:"heno_silo", ms:88, prot:7.0, em:1.90, fdn:71, max_ms_pct:60, precio_kg:1.15 },
  { id:"silo_pasto", nombre:"Silaje de Pasto Guinea", tipo:"heno_silo", ms:28, prot:7.5, em:2.00, fdn:67, max_ms_pct:60, precio_kg:0.70 },
  { id:"silo_king", nombre:"Silaje de King Grass", tipo:"heno_silo", ms:29, prot:8.0, em:2.05, fdn:65, max_ms_pct:60, precio_kg:0.75 },
  { id:"bagazo_caña", nombre:"Bagazo de Caña (seco)", tipo:"heno_silo", ms:91, prot:2.5, em:1.55, fdn:85, max_ms_pct:20, precio_kg:0.20 },
  { id:"maiz_am", nombre:"Maíz Amarillo (grano)", tipo:"energetico", ms:88, prot:8.5, em:3.30, fdn:12, max_ms_pct:40, precio_kg:2.20 },
  { id:"maiz_bl", nombre:"Maíz Blanco (grano)", tipo:"energetico", ms:88, prot:8.2, em:3.28, fdn:12, max_ms_pct:40, precio_kg:2.10 },
  { id:"sorgo_rojo", nombre:"Sorgo Rojo (grano)", tipo:"energetico", ms:88, prot:9.0, em:3.10, fdn:14, max_ms_pct:40, precio_kg:1.90 },
  { id:"sorgo_blanco", nombre:"Sorgo Blanco (grano)", tipo:"energetico", ms:88, prot:8.8, em:3.12, fdn:14, max_ms_pct:40, precio_kg:1.85 },
  { id:"cebada_grano", nombre:"Cebada (grano)", tipo:"energetico", ms:88, prot:11.5, em:3.05, fdn:18, max_ms_pct:30, precio_kg:2.50 },
  { id:"trigo_grano", nombre:"Trigo (grano)", tipo:"energetico", ms:88, prot:12.5, em:3.20, fdn:13, max_ms_pct:30, precio_kg:2.80 },
  { id:"yuca_seca", nombre:"Yuca Seca (chips)", tipo:"energetico", ms:88, prot:2.8, em:3.10, fdn:10, max_ms_pct:30, precio_kg:1.50 },
  { id:"yuca_fresca", nombre:"Yuca Raíz (fresca)", tipo:"energetico", ms:35, prot:2.5, em:3.00, fdn:10, max_ms_pct:30, precio_kg:0.90 },
  { id:"melaza", nombre:"Melaza de Caña", tipo:"energetico", ms:74, prot:3.5, em:2.60, fdn:0, max_ms_pct:10, precio_kg:1.20 },
  { id:"grasa_bypass", nombre:"Grasa Bypass", tipo:"energetico", ms:99, prot:0.0, em:5.60, fdn:0, max_ms_pct:5, precio_kg:12.0 },
  { id:"arroz_pulido", nombre:"Arroz Pulido (quebrado)", tipo:"energetico", ms:88, prot:7.0, em:3.25, fdn:10, max_ms_pct:40, precio_kg:2.30 },
  { id:"cana_miel", nombre:"Cachaza (melaza residual)", tipo:"energetico", ms:70, prot:4.0, em:2.55, fdn:5, max_ms_pct:15, precio_kg:0.90 },
  { id:"maiz_flor", nombre:"Maíz Flor (descarte)", tipo:"energetico", ms:86, prot:7.5, em:3.10, fdn:15, max_ms_pct:35, precio_kg:1.80 },
  { id:"sorgo_harinoso", nombre:"Sorgo Harinoso", tipo:"energetico", ms:87, prot:8.0, em:3.00, fdn:16, max_ms_pct:40, precio_kg:1.70 },
  { id:"trigo_harina", nombre:"Harina de Trigo (alimento)", tipo:"energetico", ms:89, prot:11.0, em:3.15, fdn:14, max_ms_pct:30, precio_kg:2.40 },
  { id:"salvado_trigo", nombre:"Salvado / Afrechillo de Trigo", tipo:"subproducto", ms:88, prot:15.0, em:2.80, fdn:42, max_ms_pct:20, precio_kg:1.80 },
  { id:"cascara_soya", nombre:"Cascarilla de Soya", tipo:"subproducto", ms:90, prot:12.0, em:2.50, fdn:62, max_ms_pct:20, precio_kg:2.00 },
  { id:"pulpa_citrico", nombre:"Pulpa de Cítricos (seca)", tipo:"subproducto", ms:91, prot:6.5, em:2.80, fdn:22, max_ms_pct:15, precio_kg:2.20 },
  { id:"pulpa_remola", nombre:"Pulpa de Remolacha", tipo:"subproducto", ms:91, prot:9.0, em:2.90, fdn:45, max_ms_pct:15, precio_kg:2.50 },
  { id:"afrecho_arroz", nombre:"Afrecho de Arroz Integral", tipo:"subproducto", ms:90, prot:12.5, em:2.70, fdn:28, max_ms_pct:15, precio_kg:1.60 },
  { id:"germen_maiz", nombre:"Germen de Maíz", tipo:"subproducto", ms:90, prot:10.0, em:3.00, fdn:15, max_ms_pct:15, precio_kg:1.70 },
  { id:"cascara_algodon", nombre:"Cascarilla de Algodón", tipo:"subproducto", ms:92, prot:5.0, em:1.90, fdn:75, max_ms_pct:20, precio_kg:1.20 },
  { id:"cascara_girasol", nombre:"Cascarilla de Girasol", tipo:"subproducto", ms:90, prot:8.0, em:2.10, fdn:55, max_ms_pct:20, precio_kg:1.30 },
  { id:"granza_cerveza", nombre:"Granza de Cervecería", tipo:"subproducto", ms:25, prot:18.0, em:2.50, fdn:35, max_ms_pct:15, precio_kg:0.60 },
  { id:"torta_caña", nombre:"Torta de Caña (bagacillo)", tipo:"subproducto", ms:85, prot:3.0, em:1.70, fdn:78, max_ms_pct:15, precio_kg:0.25 },
  { id:"torta_soya44", nombre:"Torta de Soya (44% PB)", tipo:"proteico", ms:88, prot:44.0, em:3.20, fdn:10, max_ms_pct:15, precio_kg:4.50 },
  { id:"torta_soya48", nombre:"Torta de Soya (48% PB)", tipo:"proteico", ms:88, prot:48.0, em:3.10, fdn:8, max_ms_pct:15, precio_kg:5.00 },
  { id:"torta_algod", nombre:"Torta de Algodón", tipo:"proteico", ms:90, prot:36.0, em:2.70, fdn:25, max_ms_pct:10, precio_kg:3.50 },
  { id:"torta_girasol", nombre:"Torta de Girasol", tipo:"proteico", ms:90, prot:32.0, em:2.60, fdn:30, max_ms_pct:10, precio_kg:3.20 },
  { id:"torta_palmiste", nombre:"Torta de Palmiste", tipo:"proteico", ms:90, prot:16.0, em:2.70, fdn:55, max_ms_pct:10, precio_kg:2.80 },
  { id:"torta_copra", nombre:"Torta de Copra (coco)", tipo:"proteico", ms:90, prot:21.0, em:2.80, fdn:50, max_ms_pct:10, precio_kg:3.00 },
  { id:"soya_integral", nombre:"Soya Integral Tostada", tipo:"proteico", ms:90, prot:38.0, em:3.80, fdn:12, max_ms_pct:10, precio_kg:4.80 },
  { id:"h_sangre", nombre:"Harina de Sangre", tipo:"proteico_animal", ms:92, prot:80.0, em:2.90, fdn:0, max_ms_pct:3, precio_kg:9.00 },
  { id:"h_carne", nombre:"Harina de Carne y Hueso", tipo:"proteico_animal", ms:92, prot:50.0, em:2.80, fdn:0, max_ms_pct:5, precio_kg:7.00 },
  { id:"h_pescado", nombre:"Harina de Pescado (65% PB)", tipo:"proteico_animal", ms:92, prot:65.0, em:3.10, fdn:0, max_ms_pct:5, precio_kg:10.0 },
  { id:"h_plumas", nombre:"Harina de Plumas Hidrolizada", tipo:"proteico_animal", ms:93, prot:75.0, em:2.60, fdn:0, max_ms_pct:3, precio_kg:6.50 },
  { id:"h_hueso", nombre:"Harina de Hueso", tipo:"proteico_animal", ms:96, prot:12.0, em:0.00, fdn:0, max_ms_pct:2, precio_kg:3.50 },
  { id:"gallinaza", nombre:"Gallinaza Tratada", tipo:"proteico_animal", ms:88, prot:28.0, em:1.80, fdn:15, max_ms_pct:5, precio_kg:0.80 },
  { id:"pollinaza", nombre:"Pollinaza (cama de pollo)", tipo:"proteico_animal", ms:86, prot:30.0, em:1.85, fdn:20, max_ms_pct:5, precio_kg:0.70 },
  { id:"sal_mineral", nombre:"Sal Mineral Completa", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:1, precio_kg:6.50 },
  { id:"sal_comun", nombre:"Sal Común (NaCl)", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:0.5, precio_kg:1.50 },
  { id:"bicarbonato", nombre:"Bicarbonato de Sodio (buffer)", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:0.5, precio_kg:4.00 },
  { id:"oxido_mg", nombre:"Óxido de Magnesio", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:0.3, precio_kg:8.00 },
  { id:"urea", nombre:"Urea Ganadera (46% N)", tipo:"suplemento", ms:99, prot:281.0, em:0.00, fdn:0, max_ms_pct:0.5, precio_kg:8.00 },
  { id:"monensina", nombre:"Monensina (ionóforo)", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:0.02, precio_kg:80.0 },
  { id:"fosfato_bic", nombre:"Fosfato Bicálcico", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:0.5, precio_kg:5.00 },
  { id:"carbonato_ca", nombre:"Carbonato de Calcio", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:0.5, precio_kg:2.50 },
  { id:"zeolita", nombre:"Zeolita (adsorbente)", tipo:"suplemento", ms:99, prot:0.0, em:0.00, fdn:0, max_ms_pct:1, precio_kg:2.00 },
  { id:"lecitina_soya", nombre:"Lectina de Soya", tipo:"suplemento", ms:95, prot:0.0, em:4.50, fdn:0, max_ms_pct:0.5, precio_kg:18.0 },
  { id:"propanodiol", nombre:"Propilenglicol", tipo:"suplemento", ms:100, prot:0.0, em:3.50, fdn:0, max_ms_pct:0.3, precio_kg:15.0 }
];

const RAZAS = [
  { id:"nelore", nombre:"Nelore", gdp_base:0.90, pc_canal:0.54, ajuste_ms:0.025 },
  { id:"brahman", nombre:"Brahman", gdp_base:0.85, pc_canal:0.53, ajuste_ms:0.025 },
  { id:"nelore_brahman", nombre:"Cruce Nelore × Brahman", gdp_base:0.95, pc_canal:0.55, ajuste_ms:0.026 },
  { id:"angus_brahman", nombre:"Cruce Angus × Brahman", gdp_base:1.00, pc_canal:0.56, ajuste_ms:0.027 },
  { id:"senepol", nombre:"Senepol", gdp_base:0.88, pc_canal:0.54, ajuste_ms:0.025 },
  { id:"simmental", nombre:"Cruce Simmental", gdp_base:1.05, pc_canal:0.57, ajuste_ms:0.027 },
  { id:"criollo", nombre:"Criollo Boliviano", gdp_base:0.55, pc_canal:0.50, ajuste_ms:0.022 },
  { id:"criollo_cruce", nombre:"Criollo con cruce cebuíno", gdp_base:0.70, pc_canal:0.51, ajuste_ms:0.023 },
  { id:"otro", nombre:"Otro / No definido", gdp_base:0.78, pc_canal:0.52, ajuste_ms:0.024 },
];

const TIPO_LABELS = {
  forraje_fresco:"🌿 Forraje fresco", heno_silo:"🌾 Heno / Silaje",
  energetico:"🌽 Energético", subproducto:"♻️ Subproducto",
  proteico:"🫘 Proteico vegetal", proteico_animal:"🩸 Proteico animal",
  suplemento:"💊 Suplemento",
};
const TIPOS_ORDER = ["forraje_fresco","heno_silo","energetico","subproducto","proteico","proteico_animal","suplemento"];

// ============================================================
// FUNCIONES NUTRICIONALES NRC-2000
// ============================================================
function calcularRequerimientos(pv, razaObj, sistemaId) {
  const pvN = parseFloat(pv);
  if (!pvN || pvN < 80) return null;
  const gdpBase = razaObj ? razaObj.gdp_base : 0.78;
  const sistema = SISTEMAS[sistemaId];
  const msPctPromedio = (sistema.ms[0] + sistema.ms[1]) / 2 / 100;
  const ms_opt = pvN * msPctPromedio;
  const ms_min = pvN * (sistema.ms[0]/100);
  const ms_max = pvN * (sistema.ms[1]/100);
  const gdp = gdpBase;
  const pvMet = Math.pow(pvN, 0.75);
  const em_mant = 0.077 * pvMet * 1.10;
  const em_crec = gdp * (0.0635 * Math.pow(pvN, 0.6) + 4.1 * gdp);
  const em_total = em_mant + em_crec;
  const prot_mant = 3.8 * pvMet;
  const prot_crec = gdp * 268 - 29.4 * (em_crec / gdp);
  const pb_total = (prot_mant + prot_crec) / 0.65;
  return { em_total, pb_total, ms_min, ms_opt, ms_max, gdp, pvN, sistemaId };
}

// Selección de ingredientes según modo
function obtenerIngredientesPorModo(modo, sistemaId, preciosUsr, customAl) {
  const todosAlimentos = [...ALIMENTOS_BASE, ...customAl];
  let forrajes = todosAlimentos.filter(a => a.tipo === "forraje_fresco" || a.tipo === "heno_silo");
  let concentrados = todosAlimentos.filter(a => ["energetico","proteico","proteico_animal","subproducto"].includes(a.tipo));
  
  if (modo === "automatico") {
    const mejorForraje = forrajes.sort((a,b) => (b.em / (preciosUsr[b.id]??b.precio_kg)) - (a.em / (preciosUsr[a.id]??a.precio_kg)))[0];
    const mejorEnergetico = concentrados.filter(c => c.tipo === "energetico").sort((a,b) => (b.em / (preciosUsr[b.id]??b.precio_kg)) - (a.em / (preciosUsr[a.id]??a.precio_kg)))[0];
    const mejorProteico = concentrados.filter(c => c.tipo === "proteico" || c.tipo === "proteico_animal").sort((a,b) => (b.prot / (preciosUsr[b.id]??b.precio_kg)) - (a.prot / (preciosUsr[a.id]??a.precio_kg)))[0];
    return { forrajes: [mejorForraje], concentrados: [mejorEnergetico, mejorProteico].filter(Boolean) };
  } 
  else if (modo === "economico") {
    const forrajeBarato = forrajes.sort((a,b) => (preciosUsr[a.id]??a.precio_kg) - (preciosUsr[b.id]??b.precio_kg))[0];
    const energeticoBarato = concentrados.filter(c => c.tipo === "energetico").sort((a,b) => (preciosUsr[a.id]??a.precio_kg) - (preciosUsr[b.id]??b.precio_kg))[0];
    const proteicoBarato = concentrados.filter(c => c.tipo === "proteico" || c.tipo === "proteico_animal").sort((a,b) => (preciosUsr[a.id]??a.precio_kg) - (preciosUsr[b.id]??b.precio_kg))[0];
    return { forrajes: [forrajeBarato], concentrados: [energeticoBarato, proteicoBarato].filter(Boolean) };
  }
  return null;
}

// Función de formulación genérica
function formularRacionConIngredientes(forrajesSeleccionados, concentradosSeleccionados, pv, razaObj, sistemaId, preciosUsr, minsPersonalizados = {}) {
  const req = calcularRequerimientos(pv, razaObj, sistemaId);
  if (!req) return null;
  const sistema = SISTEMAS[sistemaId];
  const getPrecio = al => preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg;
  const getMinKg = al => minsPersonalizados[al.id] !== undefined ? minsPersonalizados[al.id] : 0;
  
  const msObjetivo = req.ms_opt;
  const pctForraje = (sistema.forraje[0] + sistema.forraje[1]) / 2 / 100;
  const pctConcentrado = (sistema.concentrado[0] + sistema.concentrado[1]) / 2 / 100;
  let msForraje = msObjetivo * pctForraje;
  let msConcentrado = msObjetivo * pctConcentrado;
  
  let racion = [];
  let ms_u = 0, em_u = 0, prot_u = 0, fdn_u = 0;
  
  const add = (al, kg) => {
    if (kg <= 0.001) return;
    const msKg = kg * (al.ms / 100);
    racion.push({ ...al, kg_dia: +kg.toFixed(3), ms_kg: +msKg.toFixed(3), precio_kg: getPrecio(al) });
    ms_u += msKg;
    em_u += msKg * al.em;
    prot_u += msKg * (al.prot / 100) * 1000;
    fdn_u += msKg * (al.fdn / 100);
  };
  
  // Suplementos fijos (todos los que estén en la lista de seleccionados)
  const suplementos = [...forrajesSeleccionados, ...concentradosSeleccionados].filter(a => a.tipo === "suplemento");
  suplementos.forEach(s => {
    let kg = 0;
    if (s.id === "sal_mineral") kg = req.pvN * 0.00008;
    else if (s.id === "bicarbonato") kg = 0.1;
    else if (s.id === "oxido_mg") kg = 0.05;
    else if (s.id === "urea") kg = Math.min(0.05, req.pvN * 0.0001);
    else if (s.id === "monensina") kg = 0.0003;
    else if (s.id === "fosfato_bic") kg = 0.04;
    else if (s.id === "zeolita") kg = 0.05;
    else if (s.id === "lecitina_soya") kg = 0.02;
    else if (s.id === "propanodiol") kg = 0.03;
    else kg = 0.06;
    add(s, kg);
  });
  
  // Forrajes (respetando mínimos)
  let msForRestante = msForraje;
  forrajesSeleccionados.forEach(f => {
    const minKg = getMinKg(f);
    if (minKg > 0) {
      let msMin = minKg * (f.ms/100);
      if (msMin <= msForRestante) {
        add(f, minKg);
        msForRestante -= msMin;
      } else {
        add(f, msForRestante / (f.ms/100));
        msForRestante = 0;
      }
    }
  });
  if (msForRestante > 0.05 && forrajesSeleccionados.length) {
    const fraccion = msForRestante / forrajesSeleccionados.length;
    forrajesSeleccionados.forEach(f => add(f, fraccion / (f.ms/100)));
  }
  
  // Concentrados
  let msConcRestante = msConcentrado;
  concentradosSeleccionados.forEach(c => {
    const minKg = getMinKg(c);
    if (minKg > 0) {
      let msMin = minKg * (c.ms/100);
      if (msMin <= msConcRestante) {
        add(c, minKg);
        msConcRestante -= msMin;
      } else {
        add(c, msConcRestante / (c.ms/100));
        msConcRestante = 0;
      }
    }
  });
  if (msConcRestante > 0.05 && concentradosSeleccionados.length) {
    const em_def = Math.max(0, req.em_total - em_u);
    const prot_def = Math.max(0, req.pb_total - prot_u);
    const protObjPct = msConcRestante > 0 ? (prot_def / 1000 / msConcRestante) * 100 : 14;
    const protObjClamped = Math.min(Math.max(protObjPct, 10), 28);
    const disponibles = concentradosSeleccionados.filter(c => !getMinKg(c));
    let mejorE = disponibles.filter(c => c.tipo === "energetico").sort((a,b)=>b.em - a.em)[0];
    let mejorP = disponibles.filter(c => c.tipo === "proteico" || c.tipo === "proteico_animal").sort((a,b)=>b.prot - a.prot)[0];
    if (!mejorE) mejorE = disponibles[0];
    if (!mejorP) mejorP = disponibles[0];
    let fracciones = {};
    if (mejorE && mejorP && mejorP.prot > protObjClamped && mejorE.prot < protObjClamped) {
      const partE = mejorP.prot - protObjClamped;
      const partP = protObjClamped - mejorE.prot;
      const total = partE + partP;
      fracciones[mejorE.id] = partE / total;
      fracciones[mejorP.id] = partP / total;
      const otros = disponibles.filter(a => a.id !== mejorE.id && a.id !== mejorP.id);
      if (otros.length) {
        const factorOtros = 0.15;
        fracciones[mejorE.id] *= (1 - factorOtros);
        fracciones[mejorP.id] *= (1 - factorOtros);
        const resto = factorOtros / otros.length;
        otros.forEach(a => fracciones[a.id] = resto);
      }
    } else {
      const totalPuntaje = disponibles.reduce((sum, a) => sum + (a.em * 0.6 + (a.prot/100)*0.4), 0);
      disponibles.forEach(a => fracciones[a.id] = (a.em * 0.6 + (a.prot/100)*0.4) / totalPuntaje);
    }
    disponibles.forEach(c => {
      const frac = fracciones[c.id];
      if (!frac) return;
      let ms_al = msConcRestante * frac;
      if (c.max_ms_pct) ms_al = Math.min(ms_al, req.ms_max * (c.max_ms_pct/100));
      if (ms_al < 0.05) return;
      add(c, ms_al / (c.ms/100));
    });
  }
  
  // Ajuste iterativo
  let iter = 0;
  while ((req.em_total - em_u > 0.3 || req.pb_total - prot_u > 50) && iter < 3 && ms_u < req.ms_max * 0.98) {
    iter++;
    const deficitEM = Math.max(0, req.em_total - em_u);
    const deficitPB = Math.max(0, req.pb_total - prot_u);
    const msDisponible = Math.max(0, req.ms_max - ms_u);
    if (msDisponible < 0.1) break;
    let refuerzoEn = [...concentradosSeleccionados].sort((a,b)=>b.em - a.em)[0];
    let refuerzoPr = [...concentradosSeleccionados].sort((a,b)=>b.prot - a.prot)[0];
    if (deficitEM > 0.3 && refuerzoEn && msDisponible > 0.1) {
      let msExtra = Math.min(deficitEM / refuerzoEn.em, msDisponible);
      msExtra = Math.max(msExtra, 0.2);
      add(refuerzoEn, msExtra / (refuerzoEn.ms / 100));
    }
    if (deficitPB > 50 && refuerzoPr && msDisponible > 0.1) {
      let msExtra = Math.min(deficitPB / 1000 / (refuerzoPr.prot/100), msDisponible);
      msExtra = Math.max(msExtra, 0.1);
      add(refuerzoPr, msExtra / (refuerzoPr.ms / 100));
    }
  }
  
  const fdn_pct = ms_u > 0 ? (fdn_u / ms_u) * 100 : 0;
  const costo = racion.reduce((s, a) => s + a.kg_dia * getPrecio(a), 0);
  const balance_em = (em_u - req.em_total).toFixed(2);
  const balance_prot = (prot_u - req.pb_total).toFixed(0);
  const pctConcReal = (concentradosSeleccionados.reduce((acc, c) => {
    const item = racion.find(r => r.id === c.id);
    return acc + (item ? (item.kg_dia * (c.ms/100)) : 0);
  }, 0) / ms_u) * 100;
  
  let alertas = [];
  if (pctConcReal > 85) alertas.push({ tipo: "critico", msg: "⚠️ RIESGO CRÍTICO: Concentrado >85% - Peligro de acidosis ruminal. Aumente la fibra." });
  if (sistemaId === "semiIntensivo" && pctConcReal > 40) alertas.push({ tipo: "advertencia", msg: "⚠️ El nivel de concentrado excede el estándar para sistema semi-intensivo (>40%)." });
  if (fdn_pct < 35) alertas.push({ tipo: "critico", msg: "🚨 FDN bajo (<35%) - Riesgo de acidosis. Agregue heno o paja." });
  if (fdn_pct < 42 && sistemaId !== "intensivo") alertas.push({ tipo: "advertencia", msg: "⚠️ FDN moderado (<42%) - Puede haber problemas de rumia." });
  
  return {
    racion, req,
    ms_total: ms_u.toFixed(2),
    ms_pct_pv: ((ms_u / req.pvN) * 100).toFixed(1),
    em_total: em_u.toFixed(2),
    prot_total: prot_u.toFixed(0),
    fdn_pct: fdn_pct.toFixed(1),
    costo_total: costo.toFixed(2),
    balance_em, balance_prot,
    alertas,
    sistemaUsado: sistemaId,
    pctConcReal: pctConcReal.toFixed(1)
  };
}

// ============================================================
// FUNCIONES AUXILIARES (GDP, proyecciones, venta)
// ============================================================
function calcularGDP(pesadas) {
  if(!pesadas||pesadas.length<2)return 0;
  const p1=pesadas[0],p2=pesadas[pesadas.length-1];
  const dias=Math.max(1,(new Date(p2.fecha)-new Date(p1.fecha))/86400000);
  return (p2.peso-p1.peso)/dias;
}
function calcularProyeccion(pesoActual,pesoMeta,gdp,razaObj) {
  if(pesoMeta<=pesoActual||gdp<=0)return null;
  const dias=Math.ceil((pesoMeta-pesoActual)/gdp);
  const pc=razaObj?razaObj.pc_canal:0.52;
  const canal=Math.round(pesoMeta*pc),huesos=Math.round(canal*0.20);
  return{dias,meses:(dias/30).toFixed(1),canal,carneLimpia:canal-huesos,huesos,viseras:Math.round(pesoMeta*0.08)};
}
function evaluarVenta(ult,gdp,razaObj) {
  const gdpE=razaObj?razaObj.gdp_base:0.78;
  const ef=gdp>=gdpE*0.85?"buena":gdp>=gdpE*0.60?"regular":"baja";
  let rec="",conv=false;
  if(ult>=450){conv=true;rec="Animal en peso óptimo (450+ kg). Evalúe venta inmediata.";}
  else if(ef==="baja"&&ult>=380){conv=true;rec="Conversión baja y peso cercano al comercial. Puede ser más rentable vender ahora.";}
  else if(ef==="baja")rec="Conversión baja pero peso insuficiente. Ajuste la ración primero.";
  else rec=`Buena conversión (${gdp.toFixed(2)} kg/día). Continúe hasta 430-450 kg.`;
  return{eficiencia:ef,recomendacion:rec,conviene:conv};
}
function recomendarAjuste(gdp,razaObj,esCriollo) {
  const gdpE=razaObj?razaObj.gdp_base:0.78;
  if(gdp>=gdpE*0.85)return[];
  const d=gdpE-gdp,aj=[];
  if(d>0.25)aj.push({titulo:"↑ Energía urgente",detalle:"Aumentar 2-3 kg maíz o sorgo/día",costo:"4-6 Bs/día extra"});
  else aj.push({titulo:"↑ Energía moderada",detalle:"Agregar 0.5-1 kg maíz o melaza/día",costo:"1-2 Bs/día extra"});
  if(gdp<gdpE*0.70)aj.push({titulo:"↑ Proteína",detalle:"Agregar 300-500g torta de soya o harina de carne",costo:"1.5-3.5 Bs/día extra"});
  if(esCriollo)aj.push({titulo:"ℹ️ Raza criolla",detalle:`GDP esperado: ${gdpE} kg/día (más lento que cebuínos).`,costo:""});
  return aj;
}

// ============================================================
// COMPONENTES UI
// ============================================================
const Badge=({children,color="green"})=>{
  const c={green:"bg-emerald-900/50 text-emerald-300 border-emerald-700",yellow:"bg-amber-900/50 text-amber-300 border-amber-700",red:"bg-red-900/50 text-red-300 border-red-700",blue:"bg-sky-900/50 text-sky-300 border-sky-700",gray:"bg-zinc-800 text-zinc-400 border-zinc-600",purple:"bg-purple-900/50 text-purple-300 border-purple-700"};
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${c[color]||c.gray}`}>{children}</span>;
};
const Card=({children,className=""})=><div className={`bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 ${className}`}>{children}</div>;
const Inp=({label,...p})=>(<div className="flex flex-col gap-1">{label&&<label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>}<input className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all placeholder-zinc-500" {...p}/></div>);
const Sel=({label,children,...p})=>(<div className="flex flex-col gap-1">{label&&<label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>}<select className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all" {...p}>{children}</select></div>);
const Btn=({children,onClick,variant="primary",className="",disabled=false})=>{
  const v={primary:"bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500",secondary:"bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600",danger:"bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700",ghost:"bg-transparent hover:bg-zinc-800 text-zinc-400 border border-zinc-700"};
  return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${v[variant]||v.primary} ${className}`}>{children}</button>;
};

// ============================================================
// LOGIN
// ============================================================
function LoginScreen() {
  const [email,sE]=useState(""); const [pass,sP]=useState(""); const [err,sErr]=useState(""); const [loading,sL]=useState(false);
  const [modo,sM]=useState("login"); const [resetOk,sRO]=useState(false);
  const login=async()=>{
    if(!email||!pass)return sErr("Completá correo y contraseña");
    sL(true); sErr("");
    try{ await signInWithEmailAndPassword(auth,email,pass); }
    catch(e){
      if(e.code==="auth/invalid-credential"||e.code==="auth/wrong-password"||e.code==="auth/user-not-found") sErr("Correo o contraseña incorrectos");
      else if(e.code==="auth/invalid-email") sErr("El correo no es válido");
      else if(e.code==="auth/too-many-requests") sErr("Demasiados intentos. Esperá unos minutos.");
      else sErr("Error al ingresar. Intentá de nuevo.");
    }
    sL(false);
  };
  const resetPass=async()=>{
    if(!email)return sErr("Ingresá tu correo primero");
    sL(true); sErr("");
    try{ await sendPasswordResetEmail(auth,email); sRO(true); }
    catch(e){
      if(e.code==="auth/user-not-found") sErr("No existe cuenta con ese correo");
      else sErr("Error al enviar el correo. Intentá de nuevo.");
    }
    sL(false);
  };
  return(
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="text-6xl mb-3">🐄</div><h1 className="text-3xl font-black text-white">GanaBov Pro</h1><p className="text-zinc-500 text-sm mt-1">Santa Cruz · Bolivia · Engorde bovino</p></div>
        <Card className="flex flex-col gap-4">
          {modo==="login"?(
            <>
              <Inp label="Correo electrónico" type="email" value={email} onChange={e=>sE(e.target.value)} placeholder="correo@ejemplo.com"/>
              <Inp label="Contraseña" type="password" value={pass} onChange={e=>sP(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&login()}/>
              {err&&<p className="text-red-400 text-xs text-center">{err}</p>}
              <Btn onClick={login} disabled={loading} className="w-full py-3 text-base">{loading?"Verificando...":"Ingresar"}</Btn>
              <button onClick={()=>{sM("reset");sErr("");sRO(false);}} className="text-zinc-500 text-xs text-center hover:text-zinc-300 transition-colors">¿Olvidaste tu contraseña?</button>
            </>
          ):(
            <>
              {resetOk?(
                <div className="text-center py-4"><div className="text-4xl mb-3">📧</div><p className="text-emerald-400 font-bold text-sm mb-2">¡Correo enviado!</p><p className="text-zinc-400 text-xs mb-4">Revisá tu bandeja de entrada y seguí las instrucciones para restablecer tu contraseña.</p><Btn onClick={()=>{sM("login");sRO(false);}} variant="secondary" className="w-full">Volver al login</Btn></div>
              ):(
                <>
                  <p className="text-zinc-400 text-sm">Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
                  <Inp label="Correo electrónico" type="email" value={email} onChange={e=>sE(e.target.value)} placeholder="correo@ejemplo.com"/>
                  {err&&<p className="text-red-400 text-xs text-center">{err}</p>}
                  <Btn onClick={resetPass} disabled={loading} className="w-full py-3">{loading?"Enviando...":"Enviar enlace"}</Btn>
                  <button onClick={()=>{sM("login");sErr("");}} className="text-zinc-500 text-xs text-center hover:text-zinc-300 transition-colors">← Volver al login</button>
                </>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// PERFIL USUARIO
// ============================================================
function PerfilUsuario({user,onBack}) {
  const isAdmin=user.email===ADMIN_EMAIL;
  const [actual,sA]=useState(""); const [nueva,sN]=useState(""); const [conf,sC]=useState("");
  const [err,sErr]=useState(""); const [ok,sOk]=useState(false); const [loading,sL]=useState(false);
  const cambiarPass=async()=>{
    if(!actual||!nueva||!conf)return sErr("Completá todos los campos");
    if(nueva.length<6)return sErr("La nueva contraseña debe tener al menos 6 caracteres");
    if(nueva!==conf)return sErr("Las contraseñas nuevas no coinciden");
    sL(true); sErr("");
    try{
      const cred=EmailAuthProvider.credential(user.email,actual);
      await reauthenticateWithCredential(user,cred);
      await updatePassword(user,nueva);
      sOk(true); sA(""); sN(""); sC("");
    }catch(e){
      if(e.code==="auth/wrong-password"||e.code==="auth/invalid-credential") sErr("La contraseña actual es incorrecta");
      else sErr("Error al cambiar contraseña. Intentá de nuevo.");
    }
    sL(false);
  };
  return(
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3"><Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">← Volver</Btn><h2 className="text-2xl font-black text-white">Mi Perfil</h2></div>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3"><div className="bg-emerald-900/50 border border-emerald-700 rounded-full w-12 h-12 flex items-center justify-center text-2xl">🐄</div><div><div className="text-white font-bold text-sm">{user.email}</div><div className="mt-1">{isAdmin?<Badge color="purple">👑 Administrador</Badge>:<Badge color="gray">Usuario</Badge>}</div></div></div>
      </Card>
      <Card className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-300">Cambiar contraseña</div>
        {ok&&<div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-3"><p className="text-emerald-400 text-xs font-semibold">✅ Contraseña cambiada correctamente</p></div>}
        <Inp label="Contraseña actual" type="password" value={actual} onChange={e=>sA(e.target.value)} placeholder="••••••••"/>
        <Inp label="Nueva contraseña" type="password" value={nueva} onChange={e=>sN(e.target.value)} placeholder="Mínimo 6 caracteres"/>
        <Inp label="Confirmar nueva contraseña" type="password" value={conf} onChange={e=>sC(e.target.value)} placeholder="Repetí la nueva contraseña"/>
        {err&&<p className="text-red-400 text-xs text-center">{err}</p>}
        <Btn onClick={cambiarPass} disabled={loading} className="w-full py-3">{loading?"Guardando...":"Cambiar contraseña"}</Btn>
      </Card>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({animales,onNav,isAdmin}) {
  const alertas=animales.filter(a=>{const g=calcularGDP(a.pesadas);const r=RAZAS.find(x=>x.id===a.raza)||RAZAS[8];return a.pesadas?.length>=2&&g<r.gdp_base*0.70;}).length;
  const listos=animales.filter(a=>{const u=a.pesadas?.length>0?a.pesadas[a.pesadas.length-1].peso:a.peso_inicial;return u>=430;}).length;
  return(
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-black text-white">Panel Principal</h2><p className="text-zinc-500 text-sm">Santa Cruz · Engorde bovino</p></div>{isAdmin&&<Badge color="purple">👑 Admin</Badge>}</div>
      <div className="grid grid-cols-3 gap-3">{[{l:"Animales",v:animales.length,i:"🐄",c:"text-emerald-400"},{l:"Alertas",v:alertas,i:"⚠️",c:"text-amber-400"},{l:"Listos",v:listos,i:"✅",c:"text-sky-400"}].map(s=>(<Card key={s.l} className="text-center py-4"><div className="text-2xl mb-1">{s.i}</div><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="text-zinc-500 text-xs">{s.l}</div></Card>))}</div>
      {alertas>0&&<Card className="border-amber-700/50 bg-amber-950/30"><div className="text-amber-400 font-bold text-sm mb-1">⚠️ {alertas} animal(es) con bajo rendimiento</div><p className="text-zinc-400 text-xs">Revisá sus raciones.</p><Btn variant="secondary" onClick={()=>onNav("animales")} className="mt-2 text-xs py-1">Ver →</Btn></Card>}
      {listos>0&&<Card className="border-emerald-700/50 bg-emerald-950/30"><div className="text-emerald-400 font-bold text-sm mb-1">✅ {listos} animal(es) listos para venta</div><p className="text-zinc-400 text-xs">Superaron los 430 kg. Evaluá la venta.</p></Card>}
      <div className="grid grid-cols-2 gap-3">{[{l:"Mis Animales",i:"🐄",n:"animales"},{l:"Formular Ración",i:"🔬",n:"racion"},{l:"Alimentos y Precios",i:"📦",n:"alimentos"},{l:"Mi Perfil",i:"👤",n:"perfil"}].map(m=>(<button key={m.n} onClick={()=>onNav(m.n)} className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-emerald-600/60 hover:bg-zinc-800/60 transition-all group"><span className="text-3xl group-hover:scale-110 transition-transform">{m.i}</span><span className="text-sm font-semibold text-zinc-300">{m.l}</span></button>))}</div>
    </div>
  );
}

// ============================================================
// ANIMALES
// ============================================================
function ListaAnimales({animales,onSelect,onNav}) {
  const AnimalCard = ({animal, onClick}) => {
    const raza=RAZAS.find(r=>r.id===animal.raza)||RAZAS[8];
    const ult=animal.pesadas?.length>0?animal.pesadas[animal.pesadas.length-1].peso:animal.peso_inicial;
    const gdp=calcularGDP(animal.pesadas);
    const col=animal.pesadas?.length<2?"gray":gdp>=raza.gdp_base*0.85?"green":gdp>=raza.gdp_base*0.60?"yellow":"red";
    return(<button onClick={onClick} className="w-full bg-zinc-900 border border-zinc-700/60 rounded-2xl p-4 text-left hover:border-emerald-600/50 hover:bg-zinc-800/40 transition-all"><div className="flex justify-between items-start mb-3"><div><div className="font-bold text-white">{animal.nombre}</div><div className="text-zinc-500 text-xs">{raza.nombre} · {animal.sexo}</div></div><Badge color={col}>{col==="green"?"Bien":col==="yellow"?"Regular":col==="red"?"Alerta":"Sin datos"}</Badge></div><div className="grid grid-cols-3 gap-2 text-center">{[{v:`${ult} kg`,l:"actual",c:"text-emerald-400"},{v:`${animal.peso_inicial} kg`,l:"entrada",c:"text-sky-400"},{v:gdp>0?`${gdp.toFixed(2)}/d`:"—",l:"GDP kg",c:"text-amber-400"}].map(s=>(<div key={s.l}><div className={`font-black text-lg ${s.c}`}>{s.v}</div><div className="text-zinc-600 text-xs">{s.l}</div></div>))}</div></button>);
  };
  return(
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-white">Mis Animales</h2><Btn onClick={()=>onNav("nuevo")} className="text-xs py-1.5">+ Agregar</Btn></div>
      {animales.length===0?<Card className="text-center py-10"><div className="text-5xl mb-3">🐄</div><p className="text-zinc-500 text-sm">Sin animales registrados</p><Btn onClick={()=>onNav("nuevo")} className="mt-4">Agregar primer animal</Btn></Card>:<div className="flex flex-col gap-3">{animales.map(a=><AnimalCard key={a._id} animal={a} onClick={()=>onSelect(a)}/>)}</div>}
    </div>
  );
}

function NuevoAnimal({onGuardar,onBack,uid}) {
  const [f,sF]=useState({nombre:"",raza:"otro",sexo:"macho",peso_inicial:"",fecha_entrada:new Date().toISOString().slice(0,10),notas:""});
  const [loading,sL]=useState(false);
  const set=(k,v)=>sF(x=>({...x,[k]:v}));
  const guardar=async()=>{
    if(!f.nombre||!f.peso_inicial)return alert("Completá nombre y peso");
    sL(true);
    const animal={...f,peso_inicial:parseFloat(f.peso_inicial),pesadas:[{fecha:f.fecha_entrada,peso:parseFloat(f.peso_inicial),nota:"Peso de entrada"}]};
    const ref=await addDoc(userCol(uid,"animales"),{...animal,updatedAt:new Date()});
    onGuardar({...animal,_id:ref.id});
    sL(false);
  };
  return(<div className="flex flex-col gap-5"><div className="flex items-center gap-3"><Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">← Volver</Btn><h2 className="text-2xl font-black text-white">Nuevo Animal</h2></div><Card className="flex flex-col gap-4"><Inp label="Nombre o N° de caravana" value={f.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Ej: Toro #001"/><Sel label="Raza" value={f.raza} onChange={e=>set("raza",e.target.value)}>{RAZAS.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</Sel><Sel label="Sexo" value={f.sexo} onChange={e=>set("sexo",e.target.value)}><option value="macho">Macho (toro/novillo)</option><option value="hembra">Hembra</option></Sel><Inp label="Peso inicial (kg)" type="number" value={f.peso_inicial} onChange={e=>set("peso_inicial",e.target.value)} placeholder="Ej: 220"/><Inp label="Fecha de entrada" type="date" value={f.fecha_entrada} onChange={e=>set("fecha_entrada",e.target.value)}/><div className="flex flex-col gap-1"><label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Notas (opcional)</label><textarea className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none h-16 placeholder-zinc-500" value={f.notas} onChange={e=>set("notas",e.target.value)} placeholder="Observaciones..."/></div><Btn className="w-full py-3" onClick={guardar} disabled={loading}>{loading?"Guardando...":"Guardar Animal"}</Btn></Card></div>);
}

function DetalleAnimal({animal,onUpdate,onDelete,onBack,preciosUsr,uid}) {
  const [tab,sT]=useState("info");
  const [np,sNP]=useState({fecha:new Date().toISOString().slice(0,10),peso:"",nota:""});
  const [confirmDel,sCD]=useState(false);
  const [saving,sSv]=useState(false);
  const raza=RAZAS.find(r=>r.id===animal.raza)||RAZAS[8];
  const gdp=calcularGDP(animal.pesadas);
  const ult=animal.pesadas?.length>0?animal.pesadas[animal.pesadas.length-1].peso:animal.peso_inicial;
  const ev=evaluarVenta(ult,gdp,raza);
  const aj=recomendarAjuste(gdp,raza,animal.raza==="criollo"||animal.raza==="criollo_cruce");
  const p450=calcularProyeccion(ult,450,gdp>0?gdp:raza.gdp_base,raza);
  const p500=calcularProyeccion(ult,500,gdp>0?gdp:raza.gdp_base,raza);
  const bajRend=animal.pesadas?.length>=2&&gdp<raza.gdp_base*0.70;
  const addPesada=async()=>{
    if(!np.peso)return;
    sSv(true);
    const nuevasPesadas=[...(animal.pesadas||[]),{...np,peso:parseFloat(np.peso)}];
    const updated={...animal,pesadas:nuevasPesadas};
    await setDoc(userDoc(uid,"animales",animal._id),{...updated,updatedAt:new Date()});
    onUpdate(updated);
    sNP({fecha:new Date().toISOString().slice(0,10),peso:"",nota:""});
    sSv(false);
  };
  const eliminar=async()=>{ await deleteDoc(userDoc(uid,"animales",animal._id)); onDelete(animal._id); };
  const VentaCalc=({pesoActual,raza})=>{
    const [pV,sPV]=useState("22"); const [pC,sPC]=useState("65");
    const pc=raza.pc_canal,canal=Math.round(pesoActual*pc),huesos=Math.round(canal*0.20),carne=canal-huesos,viseras=Math.round(pesoActual*0.08);
    return(<div className="flex flex-col gap-3"><div className="grid grid-cols-2 gap-3"><Inp label="Bs/kg peso vivo" type="number" value={pV} onChange={e=>sPV(e.target.value)}/><Inp label="Bs/kg carne limpia" type="number" value={pC} onChange={e=>sPC(e.target.value)}/></div><div className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-2"><div className="flex justify-between text-sm"><span className="text-zinc-400">Venta en pie ({pesoActual} kg)</span><span className="text-emerald-400 font-bold">Bs. {(pesoActual*parseFloat(pV||0)).toFixed(0)}</span></div><div className="flex justify-between text-sm"><span className="text-zinc-400">Venta por carne ({carne} kg)</span><span className="text-sky-400 font-bold">Bs. {(carne*parseFloat(pC||0)).toFixed(0)}</span></div><div className="border-t border-zinc-700 mt-1 pt-2 text-zinc-500 text-xs">Canal:{canal} kg · Huesos:{huesos} kg · Vísceras:{viseras} kg · Rend.:{(pc*100).toFixed(0)}%</div></div></div>);
  };
  return(<div className="flex flex-col gap-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">← Volver</Btn><div><div className="text-xl font-black text-white">{animal.nombre}</div><div className="text-zinc-500 text-xs">{raza.nombre} · {animal.sexo}</div></div></div>{!confirmDel?<Btn variant="danger" onClick={()=>sCD(true)} className="text-xs py-1 px-3">🗑️ Eliminar</Btn>:<div className="flex gap-1"><Btn variant="danger" onClick={eliminar} className="text-xs py-1 px-2">✓ Confirmar</Btn><Btn variant="ghost" onClick={()=>sCD(false)} className="text-xs py-1 px-2">Cancelar</Btn></div>}</div>{bajRend&&(<Card className="border-red-700/50 bg-red-950/30"><div className="text-red-400 font-bold text-sm mb-2">⚠️ Bajo rendimiento — GDP: {gdp.toFixed(3)} kg/día · Esperado: {raza.gdp_base}</div>{aj.map((a,i)=>(<div key={i} className="bg-zinc-900 rounded-xl p-3 mb-2"><div className="text-amber-400 font-semibold text-xs">{a.titulo}</div><div className="text-zinc-400 text-xs mt-0.5">{a.detalle}</div>{a.costo&&<div className="text-emerald-400 text-xs mt-1">Costo extra: {a.costo}</div>}</div>))}</Card>)}<div className="flex gap-1 bg-zinc-900 border border-zinc-700/60 rounded-2xl p-1">{["info","pesadas","proyeccion","venta"].map(id=>(<button key={id} onClick={()=>sT(id)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab===id?"bg-emerald-600 text-white":"text-zinc-400"}`}>{id==="info"?"Info":id==="pesadas"?"Pesadas":id==="proyeccion"?"Proyección":"Venta"}</button>))}</div>{tab==="info"&&(<div className="grid grid-cols-2 gap-3">{[{l:"Peso inicial",v:`${animal.peso_inicial} kg`,c:"text-zinc-300"},{l:"Peso actual",v:`${ult} kg`,c:"text-emerald-400"},{l:"Ganancia total",v:`${(ult-animal.peso_inicial).toFixed(0)} kg`,c:"text-sky-400"},{l:"GDP promedio",v:gdp>0?`${gdp.toFixed(3)} kg/d`:"Sin datos",c:"text-amber-400"}].map(s=>(<Card key={s.l} className="text-center py-3"><div className={`text-xl font-black ${s.c}`}>{s.v}</div><div className="text-zinc-500 text-xs">{s.l}</div></Card>))}{animal.notas&&<Card className="col-span-2"><p className="text-zinc-400 text-sm">📝 {animal.notas}</p></Card>}</div>)}{tab==="pesadas"&&(<div className="flex flex-col gap-3"><Card className="flex flex-col gap-3"><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Registrar pesada</div><Inp label="Fecha" type="date" value={np.fecha} onChange={e=>sNP(p=>({...p,fecha:e.target.value}))}/><Inp label="Peso (kg)" type="number" value={np.peso} onChange={e=>sNP(p=>({...p,peso:e.target.value}))} placeholder="285"/><Inp label="Nota (opcional)" value={np.nota} onChange={e=>sNP(p=>({...p,nota:e.target.value}))} placeholder="Observación..."/><Btn onClick={addPesada} disabled={saving}>{saving?"Guardando...":"Registrar"}</Btn></Card>{[...(animal.pesadas||[])].reverse().map((p,i)=>(<Card key={i} className="py-3"><div className="flex justify-between items-center"><div><div className="text-white font-bold">{p.peso} kg</div><div className="text-zinc-500 text-xs">{p.fecha}{p.nota?` · ${p.nota}`:""}</div></div><Badge color="gray">{i===animal.pesadas.length-1?"entrada":"pesada"}</Badge></div></Card>))}</div>)}{tab==="proyeccion"&&(<div className="flex flex-col gap-3">{[{meta:450,proj:p450},{meta:500,proj:p500}].map(({meta,proj})=>proj?(<Card key={meta}><div className="text-emerald-400 font-black text-lg mb-3">Meta: {meta} kg</div><div className="grid grid-cols-2 gap-3 mb-3"><div className="bg-zinc-800 rounded-xl p-3 text-center"><div className="text-white font-black text-xl">{proj.dias} días</div><div className="text-zinc-500 text-xs">{proj.meses} meses</div></div><div className="bg-zinc-800 rounded-xl p-3 text-center"><div className="text-amber-400 font-black text-xl">{proj.canal} kg</div><div className="text-zinc-500 text-xs">peso canal</div></div></div><div className="grid grid-cols-3 gap-2 text-center">{[{v:`${proj.carneLimpia} kg`,l:"carne",c:"text-emerald-400"},{v:`${proj.huesos} kg`,l:"huesos",c:"text-zinc-300"},{v:`${proj.viseras} kg`,l:"vísceras",c:"text-zinc-300"}].map(s=>(<div key={s.l} className="bg-zinc-800 rounded-xl p-2"><div className={`font-bold text-sm ${s.c}`}>{s.v}</div><div className="text-zinc-600 text-xs">{s.l}</div></div>))}</div></Card>):<Card key={meta}><p className="text-zinc-500 text-sm text-center">Ya superó los {meta} kg</p></Card>)}<Card className="bg-zinc-800/40 border-zinc-600/40"><p className="text-zinc-500 text-xs">* Basado en GDP {gdp>0?"real del animal":"esperado para la raza"}.</p></Card></div>)}{tab==="venta"&&(<div className="flex flex-col gap-3">{animal.pesadas?.length>=2?(<Card className={ev.conviene?"border-emerald-700/50 bg-emerald-950/30":"border-amber-700/50 bg-amber-950/30"}><div className={`font-black text-base mb-2 ${ev.conviene?"text-emerald-400":"text-amber-400"}`}>{ev.conviene?"✅ Evalúa vender ahora":"⏳ Continuar engorde"}</div><p className="text-zinc-300 text-sm">{ev.recomendacion}</p><div className="mt-3 pt-3 border-t border-zinc-700 flex flex-col gap-1"><div className="flex justify-between text-xs"><span className="text-zinc-500">GDP real</span><span className="text-white font-bold">{gdp.toFixed(3)} kg/día</span></div><div className="flex justify-between text-xs"><span className="text-zinc-500">Eficiencia</span><Badge color={ev.eficiencia==="buena"?"green":ev.eficiencia==="regular"?"yellow":"red"}>{ev.eficiencia}</Badge></div></div></Card>):<Card><p className="text-zinc-500 text-sm text-center">Registrá al menos 2 pesadas para la recomendación</p></Card>}<Card><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Calculadora de venta</div><VentaCalc pesoActual={ult} raza={raza}/></Card></div>)}</div>);
}

// ============================================================
// GESTIÓN ALIMENTOS (con mínimos personalizables)
// ============================================================
function GestionAlimentos({preciosUsr, onPrecio, customAl, onAddCustom, uid, minsAlimentos, onSetMinimo}) {
  const [busq,sB]=useState(""); const [editId,sEI]=useState(null); const [editVal,sEV]=useState("");
  const [editMinId, sEMId] = useState(null); const [editMinVal, sEMVal] = useState("");
  const [showForm,sSF]=useState(false); const [saving,sSv]=useState(false);
  const [form,sForm]=useState({nombre:"",tipo:"energetico",ms:"",prot:"",em:"",fdn:"30",max_ms_pct:""});
  const todos=[...ALIMENTOS_BASE,...customAl];
  const filtrados=todos.filter(a=>a.nombre.toLowerCase().includes(busq.toLowerCase())||TIPO_LABELS[a.tipo]?.toLowerCase().includes(busq.toLowerCase()));
  const savePrecio=async(id)=>{const v=parseFloat(editVal);if(!isNaN(v)&&v>=0){await onPrecio(id,v);}sEI(null);};
  const saveMinimo=async(id)=>{const v=parseFloat(editMinVal);if(!isNaN(v)&&v>=0){await onSetMinimo(id,v);}sEMId(null);};
  const guardar=async()=>{
    if(!form.nombre||!form.ms)return alert("Completá nombre y MS%");
    sSv(true);
    const al={...form,ms:+form.ms,prot:+(form.prot||0),em:+(form.em||0),fdn:+(form.fdn||30),max_ms_pct:form.max_ms_pct?+form.max_ms_pct:null,precio_kg:0};
    const ref=await addDoc(userCol(uid,"alimentos_custom"),{...al,updatedAt:new Date()});
    onAddCustom({...al,id:ref.id,_id:ref.id});
    sForm({nombre:"",tipo:"energetico",ms:"",prot:"",em:"",fdn:"30",max_ms_pct:""});sSF(false);sSv(false);
  };
  return(
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-white">Alimentos y Precios</h2><Btn onClick={()=>sSF(!showForm)} className="text-xs py-1.5">+ Agregar</Btn></div>
      <Card className="bg-sky-950/30 border-sky-700/40"><p className="text-sky-300 text-xs">💡 Tocá el precio en verde para editarlo. Además podés definir un mínimo diario (kg) para que la ración siempre incluya esa cantidad.</p></Card>
      {showForm&&(<Card className="flex flex-col gap-3"><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nuevo alimento personalizado</div><Inp label="Nombre" value={form.nombre} onChange={e=>sForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Pasto Colonial"/><Sel label="Tipo" value={form.tipo} onChange={e=>sForm(f=>({...f,tipo:e.target.value}))}>{TIPOS_ORDER.map(t=><option key={t} value={t}>{TIPO_LABELS[t]}</option>)}</Sel><div className="grid grid-cols-2 gap-3"><Inp label="MS %" type="number" value={form.ms} onChange={e=>sForm(f=>({...f,ms:e.target.value}))} placeholder="22"/><Inp label="PB %" type="number" value={form.prot} onChange={e=>sForm(f=>({...f,prot:e.target.value}))} placeholder="9"/><Inp label="EM Mcal/kg MS" type="number" value={form.em} onChange={e=>sForm(f=>({...f,em:e.target.value}))} placeholder="2.1"/><Inp label="FDN %" type="number" value={form.fdn} onChange={e=>sForm(f=>({...f,fdn:e.target.value}))} placeholder="65"/><Inp label="Máx MS ración %" type="number" value={form.max_ms_pct} onChange={e=>sForm(f=>({...f,max_ms_pct:e.target.value}))} placeholder="Opcional"/></div><div className="flex gap-2"><Btn onClick={guardar} disabled={saving} className="flex-1">{saving?"Guardando...":"Guardar"}</Btn><Btn variant="secondary" onClick={()=>sSF(false)} className="flex-1">Cancelar</Btn></div></Card>)}
      <Inp placeholder="Buscar alimento..." value={busq} onChange={e=>sB(e.target.value)}/>
      {TIPOS_ORDER.map(tipo=>{
        const grupo=filtrados.filter(a=>a.tipo===tipo);if(!grupo.length)return null;
        return(<div key={tipo}><div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{TIPO_LABELS[tipo]}</div><div className="flex flex-col gap-2">{grupo.map(al=>{
          const precio=preciosUsr[al.id]!==undefined?preciosUsr[al.id]:al.precio_kg;
          const minimo=minsAlimentos[al.id]!==undefined?minsAlimentos[al.id]:0;
          return(<Card key={al.id} className="py-3"><div className="flex justify-between items-start"><div className="flex-1 pr-2"><div className="text-white font-semibold text-sm">{al.nombre}</div><div className="text-zinc-500 text-xs mt-0.5">MS:{al.ms}% · PB:{al.prot}% · EM:{al.em} · FDN:{al.fdn}%</div><div className="text-amber-400 text-xs mt-1">Mínimo: {editMinId===al.id?<div className="flex items-center gap-1"><input type="number" value={editMinVal} onChange={e=>sEMVal(e.target.value)} className="bg-zinc-700 border border-amber-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none" autoFocus onKeyDown={e=>e.key==="Enter"&&saveMinimo(al.id)}/><button onClick={()=>saveMinimo(al.id)} className="text-amber-400 font-bold px-1">✓</button><button onClick={()=>sEMId(null)} className="text-zinc-500 px-1">✕</button></div>:<button onClick={()=>{sEMId(al.id);sEMVal(minimo.toString());}} className="hover:underline">{minimo>0?`${minimo} kg/día`:"Sin mínimo"} ✏️</button>}</div></div><div className="text-right">{editId===al.id?(<div className="flex items-center gap-1"><input type="number" value={editVal} onChange={e=>sEV(e.target.value)} className="bg-zinc-700 border border-emerald-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none" autoFocus onKeyDown={e=>e.key==="Enter"&&savePrecio(al.id)}/><button onClick={()=>savePrecio(al.id)} className="text-emerald-400 font-bold px-1">✓</button><button onClick={()=>sEI(null)} className="text-zinc-500 px-1">✕</button></div>):(<button onClick={()=>{sEI(al.id);sEV(precio.toString());}} className="text-emerald-400 font-bold text-sm hover:text-emerald-300 underline underline-offset-2">Bs.{precio.toFixed(2)}/kg ✏️</button>)}</div></div></Card>);
        })}</div></div>);
      })}
    </div>
  );
}

// ============================================================
// CALCULADORA DE RACIÓN (con sistemas y modos)
// ============================================================
function CalculadoraRacion({preciosUsr, customAl, minsAlimentos}) {
  const [peso, setPeso] = useState("");
  const [raza, setRaza] = useState("otro");
  const [sistema, setSistema] = useState("semiIntensivo");
  const [modo, setModo] = useState("automatico");
  const [selIds, setSelIds] = useState(new Set());
  const [busq, setBusq] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSel, setShowSel] = useState(false);
  
  const todosAl = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todosAl.filter(a => a.nombre.toLowerCase().includes(busq.toLowerCase()) || TIPO_LABELS[a.tipo]?.toLowerCase().includes(busq.toLowerCase()));
  const razaObj = RAZAS.find(r => r.id === raza) || RAZAS[8];
  const seleccionados = todosAl.filter(a => selIds.has(a.id));
  
  const toggleSeleccion = (id) => {
    setSelIds(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
    setResultado(null);
  };
  
  const calcular = () => {
    if (!peso || parseFloat(peso) < 80) return alert("Peso mínimo 80 kg");
    if (modo === "personalizado" && seleccionados.length === 0) return alert("Seleccione al menos un alimento en modo personalizado.");
    
    let forrajesUsar = [];
    let concentradosUsar = [];
    
    if (modo === "automatico" || modo === "economico") {
      const ingredientes = obtenerIngredientesPorModo(modo, sistema, preciosUsr, customAl);
      if (ingredientes) {
        forrajesUsar = ingredientes.forrajes;
        concentradosUsar = ingredientes.concentrados;
      } else {
        return alert("No se pudo determinar ingredientes para el modo seleccionado.");
      }
    } else {
      forrajesUsar = seleccionados.filter(a => a.tipo === "forraje_fresco" || a.tipo === "heno_silo");
      concentradosUsar = seleccionados.filter(a => ["energetico","proteico","proteico_animal","subproducto"].includes(a.tipo));
      if (forrajesUsar.length === 0 && concentradosUsar.length === 0) return alert("Debe seleccionar al menos un forraje o un concentrado.");
    }
    
    const res = formularRacionConIngredientes(forrajesUsar, concentradosUsar, peso, razaObj, sistema, preciosUsr, minsAlimentos);
    setResultado(res);
  };
  
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-white">🔬 Formulación de Ración</h2>
      <Card className="flex flex-col gap-4">
        <Inp label="Peso vivo (kg)" type="number" value={peso} onChange={e => { setPeso(e.target.value); setResultado(null); }} placeholder="Ej: 280" />
        <Sel label="Raza" value={raza} onChange={e => { setRaza(e.target.value); setResultado(null); }}>
          {RAZAS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Sel>
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Sistema de producción</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {Object.entries(SISTEMAS).map(([key, val]) => (
              <button key={key} onClick={() => { setSistema(key); setResultado(null); }} className={`py-2 rounded-xl text-xs font-bold transition-all border ${sistema === key ? "bg-emerald-600 border-emerald-500 text-white" : "bg-zinc-800 border-zinc-600 text-zinc-400"}`}>
                {val.nombre.split(" ")[0]}<br/><span className="text-[10px]">{val.gdp}</span>
              </button>
            ))}
          </div>
          <p className="text-zinc-500 text-xs mt-1">{SISTEMAS[sistema].desc} · GDP esperado {SISTEMAS[sistema].gdp}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Modo de formulación</label>
          <div className="flex gap-2 mt-1">
            {[["automatico","🚀 Automático (óptimo)"],["economico","💰 Económico"],["personalizado","✏️ Personalizado"]].map(([id, label]) => (
              <button key={id} onClick={() => { setModo(id); setResultado(null); }} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${modo === id ? "bg-emerald-600 border-emerald-500 text-white" : "bg-zinc-800 border-zinc-600 text-zinc-400"}`}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-zinc-500 text-xs mt-1">
            {modo === "automatico" && "Selecciona los mejores ingredientes para máxima ganancia."}
            {modo === "economico" && "Prioriza el menor costo, manteniendo los requerimientos básicos."}
            {modo === "personalizado" && "Elige manualmente los alimentos que quieres incluir."}
          </p>
        </div>
        {modo === "personalizado" && (
          <div className="flex flex-col gap-3">
            <Btn variant="secondary" onClick={() => setShowSel(!showSel)}>
              {showSel ? "Cerrar" : `+ Elegir alimentos${seleccionados.length > 0 ? ` (${seleccionados.length})` : ""}`}
            </Btn>
            {showSel && (
              <div className="flex flex-col gap-1">
                <Inp placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
                {TIPOS_ORDER.map(tipo => {
                  const gr = filtrados.filter(a => a.tipo === tipo);
                  if (!gr.length) return null;
                  return (
                    <div key={tipo}>
                      <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1 mt-3">{TIPO_LABELS[tipo]}</div>
                      {gr.map(al => {
                        const minMostrar = minsAlimentos[al.id] || 0;
                        return (
                          <button key={al.id} onClick={() => toggleSeleccion(al.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-all mb-1 ${selIds.has(al.id) ? "border-emerald-600 bg-emerald-950/40 text-emerald-300" : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500"}`}>
                            <div className="flex justify-between"><span className="font-semibold">{al.nombre}</span><span>{selIds.has(al.id) ? "✓" : ""}</span></div>
                            <span className="text-zinc-500 text-xs">PB:{al.prot}% · EM:{al.em} · FDN:{al.fdn}% · Bs.{(preciosUsr[al.id] ?? al.precio_kg).toFixed(2)}/kg {minMostrar > 0 && `· Mín: ${minMostrar} kg/día`}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
            {seleccionados.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {seleccionados.map(al => (
                  <span key={al.id} className="inline-flex items-center gap-1 bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                    {al.nombre.split("(")[0].trim()}
                    <button onClick={() => toggleSeleccion(al.id)} className="text-emerald-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <Btn onClick={calcular} className="w-full py-3 text-base">Calcular Ración</Btn>
      </Card>
      
      {resultado && (
        <div className="flex flex-col gap-3">
          {resultado.alertas && resultado.alertas.map((alerta, idx) => (
            <Card key={idx} className={alerta.tipo === "critico" ? "border-red-700/50 bg-red-950/30" : "border-amber-700/50 bg-amber-950/30"}>
              <div className={`${alerta.tipo === "critico" ? "text-red-400" : "text-amber-400"} font-bold text-sm`}>{alerta.msg}</div>
            </Card>
          ))}
          <Card>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sky-400 font-black text-base">🔬 Ración para sistema {SISTEMAS[resultado.sistemaUsado].nombre}</div>
              <Badge color="purple">{modo === "automatico" ? "Automático" : modo === "economico" ? "Económico" : "Personalizado"}</Badge>
            </div>
            <p className="text-zinc-500 text-xs mb-2">GDP esperado: {SISTEMAS[resultado.sistemaUsado].gdp} · Concentrado real: {resultado.pctConcReal}%</p>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Ingredientes — kg/día</div>
            <div className="flex flex-col gap-2 mb-4">
              {resultado.racion.map((al, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3">
                  <div><div className="text-white font-semibold text-sm">{al.nombre}</div><div className="text-zinc-500 text-xs">{TIPO_LABELS[al.tipo]}</div></div>
                  <div className="text-right"><div className="text-emerald-400 font-black text-lg">{al.kg_dia < 0.1 ? `${(al.kg_dia * 1000).toFixed(0)} g` : `${al.kg_dia} kg`}</div><div className="text-zinc-600 text-xs">{al.ms_kg} kg MS</div></div>
                </div>
              ))}
            </div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Resumen nutricional</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { l: "MS total", v: `${resultado.ms_total} kg`, sub: `${resultado.ms_pct_pv}% PV` },
                { l: "FDN", v: `${resultado.fdn_pct}%`, sub: "mín 35%" },
                { l: "EM aportada", v: `${resultado.em_total} Mcal`, sub: `req: ${resultado.req.em_total.toFixed(2)}` },
                { l: "PB aportada", v: `${resultado.prot_total} g`, sub: `req: ${resultado.req.pb_total.toFixed(0)} g` },
                { l: "Costo/día", v: `Bs. ${resultado.costo_total}` },
                { l: "Costo/mes", v: `Bs. ${(parseFloat(resultado.costo_total) * 30).toFixed(0)}` }
              ].map(s => (
                <div key={s.l} className="bg-zinc-800 rounded-xl p-3">
                  <div className="font-bold text-sm text-emerald-400">{s.v}</div>
                  <div className="text-zinc-500 text-xs">{s.l}</div>
                  {s.sub && <div className="text-zinc-600 text-xs">{s.sub}</div>}
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3 flex flex-col gap-1.5">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Balances</div>
              {[
                { l: "Energía", v: resultado.balance_em, u: "Mcal" },
                { l: "Proteína", v: resultado.balance_prot, u: "g" }
              ].map(b => {
                const ok = parseFloat(b.v) >= -0.5;
                return (
                  <div key={b.l} className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">{b.l}</span>
                    <Badge color={ok ? "green" : "red"}>{parseFloat(b.v) > 0 ? "+" : ""}{b.v} {b.u}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
          {(parseFloat(resultado.balance_em) < -1.0 || parseFloat(resultado.balance_prot) < -80) && (
            <Card className="border-amber-700/50 bg-amber-950/30">
              <div className="text-amber-300 font-bold text-sm mb-1">⚠️ Déficit nutricional</div>
              <p className="text-zinc-400 text-xs">
                {parseFloat(resultado.balance_em) < -1.0 ? "Déficit de energía → agregá maíz, sorgo o melaza. " : ""}
                {parseFloat(resultado.balance_prot) < -80 ? "Déficit de proteína → agregá torta de soya o harina de carne." : ""}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [nav, setNav] = useState("dashboard");
  const [animales, setAnimales] = useState([]);
  const [animalSel, setAnimalSel] = useState(null);
  const [preciosUsr, setPreciosUsr] = useState({});
  const [customAl, setCustomAl] = useState([]);
  const [minsAlimentos, setMinsAlimentos] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  
  const isAdmin = user?.email === ADMIN_EMAIL;
  const uid = user?.uid;
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return () => unsub();
  }, []);
  
  useEffect(() => {
    if (!uid) { setAnimales([]); setPreciosUsr({}); setCustomAl([]); setMinsAlimentos({}); return; }
    const cargar = async () => {
      setDataLoading(true);
      try {
        const animSnap = await getDocs(userCol(uid, "animales"));
        setAnimales(animSnap.docs.map(d => ({ _id: d.id, ...d.data() })));
        const precSnap = await getDocs(userCol(uid, "precios"));
        const precios = {};
        precSnap.docs.forEach(d => { precios[d.id] = d.data().valor; });
        setPreciosUsr(precios);
        const alSnap = await getDocs(userCol(uid, "alimentos_custom"));
        setCustomAl(alSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() })));
        const minsSnap = await getDocs(userCol(uid, "minimos"));
        const mins = {};
        minsSnap.docs.forEach(d => { mins[d.id] = d.data().valor; });
        setMinsAlimentos(mins);
      } catch(e) { console.error(e); }
      setDataLoading(false);
    };
    cargar();
  }, [uid]);
  
  const handlePrecio = async (id, val) => {
    await setDoc(userDoc(uid, "precios", id), { valor: val, updatedAt: new Date() });
    setPreciosUsr(p => ({ ...p, [id]: val }));
  };
  const handleSetMinimo = async (id, val) => {
    if (val === 0) {
      await deleteDoc(userDoc(uid, "minimos", id)).catch(() => {});
      const newMins = { ...minsAlimentos };
      delete newMins[id];
      setMinsAlimentos(newMins);
    } else {
      await setDoc(userDoc(uid, "minimos", id), { valor: val, updatedAt: new Date() });
      setMinsAlimentos(m => ({ ...m, [id]: val }));
    }
  };
  const handleUpdateAnimal = (a) => { setAnimales(p => p.map(x => x._id === a._id ? a : x)); setAnimalSel(a); };
  const handleDeleteAnimal = (id) => { setAnimales(p => p.filter(x => x._id !== id)); setNav("animales"); setAnimalSel(null); };
  const handleSalir = async () => { await signOut(auth); setNav("dashboard"); };
  
  const navItems = [{ id: "dashboard", i: "🏠", l: "Inicio" }, { id: "animales", i: "🐄", l: "Animales" }, { id: "racion", i: "🔬", l: "Ración" }, { id: "alimentos", i: "📦", l: "Alimentos" }];
  
  if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4 animate-pulse">🐄</div><p className="text-zinc-500 text-sm">Cargando...</p></div></div>;
  if (!user) return <LoginScreen />;
  if (dataLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4 animate-pulse">🐄</div><p className="text-zinc-500 text-sm">Cargando tus datos...</p></div></div>;
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-xl">🐄</span><span className="font-black text-white tracking-tight">GanaBov Pro</span>{isAdmin && <Badge color="purple">👑</Badge>}</div>
        <button onClick={handleSalir} className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">Salir</button>
      </div>
      <div className="max-w-lg mx-auto px-4 py-5 pb-28">
        {nav === "dashboard" && <Dashboard animales={animales} onNav={setNav} isAdmin={isAdmin} />}
        {nav === "animales" && <ListaAnimales animales={animales} onSelect={a => { setAnimalSel(a); setNav("detalle"); }} onNav={setNav} />}
        {nav === "nuevo" && <NuevoAnimal onGuardar={a => { setAnimales(p => [...p, a]); setNav("animales"); }} onBack={() => setNav("animales")} uid={uid} />}
        {nav === "detalle" && animalSel && <DetalleAnimal animal={animalSel} onUpdate={handleUpdateAnimal} onDelete={handleDeleteAnimal} onBack={() => setNav("animales")} preciosUsr={preciosUsr} uid={uid} />}
        {nav === "racion" && <CalculadoraRacion preciosUsr={preciosUsr} customAl={customAl} minsAlimentos={minsAlimentos} />}
        {nav === "alimentos" && <GestionAlimentos preciosUsr={preciosUsr} onPrecio={handlePrecio} customAl={customAl} onAddCustom={a => setCustomAl(p => [...p, a])} uid={uid} minsAlimentos={minsAlimentos} onSetMinimo={handleSetMinimo} />}
        {nav === "perfil" && <PerfilUsuario user={user} onBack={() => setNav("dashboard")} />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setNav(item.id)} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${nav === item.id || (nav === "detalle" && item.id === "animales") ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-400"}`}>
            <span className="text-xl">{item.i}</span><span className="text-xs font-semibold">{item.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
