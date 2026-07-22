"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Search, Users } from "lucide-react";

import { getJenisLomba, getListPeserta } from "@/lib/api";
import { JenisLomba, Peserta } from "@/types/lomba";
import EditPeserta from "./EditPeserta";
import { generatePesertaPDF } from "@/lib/generatePesertaPDF";
import { printPeserta } from "@/lib/printPeserta";

export default function ListPeserta() {
  const [loading, setLoading] = useState(true);

  const [peserta, setPeserta] = useState<Peserta[]>([]);

  const [kategori, setKategori] = useState("Semua");

  const [jenisLomba, setJenisLomba] = useState("Semua");

  const [keyword, setKeyword] = useState("");

  const [listLomba, setListLomba] = useState<JenisLomba[]>([]);

  const [showEdit, setShowEdit] = useState(false);
  const [editPeserta, setEditPeserta] = useState<Peserta | null>(null);

  const [selectedPeserta, setSelectedPeserta] =
  useState<Peserta | null>(null);

const [showView, setShowView] = useState(false);



const [toast, setToast] = useState<{
  show: boolean;
  message: string;
}>({
  show: false,
  message: "",
});
function onSuccess(message: string) {
  setToast({
    show: true,
    message,
  });

  setTimeout(() => {
    setToast({
      show: false,
      message: "",
    });
  }, 2500);
}

  async function loadData() {
    setLoading(true);

    try {
      const res = await getListPeserta();

      setPeserta(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function loadLomba() {
      if (kategori === "Semua") {
        setListLomba([]);
        setJenisLomba("Semua");
        return;
      }

      const data = await getJenisLomba(kategori);

      setListLomba(data);
      setJenisLomba("Semua");
    }

    loadLomba();
  }, [kategori]);

  const filtered = useMemo(() => {
    let data = [...peserta];

    if (kategori !== "Semua") {
      data = data.filter((x) => x.kategori === kategori);
    }

    if (jenisLomba !== "Semua") {
      data = data.filter((x) =>
        x.jenisLomba
          .toLowerCase()
          .includes(jenisLomba.toLowerCase())
      );
    }

    if (keyword.trim()) {
      const key = keyword.toLowerCase();

      data = data.filter(
        (x) =>
          x.namaPeserta.toLowerCase().includes(key) ||
          x.alamat.toLowerCase().includes(key) ||
          x.idPeserta.toLowerCase().includes(key)
      );
    }

    data.sort((a, b) => a.usia - b.usia);

    return data;
  }, [peserta, kategori, jenisLomba, keyword]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border p-6">

        <div className="flex items-center gap-3">

          <Users className="w-8 h-8 text-red-600" />

          <div>

            <h1 className="text-3xl font-bold">
              Daftar Peserta Lomba
            </h1>

            <p className="text-gray-500 mt-1">
              Total Peserta :{" "}
              <b>{filtered.length}</b>
            </p>

          </div>

        </div>
        <div className="flex justify-end mb-4">
  <button
    onClick={async () => {
      await fetch("/api/logout");
      location.href = "/admin_lomba";
    }}
    className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2"
  >
    Logout
  </button>
</div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border p-6">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
    
          <select
            className="border rounded-lg p-3"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          >
            <option>Semua</option>
            <option>Bapak/Ibu</option>
            <option>Remaja</option>
            <option>Anak-anak</option>
            <option>Umum</option>
          </select>

          <select
            className="border rounded-lg p-3"
            value={jenisLomba}
            onChange={(e) => setJenisLomba(e.target.value)}
          >
            <option>Semua</option>

            {listLomba.map((item) => (
              <option key={item.id}>
                {item.lomba}
              </option>
            ))}

          </select>

          <div className="relative lg:col-span-2">

            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

            <input
              className="border rounded-lg pl-10 p-3 w-full"
              placeholder="Cari nama, alamat atau nomor peserta..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

          </div>

        </div>

      </div>

      <div className="overflow-auto rounded-2xl border bg-white dark:bg-zinc-900 shadow">

        <table className="min-w-full">

          <thead className="bg-gray-100 dark:bg-zinc-800">

            <tr className="text-left">

              <th className="hidden md:table-cell">No</th>

              <th className="p-4">Nomor</th>

              <th className="p-4">Nama Peserta</th>

              <th className="hidden md:table-cell">Usia</th>

              <th className="p-4">Alamat</th>

              <th className="hidden md:table-cell">Kategori</th>

              <th className="hidden md:table-cell">Jenis Lomba</th>

              <th className="hidden md:table-cell">Status</th>

              <th className="p-4 text-center">
                Aksi
              </th>

            </tr>

          </thead>

          <tbody>

            {!loading &&
              filtered.map((item, index) => (
                <tr
                  key={item.idPeserta}
                  className="border-t hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                >
                  <td className="hidden md:table-cell">
                    {index + 1}
                  </td>

                  <td className="p-4 font-semibold">
                    {item.idPeserta}
                  </td>

                  <td>
  <div className="font-semibold">
    {item.namaPeserta}
  </div>

  <div className="text-xs text-gray-500 md:hidden">
    {item.kategori} • {item.usia} Th
  </div>
</td>

                  <td className="hidden md:table-cell">
                    {item.usia}th
                  </td>

                  <td className="p-4">
                    {item.alamat}
                  </td>

                  <td className="hidden md:table-cell">
                    {item.kategori}
                  </td>

                  <td className="hidden md:table-cell">
                    {item.jenisLomba}
                  </td>
                  <td className="hidden md:table-cell">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          item.status === "Verified"
                           ? "bg-blue-50 text-blue-700"
                            : item.status === "Cancel"
                            ? "bg-red-100 text-red-700"
                            : item.status === "Checked-In"
                             ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="whitespace-nowrap">
  <div className="flex items-center justify-center gap-2">

    {/* View */}
    <button
      onClick={() => {
        setSelectedPeserta(item);
        setShowView(true);
      }}
      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white p-2"
      title="Lihat"
    >
      <Eye size={18} />

      <span className="hidden md:inline ml-1">
        View
      </span>
    </button>

    {/* Edit */}
    <button
      onClick={() => {
        setEditPeserta(item);
        setShowEdit(true);
      }}
      className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white p-2"
      title="Edit"
    >
      <Pencil size={18} />

      <span className="hidden md:inline ml-1">
        Edit
      </span>
    </button>

  </div>
</td>
                </tr>
              ))}

            {loading && (


              <tr>

                <td
                  colSpan={9}
                  className="p-10 text-center text-gray-500"
                >
                  Memuat data peserta...
                </td>

              </tr>

            )}

            {!loading && filtered.length === 0 && (

              <tr>

                <td
                  colSpan={9}
                  className="p-10 text-center text-gray-500"
                >
                  Tidak ada data peserta.
                </td>

              </tr>
            
              

            )}
            

          </tbody>

        </table>

      </div>
            
      {showView && selectedPeserta && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-xl">

      <div className="border-b p-5">
        <h2 className="text-2xl font-bold">
          Detail Peserta
        </h2>
      </div>

      <div className="space-y-4 p-6">

        <Item label="Nomor Peserta" value={selectedPeserta.idPeserta} />
        <Item label="Nama" value={selectedPeserta.namaPeserta} />
        <Item label="Usia" value={`${selectedPeserta.usia} Tahun`} />
        <Item label="Alamat" value={selectedPeserta.alamat} />
        <Item label="Nomor HP" value={selectedPeserta.noHp} />
        <Item label="Kategori" value={selectedPeserta.kategori} />

        <div>

          <div className="font-semibold mb-2">
            Jenis Lomba yang diikuti:
          </div>

          <div className="space-y-2">

            {selectedPeserta.jenisLomba
              .split(",")
              .map((x, i) => (
                <div key={i}>
                  ✅ {x.trim()}
                </div>
              ))}

          </div>

        </div>

        <Item
          label="Status"
          value={selectedPeserta.status}
        />

      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-4">

<button
  onClick={() =>
    generatePesertaPDF({
      idPeserta: selectedPeserta.idPeserta,
      namaPeserta: selectedPeserta.namaPeserta,
      alamat: selectedPeserta.alamat,
      kategori: selectedPeserta.kategori,
      lomba:
        typeof selectedPeserta.jenisLomba === "string"
          ? selectedPeserta.jenisLomba
              .split(",")
              .map((x) => x.trim())
          : selectedPeserta.jenisLomba,
    })
  }
  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 flex items-center gap-2"
>
  📄 PDF
</button>

<button
  onClick={() =>
    printPeserta({
      idPeserta: selectedPeserta.idPeserta,
      namaPeserta: selectedPeserta.namaPeserta,
      alamat: selectedPeserta.alamat,
      kategori: selectedPeserta.kategori,
      lomba:
        typeof selectedPeserta.jenisLomba === "string"
          ? selectedPeserta.jenisLomba
              .split(",")
              .map((x) => x.trim())
          : selectedPeserta.jenisLomba,
    })
  }
  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2"
>
  🖨 Print
</button>

<button
  onClick={() => setShowView(false)}
  className="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
>
  Tutup
</button>

</div>

    </div>
  </div>
)}     

<EditPeserta
    open={showEdit}
    peserta={editPeserta}
    onClose={()=>{
        setShowEdit(false);
        setEditPeserta(null);
    }}
    onSuccess={async(message:string)=>{

        await loadData();

        setShowEdit(false);
        setEditPeserta(null);

        onSuccess(message);

    }}
/>

{toast.show && (
  <div className="fixed top-5 right-5 z-[9999] animate-in slide-in-from-top fade-in duration-300">
    <div className="flex items-center gap-3 rounded-xl bg-green-600 text-white shadow-xl px-5 py-3">

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        ✓
      </div>

      <div>
        <div className="font-semibold">
          Berhasil
        </div>

        <div className="text-sm text-green-100">
          {toast.message}
        </div>
      </div>

    </div>
  </div>
)}

</div>
  
);

/* ======================================
   HELPER COMPONENT
====================================== */

function Item({

  label,

  value,

}:{

  label:string;

  value:string;

}){

  return(

    <div className="grid grid-cols-3 gap-3 items-start">

      <div className="font-medium text-gray-500">

        {label}

      </div>

      <div className="col-span-2 font-semibold break-words">

        {value}

      </div>

    </div>

  );

}  
}
