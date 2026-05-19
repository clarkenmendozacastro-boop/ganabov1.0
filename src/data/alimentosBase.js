// src/data/alimentosBase.js
export const ALIMENTOS_BASE = [
  // FORRAJES (pastos largos con peNDF alto)
  { id: "pasto_mombasa", nombre: "Pasto Mombasa (pastoreo)", categoria: "forraje", ms: 22, prot: 8.5, em: 1.90, fdn: 68, enm: 1.20, peNDF: 55, tam_particula: 3.0, precio_kg: 0.45 },
  { id: "pasto_tanzania", nombre: "Pasto Tanzania (pastoreo)", categoria: "forraje", ms: 23, prot: 9.0, em: 1.95, fdn: 66, enm: 1.25, peNDF: 52, tam_particula: 2.8, precio_kg: 0.50 },
  { id: "heno_alfalfa", nombre: "Heno de Alfalfa", categoria: "forraje", ms: 88, prot: 18.0, em: 2.20, fdn: 42, enm: 1.50, peNDF: 25, tam_particula: 2.0, precio_kg: 2.80 },
  { id: "silo_maiz", nombre: "Silaje de Maíz", categoria: "forraje", ms: 35, prot: 8.0, em: 2.50, fdn: 48, enm: 1.70, peNDF: 30, tam_particula: 1.2, precio_kg: 0.80 },
  
  // ENERGÉTICOS
  { id: "maiz_amarillo", nombre: "Maíz Amarillo", categoria: "energético", ms: 88, prot: 8.8, em: 3.30, fdn: 12, enm: 2.20, peNDF: 5, precio_kg: 2.20 },
  { id: "sorgo_grano", nombre: "Sorgo Grano", categoria: "energético", ms: 89, prot: 9.0, em: 3.10, fdn: 15, enm: 2.00, peNDF: 8, precio_kg: 1.90 },
  { id: "melaza_caña", nombre: "Melaza de Caña", categoria: "energético", ms: 75, prot: 3.0, em: 2.60, fdn: 0, enm: 1.60, peNDF: 0, precio_kg: 1.20 },
  
  // PROTEICOS
  { id: "harina_soya", nombre: "Harina de Soya", categoria: "proteico", ms: 89, prot: 46.5, em: 3.20, fdn: 13, enm: 2.10, peNDF: 5, precio_kg: 5.00 },
  { id: "torta_girasol", nombre: "Torta de Girasol", categoria: "proteico", ms: 92, prot: 31.0, em: 2.30, fdn: 36, enm: 1.40, peNDF: 25, precio_kg: 3.20 },
  { id: "afrecho_trigo", nombre: "Afrecho de Trigo", categoria: "proteico", ms: 88, prot: 15.2, em: 2.50, fdn: 38, enm: 1.50, peNDF: 28, precio_kg: 1.70 },
  
  // MINERALES
  { id: "sal_mineral", nombre: "Sal Mineral Engorde", categoria: "mineral", ms: 98, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 6.50 }
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];
export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
