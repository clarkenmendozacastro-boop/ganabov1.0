// src/components/animales/ListaAnimales.jsx
import React from "react";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import AnimalCard from "./AnimalCard";

const ListaAnimales = ({ animales, onSelect, onNav }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">Mis Animales</h2>
        <Btn onClick={() => onNav("nuevo")} className="text-xs py-1.5">
          + Agregar
        </Btn>
      </div>
      {animales.length === 0 ? (
        <Card className="text-center py-10">
          <div className="text-5xl mb-3">🐄</div>
          <p className="text-zinc-500 text-sm">Sin animales registrados</p>
          <Btn onClick={() => onNav("nuevo")} className="mt-4">
            Agregar primer animal
          </Btn>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {animales.map((a) => (
            <AnimalCard key={a._id} animal={a} onClick={() => onSelect(a)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaAnimales;
