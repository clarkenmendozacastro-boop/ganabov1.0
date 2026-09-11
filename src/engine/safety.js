// src/engine/safety.js
// ============================================================================
// GANABOV — MOTOR NUTRICIONAL v2
// LÍMITES DE SEGURIDAD. Este módulo existe para que la app no enferme animales.
//
// Cada regla es un dato, no código suelto: tiene mínimo, máximo, unidad, fase,
// severidad, el trastorno que previene y la FUENTE. Así se pueden auditar y
// corregir sin tocar la lógica.
//
// Severidad:
//   BLOCK -> la ración no se entrega así. El balanceador la trata como
//            restricción dura y, si no la puede cumplir, avisa qué falta en vez
//            de entregar una dieta peligrosa.
//   WARN  -> se entrega con advertencia visible al usuario.
//
// Documento de respaldo con las 110 reglas y sus fuentes: research/seguridad.md
// ============================================================================

export const FASE = { RECEP: 'RECEP', CREC: 'CREC', TERM: 'TERM', TODAS: 'TODAS' };
export const SEV = { BLOCK: 'BLOCK', WARN: 'WARN' };

/** Traduce sistema + fase de la app a la fase de las reglas de seguridad. */
export function faseSeguridad(sistemaId, faseFeedlot) {
  if (sistemaId === 'feedlot') {
    if (faseFeedlot === 'inicio') return FASE.RECEP;
    if (faseFeedlot === 'terminacion') return FASE.TERM;
    return FASE.CREC;
  }
  if (sistemaId === 'semiIntensivo') return FASE.CREC;
  return FASE.CREC; // pastoril: dieta de forraje, se evalúa como crecimiento
}

function aplica(regla, fase) {
  return regla.fase === FASE.TODAS || regla.fase === fase ||
    (Array.isArray(regla.fase) && regla.fase.includes(fase));
}

// ---------------------------------------------------------------------------
// REGLAS
// `campo` es la clave del objeto `dieta` que se evalúa (ver evaluarSeguridad).
// ---------------------------------------------------------------------------

