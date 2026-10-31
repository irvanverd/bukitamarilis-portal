"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

// 1. Data User & Hak Akses Hardcoded
interface AdminUser {
  username: string;
  role: "admin" | "korwil" | "bendahara";
  nama: string;
  allowedTabs: string[];
}

const STATIC_USERS: Record<string, AdminUser> = {
  // Full Akses
  ADMIN: {
    username: "ADMIN",
    role: "admin",
    nama: "Administrator Utama",
    allowedTabs: [
      "dashboard",
      "browser-keuangan",
      "input-ipl",
      "pemasukan",
      "pengeluaran",
      "warga",
      "users",
      "sarpras",
      "komplain",
      "surat",
    ],
  },
  // Role Korwil: Input-ipl, Data Warga, Komplain
  ALEX: {
    username: "ALEX",
    role: "korwil",
    nama: "Alex (Korwil)",
    allowedTabs: ["dashboard", "input-ipl", "warga", "komplain"],
  },
  SUDARMANTO: {
    username: "SUDARMANTO",
    role: "korwil",
    nama: "Sudarmanto (Korwil)",
    allowedTabs: ["dashboard", "input-ipl", "warga", "komplain"],
  },
  NIKO: {
    username: "NIKO",
    role: "korwil",
    nama: "Niko (Korwil)",
    allowedTabs: ["dashboard", "input-ipl", "warga", "komplain"],
  },
  ANDRO: {
    username: "ANDRO",
    role: "korwil",
    nama: "Andro (Korwil)",
    allowedTabs: ["dashboard", "input-ipl", "warga", "komplain"],
  },
  // Role Bendahara: Keuangan, Pemasukan, Pengeluaran
  QORI: {
    username: "QORI",
    role: "bendahara",
    nama: "Qori (Bendahara)",
    allowedTabs: [
      "dashboard",
      "browser-keuangan",
      "input-ipl",
      "pemasukan",
      "pengeluaran",
    ],
  },
  ARMIYA: {
    username: "ARMIYA",
    role: "bendahara",
    nama: "Armiya (Bendahara)",
    allowedTabs: [
      "dashboard",
      "browser-keuangan",
      "input-ipl",
      "pemasukan",
      "pengeluaran",
    ],
  },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const cleanUser = username.trim().toUpperCase();

    // Validasi User & Password
    if (!STATIC_USERS[cleanUser]) {
      setErrorMsg("Username tidak terdaftar sebagai petugas.");
      setIsLoading(false);
      return;
    }

    if (password !== "1234") {
      setErrorMsg("Kata sandi salah. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }

    // Simpan Sesi Login ke LocalStorage
    const userData = STATIC_USERS[cleanUser];
    localStorage.setItem(
      "admin_session",
      JSON.stringify({
        ...userData,
        loginAt: new Date().toISOString(),
      })
    );

    // Redirect ke Halaman Portal Admin
    setTimeout(() => {
      router.replace("/portal-admin");
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <ShieldCheck size={26} />
          </div>
          <h1 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Portal Admin RT
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Bukit Amarilis · Akses Petugas & Pengurus
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <div className="relative mt-1">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-bold uppercase text-slate-800 placeholder:normal-case placeholder:font-normal focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Memproses..." : "Masuk ke Sistem"}
          </button>
        </form>
      </div>
    </div>
  );
}