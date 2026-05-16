// src/data/alimentosBase.js
export const ALIMENTOS_BASE = [
  // ===== FORRAJES =====
  { id: "pasto_mombasa", nombre: "Pasto Mombasa (Megathyrsus maximus)", tipo: "forraje_fresco", ms: 22, prot: 8.5, em: 1.90, fdn: 68, max_ms_pct: null, precio_kg: 0.45 },
  { id: "pasto_tanzania", nombre: "Pasto Tanzania (Megathyrsus maximus)", tipo: "forraje_fresco", ms: 23, prot: 9.0, em: 1.95, fdn: 66, max_ms_pct: null, precio_kg: 0.50 },
  { id: "pasto_zuri", nombre: "Pasto Zuri (Híbrido brasileño)", tipo: "forraje_fresco", ms: 22, prot: 10.5, em: 2.00, fdn: 64, max_ms_pct: null, precio_kg: 0.55 },
  { id: "pasto_marandu", nombre: "Pasto Marandú (Brachiaria brizantha)", tipo: "forraje_fresco", ms: 24, prot: 7.5, em: 1.80, fdn: 69, max_ms_pct: null, precio_kg: 0.40 },
  { id: "pasto_piata", nombre: "Pasto Piatá (Brachiaria brizantha tecnificada)", tipo: "forraje_fresco", ms: 25, prot: 8.0, em: 1.85, fdn: 67, max_ms_pct: null, precio_kg: 0.45 },
  { id: "pasto_ruzi", nombre: "Pasto Ruziziensis (Brachiaria ruziziensis)", tipo: "forraje_fresco", ms: 22, prot: 8.5, em: 1.90, fdn: 66, max_ms_pct: null, precio_kg: 0.45 },
  { id: "pasto_dictyoneura", nombre: "Pasto Llanero / Dictyoneura", tipo: "forraje_fresco", ms: 26, prot: 6.0, em: 1.65, fdn: 72, max_ms_pct: null, precio_kg: 0.35 },
  { id: "pasto_maralfalfa", nombre: "Pasto de Corte Maralfalfa (Pennisetum sp.)", tipo: "forraje_fresco", ms: 18, prot: 9.5, em: 1.75, fdn: 63, max_ms_pct: null, precio_kg: 0.50 },
  { id: "pasto_camerun", nombre: "Pasto Elefante / Camerún Morado", tipo: "forraje_fresco", ms: 17, prot: 7.5, em: 1.70, fdn: 65, max_ms_pct: null, precio_kg: 0.40 },
  { id: "silo_maiz_grano", nombre: "Silaje de Maíz (con grano)", tipo: "heno_silo", ms: 35, prot: 8.0, em: 2.50, fdn: 45, max_ms_pct: 60, precio_kg: 0.90 },
  { id: "silo_sorgo", nombre: "Silaje de Sorgo Forrajero", tipo: "heno_silo", ms: 30, prot: 6.8, em: 2.10, fdn: 54, max_ms_pct: 60, precio_kg: 0.75 },
  { id: "heno_alfalfa", nombre: "Heno de Alfalfa (Balles de alta calidad)", tipo: "heno_silo", ms: 88, prot: 18.5, em: 2.25, fdn: 42, max_ms_pct: 50, precio_kg: 2.80 },
  { id: "heno_brachiaria", nombre: "Heno de Pasto Brachiaria (Rollos)", tipo: "heno_silo", ms: 86, prot: 5.5, em: 1.60, fdn: 72, max_ms_pct: 60, precio_kg: 1.20 },
  { id: "chala_maiz", nombre: "Chala de Maíz Seca (Rastrojo)", tipo: "heno_silo", ms: 85, prot: 4.5, em: 1.50, fdn: 74, max_ms_pct: 60, precio_kg: 0.80 },
  { id: "pasto_nativo_pantanal", nombre: "Pastizales Nativos (Pantanal / Bajíos)", tipo: "forraje_fresco", ms: 28, prot: 5.0, em: 1.60, fdn: 71, max_ms_pct: null, precio_kg: 0.30 },
  // ===== ENERGÉTICOS =====
  { id: "maiz_amarillo", nombre: "Maíz Amarillo en Grano (Molido/Chancado)", tipo: "energetico", ms: 88, prot: 8.8, em: 3.30, fdn: 12, max_ms_pct: 40, precio_kg: 2.20 },
  { id: "sorgo_grano", nombre: "Sorgo Grano Seco Molido", tipo: "energetico", ms: 89, prot: 9.0, em: 3.10, fdn: 15, max_ms_pct: 40, precio_kg: 1.90 },
  { id: "afrecho_arroz_blanco", nombre: "Afrecho de Arroz Integral (Aceitoso)", tipo: "energetico", ms: 90, prot: 12.5, em: 2.90, fdn: 22, max_ms_pct: 30, precio_kg: 1.80 },
  { id: "afrecho_trigo", nombre: "Afrecho / Salvado de Trigo", tipo: "energetico", ms: 88, prot: 15.2, em: 2.50, fdn: 38, max_ms_pct: 30, precio_kg: 1.70 },
  { id: "melaza_caña", nombre: "Melaza de Caña de Azúcar (Ingenios Cruceños)", tipo: "energetico", ms: 75, prot: 3.0, em: 2.60, fdn: 0, max_ms_pct: 10, precio_kg: 1.20 },
  { id: "yuca_raiz", nombre: "Yuca Raíz Fresca (Picada)", tipo: "energetico", ms: 35, prot: 2.5, em: 3.00, fdn: 10, max_ms_pct: 30, precio_kg: 0.90 },
  { id: "cascarilla_soya", nombre: "Cascarilla de Soya (Fibra energética)", tipo: "subproducto", ms: 90, prot: 12.1, em: 2.40, fdn: 60, max_ms_pct: 20, precio_kg: 2.00 },
  { id: "grano_destileria_sorgo", nombre: "Burlanda de Sorgo Seca (DDGS)", tipo: "energetico", ms: 91, prot: 27.0, em: 3.00, fdn: 34, max_ms_pct: 30, precio_kg: 2.50 },
  // ===== PROTEICOS =====
  { id: "harina_soya_solvent", nombre: "Harina de Soya Extracción (46% Prot)", tipo: "proteico", ms: 89, prot: 46.5, em: 3.15, fdn: 13, max_ms_pct: 15, precio_kg: 5.00 },
  { id: "expeller_soya", nombre: "Expeller / Torta de Soya (Prensado mecánico)", tipo: "proteico", ms: 90, prot: 42.0, em: 3.25, fdn: 15, max_ms_pct: 15, precio_kg: 4.80 },
  { id: "torta_girasol", nombre: "Torta de Girasol Agroindustrial", tipo: "proteico", ms: 92, prot: 31.0, em: 2.30, fdn: 36, max_ms_pct: 10, precio_kg: 3.20 },
  { id: "torta_algodon", nombre: "Torta de Algodón (Con fibra/pelusa)", tipo: "proteico", ms: 91, prot: 37.5, em: 2.40, fdn: 31, max_ms_pct: 10, precio_kg: 3.50 },
  { id: "burlanda_maiz_dggs", nombre: "Burlanda de Maíz Seca (DDGS)", tipo: "proteico", ms: 92, prot: 30.0, em: 3.20, fdn: 33, max_ms_pct: 20, precio_kg: 2.80 },
  { id: "urea_pua", nombre: "Urea Grado Alimenticio (NNP)", tipo: "suplemento", ms: 99, prot: 287.0, em: 0.00, fdn: 0, max_ms_pct: 1, precio_kg: 8.00 },
  // ===== MINERALES =====
  { id: "sal_mineral_engorde", nombre: "Sal Mineralizada Fósforo 6%-8% (Engorde)", tipo: "suplemento", ms: 98, prot: 0.0, em: 0.00, fdn: 0, max_ms_pct: 1, precio_kg: 6.50 },
  { id: "sal_comun", nombre: "Sal Blanca de Mesa / Sal Común", tipo: "suplemento", ms: 99, prot: 0.0, em: 0.00, fdn: 0, max_ms_pct: 0.5, precio_kg: 1.50 },
  { id: "fosfato_bicalcico", nombre: "Fosfato Bicálcico (Corrector de Fósforo)", tipo: "suplemento", ms: 99, prot: 0.0, em: 0.00, fdn: 0, max_ms_pct: 0.5, precio_kg: 5.00 },
  { id: "carbonato_calcio", nombre: "Carbonato de Calcio (Corrector de Calcio)", tipo: "suplemento", ms: 99, prot: 0.0, em: 0.00, fdn: 0, max_ms_pct: 0.5, precio_kg: 2.50 }
];

export const TIPO_LABELS = {
  forraje_fresco: "🌿 Forraje fresco",
  heno_silo: "🌾 Heno / Silaje",
  energetico: "🌽 Energético",
  subproducto: "♻️ Subproducto",
  proteico: "🫘 Proteico vegetal",
  proteico_animal: "🩸 Proteico animal",
  suplemento: "💊 Suplemento",
};

export const TIPOS_ORDER = [
  "forraje_fresco",
  "heno_silo",
  "energetico",
  "subproducto",
  "proteico",
  "proteico_animal",
  "suplemento",
];
