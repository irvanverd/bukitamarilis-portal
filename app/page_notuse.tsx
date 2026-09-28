import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-3xl border bg-background shadow-xl p-10 text-center">

        <div className="text-6xl mb-5">🚧</div>

        <h1 className="text-3xl font-bold mb-3">
          Website Under Construction
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Mohon maaf, website sedang dalam proses pengembangan.
          <br />
          Silakan menuju halaman pendaftaran lomba.
        </p>

        <Link
          href="/daftar-lomba"
          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-8 py-3 text-white font-semibold hover:bg-green-700 transition"
        >
          Oke
        </Link>

      </div>
    </div>
  );
}