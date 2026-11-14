"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AdminInstallBanner from "@/components/admin/AdminInstallBanner";
import InputIPLForm from "@/components/admin/InputIPLForm";
import InputPengeluaran from "@/components/admin/InputPengeluaran";
import DashboardKeuangan from "@/components/admin/DashboardAdmin";
import BankbookBrowser from "@/components/admin/BankbookBrowser";

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
  X,
  Upload,
  Download,
  Smartphone,
  Image as ImageIcon,
  Trash2,
  Edit3,
  KeyRound,
  Eye,
  EyeOff,
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
  | "bankbook"
  | "browser-keuangan"
  | "input-ipl"
  | "pemasukan"
  | "pengeluaran"
  // Group Management
  | "warga"
  | "users"
  | "changepswd"
  // Group Sekretariat
  | "sarpras"
  | "komplain"
  | "surat";

interface AdminSession {
  userid?: string;
  username: string;
  role: "admin" | "korwil" | "bend-in" | "bend-out" | "bendahara" | string;
  nama: string;
  mobileno?: string;
  korwil?: string;
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
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    groupName: "Keuangan",
    items: [
      { id: "browser-keuangan", label: "Rekap Transaksi", icon: Receipt },
      { id: "bankbook", label: "Buku Bank", icon: Receipt },
      { id: "input-ipl", label: "Input Pemasukan", icon: CreditCard },
      { id: "pengeluaran", label: "Input Pengeluaran", icon: ArrowUpRight },
    ],
  },
  {
    groupName: "Management",
    items: [
      { id: "warga", label: "Data Warga", icon: Users },
      { id: "users", label: "User & Role", icon: ShieldCheck },
      { id: "changepswd", label: "Change Password", icon: ShieldCheck },
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
      alert(
        "Aplikasi sudah terpasang atau gunakan opsi 'Tambahkan ke Layar Utama' pada menu browser Anda."
      );
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

  // ================= Kalkulasi Aturan Role & Korwil =================
  const roleUpper = (session?.role || "").toUpperCase();
  const isKorwil = roleUpper === "KORWIL";
  // Jika korwil terisi di sheet_user gunakan itu, jika tidak gunakan nama/username
  const lockedKorwil = isKorwil
    ? session?.korwil && session.korwil !== "-"
      ? session.korwil
      : session?.nama || session?.username
    : undefined;

  const browserTabMode: "ALL" | "IN_ONLY" | "OUT_ONLY" =
    roleUpper === "KORWIL" || roleUpper === "BEND-IN"
      ? "IN_ONLY"
      : roleUpper === "BEND-OUT"
      ? "OUT_ONLY"
      : "ALL";

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

  const [resettingPwdWA, setResettingPwdWA] = useState(false);

const handleResetPasswordWA = async () => {
  const mobile = formUser.mobileno.trim();
  if (!mobile) {
    showToast("Harap isi Nomor HP / WhatsApp terlebih dahulu!");
    return;
  }

  const confirmed = window.confirm(
    `Reset password untuk ${formUser.userid} menjadi 4 digit acak dan kirim ke WhatsApp ${mobile}?`
  );
  if (!confirmed) return;

  setResettingPwdWA(true);
  try {
    const res = await fetch("/api/ipl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "resetPasswordAndSendWA",
        rowIndex: formUser.rowIndex,
        userid: formUser.userid,
        mobileno: mobile,
      }),
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.message || "Gagal mereset password.");
      return;
    }

    showToast(json.message || "Password baru berhasil dikirim ke WhatsApp!");
    fetchAdminUsers();
  } catch (err) {
    showToast("Terjadi kesalahan koneksi saat mereset password.");
  } finally {
    setResettingPwdWA(false);
  }
};


  interface SheetUserItem {
    rowIndex: number;
    userid: string;
    username: string;
    role: string;
    mobileno: string;
    korwil: string;
  }
  
  // State untuk Tab Users & Role
  const [listUsers, setListUsers] = useState<SheetUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  
  const fetchAdminUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/userid?action=getAdminUsers", { cache: "no-store" });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setListUsers(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat data user dari sheet_user:", err);
      showToast("Gagal memuat data pengguna dari server.");
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Muat data user saat tab "users" dibuka
  useEffect(() => {
    if (activeTab === "users" && session?.allowedTabs.includes("users")) {
      fetchAdminUsers();
    }
  }, [activeTab, session]);

  const getRoleMeta = (role: string) => {
    const r = (role || "").toUpperCase();
    switch (r) {
      case "ADMIN":
        return {
          badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
          desc: "Semua Modul, User Management & Akses Penuh",
        };
      case "KORWIL":
        return {
          badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
          desc: "Input Pemasukan, Rekap & Data Warga (Sesuai Korwil)",
        };
      case "BEND-IN":
        return {
          badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
          desc: "Input Pemasukan IPL, Rekap Pemasukan & Data Warga",
        };
      case "BEND-OUT":
        return {
          badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
          desc: "Input Pengeluaran Kas & Rekap Pengeluaran",
        };
      default:
        return {
          badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
          desc: "Akses Terbatas Sesuai Konfigurasi Role",
        };
    }
  };

  // ================= State Modal User (New / Edit) =================
