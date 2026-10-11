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
    exportPdf: 'Eksport Laporan (PDF Rasmi)',
    print: 'Cetak Laporan',
    modAwam: 'Mod Awam',
    logOut: 'Log Keluar',
    logIn: 'Log Masuk Pentadbir',
    changePass: 'Tukar Kata Laluan',
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
    lblGreen: 'HIJAU',
    lblYellow: 'KUNING',
    lblRed: 'MERAH',
    pieChartTitle: 'Analisis Taburan Status Inisiatif',
    trendTitle: 'Purata Pencapaian Mengikut Suku Tahun (Q1-Q4)',
    benchChartTitle: 'Carta Perbandingan Prestasi Purata 14 Bahagian (%)',
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
    quarterlyBreakdown: 'Pencapaian Mengikut Suku Tahun & Garis Masa Roadmap',
    q1: 'Suku 1 (Q1)', q2: 'Suku 2 (Q2)', q3: 'Suku 3 (Q3)', q4: 'Suku 4 (Q4)',
    noRecord: 'Tiada rekod ditemui mengikut kriteria tapisan.'
  },
  en: {
    topBar: 'Official Portal of the Penang State Secretary Office',
    subTitle: 'Organizational Strategic Plan (PSO) Monitoring System',
    title: 'ORGANIZATIONAL STRATEGIC PLAN PERFORMANCE DASHBOARD',
    exportCsv: 'Export Report (CSV)',
    exportPdf: 'Export Official PDF Report',
    print: 'Print Report',
    modAwam: 'Public Mode',
    logOut: 'Log Out',
    logIn: 'Admin Login',
    changePass: 'Change Password',
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
    lblGreen: 'GREEN',
    lblYellow: 'YELLOW',
    lblRed: 'RED',
    pieChartTitle: 'Initiative Status Distribution Analysis',
    trendTitle: 'Quarterly Average Achievement (Q1-Q4)',
    benchChartTitle: 'Average Performance Comparison of 14 Divisions (%)',
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
    quarterlyBreakdown: 'Quarterly Achievement & Timeline Milestones',
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
  const [showChangePassModal, setShowChangePassModal] = useState<boolean>(false);
  const [passData, setPassData] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

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

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.oldPass !== 'admin123') {
      setPassMsg({ type: 'error', text: 'Kata laluan asal tidak tepat.' });
      return;
    }
    if (passData.newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.' });
      return;
    }
    if (passData.newPass !== passData.confirmPass) {
      setPassMsg({ type: 'error', text: 'Sahkan kata laluan tidak sepadan.' });
      return;
    }

    addAuditLog(`Menukar kata laluan untuk sesi ${userRole}`);
    setPassMsg({ type: 'success', text: 'Kata laluan berjaya dikemaskini.' });
    setTimeout(() => {
      setShowChangePassModal(false);
      setPassData({ oldPass: '', newPass: '', confirmPass: '' });
      setPassMsg({ type: '', text: '' });
    }, 1200);
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

  // CARTA PERBANDINGAN PRESTASI 14 BAHAGIAN
  const deptBenchStats = useMemo(() => {
    return BAHAGIAN_LIST.map(b => {
      const items = kpiList.filter(k => k.bahagian === b.code);
      const avg = items.length > 0
        ? Math.round(items.reduce((acc, curr) => acc + Number(curr.pencapaian || 0), 0) / items.length)
        : 0;
      return { code: b.code, name: b.name, avg, count: items.length };
    });
  }, [kpiList]);

  const getY = (val: number) => 85 - (val / 100) * 70;

  const getStatusLabel = (status: string) => {
    if (status === 'hijau') return t.lblGreen;
    if (status === 'kuning') return t.lblYellow;
    if (status === 'merah') return t.lblRed;
    return status;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      
      {/* HEADER TOP-BAR KORPORAT KERAJAAN NEGERI */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
          <span>{t.topBar}</span>
          <div className="flex items-center space-x-4">
            <span>{t.subTitle}</span>
            <button 
              onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
              className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded tracking-wider uppercase hover:bg-amber-300 transition"
            >
              {lang === 'bm' ? 'ENGLISH' : 'BAHASA MELAYU'}
            </button>
          </div>
        </div>
      </div>

      {/* HEADER UTAMA KORPORAT */}
      <header className="bg-slate-900 text-white border-b-4 border-amber-500 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-amber-400 uppercase">
              PEJABAT SETIAUSAHA KERAJAAN NEGERI PULAU PINANG
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              {t.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition"
            >
              {t.exportCsv}
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition"
            >
              {t.exportPdf}
            </button>

            <div className="h-6 w-px bg-slate-700 mx-1"></div>

            {userRole !== 'PUBLIC' ? (
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-extrabold text-xs tracking-wider">
                  {userRole}
                </span>
                <button
                  onClick={() => setShowChangePassModal(true)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                >
                  {t.changePass}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold rounded bg-rose-700 hover:bg-rose-600 text-white transition"
                >
                  {t.logOut}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-xs font-extrabold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition tracking-wide uppercase"
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
          <div className="p-16 text-center text-slate-600 font-bold bg-white rounded-lg border border-slate-300 shadow-xs">
            Memuatkan Pangkalan Data...
          </div>
        ) : (
          <>
            {/* SELEKSI 14 BAHAGIAN */}
            {!loggedInBahagianCode && (
              <section className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-100 border-b border-slate-300 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {t.filterTitle}
                  </span>
                  {selectedBahagian !== 'ALL' && (
                    <button
                      onClick={() => setSelectedBahagian('ALL')}
                      className="text-xs font-extrabold text-blue-900 hover:underline"
                    >
                      {t.showAll}
                    </button>
                  )}
                </div>

                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  <button
                    onClick={() => setSelectedBahagian('ALL')}
                    className={`p-2.5 rounded text-center font-bold text-xs border transition ${
                      selectedBahagian === 'ALL'
                        ? 'bg-slate-900 text-amber-400 border-slate-950 font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                        className={`p-2.5 rounded text-center font-bold text-xs border transition ${
                          isSelected
                            ? 'bg-slate-900 text-amber-400 border-slate-950 font-black shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        title={b.name}
                      >
                        <span className="truncate block font-mono font-bold">{b.code}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({count} {t.kpiUnit})</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* BAR KAWALAN ADMIN */}
            {userRole !== 'PUBLIC' && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-300 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    {t.adminPanel}: {userRole}
                  </h3>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    {loggedInBahagianCode 
                      ? `${t.adminLocked} ${BAHAGIAN_LIST.find(b => b.code === loggedInBahagianCode)?.name}.`
                      : t.adminFull}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOpenAdd}
                    className="px-3.5 py-2 text-xs font-bold rounded bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-xs uppercase tracking-wide"
                  >
                    {t.addRecord}
                  </button>

                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-3.5 py-2 text-xs font-bold rounded bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs uppercase tracking-wide"
                  >
                    {t.auditLog} ({auditLogs.length})
                  </button>

                  {userRole === 'SUPER_ADMIN' && (
                    <button
                      onClick={handleResetData}
                      className="px-3.5 py-2 text-xs font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
                    >
                      {t.resetDefault}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 1. KAD METRIK PRESTASI */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-blue-900">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{t.avgScore}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-blue-950">{stats.avgScore}%</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">{t.kpiRatio}: {stats.total}</div>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded mt-3 overflow-hidden">
                  <div className="bg-blue-900 h-full rounded transition-all duration-500" style={{ width: `${stats.avgScore}%` }}></div>
                </div>
              </div>

              <div className="p-5 bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-slate-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{t.totalKpi}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-slate-900">{stats.total}</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">{t.monitoringStatus}</div>
                </div>
                <span className="text-[11px] text-slate-500 font-bold mt-3">PSUKPP</span>
              </div>

              <div className="p-5 bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-emerald-600">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">{t.targetMet}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-emerald-700">{stats.hijau}</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">
                    {stats.total > 0 ? Math.round((stats.hijau / stats.total) * 100) : 0}%
                  </div>
                </div>
                <span className="text-[11px] text-emerald-800 font-bold mt-3">{t.lblGreen}</span>
              </div>

              <div className="p-5 bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-amber-500">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">{t.inAttention}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-amber-600">{stats.kuning}</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">
                    {stats.total > 0 ? Math.round((stats.kuning / stats.total) * 100) : 0}%
                  </div>
                </div>
                <span className="text-[11px] text-amber-800 font-bold mt-3">{t.lblYellow}</span>
              </div>

              <div className="p-5 bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between border-t-4 border-t-rose-600">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-800">{t.requiresAction}</span>
                <div className="mt-3">
                  <div className="text-3xl font-black text-rose-700">{stats.merah}</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">
                    {stats.total > 0 ? Math.round((stats.merah / stats.total) * 100) : 0}%
                  </div>
                </div>
                <span className="text-[11px] text-rose-800 font-bold mt-3">{t.lblRed}</span>
              </div>
            </section>

            {/* CARTA PERBANDINGAN PRESTASI 14 BAHAGIAN */}
            <section className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4">
                {t.benchChartTitle}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                {deptBenchStats.map(d => (
                  <div key={d.code} className="p-3 rounded bg-slate-50 border border-slate-200 text-center">
                    <span className="block font-mono font-bold text-xs text-slate-900">{d.code}</span>
                    <strong className="block text-lg font-black text-blue-900 my-1">{d.avg}%</strong>
                    <span className="text-[10px] text-slate-500 block font-medium">{d.count} KPI</span>
                    <div className="w-full bg-slate-200 h-1.5 rounded mt-1.5 overflow-hidden">
                      <div className="bg-blue-900 h-full rounded" style={{ width: `${d.avg}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. PANEL FILTER & CARIAN */}
            <section className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs">
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">{t.filterHeader}</span>
                <button
                  onClick={() => { setSelectedTeras('ALL'); if (!loggedInBahagianCode) setSelectedBahagian('ALL'); setSelectedStatus('ALL'); setSearchTerm(''); }}
                  className="text-xs font-bold text-blue-900 hover:underline"
                >
                  {t.resetFilter}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">Carian Kata Kunci</label>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium focus:border-slate-800 outline-none bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">{t.strategicPillar}</label>
                  <select
                    value={selectedTeras}
                    onChange={(e) => setSelectedTeras(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium focus:border-slate-800 outline-none bg-slate-50"
                  >
                    <option value="ALL">{t.allPillars}</option>
                    <option value="T1">Teras 1: Tata Kelola</option>
                    <option value="T2">Teras 2: Modal Insan</option>
                    <option value="T3">Teras 3: Pembangunan</option>
                    <option value="T4">Teras 4: Kesejahteraan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">{t.deptUnit}</label>
                  <select
                    disabled={!!loggedInBahagianCode}
                    value={activeBahagianFilter}
                    onChange={(e) => setSelectedBahagian(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium outline-none bg-slate-50 ${
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
                  <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">{t.performanceStatus}</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium focus:border-slate-800 outline-none bg-slate-50"
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
              <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4">
                  {t.pieChartTitle}
                </h2>

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
                          className="text-emerald-600 transition-all duration-700"
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
                          className="text-rose-600 transition-all duration-700"
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
                      <span className="text-2xl font-black text-slate-900">{stats.total}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">JUMLAH KPI</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 space-y-2.5 text-xs font-bold">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                      <span className="text-slate-700">{t.targetMet}:</span>
                      <span className="text-slate-900 font-black">{stats.hijau}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                      <span className="text-slate-700">{t.inAttention}:</span>
                      <span className="text-slate-900 font-black">{stats.kuning}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                      <span className="text-slate-700">{t.requiresAction}:</span>
                      <span className="text-slate-900 font-black">{stats.merah}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {t.trendTitle}
                  </h2>
                  <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">%</span>
                </div>

                <div className="relative h-44 w-full flex items-end pt-6 pb-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-bold text-slate-400 border-b border-slate-200">
                    <div className="border-b border-slate-100 w-full pt-1">100%</div>
                    <div className="border-b border-slate-100 w-full">50%</div>
                    <div className="w-full pb-1">0%</div>
                  </div>

                  <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="3"
                      points={`37.5,${getY(stats.avgQ1)} 112.5,${getY(stats.avgQ2)} 187.5,${getY(stats.avgQ3)} 262.5,${getY(stats.avgQ4)}`}
                    />
                    <circle cx="37.5" cy={getY(stats.avgQ1)} r="4" className="fill-slate-900 stroke-amber-400 stroke-2" />
                    <circle cx="112.5" cy={getY(stats.avgQ2)} r="4" className="fill-slate-900 stroke-amber-400 stroke-2" />
                    <circle cx="187.5" cy={getY(stats.avgQ3)} r="4" className="fill-slate-900 stroke-amber-400 stroke-2" />
                    <circle cx="262.5" cy={getY(stats.avgQ4)} r="4" className="fill-slate-900 stroke-amber-400 stroke-2" />
                  </svg>
                </div>

                <div className="grid grid-cols-4 text-center text-xs font-extrabold pt-2 border-t border-slate-200 text-slate-800">
                  <div>{t.q1} <span className="block text-[11px] font-normal text-slate-600">{stats.avgQ1}%</span></div>
                  <div>{t.q2} <span className="block text-[11px] font-normal text-slate-600">{stats.avgQ2}%</span></div>
                  <div>{t.q3} <span className="block text-[11px] font-normal text-slate-600">{stats.avgQ3}%</span></div>
                  <div>{t.q4} <span className="block text-[11px] font-normal text-slate-600">{stats.avgQ4}%</span></div>
                </div>
              </div>
            </section>

            {/* 4. JADUAL REKOD KPI RASMI */}
            <section className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h2 className="text-xs font-black tracking-wider uppercase">{t.tableTitle}</h2>
                <span className="text-xs font-medium text-slate-300">
                  {t.recordsShown}: <strong>{filteredData.length}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-3.5">{t.colCode}</th>
                      <th className="p-3.5">{t.colTitle}</th>
                      <th className="p-3.5">{t.colDept}</th>
                      <th className="p-3.5 text-center">{t.colTarget}</th>
                      <th className="p-3.5 text-center">{t.colAchieved}</th>
                      <th className="p-3.5">{t.colStatus}</th>
                      <th className="p-3.5 text-center">{t.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-800">
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => {
                        const isExpanded = selectedKpiDetail?.id === item.id;
                        const canEdit = canEditItem(item.bahagian);
                        const displayTitle = lang === 'en' && item.titleEn ? item.titleEn : item.title;

                        return (
                          <React.Fragment key={item.id}>
                            <tr className={isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}>
                              <td className="p-3.5 font-bold whitespace-nowrap">
                                <span className="px-2 py-1 rounded bg-slate-900 text-amber-400 font-mono text-[11px] font-bold">
                                  {item.id}
                                </span>
                              </td>

                              <td className="p-3.5 max-w-xs sm:max-w-md">
                                <div className="font-bold leading-snug text-slate-900">{displayTitle}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{item.pemilik}</div>
                              </td>

                              <td className="p-3.5 whitespace-nowrap">
                                <span className="font-extrabold px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-800 rounded font-mono text-[11px]">
                                  {item.bahagian}
                                </span>
                              </td>

                              <td className="p-3.5 text-center font-bold text-slate-900">
                                {item.sasaran}%
                              </td>

                              <td className="p-3.5 text-center font-extrabold text-sm">
                                <span className={
                                  item.status === 'hijau' ? 'text-emerald-700' :
                                  item.status === 'kuning' ? 'text-amber-600' : 'text-rose-700'
                                }>
                                  {item.pencapaian}%
                                </span>
                              </td>

                              <td className="p-3.5 min-w-[140px]">
                                <div className="flex items-center space-x-2">
                                  <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                                    <div
                                      className={`h-full rounded ${
                                        item.status === 'hijau' ? 'bg-emerald-600' :
                                        item.status === 'kuning' ? 'bg-amber-500' : 'bg-rose-600'
                                      }`}
                                      style={{ width: `${Math.min(item.pencapaian, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                    item.status === 'hijau' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                    item.status === 'kuning' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                                    'bg-rose-50 text-rose-800 border-rose-300'
                                  }`}>
                                    {getStatusLabel(item.status)}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3.5 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button
                                    onClick={() => setSelectedKpiDetail(isExpanded ? null : item)}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-900 text-white hover:bg-slate-800 transition"
                                  >
                                    {isExpanded ? t.close : t.detail}
                                  </button>

                                  {canEdit && (
                                    <>
                                      <button
                                        onClick={() => handleOpenEdit(item)}
                                        className="px-2 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition"
                                      >
                                        {t.edit}
                                      </button>
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-2 py-1 text-[11px] font-bold bg-rose-700 hover:bg-rose-600 text-white rounded transition"
                                      >
                                        {t.delete}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* PERINCIAN REKOD & GANTT ROADMAP */}
                            {isExpanded && (
                              <tr className="bg-slate-50 border-b border-slate-300">
                                <td colSpan={7} className="p-4">
                                  <div className="p-4 bg-white rounded border border-slate-300 shadow-xs space-y-4">
                                    <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                                      <div>
                                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{t.detailTitle}</span>
                                        <h3 className="text-sm font-black text-slate-900 mt-0.5">{displayTitle}</h3>
                                        <p className="text-xs text-slate-600 font-medium">{item.terasName}</p>
                                      </div>
                                      <button
                                        onClick={() => setSelectedKpiDetail(null)}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                      >
                                        {t.close}
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.owner}</span>
                                        <strong className="text-slate-900 font-bold">{item.pemilik}</strong>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.annualTarget}</span>
                                        <strong className="text-slate-900 font-bold">{item.sasaran}%</strong>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.currentScore}</span>
                                        <strong className="text-blue-900 font-extrabold">{item.pencapaian}%</strong>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.colStatus}</span>
                                        <strong className="uppercase text-slate-900 font-bold">{getStatusLabel(item.status)}</strong>
                                      </div>
                                    </div>

                                    {(item.status === 'merah' || item.status === 'kuning' || item.sebabKelewatan) && (
                                      <div className="p-3 bg-rose-50 border border-rose-200 text-slate-900 rounded text-xs space-y-1">
                                        <h4 className="font-extrabold text-rose-900 uppercase">{t.riskMitigation}</h4>
                                        <div><strong>{t.delayCause}:</strong> {item.sebabKelewatan || 'N/A'}</div>
                                        <div><strong>{t.interventionAction}:</strong> {item.pelanIntervensi || 'N/A'}</div>
                                      </div>
                                    )}

                                    {/* CARTA ROADMAP SUKU TAHUN */}
                                    <div className="text-xs pt-1">
                                      <h4 className="font-extrabold text-slate-800 uppercase mb-2">{t.quarterlyBreakdown}</h4>
                                      <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="p-3 border border-slate-200 rounded bg-slate-50">
                                          <span className="block text-[10px] font-bold text-slate-500 uppercase">{t.q1}</span>
                                          <strong className="text-sm font-black text-slate-900">{item.q1}%</strong>
                                          <div className="w-full bg-slate-200 h-1.5 rounded mt-2 overflow-hidden">
                                            <div className="bg-blue-900 h-full rounded" style={{ width: `${item.q1}%` }}></div>
                                          </div>
                                        </div>
                                        <div className="p-3 border border-slate-200 rounded bg-slate-50">
                                          <span className="block text-[10px] font-bold text-slate-500 uppercase">{t.q2}</span>
                                          <strong className="text-sm font-black text-slate-900">{item.q2}%</strong>
                                          <div className="w-full bg-slate-200 h-1.5 rounded mt-2 overflow-hidden">
                                            <div className="bg-blue-900 h-full rounded" style={{ width: `${item.q2}%` }}></div>
                                          </div>
                                        </div>
                                        <div className="p-3 border border-slate-200 rounded bg-slate-50">
                                          <span className="block text-[10px] font-bold text-slate-500 uppercase">{t.q3}</span>
                                          <strong className="text-sm font-black text-slate-900">{item.q3}%</strong>
                                          <div className="w-full bg-slate-200 h-1.5 rounded mt-2 overflow-hidden">
                                            <div className="bg-blue-900 h-full rounded" style={{ width: `${item.q3}%` }}></div>
                                          </div>
                                        </div>
                                        <div className="p-3 border border-slate-200 rounded bg-slate-50">
                                          <span className="block text-[10px] font-bold text-slate-500 uppercase">{t.q4}</span>
                                          <strong className="text-sm font-black text-slate-900">{item.q4}%</strong>
                                          <div className="w-full bg-slate-200 h-1.5 rounded mt-2 overflow-hidden">
                                            <div className="bg-blue-900 h-full rounded" style={{ width: `${item.q4}%` }}></div>
                                          </div>
                                        </div>
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
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
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

      {/* MODAL TUKAR KATA LALUAN */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-slate-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-900">Tukar Kata Laluan Pentadbir ({userRole})</h3>
              <button onClick={() => setShowChangePassModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
              {passMsg.text && (
                <div className={`p-3 text-xs font-bold rounded border ${
                  passMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {passMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Laluan Semasa</label>
                <input
                  type="password"
                  required
                  value={passData.oldPass}
                  onChange={(e) => setPassData({ ...passData, oldPass: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Laluan Baharu</label>
                <input
                  type="password"
                  required
                  value={passData.newPass}
                  onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sahkan Kata Laluan Baharu</label>
                <input
                  type="password"
                  required
                  value={passData.confirmPass}
                  onChange={(e) => setPassData({ ...passData, confirmPass: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium outline-none bg-slate-50"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded bg-slate-200 text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded bg-slate-900 text-white"
                >
                  Kemaskini Kata Laluan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOG AUDIT */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-xl border border-slate-300 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-900">{t.auditLog}</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{log.pengguna}</span>
                      <span className="text-[10px] text-slate-500">{log.tarikh}</span>
                    </div>
                    <p className="mt-1 text-slate-700 font-medium">{log.tindakan}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">N/A</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOG MASUK ADMIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-slate-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-900">{t.logIn}</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              {loginError && (
                <div className="p-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ID Pengguna (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="admin / admin_bpen..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Laluan</label>
                <input
                  type="password"
                  required
                  placeholder="Kata laluan keselamatan"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-medium outline-none bg-slate-50"
                />
              </div>

              <div className="p-3 rounded bg-slate-100 text-[11px] text-slate-700 border border-slate-200 space-y-1 font-medium">
                <div><strong>Super Admin:</strong> admin / admin123</div>
                <div><strong>Admin Bahagian:</strong> admin_&lt;kod_bahagian&gt; / admin123</div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded bg-slate-200 text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded bg-slate-900 text-white"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-900">
                {editingKpi ? `Kemaskini Rekod KPI (${formData.id})` : 'Pendaftaran KPI Baharu'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs font-medium text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Kod KPI</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-300 font-mono font-bold bg-slate-50"
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
                    className={`w-full px-3 py-2 rounded border border-slate-300 font-bold bg-slate-50 ${
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
                  className="w-full px-3 py-2 rounded border border-slate-300 font-bold bg-slate-50"
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
                    className="w-full px-3 py-2 rounded border border-slate-300 font-bold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Pencapaian Semasa (%)</label>
                  <input
                    type="number"
                    min="0" max="100" required
                    value={formData.pencapaian}
                    onChange={(e) => setFormData({ ...formData, pencapaian: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-300 font-bold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Status Prestasi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-300 font-bold bg-slate-50"
                  >
                    <option value="hijau">Hijau (Mencapai Sasaran)</option>
                    <option value="kuning">Kuning (Dalam Perhatian)</option>
                    <option value="merah">Merah (Memerlukan Intervensi)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded bg-rose-50 border border-rose-200 space-y-3">
                <h4 className="font-extrabold text-rose-900 uppercase">Pengurusan Risiko & Risk Mitigation</h4>
                <div>
                  <label className="block font-bold mb-1">Punca Kelewatan</label>
                  <input
                    type="text"
                    placeholder="Nyatakan sebab..."
                    value={formData.sebabKelewatan || ''}
                    onChange={(e) => setFormData({ ...formData, sebabKelewatan: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Pelan Intervensi Pembetulan</label>
                  <input
                    type="text"
                    placeholder="Nyatakan tindakan..."
                    value={formData.pelanIntervensi || ''}
                    onChange={(e) => setFormData({ ...formData, pelanIntervensi: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Pencapaian Mengikut Suku Tahun (Q1 - Q4 %)</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number" placeholder="Q1" value={formData.q1}
                    onChange={(e) => setFormData({ ...formData, q1: Number(e.target.value) })}
                    className="p-2 rounded border border-slate-300 text-center font-bold bg-slate-50"
                  />
                  <input
                    type="number" placeholder="Q2" value={formData.q2}
                    onChange={(e) => setFormData({ ...formData, q2: Number(e.target.value) })}
                    className="p-2 rounded border border-slate-300 text-center font-bold bg-slate-50"
                  />
                  <input
                    type="number" placeholder="Q3" value={formData.q3}
                    onChange={(e) => setFormData({ ...formData, q3: Number(e.target.value) })}
                    className="p-2 rounded border border-slate-300 text-center font-bold bg-slate-50"
                  />
                  <input
                    type="number" placeholder="Q4" value={formData.q4}
                    onChange={(e) => setFormData({ ...formData, q4: Number(e.target.value) })}
                    className="p-2 rounded border border-slate-300 text-center font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 font-bold rounded bg-slate-200 text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded bg-emerald-700 hover:bg-emerald-800 text-white"
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
