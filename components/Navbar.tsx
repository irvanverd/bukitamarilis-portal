"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Menu, X, Download, Smartphone } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

// Tipe interface untuk event PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

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

  // State untuk Install PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const isNavigating = loading || isPending;

  useEffect(() => {
    setLoading(false);
    setOpen(false);
  }, [pathname]);

  // Tangkap event sebelum instalasi dari browser
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Tampilkan banner instalasi secara otomatis
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Handler eksekusi install
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Aplikasi sudah terpasang atau gunakan opsi 'Tambahkan ke Layar Utama' pada menu browser Anda.");
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const getHref = (targetHref: string) => {
    return UNDER_CONSTRUCTION ? "/daftar-lomba" : targetHref;
  };

  const handleNavigate = (targetHref: string) => {
    const finalHref = getHref(targetHref);
    setOpen(false);

    if (pathname === finalHref) return;

    setLoading(true);
    startTransition(() => {
      router.push(finalHref);
    });
  };

  if (pathname.startsWith("/portal-warga")) return null;

  return (
    <>
      {/* 1. POP-UP / BANNER INSTALL APPS (Atas Navbar) */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 shadow-md">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Smartphone size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold">
                  Pasang Aplikasi MyAmarilis
                </p>
                <p className="text-[11px] text-blue-100 hidden sm:block">
                  Akses portal warga lebih cepat langsung dari layar utama HP Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Download size={14} />
                Install
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                aria-label="Tutup banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indikator Loading Bar */}
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
              {/* Tombol Install di Navbar Desktop */}
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition-all"
              >
                <Download size={14} className="text-[var(--primary)]" />
                Install App
              </button>

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

              {/* Opsi Install di Menu Dropdown Mobile */}
              <div className="px-5 py-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
                >
                  <Download size={15} />
                  Install Aplikasi ke HP
                </button>
              </div>

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