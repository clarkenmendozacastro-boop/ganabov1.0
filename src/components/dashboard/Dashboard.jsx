// src/components/dashboard/Dashboard.jsx
import React from "react";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import { RAZAS } from "../../data/razas";
import { calcularGDP } from "../../utils/helpers";

const Dashboard = ({ animales, onNav, isAdmin }) => {
  const alertas = animales.filter((a) => {
    const g = calcularGDP(a.pesadas);
    const r = RAZAS.find((x) => x.id === a.raza) || RAZAS[8];
    return a.pesadas?.length >= 2 && g < r.gdp_base * 0.7;
  }).length;
  const listos = animales.filter((a) => {
    const u =
      a.pesadas?.length > 0
        ? a.pesadas[a.pesadas.length - 1].peso
        : a.peso_inicial;
    return u >= 430;
  }).length;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Panel Principal</h2>
          <p className="text-zinc-500 text-sm">Santa Cruz · Bolivia · Engorde bovino</p>
        </div>
        {isAdmin && <Badge color="purple">👑 Admin</Badge>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Animales", v: animales.length, i: "🐄", c: "text-emerald-400" },
          { l: "Alertas", v: alertas, i: "⚠️", c: "text-amber-400" },
          { l: "Listos", v: listos, i: "✅", c: "text-sky-400" },
        ].map((s) => (
          <Card key={s.l} className="text-center py-4">
            <div className="text-2xl mb-1">{s.i}</div>
            <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
            <div className="text-zinc-500 text-xs">{s.l}</div>
          </Card>
        ))}
      </div>
      {alertas > 0 && (
        <Card className="border-amber-700/50 bg-amber-950/30">
          <div className="text-amber-400 font-bold text-sm mb-1">
            ⚠️ {alertas} animal(es) con bajo rendimiento
          </div>
          <p className="text-zinc-400 text-xs">Revisá sus raciones.</p>
          <Btn
            variant="secondary"
            onClick={() => onNav("animales")}
            className="mt-2 text-xs py-1"
          >
            Ver →
          </Btn>
        </Card>
      )}
      {listos > 0 && (
        <Card className="border-emerald-700/50 bg-emerald-950/30">
          <div className="text-emerald-400 font-bold text-sm mb-1">
            ✅ {listos} animal(es) listos para venta
          </div>
          <p className="text-zinc-400 text-xs">
            Superaron los 430 kg. Evaluá la venta.
          </p>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Mis Animales", i: "🐄", n: "animales" },
          { l: "Mis Grupos", i: "📦", n: "grupos" },
          { l: "Formular Ración", i: "🔬", n: "racion" },
          { l: "Alimentos y Precios", i: "📦", n: "alimentos" },
          { l: "Mi Perfil", i: "👤", n: "perfil" },
        ].map((m) => (
          <button
            key={m.n}
            onClick={() => onNav(m.n)}
            className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-emerald-600/60 hover:bg-zinc-800/60 transition-all group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{m.i}</span>
            <span className="text-sm font-semibold text-zinc-300">{m.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
