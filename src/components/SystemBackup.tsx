import React, { useState } from 'react';
import { 
  HardDrive, 
  Download, 
  Upload, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  ShieldCheck,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SystemBackup() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ type: 'error' | 'warning' | 'success', message: string }[] | null>(null);
  const [showWipeDialog, setShowWipeDialog] = useState(false);

  const runDiagnostics = () => {
    setIsScanning(true);
    setScanResults(null);
    
    // Simulate diagnostic scan
    setTimeout(() => {
      setIsScanning(false);
      setScanResults([
        { type: 'error', message: 'Baris Kehilangan Tanggal: Ditemukan 2 entri pada Database Leads tanpa format tanggal yang valid.' },
        { type: 'warning', message: 'Integritas Relasi Data: Terdapat selisih Revenue, Lead #882 pada Database Leads bernilai Rp 1.500.000 tetapi Data Closing bernilai Rp 0.' },
        { type: 'success', message: 'Tipe Data & Rumus: Status aman, tidak ada NaN atau Infinity calculation error.' }
      ]);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-5">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 shrink-0">
          <HardDrive size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            SISTEM & BACKUP <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">Super Admin Only</span>
          </h1>
          <p className="text-slate-500 font-medium">Cadangkan pangkalan data, pulihkan, dan pindai kesehatan integritas logika.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup & Restore Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-6">
            <Download size={20} />
            <h2 className="uppercase tracking-wide">BACKUP & RESTORE DATA</h2>
          </div>

          <div className="space-y-8">
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <FileJson size={80} />
               </div>
               <div className="relative z-10">
                 <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Download size={16} /> 1. Download Backup
                 </h3>
                 <p className="text-sm text-slate-600 mb-4 pr-10">
                   Unduh seluruh isi memori aplikasi. Sangat disarankan dilakukan seminggu sekali.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-3">
                   <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md">
                     <FileJson size={16} /> Unduh Format .JSON
                   </button>
                   <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md">
                     <FileSpreadsheet size={16} /> Unduh Format .XLSX
                   </button>
                 </div>
               </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <Upload size={16} /> 2. Restore / Impor Massal
                 </h3>
                 <p className="text-sm text-amber-700 mb-4">
                   Pilih file .JSON atau .XLSX dari perangkat Anda. <strong>Peringatan Sistem:</strong> Tindakan ini akan menimpa seluruh kumpulan data secara destruktif tanpa bisa dibatalkan.
                 </p>
                 <div className="flex items-center gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md">
                      <Upload size={16} /> Unggah File Pemulihan
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
             <Activity size={200} />
          </div>
          
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-6 relative z-10">
            <Activity size={20} />
            <h2 className="uppercase tracking-wide">DIAGNOSTIK SISTEM SEHAT</h2>
          </div>

          <div className="relative z-10 flex flex-col h-full mb-8">
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-4">
                Pindai miliaran sel memori untuk mendeteksi data korup, relasi tidak imbang, atau perhitungan matematis yang salah (seperti baris hantu tanpa tanggal atau pembagian 0).
              </p>
              <button 
                onClick={runDiagnostics} 
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md"
              >
                {isScanning ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="flex items-center gap-2">
                    <RefreshCw size={18} /> Memindai Anomali Database...
                  </motion.div>
                ) : (
                  <>
                    <Activity size={18} /> Jalankan Diagnostik Kelayakan
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-sm overflow-y-auto">
               <div className="text-slate-400 mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                 Console Peringatan Dini Sistem
               </div>
               
               <AnimatePresence>
                 {scanResults ? (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                     {scanResults.map((res, i) => (
                       <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                         res.type === 'error' ? 'bg-rose-950/40 border-rose-900 text-rose-300' :
                         res.type === 'warning' ? 'bg-amber-950/40 border-amber-900 text-amber-300' :
                         'bg-emerald-950/40 border-emerald-900 text-emerald-300'
                       }`}>
                         <div className="mt-0.5 shrink-0">
                           {res.type === 'error' ? <AlertTriangle size={16} className="text-rose-500" /> :
                            res.type === 'warning' ? <ShieldAlert size={16} className="text-amber-500" /> :
                            <CheckCircle size={16} className="text-emerald-500" />}
                         </div>
                         <p className="text-xs leading-relaxed">{res.message}</p>
                       </div>
                     ))}
                   </motion.div>
                 ) : (
                   <div className="text-slate-600 text-center py-8">
                      Belum ada pindaian terbaru.<br/>Tekan tombol di atas untuk memulai.
                   </div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm relative overflow-hidden">
         <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-600"></div>
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
               <div className="flex items-center gap-2 text-rose-700 font-bold mb-2">
                 <ShieldAlert size={24} />
                 <h2 className="uppercase tracking-wide text-lg">ZONA BAHAYA (WIPE DATABASE)</h2>
               </div>
               <p className="text-sm text-slate-600 max-w-3xl">
                 Fitur penghancuran diri (Self-Destruct). Menghapus permanen 100% koleksi data tanpa pengecualian. Mengembalikan aplikasi ke kondisi pabrik. Gunakan hanya saat tutup buku tahunan ekstrem atau ancaman kebocoran.
               </p>
            </div>
            
            <button 
              onClick={() => setShowWipeDialog(true)}
              className="shrink-0 flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white px-6 py-4 rounded-2xl text-sm font-bold transition-all shadow-sm group border border-rose-300 hover:border-rose-600 uppercase"
            >
              <Trash2 size={20} className="group-hover:animate-bounce" />
              Reset / Wipe Database
            </button>
         </div>
         
         <AnimatePresence>
           {showWipeDialog && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-t-8 border-rose-600"
               >
                 <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <AlertTriangle size={32} />
                 </div>
                 <h3 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Peringatan Kritis</h3>
                 <p className="text-slate-600 text-center text-sm font-medium mb-8">
                   Apakah Anda sangat yakin ingin menghapus seluruh aset data perusahaan? Tindakan ini <strong>TIDAK BISA DIBATALKAN</strong> dan aplikasi akan kembali seperti hari pertama instalasi.
                 </p>
                 
                 <div className="space-y-3">
                   <button 
                     onClick={() => {
                       alert('Database wiped');
                       setShowWipeDialog(false);
                     }}
                     className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl text-sm transition-colors uppercase tracking-widest"
                   >
                     Ya, Hancurkan Data
                   </button>
                   <button 
                     onClick={() => setShowWipeDialog(false)}
                     className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors"
                   >
                     Batal & Kembali
                   </button>
                 </div>
               </motion.div>
             </div>
           )}
         </AnimatePresence>
      </div>

    </div>
  );
}
