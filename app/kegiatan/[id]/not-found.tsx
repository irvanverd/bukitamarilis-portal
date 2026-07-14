import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">

        <h1 className="text-3xl font-bold">
          Kegiatan Tidak Ditemukan
        </h1>

        <p className="mt-3 text-slate-500">
          Data yang Anda cari tidak tersedia.
        </p>

        <Link
          href="/kegiatan"
          className="mt-6 inline-block text-[var(--primary)] hover:underline"
        >
          ← Kembali ke daftar kegiatan
        </Link>

      </div>
    </main>
  );
}