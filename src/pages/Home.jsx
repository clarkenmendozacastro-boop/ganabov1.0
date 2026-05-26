// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getDocs, setDoc, deleteDoc } from "firebase/firestore";
import Badge from "../components/ui/Badge";
import Dashboard from "../components/dashboard/Dashboard";
import ListaAnimales from "../components/animales/ListaAnimales";
import NuevoAnimal from "../components/animales/NuevoAnimal";
import DetalleAnimal from "../components/animales/DetalleAnimal";
import CalculadoraRacion from "../components/racion/CalculadoraRacion";
import GestionAlimentos from "../components/alimentos/GestionAlimentos";
import PerfilUsuario from "../components/auth/PerfilUsuario";
import ListaGrupos from "../components/grupos/ListaGrupos";
import DetalleGrupo from "../components/grupos/DetalleGrupo";
import { ADMIN_EMAIL, userCol, userDoc } from "../utils/helpers";

const Home = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [nav, setNav] = useState("dashboard");
  const [animales, setAnimales] = useState([]);
  const [animalSel, setAnimalSel] = useState(null);
  const [preciosUsr, setPreciosUsr] = useState({});
  const [customAl, setCustomAl] = useState([]);
  const [minsAlimentos, setMinsAlimentos] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [grupoSel, setGrupoSel] = useState(null);
  const [showGrupoDetalle, setShowGrupoDetalle] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const uid = user?.uid;

  // Autenticación
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Cargar datos
  useEffect(() => {
    if (!uid) {
      setAnimales([]);
      setPreciosUsr({});
      setCustomAl([]);
      setMinsAlimentos({});
      setGrupos([]);
      return;
    }
    const cargar = async () => {
      setDataLoading(true);
      try {
        const animSnap = await getDocs(userCol(uid, "animales"));
        setAnimales(animSnap.docs.map((d) => ({ _id: d.id, ...d.data() })));
        
        const precSnap = await getDocs(userCol(uid, "precios"));
        const precios = {};
        precSnap.docs.forEach((d) => { precios[d.id] = d.data().valor; });
        setPreciosUsr(precios);
        
        const alSnap = await getDocs(userCol(uid, "alimentos_custom"));
        setCustomAl(alSnap.docs.map((d) => ({ _id: d.id, id: d.id, ...d.data() })));
        
        const minsSnap = await getDocs(userCol(uid, "minimos"));
        const mins = {};
        minsSnap.docs.forEach((d) => { mins[d.id] = d.data().valor; });
        setMinsAlimentos(mins);
        
        const gruposSnap = await getDocs(userCol(uid, "grupos"));
        setGrupos(gruposSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
      setDataLoading(false);
    };
    cargar();
  }, [uid]);

  const handlePrecio = async (id, val) => {
    await setDoc(userDoc(uid, "precios", id), { valor: val, updatedAt: new Date() });
    setPreciosUsr((p) => ({ ...p, [id]: val }));
  };

  const handleSetMinimo = async (id, val) => {
    if (val === 0) {
      await deleteDoc(userDoc(uid, "minimos", id)).catch(() => {});
      const newMins = { ...minsAlimentos };
      delete newMins[id];
      setMinsAlimentos(newMins);
    } else {
      await setDoc(userDoc(uid, "minimos", id), { valor: val, updatedAt: new Date() });
      setMinsAlimentos((m) => ({ ...m, [id]: val }));
    }
  };

  const handleUpdateAnimal = (a) => {
    setAnimales((p) => p.map((x) => (x._id === a._id ? a : x)));
    setAnimalSel(a);
  };

  const handleDeleteAnimal = (id) => {
    setAnimales((p) => p.filter((x) => x._id !== id));
    setNav("animales");
    setAnimalSel(null);
  };

  const handleUpdateGrupo = (grupoActualizado) => {
    setGrupos(grupos.map(g => g.id === grupoActualizado.id ? grupoActualizado : g));
    if (grupoSel?.id === grupoActualizado.id) setGrupoSel(grupoActualizado);
  };

  const handleFormularParaGrupo = (pesoPromedio, grupo) => {
    localStorage.setItem("grupoFormula", JSON.stringify({
      peso: pesoPromedio,
      grupoId: grupo.id,
      grupoNombre: grupo.nombre
    }));
    setNav("racion");
  };

  const handleFormularParaAnimal = (animal) => {
    const pesoActual = animal.pesadas?.length > 0 
      ? animal.pesadas[animal.pesadas.length - 1].peso 
      : animal.peso_inicial;
    localStorage.setItem("formularParaAnimal", JSON.stringify({
      id: animal._id,
      nombre: animal.nombre,
      raza: animal.raza,
      peso: pesoActual
    }));
    setNav("racion");
  };

  const handleSalir = async () => {
    await signOut(auth);
    setNav("dashboard");
  };

  const navItems = [
    { id: "dashboard", i: "🏠", l: "Inicio" },
    { id: "animales", i: "🐄", l: "Animales" },
    { id: "grupos", i: "📦", l: "Grupos" },
    { id: "racion", i: "🔬", l: "Ración" },
    { id: "alimentos", i: "📦", l: "Alimentos" },
  ];

  if (authLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center"><div className="text-6xl mb-4 animate-pulse">🐄</div><p className="text-zinc-500 text-sm">Cargando...</p></div>
    </div>
  );
  if (!user) return null;
  if (dataLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center"><div className="text-6xl mb-4 animate-pulse">🐄</div><p className="text-zinc-500 text-sm">Cargando tus datos...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-xl">🐄</span><span className="font-black text-white tracking-tight">GanaBov Pro</span>{isAdmin && <Badge color="purple">👑</Badge>}</div>
        <button onClick={handleSalir} className="text-zinc-500 text-xs hover:text-zinc-300">Salir</button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 pb-28">
        {nav === "dashboard" && <Dashboard animales={animales} onNav={setNav} isAdmin={isAdmin} />}
        
        {nav === "animales" && (
          <ListaAnimales
            animales={animales}
            grupos={grupos}
            onSelect={(a) => { setAnimalSel(a); setNav("detalle"); }}
            onNav={setNav}
            onFormular={handleFormularParaAnimal}
          />
        )}
        
        {nav === "nuevo" && (
          <NuevoAnimal
            onGuardar={(a) => { setAnimales((p) => [...p, a]); setNav("animales"); }}
            onBack={() => setNav("animales")}
            uid={uid}
            grupos={grupos}
          />
        )}
        
        {nav === "detalle" && animalSel && (
          <DetalleAnimal
            animal={animalSel}
            onUpdate={handleUpdateAnimal}
            onDelete={handleDeleteAnimal}
            onBack={() => setNav("animales")}
            preciosUsr={preciosUsr}
            uid={uid}
            grupos={grupos}
            onFormular={handleFormularParaAnimal}
          />
        )}
        
        {nav === "grupos" && !showGrupoDetalle && (
          <ListaGrupos
            grupos={grupos}
            setGrupos={setGrupos}
            animales={animales}
            uid={uid}
            onSelectGrupo={(grupo) => { setGrupoSel(grupo); setShowGrupoDetalle(true); setNav("grupos"); }}
          />
        )}
        
        {nav === "grupos" && showGrupoDetalle && grupoSel && (
          <DetalleGrupo
            grupo={grupoSel}
            animales={animales}
            uid={uid}
            onBack={() => { setShowGrupoDetalle(false); setGrupoSel(null); }}
            onUpdate={handleUpdateGrupo}
            onFormular={handleFormularParaGrupo}
            onFormularAnimal={handleFormularParaAnimal}
          />
        )}
        
        {nav === "racion" && (
          <CalculadoraRacion
            preciosUsr={preciosUsr}
            customAl={customAl}
            minsAlimentos={minsAlimentos}
            animales={animales}
            grupos={grupos}
            uid={uid}
          />
        )}
        
        {nav === "alimentos" && (
          <GestionAlimentos
            preciosUsr={preciosUsr}
            onPrecio={handlePrecio}
            customAl={customAl}
            onAddCustom={(a) => setCustomAl((p) => [...p, a])}
            uid={uid}
            minsAlimentos={minsAlimentos}
            onSetMinimo={handleSetMinimo}
          />
        )}
        
        {nav === "perfil" && <PerfilUsuario user={user} onBack={() => setNav("dashboard")} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setNav(item.id)} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${nav === item.id || (nav === "detalle" && item.id === "animales") || (nav === "grupos" && item.id === "grupos") ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-400"}`}>
            <span className="text-xl">{item.i}</span><span className="text-xs font-semibold">{item.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
