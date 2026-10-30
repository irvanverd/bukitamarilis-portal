"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { ChangeEvent, FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Home,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareWarning,
  Plus,
  ReceiptText,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Wallet,
  X,
  User,
} from "lucide-react";
import { getClientCache, saveClientCache } from "@/lib/client-cache";

type Tab = "ringkasan" | "unit" | "ipl" | "komplain" | "surat";

type Complaint = {
  id: string;
  title: string;
  category: string;
  date: string;
  status: "Diproses" | "Selesai" | "Menunggu";
  detail: string;
};

type LetterRequest = {
  id: string;
  type: string;
  purpose: string;
  date: string;
  status: "Diproses" | "Selesai" | "Menunggu";
};

interface RawIPLItem {
  transId?: string | number;
  BlokID: string;
  pmonth: string | number;
  pyear: string | number;
  invoice: string;
  paymethod: string;
  amount: number;
  keterangan: string;
  korwil: string;
  status: "C" | "O" | string;
  paidDate: string;
}

interface PaymentItem {
 transId: string | number;
  BlokID: string;
  period: string;
  invoice: string;
  keterangan: string;
  amount: number;
  due: string;
  status: "Lunas" | "Menunggu Verifikasi" | "Belum dibayar";
  paidDate: string;
  yearNum: number;
  monthNum: number;
}

interface WargaSession {
  nama?: string;
  blok?: string;
  noHp?: string;
  iplamount?: string | number;
  loginAt?: string;
  [key: string]: any;
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getEndOfMonthDate(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  const namaBulanPendek = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ][month - 1];
  return `${lastDay} ${namaBulanPendek} ${year}`;
}

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const navItems: { id: Tab; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: "ringkasan", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { id: "unit", label: "Unit saya", shortLabel: "Unit", icon: Home },
  { id: "ipl", label: "Riwayat IPL", shortLabel: "IPL", icon: Wallet },
  { id: "komplain", label: "Komplain", shortLabel: "Komplain", icon: MessageSquareWarning },
  { id: "surat", label: "Surat Pengantar", shortLabel: "Surat", icon: FileText },
];

const initialComplaints: Complaint[] = [
  {
    id: "KMP-026",
    title: "Lampu jalan dekat Blok AR.27 mati",
    category: "Fasilitas umum",
    date: "18 Okt 2026",
    status: "Selesai",
    detail: "Lampu jalan di dekat persimpangan Blok A sudah beberapa malam tidak menyala.",
  },
  {
    id: "KMP-021",
    title: "Pembersihan saluran air",
    category: "Kebersihan",
    date: "10 Okt 2026",
    status: "Selesai",
    detail: "Permintaan pemeriksaan saluran air di depan rumah.",
  },
];

const initialLetters: LetterRequest[] = [
  {
    id: "SPR-009",
    type: "Surat Keterangan Domisili",
    purpose: "Administrasi sekolah",
    date: "15 Okt 2026",
    status: "Diproses",
  },
];

function StatusPill({ status }: { status: string }) {
  const isLunas = status === "Lunas";
  const isPending = status === "Menunggu Verifikasi";
  const isBelumBayar = status === "Belum dibayar";

  const classes = isLunas
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : isPending
    ? "bg-blue-50 text-blue-700 ring-blue-200"
    : isBelumBayar
    ? "bg-rose-50 text-rose-700 ring-rose-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}>
      {status}
    </span>
  );
}

