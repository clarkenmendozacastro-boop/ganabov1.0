// src/data/alimentosBase.js
// Base de datos profesional ampliada para ganadería boliviana y tropical

export const ALIMENTOS_BASE = [
  // ==========================================
  // FORRAJES - PASTOS TROPICALES (20)
  // ==========================================
  { id: "pasto_mombasa", nombre: "Pasto Mombasa (Megathyrsus maximus)", categoria: "forraje", ms: 22, prot: 8.5, em: 1.90, fdn: 68, enm: 1.20, peNDF: 55, tam_particula: 3.0, precio_kg: 0.45 },
  { id: "pasto_tanzania", nombre: "Pasto Tanzania (Megathyrsus maximus)", categoria: "forraje", ms: 23, prot: 9.0, em: 1.95, fdn: 66, enm: 1.25, peNDF: 52, tam_particula: 2.8, precio_kg: 0.50 },
  { id: "pasto_zuri", nombre: "Pasto Zuri (híbrido Megathyrsus)", categoria: "forraje", ms: 22, prot: 10.5, em: 2.00, fdn: 64, enm: 1.30, peNDF: 50, tam_particula: 2.7, precio_kg: 0.55 },
  { id: "pasto_marandu", nombre: "Brachiaria brizantha cv. Marandú", categoria: "forraje", ms: 24, prot: 7.5, em: 1.80, fdn: 69, enm: 1.10, peNDF: 58, tam_particula: 2.6, precio_kg: 0.40 },
  { id: "pasto_piata", nombre: "Brachiaria brizantha cv. Piatã", categoria: "forraje", ms: 25, prot: 8.2, em: 1.88, fdn: 68, enm: 1.18, peNDF: 56, tam_particula: 2.5, precio_kg: 0.44 },
  { id: "pasto_ruzi", nombre: "Brachiaria ruziziensis", categoria: "forraje", ms: 22, prot: 8.0, em: 1.85, fdn: 67, enm: 1.15, peNDF: 54, tam_particula: 2.5, precio_kg: 0.42 },
  { id: "pasto_dictyoneura", nombre: "Pasto Llanero (Dictyoneura)", categoria: "forraje", ms: 26, prot: 6.0, em: 1.65, fdn: 72, enm: 0.95, peNDF: 62, tam_particula: 2.7, precio_kg: 0.35 },
  { id: "pasto_guinea", nombre: "Pasto Guinea (Panicum maximum)", categoria: "forraje", ms: 21, prot: 7.0, em: 1.80, fdn: 70, enm: 1.05, peNDF: 56, tam_particula: 2.6, precio_kg: 0.40 },
  { id: "pasto_estrella", nombre: "Pasto Estrella (Cynodon nlemfuensis)", categoria: "forraje", ms: 20, prot: 8.0, em: 1.85, fdn: 65, enm: 1.10, peNDF: 52, tam_particula: 2.4, precio_kg: 0.45 },
  { id: "pasto_bermuda", nombre: "Pasto Bermuda (Cynodon dactylon)", categoria: "forraje", ms: 28, prot: 7.0, em: 1.75, fdn: 72, enm: 1.00, peNDF: 58, tam_particula: 2.3, precio_kg: 0.38 },
  { id: "pasto_rhodes", nombre: "Pasto Rhodes (Chloris gayana)", categoria: "forraje", ms: 22, prot: 8.0, em: 1.85, fdn: 68, enm: 1.12, peNDF: 54, tam_particula: 2.5, precio_kg: 0.42 },
  { id: "pasto_maralfalfa", nombre: "Maralfalfa (Pennisetum sp.)", categoria: "forraje", ms: 18, prot: 9.5, em: 1.75, fdn: 63, enm: 1.05, peNDF: 50, tam_particula: 2.3, precio_kg: 0.50 },
  { id: "pasto_camerun", nombre: "Pasto Elefante / Camerún", categoria: "forraje", ms: 17, prot: 7.5, em: 1.70, fdn: 65, enm: 1.00, peNDF: 52, tam_particula: 2.5, precio_kg: 0.40 },
  { id: "pasto_nativo", nombre: "Pastizal nativo (piso boliviano)", categoria: "forraje", ms: 28, prot: 5.0, em: 1.60, fdn: 72, enm: 0.90, peNDF: 60, tam_particula: 2.8, precio_kg: 0.25 },
  { id: "pasto_brachiaria", nombre: "Brachiaria decumbens", categoria: "forraje", ms: 24, prot: 6.5, em: 1.75, fdn: 70, enm: 1.02, peNDF: 56, tam_particula: 2.6, precio_kg: 0.38 },
  { id: "pasto_hybrid", nombre: "Brachiaria híbrida (BRSE)", categoria: "forraje", ms: 23, prot: 9.0, em: 1.92, fdn: 65, enm: 1.22, peNDF: 52, tam_particula: 2.5, precio_kg: 0.48 },
  { id: "pasto_andalucia", nombre: "Pasto Andalucía (Hyparrhenia rufa)", categoria: "forraje", ms: 27, prot: 5.5, em: 1.68, fdn: 73, enm: 0.93, peNDF: 59, tam_particula: 2.7, precio_kg: 0.32 },
  { id: "pasto_jaragua", nombre: "Pasto Jaraguá (Hyparrhenia rufa)", categoria: "forraje", ms: 26, prot: 6.0, em: 1.65, fdn: 74, enm: 0.92, peNDF: 60, tam_particula: 2.6, precio_kg: 0.30 },
  { id: "pasto_fleming", nombre: "Pasto Fleming (Flemingia macrophylla)", categoria: "forraje", ms: 25, prot: 15.0, em: 1.85, fdn: 55, enm: 1.15, peNDF: 45, tam_particula: 2.4, precio_kg: 0.60 },

  // ==========================================
  // HENOS (10)
  // ==========================================
  { id: "heno_alfalfa", nombre: "Heno de Alfalfa (deshidratado)", categoria: "forraje", ms: 88, prot: 18.0, em: 2.20, fdn: 42, enm: 1.50, peNDF: 25, tam_particula: 2.0, precio_kg: 2.80 },
  { id: "heno_brachiaria", nombre: "Heno de Brachiaria", categoria: "forraje", ms: 86, prot: 5.5, em: 1.60, fdn: 72, enm: 0.95, peNDF: 60, tam_particula: 2.5, precio_kg: 1.20 },
  { id: "heno_tifton", nombre: "Heno de Tifton 85 (Cynodon)", categoria: "forraje", ms: 89, prot: 9.0, em: 1.85, fdn: 65, enm: 1.10, peNDF: 50, tam_particula: 2.2, precio_kg: 1.50 },
  { id: "heno_avena", nombre: "Heno de Avena Forrajera", categoria: "forraje", ms: 87, prot: 10.0, em: 2.00, fdn: 58, enm: 1.25, peNDF: 45, tam_particula: 2.2, precio_kg: 1.60 },
  { id: "heno_ryegrass", nombre: "Heno de Ryegrass", categoria: "forraje", ms: 88, prot: 12.0, em: 2.10, fdn: 54, enm: 1.35, peNDF: 42, tam_particula: 2.0, precio_kg: 1.90 },
  { id: "heno_festuca", nombre: "Heno de Festuca", categoria: "forraje", ms: 86, prot: 8.5, em: 1.90, fdn: 62, enm: 1.12, peNDF: 48, tam_particula: 2.3, precio_kg: 1.40 },
  { id: "heno_cenchrus", nombre: "Heno de Cenchrus (pasto buffel)", categoria: "forraje", ms: 85, prot: 7.0, em: 1.75, fdn: 68, enm: 1.00, peNDF: 55, tam_particula: 2.4, precio_kg: 1.30 },
  { id: "heno_king", nombre: "Heno de King Grass", categoria: "forraje", ms: 85, prot: 8.0, em: 1.80, fdn: 65, enm: 1.05, peNDF: 52, tam_particula: 2.3, precio_kg: 1.35 },

  // ==========================================
  // SILAJES (8)
  // ==========================================
  { id: "silo_maiz", nombre: "Silaje de Maíz (planta entera)", categoria: "forraje", ms: 35, prot: 8.0, em: 2.50, fdn: 48, enm: 1.70, peNDF: 30, tam_particula: 1.2, precio_kg: 0.80 },
  { id: "silo_maiz_alto", nombre: "Silaje de Maíz (alto contenido grano)", categoria: "forraje", ms: 38, prot: 8.5, em: 2.70, fdn: 45, enm: 1.85, peNDF: 28, tam_particula: 1.1, precio_kg: 0.90 },
  { id: "silo_sorgo", nombre: "Silaje de Sorgo Forrajero", categoria: "forraje", ms: 30, prot: 7.0, em: 2.10, fdn: 55, enm: 1.40, peNDF: 35, tam_particula: 1.3, precio_kg: 0.70 },
  { id: "silo_sorgo_baño", nombre: "Silaje de Sorgo (cultivo baño)", categoria: "forraje", ms: 32, prot: 6.5, em: 2.00, fdn: 58, enm: 1.32, peNDF: 38, tam_particula: 1.3, precio_kg: 0.68 },
  { id: "silo_avena", nombre: "Silaje de Avena Forrajera", categoria: "forraje", ms: 32, prot: 9.0, em: 2.20, fdn: 54, enm: 1.45, peNDF: 40, tam_particula: 1.4, precio_kg: 0.85 },
  { id: "silo_pasto", nombre: "Silaje de Pasto Guinea", categoria: "forraje", ms: 28, prot: 7.5, em: 1.90, fdn: 65, enm: 1.15, peNDF: 48, tam_particula: 1.5, precio_kg: 0.70 },
  { id: "silo_king", nombre: "Silaje de King Grass", categoria: "forraje", ms: 29, prot: 8.0, em: 1.95, fdn: 63, enm: 1.18, peNDF: 46, tam_particula: 1.5, precio_kg: 0.75 },
  { id: "silo_maralfalfa", nombre: "Silaje de Maralfalfa", categoria: "forraje", ms: 25, prot: 9.0, em: 1.85, fdn: 60, enm: 1.10, peNDF: 45, tam_particula: 1.4, precio_kg: 0.80 },

  // ==========================================
  // ENERGÉTICOS - GRANOS (12)
  // ==========================================
  { id: "maiz_amarillo", nombre: "Maíz Amarillo (grano molido)", categoria: "energético", ms: 88, prot: 8.8, em: 3.30, fdn: 12, enm: 2.20, peNDF: 5, tam_particula: 0.5, precio_kg: 2.20 },
  { id: "maiz_blanco", nombre: "Maíz Blanco (grano)", categoria: "energético", ms: 87, prot: 8.5, em: 3.25, fdn: 12, enm: 2.15, peNDF: 5, tam_particula: 0.5, precio_kg: 2.10 },
  { id: "sorgo_grano", nombre: "Sorgo Grano (molido)", categoria: "energético", ms: 89, prot: 9.0, em: 3.10, fdn: 15, enm: 2.00, peNDF: 8, tam_particula: 0.6, precio_kg: 1.90 },
  { id: "sorgo_rojo", nombre: "Sorgo Rojo (grano)", categoria: "energético", ms: 88, prot: 9.5, em: 3.05, fdn: 16, enm: 1.95, peNDF: 8, tam_particula: 0.6, precio_kg: 1.85 },
  { id: "cebada_grano", nombre: "Cebada Grano (molida)", categoria: "energético", ms: 88, prot: 11.5, em: 3.05, fdn: 18, enm: 1.95, peNDF: 10, tam_particula: 0.5, precio_kg: 2.50 },
  { id: "trigo_grano", nombre: "Trigo Grano (molido)", categoria: "energético", ms: 87, prot: 12.5, em: 3.20, fdn: 14, enm: 2.05, peNDF: 7, tam_particula: 0.5, precio_kg: 2.80 },
  { id: "arroz_pulido", nombre: "Arroz Pulido (quebrado)", categoria: "energético", ms: 88, prot: 7.0, em: 3.15, fdn: 10, enm: 2.02, peNDF: 4, tam_particula: 0.4, precio_kg: 2.30 },
  { id: "avena_grano", nombre: "Avena Grano (molida)", categoria: "energético", ms: 88, prot: 11.0, em: 2.80, fdn: 24, enm: 1.78, peNDF: 14, tam_particula: 0.6, precio_kg: 2.40 },

  // ==========================================
  // ENERGÉTICOS - TUBÉRCULOS Y SUBPRODUCTOS (10)
  // ==========================================
  { id: "yuca_raiz", nombre: "Yuca Raíz Fresca (picada)", categoria: "energético", ms: 35, prot: 2.5, em: 3.00, fdn: 10, enm: 1.90, peNDF: 5, tam_particula: 1.0, precio_kg: 0.90 },
  { id: "yuca_seca", nombre: "Yuca Seca (chips)", categoria: "energético", ms: 88, prot: 2.8, em: 3.10, fdn: 9, enm: 2.00, peNDF: 4, tam_particula: 0.5, precio_kg: 1.50 },
  { id: "camote", nombre: "Camote (batata)", categoria: "energético", ms: 28, prot: 4.0, em: 2.90, fdn: 12, enm: 1.85, peNDF: 6, tam_particula: 1.0, precio_kg: 0.80 },
  { id: "melaza_caña", nombre: "Melaza de Caña de Azúcar", categoria: "energético", ms: 75, prot: 3.0, em: 2.60, fdn: 0, enm: 1.60, peNDF: 0, tam_particula: 0.1, precio_kg: 1.20 },
  { id: "cana_azucar", nombre: "Caña de Azúcar (picada fresca)", categoria: "energético", ms: 26, prot: 2.8, em: 2.50, fdn: 45, enm: 1.55, peNDF: 30, tam_particula: 1.5, precio_kg: 0.30 },
  { id: "cachaza", nombre: "Cachaza (melaza residual)", categoria: "energético", ms: 70, prot: 4.0, em: 2.55, fdn: 5, enm: 1.58, peNDF: 3, tam_particula: 0.2, precio_kg: 0.90 },
  { id: "grasa_bypass", nombre: "Grasa Bypass (protegida)", categoria: "energético", ms: 99, prot: 0.0, em: 5.60, fdn: 0, enm: 4.50, peNDF: 0, tam_particula: 0.1, precio_kg: 12.00 },

  // ==========================================
  // SUBPRODUCTOS ENERGÉTICOS (8)
  // ==========================================
  { id: "salvado_trigo", nombre: "Salvado / Afrechillo de Trigo", categoria: "energético", ms: 88, prot: 15.0, em: 2.50, fdn: 38, enm: 1.50, peNDF: 28, tam_particula: 0.6, precio_kg: 1.80 },
  { id: "afrecho_arroz", nombre: "Afrecho de Arroz Integral", categoria: "energético", ms: 90, prot: 12.5, em: 2.70, fdn: 28, enm: 1.65, peNDF: 18, tam_particula: 0.7, precio_kg: 1.60 },
  { id: "germen_maiz", nombre: "Germen de Maíz", categoria: "energético", ms: 90, prot: 10.0, em: 3.00, fdn: 15, enm: 1.85, peNDF: 10, tam_particula: 0.5, precio_kg: 1.70 },
  { id: "grano_destileria", nombre: "DDGS de Maíz", categoria: "energético", ms: 91, prot: 28.0, em: 3.20, fdn: 33, enm: 2.10, peNDF: 25, tam_particula: 0.8, precio_kg: 2.50 },
  { id: "ddgs_sorgo", nombre: "DDGS de Sorgo", categoria: "energético", ms: 91, prot: 27.0, em: 3.00, fdn: 34, enm: 1.95, peNDF: 25, tam_particula: 0.8, precio_kg: 2.40 },
  { id: "burlanda_maiz", nombre: "Burlanda de Maíz (afrecho)", categoria: "energético", ms: 90, prot: 12.0, em: 2.80, fdn: 30, enm: 1.70, peNDF: 22, tam_particula: 0.7, precio_kg: 1.90 },
  { id: "cascarilla_soya", nombre: "Cascarilla de Soya", categoria: "energético", ms: 90, prot: 12.0, em: 2.40, fdn: 60, enm: 1.45, peNDF: 45, tam_particula: 1.2, precio_kg: 2.00 },
  { id: "pulpa_citrica", nombre: "Pulpa de Cítricos (seca)", categoria: "energético", ms: 91, prot: 6.5, em: 2.80, fdn: 22, enm: 1.75, peNDF: 15, tam_particula: 0.8, precio_kg: 2.20 },

  // ==========================================
  // PROTEICOS (15)
  // ==========================================
  { id: "harina_soya", nombre: "Harina de Soya (46% PB)", categoria: "proteico", ms: 89, prot: 46.5, em: 3.20, fdn: 13, enm: 2.10, peNDF: 5, tam_particula: 0.4, precio_kg: 5.00 },
  { id: "expeller_soya", nombre: "Expeller de Soya (torta prensada)", categoria: "proteico", ms: 90, prot: 42.0, em: 3.25, fdn: 15, enm: 2.15, peNDF: 6, tam_particula: 0.5, precio_kg: 4.80 },
  { id: "torta_girasol", nombre: "Torta de Girasol", categoria: "proteico", ms: 92, prot: 31.0, em: 2.30, fdn: 36, enm: 1.40, peNDF: 25, tam_particula: 0.8, precio_kg: 3.20 },
  { id: "torta_algodon", nombre: "Torta de Algodón", categoria: "proteico", ms: 91, prot: 37.5, em: 2.40, fdn: 31, enm: 1.45, peNDF: 20, tam_particula: 0.7, precio_kg: 3.50 },
  { id: "torta_palmiste", nombre: "Torta de Palmiste", categoria: "proteico", ms: 90, prot: 16.0, em: 2.70, fdn: 55, enm: 1.60, peNDF: 40, tam_particula: 0.9, precio_kg: 2.80 },
  { id: "torta_copra", nombre: "Torta de Copra (coco)", categoria: "proteico", ms: 90, prot: 21.0, em: 2.80, fdn: 50, enm: 1.70, peNDF: 38, tam_particula: 0.8, precio_kg: 3.00 },
  { id: "torta_mani", nombre: "Torta de Maní", categoria: "proteico", ms: 91, prot: 45.0, em: 3.10, fdn: 18, enm: 2.00, peNDF: 8, tam_particula: 0.5, precio_kg: 4.50 },
  { id: "torta_canola", nombre: "Torta de Canola", categoria: "proteico", ms: 90, prot: 36.0, em: 2.85, fdn: 28, enm: 1.80, peNDF: 18, tam_particula: 0.6, precio_kg: 3.80 },
  { id: "harina_pescado", nombre: "Harina de Pescado (65% PB)", categoria: "proteico", ms: 92, prot: 65.0, em: 3.10, fdn: 0, enm: 2.00, peNDF: 0, tam_particula: 0.3, precio_kg: 10.00 },
  { id: "harina_carne", nombre: "Harina de Carne y Hueso", categoria: "proteico", ms: 92, prot: 50.0, em: 2.80, fdn: 0, enm: 1.75, peNDF: 0, tam_particula: 0.4, precio_kg: 7.00 },
  { id: "harina_sangre", nombre: "Harina de Sangre", categoria: "proteico", ms: 92, prot: 80.0, em: 2.90, fdn: 0, enm: 1.85, peNDF: 0, tam_particula: 0.3, precio_kg: 9.00 },
  { id: "soya_integral", nombre: "Soya Integral Tostada", categoria: "proteico", ms: 90, prot: 38.0, em: 3.50, fdn: 12, enm: 2.25, peNDF: 6, tam_particula: 0.5, precio_kg: 4.80 },
  { id: "levadura_cerveza", nombre: "Levadura de Cerveza (seca)", categoria: "proteico", ms: 92, prot: 45.0, em: 2.60, fdn: 20, enm: 1.65, peNDF: 12, tam_particula: 0.3, precio_kg: 6.00 },
  { id: "granza_cerveza", nombre: "Granza de Cervecería", categoria: "proteico", ms: 25, prot: 18.0, em: 2.50, fdn: 35, enm: 1.55, peNDF: 25, tam_particula: 1.0, precio_kg: 0.60 },

  // ==========================================
  // MINERALES Y SUPLEMENTOS (12)
  // ==========================================
  { id: "sal_mineral", nombre: "Sal Mineral para Engorde", categoria: "mineral", ms: 98, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 6.50 },
  { id: "sal_mineral_lactancia", nombre: "Sal Mineral para Lactancia", categoria: "mineral", ms: 98, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 7.00 },
  { id: "sal_mineral_recria", nombre: "Sal Mineral para Recría", categoria: "mineral", ms: 98, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 6.00 },
  { id: "sal_comun", nombre: "Sal Común (NaCl)", categoria: "mineral", ms: 99, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 1.50 },
  { id: "fosfato_bicalcico", nombre: "Fosfato Bicálcico", categoria: "mineral", ms: 99, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 5.00 },
  { id: "carbonato_calcio", nombre: "Carbonato de Calcio", categoria: "mineral", ms: 99, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 2.50 },
  { id: "bicarbonato", nombre: "Bicarbonato de Sodio (buffer)", categoria: "mineral", ms: 99, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 4.00 },
  { id: "oxido_magnesio", nombre: "Óxido de Magnesio", categoria: "mineral", ms: 99, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 8.00 },
  { id: "urea", nombre: "Urea Grado Alimenticio (NNP)", categoria: "mineral", ms: 99, prot: 287.0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 8.00 },
  { id: "zeolita", nombre: "Zeolita (adsorbente)", categoria: "mineral", ms: 95, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 2.00 },
  { id: "monensina", nombre: "Monensina (ionóforo)", categoria: "mineral", ms: 99, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 80.00 },
  { id: "premezcla_vitaminica", nombre: "Premezcla Vitamínica (A,D,E)", categoria: "mineral", ms: 95, prot: 0, em: 0, fdn: 0, enm: 0, peNDF: 0, precio_kg: 15.00 }
];

export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];
export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral"
};
