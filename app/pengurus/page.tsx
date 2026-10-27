"use client";

import React, { useState } from "react";
import Image from "next/image";
interface PengurusItem {
  tingkat: string;
  jabatan: string;
  nama: string[];
  kategori: "Pimpinan & Pengarah" | "Pengurus Inti & Penunjang" | "Seksi / Bidang" | "Koordinator Wilayah";
}

const dataPengurus: PengurusItem[] = [
  // 1. Pimpinan & Pengarah
  {
    tingkat: "Pengarah",
    jabatan: "Pembina",
    nama: ["Ketua RW XIV"],
    kategori: "Pimpinan & Pengarah",
  },
  {
    tingkat: "Penasihat",
    jabatan: "Penasihat",
    nama: ["1. Ichwan Firdaus", "2. H. Komang", "3. Rudy Setyo W."],
    kategori: "Pimpinan & Pengarah",
  },
  {
    tingkat: "Ketua",
    jabatan: "Ketua RT",
    nama: ["Dani Suhasni"],
    kategori: "Pimpinan & Pengarah",
  },

  // 2. Pengurus Inti & Penunjang
  {
    tingkat: "Inti",
    jabatan: "Sekretaris",
    nama: ["Komaruzaman"],
    kategori: "Pengurus Inti & Penunjang",
  },
  {
    tingkat: "Inti",
    jabatan: "Bendahara",
    nama: ["1. Ibu Qori", "2. Ibu Dwi Armiya"],
    kategori: "Pengurus Inti & Penunjang",
  },
  {
    tingkat: "Pengawas",
    jabatan: "Auditor",
    nama: ["M. Yasin"],
    kategori: "Pengurus Inti & Penunjang",
  },
  {
    tingkat: "Penunjang",
    jabatan: "SOP & KPI",
    nama: ["Ardi C."],
    kategori: "Pengurus Inti & Penunjang",
  },

  // 3. Seksi-Seksi / Bidang Operasional
  {
    tingkat: "Seksi",
    jabatan: "Sie Kesejahteraan Sosial",
    nama: ["1. Irpan Hilmi", "2. Maman A.", "3. Ady S.", "4. Idrus"],
    kategori: "Seksi / Bidang",
  },
  {
    tingkat: "Seksi",
    jabatan: "Sie Pemuda, Olahraga, dan Kesenian",
    nama: ["1. Sidik M.", "2. Vicky", "3. Abisena", "4. Sonny Shine"],
    kategori: "Seksi / Bidang",
  },
  {
    tingkat: "Seksi",
    jabatan: "Sie Pembangunan & Lingkungan",
    nama: [
      "1. Sipurianto",
      "2. Maman S.",
      "3. M. Yusuf",
      "4. Bayu W.",
      "5. M. Arif",
      "6. Milsiono",
    ],
    kategori: "Seksi / Bidang",
  },
  {
    tingkat: "Seksi",
    jabatan: "Sie Sarpras & Fasilitas",
    nama: ["1. Wawan K.", "2. Feri A.", "3. Dedy R.", "4. Z. Irkham"],
    kategori: "Seksi / Bidang",
  },
  {
    tingkat: "Seksi",
    jabatan: "Sie Ketentraman dan Ketertiban",
    nama: ["1. Theofilus", "2. Agus Wira", "3. Arief S."],
    kategori: "Seksi / Bidang",
  },
  {
    tingkat: "Seksi",
    jabatan: "Sie Kependudukan dan IT",
    nama: ["1. Irvan V.", "2. Tatang T."],
    kategori: "Seksi / Bidang",
  },
  {
    tingkat: "Seksi",
    jabatan: "Sie Pemberdayaan Perempuan",
    nama: ["1. Ibu Susi", "2. Ibu Aminah"],
    kategori: "Seksi / Bidang",
  },
  {
    tingkat: "Seksi",
    jabatan: "Sie Humas dan Sosial Media",
    nama: ["Erry P."],
    kategori: "Seksi / Bidang",
  },

  // 4. Koordinator Wilayah (Korwil)
  {
    tingkat: "Korwil",
    jabatan: "KORWIL I",
    nama: ["Sudarmanto"],
    kategori: "Koordinator Wilayah",
  },
  {
    tingkat: "Korwil",
    jabatan: "KORWIL II",
    nama: ["Alex S."],
    kategori: "Koordinator Wilayah",
  },
  {
    tingkat: "Korwil",
    jabatan: "KORWIL III",
    nama: ["Andro"],
    kategori: "Koordinator Wilayah",
  },
  {
    tingkat: "Korwil",
    jabatan: "KORWIL IV",
    nama: ["Niko"],
    kategori: "Koordinator Wilayah",
  },
];

export default function PengurusPage() {
  const [filterKategori, setFilterKategori] = useState<string>("Semua");
  const [keyword, setKeyword] = useState<string>("");

  const kategoriList = [
    "Semua",
    "Pimpinan & Pengarah",
    "Pengurus Inti & Penunjang",
    "Seksi / Bidang",
    "Koordinator Wilayah",
  ];

  const dataFiltered = dataPengurus.filter((item) => {
    const matchKategori =
      filterKategori === "Semua" || item.kategori === filterKategori;
    const matchSearch =
      item.jabatan.toLowerCase().includes(keyword.toLowerCase()) ||
      item.nama.some((n) => n.toLowerCase().includes(keyword.toLowerCase()));
    return matchKategori && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Identitas & Logo */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-white shadow-md border border-slate-200 overflow-hidden hover:scale-105 transition-transform duration-200">
            <Image
              src="/assets/logo-rt.png"
              alt="Logo RT. 07/XIV Bukit Amarilis"
              fill
              className="object-cover rounded-full"
              priority
            />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs uppercase tracking-wider mb-1">
            Periode 2026 – 2030
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            STRUKTUR ORGANISASI KEPENGURUSAN
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600">
            RT. 007 / RW. XIV – BUKIT AMARILIS, SINGAJAYA, JONGGOL
          </p>
        </div>

        {/* Filter dan Pencarian */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {kategoriList.map((kat) => (
              <button
                key={kat}
                type="button"
                onClick={() => setFilterKategori(kat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterKategori === kat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari jabatan atau nama..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3.5 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Tabel Data Hierarki Pengurus */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="max-h-[72vh] overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <th className="sticky top-0 z-30 bg-slate-100 p-4 w-64 min-w-[200px]">Jabatan</th>
                  <th className="sticky top-0 z-30 bg-slate-100 p-4 min-w-[280px]">Nama Pengurus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dataFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Tidak ditemukan data pengurus yang sesuai.
                    </td>
                  </tr>
                ) : (
                  dataFiltered.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >

                     

                      <td className="p-4 align-top font-bold text-slate-800">
                        {item.jabatan}
                      </td>

                      <td className="p-4 align-top">
                        <div className="space-y-1">
                          {item.nama.map((nm, nIdx) => (
                            <div
                              key={nIdx}
                              className="text-slate-700 font-medium leading-relaxed"
                            >
                              {nm}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}