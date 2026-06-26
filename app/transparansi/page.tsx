import DashboardChart from "@/components/DashboardChart";
import TransparansiTables from "@/components/Tabelkeuangan"; // Impor komponen tabel baru
import { headers } from "next/headers";

async function getData() {
  // 1. Ambil data host (domain) secara dinamis dari request headers
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3001";
  
  // 2. Tentukan protokol (http untuk lokal, https untuk Vercel)
  const protocol = host.includes("localhost") ? "http" : "https";
  
  // 3. Gabungkan menjadi URL Absolut yang valid
  const absoluteUrl = `${protocol}://${host}/api/finance`;

  const res = await fetch(absoluteUrl, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data: ${res.statusText}`);
  }

  return res.json();
}

export default async function TransparansiPage() {
  try {
    const data = await getData();

    return (
      <main className="p-6 max-w-7xl mx-auto font-sans">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Transparansi Keuangan
        </h1>
        
        {/* 1. BAGIAN GRAFIK LAMA */}
        <div className="bg-white p-4 rounded-2xl border shadow-sm">
          <DashboardChart data={data} />
        </div>

        {/* 2. BAGIAN 2 TAB TABEL BARU */}
        <TransparansiTables />
      </main>
    );
  } catch (error) {
    return (
      <main className="p-6 text-center text-red-500 max-w-7xl mx-auto font-sans">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Transparansi Keuangan
        </h1>
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <p className="font-semibold">Gagal memuat data grafik & tabel.</p>
          <p className="text-sm text-red-400 mt-1">Silakan periksa koneksi Google Sheets Anda atau coba beberapa saat lagi.</p>
        </div>
      </main>
    );
  }
}