function SectionHeading({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm transition-colors duration-300 md:p-6 ${className}`}>
      {children}
    </section>
  );
}

export default function PortalWargaPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("ringkasan");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [housePhoto, setHousePhoto] = useState("");
  const [complaints, setComplaints] = useState(initialComplaints);
  const [letters, setLetters] = useState(initialLetters);
  const [complaintCategory, setComplaintCategory] = useState("Fasilitas umum");
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDetail, setComplaintDetail] = useState("");
  const [letterType, setLetterType] = useState("Surat Keterangan Domisili");
  const [letterPurpose, setLetterPurpose] = useState("");
  const [toast, setToast] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [session, setSession] = useState<WargaSession | null>(null);

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingIPL, setLoadingIPL] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("-");

  const currentTab = navItems.find((item) => item.id === activeTab) ?? navItems[0];
  const searchParams = useSearchParams();

  // State Modal Pop-up
const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
const [isFirstSetFlow, setIsFirstSetFlow] = useState(false);

const [oldPassword, setOldPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showOldPass, setShowOldPass] = useState(false);
const [showNewPass, setShowNewPass] = useState(false);

const [passLoading, setPassLoading] = useState(false);
const [passError, setPassError] = useState("");
const [passSuccess, setPassSuccess] = useState("");

// Otomatis buka pop-up jika warga membuka link WA dengan param ?action=set-password
useEffect(() => {
  if (!isAuthenticated) return;

  const action = searchParams.get("action");
  if (action === "set-password") {
    setIsFirstSetFlow(true);
    setIsPasswordModalOpen(true);
  }
}, [searchParams, isAuthenticated]);

// Handler Simpan Kata Sandi
const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setPassError("");
  setPassSuccess("");

  if (!isFirstSetFlow && !oldPassword.trim()) {
    setPassError("Kata sandi lama wajib diisi.");
    return;
  }

  if (newPassword.length < 6) {
    setPassError("Kata sandi baru minimal 6 karakter.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPassError("Konfirmasi kata sandi tidak cocok.");
    return;
  }

  setPassLoading(true);

  try {
    const res = await fetch("/api/auth-warga/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blokid: session?.blok,
        oldPassword: oldPassword,
        newPassword: newPassword,
        isFirstSet: isFirstSetFlow,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      setPassError(result.message || "Gagal mengubah kata sandi.");
      return;
    }

    setPassSuccess("Kata sandi berhasil disimpan!");
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPassSuccess("");
      // Bersihkan query param url jika ada
      router.replace("/portal-warga");
    }, 1500);
  } catch (err: any) {
    setPassError("Terjadi kendala jaringan saat menyimpan kata sandi.");
  } finally {
    setPassLoading(false);
  }
};

  // 1. Validasi sesi login warga dari localStorage
  useEffect(() => {
    const rawSession = localStorage.getItem("warga_session");

    if (!rawSession) {
      router.replace("/portal-warga/login");
    } else {
      try {
        const parsed: WargaSession = JSON.parse(rawSession);
        setSession(parsed);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("warga_session");
        router.replace("/portal-warga/login");
      } finally {
        setIsChecking(false);
      }
    }
  }, [router]);

  // 2. Mengambil tarif standar langsung dari session
  const standardIPLRate = useMemo(() => {
    return Number(session?.iplamount) || 110000;
  }, [session?.iplamount]);

  // 3. Fetch data IPL dan komparasi dengan bulan berjalan mulai Maret 2026
  const loadIPLData = async (blokId: string, forceRefresh = false) => {
    if (!blokId) return;

    const cacheKey = `ipl-list-${blokId.trim().toLowerCase()}`;

    if (!forceRefresh) {
      const cached = getClientCache<PaymentItem[]>(cacheKey);
      if (cached?.data && Array.isArray(cached.data)) {
        setPayments(cached.data);
        setLoadingIPL(false);
        setLastUpdated(
          new Date(cached.timestamp).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        );
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      if (forceRefresh) setLoadingIPL(true);

      const res = await fetch(`/api/ipl?blokid=${encodeURIComponent(blokId)}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "Gagal memuat data IPL");

      const rawItems: RawIPLItem[] = Array.isArray(json.data) ? json.data : [];

      const nominalTarif = Number(session?.iplamount) || 110000;

      const mapSudahBayar = new Map<string, RawIPLItem[]>();
      rawItems.forEach((item) => {
        const m = Number(item.pmonth);
        const y = Number(item.pyear);
        const key = `${y}-${m}`;
        const existingList = mapSudahBayar.get(key) || [];
        existingList.push(item);
        mapSudahBayar.set(key, existingList);
      });

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1 - 12

      const START_YEAR = 2026;
      const START_MONTH = 2; // Mulai Feb 2026

      const fullList: PaymentItem[] = [];

      for (let y = currentYear; y >= START_YEAR; y--) {
        const maxMonth = y === currentYear ? currentMonth : 12;
        const minMonth = y === START_YEAR ? START_MONTH : 1;

        for (let m = maxMonth; m >= minMonth; m--) {
          const key = `${y}-${m}`;
          const existingRecords = mapSudahBayar.get(key);

          const periodText = `${NAMA_BULAN[m - 1]} ${y}`;
          const dueText = getEndOfMonthDate(y, m);
          if (existingRecords && existingRecords.length > 0) {
            existingRecords.forEach((existing, recordIdx) => {
              const statusLabel =
                existing.status === "C"
                  ? "Lunas"
                  : existing.status === "O"
                  ? "Menunggu Verifikasi"
                  : "Belum dibayar";

              fullList.push({
                // Gunakan transId dari Apps Script, fallback jika kosong
                transId: existing.transId || `PAID-${existing.BlokID}-${y}-${m}-${recordIdx}`,
                BlokID: existing.BlokID,
                period: periodText,
                invoice: existing.invoice || `IPL ${NAMA_BULAN[m - 1].toUpperCase()}`,
                keterangan: existing.keterangan || "-",
                amount: Number(existing.amount) || nominalTarif,
                due: dueText,
                status: statusLabel,
                paidDate: existing.paidDate || "-",
                yearNum: y,
                monthNum: m,
              });
            });
          } else {
            // Untuk bulan tunggakan/belum bayar, buat ID unik berdasarkan periode
            fullList.push({
              transId: `UNPAID-${blokId}-${y}-${m}`,
              BlokID: blokId,
              period: periodText,
              invoice: `IPL ${NAMA_BULAN[m - 1].toUpperCase()}`,
              keterangan: "Tagihan IPL",
              amount: nominalTarif,
              due: dueText,
              status: "Belum dibayar",
              paidDate: "-",
              yearNum: y,
              monthNum: m,
            });
          } 
        }
      }

      setPayments(fullList);
      saveClientCache(cacheKey, fullList);

      setLastUpdated(
        json.timestamp
          ? new Date(json.timestamp).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : new Date().toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })
      );
    } catch (err) {
      console.warn("Gagal memperbarui data IPL dari server, menggunakan data lokal:", err);
    } finally {
      clearTimeout(timeout);
      setLoadingIPL(false);
    }
  };

  useEffect(() => {
    if (session?.blok) {
      loadIPLData(session.blok);
    }
  }, [session?.blok, session?.iplamount]);

