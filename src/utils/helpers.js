// src/utils/helpers.js
import { collection, doc } from "firebase/firestore";
import { db } from "../firebase";

export const userCol = (uid, col) => collection(db, "users", uid, col);
export const userDoc = (uid, col, id) => doc(db, "users", uid, col, id);

export const ADMIN_EMAIL = "ganabovProappcuenta@gmail.com";

export const calcularGDP = (pesadas) => {
  if (!pesadas || pesadas.length < 2) return 0;
  const p1 = pesadas[0];
  const p2 = pesadas[pesadas.length - 1];
  const dias = Math.max(1, (new Date(p2.fecha) - new Date(p1.fecha)) / 86400000);
  return (p2.peso - p1.peso) / dias;
};
