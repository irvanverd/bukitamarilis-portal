"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  getClientCache,
  saveClientCache,
} from "@/lib/client-cache";

import DashboardChart from "@/components/DashboardChart";

interface KeuanganDetail {
  header: string;
  group:string;
  account: string;
  keterangan: string;

  jan: string | number;
  feb: string | number;
  mar: string | number;
  apr: string | number;
  mei: string | number;
  jun: string | number;
  jul: string | number;
  agu: string | number;
  sep: string | number;
  okt: string | number;
  nov: string | number;
  des: string | number;

  [key: string]: any;
}

interface IplSummary {
  tahun: string | number;
  bulan: string;
  pemasukan: string | number;
  pengeluaran: string | number;
}

interface ChartIplData {
  label: string;
  bulan: string;
  tahun: string | number;
  pemasukan: number;
  pengeluaran: number;
}

export default function TransparansiTables() {
  const [activeTab, setActiveTab] = useState<"detail" | "summary">("detail");

  const [loading, setLoading] = useState(false);

  const [dataKeuangan, setDataKeuangan] = useState<KeuanganDetail[]>([]);
  const [dataIpl, setDataIpl] = useState<IplSummary[]>([]);
  const [dataKas, setDataKas] = useState<any[]>([]);

  const [selectedBulan, setSelectedBulan] = useState<string>("all");
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Posisi 3 bulan yang sedang ditampilkan di HP
  const [mobileStartMonth, setMobileStartMonth] = useState(0);

  const listPilihanBulan = [
    { id: "1", nama: "Januari", short: "Jan" },
    { id: "2", nama: "Februari", short: "Feb" },
    { id: "3", nama: "Maret", short: "Mar" },
    { id: "4", nama: "April", short: "Apr" },
    { id: "5", nama: "Mei", short: "Mei" },
    { id: "6", nama: "Juni", short: "Jun" },
    { id: "7", nama: "Juli", short: "Jul" },
    { id: "8", nama: "Agustus", short: "Agu" },
    { id: "9", nama: "September", short: "Sep" },
    { id: "10", nama: "Oktober", short: "Okt" },
    { id: "11", nama: "November", short: "Nov" },
    { id: "12", nama: "Desember", short: "Des" },
  ];

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  const formatRupiah = (nilai: any) => {
    const angka = Number(nilai ?? 0);

    if (angka === 0) return "-";

    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(angka);
  };

  // Format untuk Y Axis chart
  const formatChartAxis = (nilai: any) => {
    const angka = Number(nilai ?? 0);

    if (angka >= 1_000_000) {
      return `${(angka / 1_000_000).toFixed(1)} jt`;
    }

    if (angka >= 1_000) {
      return `${Math.round(angka / 1_000)} rb`;
    }

    return String(angka);
  };

  // =========================================================
  // EXPORT LPJ KE IMAGE
  // =========================================================

  const handleExportImage = async () => {
    if (!exportRef.current || dataKeuangan.length === 0) {
      return;
    }
  
    try {
      setExporting(true);
  
      const element = exportRef.current;
  
      // Tampilkan sementara
      element.style.position = "fixed";
      element.style.left = "0";
      element.style.top = "0";
      element.style.opacity = "1";
      element.style.pointerEvents = "none";
      element.style.zIndex = "99999";
  
      // Tunggu browser selesai render
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(null))
      );
  
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );
  
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
  
      const link = document.createElement("a");
  
      const periode =
        selectedBulan === "all"
          ? "Januari-Desember 2026"
          : selectedBulan;
  
      link.download = `LPJ-Keuangan-${periode}.png`;
      link.href = dataUrl;
      link.click();
  
      // Sembunyikan kembali
      element.style.opacity = "0";
      element.style.zIndex = "-1";
  
    } catch (error) {
      console.error("Gagal export LPJ:", error);
  
      alert(
        "Gagal membuat gambar LPJ. Silakan coba lagi."
      );
  
    } finally {
      setExporting(false);
    }
  };
  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    const fetchData = async () => {
      const CACHE_KEY = "finance-dashboard";
  
      // ==========================================
      // 1. LOAD CACHE TERLEBIH DAHULU
      // ==========================================
  
      const cached =
        getClientCache<any>("finance-dashboard");
  
      if (cached?.data) {
         const age =
    Date.now() - cached.timestamp;

  const ageMinutes =
    Math.floor(age / 60000);
        console.log(
          `Finance: menggunakan localStorage,  ${ageMinutes} menit`,
          new Date(cached.timestamp)
        );
  
        const dashboard = cached.data;
  
        setDataKeuangan(
          Array.isArray(dashboard.detail)
            ? dashboard.detail
            : []
        );
  
        setDataIpl(
          Array.isArray(dashboard.kas)
            ? dashboard.kas
            : []
        );
  
        setDataKas(
          Array.isArray(dashboard.kas)
            ? dashboard.kas
            : []
        );
      }
  
      // ==========================================
      // 2. REQUEST DATA TERBARU DI BACKGROUND
      // ==========================================
  
      setLoading(!cached?.data);
  
      try {
        const controller = new AbortController();
  
        const timeout = setTimeout(() => {
          controller.abort();
        }, 50000);
  
        const res = await fetch(
          "/api/finance?action=getFinanceDashboard",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
  
        clearTimeout(timeout);
  
        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status} ${res.statusText}`
          );
        }
  
        const json = await res.json();
  
        if (!json?.success) {
          throw new Error(
            json?.message ||
              "Gagal mengambil data finance"
          );
        }
  
        const dashboard = json?.data ?? {};
  
        // ==========================================
        // 3. UPDATE STATE
        // ==========================================
  
        setDataKeuangan(
          Array.isArray(dashboard.detail)
            ? dashboard.detail
            : []
        );
  
        setDataIpl(
          Array.isArray(dashboard.kas)
            ? dashboard.kas
            : []
        );
  
        setDataKas(
          Array.isArray(dashboard.kas)
            ? dashboard.kas
            : []
        );
  
        // ==========================================
        // 4. SIMPAN RESPONSE KE LOCALSTORAGE
        // ==========================================
  
        saveClientCache(
          CACHE_KEY,
          dashboard
        );
  
        console.log(
          "Finance: localStorage berhasil diperbarui"
        );
  
      } catch (error) {
        console.error(
          "Finance: gagal mengambil data terbaru:",
          error
        );
  
        // Jangan kosongkan state!
        // Data dari localStorage tetap ditampilkan.
  
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // =========================================================
  // MOBILE - 3 BULAN
  // =========================================================

  const mobileMonths = useMemo(() => {
    return listPilihanBulan.slice(
      mobileStartMonth,
      mobileStartMonth + 3
    );
  }, [mobileStartMonth]);

  const nextMobileMonths = () => {
    setMobileStartMonth((current) => {
      if (current >= 9) return 9;
      return current + 3;
    });
  };

  const prevMobileMonths = () => {
    setMobileStartMonth((current) => {
      if (current <= 0) return 0;
      return current - 3;
    });
  };

  // Jika memilih bulan tertentu, arahkan tampilan HP
  // ke kelompok bulan tersebut.
  useEffect(() => {
    if (selectedBulan === "all") {
      setMobileStartMonth(0);
      return;
    }

    const index = listPilihanBulan.findIndex(
      (bulan) => bulan.nama === selectedBulan
    );

    if (index >= 0) {
      const groupStart = Math.floor(index / 3) * 3;
      setMobileStartMonth(groupStart);
    }
  }, [selectedBulan]);

  // =========================================================
  // DATA BAR CHART IPL
  // =========================================================

  const chartIplData: ChartIplData[] = useMemo(() => {
    const monthOrder: Record<string, number> = {
      januari: 1,
      februari: 2,
      maret: 3,
      april: 4,
      mei: 5,
      juni: 6,
      juli: 7,
      agustus: 8,
      september: 9,
      oktober: 10,
      november: 11,
      desember: 12,
    };

    const sorted = [...dataIpl].sort((a, b) => {
      const yearA = Number(a.tahun);
      const yearB = Number(b.tahun);

      if (yearA !== yearB) {
        return yearA - yearB;
      }

      const monthA =
        monthOrder[String(a.bulan).trim().toLowerCase()] || 0;

      const monthB =
        monthOrder[String(b.bulan).trim().toLowerCase()] || 0;

      return monthA - monthB;
    });

    return sorted.map((item) => {
      const bulanLower = String(item.bulan)
        .trim()
        .toLowerCase();

      const bulanInfo = listPilihanBulan.find(
        (bulan) =>
          bulan.nama.toLowerCase() === bulanLower
      );

      return {
        label: `${bulanInfo?.short}`,
        bulan: item.bulan,
        tahun: item.tahun,
        pemasukan: Number(item.pemasukan) || 0,
        pengeluaran: Number(item.pengeluaran) || 0,
      };
    });
  }, [dataIpl]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mt-8 md:mt-12 w-full max-w-full">
      {/* =====================================================
          TAB
      ===================================================== */}

      {dataKas.length > 0 && (
      <div className="bg-white p-4 rounded-2xl border shadow-sm mb-5">
        <DashboardChart data={dataKas} />
      </div>
    )}

      <div className="flex border-b border-slate-200 mb-5 bg-white rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab("detail")}
          className={`
            flex-1
            py-3 md:py-4
            px-2
            text-center
            font-bold
            text-xs md:text-sm
            border-b-2
            transition
            leading-tight
            ${
              activeTab === "detail"
                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }
          `}
        >
          📋 <span className="hidden sm:inline"></span>
          LPJ
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`
            flex-1
            py-3 md:py-4
            px-2
            text-center
            font-bold
            text-xs md:text-sm
            border-b-2
            transition
            leading-tight
            ${
              activeTab === "summary"
                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }
          `}
        >
          📊 Chart
        </button>
      </div>

      {/* =====================================================
          FILTER
      ===================================================== */}

      {activeTab === "detail" && !loading && (
        <div
          className="
            mb-5
            bg-white
            p-4
            rounded-xl
            border
            border-slate-200
            shadow-sm
          "
        >
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Filter Tampilan Data:
          </div>

          <div
  className="
    flex
    flex-col
    sm:flex-row
    sm:items-center
    gap-2
    w-full
  "
>
  <label
    htmlFor="bulan-select"
    className="
      text-xs
      text-slate-500
      font-medium
      sm:min-w-fit
    "
  >
    Pilih Bulan:
  </label>

  <select
    id="bulan-select"
    value={selectedBulan}
    onChange={(e) =>
      setSelectedBulan(e.target.value)
    }
    className="
      w-full
      sm:flex-1
      bg-slate-50
      border
      border-slate-300
      text-slate-700
      text-sm
      font-medium
      rounded-xl
      py-2.5
      px-3
      outline-none
      focus:border-blue-500
      focus:ring-1
      focus:ring-blue-500
      min-w-0
    "
  >
    <option value="all">
      🗓️ Semua Bulan (Jan-Des)
    </option>

    {listPilihanBulan.map((bulan) => (
      <option
        key={bulan.nama}
        value={bulan.nama}
      >
        {bulan.nama}
      </option>
    ))}
  </select>

  {/* EXPORT IMAGE */}
  <button
    type="button"
    onClick={handleExportImage}
    disabled={
      exporting ||
      dataKeuangan.length === 0
    }
    className="
      w-full
      sm:w-auto
      shrink-0
      inline-flex
      items-center
      justify-center
      gap-2
      px-4
      py-2.5
      rounded-xl
      bg-blue-600
      text-white
      text-sm
      font-semibold
      shadow-sm
      hover:bg-blue-700
      active:scale-[0.98]
      transition
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
  >
    {exporting ? (
      <>
        <span className="animate-spin">⏳</span>
        Membuat...
      </>
    ) : (
      <>
        🖼️
        Unduh LPJ
      </>
    )}
  </button>
</div>
          
        </div>
      )}

  {/* =====================================================
    AREA EXPORT IMAGE
===================================================== */}

<div
  ref={exportRef}
  style={{
    position: "fixed",
    left: "0",
    top: "0",
    width:
      selectedBulan === "all"
        ? "1600px"
        : "1100px",
    padding: "40px",
    backgroundColor: "#ffffff",
    opacity: 0,
    pointerEvents: "none",
    zIndex: -1,
  }}
>
  {/* HEADER */}
  <div className="mb-6">
    <div className="text-3xl font-bold text-slate-800">
      LAPORAN PERTANGGUNGJAWABAN (LPJ)
    </div>

    <div className="text-xl font-semibold text-slate-600 mt-1">
      Keuangan RT 07 RW 14 Bukit Amarilis
    </div>

    <div className="text-base text-slate-500 mt-3">
      Periode:{" "}
      <span className="font-semibold text-slate-700">
        {selectedBulan === "all"
          ? "Januari - Desember 2026 "
          : selectedBulan}
      </span>
    </div>
  </div>

  {/* TABLE EXPORT */}
  <table
    className="
      w-full
      border-collapse
      text-sm
    "
    style={{
      tableLayout: "fixed",
    }}
  >
    <thead>
      <tr>
        <th
          className="
            border
            border-slate-300
            bg-slate-100
            px-4
            py-3
            text-left
            font-bold
            text-slate-700
          "
          style={{
            width:
              selectedBulan === "all"
                ? "110px"
                : "140px",
          }}
        >
          Account
        </th>

        <th
          className="
            border
            border-slate-300
            bg-slate-100
            px-4
            py-3
            text-left
            font-bold
            text-slate-700
          "
          style={{
            width:
              selectedBulan === "all"
                ? "350px"
                : "400px",
          }}
        >
          Keterangan
        </th>

        {selectedBulan === "all" ? (
          listPilihanBulan.map((bulan) => (
            <th
              key={bulan.nama}
              className="
                border
                border-slate-300
                bg-slate-100
                px-3
                py-3
                text-center
                font-bold
                text-slate-700
              "
            >
              {bulan.nama.toUpperCase()}
            </th>
          ))
        ) : (
          <th
            className="
              border
              border-slate-300
              bg-blue-50
              px-3
              py-3
              text-center
              font-bold
              text-blue-800
            "
          >
            {selectedBulan.toUpperCase()}
          </th>
        )}
      </tr>
    </thead>

    <tbody>
      {dataKeuangan.map((item, idx) => (
        <tr key={idx}>
          <td
            className="
              border
              border-slate-300
              px-4
              py-3
              align-top
              text-slate-700
            "
          >
            <span
              className={
                item.header?.toString() === "T"
                  ? "font-bold"
                  : ""
              }
            >
              {item.account}
            </span>
          </td>

          <td
            className="
              border
              border-slate-300
              px-4
              py-3
              align-top
              text-slate-700
            "
          >
            <span
              className={
                item.header?.toString() === "T"
                  ? "font-bold"
                  : ""
              }
            >
              {item.keterangan}
            </span>
          </td>

          {selectedBulan === "all" ? (
            listPilihanBulan.map((bulan) => (
              <td
                key={bulan.nama}
                className="
                  border
                  border-slate-300
                  px-3
                  py-3
                  text-right
                  align-top
                  whitespace-nowrap
                  text-slate-700
                "
              >
                <span
                  className={
                    item.header?.toString() === "T"
                      ? "font-bold"
                      : ""
                  }
                >
                  {formatRupiah(
                    item[bulan.nama]
                  )}
                </span>
              </td>
            ))
          ) : (
            <td
              className="
                border
                border-slate-300
                px-3
                py-3
                text-right
                align-top
                whitespace-nowrap
                text-slate-700
                bg-blue-50/30
              "
            >
              <span
                className={
                  item.header?.toString() === "T"
                    ? "font-bold"
                    : ""
                }
              >
                {formatRupiah(
                  item[selectedBulan]
                )}
              </span>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>

  {/* FOOTER */}
  <div className="mt-6 text-sm text-slate-400">
    Portal Warga RT 07 RW 14 Bukit Amarilis
  </div>
</div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />

          <p className="text-xs text-slate-400 mt-2">
            Mengambil data keuangan...
          </p>
        </div>
      ) : (
        <div className="w-full">
          {/* =================================================
              TAB 1 - LPJ KEUANGAN
          ================================================= */}

          {activeTab === "detail" && (
            <>
              {/* ---------------------------------------------
                  MOBILE
                  Hanya 3 bulan sekaligus
              --------------------------------------------- */}

              <div className="md:hidden">
                {/* Navigasi 3 Bulan */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-2
                    bg-slate-50
                    border
                    border-slate-200
                    rounded-xl
                    p-2
                  "
                >
                  <button
                    type="button"
                    onClick={prevMobileMonths}
                    disabled={mobileStartMonth === 0}
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-white
                      border
                      border-slate-200
                      text-slate-700
                      font-bold
                      disabled:opacity-30
                      disabled:cursor-not-allowed
                    "
                  >
                    ‹
                  </button>

                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">
                      Tampilan Bulan
                    </div>

                    <div className="text-xs font-bold text-slate-700">
                      {mobileMonths[0]?.short} -{" "}
                      {mobileMonths[mobileMonths.length - 1]?.short}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextMobileMonths}
                    disabled={mobileStartMonth === 9}
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-white
                      border
                      border-slate-200
                      text-slate-700
                      font-bold
                      disabled:opacity-30
                      disabled:cursor-not-allowed
                    "
                  >
                    ›
                  </button>
                </div>

                {/* Tabel Mobile */}
                <div
                  className="
                    bg-white
                    rounded-xl
                    border
                    border-slate-200
                    shadow-sm
                    overflow-hidden
                    w-full
                  "
                >
                  <table className="w-full table-fixed text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th
                          className="
                          
                            px-2
                            py-3
                            text-[10px]
                            font-bold
                            text-slate-600
                            w-[15%]
                          "
                        >
                          Account
                        </th>

                        <th
                          className="
                            px-2
                            py-3
                            text-[10px]
                            font-bold
                            text-slate-600
                            w-[31%]
                          "
                        >
                          Keterangan
                        </th>

                        {mobileMonths.map((bulan) => (
                          <th
                            key={bulan.nama}
                            className="
                              px-1
                              py-3
                              text-[9px]
                              font-bold
                              text-slate-600
                              text-center
                              bg-slate-50
                              w-[28%]
                            "
                          >
                            {bulan.short.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {dataKeuangan.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="
                              p-6
                              text-center
                              text-xs
                              text-slate-400
                            "
                          >
                            Belum ada data detail.
                          </td>
                        </tr>
                      ) : (
                        dataKeuangan.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/80"
                          >
                            <td className="px-2 py-3 align-top">
                              <span
                                className={`
                                  inline-block
                                  px-1.5
                                  py-1
                                  rounded-full
                                  text-[9px]
                                  font-semibold
                                  break-words
                                  ${
                                    item.header?.toString() ===
                                    "T"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-rose-50 text-rose-700"
                                  }
                                `}
                              >
                                {item.account}
                              </span>
                            </td>

                            <td className="px-2 py-3 align-top">
                              <span
                                className={`
                                  text-[11px]
                                  leading-4
                                  break-words
                                  ${
                                    item.header?.toString() ===
                                    "T"
                                      ? "font-bold text-slate-700"
                                      : "text-slate-600"
                                  }
                                `}
                              >
                                {item.keterangan}
                              </span>
                            </td>

                            {mobileMonths.map((bulan) => (
                              <td
                                key={bulan.nama}
                                className="
                                  px-1
                                  py-3
                                  align-top
                                  text-right
                                  border-l
                                  border-slate-100
                                "
                              >
                                <span
                                  className={`
                                    text-[10px]
                                    leading-4
                                    break-all
                                    ${
                                      item.header?.toString() ===
                                      "T"
                                        ? "font-bold text-slate-700"
                                        : "text-slate-600"
                                    }
                                  `}
                                >
                                  {formatRupiah(
                                    item[bulan.nama]
                                  )}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ---------------------------------------------
                  DESKTOP
                  Tetap tampil 12 bulan
              --------------------------------------------- */}

              <div className="hidden md:block">
                <div
                  className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    overflow-hidden
                  "
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr
                          className="
                            bg-slate-100
                            border-b
                            border-slate-200
                            text-slate-700
                            text-sm
                            font-semibold
                          "
                        >
                          <th className="p-4">
                            Account
                          </th>

                          <th className="p-4">
                            Keterangan
                          </th>

                          {selectedBulan === "all" ? (
                            listPilihanBulan.map((bulan) => (
                              <th
                                key={bulan.nama}
                                className="
                                  p-3
                                  font-semibold
                                  text-slate-600
                                  bg-slate-50
                                  text-center
                                  whitespace-nowrap
                                "
                              >
                                {bulan.nama.toUpperCase()}
                              </th>
                            ))
                          ) : (
                            <th
                              className="
                                p-3
                                font-bold
                                text-blue-800
                                bg-blue-50/50
                                text-center
                              "
                            >
                              {selectedBulan.toUpperCase()}
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody
                        className="
                          divide-y
                          divide-slate-100
                          text-sm
                          text-slate-600
                        "
                      >
                        {dataKeuangan.length === 0 ? (
                          <tr>
                            <td
                              colSpan={
                                selectedBulan === "all"
                                  ? 14
                                  : 3
                              }
                              className="
                                p-6
                                text-center
                                text-slate-400
                              "
                            >
                              Belum ada data detail.
                            </td>
                          </tr>
                        ) : (
                          dataKeuangan.map((item, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50/80"
                            >
                              <td className="p-4 align-top">
                                <span
                                  className={`
                                    px-2.5
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-semibold
                                    ${
                                      item.header?.toString() ===
                                      "T"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                    }
                                  `}
                                >
                                  {item.account}
                                </span>
                              </td>

                              <td className="p-4 align-top">
                                <span
                                  className={`
                                    ${
                                      item.header?.toString() ===
                                      "T"
                                        ? "font-bold"
                                        : ""
                                    }
                                  `}
                                >
                                  {item.keterangan}
                                </span>
                              </td>

                              {selectedBulan === "all" ? (
                                listPilihanBulan.map(
                                  (bulan) => (
                                    <td
                                      key={bulan.nama}
                                      className="
                                        p-3
                                        border-r
                                        border-slate-50
                                        text-right
                                        whitespace-nowrap
                                      "
                                    >
                                      <span
                                        className={`
                                          text-xs
                                          ${
                                            item.header?.toString() ===
                                            "T"
                                              ? "font-bold text-slate-700"
                                              : "text-slate-600"
                                          }
                                        `}
                                      >
                                        {formatRupiah(
                                          item[bulan.nama]
                                        )}
                                      </span>
                                    </td>
                                  )
                                )
                              ) : (
                                <td
                                  className="
                                    p-3
                                    bg-blue-50/20
                                    text-slate-900
                                    text-sm
                                    text-right
                                  "
                                >
                                  {formatRupiah(
                                    item[selectedBulan]
                                  )}
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =================================================
              TAB 2 - REKAP PEMASUKAN IPL
          ================================================= */}

          {activeTab === "summary" && (
            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                p-3
                sm:p-5
              "
            >
              <div className="mb-4">
               
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Grafik pemasukan vs pengeluaran berdasarkan bulan.
                </p>
              </div>

              {chartIplData.length === 0 ? (
                <div
                  className="
                    h-[280px]
                    flex
                    items-center
                    justify-center
                    text-sm
                    text-slate-400
                  "
                >
                  Belum ada data.
                </div>
              ) : (
                <div className="w-full h-[300px] sm:h-[360px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={chartIplData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 35,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="label"
                        tick={{
                          fontSize: 10,
                        }}
                        interval={0}
                        angle={
                          chartIplData.length > 8
                            ? -35
                            : 0
                        }
                        textAnchor={
                          chartIplData.length > 8
                            ? "end"
                            : "middle"
                        }
                        height={
                          chartIplData.length > 8
                            ? 65
                            : 35
                        }
                      />

                      <YAxis
                        tick={{
                          fontSize: 10,
                        }}
                        tickFormatter={formatChartAxis}
                        width={45}
                      />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `Rp ${formatRupiah(value)}`,
                        name === "Pemasukan" ? "Pemasukan" : "Pengeluaran"
                      ]}
                        
                        labelFormatter={(label) =>
                          `Bulan: ${label}`
                        }
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                     

                      <Bar
                        dataKey="pemasukan"
                        name="Pemasukan"
                        fill="#3b82f6"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                        maxBarSize={55}
                      />
                      
                        
                      <Bar
                        dataKey="pengeluaran"
                        name="Pengeluaran"
                        fill="#ef4444"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                        maxBarSize={55}
                      />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Ringkasan total */}
              {chartIplData.length > 0 && (
                <div
                  className="
                    mt-4
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-3
                  "
                >
                  <div
                    className="
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      p-3
                    "
                  >
                    <div className="text-[11px] text-slate-500">
                      Jumlah Periode
                    </div>

                    <div className="text-lg font-bold text-slate-700">
                      {chartIplData.length} Bulan
                    </div>
                  </div>

                  <div
                    className="
                      rounded-xl
                      bg-blue-50
                      border
                      border-blue-100
                      p-3
                    "
                  >
                    <div className="text-[11px] text-slate-500">
                      Total Pemasukan
                    </div>

                    <div className="text-lg font-bold text-blue-700">
                      Rp{" "}
                      {formatRupiah(
                        chartIplData.reduce(
                          (total, item) =>
                            total + item.pemasukan,
                          0
                        )
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Total Pengeluaran
                    </div>

                    <div className="text-lg font-bold text-red-700">
                      Rp{" "}
                      {formatRupiah(
                        chartIplData.reduce(
                          (total, item) =>
                            total + item.pengeluaran,
                          0
                        )
                      )}
                    </div>    

                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}