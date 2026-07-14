"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DaftarPage() {
  const router = useRouter();

const [success, setSuccess] = useState(false);

const [nomorReg, setNomorReg] = useState("");
  const params = useParams();

  const idKegiatan = params.id as string;
  const Kegiatan = params.namaKegiatan ?? "";

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    idKegiatan,
    nama: "",
    alamat: "",
    nomorHP: "",
    jenisDaftar: "",
    keterangan: "",
  });

  function updateField(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nama.trim()) {
      alert("Nama wajib diisi");
      return;
    }

    if (!form.alamat.trim()) {
      alert("Alamat wajib diisi");
      return;
    }

    if (!form.nomorHP.trim()) {
      alert("Nomor HP wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/daftar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message);
        return;
      }

      setNomorReg(result.idRegistrasi);

      setSuccess(true);

      setForm({
        idKegiatan,
        nama: "",
        alamat: "",
        nomorHP: "",
        jenisDaftar: "Peserta",
        keterangan: "",
      });
    } catch {
      alert("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">

      <div className="max-w-xl mx-auto">

        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-700">

          <div className="border-b border-slate-200 dark:border-slate-700 p-6">

            <h1 className="text-3xl font-bold">
              Form Pendaftaran
            </h1>

            <p className="text-slate-500 mt-2">
              RT Bukit Amarilis
            </p>

          </div>

          <form
            onSubmit={submit}
            className="p-6 space-y-5"
          >

            <div>

              <label className="block mb-2 text-sm font-medium">
              {Kegiatan}
              </label>

              <input
                readOnly
                hidden
                value={form.idKegiatan}
                className="w-full rounded-lg border bg-slate-100 dark:bg-slate-800 p-3"
              />

            </div>

            <div>

              <label className="block mb-2 text-sm font-medium">
                Nama Lengkap
              </label>

              <input
                name="nama"
                value={form.nama}
                onChange={updateField}
                className="w-full rounded-lg border p-3"
                placeholder="Nama lengkap"
              />

            </div>

            <div>

              <label className="block mb-2 text-sm font-medium">
                Alamat / Blok
              </label>

              <input
                name="alamat"
                value={form.alamat}
                onChange={updateField}
                className="w-full rounded-lg border p-3"
                placeholder="Contoh : Blok AR 16 No 9"
              />

            </div>

            <div>

              <label className="block mb-2 text-sm font-medium">
                Nomor HP
              </label>

              <input
                name="nomorHP"
                value={form.nomorHP}
                onChange={updateField}
                className="w-full rounded-lg border p-3"
                placeholder="081xxx"
              />

            </div>

            <div>

              <label className="block mb-2 text-sm font-medium">
                Jenis Daftar
              </label>

              <select
                name="jenisDaftar"
                value={form.jenisDaftar}
                onChange={updateField}
                className="w-full rounded-lg border p-3"
              >
                <option>Bazar UMKM</option>
                <option>Lomba 17 agustus</option>
              </select>

            </div>

            <div>

              <label className="block mb-2 text-sm font-medium">
                Keterangan
              </label>

              <textarea
                rows={5}
                name="keterangan"
                value={form.keterangan}
                onChange={updateField}
                className="w-full rounded-lg border p-3"
                placeholder="Opsional"
              />

            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white p-3 font-semibold disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : "Daftar Sekarang"}
            </button>

          </form>

        </div>

      </div>
      {success && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

    <div className="w-[90%] max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl text-center">

        <div className="text-6xl mb-4">

            🎉

        </div>

        <h2 className="text-2xl font-bold">

            Pendaftaran Berhasil

        </h2>

        <p className="mt-3 text-slate-500">

            Terima kasih telah mendaftar.

        </p>

        <div className="mt-6 rounded-xl bg-slate-100 dark:bg-slate-800 p-4">

            <div className="text-sm text-slate-500">

                Nomor Registrasi

            </div>

            <div className="mt-2 text-lg font-bold text-blue-600">

                {nomorReg}

            </div>

        </div>

        <button
            onClick={() => router.push("/")}
            className="
                mt-8
                w-full
                rounded-xl
                bg-green-600
                py-3
                font-semibold
                text-white
                hover:bg-green-700
            "
        >

            Kembali ke Beranda

        </button>

    </div>

</div>

)}
    </main>
    
  );
}