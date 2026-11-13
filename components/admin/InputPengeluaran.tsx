"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Percent,
  CheckSquare,
  Square,
  LoaderCircle,
  Search,
  X,
  UserCheck,
  UploadCloud,
  ImageIcon,
  CalendarRange,
  History,
  ReceiptText,
  ExternalLink,
} from "lucide-react";

interface CoaItem {
  account: string;
  name: string;
}

interface WargaOption {
  blok: string;
  nama: string;
  korwil: string;
  iplAmount: number;
  freeIPL: number; // Nilai 0 = Bebas IPL / Non-Aktif Tagihan
}

interface PendingMonth {
  year: number;
  month: number;
  amount: number;
  transId?: string;
  isOverdue: boolean;
  status: string;
}

interface TransactionHistoryItem {
  transId: string;
  blokId: string;
  pyear: number;
  pmonth: number;
  invoice: string;
  paymethod: string;
  amount: number;
  keterangan: string;
  korwil: string;
  status: string;
  paidDate: string;
  lampiran?: string;
}
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const money = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export default function InputPengeluaran() {
  // Master Data & Search
  const [listWarga, setListWarga] = useState<WargaOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBlok, setSelectedBlok] = useState("");
  const [currentWarga, setCurrentWarga] = useState<WargaOption | null>(null);

  // Status & Tunggakan
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [pendingList, setPendingList] = useState<PendingMonth[]>([]);
  const [selectedPending, setSelectedPending] = useState<string[]>([]);

  // Skema Pembayaran
  const [paymentType, setPaymentType] = useState<"bulan" | "paket_tahunan" | "tunggakan">("bulan");
  const [jumlahBulanMaju, setJumlahBulanMaju] = useState<number>(1);
  const [startMonth, setStartMonth] = useState<number>(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());

  // Detail Form Transaksi
  const [tanggalBayar, setTanggalBayar] = useState(new Date().toISOString().split("T")[0]);
  const [caraBayar, setCaraBayar] = useState<"Kas" | "Kas" | "Kas">("Kas");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [lampiranBase64, setLampiranBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const [historyList, setHistoryList] = useState<TransactionHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  
  // 1. Ambil Master Data Warga
  useEffect(() => {
    async function loadWarga() {
      try {
        const res = await fetch("/api/warga");
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          const seenBlok = new Set<string>();
          const mapped: WargaOption[] = [];

          json.data.forEach((w: any) => {
            const blokClean = (w.Blok || w.BlokID || "").toString().trim();
            if (!blokClean || seenBlok.has(blokClean)) return;

            seenBlok.add(blokClean);
            mapped.push({
              blok: blokClean,
              nama: (w.Nama || w.NamaAlias || "-").toString().trim(),
              korwil: w.Korwil || "Korwil 1",
              iplAmount: Number(w.Iplamount) || 110000,
              // Ambil nilai FreeIPL (default 1 jika tidak ada/berisi string angka)
              freeIPL: w.flagFreeIPL !== undefined && w.flagFreeIPL !== null ? Number(w.flagFreeIPL) : 1,
            });
          });

          mapped.sort((a, b) => a.blok.localeCompare(b.blok, undefined, { numeric: true }));
          setListWarga(mapped);
        }
      } catch (err) {
        console.error("Gagal load data warga:", err);
      }
    }
    loadWarga();
  }, []);

// Default Input Type = IPL, Category default = IPL
const [inputType, setInputType] = useState<"NON-IPL" | "NON-IPL">("NON-IPL");
const [account, setCategory] = useState<string>("IPL");
const [coaList, setCoaList] = useState<{ account: string; name: string }[]>([]);
const [loadingCoa, setLoadingCoa] = useState<boolean>(false);
const [manualAmount, setManualAmount] = useState<string>("");

