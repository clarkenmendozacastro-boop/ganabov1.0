// src/components/ui/Badge.jsx
import React from "react";

const Badge = ({ children, color = "green" }) => {
  const c = {
    green: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
    yellow: "bg-amber-900/50 text-amber-300 border-amber-700",
    red: "bg-red-900/50 text-red-300 border-red-700",
    blue: "bg-sky-900/50 text-sky-300 border-sky-700",
    gray: "bg-zinc-800 text-zinc-400 border-zinc-600",
    purple: "bg-purple-900/50 text-purple-300 border-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
        c[color] || c.gray
      }`}
    >
      {children}
    </span>
  );
};

export default Badge;
