"use client";

import React, { useState } from "react";

interface KontakItem {
  nama: string;
  nomor: string[];
  keterangan?: string;
}

interface KategoriKontak {
  kategori: string;
  daftar: KontakItem[];
}

const dataKontakPenting: KategoriKontak[] = [
  {
    kategori: "🚨 Darurat & Keamanan",
    daftar: [
      { nama: "Hallo Amarilis", nomor: ["6285810761663"] }, 
      { nama: "Pak Yaman Security Bukit Amarilis", nomor: ["08561469841"] }, 
      { nama: "Keamanan & Patroli Pusat CI", nomor: ["021-89930754"] },
      { nama: "Humas CI City (Bp. Dul Gafar)", nomor: ["081383383839"] },
      { nama: "Pemadam Kebakaran", nomor: ["021-88957805"] },
      { nama: "Polsek Jonggol", nomor: ["021-89931174"] },
      { nama: "Mobil Patroli Polsek Jonggol", nomor: ["085814229428"] },
      { nama: "Polsek Cileungsi", nomor: ["021-8230861"] },
    ],
  },
  {
    kategori: "🏢 Pengelola & Utilitas Publik",
    daftar: [
      {
        nama: "Kantor Pemasaran & Purna Jual CI",
        nomor: ["021-35930808", "021-89930808", "021-89930606"],
      },
      { nama: "PDAM Citra Indah", nomor: ["021-89930557"] },
      { nama: "PDAM Cileungsi", nomor: ["021-823262"] },
      { nama: "PDAM Cibinong", nomor: ["021-87915270"] },
      { nama: "PLN Gangguan", nomor: ["021-8230391"] },
      {
        nama: "PLN UPJ Jonggol",
        nomor: ["021-89931531", "021-89930273", "021-89930275"],
        keterangan: "Jl. Letkol Murlin",
      },
      {
        nama: "PLN UPJ Cileungsi",
        nomor: ["021-8236513"],
        keterangan: "Jl. Camat Enjam No. 13",
      },
      { nama: "Informasi Telkom", nomor: ["021-8230000", "021-8230100"] },
    ],
  },
  {
    kategori: "🚐 Transportasi Kawasan & Feeder Bus",
    daftar: [
      { nama: "Mobil Kawasan 1", nomor: ["0822-1386-5354"] },
      { nama: "Mobil Kawasan 2", nomor: ["0818-0299-5653"] },
      { nama: "Mobil Kawasan 3", nomor: ["0899-9599-493"] },
      { nama: "Mobil Kawasan 4", nomor: ["0812-8839-6239"] },
      { nama: "Driver Feeder - Pak Salim", nomor: ["087770675661"] },
      { nama: "Driver Feeder - Pak Slamet", nomor: ["0878-xxxx-xxxx"] },
    ],
  },
  {
    kategori: "🔧 Jasa & Perbaikan Rumah",
    daftar: [
      {
        nama: "Service AC - Pak Ruswandi",
        nomor: ["081310232405"],
        keterangan: "Cluster Mahoni",
      },
      { nama: "Service AC - Mas Levy", nomor: ["089640032903"] },
      {
        nama: "Service AC - Pak Ucok",
        nomor: ["081294762887"],
        keterangan: "Cluster Heliconia",
      },
      {
        nama: "Service AC - Aliong (AccTeknik)",
        nomor: ["081511462220"],
        keterangan: "BBM: 23676B48",
      },
      { nama: "Tukang Listrik - Pak Seon", nomor: ["081316910748", "087873053102"] },
      { nama: "Tukang Listrik - Pak Herman", nomor: ["085715171254"] },
      {
        nama: "Service TV - Bpk Choiri",
        nomor: ["081381016017"],
        keterangan: "Cluster Akasia",
      },
      {
        nama: "Service TV - Bpk Dewa",
        nomor: ["08170109499"],
        keterangan: "Cluster Cempaka",
      },
      { nama: "Service TV - Pak Puji", nomor: ["08121929888"] },
      { nama: "Bor Air - Stevhen Kontruksi", nomor: ["081399571737"] },
      { nama: "Bor Air - Pak Sa'i", nomor: ["085215478117"] },
      { nama: "Bor Air - Toro Bor", nomor: ["081337500503"] },
      { nama: "Bor Air - Pak Muhadi", nomor: ["08158859378"] },
      { nama: "Sedot WC / Mampet", nomor: ["021-91793222", "081291579091"] },
      { nama: "Tukang Taman - W Ade & Saeful", nomor: ["081311315131"] },
    ],
  },
  {
    kategori: "💆 Pijat & Kesehatan Tradisional",
    daftar: [
      {
        nama: "Mamah Said / Christine Leo",
        nomor: ["087874350361", "082113052855"],
        keterangan: "Pijat Bayi, Wanita & Anak",
      },
      {
        nama: "Mbak Yanti",
        nomor: ["081370753150"],
        keterangan: "Graha Kartika (Bayi, Wanita, Anak)",
      },
      {
        nama: "Pak Tubagus",
        nomor: ["021-51199612"],
        keterangan: "Bukit Akasia (Bayi & Anak 09.00-12.00)",
      },
      {
        nama: "Ibu Maemunah",
        nomor: ["081299185882"],
        keterangan: "Cluster Azalea (Pijat Bayi)",
      },
    ],
  },
  {
    kategori: "🏫 Pendidikan / Sekolah",
    daftar: [
      { nama: "TK Islam Cikal Harapan", nomor: ["021-29096307"] },
      { nama: "TK Al-Idzhar 2", nomor: ["021-89940470"] },
      { nama: "SD Islam Cikal Harapan", nomor: ["021-29096309"] },
      { nama: "SD Muhammadiyah 4 Jonggol", nomor: ["085710779577"] },
      { nama: "SMPN 2 Citra Indah", nomor: ["021-89930925"] },
    ],
  },

  {
    kategori: "🏫 Rumah sakit / Klinik",
    daftar: [
      { nama: "RSUD Cileungsi — Informasi", nomor: ["(021) 8993-4668"] },
      { nama: "RS Permata Jonggol", nomor: ["(021) 89931222"] },
      { nama: "Ambulans / Darurat Medis", nomor: ["119"] },
      { nama: "Ambulans Masjid Nuroh AlDuwaihi", nomor: ["6285716889514"] },
    
    ],
  },
];

