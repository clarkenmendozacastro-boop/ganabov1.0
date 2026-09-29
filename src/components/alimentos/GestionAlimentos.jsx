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
// Utilidades del formulario
// ---------------------------------------------------------------------------

const FORM_INICIAL = {
  nombre: "",
  categoria: "forraje",
  ms: "",
  prot: "",
  em: "",
  fdn: "",
  precio_kg: "",
  ca: "",
  p: "",
  ee: "",
  cenizas: "",
  almidon: "",
  s: "",
  k: "",
  mg: "",
  adf: "",
  lignina: "",
  rup_pct_pb: "",
  max_inclusion_pct: "",
  azucares: "",
};

function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

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

function avisosCoherencia(f) {
  const avisos = [];
  const pb = numOrNull(f.prot);
  const ndf = numOrNull(f.fdn);
  const adf = numOrNull(f.adf);
  const ee = numOrNull(f.ee);
  const ca = numOrNull(f.ca);
  const p = numOrNull(f.p);
  if (pb !== null && pb > 60) avisos.push(`PB = ${pb}% es muy alta. ¿Es correcto?`);
  if (adf !== null && ndf !== null && adf > ndf)
    avisos.push(`ADF (${adf}%) no puede ser mayor que FDN (${ndf}%).`);
  if (ee !== null && ee > 30 && f.categoria === "forraje")
    avisos.push(`Grasa (EE) = ${ee}% es muy alta para un forraje. ¿Es correcto?`);
  if (ca !== null && p !== null && p > 0) {
    const ratio = ca / p;
    if (ratio > 10) avisos.push(`Relación Ca:P = ${ratio.toFixed(1)} es muy alta.`);
    if (ratio < 0.1) avisos.push(`Relación Ca:P = ${ratio.toFixed(2)} es muy baja.`);
  }
  return avisos;
}

