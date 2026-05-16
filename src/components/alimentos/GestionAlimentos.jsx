// src/components/alimentos/GestionAlimentos.jsx
import React, { useState } from "react";
import { addDoc } from "firebase/firestore";
import { userCol } from "../../utils/helpers";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import { ALIMENTOS_BASE, TIPOS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";

const GestionAlimentos = ({ preciosUsr, onPrecio, customAl, onAddCustom, uid, minsAlimentos, onSetMinimo }) => {
  const [busq, sB] = useState("");
  const [editId, sEI] = useState(null);
  const [editVal, sEV] = useState("");
  const [editMinId, sEMId] = useState(null);
  const [editMinVal, sEMVal] = useState("");
  const [showForm, sSF] = useState(false);
  const [saving, sSv] = useState(false);
  const [form, sForm] = useState({
    nombre: "",
    tipo: "energetico",
    ms: "",
    prot: "",
    em: "",
    fdn: "30",
    max_ms_pct: "",
  });
  const todos = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busq.toLowerCase()) ||
      TIPO_LABELS[a.tipo]?.toLowerCase().includes(busq.toLowerCase())
  );
  const savePrecio = async (id) => {
    const v = parseFloat(editVal);
    if (!isNaN(v) && v >= 0) {
      await onPrecio(id, v);
    }
    sEI(null);
  };
  const saveMinimo = async (id) => {
    const v = parseFloat(editMinVal);
    if (!isNaN(v) && v >= 0) {
      await onSetMinimo(id, v);
    }
    sEMId(null);
  };
  const guardar = async () => {
    if (!form.nombre || !form.ms) return alert("Completá nombre y MS%");
    sSv(true);
    const al = {
      ...form,
      ms: +form.ms,
      prot: +(form.prot || 0),
      em: +(form.em || 0),
      fdn: +(form.fdn || 30),
      max_ms_pct: form.max_ms_pct ? +form.max_ms_pct : null,
      precio_kg: 0,
    };
    const ref = await addDoc(userCol(uid, "alimentos_custom"), {
      ...al,
      updatedAt: new Date(),
    });
    onAddCustom({ ...al, id: ref.id, _id: ref.id });
    sForm({
      nombre: "",
      tipo: "energetico",
      ms: "",
      prot: "",
      em: "",
      fdn: "30",
      max_ms_pct: "",
    });
    sSF(false);
    sSv(false);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Alimentos y Precios</h2>
        <Btn onClick={() => sSF(!showForm)} className="text-xs py-1.5">
          + Agregar
        </Btn>
      </div>
      <Card className="bg-sky-950/30 border-sky-700/40">
        <p className="text-sky-300 text-xs">
          💡 Tocá el precio en verde para editarlo. Además podés definir un mínimo diario (kg) para que la ración siempre incluya esa cantidad.
        </p>
      </Card>
      {showForm && (
        <Card className="flex flex-col gap-3">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Nuevo alimento personalizado
          </div>
          <Inp
            label="Nombre"
            value={form.nombre}
            onChange={(e) => sForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej: Pasto Colonial"
          />
          <Sel
            label="Tipo"
            value={form.tipo}
            onChange={(e) => sForm((f) => ({ ...f, tipo: e.target.value }))}
          >
            {TIPOS_ORDER.map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </Sel>
          <div className="grid grid-cols-2 gap-3">
            <Inp
              label="MS %"
              type="number"
              value={form.ms}
              onChange={(e) => sForm((f) => ({ ...f, ms: e.target.value }))}
              placeholder="22"
            />
            <Inp
              label="PB %"
              type="number"
              value={form.prot}
              onChange={(e) => sForm((f) => ({ ...f, prot: e.target.value }))}
              placeholder="9"
            />
            <Inp
              label="EM Mcal/kg MS"
              type="number"
              value={form.em}
              onChange={(e) => sForm((f) => ({ ...f, em: e.target.value }))}
              placeholder="2.1"
            />
            <Inp
              label="FDN %"
              type="number"
              value={form.fdn}
              onChange={(e) => sForm((f) => ({ ...f, fdn: e.target.value }))}
              placeholder="65"
            />
            <Inp
              label="Máx MS ración %"
              type="number"
              value={form.max_ms_pct}
              onChange={(e) => sForm((f) => ({ ...f, max_ms_pct: e.target.value }))}
              placeholder="Opcional"
            />
          </div>
          <div className="flex gap-2">
            <Btn onClick={guardar} disabled={saving} className="flex-1">
              {saving ? "Guardando..." : "Guardar"}
            </Btn>
            <Btn variant="secondary" onClick={() => sSF(false)} className="flex-1">
              Cancelar
            </Btn>
          </div>
        </Card>
      )}
      <Inp
        placeholder="Buscar alimento..."
        value={busq}
        onChange={(e) => sB(e.target.value)}
      />
      {TIPOS_ORDER.map((tipo) => {
        const grupo = filtrados.filter((a) => a.tipo === tipo);
        if (!grupo.length) return null;
        return (
          <div key={tipo}>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              {TIPO_LABELS[tipo]}
            </div>
            <div className="flex flex-col gap-2">
              {grupo.map((al) => {
                const precio = preciosUsr[al.id] !== undefined ? preciosUsr[al.id] : al.precio_kg;
                const minimo = minsAlimentos[al.id] !== undefined ? minsAlimentos[al.id] : 0;
                return (
                  <Card key={al.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="text-white font-semibold text-sm">{al.nombre}</div>
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
                                onChange={(e) => sEMVal(e.target.value)}
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
                              <button onClick={() => sEMId(null)} className="text-zinc-500 px-1">
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                sEMId(al.id);
                                sEMVal(minimo.toString());
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
                              onChange={(e) => sEV(e.target.value)}
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
                            <button onClick={() => sEI(null)} className="text-zinc-500 px-1">
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              sEI(al.id);
                              sEV(precio.toString());
                            }}
                            className="text-emerald-400 font-bold text-sm hover:text-emerald-300 underline underline-offset-2"
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
