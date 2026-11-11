"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  XCircle,
  RefreshCw,
  X,
} from "lucide-react";

export interface KeuanganItem {
  rowIndex: number;
  TransId?: string;
  Blok?: string;
  Nama?: string;
  Category?: string; // "IPL", "NON-IPL", "OUT"
  Account?: string;
  AccountName?: string;
  Tanggal?: string;
  CaraBayar?: string;
  Korwil?: string;
  Amount?: number;
  Status?: "C" | "O" | "R" | "X" | string;
  ReconcileDate?: string;
  Keterangan?: string;
  Lampiran?: string;
  InvoiceNo?: string;
  [key: string]: any;
}

const NAMA_BULAN = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: any }> = {
  C: {
    label: "Reconcile",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  O: {
    label: "Open",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    icon: Clock,
  },
  R: {
    label: "Release",
    badge: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
    icon: RefreshCw,
  },
  X: {
    label: "Cancel",
    badge: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    icon: XCircle,
  },
};

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return "-";
  
  // Tangani format string YYYY-MM-DD
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);

    if (!isNaN(dateObj.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }).format(dateObj); // Menghasilkan format: "11 Nov 26"
    }
  }

  // Fallback jika format awal berupa tipe tanggal lain
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(d);
};


// Helper untuk mendapatkan tanggal hari ini dalam format lokal YYYY-MM-DD
const getTodayIsoString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Helper tanggal awal bulan berjalan (YYYY-MM-01)
const getFirstDayOfMonthIsoString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
};

export default function KeuanganBrowser() {
  const [data, setData] = useState<KeuanganItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"IN" | "OUT">("IN");
  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, "0");
  const currentYearStr = String(now.getFullYear());

  // Default periode ke bulan dan tahun berjalan
  const [filterBulan, setFilterBulan] = useState<string>(currentMonthStr);
  const [filterTahun, setFilterTahun] = useState<string>(currentYearStr);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  // SET DEFAULT FILTER TANGGAL KE HARI INI
  const [filterTanggal, setFilterTanggal] = useState<string>(getFirstDayOfMonthIsoString());
  const [filterKorwil, setFilterKorwil] = useState("");
  const [filterCaraBayar, setFilterCaraBayar] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAccountName, setFilterAccountName] = useState("");

  // Modal Detail & Inline Editing States
  const [selectedItem, setSelectedItem] = useState<KeuanganItem | null>(null);
  const [updatingRow, setUpdatingRow] = useState<number | null>(null);

  // 1. Fetch Data dari API Next.js / Apps Script
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance?action=getKeuanganList");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat list keuangan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

