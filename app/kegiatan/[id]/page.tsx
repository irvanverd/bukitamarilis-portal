import Link from "next/link";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

interface Kegiatan {
  id: string;
  nama: string;
  tanggal: string;
  tanggal_sunting?: string;
  deskripsi: string;
  foto: string;

  flagDaftar?: string;
  urlDaftar?: string;
}

export default async function DetailKegiatan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SHEETDB_URL}?sheet=kegiatan`,
    {
      cache: "no-store",
    }
  );

  const data: Kegiatan[] = res.ok ? await res.json() : [];

  const kegiatan = data.find((x) => x.id === id);

  if (!kegiatan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">

      <div className="mx-auto max-w-4xl">

        <Link
          href="/kegiatan"
          className="
            mb-6
            inline-flex
            text-sm
            text-[var(--primary)]
            hover:underline
          "
        >
          ← Kembali ke daftar kegiatan
        </Link>

        <article
          className="
            overflow-hidden
            rounded-2xl
            bg-white
            dark:bg-slate-900
            shadow
          "
        >

          <img
            src={
              kegiatan.foto?.trim()
                ? kegiatan.foto
                : "/images/no-image.jpg"
            }
            alt={kegiatan.nama}
            className="w-full h-72 object-cover"
          />

          <div className="p-8">

            <div className="flex flex-wrap gap-2 mb-5">

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                📅 {kegiatan.tanggal}
              </span>

              {kegiatan.tanggal_sunting && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                  ✏️ Disunting {kegiatan.tanggal_sunting}
                </span>
              )}

            </div>

            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {kegiatan.nama}
            </h1>

            <div
              className="
                mt-8
                whitespace-pre-line
                leading-9
                text-justify
                text-slate-700
                dark:text-slate-300
              "
            >
              {kegiatan.deskripsi}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">

<CommentSection
 kegiatanId={kegiatan.id}
/>

  </div>
          </div>

        </article>

      </div>

    </main>
  );
}