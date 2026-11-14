"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Landmark,
  Wallet,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  TrendingUp,
  Info,
  X,
  Plus,
  PlaneLanding,
} from "lucide-react";
import InputIPLForm from "@/components/admin/InputIPLForm";
import InputPengeluaran from "@/components/admin/InputPengeluaran";

interface KeuanganItem {
  ID?: string;
  id?: string;
  Tanggal?: string;
  Blok?: string;
  Nama?: string;
  Category?: string;
  category?: string;
  Kategori?: string;
  Account?: string;
  account?: string;
  AccountName?: string;
  accountName?: string;
  accountname?: string;
  Keterangan?: string;
  keterangan?: string;
  PaymentInfo?: string;
  paymentInfo?: string;
  paymentinfo?: string;
  CaraBayar?: string;
  caraBayar?: string;
  carabayar?: string;
  Metode?: string;
  Nominal?: string | number;
  nominal?: string | number;
  Amount?: string | number;
  amount?: string | number;
  Status?: string;
  ReconcileDate?: string;
  reconcileDate?: string;
  reconcile_date?: string;
  tglReconcile?: string;
  TglReconcile?: string;
  [key: string]: any;
}

interface DailyBankRow {
  date: string; // YYYY-MM-DD
  opening: number;
  debit: number;
  credit: number;
  ending: number;
  txCount: number;
}

const BULAN_LIST = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

