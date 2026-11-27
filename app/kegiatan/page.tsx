import { getListKegiatan } from "@/lib/api";
import KegiatanListClient, { Kegiatan } from "./KegiatanListClient";

// Cache halaman selama 60 detik agar terbuka instan tanpa menunggu cold-start Apps Script
export const revalidate = 60;

export default async function HalamanKegiatan() {
  const data: Kegiatan[] = await getListKegiatan();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Utama */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Kegiatan Warga
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Informasi kegiatan terbaru RT Bukit Amarilis
          </p>
        </div>

        {/* Sub-kategori & List Kegiatan */}
        <KegiatanListClient data={data} />
      </div>
    </main>
  );
}