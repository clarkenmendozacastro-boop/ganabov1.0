// src/components/racion/CalculadoraRacion.jsx
import React, { useState } from "react";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, CATEGORIAS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";
import { RAZAS } from "../../data/razas";
import {
  formularRacionAvanzada,
  calcularRequerimientosAvanzado,
  FASES_FEEDLOT,
} from "../../utils/nutricion";

const CalculadoraRacion = ({ preciosUsr = {}, customAl = [], minsAlimentos = {} }) => {
  // Estados principales
  const [peso, setPeso] = useState("");
  const [raza, setRaza] = useState("otro");
  const [sistema, setSistema] = useState("semiIntensivo");
  const [modo, setModo] = useState("optimo"); // "optimo", "economico", "personalizado"
  const [faseFeedlot, setFaseFeedlot] = useState("inicio"); // solo aplica si sistema === "feedlot"
  const [selIds, setSelIds] = useState(new Set());
  const [busq, setBusq] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSel, setShowSel] = useState(false);
  const [estadosCalidad, setEstadosCalidad] = useState({});
  const [modoProfesional, setModoProfesional] = useState(false); // toggle entre simple/profesional

  const todosAl = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todosAl.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busq.toLowerCase()) ||
      (TIPO_LABELS[a.categoria] || "").toLowerCase().includes(busq.toLowerCase())
  );
  const seleccionados = todosAl.filter((a) => selIds.has(a.id));

  const toggleSeleccion = (id) => {
    setSelIds((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
    setResultado(null);
  };

  const cambiarCalidad = (id, nuevaCalidad) => {
    setEstadosCalidad((prev) => ({ ...prev, [id]: nuevaCalidad }));
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
    const result = formularRacionAvanzada({
      pv: peso,
      sistemaId: sistema,
      alimentosDisponibles: alimentosUsar,
      preciosUsuario: preciosUsr,
      estadosCalidad,
      modo: modo === "optimo" ? "optimo" : "economico",
      fase: sistema === "feedlot" ? faseFeedlot : null,
    });
    if (!result.error) {
      const req = calcularRequerimientosAvanzado(parseFloat(peso), sistema);
      setResultado({ ...result, req });
    } else {
      alert(result.msg);
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

    const result = formularRacionAvanzada({
      pv: peso,
      sistemaId: sistema,
      alimentosDisponibles: alimentosUsar,
      preciosUsuario: preciosUsr,
      estadosCalidad,
      modo: modo === "optimo" ? "optimo" : "economico",
      fase: sistema === "feedlot" ? faseFeedlot : null,
    });

    if (result.error) {
      alert(result.msg);
      setResultado(null);
      return;
    }

    const req = calcularRequerimientosAvanzado(parseFloat(peso), sistema);
    setResultado({ ...result, req });
  };

  const eliminarIngrediente = (idAEliminar) => {
    if (!resultado || !resultado.racion) return;
    // Simplemente filtramos el ingrediente y recalculamos con los mismos alimentos (pero excluyendo ese)
    const nuevosAlimentos = modo === "personalizado"
      ? seleccionados.filter(a => a.id !== idAEliminar)
      : todosAl.filter(a => a.id !== idAEliminar);
    if (nuevosAlimentos.length === 0) {
      alert("No quedan alimentos. No se puede formular.");
      return;
    }
    const newResult = formularRacionAvanzada({
      pv: peso,
      sistemaId: sistema,
      alimentosDisponibles: nuevosAlimentos,
      preciosUsuario: preciosUsr,
      estadosCalidad,
      modo: modo === "optimo" ? "optimo" : "economico",
      fase: sistema === "feedlot" ? faseFeedlot : null,
    });
    if (!newResult.error) {
      const req = calcularRequerimientosAvanzado(parseFloat(peso), sistema);
      setResultado({ ...newResult, req });
      if (modo === "personalizado") {
        // actualizar seleccionados
        setSelIds(new Set(nuevosAlimentos.map(a => a.id)));
      }
    } else {
      alert(newResult.msg);
    }
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
      <h2 className="text-2xl font-black text-white">🔬 Formulación de Ración - Motor Avanzado</h2>
      <Card className="flex flex-col gap-4">
        <Inp
          label="Peso vivo (kg)"
          type="number"
          value={peso}
          onChange={(e) => {
            setPeso(e.target.value);
            setResultado(null);
          }}
          placeholder="Ej: 280"
        />
        <Sel label="Raza" value={raza} onChange={(e) => setRaza(e.target.value)}>
          {RAZAS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </Sel>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Sistema de producción</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <button
              onClick={() => setSistema("pastoril")}
              className={`py-2 rounded-xl text-xs font-bold border ${
                sistema === "pastoril" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              🌾 Pastoril
            </button>
            <button
              onClick={() => setSistema("semiIntensivo")}
              className={`py-2 rounded-xl text-xs font-bold border ${
                sistema === "semiIntensivo" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              ⚡ Semi-intensivo
            </button>
            <button
              onClick={() => setSistema("feedlot")}
              className={`py-2 rounded-xl text-xs font-bold border ${
                sistema === "feedlot" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              🔥 Feedlot
            </button>
          </div>
        </div>

        {sistema === "feedlot" && (
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Fase de feedlot</label>
            <div className="flex gap-2 mt-1">
              {Object.keys(FASES_FEEDLOT).map((fase) => (
                <button
                  key={fase}
                  onClick={() => setFaseFeedlot(fase)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    faseFeedlot === fase ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {fase === "inicio" && "🌱 Inicio"}
                  {fase === "transicion" && "🔄 Transición"}
                  {fase === "terminacion" && "🔥 Terminación"}
                </button>
              ))}
            </div>
            <p className="text-zinc-500 text-xs mt-1">
              {faseFeedlot === "inicio" && "Máx. 40% concentrado · Adaptación ruminal"}
              {faseFeedlot === "transicion" && "Máx. 65% concentrado"}
              {faseFeedlot === "terminacion" && "Máx. 85% concentrado · Alta energía"}
            </p>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Modo de formulación</label>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setModo("optimo")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                modo === "optimo" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              🚀 Óptimo (salud)
            </button>
            <button
              onClick={() => setModo("economico")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                modo === "economico" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              💰 Económico
            </button>
            <button
              onClick={() => setModo("personalizado")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                modo === "personalizado" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              ✏️ Personalizado
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <button
              onClick={() => setModoProfesional(!modoProfesional)}
              className="text-xs text-sky-400 hover:text-sky-300 underline"
            >
              {modoProfesional ? "📘 Modo Simple" : "🔬 Modo Profesional"}
            </button>
          </div>
        </div>

        {modo === "personalizado" && (
          <div className="flex flex-col gap-3">
            <Btn variant="secondary" onClick={() => setShowSel(!showSel)}>
              {showSel ? "Cerrar" : `+ Elegir alimentos${seleccionados.length ? ` (${seleccionados.length})` : ""}`}
            </Btn>
            {showSel && (
              <div className="max-h-96 overflow-y-auto">
                <Inp placeholder="Buscar..." value={busq} onChange={(e) => setBusq(e.target.value)} />
                {CATEGORIAS_ORDER.map((cat) => {
                  const gr = filtrados.filter((a) => a.categoria === cat);
                  if (!gr.length) return null;
                  return (
                    <div key={cat}>
                      <div className="text-xs text-zinc-500 font-bold uppercase mt-3 mb-1">{TIPO_LABELS[cat]}</div>
                      {gr.map((al) => (
                        <button
                          key={al.id}
                          onClick={() => toggleSeleccion(al.id)}
                          className={`w-full text-left px-3 py-2 mb-1 rounded-xl text-sm border ${
                            selIds.has(al.id)
                              ? "border-emerald-600 bg-emerald-950/40"
                              : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          <div className="flex justify-between">
                            <span>{al.nombre}</span>
                            <span>{selIds.has(al.id) ? "✓" : ""}</span>
                          </div>
                          <span className="text-xs text-zinc-500">
                            MS:{al.ms}% PB:{al.prot}% EM:{al.em} Bs.
                            {(preciosUsr[al.id] ?? al.precio_kg).toFixed(2)}/kg
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
            {seleccionados.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {seleccionados.map((al) => (
                  <span
                    key={al.id}
                    className="bg-emerald-950/50 text-emerald-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                  >
                    {al.nombre.split("(")[0].trim()}
                    <button onClick={() => toggleSeleccion(al.id)} className="text-emerald-500 hover:text-red-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <Btn onClick={calcular} className="w-full py-3">
          Calcular Ración
        </Btn>
      </Card>

      {resultado && (
        <div className="flex flex-col gap-3">
          {resultado.dietaInsuficiente && (
            <Card className="border-red-700/50 bg-red-950/30">
              <div className="text-red-400 font-bold">🚨 Dieta insuficiente</div>
              <p className="text-sm">{resultado.msg || "No se puede formular una dieta funcional."}</p>
            </Card>
          )}
          {resultado.alertas.map((alerta, idx) => (
            <Card key={idx} className="border-amber-700/50 bg-amber-950/30">
              <div className="text-amber-400 text-sm font-bold">{alerta}</div>
            </Card>
          ))}
          {resultado.explicaciones && resultado.explicaciones.length > 0 && (
            <Card className="border-sky-700/50 bg-sky-950/30">
              <div className="text-sky-400 font-bold text-sm">🧠 IA Explicativa</div>
              <ul className="list-disc list-inside text-xs text-zinc-300 mt-1">
                {resultado.explicaciones.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </Card>
          )}
          <Card>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sky-400 font-black">🔬 Ración formulada</div>
              <Badge color="purple">Motor Avanzado GanaBov</Badge>
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
                  <div className="text-zinc-500 text-xs">Calidad: {al.calidad}</div>
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
                <div className="font-bold text-emerald-400">{resultado.indicadores.peNDF_pct}%</div>
                <div className="text-zinc-500 text-xs">peNDF (fibra efectiva)</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.indicadores.enm_aportada} Mcal</div>
                <div className="text-zinc-500 text-xs">ENm · req {resultado.req.ENm_total.toFixed(2)}</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.indicadores.pb_aportada} g</div>
                <div className="text-zinc-500 text-xs">PB · req {resultado.req.PB_total.toFixed(0)}</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">Bs. {resultado.indicadores.costo_dia}</div>
                <div className="text-zinc-500 text-xs">Costo/día</div>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl">
                <div className="font-bold text-emerald-400">{resultado.gdp_estimada} kg/día</div>
                <div className="text-zinc-500 text-xs">Ganancia estimada</div>
              </div>
            </div>

            {modoProfesional && (
              <>
                <div className="text-xs font-bold text-zinc-400 mb-2 mt-2">🔬 Indicadores profesionales</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-zinc-800 p-2 rounded-xl">
                    <div className="text-xs text-zinc-400">Riesgo acidosis</div>
                    <Badge color={getRiesgoColor(resultado.indicadores.riesgo_acidosis)}>
                      {resultado.indicadores.riesgo_acidosis.toUpperCase()} · Score {resultado.indicadores.score_acidosis}
                    </Badge>
                  </div>
                  <div className="bg-zinc-800 p-2 rounded-xl">
                    <div className="text-xs text-zinc-400">Sincronía ruminal</div>
                    <div className="font-bold text-sm text-emerald-400">{resultado.indicadores.sincronia}</div>
                  </div>
                  <div className="bg-zinc-800 p-2 rounded-xl">
                    <div className="text-xs text-zinc-400">Eficiencia ENm</div>
                    <div className="font-bold text-sm text-emerald-400">{(resultado.indicadores.eficiencia_enm * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-zinc-800 p-2 rounded-xl">
                    <div className="text-xs text-zinc-400">Conversión alimenticia</div>
                    <div className="font-bold text-sm text-emerald-400">{resultado.indicadores.conversion}</div>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-zinc-800 pt-3">
              <div className="text-xs font-bold text-zinc-400 mb-1">Cumplimiento de requerimientos</div>
              <div className="flex justify-between">
                <span>ENm</span>
                <Badge
                  color={
                    resultado.indicadores.enm_aportada / resultado.req.ENm_total >= 0.85
                      ? "green"
                      : resultado.indicadores.enm_aportada / resultado.req.ENm_total >= 0.7
                      ? "yellow"
                      : "red"
                  }
                >
                  {((resultado.indicadores.enm_aportada / resultado.req.ENm_total) * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between mt-1">
                <span>Proteína bruta</span>
                <Badge
                  color={
                    resultado.indicadores.pb_aportada / resultado.req.PB_total >= 0.85
                      ? "green"
                      : resultado.indicadores.pb_aportada / resultado.req.PB_total >= 0.7
                      ? "yellow"
                      : "red"
                  }
                >
                  {((resultado.indicadores.pb_aportada / resultado.req.PB_total) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
      {Object.keys(preciosUsr).length === 0 && (
        <Card className="bg-sky-950/30 border-sky-700/40">
          <p className="text-sky-300 text-xs">
            💡 Puedes colocar precios a los alimentos en la pantalla "Alimentos" para calcular una dieta más económica.
          </p>
        </Card>
      )}
    </div>
  );
};

export default CalculadoraRacion;
