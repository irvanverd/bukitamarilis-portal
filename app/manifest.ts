import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Portal Warga RT 07 RW 14 Bukit Amarilis",
    short_name: "MyAmarilis",
    description:
      "Portal resmi RT 07 RW 14 Bukit Amarilis untuk informasi warga, transparansi keuangan, dan kegiatan lingkungan.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#176b50",
    lang: "id",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // TAMBAHKAN SHORTCUT MENU INI:
    shortcuts: [
      {
        name: "Admin Portal",
        short_name: "Admin",
        description: "Akses menu manajemen dan entri transaksi kas RT",
        url: "/portal-admin",
        icons: [{ src: "/icons/icon-192admin.png", sizes: "192x192" }],
      },
      {
        name: "Portal Warga",
        short_name: "Warga",
        description: "Akses riwayat tagihan IPL dan profil unit",
        url: "/portal-warga",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
