import React from "react";
import { Shield, Users, Home, ArrowUpRight, ArrowLeftRight, LogOut, BarChart3 } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const links = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "withdrawals", label: "Retiros Crypto", icon: ArrowUpRight },
  { id: "p2p", label: "Mediacion P2P", icon: ArrowLeftRight },
  { id: "home_editor", label: "Editar Home", icon: Home },
];

export default function Sidebar({ activePage, setActivePage }) {
  const { adminUser, logoutAdmin } = useAdminAuth();

  return (
    <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-none">Admin Panel</p>
            <p className="text-[10px] text-violet-400 font-mono">Billetera P2P</p>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-xl bg-slate-800/60 text-xs text-slate-400 truncate">
          {adminUser?.email || "admin@billetera.com"}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActivePage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activePage === id
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button onClick={logoutAdmin}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all">
          <LogOut size={17} />
          Cerrar Sesion
        </button>
      </div>
    </aside>
  );
}
