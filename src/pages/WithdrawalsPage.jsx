import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";
import { CheckCircle2, XCircle, RefreshCw, ArrowUpRight, Clock } from "lucide-react";

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "withdrawals"), orderBy("createdAt", "desc")));
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      setWithdrawals([
        { id: "w_demo_1", uid: "user_abc", email: "juan@demo.com", symbol: "USDT", amount: 50, address: "TJ8hN7k4m9vP...Lb4c", status: "pending", createdAt: { seconds: Date.now()/1000 - 300 } },
        { id: "w_demo_2", uid: "user_xyz", email: "maria@demo.com", symbol: "DOGE", amount: 200, address: "D9vP2k7m4w...b4c", status: "pending", createdAt: { seconds: Date.now()/1000 - 600 } },
        { id: "w_demo_3", uid: "user_mmm", email: "pedro@demo.com", symbol: "LTC", amount: 0.5, address: "ltc1qf8w5j76vc...k8w", status: "approved", createdAt: { seconds: Date.now()/1000 - 3600 } },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (wId, status) => {
    setSaving(wId);
    try {
      await updateDoc(doc(db, "withdrawals", wId), { status, processedAt: new Date() });
      setWithdrawals(prev => prev.map(w => w.id === wId ? { ...w, status } : w));
    } catch {
      setWithdrawals(prev => prev.map(w => w.id === wId ? { ...w, status } : w));
    }
    setSaving(null);
  };

  const filtered = withdrawals.filter(w => filter === "all" ? true : w.status === filter);

  const statusColors = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  const symbolColors = { USDT: "text-emerald-400", ETH: "text-indigo-400", LTC: "text-blue-400", DOGE: "text-amber-400" };

  const fmt = (ts) => {
    if (!ts) return "-";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("es-VE", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Retiros Crypto</h2>
          <p className="text-slate-400 text-sm">Aprobar o rechazar solicitudes de retiro on-chain.</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${filter === f ? "bg-violet-600 text-white shadow-md" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : f === "approved" ? "Aprobados" : "Rechazados"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-slate-500 text-sm py-8 text-center">Cargando retiros de Firebase...</p>
        : filtered.length === 0 ? <p className="text-slate-500 text-sm py-8 text-center">No hay retiros en esta categoria.</p>
        : filtered.map(w => (
          <div key={w.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <ArrowUpRight size={18} className={symbolColors[w.symbol] || "text-slate-400"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold text-base font-mono ${symbolColors[w.symbol] || "text-white"}`}>
                      {w.amount} {w.symbol}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${statusColors[w.status] || statusColors.pending}`}>
                      {w.status === "pending" ? "Pendiente" : w.status === "approved" ? "Aprobado" : "Rechazado"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">De: {w.email || w.uid}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Destino: {w.address}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Solicitado: {fmt(w.createdAt)}</p>
                </div>
              </div>

              {w.status === "pending" && (
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => updateStatus(w.id, "approved")} disabled={saving === w.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-bold transition-all">
                    <CheckCircle2 size={14} /> Aprobar
                  </button>
                  <button onClick={() => updateStatus(w.id, "rejected")} disabled={saving === w.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-all">
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
