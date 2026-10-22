import fs from "node:fs";
import path from "node:path";

const target = path.resolve(process.argv[2] || "app/page.tsx");
if (!fs.existsSync(target)) {
  console.error(`File homepage tidak ditemukan: ${target}`);
  console.error("Jalankan dari root project Next.js (folder web/). ");
  process.exit(1);
}

let source = fs.readFileSync(target, "utf8");
const start = source.search(/\{\s*\/\*\s*MENU\s*(?:CEPAT|UTAMA)\s*\*\/\s*\}/i);
if (start < 0) {
  console.error("Bagian MENU CEPAT / MENU UTAMA tidak ditemukan; homepage tidak diubah.");
  process.exit(1);
}
const rest = source.slice(start);
const nextSection = rest.search(/\{\s*\/\*\s*(?:BERITA\s*&\s*JADWAL|INFORMASI\s+TERBARU)\s*\*\/\s*\}/i);
const end = nextSection >= 0 ? start + nextSection : source.length;
let section = source.slice(start, end);

const additions = [
  '<MenuCard title="Nomor Telepon Penting" desc="Kontak darurat dan layanan penting" href="/nomor-telepon-penting" emoji="☎️" />',
  '<MenuCard title="CCTV Cluster" desc="Pratinjau kamera area lingkungan (demo)" href="/cctv" emoji="📹" />',
];
const missing = additions.filter((line) => !section.includes(line.match(/href="([^"]+)"/)[1]));
if (missing.length === 0) {
  console.log("Kedua shortcut sudah ada pada Menu Utama. Tidak ada perubahan.");
  process.exit(0);
}

const aboutCard = /<MenuCard\b(?=[^>]*\bhref=["']\/tentang["'])[^>]*\/>/;
const match = section.match(aboutCard);
if (!match || match.index === undefined) {
  console.error('Kartu MenuCard dengan href="/tentang" tidak ditemukan; homepage tidak diubah.');
  console.error("Tambahkan dua MenuCard berikut secara manual di grid Menu Utama:");
  for (const line of missing) console.error(line);
  process.exit(1);
}
const inserted = match[0] + "\n          " + missing.join("\n          ");
section = section.slice(0, match.index) + inserted + section.slice(match.index + match[0].length);
source = source.slice(0, start) + section + source.slice(end);
fs.writeFileSync(target, source, "utf8");
console.log("Shortcut Nomor Telepon Penting dan CCTV Cluster berhasil ditambahkan ke Menu Utama.");
