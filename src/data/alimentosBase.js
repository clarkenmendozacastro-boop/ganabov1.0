// src/data/alimentosBase.js - Versión avanzada con todos los parámetros
export const ALIMENTOS_BASE = [
  // ========== FORRAJES TROPICALES ==========
  {
    id: "pasto_mombasa", nombre: "Pasto Mombasa", categoria: "forraje",
    ms: 22, em: 1.9, enm: 1.2, eng: 0.8, prot: 8.5, pdr: 6.0, pnr: 2.5,
    fdn: 68, peNDF: 55, lignina: 5, digestibilidad_fdn: 55,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.05,
    ca: 0.3, p: 0.2, azufre: 0.15,
    precio_kg: 0, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.5, palatabilidad: 0.8
  },
  {
    id: "pasto_tanzania", nombre: "Pasto Tanzania", categoria: "forraje",
    ms: 23, em: 1.95, enm: 1.25, eng: 0.85, prot: 9.0, pdr: 6.5, pnr: 2.5,
    fdn: 66, peNDF: 52, lignina: 4.8, digestibilidad_fdn: 56,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.052,
    ca: 0.35, p: 0.22, azufre: 0.14,
    precio_kg: 0, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.4, palatabilidad: 0.82
  },
  {
    id: "pasto_marandu", nombre: "Pasto Marandú", categoria: "forraje",
    ms: 24, em: 1.8, enm: 1.1, eng: 0.7, prot: 7.5, pdr: 5.2, pnr: 2.3,
    fdn: 69, peNDF: 58, lignina: 5.2, digestibilidad_fdn: 52,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0.048,
    ca: 0.3, p: 0.18, azufre: 0.16,
    precio_kg: 0, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tamaño_particula: 2.6, palatabilidad: 0.78
  },
  // ========== SILOS ==========
  {
    id: "silo_maiz", nombre: "Silaje de Maíz", categoria: "forraje",
    ms: 35, em: 2.5, enm: 1.7, eng: 1.2, prot: 8.0, pdr: 6.0, pnr: 2.0,
    fdn: 48, peNDF: 30, lignina: 3.5, digestibilidad_fdn: 65,
    almidon_rapido: 20, almidon_lento: 15, tasa_deg: 0.08,
    ca: 0.25, p: 0.2, azufre: 0.1,
    precio_kg: 0, categoria_nutricional: "forraje",
    riesgo_acido: 0.4, tamaño_particula: 1.2, palatabilidad: 0.85
  },
  // ========== ENERGÉTICOS ==========
  {
    id: "maiz_amarillo", nombre: "Maíz Amarillo", categoria: "energético",
    ms: 88, em: 3.3, enm: 2.2, eng: 1.8, prot: 8.8, pdr: 6.0, pnr: 2.8,
    fdn: 12, peNDF: 5, lignina: 1, digestibilidad_fdn: 90,
    almidon_rapido: 70, almidon_lento: 10, tasa_deg: 0.25,
    ca: 0.02, p: 0.3, azufre: 0.1,
    precio_kg: 0, categoria_nutricional: "energético",
    riesgo_acido: 0.9, tamaño_particula: 0.5, palatabilidad: 0.95
  },
  {
    id: "sorgo_grano", nombre: "Sorgo Grano", categoria: "energético",
    ms: 89, em: 3.1, enm: 2.0, eng: 1.6, prot: 9.0, pdr: 6.5, pnr: 2.5,
    fdn: 15, peNDF: 8, lignina: 1.5, digestibilidad_fdn: 85,
    almidon_rapido: 50, almidon_lento: 25, tasa_deg: 0.20,
    ca: 0.03, p: 0.28, azufre: 0.12,
    precio_kg: 0, categoria_nutricional: "energético",
    riesgo_acido: 0.7, tamaño_particula: 0.6, palatabilidad: 0.9
  },
  // ========== PROTEICOS ==========
  {
    id: "harina_soya", nombre: "Harina de Soya (46%)", categoria: "proteico",
    ms: 89, em: 3.2, enm: 2.1, eng: 1.7, prot: 46.5, pdr: 30, pnr: 16.5,
    fdn: 13, peNDF: 5, lignina: 1.2, digestibilidad_fdn: 88,
    almidon_rapido: 5, almidon_lento: 5, tasa_deg: 0.18,
    ca: 0.3, p: 0.6, azufre: 0.3,
    precio_kg: 0, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tamaño_particula: 0.4, palatabilidad: 0.92
  },
  {
    id: "torta_girasol", nombre: "Torta de Girasol", categoria: "proteico",
    ms: 92, em: 2.3, enm: 1.4, eng: 1.0, prot: 31, pdr: 22, pnr: 9,
    fdn: 36, peNDF: 25, lignina: 6, digestibilidad_fdn: 65,
    almidon_rapido: 2, almidon_lento: 3, tasa_deg: 0.12,
    ca: 0.4, p: 0.8, azufre: 0.25,
    precio_kg: 0, categoria_nutricional: "proteico",
    riesgo_acido: 0.15, tamaño_particula: 0.8, palatabilidad: 0.85
  },
  // ========== MINERALES ==========
  {
    id: "sal_mineral", nombre: "Sal Mineral Engorde", categoria: "mineral",
    ms: 98, em: 0, enm: 0, eng: 0, prot: 0, pdr: 0, pnr: 0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, tasa_deg: 0,
    ca: 12, p: 6, azufre: 1,
    precio_kg: 0, categoria_nutricional: "mineral",
    riesgo_acido: 0, tamaño_particula: 0.1, palatabilidad: 0.7
  }
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];
export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
