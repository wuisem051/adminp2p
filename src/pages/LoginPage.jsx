import React, { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Shield, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { loginAdmin } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await loginAdmin(email, password);
    } catch (err) {
      setError(err.message || "Credenciales incorrectas.");
    } finally { setLoading(false); }
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
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Correo Administrador</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input type="email" placeholder="admin@billetera.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  required />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Ingresar como Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
