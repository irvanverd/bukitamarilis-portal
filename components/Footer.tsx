"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  // Halaman portal penghuni sudah memiliki footer internal.
  if (pathname.startsWith("/portal-warga")) return null;

  return (
    <footer className="mt-10 border-t bg-gray-100">
      <div className="mx-auto max-w-7xl p-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} RT 07/XIV Bukit Amarilis
      </div>
    </footer>
  );
}
