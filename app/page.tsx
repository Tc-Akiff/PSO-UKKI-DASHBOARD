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
      <header className={`${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-900 border-blue-950'
      } text-white border-b sticky top-0 z-30 shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-auto flex items-center justify-center overflow-hidden rounded-lg bg-white/10 p-1">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Coat_of_arms_of_Penang.svg" 
                alt="Logo Kerajaan Negeri Pulau Pinang" 
                className="h-12 w-auto max-h-12 object-contain drop-shadow-md"
              />
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold">
            🔄 Memuatkan pangkalan data Firebase Firestore...
          </div>
        ) : (
          <>
            {userRole !== 'PUBLIC' && (
              <div className={`p-4 rounded-xl border shadow-sm flex flex-wrap justify-between items-center gap-3 ${
                darkMode ? 'bg-slate-800 border-amber-500/40' : 'bg-amber-50 border-amber-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600 text-lg">⚡</span>
                  <div>
                    <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Panel Kawalan Pentadbir ({userRole})</h3>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Anda mempunyai kebenaran untuk mengemaskini Firebase secara dalam talian.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOpenAdd}
                    className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center space-x-1"
                  >
                    <span>➕ Tambah KPI</span>
                  </button>

                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-3 py-2 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition shadow-sm"
                  >
                    📜 Log Audit ({auditLogs.length})
                  </button>

                  {userRole === 'SUPER_ADMIN' && (
                    <button
                      onClick={handleResetData}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition ${
                        darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                      }`}
                    >
                      🔄 Reset Data Asal
                    </button>
                  )}
                </div>
              </div>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>Pencapaian Purata</span>
                  <span className="text-base">📈</span>
                </div>
                <div className="mt-3">
                  <div className={`text-3xl font-black ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>{stats.avgScore}%</div>
                  <div className={`mt-1 text-xs font-extrabold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Daripada {stats.total} KPI</div>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${stats.avgScore}%` }}></div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>Jumlah KPI</span>
                  <span className="text-base">🎯</span>
                </div>
                <div className="mt-3">
                  <div className={`text-3xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stats.total}</div>
                  <div className={`mt-1 text-xs font-extrabold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Inisiatif Terpilih</div>
                </div>
                <span className={`inline-block mt-3 text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Status Pemantauan Aktif</span>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>Mencapai Sasaran</span>
                  <span className="text-base">✅</span>
                </div>
                <div className="mt-3">
                  <div className={`text-3xl font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{stats.hijau}</div>
                  <div className={`mt-1 text-xs font-extrabold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    {stats.total > 0 ? Math.round((stats.hijau / stats.total) * 100) : 0}% daripada jumlah
                  </div>
                </div>
                <div className={`mt-3 text-xs font-black flex items-center ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  ● Status Hijau
                </div>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Dalam Perhatian</span>
                  <span className="text-base">⚠️</span>
                </div>
                <div className="mt-3">
                  <div className={`text-3xl font-black ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>{stats.kuning}</div>
                  <div className={`mt-1 text-xs font-extrabold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    {stats.total > 0 ? Math.round((stats.kuning / stats.total) * 100) : 0}% daripada jumlah
                  </div>
                </div>
                <div className={`mt-3 text-xs font-black flex items-center ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                  ● Status Kuning
                </div>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-rose-400' : 'text-rose-800'}`}>Lewat / Merah</span>
                  <span className="text-base">❌</span>
                </div>
                <div className="mt-3">
                  <div className={`text-3xl font-black ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>{stats.merah}</div>
                  <div className={`mt-1 text-xs font-extrabold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    {stats.total > 0 ? Math.round((stats.merah / stats.total) * 100) : 0}% daripada jumlah
                  </div>
                </div>
                <div className={`mt-3 text-xs font-black flex items-center ${darkMode ? 'text-rose-400' : 'text-rose-800'}`}>
                  ● Perlu Tindakan
                </div>
              </div>
            </section>

            <section className={`p-4 rounded-xl border shadow-sm ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <div className={`flex items-center space-x-2 text-sm font-black ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  <span>🔍</span>
                  <span>Carian & Tapisan Data</span>
                </div>
                <button
                  onClick={() => { setSelectedTeras('ALL'); setSelectedBahagian('ALL'); setSelectedStatus('ALL'); setSearchTerm(''); }}
                  className={`text-xs font-black transition ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}
                >
                  🔄 Reset Tapisan
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className={`block text-[11px] font-black mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>Cari Kata Kunci</label>
                  <input
                    type="text"
                    placeholder="Cari KPI / Bahagian..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border font-bold outline-none transition ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-700 text-slate-100' 
                        : 'bg-slate-50 border-slate-400 text-slate-900 placeholder-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-black mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>Teras Strategik</label>
                  <select
                    value={selectedTeras}
                    onChange={(e) => setSelectedTeras(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border font-bold outline-none transition ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-700 text-slate-100' 
                        : 'bg-slate-50 border-slate-400 text-slate-900'
                    }`}
                  >
                    <option value="ALL">Semua Teras Strategik</option>
                    <option value="T1">Teras 1: Tata Kelola</option>
                    <option value="T2">Teras 2: Modal Insan</option>
                    <option value="T3">Teras 3: Pembangunan</option>
                    <option value="T4">Teras 4: Kesejahteraan</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-black mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>Bahagian / Jabatan</label>
                  <select
                    value={selectedBahagian}
                    onChange={(e) => setSelectedBahagian(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border font-bold outline-none transition ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-700 text-slate-100' 
                        : 'bg-slate-50 border-slate-400 text-slate-900'
                    }`}
                  >
                    <option value="ALL">Semua Bahagian (BKP/BTM/BPEN/BKT)</option>
                    <option value="BTM">BTM - Teknologi Maklumat</option>
                    <option value="BKP">BKP - Khidmat Pengurusan</option>
                    <option value="BPEN">BPEN - Perancang Ekonomi</option>
                    <option value="BKT">BKT - Kerajaan Tempatan</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-black mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>Status Pencapaian</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border font-bold outline-none transition ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-700 text-slate-100' 
                        : 'bg-slate-50 border-slate-400 text-slate-900'
                    }`}
                  >
                    <option value="ALL">Semua Status (Hijau/Kuning/Merah)</option>
                    <option value="hijau">🟢 Hijau (Mencapai Sasaran)</option>
                    <option value="kuning">🟡 Kuning (Perlu Perhatian)</option>
                    <option value="merah">🔴 Merah (Tingkat Usaha)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-5 rounded-xl border shadow-sm ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="flex items-center space-x-2 mb-4">
                  <span>📊</span>
                  <h2 className={`text-xs font-black tracking-wider uppercase ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Taburan Status KPI (Carta Pie)</h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around py-2">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path
                        className="text-slate-200"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {stats.pctHijau > 0 && (
                        <path
                          className="text-emerald-500 transition-all duration-700"
                          strokeDasharray={`${stats.pctHijau}, 100`}
                          strokeDashoffset="0"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      )}
                      {stats.pctKuning > 0 && (
                        <path
                          className="text-amber-500 transition-all duration-700"
                          strokeDasharray={`${stats.pctKuning}, 100`}
                          strokeDashoffset={`-${stats.pctHijau}`}
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      )}
                      {stats.pctMerah > 0 && (
                        <path
                          className="text-rose-500 transition-all duration-700"
                          strokeDasharray={`${stats.pctMerah}, 100`}
                          strokeDashoffset={`-${stats.pctHijau + stats.pctKuning}`}
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className={`text-2xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stats.total}</span>
                      <span className={`text-[10px] uppercase font-black ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>JUMLAH KPI</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 space-y-3 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start space-x-3 text-xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block border border-emerald-600"></span>
                      <span className={`font-black ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>Mencapai (Hijau):</span>
                      <span className={`font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stats.hijau}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start space-x-3 text-xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block border border-amber-600"></span>
                      <span className={`font-black ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>Amaran (Kuning):</span>
                      <span className={`font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stats.kuning}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start space-x-3 text-xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block border border-rose-600"></span>
                      <span className={`font-black ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>Lewat (Merah):</span>
                      <span className={`font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stats.merah}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span>📉</span>
                    <h2 className={`text-xs font-black tracking-wider uppercase ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Trend Suku Tahun (Q1-Q4)</h2>
                  </div>
                  <span className="text-[11px] bg-blue-900 text-white px-2 py-0.5 rounded font-black">Purata %</span>
                </div>

                <div className="relative h-44 w-full flex items-end pt-6 pb-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-black text-slate-600 border-b border-slate-300">
                    <div className="border-b border-slate-200 w-full pt-1">100%</div>
                    <div className="border-b border-slate-200 w-full">50%</div>
                    <div className="w-full pb-1">0%</div>
                  </div>

                  <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      points={`37.5,${getY(stats.avgQ1)} 112.5,${getY(stats.avgQ2)} 187.5,${getY(stats.avgQ3)} 262.5,${getY(stats.avgQ4)}`}
                    />
                    <circle cx="37.5" cy={getY(stats.avgQ1)} r="5" className="fill-blue-600 stroke-white stroke-2" />
                    <circle cx="112.5" cy={getY(stats.avgQ2)} r="5" className="fill-blue-600 stroke-white stroke-2" />
                    <circle cx="187.5" cy={getY(stats.avgQ3)} r="5" className="fill-blue-600 stroke-white stroke-2" />
                    <circle cx="262.5" cy={getY(stats.avgQ4)} r="5" className="fill-blue-600 stroke-white stroke-2" />
                  </svg>
                </div>

                <div className={`grid grid-cols-4 text-center text-xs font-black pt-2 border-t border-slate-200 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  <div>Q1 <span className={`block text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{stats.avgQ1}%</span></div>
                  <div>Q2 <span className={`block text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{stats.avgQ2}%</span></div>
                  <div>Q3 <span className={`block text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{stats.avgQ3}%</span></div>
                  <div>Q4 <span className={`block text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{stats.avgQ4}%</span></div>
                </div>
              </div>
            </section>

            <section className={`rounded-xl border shadow-sm overflow-hidden ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
            }`}>
              <div className="p-4 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center space-x-2">
                  <span>📋</span>
                  <h2 className="text-xs font-black tracking-wider uppercase text-white">SENARAI STATUS INISIATIF & KPI PSO</h2>
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Menunjukkan <strong>{filteredData.length}</strong> daripada <strong>{kpiList.length}</strong> rekod
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[11px] font-black uppercase tracking-wider border-b ${
                      darkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-200 text-slate-900 border-slate-400'
                    }`}>
                      <th className="p-3.5">KOD / TERAS</th>
                      <th className="p-3.5">PENYATAAN KPI / INISIATIF</th>
                      <th className="p-3.5">BAHAGIAN</th>
                      <th className="p-3.5 text-center">SASARAN</th>
                      <th className="p-3.5 text-center">PENCAPAIAN</th>
                      <th className="p-3.5">STATUS KEMAJUAN</th>
                      <th className="p-3.5 text-center">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-xs">
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => {
                        const isExpanded = selectedKpiDetail?.id === item.id;
                        const canEdit = canEditItem(item.bahagian);
                        return (
                          <React.Fragment key={item.id}>
                            <tr 
                              className={`transition ${
                                isExpanded 
                                  ? (darkMode ? 'bg-slate-700' : 'bg-blue-100') 
                                  : (darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100')
                              }`}
                            >
                              <td className="p-3.5 font-bold whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-black shadow-xs">
                                  {item.id}
                                </span>
                                <div className={`text-[10px] font-black mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>{item.terasId}</div>
                              </td>

                              <td className="p-3.5 max-w-xs sm:max-w-md">
                                <div className={`font-black leading-snug ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</div>
                                <div className={`text-[10px] mt-0.5 font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{item.pemilik}</div>
                              </td>

                              <td className="p-3.5 whitespace-nowrap">
                                <span className={`font-black ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{item.bahagian}</span>
                              </td>

                              <td className={`p-3.5 text-center font-black ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                                {item.sasaran}%
                              </td>

                              <td className="p-3.5 text-center font-black text-sm">
                                <span className={
                                  item.status === 'hijau' ? 'text-emerald-600 font-extrabold' :
                                  item.status === 'kuning' ? 'text-amber-600 font-extrabold' :
                                  'text-rose-600 font-extrabold'
                                }>
                                  {item.pencapaian}%
                                </span>
                              </td>

                              <td className="p-3.5 min-w-[140px]">
                                <div className="flex items-center space-x-2">
                                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                                    <div
                                      className={`h-full rounded-full ${
                                        item.status === 'hijau' ? 'bg-emerald-500' :
                                        item.status === 'kuning' ? 'bg-amber-500' : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${Math.min(item.pencapaian, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ${
                                    item.status === 'hijau' ? 'bg-emerald-600 text-white' :
                                    item.status === 'kuning' ? 'bg-amber-500 text-slate-950' :
                                    'bg-rose-600 text-white'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3.5 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button
                                    onClick={() => setSelectedKpiDetail(isExpanded ? null : item)}
                                    className="px-3 py-1 text-[11px] font-black rounded transition shadow-xs bg-blue-900 text-white hover:bg-blue-800"
                                  >
                                    {isExpanded ? '✖ Tutup' : 'ℹ️ Detail'}
                                  </button>

                                  {canEdit && (
                                    <>
                                      <button
                                        onClick={() => handleOpenEdit(item)}
                                        className="px-2 py-1 text-[11px] font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 rounded transition shadow-xs"
                                        title="Edit KPI"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-2 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition shadow-xs"
                                        title="Padam KPI"
                                      >
                                        🗑️
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className={darkMode ? 'bg-slate-900' : 'bg-blue-50'}>
                                <td colSpan={7} className="p-4 border-t border-b border-blue-300">
                                  <div className={`p-4 rounded-xl border-2 shadow-md ${
                                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-300'
                                  }`}>
                                    <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                                      <div>
                                        <span className="text-xs font-black text-blue-900 font-mono tracking-wider">MAKLUMAT TERPERINCI {item.id}</span>
                                        <h3 className={`text-sm font-black mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</h3>
                                        <p className={`text-[11px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>{item.terasName}</p>
                                      </div>
                                      <button
                                        onClick={() => setSelectedKpiDetail(null)}
                                        className="text-slate-900 font-black text-xs px-2"
                                      >
                                        ✕ Tutup
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 text-xs">
                                      <div className="p-3 rounded-lg bg-slate-900 text-white shadow-xs">
                                        <span className="text-slate-300 text-[10px] font-bold block uppercase">Pemilik / Bahagian:</span>
                                        <strong className="text-xs font-black text-white">{item.pemilik} ({item.bahagian})</strong>
                                      </div>
                                      <div className="p-3 rounded-lg bg-slate-900 text-white shadow-xs">
                                        <span className="text-slate-300 text-[10px] font-bold block uppercase">Sasaran Tahunan:</span>
                                        <strong className="text-sm font-black text-white">{item.sasaran}%</strong>
                                      </div>
                                      <div className="p-3 rounded-lg bg-slate-900 text-white shadow-xs">
                                        <span className="text-slate-300 text-[10px] font-bold block uppercase">Pencapaian Semasa:</span>
                                        <strong className="text-sm font-black text-blue-400">{item.pencapaian}%</strong>
                                      </div>
                                      <div className="p-3 rounded-lg bg-slate-900 text-white shadow-xs">
                                        <span className="text-slate-300 text-[10px] font-bold block uppercase">Status Prestasi:</span>
                                        <span className={`inline-block font-black uppercase text-xs mt-0.5 ${
                                          item.status === 'hijau' ? 'text-emerald-400' :
                                          item.status === 'kuning' ? 'text-amber-400' : 'text-rose-400'
                                        }`}>
                                          ● STATUS {item.status}
                                        </span>
                                      </div>
                                    </div>

                                    {(item.status === 'merah' || item.status === 'kuning' || item.sebabKelewatan) && (
                                      <div className="my-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-slate-900 text-xs space-y-2">
                                        <h4 className="font-extrabold text-rose-800 flex items-center space-x-1">
                                          <span>⚠️</span> <span>PENGURUSAN RISIKO & INTERVENSI</span>
                                        </h4>
                                        <div>
                                          <strong>Sebab Kelewatan:</strong> {item.sebabKelewatan || 'Tiada rekod kelewatan dikemukakan.'}
                                        </div>
                                        <div>
                                          <strong>Pelan Intervensi / Tindakan Pembetulan:</strong> {item.pelanIntervensi || 'Tiada pelan intervensi dikemukakan.'}
                                        </div>
                                      </div>
                                    )}

                                    <div className="text-xs pt-1">
                                      <h4 className={`font-extrabold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Pencapaian Mengikut Suku Tahun:</h4>
                                      <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="p-2 border border-slate-300 rounded-lg bg-slate-900 text-white shadow-xs">Q1: <strong className="text-sm font-black text-white">{item.q1}%</strong></div>
                                        <div className="p-2 border border-slate-300 rounded-lg bg-slate-900 text-white shadow-xs">Q2: <strong className="text-sm font-black text-white">{item.q2}%</strong></div>
                                        <div className="p-2 border border-slate-300 rounded-lg bg-slate-900 text-white shadow-xs">Q3: <strong className="text-sm font-black text-white">{item.q3}%</strong></div>
                                        <div className="p-2 border border-slate-300 rounded-lg bg-slate-900 text-white shadow-xs">Q4: <strong className="text-sm font-black text-blue-400">{item.q4}%</strong></div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-800 font-bold">
                          Tiada rekod KPI ditemui mengikut kriteria tapisan anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-xl p-6 rounded-2xl shadow-xl border max-h-[80vh] overflow-y-auto ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-black">📜 Log Audit & Sejarah Kemaskini (Firebase)</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
                    <div className="flex justify-between font-bold text-blue-900 dark:text-blue-400">
                      <span>👤 {log.pengguna}</span>
                      <span className="text-[10px] text-slate-500">{log.tarikh}</span>
                    </div>
                    <p className="mt-1 font-semibold">{log.tindakan}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">Tiada rekod perubahan dikesan lagi.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl border ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-black">🔒 Log Masuk Pentadbir (Admin)</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              {loginError && (
                <div className="p-3 text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300 rounded-lg">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="admin / admin_btm"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border font-semibold outline-none bg-slate-50 border-slate-400 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="admin123"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border font-semibold outline-none bg-slate-50 border-slate-400 text-slate-900"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 text-[11px] text-blue-950 border border-blue-200 font-bold space-y-1">
                <div>🔑 <strong>Super Admin:</strong> admin / admin123</div>
                <div>🔑 <strong>Admin BTM:</strong> admin_btm / admin123</div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-200 text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-900 text-white"
                >
                  Log Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl p-6 rounded-2xl shadow-xl border max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-black">
                {editingKpi ? `✏️ Sunting KPI (${formData.id})` : '➕ Tambah KPI Baharu'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Kod KPI</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border font-mono font-bold bg-slate-50 border-slate-400 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Bahagian</label>
                  <select
                    value={formData.bahagian}
                    onChange={(e) => setFormData({ ...formData, bahagian: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border font-bold bg-slate-50 border-slate-400 text-slate-900"
                  >
                    <option value="BTM">BTM - Teknologi Maklumat</option>
                    <option value="BKP">BKP - Khidmat Pengurusan</option>
                    <option value="BPEN">BPEN - Perancang Ekonomi</option>
                    <option value="BKT">BKT - Kerajaan Tempatan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Penyataan KPI / Inisiatif</label>
                <textarea
                  required
                  rows={2}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border font-bold bg-slate-50 border-slate-400 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Sasaran (%)</label>
                  <input
                    type="number"
                    min="0" max="100" required
                    value={formData.sasaran}
                    onChange={(e) => setFormData({ ...formData, sasaran: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border font-bold bg-slate-50 border-slate-400 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Pencapaian Semasa (%)</label>
                  <input
                    type="number"
                    min="0" max="100" required
                    value={formData.pencapaian}
                    onChange={(e) => setFormData({ ...formData, pencapaian: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border font-bold bg-slate-50 border-slate-400 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Status Prestasi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border font-bold bg-slate-50 border-slate-400 text-slate-900"
                  >
                    <option value="hijau">🟢 Hijau (Mencapai)</option>
                    <option value="kuning">🟡 Kuning (Amaran)</option>
                    <option value="merah">🔴 Merah (Lewat)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-slate-900 space-y-3">
                <h4 className="font-bold text-amber-900">⚠️ Pengurusan Intervensi & Risiko (Jika Merah/Kuning)</h4>
                <div>
                  <label className="block font-bold mb-1">Sebab Kelewatan</label>
                  <input
                    type="text"
                    placeholder="Nyatakan punca kelewatan..."
                    value={formData.sebabKelewatan || ''}
                    onChange={(e) => setFormData({ ...formData, sebabKelewatan: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Pelan Intervensi / Actions</label>
                  <input
                    type="text"
                    placeholder="Nyatakan tindakan pembetulan..."
                    value={formData.pelanIntervensi || ''}
                    onChange={(e) => setFormData({ ...formData, pelanIntervensi: e.target.value })}
                    className="w-full px-3 py-2 rounded border bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Pencapaian Suku Tahun (Q1 - Q4 %)</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number" placeholder="Q1" value={formData.q1}
                    onChange={(e) => setFormData({ ...formData, q1: Number(e.target.value) })}
                    className="p-2 rounded border text-center font-bold bg-slate-50 border-slate-400 text-slate-900"
                  />
                  <input
                    type="number" placeholder="Q2" value={formData.q2}
                    onChange={(e) => setFormData({ ...formData, q2: Number(e.target.value) })}
                    className="p-2 rounded border text-center font-bold bg-slate-50 border-slate-400 text-slate-900"
                  />
                  <input
                    type="number" placeholder="Q3" value={formData.q3}
                    onChange={(e) => setFormData({ ...formData, q3: Number(e.target.value) })}
                    className="p-2 rounded border text-center font-bold bg-slate-50 border-slate-400 text-slate-900"
                  />
                  <input
                    type="number" placeholder="Q4" value={formData.q4}
                    onChange={(e) => setFormData({ ...formData, q4: Number(e.target.value) })}
                    className="p-2 rounded border text-center font-bold bg-slate-50 border-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 font-bold rounded-lg bg-slate-200 text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Simpan ke Firebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
