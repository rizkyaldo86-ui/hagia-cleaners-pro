import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Megaphone, 
  Target, Crosshair, BrainCircuit, Calendar as CalendarIcon, 
  AlertTriangle, CheckCircle2, ChevronRight, BarChart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const DEPARTMENTS = [
  { id: 'executive', label: 'Executive & Finance' },
  { id: 'marketing', label: 'Marketing & Ads' },
  { id: 'sales', label: 'Sales & CRM' },
  { id: 'audiens', label: 'Audiens & Demografi' }
];

const SUB_TABS: Record<string, string[]> = {
  executive: ['Executive Summary', 'Finansial & Efisiensi', 'Kekuatan Layanan'],
  marketing: ['Performa Meta Ads', 'Sumber Trafik Lead', 'Conversion Funnel'],
  sales: ['Performa Closing', 'Kinerja Tim CS', 'Suhu Prospek', 'Status Follow Up'],
  audiens: ['Tren Jam Sibuk', 'Demografi Lokasi']
};

const FILTER_PERIODS = ['Hari Ini', 'Kemarin', 'Minggu Ini', 'Bulan Ini', 'Custom'];

// Dummy data for the Area Chart
const chartData = [
  { day: 'Sen', omzet: 12500000, cost: 3500000 },
  { day: 'Sel', omzet: 14200000, cost: 3600000 },
  { day: 'Rab', omzet: 11000000, cost: 3800000 },
  { day: 'Kam', omzet: 9500000, cost: 4200000 },
  { day: 'Jum', omzet: 15400000, cost: 3900000 },
  { day: 'Sab', omzet: 18200000, cost: 4100000 },
  { day: 'Min', omzet: 21000000, cost: 4500000 },
];

