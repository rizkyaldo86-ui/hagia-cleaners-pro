import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Download, MapPin, Eye, Star, Clock, Image as ImageIcon } from 'lucide-react';

export default function DocsSPK() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const [data, setData] = useState<any[]>(() => {
    const saved = localStorage.getItem('hagia-dokumentasi-spk');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const safeLowerCase = (val: any) => typeof val === 'string' ? val.toLowerCase() : '';

  const processedData = data.filter(row => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return Object.values(row).some(val => safeLowerCase(val).includes(searchLower));
  })
  .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  
  const totalPages = Math.max(1, Math.ceil(processedData.length / rowsPerPage));
  const paginatedData = processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExport = () => {
    const columns = [
      'ID Booking', 'Tanggal', 'Nama Tim', 'Teknisi', 'Customer', 'Waktu Tiba', 'Koordinat',
      'Layanan', 'Metode', 'Kondisi Awal', 'Catatan', 'Waktu Selesai', 'Durasi', 'Rating'
    ];
    
    const csvContent = [
      columns.join(','),
      ...processedData.map(row => [
        row.id, row.tanggal, row.namaTim, row.namaOperasional, row.namaCustomer,
        row.waktuTiba, row.koordinatTiba, row.layananDikerjakan || row.layanan, row.metodePembersihan,
        row.kondisiAwal?.replace(/"/g, '""'), row.catatanTeknisi?.replace(/"/g, '""'),
        row.waktuSelesai, row.durasiTotal, row.ratingKepuasan
      ].map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dokumentasi_spk_hagia.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <ClipboardList size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dokumentasi SPK (Brankas Laporan)</h2>
            <p className="text-slate-400 text-xs mt-1">
              Arsip digital hasil pengerjaan tim lapangan terintegrasi secara Real-Time.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10"></div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <button 
          onClick={handleExport}
          className="bg-white hover:bg-slate-100 text-[#0f172a] px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
        >
          <Download size={18} />
          Eksport Data
        </button>

        <div className="relative flex-1 xl:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari ID, teknisi, customer..." 
            className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f172a]">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID & Customer</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tim & Waktu</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Layanan & Metode</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Durasi</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dokumentasi & TTD</th>
                <th className="p-4 text-xs font-bold text-center text-slate-400 uppercase tracking-wider">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                     <div className="font-mono text-xs text-sky-400 font-bold">{row.id}</div>
                     <div className="font-bold text-white mt-1 text-sm">{row.namaCustomer}</div>
                     <div className="text-[10px] text-slate-500 mt-1">{row.tanggal}</div>
                  </td>
                  <td className="p-4">
                     <div className="text-sm text-white font-medium">{row.namaTim}</div>
                     <div className="text-xs text-slate-400">{row.namaOperasional}</div>
                     <div className="text-xs text-slate-500 mt-1 font-mono flex flex-col gap-0.5">
                        <span className="text-emerald-400/80">IN: {row.waktuTiba}</span>
                        <span className="text-rose-400/80">OUT: {row.waktuSelesai}</span>
                     </div>
                  </td>
                  <td className="p-4">
                     <div className="text-sm text-slate-300 max-w-[200px] truncate">{row.layananDikerjakan || row.layanan}</div>
                     <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {row.metodePembersihan}
                     </span>
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-1.5 text-sm text-slate-300 font-mono">
                        <Clock size={14} className="text-sky-400"/> {row.durasiTotal}
                     </div>
                  </td>
                  <td className="p-4">
                     <button onClick={() => setSelectedDoc(row)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700">
                        <Eye size={14} /> LIHAT BUKTI
                     </button>
                  </td>
                  <td className="p-4 text-center">
                     <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                        <Star size={14} className="text-amber-400" fill="currentColor"/>
                        <span className="text-amber-400 font-bold text-sm">{row.ratingKepuasan}</span>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Belum ada dokumentasi SPK.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
           Menampilkan {paginatedData.length} dari {processedData.length} data
        </div>
      </div>

      {/* Modal Detail Dokumentasi */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <ClipboardList className="text-emerald-400" /> BAST & Laporan: {selectedDoc.id}
              </h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-xl">
                 Tutup
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
               
               {/* 1. Header Info */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
                     <div className="text-xs text-slate-500 mb-1">Customer</div>
                     <div className="font-bold text-white">{selectedDoc.namaCustomer}</div>
                  </div>
                  <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
                     <div className="text-xs text-slate-500 mb-1">Tim & Teknisi</div>
                     <div className="font-bold text-white">{selectedDoc.namaTim}</div>
                     <div className="text-sm text-slate-400 truncate">{selectedDoc.namaOperasional}</div>
                  </div>
                  <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 col-span-2">
                     <div className="text-xs text-slate-500 mb-1">Layanan</div>
                     <div className="font-bold text-white">{selectedDoc.layananDikerjakan || selectedDoc.layanan}</div>
                     <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {selectedDoc.metodePembersihan}
                     </div>
                  </div>
               </div>

               {/* 2. Timeline */}
               <div className="flex gap-4 items-center bg-[#1e293b] p-4 rounded-2xl border border-slate-700">
                  <div className="flex-1 text-center">
                     <div className="text-xs text-slate-500">Tiba di Lokasi</div>
                     <div className="font-mono text-lg font-bold text-emerald-400">{selectedDoc.waktuTiba}</div>
                     <a href={selectedDoc.koordinatTiba} target="_blank" rel="noreferrer" className="text-[10px] text-sky-400 flex items-center justify-center gap-1 mt-1 hover:underline"><MapPin size={10}/> Cek GPS Tiba</a>
                  </div>
                  <div className="text-slate-600">→</div>
                  <div className="flex-1 text-center">
                     <div className="text-xs text-slate-500">Durasi</div>
                     <div className="font-mono text-sm font-bold text-slate-300 py-1">{selectedDoc.durasiTotal}</div>
                  </div>
                  <div className="text-slate-600">→</div>
                  <div className="flex-1 text-center">
                     <div className="text-xs text-slate-500">Selesai</div>
                     <div className="font-mono text-lg font-bold text-rose-400">{selectedDoc.waktuSelesai}</div>
                  </div>
               </div>

               {/* 3. Photos */}
               <div>
                 <h4 className="font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2"><ImageIcon size={18}/> Dokumentasi Visual</h4>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <div className="bg-rose-500/20 text-rose-400 text-center py-1.5 font-bold text-xs rounded-t-xl border border-b-0 border-rose-500/30">KONDISI SEBELUM</div>
                       <div className="aspect-square bg-black border border-slate-700 rounded-b-xl overflow-hidden shadow-inner">
                         {selectedDoc.fotoSebelum ? (
                            <img src={selectedDoc.fotoSebelum} alt="Sebelum" className="w-full h-full object-contain" />
                         ) : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Image</div>}
                       </div>
                    </div>
                    <div>
                       <div className="bg-emerald-500/20 text-emerald-400 text-center py-1.5 font-bold text-xs rounded-t-xl border border-b-0 border-emerald-500/30">KONDISI SESUDAH</div>
                       <div className="aspect-square bg-black border border-slate-700 rounded-b-xl overflow-hidden shadow-inner">
                         {selectedDoc.fotoSesudah ? (
                            <img src={selectedDoc.fotoSesudah} alt="Sesudah" className="w-full h-full object-contain" />
                         ) : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Image</div>}
                       </div>
                    </div>
                 </div>
               </div>

               {/* 4. Notes */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1e293b] p-4 rounded-xl border border-rose-500/30">
                     <div className="text-xs font-bold text-rose-400 mb-2">Kondisi Awal / Temuan Cacat:</div>
                     <p className="text-sm text-slate-300 italic whitespace-pre-wrap">{selectedDoc.kondisiAwal || '-'}</p>
                  </div>
                  <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
                     <div className="text-xs font-bold text-slate-400 mb-2">Catatan Teknisi:</div>
                     <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedDoc.catatanTeknisi || '-'}</p>
                  </div>
               </div>

               {/* 5. Signature & Rating */}
               <div className="bg-gradient-to-r from-slate-800 to-[#1e293b] p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center gap-4">
                  <div className="text-center">
                     <div className="text-sm text-slate-400 mb-1">Rating Kepuasan</div>
                     <div className="flex gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} size={24} className={i < parseInt(selectedDoc.ratingKepuasan) ? "text-amber-400" : "text-slate-600"} fill={i < parseInt(selectedDoc.ratingKepuasan) ? "currentColor" : "none"} />
                        ))}
                     </div>
                  </div>

                  <div className="w-full max-w-sm mt-4">
                     <div className="text-xs text-center text-slate-500 tracking-widest uppercase mb-2">Tanda Tangan Pelanggan</div>
                     <div className="bg-[#0f172a] h-32 border border-slate-600 rounded-xl overflow-hidden flex items-center justify-center relative">
                        {selectedDoc.tandaTanganPelanggan && selectedDoc.tandaTanganPelanggan.length > 50 ? (
                           <img src={selectedDoc.tandaTanganPelanggan} className="h-full object-contain filter invert opacity-80" alt="TTD" />
                        ) : (
                           <span className="text-slate-600 text-xs">-</span>
                        )}
                        <div className="absolute bottom-2 right-4 text-[8px] text-slate-600 font-mono">SAH & TERVERIFIKASI</div>
                     </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
