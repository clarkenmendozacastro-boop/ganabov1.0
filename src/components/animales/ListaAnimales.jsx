// src/components/animales/ListaAnimales.jsx
import React, { useState } from "react";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { RAZAS } from "../../data/razas";
import { calcularGDP } from "../../utils/helpers";
import { exportToExcel } from "../../utils/exportExcel";

const ListaAnimales = ({ animales = [], grupos = [], onSelect, onNav }) => {
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [filtroActivo, setFiltroActivo] = useState(null);

  // Si no hay animales, mostrar mensaje
  if (!animales.length) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-white">Mis Animales</h2>
          <Btn onClick={() => onNav("nuevo")} className="text-xs py-1.5">+ Agregar</Btn>
        </div>
        <Card className="text-center py-10">
          <div className="text-5xl mb-3">🐄</div>
          <p className="text-zinc-500 text-sm">Sin animales registrados</p>
          <Btn onClick={() => onNav("nuevo")} className="mt-4">Agregar primer animal</Btn>
        </Card>
      </div>
    );
  }

  // Preparar datos con información adicional
  const animalesConInfo = animales.map(animal => {
    const raza = RAZAS.find(r => r.id === animal.raza) || RAZAS[8];
    const ult = animal.pesadas?.length > 0
      ? animal.pesadas[animal.pesadas.length - 1].peso
      : animal.peso_inicial;
    const gdp = calcularGDP(animal.pesadas);
    const listo = ult >= 430;
    const bajoRendimiento = animal.pesadas?.length >= 2 && gdp < raza.gdp_base * 0.7;
    return { ...animal, ult, gdp, listo, bajoRendimiento, razaNombre: raza.nombre };
  });

  // Aplicar filtro
  let animalesFiltrados = animalesConInfo;
  if (filtroActivo === "listos") {
    animalesFiltrados = animalesConInfo.filter(a => a.listo);
  } else if (filtroActivo === "bajoRendimiento") {
    animalesFiltrados = animalesConInfo.filter(a => a.bajoRendimiento);
  } else if (filtroActivo === "pesoMas400") {
    animalesFiltrados = animalesConInfo.filter(a => a.ult > 400);
  }

  const toggleSeleccion = (id) => {
    const nuevo = new Set(seleccionados);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setSeleccionados(nuevo);
  };

  const seleccionarTodos = () => {
    setSeleccionados(new Set(animalesFiltrados.map(a => a._id)));
  };

  const limpiarSeleccion = () => {
    setSeleccionados(new Set());
  };

  const exportarSeleccionados = () => {
    const seleccionadosArray = animalesConInfo.filter(a => seleccionados.has(a._id));
    if (seleccionadosArray.length === 0) {
      alert("No hay animales seleccionados");
      return;
    }
    const data = seleccionadosArray.map(a => ({
      Nombre: a.nombre,
      Raza: a.razaNombre,
      Sexo: a.sexo === "macho" ? "Macho" : "Hembra",
      "Peso inicial (kg)": a.peso_inicial,
      "Peso actual (kg)": a.ult,
      "Ganancia total (kg)": (a.ult - a.peso_inicial).toFixed(0),
      "GDP (kg/día)": a.gdp > 0 ? a.gdp.toFixed(3) : "Sin datos",
      "Listo para venta": a.listo ? "Sí" : "No",
      "Bajo rendimiento": a.bajoRendimiento ? "Sí" : "No",
      "Fecha ingreso": a.fecha_entrada || "",
      Notas: a.notas || ""
    }));
    exportToExcel(data, `animales_${new Date().toISOString().slice(0,10)}`, "Animales");
  };

  const AnimalCard = ({ animal, onClick, seleccionado, onToggleSeleccion }) => {
    const razaObj = RAZAS.find(r => r.id === animal.raza) || RAZAS[8];
    const col = animal.pesadas?.length < 2 ? "gray"
      : animal.gdp >= razaObj.gdp_base * 0.85 ? "green"
      : animal.gdp >= razaObj.gdp_base * 0.6 ? "yellow"
      : "red";
    const grupo = animal.grupoId ? grupos.find(g => g.id === animal.grupoId) : null;

    return (
      <div className="w-full bg-zinc-900 border border-zinc-700/60 rounded-2xl p-4 hover:border-emerald-600/50 hover:bg-zinc-800/40 transition-all">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={seleccionado}
            onChange={() => onToggleSeleccion(animal._id)}
            className="mt-1 w-5 h-5 accent-emerald-500 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-white text-lg">{animal.nombre}</div>
                <div className="text-zinc-500 text-xs">
                  {animal.razaNombre} · {animal.sexo === "macho" ? "Macho" : "Hembra"}
                  {grupo && <span className="text-emerald-400 ml-2">📦 {grupo.nombre}</span>}
                </div>
              </div>
              <Badge color={col}>
                {col === "green" ? "Bien" : col === "yellow" ? "Regular" : col === "red" ? "Alerta" : "Sin datos"}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="font-black text-lg text-emerald-400">{animal.ult} kg</div>
                <div className="text-zinc-600 text-xs">actual</div>
              </div>
              <div>
                <div className="font-black text-lg text-sky-400">{animal.peso_inicial} kg</div>
                <div className="text-zinc-600 text-xs">entrada</div>
              </div>
              <div>
                <div className="font-black text-lg text-amber-400">{animal.gdp > 0 ? `${animal.gdp.toFixed(2)}/d` : "—"}</div>
                <div className="text-zinc-600 text-xs">GDP</div>
              </div>
              <div>
                <button
                  onClick={onClick}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2 py-1 rounded-full"
                >
                  Detalle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-black text-white">Mis Animales</h2>
        <Btn onClick={() => onNav("nuevo")} className="text-xs py-1.5">+ Agregar</Btn>
      </div>

      {/* Barra de filtros y selección */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-zinc-800/50 p-3 rounded-xl">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroActivo(null)}
            className={`text-xs px-3 py-1 rounded-full border ${
              filtroActivo === null
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-zinc-700 border-zinc-600 text-zinc-300"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroActivo("listos")}
            className={`text-xs px-3 py-1 rounded-full border ${
              filtroActivo === "listos"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-zinc-700 border-zinc-600 text-zinc-300"
            }`}
          >
            ✅ Listos (≥430 kg)
          </button>
          <button
            onClick={() => setFiltroActivo("bajoRendimiento")}
            className={`text-xs px-3 py-1 rounded-full border ${
              filtroActivo === "bajoRendimiento"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-zinc-700 border-zinc-600 text-zinc-300"
            }`}
          >
            ⚠️ Bajo rendimiento
          </button>
          <button
            onClick={() => setFiltroActivo("pesoMas400")}
            className={`text-xs px-3 py-1 rounded-full border ${
              filtroActivo === "pesoMas400"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-zinc-700 border-zinc-600 text-zinc-300"
            }`}
          >
            📈 Peso >400 kg
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={seleccionarTodos} className="text-xs text-emerald-400 hover:text-emerald-300 underline">
            Seleccionar todos
          </button>
          <button onClick={limpiarSeleccion} className="text-xs text-zinc-400 hover:text-zinc-300 underline">
            Limpiar
          </button>
          <Btn onClick={exportarSeleccionados} variant="secondary" className="text-xs py-1.5">
            📊 Exportar seleccionados ({seleccionados.size})
          </Btn>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {animalesFiltrados.map((a) => (
          <AnimalCard
            key={a._id}
            animal={a}
            onClick={() => onSelect(a)}
            seleccionado={seleccionados.has(a._id)}
            onToggleSeleccion={toggleSeleccion}
          />
        ))}
      </div>
    </div>
  );
};

export default ListaAnimales;
