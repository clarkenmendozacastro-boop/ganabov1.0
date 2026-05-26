// src/components/grupos/DetalleGrupo.jsx
import React, { useState, useEffect } from "react";
import { updateDoc, addDoc, deleteDoc, doc } from "firebase/firestore";
import { userDoc, userCol } from "../../utils/helpers";
import { db } from "../../firebase";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";
import Inp from "../ui/Inp";
import Sel from "../ui/Sel";
import { RAZAS } from "../../data/razas";

const DetalleGrupo = ({ grupo, animales, uid, onBack, onUpdate, onFormular }) => {
  const [animalesEnGrupo, setAnimalesEnGrupo] = useState([]);
  const [animalesNoAsignados, setAnimalesNoAsignados] = useState([]);
  const [animalSeleccionadoImportar, setAnimalSeleccionadoImportar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pesoPromedio, setPesoPromedio] = useState(0);
  const [animalIndividualSeleccionado, setAnimalIndividualSeleccionado] = useState("");
  
  // Estados para crear animal dentro del grupo
  const [nuevoAnimalNombre, setNuevoAnimalNombre] = useState("");
  const [nuevoAnimalRaza, setNuevoAnimalRaza] = useState("otro");
  const [nuevoAnimalPeso, setNuevoAnimalPeso] = useState("");
  const [nuevoAnimalSexo, setNuevoAnimalSexo] = useState("macho");

  // Obtener peso actual de un animal
  const getPesoActual = (animal) => {
    return animal.pesadas?.length > 0
      ? animal.pesadas[animal.pesadas.length - 1].peso
      : animal.peso_inicial;
  };

  // Cargar animales del grupo y no asignados
  useEffect(() => {
    // Animales del grupo (IDs de animales importados)
    const idsEnGrupo = new Set(grupo.animales || []);
    const animalesImportados = animales.filter(a => idsEnGrupo.has(a._id));
    
    // Animales propios del grupo (creados dentro del grupo)
    const animalesPropios = grupo.animales_propios || [];
    
    const todosLosAnimales = [...animalesImportados, ...animalesPropios];
    setAnimalesEnGrupo(todosLosAnimales);
    
    // Calcular peso promedio
    if (todosLosAnimales.length > 0) {
      const suma = todosLosAnimales.reduce((acc, a) => acc + getPesoActual(a), 0);
      setPesoPromedio(suma / todosLosAnimales.length);
    } else {
      setPesoPromedio(0);
    }
    
    // Animales no asignados a ningún grupo (para importar)
    const noAsignados = animales.filter(a => !a.grupoId && !idsEnGrupo.has(a._id));
    setAnimalesNoAsignados(noAsignados);
  }, [grupo, animales]);

  // Importar animal desde "Mis Animales"
  const importarAnimal = async () => {
    if (!animalSeleccionadoImportar) {
      alert("Selecciona un animal para importar");
      return;
    }
    setCargando(true);
    try {
      // Actualizar el animal con el grupoId
      const animalRef = doc(db, "users", uid, "animales", animalSeleccionadoImportar);
      await updateDoc(animalRef, { grupoId: grupo.id });
      
      // Actualizar el grupo con el nuevo animal
      const nuevosAnimales = [...(grupo.animales || []), animalSeleccionadoImportar];
      await updateDoc(userDoc(uid, "grupos", grupo.id), { animales: nuevosAnimales });
      
      // Actualizar estado local
      onUpdate({ ...grupo, animales: nuevosAnimales });
      setAnimalSeleccionadoImportar("");
      alert("✅ Animal importado correctamente");
    } catch (error) {
      console.error("Error importando animal:", error);
      alert("❌ Error al importar animal");
    }
    setCargando(false);
  };

  // Crear animal dentro del grupo
  const crearAnimalEnGrupo = async () => {
    if (!nuevoAnimalNombre || !nuevoAnimalPeso) {
      alert("Completá nombre y peso");
      return;
    }
    setCargando(true);
    try {
      const nuevoAnimal = {
        id: Date.now().toString(),
        nombre: nuevoAnimalNombre,
        raza: nuevoAnimalRaza,
        sexo: nuevoAnimalSexo,
        peso_inicial: parseFloat(nuevoAnimalPeso),
        pesadas: [{
          fecha: new Date().toISOString().slice(0, 10),
          peso: parseFloat(nuevoAnimalPeso),
          nota: "Peso de entrada"
        }],
        fecha_entrada: new Date().toISOString().slice(0, 10),
        esAnimalPropio: true,
        grupoId: grupo.id
      };
      
      const animalesPropios = [...(grupo.animales_propios || []), nuevoAnimal];
      await updateDoc(userDoc(uid, "grupos", grupo.id), { animales_propios: animalesPropios });
      
      onUpdate({ ...grupo, animales_propios: animalesPropios });
      
      // Limpiar formulario
      setNuevoAnimalNombre("");
      setNuevoAnimalRaza("otro");
      setNuevoAnimalPeso("");
      setNuevoAnimalSexo("macho");
      
      alert("✅ Animal creado en el grupo");
    } catch (error) {
      console.error("Error creando animal en grupo:", error);
      alert("❌ Error al crear animal");
    }
    setCargando(false);
  };

  // Eliminar animal del grupo (solo quitar, no eliminar permanentemente)
  const quitarAnimalDelGrupo = async (animalId, esPropio) => {
    if (!confirm("¿Quitar este animal del grupo? No se eliminará permanentemente.")) return;
    setCargando(true);
    try {
      if (esPropio) {
        // Es un animal propio del grupo: eliminarlo de animales_propios
        const nuevosPropios = (grupo.animales_propios || []).filter(a => a.id !== animalId);
        await updateDoc(userDoc(uid, "grupos", grupo.id), { animales_propios: nuevosPropios });
        onUpdate({ ...grupo, animales_propios: nuevosPropios });
      } else {
        // Es un animal importado: quitar referencia y limpiar grupoId
        const animalRef = doc(db, "users", uid, "animales", animalId);
        await updateDoc(animalRef, { grupoId: null });
        
        const nuevosAnimales = (grupo.animales || []).filter(id => id !== animalId);
        await updateDoc(userDoc(uid, "grupos", grupo.id), { animales: nuevosAnimales });
        onUpdate({ ...grupo, animales: nuevosAnimales });
      }
      alert("✅ Animal removido del grupo");
    } catch (error) {
      console.error("Error removiendo animal:", error);
      alert("❌ Error al remover animal");
    }
    setCargando(false);
  };

  const formularParaGrupo = () => {
    if (animalesEnGrupo.length === 0) {
      alert("No hay animales en este grupo");
      return;
    }
    if (pesoPromedio === 0) {
      alert("No se puede calcular el peso promedio");
      return;
    }
    localStorage.setItem("grupoFormula", JSON.stringify({
      peso: pesoPromedio,
      grupoId: grupo.id,
      grupoNombre: grupo.nombre
    }));
    onFormular(pesoPromedio, grupo);
  };

  const formularParaAnimalIndividual = () => {
    if (!animalIndividualSeleccionado) {
      alert("Selecciona un animal");
      return;
    }
    const animal = animalesEnGrupo.find(a => (a._id || a.id) === animalIndividualSeleccionado);
    if (!animal) return;
    const pesoActual = getPesoActual(animal);
    localStorage.setItem("formularParaAnimal", JSON.stringify({
      id: animal._id || animal.id,
      nombre: animal.nombre,
      raza: animal.raza,
      peso: pesoActual
    }));
    onFormular(pesoActual, grupo, animal);
  };

  const getPesoPromedioRedondeado = () => Math.round(pesoPromedio);

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">
          ← Volver
        </Btn>
        <div>
          <div className="text-xl font-black text-white">{grupo.nombre}</div>
          {grupo.descripcion && <div className="text-zinc-500 text-xs">{grupo.descripcion}</div>}
        </div>
      </div>

      {/* Tarjeta de resumen */}
      <Card className="bg-gradient-to-r from-emerald-950/30 to-zinc-900">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{animalesEnGrupo.length}</div>
            <div className="text-zinc-500 text-xs">Animales</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{getPesoPromedioRedondeado()} kg</div>
            <div className="text-zinc-500 text-xs">Peso promedio</div>
          </div>
        </div>
        
        <Btn onClick={formularParaGrupo} className="w-full mt-3 py-2">
          🔬 Formular ración para TODO el grupo
        </Btn>
      </Card>

      {/* Sección: Animales en el grupo */}
      <Card>
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          🐄 Animales en este grupo ({animalesEnGrupo.length})
        </div>
        
        {animalesEnGrupo.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center">No hay animales en este grupo</p>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {animalesEnGrupo.map((animal) => {
              const animalId = animal._id || animal.id;
              const esPropio = !!animal.esAnimalPropio;
              const pesoActual = getPesoActual(animal);
              return (
                <div key={animalId} className="flex justify-between items-center py-2 border-b border-zinc-700 last:border-0">
                  <div>
                    <div className="text-white text-sm font-semibold">{animal.nombre}</div>
                    <div className="text-zinc-500 text-xs">
                      {pesoActual} kg · {RAZAS.find(r => r.id === animal.raza)?.nombre || animal.raza}
                      {esPropio && <Badge color="blue" className="ml-2">Propio</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        localStorage.setItem("formularParaAnimal", JSON.stringify({
                          id: animalId,
                          nombre: animal.nombre,
                          raza: animal.raza,
                          peso: pesoActual
                        }));
                        onFormular(pesoActual, grupo, animal);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      🍽️
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => quitarAnimalDelGrupo(animalId, esPropio)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Quitar
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Sección: Importar desde "Mis Animales" */}
      <Card>
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
          ➕ Importar desde "Mis Animales"
        </div>
        <div className="flex gap-2">
          <select
            className="flex-1 bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-sm"
            value={animalSeleccionadoImportar}
            onChange={(e) => setAnimalSeleccionadoImportar(e.target.value)}
          >
            <option value="">Seleccionar animal</option>
            {animalesNoAsignados.map(animal => (
              <option key={animal._id} value={animal._id}>
                {animal.nombre} - {getPesoActual(animal)} kg - {RAZAS.find(r => r.id === animal.raza)?.nombre || animal.raza}
              </option>
            ))}
          </select>
          <Btn onClick={importarAnimal} disabled={cargando} variant="secondary" className="text-sm">
            ➕ Importar
          </Btn>
        </div>
        {animalesNoAsignados.length === 0 && (
          <p className="text-zinc-500 text-xs mt-2">No hay animales disponibles para importar</p>
        )}
      </Card>

      {/* Sección: Crear animal dentro del grupo */}
      <Card>
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
          ✏️ Crear animal en este grupo
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Inp
            placeholder="Nombre"
            value={nuevoAnimalNombre}
            onChange={(e) => setNuevoAnimalNombre(e.target.value)}
          />
          <Sel value={nuevoAnimalRaza} onChange={(e) => setNuevoAnimalRaza(e.target.value)}>
            {RAZAS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </Sel>
          <Inp
            placeholder="Peso inicial (kg)"
            type="number"
            value={nuevoAnimalPeso}
            onChange={(e) => setNuevoAnimalPeso(e.target.value)}
          />
          <Sel value={nuevoAnimalSexo} onChange={(e) => setNuevoAnimalSexo(e.target.value)}>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </Sel>
        </div>
        <Btn onClick={crearAnimalEnGrupo} disabled={cargando} variant="secondary" className="w-full mt-2">
          ➕ Agregar animal al grupo
        </Btn>
      </Card>

      {/* Sección: Formular para un animal específico */}
      {animalesEnGrupo.length > 1 && (
        <Card>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            🐄 Formular para un animal específico
          </div>
          <select
            className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-sm mb-2"
            value={animalIndividualSeleccionado}
            onChange={(e) => setAnimalIndividualSeleccionado(e.target.value)}
          >
            <option value="">-- Seleccionar animal --</option>
            {animalesEnGrupo.map(animal => {
              const animalId = animal._id || animal.id;
              const pesoActual = getPesoActual(animal);
              return (
                <option key={animalId} value={animalId}>
                  {animal.nombre} - {pesoActual} kg
                </option>
              );
            })}
          </select>
          <Btn onClick={formularParaAnimalIndividual} className="w-full py-2" variant="secondary">
            🍽️ Formular para este animal SOLO
          </Btn>
        </Card>
      )}
    </div>
  );
};

export default DetalleGrupo;
