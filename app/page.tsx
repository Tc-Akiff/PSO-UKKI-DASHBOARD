'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';

// --- SENARAI 14 BAHAGIAN & UNIT PSUKPP ---
const BAHAGIAN_LIST = [
  { code: 'BPEN', name: 'Bahagian Perancang Ekonomi Negeri' },
  { code: 'BPSM', name: 'Bahagian Pengurusan Sumber Manusia' },
  { code: 'BTMKN', name: 'Bahagian Teknologi Maklumat Dan Komunikasi Negeri' },
  { code: 'UAD', name: 'Unit Audit Dalam' },
  { code: 'BKP', name: 'Bahagian Khidmat Pengurusan' },
  { code: 'DUN', name: 'Dewan Undangan Negeri' },
  { code: 'BKT', name: 'Bahagian Kerajaan Tempatan' },
  { code: 'BPMP', name: 'Bahagian Pengurusan Majlis Dan Protokol' },
  { code: 'MSNPP', name: 'Majlis Sukan Negeri Pulau Pinang' },
  { code: 'BKSA', name: 'Bahagian Kawal Selia Air' },
  { code: 'UKKI', name: 'Unit Komunikasi Korporat & Inovasi' },
  { code: 'UI', name: 'Unit Integriti' },
  { code: 'UPB', name: 'Unit Pengurusan Bencana' },
  { code: 'PPW', name: 'Pejabat Pesuruhjaya Warisan' },
];

const defaultKpiData = [
  {
    id: 'KPI-BTM-01',
    terasId: 'T1',
    terasName: 'TERAS 1: MEMANTAPKAN TATA KELOLA & PENYAMPAIAN PERKHIDMATAN',
    terasNameEn: 'PILLAR 1: STRENGTHENING GOVERNANCE & SERVICE DELIVERY',
    title: 'Peratusan Transaksi Perkhidmatan Atas Talian (E-Perkhidmatan)',
    titleEn: 'Percentage of Online Service Transactions (E-Services)',
    bahagian: 'BTMKN',
    sasaran: 85,
    pencapaian: 88,
    status: 'hijau',
    q1: 10, q2: 75, q3: 60, q4: 88,
    pemilik: 'Bahagian Teknologi Maklumat Dan Komunikasi Negeri',
    sebabKelewatan: '',
    pelanIntervensi: ''
  },
  {
    id: 'KPI-BPSM-01',
    terasId: 'T2',
    terasName: 'TERAS 2: PEMBANGUNAN MODAL INSAN & PRESTASI WARGA KERJA',
    terasNameEn: 'PILLAR 2: HUMAN CAPITAL DEVELOPMENT & WORKFORCE PERFORMANCE',
    title: 'Jumlah Hari Latihan Kakitangan (Sekurang-kurangnya 5 hari/tahun)',
    titleEn: 'Staff Training Days (At least 5 days/year)',
    bahagian: 'BPSM',
    sasaran: 100,
    pencapaian: 65,
    status: 'kuning',
    q1: 15, q2: 45, q3: 70, q4: 65,
    pemilik: 'Bahagian Pengurusan Sumber Manusia',
    sebabKelewatan: 'Kekangan jadual kerja penjawat awam pada suku kedua.',
    pelanIntervensi: 'Melaksanakan e-learning secara dalam talian.'
  },
  {
    id: 'KPI-BPEN-01',
    terasId: 'T3',
    terasName: 'TERAS 3: PEMANTAUAN PROJEK PEMBANGUNAN NEGERI',
    terasNameEn: 'PILLAR 3: STATE DEVELOPMENT PROJECT MONITORING',
    title: 'Kelulusan Pelan Pembangunan (Dalam tempoh 14 hari)',
    titleEn: 'Development Plan Approvals (Within 14 days)',
    bahagian: 'BPEN',
    sasaran: 90,
    pencapaian: 45,
    status: 'merah',
    q1: 10, q2: 25, q3: 35, q4: 45,
    pemilik: 'Bahagian Perancang Ekonomi Negeri',
    sebabKelewatan: 'Kelewatan ulasan teknikal daripada agensi luaran.',
    pelanIntervensi: 'Mengadakan Mesyuarat Taskforce Kelulusan Khas setiap minggu.'
  }
];

