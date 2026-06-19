import DashboardChart from "@/components/DashboardChart";
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
  // Menggunakan try-catch sederhana agar jika Google Sheet bermasalah, web tidak langsung crash
  try {
    const data = await getData();

    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Transparansi Keuangan
        </h1>
        <DashboardChart data={data} />
      </main>
    );
  } catch (error) {
    return (
      <main className="p-6 text-center text-red-500">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Transparansi Keuangan
        </h1>
        <p>Gagal memuat data grafik. Silakan coba beberapa saat lagi.</p>
      </main>
    );
  }
}