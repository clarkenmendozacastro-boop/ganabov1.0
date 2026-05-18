// src/components/racion/CalculadoraRacion.jsx
import React, { useState } from "react";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, CATEGORIAS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";
import { RAZAS } from "../../data/razas";
import { formularRacionInteligente, calcularRequerimientosNRC, reemplazarIngrediente, recalcularRacion } from "../../utils/nutricion";

const CalculadoraRacion = ({ preciosUsr = {}, customAl = [], minsAlimentos = {} }) => {
  const [peso, setPeso] = useState("");
  const [raza, setRaza] = useState("otro");
  const [sistema, setSistema] = useState("semiIntensivo");
  const [modo, setModo] = useState("optimo"); // "optimo" o "economico"
  const [selIds, setSelIds] = useState(new Set());
  const [busq, setBusq] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSel, setShowSel] = useState(false);
  const [estadosCalidad, setEstadosCalidad] = useState({});

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
    // Recalcular automáticamente si ya hay resultado
    if (resultado && resultado.racion) {
      recalcularConNuevasCalidades();
    }
  };

  const recalcularConNuevasCalidades = () => {
    if (!peso) return;
    let alimentosUsar = [];
    if (modo === "personalizado") {
      if (seleccionados.length === 0) return;
      alimentosUsar = seleccionados;
    } else {
      alimentosUsar = todosAl;
    }
    const result = formularRacionInteligente({
      pv: peso,
      sistemaId: sistema,
      alimentosDisponibles: alimentosUsar,
      preciosUsuario: preciosUsr,
      estadosCalidad,
      modo: modo === "optimo" ? "optimo" : "economico",
    });
    if (!result.error) {
      const req = calcularRequerimientosNRC(parseFloat(peso), sistema);
      setResultado({
        ...result,
        req: {
          em_total: req.em_total,
          pb_total: req.pb_total,
          ms_opt: req.cms_optimo,
          ms_max: req.cms_maximo,
        },
      });
    }
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

    const result = formularRacionInteligente({
      pv: peso,
      sistemaId: sistema,
      alimentosDisponibles: alimentosUsar,
      preciosUsuario: preciosUsr,
      estadosCalidad,
      modo: modo === "optimo" ? "optimo" : "economico",
    });

    if (result.error) {
      alert(result.msg);
      setResultado(null);
      return;
    }

    const req = calcularRequerimientosNRC(parseFloat(peso), sistema);

    setResultado({
      ...result,
      req: {
        em_total: req.em_total,
        pb_total: req.pb_total,
        ms_opt: req.cms_optimo,
        ms_max: req.cms_maximo,
      },
    });
  };

  const eliminarIngrediente = async (idAEliminar) => {
    if (!resultado || !resultado.racion) return;
    const racionActual = resultado.racion;
    const pvN = parseFloat(peso);
    const req = calcularRequerimientosNRC(pvN, sistema);
    let alimentosUsar = [];
    if (modo === "personalizado") {
      alimentosUsar = seleccionados;
    } else {
      alimentosUsar = todosAl;
    }
    const reemplazo = reemplazarIngrediente(racionActual, idAEliminar, alimentosUsar, preciosUsr, estadosCalidad, pvN, sistema, modo === "optimo" ? "optimo" : "economico");
    if (reemplazo.error) {
      alert(reemplazo.msg);
      // Intentar solo eliminar sin reemplazar
      const nuevaRacion = racionActual.filter(r => r.id !== idAEliminar);
      const recalc = recalcularRacion(nuevaRacion, pvN, sistema, req, modo);
      setResultado(prev => ({
        ...prev,
        racion: recalc.racion,
        gdp_estimada: recalc.gdp_estimada,
        indicadores: recalc.indicadores,
        alertas: recalc.alertas,
      }));
      return;
    }
    // Recargar la ración completa con el nuevo ingrediente (para que respete límites y cantidades)
    const nuevosAlimentos = alimentosUsar.map(a => {
      if (a.id === reemplazo.nuevoAlimento.id) return reemplazo.nuevoAlimento;
      return a;
    });
    const nuevaFormulacion = formularRacionInteligente({
      pv: peso,
      sistemaId: sistema,
      alimentosDisponibles: nuevosAlimentos,
      preciosUsuario: preciosUsr,
      estadosCalidad,
      modo: modo === "optimo" ? "optimo" : "economico",
    });
    if (!nuevaFormulacion.error) {
      setResultado(prev => ({
        ...nuevaFormulacion,
        req: prev.req,
      }));
    } else {
      alert("No se pudo reformular la dieta después del reemplazo.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-white">🔬 Formulación de Ración - Motor Inteligente</h2>
      <Card className="flex flex-col gap-4">
        <Inp label="Peso vivo (kg)" type="number" value={peso} onChange={e => { setPeso(e.target.value); setResultado(null); }} placeholder="Ej: 280" />
        <Sel label="Raza" value={raza} onChange={e => setRaza(e.target.value)}>
          {RAZAS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Sel>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Sistema de producción</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <button onClick={() => setSistema("pastoril")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "pastoril" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>🌾 Pastoril</button>
            <button onClick={() => setSistema("semiIntensivo")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "semiIntensivo" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>⚡ Semi-intensivo</button>
            <button onClick={() => setSistema("feedlot")} className={`py-2 rounded-xl text-xs font-bold border ${sistema === "feedlot" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>🔥 Feedlot</button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Modo de formulación</label>
          <div className="flex gap-2 mt-1">
            <button onClick={() => setModo("optimo")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "optimo" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>🚀 Óptimo (salud)</button>
            <button onClick={() => setModo("economico")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "economico" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>💰 Económico</button>
            <button onClick={() => setModo("personalizado")} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${modo === "personalizado" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>✏️ Personalizado</button>
          </div>
          <p className="text-zinc-400 text-xs mt-2">
            {modo === "optimo" && "Prioriza salud ruminal, fibra efectiva y desempeño."}
            {modo === "economico" && "Reduce costos SIN sacrificar salud ni estabilidad."}
            {modo === "personalizado" && "Elige manualmente los alimentos disponibles."}
          </p>
        </div>

        {modo === "personalizado" && (
          <div className="flex flex-col gap-3">
            <Btn variant="secondary" onClick={() => setShowSel(!showSel)}>
              {showSel ? "Cerrar" : `+ Elegir alimentos${seleccionados.length ? ` (${seleccionados.length})` : ""}`}
            </Btn>
            {showSel && (
              <div className="max-h-96 overflow-y-auto">
                <Inp placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
                {CATEGORIAS_ORDER.map(cat => {
                  const gr = filtrados.filter(a => a.categoria === cat);
                  if (!gr.length) return null;
                  return (
                    <div key={cat}>
                      <div className="text-xs text-zinc-500 font-bold uppercase mt-3 mb-1">{TIPO_LABELS[cat]}</div>
                      {gr.map(al => (
                        <button key={al.id} onClick={() => toggleSeleccion(al.id)} className={`w-full text-left px-3 py-2 mb-1 rounded-xl text-sm border ${selIds.has(al.id) ? "border-emerald-600 bg-emerald-950/40" : "border-zinc-700 bg-zinc-800"}`}>
                          <div className="flex justify-between"><span>{al.nombre}</span><span>{selIds.has(al.id) ? "✓" : ""}</span></div>
                          <span className="text-xs text-zinc-500">MS:{al.ms}% PB:{al.prot}% EM:{al.em} Bs.{(preciosUsr[al.id] ?? al.precio_kg).toFixed(2)}/kg</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
            {seleccionados.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {seleccionados.map(al => (
                  <span key={al.id} className="bg-emerald-950/50 text-emerald-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    {al.nombre.split("(")[0].trim()}
                    <button onClick={() => toggleSeleccion(al.id)} className="text-emerald-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <Btn onClick={calcular} className="w-full py-3">Calcular Ración</Btn>
      </Card>

      {resultado && (
        <div className="flex flex-col gap-3">
          {resultado.dietaInsuficiente && (
            <Card className="border-red-700/50 bg-red-950/30">
              <div className="text-red-400 font-bold">🚨 Dieta insuficiente</div>
              <p className="text-sm">{resultado.msg || "No se puede formular una dieta funcional con los alimentos disponibles."}</p>
            </Card>
          )}
          {resultado.alertas.map((alerta, idx) => (
            <Card key={idx} className="border-amber-700/50 bg-amber-950/30">
              <div className="text-amber-400 text-sm font-bold">{alerta}</div>
            </Card>
          ))}
          <Card>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sky-400 font-black">🔬 Ración formulada</div>
              <Badge color="purple">Motor Inteligente GanaBov</Badge>
            </div>
            <div className="text-xs font-bold text-zinc-400 mb-2">Ingredientes — kg/día</div>
            {resultado.racion.map((al, i) => (
              <div key={i} className="flex flex-col border-b border-zinc-700 py-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold text-sm">{al.nombre}</div>
                    <div className="text-zinc-500 text-xs">{TIPO_LABELS[al.categoria]}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-lg">
                      {al.kg_dia < 0.1 ? `${(al.kg_dia * 1000).toFixed(0)} g` : `${al.kg_dia} kg`}
                    </div>
                    <div className="text-zinc-600 text-xs">{al.ms_kg} kg MS</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => eliminarIngrediente(al.id)}
                      className="text-red-500 text-xs hover:text-red-400 bg-red-950/30 px-2 py-0.5 rounded-full"
                    >
                      🗑️ Eliminar
                    </button>
                    <select
                      value={estadosCalidad[al.id] || "Óptimo"}
                      onChange={(e) => cambiarCalidad(al.id, e.target.value)}
                      className="bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-0.5 text-xs text-white"
                    >
                      <option value="Óptimo">Óptimo</option>
                      <option value="Bueno">Bueno</option>
                      <option value="Regular">Regular</option>
                      <option value="Bajo">Bajo</option>
                      <option value="Muy deteriorado">Muy deteriorado</option>
                    </select>
                  </div>
                  <div className="text-zinc-500 text-xs">
                    Calidad: {al.calidad}
                  </div>
                </div>
              </div>
            ))}
            <div className="text-xs font-bold text-zinc-400 mb-2 mt-4">Resumen nutricional</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.indicadores.ms_total_kg} kg</div>
                <div className="text-zinc-500 text-xs">MS total · {resultado.indicadores.ms_pct_pv}% PV</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.indicadores.fdn_pct}%</div>
                <div className="text-zinc-500 text-xs">FDN (mín 35%)</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.indicadores.em_aportada} Mcal</div>
                <div className="text-zinc-500 text-xs">EM · req {resultado.req.em_total.toFixed(2)}</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.indicadores.pb_aportada} g</div>
                <div className="text-zinc-500 text-xs">PB · req {resultado.req.pb_total.toFixed(0)} g</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">Bs. {resultado.indicadores.costo_dia}</div>
                <div className="text-zinc-500 text-xs">Costo/día</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">Bs. {(parseFloat(resultado.indicadores.costo_dia) * 30).toFixed(0)}</div>
                <div className="text-zinc-500 text-xs">Costo/mes</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.gdp_estimada} kg/día</div>
                <div className="text-zinc-500 text-xs">Ganancia estimada</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.indicadores.conversion}</div>
                <div className="text-zinc-500 text-xs">Conversión alimenticia</div>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <div className="text-xs font-bold text-zinc-400 mb-1">Cumplimiento de requerimientos</div>
              <div className="flex justify-between">
                <span>Energía</span>
                <Badge color={resultado.indicadores.cumplimiento_energia >= 85 ? "green" : resultado.indicadores.cumplimiento_energia >= 70 ? "yellow" : "red"}>
                  {resultado.indicadores.cumplimiento_energia}%
                </Badge>
              </div>
              <div className="flex justify-between mt-1">
                <span>Proteína</span>
                <Badge color={resultado.indicadores.cumplimiento_proteina >= 85 ? "green" : resultado.indicadores.cumplimiento_proteina >= 70 ? "yellow" : "red"}>
                  {resultado.indicadores.cumplimiento_proteina}%
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
      {Object.keys(preciosUsr).length === 0 && (
        <Card className="bg-sky-950/30 border-sky-700/40">
          <p className="text-sky-300 text-xs">💡 Puedes colocar precios a los alimentos en la pantalla "Alimentos" para calcular una dieta más económica.</p>
        </Card>
      )}
    </div>
  );
};

export default CalculadoraRacion;
