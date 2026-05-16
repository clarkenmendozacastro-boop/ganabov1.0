// src/components/ui/Card.jsx
import React from "react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

export default Card;
