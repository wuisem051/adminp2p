import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Save, RefreshCw, Edit3, CheckCircle2 } from "lucide-react";

const DEFAULT_CONTENT = {
  heroTitle: "La billetera no custodia de pagos rapidos en USDT",
  heroSubtitle: "Disenada para comercios y personas en economias dinamicas. Cobra y paga al instante en USDT y Bolivares sin bancos, sin registro de identidad y sin demoras.",
  heroCta: "Lanzar Billetera",
  stat1Label: "Velocidad de Cobro", stat1Value: "< 1s",
  stat2Label: "Gas / Comisiones Internas", stat2Value: "0%",
  stat3Label: "Cifrado de Grado Militar", stat3Value: "AES-256",
  stat4Label: "Privacidad Garantizada", stat4Value: "0 KYC",
  feature1Title: "100% Sin KYC ni Registro",
  feature1Desc: "Sin correos, sin numeros de telefono ni datos personales. Entras y operas de inmediato con soberania total.",
  feature2Title: "Boveda No Custodia Cifrada",
  feature2Desc: "Tus llaves privadas se cifran localmente en tu navegador con AES-256 protegido por tu PIN personal.",
  feature3Title: "Cobros PoS Instantaneos",
  feature3Desc: "Modo Punto de Venta optimizado para cajas de comercios. QR dinamicos con alerta sonora inmediata.",
  announcementBanner: "",
  maintenanceMode: false,
};

export default function HomeEditorPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "site_config", "home"));
      if (snap.exists()) setContent({ ...DEFAULT_CONTENT, ...snap.data() });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "site_config", "home"), { ...content, updatedAt: new Date() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert("Error guardando: " + e.message); }
    setSaving(false);
  };

  const field = (key, label, multiline = false) => (
    <div key={key}>
      <label className="text-xs text-slate-400 block mb-1 font-semibold">{label}</label>
      {multiline ? (
        <textarea value={content[key] || ""} onChange={e => setContent(p => ({ ...p, [key]: e.target.value }))} rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
      ) : (
        <input type="text" value={content[key] || ""} onChange={e => setContent(p => ({ ...p, [key]: e.target.value }))}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
      )}
    </div>
  );

  if (loading) return <div className="text-center py-20 text-slate-500">Cargando configuracion...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Editor de Home</h2>
          <p className="text-slate-400 text-sm">Cambios se guardan en Firestore: site_config/home</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${saved ? "bg-emerald-500 text-white" : "bg-violet-600 hover:bg-violet-500 text-white"}`}>
            {saved ? <><CheckCircle2 size={15} /> Guardado!</> : saving ? "Guardando..." : <><Save size={15} /> Guardar Cambios</>}
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm border-b border-slate-800 pb-3">
          <Edit3 size={15} className="text-violet-400" /> Seccion Hero
        </div>
        {field("heroTitle", "Titulo Principal")}
        {field("heroSubtitle", "Subtitulo / Descripcion", true)}
        {field("heroCta", "Texto del Boton Principal")}
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm border-b border-slate-800 pb-3">
          <Edit3 size={15} className="text-cyan-400" /> Metricas Clave (4 indicadores)
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field("stat1Value", "Metrica 1 — Valor")}
          {field("stat1Label", "Metrica 1 — Etiqueta")}
          {field("stat2Value", "Metrica 2 — Valor")}
          {field("stat2Label", "Metrica 2 — Etiqueta")}
          {field("stat3Value", "Metrica 3 — Valor")}
          {field("stat3Label", "Metrica 3 — Etiqueta")}
          {field("stat4Value", "Metrica 4 — Valor")}
          {field("stat4Label", "Metrica 4 — Etiqueta")}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm border-b border-slate-800 pb-3">
          <Edit3 size={15} className="text-amber-400" /> Beneficios Destacados
        </div>
        {field("feature1Title", "Beneficio 1 — Titulo")}
        {field("feature1Desc", "Beneficio 1 — Descripcion", true)}
        {field("feature2Title", "Beneficio 2 — Titulo")}
        {field("feature2Desc", "Beneficio 2 — Descripcion", true)}
        {field("feature3Title", "Beneficio 3 — Titulo")}
        {field("feature3Desc", "Beneficio 3 — Descripcion", true)}
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm border-b border-slate-800 pb-3">
          <Edit3 size={15} className="text-rose-400" /> Configuracion del Sistema
        </div>
        {field("announcementBanner", "Banner de Anuncio (dejar vacio para ocultar)")}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Modo Mantenimiento</p>
            <p className="text-xs text-slate-400">Si esta activo, la app mostrara un mensaje de mantenimiento.</p>
          </div>
          <button onClick={() => setContent(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
            className={`relative w-12 h-6 rounded-full transition-all ${content.maintenanceMode ? "bg-rose-500" : "bg-slate-700"}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${content.maintenanceMode ? "left-7" : "left-1"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
