import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Search, ShieldCheck, Ban, ChevronDown, User, RefreshCw } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (uid, role) => {
    setSaving(uid);
    try {
      await updateDoc(doc(db, "users", uid), { role });
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role } : u));
    } catch (e) { alert("Error: " + e.message); }
    setSaving(null);
  };

  const updateStatus = async (uid, status) => {
    setSaving(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status });
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, status } : u));
    } catch (e) { alert("Error: " + e.message); }
    setSaving(null);
  };

  const filtered = users.filter(u =>
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName || "").toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = { admin: "bg-violet-500/20 text-violet-400", p2p_agent: "bg-amber-500/20 text-amber-400", user: "bg-slate-700 text-slate-300" };
  const statusBadge = { active: "bg-emerald-500/10 text-emerald-400", suspended: "bg-rose-500/10 text-rose-400" };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Usuarios</h2>
          <p className="text-slate-400 text-sm">{users.length} usuarios registrados en Firestore.</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
        <input placeholder="Buscar por nombre o correo..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wide">
              <th className="text-left px-4 py-3">Usuario</th>
              <th className="text-left px-4 py-3">Saldo USDT</th>
              <th className="text-left px-4 py-3">Rol</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-slate-500">Cargando usuarios de Firebase...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-slate-500">No se encontraron usuarios.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.displayName || "Sin nombre"}</p>
                      <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                  ${(u.balanceUsdt || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <select value={u.role || "user"} onChange={e => updateRole(u.id, e.target.value)}
                    disabled={saving === u.id}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${roleBadge[u.role] || roleBadge.user} bg-transparent focus:outline-none`}>
                    <option value="user">Usuario</option>
                    <option value="p2p_agent">Agente P2P</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${statusBadge[u.status] || statusBadge.active}`}>
                    {u.status === "suspended" ? "Suspendido" : "Activo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.status !== "suspended" ? (
                      <button onClick={() => updateStatus(u.id, "suspended")} disabled={saving === u.id}
                        title="Suspender" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                        <Ban size={14} />
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(u.id, "active")} disabled={saving === u.id}
                        title="Activar" className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                        <ShieldCheck size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
