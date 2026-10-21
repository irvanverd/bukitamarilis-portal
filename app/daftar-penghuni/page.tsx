"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck, House, LoaderCircle, Phone, UserRound } from "lucide-react";

type Result = { success?: boolean; message?: string; id?: string; status?: string };

export default function DaftarPenghuniPage() {
  const [namaPenghuni, setNamaPenghuni] = useState("");
  const [blokAlamat, setBlokAlamat] = useState("");
  const [noHp, setNoHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/daftar-penghuni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPenghuni, blokAlamat, noHp }),
      });
      const data = (await response.json()) as Result;
      if (!response.ok || !data.success) {
        setError(data.message || "Pendaftaran gagal dikirim.");
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
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          ← Kembali ke Portal Bukit Amarilis
        </Link>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-emerald-700 px-6 py-7 text-white sm:px-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <House size={25} />
            </div>
            <p className="text-sm font-medium text-emerald-100">Portal Warga RT 07 RW 14</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Pendaftaran Penghuni</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-50">Isi data sesuai kondisi sebenarnya. Admin akan memeriksa nama dan alamat rumah sebelum memberikan persetujuan.</p>
          </div>

          <div className="p-6 sm:p-8">
            {result ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100" role="status">
                <CheckCircle2 className="mb-3" size={30} />
                <h2 className="text-lg font-bold">Pendaftaran berhasil dikirim</h2>
                <p className="mt-2 text-sm leading-6">{result.message || "Data sudah diterima."} Status: <strong>Menunggu verifikasi</strong>.</p>
                {result.id && <p className="mt-3 text-sm">Nomor pendaftaran: <strong>{result.id}</strong></p>}
                <button type="button" onClick={() => setResult(null)} className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Daftarkan data lain</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="namaPenghuni" className="mb-2 block text-sm font-semibold">Nama penghuni</label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input id="namaPenghuni" value={namaPenghuni} onChange={(e) => setNamaPenghuni(e.target.value)} required maxLength={120} autoComplete="name" placeholder="Nama lengkap penghuni" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-slate-700 dark:bg-slate-950" />
                  </div>
                </div>
                <div>
                  <label htmlFor="blokAlamat" className="mb-2 block text-sm font-semibold">Blok / alamat rumah</label>
                  <div className="relative">
                    <House className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input id="blokAlamat" value={blokAlamat} onChange={(e) => setBlokAlamat(e.target.value)} required maxLength={200} autoComplete="street-address" placeholder="Contoh: Blok A1 No. 12" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-slate-700 dark:bg-slate-950" />
                  </div>
                </div>
                <div>
                  <label htmlFor="noHp" className="mb-2 block text-sm font-semibold">Nomor HP aktif</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input id="noHp" value={noHp} onChange={(e) => setNoHp(e.target.value)} required inputMode="tel" autoComplete="tel" maxLength={20} placeholder="Contoh: 081234567890" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-slate-700 dark:bg-slate-950" />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Nomor HP digunakan untuk keperluan administrasi penghuni.</p>
                </div>

                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</div>}

                <div className="rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <div className="flex items-start gap-2"><ClipboardCheck size={18} className="mt-0.5 shrink-0" /><p>Dengan mengirim formulir ini, Anda menyatakan bahwa data yang diberikan benar. Pendaftaran belum memberikan akses ke data pribadi atau riwayat pembayaran IPL sampai admin menyetujuinya dan proses akses akun disiapkan.</p></div>
                </div>

                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? <><LoaderCircle className="animate-spin" size={18} /> Mengirim...</> : "Kirim Pendaftaran"}
                </button>
              </form>
            )}
          </div>
        </section>
        <p className="mt-5 text-center text-xs text-slate-500">Portal Warga Bukit Amarilis</p>
      </div>
    </main>
  );
}
