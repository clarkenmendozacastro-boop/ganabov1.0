// src/components/racion/CalculadoraRacion.jsx
import React, { useState } from "react";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, CATEGORIAS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";
import { RAZAS } from "../../data/razas";
import { formularRacionAvanzada, FASES_FEEDLOT } from "../../utils/nutricion";

const CalculadoraRacion = ({ preciosUsr = {}, customAl = [], minsAlimentos = {} }) => {
  const [peso, setPeso] = useState("");
  const [raza, setRaza] = useState("otro");
  const [sistema, setSistema] = useState("semiIntensivo");
  const [modo, setModo] = useState("optimo");
  const [faseFeedlot, setFaseFeedlot] = useState("inicio");
  const [temperatura, setTemperatura] = useState(25);
  const [selIds, setSelIds] = useState(new Set());
  const [busq, setBusq] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSel, setShowSel] = useState(false);
  const [estadosCalidad, setEstadosCalidad] = useState({});
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

  const cambiarCalidad = (id, nuevaCalidad) => {
    setEstadosCalidad(prev => ({ ...prev, [id]: nuevaCalidad }));
    if (resultado) recalcular();
  };

  const recalcular = () => {
    if (!peso) return;
    let alimentosUsar = modo === "personalizado" ? seleccionados : todosAl;
    if (alimentosUsar.length === 0) return;
    const res = formularRacionAvanzada({
      pv: peso,
      sistemaId: sistema,
      razaId: raza,
      alimentosDisponibles: alimentosUsar,
      preciosUsuario: preciosUsr,
      estadosCalidad,
      modo: modo === "optimo" ? "optimo" : "economico",
      fase: sistema === "feedlot" ? faseFeedlot : null,
      temperatura,
    });
    if (!res.error) setResultado(res);
    else alert(res.msg);
  };

  const eliminarIngrediente = (idAEliminar) => {
    const nuevosAlimentos = modo === "personalizado"
      ? seleccionados.filter(a => a.id !== idAEliminar)
      : todosAl.filter(a => a.id !== idAEliminar);
    if (nuevosAlimentos.length === 0) return alert("No quedan alimentos");
    const res = formularRacionAvanzada({
      pv: peso, sistemaId: sistema, razaId: raza,
      alimentosDisponibles: nuevosAlimentos, preciosUsuario: preciosUsr,
      estadosCalidad, modo: modo === "optimo" ? "optimo" : "economico",
      fase: sistema === "feedlot" ? faseFeedlot : null, temperatura,
    });
    if (!res.error) {
      setResultado(res);
      if (modo === "personalizado") setSelIds(new Set(nuevosAlimentos.map(a => a.id)));
    } else alert(res.msg);
  };

  const getRiesgoColor = (riesgo) => {
    if (riesgo === "seguro") return "green";
    if (riesgo === "precaución") return "yellow";
    if (riesgo === "alto") return "orange";
    if (riesgo === "crítico") return "red";
    return "gray";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    if (score >= 40) return "orange";
    return "red";
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-white">🐄 GanaBov Engine Pro</h2>
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Inp label="Peso (kg)" type="number" value={peso} onChange={e => { setPeso(e.target.value); setResultado(null); }} placeholder="280" />
          <Inp label="Temperatura (°C)" type="number" value={temperatura} onChange={e => setTemperatura(parseFloat(e.target.value))} placeholder="25" />
        </div>
        <Sel label="Raza" value={raza} onChange={e => setRaza(e.target.value)}>
          {RAZAS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Sel>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setSistema("pastoril")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "pastoril" ? "bg-emerald-600" : "bg-zinc-800"}`}>🌾 Pastoril</button>
          <button onClick={() => setSistema("semiIntensivo")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "semiIntensivo" ? "bg-emerald-600" : "bg-zinc-800"}`}>⚡ Semi-intensivo</button>
          <button onClick={() => setSistema("feedlot")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "feedlot" ? "bg-emerald-600" : "bg-zinc-800"}`}>🔥 Feedlot</button>
        </div>
        {sistema === "feedlot" && (
          <div className="grid grid-cols-4 gap-1">
            {Object.keys(FASES_FEEDLOT).map(f => (
              <button key={f} onClick={() => setFaseFeedlot(f)} className={`text-xs p-1 rounded ${faseFeedlot === f ? "bg-emerald-600" : "bg-zinc-700"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => setModo("optimo")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "optimo" ? "bg-emerald-600" : "bg-zinc-800"}`}>🚀 Óptimo</button>
          <button onClick={() => setModo("economico")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "economico" ? "bg-emerald-600" : "bg-zinc-800"}`}>💰 Económico</button>
          <button onClick={() => setModo("personalizado")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "personalizado" ? "bg-emerald-600" : "bg-zinc-800"}`}>✏️ Personalizado</button>
        </div>
        {modo === "personalizado" && (
          <div>
            <Btn variant="secondary" onClick={() => setShowSel(!showSel)} className="w-full">
              {showSel ? "Cerrar" : `+ Elegir (${seleccionados.length})`}
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
        <div className="flex justify-between items-center">
          <button onClick={() => setModoProfesional(!modoProfesional)} className="text-xs text-sky-400 underline">
            {modoProfesional ? "📘 Modo Simple" : "🔬 Modo Profesional"}
          </button>
          <Btn onClick={recalcular} className="py-2 px-4">Formular</Btn>
        </div>
      </Card>
      {resultado && (
        <Card>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">📊 Resultados</h3>
            <Badge color={resultado.gdp_estimada > 0 ? "green" : "red"}>GDP {resultado.gdp_estimada} kg/día</Badge>
          </div>
          {resultado.alertas.map((a,i) => <div key={i} className="text-amber-400 text-sm">⚠️ {a}</div>)}
          {resultado.explicaciones.map((e,i) => <div key={i} className="text-sky-300 text-xs italic">🧠 {e}</div>)}
          <div className="text-xs font-bold mt-2">Ingredientes</div>
          {resultado.racion.map((al,i) => (
            <div key={i} className="flex justify-between items-center border-b border-zinc-700 py-1">
              <div>
                <span className="text-sm">{al.nombre}</span>
                <select value={al.calidad} onChange={e => cambiarCalidad(al.id, e.target.value)} className="ml-2 text-xs bg-zinc-800 rounded">
                  <option>Óptimo</option><option>Bueno</option><option>Regular</option><option>Bajo</option><option>Muy deteriorado</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-emerald-400">{al.kg_dia} kg</span>
                <button onClick={() => eliminarIngrediente(al.id)} className="text-red-500 text-xs">🗑️</button>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">MS total</span><br/><b>{resultado.indicadores.ms_total_kg} kg</b> ({resultado.indicadores.ms_pct_pv}% PV)</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">peNDF</span><br/><b>{resultado.indicadores.peNDF_pct}%</b></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">ENm aportada</span><br/><b>{resultado.indicadores.enm_aportada}</b> / {resultado.indicadores.enm_requerida} Mcal</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">PB aportada</span><br/><b>{resultado.indicadores.pb_aportada}</b> / {resultado.indicadores.pb_requerida} g</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Riesgo acidosis</span><br/><Badge color={getRiesgoColor(resultado.indicadores.riesgo_acidosis)}>{resultado.indicadores.riesgo_acidosis} ({resultado.indicadores.indice_acidosis})</Badge></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Sincronía ruminal</span><br/>{resultado.indicadores.sincronia}</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Costo/día</span><br/><b>Bs. {resultado.indicadores.costo_dia}</b></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Conversión</span><br/>{resultado.indicadores.conversion}</div>
          </div>
          {modoProfesional && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Ruminal</span><div className={`font-bold text-${getScoreColor(resultado.indicadores.score_ruminal)}-400`}>{resultado.indicadores.score_ruminal}</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Económico</span><div className={`font-bold text-${getScoreColor(resultado.indicadores.score_economico)}-400`}>{resultado.indicadores.score_economico}</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Eficiencia</span><div className={`font-bold text-${getScoreColor(resultado.indicadores.score_eficiencia)}-400`}>{resultado.indicadores.score_eficiencia}</div></div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
export default CalculadoraRacion;
