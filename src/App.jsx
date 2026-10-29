import React, { useState } from "react";
import "./index.css";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import P2pMediationPage from "./pages/P2pMediationPage";
import HomeEditorPage from "./pages/HomeEditorPage";

function AdminPanel() {
  const { isAdmin } = useAdminAuth();
  const [activePage, setActivePage] = useState("dashboard");

  if (!isAdmin) return <LoginPage />;

  const pages = {
    dashboard: <DashboardPage />,
    users: <UsersPage />,
    withdrawals: <WithdrawalsPage />,
    p2p: <P2pMediationPage />,
    home_editor: <HomeEditorPage />,
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6 overflow-y-auto">
        {pages[activePage] || <DashboardPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminPanel />
    </AdminAuthProvider>
  );
}
