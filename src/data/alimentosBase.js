// src/data/alimentosBase.js
// Base de datos profesional con todos los parámetros avanzados

export const ALIMENTOS_BASE = [
  // FORRAJES
  { id: "pasto_mombasa", nombre: "Pasto Mombasa", categoria: "forraje", ms: 22, prot: 8.5, em: 1.90, fdn: 68,
    enm: 1.20, eng: 0.80, pdr: 6.0, pnr: 2.5, peNDF: 55, tam_particula: 2.5,
    almidon_rapido: 0, digestibilidad_fdn: 55, precio_kg: 0.45 },
  { id: "pasto_tanzania", nombre: "Pasto Tanzania", categoria: "forraje", ms: 23, prot: 9.0, em: 1.95, fdn: 66,
    enm: 1.25, eng: 0.85, pdr: 6.5, pnr: 2.5, peNDF: 52, tam_particula: 2.4,
    almidon_rapido: 0, digestibilidad_fdn: 56, precio_kg: 0.50 },
  { id: "pasto_marandu", nombre: "Pasto Marandú", categoria: "forraje", ms: 24, prot: 7.5, em: 1.80, fdn: 69,
    enm: 1.10, eng: 0.70, pdr: 5.2, pnr: 2.3, peNDF: 58, tam_particula: 2.6,
    almidon_rapido: 0, digestibilidad_fdn: 52, precio_kg: 0.40 },
  { id: "silo_maiz", nombre: "Silaje de Maíz", categoria: "forraje", ms: 35, prot: 8.0, em: 2.50, fdn: 48,
    enm: 1.70, eng: 1.20, pdr: 6.0, pnr: 2.0, peNDF: 30, tam_particula: 1.2,
    almidon_rapido: 20, digestibilidad_fdn: 65, precio_kg: 0.80 },
  { id: "heno_alfalfa", nombre: "Heno de Alfalfa", categoria: "forraje", ms: 88, prot: 18.0, em: 2.20, fdn: 42,
    enm: 1.50, eng: 1.05, pdr: 12.0, pnr: 6.0, peNDF: 25, tam_particula: 2.0,
    almidon_rapido: 0, digestibilidad_fdn: 70, precio_kg: 2.80 },
  // ENERGÉTICOS
  { id: "maiz_amarillo", nombre: "Maíz Amarillo", categoria: "energético", ms: 88, prot: 8.8, em: 3.30, fdn: 12,
    enm: 2.20, eng: 1.80, pdr: 6.0, pnr: 2.8, peNDF: 5, tam_particula: 0.5,
    almidon_rapido: 70, digestibilidad_fdn: 90, precio_kg: 2.20 },
  { id: "sorgo_grano", nombre: "Sorgo Grano", categoria: "energético", ms: 89, prot: 9.0, em: 3.10, fdn: 15,
    enm: 2.00, eng: 1.60, pdr: 6.5, pnr: 2.5, peNDF: 8, tam_particula: 0.6,
    almidon_rapido: 50, digestibilidad_fdn: 85, precio_kg: 1.90 },
  { id: "melaza_caña", nombre: "Melaza de Caña", categoria: "energético", ms: 75, prot: 3.0, em: 2.60, fdn: 0,
    enm: 1.60, eng: 1.20, pdr: 2.0, pnr: 1.0, peNDF: 0, tam_particula: 0.1,
    almidon_rapido: 0, digestibilidad_fdn: 100, precio_kg: 1.20 },
  { id: "yuca_raiz", nombre: "Yuca Raíz", categoria: "energético", ms: 35, prot: 2.5, em: 3.00, fdn: 10,
    enm: 1.90, eng: 1.50, pdr: 1.5, pnr: 1.0, peNDF: 5, tam_particula: 1.0,
    almidon_rapido: 60, digestibilidad_fdn: 92, precio_kg: 0.90 },
  // PROTEICOS
  { id: "harina_soya", nombre: "Harina de Soya", categoria: "proteico", ms: 89, prot: 46.5, em: 3.20, fdn: 13,
    enm: 2.10, eng: 1.70, pdr: 30.0, pnr: 16.5, peNDF: 5, tam_particula: 0.4,
    almidon_rapido: 5, digestibilidad_fdn: 88, precio_kg: 5.00 },
  { id: "torta_girasol", nombre: "Torta de Girasol", categoria: "proteico", ms: 92, prot: 31.0, em: 2.30, fdn: 36,
    enm: 1.40, eng: 1.00, pdr: 22.0, pnr: 9.0, peNDF: 25, tam_particula: 0.8,
    almidon_rapido: 2, digestibilidad_fdn: 65, precio_kg: 3.20 },
  { id: "afrecho_trigo", nombre: "Afrecho de Trigo", categoria: "proteico", ms: 88, prot: 15.2, em: 2.50, fdn: 38,
    enm: 1.50, eng: 1.10, pdr: 11.0, pnr: 4.2, peNDF: 28, tam_particula: 0.6,
    almidon_rapido: 8, digestibilidad_fdn: 72, precio_kg: 1.70 },
  // MINERALES
  { id: "sal_mineral", nombre: "Sal Mineral Engorde", categoria: "mineral", ms: 98, prot: 0, em: 0, fdn: 0,
    enm: 0, eng: 0, pdr: 0, pnr: 0, peNDF: 0, tam_particula: 0.1,
    almidon_rapido: 0, digestibilidad_fdn: 0, precio_kg: 6.50 }
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];
export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
