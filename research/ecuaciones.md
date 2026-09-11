# Ecuaciones NRC / NASEM / BR-CORTE para un motor de cálculo de engorde bovino
### Referencia de implementación — sistema de energía neta (California Net Energy System) y proteína metabolizable
**Contexto de uso:** engorde (feedlot y pasto + concentrado) en Santa Cruz, Bolivia. Genotipos: Nelore, Brahman, Angus × Brahman, Senepol, Criollo. Clima tropical.

**Regla de oro de este documento:** cada coeficiente numérico proviene de una página efectivamente descargada en esta sesión, con el URL exacto al lado. Donde no se pudo confirmar, dice `n.a.` y qué se intentó.

**Fuentes primarias usadas (todas descargadas en esta sesión):**

| Sigla | Publicación / edición | URL descargado |
|---|---|---|
| NRC96 | NRC, *Nutrient Requirements of Beef Cattle*, 7th rev. ed. 1996 — Capítulo 10 corregido (errata oficial NAP), "Level 1 / Level 2 equations" | [nap.nationalacademies.org/resource/beef/beef10.pdf](https://nap.nationalacademies.org/resource/beef/beef10.pdf) |
| NRC2000 | NRC, *Nutrient Requirements of Beef Cattle*, 7th rev. ed., **Update 2000** (texto completo) | [Update 2000, texto completo](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html) |
| NASEM16 | NASEM, *Nutrient Requirements of Beef Cattle*, 8th rev. ed., 2016 (modelo BCNRM) | [errata oficial NAP](https://nap.nationalacademies.org/resource/19014/Beef%20Cattle%20errata%20sheet2.pdf) · ecuaciones citadas vía [Translational Animal Science 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108), [BR-CORTE 2023 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf) y [NMSU B-231](https://pubs.nmsu.edu/_b/B231/) |
| BRC16 | BR-CORTE 4.0 / *3rd edition* (Valadares Filho et al., 2016) | cap. 2 [DMI](https://brcorte.com.br/assets/book2016/en/c2.pdf) · cap. 7 [Energía](https://brcorte.com.br/assets/book2016/en/c7.pdf) · cap. 8 [Proteína](https://brcorte.com.br/assets/book2016/en/c8.pdf) · cap. 9 [Minerales](https://brcorte.com.br/assets/book2016/en/c9.pdf) |
| BRC23 | BR-CORTE **4th edition, 2023** (*Nutrient Requirements of Zebu and Crossbred Cattle*) | cap. 1 [Peso](https://brcorte.com.br/assets/book2023/en/01.pdf) · cap. 2 [DMI](https://brcorte.com.br/assets/book2023/en/02.pdf) · cap. 3 [Proteína microbiana](https://brcorte.com.br/assets/book2023/en/03.pdf) · cap. 8 [Energía](https://brcorte.com.br/assets/book2023/en/08.pdf) · cap. 9 [Proteína](https://brcorte.com.br/assets/book2023/en/09.pdf) · [libro completo](https://editorascienza.com.br/brcorte_2023/en/br_corte_2023_en.pdf) |
| Weiss/NRC01 | Weiss summative / NRC Dairy 2001, capítulo de energía | [foragelab.com/media/nrc2001.pdf](https://www.foragelab.com/media/nrc2001.pdf) |

> **Aviso de OCR.** Las tablas del PDF escaneado de NRC96 (Tabla 10-1 factores de raza BE, Tabla 10-2 columna "máximo tolerable", Tabla 10-4) se extraen con las columnas separadas de las etiquetas. Donde el emparejamiento etiqueta↔valor se dedujo por orden de lista, está marcado con **(orden inferido del OCR — verificar contra el libro impreso)**.

---

## A. BASE DE PESO

### A.1 — Ítem 1: Peso vivo vacío / desbastado (SBW) a partir del peso vivo lleno (BW)

**NRC 1996 / NASEM 2016 (relación fija):**

\[ SBW = 0.96 \times BW \]

NRC96 lo define como "SBW is shrunk body weight, kg (typically 0.96*full weight)" ([NRC96 cap.10](https://nap.nationalacademies.org/resource/beef/beef10.pdf)); NASEM 2016 mantiene `SBW = 0.96 × BW` ([TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)), y NMSU lo describe como "body weight adjusted for 4% gut fill" ([NMSU B-231](https://pubs.nmsu.edu/_b/B231/)).

**BR-CORTE 2023 (alométrica, cebuinos y cruzas de corte) — Eq. 1.3 y 1.4:**

\[ SBW = 0.8915 \times BW^{1.0151} \quad \text{(Zebú y cruzas de corte)} \]
\[ SBW = 0.9247 \times BW^{1.0085} \quad \text{(cruzas lecheras)} \]

BR-CORTE recomienda usar Eq. 1.3 también para animales en pastoreo ([BRC23 cap. 1](https://brcorte.com.br/assets/book2023/en/01.pdf)). La edición 2016 publicaba `SBW = 0.88 × BW^1.0175` para cebuinos ([BRC16 cap. 7](https://brcorte.com.br/assets/book2016/en/c7.pdf)); **usar la versión 2023**.

| Símbolo | Definición | Unidad |
|---|---|---|
| BW | peso vivo lleno (full weight), sin ayuno | kg |
| SBW | peso vivo desbastado / en ayuno (shrunk body weight) | kg |

*Recomendación tropical:* Eq. 1.3 de BR-CORTE 2023 (derivada de cebuinos brasileños) reproduce mejor el llenado ruminal de dietas tropicales que el factor fijo 0.96.

### A.2 — Ítem 2: Peso vacío corporal (EBW) a partir de SBW

**NRC 1996 / NASEM 2016:** \[ EBW = 0.891 \times SBW \] ([NRC96 cap. 10](https://nap.nationalacademies.org/resource/beef/beef10.pdf); confirmado para NASEM 2016 en [TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)).

**BR-CORTE (2016, mantenido en 2023, Tabla 1.6) — confinamiento:**

| Grupo genético | Sexo | Ecuación | Nº |
|---|---|---|---|
| Zebú | Toros (bulls) | EBW = 0.8126 × SBW^1.0134 | Eq. 1.6 |
| Zebú | Novillos (steers) | EBW = 0.6241 × SBW^1.0608 | Eq. 1.7 |
| Zebú | Vaquillas | EBW = 0.6110 × SBW^1.0667 | Eq. 1.8 |
| Cruzas de corte y lecheras | Toros | EBW = 0.7248 × SBW^1.0314 | Eq. 1.9 |
| Cruzas | Novillos | EBW = 0.6586 × SBW^1.0499 | Eq. 1.10 |
| Cruzas | Vaquillas | EBW = 0.6314 × SBW^1.0602 | Eq. 1.11 |

**Pastoreo (Eq. 1.5):** \( EBW = 0.8507 \times SBW^{1.0002} \) — prácticamente lineal. Todas en [BRC23 cap. 1](https://brcorte.com.br/assets/book2023/en/01.pdf). BR-CORTE observa que la relación EBW:SBW en cebuinos confinados varía 84.6–93.6 % (media 0.897), frente al valor fijo 0.891 del NRC ([BRC23 cap. 1](https://brcorte.com.br/assets/book2023/en/01.pdf)).

### A.3 — Ítem 3: Ganancia de peso vacío (EBG) a partir de la ganancia diaria (ADG/SWG)

**NRC 1996 / NASEM 2016:** \[ EBG = 0.956 \times SWG \] ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)); NASEM 2016 usa `EBG = 0.956 × ADG` ([TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)). BR-CORTE reporta que el NRC (2000) usa la relación fija 0.951 ([BRC23 cap. 1](https://brcorte.com.br/assets/book2023/en/01.pdf)).

**BR-CORTE (Eq. 1.12, 2016 y 2023):** \[ EBG = 0.9630 \times ADG^{1.0151} \]

La relación EBG/ADG resultante va de 0.943 (ADG 0.25 kg/d) a 0.971 (ADG 1.75 kg/d) ([BRC23 cap. 1](https://brcorte.com.br/assets/book2023/en/01.pdf)).

| Símbolo | Definición | Unidad |
|---|---|---|
| ADG / SWG | ganancia diaria de peso (desbastada) | kg/d |
| EBG | ganancia diaria de peso vacío | kg/d |

### A.4 — Ítem 4: Peso equivalente (EQSBW / EQEBW) y pesos de referencia estándar

**NRC 1996 / NASEM 2016:**

\[ EQSBW = SBW \times \frac{SRW}{FSBW} \qquad EQEBW = 0.891 \times EQSBW \]

Pesos de referencia estándar (SRW), NRC96 ([fuente](https://nap.nationalacademies.org/resource/beef/beef10.pdf)):

| SRW (kg) | Punto final | Grasa corporal |
|---|---|---|
| 478 | small marbling; también vaquillas de reemplazo y toros reproductores | 28 % |
| 462 | slight marbling | 27 % |
| 435 | trace marbling | 25 % |

NASEM 2016 añade **400 kg** para animales sin marmoleo (22 % EBF), manteniendo 478/462/435 ([TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)). `FSBW` = peso desbastado final real al punto de grasa elegido (o peso a la madurez para vaquillas de reemplazo; peso maduro × 0.6 para toros) ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).

**BR-CORTE (Eq. 8.18):** \[ EQEBW = \frac{EBW}{MEBW} \times SREBW, \qquad SREBW = 517\ \text{kg} \]

Pesos a la madurez (Tabla 8.5, [BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)):

| Grupo genético | Sexo | EBW madurez (kg) | SBW (kg) | BW (kg) |
|---|---|---|---|---|
| Zebú | Toros | 517 | 585 | 595 |
| Zebú | Novillos | 433 | 477 | 487 |
| Zebú | Vaquillas | 402 | 439 | 449 |
| Cruza carne | Toros | 560 | 631 | 642 |
| Cruza carne | Novillos | 482 | 535 | 546 |
| Cruza carne | Vaquillas | 417 | 457 | 467 |
| Cruza lechera | Toros | 616 | 692 | 708 |
| Cruza lechera | Novillos | 532 | 588 | 602 |
| Cruza lechera | Vaquillas | 493 | 535 | 548 |

El SREBW pasó de 440 kg (BR-CORTE 2010) a 517 kg = EBW de madurez del toro Nelore ([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)).

> **Para Santa Cruz:** un Nelore entero se compara contra MEBW = 517; un Angus × Brahman entero contra 560; novillo Nelore contra 433. Esto es lo que evita que el modelo "engorde" un cebú como si fuera un taurino grande.

---

## B. ENERGÍA DEL ANIMAL

### B.1 — Ítem 5: Energía neta de mantenimiento (NEm)

**NRC 1996 (ecuación completa Level 1):**

\[ NE_m = SBW^{0.75} \times \left[ (a_1 \times BE \times L \times COMP) + a_2 \right] \]

\[ a_1 = 0.077\ \text{Mcal}/SBW^{0.75};\qquad a_2 = 0.0007 \times (20 - T_p) \]

\[ COMP = 0.8 + \left[(CS - 1) \times 0.05\right];\qquad L = 1.0\ \text{(seca)},\ 1.2\ \text{(lactando)};\qquad SEX = 1.15\ \text{(toros)} \]

([NRC96 cap. 10](https://nap.nationalacademies.org/resource/beef/beef10.pdf))

| Símbolo | Definición | Unidad |
|---|---|---|
| NEm | requerimiento de energía neta de mantenimiento | Mcal/d |
| SBW^0.75 | peso metabólico desbastado | kg^0.75 |
| a1 | coeficiente base de mantenimiento | Mcal/(kg^0.75·d) |
| BE | factor de raza (Tabla 10-1) | adimensional |
| L | factor de lactancia | adimensional |
| COMP | efecto del plano nutricional previo | adimensional |
| CS | condición corporal (escala 1–9) | — |
| a2 | ajuste por temperatura previa | Mcal/(kg^0.75·d) |
| Tp | temperatura media del mes previo | °C |

**Factores de raza BE (NRC96 Tabla 10-1; orden inferido del OCR — verificar):** Angus 1.00, Braford 0.95, **Brahman 0.90**, Brangus 0.95, Braunvieh 1.20, Charolais 1.00, Chianina 1.00, Devon 1.00, Galloway 1.00, Gelbvieh 1.20, Hereford 1.00, Holstein 1.20, Jersey 1.20, Limousin 1.00, Longhorn 1.00, Maine Anjou 1.00, **Nellore 0.90**, Piedmontese 1.00, Pinzgauer 1.00, Polled Hereford 1.00, Red Poll 1.00, **Sahiwal 0.90**, Salers 1.00, Santa Gertrudis 0.95, Shorthorn 1.00, Simmental 1.20, South Devon 1.00, Tarentaise 1.00 ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)). El rango 0.9 (Brahman) – 1.2 (Holstein) está confirmado de forma independiente en la revisión de [Animals / PMC8229771](https://pmc.ncbi.nlm.nih.gov/articles/PMC8229771/) y en una tesis de UNL que cita NRC (1984): Angus/británicos 1.0, Simmental/lecheras 1.2, **Bos indicus 0.9** ([UNL, Model Development…](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1088&context=animalscidiss)).

**NASEM 2016:** \( NE_m = 0.077 \times SBW^{0.75} \) (Mcal/d) para novillos y vaquillas *Bos taurus*; **+15 % en toros**; **−10 % en cebuinos excepto Nelore** (≈ 0.069 Mcal/SBW^0.75) ([TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)). BR-CORTE describe exactamente esto: "NASEM (2016) changed … 77 kcal/EBW^0.75/d … to 77 kcal/SBW^0.75/d and also recommended a 15 % increase in the NEm for bulls. It was also suggested that Zebu animals, **except for Nellore**, would have NEm requirements approximately 10 % lower … around 69 kcal/SBW^0.75/d" ([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)). En unidades SI, NASEM 2016 = `NEm (MJ/d) = 0.00293 (20 − Tp) + 0.322 SBW^0.75` ([PMC8229771](https://pmc.ncbi.nlm.nih.gov/articles/PMC8229771/)).

**BR-CORTE (2016 y 2023) — el valor clave para el trópico:**

\[ \boxed{NE_m = 0.075 \times EBW^{0.75}\ \text{Mcal/d} \;=\; 75\ \text{kcal}/EBW^{0.75}/d} \]

- **Sin efecto de sexo, sin efecto de grupo genético, igual en confinamiento y en pastoreo** ([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf), [BRC16 cap. 7](https://brcorte.com.br/assets/book2016/en/c7.pdf)).
- Se obtiene del modelo de producción de calor: \( HP = \beta_0 \times e^{\beta_1 \times MEI} \) con \(\beta_0 = 0.0749\) Mcal/EBW^0.75/d, y NEm = HP a MEI = 0 (Eq. 8.6–8.10).
- En SI: `NEm = 0.314 × EBW^0.75 MJ/d` ([PMC8229771](https://pmc.ncbi.nlm.nih.gov/articles/PMC8229771/)).

**Coeficientes de producción de calor β1 por genotipo (Eq. 8.7–8.10, [BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)):**

| Genotipo / sistema | Ecuación | β1 | MEm resultante |
|---|---|---|---|
| Zebú (Nelore), confinamiento | HP = 0.0749 × e^(3.8684 × MEI) | 3.8684 | **118 kcal/EBW^0.75/d** |
| Cruza de corte, confinamiento | HP = 0.0749 × e^(4.0612 × MEI) | 4.0612 | **124 kcal/EBW^0.75/d** |
| Cruza lechera, confinamiento | HP = 0.0749 × e^(4.1487 × MEI) | 4.1487 | **125 kcal/EBW^0.75/d** |
| Zebú, pastoreo | HP = 0.0749 × e^(4.1986 × MEI) | 4.1986 | **128 kcal/EBW^0.75/d** (km 8.5 % menor) |

> **Respuesta explícita al punto del brief:** BR-CORTE **no** publica un NEm distinto para Nelore vs cruzado; publica el **mismo NEm (75 kcal/EBW^0.75)** y traslada la diferencia genotípica a la **eficiencia km** y al **MEm**: Nelore 118, cruzado de corte 124, cruzado lechero 125 kcal/EBW^0.75/d (pastoreo 128). Es decir, en términos de energía metabolizable el Nelore requiere ~5 % menos que el cruzado de corte y ~6 % menos que el cruzado lechero. Literalmente: "Bos taurus indicus animals would be more efficient than crossbred beef cattle, which would be more efficient than crossbred dairy cattle" ([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)).

**Eficiencias (BR-CORTE, Eq. 8.12/8.16, 8.28, 8.31):**

\[ k_m = \left[0.513 + (0.173 \times k_g) + (\beta_2 \times EBG)\right] \times \theta \]
\[ \beta_2 = 0.100\ \text{Zebú};\ 0.073\ \text{cruza carne};\ 0.010\ \text{cruza lechera};\qquad \theta = 1\ \text{(confinamiento)},\ 0.92\ \text{(pastoreo)} \]
\[ k_g = \frac{0.327}{0.539 + RE_p}, \qquad RE_p = 1.140 \times \left(\frac{RE}{EBG}\right)^{-1.137} \]

donde REp = proporción de la energía retenida como proteína ([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)).

*Cuál usar en Bolivia:* **BR-CORTE**. Está calibrado con Nelore y cruzas en clima tropical, usa EBW (no SBW) y hace depender km de la composición de la ganancia. NASEM 2016 es adecuado como respaldo para Angus puro y para los ajustes que BR-CORTE no publica.

### B.2 — Ítem 6: Ajustes del mantenimiento

Todos los ajustes numéricos disponibles provienen de NRC96/NRC2000; **BR-CORTE declina publicar ajustes térmicos propios y remite al NRC** (usa el mismo `0.0007 Mcal/kg^0.75` por °C respecto de 20 °C) ([BRC16 cap. 7](https://brcorte.com.br/assets/book2016/en/c7.pdf)).

**(a) Plano nutricional previo / condición corporal (NRC96):**
\[ COMP = 0.8 + \left[(CS - 1) \times 0.05\right] \]
CS = condición corporal 1–9; multiplica a `a1 × BE × L` ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).

**(b) Temperatura previa (aclimatación), NRC96/NASEM16:**
\[ a_2 = 0.0007 \times (20 - T_p)\ \text{Mcal}/SBW^{0.75}/d \]
Tp = temperatura media del mes anterior (°C). En Santa Cruz Tp ≈ 25–28 °C → a2 ≈ −0.0035 a −0.0056, es decir **reduce** el mantenimiento ~5–7 % respecto de 20 °C ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf); forma SI en [PMC8229771](https://pmc.ncbi.nlm.nih.gov/articles/PMC8229771/)).

**(c) Estrés calórico agudo (jadeo), NRC96:**
\[ NE_{m,ht} = NE_m \times \begin{cases} 1.07 & \text{jadeo rápido y superficial} \\ 1.18 & \text{jadeo con boca abierta} \end{cases} \quad (T \ge 30^\circ C) \]
([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)). *Este es el ajuste crítico para Santa Cruz de la Sierra en la época cálida.*

**(d) Estrés por frío (NRC96, cadena completa):**
\[ SA = 0.09 \times BW^{0.67} \]
\[ EI = (7.36 - 0.296 \times WIND + 2.55 \times HAIR) \times MUD2 \times HIDE \]
\[ TI = \begin{cases} 2.5 & \text{edad} \le 30\ d\\ 6.5 & 31\text{–}183\ d\\ 5.1875 + 0.3125 \times CS & 184\text{–}363\ d\\ 5.25 + 0.75 \times CS & > 363\ d \end{cases} \]
\[ IN = TI + EI; \qquad LCT = 39 - (IN \times HE \times 0.85); \qquad ME_{cs} = \frac{SA \times (LCT - T_c)}{IN} \]
con km ≈ 0.576 asumido para convertir ME de estrés frío a NE ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).

| Símbolo | Definición | Unidad |
|---|---|---|
| SA | superficie corporal | m² |
| EI | aislamiento externo (pelo + capa de aire) | °C·m²·d/Mcal |
| TI | aislamiento tisular | °C·m²·d/Mcal |
| WIND | velocidad del viento | km/h |
| HAIR | profundidad efectiva del pelaje | cm |
| MUD2, HIDE | factores de barro y de cuero | adimensional |
| LCT | temperatura crítica inferior | °C |
| Tc | temperatura actual | °C |
| HE | producción de calor | Mcal/m²/d |
| MEcs | ME extra por estrés frío | Mcal/d |

*Para el Chaco/Santa Cruz: relevante solo en los "surazos" (frentes fríos de invierno), sobre todo con animales mojados y barro.*

**(e) Actividad / pastoreo (NRC96):**
\[ NE_{m,act} = \left[ \left(0.006 \times p_1 \times \left(0.9 - \frac{TDN_p}{100}\right)\right) + \left(\frac{0.05 \times TERRAIN}{(0.002471 \times pAVAIL) + 3}\right) \right] \times \frac{BW}{4.184} \]
p1 = consumo de MS en pastoreo (kg/d); TDNp = TDN de la pastura (%); TERRAIN = 1 plano, 2 ondulado; pAVAIL = masa de forraje disponible (T/ha) ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).

**Equivalente BR-CORTE (pastoreo):** el sistema brasileño no aplica un término de actividad separado; lo absorbe con θ = 0.92 sobre km (MEm 128 vs 118 kcal/EBW^0.75/d). Cita además costos de CSIRO: **0.62 kcal/km** de desplazamiento horizontal, **6.69 kcal/km** vertical, e ingestión `ME (MJ) = 0.0025 × DMIp × (0.9 − DMDp)`, con un incremento típico de 10–20 % del mantenimiento en pastoreo ([BRC16 cap. 7](https://brcorte.com.br/assets/book2016/en/c7.pdf)).

**(f) Lactancia:** L = 1.2 para vacas lactando (NRC96, arriba). BR-CORTE no publica factor L para engorde.

### B.3 — Ítem 7: Energía retenida / NE de ganancia (RE = NEg)

**NRC 1996 / NASEM 2016:**
\[ RE = 0.0635 \times EQEBW^{0.75} \times EBG^{1.097} \]
([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf); idéntica en NASEM 2016 según [TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108) y [BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)).

**BR-CORTE (Eq. 8.19–8.21):**
\[ NE_g = 0.061 \times EQEBW^{0.75} \times EBG^{1.035} \quad \text{(confinamiento)} \]
\[ NE_g = 0.052 \times EQEBW^{0.75} \times EBG^{1.062} \quad \text{(pastoreo)} \]
([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf))

Opción alternativa por ganancia de carcasa (Eq. 8.25–8.26): `EBG = 0.044 + 1.47 × CG`; `NEg = 0.082 × EQEBW^0.75 × CG^0.777`, pero BR-CORTE **recomienda las Eq. 8.20/8.21** ([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf)).

| Símbolo | Definición | Unidad |
|---|---|---|
| RE / NEg | energía retenida = requerimiento de EN para ganancia | Mcal/d |
| EQEBW | peso vacío equivalente | kg |
| EBG | ganancia de peso vacío | kg/d |
| CG | ganancia de carcasa | kg/d |

*Comparación:* a igual EQEBW y EBG, BR-CORTE predice ~4 % menos energía retenida que NRC (0.061 vs 0.0635) y una respuesta menos que proporcional a la ganancia (exponente 1.035 vs 1.097) — consistente con canales cebuinas más magras. **Para Nelore/Brahman usar 0.061 (confinamiento) y 0.052 (pastoreo).**

### B.4 — Ítem 8: Inversa — ADG a partir de la energía disponible para ganancia

**NRC 1996 / NASEM 2016:**
\[ EBG = 12.341 \times EQEBW^{-0.6837} \times RE^{0.9116} \]
luego \( ADG = EBG / 0.956 \) ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).

**BR-CORTE (Eq. 8.22):**
\[ EBG = 14.914 \times NE_g^{0.9662} \times EQEBW^{-0.7246} \]
luego \( ADG = (EBG / 0.9630)^{1/1.0151} \) invirtiendo la Eq. 1.12 ([BRC23 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf) y [cap. 1](https://brcorte.com.br/assets/book2023/en/01.pdf)).

### B.5 — Ítem 9: Implantes anabólicos e ionóforos

| Efecto | Valor | Fuente |
|---|---|---|
| Ionóforo — ajuste multiplicativo al **valor energético de la dieta** al calcular NEm y NEg | **ADTV = 1.12** con ionóforo; 1.0 sin ionóforo | "ADTV is 1.12 for diets containing ionophores, otherwise 1.0" ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)); reiterado como ajuste NRC (2000) de 1.12 vs 1.0 en [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1088&context=animalscidiss) |
| Ionóforo — efecto sobre el consumo | −10 % con 33 mg monensina/kg MS; −6 % con 22 mg/kg; −4 % con 31 mg/kg en dieta 90 % concentrado; lasalocida −2 % | [NRC 2000, cap. 7](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html) |
| Ionóforo — factor de tabla del NRC96 para DMI (ADTV en Tabla 10-4) | 1.00 sin aditivo / **0.94** con aditivo (orden inferido del OCR — verificar) | [NRC96 Tabla 10-4](https://nap.nationalacademies.org/resource/beef/beef10.pdf) |
| Ionóforo — práctica recomendada | aplicar **ambos** ajustes: +12 % a la NEm de la dieta y −4 % al DMI predicho | [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1088&context=animalscidiss) |
| Ionóforo — efecto productivo (metaanálisis citado) | +6.4 % eficiencia de conversión | [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1088&context=animalscidiss) |
| Implante — consumo | +4 a +16 % de DMI con implante estradiol/progesterona; NRC sugiere **reducir 8 % el DMI predicho en animales NO implantados** | [NRC 2000, cap. 7](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html) |
| Implante — tamaño maduro / punto final de engrase | los implantados llegan al 28 % de grasa corporal a **579–597 kg** vs **546 kg** los testigos; otros trabajos: implantados 40–85 kg y 25–45 kg más pesados a igual grasa/espesor de grasa | [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1088&context=animalscidiss) |
| Implante — ajuste de ganancia usado con el sistema NRC | **+5 % en la ganancia energética (EG)**; +4.2 % en síntesis proteica en el modelo alternativo | [UNL](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1088&context=animalscidiss) |
| Implante — multiplicador oficial explícito publicado en NRC 1996 Tabla 10-4 para ADG/energía | `n.a.` — el capítulo 10 solo documenta el ADTV de consumo; se intentó NRC96 cap. 10, NRC 2000 texto completo, NCBI Bookshelf NBK232316 y búsquedas específicas | — |

**Implementación práctica recomendada:** para animales implantados **elevar el FSBW (peso final al punto de grasa)** en ~30–50 kg en lugar de aplicar un multiplicador ad hoc a la ganancia; esto es coherente con el mecanismo documentado (mayor tamaño maduro) y actúa automáticamente vía EQSBW/EQEBW. BR-CORTE no publica ajustes por implante ni por ionóforo.

---

## C. ENERGÍA DEL ALIMENTO (Sistema de Energía Neta de California)

### C.1 — Ítem 10: DE a partir de TDN
\[ DE\ (\text{Mcal/kg MS}) = \frac{TDN\,(\%)}{100} \times 4.409 \]
NRC96 lo escribe como parte de `ME = 0.001 × TDNapp × 4.409 × 0.82` ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)). NASEM lo usa invertido: `TDN = DE / 4.4` ([TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)); BR-CORTE también adopta `TDN = DE/4.4` ([BRC16 cap. 7](https://brcorte.com.br/assets/book2016/en/c7.pdf)). Confirmación independiente del uso operativo: `ME (Mcal/kg) = TDN × 4.409 × 0.82` ([Translational Animal Science / PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/)).

### C.2 — Ítem 11: ME a partir de DE y descuento por nivel de consumo
**NRC/NASEM:** \[ ME = 0.82 \times DE \] ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf); [TAS](https://academic.oup.com/tas/article/3/3/991/5523108)).

**BR-CORTE (propia, en Mcal/kg MS):** \[ ME = 0.9455 \times DE - 0.3032 \] ([BRC16 cap. 7](https://brcorte.com.br/assets/book2016/en/c7.pdf)). Esta relación entrega ME/DE ≈ 0.82 solo alrededor de DE ≈ 2.4–3.2 Mcal/kg y es más baja en dietas de alta energía; **es la apropiada para dietas tropicales con caña/silo de maíz + concentrado**.

**Descuento por nivel de consumo (Weiss/NRC 2001, aplicable a los TDN de tabla):**
\[ \text{Discount} = \frac{TDN_{1X} - \left[\left((0.18 \times TDN_{1X}) - 10.3\right) \times Intake\right]}{TDN_{1X}} \]
Sin descuento por debajo de 60 % de TDN1X. Luego `DEp = DE × Discount` y
\[ ME_p = (1.01 \times DE_p - 0.45) + 0.0046 \times (EE - 3) \]
([Weiss / NRC 2001, p.104–105](https://www.foragelab.com/media/nrc2001.pdf)), donde `Intake` = múltiplo del mantenimiento (×M) y EE = extracto etéreo (% MS).

### C.3 — Ítem 12: NEm de la dieta a partir de ME (cúbica de Garrett)
\[ NE_m\ (\text{Mcal/kg MS}) = 1.37\,ME - 0.138\,ME^2 + 0.0105\,ME^3 - 1.12 \]
\[ k_m = \frac{NE_m}{ME} = \frac{1.37\,ME - 0.138\,ME^2 + 0.0105\,ME^3 - 1.12}{ME} \]
([BR-CORTE 2023 Eq. 8.15, citando NRC 2000 / NASEM 2016](https://brcorte.com.br/assets/book2023/en/08.pdf); forma de km en [TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108); forma operativa idéntica citada en [PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/)).

### C.4 — Ítem 13: NEg de la dieta a partir de ME
\[ NE_g\ (\text{Mcal/kg MS}) = 1.42\,ME - 0.174\,ME^2 + 0.0122\,ME^3 - 1.65 \]
\[ k_g = \frac{NE_g}{ME} \]
([BR-CORTE 2023 Eq. 8.32 citando NRC/NASEM](https://brcorte.com.br/assets/book2023/en/08.pdf); [TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)). *Nota:* [PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/) transcribe el segundo término con signo "+"; la forma correcta (coherente con NRC/NASEM y con BR-CORTE) es **−0.174 ME²**.

ME se expresa en Mcal/kg MS. Rango válido práctico: ME 1.8–3.2 Mcal/kg.

### C.5 — Ítem 14: TDN sumativa de Weiss (NRC 2001)
Todas de [foragelab.com/media/nrc2001.pdf](https://www.foragelab.com/media/nrc2001.pdf):

\[ tdCP_{\text{forrajes}} = CP \times e^{\left(-0.012 \times \frac{ADICP}{CP}\right)} \]
\[ tdCP_{\text{concentrados}} = \left(1 - 0.04 \times \frac{ADICP}{CP}\right) \times CP \]
\[ tdNFC = 0.98 \times \left[100 - \left((NDF - NDICP) + CP + EE + Ash\right)\right] \times PAF \]
\[ tdFA = FA \qquad ; \qquad tdEE = EE - 1 \]
\[ tdNDF = 0.75 \times \left[(NDF - NDICP) - Lignin\right] \times \left[1 - \left(\frac{Lignin}{NDF - NDICP}\right)^{0.667}\right] \]
\[ TDN_{1X}\ (\%) = tdCP + tdNFC + (2.25 \times tdFA) + tdNDF - 7 \]
\[ DE_{1X}\ (\text{Mcal/kg}) = 0.042\,tdNFC + 0.056\,tdCP + 0.094\,tdEE + 0.042\,tdNDF - 0.3 \]

| Símbolo | Definición | Unidad |
|---|---|---|
| CP | proteína bruta | % MS |
| ADICP / NDICP | PB insoluble en detergente ácido / neutro | % MS |
| NDF | fibra detergente neutro | % MS |
| EE | extracto etéreo | % MS |
| FA | ácidos grasos (≈ EE − 1) | % MS |
| Ash | cenizas | % MS |
| PAF | factor de ajuste del procesamiento (1.0 por defecto) | — |
| −7 | corrección por MS fecal metabólica | puntos porcentuales |

*Uso en el trópico:* imprescindible para caña de azúcar, silo de sorgo, heno de Brachiaria y afrecho de soya locales, donde los TDN de tabla NRC no aplican. **Precaución:** el término lignina/NDF hace que forrajes tropicales muy lignificados reciban tdNDF muy bajo — es el comportamiento correcto, no un error.

---

## D. CONSUMO DE MATERIA SECA (DMI)

### D.1 — Ítem 15: DMI NRC 1996 / NASEM 2016

**NRC 1996 (terneros en crecimiento):**
\[ DMI = \frac{SBW^{0.75} \times \left(0.2435\,NE_{m} - 0.0466\,NE_{m}^2 - 0.1128\right)}{NE_{m}} \times BFAF \times BI \times ADTV \times TEMP1 \times MUD1 \]

**NRC 1996 (novillos/vaquillas "yearling"):** idéntica pero con la constante **−0.0869** en lugar de −0.1128.

**Vacas secas:** \( DMI = \frac{0.04997\,NE_m^2 + 0.03840}{NE_m} \times SBW^{0.75} \); **preñadas:** \( \frac{0.04997\,NE_m^2 + 0.04631}{NE_m} \times SBW^{0.75} \).

Si la NEm de la dieta es < 1.0 Mcal/kg, usar **0.95** como divisor en lugar de NEm ([NRC96 cap. 10](https://nap.nationalacademies.org/resource/beef/beef10.pdf); confirmado para NASEM en [TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)).

| Símbolo | Definición | Unidad |
|---|---|---|
| DMI | consumo de materia seca | kg/d |
| NEm (en la fórmula) | **concentración** de NEm de la dieta | Mcal/kg MS |
| SBW^0.75 | peso metabólico | kg^0.75 |

**NASEM 2016** añade dos alternativas ([TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)):
\[ DMI\ (\%\,SBW) = 1.2425 + 1.9218\,k_m - 0.7259\,k_m^2 \;\Rightarrow\; DMI = \frac{(1.2425 + 1.9218\,k_m - 0.7259\,k_m^2) \times SBW}{100} \]
(Anele et al., 2014), y para dietas de alto grano (McMeniman):
\[ DMI_{\text{novillos}} = 3.83 + 0.0143 \times iSBW; \qquad DMI_{\text{vaquillas}} = 3.184 + 0.01536 \times iSBW \]
con iSBW = peso desbastado inicial (kg).

> Advertencia validada: "as feedlot steers get heavier (>500 kg SBW), current predictive equations overpredict DMI" ([PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/)).

### D.2 — Ítem 16: Multiplicadores del DMI (NRC 1996, Tabla 10-4)
Fuente: [NRC96 Tabla 10-4](https://nap.nationalacademies.org/resource/beef/beef10.pdf).

| Factor | Nivel | Multiplicador |
|---|---|---|
| **BI** (raza) | Holstein | 1.08 |
| | Holstein × carne | 1.04 |
| | Razas de carne (base) | 1.00 |
| **BFAF** (grasa corporal vacía) | 21.3 % (hasta 350 kg EQW) | 1.00 |
| | 23.8 % (400 kg EQW) | 0.97 |
| | 26.5 % (450 kg EQW) | 0.90 |
| | 29.0 % (500 kg EQW) | 0.82 |
| | 31.5 % (550 kg EQW) | 0.73 |
| **ADTV** (aditivo/implante) | sin estimulante anabólico / sin aditivo | 1.00 |
| | con aditivo (ionóforo) | 0.94 *(orden inferido del OCR — verificar)* |
| **TEMP1** (temperatura) | > 35 °C, **sin** enfriamiento nocturno | **0.65** |
| | > 35 °C, **con** enfriamiento nocturno | **0.90** |
| | 25 a 35 °C | **0.90** |
| | 15 a 25 °C | 1.00 |
| | 5 a 15 °C | 1.03 |
| | −5 a 5 °C | 1.05 |
| | −15 a −5 °C | 1.07 |
| | < −15 °C | 1.16 |
| **MUD1** (barro) | sin barro | 1.00 |
| | leve (10–20 cm) | 0.85 |
| | severo (30–60 cm) | 0.70 |

**Ajuste por disponibilidad de forraje en pastoreo (NRC96):**
\[ p_1 = GRAZE \times DMI; \qquad FA = \frac{1000 \times GU \times IPM}{SBW \times N \times DOP} \]
\[ \text{Si } FA > 4 \times DMI \text{ o } IPM > 1150\ \text{kg/ha} \Rightarrow GRAZE = 1.0 \]
\[ \text{si no: } GRAZE = \frac{(0.17 \times IPM) - 0.000074 \times IPM^2 + 2.4}{100} \]
IPM = masa inicial de pastura (kg MS/ha), GU = tamaño del potrero (ha), N = nº de animales, DOP = días de pastoreo ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).

**Implantes/ionóforos sobre el consumo:** ver ítem 9 (−8 % si NO implantado; −4 a −10 % por monensina según dosis) ([NRC 2000](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html)).

**Período de adaptación:** `n.a.` — no se encontró un multiplicador publicado de adaptación/*step-up* en NRC96 cap. 10, NRC 2000 ni BR-CORTE 2016/2023. Se intentó: búsqueda en beef10.pdf, texto completo NRC 2000, BRC16 c2, BRC23 c2. Práctica de campo (no citable aquí): limitar el DMI durante 14–21 días de transición.

> **Para Santa Cruz esto es decisivo:** con máximas > 35 °C y sin enfriamiento nocturno, TEMP1 = 0.65 recorta el consumo un 35 %. Un motor que ignore TEMP1 sobreestimará sistemáticamente la ganancia en la época cálida.

### D.3 — Ítem 17: DMI BR-CORTE (Nelore y cruzados) — **preferido para el trópico**

**Confinamiento (BR-CORTE 2023, Eq. 2.1–2.3, [cap. 2](https://brcorte.com.br/assets/book2023/en/02.pdf)):**
\[ \text{Zebú: } DMI = -2.1948 + 0.08338\,BW^{0.75} + 3.9328\,ADG - 0.9030\,ADG^2 \]
\[ \text{Cruza de corte: } DMI = -0.6273 + 0.06453\,BW^{0.75} + 3.871\,ADG - 0.614\,ADG^2 \]
\[ \text{Cruza lechera: } DMI = -2.8836 + 0.08435\,BW^{0.75} + 4.5145\,ADG - 0.9631\,ADG^2 \]

**Con nivel de concentrado conocido (Eq. 2.4–2.5):**
\[ \text{Zebú: } DMI = -1.303 + 0.0029\,CL - 0.00005\,CL^2 + 0.0843\,BW^{0.75} + 2.243\,ADG - 0.271\,ADG^2 \]
\[ \text{Cruza de corte: } DMI = -4.8196 + 0.0081\,CL - 0.00011\,CL^2 + 0.1239\,BW^{0.75} + 2.8189\,ADG - 0.775\,ADG^2 \]

**Pastoreo con suplemento (Eq. 2.6–2.7):**
\[ \text{Zebú: } DMI = -0.4684 + 0.7732\,DMI_s + 0.0742\,BW^{0.75} + 0.7953\,ADG - 0.9047\,ADG^2 \quad (R^2=0.638) \]
\[ \text{Cruza lechera: } DMI = 0.9951 + 0.7732\,DMI_s + 0.0742\,BW^{0.75} + 0.7953\,ADG - 0.9047\,ADG^2 \quad (R^2=0.624) \]

| Símbolo | Definición | Unidad |
|---|---|---|
| DMI | consumo total de materia seca | kg/d |
| BW^0.75 | peso vivo metabólico medio del período | kg^0.75 |
| ADG | ganancia diaria esperada | kg/d |
| CL | nivel de concentrado en la dieta | % de la MS total |
| DMIs | consumo de MS del suplemento | kg/d |

**Versiones 2016 (todavía citadas en el motor si se usa BR-CORTE 4.0):** Zebú `DMI = −1.7824 + 0.07765 BW^0.75 + 4.0415 ADG − 0.8973 ADG²`; cruza de corte `−0.6273 + 0.06453 BW^0.75 + 3.871 ADG − 0.614 ADG²`; pastoreo Zebú `−1.912 + 0.900 SI + 0.094 BW^0.75 + 1.070 ADG − 1.395 ADG²` ([BRC16 cap. 2](https://brcorte.com.br/assets/book2016/en/c2.pdf)). Versiones 2010: Zebú `−2.7878 + 0.08789 BW^0.75 + 5.0487 ADG − 1.6835 ADG²`; cruzados `−2.6098 + 0.08844 BW^0.75 + 4.4672 ADG − 1.3579 ADG²` ([BRC23 cap. 2](https://brcorte.com.br/assets/book2023/en/02.pdf)).

> **Ojo con la circularidad:** las ecuaciones BR-CORTE de DMI toman ADG como *entrada*. Para predecir la ganancia hay que iterar (ver IMPLEMENTATION NOTES).

### D.4 — Ítem 18: Techo de consumo como % del peso vivo

| Regla | Valor | Fuente |
|---|---|---|
| Vaca adulta lactando + ternero | **2.5 % del PV/d** (NASEM 2016) | [NMSU B-231](https://pubs.nmsu.edu/_b/B231/) |
| Vaca adulta, según calidad de dieta | 1–3 % del PV | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/DryMatterIntake.pdf) |
| Dietas de alto grano (limit-feeding) | 1.0–1.5 % del PV | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/DryMatterIntake.pdf) |
| Heno de baja / media / alta calidad | 1.0–2.0 / 1.5–2.5 / 2.2–3.3 % del PV | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/DryMatterIntake.pdf) |
| Pasto verde | 2.0–3.0 % del PV | [Iowa Beef Center](https://www.iowabeefcenter.org/bch/DryMatterIntake.pdf) |

**Implementación sugerida:** aplicar `DMI = min(DMI_predicho, 0.030 × BW)` como techo duro en crecimiento a pasto y `min(DMI_predicho, 0.025 × BW)` en terminación con alto concentrado. No existe un techo % PV publicado en NRC96/BR-CORTE como ecuación formal: en esos sistemas el techo emerge del término cuadrático en NEm (NRC) o en ADG (BR-CORTE).

---

## E. PROTEÍNA

### E.1 — Ítem 19: Proteína metabolizable de mantenimiento (MPm)

**NRC 1996 / NASEM 2016:** \[ MP_{maint}\ (\text{g/d}) = 3.8 \times SBW^{0.75} \] ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf); confirmado para NASEM 2016 en [TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108); explicado en [AFMG/Alberta, Protein Requirements of Feedlot Cattle](http://agromedia.ca/AFMG/Section%201%20Nutrition%20&%20Management/1M1%20Protein%20Requirements%20of%20Feedlot%20Cattle.pdf)).

**Desglose escurf / urinario / fecal metabólico:** el modelo de carne **Level 1 no lo desagrega**: publica un único coeficiente agregado de 3.8 g/SBW^0.75 que ya incluye las pérdidas endógenas. NRC 2000 declara en su prólogo que "a maintenance requirement for protein, based on metabolic and endogenous losses of nitrogen, is proposed" ([NRC 2000](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html)), pero los coeficientes individuales del desglose son imágenes en esa edición. **Coeficientes separados de escurf, N urinario endógeno y proteína fecal metabólica: `n.a.`** — se intentó beef10.pdf (cap. 10 corregido), texto completo NRC 2000, NCBI Bookshelf NBK232316 y búsquedas dirigidas. Para el motor, usar 3.8 g/SBW^0.75 como valor único.

**BR-CORTE (2016 y 2023):**
\[ MP_m = 3.96\ \text{g}/EBW^{0.75}/d \quad \text{(confinamiento)}; \qquad MP_m = 4.31\ \text{g}/EBW^{0.75}/d \quad \text{(pastoreo)} \]
derivados de las regresiones `MPI = 285.35 + 400.05 × EBG` (confinamiento) y `MPI = 270.53 + 532.46 × EBG` (pastoreo) ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf)). BR-CORTE 2023 re-estima 3.91 g/EBW^0.75 para Nelore y cruzados y **mantiene 3.96 (confinamiento) y 4.31 (pastoreo)**; los animales en pastoreo requieren ~8.0 % más MPm ([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)). Expresado sobre SBW equivale a ≈3.6 y ≈3.9 g/SBW^0.75 ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf)).

### E.2 — Ítem 20: Proteína neta de ganancia (NPg)

**NRC 1996 / NASEM 2016:**
\[ NP_g\ (\text{g/d}) = SWG \times \left(268 - 29.4 \times \frac{RE}{SWG}\right) \]
([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)). *Errata NASEM 2016:* en el capítulo 12 (Eqs. 12-2/12-3) RE debe entrar en **Mcal por kg de ganancia** (RE Mcal/d ÷ EBG kg/d) y la composición de la ganancia en base cuerpo vacío ([errata oficial NASEM](https://nap.nationalacademies.org/resource/19014/Beef%20Cattle%20errata%20sheet2.pdf)).

**BR-CORTE 2016/2023 — por genotipo y sexo** ([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)), con NPg en g/d, EBG en kg/d y RE en Mcal/d:

| Grupo | Sexo | Ecuación |
|---|---|---|
| Zebú | Toros | NPg = 210.09 EBG − 10.01 RE |
| Zebú | Novillos | NPg = 153.13 EBG − 2.53 RE |
| Zebú | Vaquillas | NPg = 193.90 EBG − 12.16 RE |
| Cruza carne | Toros | NPg = 281.77 EBG − 27.66 RE |
| Cruza carne | Novillos | NPg = 219.94 EBG − 12.04 RE |
| Cruza carne | Vaquillas | NPg = 174.65 EBG − 3.14 RE |
| Cruza lechera | Toros | NPg = 171.43 EBG − 3.08 RE |
| Cruza lechera | Novillos | NPg = 236.36 EBG − 19.84 RE |
| Cruza lechera | Vaquillas | NPg = 206.58 EBG − 15.39 RE |
| Zebú, pastoreo | Toros | NPg = 181.43 EBG − 2.88 RE |

**Modelo general nuevo (BR-CORTE 2023, Costa e Silva et al. 2020):**
\[ NP_g = 176.01 \times EBG - 6.239 \times RE \;\;\Longrightarrow\;\; NP_g = 176.01 \times EBG - 0.381 \times EQEBW^{0.75} \times EBG^{1.035} \]
(sustituyendo RE por la Eq. 8.20) ([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)). **Esta forma simplificada es la más conveniente para un motor de software**, porque elimina la dependencia explícita de RE.

### E.3 — Ítem 21: Eficiencia MP → NP (k)

**NRC 1996 / NASEM 2016:**
\[ \text{Si } EQSBW \le 300\ \text{kg}: \quad MP_g = \frac{NP_g}{0.834 - 0.00114 \times EQSBW} \]
\[ \text{Si } EQSBW > 300\ \text{kg}: \quad MP_g = \frac{NP_g}{0.492} \]
([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)). BR-CORTE describe la misma función NRC 2000 como `k = 83.4 − 0.114 × EQEBW` (%) con piso 0.492 ([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)).

**BR-CORTE (2016 y 2023):**
\[ k\,(\%) = 84.665 - 0.1179 \times EQEBW \quad \text{si } SBW < 340\ \text{kg} \]
\[ k = 47.4\,\% \quad \text{si } SBW \ge 340\ \text{kg} \]
\[ MP_g = \frac{NP_g}{k} \]
([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf); ejemplo trabajado del propio libro: `MPg = 214.2 / 0.474 = 451.9 g/d`).

### E.4 — Ítem 22: Proteína microbiana (MCP)

**NRC 1996 / NASEM 2016:**
\[ MCP\ (\text{g/d}) = 0.13 \times TDN\ (\text{g/d}) \times eNDF_{adj} \]
\[ eNDF_{adj} = 1.0 \ \text{si eNDF} > 20\%\ \text{MS};\quad \text{si no } = 1.0 - \left[(20 - eNDF) \times 0.025\right] \]
\[ MP_{bact} = MCP \times 0.80\ (\text{proteína verdadera}) \times 0.80\ (\text{digestibilidad}) = MCP \times 0.64 \]
([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)). La eficiencia microbiana del 13 % del TDN y el 80 %/80 % están confirmados en [Waterman et al., J. Anim. Sci. 2014 (USDA-ARS)](https://www.ars.usda.gov/arsuserfiles/30300500/Publications/Uploaded1272012/J%20ANIM%20SCI-2014-Waterman-2785-99.pdf) y en [AFMG Alberta](http://agromedia.ca/AFMG/Section%201%20Nutrition%20&%20Management/1M1%20Protein%20Requirements%20of%20Feedlot%20Cattle.pdf) ("80 % true protein × 80 % absorbed = 64 %"). Requisitos mínimos de eNDF (NRC96 Tabla 10-8): **5–8 % MS** en dietas de alto concentrado con dieta mezclada, buen manejo de comedero e ionóforo; **20 %** si el manejo de comedero es variable o no se usa ionóforo; **20 %** para maximizar el uso de NFC y el rendimiento microbiano ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).

**BR-CORTE (cap. 3, usada en cap. 9):**
\[ MCP\ (\text{g/d}) = -53.07 + 304.9 \times CPI + 90.8 \times TDNI - 3.13 \times TDNI^2 \]
con CPI = consumo de proteína bruta (kg/d) y TDNI = consumo de TDN (kg/d) ([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf), remitiendo al cap. 3). Digestibilidad verdadera de la MCP y del RUP ≈ **80 %** (Mariz, 2016) ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf)).

\[ MPI = (MCP \times 0.64) + \frac{RUP}{0.80} \]
([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)).

### E.5 — Ítem 23: Digestibilidad de la PNDR (RUP/UIP)
- **NRC 1996:** `MPfeed = UIP × 0.80` (80 % de digestibilidad intestinal por defecto) ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).
- **BR-CORTE:** mismo 80 % ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf); [BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)).
- Requerimiento de RUP: \( RUP_{req} = \dfrac{MP_{req} - (MCP \times 0.64)}{0.80} \) ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf)).

### E.6 — Ítem 24: Requerimiento de proteína degradable en rumen (RDP/DIP)
- **BR-CORTE 2010:** `RDP (g/d) = 1.11 × MCP` (asumía 90 % de eficiencia de uso del N degradado).
- **BR-CORTE 2016 y 2023:** **se eliminó el factor 1.11**; "the requirements of RDP are considered equal to MCP synthesis", es decir \( RDP = MCP \), por el reconocimiento del reciclaje de N ([BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)). Crédito opcional por reciclaje de N: 5–10 % ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf)).
- **NRC/NASEM:** el valor "RDP = 1.18 × MCP" **no pudo confirmarse en una fuente descargada**; `n.a.` Lo que sí se confirmó: NRC calcula la PB necesaria para los microbios como `MCP requerida / fracción degradable de la PB de la dieta` (p. ej. 395/0.90 = 438 g) ([AFMG Alberta](http://agromedia.ca/AFMG/Section%201%20Nutrition%20&%20Management/1M1%20Protein%20Requirements%20of%20Feedlot%20Cattle.pdf)). Se intentó: beef10.pdf, NRC 2000 texto completo, Waterman et al. 2014, búsquedas dirigidas.
- **Reciclaje de urea (NASEM 2016):** \( N_{urea} = \left(-0.1113 + 0.996\,e^{-0.0616\,CP}\right) \times (0.745 \times NI - 11.98) \) ([TAS 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)).
- **Máximo de síntesis microbiana ligada a DE:** `MCP_max (kg) = DE intake (Mcal/d) × 0.0295` ([AFMG Alberta](http://agromedia.ca/AFMG/Section%201%20Nutrition%20&%20Management/1M1%20Protein%20Requirements%20of%20Feedlot%20Cattle.pdf)).

### E.7 — Ítem 25: % mínimo de PB en la dieta por fase, y riesgos

| Fase | PB recomendada (% MS) | Fuente |
|---|---|---|
| Terminación (finishing) | **11.5 – 13.0 %**, "current recommendations advocate for a dietary CP range of 11.5 % to 13.0 % (DM basis), depending on the net energy of the diet and the DMI" (NASEM 2016) | [PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/) |
| Terminación, óptimo constante | 11.5–13 % (Vasconcelos et al. 2009); 11.5 % resultó suficiente en el ensayo (mayor DMI y mayor ADG ajustada por carcasa que 13.5 %) | [PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/) |
| Media comercial real de dietas de terminación | 13.4 %, máximo 15.9 % (encuestas) — **por encima de lo recomendado** | [PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/) |
| Crecimiento, animal liviano (200 kg, 0.4 kg/d, dieta con solo 10 % UIP) | 15–16 % PB | [AFMG Alberta](http://agromedia.ca/AFMG/Section%201%20Nutrition%20&%20Management/1M1%20Protein%20Requirements%20of%20Feedlot%20Cattle.pdf) |
| Novillo 350 kg, 1.2 kg/d, UIP dietario 28 % | ≈13 %; con UIP 24 % → 12.5 % | [AFMG Alberta](http://agromedia.ca/AFMG/Section%201%20Nutrition%20&%20Management/1M1%20Protein%20Requirements%20of%20Feedlot%20Cattle.pdf) |
| Ensayos BR-CORTE con Nelore (10 / 12 / 14 % PB) | 10 % **redujo** la ganancia diaria de carcasa; **12 % fue adecuado** | [BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf) |
| Recepción (receiving) | `n.a.` — no se encontró cifra en fuentes descargadas (se intentó OSU, Iowa, NRC 2000, PMC13071399) | — |

**Riesgos de déficit:** con PB insuficiente cae la síntesis microbiana y por tanto la digestión de la fibra; en forrajes tropicales de baja calidad la DIP/RDP es "the first limiting nutrient" ([Waterman et al. 2014](https://www.ars.usda.gov/arsuserfiles/30300500/Publications/Uploaded1272012/J%20ANIM%20SCI-2014-Waterman-2785-99.pdf)); en Nelore, 10 % PB redujo la ganancia de carcasa ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf)).
**Riesgos de exceso:** "Most protein supplements fed in excess of immediate animal needs are catabolized and utilized as an energy source" ([NRC 2000](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html)) — costo económico y mayor excreción de N; el exceso de N implica "nitrogen excretion" y emisiones evitables ([PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/)). Además, altas concentraciones de NH3 ruminal se asociaron a hipomagnesemia en vacas en pasturas altas en PB ([NRC 2000](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html)).

### E.8 — Ítem 26: Resumen del sistema proteico BR-CORTE (para Bos indicus)
1. `MCP = −53.07 + 304.9 CPI + 90.8 TDNI − 3.13 TDNI²` → 2. `RDP = MCP` → 3. `RUP = CPI − RDP` → 4. `MPI = MCP × 0.64 + RUP/0.80` → 5. `MP_req = MPm (3.96 ó 4.31 g/EBW^0.75) + NPg/k` con `k = 84.665 − 0.1179 EQEBW` (o 47.4 % si SBW ≥ 340 kg). Relación de proteína retenida: `RP = −2.223 + 0.4691 × MPI` ([BRC16 cap. 8](https://brcorte.com.br/assets/book2016/en/c8.pdf), [BRC23 cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)).

---

## F. MACROMINERALES

### F.1 — Ítem 27 y 28: Calcio y Fósforo

**NRC 1996 (Tabla 10-2), en g/d** ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)):

\[ Ca_{maint} = \frac{0.0154 \times SBW}{0.50}; \qquad Ca_{gain} = \frac{NP_g \times 0.071}{0.50} \]
\[ P_{maint} = \frac{0.016 \times SBW}{0.68}; \qquad P_{gain} = \frac{NP_g \times 0.045}{0.68} \]
\[ Ca_{lact} = \frac{Milk \times 1.23}{0.50}; \quad P_{lact} = \frac{Milk \times 0.95}{0.68}; \quad Ca_{gest} = \frac{CBW \times 13.7/90}{0.50}; \quad P_{gest} = \frac{CBW \times 7.6/90}{0.68} \]

(0.50 y 0.68 = coeficientes de absorción de Ca y P; NPg en g/d; SBW en kg; Milk en kg/d; CBW = peso del ternero al nacer en kg).

**BR-CORTE (Tabla 9.12; requerimientos netos de mantenimiento y retención verdadera)** ([BRC16 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf)):

| Mineral | Mantenimiento neto (mg/kg PV/d) | Retención verdadera (%) |
|---|---|---|
| Ca | 11.7 | 56.8 |
| P | 13.5 | 67.8 |
| Mg | 5.9 | 35.5 |
| Na | 6.3 | 37.1 |
| K | 23.5 | 48.4 |
| S | 10.4 | 77.3 |

**Requerimientos netos de crecimiento BR-CORTE (g/d; EBG en kg/d, EBW en kg):**
\[ \text{Ca: Zebú } = EBG \times (147 \times EBW^{-0.50}); \qquad \text{cruzados } = EBG \times (66.0 \times EBW^{-0.32}) \]
\[ \text{P: Zebú } = EBG \times (38.6 \times EBW^{-0.36}); \qquad \text{cruzados } = EBG \times (25.4 \times EBW^{-0.25}) \]
\[ \text{Mg: Zebú } = EBG \times (0.3466 \times EBW^{0.0113}); \quad \text{cruzados } = EBG \times (1.0597 \times EBW^{-0.2386}) \]
\[ \text{Na: Zebú } = EBG \times (5.594 \times EBW^{-0.2998}); \quad \text{cruzados } = EBG \times (1.977 \times EBW^{-0.058}) \]
\[ \text{K: Zebú } = EBG \times (0.9463 \times EBW^{0.1216}); \quad \text{cruzados } = EBG \times (0.3418 \times EBW^{0.3200}) \]
\[ \text{S } = EBG \times (0.03 \times EBW^{0.89}) \]
([BRC16 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf))

**Ejemplo trabajado del propio libro** (toro Nelore de 400 kg, ADG 1.0 kg/d): **Ca 21.67 g/d; P 14.66 g/d; Mg 7.65 g/d; Na 9.31 g/d**; relación Ca:P = 1.48 ([BRC16 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf)).

Coeficientes de absorción comparados (recopilación BR-CORTE): ARC 1980 Ca 68 %, P 60 %, Mg 17 %, Na 91 %, K 100 %; NRC 2000 Ca 50 %, P 68 %; NRC 2001 forrajes Ca 30 %, P 80 %, Na 81 %, concentrados Ca 60 %, Na 100 % ([BRC16 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf)).

### F.2 — Ítem 29: Relación Ca:P
- **ARC:** 1:1 a 2:1 ([BRC16 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf)).
- **NRC 2000:** relaciones de **1:1 hasta 7:1** dieron desempeño similar (citado en [BRC16 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf)).
- **Rango operativo recomendado para el motor: 1.5:1 a 2:1**, coherente con el valor 1.48 del ejemplo Nelore.
- **Consecuencias:** relación muy baja (exceso de P) → riesgo de urolitiasis en machos castrados en corral, y desmineralización ósea; exceso de Ca frente a P deprime la absorción de P y de otros cationes (el propio NRC 2000 documenta interacciones Ca/P/Mg y que la absorción de Mg se altera con la composición mineral y el NH3 ruminal, [NRC 2000](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html)). Cuantificación numérica de la urolitiasis por Ca:P: `n.a.` en fuentes descargadas.

### F.3 — Ítem 30: Mg, K, Na/sal, S; máximo tolerable de S y polioencefalomalacia

**Concentraciones dietarias NRC 1996 (Tabla 10-3, crecimiento y terminación)** ([NRC96](https://nap.nationalacademies.org/resource/beef/beef10.pdf)):

| Nutriente | Requerimiento (% MS o mg/kg MS) |
|---|---|
| Mg | 0.10 % |
| K | 0.60 % |
| Na | 0.06 – 0.08 % |
| S | 0.15 % |
| Co | 0.10 mg/kg |
| Cu | 10 mg/kg |
| I | 0.50 mg/kg |
| Fe | 50 mg/kg |
| Mn | 20 mg/kg |
| Se | 0.10 mg/kg |
| Zn | 30 mg/kg |
| Vit. A | 2 200 UI/kg |
| Vit. D | 275 UI/kg |

**Sal:** el Na se cubre normalmente con sal común a libre acceso o 0.25–0.5 % de la dieta; el requerimiento tabulado es de Na (0.06–0.08 %). Nota: el K en confinamiento no excede 0.55 % según estudios con lasalocida y monensina, y en pastoreo puede bastar 0.3–0.4 % ([NRC 2000](https://dokumen.pub/nutrient-requirements-of-beef-cattle-seventh-revised-edition-update-2000-7nbsped-9780309592413-9780309069342.html)).

**Máximos tolerables (BR-CORTE Tabla 9.11, g/kg MS)** ([BRC16 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf)): Ca 44; K 20; Mg 4; Na 65; **S 4 g/kg MS = 0.40 % (NRC 2000)**; Cu 40 mg/kg; Mn 1000 mg/kg; Se 5 mg/kg; Zn 500 mg/kg. Requerimiento de S: 1.5–2.0 g/kg MS según NRC; estimación propia BR-CORTE 1.36 g/kg MS.

**Azufre y polioencefalomalacia (PEM):**
- Requerimiento 0.15 % MS; **concentración máxima tolerable 0.40 % MS**; el exceso produce "Necrosis of the cerebral cortex – Polioencephalomalacia (PEM)", con ceguera, incoordinación, letargo y convulsiones; "H2S is as toxic as cyanide" ([K-State, *Sulfur Toxicity in Feedlots*](https://www.asi.k-state.edu/doc/beef-cow-calf-nutrition/chars-j-j-wagner-sulfur-toxicity-in-feedlots-cdr-2.pdf)).
- **El S del agua cuenta:** límite superior de sulfatos <500 ppm en terneros (167 ppm S como sulfato) y <1000 ppm en adultos (333 ppm S); los niveles altos de sulfato pueden aumentar la incidencia de PEM; el S total es la suma de forraje + concentrado + agua ([UNL G2060](https://extensionpubs.unl.edu/publication/g2060/2025/pdf/view/g2060-2025.pdf)).
- **Riesgo local:** los subproductos (burlanda/DDGS, melaza, torta de soya) y aguas de pozo salinas del este boliviano elevan rápidamente el S total. El motor debe sumar S de dieta + S del agua × consumo de agua y alertar al superar 0.40 % de la MS.

---

## G. AGUA

### G.1 — Ítem 31: Predicción del consumo de agua

**NASEM 2016 (Eq. 19-105), litros/día:**
\[ WI = 7.3 + 0.0805\,SBW - 0.00008\,SBW^2 - 1.225\,CETI + 0.0411\,CETI^2 + 0.0023268 \times SBW \times CETI \]

**Índice de temperatura efectiva actual (NASEM 2016, Eq. 19-103):**
\[ CETI = 27.88 - 0.456\,T_c + 0.010754\,T_c^2 - 0.4905\,RH_c + 0.00088\,RH_c^2 + 1.1507\left(\frac{WS}{3.6}\right) - 0.126447\left(\frac{WS}{3.6}\right)^2 + 0.019867\,T_c\,RH_c - 0.046313\,T_c\frac{WS}{3.6} + 0.41267\,HRS \]

| Símbolo | Definición | Unidad |
|---|---|---|
| WI | consumo de agua | L/d |
| SBW | peso desbastado (0.96 × BW) | kg |
| Tc | temperatura ambiente | °C |
| RHc | humedad relativa | % |
| WS | velocidad del viento | mph (se divide por 3.6 en la fórmula tal como está publicada) |
| HRS | horas de sol | h |

Ambas de [NMSU B-231](https://pubs.nmsu.edu/_b/B231/) (que cita NASEM 2016). Ejemplo verificado allí: vaca de 479 kg SBW, Tc 26.7 °C, RH 30 %, viento 10 mph, 12 h de sol → CETI 29.1 y **59.1 L/d**.

**Otras ecuaciones publicadas** ([NMSU B-231](https://pubs.nmsu.edu/_b/B231/)):
- Winchester & Morris (1956), base del NRC 2000: \( WI = DMI \times \left(3.413 + 0.01595\,e^{0.17596\,T}\right) \) (DMI lb, salida gal/d).
- Hicks et al. (1988): \( gal/d = -4.393 + 0.1040\,T_{max} + 0.2923\,DMI - 2.5971\,Precip - 1.739\,Salt \) (Tmax °F, DMI lb/d, precipitación pulgadas semanales, sal %).
- Murphy et al. (1983): \( lb\ agua/d = 35.18 + 1.58\,DMI(lb) + 0.11\,Salt(g/d) + 2.64\,T(^{\circ}C) \).

**Ecuación tropical para Bos indicus (la más apropiada para Santa Cruz):**
\[ WI\ (\text{L/d}) = 9.449 + 0.190\,MBW + 0.271\,T_{MAX} - 0.259\,HU + 0.489\,DMI \]
MBW = BW^0.75 (kg), TMAX = temperatura máxima diaria (°C), HU = humedad relativa (%), DMI (kg/d) ([Estudio en Bos indicus tropical, PMC6396249](https://pmc.ncbi.nlm.nih.gov/articles/PMC6396249/)). El mismo trabajo recopila: Arias & Mader (2011) `WI = 5.92 + 1.03 DMI + 0.04 SR + 0.45 TMIN` y `WI = −7.31 + 1.00 DMI + 0.04 SR + 0.30 THI`, con `THI = 46.4 + 0.8 TAVG + HU(TAVG − 14.4)/100`; Meyer et al. (2006) `WI = −3.85 + 0.507 TAVG + 1.494 DMI − 0.141 DF + 0.248 DMF + 0.014 BW`; y las relaciones L de agua por kg de MS de CSIRO (2007) para *Bos indicus*: **<15 °C → 3.0; 20 °C → 3.5; 25 °C → 4.5; 30 °C → 6.0; >35 °C → 8.0**.

**Tabla de respaldo (NASEM/extensión), galones/día** ([UNL G2060](https://extensionpubs.unl.edu/publication/g2060/2025/pdf/view/g2060-2025.pdf)) — terminación 800 lb: 7.3 gal a 40 °F y **17.4 gal a 90 °F**; en calor (90 °F) un animal en crecimiento necesita ≈ **2 galones por cada 100 lb de peso vivo** (≈ 16.7 L/100 kg PV).

---

# IMPLEMENTATION NOTES

## Orden de cómputo correcto (motor NE)

**Fase 0 — Entradas.** BW lleno (kg), sexo, genotipo, si está implantado, si la dieta lleva ionóforo, composición química de cada ingrediente, % concentrado, condición corporal, temperatura media del mes previo (Tp), temperatura/HR actuales, barro, sistema (corral o pasto).

**Fase 1 — Energía del ALIMENTO (independiente del animal).**
1. TDN de cada ingrediente: tabla o sumativa de Weiss (ítem 14).
2. `DE = TDN/100 × 4.409` (ítem 10).
3. Descuento por nivel de consumo si corresponde (ítem 11).
4. `ME = 0.82 × DE` (NRC) **o** `ME = 0.9455 × DE − 0.3032` (BR-CORTE).
5. Cúbicas: `NEm_dieta` y `NEg_dieta` (ítems 12–13). Multiplicar por **1.12 si hay ionóforo** (ADTV).
6. Ponderar por proporciones de la mezcla para obtener NEm_dieta y NEg_dieta de la ración.

**Fase 2 — Pesos del ANIMAL.**
7. `SBW` desde BW (ítem 1). 8. `EBW` desde SBW (ítem 2). 9. `MEBW`/`FSBW` según genotipo-sexo-punto final. 10. `EQSBW`/`EQEBW` (ítem 4).

**Fase 3 — Requerimiento de mantenimiento.**
11. `NEm_req` (ítem 5) con factor de raza / genotipo.
12. Aplicar ajustes: COMP, Tp, jadeo (×1.07 / ×1.18), frío, actividad/pastoreo (ítem 6).

**Fase 4 — Consumo.**
13. `DMI_predicho` (NRC ítem 15 o BR-CORTE ítem 17).
14. Multiplicadores NRC: BI × BFAF × ADTV × TEMP1 × MUD1 × GRAZE (ítem 16).
15. Techo por % PV (ítem 18).

**Fase 5 — PARTICIÓN DE LA ENERGÍA (el paso que casi todos implementan mal).**
16. `DM_mantenimiento (kg) = NEm_req (Mcal/d) ÷ NEm_dieta (Mcal/kg)`
17. `DM_ganancia (kg) = DMI − DM_mantenimiento` (si es ≤ 0 → el animal pierde peso; calcular el déficit con NEm_dieta).
18. `NEg_disponible (Mcal/d) = DM_ganancia × NEg_dieta (Mcal/kg)`
19. `EBG` por la inversa (ítem 8), luego `ADG` (ítem 3 invertido).

**Fase 6 — Proteína.**
20. `TDNI`, `CPI` a partir del DMI final → `MCP` (ítem 22) → `RDP` (ítem 24) → `RUP` → `MPI` suministrada.
21. `MP_req = MPm + MPg` con `MPg = NPg / k` (ítems 19–21), usando la ADG de la Fase 5.
22. Si `MPI < MP_req`, recalcular la ADG limitada por proteína e informar **min(ADG_energía, ADG_proteína)**.

**Fase 7 — Iteración (obligatoria con BR-CORTE).** Las ecuaciones de DMI de BR-CORTE tienen ADG como entrada y las de energía tienen DMI como entrada. Resolver por punto fijo: ADG inicial = 1.0 kg/d → DMI → energía → nueva ADG → repetir hasta |ΔADG| < 0.01 kg/d (converge en 4–6 iteraciones). Lo mismo aplica a km de BR-CORTE, que depende de kg y de EBG: iterar `kg → REp → km` con RE de la iteración anterior.

**Fase 8 — Minerales y agua.** Ca, P, Mg, K, Na, S a partir de la ADG/EBG final (ítems 27–30); agua a partir de DMI + clima (ítem 31). Validar máximos tolerables, sobre todo **S total ≤ 0.40 % MS incluyendo el agua**.

## Errores de implementación más frecuentes

1. **EL ERROR CAPITAL: sumar NEm_req + NEg_req y compararlo contra un único valor de NEm del alimento.** Está mal por construcción. El sistema de California asigna a un mismo kilo de MS **dos** valores energéticos distintos según el destino: la energía usada para mantenimiento rinde a NEm y la usada para ganancia rinde a NEg (NEg siempre < NEm porque `kg < km`). El procedimiento correcto es el de la Fase 5: **primero se descuenta el alimento que cubre el mantenimiento a la tasa NEm, y solo el remanente se valora a la tasa NEg**. Sumar los dos requerimientos y dividir por NEm sobreestima la ganancia de forma grosera (típicamente 20–40 % en dietas de terminación).
2. **Mezclar unidades de peso.** NRC/NASEM expresan el mantenimiento sobre **SBW^0.75**; BR-CORTE sobre **EBW^0.75**. Aplicar 0.075 sobre SBW^0.75 (en vez de EBW^0.75) subestima el mantenimiento ~11 %. Nunca mezclar 0.077×SBW^0.75 con la km de BR-CORTE ni al revés.
3. **Confundir el requerimiento NEm del animal (Mcal/d) con la concentración NEm de la dieta (Mcal/kg MS).** Son variables distintas que en la literatura llevan el mismo nombre. En las ecuaciones de DMI del NRC, "NEm" es **concentración de la dieta**.
4. **No usar el peso equivalente.** Aplicar el RE/NEg directamente sobre EBW sin convertir a EQEBW hace engordar prematuramente a un Nelore (madurez 517 kg EBW) comparándolo contra una referencia taurina.
5. **Ignorar TEMP1 y el jadeo en clima tropical.** Con >35 °C sin enfriamiento nocturno el DMI cae 35 % y el mantenimiento sube hasta 18 %: ambos efectos actúan en el mismo sentido sobre la ganancia. Un modelo NRC "de manual" sin estos factores predice ganancias imposibles en noviembre–febrero en Santa Cruz.
6. **Doble conteo de los ionóforos.** El ajuste es +12 % sobre la energía de la dieta **y** −4 % sobre el DMI; no aplicar 1.12 dos veces (a NEm y otra vez a la ganancia final).
7. **RDP: usar el factor 1.11 obsoleto.** BR-CORTE 2016/2023 lo eliminó: `RDP = MCP`.
8. **Usar RE en Mcal/d en las ecuaciones de composición de la ganancia de NASEM 2016.** La errata oficial exige RE en **Mcal/kg** (RE ÷ EBG) en las Eq. 12-2/12-3 ([errata NASEM](https://nap.nationalacademies.org/resource/19014/Beef%20Cattle%20errata%20sheet2.pdf)).
9. **No iterar con BR-CORTE** (ver Fase 7): usar la ADG objetivo como si fuera la ADG predicha convierte el modelo en tautológico.
10. **Olvidar el azufre del agua** al validar el máximo tolerable de 0.40 % de la MS.
11. **Extrapolar el DMI por encima de 500 kg SBW:** las ecuaciones vigentes sobreestiman el consumo en la terminación tardía ([PMC13071399](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071399/)).

## Qué estándar usar en Santa Cruz, por bloque

| Bloque | Recomendación |
|---|---|
| Pesos (SBW, EBW, EBG, EQEBW) | **BR-CORTE 2023** (alométricas por genotipo y sexo) |
| NEm y eficiencias km/kg | **BR-CORTE** (75 kcal/EBW^0.75; MEm 118 Nelore / 124 cruza carne) |
| NEg / RE | **BR-CORTE** (0.061 confinamiento, 0.052 pastoreo) |
| Ajustes térmicos, estrés calórico, barro, actividad | **NRC 1996 / NASEM 2016** (BR-CORTE no los publica) |
| Energía del alimento (DE→ME→NEm/NEg) | NRC cúbicas + **ME de BR-CORTE** para dietas tropicales; TDN por sumativa de Weiss |
| DMI | **BR-CORTE 2023** para Nelore y cruzas, ajustado por TEMP1/MUD1 del NRC |
| Proteína | **BR-CORTE** (MPm 3.96/4.31; NPg por genotipo; k = 84.665 − 0.1179 EQEBW) |
| Minerales | **BR-CORTE cap. 9** (retenciones verdaderas por genotipo) con máximos tolerables NRC |
| Agua | **Ecuación tropical Bos indicus** (PMC6396249) con NASEM 19-105 como control cruzado |
| Implantes/ionóforos | **NRC/NASEM** (BR-CORTE no los cubre) |
