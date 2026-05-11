import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, Edit2, Info, Flag } from 'lucide-react';

export default function OkrDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('Mei 2026');

  // Hardcoded initial match of the requested UI
  const okrData = [
    {
      id: '#1',
      title: 'OKR 1 - Target Revenue',
      subtitle: 'UANG AKTUAL MASUK (DATA CLOSING)',
      targetMain: 'Rp 150.000.000',
      realisasiMain: 'Rp 0',
      realisasiMainColor: 'text-red-500',
      items: [
        { name: 'Pencapaian Revenue Netto', target: 'Rp 150.000.000', realisasi: 'Rp 0', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' }
      ]
    },
    {
      id: '#2',
      title: 'OKR 2 - Marketing',
      subtitle: 'TRAFIK LEADS MASUK',
      targetMain: '1.750',
      realisasiMain: '529',
      realisasiMainColor: 'text-red-500',
      items: [
        { name: 'Spending Iklan', target: 'Rp 11.250.000', realisasi: 'Rp 0', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'CPR (Cost Per Result)', target: 'Rp 10.000', realisasi: 'Rp 0', realisasiColor: 'text-emerald-500', progress: 0.0, status: 'Sangat Baik', statusType: 'green' },
        { name: 'CTR (Rasio Klik)', target: '2.00%', realisasi: '0.00%', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'Kreatif Baru (Ads)', target: '10', realisasi: '9', realisasiColor: 'text-orange-500', progress: 90.0, status: 'Progres', statusType: 'yellow' },
        { name: 'Upload Konten All Platform', target: '1.860', realisasi: '0', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'KOL Upload Konten', target: '10', realisasi: '0', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'CRM Existing (Blast)', target: '3.000', realisasi: '0', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' }
      ]
    },
    {
      id: '#3',
      title: 'OKR 3 - Target Sales',
      subtitle: 'TOTAL FORM BOOKING / DEAL (DATABASE LEADS)',
      targetMain: 'Rp 150.000.000',
      realisasiMain: 'Rp 32.159.000',
      realisasiMainColor: 'text-red-500',
      items: [
        { name: 'Hagia Bed', target: 'Rp 51.000.000', realisasi: 'Rp 12.750.000', realisasiColor: 'text-red-500', progress: 25.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'Hagia Clean Mover', target: 'Rp 52.500.000', realisasi: 'Rp 11.892.000', realisasiColor: 'text-red-500', progress: 22.7, status: 'Tertinggal', statusType: 'red' },
        { name: 'Hagia Living', target: 'Rp 31.500.000', realisasi: 'Rp 3.233.000', realisasiColor: 'text-red-500', progress: 10.3, status: 'Tertinggal', statusType: 'red' },
        { name: 'Layanan Lain', target: 'Rp 15.000.000', realisasi: 'Rp 4.284.000', realisasiColor: 'text-red-500', progress: 28.6, status: 'Tertinggal', statusType: 'red' },
        { name: 'Closing Rate (Keseluruhan)', target: '10.00%', realisasi: '5.67%', realisasiColor: 'text-orange-500', progress: 56.7, status: 'Progres', statusType: 'yellow' },
        { name: 'AOV per Customer', target: 'Rp 1.300.000', realisasi: 'Rp 1.071.967', realisasiColor: 'text-orange-500', progress: 82.5, status: 'Progres', statusType: 'yellow' }
      ]
    },
    {
      id: '#4',
      title: 'OKR 4 - Operasional',
      subtitle: 'KEPUASAN CUSTOMER',
      targetMain: '95.00%',
      realisasiMain: '90.00%',
      realisasiMainColor: 'text-orange-500',
      items: [
        { name: 'Komplain', target: '5.00%', realisasi: '2.00%', realisasiColor: 'text-emerald-500', progress: 40.0, status: 'Sangat Baik', statusType: 'green' },
        { name: 'Ketepatan Kedatangan', target: '100.00%', realisasi: '95.00%', realisasiColor: 'text-orange-500', progress: 95.0, status: 'Progres', statusType: 'yellow' },
        { name: 'Dokumentasi Hasil (SPK)', target: '100.00%', realisasi: '0.00%', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' },
      ]
    },
    {
      id: '#5',
      title: 'OKR 5 - Human Resource',
      subtitle: 'BAHAGIA, BISA, BERTUMBUH',
      targetMain: '95.00%',
      realisasiMain: '16.00%',
      realisasiMainColor: 'text-red-500',
      items: [
        { name: 'Absensi dan Jadwal', target: '100.00%', realisasi: '16.00%', realisasiColor: 'text-red-500', progress: 16.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'Rekrutmen', target: '100.00%', realisasi: '13.00%', realisasiColor: 'text-red-500', progress: 13.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'Hari Bahagia', target: '1', realisasi: '0', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' },
      ]
    },
    {
      id: '#6',
      title: 'OKR 6 - Finance',
      subtitle: 'MENJAGA CASHFLOW SEHAT',
      targetMain: '95.00%',
      realisasiMain: '14.67%',
      realisasiMainColor: 'text-red-500',
      items: [
        { name: 'COGS max 35%', target: '35.00%', realisasi: '14.67%', realisasiColor: 'text-emerald-500', progress: 41.9, status: 'Sangat Baik', statusType: 'green' },
        { name: 'Laporan Keuangan', target: '100.00%', realisasi: '0.00%', realisasiColor: 'text-red-500', progress: 0.0, status: 'Tertinggal', statusType: 'red' },
        { name: 'Piutang', target: '0', realisasi: '0', realisasiColor: 'text-emerald-500', progress: 0.0, status: 'Sangat Baik', statusType: 'green' },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="bg-[#0f172a] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0069b4]/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a9cf48]/5 rounded-full blur-2xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute right-10 opacity-5 -z-10">
           <Flag size={200} />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-slate-800/80 border border-slate-700 text-white font-bold px-4 py-2 pr-10 rounded-xl outline-none hover:bg-slate-700 transition-colors"
              >
                <option value="Mei 2026">Mei 2026</option>
                <option value="Juni 2026">Juni 2026</option>
              </select>
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 bg-transparent hover:bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-sm">
              <Edit2 size={14} /> Setel Target
            </button>
          </div>

          <div className="space-y-1">
             <div className="text-5xl md:text-6xl font-black tracking-tight" style={{ color: '#ffffff' }}>
               Rp 150.000.000
             </div>
             <p className="text-slate-400 font-medium tracking-wide">
               Objective and Key Results (OKR) Corporate Hagia Cleaners
             </p>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 min-w-[240px] text-center shadow-lg">
           <div className="text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Status Realisasi Berjalan</div>
           <div className="text-3xl font-black text-emerald-400 mb-2">Rp 0</div>
           <div className="flex items-center justify-center gap-2">
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden flex-1 max-w-[100px]">
                 <div className="h-full bg-emerald-400 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-xs font-bold text-slate-300">0.0% Tercapai</span>
           </div>
        </div>
      </div>

      {/* OKR Cards */}
      <div className="space-y-8">
        {okrData.map((okr, index) => (
          <div key={okr.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner border border-indigo-100">
                   {okr.id}
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-slate-800">{okr.title}</h2>
                   <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mt-1">{okr.subtitle}</p>
                 </div>
               </div>

               <div className="flex gap-6 md:gap-10">
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Utama</div>
                    <div className="font-black text-slate-800 text-lg">{okr.targetMain}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Realisasi</div>
                    <div className={`font-black text-lg ${okr.realisasiMainColor}`}>{okr.realisasiMain}</div>
                 </div>
               </div>
            </div>

            {/* Configurable Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-6 md:px-8 text-xs font-bold text-slate-400 uppercase w-2/5">Key Results (Metrik Pengukur)</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase w-1/6">Target</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase w-1/6">Realisasi Live</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase w-1/5">% Progress</th>
                    <th className="py-4 px-6 md:px-8 text-xs font-bold text-slate-400 uppercase text-center w-32">Status Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {okr.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-5 px-6 md:px-8 text-sm font-bold text-slate-700">{item.name}</td>
                      <td className="py-5 px-4 text-sm font-bold text-slate-500">{item.target}</td>
                      <td className={`py-5 px-4 text-sm font-black ${item.realisasiColor}`}>{item.realisasi}</td>
                      <td className="py-5 px-4">
                         <div className="flex items-center gap-3">
                           <div className="h-1.5 w-16 md:w-20 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                              <div 
                                className={`h-full rounded-full ${item.statusType === 'green' ? 'bg-emerald-500' : item.statusType === 'yellow' ? 'bg-orange-400' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(item.progress, 100)}%` }}
                              ></div>
                           </div>
                           <span className="text-xs font-bold text-slate-600 w-10 text-right">{item.progress.toFixed(1)}%</span>
                         </div>
                      </td>
                      <td className="py-5 px-6 md:px-8">
                         <div className="flex justify-center">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              item.statusType === 'green' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : item.statusType === 'yellow'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-100' // slightly more orange/amber than typical yellow
                                  : 'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                              {item.status}
                            </span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
