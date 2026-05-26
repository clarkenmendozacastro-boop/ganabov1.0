// src/components/animales/NuevoAnimal.jsx
import React, { useState } from "react";
import { addDoc } from "firebase/firestore";
import { userCol } from "../../utils/helpers";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import { RAZAS } from "../../data/razas";

const NuevoAnimal = ({ onGuardar, onBack, uid, grupos = [] }) => {
  const [f, sF] = useState({
    nombre: "",
    raza: "otro",
    sexo: "macho",
    peso_inicial: "",
    fecha_entrada: new Date().toISOString().slice(0, 10),
    notas: "",
    grupoId: "",
  });
  const [loading, sL] = useState(false);
  const set = (k, v) => sF((x) => ({ ...x, [k]: v }));
  
  const guardar = async () => {
    if (!f.nombre || !f.peso_inicial) return alert("Completá nombre y peso");
    sL(true);
    const animal = {
      ...f,
      peso_inicial: parseFloat(f.peso_inicial),
      pesadas: [
        {
          fecha: f.fecha_entrada,
          peso: parseFloat(f.peso_inicial),
          nota: "Peso de entrada",
        },
      ],
      grupoId: f.grupoId || null,
    };
    const ref = await addDoc(userCol(uid, "animales"), {
      ...animal,
      updatedAt: new Date(),
    });
    onGuardar({ ...animal, _id: ref.id });
    sL(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">
          ← Volver
        </Btn>
        <h2 className="text-2xl font-black text-white">Nuevo Animal</h2>
      </div>
      <Card className="flex flex-col gap-4">
        <Inp
          label="Nombre o N° de caravana"
          value={f.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Ej: Toro #001"
        />
        <Sel label="Raza" value={f.raza} onChange={(e) => set("raza", e.target.value)}>
          {RAZAS.map((r) => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </Sel>
        <Sel label="Sexo" value={f.sexo} onChange={(e) => set("sexo", e.target.value)}>
          <option value="macho">Macho (toro/novillo)</option>
          <option value="hembra">Hembra</option>
        </Sel>
        <Inp
          label="Peso inicial (kg)"
          type="number"
          value={f.peso_inicial}
          onChange={(e) => set("peso_inicial", e.target.value)}
          placeholder="Ej: 220"
        />
        <Inp
          label="Fecha de entrada"
          type="date"
          value={f.fecha_entrada}
          onChange={(e) => set("fecha_entrada", e.target.value)}
        />
        
        {/* Selector de grupo - aparece solo si hay grupos creados */}
        {grupos.length > 0 && (
          <Sel label="Grupo (opcional)" value={f.grupoId} onChange={(e) => set("grupoId", e.target.value)}>
            <option value="">Sin grupo</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </Sel>
        )}
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Notas (opcional)
          </label>
          <textarea
            className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none h-16 placeholder-zinc-500"
            value={f.notas}
            onChange={(e) => set("notas", e.target.value)}
            placeholder="Observaciones..."
          />
        </div>
        <Btn className="w-full py-3" onClick={guardar} disabled={loading}>
          {loading ? "Guardando..." : "Guardar Animal"}
        </Btn>
      </Card>
    </div>
  );
};

export default NuevoAnimal;