const formatTanggalID = (isoDate: string) => {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return dateObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Normalisasi string tanggal reconcile ke format YYYY-MM-DD
function normalizeDate(raw: any): string {
  if (!raw) return "";
  const str = String(raw).trim();
  if (
    !str ||
    str === "-" ||
    str.toLowerCase() === "null" ||
    str.toLowerCase() === "undefined"
  ) {
    return "";
  }

  // Format YYYY-MM-DD atau ISO string (2026-10-15T...)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // Format DD/MM/YYYY atau DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback Date parser
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
}

// Helper ekstraksi tanggal reconcile dari item
function getItemReconcileDate(item: KeuanganItem): string {
  return normalizeDate(
    item.ReconcileDate ??
      item.reconcileDate ??
      item.reconcile_date ??
      item.tglReconcile ??
      item.TglReconcile ??
      item["Reconcile Date"]
  );
}

// Helper pencocokan bank (Semua Bank / Bank BRI / IPLCash / Petty Cash)
function isBankMatch(item: KeuanganItem, selectedBank: string): boolean {
  const targetBankLower = selectedBank.trim().toLowerCase();
  const bankVal = String(
    item.CaraBayar ?? item.caraBayar ?? item.carabayar ?? item.Metode ?? ""
  )
    .trim()
    .toLowerCase();

  if (
    targetBankLower === "all" ||
    targetBankLower === "semua bank" ||
    targetBankLower === ""
  ) {
    return true;
  }

  // Bank BRI -> CaraBayar = "Transfer" / mengandung "bank" atau "bri"
  if (targetBankLower === "bank bri" || targetBankLower === "bank") {
    return (
      bankVal.includes("transfer") ||
      bankVal.includes("bank") ||
      bankVal.includes("bri")
    );
  }

  // IPLCash -> CaraBayar mengandung "iplcash" (atau "ipl cash")
  if (targetBankLower === "iplcash" || targetBankLower === "ipl cash") {
    return bankVal.includes("iplcash") || bankVal.includes("ipl cash");
  }

  // Petty Cash -> CaraBayar = "Kas" / "Tunai" / "Petty Cash"
  if (targetBankLower === "petty cash" || targetBankLower === "kas") {
    return (
      bankVal === "kas" ||
      bankVal.includes("petty") ||
      bankVal.includes("tunai")
    );
  }

  return false;
}

export default function BankbookBrowser() {
  const now = new Date();
  const [data, setData] = useState<KeuanganItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter Utama: Pilihan Bank, Bulan, dan Tahun
  const [selectedBank, setSelectedBank] = useState<string>("Bank BRI");
  const [selectedBulan, setSelectedBulan] = useState<string>(String(now.getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState<string>(String(now.getFullYear()));

  // State Modal Detail Transaksi (Key: selectedBank + selectedDetailDate)
  const [selectedDetailDate, setSelectedDetailDate] = useState<string | null>(null);

  // State Modal Form Jurnal "In" & "Out"
  const [activeJurnalModal, setActiveJurnalModal] = useState<"IN" | "OUT" | null>(null);

  // Ambil data transaksi menggunakan function getKeuanganList()
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance?action=getKeuanganList", {
        cache: "no-store",
      });
      const json = await res.json();

      if (json?.success && Array.isArray(json.data)) {
        setData(json.data);
      } else if (Array.isArray(json)) {
        setData(json);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Gagal memuat data buku bank dari getKeuanganList:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Daftar tahun dinamis dari data reconcile + tahun berjalan
  const availableYears = useMemo(() => {
    const years = new Set<string>([String(now.getFullYear()), "2025", "2026"]);
    data.forEach((item) => {
      const recDate = getItemReconcileDate(item);
      if (recDate) {
        years.add(recDate.split("-")[0]);
      }
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  // Hitung Mutasi Buku Bank per Tanggal Reconcile (Running Balance)
  const { periodRows, summary } = useMemo(() => {
    const targetYear = Number(selectedTahun);
    const targetMonth = Number(selectedBulan);

    const dailyMap = new Map<string, { debit: number; credit: number; count: number }>();

    data.forEach((item) => {
      // 1. Wajib memiliki Reconcile Date (jika kosong, tidak dihitung)
      const recDate = getItemReconcileDate(item);
      if (!recDate) return;

      // 2. Filter sesuai tab bank aktif (All / Bank BRI / IPLCash / Petty Cash)
      if (!isBankMatch(item, selectedBank)) return;

      // 3. Kelompokkan Debit (IPL & NON-IPL) vs Credit (OUT)
      const cat = String(item.Category ?? item.category ?? item.Kategori ?? "")
        .trim()
        .toUpperCase();
      const amount =
        Number(item.Nominal ?? item.nominal ?? item.Amount ?? item.amount ?? 0) || 0;

      if (!dailyMap.has(recDate)) {
        dailyMap.set(recDate, { debit: 0, credit: 0, count: 0 });
      }
      const entry = dailyMap.get(recDate)!;

      if (cat === "IPL" || cat === "NON-IPL" || cat === "NON IPL") {
        entry.debit += amount;
        entry.count += 1;
      } else if (cat === "OUT" || cat === "PENGELUARAN") {
        entry.credit += amount;
        entry.count += 1;
      }
    });

    // 4. Urutkan tanggal reconcile secara kronologis untuk menghitung Opening & Ending berjalan
    const sortedDates = Array.from(dailyMap.keys()).sort((a, b) => a.localeCompare(b));

    let runningBalance = 0;
    const allChronologicalRows: DailyBankRow[] = [];

    sortedDates.forEach((dateStr) => {
      const { debit, credit, count } = dailyMap.get(dateStr)!;
      const opening = runningBalance;
      const ending = opening + (debit - credit);

      allChronologicalRows.push({
        date: dateStr,
        opening,
        debit,
        credit,
        ending,
        txCount: count,
      });

      runningBalance = ending;
    });

    // 5. Filter baris sesuai periode Bulan & Tahun terpilih
    const filteredPeriodRows = allChronologicalRows.filter((row) => {
      const [y, m] = row.date.split("-").map(Number);
      return y === targetYear && m === targetMonth;
    });

    let periodOpening = 0;
    if (filteredPeriodRows.length > 0) {
      periodOpening = filteredPeriodRows[0].opening;
    } else {
      const targetStartKey = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
      const priorRows = allChronologicalRows.filter((r) => r.date < targetStartKey);
      if (priorRows.length > 0) {
        periodOpening = priorRows[priorRows.length - 1].ending;
      }
    }

    const totalDebit = filteredPeriodRows.reduce((acc, r) => acc + r.debit, 0);
    const totalCredit = filteredPeriodRows.reduce((acc, r) => acc + r.credit, 0);
    const periodEnding = periodOpening + (totalDebit - totalCredit);

    return {
      periodRows: filteredPeriodRows,
      summary: {
        opening: periodOpening,
        debit: totalDebit,
        credit: totalCredit,
        ending: periodEnding,
      },
    };
  }, [data, selectedBank, selectedBulan, selectedTahun]);

  // Detail transaksi per tanggal reconcile & bank untuk Modal Form
  const detailModalData = useMemo(() => {
    if (!selectedDetailDate) return { rows: [], totalDb: 0, totalCr: 0, netTotal: 0 };

    let totalDb = 0;
    let totalCr = 0;

    const rows = data
      .filter((item) => {
        const recDate = getItemReconcileDate(item);
        if (recDate !== selectedDetailDate) return false;
        return isBankMatch(item, selectedBank);
      })
      .map((item) => {
        const cat = String(item.Category ?? item.category ?? item.Kategori ?? "")
          .trim()
          .toUpperCase();
        const amount =
          Number(item.Nominal ?? item.nominal ?? item.Amount ?? item.amount ?? 0) || 0;

        const isDebit = cat === "IPL" || cat === "NON-IPL" || cat === "NON IPL";
        const isCredit = cat === "OUT" || cat === "PENGELUARAN";

        const db = isDebit ? amount : 0;
        const cr = isCredit ? amount : 0;
        const total = db - cr;

        totalDb += db;
        totalCr += cr;

        const catRaw = item.Category ?? item.category ?? item.Kategori ?? "-";
        const accRaw = item.Account ?? item.account ?? "";
        const categoryAccount = accRaw ? `${catRaw} / ${accRaw}` : String(catRaw);

        const accountName =
          item.AccountName ??
          item.accountName ??
          item.accountname ??
          (item.Blok ? `${item.Blok}${item.Nama ? ` - ${item.Nama}` : ""}` : item.Nama || "-");

        const ketRaw = item.Keterangan ?? item.keterangan ?? "";
        const payInfoRaw = item.PaymentInfo ?? item.paymentInfo ?? item.paymentinfo ?? "";
        const ketPayment = [ketRaw, payInfoRaw].filter(Boolean).join(" / ") || "-";

        return {
          raw: item,
          categoryAccount,
          accountName,
          ketPayment,
          db,
          cr,
          total,
        };
      });

    return {
      rows,
      totalDb,
      totalCr,
      netTotal: totalDb - totalCr,
    };
  }, [data, selectedBank, selectedDetailDate]);

  return (
    <div className="space-y-5">
      {/* ================= STICKY FILTER BAR ================= */}
      <div className="sticky top-0 z-20 rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Landmark size={18} />
              </span>
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white">
                  Buku Bank &amp; Kas
                </h1>
                <p className="text-xs text-slate-500">
                  Mutasi harian dikelompokkan berdasarkan <strong>Tanggal Reconcile</strong>
                </p>
              </div>
            </div>
          </div>

          {/* KONTROL FILTER: BANK, BULAN, TAHUN, REFRESH */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pilihan Bank */}
            <div className="flex flex-wrap rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBank("All")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedBank === "All"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                <PlaneLanding size={14} />
                <span>Semua Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBank("Bank BRI")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedBank === "Bank BRI"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                <Landmark size={14} />
                <span>Bank BRI</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBank("IPLCash")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedBank === "IPLCash"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                <Wallet size={14} />
                <span>IPL Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBank("Petty Cash")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedBank === "Petty Cash"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                <Wallet size={14} />
                <span>Petty Cash</span>
              </button>
            </div>

            {/* Filter Bulan */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
              <Calendar size={14} className="text-slate-400" />
              <select
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none dark:text-slate-100"
              >
                {BULAN_LIST.map((b) => (
                  <option key={b.value} value={b.value} className="dark:bg-slate-900">
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tahun */}
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="dark:bg-slate-900">
                  {yr}
                </option>
              ))}
            </select>

            {/* Tombol Refresh */}
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              title="Muat ulang data"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ================= RINGKASAN PERIODE ================= */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-400">Opening Periode</span>
            <p className="mt-1 text-sm sm:text-base font-black text-slate-800 dark:text-white">
              {formatRupiah(summary.opening)}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft size={13} />
              <span>Total Debit (IPL &amp; Non-IPL)</span>
            </div>
            <p className="mt-1 text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300">
              {formatRupiah(summary.debit)}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <ArrowUpRight size={13} />
              <span>Total Credit (OUT)</span>
            </div>
            <p className="mt-1 text-sm sm:text-base font-black text-rose-700 dark:text-rose-300">
              {formatRupiah(summary.credit)}
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5 dark:border-sky-900/40 dark:bg-sky-950/20">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <TrendingUp size={13} />
              <span>Ending Saldo</span>
            </div>
            <p className="mt-1 text-sm sm:text-base font-black text-sky-700 dark:text-sky-300">
              {formatRupiah(summary.ending)}
            </p>
          </div>
        </div>
      </div>

      {/* ================= TABEL BUKU BANK HARIAN (STICKY HEADER & SCROLL) ================= */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-[11px] uppercase tracking-wider text-slate-500 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/95 dark:text-slate-400">
              <tr>
                <th className="px-4 sm:px-5 py-3.5 font-bold">Tanggal</th>
                <th className="px-4 py-3.5 font-bold text-right">Opening</th>
                <th className="px-4 py-3.5 font-bold text-right text-emerald-600">Debit</th>
                <th className="px-4 py-3.5 font-bold text-right text-rose-600">Credit</th>
                <th className="px-4 sm:px-5 py-3.5 font-bold text-right">Ending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-emerald-600" />
                    Menghitung mutasi buku bank...
                  </td>
                </tr>
              ) : periodRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    Tidak ada transaksi ter-reconcile pada{" "}
                    <strong className="text-slate-600 dark:text-slate-300">
                      {selectedBank === "All" ? "Semua Bank" : selectedBank}
                    </strong>{" "}
                    untuk periode ini.
                  </td>
                </tr>
              ) : (
                periodRows.map((row) => (
                  <tr
                    key={row.date}
                    onClick={() => setSelectedDetailDate(row.date)}
                    title="Klik untuk melihat detail transaksi tanggal ini"
                    className="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-slate-900 underline decoration-emerald-500/40 underline-offset-2 dark:text-white">
                        {formatTanggalID(row.date)}
                      </p>
                      <span className="text-[10px] text-slate-400">{row.txCount} transaksi</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatRupiah(row.opening)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {row.debit > 0 ? `+ ${formatRupiah(row.debit)}` : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {row.credit > 0 ? `- ${formatRupiah(row.credit)}` : "-"}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {formatRupiah(row.ending)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && periodRows.length > 0 && (
              <tfoot className="sticky bottom-0 z-10 border-t-2 border-slate-200 bg-slate-50/95 text-xs font-black backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
                <tr>
                  <td className="px-4 sm:px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    Total Periode
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {formatRupiah(summary.opening)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatRupiah(summary.debit)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {formatRupiah(summary.credit)}
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 text-right font-mono text-sky-700 dark:text-sky-300 whitespace-nowrap">
                    {formatRupiah(summary.ending)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Catatan Aturan Perhitungan */}
      <div className="flex items-start gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
        <Info size={15} className="mt-0.5 shrink-0 text-emerald-600" />
        <p>
          Hanya transaksi yang memiliki <strong>Reconcile Date</strong> yang dihitung. Pilihan{" "}
          <strong>Bank BRI</strong> mengambil <code>CaraBayar = Transfer</code>,{" "}
          <strong>IPL Cash</strong> mengambil <code>CaraBayar = IPLCash</code>, dan{" "}
          <strong>Petty Cash</strong> mengambil <code>CaraBayar = Kas</code>.
        </p>
      </div>

      {/* ================= MODAL DETAIL TRANSAKSI PER TANGGAL RECONCILE & BANK ================= */}
      {selectedDetailDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header Modal: Tanggal Reconcile, Bank, & Tombol Jurnal In / Out */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                  {selectedBank === "Bank BRI" || selectedBank === "All" ? (
                    <Landmark size={18} />
                  ) : (
                    <Wallet size={18} />
                  )}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Detail Mutasi :
                    </h3>
                    <span className="rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      {selectedBank === "All" ? "Semua Bank" : selectedBank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tanggal Reconcile:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formatTanggalID(selectedDetailDate)}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveJurnalModal("IN")}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  <Plus size={14} />
                  <span>In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJurnalModal("OUT")}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                >
                  <Plus size={14} />
                  <span>Out</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDetailDate(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Detail Grid: Category/Account, AccountName, Keterangan/PaymentInfo, Amount (Db, Cr, Total) */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-bold">Category / Account</th>
                    <th className="px-4 py-3 font-bold">Account Name</th>
                    <th className="px-4 py-3 font-bold">Keterangan / Payment Info</th>
                    <th className="px-4 py-3 font-bold text-right text-emerald-600">Debit</th>
                    <th className="px-4 py-3 font-bold text-right text-rose-600">Credit</th>
                    <th className="px-4 py-3 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {detailModalData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada detail transaksi pada tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    detailModalData.rows.map((item, idx) => (
                      <tr
                        key={item.raw.ID || item.raw.id || idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-3 align-top font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {item.categoryAccount}
                        </td>
                        <td className="px-4 py-3 align-top font-semibold text-slate-700 dark:text-slate-300">
                          {item.accountName}
                        </td>
                        <td className="px-4 py-3 align-top text-slate-500 dark:text-slate-400">
                          {item.ketPayment}
                        </td>
                        <td className="px-4 py-3 align-top text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatRupiah(item.db)}
                        </td>
                        <td className="px-4 py-3 align-top text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {formatRupiah(item.cr)}
                        </td>
                        <td
                          className={`px-4 py-3 align-top text-right font-mono font-black whitespace-nowrap ${
                            item.total >= 0
                              ? "text-slate-900 dark:text-white"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatRupiah(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {detailModalData.rows.length > 0 && (
                  <tfoot className="sticky bottom-0 z-10 border-t-2 border-slate-200 bg-slate-50 text-xs font-black dark:border-slate-700 dark:bg-slate-800">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        Total ({detailModalData.rows.length} transaksi)
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatRupiah(detailModalData.totalDb)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {formatRupiah(detailModalData.totalCr)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-300 whitespace-nowrap">
                        {formatRupiah(detailModalData.netTotal)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end border-t border-slate-100 px-5 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDetailDate(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FORM JURNAL IN (InputIPLForm) & OUT (InputPengeluaran) ================= */}
      {activeJurnalModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${
                    activeJurnalModal === "IN" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                >
                  {activeJurnalModal === "IN" ? (
                    <ArrowDownLeft size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {activeJurnalModal === "IN"
                      ? "Tambah Jurnal Pemasukan (IPL & Non-IPL)"
                      : "Tambah Jurnal Pengeluaran (OUT)"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Data buku bank akan diperbarui otomatis setelah form ditutup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveJurnalModal(null);
                  fetchData();
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeJurnalModal === "IN" ? <InputIPLForm /> : <InputPengeluaran />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}