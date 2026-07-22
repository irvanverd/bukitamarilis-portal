"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

import { getJenisLomba, updatePeserta } from "@/lib/api";
import { JenisLomba, Peserta } from "@/types/lomba";

interface Props{
  open:boolean;
  peserta:Peserta|null;

  onClose:()=>void;

  onSuccess:(message:string)=>void;
}
export default function EditPeserta({
  open,
  peserta,
  onClose,
  onSuccess,
}: Props) {

  const [loading, setLoading] = useState(false);

  const [namaPeserta, setNamaPeserta] = useState("");
  const [usia, setUsia] = useState(0);
  const [alamat, setAlamat] = useState("");
  const [noHp, setNoHp] = useState("");

  const [kategori, setKategori] = useState("");

  const [status, setStatus] = useState("Belum Hadir");

  const [listLomba, setListLomba] =
    useState<JenisLomba[]>([]);

  const [selectedLomba, setSelectedLomba] =
    useState<string[]>([]);
    const [success, setSuccess] = useState(false);  

  // ==============================
  // LOAD DATA PESERTA
  // ==============================

  useEffect(() => {

    if (!peserta) return;

    setNamaPeserta(peserta.namaPeserta);

    setUsia(Number(peserta.usia));

    setAlamat(peserta.alamat);

    setNoHp(peserta.noHp);

    setKategori(peserta.kategori);

    setStatus(
      peserta.status || "Belum Hadir"
    );

    setSelectedLomba(

      peserta.jenisLomba
        .split(",")
        .map((x) => x.trim())

    );

  }, [peserta]);

  // ==============================
  // LOAD LOMBA
  // ==============================

  useEffect(() => {

    async function load() {

      if (!kategori) return;

      const data =
        await getJenisLomba(kategori);

      setListLomba(data);

    }

    load();

  }, [kategori]);

  // ==============================
  // CHECKBOX
  // ==============================

  function toggleLomba(nama: string) {

    if (selectedLomba.includes(nama)) {

      setSelectedLomba(

        selectedLomba.filter(
          (x) => x !== nama
        )

      );

    } else {

      setSelectedLomba([

        ...selectedLomba,

        nama,

      ]);

    }

  }

  // ==============================
  // SIMPAN
  // ==============================

  async function handleSave() {

    if (!peserta) return;

    if (!namaPeserta.trim()) {

      alert("Nama belum diisi");

      return;

    }

    if (!noHp.trim()) {

      alert("Nomor HP belum diisi");

      return;

    }

    if (selectedLomba.length == 0) {

      alert("Pilih minimal satu lomba");

      return;

    }

    try {

      setLoading(true);

      const result =
        await updatePeserta({

          idPeserta: peserta.idPeserta,

          namaPeserta,

          usia,

          alamat,

          noHp,

          kategori,

          jenisLomba: selectedLomba,

          status,

        });

      if (!result.success) {

        alert(result.message);

        return;

      }

      setSuccess(true);
      setTimeout(() => {
      setSuccess(false);}, 1200);

      //onClose();
      onSuccess("Data peserta berhasil diperbarui");
      
    } catch (err) {

      alert("Gagal menyimpan");

    } finally {

      setLoading(false);

    }

  }

  if (!open || !peserta) return null;

  return (

    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5">

<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">

              Edit Peserta

            </h2>

            <p className="text-amber-100">

              {peserta.idPeserta}

            </p>

          </div>

          <button
            onClick={onClose}
          >

            <X />

          </button>

        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          <div>

            <label className="font-semibold">

              Nama Peserta

            </label>

            <input
              value={namaPeserta}
              onChange={(e)=>
                setNamaPeserta(
                  e.target.value.toUpperCase()
                )
              }
              className="w-full border rounded-lg p-3 mt-1"
            />

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="font-semibold">

                Usia

              </label>

              <input
                type="number"
                value={usia}
                onChange={(e)=>
                  setUsia(Number(e.target.value))
                }
                className="w-full border rounded-lg p-3 mt-1"
              />

            </div>

            <div>

              <label className="font-semibold">

                Nomor HP

              </label>

              <input
                value={noHp}
                onChange={(e)=>
                  setNoHp(
                    e.target.value.replace(/\D/g,"")
                  )
                }
                className="w-full border rounded-lg p-3 mt-1"
              />

            </div>

          </div>

          <div>

            <label className="font-semibold">

              Alamat

            </label>

            <input
              value={alamat}
              onChange={(e)=>
                setAlamat(
                  e.target.value.toUpperCase()
                )
              }
              className="w-full border rounded-lg p-3 mt-1"
            />

          </div>
          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="font-semibold">
                Kategori
              </label>

              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full border rounded-lg p-3 mt-1"
              >
                <option value="Anak-anak">Anak-anak</option>
                <option value="Remaja">Remaja</option>
                <option value="Bapak/Ibu">Bapak/Ibu</option>
                <option value="Umum">Umum</option>
              </select>

            </div>

            <div>

              <label className="font-semibold">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg p-3 mt-1"
              >
                <option>Open</option>
                <option>Verified</option>
                <option>Checked-In</option>
                <option>Cancel</option>
              </select>

            </div>

          </div>

          <div>

            <label className="font-semibold block mb-3">
              Jenis Lomba
            </label>

            <div className="grid md:grid-cols-2 gap-2">

              {listLomba.map((item) => (

                <label
                  key={item.id}
                  className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800"
                >

                  <input
                    type="checkbox"
                    checked={selectedLomba.includes(item.lomba)}
                    onChange={() => toggleLomba(item.lomba)}
                  />

                  <span>
                    {item.lomba}
                  </span>

                </label>

              ))}

            </div>

          </div>

        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg px-6 py-2 flex items-center gap-2"
          >

            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan
              </>
            )}

          </button>
          {success && (
  <div className="fixed top-5 right-5 z-[9999] animate-in fade-in slide-in-from-top duration-300">
    <div className="bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>

      <div>
        <div className="font-semibold">
          Berhasil
        </div>

        <div className="text-sm text-green-100">
          Data peserta berhasil diperbarui.
        </div>
      </div>
    </div>
  </div>
)}
        </div>

      </div>
            
    </div>

  );

}          