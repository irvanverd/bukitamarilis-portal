"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
  TreePine,
  Sparkles,
  ArrowRight,
  Target,
  Compass,
} from "lucide-react";

const misiList = [
  {
    nomor: "01",
    judul: "Transparansi & Akuntabilitas",
    deskripsi:
      "Mewujudkan tata kelola administrasi dan keterbukaan laporan keuangan lingkungan yang dapat diakses dengan mudah oleh seluruh warga.",
    icon: ShieldCheck,
    color: "from-blue-500 to-indigo-600",
  },
  {
    nomor: "02",
    judul: "Kerukunan & Kebersamaan Sosial",
    deskripsi:
      "Mempererat tali silaturahmi antarwarga melalui kegiatan keagamaan, olahraga, kepemudaan, serta perayaan hari besar secara inklusif.",
    icon: HeartHandshake,
    color: "from-emerald-500 to-teal-600",
  },
  {
    nomor: "03",
    judul: "Keamanan & Ketertiban Berkelanjutan",
    deskripsi:
      "Meningkatkan sistem keamanan lingkungan yang tanggap, tertib, dan bersinergi dengan aparat keamanan wilayah serta pengelola kawasan.",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-600",
  },
  {
    nomor: "04",
    judul: "Lingkungan Asri, Bersih & Nyaman",
    deskripsi:
      "Menjaga kebersihan prasarana bersama, memelihara fasilitas umum/sosial, serta menggalakkan kepedulian terhadap lingkungan hijau.",
    icon: TreePine,
    color: "from-purple-500 to-pink-600",
  },
];

const nilaiNilai = [
  {
    istilah: "Guyub Rukun",
    keterangan: "Mengedepankan musyawarah mufakat dan semangat kekeluargaan dalam setiap keputusan.",
  },
  {
    istilah: "Gotong Royong",
    keterangan: "Bahu-membahu berpartisipasi aktif dalam kegiatan sosial dan pemeliharaan lingkungan.",
  },
  {
    istilah: "Inklusif & Peduli",
    keterangan: "Menerima keberagaman dan peka terhadap kebutuhan warga dari berbagai kalangan usia.",
  },
];

export default function VisiMisiPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
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

          <div className="space-y-1.5">
            <div className="inline-block px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs uppercase tracking-wider">
              Periode 2026 – 2030
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Visi & Misi Kepengurusan
            </h1>

            <p className="text-sm sm:text-base font-semibold text-slate-600">
              RT. 007 / RW. XIV – BUKIT AMARILIS, SINGAJAYA, JONGGOL
            </p>

            <p className="text-xs sm:text-sm font-medium text-slate-400 italic">
              &ldquo;Bersatu Membangun Amarilis&rdquo;
            </p>
          </div>
        </div>

        {/* Bagian Visi */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 tracking-wide uppercase">
              <Compass className="w-3.5 h-3.5 text-blue-300" />
              Visi Utama
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug sm:leading-tight">
              &ldquo;Mewujudkan Lingkungan RT 007 Bukit Amarilis yang Rukun, Aman, Nyaman, dan Terbuka Berlandaskan Semangat Gotong Royong.&rdquo;
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto pt-2">
              Membangun ruang hunian yang harmonis di mana setiap warga merasa saling memiliki, aman berkegiatan, dan terhubung secara erat.
            </p>
          </div>
        </section>

        {/* Bagian Misi */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              Langkah Nyata
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Misi Kepengurusan
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Empat pilar utama yang menjadi pedoman operasional seluruh jajaran pengurus RT:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {misiList.map((misi) => {
              const IconComponent = misi.icon;
              return (
                <div
                  key={misi.nomor}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${misi.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black text-slate-200 group-hover:text-slate-300 transition-colors">
                        {misi.nomor}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800">
                      {misi.judul}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {misi.deskripsi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Nilai Dasar (Core Values) */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">
              Nilai Budaya Warga Amarilis
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {nilaiNilai.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2"
              >
                <div className="text-sm font-bold text-slate-800">
                  {item.istilah}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.keterangan}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tautan Navigasi Cepat ke Susunan Pengurus */}
        <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-blue-950">
             
            </h4>
            <p className="text-xs text-blue-700">
              Lihat bagan dan kontak penanggung jawab masing-masing bidang.
            </p>
          </div>

          <Link
            href="/pengurus"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            Lihat Struktur Pengurus
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}