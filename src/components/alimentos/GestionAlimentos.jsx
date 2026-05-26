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

const GestionAlimentos = ({ preciosUsr, onPrecio, customAl, onAddCustom, uid, minsAlimentos, onSetMinimo }) => {
  const [busq, setBusq] = useState("");
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editMinId, setEditMinId] = useState(null);
  const [editMinVal, setEditMinVal] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "forraje",
    ms: "",
    prot: "",
    em: "",
    fdn: "30",
    precio_kg: "",
  });

  const todos = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busq.toLowerCase()) ||
      (TIPO_LABELS[a.categoria] || "").toLowerCase().includes(busq.toLowerCase())
  );

  // Alimentos sin precio (precio actual === 0)
  const alimentosSinPrecio = filtrados.filter(al => {
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

  const guardar = async () => {
    if (!form.nombre || !form.ms) return alert("Completá nombre y MS%");
    setSaving(true);
    const al = {
      ...form,
      ms: +form.ms,
      prot: +(form.prot || 0),
      em: +(form.em || 0),
      fdn: +(form.fdn || 30),
      precio_kg: +(form.precio_kg || 0),
    };
    const ref = await addDoc(userCol(uid, "alimentos_custom"), {
      ...al,
      updatedAt: new Date(),
    });
    onAddCustom({ ...al, id: ref.id, _id: ref.id });
    setForm({ nombre: "", categoria: "forraje", ms: "", prot: "", em: "", fdn: "30", precio_kg: "" });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Alimentos y Precios</h2>
        <Btn onClick={() => setShowForm(!showForm)} className="text-xs py-1.5">
          + Agregar
        </Btn>
      </div>

      {/* Notificación de alimentos sin precio */}
      {alimentosSinPrecio.length > 0 && (
        <Card className="border-yellow-700/50 bg-yellow-950/30">
          <div className="text-yellow-400 font-bold text-sm mb-1">
            ⚠️ {alimentosSinPrecio.length} alimento(s) tienen precio 0
          </div>
          <p className="text-zinc-400 text-xs">
            Asigná un precio haciendo clic en el valor en verde. Sin precio, la ración no calculará el costo real.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {alimentosSinPrecio.slice(0, 5).map(al => (
              <Badge key={al.id} color="yellow">{al.nombre.split("(")[0].trim()}</Badge>
            ))}
            {alimentosSinPrecio.length > 5 && <Badge color="yellow">+{alimentosSinPrecio.length - 5} más</Badge>}
          </div>
        </Card>
      )}

      <Card className="bg-sky-950/30 border-sky-700/40">
        <p className="text-sky-300 text-xs">
          💡 Tocá el precio en verde para editarlo. Los precios se guardan en tu cuenta.
        </p>
      </Card>

      {showForm && (
        <Card className="flex flex-col gap-3">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nuevo alimento personalizado</div>
          <Inp label="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Pasto Colonial" />
          <Sel label="Categoría" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
            {CATEGORIAS_ORDER.map(cat => <option key={cat} value={cat}>{TIPO_LABELS[cat]}</option>)}
          </Sel>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="MS %" type="number" value={form.ms} onChange={e => setForm(f => ({ ...f, ms: e.target.value }))} placeholder="22" />
            <Inp label="PB %" type="number" value={form.prot} onChange={e => setForm(f => ({ ...f, prot: e.target.value }))} placeholder="9" />
            <Inp label="EM Mcal/kg MS" type="number" value={form.em} onChange={e => setForm(f => ({ ...f, em: e.target.value }))} placeholder="2.1" />
            <Inp label="FDN %" type="number" value={form.fdn} onChange={e => setForm(f => ({ ...f, fdn: e.target.value }))} placeholder="65" />
            <Inp label="Precio por kg (Bs)" type="number" value={form.precio_kg} onChange={e => setForm(f => ({ ...f, precio_kg: e.target.value }))} placeholder="0" />
          </div>
          <div className="flex gap-2">
            <Btn onClick={guardar} disabled={saving} className="flex-1">{saving ? "Guardando..." : "Guardar"}</Btn>
            <Btn variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Btn>
          </div>
        </Card>
      )}

      <Inp placeholder="Buscar alimento..." value={busq} onChange={e => setBusq(e.target.value)} />

      {CATEGORIAS_ORDER.map(cat => {
        const grupo = filtrados.filter(a => a.categoria === cat);
        if (!grupo.length) return null;
        return (
          <div key={cat}>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{TIPO_LABELS[cat]}</div>
            <div className="flex flex-col gap-2">
              {grupo.map(al => {
                const precio = preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg;
                const minimo = minsAlimentos[al.id] !== undefined ? minsAlimentos[al.id] : 0;
                const sinPrecio = precio === 0;
                return (
                  <Card key={al.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="text-white font-semibold text-sm flex items-center gap-2">
                          {al.nombre}
                          {sinPrecio && <Badge color="yellow">⚠️ Sin precio</Badge>}
                        </div>
                        <div className="text-zinc-500 text-xs mt-0.5">
                          MS:{al.ms}% · PB:{al.prot}% · EM:{al.em} · FDN:{al.fdn}%
                        </div>
                        <div className="text-amber-400 text-xs mt-1">
                          Mínimo:{" "}
                          {editMinId === al.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editMinVal}
                                onChange={e => setEditMinVal(e.target.value)}
                                className="bg-zinc-700 border border-amber-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none"
                                autoFocus
                                onKeyDown={e => e.key === "Enter" && saveMinimo(al.id)}
                              />
                              <button onClick={() => saveMinimo(al.id)} className="text-amber-400 font-bold px-1">✓</button>
                              <button onClick={() => setEditMinId(null)} className="text-zinc-500 px-1">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditMinId(al.id); setEditMinVal(minimo.toString()); }} className="hover:underline">
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
                              onChange={e => setEditVal(e.target.value)}
                              className="bg-zinc-700 border border-emerald-500 rounded-lg px-2 py-1 text-white text-sm w-20 focus:outline-none"
                              autoFocus
                              onKeyDown={e => e.key === "Enter" && savePrecio(al.id)}
                            />
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