const [userModalOpen, setUserModalOpen] = useState(false);
const [userModalMode, setUserModalMode] = useState<"new" | "edit">("new");
const [savingUser, setSavingUser] = useState(false);
const [formUser, setFormUser] = useState({
  rowIndex: 0,
  userid: "",
  username: "",
  passwd: "",
  role: "KORWIL",
  mobileno: "",
  korwil: "",
});

// ================= State Modal Change Password =================
const [pwdModalOpen, setPwdModalOpen] = useState(false);
const [savingPwd, setSavingPwd] = useState(false);
const [showNewPwd, setShowNewPwd] = useState(false);
const [formPwd, setFormPwd] = useState({
  rowIndex: 0,
  userid: "",
  username: "",
  newPassword: "",
  confirmPassword: "",
});

// Buka Modal Tambah User Baru
const handleOpenNewUser = () => {
  setUserModalMode("new");
  setFormUser({
    rowIndex: 0,
    userid: "",
    username: "",
    passwd: "",
    role: "KORWIL",
    mobileno: "",
    korwil: "",
  });
  setUserModalOpen(true);
};

// Buka Modal Edit User
const handleOpenEditUser = (u: SheetUserItem) => {
  setUserModalMode("edit");
  setFormUser({
    rowIndex: u.rowIndex,
    userid: u.userid,
    username: u.username,
    passwd: "",
    role: u.role || "KORWIL",
    mobileno: u.mobileno === "-" ? "" : u.mobileno,
    korwil: u.korwil === "-" ? "" : u.korwil,
  });
  setUserModalOpen(true);
};

// Buka Modal Ganti Password
const handleOpenChangePwd = (u: SheetUserItem) => {
  setShowNewPwd(false);
  setFormPwd({
    rowIndex: u.rowIndex,
    userid: u.userid,
    username: u.username,
    newPassword: "",
    confirmPassword: "",
  });
  setPwdModalOpen(true);
};

// Submit Form Tambah / Edit User
const handleSubmitUserForm = async (e: React.FormEvent) => {
  e.preventDefault();
  setSavingUser(true);
  try {
    const res = await fetch("/api/ipl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveAdminUser",
        mode: userModalMode,
        ...formUser,
      }),
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.message || "Gagal menyimpan data pengguna.");
      return;
    }

    showToast(json.message || "Data pengguna berhasil disimpan!");
    setUserModalOpen(false);
    fetchAdminUsers(); // Refresh tabel
  } catch (err) {
    showToast("Terjadi kesalahan jaringan saat menyimpan user.");
  } finally {
    setSavingUser(false);
  }
};

