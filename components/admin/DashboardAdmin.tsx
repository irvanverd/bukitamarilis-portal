"use client";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Users,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
  UserCheck,
  ChevronDown
} from "lucide-react";


import React, { useState, useEffect } from "react";


const CACHE_KEY = "CACHE_DASHBOARD_KEUANGAN_DATA";

interface KorwilItem {
  korwil: string;
  nominal: number;
  lunas: number;
  totalUnit: number;
  percent: number;
}

interface DashboardMetrics {
  totalSaldo: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  txCountBulanIni: number;
  growthVsBulanLalu: number;
  korwilData: KorwilItem[];
  periodeText: string;
}

const DEFAULT_METRICS: DashboardMetrics = {
  totalSaldo: 0,
  pemasukanBulanIni: 0,
  pengeluaranBulanIni: 0,
  txCountBulanIni: 0,
  growthVsBulanLalu: 0,
  korwilData: [],
  periodeText: "Bulan Berjalan",
};

const money = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);


interface DashboardProps {
  onNavigate?: (targetTab: string) => void;
  userName?: string;
  allowedTabs?: string[]; // <-- Tambahkan baris ini
}

export default function DashboardKeuangan({ onNavigate, userName }: DashboardProps) {
  const [displayName, setDisplayName] = useState<string>(userName || "Admin");

  // Ambil nama user login dari props atau session/localStorage
  useEffect(() => {
    if (!userName) {
      try {
        const storedUser = localStorage.getItem("user_login") || localStorage.getItem("username");
        if (storedUser) {
          setDisplayName(storedUser);
        }
      } catch (e) {
        console.warn("Gagal membaca user login:", e);
      }
    }
  }, [userName]);

  const handleAction = (tabKey: string) => {
    if (onNavigate) {
      onNavigate(tabKey);
    } else {
      // Fallback jika navigasi menggunakan custom event atau URL query
      window.dispatchEvent(new CustomEvent("changeAdminTab", { detail: tabKey }));
    }
  };

  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 1. Fetch data dari Google Sheets API & simpan ke localStorage
  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const res = await fetch("/api/finance?action=getFinanceDashboardadmin");
      const json = await res.json();
      
      if (json.success && json.data) {
        setMetrics(json.data);
        // Simpan data terbaru ke localStorage
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
        } catch (e) {
          console.warn("Gagal menulis ke localStorage:", e);
        }
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data dashboard:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // 2. Baca cache localStorage saat mount, lalu sinkronkan di background
  useEffect(() => {
    let hasCache = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          setMetrics(parsed);
          setLoading(false); // Langsung render seketika tanpa nunggu request network
          hasCache = true;
        }
      }
    } catch (e) {
      console.warn("Gagal membaca cache dashboard:", e);
    }

    if (!hasCache) {
      setLoading(true);
    }

    // Tetap sinkronkan data terbaru dari server di background
    fetchDashboard(false);
  }, []);

  const totalWargaUnit = (metrics?.korwilData || []).reduce(
    (acc, k) => acc + (k?.totalUnit || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
  {/* ================= WELCOME BANNER ================= */}
  <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative z-10 space-y-2">
          <div
            style={{
              backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: "var(--primary)",
              borderColor: "color-mix(in srgb, var(--primary) 25%, transparent)",
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
          >
            <ShieldCheck size={14} />
            <span>MyAmarilis-Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Selamat Datang,{" "}
            <span style={{ color: "var(--primary)" }}>{displayName}</span>! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Pusat operasional dan pencatatan kas lingkungan. Pilih menu di bawah untuk mencatat
            penerimaan iuran warga atau input transaksi pengeluaran kas.
          </p>
        </div>

        {/* Aksen Dekoratif Halus */}
        <div
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
          className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full blur-3xl pointer-events-none"
        />
      </div>

      {/* ================= ACTION BUTTON CARDS ================= */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Menu Akses Cepat Transaksi
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* CARD 1: INPUT IPL & PENERIMAAN NON-IPL */}
          <button
            type="button"
            onClick={() => handleAction("input-ipl")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/20 dark:text-emerald-400">
                <ArrowDownLeft size={28} />
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-emerald-600 group-hover:text-white dark:bg-slate-800">
                <ChevronRight size={16} />
              </span>
            </div>

            <div className="mt-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-400">
                  Input Transaksi Pemasukan
                </span>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Pemasukan
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Catat pembayaran iuran bulanan warga (IPL reguler, tunggakan, maupun non-IPL)
                lengkap dengan upload bukti transfer.
              </p>
            </div>
          </button>

          {/* CARD 2: PENGELUARAN KAS */}
          <button
            type="button"
            onClick={() => handleAction("pengeluaran")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-500/20 dark:text-rose-400">
                <ArrowUpRight size={28} />
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-rose-600 group-hover:text-white dark:bg-slate-800">
                <ChevronRight size={16} />
              </span>
            </div>

            <div className="mt-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors dark:text-white dark:group-hover:text-rose-400">
                  Input Pengeluaran
                </span>
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  Kas Keluar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Catat pengeluaran kas operasional RT, gaji satpam, kebersihan, pemeliharaan LPJ,
                dan beban lainnya.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* WRAPPER COLLAPSIBLE: HEADER + METRIC CARDS + MONITORING KORWIL */}
      <div className="space-y-4">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setIsDashboardExpanded((prev) => !prev)}
            aria-expanded={isDashboardExpanded}
            className="flex flex-1 items-start sm:items-center gap-3 text-left group"
          >
            <div className="mt-0.5 sm:mt-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-950/60 dark:group-hover:text-emerald-400">
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  isDashboardExpanded ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                Dashboard Kas &amp; Rekapitulasi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laporan penerimaan IPL, kas riil RT, dan monitoring korwil unit periode{" "}
                {metrics.periodeText}.
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setIsDashboardExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            >
              <span>{isDashboardExpanded ? "Sembunyikan" : "Tampilkan"}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin text-emerald-600" : ""}
              />
              <span>{isRefreshing ? "Sinkronisasi..." : "Refresh Data"}</span>
            </button>
          </div>
        </div>

        {/* KONTEN YANG DI-EXPAND / HIDE */}
        {isDashboardExpanded && (
          <div className="space-y-4">
            {/* METRIC CARDS */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Card 1: Total Saldo */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Total Saldo Kas RT</span>
                  <Wallet size={18} className="text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {loading ? "..." : money(metrics.totalSaldo)}
                </p>
                <span
                  className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${
                    metrics.growthVsBulanLalu >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {metrics.growthVsBulanLalu >= 0 ? (
                    <TrendingUp size={13} />
                  ) : (
                    <TrendingDown size={13} />
                  )}
                  {metrics.growthVsBulanLalu >= 0
                    ? `+${metrics.growthVsBulanLalu}%`
                    : `${metrics.growthVsBulanLalu}%`}{" "}
                  vs bulan lalu
                </span>
              </div>

              {/* Card 2: Pemasukan Bulan Ini */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Pemasukan Bulan Ini</span>
                  <ArrowDownLeft size={18} className="text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-emerald-600">
                  {loading ? "..." : money(metrics.pemasukanBulanIni)}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {metrics.txCountBulanIni} Transaksi penerimaan tercatat
                </p>
              </div>

              {/* Card 3: Pengeluaran Bulan Ini */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Pengeluaran Bulan Ini</span>
                  <ArrowUpRight size={18} className="text-rose-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-rose-600">
                  {loading ? "..." : money(metrics.pengeluaranBulanIni)}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Pengeluaran &amp; beban operasional
                </p>
              </div>
            </div>

            {/* MONITORING KORWIL SECTION */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Monitoring &amp; Summary IPL per Korwil
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kepatuhan pembayaran warga periode {metrics.periodeText}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Users size={14} /> Total {totalWargaUnit} Unit
                </span>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <RefreshCw className="animate-spin mx-auto mb-2 text-emerald-500" size={20} />
                  Memuat data kepatuhan korwil...
                </div>
              ) : !metrics?.korwilData || metrics.korwilData.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Belum ada data warga korwil yang tercatat di Google Sheets.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {(metrics.korwilData || []).map((k, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {k.korwil}
                      </p>
                      <p className="mt-2 text-lg font-black text-emerald-600">
                        {money(k.nominal)}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Lunas: <strong>{k.lunas}</strong>/{k.totalUnit} unit
                        </span>
                        <span className="font-bold text-emerald-600">{k.percent}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${Math.min(k.percent || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    


      {/* ================= SHORTCUT BROWSER / WARGA ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
        <span className="text-xs text-slate-500 text-center sm:text-left">
          Perlu melihat rekap transaksi atau data kependudukan?
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAction("browser-keuangan")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <FileSpreadsheet size={13} className="text-emerald-600" />
            <span>Rekap Transaksi</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction("warga")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <UserCheck size={13} className="text-sky-600" />
            <span>Data Warga</span>
          </button>
        </div>
      </div>
    </div>
  );
}