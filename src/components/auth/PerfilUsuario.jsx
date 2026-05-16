// src/components/auth/PerfilUsuario.jsx
import React, { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { ADMIN_EMAIL } from "../../utils/helpers";
import Badge from "../ui/Badge";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Inp from "../ui/Inp";

const PerfilUsuario = ({ user, onBack }) => {
  const isAdmin = user.email === ADMIN_EMAIL;
  const [actual, sA] = useState("");
  const [nueva, sN] = useState("");
  const [conf, sC] = useState("");
  const [err, sErr] = useState("");
  const [ok, sOk] = useState(false);
  const [loading, sL] = useState(false);

  const cambiarPass = async () => {
    if (!actual || !nueva || !conf) return sErr("Completá todos los campos");
    if (nueva.length < 6) return sErr("La nueva contraseña debe tener al menos 6 caracteres");
    if (nueva !== conf) return sErr("Las contraseñas nuevas no coinciden");
    sL(true);
    sErr("");
    try {
      const cred = EmailAuthProvider.credential(user.email, actual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, nueva);
      sOk(true);
      sA("");
      sN("");
      sC("");
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential")
        sErr("La contraseña actual es incorrecta");
      else sErr("Error al cambiar contraseña. Intentá de nuevo.");
    }
    sL(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Btn variant="ghost" onClick={onBack} className="text-xs px-2 py-1">
          ← Volver
        </Btn>
        <h2 className="text-2xl font-black text-white">Mi Perfil</h2>
      </div>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-900/50 border border-emerald-700 rounded-full w-12 h-12 flex items-center justify-center text-2xl">
            🐄
          </div>
          <div>
            <div className="text-white font-bold text-sm">{user.email}</div>
            <div className="mt-1">
              {isAdmin ? (
                <Badge color="purple">👑 Administrador</Badge>
              ) : (
                <Badge color="gray">Usuario</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
      <Card className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-300">Cambiar contraseña</div>
        {ok && (
          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-3">
            <p className="text-emerald-400 text-xs font-semibold">✅ Contraseña cambiada correctamente</p>
          </div>
        )}
        <Inp
          label="Contraseña actual"
          type="password"
          value={actual}
          onChange={(e) => sA(e.target.value)}
          placeholder="••••••••"
        />
        <Inp
          label="Nueva contraseña"
          type="password"
          value={nueva}
          onChange={(e) => sN(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
        <Inp
          label="Confirmar nueva contraseña"
          type="password"
          value={conf}
          onChange={(e) => sC(e.target.value)}
          placeholder="Repetí la nueva contraseña"
        />
        {err && <p className="text-red-400 text-xs text-center">{err}</p>}
        <Btn onClick={cambiarPass} disabled={loading} className="w-full py-3">
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </Btn>
      </Card>
    </div>
  );
};

export default PerfilUsuario;
