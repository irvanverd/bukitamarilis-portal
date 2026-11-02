"use client";

import { useState, useMemo, Suspense,useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";
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
      { id: "browser-keuangan", label: "Browser Keuangan", icon: Receipt },
      { id: "input-ipl", label: "Input Transaksi IPL", icon: CreditCard },
      { id: "pemasukan", label: "Jurnal Kas Masuk", icon: ArrowDownLeft },
      { id: "pengeluaran", label: "Jurnal Kas Keluar", icon: ArrowUpRight },
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
    { id: "browser-keuangan", label: "Browser Keuangan", icon: Receipt }, // <-- Tambahkan di sini
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
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === "warga" && <WargaManager />}
        {activeTab === "browser-keuangan" && (
  <KeuanganBrowser
    onTambahJurnal={(tipe) => {
      // Mengarahkan langsung ke form jurnal entry sesuai tab
      if (tipe === "masuk") {
        setActiveTab("pemasukan");
      } else {
        setActiveTab("pengeluaran");
      }
    }}
  />
)}
        {activeTab === "dashboard" && (
          
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                Dashboard Kas & Rekapitulasi
              </h1>
              <p className="text-xs text-slate-500">
                Laporan penerimaan IPL, kas riil RT, dan monitoring korwil unit.
              </p>
            </div>

            {/* Saldo & Kas Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Total Saldo Kas RT</span>
                  <Wallet size={18} className="text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {money(28450000)}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <TrendingUp size={13} /> +12.4% vs bulan lalu
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Pemasukan Bulan Ini</span>
                  <ArrowDownLeft size={18} className="text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-emerald-600">
                  {money(10120000)}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">92 Transaksi tercatat</p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Pengeluaran Bulan Ini</span>
                  <ArrowUpRight size={18} className="text-rose-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-rose-600">
                  {money(4350000)}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">Pengeluaran Operasional</p>
              </div>
            </div>

            {/* Rekapitulasi IPL by Korwil */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Monitoring & Summary IPL per Korwil
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kepatuhan pembayaran warga periode berjalan (Oktober 2026)
                  </p>
                </div>
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Total 110 Unit
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {korwilData.map((k, idx) => {
                  const percent = Math.round((k.lunas / k.totalUnit) * 100);
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{k.korwil}</p>
                      <p className="mt-2 text-lg font-black text-emerald-600">{money(k.nominal)}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Lunas: <strong>{k.lunas}</strong>/{k.totalUnit} unit</span>
                        <span className="font-bold text-emerald-600">{percent}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            
        {/* ================= SECTION CHART KOMPLAIN & PERGANTIAN PJU ================= */}
<div className="grid gap-6 lg:grid-cols-2">
  {/* PIE / DONUT CHART: KOMPLAIN BERDASARKAN KATEGORI */}
  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Distribusi Komplain Warga (Dummy)
      </h3>
      <p className="text-xs text-slate-400">
        Persentase keluhan berdasarkan jenis laporan (Total: 31 Laporan)
      </p>
    </div>

    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
      {/* SVG Donut Chart Sederhana */}
      <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3.8"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Segmen 1: Fasilitas Umum / PJU (45%) */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="3.8"
            strokeDasharray="45 55"
            strokeDashoffset="0"
          />
          {/* Segmen 2: Kebersihan (26%) */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="3.8"
            strokeDasharray="26 74"
            strokeDashoffset="-45"
          />
          {/* Segmen 3: Keamanan (16%) */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="3.8"
            strokeDasharray="16 84"
            strokeDashoffset="-71"
          />
          {/* Segmen 4: Drainase (13%) */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="transparent"
            stroke="#8b5cf6"
            strokeWidth="3.8"
            strokeDasharray="13 87"
            strokeDashoffset="-87"
          />
        </svg>

        {/* Text Center Donut */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-900 dark:text-white">31</span>
          <span className="text-[10px] font-semibold text-slate-400">Total Tiket</span>
        </div>
      </div>

      {/* Legend & Detail */}
      <div className="w-full space-y-2.5">
        {komplainCategoryData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-md"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
              <span className="text-[11px] text-slate-400">({item.percent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* BAR CHART: REKAPITULASI PERGANTIAN LAMPU LPJ */}
  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Pergantian Lampu PJU
        </h3>
        <p className="text-xs text-slate-400">
          Frekuensi pemakaian bohlam/fitting lampu jalan per bulan
        </p>
      </div>
      <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
        Total: 17 Unit Diganti
      </span>
    </div>

    {/* Bar Visualizer */}
    <div className="mt-6 flex h-48 items-end gap-3 sm:gap-5 border-b border-slate-100 pb-3 dark:border-slate-800">
      {lpjReplacementData.map((bar, idx) => {
        // Skala tinggi bar: nilai maksimum 10 unit = 100% tinggi
        const heightPercent = (bar.jumlah / 10) * 100;
        return (
          <div
            key={idx}
            className="group relative flex flex-1 flex-col items-center justify-end h-full"
          >
            {/* Tooltip Angka */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-md dark:bg-slate-100 dark:text-slate-900 pointer-events-none">
              {bar.jumlah} Pcs
            </div>

            {/* Bilah Bar Chart */}
            <div
              style={{ height: `${heightPercent}%` }}
              className="w-full rounded-xl bg-emerald-500/80 transition-all hover:bg-emerald-600 dark:bg-emerald-600/80 dark:hover:bg-emerald-500"
            />

            {/* Label Bulan */}
            <span className="mt-2 text-[11px] font-semibold text-slate-400">
              {bar.bulan}
            </span>
          </div>
        );
      })}
    </div>

    {/* Info Box Footer */}
    <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
      <span>Rata-rata: <strong>4.6 unit / bulan</strong></span>
      <span className="font-semibold text-emerald-600">Terbanyak: September (8 Pcs)</span>
    </div>
  </div>
</div>    

          </div>

        )}
{/* ================= TAB 2: INPUT IPL ================= */}
{activeTab === "input-ipl" && (
  <div className="max-w-2xl">
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Entri Transaksi IPL Warga
      </h1>
      <p className="text-xs text-slate-500">
        Pencatatan pembayaran IPL tunai maupun transfer manual beserta bukti pembayaran.
      </p>
    </div>

    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          showToast(`IPL unit ${iplBlok} tanggal ${iplTanggal} berhasil disimpan!`);
          setIplBlok("");
          setIplFoto("");
        }}
        className="space-y-4"
      >
        {/* Tanggal Pembayaran & No. Blok Unit (Lookup getListWarga) */}


  {/* Field Nomor Blok dengan Auto Lookup */}
  <div className="relative">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        Nomor Blok Unit
      </label>
      {namaWargaTerpilih && (
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px]">
          {namaWargaTerpilih}
        </span>
      )}
    </div>

    <div className="relative mt-1">
      <input
        type="text"
        required
        placeholder="Ketik atau cari blok..."
        value={iplBlok}
        onFocus={() => setIsDropdownBlokOpen(true)}
        onChange={(e) => {
          setIplBlok(e.target.value.toUpperCase());
          setSearchBlokQuery(e.target.value);
          setIsDropdownBlokOpen(true);
        }}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm uppercase text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <button
        type="button"
        onClick={() => setIsDropdownBlokOpen(!isDropdownBlokOpen)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <Search size={15} />
      </button>
    </div>

    {/* Dropdown Popover List Unit */}
    {isDropdownBlokOpen && (
      <div className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {loadingLookup ? (
          <div className="p-3 text-center text-xs text-slate-400">
            Memuat daftar blok warga...
          </div>
        ) : filteredBlokList.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-400">
            Blok tidak ditemukan.
          </div>
        ) : (
          filteredBlokList.map((w, idx) => {
            const b = w.Blok || w.BlokID || "";
            const n = w.Nama || w.NamaAlias || "Tanpa Nama";
            const k = w.Korwil || "-";

            return (
              <button
                key={`${b}-${idx}`}
                type="button"
                onClick={() => handleSelectUnit(w)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <div>
                  <span className="font-extrabold uppercase text-slate-900 dark:text-white">
                    {b}
                  </span>
                  <span className="ml-2 font-medium text-slate-500 dark:text-slate-400">
                    · {n}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  {k}
                </span>
              </button>
            );
          })
        )}
      </div>
    )}
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div>
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
      Tanggal Pembayaran
    </label>
    <input
      type="date"
      required
      value={iplTanggal}
      onChange={handleTanggalChange}
      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
    />
  </div>
</div>

    {/* Periode Tagihan: Terisi otomatis mengikuti tanggal yang dipilih */}
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
      Bulan Tagihan
    </label>
    <select
      value={iplBulan}
      onChange={(e) => setIplBulan(e.target.value)}
      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
    >
      <option value="1">Januari</option>
      <option value="2">Februari</option>
      <option value="3">Maret</option>
      <option value="4">April</option>
      <option value="5">Mei</option>
      <option value="6">Juni</option>
      <option value="7">Juli</option>
      <option value="8">Agustus</option>
      <option value="9">September</option>
      <option value="10">Oktober</option>
      <option value="11">November</option>
      <option value="12">Desember</option>
    </select>
  </div>
  <div>
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
      Tahun Tagihan
    </label>
    <input
      type="number"
      value={iplTahun}
      onChange={(e) => setIplTahun(e.target.value)}
      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
    />
  </div>
</div>

        {/* Nominal & Metode Bayar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Jumlah Pembayaran (Rp)
            </label>
            <input
              type="number"
              required
              value={iplNominal}
              onChange={(e) => setIplNominal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Metode Pembayaran
            </label>
            <select
              value={iplMetode}
              onChange={(e) => setIplMetode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="Transfer BRI">Transfer Bank BRI</option>
              <option value="Tunai / Cash">Tunai / Melalui Korwil</option>
              <option value="Payment Gateway">QRIS / Online Gateway</option>
            </select>
          </div>
        </div>

        {/* Korwil */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Wilayah Korwil
          </label>
          <select
            value={iplKorwil}
            onChange={(e) => setIplKorwil(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
           <option>Sudarmanto</option>
            <option>Alex</option>
            <option>Niko</option>
            <option>Andro</option>
          </select>
        </div>

        <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Keterangan
            </label>
            <input
              type="text"
      
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm uppercase dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

        {/* Lampiran Foto Bukti Pembayaran */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Bukti Struk Transfer / Kwitansi Fisik
          </label>
          <div className="mt-1.5 flex flex-col gap-3">
            {iplFoto ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2">
                <div className="relative h-44 w-full">
                  <img
                    src={iplFoto}
                    alt="Pratinjau Bukti Bayar"
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIplFoto("")}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition"
                >
                  <Trash2 size={14} />
                  <span>Hapus / Ganti Foto</span>
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Upload size={18} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih atau Ambil Foto Bukti Bayar
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">PNG, JPG, JPEG (Maks. 3 MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileToBase64(e, setIplFoto)}
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
          <Plus size={16} /> Simpan Data Pembayaran IPL
        </button>
      </form>
    </div>
  </div>
)}

        {/* ================= TAB 3: JURNAL MASUK ================= */}
{activeTab === "pemasukan" && (
  <div className="max-w-2xl">
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Jurnal Entry Penerimaan Kas
      </h1>
      <p className="text-xs text-slate-500">
        Pencatatan kas masuk non-IPL (donasi warga, sewa tenda/lapangan, dsb).
      </p>
    </div>

    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          showToast("Kas masuk berhasil dicatat ke buku kas!");
          setJurnalNominal("");
          setJurnalKeterangan("");
          setJurnalMasukFoto("");
        }}
        className="space-y-4"
      >
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tanggal Transaksi
          </label>
          <input
            type="date"
            value={jurnalTanggal}
            onChange={(e) => setJurnalTanggal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Kategori Pemasukan
          </label>
          <select
            value={jurnalKategori}
            onChange={(e) => setJurnalKategori(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
            <option value="Donasi / Sumbangan">Donasi / Sumbangan Warga</option>
            <option value="Sewa Fasilitas">Sewa Tenda / Inventaris RT</option>
            <option value="Bunga Bank">Bunga Rekening Bank BRI</option>
            <option value="Lain-lain">Penerimaan Lainnya</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Jumlah Nominal (Rp)
          </label>
          <input
            type="number"
            required
            placeholder="Contoh: 500000"
            value={jurnalNominal}
            onChange={(e) => setJurnalNominal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Keterangan
          </label>
          <textarea
            rows={3}
            required
            placeholder="Uraian sumber dan keterangan kas masuk"
            value={jurnalKeterangan}
            onChange={(e) => setJurnalKeterangan(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Lampiran Foto Penerimaan Kas (Opsional) */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lampiran Bukti Penerimaan
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
          </div>
          <div className="mt-1.5 flex flex-col gap-3">
            {jurnalMasukFoto ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2">
                <div className="relative h-40 w-full">
                  <img
                    src={jurnalMasukFoto}
                    alt="Pratinjau Bukti Kas Masuk"
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setJurnalMasukFoto("")}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition"
                >
                  <Trash2 size={14} />
                  <span>Hapus / Ganti Foto</span>
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Upload size={16} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload Bukti Transfer / Kwitansi Masuk
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">PNG, JPG, JPEG (Maks. 3 MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileToBase64(e, setJurnalMasukFoto)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
        >
          <Plus size={16} /> Catat Kas Masuk
        </button>
      </form>
    </div>
  </div>
)}

        {/* ================= TAB 4: JURNAL KELUAR ================= */}
{activeTab === "pengeluaran" && (
  <div className="max-w-2xl">
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Jurnal Entry Pengeluaran Kas
      </h1>
      <p className="text-xs text-slate-500">
        Pencatatan beban operasional, gaji satpam, kebersihan, dan pemeliharaan fasilitas.
      </p>
    </div>

    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          showToast("Kas keluar berhasil dicatat!");
          setJurnalNominal("");
          setJurnalKeterangan("");
          setJurnalKeluarFoto("");
        }}
        className="space-y-4"
      >
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tanggal Pengeluaran
          </label>
          <input
            type="date"
            value={jurnalTanggal}
            onChange={(e) => setJurnalTanggal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pos Anggaran Pengeluaran
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
            <option>Honor Keamanan / Satpam</option>
            <option>Petugas Kebersihan Lingkungan</option>
            <option>Perbaikan Lampu PJU & Kelistrikan</option>
            <option>Pembelian Perlengkapan / Sarpras</option>
            <option>Konsumsi & Acara Warga</option>
            <option>Biaya Admin Bank</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Jumlah Pengeluaran (Rp)
          </label>
          <input
            type="number"
            required
            placeholder="Contoh: 250000"
            value={jurnalNominal}
            onChange={(e) => setJurnalNominal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Uraian / Keterangan Pembelian
          </label>
          <textarea
            rows={3}
            required
            placeholder="Contoh: Beli 3 pcs lampu LED 40W PJU Blok AR Barat"
            value={jurnalKeterangan}
            onChange={(e) => setJurnalKeterangan(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Lampiran Foto Bukti Pengeluaran / Struk / Nota (Opsional) */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lampiran Struk / Nota Pembelian
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
          </div>
          <div className="mt-1.5 flex flex-col gap-3">
            {jurnalKeluarFoto ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2">
                <div className="relative h-40 w-full">
                  <img
                    src={jurnalKeluarFoto}
                    alt="Pratinjau Nota Pengeluaran"
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setJurnalKeluarFoto("")}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition"
                >
                  <Trash2 size={14} />
                  <span>Hapus / Ganti Foto</span>
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <Upload size={16} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload Foto Struk / Faktur Pembayaran
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">PNG, JPG, JPEG (Maks. 3 MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileToBase64(e, setJurnalKeluarFoto)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
        >
          <Plus size={16} /> Simpan Pengeluaran
        </button>
      </form>
    </div>
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