import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, MapPin, Phone, Car, Clock, Plus, Camera, Navigation, Star, FileSignature, CheckCircle2, X } from 'lucide-react';
import PublicBookingForm from './PublicBookingForm';

interface SPKBooking {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jadwal: string; // Jadwal 1 (08:00 - 12:00) | Jadwal 2 (13:00 - Selesai)
  namaTim: string; // Tim Alpha, Tim Bravo, dst
  namaOperasional: string;
  namaCustomer: string;
  noTelpCustomer: string;
  layanan: string;
  detailLayanan: string;
  alamatSharelok: string;
  alamatDetail: string;
  status: 'Scheduled' | 'Completed';
}

const WAKTU_JADWAL = ["Jadwal 1 (10:00 WIB)", "Jadwal 2 (14:00 WIB)"];
const SLOT_COUNT = 5;
const LAYANAN_LIST = ["Hagia Bed", "Hagia Living", "Hagia Auto", "Hagia Shoes", "Hagia Home"];

// Simple digital signature pad
const SignaturePad = ({ onReady, onClear }: { onReady: (canvas: HTMLCanvasElement) => void, onClear: (clearFn: () => void) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Setup canvas context
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      onReady(canvas);
      onClear(() => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    }
  }, [onReady, onClear]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e, true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isStart = false) => {
    if (!isDrawing && !isStart) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (isStart) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
        }
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={150}
      className="bg-slate-800 border border-slate-600 rounded-xl w-full touch-none"
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onMouseMove={draw}
      onTouchStart={startDrawing}
      onTouchEnd={stopDrawing}
      onTouchMove={draw}
    />
  );
};