export const REGLAS = [
  // ---------- A. ACIDOSIS Y FIBRA ----------
  {
    id: 'V1', campo: 'peNdfPct', min: 7, max: null, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.BLOCK,
    nombre: 'peNDF mínimo', previene: 'Acidosis ruminal (SARA y aguda)',
    fuente: 'Fox & Tedeschi 2002', url: 'https://www.nutritionmodels.com/papers/FoxandTedeschiPNC2002.pdf',
    mensaje: 'La fibra físicamente efectiva es muy baja. El rumen se acidifica: el animal come menos, se le hinchan las patas y puede morir. Hay que subir el forraje o picarlo más grueso.',
  },
  {
    id: 'V2', campo: 'peNdfPct', min: 10, max: 15, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.WARN,
    nombre: 'peNDF objetivo', previene: 'SARA / caída del consumo si sobra fibra',
    fuente: 'PMC7320828', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/',
    mensaje: 'La fibra efectiva está fuera del rango cómodo de 10 a 15 %. Por debajo hay riesgo de acidosis; por encima el animal se llena antes y gana menos.',
  },
  {
    id: 'V4', campo: 'peNdfPct', min: 5, max: null, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Fibra efectiva mínima absoluta', previene: 'Acidosis',
    fuente: 'MSU P2489', url: 'https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf',
    mensaje: 'Por debajo de 5 % de fibra efectiva la dieta es peligrosa incluso con ionóforo y comedero bien manejado.',
  },
  {
    id: 'V6', campo: 'ndfPct', min: 8.5, max: null, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.BLOCK,
    nombre: 'FDN total mínima', previene: 'Acidosis, ruminitis',
    fuente: 'Galyean & Defoor', url: 'https://academic.oup.com/jas/article/81/14_suppl_2/E8/4789719',
    mensaje: 'La fibra total quedó por debajo del piso que se observa en la industria. Subir forraje o un subproducto fibroso.',
  },
  {
    id: 'V5', campo: 'ndfPct', min: 13, max: null, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.WARN,
    nombre: 'FDN total recomendada', previene: 'Acidosis',
    fuente: 'Galyean & Defoor', url: 'https://academic.oup.com/jas/article/81/14_suppl_2/E8/4789719',
    mensaje: 'La fibra total está por debajo de 13 %: margen de seguridad estrecho, exige comedero muy parejo.',
  },
  {
    id: 'V8', campo: 'ndfPct', min: 40, max: null, unidad: '% MS',
    fase: FASE.CREC, sev: SEV.WARN,
    nombre: 'FDN en crecimiento', previene: 'Acidosis, engrasamiento precoz',
    fuente: 'AHDB', url: 'https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef',
    mensaje: 'En crecimiento se recomienda no bajar de 40 % de FDN.',
  },
  {
    id: 'V9', campo: 'forrajePct', min: 5, max: null, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.BLOCK,
    nombre: 'Forraje mínimo en terminación', previene: 'Acidosis, meteorismo, laminitis',
    fuente: 'OSU Feedlot Primer', url: 'https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf',
    mensaje: 'Sin un mínimo de forraje el rumen no rumia bien y se acidifica. Nunca bajar de 5 % en terminación, y de 15 % si la mezcla no es uniforme.',
  },
  {
    id: 'V13', campo: 'forrajePct', min: 30, max: null, unidad: '% MS',
    fase: FASE.RECEP, sev: SEV.BLOCK,
    nombre: 'Forraje en recepción / adaptación', previene: 'Acidosis de arranque',
    fuente: 'OSU Feedlot Primer', url: 'https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf',
    mensaje: 'Los animales recién entrados necesitan al menos 30 % de forraje. Arrancar con grano alto es la principal causa de muerte por acidosis en las primeras semanas.',
  },
  {
    id: 'V16', campo: 'almidonPct', min: null, max: 20, unidad: '% MS',
    fase: FASE.CREC, sev: SEV.WARN,
    nombre: 'Almidón en crecimiento', previene: 'Acidosis, engrasamiento precoz',
    fuente: 'AHDB', url: 'https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef',
    mensaje: 'Mucho almidón en crecimiento engrasa antes de tiempo y arriesga acidosis.',
  },
  {
    id: 'V17', campo: 'almidonPct', min: null, max: 'dinamico', unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.WARN,
    nombre: 'Almidón acoplado a la fibra de forraje', previene: 'SARA',
    fuente: 'NASEM', url: 'https://www.ncbi.nlm.nih.gov/books/NBK600592/',
    // Regla NASEM: el techo de almidón depende de la FDN de forraje.
    maxDinamico: (d) => {
      const f = d.fndfPct ?? 0;
      if (f >= 19) return 30;
      if (f >= 18) return 28;
      if (f >= 17) return 26;
      if (f >= 16) return 24;
      if (f >= 15) return 22;
      return 20;
    },
    mensaje: 'El almidón es demasiado alto para la fibra de forraje que tiene esta dieta. O se baja el grano o se sube el forraje.',
  },
  {
    id: 'V21', campo: 'concentradoPct', min: null, max: 90, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.WARN,
    nombre: 'Concentrado total', previene: 'Acidosis',
    fuente: 'Scielo', url: 'https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext',
    mensaje: 'Concentrado por encima de 90 % de la materia seca: riesgo alto de acidosis.',
  },
  {
    id: 'V19', campo: 'granoPctPv', min: null, max: 1.0, unidad: '% PV/día',
    fase: FASE.CREC, sev: SEV.BLOCK,
    nombre: 'Grano por peso vivo, crecimiento', previene: 'Acidosis',
    fuente: 'Montana State', url: 'https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html',
    mensaje: 'Demasiado grano por kilo de animal para la etapa de crecimiento.',
  },
  {
    id: 'V20', campo: 'granoPctPv', min: null, max: 2.5, unidad: '% PV/día',
    fase: FASE.TERM, sev: SEV.BLOCK,
    nombre: 'Grano por peso vivo, terminación', previene: 'Acidosis',
    fuente: 'Montana State', url: 'https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html',
    mensaje: 'El grano por kilo de animal supera el máximo seguro incluso para terminación.',
  },

  // ---------- B. INGREDIENTES ----------
  {
    id: 'V37', campo: 'ureaPct', min: null, max: 1.0, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Urea máxima', previene: 'Intoxicación amoniacal',
    fuente: 'CSU', url: 'https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf',
    mensaje: 'La urea mata rápido si se pasa. Máximo 1 % de la materia seca, y lo recomendable es 0,7 %. Mezclar muy bien: un bolsón de urea sin mezclar puede matar al animal que lo encuentre.',
  },
  {
    id: 'V39', campo: 'ureaGPor100kgPv', min: null, max: 25, unidad: 'g/100 kg PV/día',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Urea por peso vivo', previene: 'Intoxicación amoniacal (tóxico a 30–40 g/100 kg)',
    fuente: 'FAO AC149E', url: 'https://www.fao.org/4/ac149e/ac149e03.htm',
    mensaje: 'La urea por kilo de animal está en zona peligrosa. La dosis tóxica empieza en 30 g por cada 100 kg de peso vivo.',
  },
  {
    id: 'V38', campo: 'ureaPctDePb', min: null, max: 33, unidad: '% de la PB total',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Urea como parte de la proteína', previene: 'Intoxicación amoniacal, mal uso del nitrógeno',
    fuente: 'CSU', url: 'https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf',
    mensaje: 'La urea no debe aportar más de un tercio de la proteína de la dieta.',
  },
  {
    id: 'V47', campo: 'eePct', min: null, max: 6, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.BLOCK,
    nombre: 'Grasa total, terminación', previene: 'Caída de la digestión de la fibra y del consumo',
    fuente: 'MSU P2834', url: 'https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf',
    mensaje: 'Demasiada grasa: por encima de 6 % los microbios que digieren la fibra se frenan y el animal come menos.',
  },
  {
    id: 'V48', campo: 'eePct', min: null, max: 4, unidad: '% MS',
    fase: [FASE.CREC, FASE.RECEP], sev: SEV.BLOCK,
    nombre: 'Grasa total, crecimiento', previene: 'Caída de la digestión de la fibra',
    fuente: 'MSU P2834', url: 'https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf',
    mensaje: 'En crecimiento la grasa no debe pasar de 4 % de la materia seca.',
  },
  {
    id: 'V41', campo: 'melazaPct', min: null, max: 25, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.WARN,
    nombre: 'Melaza', previene: 'Toxicidad por melaza, acidosis',
    fuente: 'MLA', url: 'https://www.mla.com.au/globalassets/mla-corporate/extensions-training-and-tools/creative-commons/expanded-use-of-molasses-for-intensive-beef-cattle-feeding---cc.pdf',
    mensaje: 'Mucha melaza. Con dietas altas en melaza hay que dar 1 a 2 kg de materia seca de forraje por cabeza y por día, si no aparece la intoxicación por melaza.',
  },
  {
    id: 'V46', campo: 'gosipolPpm', min: null, max: 200, unidad: 'ppm',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Gosipol libre', previene: 'Gosipolismo: daño de corazón e hígado, infertilidad',
    fuente: 'KSU MF2538', url: 'https://bookstore.ksre.ksu.edu/pubs/composition-and-feeding-value-of-cottonseed-feed-products-for-beef-cattle_MF2538.pdf',
    mensaje: 'El gosipol de la semilla o torta de algodón supera lo tolerable. Daña el corazón y el hígado, y deja los toros infértiles.',
  },
  {
    id: 'V59', campo: 'hcnMgKg', min: null, max: 100, unidad: 'mg/kg MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Cianuro (yuca)', previene: 'Intoxicación cianhídrica',
    fuente: 'CIRAD', url: 'https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf',
    mensaje: 'El cianuro de la yuca supera el límite. La yuca hay que secarla bien antes de darla.',
  },
  {
    id: 'V65', campo: 'proteinaMamiferoPct', min: null, max: 0, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Proteína de mamífero', previene: 'Prohibición por encefalopatía espongiforme (BSE)',
    fuente: 'FDA GFI #70', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cvm-gfi-70-small-entities-compliance-guide-feeders-ruminant-animals-without-farm-feed-mix',
    mensaje: 'La harina de carne y hueso y la harina de sangre de mamífero están prohibidas para rumiantes. No se pueden usar.',
  },

  // ---------- C. MINERALES Y ADITIVOS ----------
  {
    id: 'V70', campo: 'sPct', min: null, max: 0.30, unidad: '% MS',
    fase: FASE.TERM, sev: SEV.BLOCK,
    nombre: 'Azufre en dieta de alto concentrado', previene: 'Polioencefalomalacia (PEM)',
    fuente: 'UMN Extension', url: 'https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water',
    mensaje: 'Azufre demasiado alto para una dieta con poco forraje. Produce polioencefalomalacia: el animal queda ciego, se descoordina y convulsiona. Cuidado con la burlanda, la melaza y el agua.',
  },
  {
    id: 'V72', campo: 'sPct', min: null, max: 0.40, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Azufre máximo tolerable (incluye el del agua)', previene: 'PEM',
    fuente: 'K-State', url: 'https://www.asi.k-state.edu/doc/beef-cow-calf-nutrition/chars-j-j-wagner-sulfur-toxicity-in-feedlots-cdr-2.pdf',
    mensaje: 'El azufre total pasa el máximo tolerable de 0,40 %. Hay que contar también el azufre del agua de bebida, no solo el del alimento.',
  },
  {
    id: 'V78', campo: 'cuMgKg', min: null, max: 40, unidad: 'mg/kg MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Cobre', previene: 'Toxicosis por cobre',
    fuente: 'NASEM', url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    mensaje: 'Cobre por encima del máximo tolerable: se acumula en el hígado y provoca una crisis hemolítica.',
  },
  {
    id: 'V79', campo: 'seMgKg', min: null, max: 5, unidad: 'mg/kg MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Selenio', previene: 'Selenosis',
    fuente: 'NASEM', url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    mensaje: 'Selenio por encima del máximo tolerable.',
  },
  {
    id: 'V80', campo: 'caPct', min: null, max: 1.5, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Calcio máximo', previene: 'Desbalance mineral',
    fuente: 'NASEM', url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    mensaje: 'Demasiado calcio: frena la absorción de fósforo y de otros minerales.',
  },
  {
    id: 'V81', campo: 'pPct', min: null, max: 0.7, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Fósforo máximo', previene: 'Urolitiasis (cálculos urinarios)',
    fuente: 'NASEM', url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    mensaje: 'Fósforo muy alto: en los novillos castrados forma cálculos que tapan la uretra. Es una urgencia y suele terminar en muerte.',
  },
  {
    id: 'V93a', campo: 'caPct', min: 0.4, max: null, unidad: '% MS',
    fase: [FASE.CREC, FASE.TERM], sev: SEV.WARN,
    nombre: 'Calcio mínimo', previene: 'Desmineralización ósea',
    fuente: 'OSU Feedlot Primer', url: 'https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf',
    mensaje: 'Falta calcio en la dieta. Agregar carbonato de calcio o sal mineral.',
  },
  {
    id: 'V93b',
    campo: 'pPct',
    // El valor real se resuelve en pMinVigente(). Aquí min: null para que no
    // exista una segunda fuente de verdad. Es un umbral operativo del motor,
    // no una constante BR-CORTE.
    min: null,
    max: null,
    unidad: '% MS',
    fase: [FASE.CREC, FASE.TERM],
    sev: SEV.WARN,
    nombre: 'Fósforo — umbral de formulación',
    previene: 'Bajo consumo, mal crecimiento',
    fuente: 'Umbral operativo del motor. Requerimiento fisiológico base: BR-CORTE 2016 cap. 9',
    url: 'https://brcorte.com.br/assets/book2016/en/c9.pdf',
    mensaje: 'Advertencia nutricional: la dieta no alcanza el mínimo de fósforo recomendado para este sistema.',
  },
  {
    id: 'V92', campo: 'ratioCaP', min: 1.2, max: 6.0, unidad: 'relación',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Relación calcio:fósforo', previene: 'Urolitiasis y desbalance',
    fuente: 'OSU Feedlot Primer', url: 'https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf',
    mensaje: 'La relación calcio:fósforo está fuera de rango. Lo ideal es 2 a 1. Si el fósforo queda alto frente al calcio aparecen cálculos urinarios en los novillos.',
  },
  {
    id: 'V87', campo: 'salPct', min: null, max: 4.5, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Sal máxima', previene: 'Intoxicación salina',
    fuente: 'NASEM', url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    mensaje: 'Demasiada sal en la ración completa. Y si se usa sal para limitar el consumo, el agua debe ser ilimitada.',
  },
  {
    id: 'V36', campo: 'mgPct', min: null, max: 0.6, unidad: '% MS',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Magnesio máximo', previene: 'Diarrea y toxicidad por magnesio',
    fuente: 'NASEM', url: 'https://www.ncbi.nlm.nih.gov/books/NBK600600/',
    mensaje: 'Magnesio por encima del tolerable: provoca diarrea.',
  },
  {
    id: 'V74', campo: 'monensinaMgCab', min: 50, max: 480, unidad: 'mg/cabeza/día',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Dosis de monensina', previene: 'Sobredosis: daño cardíaco y muerte',
    fuente: 'FDA', url: 'https://www.fda.gov/files/animal%20&%20veterinary/published/Monensin-Beef-Cattle-Blue-Bird-Label-(NADA-095-735---Type-C).pdf',
    mensaje: 'La dosis de monensina está fuera de la etiqueta aprobada (50 a 480 mg por cabeza y por día; por encima de 360 ya no hay beneficio). La sobredosis daña el corazón. Y nunca dar a terneros.',
  },
  {
    id: 'V98', campo: 'vitAUiKg', min: 2200, max: null, unidad: 'UI/kg MS',
    fase: FASE.TODAS, sev: SEV.WARN,
    nombre: 'Vitamina A', previene: 'Ceguera nocturna, edema, baja inmunidad',
    fuente: 'UF/IFAS', url: 'https://extension.vetmed.ufl.edu/files/2012/02/Vitamin-A-for-Beef-Cattle82011.pdf',
    mensaje: 'Falta vitamina A. Con dietas de grano y sin pasto verde hay que suplementarla: si no, aparece ceguera nocturna y bajan las defensas.',
  },
  {
    id: 'V83', campo: 'nitratoPpm', min: null, max: 4400, unidad: 'ppm NO3 en MS',
    fase: FASE.TODAS, sev: SEV.WARN,
    nombre: 'Nitrato en el alimento', previene: 'Metahemoglobinemia y aborto',
    fuente: 'UNL G1779', url: 'https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm',
    mensaje: 'Nitrato alto. Pasa con sorgo o maíz estresado por sequía y con forrajes muy fertilizados. Hay que diluir con otro alimento.',
  },

  // ---------- D. OTROS ----------
  {
    id: 'V29', campo: 'picadoMm', min: 12.7, max: null, unidad: 'mm',
    fase: FASE.TERM, sev: SEV.BLOCK,
    nombre: 'Largo de picado del forraje', previene: 'Acidosis, meteorismo',
    fuente: 'MSU P2489', url: 'https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf',
    mensaje: 'El forraje está picado demasiado fino: así no obliga a rumiar y la fibra deja de proteger el rumen. Cuando la fibra efectiva es menos del 25 % de la dieta, el picado debe ser de al menos 12,7 mm.',
  },
  {
    id: 'V30', campo: 'picadoMm', min: 6.35, max: null, unidad: 'mm',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Largo de picado mínimo absoluto', previene: 'Fibra sin efecto físico',
    fuente: 'MSU P2489', url: 'https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf',
    mensaje: 'Picado demasiado fino: por debajo de 6,35 mm la fibra ya no sirve para estimular la rumia.',
  },
  {
    id: 'V25', campo: 'diasAdaptacion', min: 21, max: null, unidad: 'días',
    fase: FASE.RECEP, sev: SEV.BLOCK,
    nombre: 'Duración de la adaptación al grano', previene: 'Acidosis aguda',
    fuente: 'Montana State', url: 'https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html',
    mensaje: 'La adaptación al grano debe durar al menos 21 días. Apurarla es la forma más común de matar animales al inicio del engorde.',
  },
  {
    id: 'V26', campo: 'saltoConcentradoPuntos', min: null, max: 10, unidad: 'puntos %',
    fase: FASE.RECEP, sev: SEV.BLOCK,
    nombre: 'Salto de concentrado por escalón', previene: 'Acidosis aguda',
    fuente: 'Montana State', url: 'https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html',
    mensaje: 'El salto de concentrado entre escalones es demasiado grande. Máximo 10 puntos por vez.',
  },
  {
    id: 'V106', campo: 'aguaLPor100kgPv', min: 8.3, max: null, unidad: 'L/100 kg PV/día',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Agua mínima', previene: 'Deshidratación, impactación',
    fuente: 'UNL Beef', url: 'https://beef.unl.edu/water-requirements-for-beef-cattle/',
    mensaje: 'Agua insuficiente. Es el primer nutriente: sin agua no hay consumo y sin consumo no hay ganancia.',
  },
  {
    id: 'V107', campo: 'aguaLPor100kgPvCalor', min: 16.7, max: null, unidad: 'L/100 kg PV/día',
    fase: FASE.TODAS, sev: SEV.BLOCK,
    nombre: 'Agua en calor (más de 27 °C)', previene: 'Estrés calórico y muerte',
    fuente: 'UNL Beef', url: 'https://beef.unl.edu/water-requirements-for-beef-cattle/',
    mensaje: 'Con más de 27 °C hacen falta al menos 16,7 litros por cada 100 kg de peso vivo. En Santa Cruz esto es casi todo el año.',
  },
];