export default function DashboardUtama() {
  const [activeDept, setActiveDept] = useState('executive');
  const [activeSubTab, setActiveSubTab] = useState('Executive Summary');
  const [activeFilter, setActiveFilter] = useState('Minggu Ini');

  // Format currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-300">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-[#0c1222] border-b border-slate-800/50 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart className="text-indigo-500" />
            Executive Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analytics AI terpusat untuk monitoring kesehatan bisnis.
          </p>
        </div>

        {/* Global Period Filter */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
          {FILTER_PERIODS.map(period => (
            <button
              key={period}
              onClick={() => setActiveFilter(period)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeFilter === period 
                  ? 'bg-indigo-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        
        {/* Department Navigation */}
        <div className="px-6 pt-6 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DEPARTMENTS.map(dept => (
              <button
                key={dept.id}
                onClick={() => {
                  setActiveDept(dept.id);
                  setActiveSubTab(SUB_TABS[dept.id][0]);
                }}
                className={`whitespace-nowrap px-6 py-3 rounded-xl border font-semibold text-sm transition-all ${
                  activeDept === dept.id
                    ? 'bg-white/5 border-white/10 text-white shadow-lg'
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SUB_TABS[activeDept].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeSubTab === tab
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic View based on Department/Tab */}
        <div className="p-6 flex-1 flex flex-col">
          {activeDept === 'executive' && activeSubTab === 'Executive Summary' ? (
            <ExecutiveSummaryView formatIDR={formatIDR} />
          ) : (
            <div className="flex-1 rounded-2xl border border-slate-800/50 bg-[#0c1222] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <BrainCircuit size={32} className="text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tampilan Sedang Dikembangkan</h3>
              <p className="text-slate-400 max-w-sm">
                Panel untuk <strong className="text-indigo-400">{activeSubTab}</strong> sedang dalam tahap penyempurnaan fitur dan akan segera dirilis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for Executive Summary to keep code clean
function ExecutiveSummaryView({ formatIDR }: { formatIDR: (n: number) => string }) {
  return (
    <div className="space-y-6">
      
      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Sales Closing */}
        <div className="bg-[#0c1222] border border-emerald-900/30 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Sales Closing</div>
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign size={16} /></div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 mb-1">{formatIDR(101800000)}</div>
              <div className="flex items-center text-xs font-bold text-emerald-500 gap-1">
                <TrendingUp size={12} /> +12.5% vs lalu
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-[#0c1222] border border-blue-900/30 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</div>
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><Wallet size={16} /></div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-400 mb-1">{formatIDR(85400000)}</div>
              <div className="flex items-center text-xs font-bold text-blue-500 gap-1">
                <TrendingUp size={12} /> +8.2% vs lalu
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Biaya Iklan */}
        <div className="bg-[#0c1222] border border-rose-900/30 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Biaya Iklan</div>
              <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><Megaphone size={16} /></div>
            </div>
            <div>
              <div className="text-2xl font-black text-rose-400 mb-1">{formatIDR(27600000)}</div>
              <div className="flex items-center text-xs font-bold text-rose-500 gap-1">
                <TrendingUp size={12} /> +15.5% vs lalu
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: ROAS Sistem */}
        <div className="bg-[#0c1222] border border-purple-900/30 rounded-2xl p-5 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
           <div className="relative z-10 flex flex-col h-full justify-between gap-4">
             <div className="flex justify-between items-start">
               <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">ROAS Sistem</div>
               <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Target size={16} /></div>
             </div>
             <div>
               <div className="text-2xl font-black text-purple-400 mb-1">3.68 X</div>
               <div className="text-xs font-medium text-slate-500">
                 Target: 4.0 X
               </div>
             </div>
           </div>
        </div>

        {/* Card 5: Cost Per Closing (CPA) */}
        <div className="bg-[#0c1222] border border-orange-900/30 rounded-2xl p-5 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
           <div className="relative z-10 flex flex-col h-full justify-between gap-4">
             <div className="flex justify-between items-start">
               <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Cost Per Closing</div>
               <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg"><Crosshair size={16} /></div>
             </div>
             <div>
               <div className="text-2xl font-black text-orange-400 mb-1">{formatIDR(125400)}</div>
               <div className="flex items-center text-xs font-bold text-emerald-500 gap-1">
                 <TrendingDown size={12} /> -5.2% (Membaik)
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Line Chart & AI Insights Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Omzet vs Cost */}
        <div className="lg:col-span-2 bg-[#0c1222] border border-slate-800/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Pemasukan vs Pengeluaran</h3>
              <p className="text-slate-400 text-sm">Visualisasi perbandingan Omzet Kotor dan Biaya Ads (IDR).</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Sales
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div> Cost
              </div>
            </div>
          </div>
          <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dx={-10}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ fontWeight: 600 }}
                  formatter={(value: number, name: string) => [formatIDR(value), name === 'omzet' ? 'Sales' : 'Cost']}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="omzet" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOmzet)" />
                <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Tactical Insights Panel */}
        <div className="bg-[#0c1222] border border-slate-800/50 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-800/50 bg-gradient-to-r from-indigo-900/20 to-transparent flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" size={18} />
              AI Tactical Insights
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-sm font-bold text-rose-400 mb-1">ROAS Dibawah Target</h4>
                  <p className="text-xs text-rose-300 leading-relaxed">
                    ROAS saat ini (3.68) masih dibawah target KPI (4.0). Kampanye "Promo Akhir Bulan" menghabiskan 30% anggaran namun hanya menghasilkan 12% leads. <strong>Saran: Evaluasi atau pause kampanye tersebut.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-1">Tren CPA Membaik</h4>
                  <p className="text-xs text-emerald-300 leading-relaxed">
                    Cost per closing turun 5.2% dibandingkan minggu lalu. Mayoritas perbaikan berasal dari konversi admin "Ayu" yang meningkat 15%.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                 <svg className="text-blue-400 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                 </svg>
                <div>
                  <h4 className="text-sm font-bold text-blue-400 mb-1">Gap Validasi Omzet</h4>
                  <p className="text-xs text-blue-300 leading-relaxed">
                    Terdapat gap sebesar Rp 16.4 Juta antara Sales Form dan Aktual Transfer. Mohon tugaskan tim Finance untuk mempercepat verifikasi transfer di bank.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 border-t border-slate-800/50 text-center text-xs text-slate-500">
            Diperbarui secara real-time berdasarkan set filter.
          </div>
        </div>

      </div>
    </div>
  );
}
