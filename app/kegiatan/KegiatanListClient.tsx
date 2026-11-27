"use client";

import { useState } from "react";
import Link from "next/link";

export interface Kegiatan {
  id: string;
  nama: string;
  tanggal: string;
  tanggal_sunting?: string;
  deskripsi: string;
  foto: string;
  flagDaftar?: string;
  urlDaftar?: string;
  typeKegiatan?: string;
}

const SUB_KATEGORI = [
  { key: "kegiatan umum", title: "Kegiatan Umum" },
  { key: "kegiatan keagamaan", title: "Kegiatan Keagamaan" },
  { key: "komunitas", title: "Komunitas" },
] as const;

export default function KegiatanListClient({ data }: { data: Kegiatan[] }) {
  // Menyimpan state expand ("Lihat Kegiatan Sebelumnya") per sub-kategori
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Normalisasi pencocokan kategori (data lama tanpa typeKegiatan masuk ke "kegiatan umum")
  const getNormalizedType = (raw?: string) => {
    const val = String(raw || "").trim().toLowerCase();
    if (val.includes("agama")) return "kegiatan keagamaan";
    if (val.includes("komunitas")) return "komunitas";
    return "kegiatan umum";
  };

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-slate-900 p-10 text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          Belum Ada Kegiatan
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Data kegiatan belum tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {SUB_KATEGORI.map((sub) => {
        const items = data.filter(
          (item) => getNormalizedType(item.typeKegiatan) === sub.key
        );

        const isExpanded = !!expandedSections[sub.key];
        const visibleItems = isExpanded ? items : items.slice(0, 3);
        const hiddenCount = Math.max(0, items.length - 3);

        return (
          <section key={sub.key} className="space-y-6">
            {/* Sub-judul Kategori */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {sub.title}
              </h2>
              <span className="rounded-full bg-slate-200/70 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {items.length} Kegiatan
              </span>
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Belum ada kegiatan pada kategori {sub.title}.
                </p>
              </div>
            ) : (
              <>
                {/* Grid Kartu Kegiatan (Konten & Tampilan Asli Dipertahankan) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {visibleItems.map((item) => (
                    <article
                      key={item.id}
                      className="
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        dark:bg-slate-900
                        border
                        border-slate-200
                        dark:border-slate-700
                        shadow-sm
                        hover:shadow-xl
                        hover:-translate-y-1
                        transition-all
                        duration-300
                      "
                    >
                      {/* Gambar dengan Lazy Loading */}
                      <img
                        src={
                          item.foto?.trim()
                            ? item.foto
                            : "/images/no-image.jpg"
                        }
                        alt={item.nama}
                        loading="lazy"
                        decoding="async"
                        className="h-56 w-full object-cover"
                      />

                      {/* Isi */}
                      <div className="p-6">
                        {/* Badge */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span
                            className="
                              rounded-full
                              bg-blue-100
                              dark:bg-blue-900
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-blue-700
                              dark:text-blue-200
                            "
                          >
                            📅 {item.tanggal}
                          </span>

                          {item.tanggal_sunting && (
                            <span
                              className="
                                rounded-full
                                bg-amber-100
                                dark:bg-amber-900
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                text-amber-700
                                dark:text-amber-200
                              "
                            >
                              ✏️ Disunting {item.tanggal_sunting}
                            </span>
                          )}
                        </div>

                        {/* Judul */}
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                          {item.nama}
                        </h3>

                        {/* Ringkasan */}
                        <div
                          className="
                            whitespace-pre-line
                            break-words
                            leading-7
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          {item.deskripsi.length > 180
                            ? item.deskripsi.substring(0, 180) + "..."
                            : item.deskripsi}
                        </div>

                        {/* Tombol */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={`/kegiatan/${item.id}`}
                            prefetch={false}
                            className="
                              inline-flex
                              items-center
                              rounded-lg
                              bg-blue-600
                              hover:bg-blue-700
                              px-5
                              py-2.5
                              text-sm
                              font-medium
                              text-white
                              transition
                            "
                          >
                            📖 Baca Selengkapnya
                          </Link>

                          {item.flagDaftar === "Y" && (
                            <Link
                              href={`/daftar/${item.id}?nama=${encodeURIComponent(item.nama)}`}
                              prefetch={false}
                              className="
                                inline-flex
                                items-center
                                rounded-lg
                                bg-green-600
                                hover:bg-green-700
                                px-5
                                py-2.5
                                text-sm
                                font-medium
                                text-white
                                transition
                              "
                            >
                              📝 Daftar
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Tombol Lihat Kegiatan Sebelumnya (Muncul jika > 3 kegiatan) */}
                {items.length > 3 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSection(sub.key)}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-300
                        dark:border-slate-700
                        bg-white
                        dark:bg-slate-900
                        px-6
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-700
                        dark:text-slate-200
                        shadow-sm
                        hover:bg-slate-100
                        dark:hover:bg-slate-800
                        transition
                      "
                    >
                      {isExpanded
                        ? "Sembunyikan Kegiatan Sebelumnya"
                        : `Lihat Kegiatan Sebelumnya (${hiddenCount} lainnya)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}