const dict = {
  bm: {
    title: 'DASHBOARD PELAN STRATEGIK ORGANISASI (PSO) 2026-2030',
    subtitle: 'PEJABAT SETIAUSAHA KERAJAAN NEGERI PULAU PINANG',
    kpiCardTitle: 'KAD KPI UTAMA',
    overallAchievement: 'Pencapaian Keseluruhan PSO',
    targetMet: 'Mencapai Sasaran:',
    inAttention: 'Dalam Perhatian:',
    requiresAction: 'Lewat/Rendah:',
    strategicPillarHeader: 'Prestasi Teras Strategik',
    pieTitle: 'Carta Pai',
    pieSub: 'Taburan Status KPI Mengikut Bahagian',
    lineTitle: 'Carta Garis',
    lineSub: 'Trend Pencapaian KPI (Q1 - Q4)',
    filterTitle: 'Cari & Tapis',
    year: 'Tahun',
    allYears: 'Tahun',
    division: 'Bahagian',
    allDivisions: 'Semua Bahagian',
    pillar: 'Teras',
    allPillars: 'Semua Teras',
    target: 'Sasaran',
    currentScore: 'Pencapaian semasa',
    exportCsv: 'Eksport CSV',
    exportPdf: 'Cetak PDF',
    logIn: 'Log Masuk Admin',
    logOut: 'Log Keluar',
    addKpi: 'Tambah KPI',
    auditLog: 'Log Audit',
    resetDefault: 'Reset Data',
    noRecord: 'Tiada rekod KPI ditemui.',
    targetRatio: 'daripada jumlah',
    changePass: 'Tukar Pass'
  },
  en: {
    title: 'ORGANIZATIONAL STRATEGIC PLAN (PSO) DASHBOARD 2026-2030',
    subtitle: 'PENANG STATE SECRETARY OFFICE',
    kpiCardTitle: 'KEY KPI CARDS',
    overallAchievement: 'Overall PSO Achievement',
    targetMet: 'Target Met:',
    inAttention: 'Needs Attention:',
    requiresAction: 'Late/Low:',
    strategicPillarHeader: 'Strategic Pillar Performance',
    pieTitle: 'Pie Chart',
    pieSub: 'KPI Status Distribution by Division',
    lineTitle: 'Line Chart',
    lineSub: 'KPI Achievement Trend (Q1 - Q4)',
    filterTitle: 'Search & Filter',
    year: 'Year',
    allYears: 'Year',
    division: 'Division',
    allDivisions: 'All Divisions',
    pillar: 'Pillar',
    allPillars: 'All Pillars',
    target: 'Target',
    currentScore: 'Current Score',
    exportCsv: 'Export CSV',
    exportPdf: 'Print PDF',
    logIn: 'Admin Login',
    logOut: 'Logout',
    addKpi: 'Add KPI',
    auditLog: 'Audit Log',
    resetDefault: 'Reset Data',
    noRecord: 'No KPI records found.',
    targetRatio: 'of total',
    changePass: 'Change Pass'
  }
};

