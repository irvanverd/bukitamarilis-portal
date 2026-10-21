'use client';

import { useState, useEffect } from 'react';

interface KegiatanData { id: string; nama: string; tanggal: string; deskripsi: string; foto: string; }
interface PengurusData { id: string; nama: string; jabatan: string; foto: string; }
interface VisiMisiData { id?: string; visi: string; misi: string; }

export default function AdminEditor() {
  // ================= STATE AUTENTIKASI =================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ================= STATE EDITOR CONTEN =================
  const [activeTab, setActiveTab] = useState<'kegiatan' | 'pengurus' | 'visi-misi'>('kegiatan');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');

  const [listKegiatan, setListKegiatan] = useState<KegiatanData[]>([]);
  const [listPengurus, setListPengurus] = useState<PengurusData[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [kegiatan, setKegiatan] = useState<KegiatanData>({ id: Date.now().toString(), nama: '', tanggal: '', deskripsi: '', foto: '' });
  const [pengurus, setPengurus] = useState<PengurusData>({ id: Date.now().toString(), nama: '', jabatan: '', foto: '' });
  const [visiMisi, setVisiMisi] = useState<VisiMisiData>({ visi: '', misi: '' });

  const SHEETDB_URL = process.env.NEXT_PUBLIC_SHEETDB_URL;
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBBB_API_KEY;

  // Cek status login saat halaman pertama kali dimuat (opsional via sessionStorage)
  useEffect(() => {
    const savedLogin = sessionStorage.getItem('isAdminLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Membaca data ketika tab berpindah dan HANYA jika sudah login
  useEffect(() => {
    if (!isLoggedIn) return;
    setMessage('');
    setIsEditing(false);
    if (activeTab === 'kegiatan') fetchKegiatan();
    if (activeTab === 'pengurus') fetchPengurus();
    if (activeTab === 'visi-misi') fetchVisiMisi();
  }, [activeTab, isLoggedIn]);

  // ================= HANDLER LOGIN =================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (!SHEETDB_URL) {
      setAuthError('Konfigurasi server bermasalah (Missing SHEETDB_URL).');
      setAuthLoading(false);
      return;
    }

    try {
      // Menggunakan fitur search dari SheetDB untuk mencari user berdasarkan username
      const res = await fetch(`${SHEETDB_URL}/search?sheet=user&username=${encodeURIComponent(loginUsername)}`);
      const users = await res.json();

      // Cek apakah user ditemukan dan password-nya cocok
      if (Array.isArray(users) && users.length > 0) {
        const matchedUser = users[0];
        if (matchedUser.password === loginPassword) {
          setIsLoggedIn(true);
          sessionStorage.setItem('isAdminLoggedIn', 'true'); // simpan session agar tidak logout saat di-refresh
        } else {
          setAuthError('Password yang Anda masukkan salah.');
        }
      } else {
        setAuthError('Username tidak ditemukan.');
      }
    } catch (err) {
      setAuthError('Gagal terhubung ke database.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isAdminLoggedIn');
    setLoginUsername('');
    setLoginPassword('');
  };

  // ================= FETCH DATA FUNCTIONS =================
  const fetchKegiatan = async () => {
    try {
      const res = await fetch(`${SHEETDB_URL}?sheet=kegiatan`);
      const data = await res.json();
      if (Array.isArray(data)) setListKegiatan(data);
    } catch (err) { console.error(err); }
  };

  const fetchPengurus = async () => {
    try {
      const res = await fetch(`${SHEETDB_URL}?sheet=pengurus`);
      const data = await res.json();
      if (Array.isArray(data)) setListPengurus(data);
    } catch (err) { console.error(err); }
  };

  const fetchVisiMisi = async () => {
    try {
      const res = await fetch(`${SHEETDB_URL}?sheet=tentang`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setVisiMisi(data[0]);
    } catch (err) { console.error(err); }
  };

  // ================= IMAGE UPLOAD HELPER =================
  const uploadImageToImgBB = async (file: File): Promise<string | null> => {
    if (!IMGBB_API_KEY) return null;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
      const result = await response.json();
      return result.success ? result.data.url : null;
    } catch { return null; } finally { setUploadingImage(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, targetForm: 'kegiatan' | 'pengurus') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedUrl = await uploadImageToImgBB(file);
    if (uploadedUrl) {
      if (targetForm === 'kegiatan') setKegiatan({ ...kegiatan, foto: uploadedUrl });
      if (targetForm === 'pengurus') setPengurus({ ...pengurus, foto: uploadedUrl });
    }
  };

  // ================= ACTION HANDLERS (SUBMIT / DELETE) =================
  const handleKegiatanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await fetch(`${SHEETDB_URL}/id/${kegiatan.id}?sheet=kegiatan`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: kegiatan }),
        });
        setMessage('Berhasil memperbarui data kegiatan!');
      } else {
        await fetch(`${SHEETDB_URL}?sheet=kegiatan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [kegiatan] }),
        });
        setMessage('Berhasil menambah kegiatan baru!');
      }
      setKegiatan({ id: Date.now().toString(), nama: '', tanggal: '', deskripsi: '', foto: '' });
      setIsEditing(false);
      fetchKegiatan();
    } catch { setMessage('Terjadi kesalahan koneksi.'); } finally { setLoading(false); }
  };

  const handleDeleteKegiatan = async (id: string) => {
    if (!confirm("Hapus kegiatan ini?")) return;
    try {
      await fetch(`${SHEETDB_URL}/id/${id}?sheet=kegiatan`, { method: 'DELETE' });
      setMessage('Kegiatan berhasil dihapus!');
      fetchKegiatan();
    } catch { setMessage('Gagal menghapus data.'); }
  };

  const handlePengurusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await fetch(`${SHEETDB_URL}/id/${pengurus.id}?sheet=pengurus`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: pengurus }),
        });
        setMessage('Berhasil memperbarui data pengurus!');
      } else {
        await fetch(`${SHEETDB_URL}?sheet=pengurus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [pengurus] }),
        });
        setMessage('Berhasil menambah pengurus baru!');
      }
      setPengurus({ id: Date.now().toString(), nama: '', jabatan: '', foto: '' });
      setIsEditing(false);
      fetchPengurus();
    } catch { setMessage('Terjadi kesalahan koneksi.'); } finally { setLoading(false); }
  };

  const handleDeletePengurus = async (id: string) => {
    if (!confirm("Hapus pengurus ini?")) return;
    try {
      await fetch(`${SHEETDB_URL}/id/${id}?sheet=pengurus`, { method: 'DELETE' });
      setMessage('Pengurus berhasil dihapus!');
      fetchPengurus();
    } catch { setMessage('Gagal menghapus data.'); }
  };

  const handleVisiMisiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${SHEETDB_URL}/all?sheet=tentang`, { method: 'DELETE' });
      await fetch(`${SHEETDB_URL}?sheet=tentang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [visiMisi] }),
      });
      setMessage('Visi & Misi berhasil diperbarui!');
      fetchVisiMisi();
    } catch { setMessage('Gagal memperbarui Visi & Misi.'); } finally { setLoading(false); }
  };

  // ================= RENDERING =================

  // TAMPILAN 1: FORM LOGIN (Jika belum terautentikasi)
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Login</h1>
            <p className="text-slate-500 text-sm mt-1">Masukkan kredensial Anda untuk mengelola website</p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="mt-1 block w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                placeholder="Masukkan username admin"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mt-1 block w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold p-3.5 rounded-xl transition disabled:bg-slate-400"
            >
              {authLoading ? 'Memeriksa Database...' : 'Masuk Dashboard'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // TAMPILAN 2: HALAMAN UTAMA EDITOR (Jika sukses login)
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Top Header dengan Tombol Keluar */}
        <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Admin & Editor</h1>
            <p className="text-slate-400 text-xs mt-1">Sistem manajemen konten terpadu Google Sheets</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition"
          >
            Keluar (Logout)
          </button>
        </div>

        {/* Tab Menu */}
        <div className="flex border-b bg-slate-50 overflow-x-auto">
          <button onClick={() => setActiveTab('kegiatan')} className={`flex-1 min-w-[120px] py-4 text-center font-semibold text-sm ${activeTab === 'kegiatan' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-500'}`}>
            Kegiatan
          </button>
          <button onClick={() => setActiveTab('pengurus')} className={`flex-1 min-w-[120px] py-4 text-center font-semibold text-sm ${activeTab === 'pengurus' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-500'}`}>
            Struktur Pengurus
          </button>
          <button onClick={() => setActiveTab('visi-misi')} className={`flex-1 min-w-[120px] py-4 text-center font-semibold text-sm ${activeTab === 'visi-misi' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-500'}`}>
            Visi & Misi
          </button>
        </div>

        {message && (
          <div className="p-4 mx-6 mt-6 rounded-xl text-sm font-medium text-center bg-blue-50 text-blue-700 border border-blue-200">
            {message}
          </div>
        )}

        <div className="p-6">
          {/* CONTENT TAB 1: KEGIATAN */}
          {activeTab === 'kegiatan' && (
            <div className="space-y-8">
              <form onSubmit={handleKegiatanSubmit} className="space-y-5 bg-slate-50 p-5 rounded-2xl border">
                <div className="border-b pb-2"><h2 className="text-lg font-bold text-slate-800">{isEditing ? '⚡ Sunting Kegiatan' : '➕ Tambah Kegiatan Baru'}</h2></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Nama Kegiatan</label>
                  <input type="text" required value={kegiatan.nama} onChange={(e) => setKegiatan({...kegiatan, nama: e.target.value})} className="mt-1 block w-full p-3 bg-white border border-slate-300 rounded-xl outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Tanggal Pelaksanaan</label>
                    <input type="date" required value={kegiatan.tanggal} onChange={(e) => setKegiatan({...kegiatan, tanggal: e.target.value})} className="mt-1 block w-full p-3 bg-white border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Foto Kegiatan</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'kegiatan')} className="mt-1 block w-full text-sm border border-slate-300 rounded-xl p-1.5 bg-white" />
                    {uploadingImage && <p className="text-xs text-blue-600 mt-1 animate-pulse">Mengunggah gambar...</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Deskripsi Detail</label>
                  <textarea rows={4} required value={kegiatan.deskripsi} onChange={(e) => setKegiatan({...kegiatan, deskripsi: e.target.value})} className="mt-1 block w-full p-3 bg-white border border-slate-300 rounded-xl outline-none"></textarea>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl transition">
                    {isEditing ? 'Simpan Perubahan' : 'Simpan Kegiatan'}
                  </button>
                  {isEditing && <button type="button" onClick={() => { setIsEditing(false); setKegiatan({ id: Date.now().toString(), nama: '', tanggal: '', deskripsi: '', foto: '' }); }} className="bg-slate-300 p-3 rounded-xl">Batal</button>}
                </div>
              </form>

              <div className="space-y-3">
                <h3 className="text-md font-bold text-slate-700">Daftar Kegiatan:</h3>
                <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-700 text-sm font-semibold"><th className="p-4">Foto</th><th className="p-4">Nama Kegiatan</th><th className="p-4">Tanggal</th><th className="p-4 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y text-sm text-slate-600">
                      {listKegiatan.length === 0 ? (<tr><td colSpan={4} className="p-4 text-center text-slate-400">Belum ada data.</td></tr>) : (
                        listKegiatan.map((k) => (
                          <tr key={k.id} className="hover:bg-slate-50">
                            <td className="p-4"><img src={k.foto} className="w-12 h-8 object-cover rounded border" /></td>
                            <td className="p-4 font-semibold text-slate-800">{k.nama}</td>
                            <td className="p-4">{k.tanggal}</td>
                            <td className="p-4 text-center space-x-2">
                              <button onClick={() => { setKegiatan(k); setIsEditing(true); }} className="text-blue-600 hover:underline">Edit</button>
                              <button onClick={() => handleDeleteKegiatan(k.id)} className="text-red-600 hover:underline">Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT TAB 2: STRUKTUR PENGURUS */}
          {activeTab === 'pengurus' && (
            <div className="space-y-8">
              <form onSubmit={handlePengurusSubmit} className="space-y-5 bg-slate-50 p-5 rounded-2xl border">
                <div className="border-b pb-2"><h2 className="text-lg font-bold text-slate-800">{isEditing ? '⚡ Sunting Pengurus' : '➕ Tambah Pengurus'}</h2></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Nama Lengkap</label>
                  <input type="text" required value={pengurus.nama} onChange={(e) => setPengurus({...pengurus, nama: e.target.value})} className="mt-1 block w-full p-3 bg-white border border-slate-300 rounded-xl outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Jabatan</label>
                    <input type="text" required value={pengurus.jabatan} onChange={(e) => setPengurus({...pengurus, jabatan: e.target.value})} className="mt-1 block w-full p-3 bg-white border border-slate-300 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Foto Profil</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'pengurus')} className="mt-1 block w-full text-sm border border-slate-300 rounded-xl p-1.5 bg-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold p-3 rounded-xl transition">Simpan</button>
                  {isEditing && <button type="button" onClick={() => { setIsEditing(false); setPengurus({ id: Date.now().toString(), nama: '', jabatan: '', foto: '' }); }} className="bg-slate-300 p-3 rounded-xl">Batal</button>}
                </div>
              </form>

              <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b text-slate-700 text-sm font-semibold"><th className="p-4">Foto</th><th className="p-4">Nama</th><th className="p-4">Jabatan</th><th className="p-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y text-sm text-slate-600">
                    {listPengurus.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-4"><img src={p.foto} className="w-10 h-10 object-cover rounded-full border" /></td>
                        <td className="p-4 font-semibold text-slate-800">{p.nama}</td>
                        <td className="p-4">{p.jabatan}</td>
                        <td className="p-4 text-center space-x-2">
                          <button onClick={() => { setPengurus(p); setIsEditing(true); }} className="text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDeletePengurus(p.id)} className="text-red-600 hover:underline">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT TAB 3: VISI MISI */}
          {activeTab === 'visi-misi' && (
            <form onSubmit={handleVisiMisiSubmit} className="space-y-5 bg-slate-50 p-5 rounded-2xl border">
              <div className="border-b pb-2"><h2 className="text-lg font-bold text-slate-800">📝 Perbarui Visi & Misi Organisasi</h2></div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Visi Utama</label>
                <textarea rows={3} required value={visiMisi.visi} onChange={(e) => setVisiMisi({...visiMisi, visi: e.target.value})} className="mt-1 block w-full p-3 bg-white border border-slate-300 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Misi</label>
                <textarea rows={6} required value={visiMisi.misi} onChange={(e) => setVisiMisi({...visiMisi, misi: e.target.value})} className="mt-1 block w-full p-3 bg-white border border-slate-300 rounded-xl outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3.5 rounded-xl transition">
                Perbarui Visi & Misi
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}