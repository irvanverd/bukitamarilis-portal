"use client";


import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { daftarPeserta, getJenisLomba } from "@/lib/api";
import { JenisLomba } from "@/types/lomba";
import { generatePesertaPDF } from "@/lib/generatePesertaPDF";
import { printPeserta } from "@/lib/printPeserta";



export default function FormLomba() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasilDaftar, setHasilDaftar] = useState({
  idPeserta: "",
  namaPeserta: "",
  kategori: "",
  alamat: "",
  lomba: [] as string[],
});
  const [alamat, setAlamat] = useState("");
  const [namaPeserta, setNamaPeserta] = useState("");
  const [usia, setUsia] = useState("");
  const [kategori, setKategori] = useState("");
  const [noHp, setNoHp] = useState("");

  const [listLomba, setListLomba] = useState<JenisLomba[]>([]);
  const [selectedLomba, setSelectedLomba] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingLomba, setLoadingLomba] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const router = useRouter();
  const [duplicateNoHp, setDuplicateNoHp] = useState("");

  const [errors, setErrors] = useState({
    alamat: "",
    nama: "",
    hp: "",
    lomba: "",
  });


  useEffect(() => {
    if (!kategori) {
      setListLomba([]);
      setSelectedLomba([]);
      return;
    }

    async function load() {
      setLoadingLomba(true);

      try {
        const data = await getJenisLomba(kategori);
        setListLomba(data);
        setSelectedLomba([]);
      } catch (err) {
        console.error(err);
        setListLomba([]);
      } finally {
        setLoadingLomba(false);
      }
    }

    load();
  }, [kategori]);

  
  function toggleLomba(lomba: string) {
    if (selectedLomba.includes(lomba)) {
      setSelectedLomba(selectedLomba.filter((x) => x !== lomba));
    } else {
      setSelectedLomba([...selectedLomba, lomba]);
    }
  }

  function validateForm() {

    const err = {
      alamat: "",
      nama: "",
      hp: "",
      lomba: "",
    };
  
    let valid = true;
  
    if (!alamat.trim()) {
      err.alamat = "Alamat wajib diisi";
      valid = false;
    }
  
    if (!namaPeserta.trim()) {
      err.nama = "Nama peserta wajib diisi";
      valid = false;
    }
  
    if (!noHp.trim()) {
      err.hp = "Nomor HP wajib diisi";
      valid = false;
    }
  
    if (selectedLomba.length === 0) {
      err.lomba = "Pilih minimal satu lomba";
      valid = false;
    }
  
    setErrors(err);
  
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const result = await daftarPeserta({
        alamat,
        namaPeserta,
        usia: Number(usia),
        kategori,
        noHp,
        jenisLomba: selectedLomba,
      });

      if (result.success) {
        setHasilDaftar({
          idPeserta: result.idPeserta,
          namaPeserta,
          kategori,
          alamat,
          lomba: selectedLomba,
        });
        
        setShowSuccess(true);

        setAlamat("");
        setNamaPeserta("");
        setUsia("");
        setKategori("");
        setNoHp("");
        setSelectedLomba([]);
        setListLomba([]);
      } else {
        //alert(result.message);
        setDuplicateMessage(result.message);
        setDuplicateNoHp(noHp);
        setShowDuplicate(true);
        return;

return;
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow"
    >
      <div>
        <label className="block mb-2 font-medium">
          Alamat (Blok/Nomor)
        </label>

        <input
          className={`w-full rounded-lg p-3 border ${
            errors.alamat
              ? "border-red-500"
              : "border-gray-300 dark:border-zinc-700"
        }`}
          value={alamat}
          onChange={(e) =>
            setAlamat(e.target.value.toUpperCase())
          }
          placeholder="Contoh : AR01/01"
        />
        {errors.alamat && (
<p className="text-red-500 text-sm mt-1">
    {errors.alamat}
</p>
)}
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Nama Peserta
        </label>

        <input
        className={`w-full rounded-lg p-3 border ${
          errors.nama
            ? "border-red-500"
            : "border-gray-300 dark:border-zinc-700"
      }`}
          value={namaPeserta}
          onChange={(e) =>
            setNamaPeserta(e.target.value.toUpperCase())
          }
            placeholder="Nama Peserta"
        />
        {errors.nama && (
<p className="text-red-500 text-sm mt-1">
    {errors.nama}
</p>
)}
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Usia
        </label>

        <input
          type="number"
          min={1}
          max={100}
          className="w-full border rounded-lg p-3"
          value={usia}
          onChange={(e) => setUsia(e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Nomor HP
        </label>

        <input
         type="tel"
         inputMode="numeric"
         pattern="[0-9]*"
         maxLength={15}
            className={`w-full rounded-lg p-3 border ${
              errors.hp
                ? "border-red-500"
                : "border-gray-300 dark:border-zinc-700"
          }`}
          value={noHp}
          onChange={(e) => {
            const onlyNumber = e.target.value;
            setNoHp(onlyNumber);
          }}
        />
        {errors.hp && (
<p className="text-red-500 text-sm mt-1">
    {errors.hp}
</p>
)}
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Kategori
        </label>

        <select
    
          className={`w-full rounded-lg p-3 border ${
            errors.lomba
              ? "border-red-500"
              : "border-gray-300 dark:border-zinc-700"
        }`}
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        > 
          <option value="">Pilih Kategori</option>
          <option value="Bapak/Ibu">Bapak / Ibu</option>
          <option value="Remaja">Remaja</option>
          <option value="Anak-anak">Anak-anak</option>
          <option value="Umum">Umum</option>
          
        </select>
          
      </div>
        
      

      {kategori && (
        <div>
          <label className="block mb-3 font-medium">
            Pilih Lomba
          </label>

          {loadingLomba ? (
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                />
              </svg>

              <span>Loading daftar lomba...</span>
            </div>
          ) : listLomba.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Tidak ada lomba pada kategori ini.
            </p>
          ) : (
            <div className="space-y-2">
              {errors.lomba && (
    <p className="text-red-500 text-sm mt-2">
        {errors.lomba}
    </p>
)}
              {listLomba.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 cursor-pointer rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  
                  <input
                    type="checkbox"
                    checked={selectedLomba.includes(item.lomba)}
                    onChange={() => toggleLomba(item.lomba)}
                  />
                  
                  <span>{item.lomba}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Mendaftarkan..." : "Daftar"}
      </button>

      {showSuccess && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-6">

      <h2 className="text-2xl font-bold text-center text-green-600">
        🎉 Pendaftaran Berhasil
      </h2>

      <div className="mt-6 text-center">

        <p className="text-gray-500">
          Nomor Peserta
        </p>

        <div className="mt-2 text-3xl font-bold text-red-600">
          {hasilDaftar.idPeserta}
        </div>

      </div>

      <div className="mt-6 space-y-2">

        <p>
          <b>Nama :</b> {hasilDaftar.namaPeserta}
        </p>

        <p>
          <b>Alamat :</b> {hasilDaftar.alamat}
        </p>

        <p>
          <b>Kategori :</b> {hasilDaftar.kategori}
        </p>

        <div>

          <b>Lomba :</b>

          <ul className="list-disc ml-6 mt-2">

            {hasilDaftar.lomba.map((x) => (
              <li key={x}>{x}</li>
            ))}

          </ul>

        </div>

      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">

        <button
          onClick={() =>printPeserta(hasilDaftar)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3"
        >
          🖨 Cetak
        </button>

        <button
         onClick={() => generatePesertaPDF(hasilDaftar)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-3"
        >
          ⬇ Download
        </button>

      </div>

      <button
        onClick={() => setShowSuccess(false)}
        className="mt-4 w-full border rounded-lg py-3"
      >
        Tutup
      </button>

    </div>
  
  </div>
)}
 {showDuplicate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

    <div className="w-[92%] max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl p-7 animate-in fade-in zoom-in-95">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <span className="text-5xl">⚠️</span>
      </div>

      <h2 className="mt-5 text-center text-2xl font-bold text-red-600">
        Peserta Sudah Terdaftar
      </h2>

      <p className="mt-5 text-center leading-7 text-gray-600 dark:text-gray-300">
        Nama peserta dengan
        <b> Nomor HP tersebut </b>
        telah terdaftar sebelumnya.
      </p>

      <div className="mt-5 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm leading-6 text-yellow-800 dark:text-yellow-200">
        💡 Silakan cek kembali data Anda atau hubungi panitia apabila merasa belum pernah melakukan pendaftaran.
      </div>

      <div className="mt-7 space-y-3">

        <button
          onClick={() =>
            router.push(
              `/cek-peserta?q=${encodeURIComponent(duplicateNoHp)}`
            )
          }
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          🔍 Cek Data Saya
        </button>

        <button
          onClick={() => setShowDuplicate(false)}
          className="w-full rounded-lg border border-gray-300 py-3 font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          Tutup
        </button>

      </div>

    </div>

  </div>
)}
    </form>
  );
}