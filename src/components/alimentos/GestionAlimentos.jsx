// src/components/alimentos/GestionAlimentos.jsx
import React, { useState } from "react";
import { addDoc } from "firebase/firestore";
import { userCol } from "../../utils/helpers";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, CATEGORIAS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";

// ---------------------------------------------------------------------------
// Formulario de alimento personalizado
// ---------------------------------------------------------------------------
// El motor consume 19 campos, pero solo 7 son obligatorios: nombre, categoría,
// MS, PB, EM, FDN y precio. El resto son opcionales: si se dejan vacíos se
// guardan como `null` (desconocido), NUNCA como 0. La diferencia es
// importante: `Number(null) === 0` en JS, pero `numOrNull()` en el motor
// distingue "sin dato" de "el dato es cero". Un 0 guardado haría que el motor
// crea que el alimento no tiene calcio, y suplementa con carbonato de más.
// ---------------------------------------------------------------------------

const FORM_INICIAL = {
  // Básicos (obligatorios)
  nombre: "",
  categoria: "forraje",
  ms: "",
  prot: "",   // se guarda como pb también
  em: "",     // Mcal/kg MS
  fdn: "",    // se guarda como ndf también
  precio_kg: "",

  // Recomendados (opcionales, el motor los usa si están)
  ca: "",
  p: "",
  ee: "",
  cenizas: "",
  almidon: "",

  // Avanzados (opcionales)
  s: "",
  k: "",
  mg: "",
  adf: "",
  lignina: "",
  rup_pct_pb: "",
  max_inclusion_pct: "",
  azucares: "",
  // Nota: nitrato, hcn, gosipol son específicos de ciertos alimentos y no
  // se cargan desde acá porque el productor raramente los mide.
};

/** Convierte "" → null; "5" → 5; "abc" → null. */
function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Chequeos duros que bloquean el guardado. Devuelve array de errores. */
function validarDuros(f) {
  const errores = [];
  const ms = numOrNull(f.ms);
  const pb = numOrNull(f.prot);
  const em = numOrNull(f.em);

  if (!f.nombre || f.nombre.trim() === "") errores.push("El nombre es obligatorio.");
  if (ms === null || ms <= 0) errores.push("MS % debe ser un número mayor a 0.");
  else if (ms > 100) errores.push("MS % no puede superar 100.");
  if (pb === null || pb <= 0) errores.push("PB % debe ser un número mayor a 0.");
  else if (pb > 100) errores.push("PB % no puede superar 100.");
  if (em === null || em <= 0) errores.push("EM (Mcal/kg MS) debe ser un número mayor a 0.");
  else if (em > 6) errores.push("EM mayor a 6 Mcal/kg MS es físicamente imposible.");

  return errores;
}

/** Chequeos de coherencia que avisan pero no bloquean. */
function avisosCoherencia(f) {
  const avisos = [];
  const pb = numOrNull(f.prot);
  const ndf = numOrNull(f.fdn);
  const adf = numOrNull(f.adf);
  const ee = numOrNull(f.ee);
  const ca = numOrNull(f.ca);
  const p = numOrNull(f.p);

  if (pb !== null && pb > 60) {
    avisos.push(`PB = ${pb}% es muy alta. ¿Es correcto?`);
  }
  if (adf !== null && ndf !== null && adf > ndf) {
    avisos.push(`ADF (${adf}%) no puede ser mayor que FDN (${ndf}%).`);
  }
  if (ee !== null && ee > 30 && f.categoria === "forraje") {
    avisos.push(`Grasa (EE) = ${ee}% es muy alta para un forraje. ¿Es correcto?`);
  }
  if (ca !== null && p !== null && p > 0) {
    const ratio = ca / p;
    if (ratio > 10) avisos.push(`Relación Ca:P = ${ratio.toFixed(1)} es muy alta.`);
    if (ratio < 0.1) avisos.push(`Relación Ca:P = ${ratio.toFixed(2)} es muy baja.`);
  }
  return avisos;
}

