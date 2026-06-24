export const dynamic = 'force-dynamic';

interface Kegiatan {
  id: string;
  nama: string;
  tanggal: string;
  deskripsi: string;
  foto: string;
}

export default async function HalamanKegiatan() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SHEETDB_URL}?sheet=kegiatan`, { cache: 'no-store' });
  const data: Kegiatan[] = res.ok ? await res.json() : [];

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Kegiatan Terkini</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition">
              <img src={item.foto} alt={item.nama} className="w-full h-52 object-cover" />
              <div className="p-6">
                <span className="text-xs font-semibold text-blue-600">{item.tanggal}</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 mb-2">{item.nama}</h2>
                <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">{item.deskripsi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}