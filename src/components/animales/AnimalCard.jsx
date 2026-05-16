// src/components/animales/AnimalCard.jsx
import React from "react";
import Badge from "../ui/Badge";
import { RAZAS } from "../../data/razas";
import { calcularGDP } from "../../utils/helpers";

const AnimalCard = ({ animal, onClick }) => {
  const raza = RAZAS.find((r) => r.id === animal.raza) || RAZAS[8];
  const ult =
    animal.pesadas?.length > 0
      ? animal.pesadas[animal.pesadas.length - 1].peso
      : animal.peso_inicial;
  const gdp = calcularGDP(animal.pesadas);
  const col =
    animal.pesadas?.length < 2
      ? "gray"
      : gdp >= raza.gdp_base * 0.85
      ? "green"
      : gdp >= raza.gdp_base * 0.6
      ? "yellow"
      : "red";
  return (
    <button
      onClick={onClick}
      className="w-full bg-zinc-900 border border-zinc-700/60 rounded-2xl p-4 text-left hover:border-emerald-600/50 hover:bg-zinc-800/40 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-white">{animal.nombre}</div>
          <div className="text-zinc-500 text-xs">
            {raza.nombre} · {animal.sexo}
          </div>
        </div>
        <Badge color={col}>
          {col === "green"
            ? "Bien"
            : col === "yellow"
            ? "Regular"
            : col === "red"
            ? "Alerta"
            : "Sin datos"}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="font-black text-lg text-emerald-400">{ult} kg</div>
          <div className="text-zinc-600 text-xs">actual</div>
        </div>
        <div>
          <div className="font-black text-lg text-sky-400">{animal.peso_inicial} kg</div>
          <div className="text-zinc-600 text-xs">entrada</div>
        </div>
        <div>
          <div className="font-black text-lg text-amber-400">
            {gdp > 0 ? `${gdp.toFixed(2)}/d` : "—"}
          </div>
          <div className="text-zinc-600 text-xs">GDP kg</div>
        </div>
      </div>
    </button>
  );
};

export default AnimalCard;
