# Motor de nutrición de GanaBov — versión 2

Este documento explica **por qué el motor viejo formulaba mal**, **qué hace el
motor nuevo**, **de dónde sale cada número** y **qué falta todavía**. Está
escrito para que dentro de seis meses cualquiera —incluido vos— pueda auditar el
cálculo sin tener que confiar en la palabra de nadie.

Última actualización: septiembre de 2026.

---

## 1. Resumen en tres líneas

- El motor viejo (`src/utils/nutricion.legacy.js`) **nunca calculó la ganancia
  diaria**: la mostraba, pero no la computaba. Y armaba la ración con un bucle
  codicioso que metía el ingrediente más barato hasta llenar, sin límites de
  seguridad ruminal. Podía dar una dieta que enferma al animal.
- El motor nuevo (`src/engine/`) parte de requerimientos según **BR-CORTE 2023**
  (calibrado en cebuinos, que es lo que hay en Santa Cruz) y **NRC 1996/2001**,
  resuelve la mezcla con **programación lineal** y pasa el resultado por un
  **validador de 42 reglas de seguridad** que puede bloquear una ración.
- La ganancia que muestra la app ahora es una **predicción calculada** a partir
  de la energía y la proteína que la ración realmente aporta. Si la dieta no
  alcanza para el objetivo, el motor lo dice en vez de inventar el número.

---

## 2. Qué estaba roto en el motor viejo

El archivo original quedó guardado como `src/utils/nutricion.legacy.js` con un
aviso de **NO USAR**, solo como referencia histórica. Estos son los problemas
que se encontraron leyéndolo línea por línea:

| # | Problema | Consecuencia práctica |
|---|---|---|
| 1 | `gdpEstimada` se mostraba pero nunca se calculaba a partir de la ración | El productor veía una ganancia que no tenía relación con lo que estaba dando de comer |
| 2 | Un solo total de energía neta, sin separar mantenimiento de ganancia | Imposible saber cuánta energía sobraba para engordar; el error se arrastra a todo lo demás |
| 3 | Mantenimiento multiplicado por 1.1 "por las dudas" y un descuento de 0.85 en feedlot, ambos sin fuente | Requerimientos inflados y después recortados de forma arbitraria: dos errores que no se cancelan |
| 4 | La energía neta de ganancia (ENg) estaba mal derivada de la EM | La conversión y el costo por kilo de ganancia salían mal |
| 5 | Consumo de materia seca fijado como un porcentaje fijo del peso vivo | El consumo real depende del peso, de la ganancia, de la densidad de la dieta y del calor. Con un porcentaje fijo, todo lo demás queda mal escalado |
| 6 | El peNDF (fibra físicamente efectiva) era un valor inventado | Es justamente el indicador que avisa del riesgo de acidosis. Inventado, no avisa de nada |
| 7 | Bucle codicioso: agregaba el ingrediente más barato hasta llenar, con rellenos de 0.2 kg | Dietas de un solo ingrediente, sin balance de minerales |
| 8 | Si un alimento no tenía datos de calcio o fósforo, se le asignaba Ca 0.3 % y P 0.1 % | Números inventados metidos en un cálculo que después se presenta como confiable |
| 9 | Sin requerimientos de Ca/P, sin techo de almidón, sin límite de azufre ni de urea, sin rampa de adaptación al grano, sin vitamina A, sin agua | Las cinco causas más comunes de que un animal se enferme en corral no estaban contempladas |

El punto 9 es el más grave: **el motor viejo no tenía ninguna barrera de
seguridad**. Podía entregar una ración con 90 % de grano el día uno, que es la
receta de la acidosis ruminal aguda.

---

## 3. Cómo está armado el motor nuevo

`src/engine/` son 10 módulos, unos 3.800 renglones, todos con comentarios en
español y la URL de la fuente al lado de cada ecuación.