/** Umbral de carga calórica (HLI) por genotipo. El cebú aguanta 10 puntos más
 *  que el taurino: Nelore y Brahman 96 vs 86 en Bos taurus.
 *  https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf */
export const HLI_UMBRAL = {
  zebu: 96,
  cruza_carne: 93,
  cruza_lechera: 90,
  taurino: 86,
};

/**
 * Evalúa una dieta contra todas las reglas aplicables.
 *
 * @param {object} dieta   objeto plano con las claves que usan las reglas
 *                         (peNdfPct, ndfPct, forrajePct, almidonPct, eePct,
 *                          sPct, caPct, pPct, ratioCaP, ureaPct, ...)
 * @param {string} fase    FASE.RECEP | CREC | TERM
 * @returns {{bloqueos:Array, advertencias:Array, ok:boolean}}
 */
export function evaluarSeguridad(dieta, fase) {
  const bloqueos = [];
  const advertencias = [];

  for (const r of REGLAS) {
    if (!aplica(r, fase)) continue;

    const valor = dieta[r.campo];
    if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) continue;
    const v = Number(valor);

    const max = r.max === 'dinamico' && r.maxDinamico ? r.maxDinamico(dieta) : r.max;

    // Tolerancia numérica. Sin esto una relación Ca:P que vale exactamente 1,2
    // se guarda en la computadora como 1,1999999999999995 y el validador la
    // rechaza por un error de redondeo, no por un problema de la dieta.
    // La tolerancia es de una parte en un millón: no alcanza para dejar pasar
    // nada realmente fuera de límite.
    const tol = (lim) => Math.max(Math.abs(lim) * 1e-6, 1e-9);

    let violada = false;
    let detalle = '';
    if (r.min !== null && r.min !== undefined && v < r.min - tol(r.min)) {
      violada = true;
      detalle = `${r.nombre}: ${redondear(v)} ${r.unidad} (mínimo ${r.min})`;
    } else if (max !== null && max !== undefined && v > max + tol(max)) {
      violada = true;
      detalle = `${r.nombre}: ${redondear(v)} ${r.unidad} (máximo ${max})`;
    }

    if (!violada) continue;

    const hallazgo = {
      id: r.id,
      campo: r.campo,
      valor: v,
      min: r.min,
      max,
      unidad: r.unidad,
      nombre: r.nombre,
      detalle,
      previene: r.previene,
      mensaje: r.mensaje,
      fuente: r.fuente,
      url: r.url,
      severidad: r.sev,
    };

    if (r.sev === SEV.BLOCK) bloqueos.push(hallazgo);
    else advertencias.push(hallazgo);
  }

  return { bloqueos, advertencias, ok: bloqueos.length === 0 };
}

