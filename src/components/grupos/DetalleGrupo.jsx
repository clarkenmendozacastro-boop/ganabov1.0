// src/components/grupos/DetalleGrupo.jsx
import React, { useState, useEffect } from "react";
import { updateDoc } from "firebase/firestore";
import { userDoc } from "../../utils/helpers";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Badge from "../ui/Badge";

const DetalleGrupo = ({ grupo, animales, uid, onBack, onUpdate, onFormular }) => {
  const [animalesDisponibles, setAnimalesDisponibles] = useState([]);
  const [animalesSeleccionados, setAnimalesSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [pesoPromedio, setPesoPromedio] = useState(0);

  // Obtener peso actual de un animal (última pesada o peso inicial)
  const getPesoActual = (animal) => {
    return animal.pesadas?.length > 0
      ? animal.pesadas[animal.pesadas.length - 1].peso
      : animal.peso_inicial;
  };

  useEffect(() => {
    // Filtrar animales disponibles (no asignados a otro grupo o ya en este grupo)
    const idsEnGrupo = new Set(grupo.animales || []);
    const disponibles = animales.filter(a => idsEnGrupo.has(a._id) || !a.grupoId);
    setAnimalesDisponibles(disponibles);
    
    const seleccionados = animales.filter(a => idsEnGrupo.has(a._id));
    setAnimalesSeleccionados(seleccionados);
    
    // Calcular peso promedio
    if (seleccionados.length > 0) {
      const suma = seleccionados.reduce((acc, a) => acc + getPesoActual(a), 0);
      setPesoPromedio(suma / seleccionados.length);
    } else {
      setPesoPromedio(0);
    }
  }, [grupo, animales]);

  const toggleAnimal = (animalId) => {
    if (animalesSeleccionados.some(a => a._id === animalId)) {
      setAnimalesSeleccionados(animalesSeleccionados.filter(a => a._id !== animalId));
    } else {
      const animal = animalesDisponibles.find(a => a._id === animalId);
      if (animal) setAnimalesSeleccionados([...animalesSeleccionados, animal]);
    }
  };

  const guardarAsignacion = async () => {
    setCargando(true);
    try {
      const nuevosIds = animalesSeleccionados.map(a => a._id);
      await updateDoc(userDoc(uid, "grupos", grupo.id), { animales: nuevosIds });
      
      // Actualizar el grupo en el estado padre
      onUpdate({ ...grupo, animales: nuevosIds });
      
      alert("✅ Asignación guardada correctamente");
    } catch (error) {
      console.error("Error guardando asignación:", error);
      alert("❌ Error al guardar");
    }
    setCargando(false);
  };

  const formularParaGrupo = () => {
    if (animalesSeleccionados.length === 0) {
      alert("No hay animales en este grupo");
      return;
    }
    if (pesoPromedio === 0) {
      alert("No se puede calcular el peso promedio");
      return;
    }
    onFormular(pesoPromedio, grupo);
  };

  const getPesoPromedioRedondeado = () => {
    return Math.round(pesoPromedio);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">
          ← Volver
        </Btn>
        <div>
          <div className="text-xl font-black text-white">{grupo.nombre}</div>
          {grupo.descripcion && <div className="text-zinc-500 text-xs">{grupo.descripcion}</div>}
        </div>
      </div>

      {/* Tarjeta de resumen del grupo */}
      <Card className="bg-gradient-to-r from-emerald-950/30 to-zinc-900">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{animalesSeleccionados.length}</div>
            <div className="text-zinc-500 text-xs">Animales</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{getPesoPromedioRedondeado()} kg</div>
            <div className="text-zinc-500 text-xs">Peso promedio</div>
          </div>
        </div>
        <Btn onClick={formularParaGrupo} className="w-full mt-3 py-2">
          🔬 Formular ración para el grupo
        </Btn>
      </Card>

      {/* Asignación de animales */}
      <Card>
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          🐄 Asignar animales al grupo
        </div>
        <div className="max-h-60 overflow-y-auto">
          {animalesDisponibles.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center">No hay animales disponibles</p>
          ) : (
            animalesDisponibles.map((animal) => {
              const estaSeleccionado = animalesSeleccionados.some(a => a._id === animal._id);
              const pesoActual = getPesoActual(animal);
              return (
                <div
                  key={animal._id}
                  className={`flex justify-between items-center p-2 rounded-lg mb-1 cursor-pointer transition-all ${
                    estaSeleccionado ? "bg-emerald-950/50 border border-emerald-700" : "bg-zinc-800/50 hover:bg-zinc-700/50"
                  }`}
                  onClick={() => toggleAnimal(animal._id)}
                >
                  <div>
                    <div className="text-white text-sm font-semibold">{animal.nombre}</div>
                    <div className="text-zinc-500 text-xs">{pesoActual} kg · {animal.raza}</div>
                  </div>
                  <div className="text-emerald-400 text-lg font-bold">
                    {estaSeleccionado ? "✓" : "+"}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <Btn onClick={guardarAsignacion} disabled={cargando} className="flex-1 py-2">
            {cargando ? "Guardando..." : "💾 Guardar asignación"}
          </Btn>
        </div>
      </Card>

      {/* Lista de animales asignados */}
      {animalesSeleccionados.length > 0 && (
        <Card>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
            📋 Animales en el grupo ({animalesSeleccionados.length})
          </div>
          <div className="max-h-60 overflow-y-auto">
            {animalesSeleccionados.map((animal) => {
              const pesoActual = getPesoActual(animal);
              return (
                <div key={animal._id} className="flex justify-between items-center py-2 border-b border-zinc-700 last:border-0">
                  <div>
                    <div className="text-white text-sm">{animal.nombre}</div>
                    <div className="text-zinc-500 text-xs">{pesoActual} kg · {animal.raza}</div>
                  </div>
                  <Btn
                    variant="ghost"
                    onClick={() => toggleAnimal(animal._id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Quitar
                  </Btn>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DetalleGrupo;
