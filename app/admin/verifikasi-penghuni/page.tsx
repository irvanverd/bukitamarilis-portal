"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock3, LoaderCircle, LogIn, LogOut, RefreshCw, ShieldCheck, X } from "lucide-react";

type Applicant = {
  id: string;
  namaPenghuni: string;
  blokAlamat: string;
  noHp: string;
  status: string;
  tanggalDaftar: string;
};

export default function VerifikasiPenghuniPage() {
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [items, setItems] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/penghuni", { cache: "no-store" });
      const data = await res.json();
      if (res.status === 401) {
        setLoggedIn(false);
        setItems([]);
        return;
      }
      if (!res.ok || !data.success) throw new Error(data.message || "Gagal memuat pendaftaran.");
      setItems(Array.isArray(data.data) ? data.data : []);
      setLoggedIn(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pendaftaran.");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, []);

  useEffect(() => { void loadItems(); }, [loadItems]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Login admin gagal.");
      setPassword("");
      setLoggedIn(true);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login admin gagal.");
    } finally {
      setLoginLoading(false);
      setChecking(false);
    }
  }

  async function handleDecision(item: Applicant, status: "APPROVED" | "REJECTED") {
    const catatanAdmin = noteById[item.id] || "";
    if (status === "REJECTED" && !catatanAdmin.trim()) {
      setError("Isi catatan atau alasan sebelum menolak pendaftaran.");
      return;
    }
    const confirmText = status === "APPROVED"
      ? `Setujui pendaftaran ${item.namaPenghuni}?`
      : `Tolak pendaftaran ${item.namaPenghuni}?`;
    if (!window.confirm(confirmText)) return;

    setBusyId(item.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/penghuni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status, catatanAdmin }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setLoggedIn(false);
        throw new Error("Sesi admin berakhir. Silakan login kembali.");
      }
      if (!res.ok || !data.success) throw new Error(data.message || "Keputusan gagal disimpan.");
      setNotice(data.message || "Keputusan berhasil disimpan.");
      setItems((current) => current.filter((x) => x.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Keputusan gagal disimpan.");
    } finally {
      setBusyId("");
    }
  }

  async function handleLogout() {
    try { await fetch("/api/logout", { method: "GET" }); } catch { /* cookie may expire naturally */ }
    setLoggedIn(false);
    setItems([]);
    setPassword("");
  }

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300"><LoaderCircle className="mr-2 animate-spin" size={20} /> Memeriksa sesi admin...</main>;
  }

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">← Kembali ke portal</Link>
          <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck size={28} /></div>
          <h1 className="mt-4 text-2xl font-bold">Admin Approval Penghuni</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Login menggunakan password admin portal untuk melihat dan memproses pendaftaran warga.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div><label htmlFor="username" className="mb-1.5 block text-sm font-semibold">Nama admin</label><input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950" /></div>
            <div><label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password admin</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950" /></div>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
            <button type="submit" disabled={loginLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{loginLoading ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />} Masuk sebagai admin</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">← Portal Bukit Amarilis</Link><div className="mt-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck size={25} /></div><div><h1 className="text-2xl font-bold sm:text-3xl">Approval Penghuni</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Periksa data warga sebelum menyetujui akses.</p></div></div></div>
          <div className="flex gap-2"><button onClick={() => void loadItems()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Muat ulang</button><button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"><LogOut size={16} /> Keluar</button></div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500 dark:text-slate-400">Menunggu approval</p><p className="mt-1 text-3xl font-bold">{items.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500 dark:text-slate-400">Sumber data</p><p className="mt-1 font-semibold">Google Sheets</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500 dark:text-slate-400">Status halaman</p><p className="mt-1 inline-flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Admin login</p></div></div>

        {notice && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</div>}
        {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

        <section className="mt-6">
          {loading && items.length === 0 ? <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"><LoaderCircle className="mr-2 animate-spin" size={18} /> Memuat data pendaftaran...</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900"><Check size={30} className="mx-auto text-emerald-600" /><h2 className="mt-3 text-lg font-bold">Tidak ada pendaftaran menunggu</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pendaftaran baru akan muncul di halaman ini.</p></div> : <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"><Clock3 size={13} /> Menunggu</span><h2 className="mt-3 text-lg font-bold">{item.namaPenghuni}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID: {item.id}</p></div><div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><ShieldCheck size={20} /></div></div><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Blok / alamat rumah</dt><dd className="mt-1 font-medium">{item.blokAlamat}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Nomor HP</dt><dd className="mt-1 font-medium">{item.noHp}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Tanggal daftar</dt><dd className="mt-1">{item.tanggalDaftar ? new Date(item.tanggalDaftar).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—"}</dd></div></dl><div className="mt-4"><label htmlFor={`note-${item.id}`} className="mb-1.5 block text-sm font-semibold">Catatan admin <span className="font-normal text-slate-500">(wajib jika ditolak)</span></label><textarea id={`note-${item.id}`} value={noteById[item.id] || ""} onChange={(e) => setNoteById((old) => ({ ...old, [item.id]: e.target.value }))} maxLength={500} rows={2} placeholder="Contoh: alamat perlu dikonfirmasi kembali" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950" /></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => void handleDecision(item, "APPROVED")} disabled={busyId === item.id} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{busyId === item.id ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} Setujui</button><button onClick={() => void handleDecision(item, "REJECTED")} disabled={busyId === item.id} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/40"><X size={16} /> Tolak</button></div></article>)}</div>}
        </section>
        <p className="mt-8 text-center text-xs text-slate-500">Data pendaftaran hanya ditampilkan untuk admin yang sudah login.</p>
      </div>
    </main>
  );
}
