import Link from "next/link";
import { headers } from "next/headers";

async function getKasSummary() {
  // 1. Dapatkan host/domain secara dinamis untuk mengatasi ERR_INVALID_URL di Vercel
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3001";
  const protocol = host.includes("localhost") ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/finance`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Gagal mengambil data");
    }

    const data = await res.json();
    const now = new Date();
    const currentYear = now.getFullYear();

    const bulanIndonesia = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const currentMonth = bulanIndonesia[now.getMonth()];

    const kasBulanIni = data.find(
      (item: any) =>
        Number(item.Tahun) === currentYear &&
        String(item.bulan).toLowerCase() === currentMonth.toLowerCase()
    );

    return {
      pemasukan: Number(kasBulanIni?.pemasukan) || 0,
      pengeluaran: Number(kasBulanIni?.pengeluaran) || 0,
      saldo: Number(kasBulanIni?.saldo) || 0,
    };
  } catch (error) {
    console.error("Error pada getKasSummary:", error);
    return { pemasukan: 0, pengeluaran: 0, saldo: 0 };
  }
}

export default async function HomePage() {
  const kas = await getKasSummary();

  return (
    <div className="space-y-6">
    {/* HERO DENGAN BACKGROUND IMAGE */}
    <section 
      className="relative rounded-2xl bg-cover bg-center p-5 md:p-8 text-white shadow-md overflow-hidden"
      style={{ backgroundImage: `url('https://i.ibb.co.com/F4x5fHKJ/Logo-Banner-Amarilis.png')` }}
     
    >
      {/* Lapisan Gelap (Overlay) agar teks tetap mudah dibaca */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Konten Utama (Diberi z-10 agar berada di atas overlay) */}
      <div className="relative max-w-3xl z-10">
        <h1 className="text-xl md:text-3xl font-bold mb-2 tracking-tight">
          Portal Warga RT 07/IV Bukit Amarilis
        </h1>

        <p className="text-sm md:text-base text-slate-100">
          Transparansi, Informasi, dan Komunikasi Warga dalam satu portal.
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
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
        <Card title="Jumlah KK" value="124" color="bg-blue-50" emoji="👫"  />
        <Card title="Jumlah Warga" value="300" color="bg-green-50" emoji="👤"  />
        <Card title="Kegiatan Bulan Ini" value="8" color="bg-yellow-50" emoji="📆"  />
        <Card title="Pengumuman Aktif" value="3" color="bg-red-50" emoji="📢"  />
      </section>

      {/* KAS RT */}
      <section>
        <div className="bg-white rounded-3xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Ringkasan Kas RT</h2>
              <p className="text-gray-500">Data berasal dari Google Sheet</p>
            </div>

            <Link href="/transparansi" className="text-green-600 font-medium">
              Lihat Detail →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <KasCard title="Pemasukan" value={kas.pemasukan} color="text-green-600" />
            <KasCard title="Pengeluaran" value={kas.pengeluaran} color="text-red-600" />
            <KasCard title="Saldo" value={kas.saldo} color="text-blue-600" />
          </div>
        </div>
      </section>

      {/* MENU CEPAT */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Menu Utama</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MenuCard title="Transparansi" desc="Laporan keuangan RT" href="/transparansi" emoji="📊" />
          <MenuCard title="Kegiatan" desc="Agenda dan dokumentasi" href="/kegiatan" emoji="🎉" />
          <MenuCard title="Pengurus" desc="Susunan pengurus RT" href="/pengurus" emoji="👨🏻‍🎓" />
          <MenuCard title="Tentang" desc="Profil RT Bukit Amarilis" href="/tentang" emoji="🏡" />
        </div>
      </section>

      {/* BERITA & JADWAL */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-3xl border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Informasi Terbaru</h2>

          <div className="space-y-4">
            <NewsItem title="Kerja Bakti Bulanan" date="15 Juni 2026" />
            <NewsItem title="Pengecatan Pos Keamanan" date="10 Juni 2026" />
            <NewsItem title="Rapat Warga Bulanan" date="05 Juni 2026" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Agenda Mendatang</h2>

          <div className="space-y-4">
            <AgendaItem date="20 Juni" title="Senam Pagi Bersama" />
            <AgendaItem date="25 Juni" title="Rapat Pengurus" />
            <AgendaItem date="30 Juni" title="Kerja Bakti Lingkungan" />
          </div>
        </div>
      </section>

      {/* TOMBOL LAYANAN PELANGGAN WHATSAPP */}
<a
  href="https://wa.me/6285691747527?text=Halo%20Admin%20Portal%20Warga%20RT%2007%2C%20saya%20ingin%20bertanya%20mengenai..."
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 group font-sans text-sm font-semibold"
>
  {/* Logo SVG WhatsApp Resmi */}
  <svg
    className="w-5 h-5 fill-current"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.66.986 3.292 1.503 5.361 1.504 5.573 0 10.11-4.531 10.113-10.104.002-2.699-1.044-5.234-2.949-7.141-1.905-1.907-4.438-2.956-7.139-2.957-5.576 0-10.114 4.532-10.117 10.106-.001 2.105.547 4.159 1.593 5.922l-.993 3.626 3.733-.979zm12.015-7.447c-.329-.164-1.943-.959-2.241-1.069-.299-.11-.517-.164-.734.164-.218.329-.844 1.069-1.035 1.288-.19.219-.381.247-.71.082-.329-.164-1.389-.512-2.646-1.633-.978-.872-1.637-1.95-1.829-2.28-.192-.329-.02-.507.145-.671.148-.147.329-.384.494-.575.164-.192.219-.329.329-.548.11-.219.055-.411-.027-.575-.082-.164-.734-1.768-1.006-2.425-.265-.64-.53-.553-.734-.564-.191-.01-.411-.011-.63-.011-.218 0-.573.082-.872.411-.299.329-1.143 1.116-1.143 2.72 0 1.604 1.171 3.154 1.334 3.374.164.22 2.304 3.516 5.581 4.933.78.337 1.389.538 1.864.689.784.249 1.497.214 2.061.13.629-.094 1.943-.795 2.216-1.562.272-.767.272-1.424.191-1.562-.081-.138-.299-.219-.629-.383z" />
  </svg>

  {/* Teks Label (Akan otomatis sembunyi di layar HP yang sangat kecil jika mau, tapi ini dibuat pas) */}
  <span>Chat Hallo Amarilis</span>

  {/* Notifikasi Titik Merah Berkedip untuk menarik perhatian (Efek Pulse) */}
  <span className="absolute -top-1 -right-1 flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
  </span>
</a>
    </div>

  );
}

// ==================== SUB-COMPONENTS ====================

function Card({ title, value, color,emoji }: { title: string; value: string; color: string; emoji: string }) {
  return (
    <div className={`${color} rounded-2xl p-5`}>
      <p className="text-gray-600">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
      <div className="text-4xl mb-3">{emoji}</div>
    </div>
  );
}

function KasCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="border rounded-2xl p-5">
      <p className="text-gray-500">{title}</p>
      <h3 className={`text-2xl font-bold mt-2 ${color}`}>
        Rp {Number(value).toLocaleString("id-ID")}
      </h3>
    </div>
  );
}

function MenuCard({ title, desc, href, emoji }: { title: string; desc: string; href: string; emoji: string }) {
  return (
    <Link href={href} className="bg-white border rounded-3xl p-6 hover:shadow-lg transition block">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-gray-500 mt-1">{desc}</p>
    </Link>
  );
}

function NewsItem({ title, date }: { title: string; date: string }) {
  return (
    <div className="border-b pb-3 last:border-0 last:pb-0">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  );
}

function AgendaItem({ date, title }: { date: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-green-100 text-green-700 rounded-xl px-3 py-2 font-semibold min-w-[75px] text-center">
        {date}
      </div>
      <div className="font-medium text-gray-700">{title}</div>
    </div>
  );
}