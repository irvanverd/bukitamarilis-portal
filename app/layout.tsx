import type { Metadata } from "next";

export const metadata: Metadata = {
  // Judul tebal yang muncul di WhatsApp
  title: "Portal Warga RT 07/XIV Bukit Amarilis",

  // Teks deskripsi di bawah judul
  description:
    "Sistem informasi, transparansi keuangan, dan agenda warga RT 007 / RW XIV Bukit Amarilis, Jonggol.",

  // Konfigurasi Open Graph untuk WhatsApp, Facebook, Telegram, dll
  openGraph: {
    title: "Portal Warga RT 07/XIV Bukit Amarilis",
    description:
      "Sistem informasi, transparansi keuangan, dan agenda warga RT 007 / RW XIV Bukit Amarilis, Jonggol.",
    url: "https://myamarilis.id",
    siteName: "MyAmarilis",
    images: [
      {
        // WAJIB URL absolut lengkap (bukan hanya '/og-image.jpg')
        url: "https://myamarilis.id/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Logo RT 07/XIV Bukit Amarilis",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}