"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elemen Dekoratif di Latar Belakang */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-slate-200 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        {/* Badge Status */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Status 404
        </div>

        {/* Teks Angka Utama */}
        <h1 className="text-7xl sm:text-8xl font-black text-slate-800 tracking-tight mb-2">
          4<span className="text-blue-600">0</span>4
        </h1>

        {/* Judul & Deskripsi */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">
          Halaman Belum Tersedia
        </h2>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-8">
          Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tautan yang Anda tuju salah ketik.
        </p>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 active:scale-95 transition-all"
          >
            Kembali
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all text-center"
          >
            Ke Beranda
          </Link>
        </div>

        {/* Bantuan Tambahan */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Butuh bantuan? Silakan hubungi{" "}
          <Link href="https://wa.me/6285810761663?text=Halo%20Admin%20Portal%20Warga%20RT%2007%2C%20saya%20ingin%20bertanya%20mengenai..."
   className="text-blue-600 hover:underline font-medium">
            Tim Dukungan
          </Link>
        </div>
      </div>
    </main>
  );
}