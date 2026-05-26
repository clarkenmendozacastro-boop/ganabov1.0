// src/components/grupos/ListaGrupos.jsx
import React, { useState } from "react";
import { addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { userCol, userDoc } from "../../utils/helpers";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Inp from "../ui/Inp";

const ListaGrupos = ({ grupos, setGrupos, animales, uid, onNav, onSelectGrupo }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoGrupo, setNuevoGrupo] = useState({ nombre: "", descripcion: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNombre, setEditandoNombre] = useState("");
  const [cargando, setCargando] = useState(false);

  const crearGrupo = async () => {
    if (!nuevoGrupo.nombre.trim()) {
      alert("Ingrese un nombre para el grupo");
      return;
    }
    setCargando(true);
    try {
      const docRef = await addDoc(userCol(uid, "grupos"), {
        nombre: nuevoGrupo.nombre,
        descripcion: nuevoGrupo.descripcion,
        animales: [],
        animales_propios: [],
        fecha_creacion: new Date().toISOString(),
      });
      setGrupos([...grupos, { 
        id: docRef.id, 
        nombre: nuevoGrupo.nombre, 
        descripcion: nuevoGrupo.descripcion, 
        animales: [],
        animales_propios: []
      }]);
      setNuevoGrupo({ nombre: "", descripcion: "" });
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error creando grupo:", error);
      alert("Error al crear grupo");
    }
    setCargando(false);
  };

  const eliminarGrupo = async (id) => {
    if (!confirm("¿Eliminar este grupo? Los animales NO se eliminarán, solo se desasignarán.")) return;
    try {
      // Primero, desasignar todos los animales del grupo
      const grupo = grupos.find(g => g.id === id);
      if (grupo && grupo.animales) {
        for (const animalId of grupo.animales) {
          const animalRef = userDoc(uid, "animales", animalId);
          await updateDoc(animalRef, { grupoId: null });
        }
      }
      await deleteDoc(userDoc(uid, "grupos", id));
      setGrupos(grupos.filter(g => g.id !== id));
    } catch (error) {
      console.error("Error eliminando grupo:", error);
      alert("Error al eliminar grupo");
    }
  };

  const iniciarEdicion = (grupo) => {
    setEditandoId(grupo.id);
    setEditandoNombre(grupo.nombre);
  };

  const guardarEdicion = async (id) => {
    if (!editandoNombre.trim()) return;
    try {
      await updateDoc(userDoc(uid, "grupos", id), { nombre: editandoNombre });
      setGrupos(grupos.map(g => g.id === id ? { ...g, nombre: editandoNombre } : g));
      setEditandoId(null);
    } catch (error) {
      console.error("Error actualizando grupo:", error);
      alert("Error al actualizar");
    }
  };

  // Contar animales en el grupo (importados + propios)
  const contarAnimales = (grupo) => {
    const importados = grupo.animales?.length || 0;
    const propios = grupo.animales_propios?.length || 0;
    return importados + propios;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">📦 Mis Grupos / Hatos</h2>
        <Btn onClick={() => setMostrarFormulario(!mostrarFormulario)} className="text-xs py-1.5">
          + Nuevo Grupo
        </Btn>
      </div>

      {mostrarFormulario && (
        <Card className="flex flex-col gap-3">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Crear nuevo grupo</div>
          <Inp
            label="Nombre del grupo"
            value={nuevoGrupo.nombre}
            onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, nombre: e.target.value })}
            placeholder="Ej: Lote 1 - Novillos"
          />
          <Inp
            label="Descripción (opcional)"
            value={nuevoGrupo.descripcion}
            onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, descripcion: e.target.value })}
            placeholder="Animales jóvenes, 250-300 kg"
          />
          <div className="flex gap-2">
            <Btn onClick={crearGrupo} disabled={cargando} className="flex-1">
              {cargando ? "Creando..." : "Crear Grupo"}
            </Btn>
            <Btn variant="secondary" onClick={() => setMostrarFormulario(false)} className="flex-1">
              Cancelar
            </Btn>
          </div>
        </Card>
      )}

      {grupos.length === 0 ? (
        <Card className="text-center py-10">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-zinc-500 text-sm">No tienes grupos creados</p>
          <Btn onClick={() => setMostrarFormulario(true)} className="mt-4">
            Crear primer grupo
          </Btn>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {grupos.map((grupo) => (
            <Card key={grupo.id} className="hover:border-emerald-600/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editandoId === grupo.id ? (
                    <div className="flex gap-2">
                      <Inp
                        value={editandoNombre}
                        onChange={(e) => setEditandoNombre(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Btn onClick={() => guardarEdicion(grupo.id)} className="text-xs py-1">✓</Btn>
                      <Btn variant="ghost" onClick={() => setEditandoId(null)} className="text-xs py-1">✕</Btn>
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-white text-lg">{grupo.nombre}</div>
                      {grupo.descripcion && (
                        <div className="text-zinc-500 text-xs mt-0.5">{grupo.descripcion}</div>
                      )}
                      <div className="text-zinc-400 text-xs mt-1">
                        🐄 {contarAnimales(grupo)} animales
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-1">
                  {editandoId !== grupo.id && (
                    <>
                      <Btn
                        variant="secondary"
                        onClick={() => onSelectGrupo(grupo)}
                        className="text-xs py-1 px-2"
                      >
                        📋 Ver/Editar
                      </Btn>
                      <Btn
                        variant="secondary"
                        onClick={() => iniciarEdicion(grupo)}
                        className="text-xs py-1 px-2"
                      >
                        ✏️
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => eliminarGrupo(grupo.id)}
                        className="text-xs py-1 px-2"
                      >
                        🗑️
                      </Btn>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaGrupos;
