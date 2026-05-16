// src/App.jsx
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import LoginScreen from "./components/auth/LoginScreen";

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🐄</div>
          <p className="text-zinc-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return user ? <Home /> : <LoginScreen />;
}

export default App;
