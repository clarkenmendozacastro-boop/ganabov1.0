/**
 * nutricion.js — puente al motor nuevo
 * ---------------------------------------------------------------------------
 * Este archivo ya NO contiene cálculos. Todo el cálculo nutricional vive en
 * `src/engine/`, que está separado en módulos, documentado con la fuente de
 * cada ecuación y probado contra los valores publicados del NRC y de BR-CORTE.
 *
 * Se deja este archivo como puente para que las pantallas que ya importaban
 * desde "../../utils/nutricion" sigan funcionando sin cambios.
 *
 * El motor viejo quedó guardado en `nutricion.legacy.js` únicamente como
 * referencia histórica: NO USARLO. Tenía, entre otras fallas, el cálculo de la
 * ganancia diaria sin terminar (nunca calculaba `gdpEstimada`), la energía sin
 * partir entre mantenimiento y ganancia, el consumo fijado como un porcentaje
 * del peso vivo, y el calcio y el fósforo inventados cuando el alimento no los
 * declaraba. Los detalles están en `docs/MOTOR_NUTRICION.md`.
 */

export {
  formularRacionAvanzada,
  calcularRequerimientosAvanzado,
  FASES_FEEDLOT,
  SISTEMAS,
  CALIDAD,
} from '../engine/index.js';
