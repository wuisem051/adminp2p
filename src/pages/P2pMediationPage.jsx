import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";
import { ArrowLeftRight, CheckCircle2, AlertTriangle, Shield, RefreshCw, Clock, MessageSquare } from "lucide-react";

export default function P2pMediationPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [saving, setSaving] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "p2p_orders"), orderBy("createdAt", "desc")));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      setOrders([
        { id: "p2p_1", buyerId: "user_abc", buyerEmail: "juan@demo.com", sellerId: "agent_xyz", sellerEmail: "cajero1@demo.com", amountUsdt: 50, amountVes: 1840, method: "Pago Movil Banesco", status: "open", createdAt: { seconds: Date.now()/1000 - 120 } },
        { id: "p2p_2", buyerId: "user_mmm", buyerEmail: "maria@demo.com", sellerId: "agent_abc", sellerEmail: "cajero2@demo.com", amountUsdt: 100, amountVes: 3680, method: "Pago Movil Venezuela", status: "dispute", disputeReason: "El vendedor no respondio en 30 minutos.", createdAt: { seconds: Date.now()/1000 - 3600 } },
        { id: "p2p_3", buyerId: "user_zzz", buyerEmail: "pedro@demo.com", sellerId: "agent_xyz", sellerEmail: "cajero1@demo.com", amountUsdt: 25, amountVes: 920, method: "Efectivo USD", status: "completed", createdAt: { seconds: Date.now()/1000 - 7200 } },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status, resolution = "") => {
    setSaving(orderId);
    try {
      await updateDoc(doc(db, "p2p_orders", orderId), { status, resolution, resolvedAt: new Date() });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, resolution } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status, resolution }));
    } catch {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, resolution } : o));
    }
    setSaving(null);
  };

  const filtered = orders.filter(o => filter === "all" ? true : o.status === filter);

  const statusColors = {
    open: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    dispute: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-slate-700 text-slate-400 border-slate-600",
    resolved: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };
  const statusLabel = { open: "Abierta", dispute: "En Disputa", completed: "Completada", cancelled: "Cancelada", resolved: "Resuelta por Admin" };

  const fmt = (ts) => {
    if (!ts) return "-";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("es-VE", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Mediacion P2P</h2>
          <p className="text-slate-400 text-sm">Gestionar ordenes, disputas y arbitraje entre usuarios y agentes.</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { v: "open", l: "Abiertas" },
          { v: "dispute", l: "Disputas" },
          { v: "completed", l: "Completadas" },
          { v: "all", l: "Todas" }
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f.v ? "bg-violet-600 text-white shadow-md" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {f.l} {f.v === "dispute" && orders.filter(o=>o.status==="dispute").length > 0 && (
              <span className="ml-1 bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                {orders.filter(o=>o.status==="dispute").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LISTA DE ORDENES */}
        <div className="space-y-3">
          {loading ? <p className="text-slate-500 text-sm py-8 text-center">Cargando ordenes de Firebase...</p>
          : filtered.length === 0 ? <p className="text-slate-500 text-sm py-8 text-center">No hay ordenes en esta categoria.</p>
          : filtered.map(o => (
            <div key={o.id}
              onClick={() => setSelectedOrder(o)}
              className={`p-4 rounded-2xl bg-slate-900 border transition-all cursor-pointer ${selectedOrder?.id === o.id ? "border-violet-500 shadow-md shadow-violet-500/10" : "border-slate-800 hover:border-slate-700"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${o.status === "dispute" ? "bg-rose-500/10 text-rose-400" : "bg-cyan-500/10 text-cyan-400"}`}>
                    {o.status === "dispute" ? <AlertTriangle size={16} /> : <ArrowLeftRight size={16} />}
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${statusColors[o.status] || statusColors.open}`}>
                      {statusLabel[o.status] || o.status}
                    </span>
                    <p className="text-white font-bold font-mono mt-1">{o.amountUsdt} USDT → Bs. {o.amountVes?.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">{fmt(o.createdAt)}</p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div><span className="text-slate-500">Comprador:</span> {o.buyerEmail}</div>
                <div><span className="text-slate-500">Vendedor:</span> {o.sellerEmail}</div>
                <div className="col-span-2"><span className="text-slate-500">Metodo:</span> {o.method}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DE MEDIACION */}
        <div className="sticky top-6">
          {!selectedOrder ? (
            <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Shield size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Selecciona una orden para gestionar</p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-violet-400" />
                <h4 className="font-bold text-white text-base">Panel de Mediacion</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 space-y-1.5">
                  <p><span className="text-slate-400">Orden ID:</span> <span className="text-white font-mono">{selectedOrder.id}</span></p>
                  <p><span className="text-slate-400">Monto:</span> <span className="text-emerald-400 font-bold font-mono">{selectedOrder.amountUsdt} USDT</span></p>
                  <p><span className="text-slate-400">Comprador:</span> <span className="text-white">{selectedOrder.buyerEmail}</span></p>
                  <p><span className="text-slate-400">Vendedor/Cajero:</span> <span className="text-white">{selectedOrder.sellerEmail}</span></p>
                  <p><span className="text-slate-400">Metodo pago:</span> <span className="text-cyan-400">{selectedOrder.method}</span></p>
                  {selectedOrder.disputeReason && (
                    <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <span className="font-bold block">Razon de Disputa:</span>
                      {selectedOrder.disputeReason}
                    </div>
                  )}
                </div>
              </div>

              {["open", "dispute"].includes(selectedOrder.status) && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-semibold">Acciones del Administrador:</p>
                  <button onClick={() => updateStatus(selectedOrder.id, "completed", "Admin confirmo pago recibido")}
                    disabled={saving === selectedOrder.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white text-sm font-bold transition-all">
                    <CheckCircle2 size={16} /> Confirmar Pago — Liberar Fondos al Comprador
                  </button>
                  <button onClick={() => updateStatus(selectedOrder.id, "resolved", "Admin resolvio a favor del vendedor")}
                    disabled={saving === selectedOrder.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500 text-violet-400 hover:text-white text-sm font-bold transition-all">
                    <Shield size={16} /> Resolver — Devolver Fondos al Vendedor
                  </button>
                  <button onClick={() => updateStatus(selectedOrder.id, "cancelled", "Admin cancelo la orden")}
                    disabled={saving === selectedOrder.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold transition-all">
                    Cancelar Orden
                  </button>
                </div>
              )}
              {!["open","dispute"].includes(selectedOrder.status) && (
                <div className={`p-3 rounded-xl text-sm font-semibold text-center border ${statusColors[selectedOrder.status]}`}>
                  Orden {statusLabel[selectedOrder.status]}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