export default function KontakPentingPage() {
  const [pencarian, setPencarian] = useState("");

  const filteredData = dataKontakPenting
    .map((kat) => ({
      ...kat,
      daftar: kat.daftar.filter(
        (item) =>
          item.nama.toLowerCase().includes(pencarian.toLowerCase()) ||
          (item.keterangan &&
            item.keterangan.toLowerCase().includes(pencarian.toLowerCase())) ||
          item.nomor.some((n) => n.includes(pencarian))
      ),
    }))
    .filter((kat) => kat.daftar.length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Daftar Nomor Telepon Penting
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kawasan Citra Indah City & Sekitarnya
          </p>
        </div>

        {/* Input Pencarian Cepat */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari kontak, jasa, nomor..."
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tabel Utama Berdasarkan Kategori */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="max-h-[75vh] overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <th className="sticky top-0 z-30 bg-slate-100 p-3.5 w-1/3 min-w-[180px]">
                  Nama / Layanan
                </th>
                <th className="sticky top-0 z-30 bg-slate-100 p-3.5 min-w-[200px]">
                  Nomor Telepon
                </th>
                <th className="sticky top-0 z-30 bg-slate-100 p-3.5 w-1/3 min-w-[160px]">
                  Keterangan / Lokasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    Tidak ditemukan kontak yang cocok dengan kata kunci &quot;{pencarian}&quot;.
                  </td>
                </tr>
              ) : (
                filteredData.map((kat) => (
                  <React.Fragment key={kat.kategori}>
                    {/* Header Grup Kategori */}
                    <tr className="bg-slate-50/90 border-t border-b border-slate-200/80">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-xs font-bold text-slate-700 tracking-wide uppercase"
                      >
                        {kat.kategori}
                      </td>
                    </tr>

                    {/* Data Perorangan / Instansi */}
                    {kat.daftar.map((item, idx) => (
                      <tr
                        key={`${kat.kategori}-${idx}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-3.5 font-medium text-slate-800 align-top">
                          {item.nama}
                        </td>
                        <td className="p-3.5 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {item.nomor.map((no, noIdx) => (
                              <a
                                key={noIdx}
                                href={`tel:${no.replace(/[^0-9]/g, "")}`}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold tracking-wide border border-blue-200 transition-colors"
                              >
                                📞 {no}
                              </a>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500 text-xs leading-relaxed align-top">
                          {item.keterangan || "-"}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}