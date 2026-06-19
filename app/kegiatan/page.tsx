export default function KegiatanPage() {
    const kegiatan = [
      {
        nama: "Kerja Bakti",
        tanggal: "29 Juni 2025",
      },
      {
        nama: "Posyandu",
        tanggal: "15 Juli 2025",
      },
      {
        nama: "Rapat Warga",
        tanggal: "20 Juli 2025",
      },
    ];
  
    return (
      <div className="max-w-7xl mx-auto p-6">
  
        <h1 className="text-3xl font-bold mb-6">
          Kegiatan Warga
        </h1>
  
        <div className="grid md:grid-cols-3 gap-6">
  
          {kegiatan.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow"
            >
              <div className="h-48 bg-gray-200 rounded-t-lg" />
  
              <div className="p-4">
                <h3 className="font-bold">
                  {item.nama}
                </h3>
  
                <p className="text-gray-500 mt-2">
                  {item.tanggal}
                </p>
              </div>
            </div>
          ))}
  
        </div>
  
      </div>
    );
  }