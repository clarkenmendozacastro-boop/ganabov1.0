// src/components/racion/CalculadoraRacion.jsx
import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, CATEGORIAS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";
import { RAZAS } from "../../data/razas";
import { formularRacionAvanzada, FASES_FEEDLOT } from "../../utils/nutricion";

const QUALITY_OPTIONS = ["Óptimo", "Bueno", "Regular", "Bajo", "Muy deteriorado"];

const CalculadoraRacion = ({ preciosUsr = {}, customAl = [], minsAlimentos = {} }) => {
  const [peso, setPeso] = useState("");
  const [raza, setRaza] = useState("otro");
  const [sistema, setSistema] = useState("semiIntensivo");
  const [modo, setModo] = useState("optimo");
  const [faseFeedlot, setFaseFeedlot] = useState("inicio");
  const [selIds, setSelIds] = useState(new Set());
  const [misAlimentosIds, setMisAlimentosIds] = useState(new Set());
  const [busq, setBusq] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSel, setShowSel] = useState(false);
  const [showMisAlimentos, setShowMisAlimentos] = useState(false);
  const [modoProfesional, setModoProfesional] = useState(false);
  const [estadosCalidad, setEstadosCalidad] = useState({});
  const [ingredientesEliminados, setIngredientesEliminados] = useState(new Set());

  const todosAl = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todosAl.filter(a =>
    a.nombre.toLowerCase().includes(busq.toLowerCase()) ||
    (TIPO_LABELS[a.categoria] || "").toLowerCase().includes(busq.toLowerCase())
  );
  const seleccionados = todosAl.filter(a => selIds.has(a.id));
  const alimentosSeleccionadosMis = todosAl.filter(a => misAlimentosIds.has(a.id));

  // Al cambiar modo, limpiar eliminados
  useEffect(() => {
    setIngredientesEliminados(new Set());
  }, [modo, sistema, raza, peso]);

  const toggleSeleccion = (id) => {
    setSelIds(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
    setResultado(null);
  };

  const toggleMisAlimento = (id) => {
    setMisAlimentosIds(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
    setResultado(null);
  };

  const cambiarCalidad = (id, nuevaCalidad) => {
    setEstadosCalidad(prev => ({ ...prev, [id]: nuevaCalidad }));
    setTimeout(() => recalcular(), 10);
  };

  const eliminarIngrediente = (idAEliminar) => {
    setIngredientesEliminados(prev => new Set([...prev, idAEliminar]));
    recalcularConEliminado(idAEliminar);
  };

  const recalcularConEliminado = (idEliminado) => {
    if (!peso) return;
    let alimentosUsar = [];
    if (modo === "personalizado") {
      alimentosUsar = seleccionados.filter(a => a.id !== idEliminado);
    } else if (modo === "mis_alimentos") {
      alimentosUsar = alimentosSeleccionadosMis.filter(a => a.id !== idEliminado);
    } else {
      alimentosUsar = todosAl.filter(a => a.id !== idEliminado && !ingredientesEliminados.has(a.id));
    }
    if (alimentosUsar.length === 0) return;
    const res = formularRacionAvanzada({
      pv: peso, sistemaId: sistema, razaId: raza,
      alimentosDisponibles: alimentosUsar, preciosUsuario: preciosUsr,
      estadosCalidad: estadosCalidad, modo: modo,
      fase: sistema === "feedlot" ? faseFeedlot : null,
      alimentosSeleccionadosIds: modo === "mis_alimentos" ? misAlimentosIds : null
    });
    if (!res.error) setResultado(res);
  };

  const recalcular = () => {
    if (!peso) return;
    let alimentosUsar = [];
    if (modo === "personalizado") {
      alimentosUsar = seleccionados;
    } else if (modo === "mis_alimentos") {
      alimentosUsar = alimentosSeleccionadosMis;
    } else {
      alimentosUsar = todosAl;
    }
    if (alimentosUsar.length === 0) return;
    const res = formularRacionAvanzada({
      pv: peso, sistemaId: sistema, razaId: raza,
      alimentosDisponibles: alimentosUsar, preciosUsuario: preciosUsr,
      estadosCalidad: estadosCalidad, modo: modo,
      fase: sistema === "feedlot" ? faseFeedlot : null,
      alimentosSeleccionadosIds: modo === "mis_alimentos" ? misAlimentosIds : null
    });
    if (!res.error) setResultado(res);
  };

  const calcular = () => {
    if (!peso || parseFloat(peso) < 80) {
      alert("Peso mínimo 80 kg");
      return;
    }
    setIngredientesEliminados(new Set());
    recalcular();
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
        
        {sistema === "feedlot" && (
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(FASES_FEEDLOT).map(f => (
              <button key={f} onClick={() => setFaseFeedlot(f)} className={`text-xs p-1 rounded ${faseFeedlot === f ? "bg-emerald-600" : "bg-zinc-700"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-1">
          <button onClick={() => setModo("optimo")} className={`py-1 rounded-xl text-xs font-bold border ${modo === "optimo" ? "bg-emerald-600" : "bg-zinc-800"}`}>🚀 Óptimo</button>
          <button onClick={() => setModo("economico")} className={`py-1 rounded-xl text-xs font-bold border ${modo === "economico" ? "bg-emerald-600" : "bg-zinc-800"}`}>💰 Económico</button>
          <button onClick={() => setModo("personalizado")} className={`py-1 rounded-xl text-xs font-bold border ${modo === "personalizado" ? "bg-emerald-600" : "bg-zinc-800"}`}>✏️ Personalizado</button>
          <button onClick={() => setModo("mis_alimentos")} className={`py-1 rounded-xl text-xs font-bold border ${modo === "mis_alimentos" ? "bg-emerald-600" : "bg-zinc-800"}`}>📦 Mis Alimentos</button>
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

        {modo === "mis_alimentos" && (
          <div>
            <Btn variant="secondary" onClick={() => setShowMisAlimentos(!showMisAlimentos)} className="w-full">
              {showMisAlimentos ? "Cerrar" : `📦 Seleccionar mis alimentos (${alimentosSeleccionadosMis.length})`}
            </Btn>
            {showMisAlimentos && (
              <div className="max-h-60 overflow-auto mt-2">
                <Inp placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
                {CATEGORIAS_ORDER.map(cat => {
                  const gr = filtrados.filter(a => a.categoria === cat);
                  if (!gr.length) return null;
                  return (
                    <div key={cat}>
                      <div className="text-xs font-bold mt-2">{TIPO_LABELS[cat]}</div>
                      {gr.map(al => (
                        <button key={al.id} onClick={() => toggleMisAlimento(al.id)} className={`w-full text-left p-1 text-sm ${misAlimentosIds.has(al.id) ? "text-emerald-400" : "text-zinc-300"}`}>
                          {al.nombre} {misAlimentosIds.has(al.id) && "✓"}
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
            <Badge color={resultado.gdp_estimada > 0.8 ? "green" : resultado.gdp_estimada > 0.4 ? "yellow" : "orange"}>
              GDP {resultado.gdp_estimada} kg/día
            </Badge>
          </div>

          {/* Alertas por calidad mala */}
          {resultado.alertasCalidad && resultado.alertasCalidad.map((a, i) => (
            <div key={i} className="border border-red-700 bg-red-950/50 p-2 rounded-lg mb-2">
              <div className="text-red-400 font-bold text-sm">🚨 ALERTA: {a.nombre} - Calidad "{a.calidad}"</div>
              <div className="text-red-300 text-xs mt-1">{a.mensaje}</div>
            </div>
          ))}

          {/* Deficiencias en modo mis_alimentos */}
          {resultado.deficiencias && resultado.deficiencias.map((d, i) => (
            <div key={i} className="border border-amber-700 bg-amber-950/30 p-2 rounded-lg mb-2">
              <div className="text-amber-400 text-sm font-bold">{d.msg}</div>
            </div>
          ))}

          <div className="text-xs font-bold mt-2">Ingredientes (kg/día)</div>
          {resultado.racion.map((al, i) => (
            <div key={i} className="flex justify-between items-center border-b border-zinc-700 py-2">
              <div className="flex-1">
                <span className="text-sm">{al.nombre}</span>
                <span className="text-xs text-zinc-500 ml-2">({al.categoria})</span>
                <div className="flex gap-2 mt-1">
                  <select 
                    value={estadosCalidad[al.id] || al.calidad || "Óptimo"}
                    onChange={(e) => cambiarCalidad(al.id, e.target.value)}
                    className={`bg-zinc-800 border rounded-lg px-2 py-0.5 text-xs ${estadosCalidad[al.id] === "Bajo" || estadosCalidad[al.id] === "Muy deteriorado" ? "border-red-500 text-red-400" : "border-zinc-600"}`}
                  >
                    {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  <button onClick={() => eliminarIngrediente(al.id)} className="text-red-500 text-xs hover:text-red-400">🗑️ Eliminar</button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold">{al.kg_dia} kg</div>
                <div className="text-xs text-zinc-500">{al.ms_kg} kg MS</div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">MS total</span><br/><b>{resultado.indicadores.ms_total_kg} kg</b> ({resultado.indicadores.ms_pct_pv}% PV)</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">peNDF</span><br/><b>{resultado.indicadores.peNDF_pct}%</b></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">ENm aportada</span><br/><b>{resultado.indicadores.enm_aportada}</b> / {resultado.indicadores.enm_requerida} Mcal</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">PB aportada</span><br/><b>{resultado.indicadores.pb_aportada}</b> / {resultado.indicadores.pb_requerida} g</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Riesgo acidosis</span><br/><Badge color={getRiesgoColor(resultado.indicadores.riesgo_acidosis)}>{resultado.indicadores.riesgo_acidosis}</Badge></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Costo/día</span><br/><b>Bs. {resultado.indicadores.costo_dia}</b></div>
          </div>

          {modoProfesional && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Cumplimiento energía</span><div className="font-bold text-emerald-400">{resultado.indicadores.cumplimiento_energia}%</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Score acidosis</span><div className="font-bold text-emerald-400">{resultado.indicadores.score_acidosis}</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center col-span-2"><span className="text-xs">Conversión alimenticia</span><div className="font-bold text-emerald-400">{resultado.indicadores.conversion}</div></div>
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
