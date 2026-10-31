"use client";

import { useState, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  Plus,
  Receipt,
  Search,
  Wallet,
  X,
} from "lucide-react";

export interface TransaksiItem {
  transno: string;
  document: string; // Misal: Nomor Invoice, Kwitansi, atau Blok Unit (AR.16/09)
  kategori: string;
  tanggalentry: string;
  keterangan: string;
  amount: number;
  status: "Lunas" | "Menunggu" | "Dibatalkan";
  foto?: string; // URL / Base64 foto bukti
}

interface KeuanganBrowserProps {
  onTambahJurnal: (tipe: "masuk" | "keluar") => void;
}

const money = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export default function KeuanganBrowser({ onTambahJurnal }: KeuanganBrowserProps) {
  const [activeSubTab, setActiveSubTab] = useState<"masuk" | "keluar">("masuk");

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("SEMUA");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State Modal View / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedItem, setSelectedItem] = useState<TransaksiItem | null>(null);

  // Data Demo Pemasukan (Termasuk Kategori IPL)
  const [listPemasukan, setListPemasukan] = useState<TransaksiItem[]>([
    {
      transno: "TRX-IN-202610-001",
      document: "IPL AR.16/09",
      kategori: "IPL Warga",
      tanggalentry: "2026-10-28",
      keterangan: "Pembayaran IPL Okt 2026 a/n Irvan Verdiansyah",
      amount: 110000,
      status: "Lunas",
    },
    {
      transno: "TRX-IN-202610-002",
      document: "IPL AR.04/12",
      kategori: "IPL Warga",
      tanggalentry: "2026-10-28",
      keterangan: "IPL Okt 2026 a/n Budi Santoso",
      amount: 110000,
      status: "Lunas",
    },
    {
      transno: "TRX-IN-202610-003",
      document: "KW-DNS-08",
      kategori: "Donasi / Sumbangan",
      tanggalentry: "2026-10-25",
      keterangan: "Sumbangan warga pengaspalan jalan dari H. Rahmat",
      amount: 1500000,
      status: "Lunas",
    },
    {
      transno: "TRX-IN-202610-004",
      document: "SW-TND-02",
      kategori: "Sewa Fasilitas",
      tanggalentry: "2026-10-22",
      keterangan: "Sewa lapangan badminton untuk turnamen RT tetangga",
      amount: 350000,
      status: "Lunas",
    },
    {
      transno: "TRX-IN-202610-005",
      document: "IPL AR.02/05",
      kategori: "IPL Warga",
      tanggalentry: "2026-10-20",
      keterangan: "Pembayaran IPL Tunai Korwil 1",
      amount: 110000,
      status: "Menunggu",
    },
  ]);

  // Data Demo Pengeluaran
  const [listPengeluaran, setListPengeluaran] = useState<TransaksiItem[]>([
    {
      transno: "TRX-OUT-202610-001",
      document: "NOTA-PJU-042",
      kategori: "Perbaikan Fasilitas / PJU",
      tanggalentry: "2026-10-26",
      keterangan: "Beli 5 pcs lampu Philips LED 40W PJU Blok AR",
      amount: 375000,
      status: "Lunas",
    },
    {
      transno: "TRX-OUT-202610-002",
      document: "SLIP-SEC-10",
      kategori: "Honor Satpam",
      tanggalentry: "2026-10-25",
      keterangan: "Gaji 2 orang petugas keamanan pos utama periode Oktober",
      amount: 3600000,
      status: "Lunas",
    },
    {
      transno: "TRX-OUT-202610-003",
      document: "NOTA-KBR-11",
      kategori: "Kebersihan & Sampah",
      tanggalentry: "2026-10-24",
      keterangan: "Iuran retribusi TPS & operasional gerobak sampah",
      amount: 450000,
      status: "Lunas",
    },
  ]);

  // Opsi Kategori Dinamis per Tab
  const kategoriOptions = useMemo(() => {
    if (activeSubTab === "masuk") {
      return ["SEMUA", "IPL Warga", "Donasi / Sumbangan", "Sewa Fasilitas", "Bunga Bank", "Lain-lain"];
    }
    return [
      "SEMUA",
      "Honor Satpam",
      "Kebersihan & Sampah",
      "Perbaikan Fasilitas / PJU",
      "Pembelian Inventaris RT",
      "Konsumsi & Acara Warga",
      "Biaya Admin Bank",
    ];
  }, [activeSubTab]);

  // Filter Data
  const currentDataset = activeSubTab === "masuk" ? listPemasukan : listPengeluaran;

  const filteredData = useMemo(() => {
    return currentDataset.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.transno.toLowerCase().includes(q) ||
        item.document.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q);

      const matchKategori = filterKategori === "SEMUA" || item.kategori === filterKategori;

      const itemDate = new Date(item.tanggalentry).getTime();
      const matchStartDate = !startDate || itemDate >= new Date(startDate).getTime();
      const matchEndDate = !endDate || itemDate <= new Date(endDate).getTime();

      return matchSearch && matchKategori && matchStartDate && matchEndDate;
    });
  }, [currentDataset, searchQuery, filterKategori, startDate, endDate]);

  // Total Ringkasan
  const totalAmount = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredData]);

  // Buka Modal View / Edit
  const handleOpenModal = (item: TransaksiItem, mode: "view" | "edit") => {
    setSelectedItem(item);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (activeSubTab === "masuk") {
      setListPemasukan((prev) =>
        prev.map((t) => (t.transno === selectedItem.transno ? selectedItem : t))
      );
    } else {
      setListPengeluaran((prev) =>
        prev.map((t) => (t.transno === selectedItem.transno ? selectedItem : t))
      );
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman & Tombol Aksi Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt size={22} className="text-emerald-600" />
            Browser Buku Keuangan RT
          </h1>
          <p className="text-xs text-slate-500">
            Pusat monitoring seluruh riwayat transaksi kas masuk (termasuk IPL) dan kas keluar.
          </p>
        </div>

        {/* Tombol Tambah Jurnal (Mengarahkan ke Form Jurnal Entry) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTambahJurnal(activeSubTab)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <Plus size={15} />
            <span>Tambah Jurnal {activeSubTab === "masuk" ? "Pemasukan" : "Pengeluaran"}</span>
          </button>
        </div>
      </div>

      {/* Switcher Tab Pemasukan & Pengeluaran */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => {
            setActiveSubTab("masuk");
            setFilterKategori("SEMUA");
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === "masuk"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-600/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ArrowDownLeft size={16} className="text-emerald-600" />
          <span>Buku Kas Masuk (IPL & Lainnya)</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("keluar");
            setFilterKategori("SEMUA");
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeSubTab === "keluar"
              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 ring-1 ring-rose-600/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ArrowUpRight size={16} className="text-rose-600" />
          <span>Buku Kas Keluar (Beban & Sarpras)</span>
        </button>
      </div>

      {/* Bar Filter Kategori, Tanggal & Search */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Transaksi, Dokumen, Ket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Filter Kategori */}
        <div className="relative">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {kategoriOptions.map((kat) => (
              <option key={kat} value={kat}>
                {kat === "SEMUA" ? "Semua Kategori" : kat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Tanggal Dari */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Dari:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-700 focus:outline-none dark:text-slate-200"
          />
        </div>

        {/* Filter Tanggal Sampai */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Sampai:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-700 focus:outline-none dark:text-slate-200"
          />
        </div>
      </div>

      {/* Ringkasan Subtotal Hasil Filter */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-3.5 dark:bg-slate-800/60 text-xs">
        <span className="text-slate-600 dark:text-slate-400">
          Ditemukan <strong>{filteredData.length}</strong> transaksi
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Total Nominal:</span>
          <span
            className={`font-black text-sm ${
              activeSubTab === "masuk" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {money(totalAmount)}
          </span>
        </div>
      </div>

      {/* Tabel Data Keuangan */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3.5 font-bold">Trans No.</th>
                <th className="px-4 py-3.5 font-bold">Document</th>
                <th className="px-4 py-3.5 font-bold">Kategori</th>
                <th className="px-4 py-3.5 font-bold">Tanggal Entry</th>
                <th className="px-4 py-3.5 font-bold">Keterangan</th>
                <th className="px-4 py-3.5 font-bold">Amount</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((t) => (
                  <tr key={t.transno} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {t.transno}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {t.document}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {t.kategori}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {t.tanggalentry}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {t.keterangan}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {money(t.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          t.status === "Lunas"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : t.status === "Menunggu"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(t, "view")}
                          title="View Detail"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(t, "edit")}
                          title="Edit Transaksi"
                          className="rounded-lg border border-slate-200 p-1.5 text-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View / Edit Transaksi */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalMode === "view" ? "Detail Transaksi" : "Edit Transaksi"}
                </h3>
                <p className="font-mono text-xs text-slate-400">{selectedItem.transno}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Dokumen / No. Referensi
                </label>
                <input
                  type="text"
                  disabled={modalMode === "view"}
                  value={selectedItem.document}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, document: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-800/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kategori
                  </label>
                  <input
                    type="text"
                    disabled={modalMode === "view"}
                    value={selectedItem.kategori}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, kategori: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-800/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tanggal Entry
                  </label>
                  <input
                    type="date"
                    disabled={modalMode === "view"}
                    value={selectedItem.tanggalentry}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, tanggalentry: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-800/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Jumlah (Amount)
                </label>
                <input
                  type="number"
                  disabled={modalMode === "view"}
                  value={selectedItem.amount}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, amount: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-800/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  disabled={modalMode === "view"}
                  value={selectedItem.keterangan}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, keterangan: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-800/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status Transaksi
                </label>
                <select
                  disabled={modalMode === "view"}
                  value={selectedItem.status}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      status: e.target.value as "Lunas" | "Menunggu" | "Dibatalkan",
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-800/50"
                >
                  <option value="Lunas">Lunas</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {modalMode === "view" ? "Tutup" : "Batal"}
                </button>
                {modalMode === "edit" && (
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    Simpan Perubahan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}