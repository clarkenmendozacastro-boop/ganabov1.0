// src/components/racion/CalculadoraRacion.jsx
import React, { useState } from "react";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, CATEGORIAS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";
import { RAZAS } from "../../data/razas";
import { formularRacionAvanzada } from "../../utils/nutricion";

const CalculadoraRacion = ({ preciosUsr = {}, customAl = [], minsAlimentos = {} }) => {
  const [peso, setPeso] = useState("");
  const [raza, setRaza] = useState("otro");
  const [sistema, setSistema] = useState("semiIntensivo");
  const [modo, setModo] = useState("optimo");
  const [selIds, setSelIds] = useState(new Set());
  const [busq, setBusq] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSel, setShowSel] = useState(false);
  const [modoProfesional, setModoProfesional] = useState(false);

  const todosAl = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todosAl.filter(a =>
    a.nombre.toLowerCase().includes(busq.toLowerCase()) ||
    (TIPO_LABELS[a.categoria] || "").toLowerCase().includes(busq.toLowerCase())
  );
  const seleccionados = todosAl.filter(a => selIds.has(a.id));

  const toggleSeleccion = (id) => {
    setSelIds(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
    setResultado(null);
  };

  const calcular = () => {
    if (!peso || parseFloat(peso) < 80) {
      alert("Peso mínimo 80 kg");
      return;
    }

    let alimentosUsar = [];
    if (modo === "personalizado") {
      if (seleccionados.length === 0) {
        alert("Seleccione al menos un alimento en modo personalizado.");
        return;
      }
      alimentosUsar = seleccionados;
    } else {
      alimentosUsar = todosAl;
    }

    const result = formularRacionAvanzada({
      pv: peso,
      sistemaId: sistema,
      razaId: raza,
      alimentosDisponibles: alimentosUsar,
      preciosUsuario: preciosUsr,
      modo: modo === "optimo" ? "optimo" : "economico",
    });

    if (result.error) {
      alert(result.msg);
      setResultado(null);
      return;
    }

    setResultado(result);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    if (score >= 40) return "orange";
    return "red";
  };

  const getRiesgoColor = (riesgo) => {
    if (riesgo === "seguro") return "green";
    if (riesgo === "precaución") return "yellow";
    if (riesgo === "alto") return "orange";
    if (riesgo === "crítico") return "red";
    return "gray";
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-white">🐄 GanaBov Engine Pro</h2>
      <Card className="flex flex-col gap-4">
        <Inp label="Peso (kg)" type="number" value={peso} onChange={e => { setPeso(e.target.value); setResultado(null); }} placeholder="280" />
        <Sel label="Raza" value={raza} onChange={e => setRaza(e.target.value)}>
          {RAZAS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Sel>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setSistema("pastoril")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "pastoril" ? "bg-emerald-600" : "bg-zinc-800"}`}>🌾 Pastoril</button>
          <button onClick={() => setSistema("semiIntensivo")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "semiIntensivo" ? "bg-emerald-600" : "bg-zinc-800"}`}>⚡ Semi-intensivo</button>
          <button onClick={() => setSistema("feedlot")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "feedlot" ? "bg-emerald-600" : "bg-zinc-800"}`}>🔥 Feedlot</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModo("optimo")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "optimo" ? "bg-emerald-600" : "bg-zinc-800"}`}>🚀 Óptimo</button>
          <button onClick={() => setModo("economico")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "economico" ? "bg-emerald-600" : "bg-zinc-800"}`}>💰 Económico</button>
          <button onClick={() => setModo("personalizado")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "personalizado" ? "bg-emerald-600" : "bg-zinc-800"}`}>✏️ Personalizado</button>
        </div>
        {modo === "personalizado" && (
          <div>
            <Btn variant="secondary" onClick={() => setShowSel(!showSel)} className="w-full">
              {showSel ? "Cerrar" : `+ Elegir alimentos (${seleccionados.length})`}
            </Btn>
            {showSel && (
              <div className="max-h-60 overflow-auto mt-2">
                <Inp placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
                {CATEGORIAS_ORDER.map(cat => {
                  const gr = filtrados.filter(a => a.categoria === cat);
                  if (!gr.length) return null;
                  return (
                    <div key={cat}>
                      <div className="text-xs font-bold mt-2">{TIPO_LABELS[cat]}</div>
                      {gr.map(al => (
                        <button key={al.id} onClick={() => toggleSeleccion(al.id)} className={`w-full text-left p-1 text-sm ${selIds.has(al.id) ? "text-emerald-400" : "text-zinc-300"}`}>
                          {al.nombre} {selIds.has(al.id) && "✓"}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <button onClick={() => setModoProfesional(!modoProfesional)} className="text-xs text-sky-400 underline text-right">
          {modoProfesional ? "📘 Modo Simple" : "🔬 Modo Profesional"}
        </button>
        <Btn onClick={calcular} className="w-full py-3">Formular Ración</Btn>
      </Card>

      {resultado && (
        <Card>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">📊 Resultados</h3>
            <Badge color={resultado.gdp_estimada > 0.5 ? "green" : resultado.gdp_estimada > 0 ? "yellow" : "red"}>
              GDP {resultado.gdp_estimada} kg/día
            </Badge>
          </div>

          {resultado.alertas && resultado.alertas.map((a, i) => (
            <div key={i} className="text-amber-400 text-sm">⚠️ {a}</div>
          ))}

          <div className="text-xs font-bold mt-2">Ingredientes (kg/día)</div>
          {resultado.racion.map((al, i) => (
            <div key={i} className="flex justify-between items-center border-b border-zinc-700 py-1">
              <div><span className="text-sm">{al.nombre}</span><span className="text-xs text-zinc-500 ml-2">({al.categoria})</span></div>
              <div className="flex gap-2 items-center"><span className="text-emerald-400 font-bold">{al.kg_dia} kg</span><span className="text-xs text-zinc-500">{al.ms_kg} kg MS</span></div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">MS total</span><br/><b>{resultado.indicadores.ms_total_kg} kg</b> ({resultado.indicadores.ms_pct_pv}% PV)</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">peNDF</span><br/><b>{resultado.indicadores.peNDF_pct}%</b></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">ENm aportada</span><br/><b>{resultado.indicadores.enm_aportada}</b> / {resultado.indicadores.enm_requerida} Mcal</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">PB aportada</span><br/><b>{resultado.indicadores.pb_aportada}</b> / {resultado.indicadores.pb_requerida} g</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Riesgo acidosis</span><br/><Badge color={getRiesgoColor(resultado.indicadores.riesgo_acidosis)}>{resultado.indicadores.riesgo_acidosis} ({resultado.indicadores.score_acidosis})</Badge></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Costo/día</span><br/><b>Bs. {resultado.indicadores.costo_dia}</b></div>
          </div>

          {modoProfesional && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Ruminal</span><div className={`font-bold text-${getScoreColor(resultado.indicadores.score_ruminal)}-400`}>{resultado.indicadores.score_ruminal}</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Eficiencia</span><div className={`font-bold text-${getScoreColor(resultado.indicadores.score_eficiencia)}-400`}>{resultado.indicadores.score_eficiencia}</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Económico</span><div className={`font-bold text-${getScoreColor(resultado.indicadores.score_economico)}-400`}>{resultado.indicadores.score_economico}</div></div>
            </div>
          )}

          {resultado.explicaciones && resultado.explicaciones.map((e, i) => (
            <div key={i} className="text-sky-300 text-xs italic mt-2">🧠 {e}</div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default CalculadoraRacion;
