"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Menu, X } from "lucide-react";

import ThemeSwitcher from "./ThemeSwitcher";

const UNDER_CONSTRUCTION = true;

const menus = [
  {
    name: "Dashboard",
    href: "/",
  },
  {
    name: "Transparansi",
    href: "/transparansi",
  },
  {
    name: "Kegiatan",
    href: "/kegiatan",
  },
  {
    name: "Pengurus",
    href: "/pengurus",
  },
  {
    name: "Tentang",
    href: "/tentang",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="
      sticky
      top-0
      z-50
      border-b
      bg-background/90
      backdrop-blur
      border-border
      "
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Link
            href={UNDER_CONSTRUCTION ? "/daftar-lomba" : "/"}
            className="
            text-base
            md:text-lg
            font-semibold
            text-[var(--primary)]
            "
          >
            MyAmarilis
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-5 text-sm">
            {menus.map((menu) => {
              const active =
                !UNDER_CONSTRUCTION && pathname === menu.href;

              return (
                <Link
                  key={menu.href}
                  href={UNDER_CONSTRUCTION ? "/daftar-lomba" : menu.href}
                  className={`
                    transition
                    hover:text-[var(--primary)]
                    ${
                      active
                        ? "font-semibold text-[var(--primary)]"
                        : "text-foreground"
                    }
                  `}
                >
                  {menu.name}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeSwitcher />
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="
          lg:hidden
          border-t
          bg-background
          border-border
          "
        >
          <div className="flex flex-col">

            {menus.map((menu) => {
              const active =
                !UNDER_CONSTRUCTION && pathname === menu.href;

              return (
                <Link
                  key={menu.href}
                  href={UNDER_CONSTRUCTION ? "/daftar-lomba" : menu.href}
                  onClick={() => setOpen(false)}
                  className={`
                    px-5
                    py-3
                    text-sm
                    transition
                    ${
                      active
                        ? "bg-[var(--primary)] text-white"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  {menu.name}
                </Link>
              );
            })}

            <div className="border-t p-4 space-y-3">
              <ThemeSwitcher />
            </div>

          </div>
        </div>
      )}
    </header>
  );
}