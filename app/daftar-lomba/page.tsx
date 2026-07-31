import Link from "next/link";
import FormLomba from "@/components/FormLomba";
import PopupBanner from "@/components/PopupBanner";

export default function DaftarLombaPage() {
  return (
    <>
      <PopupBanner />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Pendaftaran Lomba HUT RI
          </h1>

          <p className="text-muted-foreground mt-2">
            Silakan isi formulir di bawah untuk mengikuti perlombaan
            HUT RI RT 07/014 Bukit Amarilis.
          </p>

          <div className="text-right mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Sudah terdaftar?
            </p>

            <Link
              href="/list-peserta"
              className="inline-flex items-center border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition px-4 py-2 rounded-lg font-medium"
            >
              🔍 Cari
            </Link>
          </div>
        </div>

        <FormLomba />
      </main>
    </>
  );
}