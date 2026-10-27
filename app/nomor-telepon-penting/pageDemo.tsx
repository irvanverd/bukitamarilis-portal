import Link from "next/link";
import {
  Ambulance,
  ArrowLeft,
  Building2,
  Flame,
  Headset,
  Hospital,
  Phone,
  ShieldAlert,
  Siren,
} from "lucide-react";

export const metadata = {
  title: "Nomor Telepon Penting",
  description: "Daftar kontak darurat dan layanan penting untuk warga Bukit Amarilis.",
};

type Contact = {
  name: string;
  category: string;
  number: string;
  href?: string;
  note: string;
  icon: typeof Phone;
  priority?: boolean;
};

const contacts: Contact[] = [
  {
    name: "Pos Security Bukit Amarilis",
    category: "Keamanan lingkungan",
    number: "+6285810761663",
    note: "Nomor resmi pos security.",
    icon: Headset,
  },
  {
    name: "Bogor Siaga — Panggilan Darurat",
    category: "Darurat terpadu Kabupaten Bogor",
    number: "112",
    href: "tel:112",
    note: "Layanan darurat terpadu Kabupaten Bogor.",
    icon: Siren,
    priority: true,
  },
  {
    name: "Polisi / Polsek Jonggol",
    category: "Kepolisian",
    number: "110",
    href: "tel:110",
    note: "Call Center Polri untuk laporan dan bantuan kepolisian.",
    icon: ShieldAlert,
  },
  {
    name: "Pemadam Kebakaran Kabupaten Bogor",
    category: "Mako Pusat Cibinong",
    number: "(021) 8753-547",
    href: "tel:+62218753547",
    note: "Kontak Mako Pusat Damkar Kabupaten Bogor; untuk keadaan darurat juga dapat mencoba 112 atau 113.",
    icon: Flame,
  },
  {
    name: "RSUD Cileungsi — Informasi",
    category: "Rumah sakit",
    number: "(021) 8993-4667",
    href: "tel:+622189934667",
    note: "Nomor kontak yang tercantum pada halaman kontak RSUD Cileungsi.",
    icon: Hospital,
  },
  {
    name: "RSUD Cileungsi — IGD",
    category: "Instalasi Gawat Darurat",
    number: "(021) 8993-4668",
    href: "tel:+622189934668",
    note: "Telepon IGD. Jika membutuhkan bantuan medis darurat, 119 juga dapat dicoba.",
    icon: Ambulance,
    priority: true,
  },
  {
    name: "RS Permata Jonggol",
    category: "Rumah sakit",
    number: "(021) 89931222",
    href: "tel:+6289931222",
    note: "Kontak rumah sakit Swasta di daerah Kecamatan Jonggol.",
    icon: Building2,
  },
  {
    name: "Ambulans / Darurat Medis",
    category: "Layanan kesehatan nasional",
    number: "119",
    href: "tel:119",
    note: "Nomor layanan kegawatdaruratan kesehatan.",
    icon: Ambulance,
    priority: true,
  },
  {
    name: "Ambulans Masjid Nuroh AlDuwaihi",
    category: "Layanan Ambulan Gratis untuk seluruh warga Bukit Amarilis",
    number: "+6285716889514",
    href: "tel:+6285716889514",
    note: "Nomor layanan kegawatdaruratan kesehatan.",
    icon: Ambulance,
    priority: true,
  },
];

function ContactCard({ contact }: { contact: Contact }) {
  const Icon = contact.icon;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors duration-300">
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${contact.priority ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{contact.category}</p>
          <h2 className="mt-1 font-bold leading-snug">{contact.name}</h2>
        </div>
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight">{contact.number}</p>
      <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">{contact.note}</p>
      {contact.href ? (
        <a href={contact.href} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90">
          <Phone size={16} /> Hubungi nomor
        </a>
      ) : (
        <div className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          Perlu nomor resmi
        </div>
      )}
    </article>
  );
}

export default function NomorTeleponPentingPage() {
  return (
    <div className="min-h-[70vh] bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary">
          <ArrowLeft size={16} /> Kembali ke halaman utama
        </Link>

        <section className="mb-7 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Phone size={25} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">Layanan warga</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Nomor Telepon Penting</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 opacity-85">Kontak darurat dan fasilitas layanan yang dapat dihubungi warga Bukit Amarilis.</p>
            </div>
          </div>
        </section>

        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <ShieldAlert className="mt-0.5 shrink-0" size={19} />
          <p><strong>Catatan:</strong> Nomor layanan luar cluster diisi secara tetap berdasarkan publikasi yang tersedia. Gunakan nomor darurat hanya untuk keadaan yang sesuai.</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contacts.map((contact) => <ContactCard key={contact.name} contact={contact} />)}
        </section>

        <section className="mt-7 rounded-2xl border border-border bg-card p-5 text-xs leading-5 text-muted-foreground">
          <h2 className="mb-2 font-bold text-card-foreground">Sumber referensi nomor</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <a className="underline decoration-current/30 underline-offset-4 hover:text-primary" href="https://siaga112.bogorkab.go.id/first-responder" target="_blank" rel="noreferrer">Bogor Siaga 112</a>
            <a className="underline decoration-current/30 underline-offset-4 hover:text-primary" href="https://polri.go.id/kontak/call-center-110" target="_blank" rel="noreferrer">Call Center Polri 110</a>
            <a className="underline decoration-current/30 underline-offset-4 hover:text-primary" href="https://damkar.bogorkab.go.id/" target="_blank" rel="noreferrer">Damkar Kabupaten Bogor</a>
            <a className="underline decoration-current/30 underline-offset-4 hover:text-primary" href="https://rsudrhsatibi.bogorkab.go.id/kontak-kami/" target="_blank" rel="noreferrer">Kontak RSUD Cileungsi</a>
            <a className="underline decoration-current/30 underline-offset-4 hover:text-primary" href="https://sirs.kemkes.go.id/fo/home/profile_rs/3201207" target="_blank" rel="noreferrer">Data RS Kemenkes</a>
          </div>
        </section>
      </div>
    </div>
  );
}
