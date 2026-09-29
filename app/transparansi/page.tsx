import DashboardChart from "@/components/DashboardChart";
import TransparansiTables from "@/components/Tabelkeuangan"; // Impor komponen tabel baru
import { headers } from "next/headers";

async function getData() {
  const API_URL =
    process.env.NEXT_APPSCRIPT_API;

  if (!API_URL) {
    throw new Error(
      "NEXT_APPSCIRPT_API belum dikonfigurasi"
    );
  }

  const url = new URL(API_URL);

  url.searchParams.set(
    "action",
    "getFinanceDashboard"
  );

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    50000
  );

  try {

    const res = await fetch(
      url.toString(),
      {
        signal: controller.signal
      }
    );

    const text = await res.text();
  

    if (!res.ok) {
      throw new Error(
        `Gagal mengambil data: HTTP ${res.status} ${res.statusText}`
      );
    }

    if (!text.trim()) {
      throw new Error(
        "Apps Script mengembalikan response kosong"
      );
    }

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `Response Apps Script bukan JSON: ${text.substring(0, 300)}`
      );
    }

    if (!json?.success) {
      throw new Error(
        json?.message ||
        "Gagal mengambil data keuangan"
      );
    }

    return json.data;

  } catch (error: any) {

    if (error?.name === "AbortError") {
      throw new Error(
        "Timeout menghubungi Apps Script"
      );
    }

    throw error;

  } finally {

    clearTimeout(timeout);

  }
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
          <DashboardChart data={data.kas} />
        </div>
        <TransparansiTables/>
        {/* 2. BAGIAN 2 TAB TABEL BARU */}
       
      </main>
    );
 
}