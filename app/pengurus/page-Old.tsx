import { Metadata } from 'next';

// Memaksa halaman ini selalu mengambil data baru (tidak di-cache permanen di Vercel)
export const dynamic = 'force-dynamic';

interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  foto: string;
}

async function getPengurusData(): Promise<Pengurus[]> {
  const API_URL = process.env.NEXT_APPSCRIPT_API;

  if (!API_URL) {
    console.error("NEXT_APPSCRIPT_API belum dikonfigurasi.");
    return [];
  }

  try {
    const url = new URL(API_URL);
    url.searchParams.set("action", "getPengurus");

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Gagal fetch data: ${res.status}`);
    }

    const json = await res.json();

    if (!json?.success) {
      throw new Error(
        json?.message || "Gagal mengambil data pengurus"
      );
    }

    return Array.isArray(json.data)
      ? json.data
      : [];

  } catch (error) {
    console.error("Gagal mengambil data pengurus:", error);
    return [];
  }
}

export default async function HalamanPengurus() {
  const pengurusList = await getPengurusData();

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* 1. SEKSI FULL-WIDTH IMAGE BANNER */}
      <div className="w-full h-48 sm:h-64 md:h-180 relative overflow-hidden shadow-sm">
        <img 
          src="/assets/bagan.jpg"
          alt="Banner Pengurus RT 07" 
          className="w-full h-full object-cover"
        />
        {/* Overlay gelap tipis agar gambar terlihat lebih sinematik dan elegan */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        



      </div>
    </main>
  );
}