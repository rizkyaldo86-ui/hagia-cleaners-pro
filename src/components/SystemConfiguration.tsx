import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Target, 
  Code, 
  Plus, 
  Key, 
  Trash2, 
  Lock,
  RefreshCw,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../lib/authStore';

export default function SystemConfiguration() {
  const { roles, addRole, updateRole, deleteRole } = useAuthStore();
  
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePin, setNewRolePin] = useState('');
  const [newRoleMenus, setNewRoleMenus] = useState<string[]>([]);
  const [kpis, setKpis] = useState([
    { id: 1, name: "Target ROAS Keseluruhan", value: "4", unit: "X" },
    { id: 2, name: "Target ROAS Iklan (Meta)", value: "4", unit: "X" },
    { id: 3, name: "Target CPA Maksimal", value: "15000", unit: "RP" },
    { id: 4, name: "Target CPC Maksimal", value: "3000", unit: "RP" }
  ]);

  const [formulas, setFormulas] = useState([
    { id: 1, name: "Closing Rate", expression: "({Closing} / {Total Keseluruhan Leads}) * 100" },
    { id: 2, name: "Roas Keseluruhan", expression: "{Sales} / {Biaya Iklan}" }
  ]);

  const MENUS = [
    { label: "Dashboard Utama", id: "dashboard-utama" }, 
    { label: "Laporan ROAS & Layanan", id: "roas-reports" }, 
    { label: "Database Iklan", id: "ads-db" }, 
    { label: "Database Leads", id: "leads" }, 
    { label: "Database KOL", id: "kol-db" }, 
    { label: "Jadwal Posting Sosmed", id: "posting-schedule" }, 
    { label: "Analisa Harian Tiktok", id: "tiktok-daily" }, 
    { label: "Analisa Harian Instagram", id: "instagram-daily" },
    { label: "Analisa IG Bayangan", id: "ig-shadow" }, 
    { label: "Analisa Tiktok Bayangan", id: "tiktok-shadow" }, 
    { label: "Database CRM & Blast", id: "crm-blast" }, 
    { label: "Dokumentasi SPK", id: "docs-spk" },
    { label: "Manajemen Aset Peralatan", id: "asset-mgmt" }, 
    { label: "Data Complaint & QC", id: "complaint-qc" }, 
    { label: "OKR Corporate Dashboard", id: "okr-dashboard" }, 
    { label: "Log Aktivitas", id: "activity-log" },
    { label: "Absensi Karyawan", id: "absensi" }, 
    { label: "Pembuat Laporan PDF", id: "pdf-maker" }, 
    { label: "Data Closing", id: "closing" },
    { label: "Planing & Analisa Konten", id: "content-plan" }, 
    { label: "Data Landing Page", id: "landing-page" }, 
    { label: "Analisa Harian Youtube", id: "youtube-daily" }, 
    { label: "Analisa Harian Facebook", id: "facebook-daily" },
    { label: "Analisa FB Bayangan", id: "fb-shadow" }, 
    { label: "Analisa Youtube Bayangan", id: "youtube-shadow" }, 
    { label: "Kalender & SPK", id: "calendar-spk" }, 
    { label: "Daily Operasional", id: "daily-ops" },
    { label: "Stok Opname Chemical", id: "chemical-stock" }, 
    { label: "Laporan Survei B2B", id: "survey-b2b" }, 
    { label: "Konfigurasi & Rumus", id: "config" }, 
    { label: "Sistem & Backup", id: "backup" }
  ];

  const handleKpiUpdate = (id: number, val: string) => {
    setKpis(kpis.map(k => k.id === id ? { ...k, value: val } : k));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-500">
      {/* Top Banner similar to other pages */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex gap-2 items-center overflow-x-auto w-full md:w-auto">
          {['SEMUA', 'HARI INI', 'KEMARIN', 'MG INI', 'BLN INI', 'CUSTOM'].map(opt => (
            <button key={opt} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${opt === 'CUSTOM' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
              {opt}
            </button>
          ))}
        </div>
        <button className="hidden md:flex p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-sm font-bold text-slate-600 hidden md:flex">
         <div className="flex items-center gap-2">
            <Calendar size={16} className="text-indigo-500" />
            <span>01/05/2026</span>
         </div>
         <span className="text-slate-300">-</span>
         <div className="flex items-center gap-2">
            <span>31/05/2026</span>
            <Calendar size={16} className="text-indigo-500" />
         </div>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-5">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 shrink-0">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">KONFIGURASI & RUMUS</h1>
          <p className="text-slate-500 font-medium">Atur target KPI dan formula kalkulasi otomatis tabel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-indigo-700 font-bold">
              <Target size={20} />
              <h2 className="uppercase tracking-wide">TARGET KPI</h2>
            </div>
            <button className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
              Simpan
            </button>
          </div>

          <div className="space-y-4 relative">
            {/* The vertical connector line like in the image */}
            <div className="absolute left-8 top-8 bottom-32 w-0.5 bg-slate-100 z-0"></div>

            {kpis.map((kpi) => (
              <div key={kpi.id} className="relative z-10 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-indigo-300 transition-all">
                <label className="text-xs font-bold text-slate-800 mb-2 block">{kpi.name}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={kpi.value} 
                    onChange={e => handleKpiUpdate(kpi.id, e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 font-bold w-16 text-center uppercase">
                    {kpi.unit}
                  </div>
                </div>
              </div>
            ))}

            <div className="relative z-10 bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl mt-6">
              <label className="text-xs font-bold text-indigo-800 mb-3 block uppercase tracking-wider">Tambah Target Baru</label>
              <div className="space-y-3">
                <select className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500 bg-white">
                  <option>-- Pilih Kolom sebagai Target --</option>
                </select>
                <div className="flex gap-3">
                  <input placeholder="Nilai" className="flex-1 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-white" />
                  <input placeholder="Satuan (ID)" className="w-1/3 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-white" />
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors shadow-md">
                  <Plus size={18} /> Tambah KPI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Formulas Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-6">
            <Code size={20} />
            <h2 className="uppercase tracking-wide">RUMUS KALKULASI</h2>
          </div>

          <div className="space-y-4">
            {formulas.map(formula => (
              <div key={formula.id} className="border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-indigo-300 transition-all">
                <label className="text-xs font-bold text-indigo-700 mb-2 block">{formula.name}</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 break-all">
                  {formula.expression}
                </div>
              </div>
            ))}

            <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl mt-8">
              <label className="text-xs font-bold text-indigo-800 mb-3 block uppercase tracking-wider">Tambah Rumus Baru</label>
              <div className="space-y-3">
                <select className="w-full border border-indigo-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500 bg-white">
                  <option>Klik Desty Page Instagram</option>
                </select>
                <input 
                  placeholder="Cth: {Sales} / {Biaya Iklan}" 
                  className="w-full border border-indigo-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-indigo-500 bg-white" 
                />
                <button className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors shadow-md">
                  Simpan Rumus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Panel */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-rose-600 font-bold mb-6">
          <Key size={22} />
          <h2 className="uppercase tracking-wide text-lg">MANAJEMEN AKSES ROLE (RBAC)</h2>
        </div>

        <div className="space-y-4 mb-10">
          {roles.map(role => (
            <div key={role.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 p-4 sm:p-5 rounded-2xl hover:border-rose-200 transition-colors bg-gradient-to-r from-white to-slate-50 relative overflow-hidden">
               {role.isSystem && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>}
               <div>
                  <h3 className="font-extrabold text-slate-800 text-sm mb-1">{role.name}</h3>
                  <div className="flex flex-wrap items-center gap-3">
                     <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                        <Lock size={12} /> PIN: {role.pin}
                     </span>
                     <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                        {(role.allowedMenus || []).length} Menu Diakses
                     </span>
                  </div>
               </div>
               {!role.isSystem && (
                 <button onClick={() => deleteRole(role.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl border border-transparent hover:border-rose-100 transition-all self-start sm:self-center bg-white shadow-sm">
                   <Trash2 size={18} />
                 </button>
               )}
            </div>
          ))}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
           <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-6">Konfigurasi Role Baru</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 ml-1">Nama Jabatan/Role</label>
               <input 
                 placeholder="Cth: Admin Gudang" 
                 value={newRoleName}
                 onChange={(e) => setNewRoleName(e.target.value)}
                 className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" 
               />
             </div>
             <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 ml-1">PIN Login (Angka)</label>
               <input 
                 placeholder="Cth: 8888" 
                 type="number" 
                 value={newRolePin}
                 onChange={(e) => setNewRolePin(e.target.value)}
                 className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" 
               />
             </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm">
              <label className="block text-xs font-bold text-slate-700 mb-4 uppercase">Beri Akses Pada Menu & Fitur Berikut:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                {MENUS.map((menu, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={newRoleMenus.includes(menu.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRoleMenus([...newRoleMenus, menu.id]);
                          } else {
                            setNewRoleMenus(newRoleMenus.filter(id => id !== menu.id));
                          }
                        }}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-[#4f46e5] checked:border-[#4f46e5] transition-colors cursor-pointer" 
                      />
                      <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors select-none">{menu.label}</span>
                  </label>
                ))}
              </div>
           </div>

           <button 
             onClick={() => {
               if (newRoleName && newRolePin) {
                 addRole({
                   id: Math.random().toString(36).substring(7),
                   name: newRoleName,
                   pin: newRolePin,
                   allowedMenus: newRoleMenus,
                   isSystem: false
                 });
                 setNewRoleName('');
                 setNewRolePin('');
                 setNewRoleMenus([]);
               }
             }}
             className="w-full flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
           >
             <Save size={18} />
             Simpan Konfigurasi Role
           </button>
        </div>
      </div>
    </div>
  );
}
