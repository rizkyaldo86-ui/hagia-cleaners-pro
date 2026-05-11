import * as fs from 'fs';

const content = fs.readFileSync('src/components/LeadsDatabase.tsx', 'utf-8');

let newContent = content.replace(/LeadsDatabase/g, 'DataClosing');

newContent = newContent.replace(/const \[data, setData\] = useState\(\[[\s\S]*?\]\);/, `const [data, setData] = useState([
    {
      id: 1,
      tanggal: "1 Januari 2026",
      crm: "1",
      iklanIG: "39",
      iklanFB: "0",
      igWA: "14",
      igDMCOM: "4",
      tiktokWA: "3",
      tiktokDMCOM: "0",
      youtube: "1",
      youtubeCOM: "0",
      waKosong: "12",
      fbWA: "0",
      fbDMKOM: "0",
      igBayanganWA: "0",
      igBayanganDMCOM: "0",
      tiktokBayanganWA: "0",
      tiktokBayanganDMCOM: "0",
      youtubeBayanganWA: "0",
      youtubeBayanganCOM: "0",
      facebookBayanganWA: "0",
      facebookBayanganDMCOM: "0",
      leadsKeseluruhan: "74",
      luarKota: "3",
      spam: "0",
      leadTerjangkau: "71",
      closingCS1: "2",
      salesCS1: "2850000",
      totalLeadCS1: "71",
      closingCS2: "0",
      salesCS2: "0",
      totalLeadCS2: "0",
      closingRate: "2.8%",
      totalClosing: "2",
      averageOrderValue: "1425000",
      totalSales: "2850000",
      totalRevenue: "0"
    }
  ]);`);

newContent = newContent.replace(/const columns = \[[\s\S]*?\];/, `const columns = [
    { key: "tanggal", label: "Tanggal" },
    { key: "crm", label: "CRM" },
    { key: "iklanIG", label: "Iklan IG" },
    { key: "iklanFB", label: "Iklan FB" },
    { key: "igWA", label: "IG (WA)" },
    { key: "igDMCOM", label: "IG (DM&COM)" },
    { key: "tiktokWA", label: "TIK TOK (WA)" },
    { key: "tiktokDMCOM", label: "TIK TOK (DM&COM)" },
    { key: "youtube", label: "YOUTUBE" },
    { key: "youtubeCOM", label: "YOUTUBE COM" },
    { key: "waKosong", label: "WA Kosong" },
    { key: "fbWA", label: "FB WA" },
    { key: "fbDMKOM", label: "FB (DM&KOM)" },
    { key: "igBayanganWA", label: "IG Bayangan WA" },
    { key: "igBayanganDMCOM", label: "IG Bayangan DM & COM" },
    { key: "tiktokBayanganWA", label: "Tiktok Bayangan WA" },
    { key: "tiktokBayanganDMCOM", label: "Tiktok Bayangan DM & COM" },
    { key: "youtubeBayanganWA", label: "Youtube Bayangan WA" },
    { key: "youtubeBayanganCOM", label: "Youtube Bayangan COM" },
    { key: "facebookBayanganWA", label: "Facebook Bayangan WA" },
    { key: "facebookBayanganDMCOM", label: "Facebook Bayangan DM & COM" },
    { key: "leadsKeseluruhan", label: "LEADS Keseluruhan" },
    { key: "luarKota", label: "Luar kota" },
    { key: "spam", label: "Spam" },
    { key: "leadTerjangkau", label: "Lead Terjangkau" },
    { key: "closingCS1", label: "Closing CS1" },
    { key: "salesCS1", label: "Sales CS1" },
    { key: "totalLeadCS1", label: "Total Lead CS 1" },
    { key: "closingCS2", label: "Closing CS 2" },
    { key: "salesCS2", label: "Sales CS 2" },
    { key: "totalLeadCS2", label: "Total Lead CS 2" },
    { key: "closingRate", label: "Closing Rate" },
    { key: "totalClosing", label: "TOTAL CLOSING" },
    { key: "averageOrderValue", label: "Average Order Value" },
    { key: "totalSales", label: "TOTAL SALES" },
    { key: "totalRevenue", label: "TOTAL REVENUE" }
];`);

fs.writeFileSync('src/components/DataClosing.tsx', newContent);