| Módulo | Qué hace |
|---|---|
| `standards.js` | Sistemas de producción (pastoril, semiintensivo, feedlot), fases del feedlot, escalas de calidad, rango de la relación Ca:P, fichas de razas |
| `animal.js` | Peso desbastado, peso de cuerpo vacío, requerimientos de mantenimiento, de ganancia, de proteína y de minerales |
| `energy.js` | Conversiones TDN → ED → EM → ENm/ENg, ecuación sumativa de Weiss, descuento de energía por nivel de consumo |
| `intake.js` | Predicción del consumo de materia seca y del consumo de agua |
| `predict.js` | Predicción de la ganancia diaria a partir de la ración real (energía y proteína), por punto fijo |
| `safety.js` | 42 reglas de seguridad ejecutables: bloqueos y advertencias, más el puntaje de riesgo de acidosis |
| `constraints.js` | Traduce requerimientos y reglas a las restricciones del problema de optimización |
| `solver.js` | Simplex de dos fases con restricciones elásticas (26 pruebas propias) |
| `adaptation.js` | Rampa de adaptación al grano, escalón por escalón, con su validador |
| `index.js` | La API pública que consume la pantalla |

### 3.1 El animal

Se usa **BR-CORTE 2023** porque está calibrado con ganado cebuino y cruzas en
condiciones tropicales, que es exactamente el caso de Santa Cruz. El NRC está
calibrado en razas británicas en clima templado y sobrestima requerimientos en
Nelore.

- Peso vivo desbastado: `SBW = 0.8915 × PV^1.0151`
- Peso de cuerpo vacío: `EBW = 0.8126 × SBW^1.0134`
- Mantenimiento: `ENm = 0.075 × EBW^0.75`
  ([BR-CORTE 2023 cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf))
