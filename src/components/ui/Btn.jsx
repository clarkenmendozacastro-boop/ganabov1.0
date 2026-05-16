// src/components/ui/Btn.jsx
import React from "react";

const Btn = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const v = {
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500",
    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600",
    danger: "bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700",
    ghost: "bg-transparent hover:bg-zinc-800 text-zinc-400 border border-zinc-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${
        v[variant] || v.primary
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Btn;