/** Convierte un valor numérico o null a string para el input. */
function toInput(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

const GestionAlimentos = ({
  preciosUsr, onPrecio, customAl, onAddCustom, uid, minsAlimentos, onSetMinimo,
  overridesAl = {}, onSetOverride, onDeleteOverride,
}) => {
  const [busq, setBusq] = useState("");
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editMinId, setEditMinId] = useState(null);
  const [editMinVal, setEditMinVal] = useState("");

  // Formulario "+ Agregar" (alimento nuevo)
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [errores, setErrores] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [showAvanzado, setShowAvanzado] = useState(false);

  // Formulario "Editar" (override de un alimento de la base)
  const [overrideId, setOverrideId] = useState(null);
  const [overrideBase, setOverrideBase] = useState(null);
  const [overrideForm, setOverrideForm] = useState({ ...FORM_INICIAL });
  const [overrideErrores, setOverrideErrores] = useState([]);
  const [overrideAvisos, setOverrideAvisos] = useState([]);
  const [showAvanzadoOverride, setShowAvanzadoOverride] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

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
    if (!isNaN(v) && v >= 0) await onPrecio(id, v);
    setEditId(null);
  };

  const saveMinimo = async (id) => {
    const v = parseFloat(editMinVal);
    if (!isNaN(v) && v >= 0) await onSetMinimo(id, v);
    setEditMinId(null);
  };

  const limpiarForm = () => setForm({ ...FORM_INICIAL });
  const limpiarOverride = () => {
    setOverrideId(null);
    setOverrideBase(null);
    setOverrideForm({ ...FORM_INICIAL });
    setOverrideErrores([]);
    setOverrideAvisos([]);
  };

  const setF = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (avisos.length) setAvisos([]);
  };

  const setOvF = (campo, valor) => {
    setOverrideForm((f) => ({ ...f, [campo]: valor }));
    if (overrideAvisos.length) setOverrideAvisos([]);
  };

  // -------------------------------------------------------------------------
  // Guardar alimento nuevo
  // -------------------------------------------------------------------------
  const guardar = async () => {
    const errs = validarDuros(form);
    if (errs.length > 0) {
      setErrores(errs);
      return;
    }
    const warns = avisosCoherencia(form);
    if (warns.length > 0 && !avisos.length) {
      setAvisos(warns);
      return;
    }
    setErrores([]);
    setSaving(true);

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
      ca: numOrNull(form.ca),
      p: numOrNull(form.p),
      ee: numOrNull(form.ee),
      cenizas: numOrNull(form.cenizas),
      almidon: numOrNull(form.almidon),
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

  // -------------------------------------------------------------------------
  // Abrir formulario de override
  // -------------------------------------------------------------------------
  const abrirOverride = (al) => {
    // Cerrar el formulario de "nuevo" si estaba abierto
    setShowForm(false);
    limpiarForm();
    setErrores([]);
    setAvisos([]);

    setOverrideBase(al);
    setOverrideId(al.id);

    // Precargar el formulario con los valores ACTUALES del alimento (que ya
    // incluyen el override si lo tiene). Así el productor ve lo que está
    // usando hoy y modifica solo lo que quiere cambiar.
    setOverrideForm({
      nombre: al.nombre || "",
      categoria: al.categoria || "forraje",
      ms: toInput(al.ms),
      prot: toInput(al.pb ?? al.prot),
      em: toInput(al.em),
      fdn: toInput(al.ndf ?? al.fdn),
      precio_kg: toInput(preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg),
      ca: toInput(al.ca),
      p: toInput(al.p),
      ee: toInput(al.ee),
      cenizas: toInput(al.cenizas),
      almidon: toInput(al.almidon),
      s: toInput(al.s),
      k: toInput(al.k),
      mg: toInput(al.mg),
      adf: toInput(al.adf),
      lignina: toInput(al.lignina),
      rup_pct_pb: toInput(al.rup_pct_pb),
      max_inclusion_pct: toInput(al.max_inclusion_pct),
      azucares: toInput(al.azucares),
    });
    setShowAvanzadoOverride(false);
  };

  // -------------------------------------------------------------------------
  // Guardar override: detecta cambios y los persiste
  // -------------------------------------------------------------------------
  const guardarOverride = async () => {
    if (!overrideBase) return;

    const warns = avisosCoherencia(overrideForm);
    if (warns.length > 0 && !overrideAvisos.length) {
      setOverrideAvisos(warns);
      return;
    }

    // Comparar con el original de la base (no con el actual). Esto permite
    // que si el usuario cambió algo dos veces, el override refleje el valor
    // del usuario y no el de la base.
    const original = ALIMENTOS_BASE.find((a) => a.id === overrideBase.id) || overrideBase;
    const campos = {};
    const CAMPOS = [
      'ms','pb','em','ndf','ca','p','ee','cenizas','almidon',
      's','k','mg','adf','lignina','rup_pct_pb','max_inclusion_pct','azucares',
    ];

    for (const c of CAMPOS) {
      const inputKey = c === 'pb' ? 'prot' : c === 'ndf' ? 'fdn' : c;
      const valOriginal = numOrNull(original[c]);
      const valNuevo = numOrNull(overrideForm[inputKey]);
      // Si el usuario dejó vacío, no toca el campo.
      if (valNuevo === null) continue;
      // Si es igual al original, no lo guarda.
      if (valOriginal !== null && valOriginal === valNuevo) continue;

      campos[c] = valNuevo;
      // Duplicar prot/pb y fdn/ndf para compatibilidad
      if (c === 'pb') campos.prot = valNuevo;
      if (c === 'ndf') campos.fdn = valNuevo;
    }

    // El precio también se puede overridear
    const precioInput = numOrNull(overrideForm.precio_kg);
    const precioOriginal = numOrNull(original.precio_kg);
    if (precioInput !== null && precioInput !== precioOriginal) {
      campos.precio_kg = precioInput;
    }

    setSavingOverride(true);

    if (Object.keys(campos).length === 0) {
      // No hay cambios: si ya había override, lo eliminamos; si no, cerramos.
      if (overridesAl[overrideBase.id]) {
        await onDeleteOverride(overrideBase.id);
      }
      limpiarOverride();
      setSavingOverride(false);
      return;
    }

    await onSetOverride(overrideBase.id, campos);
    limpiarOverride();
    setSavingOverride(false);
  };

  // -------------------------------------------------------------------------
  // Borrar override
  // -------------------------------------------------------------------------
  const borrarOverride = async (al) => {
    if (!confirm(`¿Restaurar "${al.nombre}" a los valores originales de la base?\n\nSe pierden los cambios que cargaste.`)) return;
    await onDeleteOverride(al.id);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Alimentos y Precios</h2>
        <Btn
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) { limpiarForm(); setErrores([]); setAvisos([]); }
            if (overrideId) limpiarOverride();
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
          💡 Tocá el precio en verde para editarlo. Tocá ✏️ Editar en cualquier alimento de la base para reemplazar sus valores por los de tu análisis.
        </p>
      </Card>

      {/* ======================= FORM: Nuevo alimento ======================= */}
      {showForm && (
        <Card className="flex flex-col gap-4 border-emerald-700/50">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Nuevo alimento personalizado
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Básicos (obligatorios)</div>
            <Inp label="Nombre" value={form.nombre} onChange={(e) => setF("nombre", e.target.value)} placeholder="Ej: Pasto de mi potrero" />
            <Sel label="Categoría" value={form.categoria} onChange={(e) => setF("categoria", e.target.value)}>
              {CATEGORIAS_ORDER.map((cat) => (
                <option key={cat} value={cat}>{TIPO_LABELS[cat]}</option>
              ))}
            </Sel>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="MS %" type="number" value={form.ms} onChange={(e) => setF("ms", e.target.value)} placeholder="Ej: 28" />
              <Inp label="PB %" type="number" value={form.prot} onChange={(e) => setF("prot", e.target.value)} placeholder="Ej: 9" />
              <Inp label="EM Mcal/kg MS" type="number" value={form.em} onChange={(e) => setF("em", e.target.value)} placeholder="Ej: 2.1" />
              <Inp label="FDN %" type="number" value={form.fdn} onChange={(e) => setF("fdn", e.target.value)} placeholder="Ej: 65" />
              <Inp label="Precio por kg (Bs)" type="number" value={form.precio_kg} onChange={(e) => setF("precio_kg", e.target.value)} placeholder="Ej: 0.80" />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-700 pt-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">Recomendados (si los tenés)</div>
            <p className="text-zinc-500 text-xs -mt-2">Si los dejás vacíos, el motor los trata como desconocidos y te avisa cuando la dieta depende de ellos.</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Ca %" type="number" value={form.ca} onChange={(e) => setF("ca", e.target.value)} placeholder="Ej: 0.45" />
              <Inp label="P %" type="number" value={form.p} onChange={(e) => setF("p", e.target.value)} placeholder="Ej: 0.20" />
              <Inp label="Grasa (EE) %" type="number" value={form.ee} onChange={(e) => setF("ee", e.target.value)} placeholder="Ej: 2.5" />
              <Inp label="Cenizas %" type="number" value={form.cenizas} onChange={(e) => setF("cenizas", e.target.value)} placeholder="Ej: 8" />
              <Inp label="Almidón %" type="number" value={form.almidon} onChange={(e) => setF("almidon", e.target.value)} placeholder="Ej: 25" />
            </div>
          </div>

          <div className="border-t border-zinc-700 pt-3">
            <button type="button" onClick={() => setShowAvanzado(!showAvanzado)} className="text-xs font-bold text-zinc-400 uppercase tracking-widest w-full text-left">
              {showAvanzado ? "▼" : "▶"} Avanzado (opcional)
            </button>
            {showAvanzado && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Inp label="S %" type="number" value={form.s} onChange={(e) => setF("s", e.target.value)} placeholder="Ej: 0.15" />
                <Inp label="K %" type="number" value={form.k} onChange={(e) => setF("k", e.target.value)} placeholder="Ej: 1.5" />
                <Inp label="Mg %" type="number" value={form.mg} onChange={(e) => setF("mg", e.target.value)} placeholder="Ej: 0.2" />
                <Inp label="FDA %" type="number" value={form.adf} onChange={(e) => setF("adf", e.target.value)} placeholder="Ej: 38" />
                <Inp label="Lignina %" type="number" value={form.lignina} onChange={(e) => setF("lignina", e.target.value)} placeholder="Ej: 6" />
                <Inp label="RUP (% de PB)" type="number" value={form.rup_pct_pb} onChange={(e) => setF("rup_pct_pb", e.target.value)} placeholder="Ej: 30" />
                <Inp label="Azúcares %" type="number" value={form.azucares} onChange={(e) => setF("azucares", e.target.value)} placeholder="Ej: 5" />
                <Inp label="Máx. en la dieta %" type="number" value={form.max_inclusion_pct} onChange={(e) => setF("max_inclusion_pct", e.target.value)} placeholder="Ej: 25" />
              </div>
            )}
          </div>

          {errores.length > 0 && (
            <div className="border border-red-700 bg-red-950/30 rounded-lg p-3">
              <div className="text-red-400 font-bold text-xs mb-1">❌ No se puede guardar</div>
              {errores.map((e, i) => <div key={i} className="text-red-300 text-xs">• {e}</div>)}
            </div>
          )}
          {avisos.length > 0 && (
            <div className="border border-amber-700 bg-amber-950/30 rounded-lg p-3">
              <div className="text-amber-400 font-bold text-xs mb-1">⚠️ Revisá estos datos antes de guardar</div>
              {avisos.map((a, i) => <div key={i} className="text-amber-300 text-xs">• {a}</div>)}
              <div className="text-amber-400 text-xs mt-2 italic">Si estás seguro, apretá Guardar de nuevo.</div>
            </div>
          )}

          <div className="flex gap-2">
            <Btn onClick={guardar} disabled={saving} className="flex-1">
              {saving ? "Guardando..." : avisos.length > 0 ? "Confirmar y guardar" : "Guardar"}
            </Btn>
            <Btn variant="secondary" onClick={() => { setShowForm(false); limpiarForm(); setErrores([]); setAvisos([]); }} className="flex-1">
              Cancelar
            </Btn>
          </div>
        </Card>
      )}

      {/* ======================= FORM: Override ======================= */}
      {overrideId && overrideBase && (
        <Card className="flex flex-col gap-4 border-amber-700/50">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">✏️ Editar alimento</div>
              <div className="text-white font-semibold mt-1">{overrideBase.nombre}</div>
              <div className="text-zinc-500 text-xs mt-0.5">
                Modificá solo los campos que tengas medidos. Los que dejes vacíos siguen siendo los originales.
              </div>
            </div>
            <Btn variant="ghost" onClick={limpiarOverride} className="text-xs py-1 px-2">✕ Cerrar</Btn>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-700 pt-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">Campos editables</div>

            <div className="grid grid-cols-2 gap-3">
              <Inp label="MS %" type="number" value={overrideForm.ms} onChange={(e) => setOvF("ms", e.target.value)} />
              <Inp label="PB %" type="number" value={overrideForm.prot} onChange={(e) => setOvF("prot", e.target.value)} />
              <Inp label="EM Mcal/kg MS" type="number" value={overrideForm.em} onChange={(e) => setOvF("em", e.target.value)} />
              <Inp label="FDN %" type="number" value={overrideForm.fdn} onChange={(e) => setOvF("fdn", e.target.value)} />
              <Inp label="Precio Bs/kg" type="number" value={overrideForm.precio_kg} onChange={(e) => setOvF("precio_kg", e.target.value)} />
              <Inp label="Ca %" type="number" value={overrideForm.ca} onChange={(e) => setOvF("ca", e.target.value)} />
              <Inp label="P %" type="number" value={overrideForm.p} onChange={(e) => setOvF("p", e.target.value)} />
              <Inp label="EE (grasa) %" type="number" value={overrideForm.ee} onChange={(e) => setOvF("ee", e.target.value)} />
              <Inp label="Cenizas %" type="number" value={overrideForm.cenizas} onChange={(e) => setOvF("cenizas", e.target.value)} />
              <Inp label="Almidón %" type="number" value={overrideForm.almidon} onChange={(e) => setOvF("almidon", e.target.value)} />
            </div>

            <button type="button" onClick={() => setShowAvanzadoOverride(!showAvanzadoOverride)} className="text-xs font-bold text-zinc-400 uppercase tracking-widest w-full text-left mt-2">
              {showAvanzadoOverride ? "▼" : "▶"} Avanzado (opcional)
            </button>
            {showAvanzadoOverride && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Inp label="S %" type="number" value={overrideForm.s} onChange={(e) => setOvF("s", e.target.value)} />
                <Inp label="K %" type="number" value={overrideForm.k} onChange={(e) => setOvF("k", e.target.value)} />
                <Inp label="Mg %" type="number" value={overrideForm.mg} onChange={(e) => setOvF("mg", e.target.value)} />
                <Inp label="FDA %" type="number" value={overrideForm.adf} onChange={(e) => setOvF("adf", e.target.value)} />
                <Inp label="Lignina %" type="number" value={overrideForm.lignina} onChange={(e) => setOvF("lignina", e.target.value)} />
                <Inp label="RUP (% de PB)" type="number" value={overrideForm.rup_pct_pb} onChange={(e) => setOvF("rup_pct_pb", e.target.value)} />
                <Inp label="Azúcares %" type="number" value={overrideForm.azucares} onChange={(e) => setOvF("azucares", e.target.value)} />
                <Inp label="Máx. en la dieta %" type="number" value={overrideForm.max_inclusion_pct} onChange={(e) => setOvF("max_inclusion_pct", e.target.value)} />
              </div>
            )}
          </div>

          {overrideAvisos.length > 0 && (
            <div className="border border-amber-700 bg-amber-950/30 rounded-lg p-3">
              <div className="text-amber-400 font-bold text-xs mb-1">⚠️ Revisá estos datos antes de guardar</div>
              {overrideAvisos.map((a, i) => <div key={i} className="text-amber-300 text-xs">• {a}</div>)}
              <div className="text-amber-400 text-xs mt-2 italic">Si estás seguro, apretá Guardar de nuevo.</div>
            </div>
          )}

          <div className="flex gap-2">
            <Btn onClick={guardarOverride} disabled={savingOverride} className="flex-1">
              {savingOverride ? "Guardando..." : overrideAvisos.length > 0 ? "Confirmar y guardar" : "Guardar cambios"}
            </Btn>
            <Btn variant="secondary" onClick={limpiarOverride} className="flex-1">
              Cancelar
            </Btn>
          </div>
        </Card>
      )}

      <Inp placeholder="Buscar alimento..." value={busq} onChange={(e) => setBusq(e.target.value)} />

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
                const precio = preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg;
                const minimo = minsAlimentos[al.id] !== undefined ? minsAlimentos[al.id] : 0;
                const sinPrecio = precio === 0;
                const pbMostrar = al.pb ?? al.prot;
                const ndfMostrar = al.ndf ?? al.fdn;
                const esCustom = customAl.some((c) => c.id === al.id);
                const esBase = !esCustom && ALIMENTOS_BASE.some((b) => b.id === al.id);
                const tieneOv = !!(overridesAl && overridesAl[al.id]);
                const original = esBase ? ALIMENTOS_BASE.find((b) => b.id === al.id) : null;
                return (
                  <Card key={al.id} className={`py-3 ${tieneOv ? "border-amber-700/50 bg-amber-950/10" : ""}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="text-white font-semibold text-sm flex items-center gap-2 flex-wrap">
                          {al.nombre}
                          {sinPrecio && <Badge color="yellow">⚠️ Sin precio</Badge>}
                          {tieneOv && <Badge color="yellow">✏️ Editado</Badge>}
                        </div>
                        <div className="text-zinc-500 text-xs mt-0.5">
                          MS:{al.ms}% · PB:{pbMostrar}% · EM:{al.em} · FDN:{ndfMostrar}%
                        </div>
                        {tieneOv && original && (
                          <div className="text-zinc-600 text-xs mt-0.5 italic">
                            Base: MS:{original.ms}% · PB:{original.pb}% · EM:{original.em} · FDN:{original.ndf}%
                          </div>
                        )}
                        <div className="text-amber-400 text-xs mt-1">
                          Mínimo:{" "}
                          {editMinId === al.id ? (
                            <div className="flex items-center gap-1">
                              <input type="number" value={editMinVal} onChange={(e) => setEditMinVal(e.target.value)}
                                className="bg-zinc-700 border border-amber-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none"
                                autoFocus onKeyDown={(e) => e.key === "Enter" && saveMinimo(al.id)} />
                              <button onClick={() => saveMinimo(al.id)} className="text-amber-400 font-bold px-1">✓</button>
                              <button onClick={() => setEditMinId(null)} className="text-zinc-500 px-1">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditMinId(al.id); setEditMinVal(minimo.toString()); }} className="hover:underline">
                              {minimo > 0 ? `${minimo} kg/día` : "Sin mínimo"} ✏️
                            </button>
                          )}
                        </div>

                        {/* Botones de override */}
                        <div className="flex gap-2 mt-2">
                          {esBase && (
                            <button
                              onClick={() => abrirOverride(al)}
                              className="text-amber-400 text-xs hover:text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded-full"
                            >
                              ✏️ Editar
                            </button>
                          )}
                          {tieneOv && (
                            <button
                              onClick={() => borrarOverride(al)}
                              className="text-zinc-400 text-xs hover:text-zinc-200 bg-zinc-800/50 px-2 py-0.5 rounded-full"
                            >
                              ↺ Restaurar
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {editId === al.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                              className="bg-zinc-700 border border-emerald-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none"
                              autoFocus onKeyDown={(e) => e.key === "Enter" && savePrecio(al.id)} />
                            <button onClick={() => savePrecio(al.id)} className="text-emerald-400 font-bold px-1">✓</button>
                            <button onClick={() => setEditId(null)} className="text-zinc-500 px-1">✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditId(al.id); setEditVal(precio.toString()); }}
                            className={`text-emerald-400 font-bold text-sm hover:text-emerald-300 underline underline-offset-2 ${sinPrecio ? "animate-pulse" : ""}`}
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