function redondear(v) {
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

/**
 * Score de riesgo de acidosis, 0 (seguro) a 100 (peligro).
 * Heurística compuesta, NO es una norma publicada.
 *
 * Diferencias con la versión anterior:
 *   - Umbrales de peNDF y forraje por sistema productivo.
 *   - Considera azúcares (melaza, cachaza, caña) además de almidón.
 *   - Penaliza la incertidumbre por almidón no declarado.
 *   - El ionóforo reduce el score pero NUNCA lleva la dieta a "bajo"
 *     si el peNDF está por debajo del mínimo del sistema.
 *   - Devuelve los componentes del score para que la UI muestre por qué.
 */
export const SISTEMA = {
  PASTORIL: 'pastoril',
  SEMI_INTENSIVO: 'semiIntensivo',
  FEEDLOT: 'feedlot',
};

export function scoreAcidosis({
  peNdfPct, almidonPct, forrajePct,
  azucaresPct = 0,
  tieneIonoforo = false,
  fase,
  sistemaId = SISTEMA.FEEDLOT,
  almidonDesconocido = false,
}) {
  let score = 0;
  const componentes = {
    peNdf: 0, almidon: 0, azucares: 0, forraje: 0,
    desconocido: 0, ionoforo: 0, fase: 0,
  };

  // ---- peNDF: umbral por sistema ----
  const minPeNdf =
    sistemaId === SISTEMA.FEEDLOT ? 8
    : sistemaId === SISTEMA.SEMI_INTENSIVO ? 20
    : 25;

  const deltaPeNdf = peNdfPct - minPeNdf;
  if (deltaPeNdf < -8)       componentes.peNdf = 50;
  else if (deltaPeNdf < -4)  componentes.peNdf = 35;
  else if (deltaPeNdf < 0)   componentes.peNdf = 20;
  else if (deltaPeNdf < 3)   componentes.peNdf = 8;
  score += componentes.peNdf;

  // ---- Almidón ----
  if (almidonPct > 45)       componentes.almidon = 25;
  else if (almidonPct > 38)  componentes.almidon = 18;
  else if (almidonPct > 30)  componentes.almidon = 10;
  else if (almidonPct > 22)  componentes.almidon = 4;
  score += componentes.almidon;

  // ---- Azúcares (melaza, cachaza, caña) ----
  if (azucaresPct > 15)      componentes.azucares = 20;
  else if (azucaresPct > 10) componentes.azucares = 12;
  else if (azucaresPct > 6)  componentes.azucares = 6;
  score += componentes.azucares;

  // ---- Forraje: umbral por sistema ----
  const minForraje =
    sistemaId === SISTEMA.FEEDLOT ? 5
    : sistemaId === SISTEMA.SEMI_INTENSIVO ? 30
    : 60;

  const deltaForr = forrajePct - minForraje;
  if (deltaForr < -15)       componentes.forraje = 20;
  else if (deltaForr < -8)   componentes.forraje = 12;
  else if (deltaForr < 0)    componentes.forraje = 5;
  score += componentes.forraje;

  // ---- Incertidumbre por almidón no declarado ----
  if (almidonDesconocido) {
    componentes.desconocido = 8;
    score += 8;
  }

  // ---- Ionóforo ----
  if (tieneIonoforo) {
    componentes.ionoforo = -10;
    score -= 10;
  }

  // ---- Fase de adaptación ----
  if (fase === FASE.RECEP) {
    componentes.fase = 15;
    score += 15;
  }

  score = Math.min(Math.max(score, 0), 100);

  let nivel = 'bajo';
  if (score >= 60) nivel = 'crítico';
  else if (score >= 40) nivel = 'alto';
  else if (score >= 20) nivel = 'moderado';

  // Regla de seguridad: si el peNDF está por debajo del mínimo del sistema
  // y hay azúcares o almidón significativos, NUNCA reportar "bajo" aunque
  // el ionóforo haya bajado el score.
  const riesgoEstructural =
    peNdfPct < minPeNdf - 2 && (azucaresPct > 8 || almidonPct > 25);
  if (riesgoEstructural && nivel === 'bajo') nivel = 'moderado';

  return { score, nivel, minPeNdf, minForraje, componentes, riesgoEstructural };
}