- Sobre esa base se aplica la **aclimatación térmica del NRC 1996**:
  `a2 = 0.0007 × (20 − T_mes_previo)` por SBW^0.75. En Santa Cruz, con
  temperaturas previas de 25 a 28 °C, esto **reduce** el mantenimiento entre 5 y
  7 %. Es un ajuste con fuente, no un factor inventado
  ([NRC 1996 cap. 10](https://nap.nationalacademies.org/resource/beef/beef10.pdf)).
- Minerales: ecuaciones de retención y eficiencia de absorción de
  [BR-CORTE 2016 cap. 9](https://brcorte.com.br/assets/book2016/en/c9.pdf).
  El cálculo se validó contra el **ejemplo resuelto publicado** en ese capítulo:
  Nelore entero de 400 kg con 1.0 kg/d de ganancia requiere Ca 21.67 g/d — el
  motor devuelve **21.68**.

### 3.2 El consumo

Este fue el punto más difícil, porque las ecuaciones de BR-CORTE predicen el
consumo **a partir de la ganancia**, y la ganancia depende del consumo. En
confinamiento eso generaba una espiral: consumo bajo → poca energía → poca
ganancia → consumo más bajo.

La solución fue:

- **En corral** (feedlot y semiintensivo) se usa el **promedio** de dos
  ecuaciones independientes: la de BR-CORTE para cebuinos y la del NRC 1996
  basada en la densidad energética de la dieta
  (`DMI = SBW^0.75 × (0.2435·ENm − 0.0466·ENm² − k) / ENm`, con k = 0.0869 para
  novillos de más de 300 kg y 0.1128 para terneros en crecimiento).
- **En pastoreo** se usa BR-CORTE sola.
- El **descuento por temperatura del NRC no se aplica a cebuinos hasta 32 °C**,
  porque BR-CORTE ya está calibrado en el trópico. Aplicar los dos era contar el
  calor dos veces y daba consumos absurdos de 1.4 % del peso vivo.

### 3.3 La ración: optimización, no un bucle codicioso

El balanceo es un problema de **programación lineal**: minimizar el costo diario
sujeto a que se cumplan los requerimientos y las reglas de seguridad.

- Las restricciones de seguridad (`BLOCK`) son **duras**: el solver no las puede
  violar, y encima llevan un margen del 1 % para que un error de redondeo no
  deje pasar una ración al límite.
- Las restricciones nutricionales son **elásticas** con penalización: si la
  energía no alcanza con los alimentos disponibles, el solver entrega la mejor
  ración posible y **reporta el faltante como deficiencia**, en vez de declarar
  el problema imposible y no mostrar nada.
- Hay un bloque de restricciones etiquetado explícitamente como
  **"practicidad, no norma publicada"**: proteína cruda como máximo 1.25× la
  requerida, calcio y fósforo como máximo 1.6× lo requerido, y ningún
  ingrediente por encima del 60 % de la materia seca si no tiene su propio
  techo. Sin esto, el optimizador encontraba dietas matemáticamente óptimas y
  ganaderamente ridículas: 40 % de proteína cruda a base de leguminosas
  arbóreas. Están marcadas como criterio nuestro, no como norma.
- También hay un peso por **disponibilidad local en Santa Cruz**: a igual costo,
  el motor prefiere lo que realmente se consigue en la zona.

### 3.4 Las 42 reglas de seguridad

Salen de la investigación en `research/seguridad.md` (110 criterios revisados, de
los cuales 42 quedaron como reglas ejecutables). Cada regla tiene su fuente, su
severidad (`BLOCK` o `WARN`) y las fases en que aplica. Las principales:

| Regla | Límite | Por qué |
|---|---|---|
| Fibra físicamente efectiva (peNDF) | mínimo según fase | Es lo que sostiene la rumia y el pH del rumen ([NASEM](https://www.ncbi.nlm.nih.gov/books/NBK600592/)) |
| Almidón | techo dinámico según fibra efectiva | Acidosis ruminal ([NASEM](https://www.ncbi.nlm.nih.gov/books/NBK600592/)) |
| Relación Ca:P | entre 1.2:1 y 6:1 | Por debajo de 1.2 hay riesgo de cálculos urinarios en machos ([UK ASC-186](https://publications.mgcafe.uky.edu/files/asc186.pdf)) |
| Azufre | máximo 0.4 % de la MS en dietas de alto concentrado | Polioencefalomalacia ([K-State](https://www.asi.k-state.edu/doc/beef-cow-calf-nutrition/chars-j-j-wagner-sulfur-toxicity-in-feedlots-cdr-2.pdf)) |
| Urea | máximo 1 % de la MS y no más de un tercio de la proteína | Intoxicación amoniacal |
| Grasa total | máximo 6-7 % de la MS | Por encima se deprime la digestión de la fibra |
| Máximos tolerables de minerales | tablas NASEM | [NASEM](https://www.ncbi.nlm.nih.gov/books/NBK600600/) |
| Concentrado por fase | según sistema y fase elegidos | El plan que el usuario eligió se respeta |

Un dato desconocido (`null`) **no genera un bloqueo inventado**: si no se sabe
el azufre de un alimento, el motor no finge saberlo. Eso está probado.

### 3.5 La rampa de adaptación al grano

`adaptation.js` genera el escalonado para llegar al concentrado de terminación
sin acidosis: arranca por debajo del 50 % de concentrado, sube como máximo 10
puntos por escalón y toma al menos 21 días para llegar al 85 %
([Montana State](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html),
[OSU Feedlot Primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf)).
Esto **no existía** en el motor viejo.

---

## 4. La base de alimentos

`src/data/alimentosBase.js` se regeneró completa: **96 alimentos**
(43 forrajes, 24 energéticos, 15 proteicos, 14 minerales). Cada uno lleva la
**fuente y la URL** de donde salió el valor: 95 de 96 tienen URL.

Se generan con `research/gen_alimentos.py`, así que se pueden regenerar y
auditar. El respaldo de la base vieja quedó en `/tmp/alimentosBase.viejo.js`.

### Corrección de TDN inverosímil

Muchas tablas de campo publican TDN estimados imposibles: leguminosas arbóreas
con 79 % de TDN teniendo 50 % de fibra. El motor aplica
`corregirTdnEstimado()`, que recalcula el TDN con la **ecuación sumativa del
NRC 2001** (Weiss) cuando la composición lo permite, y si no, lo limita a 90 %
en alimentos sin grasa agregada. Solo se corrigen los TDN marcados como
**estimados**: un TDN publicado no se toca.

Correcciones más importantes (valor viejo → corregido):

| Alimento | TDN antes | TDN corregido |
|---|---|---|
| Pasto de Gliricidia | 79 | 52.3 |
| Pasto de Leucaena | 75 | 59.2 |
| DDGS de sorgo | 95 | 64.4 |
| Grano de destilería | 97 | 81.4 |
| Cascarilla de soya | 79 | 65.1 |
| Torta de maní | 100 | 87.1 |
| Melaza de caña | 61 | 75.2 (subió) |

Cada alimento corregido guarda `tdn_original`, `tdn_origen` y `tdn_url` para que
la corrección sea rastreable.

---

## 5. Pruebas

Dos archivos, se corren con Node sin instalar nada:

```bash
node tests/solver.test.mjs   # 26 pruebas del optimizador
node tests/motor.test.mjs    # 74 pruebas del motor
```

`tests/motor.test.mjs` no comprueba que el motor "no tire error": comprueba que
sus números **coincidan con los valores publicados**. Verifica, entre otras
cosas:

- Las conversiones de energía contra las tablas del NRC (maíz: ENm 2.24 y
  ENg 1.55 Mcal/kg).
- Los requerimientos de minerales contra el **ejemplo resuelto de BR-CORTE**
  (Ca 21.67, P 14.66, Mg 7.65, Na 9.31 g/d).
- Las ecuaciones de consumo de BR-CORTE y del NRC, término por término.
- Que una dieta de 98 % de concentrado y 65 % de almidón **se bloquee**, y que
  una dieta de terminación bien armada **no** se bloquee.
- Que las seis raciones de referencia (feedlot en sus tres fases, semiintensivo,
  pastoril y modo económico) salgan **sin ningún bloqueo de seguridad**, con
  consumo entre 1.2 y 3 % del peso vivo, Ca:P dentro del rango y conversión
  creíble.
- Que con pasto solo se gane menos que en corral, y que con alimentos
  deteriorados la ganancia baje. Parece obvio; el motor viejo no lo cumplía.

Al 10 de septiembre de 2026: **100 de 100 pruebas pasan**.

### Raciones de referencia (Nelore, 30 °C, modo óptimo)

| Escenario | Ganancia / objetivo (kg/d) | MS (% PV) | Concentrado | Ca:P | Conversión | Bs/día |
|---|---|---|---|---|---|---|
| Feedlot inicio, 200 kg | 0.94 / 1.2 | 2.49 | 60 % | 1.9 | 4.99 | 7.84 |
| Feedlot desarrollo, 350 kg | 1.34 / 1.5 | 2.06 | 77 % | 1.2 | 4.92 | 22.98 |
| Feedlot terminación, 450 kg | 1.09 / 1.7 | 1.56 | 90 % | 1.2 | 5.59 | 19.97 |
| Semiintensivo, 300 kg | 0.69 / 0.95 | 2.14 | 65 % | 1.82 | 8.71 | 9.64 |
| Pastoril, 250 kg | 0.38 / 0.6 | 1.65 | 45 % | 1.44 | 10.84 | 6.22 |
| Feedlot terminación 380 kg, económico | 1.61 / 1.7 | 2.04 | 90 % | 1.2 | 4.32 | 20.44 |

---

## 6. Lo que falta y las advertencias honestas

Esto es importante leerlo antes de vender el software a alguien.

1. **La ganancia predicha queda por debajo del objetivo en terminación y en
   pastoreo.** En terminación de 450 kg da 1.09 kg/d contra un objetivo de 1.7.
   No es un error de cálculo: es que a 450 kg la eficiencia de uso de la energía
   para ganancia cae y el consumo baja al subir la densidad de la dieta. El
   motor ahora **informa lo que la dieta puede dar** en vez de inventar el
   número del objetivo. Si querés ganancias de 1.7 kg/d a ese peso hay que
   revisar los alimentos disponibles y sus precios.
2. **Los precios de `alimentosBase.js` son valores de referencia, no precios de
   mercado.** El modo económico minimiza costo: si los precios están mal, la
   ración "más barata" está mal. Lo primero que tiene que hacer el usuario es
   cargar sus precios reales.
3. **Quedan advertencias (`WARN`) en las dietas de feedlot de alto
   concentrado**: fibra por debajo del 40 % y almidón por encima del techo
   dinámico. Son coherentes con una dieta de terminación y no bloquean, pero hay
   que mostrárselas al usuario, que es lo que hace la pantalla.
4. **Huecos en los datos**: 10 alimentos no tienen TDN y quedan excluidos del
   balanceo con un aviso en pantalla; 65 tienen TDN **estimado** (no medido);
   8 no tienen calcio o fósforo; 10 no tienen fibra. Los que no tienen dato no
   se rellenan con inventos: quedan afuera del cálculo que los necesita.
5. **Falta la seguridad de Firebase.** Quedó postergada a propósito. Las reglas
   de la base de datos siguen siendo el punto débil del proyecto y hay que
   atenderlo antes de que esto lo use gente de verdad.
6. **Esto no reemplaza a un nutricionista.** El motor calcula bien con las
   fuentes que tiene, pero una dieta real necesita ajuste a campo, análisis
   bromatológico de los forrajes propios y seguimiento sanitario.

---

## 7. Cómo se usa desde la pantalla

La pantalla no cambió de importación: `src/utils/nutricion.js` es ahora un
puente documentado que re-exporta el motor nuevo.

```js
import { formularRacionAvanzada } from "../../utils/nutricion";

const resultado = formularRacionAvanzada({
  pv: 350,                    // peso vivo, kg
  sistemaId: "feedlot",       // pastoril | semiIntensivo | feedlot
  fase: "desarrollo",         // inicio | desarrollo | terminacion (solo feedlot)
  razaId: "nelore",
  temperatura: 30,            // °C
  modo: "optimo",             // optimo | economico | mis_alimentos | personalizado
  preciosUsuario: {},         // { id_alimento: Bs/kg }
  estadosCalidad: {},         // { id_alimento: "Bajo" | ... }
  alimentosSeleccionadosIds: null,
});
```

Devuelve `racion`, `indicadores`, `seguridad` (con `bloqueos` y
`advertencias`), `adaptacion`, `prediccion`, `deficiencias`,
`alertasCalidad`, `aditivosRecomendados`, `alertas` y `explicaciones`.

Los kilos vienen ya redondeados a algo que se puede pesar, y los ingredientes
que darían menos de 5 gramos por animal y día se descartan en vez de aparecer
como "0.00 kg".

---

## 8. Fuentes

- [NRC 1996, *Nutrient Requirements of Beef Cattle*, cap. 10](https://nap.nationalacademies.org/resource/beef/beef10.pdf)
- [NRC 2001, ecuación sumativa de Weiss](https://www.foragelab.com/media/nrc2001.pdf)
- [BR-CORTE 2023, cap. 1](https://brcorte.com.br/assets/book2023/en/01.pdf) ·
  [cap. 2](https://brcorte.com.br/assets/book2023/en/02.pdf) ·
  [cap. 8](https://brcorte.com.br/assets/book2023/en/08.pdf) ·
  [cap. 9](https://brcorte.com.br/assets/book2023/en/09.pdf)
- [BR-CORTE 2016, cap. 9 (ejemplo resuelto de minerales)](https://brcorte.com.br/assets/book2016/en/c9.pdf)
- [NASEM, máximos tolerables de minerales](https://www.ncbi.nlm.nih.gov/books/NBK600600/)
- [NASEM, almidón y fibra físicamente efectiva](https://www.ncbi.nlm.nih.gov/books/NBK600592/)
- [K-State, toxicidad por azufre en feedlot](https://www.asi.k-state.edu/doc/beef-cow-calf-nutrition/chars-j-j-wagner-sulfur-toxicity-in-feedlots-cdr-2.pdf)
- [University of Kentucky ASC-186, cálculos urinarios y relación Ca:P](https://publications.mgcafe.uky.edu/files/asc186.pdf)
- [Montana State, rampas de adaptación al grano](https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html)
- [Ohio State, Feedlot Primer](https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf)
- [Mississippi State P2489](https://extension.msstate.edu/sites/default/files/publications/publications/p2489.pdf)
- [Translational Animal Science 3(3):991](https://academic.oup.com/tas/article/3/3/991/5523108)
- [Feedipedia](https://www.feedipedia.org/) — composición de alimentos

La investigación completa, con las citas textuales, está en `research/`:
`ecuaciones.md`, `alimentos.md` y `seguridad.md`.