const filteredData = useMemo(() => {
  return data
    .filter((item) => {
      const cat = (item.Category || "").trim().toUpperCase();

      // Filter Tab Pemasukan / Pengeluaran
      if (activeTab === "IN") {
        if (cat === "OUT" || cat === "PENGELUARAN") return false;
      } else {
        if (cat !== "OUT" && cat !== "PENGELUARAN") return false;
      }

      // Filter Periode Bulan & Tahun berdasarkan item.Tanggal (format: YYYY-MM-DD)
      if (item.Tanggal) {
        const parts = item.Tanggal.split("T")[0].split("-");
        const itemYear = parts[0];
        const itemMonth = parts[1];

        if (filterTahun && itemYear !== filterTahun) return false;
        if (filterBulan && itemMonth !== filterBulan) return false;
      } else {
        // Jika data tidak memiliki tanggal dan filter aktif, kecualikan
        if (filterTahun || filterBulan) return false;
      }

      // Freetext Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = (item.Nama || "").toLowerCase().includes(q);
        const matchBlok = (item.Blok || "").toLowerCase().includes(q);
        const matchKet = (item.Keterangan || "").toLowerCase().includes(q);
        const matchTrans = (item.TransId || "").toLowerCase().includes(q);
        if (!matchNama && !matchBlok && !matchKet && !matchTrans) return false;
      }

      // Filter Lainnya
      if (filterKorwil && item.Korwil !== filterKorwil) return false;
      if (filterCaraBayar && item.CaraBayar !== filterCaraBayar) return false;
      if (filterStatus && item.Status !== filterStatus) return false;
      if (
        filterAccountName &&
        item.AccountName !== filterAccountName &&
        item.Account !== filterAccountName
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.Tanggal || 0).getTime();
      const dateB = new Date(b.Tanggal || 0).getTime();
      return dateB - dateA;
    });
}, [
  data,
  activeTab,
  filterBulan,
  filterTahun,
  searchQuery,
  filterKorwil,
  filterCaraBayar,
  filterStatus,
  filterAccountName,
]);

  // Ekstrak Opsi Unik untuk Dropdown Filter
  const options = useMemo(() => {
    const korwilSet = new Set<string>();
    const caraBayarSet = new Set<string>();
    const accountNameSet = new Set<string>();

    data.forEach((d) => {
      if (d.Korwil) korwilSet.add(d.Korwil);
      if (d.CaraBayar) caraBayarSet.add(d.CaraBayar);
      if (d.AccountName) accountNameSet.add(d.AccountName);
    });

    return {
      korwils: Array.from(korwilSet),
      caraBayars: Array.from(caraBayarSet),
      accountNames: Array.from(accountNameSet),
    };
  }, [data]);

  const availableYears = useMemo(() => {
    const yearSet = new Set<string>();
    yearSet.add(String(new Date().getFullYear()));
  
    data.forEach((d) => {
      if (d.Tanggal) {
        const y = d.Tanggal.split("T")[0].split("-")[0];
        if (y && y.length === 4) yearSet.add(y);
      }
    });
  
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  // 3. Inline Edit: Update Reconcile Date
  const handleUpdateReconcileDate = async (rowIndex: number, newDate: string) => {
    try {
      setUpdatingRow(rowIndex);
      // Auto-set status ke "C" (Reconciled) jika tanggal diisi, atau balik ke "O" jika dikosongkan
      const newStatus = newDate ? "C" : "R";

      const res = await fetch("/api/finance?action=updateReconcileDate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex,
          reconcileDate: newDate,
          status: newStatus,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        // Optimistic UI Update
        setData((prev) =>
          prev.map((row) =>
            row.rowIndex === rowIndex
              ? { ...row, ReconcileDate: newDate, Status: newStatus }
              : row
          )
        );
      } else {
        alert("Gagal update rekonsiliasi: " + resJson.message);
      }
    } catch (err: any) {
      alert("Error inline edit: " + err.message);
    } finally {
      setUpdatingRow(null);
    }
  };

  const renderStatusBadge = (statusCode?: string) => {
    const config = STATUS_CONFIG[statusCode || ""] || {
      label: statusCode || "Unknown",
      badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
      icon: Clock,
    };
    const IconComp = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${config.badge}`}
      >
        <IconComp size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* HEADER & TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Rekap Transaksi
          </h2>
          <p className="text-xs text-slate-500">
            Kelola dan pantau seluruh mutasi kas, rekonsiliasi bank, dan status pembayaran.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("IN")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "IN"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <ArrowDownLeft size={15} />
            Pemasukan (IPL & Non-IPL)
          </button>
          <button
            onClick={() => setActiveTab("OUT")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "OUT"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <ArrowUpRight size={15} />
            Pengeluaran (OUT)
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Row 1: Search text */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari Blok, Nama Warga, atau Keterangan transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
  {/* Filter Bulan */}
  <div>
    <label className="text-[10px] text-slate-400 font-bold block mb-1">
      Periode Bulan
    </label>
    <select
      value={filterBulan}
      onChange={(e) => setFilterBulan(e.target.value)}
      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 font-semibold"
    >
      <option value="">Semua Bulan</option>
      {NAMA_BULAN.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  </div>

  {/* Filter Tahun */}
  <div>
    <label className="text-[10px] text-slate-400 font-bold block mb-1">
      Periode Tahun
    </label>
    <select
      value={filterTahun}
      onChange={(e) => setFilterTahun(e.target.value)}
      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 font-semibold font-mono"
    >
      <option value="">Semua Tahun</option>
      {availableYears.map((yr) => (
        <option key={yr} value={yr}>
          {yr}
        </option>
      ))}
    </select>
  </div>

  {/* Filter Korwil */}
  <div>
    <label className="text-[10px] text-slate-400 font-bold block mb-1">Korwil</label>
    <select
      value={filterKorwil}
      onChange={(e) => setFilterKorwil(e.target.value)}
      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
    >
      <option value="">Semua Korwil</option>
      {options.korwils.map((k) => (
        <option key={k} value={k}>
          {k}
        </option>
      ))}
    </select>
  </div>

  {/* Filter Cara Bayar */}
  <div>
    <label className="text-[10px] text-slate-400 font-bold block mb-1">Cara Bayar</label>
    <select
      value={filterCaraBayar}
      onChange={(e) => setFilterCaraBayar(e.target.value)}
      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
    >
      <option value="">Semua Cara Bayar</option>
      {options.caraBayars.map((cb) => (
        <option key={cb} value={cb}>
          {cb}
        </option>
      ))}
    </select>
  </div>

  {/* Filter Status */}
  <div>
    <label className="text-[10px] text-slate-400 font-bold block mb-1">Status</label>
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
    >
      <option value="">Semua Status</option>
      <option value="C">Reconcile (C)</option>
      <option value="O">Open (O)</option>
      <option value="R">Release (R)</option>
      <option value="X">Cancel (X)</option>
    </select>
  </div>

  {/* Filter Akun COA */}
  <div>
    <label className="text-[10px] text-slate-400 font-bold block mb-1">Akun / COA</label>
    <select
      value={filterAccountName}
      onChange={(e) => setFilterAccountName(e.target.value)}
      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
    >
      <option value="">Semua Akun</option>
      {options.accountNames.map((an) => (
        <option key={an} value={an}>
          {an}
        </option>
      ))}
    </select>
  </div>
</div>


        {/* Reset Semua Filter */}
        {(filterTanggal || filterKorwil || filterCaraBayar || filterStatus || filterAccountName || searchQuery) && (
        <div className="flex justify-end pt-1">
        <button
        onClick={() => {
       ; setFilterTanggal(getFirstDayOfMonthIsoString());
        setFilterKorwil("");
        setFilterCaraBayar("");
        setFilterStatus("");
        setFilterAccountName("");
        setSearchQuery("");
      }}
      className="text-[11px] font-bold text-rose-500 hover:underline"
    >
      Reset Semua Filter (Tampilkan Semua Transaksi)
    </button>
  </div>
)}
      </div>

      {/* HASIL DATA (LOADING / EMPTY) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <RefreshCw className="animate-spin mx-auto mb-2 text-emerald-500" size={24} />
          Memuat data transaksi dari Servers...
        </div>
      ) : filteredData.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Tidak ada data transaksi yang sesuai filter.
        </div>
      ) : (
        <>
          {/* ========================================================= */}
{/* 1. TAMPILAN DESKTOP (TABLE DENGAN FREEZE HEADER & KOLOM)  */}
{/* ========================================================= */}
<div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
  {/* Atur tinggi maksimal scroll vertikal agar header dan kolom freeze bekerja optimal */}
  <div className="overflow-x-auto max-h-[65vh] overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-separate border-spacing-0">
      <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <tr>
          {/* Kolom 1 (Freeze Kiri #1): Tanggal */}
          <th className="sticky top-0 left-0 z-20 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 w-28 whitespace-nowrap shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
            Tgl Transaksi
          </th>

          {/* Kolom 2 (Freeze Kiri #2): Unit & Nama */}
          <th className="sticky top-0 left-28 z-20 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 min-w-[160px] whitespace-nowrap shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
            Unit / Nama
          </th>

          {/* Kolom Tengah (Hanya Freeze Header ke Atas) */}
          <th className="sticky top-0 z-10 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
            Akun & Kategori
          </th>
          <th className="sticky top-0 z-10 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
            Cara Bayar
          </th>
          <th className="sticky top-0 z-10 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">
            Nominal
          </th>
          <th className="sticky top-0 z-10 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
            Status
          </th>
          <th className="sticky top-0 z-10 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[140px]">
            Reconcile Date
          </th>

          {/* Kolom Terakhir (Freeze Kanan): Tombol Aksi */}
          <th className="sticky top-0 right-0 z-20 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-l border-slate-200 dark:border-slate-700 text-center whitespace-nowrap shadow-[-2px_0_4px_rgba(0,0,0,0.04)]">
            Aksi
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
        {filteredData.map((row) => (
          <tr key={row.rowIndex} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group">
            {/* Freeze Body Kiri #1: Tanggal */}
            <td className="sticky left-0 z-10 py-3 px-4 font-mono font-medium bg-white group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800/60 border-r border-slate-100 dark:border-slate-800 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] whitespace-nowrap">
              {formatDateDisplay(row.Tanggal)}
            </td>

            {/* Freeze Body Kiri #2: Unit & Nama */}
            <td className="sticky left-28 z-10 py-3 px-4 bg-white group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800/60 border-r border-slate-100 dark:border-slate-800 shadow-[2px_0_4px_rgba(0,0,0,0.04)] whitespace-nowrap">
              <div className="font-bold text-slate-900 dark:text-white">
                {row.Blok || "UMUM"}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                {row.Nama || "-"}
              </div>
            </td>

            {/* Body Kolom Biasa */}
            <td className="py-3 px-4 border-b border-slate-100 dark:border-slate-800">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {row.AccountName || row.Account || "-"}
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                {row.Category}
              </span>
            </td>

            <td className="py-3 px-4 border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
              <span>{row.CaraBayar || "-"}</span>
              {row.Korwil && (
                <span className="block text-[10px] text-slate-400">Korwil: {row.Korwil}</span>
              )}
            </td>

            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
              {formatRupiah(row.Amount || 0)}
            </td>

            <td className="py-3 px-4 text-center border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
              {renderStatusBadge(row.Status)}
            </td>

            <td className="py-3 px-4 border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
              <input
                type="date"
                value={row.ReconcileDate || ""}
                disabled={updatingRow === row.rowIndex}
                onChange={(e) => handleUpdateReconcileDate(row.rowIndex, e.target.value)}
                className="p-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </td>

            {/* Freeze Body Kanan: Aksi */}
            <td className="sticky right-0 z-10 py-3 px-4 text-center bg-white group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800/60 border-l border-slate-100 dark:border-slate-800 shadow-[-2px_0_4px_rgba(0,0,0,0.04)] whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => setSelectedItem(row)}
                  title="Lihat Detail"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => alert(`Edit Form Transaksi baris: ${row.rowIndex}`)}
                  title="Edit Transaksi"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                >
                  <Edit2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

          {/* ========================================================= */}
          {/* 2. TAMPILAN MOBILE (RINGKAS & CARD BASED)                 */}
          {/* ========================================================= */}
          <div className="block md:hidden space-y-3">
            {filteredData.map((row) => (
              <div
                key={row.rowIndex}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
              >
                {/* Header Card: Tanggal & Status */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 font-semibold">{row.Tanggal}</span>
                  {renderStatusBadge(row.Status)}
                </div>

                {/* Info Utama: Blok & Nominal */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {row.Blok || "UMUM"} - {row.Nama || "Non-Warga"}
                    </h3>
                    <p className="text-xs text-slate-500">{row.AccountName || row.Account || "-"}</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(row.Amount || 0)}
                  </span>
                </div>

                {/* Subinfo: Cara Bayar & Kategori */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span>Cara: <strong className="text-slate-700 dark:text-slate-300">{row.CaraBayar || "-"}</strong></span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                    {row.Category}
                  </span>
                </div>

                {/* Inline Reconcile & Aksi */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-bold text-slate-400">Recon:</span>
                    <input
                      type="date"
                      value={row.ReconcileDate || ""}
                      disabled={updatingRow === row.rowIndex}
                      onChange={(e) => handleUpdateReconcileDate(row.rowIndex, e.target.value)}
                      className="p-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedItem(row)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => alert(`Edit Transaksi ${row.rowIndex}`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    
{/* ========================================================= */}
{/* 3. MODAL DETAIL TRANSAKSI                                 */}
{/* ========================================================= */}
{selectedItem && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Detail Transaksi
          </h3>
          <p className="text-[11px] font-mono text-slate-400">
            {selectedItem.InvoiceNo || selectedItem.TransId || `Row #${selectedItem.rowIndex}`}
          </p>
        </div>
        <button
          onClick={() => setSelectedItem(null)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Modal Body (Scrollable) */}
      <div className="p-6 overflow-y-auto space-y-4 text-xs">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Unit / Blok</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {selectedItem.Blok || "UMUM"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Nama Warga</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {selectedItem.Nama || "-"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Tgl Transaksi</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {selectedItem.Tanggal || "-"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Status</span>
            <div className="mt-0.5">{renderStatusBadge(selectedItem.Status)}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Akun / Kategori</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {selectedItem.AccountName || selectedItem.Account || "-"}
            </span>
            <span className="block text-[10px] font-mono text-slate-400">
              Kategori: {selectedItem.Category}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Cara Bayar / Korwil</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {selectedItem.CaraBayar || "-"}
            </span>
            {selectedItem.Korwil && (
              <span className="block text-[10px] text-slate-400">
                Korwil: {selectedItem.Korwil}
              </span>
            )}
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Nominal:</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
              {formatRupiah(selectedItem.Amount || 0)}
            </span>
          </div>
        </div>

        {/* Keterangan & Payment Info */}
        {(selectedItem.Keterangan || selectedItem.PaymentInfo) && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Keterangan & Info
            </span>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300">
              {selectedItem.Keterangan && <p>{selectedItem.Keterangan}</p>}
              {selectedItem.PaymentInfo && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Info: {selectedItem.PaymentInfo}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PREVIEW LAMPIRAN / BUKTI PEMBAYARAN                      */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Bukti Transfer / Lampiran
            </span>
            {selectedItem.Lampiran &&
              selectedItem.Lampiran !== "-" &&
              selectedItem.Lampiran.trim() !== "" && (
                <a
                  href={selectedItem.Lampiran}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Buka Gambar Penuh ↗
                </a>
              )}
          </div>

          {selectedItem.Lampiran &&
          selectedItem.Lampiran !== "-" &&
          selectedItem.Lampiran.trim() !== "" ? (
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/5 dark:bg-black/20 p-2 flex items-center justify-center overflow-hidden group">
              {/* Gambar / Bukti Transfer (Mendukung base64 data URL maupun Link Google Drive/Web) */}
              <img
                src={selectedItem.Lampiran}
                alt="Bukti Transfer"
                className="max-h-64 w-auto object-contain rounded-xl shadow-sm transition group-hover:scale-[1.02]"
                onError={(e) => {
                  // Fallback jika URL berupa tautan file dokumen atau gambar rusak
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector(".fallback-link")) {
                    const link = document.createElement("a");
                    link.className =
                      "fallback-link text-xs text-emerald-600 font-bold underline p-4 block text-center";
                    link.href = selectedItem.Lampiran || "#";
                    link.target = "_blank";
                    link.innerText = "Tautan dokumen tersedia: Klik untuk membuka lampiran";
                    parent.appendChild(link);
                  }
                }}
              />
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-800/30">
              Tidak ada bukti transfer / lampiran yang dilampirkan.
            </div>
          )}
        </div>
      </div>

      {/* Modal Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-900/80 flex justify-end">
        <button
          onClick={() => setSelectedItem(null)}
          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}