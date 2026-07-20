"use client";

import { useState } from "react";
import {
  Loader2,
  Search,
  UserCheck,
  UserX,
  Eye,
  SearchX,
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cekPeserta } from "@/lib/api";
import { PesertaResult } from "@/types/lomba";

export default function CekPeserta() {
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(false);

  const [notFound, setNotFound] = useState(false);

  const [results, setResults] = useState<PesertaResult[]>([]);

  const [selected, setSelected] = useState<PesertaResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!keyword.trim()) return;

    setLoading(true);

    setNotFound(false);

    setResults([]);

    setSelected(null);

    try {
      const res = await cekPeserta(keyword);

      if (res.success && res.total > 0) {
        setResults(res.data);

        if (res.total === 1) {
          setSelected(res.data[0]);
        }
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">

      <div className="text-center">
      <div className="flex items-center mb-6">
  <Link
    href="/daftar-lomba"
    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
  >
    <ArrowLeft size={18} />
    Kembali ke Pendaftaran
  </Link>
</div>
        <h1 className="text-3xl font-bold">
          Cek Pendaftaran Lomba
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Cari berdasarkan Nama Peserta, Nomor HP,
          Alamat, atau Nomor Peserta.
        </p>

      </div>

      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6"
      >
        <div className="flex flex-col md:flex-row gap-3">

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Contoh : Budi / 8123xxxx / AR01/09 / PS00012"
            className="flex-1 rounded-lg border dark:border-zinc-700 dark:bg-zinc-800 p-3"
          />

          <button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={18}
                />
                Mencari...
              </>
            ) : (
              <>
                <Search size={18} />
                Cari
              </>
            )}
          </button>

        </div>
      </form>

      {loading && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8">

          <div className="animate-pulse space-y-4">

            <div className="h-6 w-48 rounded bg-gray-300 dark:bg-zinc-700" />

            <div className="h-4 rounded bg-gray-300 dark:bg-zinc-700" />

            <div className="h-4 rounded bg-gray-300 dark:bg-zinc-700" />

            <div className="h-4 rounded bg-gray-300 dark:bg-zinc-700" />

          </div>

        </div>
      )}

      {notFound && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-10 text-center">

          <SearchX
            size={70}
            className="mx-auto text-red-500"
          />

          <h2 className="text-2xl font-bold mt-5">
            Peserta Tidak Ditemukan
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Pastikan Nama, Nomor HP, Alamat,
            atau Nomor Peserta sudah benar.
          </p>

          <Link
            href="/daftar-lomba"
            className="inline-flex mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            Daftar Sekarang
          </Link>

        </div>
      )}

      {results.length > 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow overflow-hidden">

          <div className="border-b px-6 py-4">

            <h2 className="font-bold text-xl">

              Ditemukan {results.length} Peserta

            </h2>

            <p className="text-gray-500 text-sm mt-1">

              Klik <b>Lihat Detail</b> untuk membuka data peserta.

            </p>

          </div>

          <div className="overflow-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-100 dark:bg-zinc-800">

                <tr>

                  <th className="text-left p-3">
                    Nomor
                  </th>

                  <th className="text-left p-3">
                    Nama
                  </th>

                  <th className="text-left p-3">
                    Alamat
                  </th>

                  <th className="text-left p-3">
                    Kategori
                  </th>

                  <th className="text-center p-3">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {results.map((item) => (

                  <tr
                    key={item.idPeserta}
                    className="border-t"
                  >

                    <td className="p-3 font-semibold">
                      {item.idPeserta}
                    </td>

                    <td className="p-3">
                      {item.namaPeserta}
                    </td>

                    <td className="p-3">
                      {item.alamat}
                    </td>

                    <td className="p-3">
                      {item.kategori}
                    </td>

                    <td className="p-3 text-center">

                      <button
                        onClick={() => setSelected(item)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        <Eye size={16} />

                        Lihat Detail

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {selected && (        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow overflow-hidden">

<div className="bg-green-600 text-white p-5 flex items-center gap-3">

  <UserCheck size={34} />

  <div>

    <h2 className="text-xl font-bold">
      Peserta Ditemukan
    </h2>

    <p className="text-green-100">
      Data pendaftaran berhasil ditemukan.
    </p>

  </div>

</div>

<div className="grid md:grid-cols-2 gap-8 p-6">

  <div className="space-y-4">

    <Item
      title="Nomor Peserta"
      value={selected.idPeserta}
    />

    <Item
      title="Nama Peserta"
      value={selected.namaPeserta}
    />

    <Item
      title="Alamat"
      value={selected.alamat}
    />

    <Item
      title="Kategori"
      value={selected.kategori}
    />

    <Item
      title="Usia"
      value={`${selected.usia} Tahun`}
    />

    <Item
      title="Nomor HP"
      value={selected.noHp}
    />

  </div>

  <div>

    <h3 className="font-semibold text-lg mb-4">
      Lomba yang Diikuti
    </h3>

    <div className="space-y-3">

      {selected.lomba.map((item, index) => (

        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-4 py-3"
        >

          <div className="h-3 w-3 rounded-full bg-green-500"></div>

          <span className="font-medium">
            {item}
          </span>

        </div>

      ))}

    </div>

  </div>

</div>

<div className="border-t dark:border-zinc-700 p-5 flex flex-wrap gap-3">

  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
    onClick={() => {
      // nanti dipanggil generatePDF()
      alert("Download Bukti (Coming Soon)");
    }}
  >
    📄 Download Bukti
  </button>

  <button
    className="border dark:border-zinc-700 px-5 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
    onClick={() => window.print()}
  >
    🖨 Cetak
  </button>

  <button
    className="border dark:border-zinc-700 px-5 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
    onClick={() => setSelected(null)}
  >
    Tutup
  </button>

</div>

</div>

)}

</div>

);

}

function Item({
title,
value,
}: {
title: string;
value: string | number;
}) {
return (
<div className="rounded-lg border dark:border-zinc-700 p-4">

<div className="text-sm text-gray-500 dark:text-gray-400">
{title}
</div>

<div className="text-lg font-semibold mt-1 break-words">
{value}
</div>

</div>
);
}