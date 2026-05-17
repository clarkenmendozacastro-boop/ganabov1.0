// src/components/racion/CalculadoraRacion.jsx
import React, { useState } from "react";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, TIPOS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";
import { RAZAS } from "../../data/razas";
import { formularRacionInteligente, calcularRequerimientos } from "../../utils/nutricion";

const CalculadoraRacion = ({ preciosUsr, customAl, minsAlimentos }) => {
  const [peso, setPeso] = useState("");
  const [raza, setRaza] = useState("otro");
  const [sistema, setSistema] = useState("semiIntensivo");
  const [modo, setModo] = useState("automatico");
  const [selIds, setSelIds] = useState(new Set());
  const [busq, setBusq] = useState("");
  const [resultado, setResultado] = useState(null);
  const [showSel, setShowSel] = useState(false);

  const todosAl = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todosAl.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busq.toLowerCase()) ||
      TIPO_LABELS[a.tipo]?.toLowerCase().includes(busq.toLowerCase())
  );
  const razaObj = RAZAS.find((r) => r.id === raza) || RAZAS[8];
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

  const calcular = () => {
    if (!peso || parseFloat(peso) < 80) return alert("Peso mínimo 80 kg");

    let alimentosUsar = [];
    if (modo === "personalizado") {
      if (seleccionados.length === 0) return alert("Seleccione al menos un alimento en modo personalizado.");
      alimentosUsar = seleccionados;
    } else {
      // Modo automático o económico: usar TODOS los alimentos (excepto suplementos, que el motor ya maneja)
      alimentosUsar = todosAl.filter((a) => a.tipo !== "suplemento");
    }

    const modoMotor = modo === "automatico" ? "óptimo" : "económico";

    const result = formularRacionInteligente({
      pv: peso,
      sistemaId: sistema,
      alimentosDisponibles: alimentosUsar,
      preciosUsuario: preciosUsr,
      estadosCalidad: {}, // Opcional: se puede expandir para calidades
      modo: modoMotor,
    });

    if (result.error) {
      alert(result.msg);
      setResultado(null);
      return;
    }

    // Calcular requerimientos para el animal (para mostrar balances)
    const req = calcularRequerimientos(peso, razaObj, sistema);

    // Transformar al formato de la UI
    const racionFormateada = result.racion.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      tipo: r.categoria,
      kg_dia: r.kg_dia,
      ms_kg: r.ms_kg,
      precio_kg: r.precio_total / r.kg_dia,
    }));

    setResultado({
      racion: racionFormateada,
      req,
      ms_total: result.indicadores.ms_total_kg.toFixed(2),
      ms_pct_pv: result.indicadores.ms_pct_pv,
      em_total: result.indicadores.em_aportada.toFixed(2),
      prot_total: result.indicadores.pb_aportada.toFixed(0),
      fdn_pct: result.indicadores.fdn_pct,
      costo_total: result.indicadores.costo_dia.toFixed(2),
      balance_em: (result.indicadores.em_aportada - req.em_total).toFixed(2),
      balance_prot: (result.indicadores.pb_aportada - req.pb_total).toFixed(0),
      alertas: result.alertas,
      metodo: "NRC+IA (Motor Inteligente)",
      alertaAcidosis: result.indicadores.fdn_pct < 35,
      alertaPastoFresco: false,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-white">🔬 Formulación de Ración - Motor Inteligente</h2>
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
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Sistema de producción
          </label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <button
              onClick={() => setSistema("extensivo")}
              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                sistema === "extensivo"
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-600 text-zinc-400"
              }`}
            >
              🌾 Extensivo
            </button>
            <button
              onClick={() => setSistema("semiIntensivo")}
              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                sistema === "semiIntensivo"
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-600 text-zinc-400"
              }`}
            >
              ⚡ Semi-intensivo
            </button>
            <button
              onClick={() => setSistema("intensivo")}
              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                sistema === "intensivo"
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-600 text-zinc-400"
              }`}
            >
              🔥 Intensivo
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Modo de formulación
          </label>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setModo("automatico")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                modo === "automatico"
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-600 text-zinc-400"
              }`}
            >
              🚀 Automático (óptimo)
            </button>
            <button
              onClick={() => setModo("economico")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                modo === "economico"
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-600 text-zinc-400"
              }`}
            >
              💰 Económico
            </button>
            <button
              onClick={() => setModo("personalizado")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                modo === "personalizado"
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-600 text-zinc-400"
              }`}
            >
              ✏️ Personalizado
            </button>
          </div>
          <p className="text-zinc-400 text-xs mt-2">
            {modo === "automatico" &&
              "El motor selecciona los mejores ingredientes para maximizar ganancia, respetando límites biológicos."}
            {modo === "economico" &&
              "Prioriza el menor costo, manteniendo los requerimientos nutricionales mínimos."}
            {modo === "personalizado" && "Elige manualmente los alimentos que quieras incluir."}
          </p>
        </div>

        {modo === "personalizado" && (
          <div className="flex flex-col gap-3">
            <Btn variant="secondary" onClick={() => setShowSel(!showSel)}>
              {showSel ? "Cerrar" : `+ Elegir alimentos${seleccionados.length > 0 ? ` (${seleccionados.length})` : ""}`}
            </Btn>
            {showSel && (
              <div className="flex flex-col gap-1">
                <Inp placeholder="Buscar..." value={busq} onChange={(e) => setBusq(e.target.value)} />
                {TIPOS_ORDER.map((tipo) => {
                  const gr = filtrados.filter((a) => a.tipo === tipo);
                  if (!gr.length) return null;
                  return (
                    <div key={tipo}>
                      <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1 mt-3">
                        {TIPO_LABELS[tipo]}
                      </div>
                      {gr.map((al) => {
                        const minMostrar = minsAlimentos[al.id] || 0;
                        return (
                          <button
                            key={al.id}
                            onClick={() => toggleSeleccion(al.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-all mb-1 ${
                              selIds.has(al.id)
                                ? "border-emerald-600 bg-emerald-950/40 text-emerald-300"
                                : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500"
                            }`}
                          >
                            <div className="flex justify-between">
                              <span className="font-semibold">{al.nombre}</span>
                              <span>{selIds.has(al.id) ? "✓" : ""}</span>
                            </div>
                            <span className="text-zinc-500 text-xs">
                              PB:{al.prot}% · EM:{al.em} · FDN:{al.fdn}% · Bs.
                              {(preciosUsr[al.id] ?? al.precio_kg).toFixed(2)}/kg{" "}
                              {minMostrar > 0 && `· Mín: ${minMostrar} kg/día`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
            {seleccionados.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {seleccionados.map((al) => (
                  <span
                    key={al.id}
                    className="inline-flex items-center gap-1 bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs px-2 py-0.5 rounded-full"
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

        <Btn onClick={calcular} className="w-full py-3 text-base">
          Calcular Ración
        </Btn>
      </Card>

      {resultado && (
        <div className="flex flex-col gap-3">
          {resultado.alertas && resultado.alertas.length > 0 &&
            resultado.alertas.map((alerta, idx) => (
              <Card key={idx} className="border-red-700/50 bg-red-950/30">
                <div className="text-red-400 font-bold text-sm">{alerta}</div>
              </Card>
            ))}
          <Card>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sky-400 font-black text-base">🔬 Ración formulada</div>
              <Badge color="purple">{resultado.metodo}</Badge>
            </div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Ingredientes — kg/día
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {resultado.racion.map((al, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-white font-semibold text-sm">{al.nombre}</div>
                    <div className="text-zinc-500 text-xs">{TIPO_LABELS[al.tipo]}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-lg">
                      {al.kg_dia < 0.1 ? `${(al.kg_dia * 1000).toFixed(0)} g` : `${al.kg_dia} kg`}
                    </div>
                    <div className="text-zinc-600 text-xs">{al.ms_kg} kg MS</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Resumen nutricional
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="font-bold text-sm text-emerald-400">{resultado.ms_total} kg</div>
                <div className="text-zinc-500 text-xs">MS total</div>
                <div className="text-zinc-600 text-xs">{resultado.ms_pct_pv}% PV</div>
              </div>
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="font-bold text-sm text-emerald-400">{resultado.fdn_pct}%</div>
                <div className="text-zinc-500 text-xs">FDN</div>
                <div className="text-zinc-600 text-xs">mín 35%</div>
              </div>
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="font-bold text-sm text-emerald-400">{resultado.em_total} Mcal</div>
                <div className="text-zinc-500 text-xs">EM aportada</div>
                <div className="text-zinc-600 text-xs">req: {resultado.req.em_total.toFixed(2)}</div>
              </div>
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="font-bold text-sm text-emerald-400">{resultado.prot_total} g</div>
                <div className="text-zinc-500 text-xs">PB aportada</div>
                <div className="text-zinc-600 text-xs">req: {resultado.req.pb_total.toFixed(0)} g</div>
              </div>
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="font-bold text-sm text-emerald-400">Bs. {resultado.costo_total}</div>
                <div className="text-zinc-500 text-xs">Costo/día</div>
              </div>
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="font-bold text-sm text-emerald-400">Bs. {(parseFloat(resultado.costo_total) * 30).toFixed(0)}</div>
                <div className="text-zinc-500 text-xs">Costo/mes</div>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex flex-col gap-1.5">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Balances</div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Energía</span>
                <Badge color={parseFloat(resultado.balance_em) >= -0.5 ? "green" : "red"}>
                  {parseFloat(resultado.balance_em) > 0 ? "+" : ""}
                  {resultado.balance_em} Mcal
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Proteína</span>
                <Badge color={parseFloat(resultado.balance_prot) >= -0.5 ? "green" : "red"}>
                  {parseFloat(resultado.balance_prot) > 0 ? "+" : ""}
                  {resultado.balance_prot} g
                </Badge>
              </div>
            </div>
          </Card>
          {(parseFloat(resultado.balance_em) < -1.0 || parseFloat(resultado.balance_prot) < -80) && (
            <Card className="border-amber-700/50 bg-amber-950/30">
              <div className="text-amber-300 font-bold text-sm mb-1">⚠️ Déficit nutricional</div>
              <p className="text-zinc-400 text-xs">
                {parseFloat(resultado.balance_em) < -1.0 ? "Déficit de energía → agregá maíz, sorgo o melaza. " : ""}
                {parseFloat(resultado.balance_prot) < -80 ? "Déficit de proteína → agregá torta de soya o harina de carne." : ""}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculadoraRacion;
