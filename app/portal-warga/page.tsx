"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Home,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareWarning,
  Plus,
  ReceiptText,
  Ruler,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

type Tab = "ringkasan" | "unit" | "ipl" | "komplain" | "surat";
type Complaint = {
  id: string;
  title: string;
  category: string;
  date: string;
  status: "Diproses" | "Selesai" | "Menunggu";
  detail: string;
};
type LetterRequest = {
  id: string;
  type: string;
  purpose: string;
  date: string;
  status: "Diproses" | "Selesai" | "Menunggu";
};

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const navItems: { id: Tab; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: "ringkasan", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { id: "unit", label: "Unit saya", shortLabel: "Unit", icon: Home },
  { id: "ipl", label: "Riwayat IPL", shortLabel: "IPL", icon: Wallet },
  { id: "komplain", label: "Komplain", shortLabel: "Komplain", icon: MessageSquareWarning },
  { id: "surat", label: "Surat Pengantar", shortLabel: "Surat", icon: FileText },
];

const payments = [
  { period: "Oktober 2026", invoice: "IPL-2026-10-A12", amount: 110000, due: "31 Okt 2026", status: "Belum dibayar" },
  { period: "September 2026", invoice: "IPL-2026-09-A12", amount: 110000, due: "30 Sep 2026", status: "Belum dibayar" },
  { period: "Agustus 2026", invoice: "IPL-2026-08-A12", amount: 110000, due: "31 Agu 2026", status: "Lunas" },
  { period: "Juli 2026", invoice: "IPL-2026-07-A12", amount: 110000, due: "31 Jul 2026", status: "Lunas" },
  { period: "Juni 2026", invoice: "IPL-2026-06-A12", amount: 110000, due: "30 Jun 2026", status: "Lunas" },
  { period: "Mei 2026", invoice: "IPL-2026-05-A12", amount: 110000, due: "31 Mei 2026", status: "Lunas" },
];

const initialComplaints: Complaint[] = [
  {
    id: "KMP-026",
    title: "Lampu jalan dekat Blok AR.27 mati",
    category: "Fasilitas umum",
    date: "18 Okt 2026",
    status: "Diproses",
    detail: "Lampu jalan di dekat persimpangan Blok A sudah beberapa malam tidak menyala.",
  },
  {
    id: "KMP-021",
    title: "Pembersihan saluran air",
    category: "Kebersihan",
    date: "10 Okt 2026",
    status: "Selesai",
    detail: "Permintaan pemeriksaan saluran air di depan rumah.",
  },
];

const initialLetters: LetterRequest[] = [
  {
    id: "SPR-009",
    type: "Surat Keterangan Domisili",
    purpose: "Administrasi sekolah",
    date: "15 Okt 2026",
    status: "Diproses",
  },
];

function StatusPill({ status }: { status: string }) {
  const classes =
    status === "Lunas" || status === "Selesai"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "Terlambat"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : status === "Diproses"
          ? "bg-blue-50 text-blue-700 ring-blue-200"
          : "bg-amber-50 text-amber-700 ring-amber-200";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}>{status}</span>;
}

