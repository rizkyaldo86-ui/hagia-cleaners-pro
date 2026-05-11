import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  ChevronDown,
  Check,
  TrendingDown,
  Users,
  Target,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

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

export default function PdfMaker() {
  const [activeDateFilter, setActiveDateFilter] = useState("Bulan Ini");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    if (!reportRef.current) return;
    
    const element = reportRef.current;
    
    const opt = {
      margin:       ([10, 0, 10, 0] as [number, number, number, number]),
      filename:     `Laporan_Hagia_${activeDateFilter.replace(/ /g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const generateWord = () => {
    if (!reportRef.current) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + reportRef.current.innerHTML + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Laporan_Hagia_${activeDateFilter.replace(/ /g, '_')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-500 max-w-[1200px] mx-auto">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200 text-indigo-600">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">CETAK LAPORAN</h1>
            <p className="text-sm text-slate-500 font-medium">Pilih periode dan unduh format PDF A4.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
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
                  className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden origin-top-right"
                >
                  <div className="py-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {DATE_FILTERS.map(filter => (
                      <button
                        key={filter}
                        onClick={() => { setActiveDateFilter(filter); if (filter !== "Custom Tanggal") setShowDateFilter(false); }}
                        className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between ${activeDateFilter === filter ? "bg-[#e0f2fe] text-[#0069b4] font-bold" : "text-slate-600 hover:bg-slate-50"}`}
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
                        <input type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0069b4] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Sampai Tanggal</label>
                        <input type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0069b4] transition-colors" />
                      </div>
                      <button onClick={() => setShowDateFilter(false)} className="w-full bg-[#0069b4] hover:bg-[#005a9c] text-white rounded-xl py-3 text-sm font-bold transition-all shadow-lg mt-2">Terapkan</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={generateWord} className="flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm w-full sm:w-auto">
            <Download size={18} />
            Unduh DOC
          </button>
          <button onClick={generatePDF} className="flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm shadow-indigo-200 w-full sm:w-auto">
            <Printer size={18} />
            Cetak PDF A4
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-[#0a0f1d] p-4 sm:p-8 rounded-3xl border border-slate-800/50 relative">
         <div className="absolute top-4 left-4 text-slate-500 text-xs font-bold font-mono tracking-widest uppercase">Canvas Preview</div>
         
         <div 
           ref={reportRef} 
           className="bg-white mx-auto shadow-2xl shrink-0" 
           style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: '"Inter", sans-serif', color: '#1e293b' }}
         >
            <div className="flex justify-between items-end border-b-2 border-indigo-600 pb-6 mb-8">
               <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">LAPORAN KINERJA</h1>
                  <h2 className="text-4xl font-extrabold text-[#6366f1] tracking-tight leading-tight mb-2">MARKETING & SALES</h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hagia Pro Analytics</p>
               </div>
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Periode Analisis Data</p>
                  <p className="text-sm font-bold text-slate-800 mb-1">{activeDateFilter === 'Custom Tanggal' ? `${customDateStart || '-'} s/d ${customDateEnd || '-'}` : activeDateFilter}</p>
                  <p className="text-[9px] text-slate-400">Dicetak: {new Date().toLocaleString('id-ID')}</p>
               </div>
            </div>

            <div className="mb-10">
               <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                 <FileText size={18} />
                 <h3 className="uppercase tracking-wide">1. Ringkasan Eksekutif Finansial</h3>
               </div>
               <div className="grid grid-cols-5 gap-4">
                 <div className="col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider w-2/3">A. Performa Keseluruhan (Semua Sumber)</h4>
                      <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold"><TrendingDown size={12} /> -72.8%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-6">
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Sales</p><p className="text-2xl font-extrabold text-emerald-600">Rp 32.159.000</p></div>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total ROAS</p><p className="text-2xl font-extrabold text-indigo-600">0x</p></div>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cost / Closing (CPA)</p><p className="text-xl font-bold text-amber-600">Rp 0</p></div>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Ad Spend</p><p className="text-xl font-bold text-rose-600">Rp 0</p></div>
                    </div>
                 </div>
                 <div className="col-span-2 bg-[#f0f9ff] border border-blue-200 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-[#0284c7] uppercase tracking-wider mb-6">B. Performa Khusus Iklan WA</h4>
                    <div className="grid grid-cols-2 gap-y-6">
                       <div><p className="text-[10px] font-bold text-[#0ea5e9] uppercase mb-1">Sales Iklan</p><p className="text-xl font-extrabold text-[#0369a1]">Rp 6.597.000</p></div>
                       <div><p className="text-[10px] font-bold text-[#0ea5e9] uppercase mb-1">ROAS Iklan Saja</p><p className="text-xl font-extrabold text-[#0369a1]">0x</p></div>
                       <div><p className="text-[10px] font-bold text-[#0ea5e9] uppercase mb-1">CPA Iklan</p><p className="text-lg font-bold text-[#0369a1]">Rp 0</p></div>
                       <div><p className="text-[10px] font-bold text-[#0ea5e9] uppercase mb-1">Porsi vs Total Sales</p><p className="text-lg font-bold text-[#0369a1]">20.5%</p></div>
                    </div>
                 </div>
               </div>
            </div>

            <div className="mb-10">
               <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                 <Target size={18} />
                 <h3 className="uppercase tracking-wide">2. Komparasi Performa Layanan (Iklan vs Keseluruhan)</h3>
               </div>
               <table className="w-full text-left border-collapse bg-white">
                 <thead>
                   <tr className="border-b-2 border-slate-200">
                     <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Layanan</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">Sales Iklan WA</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">ROAS Iklan</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sales (Semua)</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total ROAS</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-rose-500 uppercase tracking-wider">Budget Iklan</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {[
                     { name: 'Hagia Bed', salesAd: 'Rp 529.000', roasAd: '0x', salesTotal: 'Rp 12.750.000', roasTotal: '0x', budget: 'Rp 0' },
                     { name: 'Hagia Living', salesAd: 'Rp 0', roasAd: '0x', salesTotal: 'Rp 3.233.000', roasTotal: '0x', budget: 'Rp 0' },
                     { name: 'Clean Mover', salesAd: 'Rp 5.010.000', roasAd: '0x', salesTotal: 'Rp 11.892.000', roasTotal: '0x', budget: 'Rp 0' },
                     { name: 'Hagia Auto', salesAd: 'Rp 1.058.000', roasAd: '0x', salesTotal: 'Rp 1.587.000', roasTotal: '0x', budget: 'Rp 0' },
                     { name: 'Lainnya', salesAd: 'Rp 0', roasAd: '0x', salesTotal: 'Rp 2.697.000', roasTotal: '0x', budget: 'Rp 0' },
                   ].map((row, i) => (
                     <tr key={i} className="border-b border-slate-100">
                       <td className="py-2.5 px-4 font-semibold text-slate-800">{row.name}</td>
                       <td className="py-2.5 px-4 font-medium text-[#0284c7]">{row.salesAd}</td>
                       <td className="py-2.5 px-4 font-bold text-[#0284c7]">{row.roasAd}</td>
                       <td className="py-2.5 px-4 font-medium text-emerald-600">{row.salesTotal}</td>
                       <td className="py-2.5 px-4 font-medium text-slate-600">{row.roasTotal}</td>
                       <td className="py-2.5 px-4 font-medium text-rose-500">{row.budget}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="mb-10 page-break-before">
               <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                 <FileText size={18} />
                 <h3 className="uppercase tracking-wide">3. Tabel Detail Agregasi Master (Semua Sumber)</h3>
               </div>
               <div className="rounded-xl overflow-hidden border border-emerald-500">
                 <div className="bg-emerald-500 text-white font-bold text-center py-2 text-sm">TOTAL KESELURUHAN (MASTER ALL)</div>
                 <table className="w-full text-center text-xs">
                   <thead className="bg-emerald-400 text-white text-[10px] uppercase font-bold">
                     <tr><th className="py-2 px-2 text-left">Layanan</th><th className="py-2 px-2">Bed</th><th className="py-2 px-2">Living</th><th className="py-2 px-2">Clean Mover</th><th className="py-2 px-2">Auto</th><th className="py-2 px-2">Lainnya</th><th className="py-2 px-2">Total</th></tr>
                   </thead>
                   <tbody>
                     <tr className="border-b border-slate-200">
                       <td className="py-2.5 px-2 text-left font-bold text-slate-800">Sales Closing</td><td className="py-2.5 px-2 font-bold text-emerald-600">Rp 12.750.000</td><td className="py-2.5 px-2 font-bold text-emerald-600">Rp 3.233.000</td><td className="py-2.5 px-2 font-bold text-emerald-600">Rp 11.892.000</td><td className="py-2.5 px-2 font-bold text-emerald-600">Rp 1.587.000</td><td className="py-2.5 px-2 font-bold text-emerald-600">Rp 2.697.000</td><td className="py-2.5 px-2 font-bold text-emerald-700 bg-emerald-50">Rp 32.159.000</td>
                     </tr>
                     <tr className="border-b border-slate-200 bg-rose-50/30">
                       <td className="py-2 px-2 text-left font-bold text-slate-800">Budget Iklan</td><td className="py-2 px-2 font-medium text-rose-500">Rp 0</td><td className="py-2 px-2 font-medium text-rose-500">Rp 0</td><td className="py-2 px-2 font-medium text-rose-500">Rp 0</td><td className="py-2 px-2 font-medium text-rose-500">Rp 0</td><td className="py-2 px-2 font-medium text-rose-500">Rp 0</td><td className="py-2 px-2 font-bold text-rose-600">Rp 0</td>
                     </tr>
                     <tr className="border-b border-slate-200">
                       <td className="py-2 px-2 text-left font-bold text-slate-800">Roas</td><td className="py-2 px-2 font-bold text-slate-800">0x</td><td className="py-2 px-2 font-bold text-slate-800">0x</td><td className="py-2 px-2 font-bold text-slate-800">0x</td><td className="py-2 px-2 font-bold text-slate-800">0x</td><td className="py-2 px-2 font-bold text-slate-800">0x</td><td className="py-2 px-2 font-bold text-slate-900 bg-slate-50">0x</td>
                     </tr>
                     <tr className="border-b border-slate-200">
                       <td className="py-2 px-2 text-left font-bold text-slate-800">Lead Keseluruhan</td><td className="py-2 px-2 font-medium text-slate-600">129</td><td className="py-2 px-2 font-medium text-slate-600">44</td><td className="py-2 px-2 font-medium text-slate-600">204</td><td className="py-2 px-2 font-medium text-slate-600">102</td><td className="py-2 px-2 font-medium text-slate-600">50</td><td className="py-2 px-2 font-bold text-slate-800">529</td>
                     </tr>
                     <tr className="bg-rose-500 text-white">
                       <td className="py-2 px-2 text-left font-bold">Lead Luar Kota & Spam</td><td className="py-2 px-2 font-medium">2</td><td className="py-2 px-2 font-medium">2</td><td className="py-2 px-2 font-medium">32</td><td className="py-2 px-2 font-medium">19</td><td className="py-2 px-2 font-medium">19</td><td className="py-2 px-2 font-bold">74</td>
                     </tr>
                     <tr className="border-b border-slate-200">
                       <td className="py-2.5 px-2 text-left font-bold text-[#0069b4]">Lead Closing</td><td className="py-2.5 px-2 font-bold text-[#0069b4]">15</td><td className="py-2.5 px-2 font-bold text-[#0069b4]">5</td><td className="py-2.5 px-2 font-bold text-[#0069b4]">4</td><td className="py-2.5 px-2 font-bold text-[#0069b4]">3</td><td className="py-2.5 px-2 font-bold text-[#0069b4]">3</td><td className="py-2.5 px-2 font-bold text-[#005a9c] bg-blue-50/50">30</td>
                     </tr>
                     <tr>
                       <td className="py-2 px-2 text-left font-bold text-slate-800">Closing Rate</td><td className="py-2 px-2 font-medium text-slate-600">11.6%</td><td className="py-2 px-2 font-medium text-slate-600">11.4%</td><td className="py-2 px-2 font-medium text-slate-600">2.0%</td><td className="py-2 px-2 font-medium text-slate-600">2.9%</td><td className="py-2 px-2 font-medium text-slate-600">6.0%</td><td className="py-2 px-2 font-bold text-slate-800">5.7%</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            <div className="mb-10">
               <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                 <Users size={18} />
                 <h3 className="uppercase tracking-wide">4. Analisa Kualitas & Konversi Leads</h3>
               </div>
               <table className="w-full text-left border border-slate-200 mb-6">
                 <thead>
                   <tr className="border-b-2 border-slate-200 bg-slate-50">
                     <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Layanan</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">Lead Iklan WA</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">CR Iklan WA</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Leads (Semua)</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total CR</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-rose-500 uppercase tracking-wider">Lead Wasted (Luar Kota)</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {[
                     { name: 'Hagia Bed', leadWA: '68', crWA: '1.5%', leadAll: '129', crAll: '11.6%', wasted: '2 (2%)' },
                     { name: 'Hagia Living', leadWA: '27', crWA: '0.0%', leadAll: '44', crAll: '11.4%', wasted: '2 (5%)' },
                     { name: 'Clean Mover', leadWA: '160', crWA: '1.3%', leadAll: '204', crAll: '2.0%', wasted: '32 (16%)' },
                     { name: 'Hagia Auto', leadWA: '90', crWA: '2.2%', leadAll: '102', crAll: '2.9%', wasted: '19 (19%)' },
                     { name: 'Lainnya', leadWA: '10', crWA: '0.0%', leadAll: '50', crAll: '6.0%', wasted: '19 (38%)' },
                   ].map((row, i) => (
                     <tr key={i} className="border-b border-slate-100">
                       <td className="py-2.5 px-4 font-semibold text-slate-800">{row.name}</td>
                       <td className="py-2.5 px-4 font-bold text-[#0284c7]">{row.leadWA}</td>
                       <td className="py-2.5 px-4 font-medium text-[#0284c7]">{row.crWA}</td>
                       <td className="py-2.5 px-4 font-medium text-slate-800">{row.leadAll}</td>
                       <td className="py-2.5 px-4 font-medium text-slate-600">{row.crAll}</td>
                       <td className="py-2.5 px-4 font-medium text-rose-500">{row.wasted}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>

               <div className="grid grid-cols-2 gap-6">
                 <div className="border border-emerald-200 rounded-2xl overflow-hidden">
                    <div className="bg-emerald-50 py-3 px-4 flex items-center gap-2 border-b border-emerald-100">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Sumber Lead Closing (Deal)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                       {[{ label: 'Instagram & DM', value: '12 Deal' }, { label: 'Lead Drop / WA Kosong', value: '9 Deal' }, { label: 'Iklan Meta WA', value: '5 Deal' }, { label: 'Database Existing', value: '3 Deal' }, { label: 'Organik Web/SEO', value: '1 Deal' }].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-sm">
                           <span className="text-slate-600 font-medium">{item.label}</span><span className="text-emerald-600 font-bold">{item.value}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="border border-indigo-200 rounded-2xl overflow-hidden">
                    <div className="bg-indigo-50 py-3 px-4 flex items-center gap-2 border-b border-indigo-100">
                      <MapPin size={16} className="text-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Top Area Closing (Deal)</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                       {[{ label: 'Jakarta', value: '20 Deal' }, { label: 'Tangsel', value: '7 Deal' }, { label: 'Bogor', value: '1 Deal' }, { label: 'Depok', value: '1 Deal' }, { label: 'Bekasi', value: '1 Deal' }].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-sm" style={i === 0 ? {gridColumn: '1 / -1'} : {}}>
                           <span className="text-slate-600 font-medium">{item.label}</span><span className="text-indigo-600 font-bold">{item.value}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

            <div className="mb-10 page-break-before">
               <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                 <Target size={18} />
                 <h3 className="uppercase tracking-wide">5. Detail Pelaporan Meta Ads (Kesehatan Kampanye)</h3>
               </div>
               <div className="grid grid-cols-4 gap-4 mb-4">
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Impresi</p><p className="text-xl font-bold text-slate-800">0</p></div>
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Reach</p><p className="text-xl font-bold text-slate-800">0</p></div>
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Klik Tautan (Semua)</p><p className="text-xl font-bold text-slate-800">0</p></div>
                 <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl"><p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Leads Iklan WA</p><p className="text-xl font-extrabold text-emerald-700">356</p></div>
               </div>
               <div className="grid grid-cols-4 gap-4">
                 <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl"><p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Rata-Rata CTR</p><p className="text-lg font-bold text-indigo-800">0.00%</p></div>
                 <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl"><p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-2">Rata-Rata CPC</p><p className="text-lg font-bold text-rose-800">Rp 0</p></div>
                 <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl"><p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Rata-Rata CPM</p><p className="text-lg font-bold text-amber-800">Rp 0</p></div>
                 <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl"><p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2">Rata-Rata CPR</p><p className="text-lg font-bold text-purple-800">Rp 0</p></div>
               </div>
            </div>



            <div className="mb-10">
               <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                 <MapPin size={18} />
                 <h3 className="uppercase tracking-wide">6. Ringkasan Demografi & Sumber Leads</h3>
               </div>
               <div className="grid grid-cols-2 gap-6 mb-6">
                 <div className="border border-slate-200 rounded-2xl p-5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-5">A. Sumber Lalu Lintas (Trafik)</h4>
                    <div className="space-y-3">
                       {[{ label: 'Iklan Saja', value: '355 Leads', color: 'text-indigo-600' }, { label: 'IG DM/WA', value: '104 Leads', color: 'text-indigo-600' }, { label: 'WA Kosong', value: '54 Leads', color: 'text-indigo-600' }, { label: 'Organik', value: '13 Leads', color: 'text-indigo-600' }, { label: 'Database Existing', value: '3 Leads', color: 'text-indigo-600' }, { label: 'Blast Existing', value: '0 Leads', color: 'text-indigo-600' }].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">{item.label}</span><span className={`font-bold ${item.color}`}>{item.value}</span></div>
                       ))}
                       <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center text-sm"><span className="text-slate-800 font-bold uppercase">Total Keseluruhan Leads</span><span className="text-indigo-800 font-bold">529</span></div>
                    </div>
                 </div>
                 <div className="border border-slate-200 rounded-2xl p-5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-5">B. Top 10 Lokasi Prospek</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                       {[{ label: 'Tidak Diketahui', value: '365 org' }, { label: 'Jakarta', value: '51 org' }, { label: 'Tangerang', value: '44 org' }, { label: 'Luar Kota', value: '33 org' }, { label: 'Bogor', value: '12 org' }, { label: 'Bekasi', value: '12 org' }, { label: 'Depok', value: '11 org' }, { label: 'Cibubur', value: '1 org' }].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-xs" style={i === 0 ? {gridColumn: '1 / -1', marginBottom: '8px'} : {}}><span className="text-slate-600 font-medium">{item.label}</span><span className="text-emerald-600 font-bold">{item.value}</span></div>
                       ))}
                    </div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center">
                   <div><p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Total Terkonversi</p><p className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider">Berhasil Deal / Closing</p></div><p className="text-2xl font-extrabold text-emerald-700">30</p>
                 </div>
                 <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex justify-between items-center">
                   <div><p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">Total Dropoff</p><p className="text-[9px] text-rose-600 font-medium uppercase tracking-wider">WA Kosong / Batal</p></div><p className="text-2xl font-extrabold text-rose-700">54</p>
                 </div>
               </div>
            </div>

            <div className="mb-10 relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-full"></div>
               <div className="pl-6">
                 <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                   <AlertCircle size={18} />
                   <h3 className="uppercase tracking-wide">8. Temuan & Analisa Sistem Otomatis</h3>
                 </div>
                 <div className="space-y-4">
                   <p className="text-sm text-slate-700"><strong className="text-emerald-700"> Dominasi Organik (Periode Custom):</strong> Tercatat omzet sebesar Rp 32.159.000 masuk tanpa adanya pengeluaran iklan Meta (Rp0). Penjualan sepenuhnya didorong oleh leads organik atau follow up database existing.</p>
                   <p className="text-sm text-slate-700"><strong className="text-emerald-700"> Kualitas Intensi Audiens:</strong> Kebocoran prospek berada pada persentase yang rendah dan aman (10.2%). Ini membuktikan target audiens sudah pas dan memiliki niat beli yang tinggi.</p>
                   <p className="text-sm text-slate-700"><strong className="text-rose-700"> Evaluasi Konversi Tim CS:</strong> Tingkat Closing Rate (CR) jatuh di angka 5.7%. Terlalu banyak prospek yang gagal disepakati. Tinjau kembali cara CS membalas (Handling Objection) ini darurat.</p>
                 </div>
               </div>
            </div>

            <div className="mt-16 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400">Dicetak melalui Hagia Pro Analytics &copy; {new Date().getFullYear()}</p>
            </div>

         </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: ` .page-break-before { page-break-before: always; } `}} />
    </div>
  );
}
