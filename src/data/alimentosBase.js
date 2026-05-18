// src/data/alimentosBase.js
// Base de datos profesional para GanaBov Engine Pro
// Incluye: ENm, ENg, PDR, PNR, peNDF, almidones, digestibilidad, minerales

export const ALIMENTOS_BASE = [
  // ==========================================
  // FORRAJES TROPICALES (pastos, henos, silajes)
  // ==========================================
  {
    id: "pasto_mombasa", nombre: "Pasto Mombasa (Megathyrsus maximus)", categoria: "forraje",
    ms: 22, em: 1.90, enm: 1.20, eng: 0.80, prot: 8.5, pdr: 6.0, pnr: 2.5,
    fdn: 68, peNDF: 55, lignina: 5.0, digestibilidad_fdn: 55,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.0, tasa_deg: 0.05,
    ca: 0.30, p: 0.20, mg: 0.15, k: 1.5, s: 0.15, na: 0.02, cl: 0.10, grasa: 2.0,
    precio_kg: 0.45, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.5, palatabilidad: 0.80, ferm_rapida: 0.2, ferm_lenta: 0.7
  },
  {
    id: "pasto_tanzania", nombre: "Pasto Tanzania (Megathyrsus maximus)", categoria: "forraje",
    ms: 23, em: 1.95, enm: 1.25, eng: 0.85, prot: 9.0, pdr: 6.5, pnr: 2.5,
    fdn: 66, peNDF: 52, lignina: 4.8, digestibilidad_fdn: 56,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.2, tasa_deg: 0.052,
    ca: 0.35, p: 0.22, mg: 0.16, k: 1.6, s: 0.14, na: 0.02, cl: 0.10, grasa: 2.1,
    precio_kg: 0.50, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.4, palatabilidad: 0.82, ferm_rapida: 0.18, ferm_lenta: 0.72
  },
  {
    id: "pasto_marandu", nombre: "Brachiaria brizantha cv. Marandú", categoria: "forraje",
    ms: 24, em: 1.80, enm: 1.10, eng: 0.70, prot: 7.5, pdr: 5.2, pnr: 2.3,
    fdn: 69, peNDF: 58, lignina: 5.2, digestibilidad_fdn: 52,
    almidon_rapido: 0, almidon_lento: 0, azucares: 1.8, tasa_deg: 0.048,
    ca: 0.30, p: 0.18, mg: 0.14, k: 1.4, s: 0.16, na: 0.02, cl: 0.09, grasa: 2.0,
    precio_kg: 0.40, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.6, palatabilidad: 0.78, ferm_rapida: 0.15, ferm_lenta: 0.75
  },
  {
    id: "pasto_ruzi", nombre: "Brachiaria ruziziensis", categoria: "forraje",
    ms: 22, em: 1.85, enm: 1.15, eng: 0.75, prot: 8.0, pdr: 5.5, pnr: 2.5,
    fdn: 67, peNDF: 54, lignina: 4.9, digestibilidad_fdn: 54,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.0, tasa_deg: 0.050,
    ca: 0.32, p: 0.19, mg: 0.15, k: 1.5, s: 0.15, na: 0.02, cl: 0.10, grasa: 2.0,
    precio_kg: 0.42, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.5, palatabilidad: 0.80, ferm_rapida: 0.16, ferm_lenta: 0.73
  },
  {
    id: "pasto_piata", nombre: "Brachiaria brizantha cv. Piatã", categoria: "forraje",
    ms: 25, em: 1.88, enm: 1.18, eng: 0.78, prot: 8.2, pdr: 5.8, pnr: 2.4,
    fdn: 68, peNDF: 56, lignina: 5.0, digestibilidad_fdn: 55,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.1, tasa_deg: 0.049,
    ca: 0.33, p: 0.20, mg: 0.15, k: 1.5, s: 0.14, na: 0.02, cl: 0.10, grasa: 2.1,
    precio_kg: 0.44, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.5, palatabilidad: 0.81, ferm_rapida: 0.17, ferm_lenta: 0.74
  },
  {
    id: "pasto_zuri", nombre: "Pasto Zuri (híbrido de Megathyrsus)", categoria: "forraje",
    ms: 22, em: 2.00, enm: 1.30, eng: 0.90, prot: 10.5, pdr: 7.5, pnr: 3.0,
    fdn: 64, peNDF: 50, lignina: 4.5, digestibilidad_fdn: 60,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.5, tasa_deg: 0.058,
    ca: 0.38, p: 0.24, mg: 0.18, k: 1.7, s: 0.13, na: 0.03, cl: 0.11, grasa: 2.3,
    precio_kg: 0.55, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.4, palatabilidad: 0.85, ferm_rapida: 0.20, ferm_lenta: 0.70
  },
  {
    id: "pasto_dictyoneura", nombre: "Pasto Llanero (Dictyoneura)", categoria: "forraje",
    ms: 26, em: 1.65, enm: 0.95, eng: 0.55, prot: 6.0, pdr: 4.0, pnr: 2.0,
    fdn: 72, peNDF: 62, lignina: 6.5, digestibilidad_fdn: 48,
    almidon_rapido: 0, almidon_lento: 0, azucares: 1.5, tasa_deg: 0.042,
    ca: 0.25, p: 0.15, mg: 0.12, k: 1.2, s: 0.18, na: 0.02, cl: 0.09, grasa: 1.5,
    precio_kg: 0.35, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.7, palatabilidad: 0.70, ferm_rapida: 0.10, ferm_lenta: 0.80
  },
  {
    id: "pasto_maralfalfa", nombre: "Maralfalfa (Pennisetum sp.)", categoria: "forraje",
    ms: 18, em: 1.75, enm: 1.05, eng: 0.65, prot: 9.5, pdr: 6.8, pnr: 2.7,
    fdn: 63, peNDF: 50, lignina: 4.2, digestibilidad_fdn: 58,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.3, tasa_deg: 0.055,
    ca: 0.35, p: 0.21, mg: 0.16, k: 1.6, s: 0.14, na: 0.02, cl: 0.10, grasa: 2.2,
    precio_kg: 0.50, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.3, palatabilidad: 0.83, ferm_rapida: 0.18, ferm_lenta: 0.72
  },
  {
    id: "pasto_camerun", nombre: "Pasto Elefante / Camerún", categoria: "forraje",
    ms: 17, em: 1.70, enm: 1.00, eng: 0.60, prot: 7.5, pdr: 5.2, pnr: 2.3,
    fdn: 65, peNDF: 52, lignina: 4.8, digestibilidad_fdn: 53,
    almidon_rapido: 0, almidon_lento: 0, azucares: 1.9, tasa_deg: 0.047,
    ca: 0.30, p: 0.18, mg: 0.14, k: 1.4, s: 0.16, na: 0.02, cl: 0.09, grasa: 1.9,
    precio_kg: 0.40, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.5, palatabilidad: 0.79, ferm_rapida: 0.15, ferm_lenta: 0.75
  },
  {
    id: "pasto_nativo_pantanal", nombre: "Pastizal nativo del Pantanal", categoria: "forraje",
    ms: 28, em: 1.60, enm: 0.90, eng: 0.50, prot: 5.0, pdr: 3.2, pnr: 1.8,
    fdn: 71, peNDF: 60, lignina: 7.0, digestibilidad_fdn: 45,
    almidon_rapido: 0, almidon_lento: 0, azucares: 1.2, tasa_deg: 0.040,
    ca: 0.22, p: 0.12, mg: 0.10, k: 1.0, s: 0.20, na: 0.02, cl: 0.08, grasa: 1.2,
    precio_kg: 0.30, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.8, palatabilidad: 0.68, ferm_rapida: 0.08, ferm_lenta: 0.82
  },
  // ========== SILOS Y HENOS ==========
  {
    id: "silo_maiz", nombre: "Silaje de Maíz (planta entera)", categoria: "forraje",
    ms: 35, em: 2.50, enm: 1.70, eng: 1.20, prot: 8.0, pdr: 6.0, pnr: 2.0,
    fdn: 48, peNDF: 30, lignina: 3.5, digestibilidad_fdn: 65,
    almidon_rapido: 20, almidon_lento: 15, azucares: 5.0, tasa_deg: 0.08,
    ca: 0.25, p: 0.20, mg: 0.15, k: 1.2, s: 0.10, na: 0.02, cl: 0.10, grasa: 3.0,
    precio_kg: 0.80, categoria_nutricional: "forraje",
    riesgo_acido: 0.4, tam_particula: 1.2, palatabilidad: 0.85, ferm_rapida: 0.4, ferm_lenta: 0.5
  },
  {
    id: "silo_sorgo", nombre: "Silaje de Sorgo Forrajero", categoria: "forraje",
    ms: 30, em: 2.10, enm: 1.40, eng: 0.90, prot: 7.0, pdr: 5.0, pnr: 2.0,
    fdn: 55, peNDF: 35, lignina: 4.0, digestibilidad_fdn: 60,
    almidon_rapido: 12, almidon_lento: 20, azucares: 4.0, tasa_deg: 0.07,
    ca: 0.22, p: 0.18, mg: 0.14, k: 1.1, s: 0.12, na: 0.02, cl: 0.09, grasa: 2.8,
    precio_kg: 0.70, categoria_nutricional: "forraje",
    riesgo_acido: 0.3, tam_particula: 1.3, palatabilidad: 0.82, ferm_rapida: 0.35, ferm_lenta: 0.55
  },
  {
    id: "heno_alfalfa", nombre: "Heno de Alfalfa (deshidratado)", categoria: "forraje",
    ms: 88, em: 2.20, enm: 1.50, eng: 1.05, prot: 18.0, pdr: 12.0, pnr: 6.0,
    fdn: 42, peNDF: 25, lignina: 3.0, digestibilidad_fdn: 70,
    almidon_rapido: 0, almidon_lento: 0, azucares: 8.0, tasa_deg: 0.10,
    ca: 1.20, p: 0.25, mg: 0.30, k: 2.0, s: 0.20, na: 0.10, cl: 0.20, grasa: 3.0,
    precio_kg: 2.80, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.0, palatabilidad: 0.90, ferm_rapida: 0.5, ferm_lenta: 0.4
  },
  {
    id: "heno_brachiaria", nombre: "Heno de Brachiaria", categoria: "forraje",
    ms: 86, em: 1.60, enm: 0.95, eng: 0.55, prot: 5.5, pdr: 3.5, pnr: 2.0,
    fdn: 72, peNDF: 60, lignina: 6.0, digestibilidad_fdn: 50,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.0, tasa_deg: 0.045,
    ca: 0.28, p: 0.15, mg: 0.12, k: 1.2, s: 0.18, na: 0.02, cl: 0.09, grasa: 1.8,
    precio_kg: 1.20, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.5, palatabilidad: 0.75, ferm_rapida: 0.1, ferm_lenta: 0.8
  },
  {
    id: "heno_tifton", nombre: "Heno de Tifton 85 (Cynodon)", categoria: "forraje",
    ms: 89, em: 1.85, enm: 1.10, eng: 0.70, prot: 9.0, pdr: 6.0, pnr: 3.0,
    fdn: 65, peNDF: 50, lignina: 4.5, digestibilidad_fdn: 58,
    almidon_rapido: 0, almidon_lento: 0, azucares: 3.0, tasa_deg: 0.055,
    ca: 0.35, p: 0.20, mg: 0.18, k: 1.5, s: 0.15, na: 0.03, cl: 0.11, grasa: 2.2,
    precio_kg: 1.50, categoria_nutricional: "forraje",
    riesgo_acido: 0.1, tam_particula: 2.2, palatabilidad: 0.84, ferm_rapida: 0.2, ferm_lenta: 0.7
  },
  {
    id: "chala_maiz", nombre: "Chala de Maíz (rastrojo seco)", categoria: "forraje",
    ms: 85, em: 1.50, enm: 0.85, eng: 0.45, prot: 4.5, pdr: 2.8, pnr: 1.7,
    fdn: 74, peNDF: 65, lignina: 7.5, digestibilidad_fdn: 45,
    almidon_rapido: 0, almidon_lento: 0, azucares: 1.0, tasa_deg: 0.038,
    ca: 0.20, p: 0.10, mg: 0.08, k: 0.8, s: 0.22, na: 0.01, cl: 0.07, grasa: 1.0,
    precio_kg: 0.80, categoria_nutricional: "forraje",
    riesgo_acido: 0.0, tam_particula: 2.8, palatabilidad: 0.65, ferm_rapida: 0.05, ferm_lenta: 0.85
  },
  // ==========================================
  // ENERGÉTICOS (granos, tubérculos, subproductos)
  // ==========================================
  {
    id: "maiz_amarillo", nombre: "Maíz Amarillo (grano molido)", categoria: "energético",
    ms: 88, em: 3.30, enm: 2.20, eng: 1.80, prot: 8.8, pdr: 6.0, pnr: 2.8,
    fdn: 12, peNDF: 5, lignina: 1.0, digestibilidad_fdn: 90,
    almidon_rapido: 70, almidon_lento: 10, azucares: 2.0, tasa_deg: 0.25,
    ca: 0.02, p: 0.30, mg: 0.12, k: 0.35, s: 0.10, na: 0.01, cl: 0.05, grasa: 4.0,
    precio_kg: 2.20, categoria_nutricional: "energético",
    riesgo_acido: 0.9, tam_particula: 0.5, palatabilidad: 0.95, ferm_rapida: 0.8, ferm_lenta: 0.1
  },
  {
    id: "sorgo_grano", nombre: "Sorgo Grano (molido)", categoria: "energético",
    ms: 89, em: 3.10, enm: 2.00, eng: 1.60, prot: 9.0, pdr: 6.5, pnr: 2.5,
    fdn: 15, peNDF: 8, lignina: 1.5, digestibilidad_fdn: 85,
    almidon_rapido: 50, almidon_lento: 25, azucares: 2.0, tasa_deg: 0.20,
    ca: 0.03, p: 0.28, mg: 0.14, k: 0.40, s: 0.12, na: 0.01, cl: 0.06, grasa: 3.5,
    precio_kg: 1.90, categoria_nutricional: "energético",
    riesgo_acido: 0.7, tam_particula: 0.6, palatabilidad: 0.90, ferm_rapida: 0.6, ferm_lenta: 0.3
  },
  {
    id: "cebada_grano", nombre: "Cebada Grano", categoria: "energético",
    ms: 88, em: 3.05, enm: 1.95, eng: 1.55, prot: 11.5, pdr: 8.0, pnr: 3.5,
    fdn: 18, peNDF: 10, lignina: 1.8, digestibilidad_fdn: 82,
    almidon_rapido: 55, almidon_lento: 20, azucares: 2.5, tasa_deg: 0.22,
    ca: 0.04, p: 0.32, mg: 0.15, k: 0.45, s: 0.11, na: 0.01, cl: 0.07, grasa: 2.5,
    precio_kg: 2.50, categoria_nutricional: "energético",
    riesgo_acido: 0.8, tam_particula: 0.5, palatabilidad: 0.92, ferm_rapida: 0.7, ferm_lenta: 0.2
  },
  {
    id: "yuca_raiz", nombre: "Yuca Raíz Fresca (picada)", categoria: "energético",
    ms: 35, em: 3.00, enm: 1.90, eng: 1.50, prot: 2.5, pdr: 1.5, pnr: 1.0,
    fdn: 10, peNDF: 5, lignina: 0.5, digestibilidad_fdn: 92,
    almidon_rapido: 60, almidon_lento: 5, azucares: 2.0, tasa_deg: 0.28,
    ca: 0.05, p: 0.12, mg: 0.08, k: 0.6, s: 0.08, na: 0.01, cl: 0.06, grasa: 0.5,
    precio_kg: 0.90, categoria_nutricional: "energético",
    riesgo_acido: 0.8, tam_particula: 1.0, palatabilidad: 0.88, ferm_rapida: 0.75, ferm_lenta: 0.15
  },
  {
    id: "melaza_caña", nombre: "Melaza de Caña de Azúcar", categoria: "energético",
    ms: 75, em: 2.60, enm: 1.60, eng: 1.20, prot: 3.0, pdr: 2.0, pnr: 1.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 100,
    almidon_rapido: 0, almidon_lento: 0, azucares: 48, tasa_deg: 0.35,
    ca: 0.10, p: 0.05, mg: 0.05, k: 1.5, s: 0.20, na: 0.02, cl: 0.15, grasa: 0.0,
    precio_kg: 1.20, categoria_nutricional: "energético",
    riesgo_acido: 0.8, tam_particula: 0.1, palatabilidad: 0.98, ferm_rapida: 0.9, ferm_lenta: 0.0
  },
  {
    id: "grano_destileria_sorgo", nombre: "DDGS de Sorgo", categoria: "energético",
    ms: 91, em: 3.00, enm: 1.95, eng: 1.60, prot: 27.0, pdr: 20.0, pnr: 7.0,
    fdn: 34, peNDF: 25, lignina: 3.0, digestibilidad_fdn: 75,
    almidon_rapido: 5, almidon_lento: 10, azucares: 1.0, tasa_deg: 0.12,
    ca: 0.05, p: 0.70, mg: 0.30, k: 1.0, s: 0.25, na: 0.15, cl: 0.20, grasa: 8.0,
    precio_kg: 2.50, categoria_nutricional: "energético",
    riesgo_acido: 0.4, tam_particula: 0.8, palatabilidad: 0.88, ferm_rapida: 0.4, ferm_lenta: 0.5
  },
  // ==========================================
  // PROTEICOS (tortas, harinas, subproductos)
  // ==========================================
  {
    id: "harina_soya", nombre: "Harina de Soya (46% PB)", categoria: "proteico",
    ms: 89, em: 3.20, enm: 2.10, eng: 1.70, prot: 46.5, pdr: 30.0, pnr: 16.5,
    fdn: 13, peNDF: 5, lignina: 1.2, digestibilidad_fdn: 88,
    almidon_rapido: 5, almidon_lento: 5, azucares: 8.0, tasa_deg: 0.18,
    ca: 0.30, p: 0.60, mg: 0.25, k: 2.0, s: 0.30, na: 0.05, cl: 0.10, grasa: 2.0,
    precio_kg: 5.00, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tam_particula: 0.4, palatabilidad: 0.92, ferm_rapida: 0.6, ferm_lenta: 0.3
  },
  {
    id: "expeller_soya", nombre: "Expeller de Soya (torta prensada)", categoria: "proteico",
    ms: 90, em: 3.25, enm: 2.15, eng: 1.75, prot: 42.0, pdr: 28.0, pnr: 14.0,
    fdn: 15, peNDF: 6, lignina: 1.5, digestibilidad_fdn: 85,
    almidon_rapido: 4, almidon_lento: 6, azucares: 7.0, tasa_deg: 0.17,
    ca: 0.28, p: 0.65, mg: 0.26, k: 2.1, s: 0.28, na: 0.04, cl: 0.09, grasa: 6.0,
    precio_kg: 4.80, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tam_particula: 0.5, palatabilidad: 0.90, ferm_rapida: 0.55, ferm_lenta: 0.35
  },
  {
    id: "torta_girasol", nombre: "Torta de Girasol", categoria: "proteico",
    ms: 92, em: 2.30, enm: 1.40, eng: 1.00, prot: 31.0, pdr: 22.0, pnr: 9.0,
    fdn: 36, peNDF: 25, lignina: 6.0, digestibilidad_fdn: 65,
    almidon_rapido: 2, almidon_lento: 3, azucares: 4.0, tasa_deg: 0.12,
    ca: 0.40, p: 0.80, mg: 0.35, k: 1.5, s: 0.25, na: 0.03, cl: 0.08, grasa: 2.5,
    precio_kg: 3.20, categoria_nutricional: "proteico",
    riesgo_acido: 0.15, tam_particula: 0.8, palatabilidad: 0.85, ferm_rapida: 0.3, ferm_lenta: 0.6
  },
  {
    id: "torta_algodon", nombre: "Torta de Algodón", categoria: "proteico",
    ms: 91, em: 2.40, enm: 1.45, eng: 1.05, prot: 37.5, pdr: 26.0, pnr: 11.5,
    fdn: 31, peNDF: 20, lignina: 5.0, digestibilidad_fdn: 68,
    almidon_rapido: 1, almidon_lento: 2, azucares: 3.0, tasa_deg: 0.11,
    ca: 0.20, p: 0.70, mg: 0.30, k: 1.2, s: 0.22, na: 0.02, cl: 0.07, grasa: 3.0,
    precio_kg: 3.50, categoria_nutricional: "proteico",
    riesgo_acido: 0.15, tam_particula: 0.7, palatabilidad: 0.83, ferm_rapida: 0.25, ferm_lenta: 0.65
  },
  {
    id: "afrecho_trigo", nombre: "Afrecho / Salvado de Trigo", categoria: "proteico",
    ms: 88, em: 2.50, enm: 1.50, eng: 1.10, prot: 15.2, pdr: 11.0, pnr: 4.2,
    fdn: 38, peNDF: 28, lignina: 3.5, digestibilidad_fdn: 72,
    almidon_rapido: 8, almidon_lento: 10, azucares: 5.0, tasa_deg: 0.14,
    ca: 0.12, p: 0.90, mg: 0.20, k: 1.0, s: 0.15, na: 0.02, cl: 0.08, grasa: 4.0,
    precio_kg: 1.70, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tam_particula: 0.6, palatabilidad: 0.88, ferm_rapida: 0.4, ferm_lenta: 0.5
  },
  {
    id: "afrecho_arroz", nombre: "Afrecho de Arroz Integral", categoria: "proteico",
    ms: 90, em: 2.70, enm: 1.65, eng: 1.25, prot: 12.5, pdr: 9.0, pnr: 3.5,
    fdn: 28, peNDF: 18, lignina: 2.5, digestibilidad_fdn: 78,
    almidon_rapido: 10, almidon_lento: 12, azucares: 4.0, tasa_deg: 0.13,
    ca: 0.08, p: 1.10, mg: 0.22, k: 1.1, s: 0.12, na: 0.02, cl: 0.09, grasa: 10.0,
    precio_kg: 1.80, categoria_nutricional: "proteico",
    riesgo_acido: 0.2, tam_particula: 0.7, palatabilidad: 0.86, ferm_rapida: 0.35, ferm_lenta: 0.55
  },
  {
    id: "cascarilla_soya", nombre: "Cascarilla de Soya", categoria: "proteico",
    ms: 90, em: 2.40, enm: 1.45, eng: 1.05, prot: 12.0, pdr: 8.0, pnr: 4.0,
    fdn: 60, peNDF: 45, lignina: 8.0, digestibilidad_fdn: 55,
    almidon_rapido: 0, almidon_lento: 0, azucares: 2.0, tasa_deg: 0.08,
    ca: 0.25, p: 0.15, mg: 0.18, k: 1.2, s: 0.18, na: 0.02, cl: 0.07, grasa: 2.0,
    precio_kg: 2.00, categoria_nutricional: "proteico",
    riesgo_acido: 0.1, tam_particula: 1.2, palatabilidad: 0.78, ferm_rapida: 0.1, ferm_lenta: 0.8
  },
  // ==========================================
  // MINERALES Y SUPLEMENTOS
  // ==========================================
  {
    id: "sal_mineral", nombre: "Sal Mineral para Engorde", categoria: "mineral",
    ms: 98, em: 0.0, enm: 0.0, eng: 0.0, prot: 0.0, pdr: 0.0, pnr: 0.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, azucares: 0, tasa_deg: 0,
    ca: 12.0, p: 6.0, mg: 3.0, k: 2.0, s: 1.0, na: 8.0, cl: 12.0, grasa: 0,
    precio_kg: 6.50, categoria_nutricional: "mineral",
    riesgo_acido: 0, tam_particula: 0.1, palatabilidad: 0.70, ferm_rapida: 0, ferm_lenta: 0
  },
  {
    id: "sal_comun", nombre: "Sal Común (NaCl)", categoria: "mineral",
    ms: 99, em: 0.0, enm: 0.0, eng: 0.0, prot: 0.0, pdr: 0.0, pnr: 0.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, azucares: 0, tasa_deg: 0,
    ca: 0.2, p: 0.0, mg: 0.1, k: 0.1, s: 0.1, na: 39.0, cl: 60.0, grasa: 0,
    precio_kg: 1.50, categoria_nutricional: "mineral",
    riesgo_acido: 0, tam_particula: 0.1, palatabilidad: 0.80, ferm_rapida: 0, ferm_lenta: 0
  },
  {
    id: "fosfato_bicalcico", nombre: "Fosfato Bicálcico", categoria: "mineral",
    ms: 99, em: 0.0, enm: 0.0, eng: 0.0, prot: 0.0, pdr: 0.0, pnr: 0.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, azucares: 0, tasa_deg: 0,
    ca: 22.0, p: 18.0, mg: 0.5, k: 0.1, s: 0.2, na: 0.1, cl: 0.1, grasa: 0,
    precio_kg: 5.00, categoria_nutricional: "mineral",
    riesgo_acido: 0, tam_particula: 0.1, palatabilidad: 0.60, ferm_rapida: 0, ferm_lenta: 0
  },
  {
    id: "carbonato_calcio", nombre: "Carbonato de Calcio", categoria: "mineral",
    ms: 99, em: 0.0, enm: 0.0, eng: 0.0, prot: 0.0, pdr: 0.0, pnr: 0.0,
    fdn: 0, peNDF: 0, lignina: 0, digestibilidad_fdn: 0,
    almidon_rapido: 0, almidon_lento: 0, azucares: 0, tasa_deg: 0,
    ca: 38.0, p: 0.0, mg: 0.5, k: 0.1, s: 0.1, na: 0.1, cl: 0.1, grasa: 0,
    precio_kg: 2.50, categoria_nutricional: "mineral",
    riesgo_acido: 0, tam_particula: 0.1, palatabilidad: 0.65, ferm_rapida: 0, ferm_lenta: 0
  }
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];
export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
