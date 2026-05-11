import React, { useState } from 'react';
import { Sparkles, RefreshCw, Calendar, Calculator, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SERVICES = ['Bed', 'Living', 'Clean Mover', 'Auto', 'Lainnya', 'Total'];

const DATE_FILTERS = [
  "Semua Waktu",
  "Hari Ini",
  "Kemarin",
  "3 Hari Terakhir",
  "7 Hari Terakhir",
  "Minggu Ini",
  "Bulan Ini",
  "Bulan Lalu",
  "Semua Bulan",
  "Custom Tanggal"
];

export default function RoasReport() {
  const [activeDateFilter, setActiveDateFilter] = useState("Semua Waktu");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">ANALYTICS HAGIA</h1>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/30">
           <Sparkles size={18} /> Tanya Asisten AI
        </button>
      </div>

      {/* Date Filters & Sync */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        {/* Advanced Date Filter Dropdown */}
        <div className="relative w-full sm:w-auto z-40">
           <button 
             onClick={() => setShowDateFilter(!showDateFilter)}
             className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto bg-white border border-slate-300 hover:border-[#0069b4] rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 transition-all shadow-sm"
           >
             <div className="flex items-center gap-2">
               <Calendar size={18} className="text-[#0069b4]" />
               <span className="min-w-[120px] text-left">{activeDateFilter}</span>
             </div>
             <ChevronDown size={16} className={`text-slate-400 transition-transform ${showDateFilter ? "rotate-180" : ""}`} />
           </button>
           
           <AnimatePresence>
             {showDateFilter && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 transition={{ duration: 0.15 }}
                 className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden origin-top-left"
               >
                 <div className="py-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                   {DATE_FILTERS.map(filter => (
                     <button
                       key={filter}
                       onClick={() => {
                         setActiveDateFilter(filter);
                         if (filter !== "Custom Tanggal") setShowDateFilter(false);
                       }}
                       className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between ${
                         activeDateFilter === filter 
                           ? "bg-[#e0f2fe] text-[#0069b4] font-bold" 
                           : "text-slate-600 hover:bg-slate-50"
                       }`}
                     >
                       {filter}
                       {activeDateFilter === filter && <Check size={16} />}
                     </button>
                   ))}
                 </div>
                 {activeDateFilter === "Custom Tanggal" && (
                   <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
                     <div>
                       <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Dari Tanggal</label>
                       <input 
                         type="date" 
                         value={customDateStart} 
                         onChange={e => setCustomDateStart(e.target.value)} 
                         className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0069b4] transition-colors" 
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Sampai Tanggal</label>
                       <input 
                         type="date" 
                         value={customDateEnd} 
                         onChange={e => setCustomDateEnd(e.target.value)} 
                         className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0069b4] transition-colors" 
                       />
                     </div>
                     <button 
                       onClick={() => setShowDateFilter(false)} 
                       className="w-full bg-[#0069b4] hover:bg-[#005a9c] text-white rounded-xl py-3 text-sm font-bold transition-all shadow-lg mt-2"
                     >
                       Terapkan Range Waktu
                     </button>
                   </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <button className="flex items-center gap-2 p-3 sm:px-5 sm:py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-2xl transition-all shadow-sm">
           <RefreshCw size={18} className="text-[#0069b4]" />
           <span className="font-bold text-sm hidden sm:inline">Refresh Data</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm">
         <div className="w-16 h-16 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shadow-inner">
            <Calculator size={32} />
         </div>
         <div>
            <h2 className="text-xl font-black text-slate-800">TABEL AGREGASI ROAS & LAYANAN</h2>
            <p className="text-sm text-slate-500 mt-1">
              Data otomatis ditarik dan digabungkan dari Menu Database Iklan (Budget) dan Database Leads (Sales/Closing).
            </p>
         </div>
      </div>

      {/* Tables Container */}
      <div className="space-y-8">
         <RoasTable 
            title="KESELURUHAN IKLAN (SAJA)"
            color="emerald"
            data={[
              { label: 'Sales Closing', values: ['Rp 529.000', 'Rp 0', 'Rp 5.010.000', 'Rp 1.058.000', 'Rp 0', 'Rp 6.597.000'], textClass: 'text-emerald-600 font-bold' },
              { label: 'Budget Iklan', values: ['Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0'], textClass: 'text-rose-500' },
              { label: 'Roas', values: ['0x', '0x', '0x', '0x', '0x', '0x'] },
              { label: 'Lead Keseluruhan', values: ['68', '27', '160', '90', '10', '355'] },
              { label: 'Lead Terjangkau', values: ['66', '26', '128', '71', '6', '297'] },
              { label: 'Lead Luar Kota & Spam', values: ['2', '1', '32', '19', '4', '58'], rowClass: 'bg-rose-500 text-white border-rose-600', textClass: 'text-white font-bold' },
              { label: 'Lead Closing', values: ['1', '0', '2', '2', '0', '5'], textClass: 'text-blue-600 font-bold' },
              { label: 'Closing Rate', values: ['1.5%', '0.0%', '1.3%', '2.2%', '0.0%', '1.4%'] }
            ]}
         />

         <RoasTable 
            title="KESELURUHAN INSTAGRAM WA & DM"
            color="emerald"
            data={[
              { label: 'Sales Closing', values: ['Rp 3.685.000', 'Rp 2.349.000', 'Rp 0', 'Rp 529.000', 'Rp 798.000', 'Rp 7.361.000'], textClass: 'text-emerald-600 font-bold' },
              { label: 'Lead Keseluruhan', values: ['38', '11', '31', '10', '14', '104'] },
              { label: 'Lead Luar Kota & Spam', values: ['0', '1', '0', '0', '3', '4'], rowClass: 'bg-rose-500 text-white border-rose-600', textClass: 'text-white font-bold' },
              { label: 'Lead Closing', values: ['7', '3', '0', '1', '1', '12'], textClass: 'text-blue-600 font-bold' },
              { label: 'Closing Rate', values: ['18.4%', '27.3%', '0.0%', '10.0%', '7.1%', '11.5%'] }
            ]}
         />

         <RoasTable 
            title="KESELURUHAN ORGANIK"
            color="emerald"
            data={[
              { label: 'Sales Closing', values: ['Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 1.500.000', 'Rp 1.500.000'], textClass: 'text-emerald-600 font-bold' },
              { label: 'Lead Keseluruhan', values: ['6', '1', '1', '0', '5', '13'] },
              { label: 'Lead Luar Kota & Spam', values: ['0', '0', '0', '0', '1', '1'], rowClass: 'bg-rose-500 text-white border-rose-600', textClass: 'text-white font-bold' },
              { label: 'Lead Closing', values: ['0', '0', '0', '0', '1', '1'], textClass: 'text-blue-600 font-bold' },
              { label: 'Closing Rate', values: ['0.0%', '0.0%', '0.0%', '0.0%', '20.0%', '7.7%'] }
            ]}
         />

         <RoasTable 
            title="KESELURUHAN WA KOSONG"
            color="emerald"
            data={[
              { label: 'Sales Closing', values: ['Rp 7.478.000', 'Rp 749.000', 'Rp 6.882.000', 'Rp 0', 'Rp 399.000', 'Rp 15.508.000'], textClass: 'text-emerald-600 font-bold' },
              { label: 'Lead Keseluruhan', values: ['15', '4', '12', '2', '21', '54'] },
              { label: 'Lead Luar Kota & Spam', values: ['0', '0', '0', '0', '11', '11'], rowClass: 'bg-rose-500 text-white border-rose-600', textClass: 'text-white font-bold' },
              { label: 'Lead Closing', values: ['5', '1', '2', '0', '1', '9'], textClass: 'text-blue-600 font-bold' },
              { label: 'Closing Rate', values: ['33.3%', '25.0%', '16.7%', '0.0%', '4.8%', '16.7%'] }
            ]}
         />

         <RoasTable 
            title="TOTAL KESELURUHAN EXISTING"
            color="blue"
            data={[
              { label: 'Sales Closing', values: ['Rp 1.058.000', 'Rp 135.000', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 1.193.000'], textClass: 'text-emerald-600 font-bold' },
              { label: 'Lead Keseluruhan', values: ['2', '1', '0', '0', '0', '3'] },
              { label: 'Lead Luar Kota & Spam', values: ['0', '0', '0', '0', '0', '0'], rowClass: 'bg-rose-500 text-white border-rose-600', textClass: 'text-white font-bold' },
              { label: 'Lead Closing', values: ['2', '1', '0', '0', '0', '3'], textClass: 'text-blue-600 font-bold' },
              { label: 'Closing Rate', values: ['100.0%', '100.0%', '0.0%', '0.0%', '0.0%', '100.0%'] }
            ]}
         />

         <RoasTable 
            title="TOTAL KESELURUHAN BLAST EXISTING"
            color="blue"
            data={[
              { label: 'Sales Closing', values: ['Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0'], textClass: 'text-emerald-600 font-bold' },
              { label: 'Lead Keseluruhan', values: ['0', '0', '0', '0', '0', '0'] },
              { label: 'Lead Luar Kota & Spam', values: ['0', '0', '0', '0', '0', '0'], rowClass: 'bg-rose-500 text-white border-rose-600', textClass: 'text-white font-bold' },
              { label: 'Lead Closing', values: ['0', '0', '0', '0', '0', '0'], textClass: 'text-blue-600 font-bold' },
              { label: 'Closing Rate', values: ['0.0%', '0.0%', '0.0%', '0.0%', '0.0%', '0.0%'] }
            ]}
         />

         <RoasTable 
            title="TOTAL KESELURUHAN (MASTER ALL)"
            color="emerald"
            data={[
              { label: 'Sales Closing', values: ['Rp 12.750.000', 'Rp 3.233.000', 'Rp 11.892.000', 'Rp 1.587.000', 'Rp 2.697.000', 'Rp 32.159.000'], textClass: 'text-emerald-600 font-bold' },
              { label: 'Budget Iklan', values: ['Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0'], textClass: 'text-rose-500' },
              { label: 'Roas', values: ['0x', '0x', '0x', '0x', '0x', '0x'] },
              { label: 'Lead Keseluruhan', values: ['129', '44', '204', '102', '50', '529'] },
              { label: 'Lead Terjangkau', values: ['127', '42', '172', '83', '31', '455'] },
              { label: 'Lead Luar Kota & Spam', values: ['2', '2', '32', '19', '19', '74'], rowClass: 'bg-rose-500 text-white border-rose-600', textClass: 'text-white font-bold' },
              { label: 'Lead Closing', values: ['15', '5', '4', '3', '3', '30'], textClass: 'text-blue-600 font-bold' },
              { label: 'Closing Rate', values: ['11.6%', '11.4%', '2.0%', '2.9%', '6.0%', '5.7%'] },
              { label: 'CPR', values: ['Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0', 'Rp 0'] },
              { label: 'AOV', values: ['Rp 850.000', 'Rp 646.600', 'Rp 2.973.000', 'Rp 529.000', 'Rp 899.000', 'Rp 1.071.967'] }
            ]}
         />
      </div>

    </div>
  );
}

function RoasTable({ title, color, data }: { title: string, color: 'emerald' | 'blue', data: any[] }) {
  const headerColor = color === 'emerald' ? 'bg-[#10b981]' : 'bg-[#3b82f6]';
  
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Title Bar */}
      <div className={`${headerColor} text-white text-center py-4 px-4`}>
         <h3 className="font-black text-sm md:text-base uppercase tracking-wider">{title}</h3>
      </div>
      
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-xs md:text-sm">
          <thead>
            <tr className={`${headerColor} text-white border-t border-white/20`}>
              <th className="py-3 px-4 text-left font-bold border-r border-white/20">Layanan</th>
              {SERVICES.map((s, i) => (
                <th key={s} className={`py-3 px-2 md:px-4 font-bold ${i !== SERVICES.length - 1 ? 'border-r border-white/20' : ''}`}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className={`${row.rowClass || 'hover:bg-slate-50 transition-colors'}`}>
                <td className={`py-3 px-4 text-left font-bold ${row.rowClass ? 'border-slate-800/10' : 'text-slate-600'} border-r border-slate-100`}>
                  {row.label}
                </td>
                {row.values.map((v: string, i: number) => (
                  <td key={i} className={`py-3 px-2 md:px-4 ${row.textClass || 'text-slate-700 font-medium'} ${i !== row.values.length - 1 ? 'border-r border-slate-100' : ''}`}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
