
import fs from "node:fs";
import path from "node:path";

const file = path.resolve("app/portal-warga/page.tsx");

if (!fs.existsSync(file)) {
  console.error(`File tidak ditemukan: ${file}`);
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");

// Jangan mengubah warna status Lunas, Terlambat, Diproses, dan Menunggu.
const start = source.indexOf("function StatusPill(");
const end = source.indexOf("function SectionHeading(");

if (start < 0 || end < 0 || end <= start) {
  console.error("Komponen StatusPill atau SectionHeading tidak ditemukan.");
  process.exit(1);
}

const statusComponent = source.slice(start, end);
let page = source.slice(0, start) + source.slice(end);

const replacements = [
  ["min-h-screen bg-[#f5f7f5] text-slate-800",
   "min-h-screen bg-background text-foreground"],

  ["bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700",
   "bg-primary text-primary-foreground"],

  ["bg-white/95", "bg-card/95"],
  ["bg-white/90", "bg-card/90"],
  ["bg-white", "bg-card"],

  ["bg-slate-50/70", "bg-muted/70"],
  ["bg-slate-50", "bg-muted"],
  ["bg-slate-100", "bg-muted"],

  ["border-slate-200/80", "border-border/80"],
  ["border-slate-100", "border-border/60"],
  ["border-slate-200", "border-border"],
  ["border-slate-300", "border-border"],

  ["ring-slate-100", "ring-border/50"],

  ["text-slate-900", "text-foreground"],
  ["text-slate-800", "text-foreground"],
  ["text-slate-700", "text-foreground"],
  ["text-slate-600", "text-muted-foreground"],
  ["text-slate-500", "text-muted-foreground"],
  ["text-slate-400", "text-muted-foreground/70"],

  ["hover:bg-slate-50/70", "hover:bg-muted/70"],
  ["hover:bg-slate-50", "hover:bg-muted"],

  ["bg-emerald-50", "bg-primary/10"],
  ["bg-emerald-100", "bg-primary/15"],
  ["text-emerald-700", "text-primary"],
  ["text-emerald-800", "text-primary"],
  ["bg-emerald-700", "bg-primary"],
  ["hover:bg-emerald-800", "hover:opacity-90"],
  ["hover:text-emerald-900", "hover:opacity-80"],

  ["focus:border-emerald-600", "focus:border-primary"],
  ["focus:ring-emerald-50", "focus:ring-primary/10"],
  ["text-white", "text-primary-foreground"],
];

// Terapkan perubahan pada kelas tema halaman.
for (const [before, after] of replacements) {
  page = page.split(before).join(after);
}

// Perbaiki komponen kartu bersama agar semua kartu memakai warna tema.
page = page.replace(
  /function Card\(\{ children, className = "" \}: \{ children: React\.ReactNode; className\?: string \}\) \{\s*return <section className=\{`[^`]*`\}>\{children\}<\/section>;\s*\}/,
  `function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={\`rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm transition-colors duration-300 md:p-6 \${className}\`}>
      {children}
    </section>
  );
}`
);

// Kembalikan StatusPill seperti semula agar warna status tetap semantik.
const headingPos = page.indexOf("function SectionHeading(");
page = page.slice(0, headingPos) + statusComponent + page.slice(headingPos);

fs.writeFileSync(file, page, "utf8");
console.log("Tema Portal Warga berhasil diperbarui.");
