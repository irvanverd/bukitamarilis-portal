"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Home,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { getClientCache, saveClientCache } from "@/lib/client-cache";

interface WargaItem {
  Blok: string;
  Nama: string;
  [key: string]: any;
}

const CACHE_KEY = "warga-list-data";

export default function LoginPage() {
  const router = useRouter();

  // Tab login: 'blok' atau 'hp'
  const [loginMethod, setLoginMethod] = useState<"blok" | "hp">("blok");

  // Form states
  const [selectedBlok, setSelectedBlok] = useState("");
  const [selectedNama, setSelectedNama] = useState("");
  const [searchBlok, setSearchBlok] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Data states
  const [listWarga, setListWarga] = useState<WargaItem[]>([]);
  const [loadingWarga, setLoadingWarga] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi memuat data warga mengikuti pola KasSummary.tsx
  const loadWargaData = async (forceRefresh = false) => {
    // 1. Ambil dari Cache (getClientCache)
    if (!forceRefresh) {
      const cached = getClientCache<WargaItem[]>(CACHE_KEY);
      if (cached?.data && Array.isArray(cached.data) && cached.data.length > 0) {
        console.log(
          "📦 Login: menggunakan localStorage cache",
          new Date(cached.timestamp)
        );
        setListWarga(cached.data);
        setLoadingWarga(false);
      }
    }

    // 2. Background Request via API internal Next.js
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      if (forceRefresh) setLoadingWarga(true);
      console.log("🌐 Login: mengambil data warga terbaru...");

      const res = await fetch("/api/warga?action=getListWarga", {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      if (!json?.success) {
        throw new Error(json?.message || "Gagal mengambil data warga");
      }

      const rawList = json.data;

      if (!Array.isArray(rawList)) {
        throw new Error("Data warga bukan array");
      }

      // Bersihkan data yang kosong
      const cleanData: WargaItem[] = rawList.filter(
        (item: any) => item.Blok && String(item.Blok).trim() !== ""
      );

      // 3. Update State
      setListWarga(cleanData);

      // 4. Simpan ke Cache (saveClientCache)
      saveClientCache(CACHE_KEY, cleanData);
      console.log("💾 Login: cache data warga diperbarui");
    } catch (error) {
      console.warn("⚠️ Login: server gagal, menggunakan cache", error);
    } finally {
      clearTimeout(timeout);
      setLoadingWarga(false);
    }
  };

  useEffect(() => {
    // Cek jika sudah login
    const existingSession = localStorage.getItem("warga_session");
    if (existingSession) {
      router.replace("/portal-warga");
      return;
    }

    loadWargaData();
  }, [router]);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter pencarian
  const filteredWarga = listWarga.filter((item) => {
    const q = searchBlok.toLowerCase();
    return (
      (item.Blok && item.Blok.toLowerCase().includes(q)) ||
      (item.Nama && item.Nama.toLowerCase().includes(q))
    );
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const identifier = loginMethod === "blok" ? selectedBlok.trim() : noHp.trim();

    if (!identifier) {
      setErrorMsg(
        loginMethod === "blok"
          ? "Silakan pilih alamat blok rumah Anda."
          : "Silakan masukkan nomor HP yang terdaftar."
      );
      return;
    }

    if (!password) {
      setErrorMsg("Kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth-warga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier,
          password: password,
          method: loginMethod,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setErrorMsg(result.message || "Kombinasi akun dan kata sandi salah.");
        return;
      }

      // Ambil payload akun yang valid dari Apps Script
      const user = result.data;

      const sessionPayload = {
        blok: user.blok || identifier,
        nama: user.nama || "Warga Amarilis",
        noHp: user.noHp || (loginMethod === "hp" ? identifier : "-"),
        iplamount: String(user.iplamount || "110000"),
        loginAt: new Date().toISOString(),
      };

      // Simpan session yang sudah terverifikasi ke localStorage
      localStorage.setItem("warga_session", JSON.stringify(sessionPayload));

      setSuccessMsg(`Selamat datang, ${sessionPayload.nama}! Mengalihkan...`);

      setTimeout(() => {
        router.push("/portal-warga");
      }, 800);
    } catch (err: any) {
      console.error("Login verification error:", err);
      setErrorMsg("Terjadi kendala jaringan saat memverifikasi akun.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header & Logo */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 mx-auto rounded-full p-1 bg-card shadow-md border border-border overflow-hidden">
            <Image
              src="/og-image.jpg"
              alt="Logo RT 07/XIV"
              fill
              className="object-cover rounded-full"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              Portal Warga RT 07/XIV
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Masuk untuk melihat iuran, informasi, dan layanan warga
            </p>
          </div>
        </div>

        {/* Tab Pilihan Metode Login */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("blok");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              loginMethod === "blok"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home size={16} />
            Alamat Blok
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod("hp");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              loginMethod === "hp"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone size={16} />
            No. WhatsApp
          </button>
        </div>

        {/* Notifikasi Error / Sukses */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* METODE 1: LOOKUP ALAMAT DARI HASIL APPSCRIPT DENGAN SEARCH BOX */}
          {loginMethod === "blok" ? (
            <div className="space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Pilih Alamat Blok Rumah
                </label>
                <button
                  type="button"
                  onClick={() => loadWargaData(true)}
                  disabled={loadingWarga}
                  className="text-[11px] text-primary hover:opacity-80 flex items-center gap-1 font-medium disabled:opacity-50"
                  title="Sinkron data terbaru dari spreadsheet"
                >
                  <RefreshCw size={11} className={loadingWarga ? "animate-spin" : ""} />
                  {loadingWarga ? "Memuat..." : "Sinkron Blok"}
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-muted/50 border rounded-xl text-sm transition-all text-left ${
                    isDropdownOpen
                      ? "border-primary ring-2 ring-primary/20 bg-card"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {selectedBlok ? (
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-xs sm:text-sm">
                        {selectedBlok}
                      </span>
                      
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      -- Pilih atau Cari Blok / Nama --
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 shrink-0 ${
                      isDropdownOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-2xl shadow-xl z-50 p-2 space-y-2">
                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Cari blok atau nama warga..."
                        value={searchBlok}
                        onChange={(e) => setSearchBlok(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-muted/60 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card text-foreground"
                      />
                    </div>

                    <div className="max-h-52 overflow-y-auto divide-y divide-border/60 text-sm">
                      {filteredWarga.length === 0 ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          {loadingWarga
                            ? "Sedang memuat data dari spreadsheet..."
                            : `Data "${searchBlok}" tidak ditemukan.`}
                        </div>
                      ) : (
                        filteredWarga.map((warga, index) => (
                          <button
                            key={`${warga.Blok}-${index}`}
                            type="button"
                            onClick={() => {
                              setSelectedBlok(warga.Blok);
                              setSelectedNama(warga.Nama);
                              setIsDropdownOpen(false);
                              setSearchBlok("");
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              selectedBlok === warga.Blok
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">{warga.Blok}</span>
                              {/*  {warga.Nama && (
                                <span className="text-[10px] text-muted-foreground">
                                  {warga.Nama}
                                </span>
                              )} */}
                            </div>
                            {selectedBlok === warga.Blok && (
                              <CheckCircle2 size={15} className="text-primary shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* METODE 2: INPUT NOMOR HP */
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nomor Handphone / WhatsApp
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-all text-foreground"
                />
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>
          )}

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-all text-foreground"
              />
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Tombol Submit Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-foreground rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Masuk ke Portal
              </>
            )}
          </button>
        </form>

        {/* Pemisah & Tombol Daftar */}
        <div className="pt-4 border-t border-border text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Belum terdaftar sebagai warga atau belum memiliki akun?
          </p>

          <Link
            href="/daftar-penghuni"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border text-foreground hover:bg-muted text-xs sm:text-sm font-bold transition-all active:scale-[0.98]"
          >
            <UserPlus size={16} className="text-primary" />
            Daftar Akun pengguna baru
          </Link>

          <div>
            <Link
              href="/"
              className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Kembali ke Beranda Publik
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}