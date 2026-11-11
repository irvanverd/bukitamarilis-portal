"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
  UserCheck,
} from "lucide-react";

interface DashboardProps {
  // Callback untuk berpindah tab atau memicu modal form
  onNavigate?: (targetTab: string) => void;
  userName?: string;
}

export default function DashboardKeuangan({ onNavigate, userName }: DashboardProps) {
  const [displayName, setDisplayName] = useState<string>(userName || "Admin");

  // Ambil nama user login dari props atau session/localStorage
  useEffect(() => {
    if (!userName) {
      try {
        const storedUser = localStorage.getItem("user_login") || localStorage.getItem("username");
        if (storedUser) {
          setDisplayName(storedUser);
        }
      } catch (e) {
        console.warn("Gagal membaca user login:", e);
      }
    }
  }, [userName]);

  const handleAction = (tabKey: string) => {
    if (onNavigate) {
      onNavigate(tabKey);
    } else {
      // Fallback jika navigasi menggunakan custom event atau URL query
      window.dispatchEvent(new CustomEvent("changeAdminTab", { detail: tabKey }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* ================= WELCOME BANNER ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/10">
            <ShieldCheck size={14} />
            <span>Portal Manajemen Kas RT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang, <span className="text-emerald-400">{displayName}</span>! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Pusat operasional dan pencatatan kas lingkungan. Pilih menu di bawah untuk mencatat
            penerimaan iuran warga atau input transaksi pengeluaran kas.
          </p>
        </div>

        {/* Elemen Dekoratif Background */}
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* ================= ACTION BUTTON CARDS ================= */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Menu Akses Cepat Transaksi
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* CARD 1: INPUT IPL & PENERIMAAN NON-IPL */}
          <button
            type="button"
            onClick={() => handleAction("input-ipl")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/20 dark:text-emerald-400">
                <ArrowDownLeft size={28} />
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-emerald-600 group-hover:text-white dark:bg-slate-800">
                <ChevronRight size={16} />
              </span>
            </div>

            <div className="mt-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-400">
                  Input Transaksi IPL
                </span>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Pemasukan
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Catat pembayaran iuran bulanan warga (IPL reguler, tunggakan, maupun non-IPL)
                lengkap dengan upload bukti transfer.
              </p>
            </div>
          </button>

          {/* CARD 2: PENGELUARAN KAS */}
          <button
            type="button"
            onClick={() => handleAction("pengeluaran")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-500/20 dark:text-rose-400">
                <ArrowUpRight size={28} />
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-rose-600 group-hover:text-white dark:bg-slate-800">
                <ChevronRight size={16} />
              </span>
            </div>

            <div className="mt-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors dark:text-white dark:group-hover:text-rose-400">
                  Input Pengeluaran
                </span>
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  Kas Keluar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Catat pengeluaran kas operasional RT, gaji satpam, kebersihan, pemeliharaan LPJ,
                dan beban lainnya.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ================= SHORTCUT BROWSER / WARGA ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
        <span className="text-xs text-slate-500 text-center sm:text-left">
          Perlu melihat mutasi rekening atau data kependudukan?
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAction("browser-keuangan")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <FileSpreadsheet size={13} className="text-emerald-600" />
            <span>Browser Keuangan</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction("warga")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <UserCheck size={13} className="text-sky-600" />
            <span>Data Warga</span>
          </button>
        </div>
      </div>
    </div>
  );
}