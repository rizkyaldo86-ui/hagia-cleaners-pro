import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Plus, Minus, MapPin, Calendar as CalendarIcon, Clock, Percent, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';
import { PRICELIST } from '../data/pricelist';

interface CartItem {
  name: string;
  price: number;
  qty: number;
}

interface PublicBookingFormProps {
  isAdminMode?: boolean;
  onClose?: () => void;
}

export default function PublicBookingForm({ isAdminMode, onClose }: PublicBookingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    gpsLink: ''
  });
  
  const [schedule, setSchedule] = useState({
    date: '',
    slot: '' // "10:00" | "14:00"
  });

  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Reset cart when category changes to keep it simple, or we can keep it.
    // Let's keep it to allow multi-category if needed, but UI flow implies 1 category per booking.
    setCart([]);
    setStep(2);
  };

  const updateCartQty = (item: { name: string, price: number }, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter(i => i.name !== item.name);
        return prev.map(i => i.name === item.name ? { ...i, qty: newQty } : i);
      } else if (delta > 0) {
        return [...prev, { ...item, qty: delta }];
      }
      return prev;
    });
  };

  const getQty = (itemName: string) => {
    return cart.find(i => i.name === itemName)?.qty || 0;
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const isMover = selectedCategory === 'HAGIA CLEAN MOVER';
  const dpPercentage = isMover ? 0.25 : 0.10;
  
  const total = subtotal - discountAmount;
  const dpAmount = total * dpPercentage;

  const handleCheckVoucher = () => {
    const defaultVouchers = [
      { code: 'RAYA10', disc: 0.10, type: 'percent', label: 'Diskon 10%' },
      { code: 'FLASH50', disc: 50000, type: 'fixed', label: 'Diskon Rp 50.000' }
    ];
    
    let savedVouchers = [];
    try {
      const stored = localStorage.getItem('hagia-vouchers');
      if (stored) {
        savedVouchers = JSON.parse(stored);
      } else {
        savedVouchers = defaultVouchers;
        localStorage.setItem('hagia-vouchers', JSON.stringify(defaultVouchers));
      }
    } catch {
      savedVouchers = defaultVouchers;
    }

    const checkCode = voucherCode.toUpperCase();
    const found = savedVouchers.find((v: any) => v.code === checkCode);

    if (found) {
      if (found.type === 'percent') {
        setDiscountAmount(subtotal * found.disc);
        alert(`Voucher ${found.code} berhasil diaplikasikan! ${found.label}`);
      } else {
        setDiscountAmount(found.disc);
        alert(`Voucher ${found.code} berhasil diaplikasikan! ${found.label}`);
      }
    } else {
      setDiscountAmount(0);
      alert('Kode voucher tidak valid atau kedaluwarsa.');
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerInfo(prev => ({
            ...prev,
            gpsLink: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
          }));
        },
        () => {
          alert('Gagal mengambil lokasi GPS. Pastikan izin lokasi diaktifkan.');
        }
      );
    }
  };

  const checkSlotAvailability = (date: string, time: string) => {
    const saved = localStorage.getItem('hagia-spk-bookings');
    if (!saved) return true;
    
    try {
      const bookings = JSON.parse(saved);
      // Map 10:00 to Jadwal 1, 14:00 to Jadwal 2
      const jadwalStr = time === '10:00' ? "Jadwal 1 (10:00 WIB)" : "Jadwal 2 (14:00 WIB)";
      
      const slotsTaken = bookings.filter((b: any) => b.tanggal === date && b.jadwal === jadwalStr).length;
      return slotsTaken < 5; // Max 5 slots per schedule timing
    } catch {
      return true;
    }
  };

  const findAvailableSlotName = (bookings: any[], date: string, jadwalStr: string) => {
    for (let i = 1; i <= 5; i++) {
       const slotName = `Slot Antrean ${i}`;
       const exists = bookings.find((b: any) => b.namaTim === slotName && b.jadwal === jadwalStr && b.tanggal === date);
       if (!exists) return slotName;
    }
    return `Slot Antrean 1`;
  };

  const handleNextStep4 = () => {
    if (!schedule.date || !schedule.slot) {
      alert("Pilih tanggal dan jadwal jam terlebih dahulu.");
      return;
    }
    const isAvailable = checkSlotAvailability(schedule.date, schedule.slot);
    if (!isAvailable) {
      alert(`Mohon maaf, slot jam ${schedule.slot} pada tanggal tersebut sudah penuh. Silakan pilih tanggal atau jam lain.`);
      return;
    }
    setStep(5);
  };

  const handleSubmit = () => {
    // Save locally (Otomatis masuk kalender jika yang isi admin)
    const saved = localStorage.getItem('hagia-spk-bookings');
    let bookings = saved ? JSON.parse(saved) : [];
    const jadwalStr = schedule.slot === '10:00' ? "Jadwal 1 (10:00 WIB)" : "Jadwal 2 (14:00 WIB)";
    
    // Find available slot
    let targetSlot = `Slot Antrean 1`;
    for (let i = 1; i <= 5; i++) {
       const slotName = `Slot Antrean ${i}`;
       if (!bookings.find((b: any) => b.namaTim === slotName && b.jadwal === jadwalStr && b.tanggal === schedule.date)) {
           targetSlot = slotName;
           break;
       }
    }

    bookings.push({
      id: `SPK-${Date.now()}`,
      tanggal: schedule.date,
      jadwal: jadwalStr,
      namaTim: targetSlot,
      namaOperasional: '-', // Belum ditugaskan
      namaCustomer: customerInfo.name,
      noTelpCustomer: customerInfo.phone,
      layanan: selectedCategory,
      detailLayanan: cart.map(i => `${i.qty}x ${i.name}`).join(', '),
      alamatSharelok: customerInfo.gpsLink,
      alamatDetail: customerInfo.address,
      status: 'Scheduled',
    });
    localStorage.setItem('hagia-spk-bookings', JSON.stringify(bookings));

    if (isAdminMode) {
      alert('Booking berhasil masuk ke kalender!');
      if (onClose) onClose();
      // Optionally trigger global reload or let the calendar component re-fetch bookings from local storage
      window.dispatchEvent(new Event('storage')); // Let the calendar know local storage changed (if it listens) or we can just let state reload
      return;
    }

    // Make WA Message
    const encodedItems = cart.map(item => `- ${item.name} (x${item.qty}) = ${formatPrice(item.price * item.qty)}`).join('%0A');
    
    let msg = `Halo Raya! 👋 Saya ingin mengamankan jadwal pengerjaan Hagia Cleaners.%0A%0A`;
    msg += `*DETAIL BOOKING:*%0ANama: ${customerInfo.name}%0ANo. WA: ${customerInfo.phone}%0AAlamat: ${customerInfo.address}%0ALink Lokasi: ${customerInfo.gpsLink}%0AJadwal: ${schedule.date} - ${schedule.slot} WIB%0A%0A`;
    msg += `*LAYANAN: ${selectedCategory}*%0A${encodedItems}%0A%0A`;
    msg += `Subtotal: ${formatPrice(subtotal)}%0A`;
    if (discountAmount > 0) {
      msg += `Diskon (${voucherCode}): - ${formatPrice(discountAmount)}%0A`;
    }
    msg += `*Total Biaya: ${formatPrice(total)}*%0A%0A`;
    msg += `*DP ${dpPercentage * 100}%: ${formatPrice(dpAmount)}*%0A%0A`;
    msg += `Mohon informasikan link Payment Gateway untuk pembayaran DP ya Kak. Terima kasih! 🙏 #pastibisabaHAGIA`;

    window.open(`https://wa.me/628118169960?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#0069b4] selection:text-white pb-24">
      {/* Header Mobile First */}
      <header className="bg-[#0069b4] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             {step > 1 && (
               <button onClick={() => setStep(step - 1)} className="p-1 hover:bg-white/20 text-white rounded-full transition-colors">
                  <ArrowLeft size={20} />
               </button>
             )}
             <h1 className="font-black text-xl tracking-tight">HAGIA<span className="text-[#a9cf48]">CLEANERS</span></h1>
          </div>
          <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">Step {step}/5</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-200">
        <div className="h-full bg-[#a9cf48] transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }}></div>
      </div>

      <main className="max-w-md mx-auto p-4 pt-6 space-y-6">
        
        {/* STEP 1: Categories */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black text-[#0069b4] mb-2 leading-tight">Pilih Layanan Pilihan Anda</h2>
            <p className="text-slate-500 text-sm mb-6">Pilih satu kategori utama untuk melihat daftar harga spesifik.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {Object.keys(PRICELIST).map(category => (
                <button 
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="bg-white border-2 border-slate-100 hover:border-[#0069b4] rounded-2xl p-4 flex items-center justify-between text-left shadow-sm transition-all active:scale-95"
                >
                  <div className="font-black text-slate-700 text-lg">{category}</div>
                  <div className="bg-[#f1f5f9] p-2 rounded-xl text-[#0069b4]">
                    <ChevronRight size={20} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Items & Qty */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-[#0069b4] mb-1">{selectedCategory}</h2>
            <div className="inline-flex items-center gap-1.5 bg-[#e0f2fe] text-[#0284c7] px-3 py-1 rounded-lg text-xs font-bold mb-6">
              <ShieldCheck size={14} /> WET & DRY CLEANING VACUUM | FOOD GRADE
            </div>

            <div className="space-y-3">
              {PRICELIST[selectedCategory].map((item: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-[#0069b4] font-black text-sm mt-0.5">{formatPrice(item.price)}</div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button 
                      onClick={() => updateCartQty(item, -1)}
                      className={`p-2 rounded-lg ${getQty(item.name) > 0 ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-300'}`}
                      disabled={getQty(item.name) === 0}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-black w-4 text-center">{getQty(item.name)}</span>
                    <button 
                      onClick={() => updateCartQty(item, 1)}
                      className="p-2 rounded-lg bg-[#0069b4] text-white shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-6">
               <div className="flex justify-between items-center mb-6">
                 <span className="font-bold text-slate-500">Subtotal Sementara</span>
                 <span className="font-black text-2xl text-[#0069b4]">{formatPrice(subtotal)}</span>
               </div>
               <button 
                 onClick={() => setStep(3)}
                 disabled={subtotal === 0}
                 className="w-full bg-[#a9cf48] hover:bg-[#96bc3b] disabled:opacity-50 disabled:grayscale text-slate-900 font-black py-4 rounded-2xl text-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all"
               >
                 LANJUT ISI DATA DIRI <ChevronRight size={20} />
               </button>
            </div>
          </div>
        )}

        {/* STEP 3: Customer Info */}
        {step === 3 && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
             <h2 className="text-2xl font-black text-[#0069b4] mb-4">Informasi Kontak & Lokasi</h2>
             
             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
               <input 
                 autoFocus
                 type="text" 
                 required
                 value={customerInfo.name}
                 onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                 className="w-full bg-white border-2 border-slate-200 focus:border-[#0069b4] rounded-xl px-4 py-3 text-slate-800 outline-none transition-colors"
                 placeholder="Contoh: Bpk. Ahmad"
               />
             </div>

             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700">Nomor WhatsApp Aktif</label>
               <input 
                 type="tel" 
                 required
                 value={customerInfo.phone}
                 onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                 className="w-full bg-white border-2 border-slate-200 focus:border-[#0069b4] rounded-xl px-4 py-3 text-slate-800 outline-none transition-colors"
                 placeholder="0812xxxxxxxx"
               />
             </div>

             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700">Alamat Lengkap Sesuai Lokasi</label>
               <textarea 
                 rows={3}
                 required
                 value={customerInfo.address}
                 onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                 className="w-full bg-white border-2 border-slate-200 focus:border-[#0069b4] rounded-xl px-4 py-3 text-slate-800 outline-none transition-colors resize-none"
                 placeholder="Contoh: Cluster Mawar No. 12, RT 01/RW 02. Patokan: Pagar Hitam"
               />
             </div>

             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700">Sharelok GPS (Wajib)</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   required
                   value={customerInfo.gpsLink}
                   onChange={e => setCustomerInfo({...customerInfo, gpsLink: e.target.value})}
                   className="flex-1 bg-white border-2 border-slate-200 focus:border-[#0069b4] rounded-xl px-4 py-3 text-slate-800 outline-none transition-colors text-sm"
                   placeholder="https://maps.google.com/..."
                 />
                 <button type="button" onClick={handleGetLocation} className="bg-[#e0f2fe] text-[#0284c7] px-4 rounded-xl font-bold flex items-center justify-center hover:bg-[#bae6fd] transition-colors" title="Ambil Lokasi Saat Ini">
                    <Navigation size={20} />
                 </button>
               </div>
               <p className="text-[10px] text-slate-500">Klik ikon kompas untuk otomatis mengambil lokasi Anda.</p>
             </div>

             <button 
                 onClick={() => setStep(4)}
                 disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.gpsLink}
                 className="w-full mt-6 bg-[#0069b4] hover:bg-[#005a9c] disabled:opacity-50 text-white font-black py-4 rounded-2xl text-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all"
               >
                 PILIH JADWAL <CalendarIcon size={20} />
              </button>
           </div>
        )}

        {/* STEP 4: Schedule */}
        {step === 4 && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
             <h2 className="text-2xl font-black text-[#0069b4] mb-4">Pilih Tanggal & Waktu Kedatangan</h2>
             
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><CalendarIcon size={16}/> Tanggal Survey/Pengerjaan</label>
               <input 
                 type="date" 
                 min={new Date().toISOString().split('T')[0]} // Can't book past
                 value={schedule.date}
                 onChange={e => setSchedule({...schedule, date: e.target.value})}
                 className="w-full bg-white border-2 border-slate-200 focus:border-[#0069b4] rounded-xl px-4 py-3 text-slate-800 outline-none transition-colors font-black text-lg"
               />
             </div>

             <div className="space-y-3 pt-4">
               <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Clock size={16}/> Slot Waktu yang Tersedia</label>
               
               <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setSchedule({...schedule, slot: '10:00'})}
                   className={`p-4 rounded-2xl border-2 text-center transition-all ${schedule.slot === '10:00' ? 'bg-[#0069b4] border-[#0069b4] text-white shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-[#0069b4]'}`}
                 >
                   <div className="font-black text-xl mb-1">10:00</div>
                   <div className="text-xs opacity-80">Waktu Kedatangan</div>
                 </button>
                 
                 <button 
                   onClick={() => setSchedule({...schedule, slot: '14:00'})}
                   className={`p-4 rounded-2xl border-2 text-center transition-all ${schedule.slot === '14:00' ? 'bg-[#0069b4] border-[#0069b4] text-white shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-[#0069b4]'}`}
                 >
                   <div className="font-black text-xl mb-1">14:00</div>
                   <div className="text-xs opacity-80">Waktu Kedatangan</div>
                 </button>
               </div>
               <p className="text-xs text-center text-slate-500 mt-2">*Hanya melayani maksimum 5 antrean per slot waktu per harinya.</p>
             </div>

             <div className="mt-8">
               <button 
                 onClick={handleNextStep4}
                 className="w-full bg-[#a9cf48] hover:bg-[#96bc3b] text-slate-900 font-black py-4 rounded-2xl text-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all"
               >
                 REVIEW PESANAN & CHECKOUT <ChevronRight size={20} />
               </button>
             </div>
           </div>
        )}

        {/* STEP 5: Summary & Checkout */}
        {step === 5 && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 pb-8">
             <div className="text-center">
                <div className="w-16 h-16 bg-[#e0f2fe] text-[#0284c7] rounded-full flex items-center justify-center mx-auto mb-3">
                   <Clock size={32} />
                </div>
                <h2 className="text-2xl font-black text-[#0069b4]">Konfirmasi Terakhir</h2>
                <p className="text-slate-500 text-sm">Pastikan rincian berikut sudah benar.</p>
             </div>

             {/* Rincian Customer & Jadwal */}
             <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div>
                   <div className="text-xs text-slate-500">Nama Pelanggan</div>
                   <div className="font-bold text-slate-800">{customerInfo.name} <span className="font-normal text-slate-500 text-sm">({customerInfo.phone})</span></div>
                </div>
                <div className="border-t border-slate-100 pt-2">
                   <div className="text-xs text-slate-500">Jadwal Kedatangan</div>
                   <div className="font-black text-[#0069b4] text-lg">{schedule.date} | Jam {schedule.slot} WIB</div>
                </div>
                <div className="border-t border-slate-100 pt-2">
                   <div className="text-xs text-slate-500">Alamat</div>
                   <div className="font-semibold text-slate-700 text-sm">{customerInfo.address}</div>
                </div>
             </div>

             {/* Rincian Layanan */}
             <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-black text-slate-800 mb-3 border-b border-slate-100 pb-2">Rincian Item</h3>
                <div className="space-y-2 mb-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="text-slate-600"><span className="font-bold text-slate-800">{item.qty}x</span> {item.name}</div>
                      <div className="font-medium text-slate-800">{formatPrice(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm font-bold text-slate-600 mb-2">
                   <span>Subtotal</span>
                   <span>{formatPrice(subtotal)}</span>
                </div>

                {/* Voucher Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex gap-2 mb-4">
                  <div className="relative flex-1">
                     <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                        type="text" 
                        value={voucherCode}
                        onChange={e => setVoucherCode(e.target.value)}
                        placeholder="Kode Voucher (Jika Ada)" 
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm uppercase outline-none focus:border-[#0069b4]"
                     />
                  </div>
                  <button onClick={handleCheckVoucher} className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg font-bold text-sm transition-colors">
                     Pakai
                  </button>
                </div>

                {/* Diskon */}
                {discountAmount > 0 && (
                   <div className="flex justify-between items-center text-sm font-bold text-[#a9cf48] mb-3 border-b border-slate-100 pb-2">
                     <span>Diskon ({voucherCode})</span>
                     <span>- {formatPrice(discountAmount)}</span>
                   </div>
                )}

                {/* Total Akhir */}
                <div className="flex justify-between items-end border-t-2 border-dashed border-slate-200 pt-3">
                   <span className="font-bold text-slate-500">Total Biaya</span>
                   <span className="font-black text-3xl text-[#0069b4]">{formatPrice(total)}</span>
                </div>
             </div>

             {/* DP Alert */}
             <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-2xl">
                <div className="flex gap-3">
                   <div className="text-amber-500 mt-0.5"><ShieldCheck size={20}/></div>
                   <div>
                     <h4 className="font-bold text-amber-900 leading-tight mb-1">Syarat Penguncian Jadwal</h4>
                     <p className="text-xs text-amber-800 mb-2">
                       Sesuai kebijakan Hagia Cleaners untuk menghindari "Hit & Run", dimohon membayarkan DP {dpPercentage * 100}% agar jadwal tim di kalender resmi terkunci.
                     </p>
                     <div className="font-black text-amber-900 bg-amber-100 inline-block px-3 py-1.5 rounded-lg border border-amber-200">
                        Total DP: {formatPrice(dpAmount)}
                     </div>
                   </div>
                </div>
             </div>

             <div className="pt-4">
               <button 
                 onClick={handleSubmit}
                 className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-green-500/30 flex justify-center items-center gap-2 transform active:scale-95 transition-all"
               >
                 AMANKAN JADWAL (Via WhatsApp) <CheckCircle2 size={24} />
               </button>
               <p className="text-xs text-center text-slate-500 mt-3 flex items-center justify-center gap-1">
                 Aman & Terenkripsi <ShieldCheck size={12}/>
               </p>
             </div>
           </div>
        )}

      </main>
    </div>
  );
}
