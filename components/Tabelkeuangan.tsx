'use client';

import { useState, useEffect } from 'react';

interface KeuanganDetail {
  header: string;  
  account: string;
  keterangan: string;
  jan: string | number; feb: string | number; mar: string | number; apr: string | number;
  mei: string | number; jun: string | number; jul: string | number; agu: string | number;
  sep: string | number; okt: string | number; nov: string | number; des: string | number;
  [key: string]: any; // Izinkan indeks string dinamis untuk filter bulan
}

interface IplSummary {
  tahun: string;
  bulan: string;
  cash: string | number;
  transfer: string | number;
  total: string | number;
}

export default function TransparansiTables() {
  const [activeTab, setActiveTab] = useState<'detail' | 'summary'>('detail');
  const [loading, setLoading] = useState(false);
  const [dataKeuangan, setDataKeuangan] = useState<KeuanganDetail[]>([]);
  const [dataIpl, setDataIpl] = useState<IplSummary[]>([]);

  // State baru untuk filter bulan (default 'all' menampilkan semua bulan Jan-Des)
  const [selectedBulan, setSelectedBulan] = useState<string>('all');

  const SHEETDB_URL = process.env.NEXT_PUBLIC_SHEETDB_URL;

  // Daftar bulan untuk looping dropdown dan pengecekan kolom
  const listPilihanBulan = [
    { id: '1', nama: 'Januari' },
    { id: '2', nama: 'Februari' },
    { id: '3', nama: 'Maret' },
    { id: '4', nama: 'April' },
    { id: '5', nama: 'Mei' },
    { id: '6', nama: 'Juni' },
    { id: '7', nama: 'Juli' },
    { id: '8', nama: 'Agustus' },
    { id: '9', nama: 'September' },
    { id: '10', nama: 'Oktober' },
    { id: '11', nama: 'November' },
    { id: '12', nama: 'Desember' },
  ];

  const formatRupiah = (nilai: any) => {
    const angka = Number(nilai ?? 0);
    if (angka === 0) return '-';
    return new Intl.NumberFormat('id-ID', {  maximumFractionDigits: 0 }).format(angka); //style: 'currency', currency: 'IDR',
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!SHEETDB_URL) return;
      setLoading(true);
      try {
        if (activeTab === 'detail') {
          const res = await fetch(`${SHEETDB_URL}?sheet=detail_lpj`);
          const data = await res.json();
           data;
          if (Array.isArray(data)) setDataKeuangan(data);
        } else {
          const res = await fetch(`${SHEETDB_URL}?sheet=summary_ipl`);
          const data = await res.json();
          if (Array.isArray(data)) setDataIpl(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data tabel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div className="mt-12">
      {/* Menu Navigasi Dua Tab */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition ${
            activeTab === 'detail' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          📋 LPJ Keuangan
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition ${
            activeTab === 'summary' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          📊 Rekap Pemasukan IPL
        </button>
      </div>

        {/* FILTER PANEL (Hanya muncul jika Tab Summary Aktif) */}
      {activeTab === 'detail' && !loading && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">Filter Tampilan Data:</div>
          <div className="flex items-center gap-2">
            <label htmlFor="bulan-select" className="text-xs text-slate-500 font-medium">Pilih Bulan:</label>
            <select
              id="bulan-select"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl p-2 px-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">🗓️ Tampilkan Semua Bulan (Jan-Des)</option>
              {listPilihanBulan.map((b) => (
                <option key={b.nama} value={b.nama}>{b.nama}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* Konten Loading / Tabel */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xs text-slate-400 mt-2">Mengambil data dari Google Sheets...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* TAB 1 */}
          {activeTab === 'detail' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-sm font-semibold">
                    <th className="p-4">Account</th>
                    <th className="p-4">Keterangan</th>

                    {/* Render Header Bulan secara dinamis berdasarkan filter select */}
                    {selectedBulan === 'all' ? (
                      listPilihanBulan.map((b) => <th key={b.nama} className="p-3 font-semibold text-slate-600 bg-slate-50">{b.nama.toUpperCase()}</th>)
                    ) : (
                      <th className="p-3 font-bold text-blue-800 bg-blue-50/50 underline decoration-blue-500">
                        {selectedBulan.toUpperCase()}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {dataKeuangan.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-400">Belum ada data detail.</td></tr>
                  ) : (
                    dataKeuangan.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.header?.toString() === 'T' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>{item.account}</span>
                        </td>
                        
                        <td className="p-4"> 
                        <span className={`max-w-xs truncate ${
                            item.header?.toString() === 'T' ? 'max-w-xs truncate font-bold font-underline' : 'max-w-xs truncate'
                          }`}>{item.keterangan}</span>
                        </td>
                       
                        {/* Render Isi Sel Data Bulan secara dinamis berdasarkan filter select */}
                        {selectedBulan === 'all' ? (
                          listPilihanBulan.map((b) => (
                            <td key={b.nama} className="p-3 border-r border-slate-50 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                           item.header?.toString() === 'T' ? 'max-w-xs truncate font-bold font-underline' : 'max-w-xs truncate'
                          }`}> {formatRupiah(item[b.nama])}</span>
                            </td>
                          ))
                        ) : (
                          <td className="p-3 bg-blue-50/20 text-slate-900 text-sm text-right"> 
                               <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                           item.header?.toString() === 'T' ? 'max-w-xs truncate font-bold font-underline' : 'max-w-xs truncate'
                          }`}>  {formatRupiah(item[selectedBulan])}</span>
                            </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2 */}
          {activeTab === 'summary' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto min-w-[1200px] text-center text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-center">
                    <th className="p-3 text-left sticky left-0 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">Tahun</th>
                    <th className="p-3 text-left sticky left-[4.5rem] bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">Bulan</th>
                    <th className="p-3 bg-emerald-50 text-emerald-800">Cash</th>
                    <th className="p-3 bg-blue-50 text-blue-800">Transfer</th>
                    <th className="p-3 bg-blue-50 text-blue-800">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {dataIpl.length === 0 ? (
                    <tr><td colSpan={16} className="p-6 text-center text-slate-400">Belum ada data summary IPL Korwil.</td></tr>
                  ) : (
                    dataIpl.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 text-left font-bold text-slate-800 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{item.tahun}</td>
                        <td className="p-3 text-left font-semibold text-blue-600 sticky left-[4.5rem] bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{item.bulan}</td>
                        <td className="p-3 bg-emerald-50/40 text-emerald-700 font-bold text-right">{formatRupiah(item.cash)}</td>
                        <td className="p-3 bg-blue-50/40 text-blue-700 font-bold text-right">{formatRupiah(item.transfer)}</td>
                        <td className="p-3 bg-blue-50/40 text-blue-700 font-bold text-right">{formatRupiah(item.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}