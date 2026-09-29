// src/utils/alimentos.js
// Lógica de override de alimentos.
//
// El productor puede pisar valores de la base (los 96 alimentos precargados)
// con sus propios análisis. Los overrides viven en
// users/{uid}/alimentos_overrides/{alimentoId} y guardan SOLO los campos que
// el usuario cambió. Los demás siguen siendo los de la base.
//
// Esto es distinto de "alimentos_custom": esos son alimentos NUEVOS que el
// productor crea (por ejemplo, "el pasto de mi potrero"). Los overrides son
// ajustes sobre alimentos EXISTENTES (por ejemplo, "el Ca real de mi maíz
// es 0.03 % y no 0.02 % como dice Feedipedia").

/**
 * Campos que el productor puede overridear. Es la lista blanca de lo que se
 * puede editar. Todo lo que no esté acá (fuente, url, notas, campos
 * derivados como tdn, em, enm, eng) queda como está en la base y no se puede
 * tocar desde el formulario.
 */
export const CAMPOS_EDITABLES = [
  // Básicos
  'ms', 'pb', 'prot', 'em', 'ndf', 'fdn', 'precio_kg',
  // Recomendados
  'ca', 'p', 'ee', 'cenizas', 'almidon',
  // Avanzados
  's', 'k', 'mg', 'adf', 'lignina', 'rup_pct_pb', 'max_inclusion_pct', 'azucares',
  // Específicos de ciertos alimentos
  'nitrato', 'hcn', 'gosipol',
];

/** Normaliza un valor a número o null. */
function numOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Compara el formulario del override con el alimento original y devuelve
 * solo los campos que el usuario cambió.
 *
 * Reglas:
 *   - Si el usuario deja un campo vacío (null), NO se toca el campo. Se
 *     interpreta como "sin dato nuevo", no como "borrar el valor de la base".
 *   - Si el valor es igual al original, no se guarda (no contamina el override).
 *   - Los campos duplicados (prot/pb y fdn/ndf) se guardan juntos para
 *     mantener compatibilidad con la pantalla vieja y el motor.
 *
 * @param {object} original  alimento de la base
 * @param {object} editado   formulario con los valores nuevos (strings)
 * @returns {object} { campos: { ... } } con solo los que cambiaron
 */
export function camposModificados(original, editado) {
  const campos = {};
  for (const campo of CAMPOS_EDITABLES) {
    const valOriginal = numOrNull(original[campo]);
    const valNuevo = numOrNull(editado[campo]);
    // Si el usuario dejó vacío, no toca el campo.
    if (valNuevo === null) continue;
    // Si el valor es igual al original, no lo guarda.
    if (valOriginal !== null && valOriginal === valNuevo) continue;
    // Los campos duplicados (prot/pb y fdn/ndf) se guardan juntos.
    if (campo === 'prot') campos.pb = valNuevo;
    if (campo === 'pb') campos.prot = valNuevo;
    if (campo === 'fdn') campos.ndf = valNuevo;
    if (campo === 'ndf') campos.fdn = valNuevo;
    campos[campo] = valNuevo;
  }
  return { campos };
}

/**
 * Aplica un override sobre un alimento de la base.
 * El resultado es el alimento con los campos del override reemplazando los
 * de la base; los campos que el override no toca quedan como en la base.
 *
 * @param {object} alimentoBase
 * @param {object} override  { campos: { ... } }
 * @returns {object} alimento con override aplicado + marca `_override: true`
 */
export function mergeOverride(alimentoBase, override) {
  if (!override || !override.campos) return alimentoBase;
  return {
    ...alimentoBase,
    ...override.campos,
    _override: true,
    _overrideFecha: override.updatedAt || null,
    _original: alimentoBase,
  };
}

/**
 * Aplica un mapa de overrides sobre un array de alimentos.
 *
 * @param {Array} alimentos  los alimentos de la base
 * @param {object} overrides  { [alimentoId]: { campos: {...}, updatedAt } }
 * @returns {Array} alimentos con los overrides aplicados
 */
export function aplicarOverrides(alimentos, overrides = {}) {
  if (!overrides || Object.keys(overrides).length === 0) return alimentos;
  return alimentos.map((a) => {
    const ov = overrides[a.id];
    return ov ? mergeOverride(a, ov) : a;
  });
}

/** Cuenta cuántos overrides tiene un alimento. Útil para la UI. */
export function tieneOverride(overrides, alimentoId) {
  return !!(overrides && overrides[alimentoId]);
}

export default { CAMPOS_EDITABLES, camposModificados, mergeOverride, aplicarOverrides, tieneOverride };