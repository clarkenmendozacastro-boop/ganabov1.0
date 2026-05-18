// src/data/alimentosBase.js
// Base de datos completa para motor nutricional avanzado (GanaBov Pro)
// Incluye parámetros: EM, ENm, ENg, PB, PDR, PNR, FDN, peNDF, lignina, almidones, minerales, etc.

export const ALIMENTOS_BASE = [
  // ==========================================
  // FORRAJES TROPICALES (pastos, henos, silajes)
  // ==========================================
  {
    id: "pasto_mombasa", nombre: "Pasto Mombasa (Megathyrsus maximus)", categoria: "forraje",
    ms: 22, em: 1.90, enm: 1.20, eng: 0.80, prot: 8.5, pdr: 6.0, pnr: 2.5,
    fdn: 68, peNDF: 55, lignina: 5.0, digestibilidad_fdn: 55,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.05,
    ca: 0.30, p: 0.20, azufre: 0.15,
    precio_kg: 0.45, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.5, palatabilidad: 0.80
  },
  {
    id: "pasto_tanzania", nombre: "Pasto Tanzania (Megathyrsus maximus)", categoria: "forraje",
    ms: 23, em: 1.95, enm: 1.25, eng: 0.85, prot: 9.0, pdr: 6.5, pnr: 2.5,
    fdn: 66, peNDF: 52, lignina: 4.8, digestibilidad_fdn: 56,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.052,
    ca: 0.35, p: 0.22, azufre: 0.14,
    precio_kg: 0.50, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.4, palatabilidad: 0.82
  },
  {
    id: "pasto_marandu", nombre: "Brachiaria brizantha cv. Marandú", categoria: "forraje",
    ms: 24, em: 1.80, enm: 1.10, eng: 0.70, prot: 7.5, pdr: 5.2, pnr: 2.3,
    fdn: 69, peNDF: 58, lignina: 5.2, digestibilidad_fdn: 52,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.048,
    ca: 0.30, p: 0.18, azufre: 0.16,
    precio_kg: 0.40, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.6, palatabilidad: 0.78
  },
  {
    id: "pasto_ruzi", nombre: "Brachiaria ruziziensis", categoria: "forraje",
    ms: 22, em: 1.85, enm: 1.15, eng: 0.75, prot: 8.0, pdr: 5.5, pnr: 2.5,
    fdn: 67, peNDF: 54, lignina: 4.9, digestibilidad_fdn: 54,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.050,
    ca: 0.32, p: 0.19, azufre: 0.15,
    precio_kg: 0.42, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.5, palatabilidad: 0.80
  },
  {
    id: "pasto_piata", nombre: "Brachiaria brizantha cv. Piatã", categoria: "forraje",
    ms: 25, em: 1.88, enm: 1.18, eng: 0.78, prot: 8.2, pdr: 5.8, pnr: 2.4,
    fdn: 68, peNDF: 56, lignina: 5.0, digestibilidad_fdn: 55,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.049,
    ca: 0.33, p: 0.20, azufre: 0.14,
    precio_kg: 0.44, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.5, palatabilidad: 0.81
  },
  {
    id: "pasto_zuri", nombre: "Pasto Zuri (híbrido de Megathyrsus)", categoria: "forraje",
    ms: 22, em: 2.00, enm: 1.30, eng: 0.90, prot: 10.5, pdr: 7.5, pnr: 3.0,
    fdn: 64, peNDF: 50, lignina: 4.5, digestibilidad_fdn: 60,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.058,
    ca: 0.38, p: 0.24, azufre: 0.13,
    precio_kg: 0.55, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.4, palatabilidad: 0.85
  },
  {
    id: "pasto_dictyoneura", nombre: "Pasto Llanero (Dictyoneura)", categoria: "forraje",
    ms: 26, em: 1.65, enm: 0.95, eng: 0.55, prot: 6.0, pdr: 4.0, pnr: 2.0,
    fdn: 72, peNDF: 62, lignina: 6.5, digestibilidad_fdn: 48,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.042,
    ca: 0.25, p: 0.15, azufre: 0.18,
    precio_kg: 0.35, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.7, palatabilidad: 0.70
  },
  {
    id: "pasto_maralfalfa", nombre: "Maralfalfa (Pennisetum sp.)", categoria: "forraje",
    ms: 18, em: 1.75, enm: 1.05, eng: 0.65, prot: 9.5, pdr: 6.8, pnr: 2.7,
    fdn: 63, peNDF: 50, lignina: 4.2, digestibilidad_fdn: 58,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.055,
    ca: 0.35, p: 0.21, azufre: 0.14,
    precio_kg: 0.50, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.3, palatabilidad: 0.83
  },
  {
    id: "pasto_camerun", nombre: "Pasto Elefante / Camerún", categoria: "forraje",
    ms: 17, em: 1.70, enm: 1.00, eng: 0.60, prot: 7.5, pdr: 5.2, pnr: 2.3,
    fdn: 65, peNDF: 52, lignina: 4.8, digestibilidad_fdn: 53,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.047,
    ca: 0.30, p: 0.18, azufre: 0.16,
    precio_kg: 0.40, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.5, palatabilidad: 0.79
  },
  {
    id: "pasto_nativo_pantanal", nombre: "Pastizal nativo del Pantanal", categoria: "forraje",
    ms: 28, em: 1.60, enm: 0.90, eng: 0.50, prot: 5.0, pdr: 3.2, pnr: 1.8,
    fdn: 71, peNDF: 60, lignina: 7.0, digestibilidad_fdn: 45,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.040,
    ca: 0.22, p: 0.12, azufre: 0.20,
    precio_kg: 0.30, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.8, palatabilidad: 0.68
  },
  // ========== SILOS Y HENOS ==========
  {
    id: "silo_maiz", nombre: "Silaje de Maíz (planta entera)", categoria: "forraje",
    ms: 35, em: 2.50, enm: 1.70, eng: 1.20, prot: 8.0, pdr: 6.0, pnr: 2.0,
    fdn: 48, peNDF: 30, lignina: 3.5, digestibilidad_fdn: 65,
    almidon_rapido: 20, almidon_lento: 15, tasa_deg: 0.08,
    ca: 0.25, p: 0.20, azufre: 0.10,
    precio_kg: 0.80, categoria_nutricional: "forraje",
    riesgo_acido: 0.4, tamaño_particula: 1.2, palatabilidad: 0.85
  },
  {
    id: "silo_sorgo", nombre: "Silaje de Sorgo Forrajero", categoria: "forraje",
    ms: 30, em: 2.10, enm: 1.40, eng: 0.90, prot: 7.0, pdr: 5.0, pnr: 2.0,
    fdn: 55, peNDF: 35, lignina: 4.0, digestibilidad_fdn: 60,
    almidon_rapido: 12, almidon_lento: 20, tasa_deg: 0.07,
    ca: 0.22, p: 0.18, azufre: 0.12,
    precio_kg: 0.70, categoria_nutricional: "forraje",
    riesgo_acido: 0.3, tamaño_particula: 1.3, palatabilidad: 0.82
  },
  {
    id: "heno_alfalfa", nombre: "Heno de Alfalfa (deshidratado)", categoria: "forraje",
    ms: 88, em: 2.20, enm: 1.50, eng: 1.05, prot: 18.0, pdr: 12.0, pnr: 6.0,
    fdn: 42, peNDF: 25, lignina: 3.0, digestibilidad_fdn: 70,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.10,
    ca: 1.20, p: 0.25, azufre: 0.20,
    precio_kg: 2.80, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.0, palatabilidad: 0.90
  },
  {
    id: "heno_brachiaria", nombre: "Heno de Brachiaria", categoria: "forraje",
    ms: 86, em: 1.60, enm: 0.95, eng: 0.55, prot: 5.5, pdr: 3.5, pnr: 2.0,
    fdn: 72, peNDF: 60, lignina: 6.0, digestibilidad_fdn: 50,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.045,
    ca: 0.28, p: 0.15, azufre: 0.18,
    precio_kg: 1.20, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.5, palatabilidad: 0.75
  },
  {
    id: "heno_tifton", nombre: "Heno de Tifton 85 (Cynodon)", categoria: "forraje",
    ms: 89, em: 1.85, enm: 1.10, eng: 0.70, prot: 9.0, pdr: 6.0, pnr: 3.0,
    fdn: 65, peNDF: 50, lignina: 4.5, digestibilidad_fdn: 58,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.055,
    ca: 0.35, p: 0.20, azufre: 0.15,
    precio_kg: 1.50, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.2, palatabilidad: 0.84
  },
  {
    id: "chala_maiz", nombre: "Chala de Maíz (rastrojo seco)", categoria: "forraje",
    ms: 85, em: 1.50, enm: 0.85, eng: 0.45, prot: 4.5, pdr: 2.8, pnr: 1.7,
    fdn: 74, peNDF: 65, lignina: 7.5, digestibilidad_fdn: 45,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.038,
    ca: 0.20, p: 0.10, azufre: 0.22,
    precio_kg: 0.80, categoria_nutricional: "forraje",
    riesgo_acido: 0.0, tamaño_particula: 2.8, palatabilidad: 0.65
  },
  // ==========================================
  // ENERGÉTICOS (granos, tubérculos, subproductos)
  // ==========================================
  {
    id: "maiz_amarillo", nombre: "Maíz Amarillo (grano molido)", categoria: "energético",
    ms: 88, em: 3.30, enm: 2.20, eng: 1.80, prot: 8.8, pdr: 6.0, pnr: 2.8,
    fdn: 12, peNDF: 5, lignina: 1.0, digestibilidad_fdn: 90,
    almidon_rapido: 70, almidon_lento: 10, tasa_deg: 0.25,
    ca: 0.02, p: 0.30, azufre: 0.10,
    precio_kg: 2.20, categoria_nutricional: "energético",
    riesgo_acido: 0.9, tamaño_particula: 0.5, palatabilidad: 0.95
  },
  {
    id: "sorgo_grano", nombre: "Sorgo Grano (molido)", categoria: "energético",
    ms: 89, em: 3.10, enm: 2.00, eng: 1.60, prot: 9.0, pdr: 6.5, pnr: 2.5,
    fdn: 15, peNDF: 8, lignina: 1.5, digestibilidad_fdn: 85,
    almidon_rapido: 50, almidon_lento: 25, tasa_deg: 0.20,
    ca: 0.03, p: 0.28, azufre: 0.12,
    precio_kg: 1.90, categoria_nutricional: "energético",
    riesgo_acido: 0.7, tamaño_particula: 0.6, palatabilidad: 0.90
  },
  {
    id: "cebada_grano", nombre: "Cebada Grano", categoria: "energético",
    ms: 88, em: 3.05, enm: 1.95, eng: 1.55, prot: 11.5, pdr: 8.0, pnr: 3.5,
    fdn: 18, peNDF: 10, lignina: 1.8, digestibilidad_fdn: 82,
    almidon_rapido: 55, almidon_lento: 20, tasa_deg: 0.22,
    ca: 0.04, p: 0.32, azufre: 0.11,
    precio_kg: 2.50, categoria_nutricional: "energético",
    riesgo_acido: 0.8, tamaño_particula: 0.5, palatabilidad: 0.92
  },
  {
    id: "yuca_raiz", nombre: "Yuca Raíz Fresca (picada)", categoria: "energético",
    ms: 35, em: 3.00, enm: 1.90, eng: 1.50, prot: 2.5, pdr: 1.5, pnr: 1.0,
    fdn: 10, peNDF: 5, lignina: 0.5, digestibilidad_fdn: 92,
    almidon_rapido: 60, almidon_lento: 5, tasa_deg: 0.28,
    ca: 0.05, p: 0.12, azufre: 0.08,
    precio_kg: 0.90, categoria_nutricional: "energético",
    riesgo_acido: 0.8, tamaño_particula: 1.0, palatabilidad: 0.88
  },
  {
    id: "melaza_caña", nombre: "Melaza de Caña de Azúcar", categoria: "energético",
    ms: 75, em: 2.60, enm: 1.60, eng: 1.20, prot: 3.0, pdr: 2.0, pnr: 1.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 100,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.35,
    ca: 0.10, p: 0.05, azufre: 0.20,
    precio_kg: 1.20, categoria_nutricional: "energético",
    riesgo_acido: 0.8, tamaño_particula: 0.1, palatabilidad: 0.98
  },
  {
    id: "grano_destileria_sorgo", nombre: "DDGS de Sorgo", categoria: "energético",
    ms: 91, em: 3.00, enm: 1.95, eng: 1.60, prot: 27.0, pdr: 20.0, pnr: 7.0,
    fdn: 34, peNDF: 25, lignina: 3.0, digestibilidad_fdn: 75,
    almidon_rapido: 5, almidon_lento: 10, tasa_deg: 0.12,
    ca: 0.05, p: 0.70, azufre: 0.25,
    precio_kg: 2.50, categoria_nutricional: "energético",
    riesgo_acido: 0.4, tamaño_particula: 0.8, palatabilidad: 0.88
  },
  // ==========================================
  // PROTEICOS (tortas, harinas, subproductos)
  // ==========================================
  {
    id: "harina_soya", nombre: "Harina de Soya (46% PB)", categoria: "proteico",
    ms: 89, em: 3.20, enm: 2.10, eng: 1.70, prot: 46.5, pdr: 30.0, pnr: 16.5,
    fdn: 13, peNDF: 5, lignina: 1.2, digestibilidad_fdn: 88,
    almidon_rapido: 5, almidon_lento: 5, tasa_deg: 0.18,
    ca: 0.30, p: 0.60, azufre: 0.30,
    precio_kg: 5.00, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tamaño_particula: 0.4, palatabilidad: 0.92
  },
  {
    id: "expeller_soya", nombre: "Expeller de Soya (torta prensada)", categoria: "proteico",
    ms: 90, em: 3.25, enm: 2.15, eng: 1.75, prot: 42.0, pdr: 28.0, pnr: 14.0,
    fdn: 15, peNDF: 6, lignina: 1.5, digestibilidad_fdn: 85,
    almidon_rapido: 4, almidon_lento: 6, tasa_deg: 0.17,
    ca: 0.28, p: 0.65, azufre: 0.28,
    precio_kg: 4.80, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tamaño_particula: 0.5, palatabilidad: 0.90
  },
  {
    id: "torta_girasol", nombre: "Torta de Girasol", categoria: "proteico",
    ms: 92, em: 2.30, enm: 1.40, eng: 1.00, prot: 31.0, pdr: 22.0, pnr: 9.0,
    fdn: 36, peNDF: 25, lignina: 6.0, digestibilidad_fdn: 65,
    almidon_rapido: 2, almidon_lento: 3, tasa_deg: 0.12,
    ca: 0.40, p: 0.80, azufre: 0.25,
    precio_kg: 3.20, categoria_nutricional: "proteico",
    riesgo_acido: 0.15, tamaño_particula: 0.8, palatabilidad: 0.85
  },
  {
    id: "torta_algodon", nombre: "Torta de Algodón", categoria: "proteico",
    ms: 91, em: 2.40, enm: 1.45, eng: 1.05, prot: 37.5, pdr: 26.0, pnr: 11.5,
    fdn: 31, peNDF: 20, lignina: 5.0, digestibilidad_fdn: 68,
    almidon_rapido: 1, almidon_lento: 2, tasa_deg: 0.11,
    ca: 0.20, p: 0.70, azufre: 0.22,
    precio_kg: 3.50, categoria_nutricional: "proteico",
    riesgo_acido: 0.15, tamaño_particula: 0.7, palatabilidad: 0.83
  },
  {
    id: "afrecho_trigo", nombre: "Afrecho / Salvado de Trigo", categoria: "proteico",
    ms: 88, em: 2.50, enm: 1.50, eng: 1.10, prot: 15.2, pdr: 11.0, pnr: 4.2,
    fdn: 38, peNDF: 28, lignina: 3.5, digestibilidad_fdn: 72,
    almidon_rapido: 8, almidon_lento: 10, tasa_deg: 0.14,
    ca: 0.12, p: 0.90, azufre: 0.15,
    precio_kg: 1.70, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tamaño_particula: 0.6, palatabilidad: 0.88
  },
  {
    id: "afrecho_arroz", nombre: "Afrecho de Arroz Integral", categoria: "proteico",
    ms: 90, em: 2.70, enm: 1.65, eng: 1.25, prot: 12.5, pdr: 9.0, pnr: 3.5,
    fdn: 28, peNDF: 18, lignina: 2.5, digestibilidad_fdn: 78,
    almidon_rapido: 10, almidon_lento: 12, tasa_deg: 0.13,
    ca: 0.08, p: 1.10, azufre: 0.12,
    precio_kg: 1.80, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tamaño_particula: 0.7, palatabilidad: 0.86
  },
  {
    id: "cascarilla_soya", nombre: "Cascarilla de Soya", categoria: "proteico",
    ms: 90, em: 2.40, enm: 1.45, eng: 1.05, prot: 12.0, pdr: 8.0, pnr: 4.0,
    fdn: 60, peNDF: 45, lignina: 8.0, digestibilidad_fdn: 55,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.08,
    ca: 0.25, p: 0.15, azufre: 0.18,
    precio_kg: 2.00, categoria_nutricional: "proteico",
    riesgo_acido: 0.1, tamaño_particula: 1.2, palatabilidad: 0.78
  },
  // ==========================================
  // MINERALES Y SUPLEMENTOS
  // ==========================================
  {
    id: "sal_mineral", nombre: "Sal Mineral para Engorde", categoria: "mineral",
    ms: 98, em: 0.0, enm: 0.0, eng: 0.0, prot: 0.0, pdr: 0.0, pnr: 0.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0,
    ca: 12.0, p: 6.0, azufre: 1.0,
    precio_kg: 6.50, categoria_nutricional: "mineral",
    riesgo_acido: 0, tamaño_particula: 0.1, palatabilidad: 0.70
  },
  {
    id: "sal_comun", nombre: "Sal Común (NaCl)", categoria: "mineral",
    ms: 99, em: 0.0, enm: 0.0, eng: 0.0, prot: 0.0, pdr: 0.0, pnr: 0.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0,
    ca: 0.2, p: 0.0, azufre: 0.1,
    precio_kg: 1.50, categoria_nutricional: "mineral",
    riesgo_acido: 0, tamaño_particula: 0.1, palatabilidad: 0.80
  },
  {
    id: "fosfato_bicalcico", nombre: "Fosfato Bicálcico", categoria: "mineral",
    ms: 99, em: 0.0, enm: 0.0, eng: 0.0, prot: 0.0, pdr: 0.0, pnr: 0.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0,
    ca: 22.0, p: 18.0, azufre: 0.1,
    precio_kg: 5.00, categoria_nutricional: "mineral",
    riesgo_acido: 0, tamaño_particula: 0.1, palatabilidad: 0.60
  }
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];

export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