export default function PSUKPPPage() {
  const [lang, setLang] = useState<'bm' | 'en'>('bm');
  const t = dict[lang];

  const [kpiList, setKpiList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('PUBLIC');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingKpi, setEditingKpi] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    terasId: 'T1',
    terasName: 'TERAS 1: MEMANTAPKAN TATA KELOLA & PENYAMPAIAN PERKHIDMATAN',
    title: '',
    bahagian: 'BPEN',
    sasaran: 80,
    pencapaian: 0,
    status: 'hijau',
    q1: 0, q2: 0, q3: 0, q4: 0,
    pemilik: 'Bahagian Perancang Ekonomi Negeri',
    sebabKelewatan: '',
    pelanIntervensi: ''
  });

  const [selectedTeras, setSelectedTeras] = useState<string>('ALL');
  const [selectedBahagian, setSelectedBahagian] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (!db) return;
    const unsubscribeKpi = onSnapshot(collection(db, 'kpis'), (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
      if (docsData.length === 0) {
        defaultKpiData.forEach(async (item) => {
          await setDoc(doc(db, 'kpis', item.id), item);
        });
      } else {
        setKpiList(docsData);
      }
      setLoading(false);
    });

    const unsubscribeLogs = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuditLogs(logs.sort((a: any, b: any) => b.timestamp - a.timestamp));
    });

    return () => {
      unsubscribeKpi();
      unsubscribeLogs();
    };
  }, []);

  const loggedInBahagianCode = useMemo(() => {
    if (userRole.startsWith('ADMIN_') && userRole !== 'SUPER_ADMIN') {
      return userRole.replace('ADMIN_', '');
    }
    return null;
  }, [userRole]);

  useEffect(() => {
    if (loggedInBahagianCode) {
      setSelectedBahagian(loggedInBahagianCode);
    }
  }, [loggedInBahagianCode]);

  const addAuditLog = async (action: string) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        tarikh: new Date().toLocaleString('ms-MY'),
        timestamp: Date.now(),
        pengguna: userRole,
        tindakan: action
      });
    } catch (err) {
      console.error('Error logging audit:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.toLowerCase() === 'admin' && loginPassword === 'admin123') {
      setUserRole('SUPER_ADMIN');
      setShowLoginModal(false);
      setLoginError('');
      setLoginUsername(''); setLoginPassword('');
    } else {
      const foundBahagian = BAHAGIAN_LIST.find(b => `admin_${b.code.toLowerCase()}` === loginUsername.toLowerCase());
      if (foundBahagian && loginPassword === 'admin123') {
        setUserRole(`ADMIN_${foundBahagian.code}`);
        setSelectedBahagian(foundBahagian.code);
        setShowLoginModal(false);
        setLoginError('');
        setLoginUsername(''); setLoginPassword('');
      } else {
        setLoginError('Username / Password Salah.');
      }
    }
  };

  const handleLogout = () => {
    setUserRole('PUBLIC');
    setSelectedBahagian('ALL');
  };

  const canEditItem = (bahagianCode: string) => {
    if (userRole === 'SUPER_ADMIN') return true;
    if (userRole === `ADMIN_${bahagianCode}`) return true;
    return false;
  };

  const activeBahagianFilter = loggedInBahagianCode || selectedBahagian;

  const filteredData = useMemo(() => {
    return kpiList.filter((item) => {
      const matchTeras = selectedTeras === 'ALL' || item.terasId === selectedTeras;
      const matchBahagian = activeBahagianFilter === 'ALL' || item.bahagian === activeBahagianFilter;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const displayTitle = lang === 'en' && item.titleEn ? item.titleEn : item.title;
      const matchSearch =
        displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pemilik.toLowerCase().includes(searchTerm.toLowerCase());

      return matchTeras && matchBahagian && matchStatus && matchSearch;
    });
  }, [kpiList, selectedTeras, activeBahagianFilter, selectedStatus, searchTerm, lang]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const hijau = filteredData.filter((d) => d.status === 'hijau').length;
    const kuning = filteredData.filter((d) => d.status === 'kuning').length;
    const merah = filteredData.filter((d) => d.status === 'merah').length;
    const avgScore = total > 0 
      ? (filteredData.reduce((acc, curr) => acc + Number(curr.pencapaian), 0) / total).toFixed(1)
      : '0.0';

    const pctHijau = total > 0 ? Math.round((hijau / total) * 100) : 0;
    const pctKuning = total > 0 ? Math.round((kuning / total) * 100) : 0;
    const pctMerah = total > 0 ? Math.round((merah / total) * 100) : 0;

    const avgQ1 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q1 || 0), 0) / total) : 0;
    const avgQ2 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q2 || 0), 0) / total) : 0;
    const avgQ3 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q3 || 0), 0) / total) : 0;
    const avgQ4 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q4 || 0), 0) / total) : 0;

    return { total, hijau, kuning, merah, avgScore, pctHijau, pctKuning, pctMerah, avgQ1, avgQ2, avgQ3, avgQ4 };
  }, [filteredData]);

  const handleOpenAdd = () => {
    setEditingKpi(null);
    const code = loggedInBahagianCode || (selectedBahagian !== 'ALL' ? selectedBahagian : 'BPEN');
    const bName = BAHAGIAN_LIST.find(b => b.code === code)?.name || 'Bahagian';
    setFormData({
      id: `KPI-${code}-0${kpiList.filter(k => k.bahagian === code).length + 1}`,
      terasId: 'T1',
      terasName: 'TERAS 1: MEMANTAPKAN TATA KELOLA & PENYAMPAIAN PERKHIDMATAN',
      title: '',
      bahagian: code,
      sasaran: 100,
      pencapaian: 0,
      status: 'kuning',
      q1: 0, q2: 0, q3: 0, q4: 0,
      pemilik: bName,
      sebabKelewatan: '',
      pelanIntervensi: ''
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingKpi(item);
    setFormData({ ...item });
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Padam ${id}?`)) {
      try {
        await deleteDoc(doc(db, 'kpis', id));
        addAuditLog(`Memadam rekod ${id}`);
      } catch (e) {
        alert('Gagal memadam.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKpi) {
        await updateDoc(doc(db, 'kpis', formData.id), formData);
        addAuditLog(`Kemaskini ${formData.id}`);
      } else {
        await setDoc(doc(db, 'kpis', formData.id), formData);
        addAuditLog(`Tambah ${formData.id}`);
      }
      setShowFormModal(false);
    } catch (e) {
      alert('Gagal menyimpan.');
    }
  };

  const getY = (val: number) => 80 - (val / 100) * 60;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* HEADER UTAMA BERSAMA LOGO JATA & PENANG 2030 */}
      <header className="bg-[#0f2042] text-white px-4 py-2.5 flex items-center justify-between shadow-md border-b-2 border-amber-400">
        <div className="flex items-center space-x-3">
          {/* Logo Jata Pulau Pinang */}
          <div className="w-10 h-10 flex items-center justify-center bg-white p-0.5 rounded border border-amber-400">
            <svg viewBox="0 0 100 130" className="w-full h-full">
              <path d="M50,10 L50,40 M42,20 L58,20 M40,28 L60,28" stroke="#008000" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="50" cy="8" r="4" fill="#008000"/>
              <path d="M10,40 L90,40 L90,90 Q50,120 10,90 Z" fill="#FFCC00" stroke="#000000" strokeWidth="3"/>
              <path d="M20,65 L80,65 M35,45 L35,65 M65,45 L65,65 M35,45 L50,65 L65,45" stroke="#000000" strokeWidth="2.5" fill="none"/>
              <path d="M10,75 Q30,70 50,75 T90,75 M10,83 Q30,78 50,83 T90,83 M10,91 Q30,86 50,91 T90,91" stroke="#0088CC" strokeWidth="3" fill="none"/>
              <path d="M5,110 Q50,125 95,110 L90,120 Q50,130 10,120 Z" fill="#FFCC00" stroke="#000000" strokeWidth="1.5"/>
            </svg>
          </div>

          <div>
            <div className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase">
              {t.subtitle}
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
              {t.title}
            </h1>
          </div>
        </div>

        {/* ALATAN HEADER (TAHUN, CARIAN, USER, PENANG 2030) */}
        <div className="flex items-center space-x-3">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#1a2f58] text-white text-xs px-2.5 py-1 rounded border border-slate-600 outline-none font-bold"
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>

          <button 
            onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
            className="bg-amber-400 text-[#0f2042] font-black text-[10px] px-2 py-1 rounded tracking-wider uppercase"
          >
            {lang === 'bm' ? 'EN' : 'BM'}
          </button>

          {userRole !== 'PUBLIC' ? (
            <button onClick={handleLogout} className="bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded">
              {t.logOut}
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1 rounded">
              {t.logIn}
            </button>
          )}

          {/* Logo Penang 2030 Style Icon */}
          <div className="hidden md:flex flex-col items-end leading-none border-l border-slate-700 pl-3">
            <span className="text-xs font-black tracking-widest text-slate-300">PENANG</span>
            <span className="text-base font-black text-amber-400">2030</span>
          </div>
        </div>
      </header>

      {/* BODY DENGAN SIDEBAR NAVIGASI KIRI */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION KIRI */}
        <aside className="w-14 bg-[#0f2042] text-slate-300 flex flex-col items-center py-4 space-y-6 border-r border-slate-800">
          <button className="p-2 rounded bg-amber-400 text-slate-950 font-black" title="Utama">
            🏠
          </button>
          <button onClick={() => setSelectedBahagian('ALL')} className="p-2 rounded hover:bg-[#1a2f58]" title="Semua Bahagian">
            👥
          </button>
          <button onClick={handleOpenAdd} className="p-2 rounded hover:bg-[#1a2f58]" title="Tambah KPI">
            💼
          </button>
          <button onClick={() => setShowLogModal(true)} className="p-2 rounded hover:bg-[#1a2f58]" title="Log Audit">
            📜
          </button>
        </aside>

        {/* KANDUNGAN UTAMA / DASHBOARD BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* BAR KAWALAN ADMIN (JIKA LOG MASUK) */}
          {userRole !== 'PUBLIC' && (
            <div className="p-3 bg-amber-50 rounded border border-amber-300 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">
                Sesi Pentadbir Aktif: <strong>{userRole}</strong>
              </span>
              <div className="space-x-2">
                <button onClick={handleOpenAdd} className="px-3 py-1 bg-emerald-600 text-white font-bold rounded">
                  + {t.addKpi}
                </button>
                <button onClick={() => setShowLogModal(true)} className="px-3 py-1 bg-[#0f2042] text-white font-bold rounded">
                  {t.auditLog}
                </button>
              </div>
            </div>
          )}

          {/* 1. SEKSYEN KAD KPI UTAMA (4 KAD PRESTASI TOP) */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              {t.kpiCardTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Kad 1: Pencapaian Keseluruhan PSO */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">{t.overallAchievement}</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black text-slate-900">{stats.avgScore}%</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white uppercase">
                      ON TRACK
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden border">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.avgScore}%` }}></div>
                </div>
              </div>

              {/* Kad 2: Mencapai Sasaran (Hijau) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-black">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-600 block">{t.targetMet}</span>
                    <span className="text-xl font-black text-slate-900">{stats.hijau} ({stats.pctHijau}%)</span>
                  </div>
                </div>
              </div>

              {/* Kad 3: Dalam Perhatian (Kuning) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black">
                    !
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-600 block">{t.inAttention}</span>
                    <span className="text-xl font-black text-slate-900">{stats.kuning} ({stats.pctKuning}%)</span>
                  </div>
                </div>
              </div>

              {/* Kad 4: Lewat / Rendah (Merah) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center text-lg font-black">
                    ↘
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-600 block">{t.requiresAction}</span>
                    <span className="text-xl font-black text-slate-900">{stats.merah} ({stats.pctMerah}%)</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* 2. GRID DUA KOLUM: PRESTASI TERAS (KIRI) & ANALITIK CARTA/CARIAN (KANAN) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KOLUM KIRI (2 SPAN): SENARAI TERAS STRATEGIK */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                {t.strategicPillarHeader}
              </h2>

              <div className="space-y-4">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const displayTitle = lang === 'en' && item.titleEn ? item.titleEn : item.title;
                    const canEdit = canEditItem(item.bahagian);
                    return (
                      <div key={item.id} className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                        
                        {/* HEADER BANNER TERAS */}
                        <div className={`px-4 py-2 text-white font-black text-xs uppercase tracking-wide ${
                          item.status === 'hijau' ? 'bg-[#0f2042]' :
                          item.status === 'kuning' ? 'bg-amber-400 text-slate-950' : 'bg-[#0f2042]'
                        }`}>
                          {lang === 'en' && item.terasNameEn ? item.terasNameEn : item.terasName}
                        </div>

                        {/* KANDUNGAN BAR KPI */}
                        <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-start space-x-3 max-w-md">
                            <div className="p-2 bg-slate-100 rounded text-base">💻</div>
                            <div>
                              <h3 className="text-xs font-black text-slate-900 leading-snug">{displayTitle}</h3>
                              <span className="text-[10px] text-slate-500 font-bold">{item.pemilik} ({item.bahagian})</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-center">
                            <div>
                              <span className="text-[10px] text-slate-500 block font-bold">{t.target}</span>
                              <strong className="text-sm font-black text-slate-900">{item.sasaran}%</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block font-bold">{t.currentScore}</span>
                              <strong className="text-sm font-black text-slate-900">{item.pencapaian}%</strong>
                            </div>

                            {/* BULATAN STATUS ICON */}
                            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-sm ${
                              item.status === 'hijau' ? 'bg-emerald-600' :
                              item.status === 'kuning' ? 'bg-amber-400 text-slate-950' : 'bg-rose-600'
                            }`}>
                              {item.status === 'hijau' ? '✓' : item.status === 'kuning' ? '!' : '!'}
                            </div>

                            {canEdit && (
                              <button onClick={() => handleOpenEdit(item)} className="text-xs font-bold text-amber-600 border border-amber-300 px-2 py-1 rounded">
                                Edit
                              </button>
                            )}
                          </div>

                          {/* BAR KEMAJUAN PRESTASI */}
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full rounded-full ${
                                item.status === 'hijau' ? 'bg-emerald-500' :
                                item.status === 'kuning' ? 'bg-amber-400' : 'bg-rose-600'
                              }`} 
                              style={{ width: `${Math.min(item.pencapaian, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-white rounded border border-slate-200 text-xs font-bold text-slate-500">
                    {t.noRecord}
                  </div>
                )}
              </div>
            </div>

            {/* KOLUM KANAN (1 SPAN): CARTA PAI, CARTA GARIS & TAPISAN */}
            <div className="space-y-4">
              
              {/* CARTA PAI (PIE CHART) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-900">{t.pieTitle}</h3>
                <span className="text-[10px] text-slate-500 font-bold block mb-3">{t.pieSub}</span>

                <div className="flex items-center justify-around">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path className="text-slate-100" strokeWidth="5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      {stats.pctHijau > 0 && <path className="text-emerald-500" strokeDasharray={`${stats.pctHijau}, 100`} strokeWidth="5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />}
                      {stats.pctKuning > 0 && <path className="text-amber-400" strokeDasharray={`${stats.pctKuning}, 100`} strokeDashoffset={`-${stats.pctHijau}`} strokeWidth="5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />}
                      {stats.pctMerah > 0 && <path className="text-blue-500" strokeDasharray={`${stats.pctMerah}, 100`} strokeDashoffset={`-${stats.pctHijau + stats.pctKuning}`} strokeWidth="5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />}
                    </svg>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-extrabold">
                    <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span>BKP</span></div>
                    <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>BPEN</span></div>
                    <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span>BKT</span></div>
                    <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-800"></span><span>BTM</span></div>
                  </div>
                </div>
              </div>

              {/* CARTA GARIS (LINE CHART) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-900">{t.lineTitle}</h3>
                <span className="text-[10px] text-slate-500 font-bold block mb-2">{t.lineSub}</span>

                <div className="relative h-28 w-full flex items-end pt-4 pb-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={`37.5,${getY(stats.avgQ1)} 112.5,${getY(stats.avgQ2)} 187.5,${getY(stats.avgQ3)} 262.5,${getY(stats.avgQ4)}`} />
                    <circle cx="37.5" cy={getY(stats.avgQ1)} r="3" className="fill-blue-600" />
                    <circle cx="112.5" cy={getY(stats.avgQ2)} r="3" className="fill-blue-600" />
                    <circle cx="187.5" cy={getY(stats.avgQ3)} r="3" className="fill-blue-600" />
                    <circle cx="262.5" cy={getY(stats.avgQ4)} r="3" className="fill-blue-600" />
                  </svg>
                </div>
                <div className="grid grid-cols-4 text-center text-[10px] font-black text-slate-600 pt-1 border-t">
                  <div>Q1</div><div>Q2</div><div>Q3</div><div>Q4</div>
                </div>
              </div>

              {/* PANEL TAPISAN & CARI */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-900">{t.filterTitle}</h3>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 mb-1">{t.year}</label>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-bold bg-slate-50"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 mb-1">{t.division}</label>
                  <select 
                    disabled={!!loggedInBahagianCode}
                    value={activeBahagianFilter} 
                    onChange={(e) => setSelectedBahagian(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-bold bg-slate-50"
                  >
                    <option value="ALL">{t.allDivisions}</option>
                    {BAHAGIAN_LIST.map(b => (
                      <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 mb-1">{t.pillar}</label>
                  <select 
                    value={selectedTeras} 
                    onChange={(e) => setSelectedTeras(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-bold bg-slate-50"
                  >
                    <option value="ALL">{t.allPillars}</option>
                    <option value="T1">Teras 1</option>
                    <option value="T2">Teras 2</option>
                    <option value="T3">Teras 3</option>
                  </select>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* MODAL LOG MASUK ADMIN */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border shadow-xl">
            <h3 className="text-xs font-black uppercase text-slate-900 mb-4">{t.logIn}</h3>
            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              {loginError && <div className="p-2 bg-rose-50 text-rose-700 rounded font-bold">{loginError}</div>}
              <input type="text" required placeholder="admin / admin_bpen" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full p-2 border rounded font-bold" />
              <input type="password" required placeholder="admin123" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-2 border rounded font-bold" />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="px-3 py-1.5 bg-slate-200 font-bold rounded">Batal</button>
                <button type="submit" className="px-3 py-1.5 bg-[#0f2042] text-white font-bold rounded">Log Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT FORM */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full border shadow-xl text-xs space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black uppercase text-slate-900">{editingKpi ? 'Edit KPI' : 'Tambah KPI'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <input type="text" required value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} className="w-full p-2 border rounded font-mono font-bold" />
              <textarea required rows={2} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded font-bold" placeholder="Tajuk KPI..." />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min="0" max="100" required value={formData.sasaran} onChange={(e) => setFormData({...formData, sasaran: Number(e.target.value)})} className="p-2 border rounded font-bold" placeholder="Sasaran %" />
                <input type="number" min="0" max="100" required value={formData.pencapaian} onChange={(e) => setFormData({...formData, pencapaian: Number(e.target.value)})} className="p-2 border rounded font-bold" placeholder="Pencapaian %" />
              </div>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded font-bold">
                <option value="hijau">🟢 Hijau (Mencapai)</option>
                <option value="kuning">🟡 Kuning (Amaran)</option>
                <option value="merah">🔴 Merah (Lewat)</option>
              </select>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-3 py-1.5 bg-slate-200 font-bold rounded">Batal</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AUDIT LOG */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border shadow-xl text-xs max-h-[80vh] overflow-y-auto space-y-2">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black uppercase text-slate-900">{t.auditLog}</h3>
              <button onClick={() => setShowLogModal(false)} className="font-bold">✕</button>
            </div>
            {auditLogs.length > 0 ? (
              auditLogs.map(log => (
                <div key={log.id} className="p-2 bg-slate-50 border rounded">
                  <div className="flex justify-between font-bold text-[#0f2042]">
                    <span>{log.pengguna}</span>
                    <span className="text-[10px] text-slate-500">{log.tarikh}</span>
                  </div>
                  <p className="mt-0.5 font-semibold">{log.tindakan}</p>
                </div>
              ))
            ) : <p className="text-center text-slate-500 py-2">Tiada log.</p>}
          </div>
        </div>
      )}

    </div>
  );
}