// Ambil data COA saat komponen pertama kali dimuat
useEffect(() => {
  const fetchCoa = async () => {
    try {
      setLoadingCoa(true);
      const res = await fetch("/api/finance?action=getCoaCategories&accType=Out");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCoaList(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat kategori COA:", err);
    } finally {
      setLoadingCoa(false);
    }
  };

  fetchCoa();
}, []);

const handleInputTypeChange = (val: "NON-IPL" | "NON-IPL") => {
  setInputType(val);
  if (val === "NON-IPL") {
    setCategory("IPL");
  } else {
    // Langsung set ke akun pertama daftar COA jika sudah ter-load
    if (coaList && coaList.length > 0) {
      setCategory(coaList[0].account);
    } else {
      setCategory(""); // Akan terisi begitu fetchCoa selesai
    }
  }
};

// Tambahkan useEffect sinkronisasi jika coaList baru selesai di-fetch setelah user memilih NON-IPL:
useEffect(() => {
  if (inputType === "NON-IPL" && (!account || account === "IPL") && coaList.length > 0) {
    setCategory(coaList[0].account);
  }
}, [coaList, inputType, account]);

  // Filter Search Unit
  const filteredWargaOptions = useMemo(() => {
    if (!searchQuery.trim()) return listWarga;
    const q = searchQuery.toLowerCase();
    return listWarga.filter(
      (w) => w.blok.toLowerCase().includes(q) || w.nama.toLowerCase().includes(q)
    );
  }, [listWarga, searchQuery]);


  
  /**
 * Mengubah ukuran dan mengompresi gambar menggunakan HTML Canvas
 * @param file Berkas gambar asli dari input
 * @param maxWidth Batas lebar maksimal (default: 1024px)
 * @param maxHeight Batas tinggi maksimal (default: 1024px)
 * @param quality Kualitas kompresi JPEG 0.1 s/d 1.0 (default: 0.75)
 */
const compressImage = (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung proporsi rasio gambar
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Gambar ulang di canvas dengan ukuran yang telah dikecilkan
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal menginisialisasi canvas context"));
          return;
        }

        // Gambar dengan latar belakang putih untuk mencegah artefak transparan
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke format JPEG dengan rasio kompresi optimal
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Hanya berkas foto/gambar bukti transfer yang diperbolehkan.");
    return;
  }

  try {
    // Otomatis resize maksimal 1024px dengan kualitas 75% (~100-200 KB)
    const compressedDataUri = await compressImage(file, 1024, 1024, 0.75);

    setLampiranBase64(compressedDataUri);
    setImagePreview(compressedDataUri);
  } catch (err) {
    console.error("Gagal melakukan kompresi gambar:", err);
    alert("Terjadi kendala saat memproses gambar.");
  }
};

  const handleRemoveImage = () => {
    setLampiranBase64("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper Rentang Bulan & Tahun Akhir
  const endMonthInfo = useMemo(() => {
    let m = startMonth + jumlahBulanMaju - 1;
    let y = startYear;
    if (m > 12) {
      y += Math.floor((m - 1) / 12);
      m = ((m - 1) % 12) + 1;
    }
    return { month: m, year: y, monthName: BULAN[m - 1] };
  }, [startMonth, startYear, jumlahBulanMaju]);

  // 3. Kalkulasi Items & Total Nominal
  const calculation = useMemo(() => {
    if (!currentWarga) return { items: [], total: 0 };
    const tarif = currentWarga.iplAmount;

    // A. Pelunasan Tunggakan
   if (paymentType === "tunggakan") {
    const items = pendingList
      .filter((p) => selectedPending.includes(`${p.year}-${p.month}`))
      .map((p) => ({
        pyear: p.year,
        pmonth: p.month,
        amount: tarif,
        keterangan: `Pelunasan Tunggakan IPL ${BULAN[p.month - 1]} ${p.year}`,
        isSettlingPending: true, // Flag penanda update baris
        transId: p.transId,      // ID record baris yang statusnya P
      }));
    return { items, total: items.length * tarif };
  }

    // B. Paket 1 Tahun Free 1 Bulan (Bayar 11 Bulan dapat 12 Bulan)
    if (paymentType === "paket_tahunan") {
      const items = [];
      const totalAmount = tarif * 11; // Total bayar tetap 11 bulan

      for (let i = 0; i < 12; i++) {
        let m = startMonth + i;
        let y = startYear;
        if (m > 12) {
          y += Math.floor((m - 1) / 12);
          m = ((m - 1) % 12) + 1;
        }

        const isFreeMonth = i === 11; // Bulan ke-12 (index 11)

        items.push({
          pyear: y,
          pmonth: m,
          amount: isFreeMonth ? 0 : tarif,
          keterangan: isFreeMonth
            ? `IPL Gratis 1 Bulan (Promo Paket 1 Tahun) ${BULAN[m - 1]} ${y}`
            : `Paket Tahunan IPL (Bulan ${i + 1}/12) ${BULAN[m - 1]} ${y}`,
          isSettlingPending: false,
        });
      }
      return { items, total: totalAmount };
    }

  // ==========================================
  // JIKA NON-IPL: BYPASS PERULANGAN BULAN
  // ==========================================
    const cleanNominal = typeof manualAmount === "string"
      ? Number(manualAmount.replace(/[^0-9]/g, "")) || 0
      : Number(manualAmount) || 0;

    const selectedCoa = coaList.find((c) => c.account === account);
    const namaKategori = selectedCoa ? selectedCoa.name : account;

    // Ambil bulan & tahun saat transaksi dibuat
    const tglTransaksi = tanggalBayar ? new Date(tanggalBayar) : new Date();
    const pmonth = tglTransaksi.getMonth() + 1;
    const pyear = tglTransaksi.getFullYear();

    return {
      items: cleanNominal > 0 ? [
        {
          pyear: pyear,
          pmonth: pmonth,
          amount: cleanNominal,
          keterangan: `${namaKategori}`,
          isSettlingPending: false
        }
      ] : [],
      total: cleanNominal,
    };


    

    // C. Pembayaran Bulanan Reguler
    const items = [];
    for (let i = 0; i < jumlahBulanMaju; i++) {
      let m = startMonth + i;
      let y = startYear;
      if (m > 12) {
        y += Math.floor((m - 1) / 12);
        m = ((m - 1) % 12) + 1;
      }
      items.push({
        pyear: y,
        pmonth: m,
        amount: tarif,
        keterangan: `Pembayaran IPL ${BULAN[m - 1]} ${y}`,
        isSettlingPending: false,
        category: "IPL",
        account : account
      });
    }
    return { items, total: items.length * tarif };
  }, [currentWarga, paymentType, selectedPending, pendingList, jumlahBulanMaju, startMonth, startYear]);

// 4. Submit Transaksi
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Bersihkan nominal manual untuk NON-IPL
  const cleanAmount = typeof manualAmount === "string"
    ? Number(manualAmount.replace(/[^0-9]/g, "")) || 0
    : Number(manualAmount) || 0;

  // Validasi khusus untuk NON-IPL
  if (inputType === "NON-IPL") {
    if (cleanAmount <= 0) {
      setFeedback({
        success: false,
        msg: "Harap isi nominal penerimaan dengan angka valid.",
      });
      return;
    }
    if (!account) {
      setFeedback({
        success: false,
        msg: "Harap pilih Kategori Akun (COA) terlebih dahulu.",
      });
      return;
    }
  }

  setSubmitting(true);
  setFeedback(null);

  // Tangani data blok & warga (jika NON-IPL tanpa blok, fallback ke "UMUM")
  const targetBlok = currentWarga?.blok || "0";
  const targetNama = currentWarga?.nama || (inputType === "NON-IPL" ? "Pengeluaran" : "");
  const targetKorwil = currentWarga?.korwil || "-";
  const cleanBlok = targetBlok.replace(/[^a-zA-Z0-9]/g, "");

  const tglDate = tanggalBayar ? new Date(tanggalBayar) : new Date();
  const pmonth = tglDate.getMonth() + 1;
  const pyear = tglDate.getFullYear();

  
  const selectedCoa = coaList.find((c) => c.account === account);
  const namaKategori = selectedCoa ? selectedCoa.name : account;

  // Susun itemsToPay sesuai tipe transaksi
  let finalItemsToPay: any[] = [];

  if (inputType === "NON-IPL") {
    finalItemsToPay = [
      {
        pyear: pyear,
        pmonth: pmonth,
        amount: cleanAmount,
        keterangan: `${namaKategori}`,
        isSettlingPending: false,
        transId: `OUT-${Date.now()}`,
        invoiceNo: `OUT/${Date.now()}/${cleanBlok}`,
      },
    ];
  } else {
    finalItemsToPay = calculation.items.map((it: any) => ({
      pyear: it.pyear,
      pmonth: it.pmonth,
      amount: it.amount,
      keterangan: it.keterangan,
      isSettlingPending: it.isSettlingPending || false,
      transId: it.transId || undefined,
      invoiceNo: `OUT/${it.pyear}${String(it.pmonth).padStart(2, "0")}/${cleanBlok}`,
    }));
  }

  const payload = {
    action: "saveIPLTransaction",
    blok: targetBlok,
    namaWarga: "",//targetNama,
    category: "OUT",
    account: account ,
    tanggalBayar,
    caraBayar,
    korwil: targetKorwil,
    paymentInfo: paymentInfo || `Dibayar via ${caraBayar}`,
    lampiran: lampiranBase64 || "-",
    itemsToPay: finalItemsToPay,
  };

  try {
    const res = await fetch("/api/ipl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (json.success) {
      setFeedback({
        success: true,
        msg: json.message || `Transaksi ${inputType} berhasil disimpan!`,
      });
      setSelectedBlok("");
      setSearchQuery("");
      setCurrentWarga(null);
      setPaymentInfo("");
      if (inputType === "NON-IPL") {
        setManualAmount("");
      }
      handleRemoveImage();
    } else {
      setFeedback({
        success: false,
        msg: json.message || "Gagal menyimpan data ke Google Sheets.",
      });
    }
  } catch (err: any) {
    setFeedback({ success: false, msg: err.message || "Terjadi kendala jaringan." });
  } finally {
    setSubmitting(false);
  }
};

  // Helper untuk membersihkan format angka jika pengguna mengetik titik/koma
const cleanAmount = typeof manualAmount === "string" 
? Number(manualAmount.replace(/[^0-9]/g, "")) 
: Number(manualAmount || 0);

// Pengecekan validasi tombol
const isSubmitDisabled = useMemo(() => {
  if (submitting) return true;

    // NON-IPL tidak wajib blok, hanya wajib nominal > 0 dan kategori COA valid
    const isCategoryValid = Boolean(account) && account.trim() !== "" && account !== "IPL";
    const isAmountValid = !isNaN(cleanAmount) && cleanAmount > 0;
    return !isCategoryValid || !isAmountValid;
  }, [submitting, currentWarga, inputType, calculation, account, cleanAmount]);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="text-emerald-600" size={24} />
          Input Transaksi Pengeluaran
        </h2>
        <p className="text-xs text-slate-500">
          Entri pengeluaran rutin dan tidak rutin.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            feedback.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50"
          }`}
        >
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Lookup Unit & Skema Pembayaran */}
        <div className="md:col-span-2 space-y-5">
          {/* Card Lookup Unit Warga */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilih POS Pengeluaran</h3>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className={`grid gap-4 pt-2 ${inputType === "NON-IPL" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
  {/* 1. INPUT TYPE (Pilihan: IPL / NON-IPL) */}
  <div>
    <select
      value={inputType}
      hidden
      onChange={(e) => handleInputTypeChange(e.target.value as "NON-IPL")}
      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      <option value="NON-IPL">NON-IPL</option>
      <option value="NON-IPL">IPL</option>
    </select>
  </div>
    <div className="animate-fade-in">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
        Akun Pengeluaran
      </label>
      <select
        value={account}
        onChange={(e) => setCategory(e.target.value)}
        disabled={loadingCoa}
        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        {loadingCoa ? (
          <option value="">Memuat kategori Akun...</option>
        ) : coaList.length === 0 ? (
          <option value="">Tidak ada data Akun</option>
        ) : (
          coaList.map((c) => (
            <option key={c.account} value={c.account}>
              {c.account} - {c.name}
            </option>
          ))
        )}
      </select>
    </div>
</div>

              {/* Autocomplete Input Search */}
              <div className="relative">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cari Blok / Nama Warga (optional)
                </label>
                <div className="relative mt-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik Blok (AR.16..) atau Nama..."
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-xs font-bold text-slate-800 placeholder:font-normal focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedBlok("");
                        setCurrentWarga(null);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown Hasil Pencarian */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-20">
                      {filteredWargaOptions.length === 0 ? (
                        <p className="p-3 text-center text-xs text-slate-400">Data warga tidak ditemukan</p>
                      ) : (
                        filteredWargaOptions.map((w, idx) => (
                          <button
                            key={`${w.blok}-${idx}`}
                            type="button"
                            onClick={() => {
                              setSelectedBlok(w.blok);
                              setCurrentWarga(w);
                              setSearchQuery(`${w.blok} - ${w.nama}`);
                              setIsDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                              selectedBlok === w.blok
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <div>
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                {w.blok}
                              </span>
                              <span className="mx-1.5 text-slate-300">|</span>
                              <span>{w.nama}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{w.korwil}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>


            {/* Tarif IPL Display / Input Amount Manual */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Input Amount
                </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Masukkan nominal (contoh: 150000)"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs font-mono font-bold text-slate-800 shadow-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
              </div>
            </div>

          {/* Konfirmasi Unit Terpilih */}
          {currentWarga && (
              <div className="space-y-3">
               

                {/* Banner Notifikasi jika Bebas IPL (freeIPL === 0) */}
                {currentWarga.freeIPL === 1 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300 text-xs flex items-center gap-2.5">
                    <AlertCircle size={18} className="shrink-0 text-amber-600" />
                    <span>
                      Unit ini memiliki status <strong>Bebas IPL</strong>. Catatan tunggakan dan riwayat tagihan dinonaktifkan.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Rincian Pembayaran & Image Upload Bukti Transfer */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rincian Pembayaran</h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={tanggalBayar}
                onChange={(e) => setTanggalBayar(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Keluar dari</label>
              <select
                value={caraBayar}
                onChange={(e: any) => setCaraBayar(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white"
              >
                <option value="Kas">Kas Bendahara</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Catatan Pengeluaran
              </label>
              <input
                type="text"
                placeholder="Misal: Bayar Token listrik"
                value={paymentInfo}
                onChange={(e) => setPaymentInfo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            {/* Upload Gambar Bukti Transfer */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Bukti Lampiran (Upload Foto)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="bukti-transfer-upload"
              />

              {!imagePreview ? (
                <label
                  htmlFor="bukti-transfer-upload"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition group"
                >
                  <UploadCloud size={24} className="text-slate-400 group-hover:text-emerald-600 transition" />
                  <span className="mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Pilih Berkas Lampiran
                  </span>
                  <span className="text-[9px] text-slate-400">Format JPG, PNG (Maks 3MB)</span>
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2">
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900/10">
                    <img
                      src={imagePreview}
                      alt="Preview Bukti"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <ImageIcon size={12} /> Gambar siap diunggah
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

          {/* Total Ringkasan Pembayaran */}
<div className="pt-2 border-t border-slate-100 dark:border-slate-800">


  {/* Total Nominal: IPL mengambil calculation.total, NON-IPL mengambil input manual */}
  <div className="flex justify-between items-center">
    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
      Total Nominal:
    </span>
    <span className="text-lg font-black text-emerald-600">
      {
        money(Number(manualAmount) || 0)
        }
    </span>
  </div>
</div>

<button
  type="submit"
  disabled={isSubmitDisabled}
  className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
>
  {submitting ? (
    <>
      <span className="animate-spin">⏳</span>
      <span>Menyimpan Transaksi...</span>
    </>
  ) : (
    <span>Simpan Transaksi</span>
  )}
</button>

              {/* MODAL HISTORI PEMBAYARAN IPL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <ReceiptText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Histori Transaksi IPL: {selectedBlok}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {currentWarga?.nama} · {currentWarga?.korwil}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Tabel Histori */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {historyList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada catatan riwayat transaksi pembayaran di sistem untuk unit ini.
                </div>
              ) : (
                historyList
                .slice()
                .sort((a, b) => a.pmonth - b.pyear || a.pmonth - b.pmonth)
                 
                .map((item, idx) => (
                  <div
                    key={`${item.transId}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-xs transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white text-xs">
                          {BULAN[item.pmonth - 1] || `Bulan ${item.pmonth}`} {item.pyear}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            item.status === "C"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              :   item.status === "R"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              
                          }`}
                        >
                          {item.status === "C" ? "Verified" : item.status === "R" ? "Lunas" : item.status === "P" ? "Jatuh tempo" : item.status === "O" ? "Belum bayar" : `Status: ${item.status}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.keterangan !== "-" ? item.keterangan : `IPL ${item.blokId}`} · {item.paymethod} · Tgl: {item.paidDate}
                      </p>
                      {item.invoice && item.invoice !== "-" && (
                        <p className="text-[10px] font-mono text-slate-400">
                          No. Ref: {item.invoice}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50">
                      <span className="font-black text-slate-800 dark:text-emerald-400 text-xs">
                        {money(item.amount)}
                      </span>
                      {item.lampiran && item.lampiran !== "-" && item.lampiran.startsWith("http") && (
                        <a
                          href={item.lampiran}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline mt-0.5"
                        >
                          <ExternalLink size={10} />
                          Bukti Bayar
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                Total tercatat: <strong>{historyList.length} transaksi</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

          </div>
        </div>
      </form>
    </div>
  );
}