// Submit Form Ganti Password
const handleSubmitPwdForm = async (e: React.FormEvent) => {
  e.preventDefault();
  if (formPwd.newPassword.length < 4) {
    showToast("Password baru minimal 4 karakter.");
    return;
  }
  if (formPwd.newPassword !== formPwd.confirmPassword) {
    showToast("Konfirmasi password tidak cocok!");
    return;
  }

  setSavingPwd(true);
  try {
    const res = await fetch("/api/ipl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "changeAdminPassword",
        rowIndex: formPwd.rowIndex,
        userid: formPwd.userid,
        newPassword: formPwd.newPassword,
      }),
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.message || "Gagal mengubah password.");
      return;
    }

    showToast(json.message || "Password berhasil diubah!");
    setPwdModalOpen(false);
  } catch (err) {
    showToast("Terjadi kesalahan jaringan saat mengubah password.");
  } finally {
    setSavingPwd(false);
  }
};

  // Filter unit blok berdasarkan input teks & batasan korwil jika login sebagai KORWIL
  const filteredBlokList = useMemo(() => {
    const baseList = lockedKorwil
      ? listWargaLookup.filter(
          (w) => (w.Korwil || "").toLowerCase() === lockedKorwil.toLowerCase()
        )
      : listWargaLookup;

    if (!iplBlok && !searchBlokQuery) return baseList;
    const q = (searchBlokQuery || iplBlok).toLowerCase().trim();
    return baseList.filter((w) => {
      const b = (w.Blok || w.BlokID || "").toLowerCase();
      const n = (w.Nama || w.NamaAlias || "").toLowerCase();
      return b.includes(q) || n.includes(q);
    });
  }, [listWargaLookup, iplBlok, searchBlokQuery, lockedKorwil]);

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

  const komplainCategoryData = [
    { label: "Fasilitas Umum / PJU", count: 14, color: "#10b981", percent: 45 },
    { label: "Kebersihan & Sampah", count: 8, color: "#3b82f6", percent: 26 },
    { label: "Keamanan Lingkungan", count: 5, color: "#f59e0b", percent: 16 },
    { label: "Saluran Air / Drainase", count: 4, color: "#8b5cf6", percent: 13 },
  ];

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
            MyA
          </span>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white">MyAdmin</h1>
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
              {session?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                {session?.nama || session?.username}
              </p>
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {session?.role}
                </span>
                {lockedKorwil && (
                  <span className="inline-block rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-400">
                    {lockedKorwil}
                  </span>
                )}
              </div>
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
        {activeTab === "dashboard" && session?.allowedTabs.includes("dashboard") && (
          <DashboardKeuangan
            userName={session?.nama || session?.username || "Admin"}
            allowedTabs={session?.allowedTabs}
            onNavigate={(targetTab) => setActiveTab(targetTab as AdminTab)}
          />
        )}

        {/* ================= TAB WARGA ================= */}
        {activeTab === "warga" && session?.allowedTabs.includes("warga") && (
          <WargaManager forcedKorwil={lockedKorwil} />
        )}


        {/* ================= TAB REKAP TRANSAKSI ================= */}
        {activeTab === "browser-keuangan" &&
          session?.allowedTabs.includes("browser-keuangan") && (
            <KeuanganBrowser
              forcedKorwil={lockedKorwil}
              //allowedTabMode={browserTabMode}
            />
          )}

        {activeTab === "bankbook" && session?.allowedTabs.includes("bankbook") && (
        <BankbookBrowser />
          )}

        {/* ================= TAB 2: INPUT IPL ================= */}
        {activeTab === "input-ipl" && session?.allowedTabs.includes("input-ipl") && (
  <div className="space-y-6">
    <InputIPLForm lockKorwil={lockedKorwil} />
  </div>
)}



{activeTab === "pemasukan" && session?.allowedTabs.includes("pemasukan") && (
  <div className="space-y-6">
    <InputIPLForm lockKorwil={lockedKorwil} />
  </div>
)}

        {/* ================= TAB 4: JURNAL KELUAR ================= */}
        {activeTab === "pengeluaran" && session?.allowedTabs.includes("pengeluaran") && (
          <div className="space-y-6">
            <InputPengeluaran />
          </div>
        )}

        {/* ================= TAB 5: SARANA PRASARANA ================= */}
        {activeTab === "sarpras" && session?.allowedTabs.includes("sarpras") && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Log Penggunaan Sarana &amp; Prasarana
              </h1>
              <p className="text-xs text-slate-500">
                Pencatatan pemakaian aset, suku cadang, dan dokumentasi foto pengerjaan fasilitas umum warga.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast(
                    `Log pemakaian "${sarprasBarang}" tanggal ${sarprasTanggal} berhasil dicatat!`
                  );
                  setSarprasBarang("");
                  setSarprasLokasi("");
                  setSarprasKeterangan("");
                  setSarprasFoto("");
                }}
                className="space-y-4"
              >
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
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          PNG, JPG, JPEG (Maks. 3 MB)
                        </p>
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
        {activeTab === "komplain" && session?.allowedTabs.includes("komplain") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Browser Laporan Komplain Warga (Dummy)
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
                      <th className="px-5 py-3.5 font-bold">Tiket &amp; Tanggal</th>
                      <th className="px-4 py-3.5 font-bold">Unit / Pelapor</th>
                      <th className="px-4 py-3.5 font-bold">Kategori &amp; Judul</th>
                      <th className="px-4 py-3.5 font-bold">Status</th>
                      <th className="px-5 py-3.5 font-bold text-right">Aksi Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {listKomplain.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{item.id}</p>
                          <p className="text-[10px] text-slate-400">{item.tanggal}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {item.blok}
                          </span>
                          <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                            {item.nama}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.judul}
                          </p>
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
        {activeTab === "surat" && session?.allowedTabs.includes("surat") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Permohonan Surat Pengantar Warga (Dummy)
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
                      <th className="px-5 py-3.5 font-bold">ID &amp; Tgl</th>
                      <th className="px-4 py-3.5 font-bold">Pemohon</th>
                      <th className="px-4 py-3.5 font-bold">Jenis Surat &amp; Keperluan</th>
                      <th className="px-4 py-3.5 font-bold">Status Surat</th>
                      <th className="px-5 py-3.5 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {listSurat.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{item.id}</p>
                          <p className="text-[10px] text-slate-400">{item.tanggal}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {item.blok}
                          </span>
                          <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                            {item.nama}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.jenis}
                          </p>
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
                              showToast(
                                `Surat ${item.id} disetujui & nomor surat diterbitkan!`
                              );
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
        {activeTab === "users" && session?.allowedTabs.includes("users") && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pengguna &amp; Hak Akses Portal Admin
                </h1>
                <p className="text-xs text-slate-500">
                  Kelola akun pengurus, peran wewenang, dan kata sandi pada <code>sheet_user</code>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAdminUsers}
                  disabled={loadingUsers}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loadingUsers ? "animate-spin text-emerald-600" : ""} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleOpenNewUser}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  <Plus size={15} /> Tambah Petugas
                </button>
              </div>
            </div>

            {/* TABEL DAFTAR USER */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Nama &amp; User ID</th>
                      <th className="px-4 py-3.5 font-bold">Role Wewenang</th>
                      <th className="px-4 py-3.5 font-bold">Wilayah Korwil</th>
                      <th className="px-4 py-3.5 font-bold">No. HP / WhatsApp</th>
                      <th className="px-4 py-3.5 font-bold">Akses Modul</th>
                      <th className="px-5 py-3.5 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                          <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-emerald-600" />
                          Memuat daftar pengguna dari Google Sheets...
                        </td>
                      </tr>
                    ) : listUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                          Belum ada data pengguna pada <code>sheet_user</code>.
                        </td>
                      </tr>
                    ) : (
                      listUsers.map((u, idx) => {
                        const meta = getRoleMeta(u.role);
                        return (
                          <tr
                            key={u.userid || idx}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                              {u.username}
                              <p className="font-mono font-normal text-[10px] text-slate-400">
                                ID: {u.userid}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-lg px-2 py-0.5 font-bold uppercase ${meta.badgeClass}`}
                              >
                                {u.role || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">
                              {u.korwil && u.korwil !== "-" ? u.korwil : "-"}
                            </td>
                            <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-400">
                              {u.mobileno || "-"}
                            </td>
                            <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                              {meta.desc}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(u)}
                                  title="Edit Data User"
                                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                  <Edit3 size={13} className="text-emerald-600" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenChangePwd(u)}
                                  title="Ganti Password"
                                  className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 transition"
                                >
                                  <KeyRound size={13} />
                                  <span>Password</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================= */}
            {/* MODAL 1: TAMBAH / EDIT USER                               */}
            {/* ========================================================= */}
            {userModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {userModalMode === "new" ? "Tambah Petugas Baru" : "Edit Data Petugas"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Data langsung disinkronkan ke tab <code>sheet_user</code>
                      </p>
                    </div>
                    <button
                      onClick={() => setUserModalOpen(false)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitUserForm} className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          User ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={userModalMode === "edit"}
                          placeholder="Contoh: ALEX"
                          value={formUser.userid}
                          onChange={(e) =>
                            setFormUser({ ...formUser, userid: e.target.value.toUpperCase() })
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold uppercase text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-800/50"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Role Wewenang <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          value={formUser.role}
                          onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          <option value="ADMIN">ADMIN (Full Akses)</option>
                          <option value="KORWIL">KORWIL (Koordinator Wilayah)</option>
                          <option value="BEND-IN">BEND-IN (Bendahara Pemasukan)</option>
                          <option value="BEND-OUT">BEND-OUT (Bendahara Pengeluaran)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Nama Lengkap Petugas <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Alex (Korwil 1)"
                        value={formUser.username}
                        onChange={(e) => setFormUser({ ...formUser, username: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {userModalMode === "new" && (
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Password Awal <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Minimal 4 karakter"
                          value={formUser.passwd}
                          onChange={(e) => setFormUser({ ...formUser, passwd: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    )}

<div className="space-y-3">
  <div>
    <label className="font-bold text-slate-700 dark:text-slate-300">
      Wilayah Korwil
    </label>
    <input
      type="text"
      placeholder="Kosongkan jika bukan Korwil"
      value={formUser.korwil}
      onChange={(e) => setFormUser({ ...formUser, korwil: e.target.value })}
      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    />
    <span className="text-[10px] text-slate-400">
      Samakan dengan kolom Korwil di sheet_warga
    </span>
  </div>

  <div>
    <label className="font-bold text-slate-700 dark:text-slate-300">
      No. HP / WhatsApp
    </label>
    <div className="mt-1 flex items-center gap-2">
      <input
        type="text"
        placeholder="0812xxxxxxxx"
        value={formUser.mobileno}
        onChange={(e) => setFormUser({ ...formUser, mobileno: e.target.value })}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      {/* Tombol Reset Password muncul di sebelah No. HP saat mode Edit */}
      {userModalMode === "edit" && (
        <button
          type="button"
          onClick={handleResetPasswordWA}
          disabled={resettingPwdWA || !formUser.mobileno.trim()}
          title="Generate 4 digit password acak & kirim via WhatsApp"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 font-bold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50 transition"
        >
          <KeyRound size={14} />
          <span>{resettingPwdWA ? "Mengirim..." : "Reset Password"}</span>
        </button>
      )}
    </div>
    {userModalMode === "edit" && (
      <p className="mt-1 text-[10px] text-slate-400">
        Klik <strong>Reset Password</strong> untuk generate 4 digit angka acak &amp; kirim otomatis ke WA.
      </p>
    )}
  </div>
</div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setUserModalOpen(false)}
                        className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={savingUser}
                        className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {savingUser
                          ? "Menyimpan..."
                          : userModalMode === "new"
                          ? "Simpan Petugas"
                          : "Update Data"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        {/* ========================================================= */}
      {/* MODAL CHANGE PASSWORD (GLOBAL UNTUK SEMUA TAB/ROLE)       */}
      {/* ========================================================= */}
      {pwdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ganti Password Akun
                </h3>
                <p className="text-[11px] font-mono text-emerald-600 font-bold">
                  {formPwd.username} ({formPwd.userid})
                </p>
              </div>
              <button
                onClick={() => setPwdModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPwdForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    required
                    placeholder="Masukkan password baru"
                    value={formPwd.newPassword}
                    onChange={(e) =>
                      setFormPwd({ ...formPwd, newPassword: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-9 font-mono font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showNewPwd ? "text" : "password"}
                  required
                  placeholder="Ulangi password baru"
                  value={formPwd.confirmPassword}
                  onChange={(e) =>
                    setFormPwd({ ...formPwd, confirmPassword: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPwdModalOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                >
                  {savingPwd ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </form>
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