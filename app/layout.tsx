import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

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

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.myamarilis.id"),

  title: {
    default: "Portal Warga RT 07 RW 14 Bukit Amarilis",
    template: "%s | Portal Bukit Amarilis",
  },

  description:
    "Portal resmi RT 07 RW 14 Bukit Amarilis. Transparansi keuangan, kegiatan warga, pengumuman, dan layanan digital.",

  keywords: [
    "RT 07",
    "RW 14",
    "Bukit Amarilis",
    "Portal Warga",
    "Citra Indah City",
    "Jonggol",
    "Bogor",
  ],

  openGraph: {
    title: "Web Portal RT 07 RW 014 Bukit Amarilis",
    description:
      "Website system informasi digital resmi RT 07 RW 14 Bukit Amarilis.",

    url: "https://www.myamarilis.id",

    siteName: "Web Portal RT 07 RW 014 Bukit Amarilis",

    locale: "id_ID",

    type: "website",

    images: [
      {
        url: "https://i.ibb.co.com/F4x5fHKJ/Logo-Banner-Amarilis.png",
        width: 1200,
        height: 630,
        alt: "Portal Warga RT 07 RW 14 Bukit Amarilis",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Portal Warga RT 07 RW 14 Bukit Amarilis",
    description: "Portal resmi RT 07 RW 14 Bukit Amarilis",
    images: ["https://i.ibb.co.com/F4x5fHKJ/Logo-Banner-Amarilis.png"],
  },
};
