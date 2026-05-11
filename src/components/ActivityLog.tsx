import React, { useState, useEffect } from 'react';
import { History, Clock, FileText, RefreshCw, Calendar, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  type: 'auth' | 'data' | 'sync' | 'config' | 'critical';
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '11 Mei 2026, 09:12:05 WIB', action: 'Login: Owner / Super Admin', type: 'auth' },
  { id: '2', timestamp: '11 Mei 2026, 08:45:12 WIB', action: 'Smart Sync G-Sheet ke tabel leads_v1 (Baru: 10, Diperbarui: 5, Dilewati: 200)', type: 'sync' },
  { id: '3', timestamp: '11 Mei 2026, 08:30:00 WIB', action: 'Mengubah nama kolom "Harga" menjadi "Nominal" di master_v6', type: 'config' },
  { id: '4', timestamp: '10 Mei 2026, 17:30:00 WIB', action: 'Membuat Full Backup (JSON) pada jam 17:30', type: 'critical' },
  { id: '5', timestamp: '10 Mei 2026, 16:10:20 WIB', action: 'Menambahkan 1 baris kosong baru di master_v6', type: 'data' },
  { id: '6', timestamp: '10 Mei 2026, 15:45:11 WIB', action: 'Menghapus 15 baris data dari sistem (Database Leads)', type: 'data' },
  { id: '7', timestamp: '10 Mei 2026, 14:20:05 WIB', action: 'Menambahkan Target KPI baru: Target AOV', type: 'config' },
  { id: '8', timestamp: '10 Mei 2026, 13:15:30 WIB', action: 'Menarik Data Leads & Agregasi otomatis ke Data Closing untuk 30 Hari', type: 'sync' },
  { id: '9', timestamp: '10 Mei 2026, 11:05:00 WIB', action: 'Mengeksekusi asisten AI untuk task: COPYWRITER', type: 'critical' },
  { id: '10', timestamp: '10 Mei 2026, 08:00:15 WIB', action: 'Login: Finance / Keuangan', type: 'auth' },
];

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLogColor = (type: string) => {
    switch(type) {
      case 'auth': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'data': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'sync': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'config': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-500">
      {/* Top Banner */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex gap-2 items-center overflow-x-auto w-full md:w-auto">
          {['SEMUA', 'HARI INI', 'KEMARIN', 'MG INI', 'BLN INI', 'CUSTOM'].map(opt => (
            <button key={opt} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${opt === 'SEMUA' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
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
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 shrink-0">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              LOG AKTIVITAS <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-slate-200">System History</span>
            </h1>
            <p className="text-slate-500 font-medium">Jejak audit tidak terhapus untuk memantau keamanan dan transparansi aktivitas pengguna.</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-auto">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Cari aktivitas..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
           />
        </div>
      </div>

      {/* Log Table/List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
           <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              Rekaman Aktivitas (100 Teratas)
           </h2>
           <button className="text-slate-500 hover:text-indigo-600 transition-colors p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
             <Filter size={18} />
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-1/4 min-w-[200px]">Waktu (Timestamp)</th>
                <th className="p-4 w-3/4 min-w-[300px]">Deskripsi Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Clock size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`shrink-0 w-2 h-2 rounded-full border ${getLogColor(log.type).replace('text-', 'bg-').replace('text-', 'border-').split(' ')[1]}`}></div>
                          <span className="text-sm text-slate-800 font-medium">
                            {log.action}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-12 text-center text-slate-500">
                      Tidak ada aktivitas yang sesuai dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
           <p className="text-xs font-bold text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} catatan aktivitas.</p>
        </div>
      </div>
    </div>
  );
}
