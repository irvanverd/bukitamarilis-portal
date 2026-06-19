"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menus = [
    ["Dashboard", "/"],
    ["Transparansi", "/transparansi"],
    ["Kegiatan", "/kegiatan"],
    ["Pengurus", "/pengurus"],
    ["Tentang", "/tentang"],
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto">

        <div className="h-16 px-4 flex items-center justify-between">

          <Link
            href="/"
            className="font-bold text-green-700 text-lg"
          >
            Portal Warga RT 07 RW 14 Bukit Amarilis
          </Link>

          <nav className="hidden md:flex gap-8">
            {menus.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t bg-white">
            {menus.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block p-4 border-b"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}