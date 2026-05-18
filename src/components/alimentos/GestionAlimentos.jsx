// src/components/alimentos/GestionAlimentos.jsx

import React, { useState } from "react";
import { addDoc } from "firebase/firestore";

import { userCol } from "../../utils/helpers";

import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";

import {
  ALIMENTOS_BASE,
  CATEGORIAS_ORDER,
  TIPO_LABELS,
} from "../../data/alimentosBase";

const GestionAlimentos = ({
  preciosUsr,
  onPrecio,
  customAl,
  onAddCustom,
  uid,
  minsAlimentos,
  onSetMinimo,
}) => {
  const [busq, setBusq] = useState("");

  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");

  const [editMinId, setEditMinId] = useState(null);
  const [editMinVal, setEditMinVal] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    categoria: "energetico",
    ms: "",
    prot: "",
    em: "",
    fdn: "30",
    max_ms_pct: "",
  });

  const todos = [...ALIMENTOS_BASE, ...customAl];

  const filtrados = todos.filter((a) => {
    const nombre = a.nombre?.toLowerCase() || "";
    const categoria = a.categoria || "";

    return (
      nombre.includes(busq.toLowerCase()) ||
      (TIPO_LABELS[categoria] || "")
        .toLowerCase()
        .includes(busq.toLowerCase())
    );
  });

  const savePrecio = async (id) => {
    const valor = parseFloat(editVal);

    if (!isNaN(valor) && valor >= 0) {
      await onPrecio(id, valor);
    }

    setEditId(null);
  };

  const saveMinimo = async (id) => {
    const valor = parseFloat(editMinVal);

    if (!isNaN(valor) && valor >= 0) {
      await onSetMinimo(id, valor);
    }

    setEditMinId(null);
  };

  const guardar = async () => {
    if (!form.nombre || !form.ms) {
      alert("Completá nombre y MS%");
      return;
    }

    try {
      setSaving(true);

      const alimento = {
        ...form,
        ms: +form.ms,
        prot: +(form.prot || 0),
        em: +(form.em || 0),
        fdn: +(form.fdn || 30),
        max_ms_pct: form.max_ms_pct
          ? +form.max_ms_pct
          : null,
        precio_kg: 0,
      };

      const ref = await addDoc(
        userCol(uid, "alimentos_custom"),
        {
          ...alimento,
          updatedAt: new Date(),
        }
      );

      onAddCustom({
        ...alimento,
        id: ref.id,
        _id: ref.id,
      });

      setForm({
        nombre: "",
        categoria: "energetico",
        ms: "",
        prot: "",
        em: "",
        fdn: "30",
        max_ms_pct: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar alimento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">
          🌾 Alimentos y Precios
        </h2>

        <Btn
          onClick={() => setShowForm(!showForm)}
          className="text-xs py-1.5"
        >
          + Agregar
        </Btn>
      </div>

      <Card className="bg-sky-950/30 border-sky-700/40">
        <p className="text-sky-300 text-xs">
          💡 Tocá el precio para editarlo.
          También podés definir mínimos diarios
          para incluir siempre ciertos alimentos.
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
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                nombre: e.target.value,
              }))
            }
            placeholder="Ej: Pasto Colonial"
          />

          <Sel
            label="Categoría"
            value={form.categoria}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                categoria: e.target.value,
              }))
            }
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
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ms: e.target.value,
                }))
              }
            />

            <Inp
              label="PB %"
              type="number"
              value={form.prot}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  prot: e.target.value,
                }))
              }
            />

            <Inp
              label="EM"
              type="number"
              value={form.em}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  em: e.target.value,
                }))
              }
            />

            <Inp
              label="FDN %"
              type="number"
              value={form.fdn}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fdn: e.target.value,
                }))
              }
            />

            <Inp
              label="Máx % MS"
              type="number"
              value={form.max_ms_pct}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  max_ms_pct: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex gap-2">
            <Btn
              onClick={guardar}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Guardando..." : "Guardar"}
            </Btn>

            <Btn
              variant="secondary"
              onClick={() => setShowForm(false)}
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

      {CATEGORIAS_ORDER.map((categoria) => {
        const grupo = filtrados.filter(
          (a) => a.categoria === categoria
        );

        if (!grupo.length) return null;

        return (
          <div key={categoria}>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              {TIPO_LABELS[categoria]}
            </div>

            <div className="flex flex-col gap-2">
              {grupo.map((al) => {
                const precio =
                  preciosUsr[al.id] !== undefined
                    ? preciosUsr[al.id]
                    : al.precio_kg;

                const minimo =
                  minsAlimentos[al.id] !== undefined
                    ? minsAlimentos[al.id]
                    : 0;

                return (
                  <Card key={al.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="text-white font-semibold text-sm">
                          {al.nombre}
                        </div>

                        <div className="text-zinc-500 text-xs mt-0.5">
                          MS:{al.ms}% · PB:{al.prot}% ·
                          EM:{al.em} · FDN:{al.fdn}%
                        </div>

                        <div className="text-amber-400 text-xs mt-1">
                          Mínimo:
                          {" "}

                          {editMinId === al.id ? (
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="number"
                                value={editMinVal}
                                onChange={(e) =>
                                  setEditMinVal(e.target.value)
                                }
                                className="bg-zinc-700 border border-amber-500 rounded-lg px-2 py-1 text-white text-sm w-20"
                                autoFocus
                              />

                              <button
                                onClick={() =>
                                  saveMinimo(al.id)
                                }
                                className="text-amber-400 font-bold"
                              >
                                ✓
                              </button>

                              <button
                                onClick={() =>
                                  setEditMinId(null)
                                }
                                className="text-zinc-500"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditMinId(al.id);
                                setEditMinVal(
                                  minimo.toString()
                                );
                              }}
                              className="hover:underline"
                            >
                              {minimo > 0
                                ? `${minimo} kg/día`
                                : "Sin mínimo"}{" "}
                              ✏️
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
                              onChange={(e) =>
                                setEditVal(e.target.value)
                              }
                              className="bg-zinc-700 border border-emerald-500 rounded-lg px-2 py-1 text-white text-sm w-20"
                              autoFocus
                            />

                            <button
                              onClick={() =>
                                savePrecio(al.id)
                              }
                              className="text-emerald-400 font-bold"
                            >
                              ✓
                            </button>

                            <button
                              onClick={() =>
                                setEditId(null)
                              }
                              className="text-zinc-500"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditId(al.id);
                              setEditVal(
                                precio.toString()
                              );
                            }}
                            className="text-emerald-400 font-bold text-sm underline"
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
