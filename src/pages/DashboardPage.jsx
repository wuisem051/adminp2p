import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { Users, ArrowUpRight, ArrowLeftRight, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, pendingWithdrawals: 0, pendingP2P: 0, totalVolume: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const wSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending")));
        const p2pSnap = await getDocs(query(collection(db, "p2p_orders"), where("status", "in", ["open", "dispute"])));
        setStats({
          users: usersSnap.size,
          pendingWithdrawals: wSnap.size,
          pendingP2P: p2pSnap.size,
          totalVolume: 0
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Usuarios Registrados", value: stats.users, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Retiros Pendientes", value: stats.pendingWithdrawals, icon: ArrowUpRight, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Ordenes P2P Activas", value: stats.pendingP2P, icon: ArrowLeftRight, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Volumen Total USDT", value: "$" + stats.totalVolume.toFixed(2), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm">Vision general del sistema en tiempo real.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
              <c.icon size={20} />
            </div>
            <div>
              <p className={`text-2xl font-extrabold font-mono ${c.color}`}>
                {loading ? "..." : c.value}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
          <TrendingUp size={16} className="text-violet-400" />
          <span>Estado del Sistema</span>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { label: "Firebase Auth", status: "Activo", ok: true },
            { label: "Firestore DB", status: "Activo", ok: true },
            { label: "Coleccion users", status: `${stats.users} documentos`, ok: true },
            { label: "Coleccion withdrawals", status: `${stats.pendingWithdrawals} pendientes`, ok: stats.pendingWithdrawals === 0 },
            { label: "Coleccion p2p_orders", status: `${stats.pendingP2P} abiertas/disputas`, ok: stats.pendingP2P === 0 },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/60 last:border-0">
              <span className="text-slate-300">{item.label}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
