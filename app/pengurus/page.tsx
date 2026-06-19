export default function PengurusPage() {
    const pengurus = [
      {
        jabatan: "Ketua RT",
        nama: "Bapak Ahmad",
      },
      {
        jabatan: "Wakil Ketua",
        nama: "Bapak Budi",
      },
      {
        jabatan: "Sekretaris",
        nama: "Ibu Santi",
      },
      {
        jabatan: "Bendahara",
        nama: "Ibu Rina",
      },
    ];
  
    return (
      <div className="max-w-7xl mx-auto p-6">
  
        <h1 className="text-3xl font-bold mb-6">
          Susunan Pengurus
        </h1>
  
        <div className="grid md:grid-cols-4 gap-6">
  
          {pengurus.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 text-center"
            >
              <h3 className="font-bold">
                {item.jabatan}
              </h3>
  
              <p className="mt-4 text-gray-600">
                {item.nama}
              </p>
            </div>
          ))}
  
        </div>
  
      </div>
    );
  }