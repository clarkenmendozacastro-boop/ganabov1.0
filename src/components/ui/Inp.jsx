// src/components/ui/Inp.jsx
import React from "react";

const Inp = ({ label, ...p }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
    )}
    <input
      className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all placeholder-zinc-500"
      {...p}
    />
  </div>
);

export default Inp;
