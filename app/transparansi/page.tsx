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
  const absoluteUrl = `${protocol}://${host}/api/finance?action=getFinanceData`;
  const res = await fetch(
    absoluteUrl,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Gagal mengambil data: ${res.statusText}`);
  }

  const json = await res.json();

  if (!json?.success) {
    throw new Error(
      json?.message || "Gagal mengambil data keuangan"
    );
  }

  return Array.isArray(json.data)
    ? json.data
    : [];
}

export default async function TransparansiPage() {
  //try {
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
        <TransparansiTables/>
        {/* 2. BAGIAN 2 TAB TABEL BARU */}
       
      </main>
    );
 
}