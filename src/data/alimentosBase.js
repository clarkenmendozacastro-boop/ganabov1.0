// src/data/alimentosBase.js
export const ALIMENTOS_BASE = [
  // ========== FORRAJES ==========
  { id: "pasto_mombasa", nombre: "Pasto Mombasa (Megathyrsus maximus)", categoria: "forraje", ms: 22, em: 1.9, prot: 8.5, fdn: 68, precio_kg: 0.45 },
  { id: "pasto_tanzania", nombre: "Pasto Tanzania (Megathyrsus maximus)", categoria: "forraje", ms: 23, em: 1.95, prot: 9.0, fdn: 66, precio_kg: 0.50 },
  { id: "pasto_zuri", nombre: "Pasto Zuri (Híbrido brasileño)", categoria: "forraje", ms: 22, em: 2.0, prot: 10.5, fdn: 64, precio_kg: 0.55 },
  { id: "pasto_marandu", nombre: "Pasto Marandú (Brachiaria brizantha)", categoria: "forraje", ms: 24, em: 1.8, prot: 7.5, fdn: 69, precio_kg: 0.40 },
  { id: "pasto_piata", nombre: "Pasto Piatá (Brachiaria brizantha tecnificada)", categoria: "forraje", ms: 25, em: 1.85, prot: 8.0, fdn: 67, precio_kg: 0.45 },
  { id: "pasto_ruzi", nombre: "Pasto Ruziziensis (Brachiaria ruziziensis)", categoria: "forraje", ms: 22, em: 1.9, prot: 8.5, fdn: 66, precio_kg: 0.45 },
  { id: "pasto_dictyoneura", nombre: "Pasto Llanero / Dictyoneura", categoria: "forraje", ms: 26, em: 1.65, prot: 6.0, fdn: 72, precio_kg: 0.35 },
  { id: "pasto_maralfalfa", nombre: "Pasto de Corte Maralfalfa (Pennisetum sp.)", categoria: "forraje", ms: 18, em: 1.75, prot: 9.5, fdn: 63, precio_kg: 0.50 },
  { id: "pasto_camerun", nombre: "Pasto Elefante / Camerún Morado", categoria: "forraje", ms: 17, em: 1.7, prot: 7.5, fdn: 65, precio_kg: 0.40 },
  { id: "silo_maiz_grano", nombre: "Silaje de Maíz (con grano)", categoria: "forraje", ms: 35, em: 2.5, prot: 8.0, fdn: 45, precio_kg: 0.90 },
  { id: "silo_sorgo", nombre: "Silaje de Sorgo Forrajero", categoria: "forraje", ms: 30, em: 2.1, prot: 6.8, fdn: 54, precio_kg: 0.75 },
  { id: "heno_alfalfa", nombre: "Heno de Alfalfa (Balles de alta calidad)", categoria: "forraje", ms: 88, em: 2.25, prot: 18.5, fdn: 42, precio_kg: 2.80 },
  { id: "heno_brachiaria", nombre: "Heno de Pasto Brachiaria (Rollos)", categoria: "forraje", ms: 86, em: 1.6, prot: 5.5, fdn: 72, precio_kg: 1.20 },
  { id: "chala_maiz", nombre: "Chala de Maíz Seca (Rastrojo)", categoria: "forraje", ms: 85, em: 1.5, prot: 4.5, fdn: 74, precio_kg: 0.80 },
  { id: "pasto_nativo_pantanal", nombre: "Pastizales Nativos (Pantanal / Bajíos)", categoria: "forraje", ms: 28, em: 1.6, prot: 5.0, fdn: 71, precio_kg: 0.30 },

  // ========== ENERGÉTICOS ==========
  { id: "maiz_amarillo", nombre: "Maíz Amarillo en Grano (Molido/Chancado)", categoria: "energético", ms: 88, em: 3.3, prot: 8.8, fdn: 12, precio_kg: 2.20 },
  { id: "sorgo_grano", nombre: "Sorgo Grano Seco Molido", categoria: "energético", ms: 89, em: 3.1, prot: 9.0, fdn: 15, precio_kg: 1.90 },
  { id: "afrecho_arroz_blanco", nombre: "Afrecho de Arroz Integral (Aceitoso)", categoria: "energético", ms: 90, em: 2.9, prot: 12.5, fdn: 22, precio_kg: 1.80 },
  { id: "afrecho_trigo", nombre: "Afrecho / Salvado de Trigo", categoria: "energético", ms: 88, em: 2.5, prot: 15.2, fdn: 38, precio_kg: 1.70 },
  { id: "melaza_caña", nombre: "Melaza de Caña de Azúcar (Ingenios Cruceños)", categoria: "energético", ms: 75, em: 2.6, prot: 3.0, fdn: 0, precio_kg: 1.20 },
  { id: "yuca_raiz", nombre: "Yuca Raíz Fresca (Picada)", categoria: "energético", ms: 35, em: 3.0, prot: 2.5, fdn: 10, precio_kg: 0.90 },
  { id: "cascarilla_soya", nombre: "Cascarilla de Soya (Fibra energética)", categoria: "energético", ms: 90, em: 2.4, prot: 12.1, fdn: 60, precio_kg: 2.00 },
  { id: "grano_destileria_sorgo", nombre: "Burlanda de Sorgo Seca (DDGS)", categoria: "energético", ms: 91, em: 3.0, prot: 27.0, fdn: 34, precio_kg: 2.50 },

  // ========== PROTEICOS ==========
  { id: "harina_soya_solvent", nombre: "Harina de Soya Extracción (46% Prot)", categoria: "proteico", ms: 89, em: 3.15, prot: 46.5, fdn: 13, precio_kg: 5.00 },
  { id: "expeller_soya", nombre: "Expeller / Torta de Soya (Prensado mecánico)", categoria: "proteico", ms: 90, em: 3.25, prot: 42.0, fdn: 15, precio_kg: 4.80 },
  { id: "torta_girasol", nombre: "Torta de Girasol Agroindustrial", categoria: "proteico", ms: 92, em: 2.3, prot: 31.0, fdn: 36, precio_kg: 3.20 },
  { id: "torta_algodon", nombre: "Torta de Algodón (Con fibra/pelusa)", categoria: "proteico", ms: 91, em: 2.4, prot: 37.5, fdn: 31, precio_kg: 3.50 },
  { id: "burlanda_maiz_dggs", nombre: "Burlanda de Maíz Seca (DDGS)", categoria: "proteico", ms: 92, em: 3.2, prot: 30.0, fdn: 33, precio_kg: 2.80 },
  { id: "urea_pua", nombre: "Urea Grado Alimenticio (NNP)", categoria: "proteico", ms: 99, em: 0.0, prot: 287.0, fdn: 0, precio_kg: 8.00 },

  // ========== MINERALES ==========
  { id: "sal_mineral_engorde", nombre: "Sal Mineralizada Fósforo 6%-8% (Engorde)", categoria: "mineral", ms: 98, em: 0.0, prot: 0.0, fdn: 0, precio_kg: 6.50 },
  { id: "sal_comun", nombre: "Sal Blanca de Mesa / Sal Común", categoria: "mineral", ms: 99, em: 0.0, prot: 0.0, fdn: 0, precio_kg: 1.50 },
  { id: "fosfato_bicalcico", nombre: "Fosfato Bicálcico (Corrector de Fósforo)", categoria: "mineral", ms: 99, em: 0.0, prot: 0.0, fdn: 0, precio_kg: 5.00 },
  { id: "carbonato_calcio", nombre: "Carbonato de Calcio (Corrector de Calcio)", categoria: "mineral", ms: 99, em: 0.0, prot: 0.0, fdn: 0, precio_kg: 2.50 }
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];

export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
