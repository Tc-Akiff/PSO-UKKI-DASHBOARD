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

// --- DATA DUMMY PRESTASI PSO PSUKPP ---
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

  // Read data from Firebase Firestore
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'kpis'), (snapshot) => {
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

    return () => unsubscribe();
  }, []);

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
        if (selectedKpiDetail?.id === id) setSelectedKpiDetail(null);
      } catch (e) {
        alert('Gagal memadam data!');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKpi) {
        await updateDoc(doc(db, 'kpis', formData.id), formData);
      } else {
        await setDoc(doc(db, 'kpis', formData.id), formData);
      }
      setShowFormModal(false);
    } catch (e) {
      alert('Gagal menyimpan data ke Firebase!');
    }
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

    return { total, hijau, kuning, merah, avgScore };
  }, [filteredData]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <header className={`${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-900 border-blue-950'
      } text-white border-b sticky top-0 z-30 shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-yellow-400 rounded-lg text-blue-950 font-bold shadow-sm text-lg">🏛️</div>
            <div>
              <div className="text-xs font-bold tracking-wider text-yellow-300 uppercase">Pejabat Setiausaha Kerajaan Negeri Pulau Pinang</div>
              <h1 className="text-lg sm:text-xl font-extrabold leading-tight tracking-wide text-white">DASHBOARD PELAN STRATEGIK ORGANISASI (PSO)</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center space-x-2 ${
              userRole !== 'PUBLIC' ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm' : 'bg-blue-800 text-slate-100 border-blue-700'
            }`}>
              <span>{userRole === 'PUBLIC' ? '👤 Mod: Awam' : `🔒 ${userRole}`}</span>
            </div>

            {userRole !== 'PUBLIC' ? (
              <button onClick={() => setUserRole('PUBLIC')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm">Log Keluar</button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition shadow-sm">Log Masuk Admin</button>
            )}

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-blue-800 text-white hover:bg-blue-700 transition text-sm border border-blue-700">
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold">
            🔄 Memuatkan data Firebase Firestore...
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
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Sistem disambung terus ke Firebase Firestore secara real-time.</p>
                  </div>
                </div>
                <button onClick={handleOpenAdd} className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm">
                  ➕ Tambah KPI
                </button>
              </div>
            )}

            {/* KAD RINGKASAN */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                <span className="text-xs font-black uppercase text-slate-500">Purata Pencapaian</span>
                <div className="text-3xl font-black text-blue-600 mt-2">{stats.avgScore}%</div>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                <span className="text-xs font-black uppercase text-slate-500">Jumlah KPI</span>
                <div className="text-3xl font-black mt-2">{stats.total}</div>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                <span className="text-xs font-black uppercase text-emerald-600">Hijau</span>
                <div className="text-3xl font-black text-emerald-600 mt-2">{stats.hijau}</div>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                <span className="text-xs font-black uppercase text-amber-600">Kuning</span>
                <div className="text-3xl font-black text-amber-600 mt-2">{stats.kuning}</div>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                <span className="text-xs font-black uppercase text-rose-600">Merah</span>
                <div className="text-3xl font-black text-rose-600 mt-2">{stats.merah}</div>
              </div>
            </section>

            {/* JADUAL KPI */}
            <section className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h2 className="text-xs font-black uppercase">📋 SENARAI STATUS INISIATIF & KPI PSO</h2>
                <span className="text-xs font-bold text-slate-300">Menunjukkan {filteredData.length} daripada {kpiList.length} rekod</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[11px] font-black uppercase border-b ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-200 text-slate-900'}`}>
                      <th className="p-3.5">KOD</th>
                      <th className="p-3.5">PENYATAAN KPI</th>
                      <th className="p-3.5">BAHAGIAN</th>
                      <th className="p-3.5 text-center">SASARAN</th>
                      <th className="p-3.5 text-center">PENCAPAIAN</th>
                      <th className="p-3.5">STATUS</th>
                      <th className="p-3.5 text-center">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-xs">
                    {filteredData.map((item) => {
                      const isExpanded = selectedKpiDetail?.id === item.id;
                      const canEdit = canEditItem(item.bahagian);
                      return (
                        <React.Fragment key={item.id}>
                          <tr className={isExpanded ? 'bg-blue-100/50 dark:bg-slate-700' : ''}>
                            <td className="p-3.5 font-bold">{item.id}</td>
                            <td className="p-3.5 font-black">{item.title}</td>
                            <td className="p-3.5 font-black">{item.bahagian}</td>
                            <td className="p-3.5 text-center font-black">{item.sasaran}%</td>
                            <td className="p-3.5 text-center font-black text-sm">{item.pencapaian}%</td>
                            <td className="p-3.5">
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded text-white ${item.status === 'hijau' ? 'bg-emerald-600' : item.status === 'kuning' ? 'bg-amber-500' : 'bg-rose-600'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <button onClick={() => setSelectedKpiDetail(isExpanded ? null : item)} className="px-3 py-1 text-[11px] font-black rounded bg-blue-900 text-white">
                                {isExpanded ? '✖ Tutup' : 'ℹ️ Detail'}
                              </button>
                              {canEdit && (
                                <button onClick={() => handleOpenEdit(item)} className="ml-1 px-2 py-1 text-[11px] font-bold bg-amber-400 text-slate-950 rounded">✏️</button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className={darkMode ? 'bg-slate-900' : 'bg-blue-50'}>
                              <td colSpan={7} className="p-4">
                                <div className="p-4 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                                  <h3 className="font-bold">{item.title} ({item.id})</h3>
                                  <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                                    <div className="p-2 border rounded bg-slate-900 text-white">Q1: {item.q1}%</div>
                                    <div className="p-2 border rounded bg-slate-900 text-white">Q2: {item.q2}%</div>
                                    <div className="p-2 border rounded bg-slate-900 text-white">Q3: {item.q3}%</div>
                                    <div className="p-2 border rounded bg-slate-900 text-white">Q4: {item.q4}%</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* MODAL LOG MASUK */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md text-slate-900">
            <h3 className="font-black text-base border-b pb-2">🔒 Log Masuk Admin</h3>
            <form onSubmit={handleLogin} className="space-y-3 mt-3">
              {loginError && <div className="p-2 text-xs font-bold text-rose-600 bg-rose-100 rounded">{loginError}</div>}
              <div>
                <label className="block text-xs font-bold mb-1">Username</label>
                <input type="text" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full p-2 border rounded text-xs" placeholder="admin" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Password</label>
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-2 border rounded text-xs" placeholder="admin123" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="px-3 py-1.5 text-xs bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-3 py-1.5 text-xs bg-blue-900 text-white rounded font-bold">Log Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