export default function CalendarSPK() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isAdmin] = useState(true); // For testing, assume admin so we see phone numbers. Techs would see censored.
  
  const [bookings, setBookings] = useState<SPKBooking[]>(() => {
    const saved = localStorage.getItem('hagia-spk-bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hagia-spk-bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Modal states
  const [showBookingForm, setShowBookingForm] = useState<{ tim: string, jadwal: string } | null>(null);
  const [showAdminBooking, setShowAdminBooking] = useState(false);
  const [showVoucherSettings, setShowVoucherSettings] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);

  useEffect(() => {
    if (showVoucherSettings) {
      const stored = localStorage.getItem('hagia-vouchers');
      if (stored) {
         setVouchers(JSON.parse(stored));
      } else {
         const def = [
           { code: 'RAYA10', disc: 0.10, type: 'percent', label: 'Diskon 10%' },
           { code: 'FLASH50', disc: 50000, type: 'fixed', label: 'Diskon Rp 50.000' }
         ];
         setVouchers(def);
         localStorage.setItem('hagia-vouchers', JSON.stringify(def));
      }
    }
  }, [showVoucherSettings]);
  
  // SPK Wizard states
  const [spkWizard, setSpkWizard] = useState<SPKBooking | null>(null);
  const [waktuTiba, setWaktuTiba] = useState<string>('');
  const [koordinatTiba, setKoordinatTiba] = useState<string>('');
  const [wizardStep, setWizardStep] = useState(1); // 1: Info & Tiba, 2: Foto, 3: Selesai & TTD
  
  // Wizard Form Data
  const [layananDikerjakan, setLayananDikerjakan] = useState('');
  const [metodePembersihan, setMetodePembersihan] = useState('Wet Clean');
  const [kondisiAwal, setKondisiAwal] = useState('');
  const [fotoSebelum, setFotoSebelum] = useState<string | null>(null);
  const [fotoSesudah, setFotoSesudah] = useState<string | null>(null);
  const [catatanTeknisi, setCatatanTeknisi] = useState('');
  const [rating, setRating] = useState(5);
  
  const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);
  const [clearSignature, setClearSignature] = useState<() => void>(() => () => {});

  const maskPhone = (phone: string) => {
    if (isAdmin) return phone;
    if (phone.length < 4) return phone;
    return phone.substring(0, phone.length - 4).replace(/./g, '*') + phone.substring(phone.length - 4);
  };

  const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showBookingForm) return;
    
    const formData = new FormData(e.currentTarget);
    const newBooking: SPKBooking = {
      id: `SPK-${Date.now()}`,
      tanggal: selectedDate,
      jadwal: showBookingForm.jadwal,
      namaTim: showBookingForm.tim,
      namaOperasional: formData.get('namaOperasional') as string,
      namaCustomer: formData.get('namaCustomer') as string,
      noTelpCustomer: formData.get('noTelpCustomer') as string,
      layanan: formData.get('layanan') as string,
      detailLayanan: formData.get('detailLayanan') as string,
      alamatSharelok: formData.get('alamatSharelok') as string,
      alamatDetail: formData.get('alamatDetail') as string,
      status: 'Scheduled',
    };
    
    setBookings([...bookings, newBooking]);
    setShowBookingForm(null);
  };

  // ----- SPK Wizard Flow -----
  const handleMulaiKerja = () => {
    setWaktuTiba(new Date().toLocaleTimeString('id-ID'));
    // Get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setKoordinatTiba(`https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`);
        },
        () => {
          setKoordinatTiba('GPS Gagal / Ditolak');
        }
      );
    } else {
      setKoordinatTiba('GPS Tidak Didukung');
    }
    setWizardStep(2);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitSPK = () => {
    if (!spkWizard) return;
    
    let signatureData = '';
    if (signatureCanvas) {
      signatureData = signatureCanvas.toDataURL('image/png');
    }

    const waktuSelesai = new Date().toLocaleTimeString('id-ID');
    
    // Calculate Duration
    const tTiba = new Date();
    const [hTiba, mTiba] = waktuTiba.split(':');
    tTiba.setHours(parseInt(hTiba, 10), parseInt(mTiba, 10), 0);
    
    const tSelesai = new Date();
    const [hSelesai, mSelesai] = waktuSelesai.split(':');
    tSelesai.setHours(parseInt(hSelesai, 10), parseInt(mSelesai, 10), 0);
    
    let diff = (tSelesai.getTime() - tTiba.getTime()) / 1000;
    if (diff < 0) diff = 0;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const durasiTotal = `${hours} jam ${minutes} menit`;

    const completedSPK = {
      ...spkWizard,
      waktuTiba,
      koordinatTiba,
      layananDikerjakan,
      metodePembersihan,
      kondisiAwal,
      fotoSebelum: fotoSebelum || '',
      fotoSesudah: fotoSesudah || '',
      catatanTeknisi,
      waktuSelesai,
      durasiTotal,
      ratingKepuasan: rating.toString(),
      tandaTanganPelanggan: signatureData,
      status: 'Completed'
    };

    // Save to Dokumentasi SPK db
    const existingDokumentasi = JSON.parse(localStorage.getItem('hagia-dokumentasi-spk') || '[]');
    localStorage.setItem('hagia-dokumentasi-spk', JSON.stringify([...existingDokumentasi, completedSPK]));

    // Update Kanban Status
    setBookings(bookings.map(b => b.id === spkWizard.id ? { ...b, status: 'Completed' } : b));
    
    // Reset state & close
    setSpkWizard(null);
    setWizardStep(1);
    setWaktuTiba('');
    setKoordinatTiba('');
    setLayananDikerjakan('');
    setMetodePembersihan('Wet Clean');
    setKondisiAwal('');
    setFotoSebelum(null);
    setFotoSesudah(null);
    setCatatanTeknisi('');
    setRating(5);
  };

  const getSlot = (slotName: string, jadwal: string) => bookings.find(b => b.namaTim === slotName && b.jadwal === jadwal && b.tanggal === selectedDate);

  if (showAdminBooking) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
        <div className="sticky top-0 p-4 bg-white border-b flex justify-between items-center shadow-sm z-50">
           <h2 className="font-bold text-lg text-slate-800">Mode Isi Admin</h2>
           <button 
             onClick={() => {
               setShowAdminBooking(false);
               const saved = localStorage.getItem('hagia-spk-bookings');
               if (saved) setBookings(JSON.parse(saved));
             }} 
             className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition-colors"
           >
              <X size={20} /> Tutup & Kembali
           </button>
        </div>
        <div className="h-full">
           <PublicBookingForm isAdminMode onClose={() => {
              setShowAdminBooking(false);
              const saved = localStorage.getItem('hagia-spk-bookings');
              if (saved) setBookings(JSON.parse(saved));
           }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0c1226] p-6 rounded-3xl border border-slate-800/50 shadow-2xl relative overflow-hidden">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={24} className="text-indigo-400" /> Kalender & Papan Jadwal</h2>
          <p className="text-slate-400 text-sm mt-1">Pusat penjadwalan tim lapangan (Kanban Board)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto z-10">
          <button 
            onClick={() => setShowVoucherSettings(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
             Atur Voucher
          </button>
          
          <button 
            onClick={() => setShowAdminBooking(true)}
            className="flex items-center gap-2 bg-[#0069b4] hover:bg-[#005a9c] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg"
          >
             Isi Booking Manual (Admin)
          </button>
          
          <button 
            onClick={() => {
               const link = `${window.location.origin}/?public-booking=true`;
               navigator.clipboard.writeText(link);
               alert('Link Form Booking Publik berhasil disalin!\nBagikan link ini ke customer: ' + link);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
             Salin Link
          </button>
          
          <div className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
            <input 
              type="date" 
              className="bg-transparent text-white font-bold px-2 py-1 outline-none w-full md:w-auto"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -z-10"></div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-w-0">
        {WAKTU_JADWAL.map(jadwal => (
          <div key={jadwal} className="bg-[#0f172a] rounded-3xl border border-slate-800/80 p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden">
             <div className="flex items-center justify-between pb-3 border-b border-slate-800">
               <h3 className="font-bold text-lg text-white flex items-center gap-2"><Clock size={18} className="text-sky-400" /> {jadwal}</h3>
               <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-300">{SLOT_COUNT} Antrean</span>
             </div>

             <div className="flex flex-col gap-4 flex-1">
               {Array.from({ length: SLOT_COUNT }).map((_, i) => {
                  const slotName = `Slot Antrean ${i + 1}`;
                  const job = getSlot(slotName, jadwal);
                  
                  return (
                    <div key={slotName} className={`rounded-2xl p-4 border transition-all ${job ? job.status === 'Completed' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-indigo-900/20 border-indigo-500/30' : 'bg-slate-800/30 border-dashed border-slate-700 hover:border-slate-500 cursor-pointer'} flex flex-col min-h-[160px]`}
                       onClick={() => { if (!job) setShowBookingForm({ tim: slotName, jadwal }) }}
                    >
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-xs font-bold px-2 py-1 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                            <Car size={12} /> {slotName}
                         </div>
                         {job && (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${job.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
                               {job.status === 'Completed' ? 'SELESAI' : 'DIJADWALKAN'}
                            </span>
                         )}
                      </div>

                      {job ? (
                        <div className="space-y-3 mt-1 flex-1">
                          <div>
                            <div className="text-white font-bold">{job.namaCustomer}</div>
                            <div className="text-slate-400 flex items-center gap-1.5 text-sm mt-0.5 font-mono">
                               <Phone size={12} /> {maskPhone(job.noTelpCustomer)}
                            </div>
                          </div>
                          
                          <div className="bg-slate-800/80 rounded-lg p-2.5 text-sm border border-slate-700/50">
                            <div className="text-slate-300 font-semibold mb-1">{job.layanan}</div>
                            <div className="text-slate-400 text-xs">{job.detailLayanan}</div>
                          </div>
                          
                          <a href={job.alamatSharelok} target="_blank" rel="noreferrer" className="flex items-start gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline">
                            <Navigation size={14} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{job.alamatDetail}</span>
                          </a>

                          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800 mt-2">
                            Pekerja: <span className="text-slate-300">{job.namaOperasional}</span>
                          </div>

                          {job.status !== 'Completed' && (
                             <button
                               onClick={(e) => { e.stopPropagation(); setSpkWizard(job); }}
                               className="mt-3 w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                             >
                                <FileSignature size={16} /> BUKA SPK WIZARD
                             </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                           <Plus size={24} className="text-slate-600" />
                           <span className="text-sm font-medium">Kosong - Klik untuk isi</span>
                        </div>
                      )}
                    </div>
                  );
               })}
             </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <CalendarIcon className="text-sky-400" /> 
                 Input Jadwal: {showBookingForm.tim} - {showBookingForm.jadwal.split(' (')[0]}
              </h3>
              <button onClick={() => setShowBookingForm(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-xl">
                 <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6 space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400">Nama Customer</label>
                   <input required name="namaCustomer" type="text" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="Contoh: Bpk. Ahmad" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400">Nomor Telepon</label>
                   <input required name="noTelpCustomer" type="tel" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500" placeholder="0812xxxxxx" />
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400">Layanan</label>
                   <select required name="layanan" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none">
                     <option value="">Pilih Layanan</option>
                     {LAYANAN_LIST.map(l => <option key={l} value={l}>{l}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400">Nama Teknisi / Operasional</label>
                   <input required name="namaOperasional" type="text" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="Contoh: Budi & Agus" />
                 </div>
                 
                 <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-medium text-slate-400">Detail Layanan (Barang yang dikerjakan)</label>
                   <textarea required name="detailLayanan" rows={2} className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="Contoh: 1 Kasur King Size, 1 Sofa 3 Seater"></textarea>
                 </div>
                 
                 <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-medium text-slate-400">Link Google Maps (Sharelok)</label>
                   <input required name="alamatSharelok" type="url" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5 text-sky-400 focus:outline-none focus:border-indigo-500" placeholder="https://maps.google.com/..." />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-medium text-slate-400">Alamat Detail (Patokan)</label>
                   <textarea required name="alamatDetail" rows={2} className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="Contoh: Pagar hitam, depan warung madura"></textarea>
                 </div>
               </div>
               
               <div className="pt-4 border-t border-slate-800">
                 <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform active:scale-95">
                    SIMPAN JADWAL MAPPING
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* SPK Wizard (Field Technician App Modal) */}
      {spkWizard && (
        <div className="fixed inset-0 z-[60] bg-[#0c1226] text-white overflow-y-auto flex flex-col shadow-2xl">
           <div className="sticky top-0 bg-[#0f172a] border-b border-slate-800 p-4 flex items-center justify-between z-20">
             <div>
               <h3 className="font-black text-lg text-white leading-tight">SPK WIZARD</h3>
               <p className="text-xs text-slate-400 font-mono">{spkWizard.id}</p>
             </div>
             <button onClick={() => setSpkWizard(null)} className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white">
                <X size={20} />
             </button>
           </div>
           
           <div className="flex-1 p-6 max-w-lg mx-auto w-full pb-24 space-y-8">
             
             {/* Progress bar */}
             <div className="flex items-center gap-2 mb-8">
               {[1, 2, 3].map(step => (
                 <div key={step} className={`flex-1 h-2 rounded-full ${wizardStep >= step ? 'bg-sky-500' : 'bg-slate-800'}`}></div>
               ))}
             </div>

             {wizardStep === 1 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 space-y-4">
                     <h4 className="font-bold text-sky-400 flex items-center gap-2 border-b border-slate-700 pb-2"><Navigation size={18}/> Detail Pekerjaan</h4>
                     <div>
                       <div className="text-xs text-slate-400 mb-1">Customer</div>
                       <div className="font-bold text-white text-lg">{spkWizard.namaCustomer}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400 mb-1">Layanan</div>
                       <div className="font-bold text-white">{spkWizard.layanan}</div>
                       <div className="text-sm text-slate-300 mt-1">{spkWizard.detailLayanan}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400 mb-1">Alamat</div>
                       <div className="text-sm text-slate-300">{spkWizard.alamatDetail}</div>
                     </div>
                  </div>

                  <button 
                    onClick={handleMulaiKerja}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 text-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={24} /> SAYA SUDAH DI LOKASI (MULAI KERJA)
                  </button>
               </div>
             )}

             {wizardStep === 2 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 font-mono text-xs text-emerald-400">
                    <div>Waktu Tiba: {waktuTiba}</div>
                    <div className="break-all">Lokasi Tiba: {koordinatTiba}</div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-white">Layanan yang akan/sedang dikerjakan:</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1e293b] border border-slate-600 focus:border-sky-500 rounded-xl px-4 py-3 text-white" 
                      placeholder="Sesuai detail (bisa diedit jika ada tambahan)"
                      value={layananDikerjakan || spkWizard.detailLayanan}
                      onChange={(e) => setLayananDikerjakan(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-white">Metode Pembersihan (SOP):</label>
                    <select 
                      className="w-full bg-[#1e293b] border border-slate-600 focus:border-sky-500 rounded-xl px-4 py-3 text-white appearance-none"
                      value={metodePembersihan}
                      onChange={(e) => setMetodePembersihan(e.target.value)}
                    >
                      <option>Wet Clean</option>
                      <option>Dry Vacuum</option>
                      <option>Detailing & Spotting</option>
                      <option>General Cleaning</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-rose-400">Kondisi Awal / Temuan Cacat (WAJIB DISI!):</label>
                    <textarea 
                      placeholder="Sebutkan cacat sebelum dicuci (misal: Robek di sudut, noda darah tua yang tidak bisa hilang, dll). Penting untuk Anti-Komplain!"
                      rows={3} 
                      className="w-full bg-[#1e293b] border border-rose-500/50 focus:border-rose-500 rounded-xl px-4 py-3 text-white"
                      value={kondisiAwal}
                      onChange={(e) => setKondisiAwal(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div className="space-y-2">
                       <label className="block text-xs font-bold text-center text-slate-400">FOTO SEBELUM</label>
                       {fotoSebelum ? (
                         <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-600">
                           <img src={fotoSebelum} className="w-full h-full object-cover" alt="Sebelum" />
                           <button onClick={() => setFotoSebelum(null)} className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg"><X size={16}/></button>
                         </div>
                       ) : (
                         <label className="cursor-pointer aspect-square bg-[#1e293b] border border-dashed border-slate-600 hover:border-sky-500 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 transition-colors">
                           <Camera size={24} />
                           <span className="text-[10px] font-medium text-center px-2">Ambil Foto Paling Kotor</span>
                           <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImageUpload(e, setFotoSebelum)} />
                         </label>
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="block text-xs font-bold text-center text-slate-400">FOTO SESUDAH</label>
                       {fotoSesudah ? (
                         <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-600">
                           <img src={fotoSesudah} className="w-full h-full object-cover" alt="Sesudah" />
                           <button onClick={() => setFotoSesudah(null)} className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg"><X size={16}/></button>
                         </div>
                       ) : (
                         <label className="cursor-pointer aspect-square bg-[#1e293b] border border-dashed border-slate-600 hover:border-sky-500 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 transition-colors">
                           <Camera size={24} />
                           <span className="text-[10px] font-medium text-center px-2">Ambil Foto Bersih</span>
                           <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImageUpload(e, setFotoSesudah)} />
                         </label>
                       )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setWizardStep(3)}
                    disabled={!fotoSebelum || !fotoSesudah || !kondisiAwal}
                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg mt-8"
                  >
                    LANJUT KE TAHAP PENYELESAIAN
                  </button>
               </div>
             )}

             {wizardStep === 3 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-white">Catatan Tambahan (Opsional):</label>
                    <textarea 
                      placeholder="Misal: Customer nambah pesanan bayar tunai / transfer ke rekening kantor"
                      rows={2} 
                      className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-4 py-3 text-white"
                      value={catatanTeknisi}
                      onChange={(e) => setCatatanTeknisi(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="bg-[#1e293b] border border-slate-600 rounded-2xl p-5 space-y-5 shadow-inner">
                    <h4 className="text-center font-bold text-white">CUSTOMER REVIEW</h4>
                    
                    <div className="space-y-2">
                       <div className="text-center text-sm text-slate-400 font-medium">Beri Rating Pelayanan</div>
                       <div className="flex justify-center gap-2">
                         {[1, 2, 3, 4, 5].map(star => (
                           <button key={star} onClick={() => setRating(star)} className={`p-1 transition-transform ${rating >= star ? 'text-amber-400 scale-110' : 'text-slate-600'}`}>
                              <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <div className="text-sm text-slate-400 font-medium tracking-tight">Tanda Tangan Pelanggan</div>
                         <button onClick={clearSignature} className="text-[10px] text-sky-400 px-2 py-1 rounded bg-sky-400/10">Ulangi Hapus</button>
                       </div>
                       <SignaturePad onReady={setSignatureCanvas} onClear={setClearSignature} />
                       <p className="text-[10px] text-center text-slate-500">Dengan menandatangani, pelanggan setuju barang telah kembali dalam kondisi baik & bersih sesuai SOP.</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmitSPK}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 text-lg flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    <CheckCircle2 size={24} /> SUBMIT LAPORAN PEKERJAAN
                  </button>
                  <button 
                    onClick={() => setWizardStep(2)}
                    className="w-full bg-transparent text-slate-400 font-medium py-3 text-sm"
                  >
                    Kembali
                  </button>
               </div>
             )}
           </div>
        </div>
      )}

      {/* Voucher Settings Modal */}
      {showVoucherSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 Atur Voucher Diskon
               </h3>
               <button onClick={() => setShowVoucherSettings(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                 {vouchers.map((v: any, idx: number) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <input 
                         type="text"
                         value={v.code}
                         onChange={e => {
                            const temp = [...vouchers];
                            temp[idx].code = e.target.value.toUpperCase();
                            setVouchers(temp);
                         }}
                         className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold w-full mb-2 uppercase"
                         placeholder="KODE VOUCHER"
                       />
                       <div className="flex gap-2">
                         <select 
                            value={v.type}
                            onChange={e => {
                               const temp = [...vouchers];
                               temp[idx].type = e.target.value;
                               // Reset disc based on type
                               temp[idx].disc = e.target.value === 'percent' ? 0.10 : 50000;
                               setVouchers(temp);
                            }}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-300 text-sm w-1/3"
                         >
                            <option value="percent">Persen (%)</option>
                            <option value="fixed">Rupiah (Rp)</option>
                         </select>
                         <input 
                           type="number"
                           value={v.type === 'percent' ? v.disc * 100 : v.disc}
                           onChange={e => {
                              const temp = [...vouchers];
                              temp[idx].disc = v.type === 'percent' ? Number(e.target.value) / 100 : Number(e.target.value);
                              setVouchers(temp);
                           }}
                           className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white flex-1"
                           placeholder="Nominal"
                         />
                       </div>
                       <div className="mt-2 text-right">
                         <button 
                           onClick={() => {
                             const temp = vouchers.filter((_, i) => i !== idx);
                             setVouchers(temp);
                           }}
                           className="text-red-400 text-xs hover:underline"
                         >
                            Hapus
                         </button>
                       </div>
                    </div>
                 ))}
              </div>
              
              <button 
                 onClick={() => {
                   setVouchers([...vouchers, { code: 'NEW_CODE', disc: 0.1, type: 'percent', label: 'Diskon Baru' }]);
                 }}
                 className="w-full border border-dashed border-slate-600 text-slate-400 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                  <Plus size={16} /> Tambah Voucher
              </button>
              
              <div className="pt-4 mt-2 border-t border-slate-800">
                <button 
                  onClick={() => {
                     // Add labels to vouchers
                     const labeled = vouchers.map(v => ({
                        ...v,
                        label: v.type === 'percent' ? `Diskon ${Math.round(v.disc * 100)}%` : `Diskon Rp ${v.disc.toLocaleString('id-ID')}`
                     }));
                     localStorage.setItem('hagia-vouchers', JSON.stringify(labeled));
                     setShowVoucherSettings(false);
                     alert('Voucher berhasil disimpan!');
                  }}
                  className="w-full bg-[#0069b4] hover:bg-[#005a9c] text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
