import Link from "next/link";

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

export default async function HalamanKegiatan() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SHEETDB_URL}?sheet=kegiatan`,
    {
      cache: "no-store",
    }
  );

  const data: Kegiatan[] = res.ok ? await res.json() : [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 md:px-6">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-10 text-center">

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Kegiatan Warga
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Informasi kegiatan terbaru RT Bukit Amarilis
          </p>

        </div>

        {/* Empty State */}

        {data.length === 0 && (

          <div className="rounded-2xl border bg-white dark:bg-slate-900 p-10 text-center">

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Belum Ada Kegiatan
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Data kegiatan belum tersedia.
            </p>

          </div>

        )}

        {/* List */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {data.map((item) => (

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

              {/* Gambar */}

              <img
                src={
                  item.foto?.trim()
                    ? item.foto
                    : "/images/no-image.jpg"
                }
                alt={item.nama}
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

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">

                  {item.nama}

                </h2>

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
    href={`/daftar?id=${item.id}&nama=${encodeURIComponent(item.nama)}`}
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

      </div>

    </main>
  );
}