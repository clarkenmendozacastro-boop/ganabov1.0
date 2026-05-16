// src/components/animales/VentaCalc.jsx
import React, { useState } from "react";
import Inp from "../ui/Inp";

const VentaCalc = ({ pesoActual, raza }) => {
  const [pV, sPV] = useState("22");
  const [pC, sPC] = useState("65");
  const pc = raza.pc_canal;
  const canal = Math.round(pesoActual * pc);
  const huesos = Math.round(canal * 0.2);
  const carne = canal - huesos;
  const viseras = Math.round(pesoActual * 0.08);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Inp
          label="Bs/kg peso vivo"
          type="number"
          value={pV}
          onChange={(e) => sPV(e.target.value)}
        />
        <Inp
          label="Bs/kg carne limpia"
          type="number"
          value={pC}
          onChange={(e) => sPC(e.target.value)}
        />
      </div>
      <div className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Venta en pie ({pesoActual} kg)</span>
          <span className="text-emerald-400 font-bold">
            Bs. {(pesoActual * parseFloat(pV || 0)).toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Venta por carne ({carne} kg)</span>
          <span className="text-sky-400 font-bold">
            Bs. {(carne * parseFloat(pC || 0)).toFixed(0)}
          </span>
        </div>
        <div className="border-t border-zinc-700 mt-1 pt-2 text-zinc-500 text-xs">
          Canal: {canal} kg · Huesos: {huesos} kg · Vísceras: {viseras} kg · Rend.:{" "}
          {(pc * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default VentaCalc;
