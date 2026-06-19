'use client'; // <-- WAJIB DI BARIS PERTAMA
import Link from "next/link";

async function getKasSummary() {
  const res = await fetch(
    "/api/finance",
    {
      cache: "no-store",
    }
  );

  const data = await res.json();

  const now = new Date();

  const currentYear = now.getFullYear();

  const bulanIndonesia = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const currentMonth =
    bulanIndonesia[now.getMonth()];

  const kasBulanIni = data.find(
    (item: any) =>
      item.Tahun === currentYear &&
      item.bulan === currentMonth
  );

  return {
    pemasukan: kasBulanIni?.pemasukan ?? 0,
    pengeluaran: kasBulanIni?.pengeluaran ?? 0,
    saldo:
      (kasBulanIni?.pemasukan ?? 0) -
      (kasBulanIni?.pengeluaran ?? 0),
  };
}
export default async function HomePage() {
  const kas = await getKasSummary();

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 md:p-12 text-white shadow-lg">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Portal Warga RT 07/IV Bukit Amarilis
          </h1>

          <p className="text-lg md:text-xl text-green-50">
            Transparansi, Informasi, dan Komunikasi Warga dalam satu portal.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/transparansi"
              className="px-5 py-3 rounded-xl bg-white text-green-700 font-semibold hover:bg-green-50 transition"
            >
              Laporan Keuangan
            </Link>

            <Link
              href="/kegiatan"
              className="px-5 py-3 rounded-xl border border-white text-white hover:bg-white/10 transition"
            >
              Kegiatan RT
            </Link>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card
          title="Jumlah KK"
          value="124"
          color="bg-blue-50"
        />

        <Card
          title="Jumlah Warga"
          value="300"
          color="bg-green-50"
        />

        <Card
          title="Kegiatan Bulan Ini"
          value="8"
          color="bg-yellow-50"
        />

        <Card
          title="Pengumuman Aktif"
          value="3"
          color="bg-red-50"
        />
      </section>

      {/* KAS RT */}
      <section>
        <div className="bg-white rounded-3xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Ringkasan Kas RT
              </h2>
              <p className="text-gray-500">
                Data berasal dari Google Sheet
              </p>
            </div>

            <Link
              href="/transparansi"
              className="text-green-600 font-medium"
            >
              Lihat Detail →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <KasCard
              title="Pemasukan"
              value={kas.pemasukan}
              color="text-green-600"
            />

            <KasCard
              title="Pengeluaran"
              value={kas.pengeluaran}
              color="text-red-600"
            />

            <KasCard
              title="Saldo"
              value={kas.saldo}
              color="text-blue-600"
            />
          </div>
        </div>
      </section>

      {/* MENU CEPAT */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Menu Utama
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MenuCard
            title="Transparansi"
            desc="Laporan keuangan RT"
            href="/transparansi"
            emoji="📊"
          />

          <MenuCard
            title="Kegiatan"
            desc="Agenda dan dokumentasi"
            href="/kegiatan"
            emoji="🎉"
          />

          <MenuCard
            title="Pengurus"
            desc="Susunan pengurus RT"
            href="/pengurus"
            emoji="👥"
          />

          <MenuCard
            title="Tentang"
            desc="Profil RT Bukit Amarilis"
            href="/tentang"
            emoji="🏡"
          />
        </div>
      </section>

      {/* BERITA & JADWAL */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-3xl border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">
            Informasi Terbaru
          </h2>

          <div className="space-y-4">
            <NewsItem
              title="Kerja Bakti Bulanan"
              date="15 Juni 2026"
            />

            <NewsItem
              title="Pengecatan Pos Keamanan"
              date="10 Juni 2026"
            />

            <NewsItem
              title="Rapat Warga Bulanan"
              date="05 Juni 2026"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">
            Agenda Mendatang
          </h2>

          <div className="space-y-4">
            <AgendaItem
              date="20 Juni"
              title="Senam Pagi Bersama"
            />

            <AgendaItem
              date="25 Juni"
              title="Rapat Pengurus"
            />

            <AgendaItem
              date="30 Juni"
              title="Kerja Bakti Lingkungan"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-2xl p-5`}>
      <p className="text-gray-600">{title}</p>
      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}

function KasCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="border rounded-2xl p-5">
      <p className="text-gray-500">{title}</p>

      <h3 className={`text-2xl font-bold mt-2 ${color}`}>
        Rp {Number(value).toLocaleString("id-ID")}
      </h3>
    </div>
  );
}

function MenuCard({
  title,
  desc,
  href,
  emoji,
}: {
  title: string;
  desc: string;
  href: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border rounded-3xl p-6 hover:shadow-lg transition"
    >
      <div className="text-4xl mb-3">{emoji}</div>

      <h3 className="font-bold text-lg">
        {title}
      </h3>

      <p className="text-gray-500 mt-1">
        {desc}
      </p>
    </Link>
  );
}

function NewsItem({
  title,
  date,
}: {
  title: string;
  date: string;
}) {
  return (
    <div className="border-b pb-3">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">
        {date}
      </p>
    </div>
  );
}

function AgendaItem({
  date,
  title,
}: {
  date: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-green-100 text-green-700 rounded-xl px-3 py-2 font-semibold">
        {date}
      </div>

      <div>{title}</div>
    </div>
  );
}