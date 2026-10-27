import Link from "next/link";
import { ArrowLeft, Camera, Clock3, MapPin, ShieldCheck, Video } from "lucide-react";

export const metadata = {
  title: "CCTV Cluster",
  description: "Pratinjau simulasi titik kamera CCTV area Bukit Amarilis.",
};

const cameras = [
  { id: "CAM-01", name: "Gerbang Utama", area: "Akses masuk cluster", zone: "Area gerbang", gradient: "from-slate-700 via-emerald-950 to-slate-950", signal: "Pratinjau demo" },
  { id: "CAM-02", name: "Pos Security", area: "Pos penjagaan", zone: "Keamanan", gradient: "from-stone-700 via-slate-900 to-zinc-950", signal: "Pratinjau demo" },
  { id: "CAM-03", name: "Jalan Utama Blok A", area: "Koridor jalan cluster", zone: "Jalan lingkungan", gradient: "from-teal-900 via-slate-800 to-slate-950", signal: "Pratinjau demo" },
  { id: "CAM-04", name: "Taman Cluster", area: "Ruang terbuka hijau", zone: "Fasilitas umum", gradient: "from-green-950 via-emerald-900 to-slate-950", signal: "Pratinjau demo" },
  { id: "CAM-05", name: "Lapangan Multifungsi", area: "Area kegiatan warga", zone: "Fasilitas umum", gradient: "from-sky-950 via-slate-800 to-slate-950", signal: "Pratinjau demo" },
  { id: "CAM-06", name: "Akses Belakang", area: "Jalur keluar alternatif", zone: "Area perimeter", gradient: "from-zinc-800 via-emerald-950 to-black", signal: "Pratinjau demo" },
];

function CameraPreview({ gradient, name, id }: { gradient: string; name: string; id: string }) {
  return (
    <div className={`relative isolate flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/40 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-white backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> SIMULASI CCTV
      </div>
      <div className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1 font-mono text-[10px] text-white/80">{id}</div>
      <div className="flex flex-col items-center text-white/70">
        <Camera size={42} strokeWidth={1.2} />
        <p className="mt-2 text-xs font-semibold tracking-wide">{name}</p>
        <p className="mt-1 font-mono text-[10px] text-white/55">FEED TIDAK TERHUBUNG</p>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between font-mono text-[9px] tracking-wide text-white/70">
        <span>MYAMARILIS · DEMO</span><span>NO SIGNAL</span>
      </div>
    </div>
  );
}

export default function CctvPage() {
  return (
    <div className="min-h-[70vh] bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary">
          <ArrowLeft size={16} /> Kembali ke halaman utama
        </Link>

        <section className="mb-7 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><Video size={25} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">Keamanan lingkungan</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">CCTV Cluster</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 opacity-85">Daftar titik kamera dan pratinjau area lingkungan Bukit Amarilis.</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold"><Camera size={15} /> {cameras.length} titik kamera demo</span>
          </div>
        </section>

        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <ShieldCheck className="mt-0.5 shrink-0" size={19} />
          <p><strong>Mode demo.</strong> Seluruh pratinjau di bawah hanyalah ilustrasi antarmuka. Halaman ini belum tersambung ke perangkat atau rekaman CCTV sungguhan, dan tidak menampilkan video real-time.</p>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cameras.map((camera) => (
            <article key={camera.id} className="rounded-2xl border border-border bg-card p-3.5 text-card-foreground shadow-sm transition-colors duration-300">
              <CameraPreview gradient={camera.gradient} name={camera.name} id={camera.id} />
              <div className="px-1 pb-1 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{camera.id}</p><h2 className="mt-1 font-bold">{camera.name}</h2></div>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> DEMO</span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin size={13} /> {camera.area}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground"><span>{camera.zone}</span><span className="inline-flex items-center gap-1"><Clock3 size={12} /> Simulasi</span></div>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-7 rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">
          <h2 className="mb-1 font-bold text-card-foreground">Rencana integrasi berikutnya</h2>
          <p>Jika perangkat CCTV sudah tersedia, halaman ini dapat dihubungkan ke sistem NVR/VMS atau streaming yang diizinkan pengelola. Akses live sebaiknya dibatasi untuk petugas yang berwenang.</p>
        </div>
      </div>
    </div>
  );
}
