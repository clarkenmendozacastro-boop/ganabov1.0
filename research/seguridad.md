# Límites de seguridad para formulación de dietas de engorde bovino (feedlot)
### Umbrales cuantitativos con fuentes verificadas — para motor de validación de raciones
**Contexto de uso:** Santa Cruz, Bolivia. Nelore/Brahman/cruzas (Bos indicus), pastura + concentrado y confinamiento total.
**Fecha de compilación:** 10 de septiembre de 2026. Todos los números provienen de páginas efectivamente descargadas en esta sesión; cada valor lleva su URL. Donde no se pudo confirmar un número se indica `n.a.` con nota de lo intentado.

**Convenciones**
- `% DM` = porcentaje de la materia seca de la dieta total (mezcla completa), salvo indicación contraria.
- `% BW` = porcentaje del peso vivo.
- Fases: **recepción/adaptación** (0–21/28 d), **crecimiento/backgrounding**, **terminación/finishing**.
- Severidad sugerida: **BLOCK** = error bloqueante (la ración no debe emitirse), **WARN** = advertencia (requiere confirmación del usuario).

---

# A. ACIDOSIS Y FIBRA

## 1. peNDF mínimo por fase, valores de pef y Separador de Partículas Penn State

**Definición operativa:** `peNDF = NDF total de la dieta (% DM) × pef`, donde `pef` (physical effectiveness factor) es la fracción de partículas retenidas sobre el tamiz crítico (1,18 mm en la definición original de Mertens; 4 mm en la revisión de Heinrichs 2013; 8 mm en el sistema paNDF de NASEM) ([Penn State Extension — métodos de medición de tamaño de partícula](https://extension.psu.edu/methods-used-to-measure-forage-and-ration-particle-size), [NASEM — capítulo de carbohidratos, NBK600592](https://www.ncbi.nlm.nih.gov/books/NBK600592/)).

| Fase / tipo de dieta | peNDF mínimo | Objetivo de pH ruminal | Fuente |
|---|---|---|---|
| Feedlot alta energía (terminación) | **7–10% DM** | pH > 5,7 | [Fox & Tedeschi 2002 (Cornell)](https://www.nutritionmodels.com/papers/FoxandTedeschiPNC2002.pdf); citado igual en [Rodríguez-Sánchez et al., PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| Feedlot, recomendación alternativa (Mertens 2002) | **15% DM** (rango 12–18%) | — | [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| Novillas 85% concentrado + 15% paja de cebada: nivel óptimo experimental | **10,4% DM** (peNDF>4mm) — mejor compromiso: sin caída de consumo, menor tiempo bajo pH crítico; 13,6 y 15,4% no aportaron ventaja extra y bajaron el consumo | pH medio 6,65; mínimo 5,83 | [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| Alta concentración, buen manejo de comedero + ionóforo (eNDF) | **5–8% DM** (mínimo absoluto 5% con excelente manejo); 8% eNDF en dietas de alta energía | pH > 5,6–5,7 | [Mississippi State Ext. P2489 — Fiber in Beef Cattle Diets](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Mezcla con manejo de comedero variable o sin ionóforo (eNDF) | **20% DM** | — | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Para maximizar digestión de pared celular / proteína microbiana (eNDF) | **20% DM** (hasta 25% según manejo) | pH > 6,2 | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Lechería (referencia de contraste, peNDF₁.₁₈) | 19,7% DM | — | [Mertens/JDS](https://www.journalofdairyscience.org/article/S0022-0302(06)72339-6/fulltext) |
| Lechería, sistema paNDF de NASEM (peNDF>8mm) | 14,9% (maximizar consumo) – 18,5% (maximizar pH) | pH medio ≥ 6,0–6,1 | [NASEM NBK600592](https://www.ncbi.nlm.nih.gov/books/NBK600592/) |

**Valores de pef (Fox & Tedeschi 2002)** — usar para calcular peNDF por ingrediente ([fuente](https://www.nutritionmodels.com/papers/FoxandTedeschiPNC2002.pdf)):

| Forma física | pef |
|---|---|
| Heno largo | 1,00 |
| Heno picado grueso | 0,95 |
| Picado medio-grueso | 0,90 |
| Picado medio | 0,85 |
| Picado medio-fino | 0,80 |
| Picado fino | 0,70 |
| Alimento molido | 0,40 |
| Concentrado laminado (rolled) | 0,80 |
| Maíz húmedo laminado | 0,70 |
| Cebada laminada gruesa | 0,60 |
| Maíz quebrado medio | 0,40 |
| Maíz molido fino | 0,30 |

**Separador de Partículas Penn State (PSPS):** versión 2002 con tamices de **19 mm / 8 mm / 1,18 mm** + bandeja; la versión 2013 reemplaza el tamiz de 1,18 mm por uno de **4 mm**. El peNDF se estima como la fracción retenida en los tres tamices superiores (≥4 mm) multiplicada por el NDF de la dieta; se recomienda que **60–70% de la TMR sea físicamente efectiva** ([Penn State Particle Separator](https://extension.psu.edu/penn-state-particle-separator/), [métodos de medición](https://extension.psu.edu/methods-used-to-measure-forage-and-ration-particle-size)).

**Nota de implementación:** relación pef/NDF por tamaño (MSU P2489): gramíneas material largo = 98% del NDF es efectivo, material <¼" = 73%; leguminosas 92% y 67% respectivamente ([MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf)). El NDF de fuentes no forrajeras (cascarilla de soya, gluten feed) vale solo **30–80% (promedio 50%)** de la efectividad del NDF de forraje ([NASEM NBK600592](https://www.ncbi.nlm.nih.gov/books/NBK600592/)).

## 2. NDF total y NDF de forraje mínimos en terminación

| Parámetro | Valor | Fuente |
|---|---|---|
| NDF total de dietas de terminación (base de datos de 190 dietas comerciales) | media **19,5% DM**, rango observado **8,58–35,1%** | [Galyean & Defoor, base de datos de dietas de feedlot](https://pdfs.semanticscholar.org/81f4/b40eeac368bd2f28dc7f6ae769a7b6a59168.pdf) |
| NDF aportado por el forraje (roughage NDF) | media **4,4% DM**, rango **0–15,2%** | [misma fuente](https://pdfs.semanticscholar.org/81f4/b40eeac368bd2f28dc7f6ae769a7b6a59168.pdf) |
| Predicción de consumo a partir del NDF de forraje | `DMI (% BW) = 1,9145 + 0,0162 × (NDF de forraje, % DM)` | [misma fuente](https://pdfs.semanticscholar.org/81f4/b40eeac368bd2f28dc7f6ae769a7b6a59168.pdf) |
| Terminación intensiva (Reino Unido): fibra larga | **10–12% de la ración**; el ganado consume ~12% del DMI como paja, equivalente a 1–1,5 kg/d | [AHDB — nutritional guidance for dairy beef](https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef) |
| Crecimiento (AHDB): NDF | **> 40% DM** | [AHDB](https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef) |
| Referencia lechería (NASEM, TMR con maíz molido seco): NDF mínimo **25% DM** y fNDF mínimo **15–19% DM**; por cada punto que baja el fNDF por debajo de 19%, el NDF total debe subir 2 puntos y el almidón máximo baja 2 puntos | ver tabla en ítem 4 | [NASEM NBK600592](https://www.ncbi.nlm.nih.gov/books/NBK600592/) |

**Regla práctica recomendada para el motor:** en terminación exigir NDF total ≥ **13–15% DM** como advertencia y ≥ **10% DM** como bloqueo, junto con el chequeo de peNDF (ítem 1) y de forraje (ítem 3), porque el NDF total por sí solo puede cumplirse con fibra no efectiva (cascarilla de soya, DDGS) sin proteger el rumen ([NASEM NBK600592](https://www.ncbi.nlm.nih.gov/books/NBK600592/); [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf)).

## 3. Forraje (roughage) mínimo como % DM y requerimiento en % del peso vivo

| Situación | Nivel de forraje | Fuente |
|---|---|---|
| Terminación, ración mezclada uniformemente | **5–10% DM** | [Ohio State — Feedlot nutrition primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Terminación, ración NO mezclada uniformemente (autoconsumo, alimentación separada) | **15–20% DM** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Dietas con maíz de alta humedad | **10–15% DM** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Dietas con trigo como grano principal | **≥ 15% DM** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Recepción / animales enfermos o recién llegados | **~30% DM** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Rango usado en la industria de EEUU | **4,5–13,5% DM** (media 8,89%, moda 9%), máximo práctico ~**15%** | [Galyean & Defoor, J Anim Sci 81(E-Suppl 2):E8](https://academic.oup.com/jas/article/81/14_suppl_2/E8/4789719) |
| Base de datos de dietas comerciales | media **8,2% DM**, rango 0–30% | [PDF](https://pdfs.semanticscholar.org/81f4/b40eeac368bd2f28dc7f6ae769a7b6a59168.pdf) |
| Dietas base cebada: 0% de ensilaje produjo pH mínimo 5,07 y 11,3 h/d bajo pH 5,5; con solo **4%** de ensilaje el pH mínimo subió a 5,27 y las horas bajo 5,5 cayeron a 4,2 h/d; a **12%** la acidosis aún no se eliminó | el mayor beneficio marginal está entre 0 y 4% | [Nagaraja-type estudio en cebada, PMC7447917](https://pmc.ncbi.nlm.nih.gov/articles/PMC7447917/) |
| Dietas basadas en melaza (relevante para el trópico): mínimo de forraje | **1–2 kg MS de forraje/cabeza/día** (≈ 8 g/kg PV) para prevenir la "borrachera"/PEM por melaza | [FAO — Sugarcane as feed](https://www.fao.org/4/x6512e/x6512e26.htm); [FAO S8850E](https://www.fao.org/4/s8850e/S8850E26.htm) |

**Requerimiento de forraje expresado en % PV:** el requerimiento de fibra se puede fijar vía NDF de forraje usando la ecuación de consumo del ítem 2. Un requerimiento mínimo publicado directamente como "% PV de NDF de forraje" no se encontró; lo más cercano en la literatura recuperada es el mínimo de forraje en dietas de melaza (**1–2 kg MS/cab/d**, ~0,3–0,6% PV para animales de 300–400 kg) ([FAO](https://www.fao.org/4/x6512e/x6512e26.htm)) y la regla de que el heno debe ser **≥ 1/3 de la dieta** cuando hay riesgo de meteorismo de feedlot ([Merck Vet Manual — Bloat](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/bloat-in-ruminants)). Un valor "% PV de forraje NDF" con respaldo numérico directo: **n.a.** (se buscó en Galyean & Defoor, MSU P2489 y NASEM; solo dan % DM y la ecuación de DMI).

## 4. Almidón / carbohidratos no fibrosos (NFC) máximos antes de SARA

| Parámetro | Límite | Fase | Fuente |
|---|---|---|---|
| Almidón en fase de crecimiento | **< 20% DM** (evitar exceso: deposición grasa indeseada y riesgo digestivo) | crecimiento | [AHDB](https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef) |
| Almidón + azúcares en terminación intensiva | **> 20% DM** recomendado, "debe manejarse con cuidado para evitar trastornos digestivos" y balancearse con fibra digestible; no se publica un techo numérico | terminación | [AHDB](https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef) |
| Tabla NASEM de almidón máximo acoplado al fNDF (TMR, maíz molido seco) | fNDF 19% → almidón máx **30%**; 18% → **28%**; 17% → **26%**; 16% → **24%**; 15% → **22%** (NDF total mínimo 25–33% respectivamente) | lechería/alto consumo | [NASEM NBK600592](https://www.ncbi.nlm.nih.gov/books/NBK600592/) |
| Grano adicional que ya deprime consumo y digestión de forraje | más de **0,5% PV/día** de grano (maíz o trigo) reduce consumo y digestibilidad del forraje por caída del pH | pastura + concentrado | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Concentrado total en terminación | dietas de **85–90% concentrado / 10–15% forraje** son el estándar experimental y comercial | terminación | [PMC7447917](https://pmc.ncbi.nlm.nih.gov/articles/PMC7447917/); [Scielo — acidosis ruminal](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |

**Regla recomendada para el motor:** no existe un techo de almidón único publicado para feedlot; la restricción operativa debe ser la **combinación acoplada** almidón–fNDF de NASEM extrapolada (bloquear si almidón > 55% DM; advertir > 45% DM) más los chequeos de peNDF y forraje, y para sistemas pastura+concentrado bloquear grano > 0,5–1,0% PV/d sin adaptación previa ([NASEM](https://www.ncbi.nlm.nih.gov/books/NBK600592/); [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf); [Montana State — step-up rations](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html)). El límite de 55% DM de almidón es una inferencia del equipo, no un valor publicado: **n.a. como número citado**.

## 5. Umbrales de pH ruminal (SARA y acidosis aguda) y duración

| Condición | Umbral de pH | Duración | Fuente |
|---|---|---|---|
| pH ruminal normal | **6,2–6,8** (rango fisiológico 5,5–7,0) | — | [PMC12148896](https://pmc.ncbi.nlm.nih.gov/articles/PMC12148896/); [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| SARA (definición Merck) | pH **5,6–5,2** de forma repetida y prolongada; rebaño en riesgo si **>25% de los animales** están por debajo de 5,5 | — | [Merck Vet Manual — SARA](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/subacute-ruminal-acidosis-in-cattle-and-sheep) |
| SARA (criterios de duración) | pH **< 5,6 durante > 3 h/d** o pH **< 5,8 durante > 5,24–5,4 h/d** | sí | [PMC12148896](https://pmc.ncbi.nlm.nih.gov/articles/PMC12148896/); [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| SARA (riesgo por pH medio diario) | pH medio diario **< 6,16** | diario | [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| SARA (definición alternativa) | pH **5,8–5,2 durante > 12 h/d** | sí | [Canadian Cattlemen](https://www.canadiancattlemen.ca/livestock/optimizing-wheat-grain-use-in-feedlot-diets/) |
| SARA (revisión Scielo) | pH cae de **5,5 a 5,0** y permanece **111–180 min/24 h** | sí | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Acidosis crónica/subaguda (benchmark Owens 1998) | pH **5,6** | — | [Owens et al. 1998](http://animalrange.montana.edu/documents/courses/ANSC320/Owensetal1998acidosisreview.pdf) |
| Acidosis aguda | pH **< 5,2** (Owens) / **< 5,0** (Merck, Scielo, PMC12148896); lactato ruminal **> 50 mM** (severo **> 40 mM**), pH sanguíneo **< 7,35** | — | [Owens 1998](http://animalrange.montana.edu/documents/courses/ANSC320/Owensetal1998acidosisreview.pdf); [PMC12148896](https://pmc.ncbi.nlm.nih.gov/articles/PMC12148896/) |
| Acumulación de lactato | por debajo de pH **5,7** la formación de ácido láctico excede la capacidad de absorción | — | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Histamina (laminitis/absceso) | contenido ruminal a pH **≤ 5,0** | — | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Caída de consumo | pH **< 5,7** reduce drásticamente el DMI; **< 5,6–5,7** el animal deja de comer | — | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Digestión de fibra comprometida | pH **< 6,0**: casi nada de energía se obtiene de la fibra y la proteína microbiana baja ≥ 1/3; al bajar de 6,5 a 5,7 la tasa de degradación de NDF cae de ~4%/h a ~1%/h | — | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf); [NASEM](https://www.ncbi.nlm.nih.gov/books/NBK600592/) |

## 6. Velocidad máxima de incremento de grano y protocolos de step-up

| Regla | Valor | Fuente |
|---|---|---|
| Duración total de adaptación (industria EEUU) | **21–28 días**; **< 21 días no recomendado** | [Montana State Extension — Step-up rations](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html) |
| Incremento máximo por escalón | **≤ 10% de la ración** (10 pasos cada 5 d, de 100% heno a 85% grano) | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html) |
| Intervalo entre escalones | **7–10 días** entre escalones (alternativa); Merck: incrementos **no más frecuentes que cada 2–3 días**; transición completa en **3–6 semanas** | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html); [Merck — prevención de trastornos nutricionales](https://www.merckvetmanual.com/management-and-nutrition/nutrition-beef-cattle/prevention-of-common-nutrition-related-disorders-in-beef-cattle) |
| Límite de grano por fase | crecimiento **≤ 1% PV**; terminación **2–2,5% PV** | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html) |
| Protocolo Penn State | 3 dietas de step-up × 7 d = **21 d** (50 → 60 → 70% grano, luego 80%); aumentar el ofrecido **5%** después de 3 días de comedero limpio | [Penn State — transición de pastura a feedlot](https://extension.psu.edu/transitioning-calves-from-pasture-to-feedlot) |
| Protocolo gradual (experimental, 15 d) | concentrado 40 → 48,3 → 56,7 → 65,0 → 73,3 → 81,7 → 90%, **3 días por escalón** | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Adaptación a 55–90% de concentrado | puede realizarse en **14 días**; cambios forraje→concentrado en general graduales en **2–3 semanas** | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Reinicio tras interrupción | tras 1–2 días fuera de comedero hay que **re-adaptar** (bajar concentrado y volver a subir) | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Alternativas al step-up escalonado | dilución con forraje decreciente, "grain sorting"/programas de restricción y manejo de comedero limpio; el artículo de Montana describe las alternativas de dietas escalonadas vs. mezcla de dieta única con ajuste de forraje | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html) |

## 7. Longitud de partícula efectiva mínima en TMR

| Parámetro | Valor | Fuente |
|---|---|---|
| Longitud de picado recomendada para la mayoría de sistemas | **½ pulgada ≈ 12,7 mm** | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Mínimo aceptable (heno seco picado, cuando la fuente de fibra es la mayoría de la dieta y el manejo es de alto nivel) | **¼ pulgada ≈ 6,35 mm** | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Cuando la fuente de fibra efectiva es **< 25% de la dieta** (caso típico de terminación) | el picado debe ser **≥ ½ pulgada ≈ 12,7 mm** | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| Tamaño crítico analítico de partícula "físicamente efectiva" | **1,18 mm** (Mertens); revisado a **4 mm** (Heinrichs 2013); el escape ruminal real ocurre con partículas **> 1,18 mm** | [Penn State](https://extension.psu.edu/methods-used-to-measure-forage-and-ration-particle-size); [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| Punto de quiebre de la respuesta de masticación al tamaño de partícula | apertura media de tamiz de **0,3 cm (3 mm)**; por encima, poca respuesta adicional y riesgo de limitar el DMI | [NASEM](https://www.ncbi.nlm.nih.gov/books/NBK600592/) |
| Distribución objetivo en PSPS | **60–70% de la TMR** debe quedar retenida como fracción físicamente efectiva (tamices ≥ 4 mm) | [Penn State Particle Separator](https://extension.psu.edu/penn-state-particle-separator/) |

## 8. Buffers: bicarbonato de sodio, óxido de magnesio, carbonato de calcio

| Buffer | Tasa de inclusión | Fuente |
|---|---|---|
| Buffers en general (ración completa) | **0,5–2,5% de la ración** | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Bicarbonato de sodio (NaHCO₃) | **~1% de la MS de la dieta**; en recepción **1 oz/cab/d (~28 g)** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Bicarbonato de sodio, dietas base ensilaje de maíz | **200–300 g/animal/día** | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Carbonato de calcio (caliza) | **~1% de la MS**; en terminación se evaluaron 1, 2 y 4% — el desempeño fue mejor a **1–2%**, y niveles superiores **inhibieron el apetito y redujeron la eficiencia** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf); [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Óxido de magnesio (MgO), mezcla comercial 81% MgO | **0,25 / 0,50 / 0,75% de la dieta tal cual**: el pH ruminal medio aumentó linealmente; a **0,75%** el pH se mantuvo ~5,2 todo el día vs. 4,8 en el control. Mg dietario total resultante: 0,29 / 0,40 / 0,556% DM | [PMC8919815](https://pmc.ncbi.nlm.nih.gov/articles/PMC8919815/) |
| MgO (referencia en ovinos en terminación) | **0,05% del concentrado** mejoró ganancia y consumo | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Techo de seguridad de Mg | Mg máximo tolerable **0,6% DM**; aparecen problemas por encima de **1% DM** | [NASEM — minerales, NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |

---

# B. MÁXIMOS DE INCLUSIÓN POR INGREDIENTE

## 9. Urea / NNP (nitrógeno no proteico)

| Parámetro | Límite | Fuente |
|---|---|---|
| Urea en la ración seca al aire | **0,5–1,0%**, recomendación actual **0,7%** | [Colorado State/CDE — Urea and NPN for cattle and sheep](https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf) |
| Urea como % de la PC total | **15–25% de la proteína cruda total**; OSU: **≤ 1/3 del equivalente proteico** | [CSU](https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf); [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Urea como % de la dieta (OSU) | típico máximo **0,45%**, hasta **0,8%**; máximos por cabeza: novillos añojos **0,28 lb/cab/d** con 81–100% concentrado; terneros **0,20 lb/cab/d** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Dosis tóxica (animal no adaptado, dieta baja en carbohidratos) | **0,3 g urea/kg PV** (= 30 g/100 kg PV); tolerancia de 1–2 g/kg PV solo si está adaptado y con carbohidrato fermentable adecuado | [CSU](https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf) |
| Dosis tóxica / letal (revisión bovina) | tóxico **0,3–0,5 g/kg PV**; dosis oral letal ~**0,5 g/kg PV**; un novillo murió con **0,21 g/kg**; adaptación de 100 → 450 g/d en 30 días | [The Bovine Practitioner](https://bovine-ojs-tamu.tdl.org/bovine/article/download/2249/2241) |
| Dosis tóxica (FAO, revisión clásica) | **0,4 g/kg PV** (40 g/100 kg PV) y **~30 g/100 kg PV** en drench; **18 g/100 kg** no fue fatal; en engorde, dosis > **0,25 g/kg PV** con 1 kg de melaza bajaron la ganancia diaria y elevaron urea sanguínea | [FAO AC149E — Applied studies on the use of urea](https://www.fao.org/4/ac149e/ac149e03.htm) |
| Signos de toxicidad | inquietud → temblores → salivación → respiración acelerada → incoordinación → meteorismo → tetania; muerte con amoníaco sanguíneo **5 mg/100 mL** y pH ruminal **~8** | [CSU](https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf) |
| Urea en bloques/mezclas con melaza | **2,5% de urea** en mezcla melaza/urea; bloques al 40% de urea dieron consumos de 200 g/d (2 años) y 120 g/d (1 año) | [FAO X6512E](https://www.fao.org/4/x6512e/x6512e26.htm); [FAO AC149E](https://www.fao.org/4/ac149e/ac149e03.htm) |
| Urea en dietas de subproductos de caña | **2% de la MS** | [FAO S8850E](https://www.fao.org/4/s8850e/S8850E26.htm) |

**Regla para el motor:** bloquear si urea > **1,0% DM**, o si el aporte diario excede **25 g/100 kg PV**, o si la urea aporta > **1/3 del equivalente proteico**; bloquear también la combinación urea + soya cruda (ítem 14).

## 10. Melaza

| Parámetro | Límite | Fuente |
|---|---|---|
| Inclusión convencional | **3–8% de la dieta** | [MLA — Expanded use of molasses for intensive beef cattle feeding](https://www.mla.com.au/globalassets/mla-corporate/extensions-training-and-tools/creative-commons/expanded-use-of-molasses-for-intensive-beef-cattle-feeding---cc.pdf) |
| Inclusión alta viable en raciones balanceadas | **15–25%** | [MLA](https://www.mla.com.au/globalassets/mla-corporate/extensions-training-and-tools/creative-commons/expanded-use-of-molasses-for-intensive-beef-cattle-feeding---cc.pdf) |
| Restricción de seguridad obligatoria | la toxicidad por melaza ("borrachera", cuadro tipo PEM) se asocia a **forraje insuficiente**: exigir **1–2 kg MS de forraje/cab/d** | [FAO X6512E](https://www.fao.org/4/x6512e/x6512e26.htm) |
| Forraje en dietas de melaza | **~8 g/kg PV** | [FAO S8850E](https://www.fao.org/4/s8850e/S8850E26.htm) |

## 11. Semilla de algodón entera, torta de algodón y gosipol

| Parámetro | Límite | Fuente |
|---|---|---|
| Semilla entera (WCS), límite general | **≤ 25% del DMI** | [MSU P2834 — Feedstuffs for beef cattle](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| WCS, vacas/animales adultos | **≤ 0,5% PV** (~5–6 lb/d) | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf); [UF/IFAS AN130](https://ask.ifas.ufl.edu/publication/AN130) |
| WCS, terneros destetados | **≤ 0,33% PV**; **no usar en terneros < 4 meses** | [UF/IFAS AN130](https://ask.ifas.ufl.edu/publication/AN130) |
| WCS, recría/terminación | **≤ 20% de la dieta**; KSU: vaquillonas destetadas/recría **≤ 15% de la dieta** | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf); [KSU MF2538](https://bookstore.ksre.ksu.edu/pubs/composition-and-feeding-value-of-cottonseed-feed-products-for-beef-cattle_MF2538.pdf) |
| Gosipol libre — torta de algodón en la ración total | **≤ 200 ppm** (recría/terminación); **≤ 100 ppm** para terneros lactantes | [KSU MF2538](https://bookstore.ksre.ksu.edu/pubs/composition-and-feeding-value-of-cottonseed-feed-products-for-beef-cattle_MF2538.pdf) |
| Gosipol libre — toros jóvenes | **< 600 ppm** en semilla / **< 150 ppm** en torta | [KSU MF2538](https://bookstore.ksre.ksu.edu/pubs/composition-and-feeding-value-of-cottonseed-feed-products-for-beef-cattle_MF2538.pdf) |
| Gosipol libre — vacas | **< 1.200 ppm** en semilla / **< 600 ppm** en torta | [KSU MF2538](https://bookstore.ksre.ksu.edu/pubs/composition-and-feeding-value-of-cottonseed-feed-products-for-beef-cattle_MF2538.pdf) |
| Torta amonificada | **≤ 20% de la ración** | [KSU MF2538](https://bookstore.ksre.ksu.edu/pubs/composition-and-feeding-value-of-cottonseed-feed-products-for-beef-cattle_MF2538.pdf) |

## 12. Grasa total / extracto etéreo

| Parámetro | Límite | Fuente |
|---|---|---|
| Grasa total de la dieta, animales adultos | **≤ 6% DM** | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf); [UK ASC-186](https://publications.mgcafe.uky.edu/files/asc186.pdf) |
| Grasa total, animales en crecimiento | **≤ 4% DM** | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| Efecto por encima de 4% | disminuye la digestión de la fibra | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| Grasa añadida | **≤ 1 lb (0,45 kg)/cab/d** | [UGA B1482](https://fieldreport.caes.uga.edu/publications/B1482/using-distillers-grains-in-beef-cattle-diets/) |
| Aceite total (AHDB) | **< 6%**; el exceso deprime el consumo | [AHDB](https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef) |

## 13. DDGS (granos secos de destilería) y restricción de azufre

| Parámetro | Límite | Fuente |
|---|---|---|
| DDGS, máximo | hasta **40% de la MS de la dieta** (con S del DDGS ~0,7% y máximo tolerable de S de 0,40% DM en la dieta total) | [University of Kentucky ASC-186](https://publications.mgcafe.uky.edu/files/asc186.pdf) |
| DDGS, recomendación conservadora | limitar a **30% del DMI**; el S del DDGS puede exceder 1% (media 0,65%) | [UGA B1482](https://fieldreport.caes.uga.edu/publications/B1482/using-distillers-grains-in-beef-cattle-diets/) |
| Restricción vinculante | el **azufre total de la dieta** (ítem 20) y la **grasa total** (ítem 12) suelen limitar el DDGS antes que el propio porcentaje de inclusión; además elevan el riesgo de urolitiasis por alto P (ítem 27) | [UK ASC-186](https://publications.mgcafe.uky.edu/files/asc186.pdf); [OSU — cálculos urinarios con distillers](https://u.osu.edu/beef/2017/07/26/feeding-steers-on-corn-gluten-or-distillers-grains-learn-to-recognize-urinary-calculi-and-how-to-prevent-them-2/) |

## 14. Soya cruda entera y cascarilla de soya

| Parámetro | Límite | Fuente |
|---|---|---|
| Soya cruda entera, terminación | **< 15% de la MS** (para no exceder 6% de EE); máximo absoluto **25% DM** | [University of Kentucky ASC-245](https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/ASC-245-Feeding-Soybeans-to-Beef-Cattle--Remediated.pdf) |
| Soya cruda entera, crecimiento | **≤ 10% DM**; recría en pastoreo **0,3% PV** | [UK ASC-245](https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/ASC-245-Feeding-Soybeans-to-Beef-Cattle--Remediated.pdf) |
| Prohibiciones absolutas | **no mezclar con urea** (la ureasa de la soya cruda libera amoníaco → intoxicación); **no alimentar a animales < 300 lb (136 kg)** | [UK ASC-245](https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/ASC-245-Feeding-Soybeans-to-Beef-Cattle--Remediated.pdf); [OSU Beef Team](https://u.osu.edu/beef/2018/12/19/feeding-raw-whole-soybeans-to-beef-cattle/) |
| Cascarilla de soya | riesgo de meteorismo por encima de **7 lb (3,2 kg)/cab/d**; equivalente a maíz hasta **0,5% PV** en dietas altas en forraje; su fibra es digestible pero **no efectiva** → sigue requiriendo forraje | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| Cascarilla de soya en corderos (referencia de pH) | **10–34,5%** mantuvo pH ruminal 5,96–6,18 | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |

## 15. Trigo y cebada

| Parámetro | Límite | Fuente |
|---|---|---|
| Trigo, % de la mezcla de granos en dietas altas en grano | **≤ 40–50%** | [Manitoba Agriculture — Feeding wheat to cattle](https://www.gov.mb.ca/agriculture/livestock/beef/print,wheat-feeding-wheat-to-cattle-.html) |
| Trigo, adaptación | **2–3 semanas**, empezando con 10% y luego 20%; laminar grueso, evitar finos | [Manitoba](https://www.gov.mb.ca/agriculture/livestock/beef/print,wheat-feeding-wheat-to-cattle-.html) |
| Trigo, límites por cabeza | vacas **≤ 8 lb/d**; vaquillonas **≤ 5 lb/d** | [Manitoba](https://www.gov.mb.ca/agriculture/livestock/beef/print,wheat-feeding-wheat-to-cattle-.html) |
| Trigo, niveles usados en investigación | **35% DM** (backgrounding) y hasta **85% DM** (terminación) con manejo estricto | [Canadian Cattlemen](https://www.canadiancattlemen.ca/livestock/optimizing-wheat-grain-use-in-feedlot-diets/) |
| Trigo: forraje mínimo asociado | **≥ 15% DM** de forraje | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Cebada, niveles experimentales de terminación | **68–80% DM** de grano de cebada laminado en seco con 0–12% de ensilaje; índice de procesamiento **82%**; monensina 28 mg/kg DM | [PMC7447917](https://pmc.ncbi.nlm.nih.gov/articles/PMC7447917/) |
| Cebada, riesgo | con 0% de forraje: pH mínimo 5,07, **16,7 h/d bajo pH 5,8** y 3,66 h/d bajo pH 5,2 → acidosis; con 4% de ensilaje las horas bajo 5,8 caen a 11,4 h/d | [PMC7447917](https://pmc.ncbi.nlm.nih.gov/articles/PMC7447917/) |
| Cebada, rango óptimo de pH de fermentación | **5,8–6,0** | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Máximo de inclusión de cebada publicado como límite formal | **n.a.** — se intentó Manitoba Agriculture "Feeding barley to beef cattle" (404) y MSU Extension (error del servidor); usar como proxy el máximo experimental de 80% DM con ≥4–12% de forraje y adaptación de 21 d | — |

## 16. Yuca / mandioca y HCN

| Parámetro | Límite | Fuente |
|---|---|---|
| Sustitución de cereales | hasta **30–40%** | [CIRAD/Feedipedia — Cassava roots (agritrop mirror)](https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf) |
| Pellets de yuca seca en engorde bovino | hasta **65% de la MS de la dieta** | [CIRAD](https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf) |
| Contenido de HCN | raíces amargas **0,02–0,03%** (frescas hasta 0,22%); dulces **< 0,01%** | [CIRAD](https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf) |
| Nivel seguro de HCN en el alimento | **< 0,01% = 100 mg HCN/kg MS** | [CIRAD](https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf) |
| Detoxificación | secado al sol de rodajas (~2 semanas) o ensilado con **0,5% de sal** | [CIRAD](https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf) |

## 17. Bagazo, pulpa de cítricos, torta de palmiste y torta de copra

| Ingrediente | Límite | Fuente |
|---|---|---|
| Bagazo de caña | digestibilidad ~**35%**; **inadecuado como dieta de rumiantes en producción**; en dietas de subproductos de caña, urea al 2% de la MS | [FAO S8850E](https://www.fao.org/4/s8850e/S8850E26.htm) |
| Pulpa de cítricos | **≤ 1/3 de la MS** de la dieta en bovinos en crecimiento; el oscurecimiento hacia negro indica sobrecalentamiento | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| Torta/harina de palmiste (PKC/PKM) | engorde bovino hasta **80% de la MS** (Malasia); lechería hasta 50%; Cu **20–30 ppm** → tóxico para ovinos desde 25 ppm; al 90% de la dieta causa toxicosis crónica por cobre | [CIRAD — Palm kernel meal (agritrop)](https://agritrop.cirad.fr/582554/1/ID582554.pdf) |
| Torta de copra (coco) | **máximo 15%** | [Compass Feeds — Copra meal fact sheet](https://www.compassfeeds.com.au/wp-content/uploads/2022/10/Copra-meal-fact-sheet-2020.pdf) |

## 18. Cama de pollo, harina de carne y hueso, harina de sangre y prohibición BSE

| Parámetro | Límite / regla | Fuente |
|---|---|---|
| Prohibición de alimentación (BSE, 21 CFR 589.2000) | **prohibida la proteína de mamífero en alimentos para rumiantes**; exenciones: sangre y productos sanguíneos, gelatina, productos lácteos, porcino puro, equino puro, y carne inspeccionada tratada térmicamente. Proteínas de ave, marinas y vegetales están exentas | [FDA CVM GFI #70](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cvm-gfi-70-small-entities-compliance-guide-feeders-ruminant-animals-without-farm-feed-mixing) |
| Harina de carne y hueso (mamífero) | **inclusión 0% — prohibida** en dietas de rumiantes bajo la regla anterior | [FDA CVM GFI #70](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cvm-gfi-70-small-entities-compliance-guide-feeders-ruminant-animals-without-farm-feed-mixing) |
| Harina de sangre | **exenta** de la prohibición (permitida); límite de inclusión numérico: **n.a.** (se buscó en MSU P2834, que no da máximo para harina de sangre, ni para harina de plumas, carne y hueso o pescado) | [FDA CVM GFI #70](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cvm-gfi-70-small-entities-compliance-guide-feeders-ruminant-animals-without-farm-feed-mixing); [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| Cama de pollo — máximo de inclusión | **no publicado como % DM**; se documentó falla cardíaca en bovinos que consumían **22 lb/cab/d (10 kg)** con poco o ningún heno/pastura, atribuida a residuos de coccidiostatos + deficiencia de vitamina E y selenio | [MU Extension G2077](https://extension.missouri.edu/publications/g2077) |
| Cama de pollo — apilado profundo obligatorio | pila de **6–8 pies**, mínimo **3 semanas (≥21 días)**; la pila calienta a **130–160 °F**; **>130 °F** mata patógenos; **140 °F por 5 días** mata la mayoría; con pH 7,2–8,6 y >130 °F se inactiva la toxina de *C. botulinum* en ~5 días; **evitar >160 °F** (reacción de Maillard); humedad mínima 20%; cubrir con polietileno de 6 mil | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| Cama de pollo — cobre | normalmente alta en Cu; una vaca adulta tolera hasta **600 ppm de Cu por 120 días**; en recría se puede usar hasta **180 días** antes de que el riesgo de toxicosis por Cu sea relevante; **no usar en ovinos** | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| Cama de pollo — cenizas | **no usar si cenizas > 28%** (riesgo de impactación de rumen/abomaso por tierra y grava) | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| Cama de pollo — retiro previo a faena | **no alimentar dentro de los 21 días previos al sacrificio**; no usar en bovinos de leche; retirar **30 días antes del parto** (riesgo de fiebre de leche); suplementar vitamina A a **1.500 IU/lb de alimento** | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| Cama de pollo — estatus regulatorio | la FDA propuso prohibir la cama de aves en alimentos para rumiantes (medida de control de BSE por el alimento de ave derramado) | [UGA — FDA litter ban](https://poultry.caes.uga.edu/content/dam/caes-subsite/poultry/documents/archived-poultry-tips/FDA-litter-ban-mar-04.pdf) |

## 19. Salvado de arroz

| Parámetro | Límite | Fuente |
|---|---|---|
| Inclusión máxima | **≤ 1/3 del total de la dieta** | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| Cautelas | alto en grasa si es integral (cuenta contra el 6% de EE del ítem 12); alto en fósforo → **requiere suplementación de calcio** (relación Ca:P, ítem 27); el integral se enrancia en clima cálido y es menos palatable que el desgrasado | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |

---

# C. TOXICIDAD DE MINERALES Y ADITIVOS

## 20. Azufre máximo y polioencefalomalacia (PEM)

| Parámetro | Límite | Fuente |
|---|---|---|
| Máximo tolerable general | **0,40% DM** (con tiamina de rescate 100–200 mg/cab/d) | [Kansas State — Sulfur toxicity in feedlots](https://www.asi.k-state.edu/doc/beef-cow-calf-nutrition/chars-j-j-wagner-sulfur-toxicity-in-feedlots-cdr-2.pdf) |
| Dietas de alto concentrado (**< 15% forraje**) | **0,30% DM** | [University of Minnesota](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water) |
| Dietas con **> 40–45% forraje** | **0,50% DM** | [UMN](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water); [Merck — PEM](https://www.merckvetmanual.com/nervous-system/polioencephalomalacia/polioencephalomalacia-in-ruminants) |
| Merck (mismo criterio) | **0,3%** si > 85% concentrado; **0,5%** si ≥ 45% forraje | [Merck](https://www.merckvetmanual.com/nervous-system/polioencephalomalacia/polioencephalomalacia-in-ruminants) |
| Dosis-respuesta de PEM | incidencia **0% a 0,27% S** y **15% a 0,74% S** | [UMN](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water) |
| Sulfato en el agua | **< 600 ppm** para dietas de alto concentrado (NRC 2005); **< 1.000 ppm** generalmente seguro | [UMN](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water) |
| NASEM (referencia) | máximo tolerable de S **0,3% / 0,5% DM** según forraje | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |

## 21. Monensina y lasalocida

| Aditivo | Rango aprobado | Máximo | Advertencias | Fuente |
|---|---|---|---|---|
| Monensina sódica (Rumensin) | **5–40 g/ton** de alimento; **50–480 mg/cabeza/día** | sin ganancia extra de eficiencia por encima de **30 g/ton (360 mg/cab/d)** | **fatal para equinos**; errores de mezclado son fatales para bovinos | [FDA — etiqueta Blue Bird de monensina (NADA 095-735)](https://www.fda.gov/files/animal%20&%20veterinary/published/Monensin-Beef-Cattle-Blue-Bird-Label-(NADA-095-735---Type-C).pdf) |
| Lasalocida sódica (Bovatec) | **10–30 g/ton**; **100–360 mg/cabeza/día** (25–30 g/ton y 250–360 mg/d para ganancia) | máximo **30 g/ton** | **fatal para equinos** | [DailyMed — Bovatec](https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=c43ead13-0965-499d-8a94-1fb566325fc3) |
| Referencia experimental | monensina **28 mg/kg MS** en dietas base cebada | — | — | [PMC7447917](https://pmc.ncbi.nlm.nih.gov/articles/PMC7447917/) |

## 22. Máximos tolerables de Cu, Se y otros minerales de margen estrecho

Valores máximos tolerables (MTL) — NASEM, capítulo de minerales ([NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/)):

| Mineral | Máximo tolerable | Nota |
|---|---|---|
| Calcio | **1,5% DM** | — |
| Fósforo | **0,7% DM** | también relevante para urolitiasis |
| Magnesio | **0,6% DM** | problemas por encima de 1% |
| Cloruro de sodio (sal) | **3% DM** en lactancia; **4,5% DM** en crecimiento | ver ítem 24 |
| Azufre | **0,3% / 0,5% DM** | según % de forraje |
| **Cobre** | **40 mg/kg (ppm)** | margen estrecho; acumula en hígado |
| **Selenio** | **5 mg/kg (ppm)** | margen estrecho |
| Cobalto | 25 mg/kg | — |
| Yodo | 50 mg/kg | — |
| Hierro | 500 mg/kg | antagonista de Cu |
| Manganeso | 2.000 mg/kg | — |
| Cromo | 100 mg/kg | — |
| Arsénico | 30 mg/kg | — |
| Níquel | 100 mg/kg | — |
| Vanadio | 50 mg/kg | — |

Advertencia adicional de campo: la cama de pollo permite hasta **600 ppm de Cu durante 120 días** en vacas adultas, pero requiere interrupciones periódicas para que el hígado elimine el exceso ([MU G2077](https://extension.missouri.edu/publications/g2077)); la torta de palmiste con 20–30 ppm de Cu al 90% de la dieta produjo toxicosis crónica de Cu ([CIRAD](https://agritrop.cirad.fr/582554/1/ID582554.pdf)).

## 23. Nitrato y nitrito

| Categoría | Nitrato (NO₃) en el alimento, ppm MS | Manejo | Fuente |
|---|---|---|---|
| Seguro | **< 4.400 ppm NO₃** (= < 1.000 ppm NO₃-N) | sin restricción | [Nebraska Extension G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| Precaución | **4.400–9.300 ppm** | vigilar, no usar en preñadas | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| Limitar | **9.300–15.000 ppm** | **< 50% de la MS** de la dieta | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| Peligroso | **> 15.000 ppm** | **< 25% de la MS** | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| Muertes documentadas | desde **2.100 ppm NO₃-N** | — | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| Agua | seguro **< 100 ppm NO₃-N**; MU: **< 10 ppm NO₃-N** | — | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm); [MU G9800](https://extension.missouri.edu/publications/g9800) |
| Escala alternativa (MU) | seguro 0–2.500 ppm NO₃; precaución 2.500–5.000; peligro 5.000–15.000; tóxico > 15.000; **ración total < 700 ppm NO₃-N** | — | [MU G9800](https://extension.missouri.edu/publications/g9800) |
| Signos clínicos | sangre color chocolate (metahemoglobinemia), disnea, aborto | — | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |

## 24. Sal máxima y técnica de limitación de consumo con sal

| Parámetro | Valor | Fuente |
|---|---|---|
| Sal en la ración completa | **0,3% DM** | [OSU](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Máximo tolerable de NaCl | **4,5% DM** (crecimiento); 3% DM (lactancia) | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| Sal para prevención de urolitiasis | hasta **4% de la dieta total** | [Nebraska/UNL extension historical](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1330&context=extensionhist) |
| Técnica de limitación con sal (salt-limiting) | **~0,1 lb de sal por 100 lb PV/día** (≈ 0,1% PV); suplementos con **6–50% de sal** | [Iowa Beef Center — Limiting feed intake with salt](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| Agua adicional requerida | **+5 galones (19 L) por libra de sal consumida**; provisión de agua ilimitada es obligatoria | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| Dosis letal única | **4–5 lb (1,8–2,3 kg) de sal** de una sola vez | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| Contraindicación | precaución si el agua tiene **> 5.000 ppm de sólidos disueltos totales** | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| Consumo de sal mineralizada libre | **≤ 0,02% PV** | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |

---

# D. OTROS TRASTORNOS

## 25. Meteorismo (bloat) y dosis de poloxaleno

| Parámetro | Valor | Fuente |
|---|---|---|
| Causas | meteorismo espumoso por leguminosas/pastura tierna, y meteorismo de feedlot por dieta alta en grano, partículas finas y bajo forraje; más frecuente en el **primer 1–2 meses** con grano; mortalidad hasta **20%** | [Merck — Bloat in ruminants](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/bloat-in-ruminants) |
| Regla dietaria preventiva | el **heno debe ser ≥ 1/3 de la dieta** | [Merck](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/bloat-in-ruminants) |
| Cascarilla de soya | riesgo de meteorismo **> 7 lb/cab/d (3,2 kg)** | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| Poloxaleno — tratamiento | **25–50 g por vía oral** | [Merck](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/bloat-in-ruminants) |
| Poloxaleno — prevención | **1–2 g por 100 lb PV/día** (1 g riesgo moderado, 2 g riesgo severo ≈ **2,2–4,4 g/100 kg PV/d**); iniciar **2–3 días antes** de la exposición; repetir si pasan > 12 h; **nunca exceder el doble de la dosis en 24 h** | [FDA — etiqueta de poloxaleno](https://www.fda.gov/media/73978/download); [21 CFR 558.464](https://www.law.cornell.edu/cfr/text/21/558.464) |

## 26. Laminitis

| Parámetro | Valor | Fuente |
|---|---|---|
| Mecanismo dietario | la laminitis es secuela de la acidosis ruminal: la liberación de **histamina** ocurre cuando el contenido ruminal llega a **pH ≤ 5,0** | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| Prevención nutricional documentada | minimizar balance energético negativo; suplementar **cobre o zinc y biotina** para fortalecer el estuche córneo; suplementación óptima de vitaminas y minerales; manejo de comedero que permita que **todos los animales coman a la vez** o alimento siempre disponible | [Merck — Laminitis in cattle](https://www.merckvetmanual.com/musculoskeletal-system/lameness-in-cattle/laminitis-in-cattle) |
| Umbrales cuantitativos propios de laminitis (pH, % concentrado, días a la aparición, dosis de biotina) | **n.a.** — la página de Merck sobre laminitis no publica umbrales de pH ruminal, % máximo de concentrado ni dosis; el control operativo debe hacerse con los límites de acidosis de la Sección A | [Merck](https://www.merckvetmanual.com/musculoskeletal-system/lameness-in-cattle/laminitis-in-cattle) |

## 27. Urolitiasis (Ca:P, P, Mg, DCAD, cloruro de amonio)

| Parámetro | Valor | Fuente |
|---|---|---|
| Relación Ca:P | mantener **< 6:1** (límite de seguridad histórico); objetivo **2:1**, mínimo **≥ 1:1** | [UNL extension histórica](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1330&context=extensionhist); [OSU Beef Team](https://u.osu.edu/beef/2017/07/26/feeding-steers-on-corn-gluten-or-distillers-grains-learn-to-recognize-urinary-calculi-and-how-to-prevent-them-2/) |
| Ca:P en dietas de crecimiento-terminación | típico **1,5:1 a 2:1**; deficiente si **< 1:1** o **> 8:1**; para prevención de cálculos apuntar a **2:1–1,2:1** | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Ca y P absolutos | Ca **0,4–0,6% DM**, P **0,3–0,4% DM** en crecimiento-terminación; máximo tolerable de P **0,7% DM** | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf); [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| Cloruro de amonio (NH₄Cl) | **0,5–1,0% de la MS**, o **30–60 g/cab/d**; alternativa citada: **1,0–1,5 oz/cab/d (28–43 g)** en terminación | [OSU Beef Team](https://u.osu.edu/beef/2017/07/26/feeding-steers-on-corn-gluten-or-distillers-grains-learn-to-recognize-urinary-calculi-and-how-to-prevent-them-2/); [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1330&context=extensionhist) |
| Sal como preventivo (aumenta consumo de agua y volumen urinario) | **0,25–0,5% DM** (OSU) hasta **4% de la dieta** (UNL) | [OSU Beef Team](https://u.osu.edu/beef/2017/07/26/feeding-steers-on-corn-gluten-or-distillers-grains-learn-to-recognize-urinary-calculi-and-how-to-prevent-them-2/); [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1330&context=extensionhist) |
| Magnesio | máximo tolerable **0,6% DM** (los cálculos de estruvita son fosfato de amonio y magnesio) | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| DCAD | relación dosis-respuesta establecida en rumiantes: DCAD **−150 a −50 mEq/kg** → pH urinario **5,5–6,0**; DCAD **> +200 mEq/kg** → pH urinario **8,0–8,5** (meseta). En ovinos: **+100 mEq/kg** → pH 6,87; **+300** → 8,45; **+500** → 8,57; **+700** → 8,60; **−100 vs +250 mEq/kg** → pH 6,2 vs 8,2. Objetivo de pH urinario para prevención de cálculos: **6,0–6,5** | [Oklahoma State — tesis DCAD y pH urinario](https://openresearch.okstate.edu/server/api/core/bitstreams/9e3a5086-0fc3-4083-87b3-f977145392a7/content) |
| DCAD específico publicado para novillos de feedlot | **n.a.** — la fuente recuperada da valores para vacas de transición, caprinos y ovinos; se buscó literatura específica de feedlot sin encontrar un umbral numérico bovino de engorde. Usar el objetivo de pH urinario 6,0–6,5 y el NH₄Cl al 0,5–1,0% DM como control operativo | [OSU tesis](https://openresearch.okstate.edu/server/api/core/bitstreams/9e3a5086-0fc3-4083-87b3-f977145392a7/content) |
| Factor de riesgo práctico | dietas altas en DDGS / gluten feed de maíz aportan exceso de P y desbalancean Ca:P → causa frecuente de cálculos en novillos | [OSU Beef Team](https://u.osu.edu/beef/2017/07/26/feeding-steers-on-corn-gluten-or-distillers-grains-learn-to-recognize-urinary-calculi-and-how-to-prevent-them-2/) |

## 28. Abscesos hepáticos y tilosina

| Parámetro | Valor | Fuente |
|---|---|---|
| Tilosina fosfato | **8–10 g/ton** de alimento, equivalente a **60–90 mg/cabeza/día** | [21 CFR 558.625](https://www.law.cornell.edu/cfr/text/21/558.625) |
| Combinación aprobada | tilosina 8–10 g/ton **junto con monensina 5–40 g/ton** | [21 CFR 558.625](https://www.law.cornell.edu/cfr/text/21/558.625) |
| Requisito regulatorio | requiere **VFD (Veterinary Feed Directive)** / orden veterinaria | [FDA — uso de tilosina fosfato en bovinos de carne](https://www.fda.gov/animal-veterinary/product-safety-information/fda-clarifies-use-tylosin-phosphate-beef-cattle-veterinarians) |
| Causa dietaria | los abscesos hepáticos derivan de la acidosis ruminal y la ruminitis; el control primario son los límites de fibra/step-up de la Sección A | [Owens et al. 1998](http://animalrange.montana.edu/documents/courses/ANSC320/Owensetal1998acidosisreview.pdf) |

## 29. Vitamina A

| Parámetro | Valor | Fuente |
|---|---|---|
| Feedlot, concentración en el alimento | **2.200 IU/kg de alimento seco**; **1.000–1.500 IU/lb** | [UF/IFAS — Vitamin A for beef cattle](https://extension.vetmed.ufl.edu/files/2012/02/Vitamin-A-for-Beef-Cattle82011.pdf) |
| Por peso vivo | **2.500 IU/100 lb PV/día** | [UF/IFAS](https://extension.vetmed.ufl.edu/files/2012/02/Vitamin-A-for-Beef-Cattle82011.pdf) |
| Por cabeza | **20.000–30.000 IU/cab/d** (crecimiento); recepción **2.000–3.000 IU/lb MS** | [UF/IFAS](https://extension.vetmed.ufl.edu/files/2012/02/Vitamin-A-for-Beef-Cattle82011.pdf); [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| Animales estresados | **50.000 IU/cab/d** oral o inyección de **500.000–1.000.000 IU** | [UF/IFAS](https://extension.vetmed.ufl.edu/files/2012/02/Vitamin-A-for-Beef-Cattle82011.pdf) |
| Depleción hepática | reservas se agotan en **40–180 días** sin aporte | [MU G2058](https://extension.missouri.edu/publications/g2058) |
| Dietas con cama de pollo | aportar **1.500 IU/lb de alimento** | [MU G2077](https://extension.missouri.edu/publications/g2077) |

## 30. Estrés calórico: THI/HLI, ajustes dietarios y diferencia Bos indicus

**Índices y umbrales**

| Parámetro | Valor | Fuente |
|---|---|---|
| THI crítico superior | **80** (equivale a 86 °F / 30 °C con 60% HR); las pérdidas ocurren con días consecutivos de THI > 80 y noches > 70 °F | [Nebraska Extension G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| Criterios de peligro (NDSU) | índice de calor **≥ 75 por 72 h**; 48 h con día ≥ 79 y noche ≥ 75; o **≥ 84 diurno dos días consecutivos** | [NDSU AS1615](https://www.ndsu.edu/agriculture/sites/default/files/2022-06/as1615.pdf) |
| HLI (Heat Load Index) del animal de referencia (novillo negro, Bos taurus, sin sombra) | gana calor con **HLI > 86**; disipa con **HLI < 77**; entre 77 y 86 es neutro; umbral máximo ajustado **96** | [FutureBeef/MLA — Heat load in feedlot cattle](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |
| **Ajuste por genotipo al umbral superior de HLI** (clave para Nelore/Brahman) | Bos taurus **+0 (86)**; cruza 25% Bos indicus **+4 (90)**; 50% **+7 (93)**; 75% **+8 (94)**; **Bos indicus puro +10 (96)**; Wagyu +4; razas europeas +3 | [FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |
| Otros ajustes de HLI | pelaje negro 0, rojo +1, blanco +3; días en confinamiento 0–80 **+2**, 80–130 **0**, >130 **−3**; enfermo/no aclimatado **−5**; sombra 1,5–2 m²/animal **+3**, 2–3 m² **+5**, 3–5 m² **+7**; agua de bebida 30–35 °C **−1**, > 35 °C **−2**; estrategia de alimentación por carga calórica **+2**; troughs de emergencia **+1** | [FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |
| Carga calórica acumulada (AHLU) | acumula horas con HLI por encima de 86; la mejor recuperación ocurre con **HLI < 77 durante 4–6 h nocturnas** | [FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |
| Fisiología general | temperatura corporal termoneutral **38–38,5 °C**; letal **> 42 °C**; el consumo voluntario empieza a caer a **25–27 °C** de temperatura ambiente; ganado de pelaje oscuro **+2 °F** de temperatura central | [PMC — revisión de carga calórica (UNL)](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=2049&context=animalscifacpub); [NDSU AS1615](https://www.ndsu.edu/agriculture/sites/default/files/2022-06/as1615.pdf) |

**Ajustes dietarios y de manejo**

| Medida | Valor | Fuente |
|---|---|---|
| Reprogramación de la alimentación | entregar **≥ 70% del alimento 2–4 h después del pico de temperatura** (tarde/noche) | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view); [NDSU AS1615](https://www.ndsu.edu/agriculture/sites/default/files/2022-06/as1615.pdf) |
| Reducción de energía de la ración | bajar la energía **5–7%** durante el evento de calor | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| Agua | **> 2 galones/100 lb PV** por encima de 80 °F; capacidad de entrega **≥ 1,1% PV por hora**; **3 pulgadas (7,6 cm)** de espacio lineal de bebedero por animal (NDSU: 2 pulgadas) | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view); [NDSU AS1615](https://www.ndsu.edu/agriculture/sites/default/files/2022-06/as1615.pdf) |
| Aspersores | **10–15 pies² (0,9–1,4 m²) por cabeza** de área mojada | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| Sombra | 2 m²/animal eleva el umbral de HLI de 86 a 91 | [FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |

**Nota para Bolivia/Nelore:** la diferencia Bos indicus se cuantifica de forma operativa como **+10 unidades de HLI** sobre el umbral de Bos taurus (96 vs 86), tope máximo 96 ([FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf)). No se encontró una comparación numérica publicada de temperatura rectal, frecuencia respiratoria o tasa de sudoración Bos indicus vs Bos taurus en las fuentes recuperadas: **n.a.** (se revisó la revisión de carga calórica de UNL, que sólo la describe cualitativamente).

## 31. Requerimiento de agua

| Condición | Requerimiento | Fuente |
|---|---|---|
| Clima frío | **1 galón/100 lb PV/día** (≈ 8,3 L/100 kg PV) | [Nebraska Beef — Water requirements](https://beef.unl.edu/water-requirements-for-beef-cattle/) |
| Clima más caluroso | **~2 galones/100 lb PV/día** (≈ 16,7 L/100 kg PV); 2 gal/100 lb a 90 °F en animales en crecimiento | [UNL](https://beef.unl.edu/water-requirements-for-beef-cattle/) |
| Rango absoluto | **3–30 galones/cab/día** (11–114 L) | [UNL](https://beef.unl.edu/water-requirements-for-beef-cattle/) |
| Estrés calórico | **> 2 gal/100 lb PV** por encima de 80 °F; entrega **≥ 1,1% PV/hora**; espacio de bebedero 2–3 pulgadas/animal | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view); [NDSU AS1615](https://www.ndsu.edu/agriculture/sites/default/files/2022-06/as1615.pdf) |
| Agua + sal | **+5 galones por libra de sal** consumida | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| Calidad del agua | sulfato **< 600 ppm** (dietas de alto concentrado) / **< 1.000 ppm**; nitrato **< 100 ppm NO₃-N** (UNL) o **< 10 ppm NO₃-N** (MU); TDS: precaución **> 5.000 ppm** | [UMN](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water); [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm); [MU G9800](https://extension.missouri.edu/publications/g9800); [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |

---

# E. TABLA RESUMEN DE REGLAS DE VALIDACIÓN

Tabla iterable por el motor. `min`/`max` vacío = no aplica. Fase: `RECEP` (recepción/adaptación), `CREC` (crecimiento), `TERM` (terminación), `TODAS`. Severidad: `BLOCK` = error bloqueante, `WARN` = advertencia.

| # | Parámetro | Mínimo | Máximo | Unidad | Fase | Severidad | Trastorno prevenido | Fuente |
|---|---|---|---|---|---|---|---|---|
| V1 | peNDF (pef × NDF, tamiz ≥4 mm) | 7 | — | % DM | TERM | BLOCK | Acidosis ruminal (SARA/aguda) | [Fox & Tedeschi](https://www.nutritionmodels.com/papers/FoxandTedeschiPNC2002.pdf) |
| V2 | peNDF objetivo | 10 | 15 | % DM | TERM | WARN | SARA / caída de DMI si excede | [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| V3 | eNDF con manejo de comedero variable o sin ionóforo | 20 | — | % DM | TERM | WARN | Acidosis | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| V4 | eNDF mínimo absoluto (manejo excelente + ionóforo) | 5 | — | % DM | TERM | BLOCK | Acidosis | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| V5 | NDF total | 13 | — | % DM | TERM | WARN | Acidosis, ruminitis | [Galyean & Defoor DB](https://pdfs.semanticscholar.org/81f4/b40eeac368bd2f28dc7f6ae769a7b6a59168.pdf) |
| V6 | NDF total | 8.5 | — | % DM | TERM | BLOCK | Acidosis (piso observado en la industria) | [Galyean & Defoor DB](https://pdfs.semanticscholar.org/81f4/b40eeac368bd2f28dc7f6ae769a7b6a59168.pdf) |
| V7 | NDF de forraje | 4.4 | 15.2 | % DM | TERM | WARN | Acidosis / restricción de consumo | [Galyean & Defoor DB](https://pdfs.semanticscholar.org/81f4/b40eeac368bd2f28dc7f6ae769a7b6a59168.pdf) |
| V8 | NDF total | 40 | — | % DM | CREC | WARN | Acidosis, engrasamiento precoz | [AHDB](https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef) |
| V9 | Forraje (roughage), ración bien mezclada | 5 | 15 | % DM | TERM | BLOCK si < 5 | Acidosis, meteorismo, laminitis | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf); [Galyean & Defoor](https://academic.oup.com/jas/article/81/14_suppl_2/E8/4789719) |
| V10 | Forraje, ración NO mezclada uniformemente | 15 | 20 | % DM | TERM | BLOCK | Acidosis | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V11 | Forraje con maíz de alta humedad | 10 | 15 | % DM | TERM | WARN | Acidosis | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V12 | Forraje si el grano principal es trigo | 15 | — | % DM | TERM | BLOCK | Acidosis por trigo | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V13 | Forraje en recepción / animales enfermos | 30 | — | % DM | RECEP | BLOCK | Acidosis de arranque | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V14 | Forraje en dietas base melaza | 1 (kg MS/cab/d) | — | kg MS/cab/d | TODAS | BLOCK | Toxicidad por melaza / PEM | [FAO X6512E](https://www.fao.org/4/x6512e/x6512e26.htm) |
| V15 | Heno cuando hay riesgo de meteorismo de feedlot | 33 | — | % de la dieta | TODAS | WARN | Meteorismo espumoso | [Merck — Bloat](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/bloat-in-ruminants) |
| V16 | Almidón | — | 20 | % DM | CREC | WARN | Acidosis, engrasamiento | [AHDB](https://ahdb.org.uk/knowledge-library/growing-and-finishing-cattle-nutritional-guidance-for-dairy-beef) |
| V17 | Almidón máximo acoplado a fNDF (regla NASEM) | — | 30 si fNDF ≥19; 28 si 18; 26 si 17; 24 si 16; 22 si 15 | % DM | TODAS | WARN | SARA | [NASEM NBK600592](https://www.ncbi.nlm.nih.gov/books/NBK600592/) |
| V18 | Grano por animal (sistemas pastura + concentrado) | — | 0.5 | % PV/día | CREC | WARN | Caída de pH y de digestión de forraje | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| V19 | Grano por animal, crecimiento | — | 1.0 | % PV/día | CREC | BLOCK | Acidosis | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html) |
| V20 | Grano por animal, terminación | — | 2.5 | % PV/día | TERM | BLOCK | Acidosis | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html) |
| V21 | Concentrado total | — | 90 | % DM | TERM | WARN | Acidosis | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| V22 | pH ruminal medio objetivo | 6.16 | — | pH | TODAS | WARN (monitoreo) | SARA | [PMC7320828](https://pmc.ncbi.nlm.nih.gov/articles/PMC7320828/) |
| V23 | pH ruminal — umbral SARA | 5.6 | — | pH (no más de 3 h/d por debajo) | TODAS | BLOCK (monitoreo) | SARA | [Merck SARA](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/subacute-ruminal-acidosis-in-cattle-and-sheep); [PMC12148896](https://pmc.ncbi.nlm.nih.gov/articles/PMC12148896/) |
| V24 | pH ruminal — acidosis aguda | 5.0 | — | pH | TODAS | BLOCK (emergencia) | Acidosis láctica aguda, muerte | [Merck SARA](https://www.merckvetmanual.com/digestive-system/diseases-of-the-ruminant-forestomach/subacute-ruminal-acidosis-in-cattle-and-sheep); [Owens 1998](http://animalrange.montana.edu/documents/courses/ANSC320/Owensetal1998acidosisreview.pdf) |
| V25 | Duración total de adaptación al grano | 21 | 42 | días | RECEP | BLOCK si < 21 | Acidosis aguda | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html); [Merck](https://www.merckvetmanual.com/management-and-nutrition/nutrition-beef-cattle/prevention-of-common-nutrition-related-disorders-in-beef-cattle) |
| V26 | Incremento de concentrado por escalón | — | 10 | puntos % de la ración | RECEP | BLOCK | Acidosis aguda | [Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html) |
| V27 | Intervalo entre escalones | 2 | — | días (recomendado 3–7) | RECEP | BLOCK si < 2 | Acidosis aguda | [Merck](https://www.merckvetmanual.com/management-and-nutrition/nutrition-beef-cattle/prevention-of-common-nutrition-related-disorders-in-beef-cattle); [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| V28 | Re-adaptación tras 1–2 días sin comer | obligatoria | — | — | TODAS | BLOCK | Acidosis aguda por gorging | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V29 | Longitud de picado de forraje (fibra efectiva < 25% de la dieta) | 12.7 | — | mm | TERM | BLOCK | Acidosis, meteorismo | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| V30 | Longitud de picado mínima absoluta | 6.35 | — | mm | TODAS | BLOCK | Fibra no efectiva → acidosis | [MSU P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf) |
| V31 | Fracción físicamente efectiva en PSPS (tamices ≥4 mm) | 60 | 70 | % de la TMR | TODAS | WARN | Acidosis / selección de partículas | [Penn State](https://extension.psu.edu/penn-state-particle-separator/) |
| V32 | Buffers totales | — | 2.5 | % de la ración | TODAS | WARN | Rechazo de alimento | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| V33 | Bicarbonato de sodio | 0.5 | 1.5 | % DM | RECEP/TERM | WARN | SARA | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf); [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| V34 | Carbonato de calcio (caliza) | — | 2 | % DM | TERM | BLOCK si > 2 | Inhibición del apetito, pérdida de eficiencia | [Scielo](https://www.scielo.cl/scielo.php?pid=S0719-81322017000300139&script=sci_arttext) |
| V35 | Óxido de magnesio (mezcla 81% MgO) | 0.25 | 0.75 | % de la dieta tal cual | TERM | WARN | SARA | [PMC8919815](https://pmc.ncbi.nlm.nih.gov/articles/PMC8919815/) |
| V36 | Magnesio total | — | 0.6 | % DM | TODAS | BLOCK | Toxicidad por Mg / diarrea | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| V37 | Urea | — | 1.0 | % DM (recomendado 0.7) | TODAS | BLOCK | Intoxicación amoniacal | [CSU/CDE](https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf) |
| V38 | Urea como fracción de la PC total | — | 33 | % del equivalente proteico | TODAS | BLOCK | Intoxicación amoniacal, mal uso de N | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf); [CSU](https://hermes.cde.state.co.us/islandora/object/co:11984/datastream/OBJ/download/Urea_and_NPN_for_cattle_and_sheep.pdf) |
| V39 | Urea por peso vivo | — | 25 | g/100 kg PV/día | TODAS | BLOCK | Intoxicación amoniacal (tóxico 30–40 g/100 kg) | [FAO AC149E](https://www.fao.org/4/ac149e/ac149e03.htm); [Bovine Practitioner](https://bovine-ojs-tamu.tdl.org/bovine/article/download/2249/2241) |
| V40 | Urea + soya cruda en la misma mezcla | prohibido | — | — | TODAS | BLOCK | Intoxicación amoniacal (ureasa) | [UK ASC-245](https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/ASC-245-Feeding-Soybeans-to-Beef-Cattle--Remediated.pdf) |
| V41 | Melaza | — | 25 | % DM (convencional 3–8%) | TODAS | WARN | Toxicidad por melaza, acidosis | [MLA](https://www.mla.com.au/globalassets/mla-corporate/extensions-training-and-tools/creative-commons/expanded-use-of-molasses-for-intensive-beef-cattle-feeding---cc.pdf) |
| V42 | Semilla de algodón entera | — | 25 | % del DMI | TERM | BLOCK | Gosipolismo, exceso de grasa | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| V43 | Semilla de algodón entera | — | 0.5 | % PV/día (adultos) | TODAS | BLOCK | Gosipolismo | [UF/IFAS AN130](https://ask.ifas.ufl.edu/publication/AN130) |
| V44 | Semilla de algodón entera, terneros destetados | — | 0.33 | % PV/día | RECEP/CREC | BLOCK | Gosipolismo | [UF/IFAS AN130](https://ask.ifas.ufl.edu/publication/AN130) |
| V45 | Semilla de algodón en terneros < 4 meses | prohibido | — | — | RECEP | BLOCK | Gosipolismo | [UF/IFAS AN130](https://ask.ifas.ufl.edu/publication/AN130) |
| V46 | Gosipol libre en la ración total | — | 200 | ppm (100 ppm en terneros lactantes) | TODAS | BLOCK | Gosipolismo (cardio/hepatotoxicidad, infertilidad) | [KSU MF2538](https://bookstore.ksre.ksu.edu/pubs/composition-and-feeding-value-of-cottonseed-feed-products-for-beef-cattle_MF2538.pdf) |
| V47 | Grasa total (extracto etéreo), adultos | — | 6 | % DM | TERM | BLOCK | Depresión de digestión de fibra y del consumo | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf); [UK ASC-186](https://publications.mgcafe.uky.edu/files/asc186.pdf) |
| V48 | Grasa total, animales en crecimiento | — | 4 | % DM | CREC | BLOCK | Depresión de digestión de fibra | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| V49 | Grasa añadida | — | 0.45 | kg/cab/día | TODAS | WARN | Depresión ruminal | [UGA B1482](https://fieldreport.caes.uga.edu/publications/B1482/using-distillers-grains-in-beef-cattle-diets/) |
| V50 | DDGS | — | 40 (conservador 30) | % DM | TERM | WARN a 30, BLOCK a 40 | PEM por S, urolitiasis por P, exceso de grasa | [UK ASC-186](https://publications.mgcafe.uky.edu/files/asc186.pdf); [UGA B1482](https://fieldreport.caes.uga.edu/publications/B1482/using-distillers-grains-in-beef-cattle-diets/) |
| V51 | Soya cruda entera, terminación | — | 15 | % DM (tope absoluto 25) | TERM | BLOCK | Exceso de EE, ureasa | [UK ASC-245](https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/ASC-245-Feeding-Soybeans-to-Beef-Cattle--Remediated.pdf) |
| V52 | Soya cruda entera, crecimiento | — | 10 | % DM | CREC | BLOCK | Exceso de EE | [UK ASC-245](https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/ASC-245-Feeding-Soybeans-to-Beef-Cattle--Remediated.pdf) |
| V53 | Soya cruda en animales < 136 kg | prohibido | — | — | RECEP | BLOCK | Inhibidores y ureasa | [OSU Beef Team](https://u.osu.edu/beef/2018/12/19/feeding-raw-whole-soybeans-to-beef-cattle/) |
| V54 | Cascarilla de soya | — | 3.2 | kg/cab/día | TODAS | BLOCK | Meteorismo, atragantamiento con pellets | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| V55 | Trigo, % de la mezcla de granos | — | 50 | % de la mezcla de granos | TERM | BLOCK | Acidosis aguda | [Manitoba](https://www.gov.mb.ca/agriculture/livestock/beef/print,wheat-feeding-wheat-to-cattle-.html) |
| V56 | Trigo, adaptación específica | 14 | 21 | días | RECEP | BLOCK | Acidosis aguda | [Manitoba](https://www.gov.mb.ca/agriculture/livestock/beef/print,wheat-feeding-wheat-to-cattle-.html) |
| V57 | Cebada laminada | — | 80 | % DM (con ≥4% de forraje y adaptación de 21 d) | TERM | WARN | Acidosis (a 0% de forraje: 16,7 h/d bajo pH 5,8) | [PMC7447917](https://pmc.ncbi.nlm.nih.gov/articles/PMC7447917/) |
| V58 | Yuca seca (pellets/chips) | — | 65 | % DM | TERM | WARN | Acidosis, HCN | [CIRAD](https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf) |
| V59 | HCN en la dieta | — | 100 | mg/kg MS (0,01%) | TODAS | BLOCK | Intoxicación cianhídrica | [CIRAD](https://agritrop.cirad.fr/582466/7/ID582466_ENG.pdf) |
| V60 | Pulpa de cítricos | — | 33 | % DM | CREC/TERM | BLOCK | Acidosis, desbalance | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| V61 | Salvado de arroz | — | 33 | % de la dieta total | TODAS | BLOCK | Exceso de grasa y P (urolitiasis) | [MSU P2834](https://extension.msstate.edu/sites/default/files/publications/P2834_web.pdf) |
| V62 | Torta de palmiste (PKC) | — | 80 | % DM | TERM | WARN | Toxicosis crónica por Cu (a 90% ya es tóxica) | [CIRAD](https://agritrop.cirad.fr/582554/1/ID582554.pdf) |
| V63 | Torta de copra | — | 15 | % de la dieta | TODAS | WARN | Desbalance / palatabilidad | [Compass Feeds](https://www.compassfeeds.com.au/wp-content/uploads/2022/10/Copra-meal-fact-sheet-2020.pdf) |
| V64 | Bagazo de caña como forraje principal | no apto | — | — | TODAS | WARN | Subnutrición (digestibilidad ~35%) | [FAO S8850E](https://www.fao.org/4/s8850e/S8850E26.htm) |
| V65 | Harina de carne y hueso / proteína de mamífero | prohibido | 0 | % DM | TODAS | BLOCK | Prohibición BSE (21 CFR 589.2000) | [FDA GFI #70](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cvm-gfi-70-small-entities-compliance-guide-feeders-ruminant-animals-without-farm-feed-mixing) |
| V66 | Cama de pollo — apilado profundo previo | 21 | — | días a > 130 °F (máx 160 °F) | TODAS | BLOCK | Patógenos, toxina botulínica | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| V67 | Cama de pollo — cenizas | — | 28 | % | TODAS | BLOCK | Impactación de rumen/abomaso | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| V68 | Cama de pollo — retiro previo a faena | 21 | — | días | TERM | BLOCK | Residuos farmacológicos | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| V69 | Cama de pollo — duración de uso | — | 120 (vacas) / 180 (recría) | días continuos | TODAS | WARN | Toxicosis por Cu | [MU G2077](https://extension.missouri.edu/publications/g2077) |
| V70 | Azufre total, dietas con < 15% de forraje | — | 0.30 | % DM | TERM | BLOCK | Polioencefalomalacia (PEM) | [UMN](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water); [Merck PEM](https://www.merckvetmanual.com/nervous-system/polioencephalomalacia/polioencephalomalacia-in-ruminants) |
| V71 | Azufre total, dietas con > 40% de forraje | — | 0.50 | % DM | CREC | BLOCK | PEM | [UMN](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water) |
| V72 | Azufre — máximo tolerable general | — | 0.40 | % DM | TODAS | BLOCK | PEM | [KSU](https://www.asi.k-state.edu/doc/beef-cow-calf-nutrition/chars-j-j-wagner-sulfur-toxicity-in-feedlots-cdr-2.pdf) |
| V73 | Sulfato en el agua | — | 600 (alto concentrado) / 1000 | ppm | TODAS | WARN | PEM | [UMN](https://extension.umn.edu/agriculture/animals-and-livestock/beef/managing-sulfur-in-beef-cattle-feed-and-water) |
| V74 | Monensina | 50 | 480 (sin beneficio > 360) | mg/cab/día | TODAS | BLOCK | Sobredosis: intoxicación cardíaca/muerte | [FDA monensina](https://www.fda.gov/files/animal%20&%20veterinary/published/Monensin-Beef-Cattle-Blue-Bird-Label-(NADA-095-735---Type-C).pdf) |
| V75 | Monensina en el alimento | 5 | 40 | g/ton | TODAS | BLOCK | Sobredosis / falta de eficacia | [FDA monensina](https://www.fda.gov/files/animal%20&%20veterinary/published/Monensin-Beef-Cattle-Blue-Bird-Label-(NADA-095-735---Type-C).pdf) |
| V76 | Lasalocida | 100 | 360 | mg/cab/día (10–30 g/ton) | TODAS | BLOCK | Sobredosis | [DailyMed Bovatec](https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=c43ead13-0965-499d-8a94-1fb566325fc3) |
| V77 | Ionóforos en alimento destinado a equinos | prohibido | — | — | TODAS | BLOCK | Muerte de equinos | [FDA monensina](https://www.fda.gov/files/animal%20&%20veterinary/published/Monensin-Beef-Cattle-Blue-Bird-Label-(NADA-095-735---Type-C).pdf) |
| V78 | Cobre | — | 40 | mg/kg DM | TODAS | BLOCK | Toxicosis por cobre (hepática, hemólisis) | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| V79 | Selenio | — | 5 | mg/kg DM | TODAS | BLOCK | Selenosis | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| V80 | Calcio | — | 1.5 | % DM | TODAS | BLOCK | Exceso mineral, desbalance Ca:P | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| V81 | Fósforo | — | 0.7 | % DM | TODAS | BLOCK | Urolitiasis | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| V82 | Cobalto / Yodo / Hierro / Manganeso / Cromo / Arsénico / Níquel / Vanadio | — | 25 / 50 / 500 / 2000 / 100 / 30 / 100 / 50 | mg/kg DM | TODAS | BLOCK | Toxicidad mineral | [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| V83 | Nitrato en el alimento | — | 4400 | ppm NO₃ MS (= 1000 ppm NO₃-N) | TODAS | WARN 4400–9300; BLOCK > 9300 sin dilución | Metahemoglobinemia, aborto | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| V84 | Nitrato 9.300–15.000 ppm | — | 50 | % de la MS de la dieta | TODAS | BLOCK | Intoxicación por nitrato | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| V85 | Nitrato > 15.000 ppm | — | 25 | % de la MS de la dieta | TODAS | BLOCK | Intoxicación por nitrato | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm) |
| V86 | Nitrato en el agua | — | 100 (NO₃-N; criterio estricto 10) | ppm | TODAS | BLOCK | Intoxicación por nitrato | [UNL G1779](https://extensionpublications.unl.edu/assets/html/g1779/build/g1779.htm); [MU G9800](https://extension.missouri.edu/publications/g9800) |
| V87 | Sal (NaCl) en ración completa | 0.3 | 4.5 | % DM | TODAS | BLOCK si > 4.5 | Intoxicación salina; mínimo para requerimiento de Na | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf); [NASEM NBK600600](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| V88 | Sal en técnica de limitación de consumo | — | 0.1 | lb/100 lb PV/día (≈0,1% PV) | TODAS | BLOCK | Intoxicación salina (letal 1,8–2,3 kg de una vez) | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| V89 | Agua libre obligatoria con sal-limitación | ilimitada (+5 galones ≈ 19 L por libra de sal consumida) | — | — | TODAS | BLOCK | Intoxicación salina | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| V90 | TDS del agua con sal-limitación | — | 5000 | ppm | TODAS | WARN | Intoxicación salina | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/LimitFeedIntakeSalt.pdf) |
| V91 | Poloxaleno (prevención de meteorismo) | 1 | 2 | g/100 lb PV/día (máx: no exceder el doble en 24 h) | TODAS | BLOCK | Meteorismo espumoso | [FDA](https://www.fda.gov/media/73978/download); [21 CFR 558.464](https://www.law.cornell.edu/cfr/text/21/558.464) |
| V92 | Relación Ca:P | 1.2:1 | 6:1 (óptimo 2:1) | ratio | TODAS | BLOCK fuera de 1:1–6:1 | Urolitiasis / desbalance | [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1330&context=extensionhist); [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V93 | Calcio y fósforo dietarios | Ca 0.4 / P 0.3 | Ca 0.6 / P 0.4 | % DM | CREC/TERM | WARN | Urolitiasis, desmineralización | [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V94 | Cloruro de amonio (prevención de urolitiasis) | 0.5 | 1.0 | % DM (30–60 g/cab/d) | TERM | WARN (obligatorio si DDGS/gluten alto) | Urolitiasis obstructiva | [OSU Beef Team](https://u.osu.edu/beef/2017/07/26/feeding-steers-on-corn-gluten-or-distillers-grains-learn-to-recognize-urinary-calculi-and-how-to-prevent-them-2/) |
| V95 | pH urinario objetivo | 6.0 | 6.5 | pH | TERM | WARN (monitoreo) | Urolitiasis | [OSU tesis DCAD](https://openresearch.okstate.edu/server/api/core/bitstreams/9e3a5086-0fc3-4083-87b3-f977145392a7/content) |
| V96 | DCAD para acidificar la orina | −150 | −50 | mEq/kg MS | TERM | WARN | Urolitiasis | [OSU tesis DCAD](https://openresearch.okstate.edu/server/api/core/bitstreams/9e3a5086-0fc3-4083-87b3-f977145392a7/content) |
| V97 | Tilosina fosfato | 60 | 90 | mg/cab/día (8–10 g/ton, requiere VFD) | TERM | BLOCK | Abscesos hepáticos | [21 CFR 558.625](https://www.law.cornell.edu/cfr/text/21/558.625) |
| V98 | Vitamina A | 2200 | — | IU/kg de alimento seco | TODAS | BLOCK | Ceguera nocturna, edema, baja inmunidad | [UF/IFAS](https://extension.vetmed.ufl.edu/files/2012/02/Vitamin-A-for-Beef-Cattle82011.pdf) |
| V99 | Vitamina A por cabeza | 20000 | — | IU/cab/día (50.000 si estresados) | TODAS | WARN | Deficiencia de vitamina A | [UF/IFAS](https://extension.vetmed.ufl.edu/files/2012/02/Vitamin-A-for-Beef-Cattle82011.pdf); [OSU primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf) |
| V100 | THI — umbral de alerta por calor | — | 80 | THI | TODAS | WARN → activar protocolo | Estrés calórico, muerte | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| V101 | HLI — umbral superior por genotipo | — | 86 (Bos taurus) / 90 (25% indicus) / 93 (50%) / 94 (75%) / **96 (Bos indicus / Nelore-Brahman)** | HLI | TODAS | WARN → activar protocolo | Estrés calórico | [FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |
| V102 | Ajustes de HLI: sombra +3/+5/+7; enfermo −5; días en confinamiento >130 −3; agua > 35 °C −2 | — | — | unidades HLI | TODAS | WARN | Estrés calórico | [FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |
| V103 | Recuperación nocturna requerida | 4 | — | horas con HLI < 77 | TODAS | WARN | Carga calórica acumulada | [FutureBeef/MLA](https://futurebeef.com.au/wp-content/uploads/Heat-load-in-feedlot-cattle.pdf) |
| V104 | Reprogramación de alimentación en calor | 70 | — | % del alimento entregado 2–4 h después del pico térmico | TODAS | WARN (regla activa) | Estrés calórico + acidosis | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| V105 | Reducción de energía de la ración en ola de calor | 5 | 7 | % de reducción | TODAS | WARN | Estrés calórico | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| V106 | Agua — requerimiento base | 8.3 | — | L/100 kg PV/día (1 gal/100 lb) | TODAS | BLOCK | Deshidratación, impactación | [UNL Beef](https://beef.unl.edu/water-requirements-for-beef-cattle/) |
| V107 | Agua — clima caluroso (> 27 °C) | 16.7 | — | L/100 kg PV/día (2 gal/100 lb) | TODAS | BLOCK | Estrés calórico, muerte | [UNL Beef](https://beef.unl.edu/water-requirements-for-beef-cattle/); [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| V108 | Agua — capacidad de entrega | 1.1 | — | % PV por hora | TODAS | WARN | Estrés calórico | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |
| V109 | Espacio lineal de bebedero | 5 | — | cm/animal (2–3 pulgadas) | TODAS | WARN | Estrés calórico | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view); [NDSU AS1615](https://www.ndsu.edu/agriculture/sites/default/files/2022-06/as1615.pdf) |
| V110 | Aspersión (área mojada) | 0.9 | 1.4 | m²/cabeza | TODAS | WARN | Estrés calórico | [UNL G1409](https://extensionpubs.unl.edu/publication/g1409/2007/html/view) |

---

## Valores no confirmados (`n.a.`) y qué se intentó

| Ítem | Valor faltante | Búsqueda realizada |
|---|---|---|
| 3 | Requerimiento de forraje expresado como **% PV de NDF de forraje** | Revisados Galyean & Defoor (JAS y base de datos), MSU P2489, NASEM NBK600592: sólo dan % DM y la ecuación `DMI = 1,9145 + 0,0162 × roughage NDF%`. |
| 4 | **Techo numérico de almidón** para dietas de terminación bovina | AHDB, NASEM NBK600592 y la revisión Scielo de acidosis no publican un máximo de almidón para feedlot; NASEM sólo publica la tabla acoplada almidón–fNDF para lecheras. El 55% DM usado como bloqueo es inferencia, no cita. |
| 15 | **Máximo formal de cebada** en dietas bovinas | Manitoba Agriculture "Feeding barley to beef cattle" devolvió 404 y MSU Extension devolvió error de servidor; se usa el 80% DM experimental de PMC7447917. |
| 18 | **Máximo de inclusión de cama de pollo (% DM)** y de harina de sangre | MU G2077 no publica un máximo (sólo el caso tóxico de 22 lb/cab/d); MSU P2834 no da límites para harina de sangre, plumas, carne y hueso ni pescado. |
| 26 | **Umbrales cuantitativos propios de laminitis** (pH, % concentrado máximo, días a la aparición, dosis de biotina) | La página de Merck sobre laminitis no publica cifras dietarias; se controla indirectamente vía Sección A y la ruta histamina/pH ≤ 5,0 de Scielo. |
| 27 | **DCAD específico para novillos de feedlot** | La tesis de Oklahoma State recupera datos de vacas de transición, caprinos y ovinos; no se halló un umbral de DCAD bovino de engorde. Se usa el objetivo de pH urinario 6,0–6,5. |
| 30 | **Comparación numérica Bos indicus vs Bos taurus** de temperatura rectal, frecuencia respiratoria y tasa de sudoración | La revisión de carga calórica de UNL (DigitalCommons) la describe sólo cualitativamente; el sustituto cuantitativo válido es el ajuste **+10 unidades de HLI** de FutureBeef/MLA. |
