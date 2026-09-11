// src/engine/adaptation.js
// Rampa de adaptación al grano ("step-up").
//
// Por qué existe este archivo: la causa número uno de muerte y de pérdida de
// plata en un engorde no es formular mal la ración final, es LLEGAR MAL a ella.
// Un animal que viene de pasto y entra de golpe a una dieta de grano hace
// acidosis en 48 horas. El motor viejo no tenía nada de esto.
//
// Reglas que se cumplen (ver research/seguridad.md):
//   V25 — la adaptación completa no puede durar menos de 21 días.
//   V26 — entre un escalón y el siguiente el concentrado no puede subir más de
//         10 puntos porcentuales de la MS.
//   V27 — cada escalón se mantiene al menos 2 a 3 días antes de subir.
//
// Fuentes:
//   Montana State University Extension — Step-up rations
//   https://animalrangeextension.montana.edu/beef/articles/step-up-rations.html
//   Oklahoma State University — Feedlot primer
//   https://agnr.osu.edu/sites/agnr/files/imce/pdfs/Beef/feedlot_0.pdf

/** Concentrado de arranque recomendado al entrar al corral, % de la MS. */
export const CONCENTRADO_INICIAL_PCT = 45;

/** Salto máximo de concentrado entre escalones, en puntos de % de la MS (V26). */
export const SALTO_MAX_PUNTOS = 10;

/** Días mínimos que se mantiene cada escalón (V27). */
export const DIAS_POR_ESCALON = 3;

/** Duración mínima total de la adaptación (V25). */
export const DIAS_MIN_ADAPTACION = 21;

/**
 * Arma la rampa de adaptación desde la dieta de entrada hasta la dieta final.
 *
 * @param {object} p
 * @param {number} p.concentradoFinalPct  concentrado de la dieta objetivo, % MS
 * @param {number} [p.concentradoInicialPct]
 * @param {number} [p.saltoMaxPuntos]
 * @param {number} [p.diasPorEscalon]
 * @returns {{escalones:Array, diasTotales:number, avisos:string[], cumpleV25:boolean}}
 */
export function rampaAdaptacion({
  concentradoFinalPct,
  concentradoInicialPct = CONCENTRADO_INICIAL_PCT,
  saltoMaxPuntos = SALTO_MAX_PUNTOS,
  diasPorEscalon = DIAS_POR_ESCALON,
}) {
  const avisos = [];
  const final = Math.max(0, Math.min(100, Number(concentradoFinalPct) || 0));
  let inicio = Math.min(concentradoInicialPct, final);

  // Si la dieta final tiene poco concentrado no hace falta rampa.
  if (final <= concentradoInicialPct) {
    return {
      escalones: [{
        n: 1, concentradoPct: final, forrajePct: 100 - final,
        dias: 7, diaDesde: 1, diaHasta: 7,
        nota: 'La dieta final tiene poco concentrado: no necesita rampa de adaptación. Igual conviene una semana de acostumbramiento al comedero.',
      }],
      diasTotales: 7,
      avisos: ['Esta dieta no supera el nivel de concentrado de arranque, así que no hay riesgo de acidosis por escalonamiento.'],
      cumpleV25: true,
    };
  }

  // Cuántos saltos hacen falta para cubrir la diferencia sin pasar el máximo.
  const salto = Math.max(1, Math.min(saltoMaxPuntos, SALTO_MAX_PUNTOS));
  let nSaltos = Math.ceil((final - inicio) / salto);
  let dias = diasPorEscalon;

  // V25: si la rampa quedaría más corta que 21 días se estira el tiempo de
  // cada escalón. Nunca se acorta la rampa para "ganar" días de engorde.
  while ((nSaltos + 1) * dias < DIAS_MIN_ADAPTACION) dias += 1;

  const escalones = [];
  let dia = 1;
  for (let i = 0; i <= nSaltos; i++) {
    const pct = i === nSaltos ? final : Math.min(final, inicio + i * salto);
    escalones.push({
      n: i + 1,
      concentradoPct: Number(pct.toFixed(1)),
      forrajePct: Number((100 - pct).toFixed(1)),
      dias,
      diaDesde: dia,
      diaHasta: dia + dias - 1,
      nota: i === 0
        ? 'Escalón de entrada. El animal tiene que estar comiendo bien y tomando agua antes de subir el grano.'
        : `Sube ${(pct - escalones[i - 1].concentradoPct).toFixed(1)} puntos de concentrado. Si algún animal deja comida o aparece diarrea, NO subir: repetir el escalón.`,
    });
    dia += dias;
  }

  const diasTotales = dia - 1;
  if (diasTotales < DIAS_MIN_ADAPTACION) {
    avisos.push(`La rampa quedó en ${diasTotales} días y el mínimo seguro es ${DIAS_MIN_ADAPTACION}. Hay que estirarla.`);
  }
  avisos.push(`Adaptación en ${escalones.length} escalones y ${diasTotales} días, subiendo como máximo ${salto} puntos de concentrado cada ${dias} días.`);
  avisos.push('Regla práctica: el bebedero limpio y con agua a voluntad es parte de la adaptación. Un animal que no toma agua no come, y uno que no come rumia menos y se acidifica.');

  return { escalones, diasTotales, avisos, cumpleV25: diasTotales >= DIAS_MIN_ADAPTACION };
}

/**
 * Verifica una rampa cargada por el usuario contra V25/V26/V27.
 * @param {Array<{concentradoPct:number, dias:number}>} escalones
 */
export function validarRampa(escalones = []) {
  const problemas = [];
  const dias = escalones.reduce((s, e) => s + (Number(e.dias) || 0), 0);

  if (dias < DIAS_MIN_ADAPTACION) {
    problemas.push({
      id: 'V25', severidad: 'BLOCK',
      mensaje: `La adaptación dura ${dias} días y el mínimo seguro es ${DIAS_MIN_ADAPTACION}. Subir el grano más rápido que esto provoca acidosis.`,
    });
  }
  for (let i = 1; i < escalones.length; i++) {
    const salto = (Number(escalones[i].concentradoPct) || 0) - (Number(escalones[i - 1].concentradoPct) || 0);
    if (salto > SALTO_MAX_PUNTOS) {
      problemas.push({
        id: 'V26', severidad: 'BLOCK',
        mensaje: `Del escalón ${i} al ${i + 1} el concentrado sube ${salto.toFixed(1)} puntos y el máximo seguro es ${SALTO_MAX_PUNTOS}.`,
      });
    }
  }
  for (const e of escalones) {
    if ((Number(e.dias) || 0) < 2) {
      problemas.push({
        id: 'V27', severidad: 'WARN',
        mensaje: `Un escalón dura ${e.dias} día(s). Cada escalón necesita 2 a 3 días para que el rumen se acomode.`,
      });
    }
  }
  return { ok: !problemas.some((p) => p.severidad === 'BLOCK'), problemas, diasTotales: dias };
}

export default { rampaAdaptacion, validarRampa };
