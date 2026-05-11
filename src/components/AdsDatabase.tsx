import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  ChevronDown,
  Filter,
  Check,
  Search,
  Download,
  Database
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

export default function AdsDatabase() {
  const [activeDateFilter, setActiveDateFilter] = useState("Semua Waktu");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterCol, setActiveFilterCol] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  const [data, setData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'} | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedCampaignStr = localStorage.getItem('hagia-campaign-data');
    const savedLeadsStr = localStorage.getItem('hagia-leads-data');
    
    let campaignData = [];
    let leadsData = [];
    
    try { if (savedCampaignStr) campaignData = JSON.parse(savedCampaignStr); } catch (e) {}
    try { if (savedLeadsStr) leadsData = JSON.parse(savedLeadsStr); } catch (e) {}
    
    const aggregated = aggregateDataByDate(campaignData, leadsData);
    setData(aggregated);
  }, []);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
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

  const aggregateDataByDate = (campaignData: any[], leadsData: any[]) => {
    const grouped: Record<string, any> = {};

    const getNum = (val: any) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      let str = String(val).trim().toUpperCase().replace(/RP/g, '').replace(/\s/g, '');
      if (str.includes('.') && str.includes(',')) {
        if (str.lastIndexOf(',') > str.lastIndexOf('.')) str = str.replace(/\./g, '').replace(',', '.');
        else str = str.replace(/,/g, '');
      } else if (str.includes(',')) {
        const parts = str.split(',');
        if (parts.length === 2 && parts[1].length <= 2) str = str.replace(',', '.');
        else str = str.replace(/,/g, '');
      } else if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length > 2) str = str.replace(/\./g, '');
        else if (parts.length === 2 && parts[1].length === 3) str = str.replace(/\./g, '');
      }
      return parseFloat(str.replace(/[^0-9.-]/g, '')) || 0;
    };

    const normalizeDateStr = (dateStr: string) => {
       const parsed = parseDate(dateStr);
       if (!parsed) return 'Unknown Date';
       const yyyy = parsed.getFullYear();
       const mm = String(parsed.getMonth() + 1).padStart(2, '0');
       const dd = String(parsed.getDate()).padStart(2, '0');
       return `${yyyy}-${mm}-${dd}`;
    };

    const initializeGroup = (date: string) => {
      if (!grouped[date]) {
         grouped[date] = {
           tanggal: date,
           id: date,
           biayaIklan: 0, impresi: 0, reach: 0, klikTautanSemua: 0,
           kunjunganProfilIG: 0, hasilKlikTautan: 0, percakapanPesanDiMulai: 0,
           dmIGFB: 0, komentarIGFB: 0, ketukanSitusWebRate: 0, ketukanSitusWeb: 0,
           pengunjungDestyPageInstagram: 0, klikDestyPageInstagram: 0, totalLeadsIklan: 0,
           biayaIklanBed: 0, biayaIklanLiving: 0, biayaIklanCleanMover: 0, biayaIklanAuto: 0, biayaIklanLainnya: 0,
           closingBed: 0, closingLiving: 0, closingCleanMover: 0, closingAuto: 0, closingLainnya: 0, totalClosing: 0, totalClosingIklan: 0,
           leadBed: 0, leadLiving: 0, leadCleanMover: 0, leadAuto: 0, leadLainnya: 0, totalAllLeads: 0,
           salesBed: 0, salesLiving: 0, salesCleanMover: 0, salesAuto: 0, salesLainnya: 0, totalSales: 0, totalSalesIklan: 0,
           leadsIklanWA: 0, leadsIGWA: 0, leadsDM: 0
         };
      }
    };

    campaignData.forEach(row => {
      const date = normalizeDateStr(row.tanggal);
      initializeGroup(date);
      const g = grouped[date];
      
      const bIklan = getNum(row.biayaIklan);
      g.biayaIklan += bIklan;
      g.impresi += getNum(row.impresi);
      g.reach += getNum(row.reach);
      g.klikTautanSemua += getNum(row.klikTautanSemua);
      g.kunjunganProfilIG += getNum(row.kunjunganProfilIG);
      g.hasilKlikTautan += getNum(row.hasilKlikTautan);
      g.percakapanPesanDiMulai += getNum(row.percakapanPesanDiMulai);
      g.dmIGFB += getNum(row.dmIGFB);
      g.komentarIGFB += getNum(row.komentarIGFB);
      g.totalLeadsIklan += getNum(row.totalLeadsIklan);
      g.ketukanSitusWeb += getNum(row.ketukanSitusWeb);
      g.pengunjungDestyPageInstagram += getNum(row.pengunjungDestyPageInstagram);
      g.klikDestyPageInstagram += getNum(row.klikDestyPageInstagram);

      const L = String(row.layanan || '').toLowerCase();
      if (L.includes('bed')) g.biayaIklanBed += bIklan;
      else if (L.includes('living')) g.biayaIklanLiving += bIklan;
      else if (L.includes('clean')) g.biayaIklanCleanMover += bIklan;
      else if (L.includes('auto')) g.biayaIklanAuto += bIklan;
      else g.biayaIklanLainnya += bIklan;
    });

    leadsData.forEach(row => {
       const date = normalizeDateStr(row.tanggal);
       initializeGroup(date);
       const g = grouped[date];

       const L = String(row.layanan || '').toLowerCase();
       const isBed = L.includes('bed');
       const isLiving = L.includes('living');
       const isClean = L.includes('clean');
       const isAuto = L.includes('auto');

       g.totalAllLeads += 1;

       const asal = String(row.asalLeads || '').toLowerCase();
       const isIklanWA = asal.includes('iklan fb') || asal.includes('fb ads') || asal.includes('iklan ig') || asal.includes('ig ads') || asal.includes('iklan wa');
       
       if (isIklanWA) {
         g.leadsIklanWA += 1;
         if (isBed) g.leadBed += 1;
         else if (isLiving) g.leadLiving += 1;
         else if (isClean) g.leadCleanMover += 1;
         else if (isAuto) g.leadAuto += 1;
         else g.leadLainnya += 1;
       }

       if (asal.includes('ig wa') || asal.includes('instagram wa') || asal.includes('instagram whatsapp')) g.leadsIGWA += 1;
       if (asal.includes('dm')) g.leadsDM += 1;

       const isC = String(row.closing || '').toLowerCase().includes('close');
       const isSF = String(row.statusFollowUp || '').toLowerCase().includes('closing');
       const n = getNum(row.nominalClosing);
       const isClosed = isC || isSF || n > 0;

       if (isClosed) {
          g.totalClosing += 1;
          g.totalSales += n;
          
          if (isIklanWA) {
            g.totalClosingIklan += 1;
            g.totalSalesIklan += n;
            if (isBed) { g.closingBed += 1; g.salesBed += n; }
            else if (isLiving) { g.closingLiving += 1; g.salesLiving += n; }
            else if (isClean) { g.closingCleanMover += 1; g.salesCleanMover += n; }
            else if (isAuto) { g.closingAuto += 1; g.salesAuto += n; }
            else { g.closingLainnya += 1; g.salesLainnya += n; }
          }
       }
    });

    const formatIdDate = (dateStr: string) => {
       if (dateStr === 'Unknown Date') return dateStr;
       const d = new Date(dateStr);
       const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
       return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const formatCurr = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const formatNum = (val: number) => {
        return new Intl.NumberFormat('id-ID').format(val);
    };

    const formatPct = (val: number) => {
        if (!isFinite(val)) return '0%';
        return val.toFixed(0) + '%';
    };

    const formatPctDec = (val: number) => {
        if (!isFinite(val)) return '0.00%';
        return val.toFixed(2) + '%';
    };

    const aggregatedArray = Object.values(grouped).map(row => {
      const g = row;
      const frekuensi = g.reach > 0 ? (g.impresi / g.reach).toFixed(2) : "0";
      const cpc = g.hasilKlikTautan > 0 ? Math.round(g.biayaIklan / g.hasilKlikTautan) : 0;
      const ctrRasio = g.impresi > 0 ? (g.hasilKlikTautan / g.impresi) * 100 : 0;
      const ctrSemua = g.impresi > 0 ? (g.klikTautanSemua / g.impresi) * 100 : 0;
      const cpm = g.impresi > 0 ? Math.round((g.biayaIklan / g.impresi) * 1000) : 0;
      
      const totalKeseluruhanLeads = g.leadsIklanWA + g.leadsIGWA + g.leadsDM;
      const crWhatsapp = g.hasilKlikTautan > 0 ? (g.leadsIklanWA / g.hasilKlikTautan) * 100 : 0;
      const crKeseluruhan = g.hasilKlikTautan > 0 ? (totalKeseluruhanLeads / g.hasilKlikTautan) * 100 : 0;
      
      const biayaPerHasil = g.hasilKlikTautan > 0 ? Math.round(g.biayaIklan / g.hasilKlikTautan) : 0;
      const biayaPerPercakapan = g.percakapanPesanDiMulai > 0 ? Math.round(g.biayaIklan / g.percakapanPesanDiMulai) : 0;
      const biayaPerKeseluruhanLead = totalKeseluruhanLeads > 0 ? Math.round(g.biayaIklan / totalKeseluruhanLeads) : 0;
      const biayaPerImpresi = g.impresi > 0 ? Math.round(g.biayaIklan / g.impresi) : 0;
      const biayaPerReach = g.reach > 0 ? Math.round(g.biayaIklan / g.reach) : 0;
      const biayaPerLeadWA = g.leadsIklanWA > 0 ? Math.round(g.biayaIklan / g.leadsIklanWA) : 0;
      const biayaPerClosing = g.totalClosing > 0 ? Math.round(g.biayaIklan / g.totalClosing) : 0;
      
      const pIklanSales = g.totalSales > 0 ? (g.biayaIklan / g.totalSales) * 100 : 0;
      
      const totalLeadIklan = g.leadBed + g.leadLiving + g.leadCleanMover + g.leadAuto + g.leadLainnya;
      const closingRateBed = g.leadBed > 0 ? (g.closingBed / g.leadBed) * 100 : 0;
      const closingRateLiving = g.leadLiving > 0 ? (g.closingLiving / g.leadLiving) * 100 : 0;
      const closingRateCleanMover = g.leadCleanMover > 0 ? (g.closingCleanMover / g.leadCleanMover) * 100 : 0;
      const closingRateAuto = g.leadAuto > 0 ? (g.closingAuto / g.leadAuto) * 100 : 0;
      const closingRateLainnya = g.leadLainnya > 0 ? (g.closingLainnya / g.leadLainnya) * 100 : 0;
      const rataClosingRate = totalLeadIklan > 0 ? (g.totalClosingIklan / totalLeadIklan) * 100 : 0;
      const overallClosingRate = g.totalAllLeads > 0 ? (g.totalClosing / g.totalAllLeads) * 100 : 0;

      const roasBed = g.biayaIklanBed > 0 ? (g.salesBed / g.biayaIklanBed) : 0;
      const roasLiving = g.biayaIklanLiving > 0 ? (g.salesLiving / g.biayaIklanLiving) : 0;
      const roasCleanMover = g.biayaIklanCleanMover > 0 ? (g.salesCleanMover / g.biayaIklanCleanMover) : 0;
      const roasAuto = g.biayaIklanAuto > 0 ? (g.salesAuto / g.biayaIklanAuto) : 0;
      const roasLainnya = g.biayaIklanLainnya > 0 ? (g.salesLainnya / g.biayaIklanLainnya) : 0;
      const roasKeseluruhan = g.biayaIklan > 0 ? (g.totalSales / g.biayaIklan) : 0;

      return {
        id: g.id,
        parsedDate: parseDate(g.tanggal),
        tanggal: formatIdDate(g.tanggal),
        biayaIklan: formatCurr(g.biayaIklan),
        impresi: formatNum(g.impresi),
        reach: formatNum(g.reach),
        klikTautanSemua: formatNum(g.klikTautanSemua),
        kunjunganProfilIG: formatNum(g.kunjunganProfilIG),
        hasilKlikTautan: formatNum(g.hasilKlikTautan),
        percakapanPesanDiMulai: formatNum(g.percakapanPesanDiMulai),
        dmIGFB: formatNum(g.dmIGFB),
        komentarIGFB: formatNum(g.komentarIGFB),
        frekuensi: frekuensi,
        cpc: formatCurr(cpc),
        ctrRasio: formatPctDec(ctrRasio),
        ctrSemua: formatPctDec(ctrSemua),
        cpm: formatCurr(cpm),
        totalKeseluruhanLeads: formatNum(totalKeseluruhanLeads),
        crWhatsapp: formatPct(crWhatsapp),
        crKeseluruhan: formatPct(crKeseluruhan),
        biayaPerHasil: formatCurr(biayaPerHasil),
        biayaPerPercakapan: formatCurr(biayaPerPercakapan),
        biayaPerKeseluruhanLead: formatCurr(biayaPerKeseluruhanLead),
        biayaPerImpresi: formatCurr(biayaPerImpresi),
        biayaPerReach: formatCurr(biayaPerReach),
        ctrKlikTautan: formatPctDec(ctrRasio),
        biayaPerLeadWA: formatCurr(biayaPerLeadWA),
        biayaPerClosing: formatCurr(biayaPerClosing),
        persentaseIklanSales: formatPct(pIklanSales),
        
        ketukanSitusWebRate: formatPct(g.ketukanSitusWebRate),
        ketukanSitusWeb: formatNum(g.ketukanSitusWeb),
        pengunjungDestyPage: formatNum(g.pengunjungDestyPageInstagram),
        klikDestyPage: formatNum(g.klikDestyPageInstagram),
        
        totalClosing: formatNum(g.totalClosing),
        closingRate: formatPct(overallClosingRate),
        totalSales: formatCurr(g.totalSales),
        roasKeseluruhan: formatNum(Math.round(roasKeseluruhan)),
        
        biayaIklanBed: formatCurr(g.biayaIklanBed),
        biayaIklanLiving: formatCurr(g.biayaIklanLiving),
        biayaIklanCleanMover: formatCurr(g.biayaIklanCleanMover),
        biayaIklanAuto: formatCurr(g.biayaIklanAuto),
        biayaIklanLainnya: formatCurr(g.biayaIklanLainnya),
        totalBiayaIklanLabel: formatCurr(g.biayaIklan),
        
        closingBed: formatNum(g.closingBed),
        closingLiving: formatNum(g.closingLiving),
        closingCleanMover: formatNum(g.closingCleanMover),
        closingAuto: formatNum(g.closingAuto),
        closingLainnya: formatNum(g.closingLainnya),
        totalClosingIklanLabel: formatNum(g.totalClosingIklan),
        
        leadBed: formatNum(g.leadBed),
        leadLiving: formatNum(g.leadLiving),
        leadCleanMover: formatNum(g.leadCleanMover),
        leadAuto: formatNum(g.leadAuto),
        leadLainnya: formatNum(g.leadLainnya),
        totalLeadIklanLabel: formatNum(totalLeadIklan),

        crBed: formatPct(closingRateBed),
        crLiving: formatPct(closingRateLiving),
        crCleanMover: formatPct(closingRateCleanMover),
        crAuto: formatPct(closingRateAuto),
        crLainnya: formatPct(closingRateLainnya),
        rataClosingRateLabel: formatPct(rataClosingRate),
        
        salesBed: formatCurr(g.salesBed),
        salesLiving: formatCurr(g.salesLiving),
        salesCleanMover: formatCurr(g.salesCleanMover),
        salesAuto: formatCurr(g.salesAuto),
        salesLainnya: formatCurr(g.salesLainnya),
        totalSalesIklanLabel: formatCurr(g.totalSalesIklan),
        
        roasBed: formatNum(Math.round(roasBed)),
        roasLiving: formatNum(Math.round(roasLiving)),
        roasCleanMover: formatNum(Math.round(roasCleanMover)),
        roasAuto: formatNum(Math.round(roasAuto)),
        roasLainnya: formatNum(Math.round(roasLainnya)),
        totalRoasIklanLabel: formatNum(Math.round(roasKeseluruhan)),
        
        leadsIklanWA: formatNum(g.leadsIklanWA),
        leadsIGWA: formatNum(g.leadsIGWA),
        leadsDM: formatNum(g.leadsDM),
        totalLeadsAllLabel: formatNum(totalKeseluruhanLeads)
      };
    });
    
    // Sort chronologically by default if possible
    aggregatedArray.sort((a,b) => {
      const d1 = a.parsedDate;
      const d2 = b.parsedDate;
      if(d1 && d2) return d2.getTime() - d1.getTime(); // newest first
      return String(b.tanggal).localeCompare(String(a.tanggal));
    });

    return aggregatedArray;
  };

  const columns = [
    { key: "tanggal", label: "Tanggal" },
    { key: "biayaIklan", label: "Biaya Iklan" },
    { key: "impresi", label: "Impresi" },
    { key: "reach", label: "Reach" },
    { key: "klikTautanSemua", label: "Klik Tautan Semua" },
    { key: "kunjunganProfilIG", label: "Kunjungan Profil IG" },
    { key: "hasilKlikTautan", label: "Hasil" },
    { key: "percakapanPesanDiMulai", label: "Percakapan Pesan Di Mulai" },
    { key: "dmIGFB", label: "DM IG & FB" },
    { key: "komentarIGFB", label: "Komentar Ig & FB" },
    { key: "frekuensi", label: "Frekuensi" },
    { key: "cpc", label: "CPC (Biaya per Klik Tautan)" },
    { key: "ctrRasio", label: "CTR (Rasio Klik Tayang Tautan)" },
    { key: "ctrSemua", label: "CTR Semua" },
    { key: "cpm", label: "CPM" },
    { key: "totalKeseluruhanLeads", label: "Total Keseluruhan Leads" },
    { key: "crWhatsapp", label: "CR to Whatsapp" },
    { key: "crKeseluruhan", label: "CR to keseluruhan lead" },
    { key: "biayaPerHasil", label: "Biaya Iklan per hasil" },
    { key: "biayaPerPercakapan", label: "Biaya Iklan per percakapan" },
    { key: "biayaPerKeseluruhanLead", label: "Biaya Iklan per keseluruhan lead" },
    { key: "biayaPerImpresi", label: "Biaya Iklan per impresi" },
    { key: "biayaPerReach", label: "Biaya Iklan per reach" },
    { key: "ctrKlikTautan", label: "CTR Klik Tautan" },
    { key: "biayaPerLeadWA", label: "Biaya Iklan Perleads WA" },
    { key: "biayaPerClosing", label: "Biaya Iklan Perclosing" },
    { key: "persentaseIklanSales", label: "Persentase Iklan ke Sales" },
    { key: "ketukanSitusWebRate", label: "Ketukan Situs WebRate" },
    { key: "ketukanSitusWeb", label: "Ketukan situs web" },
    { key: "pengunjungDestyPage", label: "Pengunjung Desty Page" },
    { key: "klikDestyPage", label: "Klik Desty Page Instagram" },
    { key: "totalClosing", label: "Closing" },
    { key: "closingRate", label: "Closing Rate" },
    { key: "totalSales", label: "Sales" },
    { key: "roasKeseluruhan", label: "Roas Keseluruhan" },
    { key: "biayaIklanBed", label: "Biaya Iklan Bed" },
    { key: "biayaIklanLiving", label: "Biaya Iklan Living" },
    { key: "biayaIklanCleanMover", label: "Biaya Iklan Clean Mover" },
    { key: "biayaIklanAuto", label: "Biaya Iklan Auto" },
    { key: "biayaIklanLainnya", label: "Biaya Iklan Lainnya" },
    { key: "totalBiayaIklanLabel", label: "Total Biaya Iklan" },
    { key: "closingBed", label: "Closing Hagia Bed" },
    { key: "closingLiving", label: "Closing Hagia Living" },
    { key: "closingCleanMover", label: "Closing Hagia Clean Mover" },
    { key: "closingAuto", label: "Closing Hagia Auto" },
    { key: "closingLainnya", label: "Closing Lainnya" },
    { key: "totalClosingIklanLabel", label: "Total Closing Iklan" },
    { key: "leadBed", label: "Lead Bed" },
    { key: "leadLiving", label: "Lead Living" },
    { key: "leadCleanMover", label: "Lead Clean Mover" },
    { key: "leadAuto", label: "Lead Auto" },
    { key: "leadLainnya", label: "Lead Lainnya" },
    { key: "totalLeadIklanLabel", label: "Total Lead Iklan" },
    { key: "crBed", label: "Closing Rate Bed" },
    { key: "crLiving", label: "Closing Rate Living" },
    { key: "crCleanMover", label: "Closing Rate Clean Mover" },
    { key: "crAuto", label: "Closing Rate Auto" },
    { key: "crLainnya", label: "Closing Rate Lainnya" },
    { key: "rataClosingRateLabel", label: "Rata - rata closing rate" },
    { key: "salesBed", label: "Sales Bed" },
    { key: "salesLiving", label: "Sales Living" },
    { key: "salesCleanMover", label: "Sales Clean Mover" },
    { key: "salesAuto", label: "Sales Auto" },
    { key: "salesLainnya", label: "Sales Lainnya" },
    { key: "totalSalesIklanLabel", label: "Total Sales Iklan" },
    { key: "roasBed", label: "ROAS Bed" },
    { key: "roasLiving", label: "ROAS Living" },
    { key: "roasCleanMover", label: "ROAS Clean Mover" },
    { key: "roasAuto", label: "Roas Auto" },
    { key: "roasLainnya", label: "Roas Lainnya" },
    { key: "totalRoasIklanLabel", label: "Total Roas Iklan" },
    { key: "leadsIklanWA", label: "Leads Iklan Whatsapp" },
    { key: "leadsIGWA", label: "Leads Instagram Whatsapp" },
    { key: "leadsDM", label: "Leads DM" },
    { key: "totalLeadsAllLabel", label: "Total Leads" }
  ];

  let processedData = [...data];

  if (activeDateFilter !== "Semua Waktu" && activeDateFilter !== "Semua Bulan") {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    processedData = processedData.filter(row => {
      const rowDate = row.parsedDate;
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
      Object.keys(row).some(k => 
        k !== 'parsedDate' && String((row as any)[k]).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

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
      
      const numA = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
      const numB = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
      if(!isNaN(numA) && !isNaN(numB)) {
         if (numA < numB) return sortConfig.direction === 'asc' ? -1 : 1;
         if (numA > numB) return sortConfig.direction === 'asc' ? 1 : -1;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.max(1, Math.ceil(processedData.length / rowsPerPage));
  const paginatedData = processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const totalBiaya = processedData.reduce((sum, row) => {
    let clean = String(row.biayaIklan || '0').replace(/[^0-9]/g, '');
    return sum + (parseInt(clean) || 0);
  }, 0);

  const totalLeads = processedData.reduce((sum, row) => {
    return sum + (parseInt(String(row.totalKeseluruhanLeads || '0').replace(/[^0-9]/g, '')) || 0);
  }, 0);

  const totalImpresi = processedData.reduce((sum, row) => {
    return sum + (parseInt(String(row.impresi || '0').replace(/[^0-9]/g, '')) || 0);
  }, 0);

  const totalKlik = processedData.reduce((sum, row) => {
    return sum + (parseInt(String(row.klikTautanSemua || '0').replace(/[^0-9]/g, '')) || 0);
  }, 0);

  const avgCpc = totalKlik > 0 ? Math.round(totalBiaya / totalKlik) : 0;
  const avgCpl = totalLeads > 0 ? Math.round(totalBiaya / totalLeads) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
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
    link.setAttribute('download', 'export_database_iklan_harian.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (key: string, direction: 'asc'|'desc') => {
    setSortConfig({ key, direction });
    setActiveFilterCol(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
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
      </div>

      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Database size={24} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Data Iklan Harian</h2>
            <p className="text-slate-400 text-xs mt-1">
              Data akumulasi otomatis beserta kompilasi data leads dan sales.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10"></div>
      </div>

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
               <span className={`text-base sm:text-lg font-black tracking-tight w-full break-words ${metric.color}`}>{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
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
              placeholder="Cari data iklan..." 
              className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0c1226] border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f172a]">
                <th className="p-3 min-w-[50px] sticky left-0 z-20 bg-[#0f172a] text-center shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">NO</span>
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap group relative border-l border-slate-700/30">
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
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={row.id} className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group`}>
                  <td className="p-3 min-w-[50px] sticky left-0 z-10 bg-[#0c1226] group-hover:bg-[#121b33] transition-colors text-center shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                    <span className="text-xs text-slate-500 font-mono">
                      {((currentPage - 1) * rowsPerPage) + idx + 1}
                    </span>
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 border-l border-slate-700/30">
                       <div className="text-xs text-slate-300 whitespace-nowrap">
                         {row[col.key] !== undefined && row[col.key] !== null && row[col.key] !== '' ? row[col.key] : <span className="text-slate-600/50 italic">-</span>}
                       </div>
                    </td>
                  ))}
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 5 - paginatedData.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-800/50 h-14">
                  <td className="p-3 sticky left-0 z-10 bg-[#0c1226] shadow-[2px_0_5px_rgba(0,0,0,0.2)]"></td>
                  {columns.map(col => <td key={`empty-col-${col.key}`} className="p-3 border-l border-slate-700/30"></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
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
