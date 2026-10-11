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
  { code: 'BPEN', name: 'Bahagian Perancang Ekonomi Negeri (BPEN)' },
  { code: 'BPSM', name: 'Bahagian Pengurusan Sumber Manusia (BPSM)' },
  { code: 'BTMKN', name: 'Bahagian Teknologi Maklumat Dan Komunikasi Negeri (BTMKN)' },
  { code: 'UAD', name: 'Unit Audit Dalam (UAD)' },
  { code: 'BKP', name: 'Bahagian Khidmat Pengurusan (BKP)' },
  { code: 'DUN', name: 'Dewan Undangan Negeri (DUN)' },
  { code: 'BKT', name: 'Bahagian Kerajaan Tempatan (BKT)' },
  { code: 'BPMP', name: 'Bahagian Pengurusan Majlis Dan Protokol (BPMP)' },
  { code: 'MSNPP', name: 'Majlis Sukan Negeri Pulau Pinang (MSNPP)' },
  { code: 'BKSA', name: 'Bahagian Kawal Selia Air (BKSA)' },
  { code: 'UKKI', name: 'Unit Komunikasi Korporat & Inovasi (UKKI)' },
  { code: 'UI', name: 'Unit Integriti (UI)' },
  { code: 'UPB', name: 'Unit Pengurusan Bencana (UPB)' },
  { code: 'PPW', name: 'Pejabat Pesuruhjaya Warisan (PPW)' },
];

const defaultKpiData = [
  {
    id: 'KPI-BPEN-01',
    terasId: 'T3',
    terasName: 'Teras 3: Pemantauan Projek Pembangunan & Ekonomi Negeri',
    title: 'Peratus Kelulusan Permohonan Kelulusan Pelan Pembangunan (14 Hari)',
    titleEn: 'Percentage of Approval Applications for Development Plans (14 Days)',
    bahagian: 'BPEN',
    sasaran: 90,
    pencapaian: 45,
    status: 'merah',
    q1: 10, q2: 25, q3: 35, q4: 45,
    pemilik: 'Bahagian Perancang Ekonomi Negeri (BPEN)',
    sebabKelewatan: 'Kelewatan ulasan teknikal daripada agensi luaran.',
    pelanIntervensi: 'Mengadakan Mesyuarat Taskforce Kelulusan Khas setiap minggu bersama agensi teknikal.'
  },
  {
    id: 'KPI-BPSM-01',
    terasId: 'T2',
    terasName: 'Teras 2: Pembangunan Modal Insan & Prestasi Warga Kerja',
    title: 'Peratus Warga Kerja Menghadiri Latihan Sekurang-kurangnya 7 Hari/Tahun',
    titleEn: 'Percentage of Employees Attending Training at Least 7 Days/Year',
    bahagian: 'BPSM',
    sasaran: 100,
    pencapaian: 65,
    status: 'kuning',
    q1: 15, q2: 35, q3: 50, q4: 65,
    pemilik: 'Bahagian Pengurusan Sumber Manusia (BPSM)',
    sebabKelewatan: 'Kekangan jadual kerja penjawat awam pada suku tahun kedua.',
    pelanIntervensi: 'Melaksanakan kursus e-learning secara dalam talian untuk kemudahan warga kerja.'
  },
  {
    id: 'KPI-BTMKN-01',
    terasId: 'T1',
    terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
    title: 'Peratusan Transaksi Perkhidmatan Atas Talian (E-Perkhidmatan)',
    titleEn: 'Percentage of Online Service Transactions (E-Services)',
    bahagian: 'BTMKN',
    sasaran: 85,
    pencapaian: 88,
    status: 'hijau',
    q1: 20, q2: 45, q3: 70, q4: 88,
    pemilik: 'Bahagian Teknologi Maklumat Dan Komunikasi Negeri (BTMKN)',
    sebabKelewatan: '',
    pelanIntervensi: ''
  },
  {
    id: 'KPI-UAD-01',
    terasId: 'T1',
    terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
    title: 'Peratusan Penyelesaian Pengauditan Pengurusan Kewangan Jabatan',
    titleEn: 'Completion Percentage of Department Financial Management Audits',
    bahagian: 'UAD',
    sasaran: 100,
    pencapaian: 95,
    status: 'hijau',
    q1: 25, q2: 50, q3: 75, q4: 95,
    pemilik: 'Unit Audit Dalam (UAD)',
    sebabKelewatan: '',
    pelanIntervensi: ''
  },
  {
    id: 'KPI-BKP-01',
    terasId: 'T1',
    terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
    title: 'Indeks Kepuasan Pelanggan Luaran Terhadap Perkhidmatan Utama',
    titleEn: 'External Customer Satisfaction Index on Core Services',
    bahagian: 'BKP',
    sasaran: 90,
    pencapaian: 92,
    status: 'hijau',
    q1: 25, q2: 50, q3: 75, q4: 92,
    pemilik: 'Bahagian Khidmat Pengurusan (BKP)',
    sebabKelewatan: '',
    pelanIntervensi: ''
  }
];

