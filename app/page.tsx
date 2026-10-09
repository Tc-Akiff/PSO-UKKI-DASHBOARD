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

// --- DATA ASAL PRESTASI PSO PSUKPP ---
const defaultKpiData = [
  {
    id: 'KPI-01',
    terasId: 'T1',
    terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
    title: 'Peratusan Transaksi Perkhidmatan Atas Talian (E-Perkhidmatan)',
    bahagian: 'BTM',
    sasaran: 85,
    pencapaian: 88,
    status: 'hijau',
    q1: 20, q2: 45, q3: 70, q4: 88,
    pemilik: 'Bahagian Teknologi Maklumat',
    sebabKelewatan: '',
    pelanIntervensi: ''
  },
  {
    id: 'KPI-02',
    terasId: 'T1',
    terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
    title: 'Indeks Kepuasan Pelanggan Luaran Terhadap Perkhidmatan Utama',
    bahagian: 'BKP',
    sasaran: 90,
    pencapaian: 92,
    status: 'hijau',
    q1: 25, q2: 50, q3: 75, q4: 92,
    pemilik: 'Bahagian Khidmat Pengurusan',
    sebabKelewatan: '',
    pelanIntervensi: ''
  },
  {
    id: 'KPI-03',
    terasId: 'T2',
    terasName: 'Teras 2: Pembangunan Modal Insan & Prestasi Warga Kerja',
    title: 'Peratus Warga Kerja Menghadiri Latihan Sekurang-kurangnya 5 Hari/Tahun',
    bahagian: 'BKP',
    sasaran: 100,
    pencapaian: 65,
    status: 'kuning',
    q1: 15, q2: 35, q3: 50, q4: 65,
    pemilik: 'Bahagian Khidmat Pengurusan',
    sebabKelewatan: 'Kekangan jadual kerja penjawat awam pada suku tahun kedua.',
    pelanIntervensi: 'Melaksanakan kursus e-learning secara dalam talian untuk kemudahan warga kerja.'
  },
  {
    id: 'KPI-04',
    terasId: 'T2',
    terasName: 'Teras 2: Pembangunan Modal Insan & Prestasi Warga Kerja',
    title: 'Peratusan Pelaksanaan Program Pembudayaan Inovasi & Nilai Murni',
    bahagian: 'BKP',
    sasaran: 80,
    pencapaian: 78,
    status: 'hijau',
    q1: 20, q2: 40, q3: 60, q4: 78,
    pemilik: 'Bahagian Khidmat Pengurusan',
    sebabKelewatan: '',
    pelanIntervensi: ''
  },
  {
    id: 'KPI-05',
    terasId: 'T3',
    terasName: 'Teras 3: Pemantauan Projek Pembangunan & Ekonomi Negeri',
    title: 'Peratus Kelulusan Permohonan Kelulusan Pelan Pembangunan (14 Hari)',
    bahagian: 'BPEN',
    sasaran: 90,
    pencapaian: 45,
    status: 'merah',
    q1: 10, q2: 25, q3: 35, q4: 45,
    pemilik: 'Bahagian Perancang Ekonomi Negeri',
    sebabKelewatan: 'Kelewatan ulasan teknikal daripada agensi luaran.',
    pelanIntervensi: 'Mengadakan Mesyuarat Taskforce Kelulusan Khas setiap minggu bersama agensi teknikal.'
  },
  {
    id: 'KPI-06',
    terasId: 'T3',
    terasName: 'Teras 3: Pemantauan Projek Pembangunan & Ekonomi Negeri',
    title: 'Peratus Prestasi Perbelanjaan Pembangunan Negeri',
    bahagian: 'BPEN',
    sasaran: 95,
    pencapaian: 82,
    status: 'kuning',
    q1: 20, q2: 45, q3: 65, q4: 82,
    pemilik: 'Bahagian Perancang Ekonomi Negeri',
    sebabKelewatan: 'Isu bayaran tuntutan akhir projek pembangunan lewat dikemukakan kontraktor.',
    pelanIntervensi: 'Membuat peringatan mesra perbelanjaan dan mempercepatkan pemprosesan tuntutan.'
  },
  {
    id: 'KPI-07',
    terasId: 'T4',
    terasName: 'Teras 4: Kesejahteraan Sosial & Pembangunan Komuniti',
    title: 'Peratus Program Penglibatan Komuniti Pendigitalan Smart Penang',
    bahagian: 'BKT',
    sasaran: 80,
    pencapaian: 85,
    status: 'hijau',
    q1: 20, q2: 45, q3: 65, q4: 85,
    pemilik: 'Bahagian Kerajaan Tempatan',
    sebabKelewatan: '',
    pelanIntervensi: ''
  },
  {
    id: 'KPI-08',
    terasId: 'T4',
    terasName: 'Teras 4: Kesejahteraan Sosial & Pembangunan Komuniti',
    title: 'Jumlah Program Kesedaran Keselamatan Cyber di Peringkat Komuniti',
    bahagian: 'BTM',
    sasaran: 70,
    pencapaian: 30,
    status: 'merah',
    q1: 5, q2: 12, q3: 20, q4: 30,
    pemilik: 'Bahagian Teknologi Maklumat',
    sebabKelewatan: 'Peruntukan kewangan program suku ketiga ditangguhkan.',
    pelanIntervensi: 'Menggunakan peruntukan dalaman dan bekerjasama dengan NACSA/CyberSecurity Malaysia.'
  }
];