function SectionHeading({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 ${className}`}>{children}</section>;
}

export default function PortalWargaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ringkasan");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [housePhoto, setHousePhoto] = useState("");
  const [complaints, setComplaints] = useState(initialComplaints);
  const [letters, setLetters] = useState(initialLetters);
  const [complaintCategory, setComplaintCategory] = useState("Fasilitas umum");
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDetail, setComplaintDetail] = useState("");
  const [letterType, setLetterType] = useState("Surat Keterangan Domisili");
  const [letterPurpose, setLetterPurpose] = useState("");
  const [toast, setToast] = useState("");

  const currentTab = navItems.find((item) => item.id === activeTab) ?? navItems[0];
  const paidThisYear = useMemo(() => payments.filter((item) => item.status === "Lunas").reduce((total, item) => total + item.amount, 0), []);

  function goTo(tab: Tab) {
    setActiveTab(tab);
    setMobileNavOpen(false);
    setToast("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast("Pilih file foto dengan format gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast("Ukuran foto maksimal 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setHousePhoto(String(reader.result ?? ""));
    reader.readAsDataURL(file);
    setToast("Foto hanya ditampilkan sebagai pratinjau di perangkat ini; belum diunggah ke server.");
  }

  function submitComplaint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complaintTitle.trim() || !complaintDetail.trim()) {
      setToast("Lengkapi judul dan detail komplain terlebih dahulu.");
      return;
    }
    const now = new Date();
    const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(now);
    setComplaints((items) => [
      { id: `DEMO-${String(items.length + 1).padStart(3, "0")}`, title: complaintTitle.trim(), category: complaintCategory, date, status: "Menunggu", detail: complaintDetail.trim() },
      ...items,
    ]);
    setComplaintTitle("");
    setComplaintDetail("");
    setToast("Komplain masuk ke daftar demo di halaman ini saja. Belum disimpan ke Google Sheets.");
  }

  function submitLetter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!letterPurpose.trim()) {
      setToast("Isi tujuan pengajuan surat terlebih dahulu.");
      return;
    }
    const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
    setLetters((items) => [
      { id: `DEMO-${String(items.length + 1).padStart(3, "0")}`, type: letterType, purpose: letterPurpose.trim(), date, status: "Menunggu" },
      ...items,
    ]);
    setLetterPurpose("");
    setToast("Pengajuan surat masuk halaman ini saja. Belum dikirim ke pengurus.");
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-slate-800">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col border-r border-slate-200 bg-white lg:flex">
          <Link href="/" className="flex h-[78px] items-center gap-3 border-b border-slate-100 px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white"><Home size={21} /></span>
            <span><span className="block text-base font-extrabold tracking-tight text-slate-900">MyAmarilis</span><span className="mt-0.5 block text-[11px] text-slate-500">Portal Penghuni</span></span>
          </Link>
          <div className="px-4 pt-6">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Menu utama</p>
            <nav className="space-y-1.5" aria-label="Navigasi portal penghuni">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => goTo(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
                    <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                    <span>{item.label}</span>
                    {active ? <ChevronRight size={16} className="ml-auto" /> : null}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><CircleHelp size={18} /></span>
              <p className="mt-3 text-sm font-bold text-slate-800">Butuh bantuan?</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Hubungi pengurus RT untuk informasi layanan warga.</p>
              <button onClick={() => goTo("komplain")} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900">Lihat layanan <ArrowRight size={14} /></button>
            </div>
            <Link href="/" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"><LogOut size={17} />Kembali ke portal publik</Link>
          </div>
        </aside>

        {mobileNavOpen ? <button aria-label="Tutup menu" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" /> : null}
        {mobileNavOpen ? (
          <aside className="fixed inset-y-0 left-0 z-50 w-[285px] bg-white p-4 shadow-xl lg:hidden">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white"><Home size={19} /></span><span className="font-extrabold text-slate-900">MyAmarilis</span></div>
              <button onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} onClick={() => goTo(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${activeTab === item.id ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={18} />{item.label}</button>;
              })}
            </nav>
            <Link href="/" className="mt-5 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500"><LogOut size={17} />Kembali ke portal publik</Link>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1 lg:ml-[258px]">
          <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-7">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileNavOpen(true)} aria-label="Buka menu" className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"><Menu size={19} /></button>
              <div><p className="text-sm font-bold text-slate-900 md:text-base">{currentTab.label}</p><p className="hidden text-[11px] text-slate-400 sm:block">RT 07 / RW 14 · Bukit Amarilis</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 sm:inline-flex">Mode demo · data dummy</span>
              <button onClick={() => setToast("Belum ada notifikasi baru pada mode demo.")} aria-label="Notifikasi" className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500" /></button>
              <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 md:pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">IV</div>
                <div className="hidden sm:block"><p className="text-xs font-bold text-slate-800">Irvan Verdiansyah</p><p className="text-[10px] text-slate-500">Blok AR.16/09</p></div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-7 md:py-8">
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 sm:text-sm">
              <strong>Pratinjau tampilan.</strong> Nama, unit, tarif IPL, tagihan, riwayat pembayaran, komplain, dan surat di halaman ini hanyalah data contoh. Belum terhubung ke akun penghuni atau Google Sheets.
            </div>
            {toast ? <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{toast}</span><button onClick={() => setToast("")} aria-label="Tutup pesan"><X size={16} /></button></div> : null}

            {activeTab === "ringkasan" ? (
              <>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div><p className="text-sm font-medium text-emerald-700">Rabu, 21 Oktober 2026</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">Selamat datang, Irvan <span aria-hidden="true">👋</span></h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Pantau tagihan IPL, informasi unit rumah, dan layanan administrasi warga dari satu tempat.</p></div>
                  <button onClick={() => goTo("unit")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">Lihat unit saya <ArrowRight size={16} /></button>
                </div>

                <section className="relative mb-6 overflow-hidden rounded-[26px] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-5 text-white shadow-lg shadow-emerald-900/10 md:p-7">
                  <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[28px] border-white/5" />
                  <div className="pointer-events-none absolute -bottom-24 right-32 h-60 w-60 rounded-full border-[32px] border-white/5" />
                  <div className="relative grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-100"><Wallet size={17} /> Total tagihan saat ini</div>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{money(110000)}</p>
                      <p className="mt-2 text-xs text-emerald-100 md:text-sm">3 periode belum lunas · Termasuk tagihan Oktober 2026</p>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button onClick={() => goTo("ipl")} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 shadow-sm hover:bg-emerald-50">Lihat detail tagihan <ArrowRight size={16} /></button>
                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-xs font-semibold"><CalendarDays size={15} /> Jatuh tempo terdekat: 31 Okt</span>
                      </div>
                    </div>
                    <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:p-5">
                      <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-emerald-50">Rincian tagihan</span><ReceiptText size={19} className="text-emerald-100" /></div>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between gap-3 text-sm"><span className="text-emerald-100">Tunggakan sebelumnya</span><span className="font-bold">{money(220000)}</span></div>
                        <div className="flex justify-between gap-3 text-sm"><span className="text-emerald-100">IPL Oktober</span><span className="font-bold">{money(110000)}</span></div>
                        <div className="border-t border-white/20 pt-3"><div className="flex justify-between gap-3 text-sm"><span className="font-semibold">Total belum lunas</span><span className="text-lg font-extrabold">{money(330000)}</span></div></div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={ReceiptText} label="Tagihan belum lunas" value="3 periode" detail="Agustus – Oktober 2026" iconClass="bg-amber-50 text-amber-700" />
                  <StatCard icon={Wallet} label="Tarif IPL / bulan" value={money(110000)} detail="Data simulasi unit AR-16/09" iconClass="bg-emerald-50 text-emerald-700" />
                  <StatCard icon={CheckCircle2} label="Pembayaran tercatat" value={money(paidThisYear)} detail="3 pembayaran dummy" iconClass="bg-sky-50 text-sky-700" />
                  <StatCard icon={MessageSquareWarning} label="Komplain aktif" value={`${complaints.filter((item) => item.status !== "Selesai").length} laporan`} detail="Termasuk contoh data" iconClass="bg-violet-50 text-violet-700" />
                </section>

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <Card>
                    <SectionHeading title="Ringkasan IPL" description="Tagihan terbaru pada unit Anda" action={<button onClick={() => goTo("ipl")} className="text-xs font-bold text-emerald-700 hover:text-emerald-900">Lihat semua</button>} />
                    <div className="space-y-3">
                      {payments.slice(0, 3).map((item) => <PaymentRow key={item.invoice} item={item} />)}
                    </div>
                  </Card>
                  <Card>
                    <SectionHeading title="Unit saya" description="Informasi singkat unit" action={<button onClick={() => goTo("unit")} className="text-xs font-bold text-emerald-700 hover:text-emerald-900">Lihat profil</button>} />
                    <div className="flex gap-4">
                      <div className="flex h-[76px] w-[88px] shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"><Home size={29} strokeWidth={1.4} /></div>
                      <div className="min-w-0"><p className="font-bold text-slate-900">Blok AR.16/09</p><p className="mt-1 text-sm text-slate-500">Irvan Verdiansyah</p><p className="mt-2 text-xs text-slate-500">Luas rumah <strong className="text-slate-700">120 m²</strong></p><p className="mt-1 text-xs text-slate-500">Foto rumah belum diunggah</p></div>
                    </div>
                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3"><div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-500">Tarif IPL bulanan</span><span className="font-extrabold text-slate-900">{money(110000)}</span></div></div>
                  </Card>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <ServiceCard icon={MessageSquareWarning} title="Punya kendala di lingkungan?" description="Sampaikan komplain fasilitas, kebersihan, atau layanan warga." buttonText="Buat komplain" onClick={() => goTo("komplain")} tone="violet" />
                  <ServiceCard icon={FileText} title="Butuh surat pengantar?" description="Lihat dan ajukan kebutuhan surat melalui menu layanan." buttonText="Ajukan surat" onClick={() => goTo("surat")} tone="blue" />
                </div>
              </>
            ) : null}

            {activeTab === "unit" ? (
              <>
                <SectionHeading title="Unit saya" description="Profil penghuni dan data unit rumah yang terdaftar." />
                <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                  <Card>
                    <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-900">Foto rumah</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">Preview lokal</span></div>
                    <div className="relative flex min-h-[230px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                      {housePhoto ? <Image src={housePhoto} alt="Pratinjau foto rumah" fill unoptimized sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /> : <div className="px-6 py-10 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><ImagePlus size={29} /></span><p className="mt-4 text-sm font-bold text-slate-800">Foto rumah belum diunggah</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Pilih foto untuk melihat pratinjau. Pada tahap ini file tidak disimpan ke server.</p></div>}
                    </div>
                    <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><ImagePlus size={17} />{housePhoto ? "Ganti foto rumah" : "Pilih foto rumah"}<input type="file" accept="image/*" className="hidden" onChange={handlePhoto} /></label>
                    <p className="mt-2 text-center text-[11px] text-slate-400">Format gambar · Maksimal 5 MB</p>
                  </Card>
                  <Card>
                    <div className="mb-5 flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-900">Profil penghuni</h3><p className="mt-1 text-sm text-slate-500">Data contoh untuk rancangan tampilan.</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><ShieldCheck size={13} className="mr-1 inline" />Terdaftar (demo)</span></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ProfileField label="Nama penghuni" value="Irvan Verdiansyah" />
                      <ProfileField label="Nomor HP" value="08•• •••• 1234" />
                      <ProfileField label="Nomor blok / unit" value="Blok AR.16/09" icon={<MapPin size={15} />} />
                      <ProfileField label="Luas rumah" value="120 m²" icon={<Ruler size={15} />} />
                      <ProfileField label="Tarif IPL bulanan" value={money(110000)} icon={<Wallet size={15} />} />
                      <ProfileField label="Status keanggotaan" value="Aktif" icon={<CheckCircle2 size={15} />} />
                    </div>
                    <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-3.5 text-xs leading-5 text-amber-900">Perubahan profil belum dapat dilakukan di halaman ini. Data profil nanti diambil dari data penghuni yang sudah disetujui pengurus.</div>
                  </Card>
                </div>
              </>
            ) : null}

            {activeTab === "ipl" ? (
              <>
                <SectionHeading title="Riwayat pembayaran IPL" description="Daftar tagihan dan status pembayaran unit AR.16/09." />
                <div className="mb-5 grid gap-4 md:grid-cols-3">
                  <StatCard icon={Wallet} label="Total belum lunas" value={money(110000)} detail="3 periode" iconClass="bg-rose-50 text-rose-700" />
                  <StatCard icon={CheckCircle2} label="Sudah dibayar" value={money(paidThisYear)} detail="3 periode contoh" iconClass="bg-emerald-50 text-emerald-700" />
                  <StatCard icon={CalendarDays} label="Jatuh tempo berikutnya" value="31 Okt 2026" detail="IPL bulan Oktober" iconClass="bg-amber-50 text-amber-700" />
                </div>
                <Card className="p-0 md:p-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6"><div><h3 className="font-bold text-slate-900">Semua tagihan</h3><p className="mt-1 text-xs text-slate-500">Periode Mei–Oktober 2026</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"><ReceiptText size={14} />{payments.length} transaksi</span></div>
                  <div className="overflow-x-auto"><table className="w-full min-w-[730px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3 font-semibold">Periode</th><th className="px-4 py-3 font-semibold">Nomor tagihan</th><th className="px-4 py-3 font-semibold">Jumlah</th><th className="px-4 py-3 font-semibold">Jatuh tempo</th><th className="px-6 py-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map((item) => <tr key={item.invoice} className="hover:bg-slate-50/70"><td className="px-6 py-4 font-semibold text-slate-800">{item.period}</td><td className="px-4 py-4 text-xs text-slate-500">{item.invoice}</td><td className="px-4 py-4 font-bold text-slate-800">{money(item.amount)}</td><td className="px-4 py-4 text-slate-500">{item.due}</td><td className="px-6 py-4"><StatusPill status={item.status} /></td></tr>)}</tbody></table></div>
                  <div className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500 md:px-6">Tombol pembayaran online belum diaktifkan. Setelah format data sheet IPL disiapkan, daftar ini dapat dipetakan ke kolom tagihan, tanggal pembayaran, dan status.</div>
                </Card>
              </>
            ) : null}

            {activeTab === "komplain" ? (
              <>
                <SectionHeading title="Komplain warga" description="Sampaikan kendala atau masukan terkait lingkungan dan layanan RT." />
                <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                  <Card>
                    <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><MessageSquareWarning size={21} /></span><div><h3 className="font-bold text-slate-900">Buat komplain</h3><p className="mt-1 text-xs text-slate-500">Form simulasi — tidak mengirim data</p></div></div>
                    <form onSubmit={submitComplaint} className="space-y-4">
                      <FieldLabel label="Kategori"><select value={complaintCategory} onChange={(event) => setComplaintCategory(event.target.value)} className={fieldClass}><option>Fasilitas umum</option><option>Kebersihan</option><option>Keamanan</option><option>IPL dan administrasi</option><option>Lainnya</option></select></FieldLabel>
                      <FieldLabel label="Judul komplain"><input value={complaintTitle} onChange={(event) => setComplaintTitle(event.target.value)} className={fieldClass} placeholder="Contoh: Lampu jalan tidak menyala" maxLength={100} /></FieldLabel>
                      <FieldLabel label="Detail komplain"><textarea value={complaintDetail} onChange={(event) => setComplaintDetail(event.target.value)} className={`${fieldClass} min-h-[120px] resize-y`} placeholder="Jelaskan lokasi dan kendala yang dialami..." maxLength={1200} /></FieldLabel>
                      <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"><Plus size={17} />Tambahkan ke daftar demo</button>
                      <p className="text-[11px] leading-5 text-slate-400">Pada versi aktif, pengiriman akan disambungkan ke Apps Script dan petugas dapat memperbarui statusnya.</p>
                    </form>
                  </Card>
                  <div><div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">Laporan komplain</h3><span className="text-xs text-slate-500">{complaints.length} laporan contoh</span></div><div className="space-y-3">{complaints.map((item) => <Card key={item.id} className="p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.id} · {item.category}</p><h4 className="mt-2 font-bold text-slate-900">{item.title}</h4><p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p></div><StatusPill status={item.status} /></div><div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400"><CalendarDays size={13} />{item.date}</div></Card>)}</div></div>
                </div>
              </>
            ) : null}

            {activeTab === "surat" ? (
              <>
                <SectionHeading title="Surat Pengantar" description="Ajukan kebutuhan surat dan pantau status pemrosesannya." />
                <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                  <Card>
                    <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><FileText size={21} /></span><div><h3 className="font-bold text-slate-900">Ajukan surat</h3><p className="mt-1 text-xs text-slate-500">Form simulasi layanan administrasi</p></div></div>
                    <form onSubmit={submitLetter} className="space-y-4">
                      <FieldLabel label="Jenis surat"><select value={letterType} onChange={(event) => setLetterType(event.target.value)} className={fieldClass}><option>Surat Keterangan Domisili</option><option>Surat Pengantar KTP / KK</option><option>Surat Keterangan Usaha</option><option>Surat Pengantar Nikah</option><option>Surat Keterangan Lainnya</option></select></FieldLabel>
                      <FieldLabel label="Tujuan penggunaan"><textarea value={letterPurpose} onChange={(event) => setLetterPurpose(event.target.value)} className={`${fieldClass} min-h-[115px] resize-y`} placeholder="Jelaskan keperluan surat dan instansi tujuan..." maxLength={800} /></FieldLabel>
                      <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"><Plus size={17} />Tambahkan pengajuan demo</button>
                      <p className="text-[11px] leading-5 text-slate-400">Belum ada proses verifikasi, tanda tangan, atau unduh surat pada mode demo.</p>
                    </form>
                  </Card>
                  <div><div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">Status pengajuan</h3><span className="text-xs text-slate-500">{letters.length} permohonan contoh</span></div>{letters.length === 0 ? <Card className="py-12 text-center"><FileText size={34} className="mx-auto text-slate-300" /><p className="mt-3 font-bold text-slate-800">Belum ada pengajuan surat</p><p className="mt-1 text-sm text-slate-500">Form di sebelah kiri dapat digunakan untuk mencoba tampilan.</p></Card> : <div className="space-y-3">{letters.map((item) => <Card key={item.id} className="p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.id}</p><h4 className="mt-2 font-bold text-slate-900">{item.type}</h4><p className="mt-1 text-sm text-slate-500">Tujuan: {item.purpose}</p></div><StatusPill status={item.status} /></div><div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400"><CalendarDays size={13} />Diajukan {item.date}</div></Card>)}</div>}</div>
                </div>
              </>
            ) : null}

            <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-[11px] text-slate-400">© 2026 Portal Warga RT 07 / RW 14 Bukit Amarilis · Tampilan demonstrasi</footer>
          </main>
        </div>
      </div>

      <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),4px)] pt-2 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return <button key={item.id} onClick={() => goTo(item.id)} className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 ${active ? "text-emerald-700" : "text-slate-400"}`}><Icon size={18} strokeWidth={active ? 2.5 : 1.8} /><span className={`max-w-full truncate text-[9px] ${active ? "font-bold" : "font-medium"}`}>{item.shortLabel}</span></button>;
        })}
      </nav>
    </div>
  );
}

