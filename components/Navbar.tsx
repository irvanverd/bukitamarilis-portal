"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Menu, X } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

const UNDER_CONSTRUCTION = false;

const menus = [
  { name: "Dashboard", href: "/" },
  { name: "Transparansi", href: "/transparansi" },
  { name: "Kegiatan", href: "/kegiatan" },
  { name: "Pengurus", href: "/pengurus" },
  { name: "Tentang", href: "/tentang" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const isNavigating = loading || isPending;

  // Reset status loading dan tutup menu mobile setiap kali rute/halaman berubah
  useEffect(() => {
    setLoading(false);
    setOpen(false);
  }, [pathname]);

  // Efek CSS untuk mengubah kursor menjadi spinner/wait di seluruh halaman
  useEffect(() => {
    if (isNavigating) {
      document.body.classList.add("cursor-wait");
      document.body.style.pointerEvents = "none";
    } else {
      document.body.classList.remove("cursor-wait");
      document.body.style.pointerEvents = "auto";
    }

    return () => {
      document.body.classList.remove("cursor-wait");
      document.body.style.pointerEvents = "auto";
    };
  }, [isNavigating]);

  const getHref = (targetHref: string) => {
    return UNDER_CONSTRUCTION ? "/daftar-lomba" : targetHref;
  };

  const handleNavigate = (targetHref: string) => {
    const finalHref = getHref(targetHref);
    setOpen(false);

    // Abaikan transisi jika mengklik menu rute saat ini
    if (pathname === finalHref) return;

    setLoading(true);
    startTransition(() => {
      router.push(finalHref);
    });
  };

  // Sembunyikan navbar jika berada di portal warga
  if (pathname.startsWith("/portal-warga")) return null;

  return (
    <>
      {/* Indikator Loading Bar Halus di Bagian Paling Atas Layar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] overflow-hidden bg-primary/20">
          <div className="h-full bg-[var(--primary)] w-full animate-pulse" />
        </div>
      )}

      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur border-border pointer-events-auto">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link
              href={getHref("/")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/");
              }}
              className="text-base md:text-lg font-semibold text-[var(--primary)] transition-opacity hover:opacity-90"
            >
              MyAmarilis
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-5 text-sm">
              {menus.map((menu) => {
                const finalHref = getHref(menu.href);
                const active = !UNDER_CONSTRUCTION && pathname === menu.href;

                return (
                  <button
                    key={menu.href}
                    type="button"
                    onClick={() => handleNavigate(menu.href)}
                    className={`transition-colors hover:text-[var(--primary)] text-sm ${
                      active
                        ? "font-semibold text-[var(--primary)]"
                        : "text-foreground"
                    }`}
                  >
                    {menu.name}
                  </button>
                );
              })}
            </nav>

            {/* Aksi Kanan (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeSwitcher />
            </div>

            {/* Tombol Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? "Tutup Menu" : "Buka Menu"}
              aria-expanded={open}
              className="lg:hidden p-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {open && (
          <div className="lg:hidden border-t bg-background border-border shadow-lg">
            <div className="flex flex-col py-2">
              {menus.map((menu) => {
                const active = !UNDER_CONSTRUCTION && pathname === menu.href;

                return (
                  <button
                    key={menu.href}
                    type="button"
                    onClick={() => handleNavigate(menu.href)}
                    className={`px-5 py-3 text-left text-sm transition-colors ${
                      active
                        ? "bg-[var(--primary)] text-white font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {menu.name}
                  </button>
                );
              })}

              <div className="border-t border-border mt-2 p-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tema Tampilan</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}