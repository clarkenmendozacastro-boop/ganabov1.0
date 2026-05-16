// src/components/auth/LoginScreen.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import Card from "../ui/Card";
import Inp from "../ui/Inp";
import Btn from "../ui/Btn";

const LoginScreen = () => {
  const [email, sE] = useState("");
  const [pass, sP] = useState("");
  const [err, sErr] = useState("");
  const [loading, sL] = useState(false);
  const [modo, sM] = useState("login");
  const [resetOk, sRO] = useState(false);

  const login = async () => {
    if (!email || !pass) return sErr("Completá correo y contraseña");
    sL(true);
    sErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      if (
        e.code === "auth/invalid-credential" ||
        e.code === "auth/wrong-password" ||
        e.code === "auth/user-not-found"
      )
        sErr("Correo o contraseña incorrectos");
      else if (e.code === "auth/invalid-email") sErr("El correo no es válido");
      else if (e.code === "auth/too-many-requests")
        sErr("Demasiados intentos. Esperá unos minutos.");
      else sErr("Error al ingresar. Intentá de nuevo.");
    }
    sL(false);
  };

  const resetPass = async () => {
    if (!email) return sErr("Ingresá tu correo primero");
    sL(true);
    sErr("");
    try {
      await sendPasswordResetEmail(auth, email);
      sRO(true);
    } catch (e) {
      if (e.code === "auth/user-not-found") sErr("No existe cuenta con ese correo");
      else sErr("Error al enviar el correo. Intentá de nuevo.");
    }
    sL(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐄</div>
          <h1 className="text-3xl font-black text-white">GanaBov Pro</h1>
          <p className="text-zinc-500 text-sm mt-1">Santa Cruz · Bolivia · Engorde bovino</p>
        </div>
        <Card className="flex flex-col gap-4">
          {modo === "login" ? (
            <>
              <Inp
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => sE(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              <Inp
                label="Contraseña"
                type="password"
                value={pass}
                onChange={(e) => sP(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
              {err && <p className="text-red-400 text-xs text-center">{err}</p>}
              <Btn onClick={login} disabled={loading} className="w-full py-3 text-base">
                {loading ? "Verificando..." : "Ingresar"}
              </Btn>
              <button
                onClick={() => {
                  sM("reset");
                  sErr("");
                  sRO(false);
                }}
                className="text-zinc-500 text-xs text-center hover:text-zinc-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          ) : (
            <>
              {resetOk ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">📧</div>
                  <p className="text-emerald-400 font-bold text-sm mb-2">¡Correo enviado!</p>
                  <p className="text-zinc-400 text-xs mb-4">
                    Revisá tu bandeja de entrada y seguí las instrucciones para restablecer tu contraseña.
                  </p>
                  <Btn
                    onClick={() => {
                      sM("login");
                      sRO(false);
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    Volver al login
                  </Btn>
                </div>
              ) : (
                <>
                  <p className="text-zinc-400 text-sm">
                    Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                  <Inp
                    label="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => sE(e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                  {err && <p className="text-red-400 text-xs text-center">{err}</p>}
                  <Btn onClick={resetPass} disabled={loading} className="w-full py-3">
                    {loading ? "Enviando..." : "Enviar enlace"}
                  </Btn>
                  <button
                    onClick={() => {
                      sM("login");
                      sErr("");
                    }}
                    className="text-zinc-500 text-xs text-center hover:text-zinc-300 transition-colors"
                  >
                    ← Volver al login
                  </button>
                </>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