const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50";

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-slate-700">{label}{children}</label>;
}

function ProfileField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"><p className="text-[11px] font-medium text-slate-500">{label}</p><p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">{icon ? <span className="text-emerald-700">{icon}</span> : null}{value}</p></div>;
}

function StatCard({ icon: Icon, label, value, detail, iconClass }: { icon: typeof Wallet; label: string; value: string; detail: string; iconClass: string }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5"><div className="flex items-start justify-between gap-3"><span className="text-xs font-medium text-slate-500">{label}</span><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}><Icon size={18} /></span></div><p className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">{value}</p><p className="mt-1 text-[11px] text-slate-400">{detail}</p></div>;
}

function PaymentRow({ item }: { item: (typeof payments)[number] }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5 transition hover:bg-slate-50/70"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.status === "Lunas" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status === "Lunas" ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{item.period}</p><p className="mt-1 text-[11px] text-slate-400">Jatuh tempo {item.due}</p></div></div><div className="flex shrink-0 flex-col items-end gap-2"><span className="text-sm font-extrabold text-slate-900">{money(item.amount)}</span><StatusPill status={item.status} /></div></div>;
}

function ServiceCard({ icon: Icon, title, description, buttonText, onClick, tone }: { icon: typeof FileText; title: string; description: string; buttonText: string; onClick: () => void; tone: "violet" | "blue" }) {
  const iconClass = tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700";
  return <Card className="flex items-start gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}><Icon size={20} /></span><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p><button onClick={onClick} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">{buttonText}<ArrowRight size={14} /></button></div></Card>;
}