const GestionAlimentos = ({ preciosUsr, onPrecio, customAl, onAddCustom, uid, minsAlimentos, onSetMinimo }) => {
  const [busq, setBusq] = useState("");
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editMinId, setEditMinId] = useState(null);
  const [editMinVal, setEditMinVal] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [errores, setErrores] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [showAvanzado, setShowAvanzado] = useState(false);

  const todos = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busq.toLowerCase()) ||
      (TIPO_LABELS[a.categoria] || "").toLowerCase().includes(busq.toLowerCase())
  );

  const alimentosSinPrecio = filtrados.filter((al) => {
    const precio = preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg;
    return precio === 0;
  });

  const savePrecio = async (id) => {
    const v = parseFloat(editVal);
    if (!isNaN(v) && v >= 0) {
      await onPrecio(id, v);
    }
    setEditId(null);
  };

  const saveMinimo = async (id) => {
    const v = parseFloat(editMinVal);
    if (!isNaN(v) && v >= 0) {
      await onSetMinimo(id, v);
    }
    setEditMinId(null);
  };

  const limpiarForm = () => setForm({ ...FORM_INICIAL });

  const guardar = async () => {
    const errs = validarDuros(form);
    if (errs.length > 0) {
      setErrores(errs);
      return;
    }
    const warns = avisosCoherencia(form);
    if (warns.length > 0 && !avisos.length) {
      // Primera vez que se ven los avisos: mostrarlos y no guardar aún.
      // El usuario tiene que apretar "Guardar" otra vez para confirmar.
      setAvisos(warns);
      return;
    }
    setErrores([]);
    setSaving(true);

    // Los campos base (ms, prot, em, fdn, precio_kg) van en número.
    // Los opcionales van en número si están cargados, o null si están vacíos.
    // Se duplican prot/pb y fdn/ndf para mantener compatibilidad con la
    // pantalla vieja (que lee prot/fdn) y con el motor (que lee pb/ndf).
    const prot = numOrNull(form.prot);
    const fdn = numOrNull(form.fdn);
    const al = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      ms: numOrNull(form.ms),
      prot,
      pb: prot,
      em: numOrNull(form.em),
      fdn,
      ndf: fdn,
      precio_kg: numOrNull(form.precio_kg) ?? 0,

      // Recomendados
      ca: numOrNull(form.ca),
      p: numOrNull(form.p),
      ee: numOrNull(form.ee),
      cenizas: numOrNull(form.cenizas),
      almidon: numOrNull(form.almidon),

      // Avanzados
      s: numOrNull(form.s),
      k: numOrNull(form.k),
      mg: numOrNull(form.mg),
      adf: numOrNull(form.adf),
      lignina: numOrNull(form.lignina),
      rup_pct_pb: numOrNull(form.rup_pct_pb),
      max_inclusion_pct: numOrNull(form.max_inclusion_pct),
      azucares: numOrNull(form.azucares),
    };

    const ref = await addDoc(userCol(uid, "alimentos_custom"), {
      ...al,
      updatedAt: new Date(),
    });
    onAddCustom({ ...al, id: ref.id, _id: ref.id });
    limpiarForm();
    setAvisos([]);
    setShowForm(false);
    setSaving(false);
  };

  const setF = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    // Limpiar avisos al editar cualquier campo, para que el segundo click
    // en Guardar no use avisos obsoletos.
    if (avisos.length) setAvisos([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Alimentos y Precios</h2>
        <Btn
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              limpiarForm();
              setErrores([]);
              setAvisos([]);
            }
          }}
          className="text-xs py-1.5"
        >
          {showForm ? "Cancelar" : "+ Agregar"}
        </Btn>
      </div>

      {alimentosSinPrecio.length > 0 && (
        <Card className="border-yellow-700/50 bg-yellow-950/30">
          <div className="text-yellow-400 font-bold text-sm mb-1">
            ⚠️ {alimentosSinPrecio.length} alimento(s) tienen precio 0
          </div>
          <p className="text-zinc-400 text-xs">
            Asigná un precio haciendo clic en el valor en verde. Sin precio, la ración no calculará el costo real.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {alimentosSinPrecio.slice(0, 5).map((al) => (
              <Badge key={al.id} color="yellow">
                {al.nombre.split("(")[0].trim()}
              </Badge>
            ))}
            {alimentosSinPrecio.length > 5 && (
              <Badge color="yellow">+{alimentosSinPrecio.length - 5} más</Badge>
            )}
          </div>
        </Card>
      )}

      <Card className="bg-sky-950/30 border-sky-700/40">
        <p className="text-sky-300 text-xs">
          💡 Tocá el precio en verde para editarlo. Los precios se guardan en tu cuenta.
        </p>
      </Card>

      {showForm && (
        <Card className="flex flex-col gap-4">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Nuevo alimento personalizado
          </div>

          {/* === BÁSICOS === */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Básicos (obligatorios)
            </div>
            <Inp
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setF("nombre", e.target.value)}
              placeholder="Ej: Pasto Colonial de mi potrero"
            />
            <Sel
              label="Categoría"
              value={form.categoria}
              onChange={(e) => setF("categoria", e.target.value)}
            >
              {CATEGORIAS_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {TIPO_LABELS[cat]}
                </option>
              ))}
            </Sel>
            <div className="grid grid-cols-2 gap-3">
              <Inp
                label="MS %"
                type="number"
                value={form.ms}
                onChange={(e) => setF("ms", e.target.value)}
                placeholder="Ej: 28"
              />
              <Inp
                label="PB %"
                type="number"
                value={form.prot}
                onChange={(e) => setF("prot", e.target.value)}
                placeholder="Ej: 9"
              />
              <Inp
                label="EM Mcal/kg MS"
                type="number"
                value={form.em}
                onChange={(e) => setF("em", e.target.value)}
                placeholder="Ej: 2.1"
              />
              <Inp
                label="FDN %"
                type="number"
                value={form.fdn}
                onChange={(e) => setF("fdn", e.target.value)}
                placeholder="Ej: 65"
              />
              <Inp
                label="Precio por kg (Bs)"
                type="number"
                value={form.precio_kg}
                onChange={(e) => setF("precio_kg", e.target.value)}
                placeholder="Ej: 0.80"
              />
            </div>
          </div>

          {/* === RECOMENDADOS === */}
          <div className="flex flex-col gap-3 border-t border-zinc-700 pt-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Recomendados (si los tenés)
            </div>
            <p className="text-zinc-500 text-xs -mt-2">
              Si los dejás vacíos, el motor los trata como desconocidos y te avisa cuando la dieta depende de ellos.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Inp
                label="Ca %"
                type="number"
                value={form.ca}
                onChange={(e) => setF("ca", e.target.value)}
                placeholder="Ej: 0.45"
              />
              <Inp
                label="P %"
                type="number"
                value={form.p}
                onChange={(e) => setF("p", e.target.value)}
                placeholder="Ej: 0.20"
              />
              <Inp
                label="Grasa (EE) %"
                type="number"
                value={form.ee}
                onChange={(e) => setF("ee", e.target.value)}
                placeholder="Ej: 2.5"
              />
              <Inp
                label="Cenizas %"
                type="number"
                value={form.cenizas}
                onChange={(e) => setF("cenizas", e.target.value)}
                placeholder="Ej: 8"
              />
              <Inp
                label="Almidón %"
                type="number"
                value={form.almidon}
                onChange={(e) => setF("almidon", e.target.value)}
                placeholder="Ej: 25"
              />
            </div>
          </div>

          {/* === AVANZADO (colapsable) === */}
          <div className="border-t border-zinc-700 pt-3">
            <button
              type="button"
              onClick={() => setShowAvanzado(!showAvanzado)}
              className="text-xs font-bold text-zinc-400 uppercase tracking-widest w-full text-left"
            >
              {showAvanzado ? "▼" : "▶"} Avanzado (opcional)
            </button>
            {showAvanzado && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Inp
                  label="S %"
                  type="number"
                  value={form.s}
                  onChange={(e) => setF("s", e.target.value)}
                  placeholder="Ej: 0.15"
                />
                <Inp
                  label="K %"
                  type="number"
                  value={form.k}
                  onChange={(e) => setF("k", e.target.value)}
                  placeholder="Ej: 1.5"
                />
                <Inp
                  label="Mg %"
                  type="number"
                  value={form.mg}
                  onChange={(e) => setF("mg", e.target.value)}
                  placeholder="Ej: 0.2"
                />
                <Inp
                  label="FDA %"
                  type="number"
                  value={form.adf}
                  onChange={(e) => setF("adf", e.target.value)}
                  placeholder="Ej: 38"
                />
                <Inp
                  label="Lignina %"
                  type="number"
                  value={form.lignina}
                  onChange={(e) => setF("lignina", e.target.value)}
                  placeholder="Ej: 6"
                />
                <Inp
                  label="RUP (% de PB)"
                  type="number"
                  value={form.rup_pct_pb}
                  onChange={(e) => setF("rup_pct_pb", e.target.value)}
                  placeholder="Ej: 30"
                />
                <Inp
                  label="Azúcares %"
                  type="number"
                  value={form.azucares}
                  onChange={(e) => setF("azucares", e.target.value)}
                  placeholder="Ej: 5"
                />
                <Inp
                  label="Máx. en la dieta %"
                  type="number"
                  value={form.max_inclusion_pct}
                  onChange={(e) => setF("max_inclusion_pct", e.target.value)}
                  placeholder="Ej: 25"
                />
              </div>
            )}
          </div>

          {/* === ERRORES === */}
          {errores.length > 0 && (
            <div className="border border-red-700 bg-red-950/30 rounded-lg p-3">
              <div className="text-red-400 font-bold text-xs mb-1">❌ No se puede guardar</div>
              {errores.map((e, i) => (
                <div key={i} className="text-red-300 text-xs">
                  • {e}
                </div>
              ))}
            </div>
          )}

          {/* === AVISOS === */}
          {avisos.length > 0 && (
            <div className="border border-amber-700 bg-amber-950/30 rounded-lg p-3">
              <div className="text-amber-400 font-bold text-xs mb-1">
                ⚠️ Revisá estos datos antes de guardar
              </div>
              {avisos.map((a, i) => (
                <div key={i} className="text-amber-300 text-xs">
                  • {a}
                </div>
              ))}
              <div className="text-amber-400 text-xs mt-2 italic">
                Si estás seguro de los datos, apretá Guardar de nuevo para confirmar.
              </div>
            </div>
          )}

          {/* === BOTONES === */}
          <div className="flex gap-2">
            <Btn onClick={guardar} disabled={saving} className="flex-1">
              {saving ? "Guardando..." : avisos.length > 0 ? "Confirmar y guardar" : "Guardar"}
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                limpiarForm();
                setErrores([]);
                setAvisos([]);
              }}
              className="flex-1"
            >
              Cancelar
            </Btn>
          </div>
        </Card>
      )}

      <Inp
        placeholder="Buscar alimento..."
        value={busq}
        onChange={(e) => setBusq(e.target.value)}
      />

      {CATEGORIAS_ORDER.map((cat) => {
        const grupo = filtrados.filter((a) => a.categoria === cat);
        if (!grupo.length) return null;
        return (
          <div key={cat}>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              {TIPO_LABELS[cat]}
            </div>
            <div className="flex flex-col gap-2">
              {grupo.map((al) => {
                const precio =
                  preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg;
                const minimo =
                  minsAlimentos[al.id] !== undefined ? minsAlimentos[al.id] : 0;
                const sinPrecio = precio === 0;
                const pbMostrar = al.pb ?? al.prot;
                const ndfMostrar = al.ndf ?? al.fdn;
                return (
                  <Card key={al.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="text-white font-semibold text-sm flex items-center gap-2">
                          {al.nombre}
                          {sinPrecio && <Badge color="yellow">⚠️ Sin precio</Badge>}
                        </div>
                        <div className="text-zinc-500 text-xs mt-0.5">
                          MS:{al.ms}% · PB:{pbMostrar}% · EM:{al.em} · FDN:{ndfMostrar}%
                        </div>
                        <div className="text-amber-400 text-xs mt-1">
                          Mínimo:{" "}
                          {editMinId === al.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editMinVal}
                                onChange={(e) => setEditMinVal(e.target.value)}
                                className="bg-zinc-700 border border-amber-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && saveMinimo(al.id)}
                              />
                              <button
                                onClick={() => saveMinimo(al.id)}
                                className="text-amber-400 font-bold px-1"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditMinId(null)}
                                className="text-zinc-500 px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditMinId(al.id);
                                setEditMinVal(minimo.toString());
                              }}
                              className="hover:underline"
                            >
                              {minimo > 0 ? `${minimo} kg/día` : "Sin mínimo"} ✏️
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {editId === al.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              className="bg-zinc-700 border border-emerald-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => e.key === "Enter" && savePrecio(al.id)}
                            />
                            <button
                              onClick={() => savePrecio(al.id)}
                              className="text-emerald-400 font-bold px-1"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="text-zinc-500 px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditId(al.id);
                              setEditVal(precio.toString());
                            }}
                            className={`text-emerald-400 font-bold text-sm hover:text-emerald-300 underline underline-offset-2 ${
                              sinPrecio ? "animate-pulse" : ""
                            }`}
                          >
                            Bs.{precio.toFixed(2)}/kg ✏️
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GestionAlimentos;