"use client";

import { FormEvent, useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Home,
  LoaderCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { getClientCache, saveClientCache } from "@/lib/client-cache";

interface WargaItem {
  Blok?: string;
  BlokID?: string;
  Nama?: string;
  NamaAlias?: string;
  [key: string]: any;
}

type Result = {
  success?: boolean;
  message?: string;
  waStatus?: {
    status?: boolean;
    reason?: string;
    [key: string]: any;
  };
  activationLink?: string;
  token?: string;
  blok?: string;
  nama?: string;
};

export default function DaftarPenghuniPage() {
  const [namaPenghuni, setNamaPenghuni] = useState("");
  const [blokAlamat, setBlokAlamat] = useState("");
  const [noHp, setNoHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  // State untuk data master warga & dropdown pencarian blok
  const [listWarga, setListWarga] = useState<WargaItem[]>([]);
  const [loadingWarga, setLoadingWarga] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchBlok, setSearchBlok] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ambil data warga dari cache / API
  useEffect(() => {
    const loadWarga = async () => {
      const cacheKey = "warga-list-data";
      const cached = getClientCache<WargaItem[]>(cacheKey);
      if (cached?.data && Array.isArray(cached.data)) {
        setListWarga(cached.data);
      }

      try {
        setLoadingWarga(true);
        const res = await fetch("/api/warga", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setListWarga(json.data);
          saveClientCache(cacheKey, json.data);
        }
      } catch (err) {
        console.warn("Gagal memuat list blok:", err);
      } finally {
        setLoadingWarga(false);
      }
    };

    loadWarga();
  }, []);

  // Tutup dropdown jika klik di luar elemen
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

  // Filter daftar blok yang tersedia
  const filteredWarga = useMemo(() => {
    if (!searchBlok.trim()) return listWarga;
    const query = searchBlok.toLowerCase();
    return listWarga.filter((w) => {
      const b = (w.Blok || w.BlokID || "").toLowerCase();
      return b.includes(query);
    });
  }, [listWarga, searchBlok]);

  

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/daftar-penghuni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPenghuni: namaPenghuni.trim(),
          blokAlamat: blokAlamat.trim().toUpperCase(),
          noHp: noHp.trim(),
        }),
      });

      const data = (await response.json()) as Result;

      if (!response.ok || !data.success) {
        setError(data.message || "Pendaftaran gagal diverifikasi.");
        return;
      }

      setResult(data);
      setNamaPenghuni("");
      setBlokAlamat("");
      setNoHp("");
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/portal-warga/login"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft size={15} /> Sudah punya kata sandi? Masuk di sini
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <Home size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Portal Warga
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              RT 07 / RW 14 · Bukit Amarilis
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pendaftaran Akun
            </h2>
          </div>

          {result ? (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
              role="status"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Pendaftaran Berhasil!
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                {result.message}
                , Link set password dikirim ke nomor Whatsapp anda. 
              </p>
{/* PERINGATAN KETIKA WA GAGAL TERKIRIM */}
{result.waStatus && result.waStatus.status === false && (
      <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50/90 p-3.5 text-xs text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
        <p className="font-bold text-rose-800 dark:text-rose-300">
          ⚠️ Notifikasi WhatsApp Gagal Terkirim:
        </p>
        <p className="mt-1 font-mono text-[11px] bg-rose-100 dark:bg-rose-900/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200">
          Alasan: {result.waStatus.reason || "Gagal menghubungi WhatsApp"}
        </p>
        <p className="mt-1.5 text-[11px] text-rose-800/80 dark:text-rose-300/80">
          Pastikan format nomor HP valid (diawali 08/628). Anda tetap dapat menggunakan link aktivasi di bawah.
        </p>
      </div>
    )}

    {/* Tautan Aktivasi Manual (Fallback) 
    {result.activationLink && (
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
          <Sparkles size={15} />
          <span>Aktivasi Akun Mandiri</span>
        </div>
        <p className="mt-1 text-[11px] text-amber-900/80 dark:text-amber-300/80">
          Klik tombol di bawah untuk langsung membuat kata sandi Anda:
        </p>
        <div className="mt-3">
          <Link
            href={result.activationLink}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
          >
            <span>Buka Form Buat Sandi</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    )}*/}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="w-1/2 rounded-xl border border-emerald-300 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100/50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
                >
                  Daftar Unit Lain
                </button>
                <Link
                  href="/portal-warga/login"
                  className="flex w-1/2 items-center justify-center rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  Ke Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="namaPenghuni"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    id="namaPenghuni"
                    value={namaPenghuni}
                    onChange={(e) => setNamaPenghuni(e.target.value)}
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Nama lengkap penghuni"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

             {/* Input Blok & Dropdown Pencarian */}
             <div>
                <label
                  htmlFor="blokAlamat"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nomor Blok / Unit
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Home
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      id="blokAlamat"
                      value={blokAlamat}
                      onChange={(e) => setBlokAlamat(e.target.value)}
                      required
                      maxLength={100}
                      autoComplete="street-address"
                      placeholder="Contoh: AR.12/00"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm uppercase text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Tombol Dropdown Pilih Blok */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex h-full items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                      title="Pilih dari daftar unit RT"
                    >
                      <span>Cari Blok</span>
                      <ChevronDown size={14} className={isDropdownOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                    </button>

                    {/* Pop-up Panel List Blok */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 z-30 mt-1.5 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="relative mb-2">
                          <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            value={searchBlok}
                            onChange={(e) => setSearchBlok(e.target.value)}
                            placeholder="Ketik blok unit..."
                            className="w-full rounded-lg bg-slate-100 py-1.5 pl-8 pr-2 text-xs text-slate-800 focus:outline-none dark:bg-slate-800 dark:text-slate-100"
                            autoFocus
                          />
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-0.5">
                          {loadingWarga ? (
                            <p className="p-3 text-center text-xs text-slate-400">Memuat unit...</p>
                          ) : filteredWarga.length === 0 ? (
                            <p className="p-3 text-center text-xs text-slate-400">Blok tidak ditemukan.</p>
                          ) : (
                            filteredWarga.map((w, idx) => {
                              const b = w.Blok || w.BlokID || "";
                              return (
                                <button
                                  key={`${b}-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setBlokAlamat(b);
                                    setIsDropdownOpen(false);
                                    setSearchBlok("");
                                  }}
                                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition"
                                >
                                  <span className="font-semibold">{b}</span>
                                  {blokAlamat.toUpperCase() === b.toUpperCase() && (
                                    <CheckCircle2 size={13} className="text-emerald-600" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="noHp"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nomor WhatsApp Aktif
                </label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    id="noHp"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p>
                    Data blok unit akan diverifikasi langsung terhadap data RT. Tautan aktivasi berlaku 24 jam.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={17} />
                    Memverifikasi Unit...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Daftar & Minta Tautan Aktivasi
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Portal Warga Bukit Amarilis
      </p>
    </main>
  );
}