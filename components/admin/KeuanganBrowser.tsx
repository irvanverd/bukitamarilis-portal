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

const getDirectDriveImageUrl = (url?: string): string => {
  if (!url) return "";
  const cleanUrl = url.trim();
  if (!cleanUrl || cleanUrl === "-") return "";

  // Jika sudah berupa base64 data:image, kembalikan langsung
  if (cleanUrl.startsWith("data:image")) return cleanUrl;

  // Ekstrak FILE_ID dari berbagai format link Google Drive:
  // 1. https://drive.google.com/file/d/FILE_ID/view...
  // 2. https://drive.google.com/open?id=FILE_ID
  // 3. https://drive.google.com/uc?id=FILE_ID
  const fileIdMatch =
    cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    // Endpoint thumbnail sz=w1000 menghasilkan stream gambar langsung tanpa diblokir CORS/iframe
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
  }

  return cleanUrl;
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

interface KeuanganBrowserProps {
  forcedKorwil?: string;
  allowedTabMode?: "ALL" | "IN_ONLY" | "OUT_ONLY";
  userRole?: string; // Opsional jika dikirim dari portal-admin/page.tsx

}

export default function KeuanganBrowser({
  forcedKorwil,
  allowedTabMode = "ALL",
  userRole, // <-- Tambahkan parameter ini di sini
}: KeuanganBrowserProps) {
  const [data, setData] = useState<KeuanganItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"IN" | "OUT">(
    allowedTabMode === "OUT_ONLY" ? "OUT" : "IN"
  );

  const [sessionRole, setSessionRole] = useState<string>(userRole || "");

  useEffect(() => {
    if (userRole) {
      setSessionRole(userRole);
      return;
    }
    try {
      const raw = localStorage.getItem("admin_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSessionRole(String(parsed?.role || ""));
      }
    } catch (e) {
      console.error("Gagal membaca role dari session:", e);
    }
  }, [userRole]);

  // Hanya role ADMIN atau BEND-IN yang diizinkan melakukan reconcile
  const canReconcile = useMemo(() => {
    const r = (sessionRole || "").trim().toUpperCase();
    return r === "ADMIN" || r === "BEND-IN";
  }, [sessionRole]);
  
  
  // Set default filterKorwil jika forcedKorwil dikirimkan
  
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
  const [filterKorwil, setFilterKorwil] = useState<string>(forcedKorwil || "");
  const [filterCaraBayar, setFilterCaraBayar] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAccountName, setFilterAccountName] = useState("");

  // Modal Detail & Inline Editing States
  const [selectedItem, setSelectedItem] = useState<KeuanganItem | null>(null);
  const [updatingRow, setUpdatingRow] = useState<number | null>(null);
  const [cancelingRow, setCancelingRow] = useState<boolean>(false);


