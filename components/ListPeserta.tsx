"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Search, Users } from "lucide-react";

import { getJenisLomba, getListPeserta } from "@/lib/api";
import { JenisLomba, Peserta } from "@/types/lomba";

export default function ListPeserta() {
  const [loading, setLoading] = useState(true);

  const [peserta, setPeserta] = useState<Peserta[]>([]);

  const [kategori, setKategori] = useState("Semua");

  const [jenisLomba, setJenisLomba] = useState("Semua");

  const [keyword, setKeyword] = useState("");

  const [listLomba, setListLomba] = useState<JenisLomba[]>([]);

  const [selectedPeserta, setSelectedPeserta] =
  useState<Peserta | null>(null);

const [showView, setShowView] = useState(false);

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

              <th className="p-4">No</th>

              <th className="p-4">Nomor</th>

              <th className="p-4">Nama Peserta</th>

              <th className="p-4">Usia</th>

              <th className="p-4">Alamat</th>

              <th className="p-4">Kategori</th>

              <th className="p-4">Jenis Lomba</th>

              <th className="p-4">Status</th>

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
                  <td className="p-4">
                    {index + 1}
                  </td>

                  <td className="p-4 font-semibold">
                    {item.idPeserta}
                  </td>

                  <td className="p-4">
                    {item.namaPeserta}
                  </td>

                  <td className="p-4">
                    {item.usia}
                  </td>

                  <td className="p-4">
                    {item.alamat}
                  </td>

                  <td className="p-4">
                    {item.kategori}
                  </td>

                  <td className="p-4 max-w-xs">
                    {item.jenisLomba}
                  </td>
                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          item.status === "Hadir"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Didiskualifikasi"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">
                    <button
                    onClick={() => {
                    setSelectedPeserta(item);
                    setShowView(true);
                        }}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                        >
                    <Eye className="w-4 h-4" />
                        View
                    </button>     
                        

                      <button
                        onClick={() => {
                          console.log(item);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 transition"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
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

      

    </div>


  
);
  
}
