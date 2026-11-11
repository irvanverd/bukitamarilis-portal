"use client";

import { useState, useMemo, Suspense,useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AdminInstallBanner from "@/components/admin/AdminInstallBanner";
import InputIPLForm from "@/components/admin/InputIPLForm";
import InputPengeluaran from "@/components/admin/InputPengeluaran";
import DashboardKeuangan from "@/components/admin/DashboardAdmin";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Filter,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Receipt,
  Wrench,
  X, Upload,Download,Smartphone,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import WargaManager from "@/components/admin/WargaManager";
import KeuanganBrowser from "@/components/admin/KeuanganBrowser";



interface WargaLookupItem {
  Blok?: string;
  BlokID?: string;
  Nama?: string;
  NamaAlias?: string;
  Korwil?: string;
  Iplamount?: string | number;
  StatusRumah?: string | number;
  MobileNo?: string | number;

  [key: string]: any;
}

export type AdminTab =
  | "dashboard"
  // Group Keuangan
  | "browser-keuangan"
  | "input-ipl"
  | "pemasukan"
  | "pengeluaran"
  // Group Management
  | "warga"
  | "users"
  // Group Sekretariat
  | "sarpras"
  | "komplain"
  | "surat";

  interface AdminSession {
    username: string;
    role: "admin" | "korwil" | "bendahara";
    nama: string;
    allowedTabs: string[];
  }  

interface NavItem {
  id: AdminTab;
  label: string;
  icon: any;
}

interface NavGroup {
  groupName?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupName: "Keuangan",
    items: [
      { id: "browser-keuangan", label: "Rekap Transaksi", icon: Receipt },
      { id: "input-ipl", label: "Input Pemasukan", icon: CreditCard },
      { id: "pengeluaran", label: "Input Pengeluaran", icon: ArrowUpRight },
    ],
  },
  {
    groupName: "Management",
    items: [
      { id: "warga", label: "Data Warga", icon: Users },
      { id: "users", label: "User & Role", icon: ShieldCheck },
    ],
  },
  {
    groupName: "Sekretariat",
    items: [
      { id: "sarpras", label: "Sarana & Prasarana", icon: Wrench },
      { id: "komplain", label: "Browser Komplain", icon: MessageSquareWarning },
      { id: "surat", label: "Browser Surat", icon: FileText },
    ],
  },
];

interface KorwilSummary {
  korwil: string;
  lunas: number;
  totalUnit: number;
  nominal: number;
}

const money = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }  

function PortalAdminContent() {

  // State persis seperti di Navbar.tsx
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Tangkap event instalasi browser
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Handler eksekusi install (persis Navbar.tsx)
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Aplikasi sudah terpasang atau gunakan opsi 'Tambahkan ke Layar Utama' pada menu browser Anda.");
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  // State Session & Otentikasi
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");


  // Cek sesi localStorage saat halaman dimuat
  useEffect(() => {
    const rawSession = localStorage.getItem("admin_session");

    if (!rawSession) {
      router.replace("/portal-admin/login");
      return;
    }

    try {
      const parsed: AdminSession = JSON.parse(rawSession);
      setSession(parsed);

      // Jika role tidak memiliki akses dashboard, arahkan ke tab pertama yang diizinkan
      if (parsed.allowedTabs && !parsed.allowedTabs.includes("dashboard")) {
        setActiveTab(parsed.allowedTabs[0] as AdminTab);
      }
    } catch (err) {
      localStorage.removeItem("admin_session");
      router.replace("/portal-admin/login");
    } finally {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Handler Logout
  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.replace("/portal-admin/login");
  };

  // Saring menu yang hanya boleh dilihat oleh role yang sedang login
  const filteredNavGroups = useMemo(() => {
    if (!session?.allowedTabs) return [];
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => session.allowedTabs.includes(item.id)),
      }))
      .filter((group) => group.items.length > 0);
  }, [session]);


  // ================= State Form Input IPL =================
  const [iplBlok, setIplBlok] = useState("");
  const [iplBulan, setIplBulan] = useState("10");
  const [iplTahun, setIplTahun] = useState("2026");
  const [iplNominal, setIplNominal] = useState("110000");
  const [iplMetode, setIplMetode] = useState("Transfer Bank");
  const [iplKorwil, setIplKorwil] = useState("Alex");
  const [iplTanggal, setIplTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [iplFoto, setIplFoto] = useState<string>("");

  const [listWargaLookup, setListWargaLookup] = useState<WargaLookupItem[]>([]);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [isDropdownBlokOpen, setIsDropdownBlokOpen] = useState(false);
  const [namaWargaTerpilih, setNamaWargaTerpilih] = useState("");
  const [searchBlokQuery, setSearchBlokQuery] = useState("");

  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setIplTanggal(selectedDate);
  
    if (selectedDate) {
      const [year, month] = selectedDate.split("-");
      // Konversi month ke string angka tanpa leading zero jika select value 1-12
      const monthNum = String(parseInt(month, 10));
      setIplBulan(monthNum);
      setIplTahun(year);
    }
  };
  
