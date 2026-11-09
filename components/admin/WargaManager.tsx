"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Filter,
  Home,
  LoaderCircle,
  Phone,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";

export interface WargaRecord {
  Blok: string;
  Nama: string;
  StatusRumah?: string;
  NoHp?: string;
  Korwil?: string;
  Iplamount?: string | number;
  flagFreeIPL?: number | string;
  flagMobile?: number | string | boolean;
}

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

interface IPLHistoryItem {
  transId: string | number;
  period: string;
  amount: number;
  keterangan: string;
  status: "Lunas" | "Menunggu Verifikasi" | "Belum dibayar";
  paidDate: string;
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const money = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export default function WargaManager() {
  const [listWarga, setListWarga] = useState<WargaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterKorwil, setFilterKorwil] = useState("SEMUA");

  // State Modal Form & Detail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  // Form Field States
  const [formBlok, setFormBlok] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formStatusRumah, setFormStatusRumah] = useState("HUNI");
  const [formNoHp, setFormNoHp] = useState("");
  const [formKorwil, setFormKorwil] = useState("");
  const [formTarif, setFormTarif] = useState<number>(110000);
  const [formFlagFreeIPL, setFormFlagFreeIPL] = useState<number>(1);
  const [formFlagMobile, setFormFlagMobile] = useState<number>(1);

  // State Khusus Riwayat IPL Warga (View Mode)
  const [iplHistory, setIplHistory] = useState<IPLHistoryItem[]>([]);
  const [loadingIPL, setLoadingIPL] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Helper pemeriksa flag Free IPL (0 = Bebas Iuran)
  const checkIsFreeIPL = (val?: number | string) => {
    if (val === undefined || val === null) return false;
    return String(val).trim() === "0" || Number(val) === 0;
  };

  // Helper pemeriksa flag Mobile (1 / true = Aktif)
  const checkIsMobileActive = (val?: number | string | boolean) => {
    if (val === undefined || val === null) return false;
    return val === 1 || val === "1" || val === true || String(val).toLowerCase() === "true" || String(val).toLowerCase() === "aktif";
  };

  // Mengambil master data warga
  const fetchWarga = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/warga", { cache: "no-store" });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        const mapped = json.data.map((item: any) => ({
          Blok: item.Blok || item.BlokID || "",
          Nama: item.Nama || item.NamaAlias || "",
          StatusRumah: item.statusRumah || item.Status || "-",
          NoHp: item.Mobileno || item.MobileNo || item.NoHP || item.noHp || item.Telepon || "-",
          Korwil: item.Korwil || "Korwil 1",
          Iplamount: item.Iplamount || "110000",
          flagFreeIPL: item.flagFreeIPL ?? item.flagfeeIPL ?? item.FreeIPL ?? item.freeIPL ?? 1,
          flagMobile: item.flagMobile ?? item.FlagMobile ?? 0,
        }));
        setListWarga(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat list warga:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarga();
  }, []);

  // Filter pencarian dan korwil
  const filteredData = useMemo(() => {
    return listWarga.filter((w) => {
      const matchQuery =
        w.Blok.toLowerCase().includes(search.toLowerCase()) ||
        w.Nama.toLowerCase().includes(search.toLowerCase()) ||
        (w.NoHp && w.NoHp.includes(search));
      const matchKorwil = filterKorwil === "SEMUA" || w.Korwil === filterKorwil;
      return matchQuery && matchKorwil;
    });
  }, [listWarga, search, filterKorwil]);

  // Mengambil riwayat IPL unit dari endpoint yang sama dengan portal-warga
  const fetchIPLHistory = async (blokId: string, tarifUnit: number) => {
    if (!blokId) return;
    setLoadingIPL(true);
    setIplHistory([]);

    try {
      const res = await fetch(`/api/ipl?blokid=${encodeURIComponent(blokId)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const rawItems: RawIPLItem[] = Array.isArray(json?.data) ? json.data : [];

      const mapBayar = new Map<string, RawIPLItem[]>();
      rawItems.forEach((item) => {
        const m = Number(item.pmonth);
        const y = Number(item.pyear);
        const key = `${y}-${m}`;
        const existing = mapBayar.get(key) || [];
        existing.push(item);
        mapBayar.set(key, existing);
      });

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const START_YEAR = 2026;
      const START_MONTH = 2; // Mulai Februari 2026

      const historyList: IPLHistoryItem[] = [];

      for (let y = currentYear; y >= START_YEAR; y--) {
        const maxMonth = y === currentYear ? currentMonth : 12;
        const minMonth = y === START_YEAR ? START_MONTH : 1;

        for (let m = maxMonth; m >= minMonth; m--) {
          const key = `${y}-${m}`;
          const existingRecords = mapBayar.get(key);
          const periodText = `${NAMA_BULAN[m - 1]} ${y}`;

          if (existingRecords && existingRecords.length > 0) {
            existingRecords.forEach((existing, idx) => {
              historyList.push({
                transId: existing.transId || `PAID-${y}-${m}-${idx}`,
                period: periodText,
                amount: Number(existing.amount) || tarifUnit,
                keterangan: existing.keterangan || "Iuran IPL Bulanan",
                status:
                  existing.status === "C"
                    ? "Lunas"
                    : existing.status === "O"
                    ? "Menunggu Verifikasi"
                    : "Belum dibayar",
                paidDate: existing.paidDate || "-",
              });
            });
          } else {
            historyList.push({
              transId: `UNPAID-${y}-${m}`,
              period: periodText,
              amount: tarifUnit,
              keterangan: "Tagihan IPL Berjalan",
              status: "Belum dibayar",
              paidDate: "-",
            });
          }
        }
      }

      setIplHistory(historyList);
    } catch (err) {
      console.warn("Gagal mengambil data IPL warga:", err);
    } finally {
      setLoadingIPL(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setFormBlok("");
    setFormNama("");
    setFormStatusRumah("Dihuni Sendiri");
    setFormNoHp("");
    setFormKorwil("Korwil 1");
    setFormTarif(110000);
    setFormFlagFreeIPL(1);
    setFormFlagMobile(1);
    setFormError("");
    setIplHistory([]);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (item: WargaRecord, mode: "view" | "edit") => {
    setModalMode(mode);
    setFormBlok(item.Blok);
    setFormNama(item.Nama);
    setFormStatusRumah(item.StatusRumah || "Dihuni Sendiri");
    setFormNoHp(item.NoHp !== "-" ? item.NoHp || "" : "");
    setFormKorwil(item.Korwil || "Korwil 1");
    const tarif = Number(item.Iplamount) || 110000;
    setFormTarif(tarif);
    setFormFlagFreeIPL(checkIsFreeIPL(item.flagFreeIPL) ? 0 : 1);
    setFormFlagMobile(checkIsMobileActive(item.flagMobile) ? 1 : 0);
    setFormError("");
    setIsModalOpen(true);

    // Jika mode view, otomatis panggil getIPLlist
    if (mode === "view") {
      fetchIPLHistory(item.Blok, tarif);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/save-warga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blok: formBlok.trim().toUpperCase(),
          nama: formNama.trim(),
          statusRumah: formStatusRumah,
          noHp: formNoHp.trim(),
          korwil: formKorwil,
          flagFreeIPL: formFlagFreeIPL,
          flagMobile: formFlagMobile,
          isEdit: modalMode === "edit",
        }),
      });

      const resData = await res.json();
      if (!resData.success) {
        setFormError(resData.message || "Gagal menyimpan data.");
        return;
      }

      showToast(resData.message || "Data warga berhasil disimpan!");
      setIsModalOpen(false);
      fetchWarga();
    } catch {
      setFormError("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  };

  // Perhitungan Ringkasan IPL pada Modal View
  const totalPaid = useMemo(() => {
    return iplHistory
      .filter((i) => i.status === "Lunas")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [iplHistory]);

  const unpaidCount = useMemo(() => {
    return iplHistory.filter((i) => i.status === "Belum dibayar").length;
  }, [iplHistory]);

  const totalUnpaid = useMemo(() => {
    return unpaidCount * formTarif;
  }, [unpaidCount, formTarif]);

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={22} className="text-emerald-600" />
            Master Data Warga
          </h1>
          <p className="text-xs text-slate-500">
            Daftar lengkap registrasi unit, penghuni, dan korwil RT 07 / RW 14.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWarga}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sinkron Data</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <Plus size={15} />
            <span>Tambah Warga Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Korwil Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Blok, Nama Warga, atau No. HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={filterKorwil}
            onChange={(e) => setFilterKorwil(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="SEMUA">Semua Korwil</option>
            <option value="SUDARMANTO">SUDARMANTO</option>
            <option value="ALEX">ALEX</option>
            <option value="NIKO">NIKO</option>
            <option value="ANDRO">ANDRO</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Master Warga */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3.5 font-bold">No. Blok</th>
                <th className="px-4 py-3.5 font-bold">Nama Warga</th>
                <th className="px-4 py-3.5 font-bold">Status Rumah</th>
                <th className="px-4 py-3.5 font-bold">No. HP / WA</th>
                <th className="px-4 py-3.5 font-bold text-center">Status IPL</th>
                <th className="px-4 py-3.5 font-bold text-center">Akses Mobile</th>
                <th className="px-4 py-3.5 font-bold">Korwil</th>
                <th className="px-5 py-3.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    <LoaderCircle className="mx-auto mb-2 animate-spin text-emerald-600" size={20} />
                    Menyinkronkan data warga...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Data warga tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const isFree = checkIsFreeIPL(item.flagFreeIPL);
                  const isMobile = checkIsMobileActive(item.flagMobile);
                  const cleanPhone = item.NoHp ? item.NoHp.replace(/[^0-9]/g, "") : "";
                  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

                  return (
                    <tr key={`${item.Blok}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-mono text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {item.Blok}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {item.Nama || "-"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.StatusRumah === "Dihuni Sendiri"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              : item.StatusRumah === "Sewa / Kontrak"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {item.StatusRumah || "Dihuni Sendiri"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {item.NoHp && item.NoHp !== "-" ? (
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:underline dark:text-emerald-400"
                            title="Kirim Pesan WhatsApp"
                          >
                            <Phone size={12} />
                            {item.NoHp}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isFree
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isFree ? (
                            <>
                              <ShieldCheck size={11} />
                              Reguler
                            </>
                          ) : (
                            "FreeIPL"
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isMobile
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Smartphone size={11} />
                          {isMobile ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {item.Korwil || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(item, "view")}
                            title="Lihat Detail & Riwayat IPL"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDetail(item, "edit")}
                            title="Edit Data"
                            className="rounded-lg border border-slate-200 p-1.5 text-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-slate-800 transition"
                          >
                            <Edit3 size={14} />
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

      {/* ================= MODAL ENTRY / EDIT / VIEW DETAIL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div
            className={`w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto ${
              modalMode === "view" ? "max-w-2xl" : "max-w-md"
            }`}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {modalMode === "view" ? <ReceiptText size={18} /> : <User size={18} />}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {modalMode === "create"
                      ? "Tambah Warga Baru"
                      : modalMode === "edit"
                      ? "Edit Data Warga"
                      : `Detail Unit & Riwayat IPL (${formBlok})`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {modalMode === "create"
                      ? "Unit baru RT 07 / RW 14"
                      : `${formNama} · ${formKorwil}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                {formError}
              </div>
            )}

            {/* ================= TAMPILAN VIEW DETAIL (READ ONLY) ================= */}
            {modalMode === "view" ? (
              <div className="mt-4 space-y-5">
                {/* Ringkasan Profil Singkat */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400">No. Unit Blok</span>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{formBlok}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Nama Warga</span>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{formNama}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">No. WhatsApp</span>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{formNoHp || "-"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Tarif IPL Dasar</span>
                    <p className="font-bold text-xs text-emerald-600">{money(formTarif)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Status Beban IPL</span>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {formFlagFreeIPL === 1 ? "Bebas Iuran (Free IPL)" : "Wajib Bayar (Reguler)"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Akses Portal Mobile</span>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {formFlagMobile === 1 ? "Aktif" : "Non-Aktif"}
                    </p>
                  </div>
                </div>

                {/* Kartu Ringkasan Pembayaran */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                      Total Lunas Terdata
                    </span>
                    <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {money(totalPaid)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-rose-900/30 dark:bg-rose-950/20">
                    <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                      Sisa Tunggakan ({unpaidCount} Periode)
                    </span>
                    <p className="mt-1 text-lg font-black text-rose-700 dark:text-rose-400">
                      {money(totalUnpaid)}
                    </p>
                  </div>
                </div>

                {/* Tabel Riwayat IPL (Read-Only) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ReceiptText size={14} className="text-emerald-600" />
                      Riwayat Pembayaran IPL (Google Sheets Sync)
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {iplHistory.length} Record Terdata
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-slate-800 z-10">
                          <tr>
                            <th className="px-4 py-2.5 font-bold">Periode</th>
                            <th className="px-3 py-2.5 font-bold">Keterangan</th>
                            <th className="px-3 py-2.5 font-bold">Nominal</th>
                            <th className="px-3 py-2.5 font-bold">Status</th>
                            <th className="px-4 py-2.5 font-bold text-right">Tgl Bayar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {loadingIPL ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                <LoaderCircle className="mx-auto mb-2 animate-spin text-emerald-600" size={18} />
                                Mengambil data riwayat IPL unit {formBlok}...
                              </td>
                            </tr>
                          ) : iplHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                                Tidak ditemukan data riwayat IPL untuk blok ini.
                              </td>
                            </tr>
                          ) : (
                            iplHistory.map((row, idx) => (
                              <tr key={row.transId || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                  {row.period}
                                </td>
                                <td className="px-3 py-2.5 text-slate-500 max-w-[150px] truncate">
                                  {row.keterangan}
                                </td>
                                <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                  {money(row.amount)}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      row.status === "Lunas"
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                        : row.status === "Menunggu Verifikasi"
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                    }`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right text-slate-500 whitespace-nowrap">
                                  {row.paidDate}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* ================= FORM TAMBAH / EDIT DATA WARGA ================= */
              <form onSubmit={handleSave} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No. Blok / Alamat Unit
                  </label>
                  <div className="relative mt-1">
                    <Home size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      disabled={modalMode === "edit"}
                      placeholder="Contoh: AR.16/09"
                      value={formBlok}
                      onChange={(e) => setFormBlok(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold uppercase text-slate-800 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-800/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nama Warga / Kepala Keluarga
                  </label>
                  <div className="relative mt-1">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap penghuni"
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status Rumah
                  </label>
                  <select
                    value={formStatusRumah}
                    onChange={(e) => setFormStatusRumah(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="HUNI">Dihuni Sendiri (Pemilik)</option>
                    <option value="KONTRAK">Sewa / Kontrak</option>
                    <option value="KOSONG">Rumah Kosong</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nomor HP
                  </label>
                  <div className="relative mt-1">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Contoh: 08123456789"
                      value={formNoHp}
                      onChange={(e) => setFormNoHp(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Wilayah Korwil
                  </label>
                  <select
                    value={formKorwil}
                    onChange={(e) => setFormKorwil(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="SUDARMANTO">SUDARMANTO</option>
                    <option value="ALEX">ALEX</option>
                    <option value="NIKO">NIKO</option>
                    <option value="ANDRO">ANDRO</option>
                  </select>
                </div>

                {/* Input Tambahan: flagFreeIPL dan flagMobile */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Status Beban IPL
                    </label>
                    <select
                      value={formFlagFreeIPL}
                      onChange={(e) => setFormFlagFreeIPL(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value={0}>0 - Wajib Bayar</option>
                      <option value={1}>1 - Bebas IPL (Free)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : modalMode === "create" ? "Tambah Warga" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}