const dict = {
  bm: {
    topBar: 'Portal Rasmi Pejabat Setiausaha Kerajaan Negeri Pulau Pinang',
    subTitle: 'Sistem Pemantauan Pelan Strategik Organisasi (PSO)',
    title: 'DASHBOARD PRESTASI PELAN STRATEGIK ORGANISASI',
    exportCsv: 'Eksport Laporan (CSV)',
    print: 'Cetak Laporan',
    modAwam: 'Mod Awam',
    logOut: 'Log Keluar',
    logIn: 'Log Masuk Pentadbir',
    filterTitle: 'Pilihan Bahagian / Unit Organisasi (14 Bahagian)',
    showAll: 'Papar Keseluruhan PSUKPP',
    all14: 'KESELURUHAN',
    kpiUnit: 'KPI',
    adminPanel: 'Sesi Pentadbir Aktif',
    adminLocked: 'Kawalan data dikunci khusus untuk',
    adminFull: 'Kebenaran Pentadbir Utama (Semua Bahagian/Unit).',
    addRecord: 'Tambah Rekod KPI',
    auditLog: 'Log Sejarah Audit',
    resetDefault: 'Reset Data Asal',
    avgScore: 'Purata Pencapaian',
    kpiRatio: 'Nisbah KPI Terpilih',
    totalKpi: 'Jumlah Inisiatif',
    monitoringStatus: 'Status Pemantauan Aktif',
    targetMet: 'Mencapai Sasaran',
    inAttention: 'Dalam Perhatian',
    requiresAction: 'Memerlukan Intervensi',
    filterHeader: 'Tapisan Carian & Parameter',
    resetFilter: 'Semak Semula Tapisan',
    searchPlaceholder: 'Kata kunci tajuk / kod...',
    strategicPillar: 'Teras Strategik',
    allPillars: 'Semua Teras Strategik',
    deptUnit: 'Bahagian / Unit',
    allDepts: 'Semua Bahagian (14 Unit)',
    performanceStatus: 'Status Prestasi',
    allStatus: 'Semua Status Prestasi',
    statusGreen: 'Hijau (Mencapai Sasaran)',
    statusYellow: 'Kuning (Dalam Perhatian)',
    statusRed: 'Merah (Memerlukan Intervensi)',
    pieChartTitle: 'Analisis Taburan Status Inisiatif',
    trendTitle: 'Purata Pencapaian Mengikut Suku Tahun (Q1-Q4)',
    tableTitle: 'SENARAI STRATEGIK & KPI ORGANISASI',
    recordsShown: 'Paparan Rekod',
    colCode: 'Kod Rekod',
    colTitle: 'Pernyataan KPI & Inisiatif',
    colDept: 'Bahagian',
    colTarget: 'Sasaran',
    colAchieved: 'Pencapaian',
    colStatus: 'Status Prestasi',
    colAction: 'Tindakan',
    detail: 'Perincian',
    close: 'Tutup',
    edit: 'Edit',
    delete: 'Padam',
    detailTitle: 'Maklumat Perincian KPI',
    owner: 'Pemilik Rekod',
    annualTarget: 'Sasaran Tahunan',
    currentScore: 'Pencapaian Semasa',
    riskMitigation: 'Pengurusan Risiko & Intervensi',
    delayCause: 'Punca Kelewatan',
    interventionAction: 'Tindakan Intervensi',
    quarterlyBreakdown: 'Pencapaian Mengikut Suku Tahun',
    q1: 'Suku 1 (Q1)', q2: 'Suku 2 (Q2)', q3: 'Suku 3 (Q3)', q4: 'Suku 4 (Q4)',
    noRecord: 'Tiada rekod ditemui mengikut kriteria tapisan.'
  },
  en: {
    topBar: 'Official Portal of the Penang State Secretary Office',
    subTitle: 'Organizational Strategic Plan (PSO) Monitoring System',
    title: 'ORGANIZATIONAL STRATEGIC PLAN PERFORMANCE DASHBOARD',
    exportCsv: 'Export Report (CSV)',
    print: 'Print Report',
    modAwam: 'Public Mode',
    logOut: 'Log Out',
    logIn: 'Admin Login',
    filterTitle: 'Select Department / Unit (14 Divisions)',
    showAll: 'View All PSUKPP',
    all14: 'OVERALL',
    kpiUnit: 'KPIs',
    adminPanel: 'Active Admin Session',
    adminLocked: 'Data control is strictly locked for',
    adminFull: 'Super Admin Access (All 14 Divisions).',
    addRecord: 'Add KPI Record',
    auditLog: 'Audit History Logs',
    resetDefault: 'Reset Default Data',
    avgScore: 'Average Score',
    kpiRatio: 'Ratio of Selected KPIs',
    totalKpi: 'Total Initiatives',
    monitoringStatus: 'Active Monitoring Status',
    targetMet: 'Target Met',
    inAttention: 'Needs Attention',
    requiresAction: 'Requires Intervention',
    filterHeader: 'Search Filters & Parameters',
    resetFilter: 'Reset Filters',
    searchPlaceholder: 'Search title / code...',
    strategicPillar: 'Strategic Pillar',
    allPillars: 'All Strategic Pillars',
    deptUnit: 'Division / Unit',
    allDepts: 'All Divisions (14 Units)',
    performanceStatus: 'Performance Status',
    allStatus: 'All Performance Statuses',
    statusGreen: 'Green (Target Met)',
    statusYellow: 'Yellow (Needs Attention)',
    statusRed: 'Red (Requires Intervention)',
    pieChartTitle: 'Initiative Status Distribution Analysis',
    trendTitle: 'Quarterly Average Achievement (Q1-Q4)',
    tableTitle: 'STRATEGIC INITIATIVES & KPI LIST',
    recordsShown: 'Records Shown',
    colCode: 'Record Code',
    colTitle: 'KPI & Initiative Statement',
    colDept: 'Division',
    colTarget: 'Target',
    colAchieved: 'Achieved',
    colStatus: 'Performance Status',
    colAction: 'Action',
    detail: 'Details',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    detailTitle: 'KPI Detailed Information',
    owner: 'Record Owner',
    annualTarget: 'Annual Target',
    currentScore: 'Current Score',
    riskMitigation: 'Risk Management & Mitigation',
    delayCause: 'Cause of Delay',
    interventionAction: 'Intervention Action',
    quarterlyBreakdown: 'Quarterly Achievement Breakdown',
    q1: 'Quarter 1 (Q1)', q2: 'Quarter 2 (Q2)', q3: 'Quarter 3 (Q3)', q4: 'Quarter 4 (Q4)',
    noRecord: 'No records found matching the filter criteria.'
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
    terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
    title: '',
    bahagian: 'BPEN',
    sasaran: 80,
    pencapaian: 0,
    status: 'hijau',
    q1: 0, q2: 0, q3: 0, q4: 0,
    pemilik: 'Bahagian Perancang Ekonomi Negeri (BPEN)',
    sebabKelewatan: '',
    pelanIntervensi: ''
  });

  const [selectedTeras, setSelectedTeras] = useState<string>('ALL');
  const [selectedBahagian, setSelectedBahagian] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
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
        setLoginError('ID Pengguna atau Kata Laluan Tidak Sah.');
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

  const handleOpenAdd = () => {
    setEditingKpi(null);
    const code = loggedInBahagianCode || (selectedBahagian !== 'ALL' ? selectedBahagian : 'BPEN');
    const bName = BAHAGIAN_LIST.find(b => b.code === code)?.name || 'Bahagian';
    setFormData({
      id: `KPI-${code}-0${kpiList.filter(k => k.bahagian === code).length + 1}`,
      terasId: 'T1',
      terasName: 'Teras 1: Memantapkan Tata Kelola & Penyampaian Perkhidmatan',
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
    if (confirm(`Adakah anda pasti untuk memadam rekod ${id}?`)) {
      try {
        await deleteDoc(doc(db, 'kpis', id));
        addAuditLog(`Memadam rekod ${id}`);
        if (selectedKpiDetail?.id === id) setSelectedKpiDetail(null);
      } catch (e) {
        alert('Gagal memadam data.');
      }
    }
  };

  const handleResetData = async () => {
    if (confirm('Sahkan tindakan penetapan semula pangkalan data?')) {
      try {
        for (const item of defaultKpiData) {
          await setDoc(doc(db, 'kpis', item.id), item);
        }
        addAuditLog('Mengembalikan pangkalan data ke tetapan asal');
      } catch (e) {
        alert('Gagal mengembalikan pangkalan data.');
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
      alert('Gagal menyimpan rekod.');
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#00AEEF] font-sans antialiased">
      
      {/* HEADER TOP-BAR - EXCLUSIVELY #00AEEF, #FFF200 & #FFFFFF */}
      <div className="bg-[#00AEEF] text-[#FFFFFF] text-[11px] py-1.5 px-4 border-b border-[#FFF200]">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-bold">
          <span>{t.topBar}</span>
          <div className="flex items-center space-x-4">
            <span>{t.subTitle}</span>
            <button 
              onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
              className="bg-[#FFF200] text-[#00AEEF] font-black text-[10px] px-2.5 py-0.5 rounded tracking-wider uppercase shadow-xs transition hover:brightness-105"
            >
              {lang === 'bm' ? '🌐 ENGLISH' : '🌐 BAHASA MELAYU'}
            </button>
          </div>
        </div>
      </div>

      {/* HEADER MAIN */}
      <header className="bg-[#00AEEF] text-[#FFFFFF] border-b-4 border-[#FFF200] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            {/* JATA NEGERI PULAU PINANG INLINE SVG */}
            <div className="p-1.5 bg-[#FFFFFF] rounded shadow-xs border border-[#FFF200]">
              <svg className="h-12 w-10 text-[#00AEEF]" viewBox="0 0 100 130">
                <path d="M50,10 L50,40 M42,20 L58,20 M40,28 L60,28" stroke="#00AEEF" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="50" cy="8" r="4" fill="#00AEEF"/>
                <path d="M10,40 L90,40 L90,90 Q50,120 10,90 Z" fill="#FFF200" stroke="#00AEEF" strokeWidth="3"/>
                <path d="M20,65 L80,65 M35,45 L35,65 M65,45 L65,65 M35,45 L50,65 L65,45" stroke="#00AEEF" strokeWidth="2.5" fill="none"/>
                <path d="M10,75 Q30,70 50,75 T90,75 M10,83 Q30,78 50,83 T90,83 M10,91 Q30,86 50,91 T90,91" stroke="#00AEEF" strokeWidth="3" fill="none"/>
                <path d="M5,110 Q50,125 95,110 L90,120 Q50,130 10,120 Z" fill="#FFF200" stroke="#00AEEF" strokeWidth="1.5"/>
                <text x="50" y="119" textAnchor="middle" fill="#00AEEF" fontSize="7" fontWeight="bold" fontFamily="serif">BERSATU DAN SETIA</text>
              </svg>
            </div>

            <div>
              <div className="text-[11px] font-black tracking-widest text-[#FFF200] uppercase">
                PEJABAT SETIAUSAHA KERAJAAN NEGERI PULAU PINANG
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FFFFFF] uppercase">
                {t.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold rounded bg-[#00AEEF] hover:bg-[#0096ce] text-[#FFFFFF] border border-[#FFF200] transition shadow-xs"
            >
              {t.exportCsv}
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-bold rounded bg-[#00AEEF] hover:bg-[#0096ce] text-[#FFFFFF] border border-[#FFF200] transition shadow-xs"
            >
              {t.print}
            </button>

            <div className="h-6 w-px bg-[#FFF200] mx-1"></div>

            {userRole !== 'PUBLIC' ? (
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-[#FFF200] text-[#00AEEF] font-black text-xs tracking-wider border border-[#00AEEF]">
                  {userRole}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold rounded bg-[#FFFFFF] hover:bg-slate-100 text-[#00AEEF] border border-[#00AEEF] transition"
                >
                  {t.logOut}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-xs font-black rounded bg-[#FFF200] hover:brightness-105 text-[#00AEEF] border border-[#00AEEF] transition tracking-wide uppercase shadow-xs"
              >
                {t.logIn}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* KANDUNGAN UTAMA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {loading ? (
          <div className="p-16 text-center text-[#00AEEF] font-bold bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs">
            Memuatkan Pangkalan Data...
          </div>
        ) : (
          <>
            {/* SELEKSI 14 BAHAGIAN */}
            {!loggedInBahagianCode && (
              <section className="bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs overflow-hidden">
                <div className="px-5 py-3 bg-[#00AEEF] border-b-2 border-[#FFF200] flex justify-between items-center text-[#FFFFFF]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#FFF200]">
                    {t.filterTitle}
                  </span>
                  {selectedBahagian !== 'ALL' && (
                    <button
                      onClick={() => setSelectedBahagian('ALL')}
                      className="text-xs font-extrabold text-[#FFF200] hover:underline"
                    >
                      {t.showAll}
                    </button>
                  )}
                </div>

                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  <button
                    onClick={() => setSelectedBahagian('ALL')}
                    className={`p-2.5 rounded text-center font-black text-xs border-2 transition ${
                      selectedBahagian === 'ALL'
                        ? 'bg-[#FFF200] text-[#00AEEF] border-[#00AEEF] shadow-xs'
                        : 'bg-[#FFFFFF] border-[#00AEEF] text-[#00AEEF] hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wider">{t.all14}</span>
                  </button>

                  {BAHAGIAN_LIST.map((b) => {
                    const isSelected = selectedBahagian === b.code;
                    const count = kpiList.filter(k => k.bahagian === b.code).length;
                    return (
                      <button
                        key={b.code}
                        onClick={() => setSelectedBahagian(b.code)}
                        className={`p-2.5 rounded text-center font-black text-xs border-2 transition ${
                          isSelected
                            ? 'bg-[#FFF200] text-[#00AEEF] border-[#00AEEF] shadow-xs'
                            : 'bg-[#FFFFFF] border-[#00AEEF] text-[#00AEEF] hover:bg-slate-50'
                        }`}
                        title={b.name}
                      >
                        <span className="truncate block font-mono font-bold">{b.code}</span>
                        <span className="text-[10px] opacity-80 font-normal">({count} {t.kpiUnit})</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* BAR KAWALAN ADMIN */}
            {userRole !== 'PUBLIC' && (
              <div className="p-4 bg-[#FFFFFF] rounded-lg border-2 border-[#FFF200] shadow-xs flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-xs font-black text-[#00AEEF] uppercase tracking-wider">
                    {t.adminPanel}: {userRole}
                  </h3>
                  <p className="text-xs text-[#00AEEF] font-medium mt-0.5">
                    {loggedInBahagianCode 
                      ? `${t.adminLocked} ${BAHAGIAN_LIST.find(b => b.code === loggedInBahagianCode)?.name}.`
                      : t.adminFull}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOpenAdd}
                    className="px-3.5 py-2 text-xs font-black rounded bg-[#FFF200] hover:brightness-105 text-[#00AEEF] border border-[#00AEEF] transition shadow-xs uppercase tracking-wide"
                  >
                    {t.addRecord}
                  </button>

                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-3.5 py-2 text-xs font-black rounded bg-[#00AEEF] hover:bg-[#0096ce] text-[#FFFFFF] border border-[#FFF200] transition shadow-xs uppercase tracking-wide"
                  >
                    {t.auditLog} ({auditLogs.length})
                  </button>

                  {userRole === 'SUPER_ADMIN' && (
                    <button
                      onClick={handleResetData}
                      className="px-3.5 py-2 text-xs font-bold rounded bg-[#FFFFFF] text-[#00AEEF] border border-[#00AEEF] transition hover:bg-slate-50"
                    >
                      {t.resetDefault}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 1. KAD METRIK PRESTASI */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs flex flex-col justify-between border-t-8 border-t-[#00AEEF]">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#00AEEF]">{t.avgScore}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-[#00AEEF]">{stats.avgScore}%</div>
                  <div className="text-xs text-[#00AEEF] font-medium mt-1">{t.kpiRatio}: {stats.total}</div>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded mt-3 overflow-hidden border border-[#00AEEF]">
                  <div className="bg-[#00AEEF] h-full rounded transition-all duration-500" style={{ width: `${stats.avgScore}%` }}></div>
                </div>
              </div>

              <div className="p-5 bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs flex flex-col justify-between border-t-8 border-t-[#00AEEF]">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#00AEEF]">{t.totalKpi}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-[#00AEEF]">{stats.total}</div>
                  <div className="text-xs text-[#00AEEF] font-medium mt-1">{t.monitoringStatus}</div>
                </div>
                <span className="text-[11px] text-[#00AEEF] font-bold mt-3">PSUKPP</span>
              </div>

              <div className="p-5 bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs flex flex-col justify-between border-t-8 border-t-[#FFF200]">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#00AEEF]">{t.targetMet}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-[#00AEEF]">{stats.hijau}</div>
                  <div className="text-xs text-[#00AEEF] font-medium mt-1">
                    {stats.total > 0 ? Math.round((stats.hijau / stats.total) * 100) : 0}%
                  </div>
                </div>
                <span className="text-[11px] text-[#00AEEF] font-extrabold mt-3 bg-[#FFF200] px-2 py-0.5 rounded text-center">HIJAU</span>
              </div>

              <div className="p-5 bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs flex flex-col justify-between border-t-8 border-t-[#FFF200]">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#00AEEF]">{t.inAttention}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-[#00AEEF]">{stats.kuning}</div>
                  <div className="text-xs text-[#00AEEF] font-medium mt-1">
                    {stats.total > 0 ? Math.round((stats.kuning / stats.total) * 100) : 0}%
                  </div>
                </div>
                <span className="text-[11px] text-[#00AEEF] font-extrabold mt-3 bg-[#FFF200] px-2 py-0.5 rounded text-center">KUNING</span>
              </div>

              <div className="p-5 bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs flex flex-col justify-between border-t-8 border-t-[#00AEEF]">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#00AEEF]">{t.requiresAction}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-[#00AEEF]">{stats.merah}</div>
                  <div className="text-xs text-[#00AEEF] font-medium mt-1">
                    {stats.total > 0 ? Math.round((stats.merah / stats.total) * 100) : 0}%
                  </div>
                </div>
                <span className="text-[11px] text-[#FFFFFF] bg-[#00AEEF] font-extrabold mt-3 px-2 py-0.5 rounded text-center border border-[#FFF200]">MERAH</span>
              </div>
            </section>

            {/* 2. PANEL FILTER & CARIAN */}
            <section className="bg-[#FFFFFF] p-5 rounded-lg border-2 border-[#00AEEF] shadow-xs">
              <div className="flex justify-between items-center pb-3 mb-4 border-b-2 border-[#00AEEF]">
                <span className="text-xs font-black uppercase tracking-wider text-[#00AEEF]">{t.filterHeader}</span>
                <button
                  onClick={() => { setSelectedTeras('ALL'); if (!loggedInBahagianCode) setSelectedBahagian('ALL'); setSelectedStatus('ALL'); setSearchTerm(''); }}
                  className="text-xs font-black text-[#00AEEF] hover:underline"
                >
                  {t.resetFilter}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-[#00AEEF] mb-1">Carian Kata Kunci</label>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border-2 border-[#00AEEF] font-bold outline-none bg-[#FFFFFF] text-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-[#00AEEF] mb-1">{t.strategicPillar}</label>
                  <select
                    value={selectedTeras}
                    onChange={(e) => setSelectedTeras(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border-2 border-[#00AEEF] font-bold outline-none bg-[#FFFFFF] text-[#00AEEF]"
                  >
                    <option value="ALL">{t.allPillars}</option>
                    <option value="T1">Teras 1: Tata Kelola</option>
                    <option value="T2">Teras 2: Modal Insan</option>
                    <option value="T3">Teras 3: Pembangunan</option>
                    <option value="T4">Teras 4: Kesejahteraan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-[#00AEEF] mb-1">{t.deptUnit}</label>
                  <select
                    disabled={!!loggedInBahagianCode}
                    value={activeBahagianFilter}
                    onChange={(e) => setSelectedBahagian(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded border-2 border-[#00AEEF] font-bold outline-none bg-[#FFFFFF] text-[#00AEEF] ${
                      loggedInBahagianCode ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="ALL">{t.allDepts}</option>
                    {BAHAGIAN_LIST.map(b => (
                      <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-[#00AEEF] mb-1">{t.performanceStatus}</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border-2 border-[#00AEEF] font-bold outline-none bg-[#FFFFFF] text-[#00AEEF]"
                  >
                    <option value="ALL">{t.allStatus}</option>
                    <option value="hijau">{t.statusGreen}</option>
                    <option value="kuning">{t.statusYellow}</option>
                    <option value="merah">{t.statusRed}</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 3. PAPARAN GRAF ANALITIK */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#FFFFFF] p-5 rounded-lg border-2 border-[#00AEEF] shadow-xs">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#00AEEF] mb-4">
                  {t.pieChartTitle}
                </h2>

                <div className="flex flex-col sm:flex-row items-center justify-around py-2">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path
                        className="text-slate-100"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {stats.pctHijau > 0 && (
                        <path
                          className="text-[#00AEEF] transition-all duration-700"
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
                          className="text-[#FFF200] transition-all duration-700"
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
                          className="text-[#00AEEF] opacity-50 transition-all duration-700"
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
                      <span className="text-2xl font-black text-[#00AEEF]">{stats.total}</span>
                      <span className="text-[10px] uppercase font-bold text-[#00AEEF]">JUMLAH KPI</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 space-y-2.5 text-xs font-bold text-[#00AEEF]">
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#00AEEF] inline-block border border-[#FFF200]"></span>
                      <span>{t.targetMet}:</span>
                      <span className="font-black">{stats.hijau}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#FFF200] inline-block border border-[#00AEEF]"></span>
                      <span>{t.inAttention}:</span>
                      <span className="font-black">{stats.kuning}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#00AEEF] opacity-50 inline-block border border-[#00AEEF]"></span>
                      <span>{t.requiresAction}:</span>
                      <span className="font-black">{stats.merah}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-5 rounded-lg border-2 border-[#00AEEF] shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#00AEEF]">
                    {t.trendTitle}
                  </h2>
                  <span className="text-[10px] bg-[#00AEEF] text-[#FFF200] px-2 py-0.5 rounded font-bold uppercase tracking-wider">%</span>
                </div>

                <div className="relative h-44 w-full flex items-end pt-6 pb-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-bold text-[#00AEEF] opacity-40 border-b border-[#00AEEF]">
                    <div className="border-b border-slate-100 w-full pt-1">100%</div>
                    <div className="border-b border-slate-100 w-full">50%</div>
                    <div className="w-full pb-1">0%</div>
                  </div>

                  <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#00AEEF"
                      strokeWidth="3.5"
                      points={`37.5,${getY(stats.avgQ1)} 112.5,${getY(stats.avgQ2)} 187.5,${getY(stats.avgQ3)} 262.5,${getY(stats.avgQ4)}`}
                    />
                    <circle cx="37.5" cy={getY(stats.avgQ1)} r="4" className="fill-[#FFF200] stroke-[#00AEEF] stroke-2" />
                    <circle cx="112.5" cy={getY(stats.avgQ2)} r="4" className="fill-[#FFF200] stroke-[#00AEEF] stroke-2" />
                    <circle cx="187.5" cy={getY(stats.avgQ3)} r="4" className="fill-[#FFF200] stroke-[#00AEEF] stroke-2" />
                    <circle cx="262.5" cy={getY(stats.avgQ4)} r="4" className="fill-[#FFF200] stroke-[#00AEEF] stroke-2" />
                  </svg>
                </div>

                <div className="grid grid-cols-4 text-center text-xs font-extrabold pt-2 border-t-2 border-[#00AEEF] text-[#00AEEF]">
                  <div>{t.q1} <span className="block text-[11px] font-bold">{stats.avgQ1}%</span></div>
                  <div>{t.q2} <span className="block text-[11px] font-bold">{stats.avgQ2}%</span></div>
                  <div>{t.q3} <span className="block text-[11px] font-bold">{stats.avgQ3}%</span></div>
                  <div>{t.q4} <span className="block text-[11px] font-bold">{stats.avgQ4}%</span></div>
                </div>
              </div>
            </section>

            {/* 4. JADUAL REKOD KPI RASMI */}
            <section className="bg-[#FFFFFF] rounded-lg border-2 border-[#00AEEF] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#00AEEF] text-[#FFFFFF] flex justify-between items-center border-b-2 border-[#FFF200]">
                <h2 className="text-xs font-black tracking-wider uppercase text-[#FFF200]">{t.tableTitle}</h2>
                <span className="text-xs font-bold">
                  {t.recordsShown}: <strong>{filteredData.length}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-black uppercase tracking-wider bg-slate-50 text-[#00AEEF] border-b-2 border-[#00AEEF]">
                      <th className="p-3.5">{t.colCode}</th>
                      <th className="p-3.5">{t.colTitle}</th>
                      <th className="p-3.5">{t.colDept}</th>
                      <th className="p-3.5 text-center">{t.colTarget}</th>
                      <th className="p-3.5 text-center">{t.colAchieved}</th>
                      <th className="p-3.5">{t.colStatus}</th>
                      <th className="p-3.5 text-center">{t.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00AEEF]/20 text-xs font-bold text-[#00AEEF]">
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => {
                        const isExpanded = selectedKpiDetail?.id === item.id;
                        const canEdit = canEditItem(item.bahagian);
                        const displayTitle = lang === 'en' && item.titleEn ? item.titleEn : item.title;

                        return (
                          <React.Fragment key={item.id}>
                            <tr className={isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}>
                              <td className="p-3.5 font-bold whitespace-nowrap">
                                <span className="px-2 py-1 rounded bg-[#00AEEF] text-[#FFF200] font-mono text-[11px] font-black">
                                  {item.id}
                                </span>
                              </td>

                              <td className="p-3.5 max-w-xs sm:max-w-md">
                                <div className="font-extrabold leading-snug text-[#00AEEF]">{displayTitle}</div>
                                <div className="text-[10px] opacity-80 mt-0.5">{item.pemilik}</div>
                              </td>

                              <td className="p-3.5 whitespace-nowrap">
                                <span className="font-black px-2 py-0.5 bg-[#FFF200] text-[#00AEEF] border border-[#00AEEF] rounded font-mono text-[11px]">
                                  {item.bahagian}
                                </span>
                              </td>

                              <td className="p-3.5 text-center font-bold">
                                {item.sasaran}%
                              </td>

                              <td className="p-3.5 text-center font-black text-sm">
                                <span>{item.pencapaian}%</span>
                              </td>

                              <td className="p-3.5 min-w-[140px]">
                                <div className="flex items-center space-x-2">
                                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden border border-[#00AEEF]">
                                    <div
                                      className="h-full rounded bg-[#00AEEF]"
                                      style={{ width: `${Math.min(item.pencapaian, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded border border-[#00AEEF] bg-[#FFF200] text-[#00AEEF]">
                                    {item.status}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3.5 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button
                                    onClick={() => setSelectedKpiDetail(isExpanded ? null : item)}
                                    className="px-2.5 py-1 text-[11px] font-black rounded bg-[#00AEEF] text-[#FFFFFF] hover:bg-[#0096ce] transition"
                                  >
                                    {isExpanded ? t.close : t.detail}
                                  </button>

                                  {canEdit && (
                                    <>
                                      <button
                                        onClick={() => handleOpenEdit(item)}
                                        className="px-2 py-1 text-[11px] font-black bg-[#FFF200] text-[#00AEEF] border border-[#00AEEF] rounded transition"
                                      >
                                        {t.edit}
                                      </button>
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-2 py-1 text-[11px] font-black bg-[#FFFFFF] text-[#00AEEF] border border-[#00AEEF] rounded transition hover:bg-slate-50"
                                      >
                                        {t.delete}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* PERINCIAN REKOD */}
                            {isExpanded && (
                              <tr className="bg-slate-50 border-b border-[#00AEEF]">
                                <td colSpan={7} className="p-4">
                                  <div className="p-4 bg-[#FFFFFF] rounded border-2 border-[#00AEEF] shadow-xs space-y-4">
                                    <div className="flex justify-between items-start pb-2 border-b-2 border-[#00AEEF]">
                                      <div>
                                        <span className="text-[10px] font-black text-[#00AEEF] uppercase tracking-widest">{t.detailTitle}</span>
                                        <h3 className="text-sm font-black text-[#00AEEF] mt-0.5">{displayTitle}</h3>
                                        <p className="text-xs text-[#00AEEF] font-bold">{item.terasName}</p>
                                      </div>
                                      <button
                                        onClick={() => setSelectedKpiDetail(null)}
                                        className="text-xs font-bold text-[#00AEEF]"
                                      >
                                        {t.close}
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                      <div className="p-3 bg-slate-50 rounded border border-[#00AEEF]">
                                        <span className="text-[10px] font-bold text-[#00AEEF] uppercase block">{t.owner}</span>
                                        <strong className="text-[#00AEEF] font-bold">{item.pemilik}</strong>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded border border-[#00AEEF]">
                                        <span className="text-[10px] font-bold text-[#00AEEF] uppercase block">{t.annualTarget}</span>
                                        <strong className="text-[#00AEEF] font-bold">{item.sasaran}%</strong>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded border border-[#00AEEF]">
                                        <span className="text-[10px] font-bold text-[#00AEEF] uppercase block">{t.currentScore}</span>
                                        <strong className="text-[#00AEEF] font-black">{item.pencapaian}%</strong>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded border border-[#00AEEF]">
                                        <span className="text-[10px] font-bold text-[#00AEEF] uppercase block">{t.colStatus}</span>
                                        <strong className="uppercase text-[#00AEEF] font-bold">{item.status}</strong>
                                      </div>
                                    </div>

                                    {(item.status === 'merah' || item.status === 'kuning' || item.sebabKelewatan) && (
                                      <div className="p-3 bg-[#FFF200]/20 border border-[#00AEEF] text-[#00AEEF] rounded text-xs space-y-1">
                                        <h4 className="font-black uppercase">{t.riskMitigation}</h4>
                                        <div><strong>{t.delayCause}:</strong> {item.sebabKelewatan || 'N/A'}</div>
                                        <div><strong>{t.interventionAction}:</strong> {item.pelanIntervensi || 'N/A'}</div>
                                      </div>
                                    )}

                                    <div className="text-xs pt-1 text-[#00AEEF]">
                                      <h4 className="font-extrabold uppercase mb-2">{t.quarterlyBreakdown}</h4>
                                      <div className="grid grid-cols-4 gap-2 text-center font-bold">
                                        <div className="p-2 border border-[#00AEEF] rounded bg-slate-50">{t.q1}: <strong>{item.q1}%</strong></div>
                                        <div className="p-2 border border-[#00AEEF] rounded bg-slate-50">{t.q2}: <strong>{item.q2}%</strong></div>
                                        <div className="p-2 border border-[#00AEEF] rounded bg-slate-50">{t.q3}: <strong>{item.q3}%</strong></div>
                                        <div className="p-2 border border-[#00AEEF] rounded bg-slate-50">{t.q4}: <strong>{item.q4}%</strong></div>
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
                        <td colSpan={7} className="p-8 text-center text-[#00AEEF] font-medium">
                          {t.noRecord}
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

      {/* MODAL LOG AUDIT */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-[#00AEEF]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 bg-[#FFFFFF] rounded-lg shadow-xl border-2 border-[#00AEEF] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b-2 border-[#00AEEF]">
              <h3 className="text-xs font-black uppercase text-[#00AEEF]">{t.auditLog}</h3>
              <button onClick={() => setShowLogModal(false)} className="text-[#00AEEF] font-bold">✕</button>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[#00AEEF]">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded border border-[#00AEEF] bg-slate-50">
                    <div className="flex justify-between font-bold">
                      <span>{log.pengguna}</span>
                      <span className="text-[10px] opacity-80">{log.tarikh}</span>
                    </div>
                    <p className="mt-1 font-medium">{log.tindakan}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-4">N/A</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOG MASUK ADMIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-[#00AEEF]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-[#FFFFFF] rounded-lg shadow-xl border-2 border-[#00AEEF]">
            <div className="flex justify-between items-center pb-3 border-b-2 border-[#00AEEF]">
              <h3 className="text-xs font-black uppercase text-[#00AEEF]">{t.logIn}</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-[#00AEEF] font-bold">✕</button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              {loginError && (
                <div className="p-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#00AEEF] mb-1">ID Pengguna (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="admin / admin_bpen..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border-2 border-[#00AEEF] font-bold outline-none bg-slate-50 text-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#00AEEF] mb-1">Kata Laluan</label>
                <input
                  type="password"
                  required
                  placeholder="Kata laluan keselamatan"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border-2 border-[#00AEEF] font-bold outline-none bg-slate-50 text-[#00AEEF]"
                />
              </div>

              <div className="p-3 rounded bg-slate-50 text-[11px] text-[#00AEEF] border border-[#00AEEF] space-y-1 font-bold">
                <div><strong>Super Admin:</strong> admin / admin123</div>
                <div><strong>Admin Bahagian:</strong> admin_&lt;kod_bahagian&gt; / admin123</div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded bg-slate-200 text-[#00AEEF]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black rounded bg-[#00AEEF] text-[#FFFFFF]"
                >
                  Log Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BORANG TAMBAH / EDIT KPI */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-[#00AEEF]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 bg-[#FFFFFF] rounded-lg shadow-xl border-2 border-[#00AEEF] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b-2 border-[#00AEEF]">
              <h3 className="text-xs font-black uppercase text-[#00AEEF]">
                {editingKpi ? `Kemaskini Rekod KPI (${formData.id})` : 'Pendaftaran KPI Baharu'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-[#00AEEF] font-bold">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs font-bold text-[#00AEEF]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Kod KPI</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded border-2 border-[#00AEEF] font-mono font-bold bg-slate-50 text-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Bahagian / Unit Pemilik</label>
                  <select
                    disabled={!!loggedInBahagianCode}
                    value={formData.bahagian}
                    onChange={(e) => {
                      const code = e.target.value;
                      const bName = BAHAGIAN_LIST.find(b => b.code === code)?.name || 'Bahagian';
                      setFormData({ ...formData, bahagian: code, pemilik: bName });
                    }}
                    className={`w-full px-3 py-2 rounded border-2 border-[#00AEEF] font-bold bg-slate-50 text-[#00AEEF] ${
                      loggedInBahagianCode ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {BAHAGIAN_LIST.map(b => (
                      <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Pernyataan KPI / Inisiatif Strategik</label>
                <textarea
                  required
                  rows={2}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded border-2 border-[#00AEEF] font-bold bg-slate-50 text-[#00AEEF]"
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
                    className="w-full px-3 py-2 rounded border-2 border-[#00AEEF] font-bold bg-slate-50 text-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Pencapaian Semasa (%)</label>
                  <input
                    type="number"
                    min="0" max="100" required
                    value={formData.pencapaian}
                    onChange={(e) => setFormData({ ...formData, pencapaian: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border-2 border-[#00AEEF] font-bold bg-slate-50 text-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Status Prestasi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded border-2 border-[#00AEEF] font-bold bg-slate-50 text-[#00AEEF]"
                  >
                    <option value="hijau">Hijau (Mencapai Sasaran)</option>
                    <option value="kuning">Kuning (Dalam Perhatian)</option>
                    <option value="merah">Merah (Memerlukan Intervensi)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded bg-[#FFF200]/20 border border-[#00AEEF] space-y-3">
                <h4 className="font-extrabold uppercase text-[#00AEEF]">Pengurusan Risiko & Intervensi</h4>
                <div>
                  <label className="block font-bold mb-1">Punca Kelewatan</label>
                  <input
                    type="text"
                    placeholder="Nyatakan sebab..."
                    value={formData.sebabKelewatan || ''}
                    onChange={(e) => setFormData({ ...formData, sebabKelewatan: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#00AEEF] bg-[#FFFFFF] text-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Pelan Intervensi Pembetulan</label>
                  <input
                    type="text"
                    placeholder="Nyatakan tindakan..."
                    value={formData.pelanIntervensi || ''}
                    onChange={(e) => setFormData({ ...formData, pelanIntervensi: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#00AEEF] bg-[#FFFFFF] text-[#00AEEF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Pencapaian Mengikut Suku Tahun (Q1 - Q4 %)</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number" placeholder="Q1" value={formData.q1}
                    onChange={(e) => setFormData({ ...formData, q1: Number(e.target.value) })}
                    className="p-2 rounded border-2 border-[#00AEEF] text-center font-bold bg-slate-50 text-[#00AEEF]"
                  />
                  <input
                    type="number" placeholder="Q2" value={formData.q2}
                    onChange={(e) => setFormData({ ...formData, q2: Number(e.target.value) })}
                    className="p-2 rounded border-2 border-[#00AEEF] text-center font-bold bg-slate-50 text-[#00AEEF]"
                  />
                  <input
                    type="number" placeholder="Q3" value={formData.q3}
                    onChange={(e) => setFormData({ ...formData, q3: Number(e.target.value) })}
                    className="p-2 rounded border-2 border-[#00AEEF] text-center font-bold bg-slate-50 text-[#00AEEF]"
                  />
                  <input
                    type="number" placeholder="Q4" value={formData.q4}
                    onChange={(e) => setFormData({ ...formData, q4: Number(e.target.value) })}
                    className="p-2 rounded border-2 border-[#00AEEF] text-center font-bold bg-slate-50 text-[#00AEEF]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#00AEEF]">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 font-bold rounded bg-slate-200 text-[#00AEEF]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-black rounded bg-[#00AEEF] text-[#FFFFFF]"
                >
                  Simpan Rekod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