// Load data warga dari /api/warga
useEffect(() => {
  const loadWarga = async () => {
    try {
      setLoadingLookup(true);
      const res = await fetch("/api/warga", { cache: "no-store" });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setListWargaLookup(json.data);
      }
    } catch (err) {
      console.warn("Gagal memuat list warga untuk lookup:", err);
    } finally {
      setLoadingLookup(false);
    }
  };

  loadWarga();
}, []);

// Filter unit blok berdasarkan input teks
const filteredBlokList = useMemo(() => {
  if (!iplBlok && !searchBlokQuery) return listWargaLookup;
  const q = (searchBlokQuery || iplBlok).toLowerCase().trim();
  return listWargaLookup.filter((w) => {
    const b = (w.Blok || w.BlokID || "").toLowerCase();
    const n = (w.Nama || w.NamaAlias || "").toLowerCase();
    return b.includes(q) || n.includes(q);
  });
}, [listWargaLookup, iplBlok, searchBlokQuery]);

// Handler ketika salah satu unit dipilih dari list
const handleSelectUnit = (w: WargaLookupItem) => {
  const unit = w.Blok || w.BlokID || "";
  const nama = w.Nama || w.NamaAlias || "";
  const korwil = w.Korwil || "";
  const tarif = w.Iplamount ? String(w.Iplamount) : "110000";

  setIplBlok(unit);
  setNamaWargaTerpilih(nama);
  if (korwil) setIplKorwil(korwil);
  if (tarif) setIplNominal(tarif);

  setIsDropdownBlokOpen(false);
  setSearchBlokQuery("");
};




  // ================= State Form Jurnal Kas =================
  const [jurnalTanggal, setJurnalTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [jurnalKategori, setJurnalKategori] = useState("");
  const [jurnalNominal, setJurnalNominal] = useState("");
  const [jurnalKeterangan, setJurnalKeterangan] = useState("");
  // State tambahan foto jurnal masuk & keluar (opsional)
const [jurnalMasukFoto, setJurnalMasukFoto] = useState<string>("");
const [jurnalKeluarFoto, setJurnalKeluarFoto] = useState<string>("");

  // ================= State Sarana Prasarana =================
  const [sarprasBarang, setSarprasBarang] = useState("");
  const [sarprasJumlah, setSarprasJumlah] = useState("1");
  const [sarprasLokasi, setSarprasLokasi] = useState("");
  const [sarprasKeterangan, setSarprasKeterangan] = useState("");
  const [sarprasTanggal, setSarprasTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sarprasFoto, setSarprasFoto] = useState<string>("");

  // ================= Dummy Data Summary Korwil =================
  const korwilData: KorwilSummary[] = [
    { korwil: "Sudarmanto", lunas: 24, totalUnit: 28, nominal: 2640000 },
    { korwil: "Alex", lunas: 26, totalUnit: 30, nominal: 2860000 },
    { korwil: "Niko", lunas: 20, totalUnit: 25, nominal: 2200000 },
    { korwil: "Andro", lunas: 22, totalUnit: 27, nominal: 2420000 },
  ];

  // Dummy Daftar Komplain Warga
  const [listKomplain, setListKomplain] = useState([
    {
      id: "KMP-102",
      blok: "AR.16/09",
      nama: "Agus Pratama",
      kategori: "Fasilitas Umum",
      judul: "Lampu jalan depan rumah padam",
      tanggal: "28 Okt 2026",
      status: "Menunggu",
    },
    {
      id: "KMP-101",
      blok: "AR.04/12",
      nama: "Budi Santoso",
      kategori: "Kebersihan",
      judul: "Sampah daun belum terangkut",
      tanggal: "27 Okt 2026",
      status: "Diproses",
    },
  ]);

  // Data demo komplain per kategori
const komplainCategoryData = [
  { label: "Fasilitas Umum / PJU", count: 14, color: "#10b981", percent: 45 },
  { label: "Kebersihan & Sampah", count: 8, color: "#3b82f6", percent: 26 },
  { label: "Keamanan Lingkungan", count: 5, color: "#f59e0b", percent: 16 },
  { label: "Saluran Air / Drainase", count: 4, color: "#8b5cf6", percent: 13 },
];

// Data demo pergantian lampu LPJ per bulan (tahun berjalan)
const lpjReplacementData = [
  { bulan: "Mei", jumlah: 0 },
  { bulan: "Jun", jumlah: 0 },
  { bulan: "Jul", jumlah: 0 },
  { bulan: "Agu", jumlah: 0 },
  { bulan: "Sep", jumlah: 4 },
  { bulan: "Okt", jumlah: 13 },
];  
  // Dummy Daftar Surat Warga
  const [listSurat, setListSurat] = useState([
    {
      id: "SRT-042",
      blok: "AR.10/02",
      nama: "Hendrawan",
      jenis: "Surat Keterangan Domisili",
      keperluan: "Pengurusan BPJS Ketenagakerjaan",
      tanggal: "29 Okt 2026",
      status: "Menunggu Verifikasi",
    },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard Ringkasan", icon: LayoutDashboard },
    { id: "warga", label: "Master Data Warga", icon: Users }, // <-- Menu Warga
    { id: "browser-keuangan", label: "Transaksi", icon: Receipt }, // <-- Tambahkan di sini
    { id: "input-ipl", label: "Input Transaksi IPL", icon: CreditCard },
    { id: "jurnal-masuk", label: "Jurnal Kas Masuk", icon: ArrowDownLeft },
    { id: "jurnal-keluar", label: "Jurnal Kas Keluar", icon: ArrowUpRight },
    { id: "sarpras", label: "Sarana & Prasarana", icon: Wrench },
    { id: "komplain", label: "Browser Komplain", icon: MessageSquareWarning },
    { id: "surat", label: "Browser Surat", icon: FileText },
    { id: "users", label: "Manajemen User & Role", icon: Users },
  ];

  // Handler pembaca file gambar ke format Base64 & validasi ukuran
const handleFileToBase64 = (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (base64: string) => void
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Harap pilih file dengan format gambar (JPG/PNG).");
    return;
  }

  // Batas 3 MB untuk mencegah payload over-limit ke Google Apps Script
  if (file.size > 3 * 1024 * 1024) {
    showToast("Ukuran foto maksimal 3 MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    callback(String(reader.result || ""));
  };
  reader.readAsDataURL(file);
};

if (isCheckingAuth) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      <p className="text-xs font-semibold text-slate-500">Memverifikasi hak akses admin...</p>
    </div>
  );
}

