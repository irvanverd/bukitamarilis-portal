import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="bg-slate-50">
        <Navbar />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  // Judul tebal yang muncul di WhatsApp
  title: "Portal Warga RT 07/XIV Bukit Amarilis",

  // Teks deskripsi di bawah judul
  description:
    "Sistem informasi, transparansi keuangan, dan agenda warga RT 007 / RW XIV Bukit Amarilis.",

  // Konfigurasi Open Graph untuk WhatsApp, Facebook, Telegram, dll
  openGraph: {
    title: "Portal Warga RT 07/XIV Bukit Amarilis",
    description:
      "Sistem informasi, transparansi keuangan, dan agenda warga RT 007 / RW XIV Bukit Amarilis.",
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