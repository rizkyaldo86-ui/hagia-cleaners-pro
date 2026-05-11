import React, { useState, useEffect } from 'react';
import { Search, Download, Table as TableIcon, Plus, RotateCcw, RotateCw, Trash2, CheckSquare, ChevronDown, Check, Filter, Link, RefreshCw, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EditableCell = ({ value, isEditing, onClick, onChange, onBlur, className = "" }: any) => {
  if (isEditing) {
    return (
      <input 
        autoFocus
        className={`w-full min-w-[80px] bg-[#1e293b] border border-indigo-500 rounded px-2 py-1 text-sm text-white focus:outline-none ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => { if (e.key === 'Enter') onBlur() }}
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

interface Column {
  key: string;
  label: string;
}

interface GenericTableProps {
  storageKey?: string;
  title: string;
  subtitle?: string;
  columns: Column[];
}

export default function GenericTable({ storageKey, title, subtitle, columns }: GenericTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  
  const actualStorageKey = storageKey ? `hagia-generic-${storageKey}` : `hagia-generic-data`;

  const [data, setData] = useState<any[]>(() => {
    const saved = localStorage.getItem(actualStorageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [];
  });

  const [pastData, setPastData] = useState<any[][]>([]);
  const [futureData, setFutureData] = useState<any[][]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string | number, key: string } | null>(null);

  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'} | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [activeFilterCol, setActiveFilterCol] = useState<string | null>(null);

  const [sheetLink, setSheetLink] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{type: 'info'|'success'|'error', message: string} | null>(null);

  useEffect(() => {
    localStorage.setItem(actualStorageKey, JSON.stringify(data));
  }, [data, actualStorageKey]);

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
      
      if (csvText.trim().toLowerCase().startsWith('<!doctype html>') || csvText.includes('<html')) {
        setSyncStatus({ type: 'error', message: "Akses Ditolak! Pastikan pengaturan Share (Bagikan) diatur ke 'Siapa saja yang memiliki link'." });
        setIsSyncing(false);
        return;
      }

      setSyncStatus({ type: 'info', message: 'Memproses data...' });
      import('papaparse').then((Papa) => {
        Papa.default.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 1) {
              const headers = (results.data[0] as string[]).map(h => typeof h === 'string' ? h.trim() : '');
              
              // Smart Column Mapping Logic (Advanced Alias Matching)
              const ALIAS_MAP: Record<string, string[]> = {
                no: ['no', 'nomor', 'index', '#'],
                tanggal: ['tgl', 'date', 'hari', 'time'],
                nama: ['name', 'customer', 'pelanggan', 'kol', 'user'],
                noTelp: ['phone', 'wa', 'whatsapp', 'telp', 'hp', 'nomor telepon', 'contact'],
                lokasi: ['location', 'alamat', 'kota', 'city', 'address', 'area'],
                nominal: ['harga', 'price', 'total', 'amount', 'rp', 'biaya', 'cost', 'tawaran'],
                pic: ['admin', 'petugas', 'cs', 'pic', 'owner'],
                link: ['url', 'tautan', 'link', 'sosmed'],
                kategori: ['category', 'type', 'jenis', 'kat'],
                status: ['state', 'kondisi', 'status', 'hasil', 'progress'],
                jangkauan: ['reach', 'jangkauan'],
                tayangan: ['view', 'impression', 'tayangan'],
                suka: ['like', 'suka'],
                komentar: ['comment', 'komentar'],
                simpan: ['save', 'simpan'],
                bagikan: ['share', 'bagikan']
              };

              const colIndices: Record<string, number> = {};
              const usedIndices = new Set<number>();

              columns.forEach((col: any) => {
                const targetLabel = col.label.toLowerCase().trim();
                const targetKey = col.key.toLowerCase().trim();
                
                // 1. Try Exact Match (Label or Key)
                let matchIdx = headers.findIndex((h, i) => 
                  !usedIndices.has(i) && (h.toLowerCase() === targetLabel || h.toLowerCase() === targetKey)
                );
                
                // 2. Try Alias Match
                if (matchIdx === -1) {
                  // Find applicable aliases for this column's key or label
                  const aliases = ALIAS_MAP[col.key] || [];
                  // Also check if any key in ALIAS_MAP is contained in the label
                  Object.entries(ALIAS_MAP).forEach(([masterKey, list]) => {
                    if (targetLabel.includes(masterKey) || targetKey.includes(masterKey)) {
                      aliases.push(...list);
                    }
                  });

                  matchIdx = headers.findIndex((h, i) => {
                    if (usedIndices.has(i)) return false;
                    const cleanH = h.toLowerCase().trim();
                    return aliases.some(alias => cleanH === alias || cleanH.includes(alias) || alias.includes(cleanH));
                  });
                }

                // 3. Fallback: Fuzzy (Partial) match
                if (matchIdx === -1) {
                   matchIdx = headers.findIndex((h, i) => 
                     !usedIndices.has(i) && (targetLabel.includes(h.toLowerCase()) || h.toLowerCase().includes(targetLabel))
                   );
                }

                if (matchIdx !== -1) {
                  colIndices[col.key] = matchIdx;
                  usedIndices.add(matchIdx);
                }
              });

              const newData = results.data.slice(1).map((row: any, idx: number) => {
                 const mappedRow: any = { id: Math.random().toString(36).substring(7) + idx };
                 columns.forEach((col: any) => {
                   const cIdx = colIndices[col.key];
                   mappedRow[col.key] = cIdx !== undefined && row[cIdx] ? String(row[cIdx]) : "";
                 });
                 return mappedRow;
              }).filter((r: any) => columns.some((c: any) => r[c.key]));
              
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
            setTimeout(() => setSyncStatus(null), 5000);
          },
          error: (err: any) => {
            console.error("Error parsing CSV:", err);
            setIsSyncing(false);
            setSyncStatus({ type: 'error', message: "Gagal melakukan parse CSV. Pastikan data valid." });
          }
        });
      }).catch(err => {
        setIsSyncing(false);
        setSyncStatus({ type: 'error', message: "Terjadi kesalahan internal saat memproses." });
      });
    } catch (err) {
      setSyncStatus({ type: 'error', message: "Gagal menghubungi Google Sheets. Mohon periksa koneksi internet." });
      setIsSyncing(false);
    }
  };

  const safeLowerCase = (val: any) => typeof val === 'string' ? val.toLowerCase() : '';

  let processedData = data.filter(row => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return Object.values(row).some(val => safeLowerCase(val).includes(searchLower));
  });

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

  // Generic Metrics Calculation
  let totalData = processedData.length;
  // Try to find if there are status or categorical columns to breakdown
  const categoricalCols = columns.filter(c => 
    c.label.toLowerCase().includes('status') || 
    c.label.toLowerCase().includes('kategori') ||
    c.label.toLowerCase().includes('hasil') ||
    c.label.toLowerCase().includes('Deal') ||
    c.label.toLowerCase() === 'layanan' ||
    c.label.toLowerCase().includes('admin') ||
    c.label.toLowerCase().includes('asal')
  ).slice(0, 3);

  const breakdowns = categoricalCols.map(col => {
    const counts = processedData.reduce((acc, row) => {
      const val = (row[col.key] as string || "").trim();
      const key = val === "" ? "Lainnya" : val;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { label: col.label, counts };
  });

  const handleExport = () => {
    const csvContent = [
      columns.map(c => c.label).join(','),
      ...processedData.map(row => columns.map(c => `"${String((row as any)[c.key] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCellEdit = (id: string | number, key: string, value: string) => {
    updateDataWithHistory(data.map(row => row.id === id ? { ...row, [key]: value } : row));
  };

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedRows(newSelected);
  };

  const handleAddRow = () => {
    const newRow: any = { id: Math.random().toString(36).substring(7) };
    columns.forEach(c => newRow[c.key] = "");
    updateDataWithHistory([newRow, ...data]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <TableIcon size={28} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
              <p className="text-slate-400 text-sm mt-1">
                {subtitle || "Manajemen data dan laporan"}
              </p>
            </div>
          </div>
          
          <div className="flex bg-[#121b33] p-1.5 rounded-2xl border border-slate-700/50 xl:w-[450px]">
            <div className="flex-1 flex items-center px-4 bg-transparent border-r border-slate-700/50">
              <Link size={18} className="text-slate-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Paste Link Google Sheets..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-600"
                value={sheetLink}
                onChange={(e) => setSheetLink(e.target.value)}
              />
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing || !sheetLink}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all text-white ml-1 shrink-0"
            >
              <RefreshCw size={18} className={`${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Menarik...' : 'Auto Sync'}</span>
            </button>
          </div>
        </div>
        
        {syncStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl border flex items-center gap-3 text-sm ${
              syncStatus.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
              syncStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            <RefreshCw size={16} className={syncStatus.type === 'info' ? 'animate-spin' : ''} />
            {syncStatus.message}
          </motion.div>
        )}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -z-10 rounded-full"></div>
      </div>

      {/* Generic Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c1226] rounded-3xl p-5 border border-slate-800/50 shadow-xl overflow-hidden relative group"
        >
          <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <BarChart2 size={20} />
             </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white">{totalData}</h3>
            <p className="text-sm text-slate-400 font-medium">Total Baris Data</p>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <BarChart2 size={120} />
          </div>
        </motion.div>

        {breakdowns.map((bd: any, i: number) => {
           const topEntries = Object.entries(bd.counts as Record<string, number>)
              .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
              .slice(0, 3);
           const sumTop = topEntries.reduce((s: number, x: [string, number]) => s + x[1], 0);
           const other = totalData - sumTop;

           return (
             <motion.div 
               key={bd.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * (i + 1) }}
               className="bg-[#0c1226] rounded-3xl p-5 border border-slate-800/50 shadow-xl"
             >
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 truncate" title={bd.label}>{bd.label}</h3>
               <div className="space-y-3">
                 {topEntries.map(([key, count]) => (
                   <div key={key}>
                     <div className="flex justify-between text-xs mb-1">
                       <span className="text-slate-300 truncate max-w-[140px] font-medium" title={key}>{key}</span>
                       <span className="text-white font-bold">{count}</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${totalData ? (count / totalData) * 100 : 0}%` }}
                         className={`h-full ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                       />
                     </div>
                   </div>
                 ))}
                 {other > 0 && (
                   <div>
                     <div className="flex justify-between text-xs mb-1">
                         <span className="text-slate-500 truncate max-w-[140px] font-medium">Lainnya</span>
                         <span className="text-slate-400 font-bold">{other}</span>
                       </div>
                   </div>
                 )}
                 {topEntries.length === 0 && <div className="text-xs text-slate-600 italic">Belum ada breakdown data.</div>}
               </div>
             </motion.div>
           );
        })}
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleAddRow} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
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
                  className="absolute top-full left-0 mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden origin-top-left"
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

        <div className="relative flex-1 xl:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari data..." 
            className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
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
                <th className="p-4 w-12 sticky left-0 bg-[#0f172a] z-20 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                  <button 
                    onClick={() => {
                      if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
                        setSelectedRows(new Set());
                      } else {
                        setSelectedRows(new Set(paginatedData.map(r => r.id)));
                      }
                    }}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      selectedRows.size > 0 && selectedRows.size === paginatedData.length 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'border-slate-600 bg-slate-800/50 hover:border-indigo-500'
                    }`}
                  >
                   {selectedRows.size > 0 && selectedRows.size === paginatedData.length && <Check size={12} className="text-white" />}
                   {selectedRows.size > 0 && selectedRows.size < paginatedData.length && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>}
                  </button>
                </th>
                {columns.map((col, idx) => (
                  <th key={col.key} className={`p-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap border-l border-slate-700/30 relative group`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {col.label}
                        {sortConfig?.key === col.key && (
                          <span className="text-indigo-400">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => setActiveFilterCol(activeFilterCol === col.key ? null : col.key)}
                        className={`p-1 rounded transition-colors ${activeFilterCol === col.key || columnFilters[col.key] ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600 hover:bg-slate-800 hover:text-slate-300 opacity-0 group-hover:opacity-100'}`}
                      >
                       <Filter size={14} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeFilterCol === col.key && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden origin-top-left z-50 p-4 font-sans normally-case normal-case text-left"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
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
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group ${selectedRows.has(row.id) ? 'bg-indigo-500/10' : ''}`}>
                  <td className="p-4 sticky left-0 z-10 bg-[#0c1226] group-hover:bg-[#121b33] shadow-[2px_0_5px_rgba(0,0,0,0.2)] transition-colors">
                    <button 
                      onClick={() => toggleRowSelection(row.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        selectedRows.has(row.id)
                          ? 'bg-indigo-500 border-indigo-500' 
                          : 'border-slate-600 bg-slate-800/50 group-hover:border-indigo-500'
                      }`}
                    >
                      {selectedRows.has(row.id) && <Check size={12} className="text-white" />}
                    </button>
                  </td>
                  {columns.map((col, cIdx) => (
                    <td key={col.key} className={`p-1 whitespace-nowrap border-l border-slate-700/30`}>
                       <EditableCell
                          value={row[col.key]}
                          isEditing={editingCell?.id === row.id && editingCell?.key === col.key}
                          onClick={() => setEditingCell({ id: row.id, key: col.key })}
                          onChange={(val: string) => handleCellEdit(row.id, col.key, val)}
                          onBlur={() => setEditingCell(null)}
                       />
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                   <td colSpan={columns.length + 1} className="p-8 text-center text-slate-500 text-sm">
                      Belum ada data.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div>
            Menampilkan {paginatedData.length} dari {processedData.length} data
          </div>
          <div className="flex items-center gap-2">
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

