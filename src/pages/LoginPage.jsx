import React, { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Shield, Mail, Lock, Loader2, AlertCircle, UserPlus, CheckCircle2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function LoginPage() {
  const { loginAdmin } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        // Llave de seguridad maestra para inicializar al SuperAdmin
        if (adminSecret.trim() !== "P2P_ADMIN_2026_MASTER") {
          throw new Error("Clave Maestra de Seguridad incorrecta.");
        }
        if (password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: email,
          displayName: "Super Administrador",
          role: "admin",
          balanceUsdt: 0,
          createdAt: new Date().toISOString()
        }, { merge: true });

        setSuccessMsg("¡Administrador registrado exitosamente! Iniciando sesión...");
        setTimeout(() => {
          loginAdmin(email, password);
        }, 1200);
      } else {
        await loginAdmin(email, password);
      }
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado en Firebase. Inicia sesión directamente.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Credenciales incorrectas.");
      } else {
        setError(err.message || "Error al procesar la solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Panel Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Billetera P2P — Control Total</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Correo Administrador</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@billetera.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            {isRegisterMode && (
              <div className="animate-fade-in">
                <label className="text-xs text-amber-400 font-semibold block mb-1">
                  Clave Maestra de Seguridad
                </label>
                <div className="relative">
                  <Shield size={15} className="absolute left-3.5 top-3 text-amber-400" />
                  <input
                    type="password"
                    placeholder="P2P_ADMIN_2026_MASTER"
                    value={adminSecret}
                    onChange={e => setAdminSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Protección anti-intrusos: solo el dueño con esta clave maestra puede crear el rol admin.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isRegisterMode ? (
                "Registrar Administrador"
              ) : (
                "Ingresar como Admin"
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs text-slate-400 hover:text-violet-400 transition-colors"
            >
              {isRegisterMode
                ? "¿Ya tienes cuenta? Iniciar Sesión"
                : "¿No tienes credencial? Crear Administrador"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