// 1. Total seluruh nominal yang sudah dibayar lunas
const paidTotal = useMemo(() => {
    return payments
      .filter((item) => item.status === "Lunas")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [payments]);

  // 2. Hitung total kewajiban iuran dari Maret 2026 sampai bulan berjalan saat ini
  const totalObligation = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1 - 12

    const START_YEAR = 2026;
    const START_MONTH = 2; // Feb 2026

    // Total bulan wajib bayar sejak Maret 2026
    const totalMonths =
      (currentYear - START_YEAR) * 12 + (currentMonth - START_MONTH + 1);

    const validMonths = Math.max(0, totalMonths);
    const monthlyRate = standardIPLRate > 0 ? standardIPLRate : 110000;

    return validMonths * monthlyRate;
  }, [standardIPLRate]);

  // 3. Sisa tagihan / total tunggakan riil
  // Jika warga bayar lebih/lunas di muka, sisa tagihan adalah 0
  const totalUnpaid = useMemo(() => {
    const diff = totalObligation - paidTotal;
    return diff > 0 ? diff : 0;
  }, [totalObligation, paidTotal]);

  // 4. Jumlah periode bulan yang belum terbayar
  const unpaidCount = useMemo(() => {
    if (totalUnpaid <= 0) return 0;
    const monthlyRate = standardIPLRate > 0 ? standardIPLRate : 110000;
    return Math.ceil(totalUnpaid / monthlyRate);
  }, [totalUnpaid, standardIPLRate]);

  const nextDueDate = useMemo(() => {
    const firstUnpaid = payments.find((item) => item.status === "Belum dibayar");
    return firstUnpaid?.due || "-";
  }, [payments]);

  function handleLogout() {
    localStorage.removeItem("warga_session");
    router.replace("/portal-warga/login");
  }

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Memverifikasi akses portal...</p>
      </div>
    );
  }

  function goTo(tab: Tab) {
    setActiveTab(tab);
    setMobileNavOpen(false);
    setToast("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast("Pilih file foto dengan format gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast("Ukuran foto maksimal 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setHousePhoto(String(reader.result ?? ""));
    reader.readAsDataURL(file);
    setToast("Foto hanya ditampilkan sebagai pratinjau di perangkat ini; belum diunggah ke server.");
  }

  function submitComplaint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complaintTitle.trim() || !complaintDetail.trim()) {
      setToast("Lengkapi judul dan detail komplain terlebih dahulu.");
      return;
    }
    const now = new Date();
    const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(now);
    setComplaints((items) => [
      { id: `DEMO-${String(items.length + 1).padStart(3, "0")}`, title: complaintTitle.trim(), category: complaintCategory, date, status: "Menunggu", detail: complaintDetail.trim() },
      ...items,
    ]);
    setComplaintTitle("");
    setComplaintDetail("");
    setToast("Komplain masuk ke daftar demo di halaman ini saja. Belum disimpan ke Google Sheets.");
  }

  function submitLetter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!letterPurpose.trim()) {
      setToast("Isi tujuan pengajuan surat terlebih dahulu.");
      return;
    }
    const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
    setLetters((items) => [
      { id: `DEMO-${String(items.length + 1).padStart(3, "0")}`, type: letterType, purpose: letterPurpose.trim(), date, status: "Menunggu" },
      ...items,
    ]);
    setLetterPurpose("");
    setToast("Pengajuan surat masuk halaman ini saja. Belum dikirim ke pengurus.");
  }

  const displayName = session?.nama || "Warga Amarilis";
  const displayBlok = session?.blok || "Blok -";
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "WA";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col border-r border-border bg-card lg:flex">
          <Link href="/" className="flex h-[78px] items-center gap-3 border-b border-border/60 px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Home size={21} /></span>
            <span><span className="block text-base font-extrabold tracking-tight text-foreground">MyAmarilis</span><span className="mt-0.5 block text-[11px] text-muted-foreground">Portal Penghuni</span></span>
          </Link>
          <div className="px-4 pt-6">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">Menu utama</p>
            <nav className="space-y-1.5" aria-label="Navigasi portal penghuni">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => goTo(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? "bg-primary/10 text-primary ring-1 ring-emerald-100" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                    <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                    <span>{item.label}</span>
                    {active ? <ChevronRight size={16} className="ml-auto" /> : null}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="rounded-2xl bg-muted p-4 ring-1 ring-border/50">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-primary shadow-sm"><CircleHelp size={18} /></span>
              <p className="mt-3 text-sm font-bold text-foreground">Butuh bantuan?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Hubungi pengurus RT untuk informasi layanan warga.</p>
              <button onClick={() => goTo("komplain")} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80">Lihat layanan <ArrowRight size={14} /></button>
            </div>
            <button onClick={handleLogout} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-rose-600 transition-colors">
              <LogOut size={17} /> Keluar akun
            </button>
          </div>
        </aside>

        {mobileNavOpen ? <button aria-label="Tutup menu" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" /> : null}
        {mobileNavOpen ? (
          <aside className="fixed inset-y-0 left-0 z-50 w-[285px] bg-card p-4 shadow-xl lg:hidden">
            <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Home size={19} /></span><span className="font-extrabold text-foreground">MyAmarilis</span></div>
              <button onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" className="rounded-lg p-2 hover:bg-muted"><X size={20} /></button>
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} onClick={() => goTo(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><Icon size={18} />{item.label}</button>;
              })}
              <div className="mt-5 space-y-3 border-t border-border px-3 pt-4">
                <p className="text-xs font-bold text-muted-foreground">Tema tampilan</p>
                <ThemeSwitcher />
              </div>
            </nav>
            <button onClick={handleLogout} className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:text-rose-600">
              <LogOut size={17} /> Keluar akun
            </button>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1 lg:ml-[258px]">
          <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border/80 bg-card/90 px-4 backdrop-blur md:px-7">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileNavOpen(true)} aria-label="Buka menu" className="rounded-xl border border-border p-2 text-muted-foreground lg:hidden"><Menu size={19} /></button>
              <div><p className="text-sm font-bold text-foreground md:text-base">{currentTab.label}</p><p className="hidden text-[11px] text-muted-foreground/70 sm:block">RT 07 / RW 14 · Bukit Amarilis</p></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden shrink-0 sm:block">
                <ThemeSwitcher />
              </div>
              
              <button onClick={() => setToast("Belum ada notifikasi baru.")} aria-label="Notifikasi" className="relative rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500" /></button>
              
              <div className="flex items-center gap-2.5 border-l border-border pl-3 md:pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-extrabold text-primary">
                  {userInitials}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground leading-tight">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight flex items-center gap-0.5">
                    <MapPin size={10} className="text-primary inline shrink-0" />
                    {displayBlok}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-7 md:py-8">
            {toast ? <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-primary/10 px-4 py-3 text-sm text-primary"><span>{toast}</span><button onClick={() => setToast("")} aria-label="Tutup pesan"><X size={16} /></button></div> : null}

            {activeTab === "ringkasan" ? (
              <>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-primary">Portal Warga</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                      Selamat datang, {displayName} <span aria-hidden="true">👋</span>
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Pantau status tagihan IPL unit Anda dan gunakan layanan administrasi secara langsung.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => goTo("unit")} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-sm hover:bg-muted">Lihat unit saya <ArrowRight size={16} /></button>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-sm hover:bg-muted"
                    >
                      Kembali ke web <ArrowLeft size={16} />
                    </Link>
                  </div>
                </div>

                <section className="relative mb-6 overflow-hidden rounded-[26px] bg-primary text-primary-foreground p-5 shadow-lg shadow-emerald-900/10 md:p-7">
                  <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[28px] border-white/5" />
                  <div className="pointer-events-none absolute -bottom-24 right-32 h-60 w-60 rounded-full border-[32px] border-white/5" />
                  <div className="relative grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-100"><Wallet size={17} /> Total tunggakan saat ini</div>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{money(totalUnpaid)}</p>
                      <p className="mt-2 text-xs text-emerald-100 md:text-sm">
                        {unpaidCount > 0 ? `${unpaidCount} periode tagihan belum lunas` : "Belum ada tagihan baru"}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button onClick={() => goTo("ipl")} className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-bold text-primary shadow-sm hover:bg-primary/10">Lihat detail transaksi <ArrowRight size={16} /></button>
                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-card/10 px-3 py-2.5 text-xs font-semibold"><CalendarDays size={15} /> Jatuh tempo: {nextDueDate}</span>
                      </div>
                    </div>
                    <div className="relative rounded-2xl border border-white/15 bg-card/10 p-4 backdrop-blur-sm md:p-5">
                      <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-emerald-50">Status Pembayaran</span><ReceiptText size={19} className="text-emerald-100" /></div>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between gap-3 text-sm"><span className="text-emerald-100">Total riwayat terdata</span><span className="font-bold">{payments.length-unpaidCount} Record(s)</span></div>
                        <div className="flex justify-between gap-3 text-sm"><span className="text-emerald-100">Sudah dibayar</span><span className="font-bold">{money(paidTotal)}</span></div>
                        <div className="border-t border-white/20 pt-3"><div className="flex justify-between gap-3 text-sm"><span className="font-semibold">Sisa tagihan</span><span className="text-lg font-extrabold">{money(totalUnpaid)}</span></div></div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
                  <StatCard icon={Wallet} label="Tarif IPL unit" value={money(standardIPLRate)} detail={`Unit ${displayBlok}`} iconClass="bg-primary/10 text-primary" />
                  <StatCard icon={MessageSquareWarning} label="Komplain aktif" value={`${complaints.filter((item) => item.status !== "Selesai").length} laporan`} detail="total Komplain anda" iconClass="bg-violet-50 text-violet-700" />
                </section>

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <Card>
                    <SectionHeading title="Ringkasan IPL" description="Histori tagihan pada unit Anda" action={<button onClick={() => goTo("ipl")} className="text-xs font-bold text-primary hover:opacity-80">Lihat semua</button>} />
                    <div className="space-y-3">
                      {loadingIPL ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Memuat tagihan...</p>
                      ) : payments.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Belum ada catatan tagihan untuk unit ini.</p>
                      ) : (
                        payments.slice(0, 3).map((item, idx) => <PaymentRow key={item.transId || idx} item={item} />)
                      )}
                    </div>
                  </Card>
                  <Card>
                    <SectionHeading title="Unit saya" description="Informasi singkat unit" action={<button onClick={() => goTo("unit")} className="text-xs font-bold text-primary hover:opacity-80">Lihat profil</button>} />
                    <div className="flex gap-4">
                      <div className="flex h-[76px] w-[88px] shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-muted-foreground/70"><Home size={29} strokeWidth={1.4} /></div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground">{displayBlok}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{displayName}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Unit terdaftar di RT 07 / RW 14</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-muted px-4 py-3"><div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">Tarif IPL dasar</span><span className="font-extrabold text-foreground">{money(standardIPLRate)}</span></div></div>
                  </Card>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <ServiceCard icon={MessageSquareWarning} title="Punya kendala di lingkungan?" description="Sampaikan komplain fasilitas, kebersihan, atau layanan warga." buttonText="Buat komplain" onClick={() => goTo("komplain")} tone="violet" />
                  <ServiceCard icon={FileText} title="Butuh surat pengantar?" description="Lihat dan ajukan kebutuhan surat melalui menu layanan." buttonText="Ajukan surat" onClick={() => goTo("surat")} tone="blue" />
                </div>
              </>
            ) : null}

            {activeTab === "unit" ? (
              <>
                <SectionHeading title="Unit saya" description="Profil penghuni dan data unit rumah yang terdaftar." />
                <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                  <Card>
                    <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-foreground">Foto rumah</h3><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">Preview</span></div>
                    <div className="relative flex min-h-[230px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
                      {housePhoto ? <Image src={housePhoto} alt="Pratinjau foto rumah" fill unoptimized sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /> : <div className="px-6 py-10 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ImagePlus size={29} /></span><p className="mt-4 text-sm font-bold text-foreground">Foto rumah belum diunggah</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Pilih foto untuk melihat pratinjau.</p></div>}
                    </div>
                    <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-muted"><ImagePlus size={17} />{housePhoto ? "Ganti foto rumah" : "Pilih foto rumah"}<input type="file" accept="image/*" className="hidden" onChange={handlePhoto} /></label>
                    <p className="mt-2 text-center text-[11px] text-muted-foreground/70">Format gambar · Maksimal 5 MB</p>
                  </Card>
                  <Card>
                    <div className="mb-5 flex items-start justify-between gap-3"><div>
                      <h3 className="text-lg font-bold text-foreground">Profil penghuni</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Data akun penghuni yang aktif.</p>
                    </div>
                      
                         {/* Tombol Set / Ubah Kata Sandi */}
      <button
        type="button"
        onClick={() => {
          setIsFirstSetFlow(false);
          setIsPasswordModalOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
      >
        <KeyRound size={14} className="text-primary" />
        Ubah Kata Sandi
      </button>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">

                      <ShieldCheck size={13} className="mr-1 inline" />Terdaftar</span></div>
                    
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ProfileField label="Nama penghuni" value={displayName} />
                      <ProfileField label="Nomor HP" value={session?.noHp || "-"} />
                      <ProfileField label="Nomor blok / unit" value={displayBlok} icon={<MapPin size={15} />} />
                      <ProfileField label="Tarif IPL bulanan" value={money(standardIPLRate)} icon={<Wallet size={15} />} />
                      <ProfileField label="Status keanggotaan" value="Aktif" icon={<CheckCircle2 size={15} />} />
                    </div>
                  </Card>

                {/* POP-UP MODAL SET / CHANGE PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <KeyRound size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    {isFirstSetFlow ? "Buat Kata Sandi Baru" : "Ubah Kata Sandi"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Unit {displayBlok} · {displayName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPassError("");
                  setPassSuccess("");
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {passError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                <CheckCircle2 size={16} />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-3.5">
              {!isFirstSetFlow && (
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Kata Sandi Lama
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showOldPass ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Masukkan sandi saat ini"
                      className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Kata Sandi Baru
                </label>
                <div className="relative mt-1">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="mt-1 w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-1/2 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-1/2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {passLoading ? "Menyimpan..." : "Simpan Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

                </div>
              </>
            ) : null}

            {activeTab === "ipl" ? (
              <>
                <SectionHeading
                  title="Riwayat pembayaran IPL"
                  description={`Daftar tagihan unit ${displayBlok} (Pembaruan terakhir: ${lastUpdated})`}
                  action={
                    <button
                      onClick={() => session?.blok && loadIPLData(session.blok, true)}
                      disabled={loadingIPL}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={loadingIPL ? "animate-spin" : ""} />
                      {loadingIPL ? "Menyinkronkan..." : "Perbarui Data"}
                    </button>
                  }
                />
                <div className="mb-5 grid gap-4 md:grid-cols-3">
                  <StatCard icon={Wallet} label="Total belum lunas" value={money(totalUnpaid)} detail={`${unpaidCount} periode`} iconClass="bg-rose-50 text-rose-700" />
                  <StatCard icon={CheckCircle2} label="Sudah dibayar" value={money(paidTotal)} detail={`${payments.length - unpaidCount} periode`} iconClass="bg-primary/10 text-primary" />
                  <StatCard icon={CalendarDays} label="Jatuh tempo terdekat" value={nextDueDate} detail="Berdasarkan tagihan tertunda" iconClass="bg-amber-50 text-amber-700" />
                </div>
                <Card className="p-0 md:p-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 md:px-6"><div><h3 className="font-bold text-foreground">Semua tagihan unit</h3><p className="mt-1 text-xs text-muted-foreground">Data sinkronisasi dari Google Sheets</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"><ReceiptText size={14} />{payments.length} transaksi</span></div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[730px] text-left text-sm">
                      <thead className="bg-muted text-[11px] uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Periode</th>
                          <th className="px-4 py-3 font-semibold">Keterangan</th>
                          <th className="px-4 py-3 font-semibold">Jumlah</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {loadingIPL ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Memuat data riwayat IPL...</td>
                          </tr>
                        ) : payments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Tidak ditemukan catatan tagihan IPL untuk blok ini.</td>
                          </tr>
                        ) : (
                          payments.map((item, idx) => (
                            <tr key={item.transId || idx} className="hover:bg-muted/70 transition-colors">
                              <td className="px-6 py-4 font-semibold text-foreground">{item.period}</td>
                              <td className="px-4 py-4 text-xs text-muted-foreground">{item.keterangan || "-"}</td>
                              <td className="px-4 py-4 font-bold text-foreground">{money(item.amount)}</td>
                              <td className="px-6 py-4"><StatusPill status={item.status} /></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : null}

            {activeTab === "komplain" ? (
              <>
                <SectionHeading title="Komplain warga" description="Sampaikan kendala atau masukan terkait lingkungan dan layanan RT." />
                <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                  <Card>
                    <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><MessageSquareWarning size={21} /></span><div><h3 className="font-bold text-foreground">Buat komplain</h3><p className="mt-1 text-xs text-muted-foreground">Form simulasi — tidak mengirim data</p></div></div>
                    <form onSubmit={submitComplaint} className="space-y-4">
                      <FieldLabel label="Kategori"><select value={complaintCategory} onChange={(event) => setComplaintCategory(event.target.value)} className={fieldClass}><option>Fasilitas umum</option><option>Kebersihan</option><option>Keamanan</option><option>IPL dan administrasi</option><option>Lainnya</option></select></FieldLabel>
                      <FieldLabel label="Judul komplain"><input value={complaintTitle} onChange={(event) => setComplaintTitle(event.target.value)} className={fieldClass} placeholder="Contoh: Lampu jalan tidak menyala" maxLength={100} /></FieldLabel>
                      <FieldLabel label="Detail komplain"><textarea value={complaintDetail} onChange={(event) => setComplaintDetail(event.target.value)} className={`${fieldClass} min-h-[120px] resize-y`} placeholder="Jelaskan lokasi dan kendala yang dialami..." maxLength={1200} /></FieldLabel>
                      <button type="submit" disabled className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50" ><Plus size={17} />Submit Komplain (belum aktif)</button>
                    </form>
                  </Card>
                  <div><div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-foreground">Laporan komplain</h3><span className="text-xs text-muted-foreground">{complaints.length} laporan contoh</span></div><div className="space-y-3">{complaints.map((item) => <Card key={item.id} className="p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{item.id} · {item.category}</p><h4 className="mt-2 font-bold text-foreground">{item.title}</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p></div><StatusPill status={item.status} /></div><div className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground/70"><CalendarDays size={13} />{item.date}</div></Card>)}</div></div>
                </div>
              </>
            ) : null}

            {activeTab === "surat" ? (
              <>
                <SectionHeading title="Surat Pengantar" description="Ajukan kebutuhan surat dan pantau status pemrosesannya." />
                <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                  <Card>
                    <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><FileText size={21} /></span><div><h3 className="font-bold text-foreground">Ajukan surat</h3><p className="mt-1 text-xs text-muted-foreground">Form simulasi layanan administrasi</p></div></div>
                    <form onSubmit={submitLetter} className="space-y-4">
                      <FieldLabel label="Jenis surat"><select value={letterType} onChange={(event) => setLetterType(event.target.value)} className={fieldClass}><option>Surat Keterangan Domisili</option><option>Surat Pengantar KTP / KK</option><option>Surat Keterangan Usaha</option><option>Surat Pengantar Nikah</option><option>Surat Keterangan Lainnya</option></select></FieldLabel>
                      <FieldLabel label="Tujuan penggunaan"><textarea value={letterPurpose} onChange={(event) => setLetterPurpose(event.target.value)} className={`${fieldClass} min-h-[115px] resize-y`} placeholder="Jelaskan keperluan surat dan instansi tujuan..." maxLength={800} /></FieldLabel>
                      <button type="submit" disabled className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"><Plus size={17} />
  Buat pengajuan( belum aktif)
</button>
                    </form>
                  </Card>
                  <div><div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-foreground">Status pengajuan</h3><span className="text-xs text-muted-foreground">{letters.length} permohonan contoh</span></div>{letters.length === 0 ? <Card className="py-12 text-center"><FileText size={34} className="mx-auto text-slate-300" /><p className="mt-3 font-bold text-foreground">Belum ada pengajuan surat</p><p className="mt-1 text-sm text-muted-foreground">Form di sebelah kiri dapat digunakan untuk mencoba tampilan.</p></Card> : <div className="space-y-3">{letters.map((item) => <Card key={item.id} className="p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{item.id}</p><h4 className="mt-2 font-bold text-foreground">{item.type}</h4><p className="mt-1 text-sm text-muted-foreground">Tujuan: {item.purpose}</p></div><StatusPill status={item.status} /></div><div className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground/70"><CalendarDays size={13} />Diajukan {item.date}</div></Card>)}</div>}</div>
                </div>
              </>
            ) : null}

            <footer className="mt-8 border-t border-border pt-5 text-center text-[11px] text-muted-foreground/70">© 2026 Portal Warga RT 07 / RW 14 Bukit Amarilis</footer>
          </main>
        </div>
      </div>

      <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 px-1 pb-[max(env(safe-area-inset-bottom),4px)] pt-2 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return <button key={item.id} onClick={() => goTo(item.id)} className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 ${active ? "text-primary" : "text-muted-foreground/70"}`}><Icon size={18} strokeWidth={active ? 2.5 : 1.8} /><span className={`max-w-full truncate text-[9px] ${active ? "font-bold" : "font-medium"}`}>{item.shortLabel}</span></button>;
        })}
      </nav>
    </div>
  );
}

const fieldClass = "mt-1.5 w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-foreground">{label}{children}</label>;
}

function ProfileField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="rounded-xl border border-border/60 bg-muted/70 p-3.5"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-foreground">{icon ? <span className="text-primary">{icon}</span> : null}{value}</p></div>;
}

function StatCard({ icon: Icon, label, value, detail, iconClass }: { icon: typeof Wallet; label: string; value: string; detail: string; iconClass: string }) {
  return <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:p-5"><div className="flex items-start justify-between gap-3"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}><Icon size={18} /></span></div><p className="mt-3 text-xl font-extrabold tracking-tight text-foreground md:text-2xl">{value}</p><p className="mt-1 text-[11px] text-muted-foreground/70">{detail}</p></div>;
}

function PaymentRow({ item }: { item: PaymentItem }) {
  const isLunas = item.status === "Lunas";
  const isPending = item.status === "Menunggu Verifikasi";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3.5 transition hover:bg-muted/70">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isLunas ? "bg-primary/10 text-primary" : isPending ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
        }`}>
          {isLunas ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{item.period}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">Jatuh tempo {item.due || "-"}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-sm font-extrabold text-foreground">{money(item.amount)}</span>
        <StatusPill status={item.status} />
      </div>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, description, buttonText, onClick, tone }: { icon: typeof FileText; title: string; description: string; buttonText: string; onClick: () => void; tone: "violet" | "blue" }) {
  const iconClass = tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700";
  return <Card className="flex items-start gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}><Icon size={20} /></span><div className="min-w-0 flex-1"><h3 className="font-bold text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p><button onClick={onClick} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:border-emerald-200 hover:bg-primary/10 hover:text-primary">{buttonText}<ArrowRight size={14} /></button></div></Card>;
}