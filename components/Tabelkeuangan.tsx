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
  group: string;
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

  // Filter Bulan Tabel LPJ
  const [selectedBulan, setSelectedBulan] = useState<string>("all");

  // Filter Bulan Khusus Top 5 Charts (Default ke bulan berjalan / Februari)
  const [filterBulanTop, setFilterBulanTop] = useState<string>("Februari");

  // Filter kategori pengeluaran: "SEMUA" | "RUTIN" | "NON_RUTIN"
const [filterTipePengeluaran, setFilterTipePengeluaran] = useState<"SEMUA" | "RUTIN" | "NON_RUTIN">("SEMUA");


  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Posisi 3 bulan di mobile
  const [mobileStartMonth, setMobileStartMonth] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // State untuk AI Analytic
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Muat cache analisis AI otomatis setiap kali filterBulanTop berganti
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cacheKey = `finance-ai-cache-${filterBulanTop}`;
    const saved = localStorage.getItem(cacheKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAiAnalysis(parsed.analysis || "");
      } catch {
        setAiAnalysis(saved);
      }
    } else {
      setAiAnalysis(""); // Kosongkan jika bulan baru belum pernah di-generate
    }
  }, [filterBulanTop]);

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

  const groupedData = useMemo(() => {
    const groups = new Map<string, KeuanganDetail[]>();

    dataKeuangan.forEach((item) => {
      const groupName = String(item.group ?? "Lainnya").trim() || "Lainnya";
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(item);
    });

    return Array.from(groups, ([name, items]) => ({
      name,
      items,
    }));
  }, [dataKeuangan]);

  // =========================================================
  // FORMAT RUPIAH & CHART
  // =========================================================

  const formatRupiah = (nilai: any) => {
    const angka = Number(nilai ?? 0);
    if (angka === 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const formatChartAxis = (nilai: any) => {
    const angka = Number(nilai ?? 0);
    if (angka >= 1_000_000) return `${(angka / 1_000_000).toFixed(1)} jt`;
    if (angka >= 1_000) return `${Math.round(angka / 1_000)} rb`;
    return String(angka);
  };

  // =========================================================
  // TOP 5 PER-BULAN (BERDASARKAN filterBulanTop)
  // =========================================================
  const topPengeluaran = useMemo(() => {
    const items = dataKeuangan.filter((item) => {
      // 1. Ambil nilai header & group secara aman dan jadikan uppercase
      const headerStr = String(item.header ?? "").trim().toUpperCase();
      const groupStr = String(item.group ?? "").trim().toUpperCase();

      // 2. Pastikan hanya data detail transaksi (header "D", hindari "H" = Header dan "T" = Total/Subtotal)
      const isDetailRow = headerStr === "D" || (headerStr !== "H" && headerStr !== "T");
      if (!isDetailRow) return false;

      // 3. Filter presisi berdasarkan nilai field "group"
      if (filterTipePengeluaran === "RUTIN") {
        // Cocokkan "PENGELUARAN RUTIN", pastikan tidak mengandung kata TIDAK atau NON
        return groupStr.includes("RUTIN") && !groupStr.includes("TIDAK") && !groupStr.includes("NON");
      }

      if (filterTipePengeluaran === "NON_RUTIN") {
        // Cocokkan "PENGELUARAN TIDAK RUTIN" atau "PENGELUARAN NON RUTIN"
        return (
          groupStr.includes("TIDAK RUTIN") ||
          groupStr.includes("NON RUTIN") ||
          groupStr.includes("NON-RUTIN")
        );
      }

      // Jika "SEMUA": ambil kedua grup pengeluaran
      return groupStr.includes("PENGELUARAN") || groupStr.includes("BIAYA") || groupStr.includes("BEBAN");
    });

    // 4. Hitung nominal bulan yang dipilih, sort descending dan ambil top 5
    return items
      .map((item) => {
        // Ambil nominal sesuai bulan yang dipilih pada dropdown (misal: item["Juli"], item["Februari"])
        const rawVal = item[filterBulanTop];
        const val = Number(rawVal) || 0;
        const rawLabel = item.keterangan || item.account || "Item";

        return {
          fullName: rawLabel,
          // Batasi panjang teks untuk label sumbu Y agar tidak tumpang tindih
          name: rawLabel.length > 18 ? rawLabel.substring(0, 16) + "…" : rawLabel,
          nominal: Math.abs(val),
        };
      })
      .filter((x) => x.nominal > 0)
      .sort((a, b) => b.nominal - a.nominal)
      .slice(0, 5);
  }, [dataKeuangan, filterBulanTop, filterTipePengeluaran]);

  const topPenerimaan = useMemo(() => {
    // 1. Filter hanya transaksi detail pemasukan (bukan header H atau subtotal T)
    const items = dataKeuangan.filter((item) => {
      const headerStr = String(item.header ?? "").trim().toUpperCase();
      const groupStr = String(item.group ?? "").trim().toUpperCase();
      const isDetailRow = headerStr === "D" || (headerStr !== "H" && headerStr !== "T");

      return (
        isDetailRow &&
        (groupStr.includes("PENDAPATAN") ||
          groupStr.includes("PENERIMAAN") ||
          groupStr.includes("PEMASUKAN"))
      );
    });

    let totalIPL = 0;
    const itemAkunLain: Array<{ fullName: string; name: string; nominal: number }> = [];

    // 2. Pisahkan akun 20 (IPL) dan 30 (Dijabarkan)
    items.forEach((item) => {
      const acc = String(item.account ?? "").trim();
      const val = Number(item[filterBulanTop]) || 0;
      const nominal = Math.abs(val);

      if (nominal <= 0) return;

      if (acc.startsWith("20")) {
        // SUM semua akun yang berawalan "20"
        totalIPL += nominal;
      } else if (acc.startsWith("30")) {
        // Jabarkan semua akun yang berawalan "30"
        const rawLabel = item.keterangan || item.account || "Pemasukan Lain";
        itemAkunLain.push({
          fullName: rawLabel,
          name: rawLabel.length > 18 ? rawLabel.substring(0, 16) + "…" : rawLabel,
          nominal: nominal,
        });
      } else {
        // Akun pendapatan lain selain 20 dan 30 (jika ada, tetap dijabarkan)
        const rawLabel = item.keterangan || item.account || "Item";
        itemAkunLain.push({
          fullName: rawLabel,
          name: rawLabel.length > 18 ? rawLabel.substring(0, 16) + "…" : rawLabel,
          nominal: nominal,
        });
      }
    });

    const hasilGabungan = [];

    // 3. Masukkan entri "IPL" hasil SUM jika totalnya > 0
    if (totalIPL > 0) {
      hasilGabungan.push({
        fullName: "Iuran Pengelolaan Lingkungan (IPL)",
        name: "IPL",
        nominal: totalIPL,
      });
    }

    // 4. Masukkan seluruh item akun 30 yang telah dijabarkan
    hasilGabungan.push(...itemAkunLain);

    // 5. Urutkan dari nominal terbesar dan ambil Top 5
    return hasilGabungan
      .sort((a, b) => b.nominal - a.nominal)
      .slice(0, 5);
  }, [dataKeuangan, filterBulanTop]);

  // =========================================================
  // ANALISA GEMINI AI
  // =========================================================

  const handleGenerateAiAnalysis = async (forceReload = false) => {
    const cacheKey = `finance-ai-cache-${filterBulanTop}`;

    // 1. Cek cache jika tidak dipaksa reload
    if (!forceReload && typeof window !== "undefined") {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAiAnalysis(parsed.analysis);
          return;
        } catch {
          // parse fallback
        }
      }
    }

    // 2. Request ke API jika belum ada di cache atau dipaksa reload
    try {
      setLoadingAi(true);
      const res = await fetch("/api/finance-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chartData: dataKas,
          topPengeluaran,
          topPenerimaan,
          bulanDipilih: filterBulanTop,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAiAnalysis(json.analysis);
        // Simpan ke localStorage beserta timestamp
        if (typeof window !== "undefined") {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              analysis: json.analysis,
              timestamp: Date.now(),
            })
          );
        }
      } else {
        setAiAnalysis("Gagal memuat analisa: " + (json.error || "Terjadi kendala jaringan."));
      }
    } catch (err: any) {
      setAiAnalysis("Gagal memanggil API Gemini: " + err.message);
    } finally {
      setLoadingAi(false);
    }
  };
  // =========================================================
  // EXPORT IMAGE
  // =========================================================

  const handleExportImage = async () => {
    if (!exportRef.current || dataKeuangan.length === 0) return;
    try {
      setExporting(true);
      const element = exportRef.current;
      element.style.position = "fixed";
      element.style.left = "0";
      element.style.top = "0";
      element.style.opacity = "1";
      element.style.pointerEvents = "none";
      element.style.zIndex = "99999";

      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      const periode = selectedBulan === "all" ? "Januari-Desember 2026" : selectedBulan;
      link.download = `LPJ-Keuangan-${periode}.png`;
      link.href = dataUrl;
      link.click();

      element.style.opacity = "0";
      element.style.zIndex = "-1";
    } catch (error) {
      console.error("Gagal export LPJ:", error);
      alert("Gagal membuat gambar LPJ. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  // =========================================================
  // FETCH DATA KEUANGAN
  // =========================================================

  useEffect(() => {
    const fetchData = async () => {
      const CACHE_KEY = "finance-dashboard";
      const cached = getClientCache<any>("finance-dashboard");

      if (cached?.data) {
        const dashboard = cached.data;
        setDataKeuangan(Array.isArray(dashboard.detail) ? dashboard.detail : []);
        setDataIpl(Array.isArray(dashboard.kas) ? dashboard.kas : []);
        setDataKas(Array.isArray(dashboard.kas) ? dashboard.kas : []);
      }

      setLoading(!cached?.data);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 50000);

        const res = await fetch("/api/finance?action=getFinanceDashboard", {
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json?.success) throw new Error(json?.message || "Gagal mengambil data");

        const dashboard = json?.data ?? {};
        setDataKeuangan(Array.isArray(dashboard.detail) ? dashboard.detail : []);
        setDataIpl(Array.isArray(dashboard.kas) ? dashboard.kas : []);
        setDataKas(Array.isArray(dashboard.kas) ? dashboard.kas : []);
        saveClientCache(CACHE_KEY, dashboard);
      } catch (error) {
        console.error("Finance fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =========================================================
  // MOBILE SLICE
  // =========================================================

  const mobileMonths = useMemo(() => {
    return listPilihanBulan.slice(mobileStartMonth, mobileStartMonth + 3);
  }, [mobileStartMonth]);

  const nextMobileMonths = () => {
    setMobileStartMonth((current) => (current >= 9 ? 9 : current + 3));
  };

  const prevMobileMonths = () => {
    setMobileStartMonth((current) => (current <= 0 ? 0 : current - 3));
  };

  useEffect(() => {
    if (selectedBulan === "all") {
      setMobileStartMonth(0);
      return;
    }
    const index = listPilihanBulan.findIndex((b) => b.nama === selectedBulan);
    if (index >= 0) {
      setMobileStartMonth(Math.floor(index / 3) * 3);
    }
  }, [selectedBulan]);

  const chartIplData: ChartIplData[] = useMemo(() => {
    const monthOrder: Record<string, number> = {
      januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
      juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
    };

    const sorted = [...dataIpl].sort((a, b) => {
      const yearA = Number(a.tahun);
      const yearB = Number(b.tahun);
      if (yearA !== yearB) return yearA - yearB;
      const monthA = monthOrder[String(a.bulan).trim().toLowerCase()] || 0;
      const monthB = monthOrder[String(b.bulan).trim().toLowerCase()] || 0;
      return monthA - monthB;
    });

    return sorted.map((item) => {
      const bulanLower = String(item.bulan).trim().toLowerCase();
      const bulanInfo = listPilihanBulan.find((b) => b.nama.toLowerCase() === bulanLower);
      return {
        label: `${bulanInfo?.short}`,
        bulan: item.bulan,
        tahun: item.tahun,
        pemasukan: Number(item.pemasukan) || 0,
        pengeluaran: Number(item.pengeluaran) || 0,
      };
    });
  }, [dataIpl]);

  return (
    <div className="mt-4 md:mt-8 w-full max-w-full space-y-6">
      {/* =====================================================
          BAGIAN ATAS: 3-CARD BERSIH & TIDAK BERTABRAKAN
      ===================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CARD 1: TREN KEUANGAN (DIBERIKAN RUANG LEBAR 6-KOLOM AGAR TIDAK HIMPIT) */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                📈 Tren Arus Keuangan Kas
              </h3>
              <p className="text-[11px] text-slate-400">Pemasukan, Pengeluaran & Saldo Kas</p>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
              Live Kas
            </span>
          </div>

          <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
            {dataKas.length > 0 ? (
              <DashboardChart data={dataKas} />
            ) : (
              <span className="text-xs text-slate-400">Memuat data tren kas...</span>
            )}
          </div>
        </div>

       {/* CARD 2: TOP 5 PENGELUARAN (DILENGKAPI PILIHAN RUTIN / TIDAK RUTIN) */}
       <div className="lg:col-span-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header: Judul dan Dropdown Bulan */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                🔴 Top 5 Beban
              </h3>
              <select
                value={filterBulanTop}
                onChange={(e) => setFilterBulanTop(e.target.value)}
                className="text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {listPilihanBulan.map((b) => (
                  <option key={b.nama} value={b.nama}>
                    {b.short}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Filter Kategori: Semua / Rutin / Tidak Rutin */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-2.5">
              <button
                type="button"
                onClick={() => setFilterTipePengeluaran("SEMUA")}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
                  filterTipePengeluaran === "SEMUA"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterTipePengeluaran("RUTIN")}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
                  filterTipePengeluaran === "RUTIN"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Rutin
              </button>
              <button
                type="button"
                onClick={() => setFilterTipePengeluaran("NON_RUTIN")}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
                  filterTipePengeluaran === "NON_RUTIN"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Non-Rutin
              </button>
            </div>

            {/* Chart Area */}
            <div className="h-[210px] w-full">
              {topPengeluaran.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPengeluaran}
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tickFormatter={formatChartAxis}
                      tick={{ fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={95}
                      tick={{ fontSize: 9, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any, _, item: any) => [
                        `Rp ${formatRupiah(val)}`,
                        item.payload.fullName,
                      ]}
                      contentStyle={{ borderRadius: "10px", fontSize: "11px", borderColor: "#fecdd3" }}
                    />
                    <Bar
                      dataKey="nominal"
                      fill="#f43f5e"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-2">
                  Tidak ada pengeluaran ({filterTipePengeluaran === "RUTIN" ? "Rutin" : filterTipePengeluaran === "NON_RUTIN" ? "Non-Rutin" : "Semua"}) pada bulan {filterBulanTop}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARD 3: TOP 5 PENERIMAAN (3-KOLOM) */}
        <div className="lg:col-span-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                🟢 Top 5 Masuk
              </h3>
              <select
                value={filterBulanTop}
                onChange={(e) => setFilterBulanTop(e.target.value)}
                className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {listPilihanBulan.map((b) => (
                  <option key={b.nama} value={b.nama}>
                    {b.short}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">Periode: {filterBulanTop}</p>

            <div className="h-[230px] w-full">
              {topPenerimaan.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPenerimaan}
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tickFormatter={formatChartAxis}
                      tick={{ fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={95}
                      tick={{ fontSize: 9, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any, _, item: any) => [
                        `Rp ${formatRupiah(val)}`,
                        item.payload.fullName,
                      ]}
                      contentStyle={{ borderRadius: "10px", fontSize: "11px", borderColor: "#a7f3d0" }}
                    />
                    <Bar
                      dataKey="nominal"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-2">
                  Tidak ada catatan penerimaan di bulan {filterBulanTop}.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          TAB NAVIGATION (LPJ & SUMMARY)
      ===================================================== */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab("detail")}
          className={`
            flex-1 py-3 md:py-4 px-2 text-center font-bold text-xs md:text-sm border-b-2 transition leading-tight
            ${
              activeTab === "detail"
                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }
          `}
        >
          📋 LPJ Keuangan
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`
            flex-1 py-3 md:py-4 px-2 text-center font-bold text-xs md:text-sm border-b-2 transition leading-tight
            ${
              activeTab === "summary"
                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }
          `}
        >
          📊 Grafik Rekap IPL
        </button>
      </div>

      {/* =====================================================
          FILTER BULAN TABEL LPJ
      ===================================================== */}
      {activeTab === "detail" && !loading && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Filter Tampilan Data:
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <label
              htmlFor="bulan-select"
              className="text-xs text-slate-500 font-medium sm:min-w-fit"
            >
              Pilih Bulan:
            </label>

            <select
              id="bulan-select"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full sm:flex-1 bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl py-2.5 px-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-0"
            >
              <option value="all">🗓️ Semua Bulan (Jan-Des)</option>
              {listPilihanBulan.map((bulan) => (
                <option key={bulan.nama} value={bulan.nama}>
                  {bulan.nama}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportImage}
              disabled={exporting || dataKeuangan.length === 0}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Membuat...
                </>
              ) : (
                <>⬇ Unduh LPJ</>
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
          width: selectedBulan === "all" ? "1600px" : "1100px",
          padding: "40px",
          backgroundColor: "#ffffff",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
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

        <table
          className="w-full border-collapse text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              <th
                className="border border-slate-300 bg-slate-100 px-4 py-3 text-left font-bold text-slate-700"
                style={{
                  width: selectedBulan === "all" ? "110px" : "140px",
                }}
              >
                Account
              </th>
              <th
                className="border border-slate-300 bg-slate-100 px-4 py-3 text-left font-bold text-slate-700"
                style={{
                  width: selectedBulan === "all" ? "350px" : "400px",
                }}
              >
                Keterangan
              </th>
              {selectedBulan === "all" ? (
                listPilihanBulan.map((bulan) => (
                  <th
                    key={bulan.nama}
                    className="border border-slate-300 bg-slate-100 px-3 py-3 text-center font-bold text-slate-700"
                  >
                    {bulan.nama.toUpperCase()}
                  </th>
                ))
              ) : (
                <th className="border border-slate-300 bg-blue-50 px-3 py-3 text-center font-bold text-blue-800">
                  {selectedBulan.toUpperCase()}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {groupedData.flatMap((group) => [
              <tr key={`group-export-${group.name}`}>
                <td
                  colSpan={selectedBulan === "all" ? 14 : 3}
                  className="border border-slate-300 bg-slate-200 px-4 py-2 font-bold text-slate-800"
                >
                  {group.name}
                </td>
              </tr>,
              ...group.items.map((item, idx) => (
                <tr
                  key={`${group.name}-${idx}`}
                  className={`${
                    item.header?.toString().trim().toUpperCase() === "H"
                      ? "bg-yellow-100 font-bold"
                      : item.header?.toString().trim().toUpperCase() === "T"
                      ? "bg-blue-100 font-bold"
                      : "bg-white"
                  }`}
                >
                  <td className="border border-slate-300 px-4 py-3 align-top text-slate-700">
                    <span className={item.header?.toString() === "T" ? "font-bold" : ""}>
                      {item.account}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top text-slate-700">
                    <span className={item.header?.toString() === "T" ? "font-bold" : ""}>
                      {item.keterangan}
                    </span>
                  </td>
                  {selectedBulan === "all" ? (
                    listPilihanBulan.map((bulan) => (
                      <td
                        key={bulan.nama}
                        className="border border-slate-300 px-3 py-3 text-right align-top whitespace-nowrap text-slate-700"
                      >
                        <span className={item.header?.toString() === "T" ? "font-bold" : ""}>
                          {formatRupiah(item[bulan.nama])}
                        </span>
                      </td>
                    ))
                  ) : (
                    <td className="border border-slate-300 px-3 py-3 text-right align-top whitespace-nowrap text-slate-700 bg-blue-50/30">
                      <span className={item.header?.toString() === "T" ? "font-bold" : ""}>
                        {formatRupiah(item[selectedBulan])}
                      </span>
                    </td>
                  )}
                </tr>
              )),
            ])}
          </tbody>
        </table>
        <div className="mt-6 text-sm text-slate-400">
          Portal Warga RT 07 RW 14 Bukit Amarilis
        </div>
      </div>

      {/* =====================================================
          TABEL LPJ KEUANGAN (MOBILE & DESKTOP)
      ===================================================== */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Mengambil data keuangan...</p>
        </div>
      ) : (
        <div className="w-full">
          {activeTab === "detail" && (
            <>
              {/* MOBILE TABLE */}
              <div className="md:hidden">
                <div className="flex items-center justify-between mb-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={prevMobileMonths}
                    disabled={mobileStartMonth === 0}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">Tampilan Bulan</div>
                    <div className="text-xs font-bold text-slate-700">
                      {mobileMonths[0]?.short} - {mobileMonths[mobileMonths.length - 1]?.short}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={nextMobileMonths}
                    disabled={mobileStartMonth === 9}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>

                <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="sticky top-0 left-0 z-40 bg-slate-100 p-3 border-b border-slate-200 w-[150px] min-w-[150px] max-w-[170px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                          <span className="text-xs font-semibold text-slate-700">Keterangan</span>
                        </th>
                        {mobileMonths.map((bulan) => (
                          <th
                            key={bulan.nama}
                            className="sticky top-0 z-30 bg-slate-100 p-3 border-b border-slate-200 text-right whitespace-nowrap text-xs font-semibold text-slate-700 min-w-[90px]"
                          >
                            {bulan.short}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataKeuangan.length === 0 ? (
                        <tr>
                          <td colSpan={1 + mobileMonths.length} className="p-6 text-center text-xs text-slate-400">
                            Belum ada data detail.
                          </td>
                        </tr>
                      ) : (
                        groupedData.flatMap((group) => [
                          <tr key={`group-mobile-${group.name}`}>
                            <td colSpan={1 + mobileMonths.length} className="bg-slate-200 px-3 py-2.5 text-slate-800">
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 text-left text-xs font-bold sticky left-3"
                                aria-expanded={expandedGroups[group.name] ?? true}
                                onClick={() =>
                                  setExpandedGroups((prev) => ({
                                    ...prev,
                                    [group.name]: !(prev[group.name] ?? true),
                                  }))
                                }
                              >
                                <span>{(expandedGroups[group.name] ?? true) ? "▼" : "▶"}</span>
                                <span className="truncate">{group.name}</span>
                                <span className="ml-auto text-[10px] font-normal text-slate-500">
                                  {group.items.length} data
                                </span>
                              </button>
                            </td>
                          </tr>,
                          ...((expandedGroups[group.name] ?? true)
                            ? group.items.map((item, idx) => {
                                const rowBgClass =
                                  item.header?.toString().trim().toUpperCase() === "H"
                                    ? "bg-yellow-100"
                                    : item.header?.toString().trim().toUpperCase() === "T"
                                    ? "bg-blue-100"
                                    : "bg-white";

                                return (
                                  <tr key={`${group.name}-${idx}`} className={`${rowBgClass} hover:brightness-95 transition-all`}>
                                    <td className={`sticky left-0 z-20 ${rowBgClass} px-3 py-2.5 align-top w-[150px] min-w-[150px] max-w-[170px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]`}>
                                      <div className="flex flex-col gap-1">
                                        <span
                                          className={`text-[11px] leading-4 break-words ${
                                            item.header?.toString() === "T" ? "font-bold text-slate-800" : "text-slate-700"
                                          }`}
                                        >
                                          {item.keterangan}
                                        </span>
                                      </div>
                                    </td>
                                    {mobileMonths.map((bulan) => (
                                      <td key={bulan.nama} className="w-1 whitespace-nowrap px-3 py-2.5 align-top text-right border-l border-slate-100/70">
                                        <span
                                          className={`text-[11px] leading-4 ${
                                            item.header?.toString() === "T" ? "font-bold text-slate-800" : "text-slate-600"
                                          }`}
                                        >
                                          {formatRupiah(item[bulan.nama])}
                                        </span>
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })
                            : []),
                        ])
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="max-h-[70vh] overflow-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-sm font-semibold text-slate-700">
                          <th className="sticky top-0 left-0 z-50 bg-slate-100 border-b border-slate-200 p-4 text-left w-[140px] min-w-[140px]">
                            Account
                          </th>
                          <th className="sticky top-0 left-[140px] z-50 bg-slate-100 border-b border-slate-200 p-4 text-left w-[240px] min-w-[240px] max-w-[240px] shadow-[3px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            Keterangan
                          </th>
                          {selectedBulan === "all" ? (
                            listPilihanBulan.map((bulan) => (
                              <th key={bulan.nama} className="sticky top-0 z-30 bg-slate-100 border-b border-slate-200 p-3 text-right whitespace-nowrap min-w-[100px]">
                                {bulan.nama.toUpperCase()}
                              </th>
                            ))
                          ) : (
                            <th className="sticky top-0 z-30 bg-blue-50 border-b border-slate-200 p-3 text-right whitespace-nowrap min-w-[120px]">
                              {selectedBulan.toUpperCase()}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                        {dataKeuangan.length === 0 ? (
                          <tr>
                            <td colSpan={selectedBulan === "all" ? 14 : 3} className="p-6 text-center text-slate-400">
                              Belum ada data detail.
                            </td>
                          </tr>
                        ) : (
                          groupedData.flatMap((group) => [
                            <tr key={`group-desktop-${group.name}`}>
                              <td colSpan={selectedBulan === "all" ? 14 : 3} className="bg-slate-200 px-4 py-3 text-slate-800">
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 text-left font-bold sticky left-4"
                                  aria-expanded={expandedGroups[group.name] ?? true}
                                  onClick={() =>
                                    setExpandedGroups((prev) => ({
                                      ...prev,
                                      [group.name]: !(prev[group.name] ?? true),
                                    }))
                                  }
                                >
                                  <span>{(expandedGroups[group.name] ?? true) ? "▼" : "▶"}</span>
                                  <span>{group.name}</span>
                                  <span className="ml-auto text-xs font-normal text-slate-500">
                                    {group.items.length} data
                                  </span>
                                </button>
                              </td>
                            </tr>,
                            ...((expandedGroups[group.name] ?? true)
                              ? group.items.map((item, idx) => {
                                  const rowBgClass =
                                    item.header?.toString().trim().toUpperCase() === "H"
                                      ? "bg-yellow-100"
                                      : item.header?.toString().trim().toUpperCase() === "T"
                                      ? "bg-blue-100"
                                      : "bg-white";

                                  return (
                                    <tr key={`${group.name}-${idx}`} className={`${rowBgClass} hover:brightness-95 transition-all`}>
                                      <td className={`sticky left-0 z-20 ${rowBgClass} p-4 align-top w-[140px] min-w-[140px]`}>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.header?.toString() === "T" ? "text-slate-800" : "text-slate-700"}`}>
                                          {item.account}
                                        </span>
                                      </td>
                                      <td className={`sticky left-[140px] z-20 ${rowBgClass} p-4 align-top w-[240px] min-w-[240px] max-w-[240px] shadow-[3px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                                        <span className={`inline-block break-words leading-relaxed ${item.header?.toString() === "T" ? "font-bold text-slate-800" : ""}`}>
                                          {item.keterangan}
                                        </span>
                                      </td>
                                      {selectedBulan === "all" ? (
                                        listPilihanBulan.map((bulan) => (
                                          <td key={bulan.nama} className="px-3 py-4 align-top text-right whitespace-nowrap border-l border-slate-100/60">
                                            <span className={`text-[12px] leading-4 ${item.header?.toString() === "T" ? "font-bold text-slate-700" : "text-slate-600"}`}>
                                              {formatRupiah(item[bulan.nama])}
                                            </span>
                                          </td>
                                        ))
                                      ) : (
                                        <td className="px-3 py-4 align-top text-right whitespace-nowrap border-l border-slate-100/60">
                                          <span className={`text-[12px] leading-4 ${item.header?.toString() === "T" ? "font-bold text-slate-700" : "text-slate-600"}`}>
                                            {formatRupiah(item[selectedBulan])}
                                          </span>
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })
                              : []),
                          ])
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2 - GRAFIK REKAP IPL */}
          {activeTab === "summary" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-5">
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Grafik pemasukan vs pengeluaran berdasarkan bulan.
                </p>
              </div>

              {chartIplData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
                  Belum ada data.
                </div>
              ) : (
                <div className="w-full h-[300px] sm:h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartIplData} margin={{ top: 10, right: 10, left: 0, bottom: 35 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={chartIplData.length > 8 ? -35 : 0}
                        textAnchor={chartIplData.length > 8 ? "end" : "middle"}
                        height={chartIplData.length > 8 ? 65 : 35}
                      />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={formatChartAxis} width={45} />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `Rp ${formatRupiah(value)}`,
                          name === "Pemasukan" ? "Pemasukan" : "Pengeluaran",
                        ]}
                        labelFormatter={(label) => `Bulan: ${label}`}
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      />
                      <Bar dataKey="pemasukan" name="Pemasukan" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={55} />
                      <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={55} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartIplData.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Jumlah Periode</div>
                    <div className="text-lg font-bold text-slate-700">{chartIplData.length} Bulan</div>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                    <div className="text-[11px] text-slate-500">Total Pemasukan</div>
                    <div className="text-lg font-bold text-blue-700">
                      Rp {formatRupiah(chartIplData.reduce((total, item) => total + item.pemasukan, 0))}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">Total Pengeluaran</div>
                    <div className="text-lg font-bold text-red-700">
                      Rp {formatRupiah(chartIplData.reduce((total, item) => total + item.pengeluaran, 0))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          BAGIAN BAWAH: CARD AI FINANCIAL ANALYST (LEBAR PENUH)
      ===================================================== */}
      <div className="w-full bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-5 sm:p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo-100/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20">
              ✨
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                AI Financial Executive Summary
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Analisis cerdas pola arus kas, risiko beban operasional, dan saran pengelolaan kas RT.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiAnalysis && (
              <button
                type="button"
                onClick={() => handleGenerateAiAnalysis(true)}
                disabled={loadingAi}
                title="Generate ulang data dari server"
                className="px-3 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition disabled:opacity-50"
              >
                🔄 Refresh Analisis
              </button>
            )}

            <button
              type="button"
              onClick={() => handleGenerateAiAnalysis(false)}
              disabled={loadingAi || dataKeuangan.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAi ? (
                <>
                  <span className="animate-spin text-sm">⚙️</span>
                  Sedang Menganalisis...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  {aiAnalysis ? "Tampilkan Analisis" : `Analisis Kas (${filterBulanTop})`}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tampilan Teks Analisis AI */}
        <div className="rounded-2xl bg-white/80 p-4 sm:p-5 border border-indigo-100/60 shadow-inner min-h-[100px] text-xs sm:text-sm text-slate-700 leading-relaxed">
          {loadingAi ? (
            <div className="py-8 text-center text-indigo-600 space-y-2">
              <div className="inline-block animate-spin text-2xl">🪄</div>
              <p className="font-semibold text-xs animate-pulse">
                Gemini sedang membaca laporan keuangan dan menyusun kesimpulan...
              </p>
            </div>
          ) : aiAnalysis ? (
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
              {aiAnalysis}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Belum ada ringkasan. Klik tombol <strong>&quot;Mulai Analisis Kas dengan AI&quot;</strong> di atas untuk melihat audit dan rekomendasi pintar untuk kas warga.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}