export default function PSUKPPPage() {
  const [kpiList, setKpiList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'PUBLIC' | 'SUPER_ADMIN' | 'ADMIN_BTM' | 'ADMIN_BKP' | 'ADMIN_BPEN' | 'ADMIN_BKT'>('PUBLIC');
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
    terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
    title: '',
    bahagian: 'BTM',
    sasaran: 80,
    pencapaian: 0,
    status: 'hijau',
    q1: 0, q2: 0, q3: 0, q4: 0,
    pemilik: 'Bahagian Teknologi Maklumat',
    sebabKelewatan: '',
    pelanIntervensi: ''
  });

  const [selectedTeras, setSelectedTeras] = useState<string>('ALL');
  const [selectedBahagian, setSelectedBahagian] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedKpiDetail, setSelectedKpiDetail] = useState<any>(null);

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
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setUserRole('SUPER_ADMIN');
      setShowLoginModal(false);
      setLoginError('');
      setLoginUsername(''); setLoginPassword('');
    } else if (loginUsername === 'admin_btm' && loginPassword === 'admin123') {
      setUserRole('ADMIN_BTM');
      setShowLoginModal(false);
      setLoginError('');
      setLoginUsername(''); setLoginPassword('');
    } else {
      setLoginError('Username/Password Salah! Guna: admin / admin123');
    }
  };

  const canEditItem = (bahagian: string) => {
    if (userRole === 'SUPER_ADMIN') return true;
    if (userRole === 'ADMIN_BTM' && bahagian === 'BTM') return true;
    if (userRole === 'ADMIN_BKP' && bahagian === 'BKP') return true;
    if (userRole === 'ADMIN_BPEN' && bahagian === 'BPEN') return true;
    if (userRole === 'ADMIN_BKT' && bahagian === 'BKT') return true;
    return false;
  };

  const handleOpenAdd = () => {
    setEditingKpi(null);
    setFormData({
      id: `KPI-0${kpiList.length + 1}`,
      terasId: 'T1',
      terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
      title: '',
      bahagian: 'BTM',
      sasaran: 100,
      pencapaian: 0,
      status: 'kuning',
      q1: 0, q2: 0, q3: 0, q4: 0,
      pemilik: 'Bahagian Teknologi Maklumat',
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
    if (confirm(`Adakah anda pasti ingin memadam ${id}?`)) {
      try {
        await deleteDoc(doc(db, 'kpis', id));
        addAuditLog(`Memadam rekod ${id}`);
        if (selectedKpiDetail?.id === id) setSelectedKpiDetail(null);
      } catch (e) {
        alert('Gagal memadam data dari Firebase!');
      }
    }
  };

  const handleResetData = async () => {
    if (confirm('Set semula semua data di Firebase ke tetapan asal?')) {
      try {
        for (const item of defaultKpiData) {
          await setDoc(doc(db, 'kpis', item.id), item);
        }
        addAuditLog('Mengembalikan pangkalan data ke tetapan asal');
      } catch (e) {
        alert('Gagal set semula pangkalan data!');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKpi) {
        await updateDoc(doc(db, 'kpis', formData.id), formData);
        addAuditLog(`Kemaskini rekod ${formData.id}`);
      } else {
        await setDoc(doc(db, 'kpis', formData.id), formData);
        addAuditLog(`Tambah KPI baharu ${formData.id}`);
      }
      setShowFormModal(false);
    } catch (e) {
      alert('Gagal menyimpan data ke Firebase!');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID,Teras,Tajuk,Bahagian,Sasaran,Pencapaian,Status,Q1,Q2,Q3,Q4,Sebab Kelewatan,Pelan Intervensi\n'];
    const rows = filteredData.map(d => 
      `"${d.id}","${d.terasId}","${d.title}","${d.bahagian}",${d.sasaran},${d.pencapaian},"${d.status}",${d.q1},${d.q2},${d.q3},${d.q4},"${d.sebabKelewatan || ''}","${d.pelanIntervensi || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_PSO_PSUKPP_${Date.now()}.csv`;
    a.click();
  };

  const filteredData = useMemo(() => {
    return kpiList.filter((item) => {
      const matchTeras = selectedTeras === 'ALL' || item.terasId === selectedTeras;
      const matchBahagian = selectedBahagian === 'ALL' || item.bahagian === selectedBahagian;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pemilik.toLowerCase().includes(searchTerm.toLowerCase());

      return matchTeras && matchBahagian && matchStatus && matchSearch;
    });
  }, [kpiList, selectedTeras, selectedBahagian, selectedStatus, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const hijau = filteredData.filter((d) => d.status === 'hijau').length;
    const kuning = filteredData.filter((d) => d.status === 'kuning').length;
    const merah = filteredData.filter((d) => d.status === 'merah').length;
    const avgScore = total > 0 
      ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.pencapaian), 0) / total) 
      : 0;

    const pctHijau = total > 0 ? (hijau / total) * 100 : 0;
    const pctKuning = total > 0 ? (kuning / total) * 100 : 0;
    const pctMerah = total > 0 ? (merah / total) * 100 : 0;

    const avgQ1 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q1 || 0), 0) / total) : 0;
    const avgQ2 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q2 || 0), 0) / total) : 0;
    const avgQ3 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q3 || 0), 0) / total) : 0;
    const avgQ4 = total > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + Number(curr.q4 || 0), 0) / total) : 0;

    return { total, hijau, kuning, merah, avgScore, pctHijau, pctKuning, pctMerah, avgQ1, avgQ2, avgQ3, avgQ4 };
  }, [filteredData]);

  const getY = (val: number) => 85 - (val / 100) * 70;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* HEADER UTAMA BERSAMA LOGO EMBEDDED SVG PULAU PINANG */}
      <header className={`${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-900 border-blue-950'
      } text-white border-b sticky top-0 z-30 shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            {/* SVG EMBED LOGO PULAU PINANG (INDEPENDENT) */}
            <div className="bg-white p-1 rounded-lg shadow-md flex items-center justify-center h-12 w-12 border border-yellow-400">
              <svg viewBox="0 0 100 100" className="h-10 w-10">
                <rect width="100" height="100" fill="#003399" rx="10"/>
                <path d="M10,35 L90,35 L90,40 L10,40 Z" fill="#FFCC00"/>
                <path d="M10,60 L90,60 L90,65 L10,65 Z" fill="#FFFFFF"/>
                <circle cx="50" cy="50" r="22" fill="#FFCC00" stroke="#FFFFFF" strokeWidth="2"/>
                <tree fill="#006600">
                  <path d="M50,32 L58,48 L42,48 Z" fill="#008000"/>
                  <path d="M50,40 L62,58 L38,58 Z" fill="#006600"/>
                  <rect x="47" y="58" width="6" height="10" fill="#663300"/>
                </tree>
                <text x="50" y="86" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">PENANG</text>
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-yellow-300 uppercase">Pejabat Setiausaha Kerajaan Negeri Pulau Pinang</div>
              <h1 className="text-lg sm:text-xl font-extrabold leading-tight tracking-wide text-white">DASHBOARD PELAN STRATEGIK ORGANISASI (PSO)</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              title="Eksport CSV"
            >
              📥 Eksport CSV
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-800 hover:bg-blue-700 text-white transition shadow-sm border border-blue-700"
              title="Cetak Laporan"
            >
              🖨️ Cetak
            </button>

            <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center space-x-2 ${
              userRole !== 'PUBLIC'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm' 
                : 'bg-blue-800 text-slate-100 border-blue-700'
            }`}>
              <span>{userRole === 'PUBLIC' ? '👤 Mod: Awam' : `🔒 ${userRole}`}</span>
            </div>

            {userRole !== 'PUBLIC' ? (
              <button
                onClick={() => setUserRole('PUBLIC')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
              >
                Log Keluar
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition shadow-sm"
              >
                Log Masuk Admin
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-blue-800 text-white hover:bg-blue-700 transition text-sm border border-blue-700"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      {/* KANDUNGAN UTAMA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold">
            🔄 Memuatkan pangkalan data Firebase Firestore...
          </div>
        ) : (
          <>
            {/* BAR KAWALAN ADMIN */}
            {userRole !== 'PUBLIC' && (
              <div className={`p-4 rounded-xl border shadow-sm flex flex-wrap justify-between items-center gap-3 ${
                darkMode ? 'bg-slate-800 border-amber-500/40' : 'bg-amber-50 border-amber-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600 text-lg">⚡</span>
                  <div>
                    <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Panel Kawalan
