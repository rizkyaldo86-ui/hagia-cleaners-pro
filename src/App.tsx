import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Target, 
  Users, 
  UserPlus, 
  CheckSquare, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  ClipboardList, 
  Settings, 
  Wrench, 
  Package, 
  AlertCircle, 
  Database, 
  Layers, 
  Megaphone, 
  PenTool, 
  CalendarDays, 
  Globe, 
  Smartphone, 
  Youtube, 
  Instagram, 
  Facebook, 
  Settings2, 
  History, 
  HardDrive, 
  LogOut, 
  X, 
  Menu,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import LeadsDatabase from './components/LeadsDatabase';
import DataClosing from './components/DataClosing';
import DataCampaign from './components/DataCampaign';
import AdsDatabase from './components/AdsDatabase';
import EmployeeAttendance from './components/EmployeeAttendance';
import GenericTable from './components/GenericTable';
import CrmBlastDatabase from './components/CrmBlastDatabase';
import CalendarSPK from './components/CalendarSPK';
import DocsSPK from './components/DocsSPK';
import PublicBookingForm from './components/PublicBookingForm';
import OkrDashboard from './components/OkrDashboard';
import RoasReport from './components/RoasReport';
import PdfMaker from './components/PdfMaker';
import SystemConfiguration from './components/SystemConfiguration';
import SystemBackup from './components/SystemBackup';
import ActivityLog from './components/ActivityLog';
import LoginScreen from './components/LoginScreen';
import DashboardUtama from './components/DashboardUtama';
import { MENU_SCHEMAS } from './data/schemas';
import { useAuthStore } from './lib/authStore';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  id: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export const allMenuCategories: MenuCategory[] = [ 
    {
      title: "EXECUTIVE & FINANCE",
      items: [
        { icon: <LayoutDashboard size={20} />, label: "Dashboard Utama", id: "dashboard-utama" },
        { icon: <BarChart3 size={20} />, label: "Laporan ROAS & Layan..", id: "roas-reports" },
        { icon: <FileText size={20} />, label: "Pembuat Laporan PDF", id: "pdf-maker" },
        { icon: <Target size={20} />, label: "OKR Corporate Dashboard", id: "okr-dashboard" },
      ]
    },
    {
      title: "HR & KEPEGAWAIAN",
      items: [
        { icon: <Users size={20} />, label: "Absensi Karyawan", id: "absensi" },
      ]
    },
    {
      title: "SALES & CRM",
      items: [
        { icon: <UserPlus size={20} />, label: "Database Leads", id: "leads" },
        { icon: <CheckSquare size={20} />, label: "Data Closing", id: "closing" },
        { icon: <MessageSquare size={20} />, label: "Database CRM & Blast", id: "crm-blast" },
        { icon: <MapPin size={20} />, label: "Laporan Survei B2B", id: "survey-b2b" },
      ]
    },
    {
      title: "OPERASIONAL JASA",
      items: [
        { icon: <Calendar size={20} />, label: "Kalender & SPK", id: "calendar-spk" },
        { icon: <ClipboardList size={20} />, label: "Dokumentasi SPK", id: "docs-spk" },
        { icon: <Settings size={20} />, label: "Daily Operasional", id: "daily-ops" },
        { icon: <Wrench size={20} />, label: "Manajemen Aset Peralatan", id: "asset-mgmt" },
        { icon: <Package size={20} />, label: "Stok Opname Chemical", id: "chemical-stock" },
        { icon: <AlertCircle size={20} />, label: "Data Complaint & QC", id: "complaint-qc" },
      ]
    },
    {
      title: "MARKETING & ADS",
      items: [
        { icon: <Database size={20} />, label: "Data Iklan Harian", id: "ads-db" },
        { icon: <Layers size={20} />, label: "Data Campaign", id: "campaign" },
        { icon: <Megaphone size={20} />, label: "Database KOL", id: "kol-db" },
        { icon: <PenTool size={20} />, label: "Planing & Analisa Konten", id: "content-plan" },
        { icon: <CalendarDays size={20} />, label: "Jadwal Posting Sosmed", id: "posting-schedule" },
        { icon: <Globe size={20} />, label: "Data Landing Page", id: "landing-page" },
      ]
    },
    {
      title: "ANALISA SOSMED (KONTEN)",
      items: [
        { icon: <Smartphone size={20} />, label: "Harian Tiktok", id: "tiktok-daily" },
        { icon: <Youtube size={20} />, label: "Harian Youtube", id: "youtube-daily" },
        { icon: <Instagram size={20} />, label: "Harian Instagram", id: "instagram-daily" },
        { icon: <Facebook size={20} />, label: "Harian Facebook", id: "facebook-daily" },
        { icon: <Instagram size={20} />, label: "IG Bayangan", id: "ig-shadow" },
        { icon: <Facebook size={20} />, label: "FB Bayangan", id: "fb-shadow" },
        { icon: <Smartphone size={20} />, label: "Tiktok Bayangan", id: "tiktok-shadow" },
        { icon: <Youtube size={20} />, label: "Youtube Bayangan", id: "youtube-shadow" },
      ]
    },
    {
      title: "PENGATURAN SISTEM",
      items: [
        { icon: <Settings2 size={20} />, label: "Konfigurasi & Rumus", id: "config" },
        { icon: <History size={20} />, label: "Log Aktivitas", id: "activity-log" },
      ]
    }
  ];

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard-utama');
  const [isPublicRoute, setIsPublicRoute] = useState(false);
  const { currentUser, logout } = useAuthStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('public-booking') === 'true') {
      setIsPublicRoute(true);
    }
  }, []);

  const menuCategories = React.useMemo(() => {
    if (!currentUser) return [];
    return allMenuCategories
      .map(category => ({
        ...category,
        items: category.items.filter(item => {
          const allowed = currentUser.allowedMenus || [];
          return allowed.includes('all') || allowed.includes(item.id);
        })
      }))
      .filter(category => category.items.length > 0);
  }, [currentUser]);

  // Set default active tab efficiently if current tab is hidden
  useEffect(() => {
    if (currentUser && menuCategories.length > 0 && menuCategories[0].items.length > 0) {
      const allowed = currentUser.allowedMenus || [];
      if (activeItem === 'backup' && (allowed.includes('all') || allowed.includes('backup'))) {
        return; // Allowed explicitly
      }
      const allowedTarget = menuCategories.flatMap(c => c.items).find(i => i.id === activeItem);
      if (!allowedTarget) {
         setActiveItem(menuCategories[0].items[0].id);
      }
    }
  }, [currentUser, activeItem, menuCategories]);

  if (isPublicRoute) {
    return <PublicBookingForm />;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1d] font-sans text-slate-300">
      {/* Sidebar Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="z-50 flex h-full w-[300px] flex-col border-r border-slate-800/50 bg-[#0c1226] shadow-xl"
            id="sidebar-container"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2" id="sidebar-header">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                  <div className="h-6 w-6 rounded-full border-2 border-white/30 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">HAGIA PRO</h1>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                id="close-sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {menuCategories.map((category, idx) => (
                <div key={idx} className="mb-8" id={`category-${idx}`}>
                  <h3 className="mb-3 px-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    {category.title}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        id={`menu-item-${item.id}`}
                        onClick={() => setActiveItem(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          activeItem === item.id 
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                      >
                        <span className={`${activeItem === item.id ? "text-white" : "text-slate-500"}`}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {activeItem === item.id && (
                          <motion.div layoutId="active-indicator">
                            <ChevronRight size={14} className="text-white/70" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-800/50 p-4 space-y-2" id="sidebar-footer">
              {((currentUser.allowedMenus || []).includes('all') || (currentUser.allowedMenus || []).includes('backup')) && (
                <button 
                  onClick={() => setActiveItem('backup')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeItem === 'backup' 
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <HardDrive size={20} className={activeItem === 'backup' ? 'text-white' : 'text-slate-500'} />
                  <span>Sistem & Backup</span>
                </button>
              )}
              <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
                <LogOut size={20} />
                <span>Keluar ({currentUser.name})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0f1d]">
        {/* Top Navbar for Mobile/Collapsed */}
        {!isOpen && (
          <div className="flex items-center gap-4 p-4 border-b border-slate-800/50 bg-[#0c1226]/50 backdrop-blur-md">
            <button 
              onClick={() => setIsOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              id="open-sidebar"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">HAGIA PRO</h1>
          </div>
        )}

        {/* Content Placeholder */}
        <main className="flex-1 overflow-y-auto p-8" id="main-content">
          <div className="mx-auto max-w-6xl">
            {activeItem !== 'dashboard-utama' && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {menuCategories.flatMap(c => c.items).find(i => i.id === activeItem)?.label || "Dashboard"}
                </h2>
                <p className="text-slate-400">Selamat datang kembali di panel kendali Hagia Group.</p>
              </div>
            )}

            {activeItem === 'dashboard-utama' ? (
              <DashboardUtama />
            ) : activeItem === 'leads' ? (
              <LeadsDatabase />
            ) : activeItem === 'closing' ? (
              <DataClosing />
            ) : activeItem === 'campaign' ? (
              <DataCampaign />
            ) : activeItem === 'absensi' ? (
              <EmployeeAttendance />
            ) : activeItem === 'ads-db' ? (
              <AdsDatabase />
            ) : activeItem === 'crm-blast' ? (
              <CrmBlastDatabase />
            ) : activeItem === 'calendar-spk' ? (
              <CalendarSPK />
            ) : activeItem === 'docs-spk' ? (
              <DocsSPK />
            ) : activeItem === 'okr-dashboard' ? (
              <OkrDashboard />
            ) : activeItem === 'roas-reports' ? (
              <RoasReport />
            ) : activeItem === 'pdf-maker' ? (
              <PdfMaker />
            ) : activeItem === 'config' ? (
              <SystemConfiguration />
            ) : activeItem === 'backup' ? (
              <SystemBackup />
            ) : activeItem === 'activity-log' ? (
              <ActivityLog />
            ) : MENU_SCHEMAS[activeItem] ? (
              <GenericTable 
                storageKey={activeItem}
                title={MENU_SCHEMAS[activeItem].title} 
                columns={MENU_SCHEMAS[activeItem].columns} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 rounded-2xl bg-[#0c1226] border border-slate-800/50 flex items-center justify-center text-slate-600 font-medium">
                    Widget {i}
                  </div>
                ))}
              </div>
            )}
            
            {/* Glassmorphism background blur effect */}
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] -z-10"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[100px] -z-10"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
