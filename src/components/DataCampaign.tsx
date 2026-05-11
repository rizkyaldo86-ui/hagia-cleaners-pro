import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RotateCcw, 
  RotateCw, 
  ClipboardPaste, 
  Upload, 
  Download, 
  RefreshCw,
  Search,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Check,
  Calendar,
  CheckSquare,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const EditableCell = ({ value, isEditing, onClick, onChange, onBlur, className = "" }: any) => {
  if (isEditing) {
    return (
      <input 
        autoFocus
        className={`w-full min-w-[80px] bg-[#1e293b] border border-indigo-500 rounded px-2 py-1 text-sm text-white focus:outline-none ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => { if(e.key === 'Enter') onBlur() }}
      />
    );
  }
  
  return (
    <div 
      className={`bg-transparent hover:bg-[#1e293b] rounded-lg px-2 py-1 text-sm text-slate-300 transition-colors cursor-text min-h-[28px] flex items-center ${className}`}
      onClick={onClick}
    >
      {value || <span className="text-slate-600/50 italic text-xs">Kosong</span>}
    </div>
  );
};

export default function DataCampaign() {
  const [activeDateFilter, setActiveDateFilter] = useState("Semua Waktu");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [sheetLink, setSheetLink] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterCol, setActiveFilterCol] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  const [pastData, setPastData] = useState<any[][]>([]);
  const [futureData, setFutureData] = useState<any[][]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const savedCampaignStr = localStorage.getItem('hagia-campaign-data');
    if (savedCampaignStr) {
       try {
         setData(JSON.parse(savedCampaignStr));
       } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem('hagia-campaign-data', JSON.stringify(data));
    }
  }, [data]);

  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'} | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<{rowId: number, field: string} | null>(null);

  const updateDataWithHistory = (newData: any[]) => {
    setPastData(prev => [...prev, data]);
    setFutureData([]);
    setData(newData);
  };

  const handleUndo = () => {
    if (pastData.length === 0) return;
    const previous = pastData[pastData.length - 1];
    setPastData(prev => prev.slice(0, prev.length - 1));
    setFutureData(prev => [data, ...prev]);
    setData(previous);
  };

  const handleRedo = () => {
    if (futureData.length === 0) return;
    const next = futureData[0];
    setFutureData(prev => prev.slice(1));
    setPastData(prev => [...prev, data]);
    setData(next);
  };

  const handleBulkDelete = () => {
    updateDataWithHistory(data.filter(row => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
    setShowBulkActions(false);
  };

  const handleExport = () => {
    const csvContent = [
      columns.map(c => c.label).join(','),
      ...data.map(row => columns.map(c => `"${String((row as any)[c.key] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'export_leads.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (id: number, field: string, value: string) => {
    updateDataWithHistory(data.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSort = (key: string, direction: 'asc'|'desc') => {
    setSortConfig({ key, direction });
    setActiveFilterCol(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSync = async () => {
    if (!sheetLink) return;
    setIsSyncing(true);
    setSyncStatus({ type: 'info', message: 'Mempersiapkan sinkronisasi...' });
    
    let fetchUrl = sheetLink;
    const match = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const id = match[1];
      const gidMatch = sheetLink.match(/[#&]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      fetchUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
    } else {
      setSyncStatus({ type: 'error', message: 'Link Google Sheets tidak valid. Pastikan Anda menyalin link secara lengkap.' });
      setIsSyncing(false);
      return;
    }
    
    try {
      setSyncStatus({ type: 'info', message: 'Mengambil data dari Google Sheets...' });
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Gagal mengambil data dari Google Sheets");
      
      const csvText = await response.text();
      
      // Jika yang didapat adalah halaman login HTML Google (karena akses di-restrict)
      if (csvText.trim().toLowerCase().startsWith('<!doctype html>') || csvText.includes('<html')) {
        setSyncStatus({ type: 'error', message: "Akses Ditolak! Pastikan pengaturan Share (Bagikan) diatur ke 'Siapa saja yang memiliki link'." });
        setIsSyncing(false);
        return;
      }

      setSyncStatus({ type: 'info', message: 'Memproses data...' });
      import('papaparse').then((Papa) => {
        Papa.default.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const standardKeys = [
                { key: 'tanggal', aliases: ['tanggal', 'date', 'tgl'] },
                { key: 'namaAdset', aliases: ['nama adset', 'adset'] },
                { key: 'campaign', aliases: ['campaign', 'kampanye'] },
                { key: 'layanan', aliases: ['layanan', 'service'] },
                { key: 'jenisIklan', aliases: ['jenis iklan', 'tipe iklan'] },
                { key: 'budgetIklan', aliases: ['budget iklan', 'anggaran'] },
                { key: 'biayaIklan', aliases: ['biaya iklan', 'spent'] },
                { key: 'impresi', aliases: ['impresi', 'impression'] },
                { key: 'reach', aliases: ['reach', 'jangkauan'] },
                { key: 'klikTautanSemua', aliases: ['klik tautan semua', 'link clicks all'] },
                { key: 'kunjunganProfilIG', aliases: ['kunjungan profil ig', 'profile visits'] },
                { key: 'hasilKlikTautan', aliases: ['hasil klik tautan', 'link clicks'] },
                { key: 'percakapanPesanDiMulai', aliases: ['percakapan pesan', 'messaging conversations started', 'pesan dimulai'] },
                { key: 'dmIGFB', aliases: ['dm ig', 'dm ig & fb', 'dm & fb'] },
                { key: 'komentarIGFB', aliases: ['komentar ig', 'komentar ig & fb', 'komentar'] },
                { key: 'frekuensi', aliases: ['frekuensi', 'frequency'] },
                { key: 'cpc', aliases: ['cpc', 'biaya per klik'] },
                { key: 'ctrRasio', aliases: ['ctr (rasio', 'ctr rasio', 'ctr tayang'] },
                { key: 'ctrSemua', aliases: ['ctr semua', 'ctr (all)'] },
                { key: 'cpm', aliases: ['cpm', 'biaya per 1.000'] },
                { key: 'totalLeadsIklan', aliases: ['total leads iklan', 'total leads', 'total lead'] },
                { key: 'crWhatsapp', aliases: ['cr to whatsapp', 'cr whatsapp'] },
                { key: 'crKeseluruhan', aliases: ['cr to keseluruhan lead', 'cr keseluruhan'] },
                { key: 'biayaPerHasil', aliases: ['biaya iklan per hasil', 'biaya per hasil'] },
                { key: 'biayaPerPercakapan', aliases: ['biaya iklan per percakapan', 'biaya per percakapan'] },
                { key: 'biayaPerKeseluruhanLead', aliases: ['biaya iklan per keseluruhan lead', 'biaya per keseluruhan lead'] },
                { key: 'biayaPerImpresi', aliases: ['biaya iklan perimpresi', 'biaya per impresi'] },
                { key: 'biayaPerReach', aliases: ['biaya iklan perreach', 'biaya per reach'] },
                { key: 'ctrKlikTautan', aliases: ['ctr klik tautan'] },
                { key: 'ketukanSitusWeb', aliases: ['ketukan situs web'] },
                { key: 'ketukanSitusWebRate', aliases: ['ketukan situs webrate', 'ketukan situs web rate', 'rate ketukan'] },
                { key: 'pengunjungDestyPageInstagram', aliases: ['pengunjung desty', 'pengunjung desty page instagram'] },
                { key: 'klikDestyPageInstagram', aliases: ['klik desty', 'klik desty page instagram'] }
              ];
              
              const rawHeaders = Object.keys(results.data[0] || {});
              const headerMap: Record<string, string> = {};
              
              standardKeys.forEach(({ key, aliases }) => {
                const foundHeader = rawHeaders.find(h => {
                  const cleanH = String(h).trim().toLowerCase();
                  return aliases.some(a => cleanH.includes(a) || a.includes(cleanH));
                });
                if (foundHeader) {
                  headerMap[key] = foundHeader;
                }
              });

              const newData = results.data.map((row: any, idx: number) => {
                 const mappedRow: any = { id: idx + 1000 };
                 standardKeys.forEach(({ key }) => {
                   mappedRow[key] = headerMap[key] ? row[headerMap[key]] || '' : '';
                 });
                 return mappedRow;
              }).filter((r: any) => r.tanggal || r.campaign || r.namaAdset);
              
              if(newData.length > 0) {
                updateDataWithHistory(newData);
                setSyncStatus({ type: 'success', message: `Berhasil sinkronisasi ${newData.length} baris data!` });
              } else {
                setSyncStatus({ type: 'error', message: "Data berhasil diambil, tetapi tidak ada baris yang valid atau judul kolom tidak sesuai." });
              }
            } else {
              setSyncStatus({ type: 'error', message: "Data kosong. Pastikan sheet tidak kosong." });
            }
            setIsSyncing(false);
            setSortConfig(null);
            setColumnFilters({});
            setCurrentPage(1);
            
            // clear success message after 5 seconds
            setTimeout(() => {
              setSyncStatus(prev => prev?.type === 'success' ? null : prev);
            }, 5000);
          },
          error: (err: any) => {
            console.error("Error fetching or parsing CSV:", err);
            setIsSyncing(false);
            setSyncStatus({ type: 'error', message: "Gagal melakukan parse CVS. Pastikan data valid." });
          }
        });
      }).catch(err => {
        console.error(err);
        setIsSyncing(false);
        setSyncStatus({ type: 'error', message: "Terjadi kesalahan internal saat memproses." });
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setSyncStatus({ type: 'error', message: "Gagal menghubungi Google Sheets. Mohon periksa koneksi internet atau validitas link." });
      setIsSyncing(false);
    }
  };

  const columns = [
    { key: "tanggal", label: "Tanggal" },
    { key: "namaAdset", label: "Nama Adset" },
    { key: "campaign", label: "Campaign" },
    { key: "layanan", label: "Layanan" },
    { key: "jenisIklan", label: "Jenis Iklan" },
    { key: "budgetIklan", label: "Budget Iklan" },
    { key: "biayaIklan", label: "Biaya Iklan" },
    { key: "impresi", label: "Impresi" },
    { key: "reach", label: "Reach" },
    { key: "klikTautanSemua", label: "Klik Tautan Semua" },
    { key: "kunjunganProfilIG", label: "Kunjungan Profil IG" },
    { key: "hasilKlikTautan", label: "Hasil Klik Tautan" },
    { key: "percakapanPesanDiMulai", label: "Percakapan Pesan Di Mulai" },
    { key: "dmIGFB", label: "DM IG & FB" },
    { key: "komentarIGFB", label: "Komentar Ig & FB" },
    { key: "frekuensi", label: "Frekuensi" },
    { key: "cpc", label: "CPC (Biaya per Klik Tautan) (IDR)" },
    { key: "ctrRasio", label: "CTR (Rasio Klik Tayang Tautan)" },
    { key: "ctrSemua", label: "CTR Semua" },
    { key: "cpm", label: "CPM (Biaya Per 1.000 Tayangan) (IDR)" },
    { key: "totalLeadsIklan", label: "Total Leads Iklan" },
    { key: "crWhatsapp", label: "CR to Whatsapp" },
    { key: "crKeseluruhan", label: "CR to keseluruhan lead" },
    { key: "biayaPerHasil", label: "Biaya Iklan per hasil" },
    { key: "biayaPerPercakapan", label: "Biaya Iklan per percakapan" },
    { key: "biayaPerKeseluruhanLead", label: "Biaya iklan per keseluruhan lead" },
    { key: "biayaPerImpresi", label: "Biaya Iklan perimpresi" },
    { key: "biayaPerReach", label: "Biaya Iklan perreach" },
    { key: "ctrKlikTautan", label: "CTR Klik Tautan" }
];

  // Apply Search, Filters, and Sort
  let processedData = [...data];

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
    
    // Indonesian format fallback
    const idMonths: Record<string, string> = {
      januari: 'January', februari: 'February', maret: 'March', april: 'April',
      mei: 'May', juni: 'June', juli: 'July', agustus: 'August', 
      september: 'September', oktober: 'October', november: 'November', desember: 'December'
    };
    
    let translatedStr = String(dateStr).toLowerCase();
    Object.entries(idMonths).forEach(([id, en]) => {
      translatedStr = translatedStr.replace(id, en.toLowerCase());
    });
    
    const parsedId = new Date(translatedStr);
    return isNaN(parsedId.getTime()) ? null : parsedId;
  };

  if (activeDateFilter !== "Semua Waktu" && activeDateFilter !== "Semua Bulan") {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    processedData = processedData.filter(row => {
      const rowDate = parseDate(row.tanggal as string);
      if (!rowDate) return false;

      const rowDay = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());

      switch (activeDateFilter) {
        case "Hari Ini":
          return rowDay.getTime() === today.getTime();
        case "Kemarin": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return rowDay.getTime() === yesterday.getTime();
        }
        case "3 Hari Terakhir": {
          const threeDaysAgo = new Date(today);
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return rowDay >= threeDaysAgo && rowDay <= today;
        }
        case "7 Hari Terakhir": {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return rowDay >= sevenDaysAgo && rowDay <= today;
        }
        case "Minggu Ini": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          return rowDay >= startOfWeek && rowDay <= today;
        }
        case "Bulan Ini": {
          return rowDay.getMonth() === today.getMonth() && rowDay.getFullYear() === today.getFullYear();
        }
        case "Bulan Lalu": {
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return rowDay.getMonth() === lastMonth.getMonth() && rowDay.getFullYear() === lastMonth.getFullYear();
        }
        case "Custom Tanggal": {
          if (!customDateStart && !customDateEnd) return true;
          let inRange = true;
          if (customDateStart) {
            const start = new Date(customDateStart);
            start.setHours(0, 0, 0, 0);
            if (rowDay < start) inRange = false;
          }
          if (customDateEnd) {
            const end = new Date(customDateEnd);
            end.setHours(23, 59, 59, 999);
            if (rowDay > end) inRange = false;
          }
           return inRange;
        }
        default:
          return true;
      }
    });
  }

  if (searchQuery) {
    processedData = processedData.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  Object.entries(columnFilters).forEach(([key, value]) => {
    if (value) {
      processedData = processedData.filter(row => 
        String((row as any)[key] || '').toLowerCase().includes(String(value).toLowerCase())
      );
    }
  });

  if (sortConfig) {
    processedData.sort((a, b) => {
      const aVal = String((a as any)[sortConfig.key] || "").toLowerCase();
      const bVal = String((b as any)[sortConfig.key] || "").toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.max(1, Math.ceil(processedData.length / rowsPerPage));
  const paginatedData = processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Calculate Metrics
  const parseNumber = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    let str = String(val).trim().toUpperCase().replace(/RP/g, '').replace(/\s/g, '');
    if (str.includes('.') && str.includes(',')) {
      if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      const parts = str.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        str = str.replace(',', '.');
      } else {
        str = str.replace(/,/g, '');
      }
    } else if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length > 2) {
        str = str.replace(/\./g, '');
      } else if (parts.length === 2) {
        if (parts[1].length === 3) {
          str = str.replace(/\./g, '');
        }
      }
    }
    return parseFloat(str.replace(/[^0-9.-]/g, '')) || 0;
  };

  const totalBiaya = processedData.reduce((sum, row) => sum + parseNumber(row.biayaIklan), 0);
  const totalLeads = processedData.reduce((sum, row) => sum + parseNumber(row.totalLeadsIklan), 0);
  const totalImpresi = processedData.reduce((sum, row) => sum + parseNumber(row.impresi), 0);
  const totalKlik = processedData.reduce((sum, row) => sum + parseNumber(row.klikTautanSemua), 0);

  const avgCpc = totalKlik > 0 ? Math.round(totalBiaya / totalKlik) : 0;
  const avgCpl = totalLeads > 0 ? Math.round(totalBiaya / totalLeads) : 0;

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Advanced Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Advanced Date Filter Dropdown */}
        <div className="relative w-full sm:w-auto z-40">
           <button 
             onClick={() => setShowDateFilter(!showDateFilter)}
             className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto bg-[#1e293b] border border-slate-700 hover:border-indigo-500/50 rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all shadow-lg"
           >
             <div className="flex items-center gap-2">
               <Calendar size={18} className="text-indigo-400" />
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
                 className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden origin-top-left"
               >
                 <div className="py-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                   {DATE_FILTERS.map(filter => (
                     <button
                       key={filter}
                       onClick={() => {
                         setActiveDateFilter(filter);
                         if (filter !== "Custom Tanggal") setShowDateFilter(false);
                       }}
                       className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between ${
                         activeDateFilter === filter 
                           ? "bg-indigo-500/10 text-indigo-400 font-bold" 
                           : "text-slate-300 hover:bg-slate-800"
                       }`}
                     >
                       {filter}
                       {activeDateFilter === filter && <Check size={16} />}
                     </button>
                   ))}
                 </div>
                 {activeDateFilter === "Custom Tanggal" && (
                   <div className="p-5 border-t border-slate-700 bg-slate-900/50 space-y-4">
                     <div>
                       <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Dari Tanggal</label>
                       <input 
                         type="date" 
                         value={customDateStart} 
                         onChange={e => setCustomDateStart(e.target.value)} 
                         className="w-full bg-[#0c1226] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Sampai Tanggal</label>
                       <input 
                         type="date" 
                         value={customDateEnd} 
                         onChange={e => setCustomDateEnd(e.target.value)} 
                         className="w-full bg-[#0c1226] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                       />
                     </div>
                     <button 
                       onClick={() => setShowDateFilter(false)} 
                       className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 mt-2"
                     >
                       Terapkan Range Waktu
                     </button>
                   </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
           <button onClick={handleSync} disabled={isSyncing || !sheetLink} className="p-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all disabled:opacity-50 ml-auto focus:outline-none">
             <RefreshCw size={16} className={isSyncing ? "animate-spin text-emerald-400" : ""} />
           </button>
        </div>
      </div>

      {/* Sync Section */}
      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 text-emerald-400">
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Live Sheets Sync</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Tempel Link Google Sheets Anda di sini..."
              className="flex-1 bg-[#1e293b] border border-slate-700/50 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={sheetLink}
              onChange={(e) => setSheetLink(e.target.value)}
            />
            
            <button 
              onClick={handleSync}
              disabled={isSyncing || !sheetLink}
              className={`sm:w-auto w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-500/50 text-white rounded-2xl px-8 py-4 flex items-center justify-center gap-3 font-bold text-sm transition-all shadow-xl shadow-emerald-500/10 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider whitespace-nowrap`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RotateCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                  Smart Auto-Sync
                </>
              )}
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10"></div>
      </div>

      {/* Metrics Dashboard */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: "Total Biaya Iklan", value: formatCurrency(totalBiaya), color: "text-blue-400" },
            { label: "Total Impresi", value: new Intl.NumberFormat('id-ID').format(totalImpresi), color: "text-indigo-400" },
            { label: "Total Klik Tautan", value: new Intl.NumberFormat('id-ID').format(totalKlik), color: "text-purple-400" },
            { label: "Total Leads", value: new Intl.NumberFormat('id-ID').format(totalLeads), color: "text-emerald-400" },
            { label: "Avg CPC", value: formatCurrency(avgCpc), color: "text-fuchsia-400" },
            { label: "Avg CPL / CPH", value: formatCurrency(avgCpl), color: "text-amber-400" },
          ].map((metric, idx) => (
            <div key={idx} className="bg-[#1e293b]/60 border border-slate-700/50 rounded-2xl p-3 sm:p-4 flex flex-col justify-center items-center text-center shadow-lg hover:border-indigo-500/30 transition-colors group min-w-0">
               <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 group-hover:text-slate-300 transition-colors w-full break-words">{metric.label}</span>
               <span className={`text-base sm:text-xl font-black tracking-tight w-full break-words ${metric.color}`}>{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
            <Plus size={18} />
            Baris Baru
          </button>
          
          <div className="flex items-center bg-[#1e293b] rounded-2xl border border-slate-700/50">
            <button 
              onClick={handleUndo} 
              disabled={pastData.length === 0}
              className="p-3 text-slate-400 hover:text-white border-r border-slate-700/50 transition-colors disabled:opacity-30 disabled:hover:text-slate-400" 
              title="Undo"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={handleRedo}
              disabled={futureData.length === 0}
              className="p-3 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-slate-400" 
              title="Redo"
            >
              <RotateCw size={18} />
            </button>
          </div>

          <div className="relative z-40">
            <button 
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="bg-[#1e293b] hover:bg-slate-800 text-slate-300 border border-slate-700/50 px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
            >
              <CheckSquare size={18} />
              <span className="hidden sm:inline">Tindakan Masal {selectedRows.size > 0 ? `(${selectedRows.size})` : ''}</span>
              <ChevronDown size={14} className={`transition-transform opacity-50 ${showBulkActions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showBulkActions && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden origin-top-right"
                >
                  <button 
                    onClick={handleBulkDelete}
                    disabled={selectedRows.size === 0}
                    className="w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-2 hover:bg-rose-500/10 text-rose-400 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <Trash2 size={16} />
                    Hapus Terpilih
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleExport}
            className="bg-white hover:bg-slate-100 text-[#0f172a] px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Ekspor Data</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari data lead..." 
              className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, margin: 0 }}
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
              syncStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              syncStatus.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {syncStatus.type === 'info' && <RefreshCw className="animate-spin" size={18} />}
            {syncStatus.type === 'success' && <Check size={18} />}
            {syncStatus.type === 'error' && <span className="font-bold">!</span>}
            {syncStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spreadsheet Table */}
      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f172a]">
                <th className="p-3 min-w-[80px] sticky left-0 z-20 bg-[#0f172a]">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => {
                        if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
                          setSelectedRows(new Set());
                        } else {
                          setSelectedRows(new Set(paginatedData.map(r => r.id)));
                        }
                      }}
                      className={`w-5 h-5 shrink-0 border-2 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                        selectedRows.size > 0 && selectedRows.size === paginatedData.length 
                          ? 'bg-indigo-500 border-indigo-500' 
                          : 'border-slate-700 hover:border-indigo-500'
                      }`}
                    >
                       {selectedRows.size > 0 && selectedRows.size === paginatedData.length && <Check size={12} className="text-white" />}
                       {selectedRows.size > 0 && selectedRows.size < paginatedData.length && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">NO</span>
                  </div>
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap group relative">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => setActiveFilterCol(activeFilterCol === col.key ? null : col.key)}
                    >
                      {col.label} 
                      <Filter size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeFilterCol === col.key || columnFilters[col.key] ? 'opacity-100 text-indigo-400' : ''}`} />
                      {sortConfig?.key === col.key && (
                        <span className="text-emerald-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {activeFilterCol === col.key && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-10 left-0 bg-[#1e293b] border border-slate-700/80 rounded-xl p-3 shadow-2xl z-50 min-w-[200px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-3 font-normal normal-case tracking-normal">
                            <div className="flex gap-2">
                              <button onClick={() => handleSort(col.key, 'asc')} className="flex-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                                <span className="font-bold">A-Z</span> ↑
                              </button>
                              <button onClick={() => handleSort(col.key, 'desc')} className="flex-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                                <span className="font-bold">Z-A</span> ↓
                              </button>
                            </div>
                            <div>
                              <input 
                                type="text"
                                placeholder={`Filter ${col.label}...`}
                                className="w-full bg-[#0c1226] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                                value={columnFilters[col.key] || ''}
                                onChange={(e) => handleFilterChange(col.key, e.target.value)}
                              />
                            </div>
                            <button 
                              onClick={() => {
                                handleFilterChange(col.key, '');
                                setActiveFilterCol(null);
                              }}
                              className="w-full text-slate-400 hover:text-rose-400 text-xs text-center py-1 transition-colors mt-2 underline"
                            >
                              Reset Filter
                            </button>
                            <button 
                              onClick={() => setActiveFilterCol(null)}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-xs font-bold transition-all mt-1 shadow-lg shadow-indigo-600/20"
                            >
                              Terapkan
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </th>
                ))}
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={row.id} className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group ${selectedRows.has(row.id) ? 'bg-indigo-500/10' : ''}`}>
                  <td className="p-3 min-w-[80px] sticky left-0 z-10 bg-[#0c1226] group-hover:bg-[#121b33] transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => toggleRowSelection(row.id)}
                        className={`w-5 h-5 shrink-0 border-2 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                          selectedRows.has(row.id)
                            ? 'bg-indigo-500 border-indigo-500' 
                            : 'border-slate-700 group-hover:border-indigo-500'
                        }`}
                      >
                        {selectedRows.has(row.id) && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-xs text-slate-500 font-mono text-center w-6">
                        {((currentPage - 1) * rowsPerPage) + idx + 1}
                      </span>
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="p-2">
                       <EditableCell 
                          value={(row as any)[col.key]}
                          isEditing={editingCell?.rowId === row.id && editingCell?.field === col.key}
                          onClick={() => setEditingCell({ rowId: row.id, field: col.key })}
                          onChange={(val: string) => handleEdit(row.id, col.key, val)}
                          onBlur={() => setEditingCell(null)}
                          className={col.key === 'nomorTelepon' ? 'font-mono text-indigo-400' : ''}
                       />
                    </td>
                  ))}
                  <td className="p-3">
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Empty Rows to simulate spreadsheet feeling */}
              {Array.from({ length: Math.max(0, 5 - paginatedData.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-800/50 h-12">
                  <td className="p-3 min-w-[80px] sticky left-0 z-10 bg-[#0c1226]">
                  </td>
                  {columns.map(col => <td key={`empty-col-${col.key}`} className="p-2"></td>)}
                  <td className="p-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 bg-slate-900/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
          <span>Menampilkan {paginatedData.length} Baris dari Total {processedData.length}</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-slate-500"
            >
              Previous
            </button>
            <span className="bg-slate-800 text-white px-3 py-1 rounded-md">{currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-slate-500"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
