// src/components/ui/Sel.jsx
import React from "react";

const Sel = ({ label, children, ...p }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
    )}
    <select
      className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
      {...p}
    >
      {children}
    </select>
  </div>
);

export default Sel;
