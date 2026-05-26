// src/components/grupos/DetalleGrupo.jsx
import React, { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { userDoc } from "../../utils/helpers";
import { db } from "../../firebase";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import { RAZAS } from "../../data/razas";

const DetalleGrupo = ({ grupo, animales, uid, onBack, onUpdate, onFormular, onFormularAnimal }) => {
  const [animalesEnGrupo, setAnimalesEnGrupo] = useState([]);
  const [animalesNoAsignados, setAnimalesNoAsignados] = useState([]);
  const [animalSeleccionadoImportar, setAnimalSeleccionadoImportar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pesoPromedio, setPesoPromedio] = useState(0);
  const [nuevoAnimalNombre, setNuevoAnimalNombre] = useState("");
  const [nuevoAnimalRaza, setNuevoAnimalRaza] = useState("otro");
  const [nuevoAnimalPeso, setNuevoAnimalPeso] = useState("");
  const [nuevoAnimalSexo, setNuevoAnimalSexo] = useState("macho");

  const getPesoActual = (animal) => animal.pesadas?.length > 0 ? animal.pesadas[animal.pesadas.length - 1].peso : animal.peso_inicial;

  useEffect(() => {
    const idsEnGrupo = new Set(grupo.animales || []);
    const animalesImportados = animales.filter(a => idsEnGrupo.has(a._id));
    const animalesPropios = grupo.animales_propios || [];
    const todos = [...animalesImportados, ...animalesPropios];
    setAnimalesEnGrupo(todos);
    if (todos.length > 0) setPesoPromedio(todos.reduce((acc, a) => acc + getPesoActual(a), 0) / todos.length);
    else setPesoPromedio(0);
    const noAsignados = animales.filter(a => !a.grupoId && !idsEnGrupo.has(a._id));
    setAnimalesNoAsignados(noAsignados);
  }, [grupo, animales]);

  const importarAnimal = async () => {
    if (!animalSeleccionadoImportar) { alert("Selecciona un animal"); return; }
    setCargando(true);
    try {
      await updateDoc(doc(db, "users", uid, "animales", animalSeleccionadoImportar), { grupoId: grupo.id });
      const nuevosAnimales = [...(grupo.animales || []), animalSeleccionadoImportar];
      await updateDoc(userDoc(uid, "grupos", grupo.id), { animales: nuevosAnimales });
      onUpdate({ ...grupo, animales: nuevosAnimales });
      setAnimalSeleccionadoImportar("");
      alert("✅ Animal importado");
    } catch (error) { console.error(error); alert("❌ Error"); }
    setCargando(false);
  };

  const crearAnimal = async () => {
    if (!nuevoAnimalNombre || !nuevoAnimalPeso) { alert("Completá nombre y peso"); return; }
    setCargando(true);
    try {
      const nuevoAnimal = { id: Date.now().toString(), nombre: nuevoAnimalNombre, raza: nuevoAnimalRaza, sexo: nuevoAnimalSexo, peso_inicial: parseFloat(nuevoAnimalPeso), pesadas: [{ fecha: new Date().toISOString().slice(0, 10), peso: parseFloat(nuevoAnimalPeso), nota: "Peso de entrada" }], fecha_entrada: new Date().toISOString().slice(0, 10), esAnimalPropio: true, grupoId: grupo.id };
      const animalesPropios = [...(grupo.animales_propios || []), nuevoAnimal];
      await updateDoc(userDoc(uid, "grupos", grupo.id), { animales_propios: animalesPropios });
      onUpdate({ ...grupo, animales_propios: animalesPropios });
      setNuevoAnimalNombre(""); setNuevoAnimalRaza("otro"); setNuevoAnimalPeso(""); setNuevoAnimalSexo("macho");
      alert("✅ Animal creado");
    } catch (error) { console.error(error); alert("❌ Error"); }
    setCargando(false);
  };

  const quitarAnimal = async (animalId, esPropio) => {
    if (!confirm("¿Quitar este animal del grupo?")) return;
    setCargando(true);
    try {
      if (esPropio) {
        const nuevosPropios = (grupo.animales_propios || []).filter(a => a.id !== animalId);
        await updateDoc(userDoc(uid, "grupos", grupo.id), { animales_propios: nuevosPropios });
        onUpdate({ ...grupo, animales_propios: nuevosPropios });
      } else {
        await updateDoc(doc(db, "users", uid, "animales", animalId), { grupoId: null });
        const nuevosAnimales = (grupo.animales || []).filter(id => id !== animalId);
        await updateDoc(userDoc(uid, "grupos", grupo.id), { animales: nuevosAnimales });
        onUpdate({ ...grupo, animales: nuevosAnimales });
      }
      alert("✅ Animal removido");
    } catch (error) { console.error(error); alert("❌ Error"); }
    setCargando(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3"><Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">← Volver</Btn><div><div className="text-xl font-black text-white">{grupo.nombre}</div>{grupo.descripcion && <div className="text-zinc-500 text-xs">{grupo.descripcion}</div>}</div></div>

      <Card className="bg-gradient-to-r from-emerald-950/30 to-zinc-900">
        <div className="grid grid-cols-2 gap-3"><div className="text-center"><div className="text-3xl font-bold text-emerald-400">{animalesEnGrupo.length}</div><div className="text-zinc-500 text-xs">Animales</div></div><div className="text-center"><div className="text-3xl font-bold text-emerald-400">{Math.round(pesoPromedio)} kg</div><div className="text-zinc-500 text-xs">Peso promedio</div></div></div>
        <Btn onClick={() => onFormular(pesoPromedio, grupo)} className="w-full mt-3 py-2">🔬 Formular ración para TODO el grupo</Btn>
      </Card>

      <Card><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">🐄 Animales en el grupo ({animalesEnGrupo.length})</div>
        {animalesEnGrupo.length === 0 ? <p className="text-zinc-500 text-sm text-center">No hay animales</p> : <div className="max-h-60 overflow-y-auto">{animalesEnGrupo.map((animal) => { const animalId = animal._id || animal.id; const esPropio = !!animal.esAnimalPropio; const pesoActual = getPesoActual(animal); return (<div key={animalId} className="flex justify-between items-center py-2 border-b border-zinc-700 last:border-0"><div><div className="text-white text-sm font-semibold">{animal.nombre}</div><div className="text-zinc-500 text-xs">{pesoActual} kg · {RAZAS.find(r => r.id === animal.raza)?.nombre || animal.raza}{esPropio && <Badge color="blue" className="ml-2">Propio</Badge>}</div></div><div className="flex gap-2"><button onClick={() => onFormularAnimal(animal)} className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 px-2 py-1 rounded-full">🍽️</button><button onClick={() => quitarAnimal(animalId, esPropio)} className="text-xs text-red-400 hover:text-red-300">Quitar</button></div></div>); })}</div>}</Card>

      <Card><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">➕ Importar desde "Mis Animales"</div>
        <div className="flex gap-2"><select className="flex-1 bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-sm" value={animalSeleccionadoImportar} onChange={(e) => setAnimalSeleccionadoImportar(e.target.value)}><option value="">Seleccionar animal</option>{animalesNoAsignados.map(a => (<option key={a._id} value={a._id}>{a.nombre} - {getPesoActual(a)} kg</option>))}</select><Btn onClick={importarAnimal} disabled={cargando} variant="secondary">➕ Importar</Btn></div>
        {animalesNoAsignados.length === 0 && <p className="text-zinc-500 text-xs mt-2">No hay animales disponibles</p>}
      </Card>

      <Card><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">✏️ Crear animal en el grupo</div>
        <div className="grid grid-cols-2 gap-2"><Inp placeholder="Nombre" value={nuevoAnimalNombre} onChange={(e) => setNuevoAnimalNombre(e.target.value)} /><Sel value={nuevoAnimalRaza} onChange={(e) => setNuevoAnimalRaza(e.target.value)}>{RAZAS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</Sel><Inp placeholder="Peso inicial (kg)" type="number" value={nuevoAnimalPeso} onChange={(e) => setNuevoAnimalPeso(e.target.value)} /><Sel value={nuevoAnimalSexo} onChange={(e) => setNuevoAnimalSexo(e.target.value)}><option value="macho">Macho</option><option value="hembra">Hembra</option></Sel></div>
        <Btn onClick={crearAnimal} disabled={cargando} variant="secondary" className="w-full mt-2">➕ Agregar animal</Btn>
      </Card>
    </div>
  );
};

export default DetalleGrupo;