return (
  <div className="flex min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex-col lg:flex-row"> 
     {/* Banner akan otomatis muncul saat admin membuka link ini via Chrome */}
     <AdminInstallBanner /> 
    {/* Toast Alert */}
    {toast && (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl">
        <CheckCircle2 size={16} />
        <span>{toast}</span>
      </div>
    )}

    {/* Header Khusus Mobile */}
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
      
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-xs font-extrabold text-white">
          ADM
        </span>
        <div>
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-white">Admin Portal</h1>
          <p className="text-[10px] text-slate-400">Bukit Amarilis</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 dark:border-slate-800 dark:text-slate-300"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </div>

    {/* Sidebar Desktop & Drawer Mobile */}
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white p-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Info Pengguna & Role */}
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 font-black text-white shadow-md shadow-emerald-600/20">
            {session?.username.substring(0, 2)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
              {session?.nama}
            </p>
            <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              {session?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Looping Menu Berdasarkan Izin Role */}
      <nav className="space-y-4">
        {filteredNavGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.groupName && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.groupName}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-emerald-50 font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} className={active ? "text-emerald-600" : "text-slate-400"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Sidebar & Logout */}
      <div className="mt-8 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-500">Mode Tema</span>
          <ThemeSwitcher />
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        >
          <LogOut size={15} />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-7 overflow-y-auto">
{/* ================= TAB 2: INPUT IPL ================= */}

