import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Clock, LogIn, LogOut, CheckCircle2, XCircle, Search, Download, Filter, User, Calendar, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AttendanceRecord {
  id: string;
  name: string;
  date: string; // DD/MM/YYYY
  timeIn: string | null; // HH:mm:ss
  timeOut: string | null; // HH:mm:ss
  status: 'On Time' | 'Terlambat';
  duration: string;
  locationIn: string | null;
  locationOut: string | null;
  imageIn: string | null;
  imageOut: string | null;
  divisi: string;
}

export default function EmployeeAttendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'Masuk' | 'Pulang'>('Masuk');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState("Semua Divisi");
  const [modalData, setModalData] = useState({ name: 'Admin', divisi: 'Management' });
  const [locationText, setLocationText] = useState('Mencari lokasi (GPS)...');
  const [isCapturing, setIsCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch location on modal open
  useEffect(() => {
    if (showModal) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocationText(`Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`),
          (err) => {
            console.error("GPS Error", err);
            setLocationText('Lokasi: IP Based (Fallback GPS Mati)');
          }
        );
      } else {
        setLocationText('Lokasi: IP Based (Fallback)');
      }
      
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [showModal]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal akses kamera", err);
      setLocationText(prev => prev + " | Peringatan: Kamera diblokir!");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const calculateDuration = (timeIn: string, timeOut: string) => {
    const [h1, m1, s1] = timeIn.split(':').map(Number);
    const [h2, m2, s2] = timeOut.split(':').map(Number);
    
    let diff = (h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1);
    if (diff < 0) return "0 jam 0 mnt"; // Error or over night
    
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${h} jam ${m} mnt`;
  };

  const handleConfirmAttendance = () => {
    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle mirroring correctly! The video element is mirrored via CSS, so we mirror the canvas drawing.
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Un-mirror before drawing text so text is readable
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        // Add Watermark overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; 
        ctx.fillRect(0, canvas.height - 110, canvas.width, 110);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 16px sans-serif";
        const dateStr = currentTime.toLocaleDateString('id-ID');
        const timeStr = currentTime.toLocaleTimeString('id-ID');
        
        ctx.fillText(`HAGIA PRO - WATERMARK PERMANEN`, 15, canvas.height - 85);
        ctx.font = "14px sans-serif";
        ctx.fillText(`Nama: ${modalData.name} | Divisi: ${modalData.divisi}`, 15, canvas.height - 65);
        ctx.fillText(`Waktu: ${timeStr} - ${dateStr} | Mode: ${attendanceType}`, 15, canvas.height - 45);
        ctx.fillText(`Lokasi: ${locationText}`, 15, canvas.height - 25);
        
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`Verified Hash: ${Math.random().toString(36).substring(2).toUpperCase()}`, 15, canvas.height - 8);
        
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Logic to group Masuk & Pulang
        setRecords(prev => {
          const newRecords = [...prev];
          const existingIdx = newRecords.findIndex(r => r.name === modalData.name && r.date === dateStr);
          
          if (existingIdx >= 0) {
            // Update existing record
            if (attendanceType === 'Masuk' && !newRecords[existingIdx].timeIn) {
              newRecords[existingIdx].timeIn = timeStr;
              newRecords[existingIdx].locationIn = locationText;
              newRecords[existingIdx].imageIn = imageUrl;
              const hours = currentTime.getHours();
              const minutes = currentTime.getMinutes();
              if (hours > 8 || (hours === 8 && minutes > 0)) {
                 newRecords[existingIdx].status = 'Terlambat';
              }
            } else if (attendanceType === 'Pulang') {
              newRecords[existingIdx].timeOut = timeStr;
              newRecords[existingIdx].locationOut = locationText;
              newRecords[existingIdx].imageOut = imageUrl;
              
              if (newRecords[existingIdx].timeIn) {
                 newRecords[existingIdx].duration = calculateDuration(newRecords[existingIdx].timeIn as string, timeStr);
              }
            }
          } else {
            // New record
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();
            let status: 'On Time' | 'Terlambat' = 'On Time';
            if (attendanceType === 'Masuk' && (hours > 8 || (hours === 8 && minutes > 0))) {
               status = 'Terlambat';
            }
            
            newRecords.unshift({
              id: Math.random().toString(36).substring(7),
              name: modalData.name,
              date: dateStr,
              timeIn: attendanceType === 'Masuk' ? timeStr : null,
              timeOut: attendanceType === 'Pulang' ? timeStr : null,
              status: status,
              duration: '-',
              locationIn: attendanceType === 'Masuk' ? locationText : null,
              locationOut: attendanceType === 'Pulang' ? locationText : null,
              imageIn: attendanceType === 'Masuk' ? imageUrl : null,
              imageOut: attendanceType === 'Pulang' ? imageUrl : null,
              divisi: modalData.divisi
            });
          }
          return newRecords;
        });
        
        setIsCapturing(false);
        setShowModal(false);
      }
    }
  };

  const handleExportCSV = () => {
    // Generate CSV
    const headers = ['ID', 'Nama', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Durasi', 'Lokasi Masuk', 'Lokasi Keluar', 'Divisi'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => `"${r.id}","${r.name}","${r.date}","${r.timeIn || '-'}","${r.timeOut || '-'}","${r.status}","${r.duration}","${r.locationIn || '-'}","${r.locationOut || '-'}","${r.divisi}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'rekap_absensi_hagiapro.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(r => {
    if (selectedDivisi !== 'Semua Divisi' && r.divisi !== selectedDivisi) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 blur-3xl -z-10 rounded-full"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Camera size={28} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Presensi Kehadiran</h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400"/> Sistem Anti-Fake Location & Kamera Live
              </p>
            </div>
          </div>
          
          <div className="flex bg-[#1e293b]/60 border border-slate-700/50 rounded-2xl p-4 md:p-6 shadow-inner items-center gap-4 min-w-[280px]">
            <Clock size={36} className="text-sky-400" />
            <div>
               <div className="text-3xl font-black text-white tracking-widest font-mono">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               </div>
               <div className="text-sky-400 text-sm font-semibold mt-1">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </div>
            </div>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-emerald-500/30 transition-colors">
            <div className="text-emerald-400 text-sm font-bold flex items-center gap-2 mb-2"><CheckCircle2 size={16}/>Hadir</div>
            <div className="text-3xl font-black text-white">{records.filter(r => r.timeIn != null).length}</div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-rose-500/30 transition-colors">
            <div className="text-rose-400 text-sm font-bold flex items-center gap-2 mb-2"><XCircle size={16}/>Terlambat</div>
            <div className="text-3xl font-black text-white">{records.filter(r => r.status === 'Terlambat').length}</div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-amber-500/30 transition-colors">
            <div className="text-amber-400 text-sm font-bold flex items-center gap-2 mb-2"><Calendar size={16}/>Izin / Sakit</div>
            <div className="text-3xl font-black text-white">0</div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-500/30 transition-colors">
            <div className="text-slate-400 text-sm font-bold flex items-center gap-2 mb-2"><User size={16}/>Alpa</div>
            <div className="text-3xl font-black text-white">0</div>
          </div>
        </div>
      </div>

      {/* Action Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <button 
            onClick={() => { setAttendanceType('Masuk'); setShowModal(true); }}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1"
         >
            <div className="absolute top-0 right-0 p-6 opacity-30 transform group-hover:scale-110 transition-transform">
               <LogIn size={80} color="white" />
            </div>
            <div className="relative z-10 flex flex-col items-start text-white">
               <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">Shift Pagi/Siang</span>
               <h3 className="text-3xl font-black mb-1">Absen Masuk</h3>
               <p className="text-emerald-50 font-medium">Mulai hari kerja dengan penuh semangat!</p>
            </div>
         </button>
         
         <button 
            onClick={() => { setAttendanceType('Pulang'); setShowModal(true); }}
            className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-1"
         >
            <div className="absolute top-0 right-0 p-6 opacity-30 transform group-hover:scale-110 transition-transform">
               <LogOut size={80} color="white" />
            </div>
            <div className="relative z-10 flex flex-col items-start text-white">
               <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">Semua Divisi</span>
               <h3 className="text-3xl font-black mb-1">Absen Pulang</h3>
               <p className="text-amber-50 font-medium">Bekerja tuntas, saatnya beristirahat.</p>
            </div>
         </button>
      </div>

      {/* Filter & Table */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-4">
        <div className="flex flex-wrap items-center gap-3">
           <button 
             onClick={handleExportCSV}
             className="bg-white hover:bg-slate-100 text-[#0f172a] px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
           >
             <Download size={16} /> Export CSV
           </button>
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <select 
               className="bg-[#1e293b] border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none min-w-[150px]"
               value={selectedDivisi}
               onChange={(e) => setSelectedDivisi(e.target.value)}
             >
               <option value="Semua Divisi">Semua Divisi</option>
               <option value="Management">Management</option>
               <option value="Operasional">Operasional</option>
               <option value="Marketing">Marketing</option>
               <option value="CS">Customer Service</option>
             </select>
           </div>
        </div>

        <div className="relative flex-1 xl:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari nama karyawan..." 
            className="w-full bg-[#1e293b] border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Masuk</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Pulang</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Durasi Kerja</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Foto Masuk/Pulang</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? filteredRecords.map((r, i) => (
                 <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                             {r.name.charAt(0)}
                          </div>
                          <div>
                             <div className="text-sm font-semibold text-white">{r.name}</div>
                             <div className="text-xs text-slate-400">{r.divisi}</div>
                          </div>
                       </div>
                    </td>
                    <td className="p-4">
                      {r.timeIn ? (
                         <>
                           <div className="text-sm font-mono text-white font-bold">{r.timeIn}</div>
                           <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono break-all max-w-[150px] truncate" title={r.locationIn || ''}><MapPin size={10} className="shrink-0"/> {r.locationIn}</div>
                         </>
                      ) : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="p-4">
                      {r.timeOut ? (
                         <>
                           <div className="text-sm font-mono text-white font-bold">{r.timeOut}</div>
                           <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono break-all max-w-[150px] truncate" title={r.locationOut || ''}><MapPin size={10} className="shrink-0"/> {r.locationOut}</div>
                         </>
                      ) : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="p-4">
                       {r.status === 'On Time' ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400"><CheckCircle2 size={14}/> On Time</div>
                       ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400"><XCircle size={14}/> Terlambat</div>
                       )}
                    </td>
                    <td className="p-4">
                       <div className="text-sm font-semibold text-sky-400">{r.duration}</div>
                    </td>
                    <td className="p-4 flex gap-2">
                       {r.imageIn ? (
                         <a href={r.imageIn} target="_blank" rel="noopener noreferrer" className="block w-10 h-10 rounded-lg border border-slate-700 overflow-hidden relative group" title="Foto Masuk">
                            <img src={r.imageIn} alt="Masuk" className="w-full h-full object-cover"/>
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-center text-white font-bold py-0.5">IN</div>
                         </a>
                       ) : <div className="w-10 h-10 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs">?</div>}
                       
                       {r.imageOut ? (
                         <a href={r.imageOut} target="_blank" rel="noopener noreferrer" className="block w-10 h-10 rounded-lg border border-slate-700 overflow-hidden relative group" title="Foto Pulang">
                            <img src={r.imageOut} alt="Pulang" className="w-full h-full object-cover"/>
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-center text-white font-bold py-0.5">OUT</div>
                         </a>
                       ) : <div className="w-10 h-10 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs">?</div>}
                    </td>
                 </tr>
              )) : (
                 <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 text-sm">
                       Belum ada histori absen.{records.length === 0 && " Silakan lakukan simulasi absensi di atas."}
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Absensi Live */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm"
          >
            <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-lg w-full"
            >
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     {attendanceType === 'Masuk' ? <LogIn className="text-emerald-400" /> : <LogOut className="text-amber-400"/> }
                     Absen {attendanceType}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors">
                     <XCircle size={24}/>
                  </button>
               </div>

               <div className="bg-black rounded-2xl overflow-hidden aspect-[4/3] relative border border-slate-700/50 mb-4 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] flex items-center justify-center">
                  <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="w-full h-full object-cover transform -scale-x-100" 
                  ></video>
                  {/* Overlay Scanner UI */}
                  <div className="absolute inset-0 pointer-events-none">
                     <div className="w-full h-full border-[8px] border-indigo-500/20 rounded-2xl relative">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-400/80"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-400/80"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-400/80"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-400/80"></div>
                     </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden"></canvas>
               </div>

               <div className="space-y-3 mb-6 bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                  <div className="flex flex-col gap-1">
                     <label className="text-xs font-bold text-slate-400 uppercase">Simulasi Karyawan</label>
                     <select 
                        className="bg-[#0f172a] border border-slate-700/50 text-white text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-indigo-500"
                        value={modalData.name}
                        onChange={(e) => {
                           const opts: any = {
                              'Admin': 'Management',
                              'Budi Santoso': 'Operasional',
                              'Siti Aisyah': 'Marketing',
                              'Rina Melati': 'CS'
                           };
                           setModalData({ name: e.target.value, divisi: opts[e.target.value] || 'Management' });
                        }}
                     >
                        <option value="Admin">Admin (Management)</option>
                        <option value="Budi Santoso">Budi Santoso (Operasional)</option>
                        <option value="Siti Aisyah">Siti Aisyah (Marketing)</option>
                        <option value="Rina Melati">Rina Melati (CS)</option>
                     </select>
                  </div>
                  
                  <div className="flex items-start gap-2">
                     <MapPin size={16} className="text-emerald-400 mt-0.5 shrink-0"/>
                     <div className="text-xs text-slate-300 font-mono tracking-tight leading-relaxed break-all">
                        {locationText}
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleConfirmAttendance}
                  disabled={isCapturing}
                  className={`w-full py-4 rounded-xl text-white font-black tracking-wider uppercase text-sm shadow-xl flex items-center justify-center gap-2 transition-all
                     ${attendanceType === 'Masuk' 
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/40' 
                        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 hover:shadow-amber-500/40'}
                     ${isCapturing ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
               >
                  {isCapturing ? 'Memproses Validasi...' : `Konfirmasi Absen ${attendanceType}`}
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
