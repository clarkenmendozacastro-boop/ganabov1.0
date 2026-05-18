// src/data/alimentosBase.js
export const ALIMENTOS_BASE = [
  // FORRAJES
  { id: "pasto_mombasa", nombre: "Pasto Mombasa", categoria: "forraje", ms: 22, em: 1.9, prot: 8.5, fdn: 68, digestibilidad: 68, precio_kg: 0 },
  { id: "pasto_tanzania", nombre: "Pasto Tanzania", categoria: "forraje", ms: 23, em: 1.95, prot: 9.0, fdn: 66, digestibilidad: 67, precio_kg: 0 },
  { id: "pasto_marandu", nombre: "Pasto Marandú", categoria: "forraje", ms: 24, em: 1.8, prot: 7.5, fdn: 69, digestibilidad: 65, precio_kg: 0 },
  { id: "silo_maiz", nombre: "Silaje de Maíz", categoria: "forraje", ms: 35, em: 2.5, prot: 8.0, fdn: 48, digestibilidad: 70, precio_kg: 0 },
  { id: "heno_alfalfa", nombre: "Heno de Alfalfa", categoria: "forraje", ms: 88, em: 2.2, prot: 18.0, fdn: 42, digestibilidad: 72, precio_kg: 0 },
  // ENERGÉTICOS
  { id: "maiz_amarillo", nombre: "Maíz Amarillo", categoria: "energético", ms: 88, em: 3.3, prot: 8.8, fdn: 12, digestibilidad: 90, precio_kg: 0 },
  { id: "sorgo_grano", nombre: "Sorgo Grano", categoria: "energético", ms: 89, em: 3.1, prot: 9.0, fdn: 15, digestibilidad: 85, precio_kg: 0 },
  { id: "melaza_caña", nombre: "Melaza de Caña", categoria: "energético", ms: 75, em: 2.6, prot: 3.0, fdn: 0, digestibilidad: 95, precio_kg: 0 },
  { id: "yuca_raiz", nombre: "Yuca Raíz", categoria: "energético", ms: 35, em: 3.0, prot: 2.5, fdn: 10, digestibilidad: 88, precio_kg: 0 },
  // PROTEICOS
  { id: "harina_soya", nombre: "Harina de Soya (46%)", categoria: "proteico", ms: 89, em: 3.2, prot: 46.5, fdn: 13, digestibilidad: 92, precio_kg: 0 },
  { id: "torta_girasol", nombre: "Torta de Girasol", categoria: "proteico", ms: 92, em: 2.3, prot: 31.0, fdn: 36, digestibilidad: 82, precio_kg: 0 },
  { id: "afrecho_trigo", nombre: "Afrecho de Trigo", categoria: "proteico", ms: 88, em: 2.5, prot: 15.2, fdn: 38, digestibilidad: 80, precio_kg: 0 },
  // MINERALES
  { id: "sal_mineral", nombre: "Sal Mineral Engorde", categoria: "mineral", ms: 98, em: 0, prot: 0, fdn: 0, digestibilidad: 0, precio_kg: 0 },
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];
export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
