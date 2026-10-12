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
    id: 'KPI-BTMKN-01',
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
    division: 'Bahagian',
    allDivisions: 'Semua Bahagian',
    pillar: 'Teras',
    allPillars: 'Semua Teras',
    target: 'Sasaran',
    currentScore: 'Pencapaian semasa',
    logIn: 'Log Masuk Admin',
    logOut: 'Log Keluar',
    addKpi: 'Tambah KPI',
    auditLog: 'Log Audit',
    noRecord: 'Tiada rekod KPI ditemui.'
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
    division: 'Division',
    allDivisions: 'All Divisions',
    pillar: 'Pillar',
    allPillars: 'All Pillars',
    target: 'Target',
    currentScore: 'Current Score',
    logIn: 'Admin Login',
    logOut: 'Logout',
    addKpi: 'Add KPI',
    auditLog: 'Audit Log',
    noRecord: 'No KPI records found.'
  }
};

export default function PSUKPPPage() {
  const [lang, setLang] = useState<'bm' | 'en'>('bm');
  const t = dict[lang];

  const [kpiList, setKpiList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('PUBLIC');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showBahagianModal, setShowBahagianModal] = useState<boolean>(false);
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
  const [selectedYear, setSelectedYear] = useState<string>('2026');

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
        setLoginError('ID Pengguna atau Kata Laluan Salah.');
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
      return matchTeras && matchBahagian;
    });
  }, [kpiList, selectedTeras, activeBahagianFilter]);

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
      
      {/* HEADER UTAMA */}
      <header className="bg-[#0f2042] text-white px-4 py-3 flex items-center justify-between shadow-md border-b-2 border-amber-400">
        <div>
          <div className="text-xs font-extrabold text-amber-400 tracking-wider uppercase">
            {t.subtitle}
          </div>
          <h1 className="text-base sm:text-xl font-black tracking-wide text-white uppercase mt-0.5">
            {t.title}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#1a2f58] text-white text-xs px-2.5 py-1.5 rounded border border-slate-600 outline-none font-bold"
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>

          <button 
            onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
            className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded tracking-wider uppercase shadow-xs hover:bg-amber-300 transition"
          >
            {lang === 'bm' ? 'EN' : 'BM'}
          </button>

          {userRole !== 'PUBLIC' ? (
            <button 
              onClick={handleLogout} 
              className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded shadow-xs"
            >
              {t.logOut} ({userRole})
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded transition tracking-wide shadow-xs"
            >
              {t.logIn}
            </button>
          )}
        </div>
      </header>

      {/* BODY DENGAN SIDEBAR NAVIGASI KIRI */}
      <div className="flex-1 flex overflow-hidden">
        
        <aside className="w-14 bg-[#0f2042] text-slate-300 flex flex-col items-center py-4 space-y-6 border-r border-slate-800">
          <button 
            onClick={() => setSelectedBahagian('ALL')} 
            className="p-2.5 rounded bg-amber-400 text-slate-950 font-black text-base transition hover:scale-105" 
            title="Utama (Reset)"
          >
            🏠
          </button>
          <button 
            onClick={() => setShowBahagianModal(true)} 
            className="p-2.5 rounded hover:bg-[#1a2f58] text-base transition hover:scale-105" 
            title="Pilih Dari 14 Bahagian"
          >
            👥
          </button>
        </aside>

        {/* KANDUNGAN UTAMA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {userRole !== 'PUBLIC' && (
            <div className="p-3 bg-amber-50 rounded border border-amber-300 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">
                Sesi Pentadbir Aktif: <strong>{userRole}</strong>
              </span>
              <div className="space-x-2">
                <button onClick={handleOpenAdd} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs">
                  + {t.addKpi}
                </button>
                <button onClick={() => setShowLogModal(true)} className="px-3.5 py-1.5 bg-[#0f2042] hover:bg-slate-800 text-white font-bold rounded shadow-xs">
                  {t.auditLog} ({auditLogs.length})
                </button>
              </div>
            </div>
          )}

          {/* 1. SEKSYEN KAD KPI UTAMA */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              {t.kpiCardTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* 2. GRID DUA KOLUM */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <div className={`px-4 py-2 text-white font-black text-xs uppercase tracking-wide ${
                          item.status === 'hijau' ? 'bg-[#0f2042]' :
                          item.status === 'kuning' ? 'bg-amber-400 text-slate-950' : 'bg-[#0f2042]'
                        }`}>
                          {lang === 'en' && item.terasNameEn ? item.terasNameEn : item.terasName}
                        </div>

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

                            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-sm ${
                              item.status === 'hijau' ? 'bg-emerald-600' :
                              item.status === 'kuning' ? 'bg-amber-400 text-slate-950' : 'bg-rose-600'
                            }`}>
                              {item.status === 'hijau' ? '✓' : '!'}
                            </div>

                            {canEdit && (
                              <button onClick={() => handleOpenEdit(item)} className="text-xs font-bold text-amber-600 border border-amber-300 px-2 py-1 rounded hover:bg-amber-50">
                                Edit
                              </button>
                            )}
                          </div>

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

            {/* KOLUM KANAN */}
            <div className="space-y-4">
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

      {/* MODAL 14 BAHAGIAN */}
      {showBahagianModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full border shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="text-xs font-black uppercase text-slate-900">Pilih Bahagian / Unit PSUKPP (14 Unit)</h3>
              <button onClick={() => setShowBahagianModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto p-1">
              <button
                onClick={() => { setSelectedBahagian('ALL'); setShowBahagianModal(false); }}
                className={`p-2.5 rounded text-left border text-xs font-extrabold transition ${
                  selectedBahagian === 'ALL' ? 'bg-[#0f2042] text-amber-400 border-[#0f2042]' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                🌐 KESELURUHAN (PSUKPP)
              </button>

              {BAHAGIAN_LIST.map((b) => (
                <button
                  key={b.code}
                  onClick={() => { setSelectedBahagian(b.code); setShowBahagianModal(false); }}
                  className={`p-2.5 rounded text-left border text-xs font-bold transition ${
                    selectedBahagian === b.code ? 'bg-[#0f2042] text-amber-400 border-[#0f2042]' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono font-black text-amber-600 block">{b.code}</span>
                  <span className="text-[11px] text-slate-700 leading-tight block">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOG MASUK */}
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

      {/* MODAL FORM TAMBAH/EDIT */}
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
