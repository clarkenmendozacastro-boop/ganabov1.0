// src/components/animales/DetalleAnimal.jsx
import React, { useState, useEffect } from "react";
import { deleteDoc, setDoc, collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { userDoc } from "../../utils/helpers";
import Badge from "../ui/Badge";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import VentaCalc from "./VentaCalc";
import { RAZAS } from "../../data/razas";
import { calcularGDP, evaluarVenta, recomendarAjuste, calcularProyeccion } from "../../utils/venta";

const DetalleAnimal = ({ animal, onUpdate, onDelete, onBack, preciosUsr, uid, grupos = [], onFormular }) => {
  const [tab, setTab] = useState("info");
  const [np, setNp] = useState({ fecha: new Date().toISOString().slice(0, 10), peso: "", nota: "" });
  const [confirmDel, setConfirmDel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historialRaciones, setHistorialRaciones] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const raza = RAZAS.find((r) => r.id === animal.raza) || RAZAS[8];
  const gdp = calcularGDP(animal.pesadas);
  const ult = animal.pesadas?.length > 0 ? animal.pesadas[animal.pesadas.length - 1].peso : animal.peso_inicial;
  const ev = evaluarVenta(ult, gdp, raza);
  const ajustes = recomendarAjuste(gdp, raza, animal.raza === "criollo" || animal.raza === "criollo_cruce");
  const proy450 = calcularProyeccion(ult, 450, gdp > 0 ? gdp : raza.gdp_base, raza);
  const proy500 = calcularProyeccion(ult, 500, gdp > 0 ? gdp : raza.gdp_base, raza);
  const bajoRendimiento = animal.pesadas?.length >= 2 && gdp < raza.gdp_base * 0.7;
  const grupoDelAnimal = animal.grupoId ? grupos.find(g => g.id === animal.grupoId) : null;

  const cargarHistorial = async () => {
    if (!uid || !animal._id) return;
    setCargandoHistorial(true);
    try {
      const q = query(
        collection(db, "users", uid, "raciones_historicas"),
        where("destino_id", "==", animal._id),
        where("destino_tipo", "==", "animal"),
        orderBy("fecha", "desc")
      );
      const snapshot = await getDocs(q);
      const historial = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistorialRaciones(historial);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
    setCargandoHistorial(false);
  };

  // Eliminar una ración del historial
  const eliminarRacion = async (idRacion, fecha) => {
    if (!confirm(`¿Eliminar la ración del ${new Date(fecha).toLocaleDateString()}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, "users", uid, "raciones_historicas", idRacion));
      // Recargar historial después de eliminar
      await cargarHistorial();
      alert("✅ Ración eliminada del historial");
    } catch (error) {
      console.error("Error eliminando ración:", error);
      alert("❌ Error al eliminar");
    }
  };

  useEffect(() => {
    if (tab === "alimentacion") cargarHistorial();
  }, [tab, animal._id]);

  const addPesada = async () => {
    if (!np.peso) return;
    setSaving(true);
    const nuevasPesadas = [...(animal.pesadas || []), { ...np, peso: parseFloat(np.peso) }];
    const updated = { ...animal, pesadas: nuevasPesadas };
    await setDoc(userDoc(uid, "animales", animal._id), { ...updated, updatedAt: new Date() });
    onUpdate(updated);
    setNp({ fecha: new Date().toISOString().slice(0, 10), peso: "", nota: "" });
    setSaving(false);
  };

  const eliminar = async () => {
    await deleteDoc(userDoc(uid, "animales", animal._id));
    onDelete(animal._id);
  };

  const sacarDelGrupo = async () => {
    if (!confirm("¿Sacar este animal del grupo? No se eliminará de la lista.")) return;
    try {
      await updateDoc(doc(db, "users", uid, "animales", animal._id), { grupoId: null });
      onUpdate({ ...animal, grupoId: null });
      alert("✅ Animal removido del grupo");
    } catch (error) {
      console.error(error);
      alert("❌ Error al remover del grupo");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">← Volver</Btn>
          <div>
            <div className="text-xl font-black text-white">{animal.nombre}</div>
            <div className="text-zinc-500 text-xs">{raza.nombre} · {animal.sexo}{grupoDelAnimal && <span className="text-emerald-400 ml-2">📦 {grupoDelAnimal.nombre}</span>}</div>
          </div>
        </div>
        {!confirmDel ? <Btn variant="danger" onClick={() => setConfirmDel(true)} className="text-xs py-1 px-3">🗑️ Eliminar</Btn> : <div className="flex gap-1"><Btn variant="danger" onClick={eliminar} className="text-xs py-1 px-2">✓ Confirmar</Btn><Btn variant="ghost" onClick={() => setConfirmDel(false)} className="text-xs py-1 px-2">Cancelar</Btn></div>}
      </div>

      {/* Alerta bajo rendimiento */}
      {bajoRendimiento && (
        <Card className="border-red-700/50 bg-red-950/30">
          <div className="text-red-400 font-bold text-sm mb-2">⚠️ Bajo rendimiento — GDP: {gdp.toFixed(3)} kg/día · Esperado: {raza.gdp_base}</div>
          {ajustes.map((a, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl p-3 mb-2">
              <div className="text-amber-400 font-semibold text-xs">{a.titulo}</div>
              <div className="text-zinc-400 text-xs mt-0.5">{a.detalle}</div>
              {a.costo && <div className="text-emerald-400 text-xs mt-1">Costo extra: {a.costo}</div>}
            </div>
          ))}
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-700/60 rounded-2xl p-1">
        {["info", "pesadas", "proyeccion", "venta", "alimentacion"].map(id => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === id ? "bg-emerald-600 text-white" : "text-zinc-400"}`}>
            {id === "info" ? "Info" : id === "pesadas" ? "Pesadas" : id === "proyeccion" ? "Proyección" : id === "venta" ? "Venta" : "Alimentación"}
          </button>
        ))}
      </div>

      {/* Info */}
      {tab === "info" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center py-3"><div className="text-xl font-black text-zinc-300">{animal.peso_inicial} kg</div><div className="text-zinc-500 text-xs">Peso inicial</div></Card>
            <Card className="text-center py-3"><div className="text-xl font-black text-emerald-400">{ult} kg</div><div className="text-zinc-500 text-xs">Peso actual</div></Card>
            <Card className="text-center py-3"><div className="text-xl font-black text-sky-400">{(ult - animal.peso_inicial).toFixed(0)} kg</div><div className="text-zinc-500 text-xs">Ganancia total</div></Card>
            <Card className="text-center py-3"><div className="text-xl font-black text-amber-400">{gdp > 0 ? `${gdp.toFixed(3)} kg/d` : "Sin datos"}</div><div className="text-zinc-500 text-xs">GDP promedio</div></Card>
          </div>
          {animal.notas && (<Card><p className="text-zinc-400 text-sm">📝 {animal.notas}</p></Card>)}
          <Card><Btn onClick={() => { if (window.confirm(`¿Formular ración para ${animal.nombre} (${ult} kg)?`)) onFormular(animal); }} className="w-full py-2">🍽️ Asignar alimentación</Btn></Card>
          {animal.grupoId && (<Card><Btn onClick={sacarDelGrupo} variant="secondary" className="w-full py-2">📦 Sacar del grupo</Btn></Card>)}
        </div>
      )}

      {/* Pesadas */}
      {tab === "pesadas" && (
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Registrar pesada</div>
            <Inp label="Fecha" type="date" value={np.fecha} onChange={e => setNp(p => ({ ...p, fecha: e.target.value }))} />
            <Inp label="Peso (kg)" type="number" value={np.peso} onChange={e => setNp(p => ({ ...p, peso: e.target.value }))} placeholder="285" />
            <Inp label="Nota (opcional)" value={np.nota} onChange={e => setNp(p => ({ ...p, nota: e.target.value }))} placeholder="Observación..." />
            <Btn onClick={addPesada} disabled={saving}>{saving ? "Guardando..." : "Registrar"}</Btn>
          </Card>
          {[...(animal.pesadas || [])].reverse().map((p, i) => (
            <Card key={i} className="py-3">
              <div className="flex justify-between items-center">
                <div><div className="text-white font-bold">{p.peso} kg</div><div className="text-zinc-500 text-xs">{p.fecha}{p.nota ? ` · ${p.nota}` : ""}</div></div>
                <Badge color="gray">{i === animal.pesadas.length - 1 ? "entrada" : "pesada"}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Proyección */}
      {tab === "proyeccion" && (
        <div className="flex flex-col gap-3">
          {[450, 500].map(meta => {
            const proj = meta === 450 ? proy450 : proy500;
            return proj ? (
              <Card key={meta}>
                <div className="text-emerald-400 font-black text-lg mb-3">Meta: {meta} kg</div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-zinc-800 rounded-xl p-3 text-center"><div className="text-white font-black text-xl">{proj.dias} días</div><div className="text-zinc-500 text-xs">{proj.meses} meses</div></div>
                  <div className="bg-zinc-800 rounded-xl p-3 text-center"><div className="text-amber-400 font-black text-xl">{proj.canal} kg</div><div className="text-zinc-500 text-xs">peso canal</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-zinc-800 rounded-xl p-2"><div className="font-bold text-sm text-emerald-400">{proj.carneLimpia} kg</div><div className="text-zinc-600 text-xs">carne</div></div>
                  <div className="bg-zinc-800 rounded-xl p-2"><div className="font-bold text-sm text-zinc-300">{proj.huesos} kg</div><div className="text-zinc-600 text-xs">huesos</div></div>
                  <div className="bg-zinc-800 rounded-xl p-2"><div className="font-bold text-sm text-zinc-300">{proj.viseras} kg</div><div className="text-zinc-600 text-xs">vísceras</div></div>
                </div>
              </Card>
            ) : (
              <Card key={meta}><p className="text-zinc-500 text-sm text-center">Ya superó los {meta} kg</p></Card>
            );
          })}
          <Card className="bg-zinc-800/40 border-zinc-600/40"><p className="text-zinc-500 text-xs">* Basado en GDP {gdp > 0 ? "real del animal" : "esperado para la raza"}.</p></Card>
        </div>
      )}

      {/* Venta */}
      {tab === "venta" && (
        <div className="flex flex-col gap-3">
          {animal.pesadas?.length >= 2 ? (
            <Card className={ev.conviene ? "border-emerald-700/50 bg-emerald-950/30" : "border-amber-700/50 bg-amber-950/30"}>
              <div className={`font-black text-base mb-2 ${ev.conviene ? "text-emerald-400" : "text-amber-400"}`}>{ev.conviene ? "✅ Evalúa vender ahora" : "⏳ Continuar engorde"}</div>
              <p className="text-zinc-300 text-sm">{ev.recomendacion}</p>
              <div className="mt-3 pt-3 border-t border-zinc-700 flex flex-col gap-1">
                <div className="flex justify-between text-xs"><span className="text-zinc-500">GDP real</span><span className="text-white font-bold">{gdp.toFixed(3)} kg/día</span></div>
                <div className="flex justify-between text-xs"><span className="text-zinc-500">Eficiencia</span><Badge color={ev.eficiencia === "buena" ? "green" : ev.eficiencia === "regular" ? "yellow" : "red"}>{ev.eficiencia}</Badge></div>
              </div>
            </Card>
          ) : (
            <Card><p className="text-zinc-500 text-sm text-center">Registrá al menos 2 pesadas para la recomendación</p></Card>
          )}
          <Card><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Calculadora de venta</div><VentaCalc pesoActual={ult} raza={raza} /></Card>
        </div>
      )}

      {/* Alimentación con historial y botón eliminar */}
      {tab === "alimentacion" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">📋 Historial de alimentación</div>
            <Btn variant="secondary" onClick={cargarHistorial} className="text-xs py-1 px-2">🔄 Recargar</Btn>
          </div>
          {cargandoHistorial ? (
            <p className="text-zinc-500 text-sm text-center">Cargando historial...</p>
          ) : historialRaciones.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center">No hay formulaciones guardadas para este animal.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {historialRaciones.map((h, idx) => (
                <div key={idx} className="bg-zinc-800 rounded-xl p-3 relative">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-emerald-400 font-bold text-sm">{new Date(h.fecha).toLocaleDateString()}</div>
                    <div className="flex gap-2 items-center">
                      <Badge color="gray">{h.sistema} - {h.modo}</Badge>
                      <button
                        onClick={() => eliminarRacion(h.id, h.fecha)}
                        className="text-red-500 text-xs hover:text-red-400 bg-red-950/30 px-2 py-0.5 rounded-full"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 mb-2">GDP estimado: {h.gdp_estimada} kg/día | Peso: {h.peso_animal} kg</div>
                  <div className="text-xs font-bold text-zinc-500 mb-1">Ración:</div>
                  {h.ingredientes && h.ingredientes.map((ing, iidx) => (
                    <div key={iidx} className="flex justify-between text-xs">
                      <span>{ing.nombre}</span>
                      <span className="text-emerald-400">{ing.kg_dia} kg</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-zinc-700 flex justify-between text-xs">
                    <span className="text-zinc-500">Costo diario:</span>
                    <span className="text-emerald-400">Bs. {h.indicadores?.costo_dia || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default DetalleAnimal;
