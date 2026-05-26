// src/components/animales/ListaAnimales.jsx
import React from "react";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { RAZAS } from "../../data/razas";
import { calcularGDP } from "../../utils/helpers";

const ListaAnimales = ({ animales, grupos = [], onSelect, onNav, onFormular }) => {
  const AnimalCard = ({ animal, onClick }) => {
    const raza = RAZAS.find((r) => r.id === animal.raza) || RAZAS[8];
    const ult = animal.pesadas?.length > 0 ? animal.pesadas[animal.pesadas.length - 1].peso : animal.peso_inicial;
    const gdp = calcularGDP(animal.pesadas);
    const col = animal.pesadas?.length < 2 ? "gray" : gdp >= raza.gdp_base * 0.85 ? "green" : gdp >= raza.gdp_base * 0.6 ? "yellow" : "red";
    const grupo = animal.grupoId ? grupos.find(g => g.id === animal.grupoId) : null;
    
    const handleFormular = (e) => {
      e.stopPropagation(); // evitar que también se abra el detalle
      const confirmar = window.confirm(`¿Formular ración para ${animal.nombre} (${ult} kg)?`);
      if (confirmar) {
        onFormular(animal);
      }
    };
    
    return (
      <div className="w-full bg-zinc-900 border border-zinc-700/60 rounded-2xl p-4 hover:border-emerald-600/50 hover:bg-zinc-800/40 transition-all">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-bold text-white text-lg">{animal.nombre}</div>
            <div className="text-zinc-500 text-xs">{raza.nombre} · {animal.sexo === "macho" ? "Macho" : "Hembra"}</div>
            {grupo && <div className="text-emerald-400 text-xs mt-1">📦 {grupo.nombre}</div>}
          </div>
          <Badge color={col}>{col === "green" ? "Bien" : col === "yellow" ? "Regular" : col === "red" ? "Alerta" : "Sin datos"}</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div><div className="font-black text-lg text-emerald-400">{ult} kg</div><div className="text-zinc-600 text-xs">actual</div></div>
          <div><div className="font-black text-lg text-sky-400">{animal.peso_inicial} kg</div><div className="text-zinc-600 text-xs">entrada</div></div>
          <div><div className="font-black text-lg text-amber-400">{gdp > 0 ? `${gdp.toFixed(2)}/d` : "—"}</div><div className="text-zinc-600 text-xs">GDP</div></div>
          <div><button onClick={handleFormular} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">🍽️</button></div>
        </div>
        <div className="mt-2 flex justify-end">
          <button onClick={onClick} className="text-xs text-zinc-500 hover:text-zinc-300">Ver detalles →</button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Mis Animales</h2>
        <Btn onClick={() => onNav("nuevo")} className="text-xs py-1.5">+ Agregar</Btn>
      </div>
      {animales.length === 0 ? (
        <Card className="text-center py-10"><div className="text-5xl mb-3">🐄</div><p className="text-zinc-500 text-sm">Sin animales registrados</p><Btn onClick={() => onNav("nuevo")} className="mt-4">Agregar primer animal</Btn></Card>
      ) : (
        <div className="flex flex-col gap-3">{animales.map((a) => <AnimalCard key={a._id} animal={a} onClick={() => onSelect(a)} grupos={grupos} onFormular={onFormular} />)}</div>
      )}
    </div>
  );
};

export default ListaAnimales;
