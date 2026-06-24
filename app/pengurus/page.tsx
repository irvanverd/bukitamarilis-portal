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
  const SHEETDB_URL = process.env.NEXT_PUBLIC_SHEETDB_URL;
  
  if (!SHEETDB_URL) {
    console.error("SHEETDB URL belum dikonfigurasi.");
    return [];
  }

  try {
    // Ambil data khusus dari tab sheet 'pengurus'
    const res = await fetch(`${SHEETDB_URL}?sheet=pengurus`, {
      cache: 'no-store' // bypass cache agar real-time
    });

    if (!res.ok) throw new Error('Gagal fetch data');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HalamanPengurus() {
  const pengurusList = await getPengurusData();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Judul Halaman */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
            Struktur Organisasi & Pengurus
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-slate-500 text-sm sm:text-base">
            Mengenal lebih dekat jajaran pengurus yang berdedikasi tinggi.
          </p>
        </div>

        {/* Grid Struktur Kartu Pengurus */}
        {pengurusList.length === 0 ? (
          <p className="text-center text-slate-400 text-sm">Data pengurus sedang dimuat atau kosong.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {pengurusList.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition duration-300"
              >
                {/* Lingkaran Foto */}
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-blue-500 shadow-inner mb-4">
                  <img 
                    src={item.foto || 'https://via.placeholder.com/150'} 
                    alt={item.nama} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Nama & Jabatan */}
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {item.nama}
                </h3>
                <p className="text-sm font-semibold text-blue-600 mt-1 uppercase tracking-wider">
                  {item.jabatan}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}