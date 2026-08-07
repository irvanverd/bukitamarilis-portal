import Link from "next/link";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import ImageSlider from "@/components/ImageSlider";
import { Metadata } from "next";
import { getKegiatan } from "@/lib/api";

export const dynamic = "force-dynamic";
export default async function DetailKegiatan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kegiatan = await getKegiatan(id);

  if (!kegiatan) {
    notFound();
  }


  const photos: string[] = (kegiatan.foto ?? "")
  .split("|")
  .map((x: string) => x.trim())
  .filter((x: string) => x !== "");

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/kegiatan"
          className="mb-6 inline-flex text-sm text-[var(--primary)] hover:underline"
        >
          ← Kembali ke daftar kegiatan
        </Link>

        <article className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow">

          <ImageSlider
            images={photos}
            title={kegiatan.nama}
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

              <CommentSection kegiatanId={kegiatan.id} />

            </div>

          </div>

        </article>

      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const kegiatan = await getKegiatan(id);

  if (!kegiatan) {
    return {
      title: "Kegiatan tidak ditemukan",
    };
  }

  const image =
    kegiatan.foto?.trim() || "https://www.myamarilis.id/images/og-default.jpg";

  return {
    title: kegiatan.nama,
    description: kegiatan.deskripsi.substring(0, 160),

    openGraph: {
      title: kegiatan.nama,
      description: kegiatan.deskripsi.substring(0, 160),
      url: `https://www.myamarilis.id/kegiatan/${id}`,
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: kegiatan.nama,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: kegiatan.nama,
      description: kegiatan.deskripsi.substring(0, 160),
      images: [image],
    },
  };
}