// 1. Fetch Data dari API Next.js / Apps Script berdasarkan filter periode aktif
const fetchData = async (bulanParam?: string, tahunParam?: string) => {
  try {
    setLoading(true);
    const params = new URLSearchParams({
      action: "getKeuanganList",
    });

    // Kirim parameter bulan (konversi "01" -> "1", kosongkan jika "Semua Bulan")
    if (bulanParam) {
      params.set("bulan", String(parseInt(bulanParam, 10)));
    }
    // Kirim parameter tahun (kosongkan jika "Semua Tahun")
    if (tahunParam) {
      params.set("tahun", tahunParam);
    }

    const res = await fetch(`/api/finance?${params.toString()}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setData(json.data);
    } else {
      setData([]);
    }
  } catch (err) {
    console.error("Gagal memuat list keuangan:", err);
    setData([]);
  } finally {
    setLoading(false);
  }
};

// Otomatis panggil API saat pertama kali dibuka (default bulan & tahun berjalan)
// dan setiap kali dropdown Periode Bulan atau Periode Tahun diubah
useEffect(() => {
  fetchData(filterBulan, filterTahun);
}, [filterBulan, filterTahun]);



  useEffect(() => {
    if (forcedKorwil) {
      setFilterKorwil(forcedKorwil);
    }
  }, [forcedKorwil]);

  useEffect(() => {
    if (allowedTabMode === "IN_ONLY") {
      setActiveTab("IN");
    } else if (allowedTabMode === "OUT_ONLY") {
      setActiveTab("OUT");
    }
  }, [allowedTabMode]);


  const filteredData = useMemo(() => {
    // Tentukan tab efektif yang aktif
    const effectiveTab =
      allowedTabMode === "IN_ONLY"
        ? "IN"
        : allowedTabMode === "OUT_ONLY"
        ? "OUT"
        : activeTab;

    // Tentukan korwil efektif (prioritaskan forcedKorwil jika ada)
    const effectiveKorwil = (forcedKorwil || filterKorwil || "").trim().toLowerCase();

    return data
      .filter((item) => {
        // 1. FILTER KATEGORI (PEMASUKAN vs PENGELUARAN)
        const cat = (item.Category || item.Kategori || "").trim().toUpperCase();
        const isOut = cat === "OUT" || cat === "PENGELUARAN" || cat === "KELUAR";

        if (effectiveTab === "IN" && isOut) return false;
        if (effectiveTab === "OUT" && !isOut) return false;

        // 2. FILTER KORWIL (Hanya diterapkan jika effectiveKorwil terisi)
        if (effectiveKorwil) {
          const itemKorwil = (item.Korwil || "").trim().toLowerCase();
          // Jika data tidak punya korwil (misal transaksi kas umum), tolak saat filter korwil aktif
          if (!itemKorwil) return false;

          const isKorwilMatch =
            itemKorwil === effectiveKorwil ||
            itemKorwil.includes(effectiveKorwil) ||
            effectiveKorwil.includes(itemKorwil);

          if (!isKorwilMatch) return false;
        }

        // 3. FILTER BULAN & TAHUN (Sesuaikan nama properti tanggal/bulan di data Anda)
        if (filterBulan) {
          // Cek dari kolom Bulan atau ekstrak dari Tanggal (YYYY-MM-DD)
          const itemBulan = item.Bulan
            ? String(parseInt(String(item.Bulan), 10))
            : item.Tanggal
            ? String(parseInt(String(item.Tanggal).split("-")[1] || "0", 10))
            : "";
          if (itemBulan && itemBulan !== String(parseInt(filterBulan, 10))) {
            return false;
          }
        }

        if (filterTahun) {
          const itemTahun = item.Tahun
            ? String(item.Tahun).trim()
            : item.Tanggal
            ? String(item.Tanggal).split("-")[0]
            : "";
          if (itemTahun && itemTahun !== String(filterTahun).trim()) {
            return false;
          }
        }

        // 4. FILTER METODE BAYAR / AKUN / STATUS (Jika ada di state Anda)
        if (filterCaraBayar) {
          const metode = (item.CaraBayar || item.Metode || "").trim().toLowerCase();
          if (metode !== filterCaraBayar.trim().toLowerCase()) return false;
        }

        if (filterStatus) {
          const st = (item.Status || "").trim().toLowerCase();
          if (st !== filterStatus.trim().toLowerCase()) return false;
        }

        // 5. FILTER PENCARIAN TEKS (Blok, Nama, Keterangan)
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const blok = (item.Blok || item.BlokID || "").toLowerCase();
          const nama = (item.Nama || item.NamaWarga || "").toLowerCase();
          const ket = (item.Keterangan || item.Uraian || "").toLowerCase();

          if (!blok.includes(q) && !nama.includes(q) && !ket.includes(q)) {
            return false;
          }
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
    allowedTabMode,
    forcedKorwil,
    filterKorwil,
    filterBulan,
    filterTahun,
    filterCaraBayar,
    filterStatus,
    searchQuery,
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
    const currentYear = new Date().getFullYear();
    const yearSet = new Set<string>([
      String(currentYear),
      String(currentYear - 1),
      "2025",
      "2026",
    ]);

    data.forEach((d) => {
      if (d.Tanggal) {
        const y = d.Tanggal.split("T")[0].split("-")[0];
        if (y && y.length === 4) yearSet.add(y);
      }
    });

    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  // 3. Inline Edit & Modal Edit: Update Reconcile Date (Khusus ADMIN & BEND-IN)
  const handleUpdateReconcileDate = async (rowIndex: number, newDate: string) => {
    if (!canReconcile) {
      alert("Akses ditolak: Hanya ADMIN atau BEND-IN yang dapat mengubah Reconcile Date.");
      return;
    }

    try {
      setUpdatingRow(rowIndex);
      // Auto-set status ke "C" (Reconciled) jika tanggal diisi, atau balik ke "R" jika dikosongkan
      const newStatus = newDate ? "C" : "R";

      const res = await fetch("/api/ipl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateReconcileDate",
          rowIndex,
          reconcileDate: newDate,
          status: newStatus,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        // Update daftar tabel utama
        setData((prev) =>
          prev.map((row) =>
            row.rowIndex === rowIndex
              ? { ...row, ReconcileDate: newDate, Status: newStatus }
              : row
          )
        );

        // Update juga state modal detail jika sedang terbuka untuk baris ini
        setSelectedItem((prev) =>
          prev && prev.rowIndex === rowIndex
            ? { ...prev, ReconcileDate: newDate, Status: newStatus }
            : prev
        );
      } else {
        alert("Gagal update rekonsiliasi: " + resJson.message);
      }
    } catch (err: any) {
      alert("Error update reconcile: " + err.message);
    } finally {
      setUpdatingRow(null);
    }
  };
  // 4. Cancel Transaksi -> Ubah Status menjadi "X" (hanya jika Status !== "C")
  const handleCancelTransaction = async (item: KeuanganItem) => {
    const currentStatus = (item.Status || "").trim().toUpperCase();
    if (currentStatus === "C") {
      alert("Transaksi berstatus Reconcile (C) tidak dapat dibatalkan.");
      return;
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan transaksi ini?`
    );
    if (!confirmed) return;

    try {
      setCancelingRow(true);
      const res = await fetch("/api/ipl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:"cancelKeuanganItem",
          rowIndex: item.rowIndex,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        setData((prev) =>
          prev.map((row) =>
            row.rowIndex === item.rowIndex ? { ...row, Status: "X" } : row
          )
        );
        setSelectedItem(null);
      } else {
        alert("Gagal membatalkan transaksi: " + (resJson.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error saat membatalkan transaksi: " + err.message);
    } finally {
      setCancelingRow(false);
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

        {/* TAB BUTTONS DI STICKY HEADER */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {allowedTabMode !== "OUT_ONLY" && (
          <button
            onClick={() => setActiveTab("IN")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "IN"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <ArrowDownLeft size={15} />
            <span>Pemasukan</span>
          </button>
        )}

        {allowedTabMode !== "IN_ONLY" && (
          <button
            onClick={() => setActiveTab("OUT")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "OUT"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <ArrowUpRight size={15} />
            <span>Pengeluaran</span>
          </button>
        )}
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

 {/* Filter Korwil: Tampilkan badge terkunci jika forcedKorwil aktif, atau dropdown jika bebas */}
 <div>
          <label className="text-[10px] text-slate-400 font-bold block mb-1">Korwil</label>
          {forcedKorwil ? (
            <div className="w-full p-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-sky-700 dark:text-sky-300 font-bold truncate">
              {forcedKorwil} (Terkunci)
            </div>
          ) : (
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
          )}
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
      <option value="C">Reconcile</option>
      <option value="O">Open</option>
      <option value="R">Release</option>
      <option value="X">Cancel</option>
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
        setFilterKorwil(forcedKorwil || "");
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
                  onClick={() => setSelectedItem(row)}
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

          {/* 2. TAMPILAN MOBILE (TABEL RINGKAS 4 KOLOM TANPA INLINE RECONCILE) */}
<div className="block md:hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
  <div className="overflow-x-auto">
    <table className="w-full text-left text-[11px]">
      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
        <tr>
          <th className="px-2.5 py-2.5 font-bold">Tanggal</th>
          <th className="px-2 py-2.5 font-bold">Unit / Nama</th>
          <th className="px-2 py-2.5 font-bold">Category / Status</th>
          <th className="px-2.5 py-2.5 font-bold text-right">Cara Bayar / Nominal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredData.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-3 py-8 text-center text-slate-400">
              Tidak ada data transaksi yang sesuai filter.
            </td>
          </tr>
        ) : (
          filteredData.map((item, idx) => {
            const catUpper = (item.Category || item.Kategori || "").trim().toUpperCase();
            const isOut = catUpper === "OUT" || catUpper === "PENGELUARAN" || catUpper === "KELUAR";
            const statusText = (item.Status || "-").trim();
            const isVerified =
              statusText.toLowerCase().includes("verif") ||
              statusText.toLowerCase().includes("reconcil") ||
              statusText.toLowerCase().includes("lunas") ||
              statusText.toLowerCase().includes("valid");

            return (
              <tr
                key={item.ID || item.id || idx}
                onClick={() => setSelectedItem(item)}
                className="active:bg-slate-50 dark:active:bg-slate-800/60"
              >
                {/* Kolom 1: Tanggal */}
                <td className="px-2.5 py-3 align-top whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                  {item.Tanggal || "-"}
                </td>

                {/* Kolom 2: Unit / Nama */}
                <td className="px-2.5 py-3 align-top">
                  {item.Blok || item.BlokID ? (
                    <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {item.Blok || item.BlokID}
                    </span>
                  ) : null}
                  <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
                    {item.Nama || item.NamaWarga || item.Keterangan || "-"}
                  </p>
                </td>

                {/* Kolom 3: Category / Status (Read-only Badge, tanpa inline edit reconcile) */}
                <td className="px-2.5 py-3 align-top">
                  <p className="font-bold text-slate-700 dark:text-slate-200 leading-tight">
                    {item.Category || item.Kategori || (isOut ? "Pengeluaran" : "IPL")}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      isVerified
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {statusText}
                  </span>
                </td>

                {/* Kolom 4: Cara Bayar / Nominal */}
                <td className="px-2.5 py-3 align-top text-right whitespace-nowrap">
                  <p className="text-[10px] text-slate-400">
                    {item.CaraBayar || item.Metode || "-"}
                  </p>
                  <p
                    className={`mt-0.5 font-extrabold ${
                      isOut
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(Number(item.Nominal || item.Amount || 0))}
                  </p>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
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

            {/* Reconcile Date (Hanya dapat diakses oleh ADMIN atau BEND-IN) */}
          {canReconcile ? (
            <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold tracking-wider">
                  Tanggal rek.koran
                </span>
              </div>
              <div className="flex items-center gap-1.5">
              {selectedItem.ReconcileDate && (
                  <button
                    type="button"
                    disabled={updatingRow === selectedItem.rowIndex}
                    onClick={() => handleUpdateReconcileDate(selectedItem.rowIndex, "")}
                    title="Kosongkan Reconcile Date"
                    className="px-2 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-700 dark:text-slate-300 text-[11px] font-bold transition disabled:opacity-50"
                  >
                    Reset
                  </button>
                )}
                <input
                  type="date"
                  value={selectedItem.ReconcileDate ? String(selectedItem.ReconcileDate).split("T")[0] : ""}
                  disabled={updatingRow === selectedItem.rowIndex}
                  onChange={(e) =>
                    handleUpdateReconcileDate(selectedItem.rowIndex, e.target.value)
                  }
                  className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              
              </div>
            </div>
          ) : (
            <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Reconcile Date</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {selectedItem.ReconcileDate || "-"}
              </span>
            </div>
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
      <img
        src={getDirectDriveImageUrl(selectedItem.Lampiran)}
        alt="Bukti Transfer"
        referrerPolicy="no-referrer"
        className="max-h-72 w-auto object-contain rounded-xl shadow-sm transition group-hover:scale-[1.02]"
        onError={(e) => {
          // Jika file di Google Drive berupa PDF atau format non-gambar, fallback ke preview iframe Drive
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          const fileIdMatch =
            selectedItem.Lampiran?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
            selectedItem.Lampiran?.match(/[?&]id=([a-zA-Z0-9_-]+)/);

          if (parent && fileIdMatch?.[1] && !parent.querySelector(".drive-iframe")) {
            const iframe = document.createElement("iframe");
            iframe.className = "drive-iframe w-full h-72 rounded-xl border-0";
            iframe.src = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
            parent.appendChild(iframe);
          } else if (parent && !parent.querySelector(".fallback-link")) {
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
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-2">
        {/* Tombol Cancel (ubah Status jadi "X") hanya tampil jika Status bukan "C" */}
        {(selectedItem.Status || "").trim().toUpperCase() !== "C" ? (
          <button
            type="button"
            onClick={() => handleCancelTransaction(selectedItem)}
            disabled={cancelingRow || (selectedItem.Status || "").trim().toUpperCase() === "X"}
            className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold disabled:opacity-50 transition"
          >
            {cancelingRow
              ? "Membatalkan..."
              : (selectedItem.Status || "").trim().toUpperCase() === "X"
              ? "Sudah Cancel (X)"
              : "Cancel"}
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={() => setSelectedItem(null)}
          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition ml-auto"
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