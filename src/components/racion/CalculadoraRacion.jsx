// src/components/racion/CalculadoraRacion.jsx
import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import { ALIMENTOS_BASE, CATEGORIAS_ORDER, TIPO_LABELS } from "../../data/alimentosBase";
import { RAZAS } from "../../data/razas";
import { formularRacionAvanzada, FASES_FEEDLOT } from "../../utils/nutricion";

const QUALITY_OPTIONS = ["Óptimo", "Bueno", "Regular", "Bajo", "Muy deteriorado"];

const CalculadoraRacion = ({ 
  preciosUsr = {}, customAl = [], minsAlimentos = {}, 
  animales = [], grupos = [], uid, onFormulacionGuardada 
}) => {
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
  const [numAnimales, setNumAnimales] = useState(1);
  const [numDias, setNumDias] = useState(1);
  const [mostrarMultiplicador, setMostrarMultiplicador] = useState(false);
  const [modoMultiplicador, setModoMultiplicador] = useState("un_animal");
  const [tipoDestino, setTipoDestino] = useState("animal");
  const [animalSeleccionado, setAnimalSeleccionado] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [diasGuardar, setDiasGuardar] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState(null);
  const [mostrarGuardar, setMostrarGuardar] = useState(false);

  const todosAl = [...ALIMENTOS_BASE, ...customAl];
  const filtrados = todosAl.filter(a => a.nombre.toLowerCase().includes(busq.toLowerCase()) || (TIPO_LABELS[a.categoria] || "").toLowerCase().includes(busq.toLowerCase()));
  const seleccionados = todosAl.filter(a => selIds.has(a.id));
  const alimentosSeleccionadosMis = todosAl.filter(a => misAlimentosIds.has(a.id));

  useEffect(() => {
    const animalData = localStorage.getItem("formularParaAnimal");
    if (animalData) {
      try {
        const { id, nombre, raza: razaAnimal, peso: pesoAnimal } = JSON.parse(animalData);
        setPeso(pesoAnimal.toString());
        setRaza(razaAnimal);
        setTipoDestino("animal");
        setAnimalSeleccionado(id);
        localStorage.removeItem("formularParaAnimal");
        alert(`🐄 Formulando para el animal "${nombre}" (${pesoAnimal} kg)`);
      } catch (e) {}
      return;
    }
    const grupoData = localStorage.getItem("grupoFormula");
    if (grupoData) {
      try {
        const { peso: pesoGrupo, grupoId, grupoNombre } = JSON.parse(grupoData);
        setPeso(pesoGrupo.toString());
        setTipoDestino("grupo");
        setGrupoSeleccionado(grupoId);
        localStorage.removeItem("grupoFormula");
        alert(`📦 Formulando para el grupo "${grupoNombre}" (peso promedio ${pesoGrupo} kg)`);
      } catch (e) {}
    }
  }, []);

  useEffect(() => setIngredientesEliminados(new Set()), [modo, sistema, raza, peso]);

  const toggleSeleccion = (id) => {
    setSelIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setResultado(null);
  };
  const toggleMisAlimento = (id) => {
    setMisAlimentosIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
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
    if (modo === "personalizado") alimentosUsar = seleccionados.filter(a => a.id !== idEliminado);
    else if (modo === "mis_alimentos") alimentosUsar = alimentosSeleccionadosMis.filter(a => a.id !== idEliminado);
    else alimentosUsar = todosAl.filter(a => a.id !== idEliminado && !ingredientesEliminados.has(a.id));
    if (alimentosUsar.length === 0) return;
    const res = formularRacionAvanzada({
      pv: peso, sistemaId: sistema, razaId: raza,
      alimentosDisponibles: alimentosUsar, preciosUsuario: preciosUsr,
      estadosCalidad, modo,
      fase: sistema === "feedlot" ? faseFeedlot : null,
      alimentosSeleccionadosIds: modo === "mis_alimentos" ? misAlimentosIds : null
    });
    if (!res.error) setResultado(res);
  };

  const recalcular = () => {
    if (!peso) return;
    let alimentosUsar = [];
    if (modo === "personalizado") alimentosUsar = seleccionados;
    else if (modo === "mis_alimentos") alimentosUsar = alimentosSeleccionadosMis;
    else alimentosUsar = todosAl;
    if (alimentosUsar.length === 0) return;
    const res = formularRacionAvanzada({
      pv: peso, sistemaId: sistema, razaId: raza,
      alimentosDisponibles: alimentosUsar, preciosUsuario: preciosUsr,
      estadosCalidad, modo,
      fase: sistema === "feedlot" ? faseFeedlot : null,
      alimentosSeleccionadosIds: modo === "mis_alimentos" ? misAlimentosIds : null
    });
    if (!res.error) setResultado(res);
  };

  const calcular = () => {
    if (!peso || parseFloat(peso) < 80) { alert("Peso mínimo 80 kg"); return; }
    setIngredientesEliminados(new Set());
    recalcular();
  };

  const guardarFormulacion = async () => {
    if (!resultado) { alert("Primero calcula una ración"); return; }
    if (diasGuardar < 1) { alert("Número de días no válido"); return; }
    let destinoId = null, destinoNombre = null, destinoTipo = null;
    if (tipoDestino === "animal") {
      if (!animalSeleccionado) { alert("Selecciona un animal"); return; }
      const animal = animales.find(a => a._id === animalSeleccionado);
      if (!animal) { alert("Animal no encontrado"); return; }
      destinoId = animal._id;
      destinoNombre = animal.nombre;
      destinoTipo = "animal";
    } else {
      if (!grupoSeleccionado) { alert("Selecciona un grupo"); return; }
      const grupo = grupos.find(g => g.id === grupoSeleccionado);
      if (!grupo) { alert("Grupo no encontrado"); return; }
      destinoId = grupo.id;
      destinoNombre = grupo.nombre;
      destinoTipo = "grupo";
    }
    if (!uid) { alert("Error: Usuario no autenticado"); return; }
    setGuardando(true);
    setMensajeGuardado(null);
    try {
      const datos = {
        fecha: new Date().toISOString(),
        fecha_local: new Date().toLocaleDateString(),
        peso_animal: parseFloat(peso),
        raza, sistema, modo,
        fase_feedlot: sistema === "feedlot" ? faseFeedlot : null,
        gdp_estimada: resultado.gdp_estimada,
        indicadores: resultado.indicadores,
        ingredientes: resultado.racion.map(r => ({ id: r.id, nombre: r.nombre, categoria: r.categoria, kg_dia: r.kg_dia, ms_kg: r.ms_kg })),
        destino_id: destinoId,
        destino_nombre: destinoNombre,
        destino_tipo: destinoTipo,
        num_animales: mostrarMultiplicador ? numAnimales : 1,
        num_dias: diasGuardar,
        createdAt: new Date()
      };
      const ref = collection(db, "users", uid, "raciones_historicas");
      const docRef = await addDoc(ref, datos);
      console.log("Guardado con ID:", docRef.id);
      setMensajeGuardado(`✅ Formulación guardada para ${destinoNombre} (${diasGuardar} días)`);
      if (onFormulacionGuardada) onFormulacionGuardada();
      setTimeout(() => setMensajeGuardado(null), 3000);
    } catch (error) {
      console.error("Error guardando:", error);
      setMensajeGuardado(`❌ Error: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const getRiesgoColor = (riesgo) => {
    if (riesgo === "seguro") return "green";
    if (riesgo === "precaución" || riesgo === "precaución (con pasto)") return "yellow";
    if (riesgo === "alto") return "orange";
    if (riesgo === "crítico") return "red";
    return "gray";
  };

  const handleNumAnimalesChange = (e) => { const val = e.target.value; setNumAnimales(val === "" ? "" : parseInt(val) || 1); };
  const handleNumDiasChange = (e) => { const val = e.target.value; setNumDias(val === "" ? "" : parseInt(val) || 1); };
  const handleDiasGuardarChange = (e) => { const val = e.target.value; setDiasGuardar(val === "" ? "" : parseInt(val) || 1); };
  const esPastorilAuto = (sistema === "pastoril" && (modo === "optimo" || modo === "economico"));

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-black text-white">🐄 GanaBov Engine Pro</h2>
      <Card className="flex flex-col gap-4">
        <Inp label="Peso (kg)" type="number" value={peso} onChange={e => { setPeso(e.target.value); setResultado(null); }} placeholder="280" />
        <Sel label="Raza" value={raza} onChange={e => setRaza(e.target.value)} className="bg-zinc-800 border border-zinc-600 text-white rounded-xl">
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
        <div className="flex gap-2">
          <button onClick={() => { setModoMultiplicador("un_animal"); setMostrarMultiplicador(false); }} className={`flex-1 py-1 rounded-xl text-xs font-bold border ${modoMultiplicador === "un_animal" && !mostrarMultiplicador ? "bg-emerald-600" : "bg-zinc-800"}`}>🐄 Un animal</button>
          <button onClick={() => { setModoMultiplicador("lote"); setMostrarMultiplicador(true); }} className={`flex-1 py-1 rounded-xl text-xs font-bold border ${modoMultiplicador === "lote" && mostrarMultiplicador ? "bg-emerald-600" : "bg-zinc-800"}`}>📦 Lote / varios días</button>
        </div>
        {mostrarMultiplicador && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Número de animales</label><input type="number" value={numAnimales === "" ? "" : numAnimales} onChange={handleNumAnimalesChange} className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" min="1" /></div>
            <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Número de días</label><input type="number" value={numDias === "" ? "" : numDias} onChange={handleNumDiasChange} className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" min="1" /></div>
          </div>
        )}
        {modo === "personalizado" && (
          <div>
            <Btn variant="secondary" onClick={() => setShowSel(!showSel)} className="w-full">{showSel ? "Cerrar" : `+ Elegir alimentos (${seleccionados.length})`}</Btn>
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
            <Btn variant="secondary" onClick={() => setShowMisAlimentos(!showMisAlimentos)} className="w-full">{showMisAlimentos ? "Cerrar" : `📦 Seleccionar mis alimentos (${alimentosSeleccionadosMis.length})`}</Btn>
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
        <button onClick={() => setMostrarGuardar(!mostrarGuardar)} className="text-xs text-sky-400 underline text-right">{mostrarGuardar ? "Ocultar" : "💾 Guardar formulación"}</button>
        {mostrarGuardar && (
          <div className="border-t border-zinc-700 pt-3 mt-1">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">📌 Datos para guardar</div>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setTipoDestino("animal")} className={`flex-1 py-1 rounded-xl text-xs font-bold border ${tipoDestino === "animal" ? "bg-emerald-600" : "bg-zinc-800"}`}>🐄 Animal</button>
              <button onClick={() => setTipoDestino("grupo")} className={`flex-1 py-1 rounded-xl text-xs font-bold border ${tipoDestino === "grupo" ? "bg-emerald-600" : "bg-zinc-800"}`}>📦 Grupo</button>
            </div>
            {tipoDestino === "animal" && (
              <select value={animalSeleccionado} onChange={e => setAnimalSeleccionado(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 mb-2">
                <option value="" className="bg-zinc-800">Seleccionar animal</option>
                {animales.map(animal => <option key={animal._id} value={animal._id} className="bg-zinc-800">{animal.nombre} - {animal.peso_inicial}kg</option>)}
              </select>
            )}
            {tipoDestino === "grupo" && (
              <select value={grupoSeleccionado} onChange={e => setGrupoSeleccionado(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 mb-2">
                <option value="" className="bg-zinc-800">Seleccionar grupo</option>
                {grupos.map(grupo => <option key={grupo.id} value={grupo.id} className="bg-zinc-800">{grupo.nombre} - {grupo.animales?.length || 0} animales</option>)}
              </select>
            )}
            <div className="mb-2"><label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Días</label><input type="number" value={diasGuardar === "" ? "" : diasGuardar} onChange={handleDiasGuardarChange} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" min="1" /></div>
            <div className="flex gap-2">
              <Btn onClick={guardarFormulacion} disabled={guardando || !resultado} className="flex-1 py-2 text-sm" variant="primary">{guardando ? "Guardando..." : "💾 Guardar"}</Btn>
              <Btn onClick={() => setMostrarGuardar(false)} className="flex-1 py-2 text-sm" variant="secondary">Cancelar</Btn>
            </div>
            {mensajeGuardado && <div className={`text-xs text-center mt-2 ${mensajeGuardado.includes("✅") ? "text-emerald-400" : "text-red-400"}`}>{mensajeGuardado}</div>}
          </div>
        )}
        <button onClick={() => setModoProfesional(!modoProfesional)} className="text-xs text-sky-400 underline text-right">{modoProfesional ? "📘 Modo Simple" : "🔬 Modo Profesional"}</button>
        <Btn onClick={calcular} className="w-full py-3">Formular Ración</Btn>
      </Card>

      {resultado && (
        <Card>
          <div className="flex justify-between items-center mb-2"><h3 className="text-white font-bold">📊 Resultados</h3><Badge color={resultado.gdp_estimada > 0.8 ? "green" : resultado.gdp_estimada > 0.4 ? "yellow" : "orange"}>{resultado.gdp_estimada} kg/día</Badge></div>
          {resultado.alertasCalidad && resultado.alertasCalidad.map((a, i) => <div key={i} className="border border-red-700 bg-red-950/50 p-2 rounded-lg mb-2"><div className="text-red-400 font-bold text-sm">🚨 ALERTA: {a.nombre} - Calidad "{a.calidad}"</div><div className="text-red-300 text-xs mt-1">{a.mensaje}</div></div>)}
          {resultado.deficiencias && resultado.deficiencias.map((d, i) => <div key={i} className="border border-amber-700 bg-amber-950/30 p-2 rounded-lg mb-2"><div className="text-amber-400 text-sm font-bold">{d.msg}</div></div>)}
          <div className="text-xs font-bold mt-2">Ingredientes {mostrarMultiplicador ? `(${numAnimales} animales × ${numDias} días)` : "(por animal/día)"}</div>
          {resultado.racion.map((al, i) => {
            const kgPorAnimal = al.kg_dia;
            const loteTotal = mostrarMultiplicador ? (kgPorAnimal * (numAnimales || 1)).toFixed(2) : null;
            const periodoTotal = mostrarMultiplicador ? (kgPorAnimal * (numAnimales || 1) * (numDias || 1)).toFixed(2) : null;
            return (
              <div key={i} className="flex justify-between items-center border-b border-zinc-700 py-2">
                <div className="flex-1">
                  <span className="text-sm">{al.nombre}</span><span className="text-xs text-zinc-500 ml-2">({al.categoria})</span>
                  <div className="flex gap-2 mt-1">
                    <select value={estadosCalidad[al.id] || al.calidad || "Óptimo"} onChange={(e) => cambiarCalidad(al.id, e.target.value)} className={`bg-zinc-800 border rounded-lg px-2 py-0.5 text-xs ${estadosCalidad[al.id] === "Bajo" || estadosCalidad[al.id] === "Muy deteriorado" ? "border-red-500 text-red-400" : "border-zinc-600"}`}>
                      {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                    <button onClick={() => eliminarIngrediente(al.id)} className="text-red-500 text-xs hover:text-red-400">🗑️ Eliminar</button>
                  </div>
                </div>
                <div className="text-right">
                  {mostrarMultiplicador ? (
                    <><div className="text-emerald-400 font-bold">{periodoTotal} kg <span className="text-xs text-zinc-500">(total)</span></div><div className="text-xs text-zinc-500">{loteTotal} kg/día para {numAnimales} animales</div><div className="text-xs text-zinc-600">{kgPorAnimal} kg/animal/día</div></>
                  ) : (
                    <><div className="text-emerald-400 font-bold">{kgPorAnimal} kg</div><div className="text-xs text-zinc-500">{al.ms_kg} kg MS</div></>
                  )}
                </div>
              </div>
            );
          })}
          {mostrarMultiplicador && (
            <div className="mt-3 bg-emerald-950/30 p-2 rounded-lg border border-emerald-700/50">
              <div className="text-emerald-400 text-xs font-bold mb-1">📊 Resumen para {numAnimales} animales durante {numDias} días</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {resultado.racion.map((al, i) => {
                  const periodoTotal = (al.kg_dia * (numAnimales || 1) * (numDias || 1)).toFixed(2);
                  return <div key={i} className="flex justify-between"><span className="text-zinc-400">{al.nombre.split("(")[0].trim()}:</span><span className="text-emerald-400 font-bold">{periodoTotal} kg</span></div>;
                })}
                <div className="flex justify-between border-t border-emerald-700/50 pt-1 mt-1"><span className="text-zinc-400">Costo total:</span><span className="text-emerald-400 font-bold">Bs. {(resultado.indicadores.costo_dia * (numAnimales || 1) * (numDias || 1)).toFixed(2)}</span></div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">MS total</span><br/><b>{resultado.indicadores.ms_total_kg} kg</b> ({resultado.indicadores.ms_pct_pv}% PV)</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">peNDF</span><br/><b>{resultado.indicadores.peNDF_pct}%</b></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">ENm aportada</span><br/><b>{resultado.indicadores.enm_aportada}</b> / {resultado.indicadores.enm_requerida} Mcal</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">PB aportada</span><br/><b>{resultado.indicadores.pb_aportada}</b> / {resultado.indicadores.pb_requerida} g</div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Riesgo acidosis</span><br/><Badge color={getRiesgoColor(resultado.indicadores.riesgo_acidosis)}>{resultado.indicadores.riesgo_acidosis}</Badge></div>
            <div className="bg-zinc-800 p-2 rounded"><span className="text-xs">Costo/día</span><br/><b>Bs. {resultado.indicadores.costo_dia}</b> {mostrarMultiplicador && <span className="text-xs text-zinc-500">/animal</span>}</div>
          </div>
          {modoProfesional && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Cumplimiento energía</span><div className="font-bold text-emerald-400">{resultado.indicadores.cumplimiento_energia}%</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center"><span className="text-xs">Score acidosis</span><div className="font-bold text-emerald-400">{resultado.indicadores.score_acidosis}</div></div>
              <div className="bg-zinc-800 p-2 rounded text-center col-span-2"><span className="text-xs">Conversión alimenticia</span><div className="font-bold text-emerald-400">{resultado.indicadores.conversion}</div></div>
            </div>
          )}
          {resultado.explicaciones && resultado.explicaciones.map((e, i) => <div key={i} className="text-sky-300 text-xs italic mt-2">🧠 {e}</div>)}
          {esPastorilAuto && (
            <div className="mt-3 p-3 bg-blue-950/30 border border-blue-700/50 rounded-lg">
              <div className="text-blue-400 text-sm font-bold mb-1">🌿 Instrucciones para sistema pastoril</div>
              <p className="text-blue-300 text-xs">Este suplemento debe ser ofrecido <strong>junto con pasto fresco de buena calidad</strong> en el potrero. El animal ya consume forraje directamente, por lo que el suplemento solo complementa la energía y proteína que el pasto no alcanza a cubrir. Asegúrese de que el animal tenga acceso a pasto durante todo el día para mantener una buena salud ruminal y evitar acidosis.</p>
              <p className="text-blue-300 text-xs mt-1">Si el pasto es escaso o de baja calidad, reduzca la cantidad de suplemento o consulte a un nutricionista.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default CalculadoraRacion;
