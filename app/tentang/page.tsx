export const dynamic = 'force-dynamic';

interface TentangData {
  visi: string;
  misi: string;
}

export default async function HalamanTentang() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SHEETDB_URL}?sheet=tentang`, { cache: 'no-store' });
  const result = res.ok ? await res.json() : [];
  const data: TentangData = result[0] || { visi: 'Belum diisi', misi: 'Belum diisi' };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border shadow-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Visi & Misi Organisasi</h1>
        </div>
        
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Visi</h2>
          <p className="text-lg italic text-slate-700 leading-relaxed">"{data.visi}"</p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Misi</h2>
          <p className="text-base leading-relaxed whitespace-pre-line">{data.misi}</p>
        </div>
      </div>
    </main>
  );
}