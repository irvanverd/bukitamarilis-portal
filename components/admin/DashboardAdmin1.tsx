"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Users,
} from "lucide-react";

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

export default function DashboardKeuangan() {
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
    <div className="space-y-6 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            Dashboard Kas &amp; Rekapitulasi
          </h1>
          <p className="text-xs text-slate-500">
            Laporan penerimaan IPL, kas riil RT, dan monitoring korwil unit periode {metrics.periodeText}.
          </p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
          <span>{isRefreshing ? "Sinkronisasi..." : "Refresh Data"}</span>
        </button>
      </div>

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
            {metrics.growthVsBulanLalu >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
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
          <p className="mt-2 text-[11px] text-slate-400">Pengeluaran &amp; beban operasional</p>
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
  );
}