{activeTab === "dashboard" && (
  <DashboardKeuangan 
    userName="ADMIN"
    onNavigate={(targetTab) => setActiveTab(targetTab as AdminTab)} 
  />
)}
{activeTab === "warga" && <WargaManager />}
        {activeTab === "browser-keuangan" && 
  <KeuanganBrowser/>}

{activeTab === "input-ipl" && (
  <div className="space-y-6">
    <InputIPLForm />
  </div>
)}

        {/* ================= TAB 3: JURNAL MASUK ================= */}
{activeTab === "pemasukan" && (
   <div className="space-y-6">
   <InputIPLForm />
 </div>
)}

        {/* ================= TAB 4: JURNAL KELUAR ================= */}
{activeTab === "pengeluaran" && (
   <div className="space-y-6">
   <InputPengeluaran />
 </div>
)}

        {/* ================= TAB 5: SARANA PRASARANA ================= */}
{activeTab === "sarpras" && (
  <div className="max-w-2xl">
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Log Penggunaan Sarana & Prasarana
      </h1>
      <p className="text-xs text-slate-500">
        Pencatatan pemakaian aset, suku cadang, dan dokumentasi foto pengerjaan fasilitas umum warga.
      </p>
    </div>

    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          showToast(`Log pemakaian "${sarprasBarang}" tanggal ${sarprasTanggal} berhasil dicatat!`);
          setSarprasBarang("");
          setSarprasLokasi("");
          setSarprasKeterangan("");
          setSarprasFoto("");
        }}
        className="space-y-4"
      >
        {/* Tanggal Pengerjaan & Nama Barang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tanggal Pengerjaan
            </label>
            <input
              type="date"
              required
              value={sarprasTanggal}
              onChange={(e) => setSarprasTanggal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Barang / Komponen
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lampu LED Philips 40W PJU"
              value={sarprasBarang}
              onChange={(e) => setSarprasBarang(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Jumlah & Titik Lokasi */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Jumlah Unit Terpasang
            </label>
            <input
              type="number"
              required
              value={sarprasJumlah}
              onChange={(e) => setSarprasJumlah(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Titik Lokasi
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Tiang AR.14"
              value={sarprasLokasi}
              onChange={(e) => setSarprasLokasi(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Keterangan Pengerjaan / Teknisi
          </label>
          <textarea
            rows={3}
            placeholder="Contoh: Pergantian fitting rusak dan bohlam pecah akibat petir"
            value={sarprasKeterangan}
            onChange={(e) => setSarprasKeterangan(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Lampiran Foto Fisik Pengerjaan Sarpras */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Foto Dokumentasi Fisik / Kondisi Barang
          </label>
          <div className="mt-1.5 flex flex-col gap-3">
            {sarprasFoto ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2">
                <div className="relative h-44 w-full">
                  <img
                    src={sarprasFoto}
                    alt="Pratinjau Foto Sarpras"
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSarprasFoto("")}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition"
                >
                  <Trash2 size={14} />
                  <span>Hapus / Ganti Foto</span>
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <ImageIcon size={18} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload Foto Hasil Perbaikan / Barang
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">PNG, JPG, JPEG (Maks. 3 MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileToBase64(e, setSarprasFoto)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
        >
          <Plus size={16} /> Catat Pemakaian Sarpras
        </button>
      </form>
    </div>
  </div>
)}
        {/* ================= TAB 6: KOMPLAIN BROWSER ================= */}
        {activeTab === "komplain" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Browser Laporan Komplain Warga
                </h1>
                <p className="text-xs text-slate-500">
                  Pantau dan perbarui status penanganan keluhan lingkungan secara langsung.
                </p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {listKomplain.length} Tiket Aktif
              </span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Tiket & Tanggal</th>
                      <th className="px-4 py-3.5 font-bold">Unit / Pelapor</th>
                      <th className="px-4 py-3.5 font-bold">Kategori & Judul</th>
                      <th className="px-4 py-3.5 font-bold">Status</th>
                      <th className="px-5 py-3.5 font-bold text-right">Aksi Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {listKomplain.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{item.id}</p>
                          <p className="text-[10px] text-slate-400">{item.tanggal}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {item.blok}
                          </span>
                          <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">{item.nama}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.judul}</p>
                          <p className="text-[10px] text-slate-400">{item.kategori}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              item.status === "Selesai"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : item.status === "Diproses"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <select
                            value={item.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as any;
                              setListKomplain((prev) =>
                                prev.map((k) =>
                                  k.id === item.id ? { ...k, status: newStatus } : k
                                )
                              );
                              showToast(`Status ${item.id} diubah ke ${newStatus}`);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                          >
                            <option value="Menunggu">Menunggu</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: SURAT BROWSER ================= */}
        {activeTab === "surat" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Permohonan Surat Pengantar Warga
                </h1>
                <p className="text-xs text-slate-500">
                  Daftar pengajuan surat domisili, nikah, dan pengantar administrasi RT/RW.
                </p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {listSurat.length} Pengajuan
              </span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">ID & Tgl</th>
                      <th className="px-4 py-3.5 font-bold">Pemohon</th>
                      <th className="px-4 py-3.5 font-bold">Jenis Surat & Keperluan</th>
                      <th className="px-4 py-3.5 font-bold">Status Surat</th>
                      <th className="px-5 py-3.5 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {listSurat.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{item.id}</p>
                          <p className="text-[10px] text-slate-400">{item.tanggal}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {item.blok}
                          </span>
                          <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">{item.nama}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.jenis}</p>
                          <p className="text-[10px] text-slate-400">{item.keperluan}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              showToast(`Surat ${item.id} disetujui & nomor surat diterbitkan!`);
                            }}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                          >
                            Terbitkan Surat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: USERS & ROLE ================= */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pengguna & Hak Akses Portal Admin
                </h1>
                <p className="text-xs text-slate-500">
                  Daftar akun pengurus yang memiliki wewenang input transaksi dan pembukuan.
                </p>
              </div>
              <button
                onClick={() => showToast("Fitur tambah pengurus baru segera hadir.")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <Plus size={15} /> Tambah Petugas
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Nama Petugas</th>
                    <th className="px-4 py-3.5 font-bold">Role Wewenang</th>
                    <th className="px-4 py-3.5 font-bold">Akses Modul</th>
                    <th className="px-5 py-3.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      Ketua RT 07
                      <p className="font-normal text-[10px] text-slate-400">admin.utama@amarilis.id</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Super Admin
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">Semua Modul & Akses Hapus</td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-emerald-600">Aktif</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      Bendahara RT
                      <p className="font-normal text-[10px] text-slate-400">keuangan@amarilis.id</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-blue-50 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        Finance / Kasir
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">IPL, Kas Masuk, Kas Keluar</td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-emerald-600">Aktif</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      Sie Pembangunan / Sarpras
                      <p className="font-normal text-[10px] text-slate-400">sarpras@amarilis.id</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-amber-50 px-2 py-0.5 font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        Teknisi Lapangan
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">Sarpras & Komplain PJU</td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-emerald-600">Aktif</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PortalAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <p className="text-xs font-semibold text-slate-400">Memuat Portal Admin...</p>
        </div>
      }
    >
      <PortalAdminContent />
    </Suspense>
  );
}